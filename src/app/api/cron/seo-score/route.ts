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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tgyardcare.com";
    const sitemapRes = await fetch(`${siteUrl}/sitemap.xml`);
    const sitemapXml = await sitemapRes.text();
    const totalPages = (sitemapXml.match(/<loc>/g) || []).length;

    const { data: pendingItems } = await supabase
      .from("seo_heal_queue")
      .select("issue_type, url")
      .eq("status", "pending");

    const issuesByType: Record<string, number> = {};
    const urlsWithIssues = new Set<string>();
    if (pendingItems) {
      for (const item of pendingItems) {
        const t = (item as Record<string, unknown>).issue_type as string;
        issuesByType[t] = (issuesByType[t] || 0) + 1;
        urlsWithIssues.add((item as Record<string, unknown>).url as string);
      }
    }

    const pagesWithIssues = urlsWithIssues.size;
    const pagesPassing = Math.max(0, totalPages - pagesWithIssues);

    const { data: latestRuns } = await supabase
      .from("automation_runs")
      .select("automation_slug, status")
      .order("completed_at", { ascending: false })
      .limit(50);

    const latestBySlug: Record<string, string> = {};
    if (latestRuns) {
      for (const run of latestRuns) {
        const slug = (run as Record<string, unknown>).automation_slug as string;
        if (!latestBySlug[slug]) latestBySlug[slug] = (run as Record<string, unknown>).status as string;
      }
    }

    const successfulAudits = Object.values(latestBySlug).filter((s) => s === "success").length;
    const totalAudits = Object.keys(latestBySlug).length || 1;

    const issueFreePct = totalPages > 0 ? pagesPassing / totalPages : 1;
    const auditPassPct = successfulAudits / totalAudits;
    const schemaPct = totalPages > 0 ? Math.max(0, (totalPages - (issuesByType["schema_error"] || 0)) / totalPages) : 1;
    const altPct = totalPages > 0 ? Math.max(0, (totalPages - (issuesByType["missing_alt"] || 0)) / totalPages) : 1;
    const linkPct = totalPages > 0 ? Math.max(0, (totalPages - (issuesByType["orphan_page"] || 0)) / totalPages) : 1;
    const freshPct = totalPages > 0 ? Math.max(0, (totalPages - (issuesByType["stale_content"] || 0)) / totalPages) : 1;

    const overallScore =
      issueFreePct * 40 + auditPassPct * 20 + schemaPct * 15 + altPct * 10 + linkPct * 10 + freshPct * 5;

    const componentScores = {
      issue_free: Math.round(issueFreePct * 100),
      audit_pass: Math.round(auditPassPct * 100),
      schema_coverage: Math.round(schemaPct * 100),
      alt_coverage: Math.round(altPct * 100),
      link_health: Math.round(linkPct * 100),
      freshness: Math.round(freshPct * 100),
    };

    const today = new Date().toISOString().split("T")[0];
    await supabase.from("seo_health_scores").upsert(
      { score_date: today, overall_score: Math.round(overallScore * 100) / 100, total_pages: totalPages, pages_passing: pagesPassing, issues_by_type: issuesByType, component_scores: componentScores },
      { onConflict: "score_date" }
    );

    await supabase.from("automation_runs").insert({
      automation_slug: "seo-score",
      status: "success",
      result_summary: `Health score: ${overallScore.toFixed(1)}/100 (${pagesPassing}/${totalPages} pages clean)`,
      completed_at: new Date().toISOString(),
      pages_affected: totalPages,
    });

    return NextResponse.json({ success: true, score: Math.round(overallScore * 100) / 100, totalPages, pagesPassing, componentScores });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("automation_runs").insert({ automation_slug: "seo-score", status: "error", result_summary: message, completed_at: new Date().toISOString(), pages_affected: 0 });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
