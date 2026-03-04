import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Backlink Monitor — runs monthly on the 15th at 9am.
// Uses Open PageRank API (free, no key needed) to check domain metrics.
// Also checks known referring domains to verify our backlinks are live.

const DOMAIN = "tgyardcare.com";

// Known sites that should link to us
const EXPECTED_REFERRING_DOMAINS = [
  { name: "Yelp", url: "https://www.yelp.com/search?find_desc=TotalGuard+Yard+Care&find_loc=Madison%2C+WI" },
  { name: "BBB", url: "https://www.bbb.org/search?find_text=TotalGuard+Yard+Care&find_loc=Madison%2C+WI" },
  { name: "Angi", url: "https://www.angi.com/search?q=TotalGuard+Yard+Care&location=Madison%2C+WI" },
  { name: "HomeAdvisor", url: "https://www.homeadvisor.com/rated.LawnCare.Madison.WI.html" },
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

  const issues: string[] = [];
  const report: { source: string; found: boolean; status: string }[] = [];

  // 1. Check Open PageRank for domain authority
  let domainRank: number | null = null;
  try {
    const prRes = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${DOMAIN}`,
      { headers: { "API-OPR": process.env.OPEN_PAGERANK_KEY ?? "" } }
    );
    if (prRes.ok) {
      const prData = await prRes.json() as {
        response?: Array<{ page_rank_decimal?: number }>;
      };
      domainRank = prData.response?.[0]?.page_rank_decimal ?? null;
    }
  } catch {
    // Open PageRank unavailable — skip silently
  }

  // 2. Get previous domain rank from DB
  const { data: prevConfig } = await supabase
    .from("seo_config")
    .select("value")
    .eq("key", "domain_rank")
    .single();

  const prevRank = (prevConfig as { value: { rank: number } } | null)?.value?.rank ?? null;

  if (domainRank !== null && prevRank !== null && domainRank < prevRank - 1) {
    issues.push(`Domain rank dropped: ${prevRank} → ${domainRank}`);
  }

  if (domainRank !== null) {
    await supabase
      .from("seo_config")
      .upsert({
        key: "domain_rank",
        value: { rank: domainRank, updatedAt: new Date().toISOString() },
      }, { onConflict: "key" });
  }

  // 3. Check known referring domains
  for (const source of EXPECTED_REFERRING_DOMAINS) {
    try {
      const res = await fetch(source.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SEO-monitor/1.0)" },
        signal: AbortSignal.timeout(10000),
      });

      if (res.status === 403 || res.status === 429) {
        report.push({ source: source.name, found: false, status: "blocked" });
        continue;
      }

      const html = await res.text().catch(() => "");
      const found = html.toLowerCase().includes("totalguard") ||
        html.toLowerCase().includes("total guard");

      if (!found) {
        issues.push(`${source.name}: TotalGuard not found — may have lost listing`);
      }

      report.push({ source: source.name, found, status: found ? "ok" : "not-found" });
    } catch {
      report.push({ source: source.name, found: false, status: "error" });
    }
  }

  const status = issues.length === 0 ? "success" : "warning";
  const summary = issues.length === 0
    ? `Backlinks healthy. Domain rank: ${domainRank ?? "N/A"}`
    : `${issues.length} backlink issue(s). Rank: ${domainRank ?? "N/A"}`;

  if (issues.length > 0) {
    await sendSlack([
      `*Backlink Monitor — ${issues.length} issue(s)*`,
      domainRank ? `Domain PageRank: ${domainRank}` : "",
      ...issues.map(i => `• ${i}`),
    ].filter(Boolean).join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "backlink-monitor",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: issues.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "backlink-monitor");

  return NextResponse.json({ status, summary, domainRank, prevRank, report, issues });
}
