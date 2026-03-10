import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekStartStr = weekStart.toISOString();
    const weekStartDate = weekStart.toISOString().split("T")[0];

    const { data: detectedItems } = await supabase
      .from("seo_heal_queue")
      .select("issue_type, status, url")
      .gte("created_at", weekStartStr);

    const issuesFound = detectedItems?.length || 0;
    const issuesFixed = detectedItems?.filter((i) => (i as Record<string, unknown>).status === "fixed").length || 0;

    const detectedByType: Record<string, number> = {};
    const fixedByType: Record<string, number> = {};
    if (detectedItems) {
      for (const item of detectedItems) {
        const t = (item as Record<string, unknown>).issue_type as string;
        const s = (item as Record<string, unknown>).status as string;
        detectedByType[t] = (detectedByType[t] || 0) + 1;
        if (s === "fixed") fixedByType[t] = (fixedByType[t] || 0) + 1;
      }
    }

    const { data: scores } = await supabase
      .from("seo_health_scores")
      .select("score_date, overall_score")
      .gte("score_date", weekStartDate)
      .order("score_date", { ascending: true });

    const scoreStart = scores && scores.length > 0 ? Number((scores[0] as Record<string, unknown>).overall_score) : null;
    const scoreEnd = scores && scores.length > 0 ? Number((scores[scores.length - 1] as Record<string, unknown>).overall_score) : null;

    const urlCounts: Record<string, number> = {};
    if (detectedItems) {
      for (const item of detectedItems) {
        const u = (item as Record<string, unknown>).url as string;
        urlCounts[u] = (urlCounts[u] || 0) + 1;
      }
    }
    const topIssues = Object.entries(urlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([url, count]) => ({ url, issue_count: count }));

    const { data: healActions } = await supabase
      .from("seo_heal_log")
      .select("action")
      .gte("created_at", weekStartStr);

    const actionCounts: Record<string, number> = {};
    if (healActions) {
      for (const a of healActions) {
        const act = (a as Record<string, unknown>).action as string;
        actionCounts[act] = (actionCounts[act] || 0) + 1;
      }
    }

    const { count: redirectsCreated } = await supabase
      .from("seo_redirects")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStartStr);

    const summary = {
      period: { start: weekStartDate, end: now.toISOString().split("T")[0] },
      issues: { detected: issuesFound, fixed: issuesFixed, detected_by_type: detectedByType, fixed_by_type: fixedByType },
      health_score: { start: scoreStart, end: scoreEnd, trend: scoreEnd && scoreStart ? scoreEnd - scoreStart : null },
      top_problematic_pages: topIssues,
      heal_actions: actionCounts,
      redirects_created: redirectsCreated || 0,
    };

    await supabase.from("seo_weekly_reports").upsert(
      { week_start: weekStartDate, summary, issues_found: issuesFound, issues_fixed: issuesFixed, score_start: scoreStart, score_end: scoreEnd, top_issues: topIssues },
      { onConflict: "week_start" }
    );

    await supabase.from("automation_runs").insert({
      automation_slug: "seo-report",
      status: "success",
      result_summary: `Weekly report: ${issuesFound} detected, ${issuesFixed} fixed, score ${scoreStart?.toFixed(1) || "?"} → ${scoreEnd?.toFixed(1) || "?"}`,
      completed_at: new Date().toISOString(),
      pages_affected: issuesFound,
    });

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("automation_runs").insert({ automation_slug: "seo-report", status: "error", result_summary: message, completed_at: new Date().toISOString(), pages_affected: 0 });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
