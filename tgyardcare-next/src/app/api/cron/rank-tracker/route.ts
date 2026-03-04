import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Keyword Rank Tracker — runs Wednesday 10am.
// Checks on-page SEO signals for target keyword+page combinations.
// Generates a "rankability score" based on content quality signals.
// Tracks trends over time to detect content decay.

const KEYWORD_TARGETS = [
  { keyword: "lawn care madison wi", path: "/locations/madison", minMentions: 3 },
  { keyword: "lawn mowing madison wi", path: "/services/lawn-mowing", minMentions: 3 },
  { keyword: "snow removal madison wi", path: "/services/snow-removal", minMentions: 3 },
  { keyword: "gutter cleaning madison wi", path: "/services/gutter-cleaning", minMentions: 2 },
  { keyword: "lawn fertilization madison wi", path: "/services/fertilization", minMentions: 2 },
  { keyword: "spring cleanup madison wi", path: "/services/spring-cleanup", minMentions: 2 },
  { keyword: "fall cleanup madison wi", path: "/services/fall-cleanup", minMentions: 2 },
  { keyword: "lawn care middleton wi", path: "/locations/middleton", minMentions: 2 },
  { keyword: "lawn care verona wi", path: "/locations/verona", minMentions: 2 },
  { keyword: "lawn aeration madison wi", path: "/services/aeration", minMentions: 2 },
];

async function sendSlack(msg: string) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: msg }),
  });
}

function scoreKeywordSignals(html: string, keyword: string, minMentions: number): number {
  const lower = html.toLowerCase();
  const kw = keyword.toLowerCase();
  let score = 0;

  // Title tag contains keyword (20 pts)
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].toLowerCase().includes(kw)) score += 20;

  // H1 contains keyword (20 pts)
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match && h1Match[1].toLowerCase().includes(kw)) score += 20;

  // Meta description contains keyword (10 pts)
  const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (metaMatch && metaMatch[1].toLowerCase().includes(kw)) score += 10;

  // Keyword mentions in body (up to 30 pts)
  const mentions = (lower.match(new RegExp(kw.replace(/\s+/g, "\\s+"), "g")) ?? []).length;
  if (mentions >= minMentions) score += 30;
  else if (mentions > 0) score += Math.round((mentions / minMentions) * 30);

  // Has canonical URL (5 pts)
  if (html.includes('rel="canonical"')) score += 5;

  // Has schema markup (5 pts)
  if (html.includes("application/ld+json")) score += 5;

  // H2s mention keyword (10 pts)
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  if (h2Matches.some(m => m[1].toLowerCase().includes(kw.split(" ")[0]))) score += 10;

  return Math.min(score, 100);
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

  interface RankResult {
    keyword: string;
    path: string;
    score: number;
    trend: "up" | "down" | "stable" | "new";
    issues: string[];
  }

  const results: RankResult[] = [];
  const declining: string[] = [];

  for (const target of KEYWORD_TARGETS) {
    try {
      const res = await fetch(`${base}${target.path}`, { next: { revalidate: 0 } });
      if (!res.ok) {
        results.push({ keyword: target.keyword, path: target.path, score: 0, trend: "stable", issues: [`HTTP ${res.status}`] });
        continue;
      }
      const html = await res.text();
      const score = scoreKeywordSignals(html, target.keyword, target.minMentions);

      // Get previous score from DB
      const { data: prev } = await supabase
        .from("page_seo")
        .select("rankability_score")
        .eq("path", target.path)
        .single();

      const prevScore = (prev as { rankability_score: number | null } | null)?.rankability_score ?? null;
      let trend: RankResult["trend"] = "stable";
      if (prevScore === null) trend = "new";
      else if (score > prevScore + 5) trend = "up";
      else if (score < prevScore - 5) trend = "down";

      const issues: string[] = [];
      if (score < 60) issues.push(`Low rankability score (${score}/100)`);
      if (trend === "down" && prevScore) issues.push(`Score dropped from ${prevScore} to ${score}`);

      results.push({ keyword: target.keyword, path: target.path, score, trend, issues });

      if (trend === "down") declining.push(`${target.path} (${prevScore} → ${score})`);

      // Update rankability score in page_seo
      await supabase
        .from("page_seo")
        .update({ rankability_score: score })
        .eq("path", target.path);
    } catch {
      // Skip
    }
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;
  const lowScoreCount = results.filter(r => r.score < 60).length;
  const status = declining.length > 3 ? "warning" : "success";
  const summary = `Avg rankability: ${avgScore}/100. ${lowScoreCount} keyword(s) below threshold. ${declining.length} declining.`;

  if (declining.length > 0 || lowScoreCount > 2) {
    await sendSlack([
      `*Rank Tracker — Weekly Update*`,
      `Avg rankability score: ${avgScore}/100`,
      declining.length > 0 ? `Declining: ${declining.slice(0, 5).join(", ")}` : "",
      lowScoreCount > 0 ? `Low score: ${results.filter(r => r.score < 60).map(r => r.path).slice(0, 5).join(", ")}` : "",
      `Full report: ${base}/admin/seo`,
    ].filter(Boolean).join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "rank-tracker",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: lowScoreCount,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "rank-tracker");

  return NextResponse.json({ status, summary, results, avgScore });
}
