import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Page Speed Monitor — runs Wednesday 8am.
// Uses Google PageSpeed Insights API (free, no key needed) to check
// Core Web Vitals: Performance score, LCP, CLS, TBT.
// Flags slow pages to Slack for immediate attention.

const PAGES_TO_TEST = [
  "/",
  "/services/lawn-care",
  "/locations/madison",
  "/contact",
];

const THRESHOLDS = {
  performanceScore: { warning: 70, critical: 50 },
  lcpMs: { warning: 2500, critical: 4000 },
  cls: { warning: 0.1, critical: 0.25 },
  tbtMs: { warning: 200, critical: 600 },
};

async function sendSlack(msg: string) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: msg }),
  });
}

interface SpeedResult {
  path: string;
  score: number;
  lcpMs: number;
  cls: number;
  tbtMs: number;
  issues: string[];
  status: "good" | "warning" | "critical" | "error";
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

  const results: SpeedResult[] = [];
  const criticalPages: string[] = [];
  const apiKey = process.env.PAGESPEED_API_KEY ?? "";
  const keyParam = apiKey ? `&key=${apiKey}` : "";

  for (const path of PAGES_TO_TEST) {
    const pageUrl = encodeURIComponent(`${base}${path}`);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${pageUrl}&strategy=mobile&category=performance${keyParam}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        results.push({ path, score: 0, lcpMs: 0, cls: 0, tbtMs: 0, issues: [`API error ${res.status}`], status: "error" });
        continue;
      }

      const data = await res.json() as {
        lighthouseResult?: {
          categories?: { performance?: { score?: number } };
          audits?: {
            "largest-contentful-paint"?: { numericValue?: number };
            "cumulative-layout-shift"?: { numericValue?: number };
            "total-blocking-time"?: { numericValue?: number };
          };
        };
      };

      const lhr = data.lighthouseResult;
      const score = Math.round((lhr?.categories?.performance?.score ?? 0) * 100);
      const lcpMs = Math.round(lhr?.audits?.["largest-contentful-paint"]?.numericValue ?? 0);
      const cls = lhr?.audits?.["cumulative-layout-shift"]?.numericValue ?? 0;
      const tbtMs = Math.round(lhr?.audits?.["total-blocking-time"]?.numericValue ?? 0);

      const issues: string[] = [];
      let pageStatus: SpeedResult["status"] = "good";

      if (score < THRESHOLDS.performanceScore.critical) {
        issues.push(`Score ${score}/100 (critical)`);
        pageStatus = "critical";
      } else if (score < THRESHOLDS.performanceScore.warning) {
        issues.push(`Score ${score}/100 (warning)`);
        pageStatus = "warning";
      }

      if (lcpMs > THRESHOLDS.lcpMs.critical) {
        issues.push(`LCP ${(lcpMs / 1000).toFixed(1)}s (critical)`);
        pageStatus = "critical";
      } else if (lcpMs > THRESHOLDS.lcpMs.warning) {
        issues.push(`LCP ${(lcpMs / 1000).toFixed(1)}s (slow)`);
        if (pageStatus === "good") pageStatus = "warning";
      }

      if (cls > THRESHOLDS.cls.critical) {
        issues.push(`CLS ${cls.toFixed(3)} (critical)`);
        pageStatus = "critical";
      } else if (cls > THRESHOLDS.cls.warning) {
        issues.push(`CLS ${cls.toFixed(3)} (warning)`);
        if (pageStatus === "good") pageStatus = "warning";
      }

      results.push({ path, score, lcpMs, cls, tbtMs, issues, status: pageStatus });
      if (pageStatus === "critical") criticalPages.push(`${path} (score: ${score})`);

    } catch (err) {
      results.push({ path, score: 0, lcpMs: 0, cls: 0, tbtMs: 0, issues: [String(err).slice(0, 60)], status: "error" });
    }

    // Rate limiting: wait 2s between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  const pagesWithIssues = results.filter(r => r.status !== "good").length;
  const overallStatus = criticalPages.length > 0 ? "warning" : "success";
  const summary = pagesWithIssues === 0
    ? "All pages have good page speed scores"
    : `${pagesWithIssues} page(s) need speed improvements`;

  if (pagesWithIssues > 0) {
    await sendSlack([
      `*Page Speed Monitor — ${pagesWithIssues} page(s) with issues*`,
      ...results.filter(r => r.status !== "good").map(r =>
        `• ${r.path}: ${r.issues.join(", ")}`
      ),
      `Fix at: ${base}/admin/seo`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "page-speed-monitor",
    status: overallStatus,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: pagesWithIssues,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "page-speed-monitor");

  return NextResponse.json({ status: overallStatus, summary, results });
}
