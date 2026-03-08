import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No session" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleData } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
  if (!roleData) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const checks: Array<{ name: string; status: "pass" | "fail" | "skip"; detail: string }> = [];

  // Check 1: Env vars present
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const locationName = process.env.GBP_LOCATION_NAME;

  if (!saJson) {
    checks.push({ name: "env_service_account", status: "fail", detail: "GOOGLE_SERVICE_ACCOUNT_JSON not set" });
    return NextResponse.json({ checks });
  }
  checks.push({ name: "env_service_account", status: "pass", detail: "GOOGLE_SERVICE_ACCOUNT_JSON is set" });

  if (!locationName || locationName === "pending-api-approval") {
    checks.push({ name: "env_location_name", status: "fail", detail: `GBP_LOCATION_NAME = "${locationName || "not set"}"` });
  } else {
    checks.push({ name: "env_location_name", status: "pass", detail: `GBP_LOCATION_NAME = ${locationName}` });
  }

  // Check 2: OAuth2 token exchange
  let accessToken: string | null = null;
  try {
    const sa = JSON.parse(Buffer.from(saJson, "base64").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/business.manage",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })).toString("base64url");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(sa.private_key, "base64url");
    const jwt = `${header}.${payload}.${signature}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      checks.push({ name: "oauth2_token", status: "fail", detail: `Token error: ${tokenData.error_description || tokenData.error}` });
      return NextResponse.json({ checks });
    }

    accessToken = tokenData.access_token;
    checks.push({ name: "oauth2_token", status: "pass", detail: `Token acquired (expires in ${tokenData.expires_in}s)` });
  } catch (e) {
    checks.push({ name: "oauth2_token", status: "fail", detail: `Exception: ${e instanceof Error ? e.message : String(e)}` });
    return NextResponse.json({ checks });
  }

  // Check 3: List accounts (tests API quota)
  try {
    const acctRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const acctBody = await acctRes.json();

    if (acctBody.error) {
      const quotaDetail = acctBody.error.details?.find(
        (d: Record<string, unknown>) => (d as Record<string, string>)["@type"]?.includes("ErrorInfo")
      );
      const quotaValue = quotaDetail?.metadata?.quota_limit_value;
      checks.push({
        name: "api_accounts",
        status: "fail",
        detail: `API error ${acctBody.error.code}: ${acctBody.error.message}${quotaValue !== undefined ? ` (quota_limit_value: ${quotaValue})` : ""}`,
      });
    } else {
      const accounts = acctBody.accounts || [];
      checks.push({
        name: "api_accounts",
        status: "pass",
        detail: `Found ${accounts.length} account(s): ${accounts.map((a: Record<string, string>) => a.name).join(", ")}`,
      });

      // Check 4: List locations for each account
      for (const acct of accounts) {
        try {
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${acct.name}/locations?readMask=name,title,storefrontAddress`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const locBody = await locRes.json();

          if (locBody.error) {
            checks.push({ name: `locations_${acct.name}`, status: "fail", detail: locBody.error.message });
          } else {
            const locations = locBody.locations || [];
            for (const loc of locations) {
              checks.push({
                name: "location_found",
                status: "pass",
                detail: `${loc.title} → ${loc.name} (USE THIS as GBP_LOCATION_NAME)`,
              });
            }
            if (locations.length === 0) {
              checks.push({ name: `locations_${acct.name}`, status: "fail", detail: "No locations found for this account" });
            }
          }
        } catch (e) {
          checks.push({ name: `locations_${acct.name}`, status: "fail", detail: String(e) });
        }
      }
    }
  } catch (e) {
    checks.push({ name: "api_accounts", status: "fail", detail: `Exception: ${e instanceof Error ? e.message : String(e)}` });
  }

  // Check 5: ANTHROPIC_API_KEY
  checks.push({
    name: "anthropic_key",
    status: process.env.ANTHROPIC_API_KEY ? "pass" : "fail",
    detail: process.env.ANTHROPIC_API_KEY ? "ANTHROPIC_API_KEY is set" : "ANTHROPIC_API_KEY missing — AI crons won't work",
  });

  // Check 6: CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  const hasNewline = cronSecret?.includes("\n") || cronSecret?.includes("\\n");
  checks.push({
    name: "cron_secret",
    status: cronSecret && !hasNewline ? "pass" : "fail",
    detail: !cronSecret
      ? "CRON_SECRET not set"
      : hasNewline
        ? "CRON_SECRET contains newline character — fix in Vercel env vars"
        : "CRON_SECRET is clean",
  });

  return NextResponse.json({ checks });
}
