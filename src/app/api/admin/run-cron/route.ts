import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side proxy: verifies admin session, then triggers cron route with real CRON_SECRET.
// This keeps CRON_SECRET off the client.

const ALLOWED_PATHS = new Set([
  "/api/cron/season-switcher",
  "/api/admin/seo-audit",
  "/api/cron/sitemap-check",
  "/api/cron/robots-guard",
  "/api/cron/meta-gen",
  "/api/cron/faq-builder",
  "/api/cron/content-freshness",
  "/api/cron/gbp-post",
  "/api/cron/lead-response-timer",
  "/api/cron/weekly-digest",
  "/api/cron/review-responder",
  "/api/cron/gbp-post-publisher",
  "/api/cron/review-faq-miner",
  "/api/cron/gbp-audit",
]);

export async function POST(req: NextRequest) {
  // Verify admin session via Supabase JWT
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No session" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify admin role
  const { data: roleData } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
  if (!roleData) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { path } = await req.json() as { path: string };
  if (!ALLOWED_PATHS.has(path)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com";
  const cronRes = await fetch(`${base}${path}`, {
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET ?? "dev"}`,
      "x-admin-token": process.env.CRON_SECRET ?? "dev",
    },
  });

  const body = await cronRes.json();
  return NextResponse.json(body, { status: cronRes.ok ? 200 : cronRes.status });
}
