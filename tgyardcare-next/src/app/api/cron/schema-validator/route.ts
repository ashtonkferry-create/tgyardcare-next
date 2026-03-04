import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Schema Validator — runs Monday 3pm.
// Validates JSON-LD structured data on key pages.
// Checks: @type, @context, required LocalBusiness fields, valid JSON parse.

const KEY_PAGES = [
  { path: "/", type: "LocalBusiness", required: ["@type", "@context", "name", "telephone", "address", "url"] },
  { path: "/about", type: "any", required: ["@context"] },
  { path: "/contact", type: "any", required: ["@context"] },
  { path: "/services/lawn-care", type: "Service", required: ["@type", "name"] },
  { path: "/services/snow-removal", type: "Service", required: ["@type", "name"] },
  { path: "/locations/madison", type: "LocalBusiness", required: ["@type", "name", "address"] },
  { path: "/locations/middleton", type: "LocalBusiness", required: ["@type", "name", "address"] },
];

async function sendSlack(msg: string) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: msg }),
  });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com";

  const results: { path: string; issues: string[]; schemasFound: number }[] = [];

  for (const page of KEY_PAGES) {
    try {
      const res = await fetch(`${base}${page.path}`, { next: { revalidate: 0 } });
      if (!res.ok) {
        results.push({ path: page.path, issues: [`HTTP ${res.status}`], schemasFound: 0 });
        continue;
      }
      const html = await res.text();
      const issues: string[] = [];

      // Extract all JSON-LD blocks
      const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];

      if (ldMatches.length === 0) {
        results.push({ path: page.path, issues: ["No JSON-LD schema found"], schemasFound: 0 });
        continue;
      }

      // Parse and validate each schema block
      let validSchemas = 0;
      for (const match of ldMatches) {
        try {
          const schema = JSON.parse(match[1]) as Record<string, unknown>;
          validSchemas++;

          // Check required fields
          for (const field of page.required) {
            if (!(field in schema)) {
              // Check @graph for nested schemas
              const graph = schema["@graph"] as Record<string, unknown>[] | undefined;
              const foundInGraph = graph?.some(item => field in item);
              if (!foundInGraph) {
                issues.push(`Missing field: ${field}`);
              }
            }
          }
        } catch {
          issues.push("Invalid JSON in schema block");
        }
      }

      results.push({ path: page.path, issues, schemasFound: validSchemas });
    } catch {
      results.push({ path: page.path, issues: ["Fetch error"], schemasFound: 0 });
    }
  }

  const pagesWithIssues = results.filter(r => r.issues.length > 0).length;
  const status = pagesWithIssues === 0 ? "success" : "warning";
  const summary = pagesWithIssues === 0
    ? "All schemas valid"
    : `${pagesWithIssues} page(s) have schema issues`;

  if (pagesWithIssues > 0) {
    await sendSlack([
      `*Schema Validator — ${pagesWithIssues} issue(s)*`,
      ...results.filter(r => r.issues.length > 0).slice(0, 8).map(r =>
        `• ${r.path}: ${r.issues.join(", ")}`
      ),
      `Fix at: ${base}/admin/seo`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "schema-validator",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: pagesWithIssues,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "schema-validator");

  return NextResponse.json({ status, summary, results });
}
