import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Heading Structure Auditor — runs Tuesday 9am.
// Checks H1/H2/H3 hierarchy on service and location pages.
// Flags: missing H1, multiple H1s, H1 lacking target keyword, no H2s.

const PAGE_TARGETS = [
  { path: "/", keyword: "lawn care" },
  { path: "/services/lawn-care", keyword: "lawn care" },
  { path: "/services/lawn-mowing", keyword: "lawn mowing" },
  { path: "/services/snow-removal", keyword: "snow removal" },
  { path: "/services/gutter-cleaning", keyword: "gutter cleaning" },
  { path: "/services/fertilization", keyword: "fertilization" },
  { path: "/services/aeration", keyword: "aeration" },
  { path: "/services/mulching", keyword: "mulching" },
  { path: "/services/spring-cleanup", keyword: "spring cleanup" },
  { path: "/services/fall-cleanup", keyword: "fall cleanup" },
  { path: "/locations/madison", keyword: "madison" },
  { path: "/locations/middleton", keyword: "middleton" },
  { path: "/locations/verona", keyword: "verona" },
  { path: "/locations/fitchburg", keyword: "fitchburg" },
  { path: "/locations/sun-prairie", keyword: "sun prairie" },
  { path: "/locations/waunakee", keyword: "waunakee" },
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

  const allIssues: { path: string; issues: string[] }[] = [];

  for (const target of PAGE_TARGETS) {
    try {
      const res = await fetch(`${base}${target.path}`, { next: { revalidate: 0 } });
      if (!res.ok) continue;
      const html = await res.text();

      const issues: string[] = [];

      // Count heading tags
      const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) ?? [];
      const h2s = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) ?? [];

      if (h1s.length === 0) issues.push("Missing H1 tag");
      if (h1s.length > 1) issues.push(`Multiple H1 tags (${h1s.length})`);
      if (h2s.length < 2) issues.push(`Only ${h2s.length} H2 tag(s) — need at least 2`);

      // Check H1 contains target keyword
      if (h1s.length === 1) {
        const h1Text = h1s[0].replace(/<[^>]+>/g, "").toLowerCase();
        if (!h1Text.includes(target.keyword.toLowerCase())) {
          issues.push(`H1 missing keyword "${target.keyword}"`);
        }
      }

      if (issues.length > 0) {
        allIssues.push({ path: target.path, issues });
      }
    } catch {
      // Skip failed pages
    }
  }

  const pagesWithIssues = allIssues.length;
  const status = pagesWithIssues === 0 ? "success" : pagesWithIssues > 5 ? "warning" : "success";
  const summary = pagesWithIssues === 0
    ? "All pages have correct heading structure"
    : `${pagesWithIssues} page(s) have heading structure issues`;

  if (allIssues.length > 0) {
    await sendSlack([
      `*Heading Auditor — ${pagesWithIssues} page(s) with issues*`,
      ...allIssues.slice(0, 8).map(p =>
        `• ${p.path}: ${p.issues.join(", ")}`
      ),
      `Fix at: ${base}/admin/seo`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "heading-auditor",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: pagesWithIssues,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "heading-auditor");

  return NextResponse.json({ status, summary, issues: allIssues });
}
