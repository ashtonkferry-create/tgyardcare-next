# GBP Automation Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Get the GBP automation system fully operational — fix env vars, add manual review intake bridge, add health check diagnostic.

**Architecture:** All code already exists in `src/lib/gbp/`. We're adding 2 small API routes and fixing env var configuration. No changes to existing cron logic.

**Tech Stack:** Next.js API routes, Supabase, Anthropic SDK, Vercel CLI

---

### Task 1: Fix CRON_SECRET on Vercel (remove trailing \n)

**Files:**
- No code changes — Vercel env var update only

**Step 1: Delete and re-create CRON_SECRET on Vercel**

```bash
# Get the env var ID for CRON_SECRET production
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare

# Remove existing (has \n bug) and re-add clean value
npx vercel env rm CRON_SECRET production --yes
npx vercel env add CRON_SECRET production
# When prompted, paste: 4b1f7377969b74a270dcbb23e1c8e53f444f9e30fa7a3e378097feb5c7875287
# Press Enter ONCE then Ctrl+D (not Enter twice)
```

**Step 2: Verify**

```bash
npx vercel env pull .env.prod-verify --environment production --yes
grep CRON_SECRET .env.prod-verify
# Should NOT have \n in the value
rm .env.prod-verify
```

---

### Task 2: Add GOOGLE_SERVICE_ACCOUNT_JSON to Vercel

**Files:**
- No code changes — Vercel env var only

**Step 1: Add env var**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare
npx vercel env add GOOGLE_SERVICE_ACCOUNT_JSON production
# Paste the base64 string from .env.local
```

**Step 2: Add GBP_LOCATION_NAME placeholder**

```bash
npx vercel env add GBP_LOCATION_NAME production
# Paste: pending-api-approval
# Will update to real accounts/X/locations/Y after Google grants access
```

**Step 3: Verify ANTHROPIC_API_KEY exists on Vercel**

```bash
npx vercel env pull .env.prod-verify --environment production --yes
grep ANTHROPIC_API_KEY .env.prod-verify
# If missing, add it
rm .env.prod-verify
```

**Step 4: Uncomment ANTHROPIC_API_KEY in .env.local**

In `tgyardcare/.env.local`, change:
```
# ANTHROPIC_API_KEY=<your Anthropic API key>
```
to the actual key value.

**Step 5: Commit**

No code changes to commit for this task — env vars only.

---

### Task 3: Create manual review intake route

**Files:**
- Create: `tgyardcare/src/app/api/admin/add-review/route.ts`
- Modify: `tgyardcare/src/app/api/admin/run-cron/route.ts` (add new path to whitelist)

**Step 1: Create the route**

Create `tgyardcare/src/app/api/admin/add-review/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  // Verify admin session
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

  // Parse review input
  const { reviewer_name, rating, review_text, source } = await req.json() as {
    reviewer_name: string;
    rating: number;
    review_text: string;
    source?: string;
  };

  if (!reviewer_name || !rating || !review_text) {
    return NextResponse.json({ error: "Missing required fields: reviewer_name, rating, review_text" }, { status: 400 });
  }

  // Insert review
  const { data: review, error: insertErr } = await supabase
    .from("reviews")
    .insert({
      reviewer_name,
      rating,
      review_text,
      source: source || "manual",
      response_status: "pending",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Generate AI draft reply
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      review_id: review.id,
      draft: null,
      message: "Review saved but ANTHROPIC_API_KEY not set — no draft generated",
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are responding to a Google review for TotalGuard Yard Care, a lawn care and yard services company in Madison, WI. Write a professional, warm, and personal response. Keep it under 100 words. Don't be overly formal.\n\nReview by ${reviewer_name} (${rating}/5 stars):\n"${review_text}"\n\nWrite just the response text, no quotes or labels.`,
        }],
      }),
    });

    const data = await res.json();
    const draft = data.content?.[0]?.type === "text" ? data.content[0].text : null;

    if (draft) {
      await supabase
        .from("reviews")
        .update({ response_draft: draft, response_status: "needs_review" })
        .eq("id", review.id);
    }

    return NextResponse.json({
      success: true,
      review_id: review.id,
      draft,
      message: draft ? "Review saved and draft generated" : "Review saved but draft generation failed",
    });
  } catch {
    return NextResponse.json({
      success: true,
      review_id: review.id,
      draft: null,
      message: "Review saved but draft generation errored",
    });
  }
}
```

**Step 2: Verify it builds**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare
npx next build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/api/admin/add-review/route.ts
git commit -m "feat: add manual review intake route with AI draft generation"
```

---

### Task 4: Create GBP health check diagnostic route

**Files:**
- Create: `tgyardcare/src/app/api/admin/gbp-health/route.ts`

**Step 1: Create the route**

Create `tgyardcare/src/app/api/admin/gbp-health/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  // Verify admin session
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
```

**Step 2: Verify it builds**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare
npx next build 2>&1 | tail -20
```

**Step 3: Commit**

```bash
git add src/app/api/admin/gbp-health/route.ts
git commit -m "feat: add GBP health check diagnostic route"
```

---

### Task 5: Add new routes to admin run-cron whitelist

**Files:**
- Modify: `tgyardcare/src/app/api/admin/run-cron/route.ts`

**Step 1: Add `/api/admin/gbp-health` handling**

The run-cron proxy calls cron routes via HTTP. The gbp-health route is a GET on `/api/admin/gbp-health` — it doesn't use CRON_SECRET auth (it uses admin JWT). So no whitelist change needed for gbp-health.

For add-review, it's called directly by the admin dashboard (POST with JWT), not via run-cron. No whitelist change needed.

**This task is a no-op.** Both new routes use their own admin JWT auth.

---

### Task 6: Test locally

**Step 1: Start dev server**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare
rm -f .next/dev/lock
npx next dev --port 3099
```

**Step 2: Test gbp-health (will show expected failures for API quota)**

```bash
# This needs an admin JWT — test via curl with a Supabase token
# Or just verify the route compiles and returns JSON
curl -s http://localhost:3099/api/admin/gbp-health | head -5
# Expected: { "error": "No session" } (401 — correct, needs auth)
```

**Step 3: Test add-review (same — needs auth)**

```bash
curl -s -X POST http://localhost:3099/api/admin/add-review \
  -H "Content-Type: application/json" \
  -d '{"reviewer_name":"Test","rating":5,"review_text":"Great service"}' | head -5
# Expected: { "error": "No session" } (401 — correct, needs auth)
```

---

### Task 7: Push and deploy

**Step 1: Push to trigger Vercel deploy**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare
git push origin main
```

**Step 2: Verify deployment succeeds on Vercel**

---

### Task 8: Handle the current new review (immediate)

**Step 1: Insert the review manually via Supabase**

Use Supabase MCP to insert the review directly (since we can't call the admin route without a browser JWT).

```sql
INSERT INTO reviews (reviewer_name, rating, review_text, source, response_status, created_at)
VALUES ('<name>', <rating>, '<text>', 'google', 'pending', now());
```

**Step 2: Generate a draft reply via Claude**

Use the Anthropic API directly to generate a reply, then update the review row.

**Step 3: Present the draft to Vance for approval**

---

### Post-Approval Tasks (after Google grants GBP API access)

These happen once the email arrives:

1. Run `/api/admin/gbp-health` to discover the correct `accounts/X/locations/Y`
2. Update `GBP_LOCATION_NAME` on Vercel + `.env.local`
3. Invite service account email as Manager on GBP listing (if not done)
4. Run review-responder manually via admin dashboard to sync all existing reviews
5. Verify all crons work by checking `automation_runs` table
