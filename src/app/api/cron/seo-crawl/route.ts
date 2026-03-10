import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

interface SeoIssue {
  url: string;
  issue_type: string;
  severity: string;
  details: Record<string, unknown>;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<{ response: Response; elapsed: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "TotalGuard-SEO-Crawler/1.0" },
    });
    const elapsed = Date.now() - start;
    return { response, elapsed };
  } finally {
    clearTimeout(timer);
  }
}

function extractTag(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function processUrl(url: string): Promise<SeoIssue[]> {
  const issues: SeoIssue[] = [];

  let html: string;
  let statusCode: number;
  let elapsed: number;

  try {
    const result = await fetchWithTimeout(url, 10000);
    statusCode = result.response.status;
    elapsed = result.elapsed;
    html = await result.response.text();
  } catch {
    issues.push({
      url,
      issue_type: "http_error",
      severity: "standard",
      details: { error: "fetch_failed_or_timeout" },
    });
    return issues;
  }

  // HTTP error
  if (statusCode >= 400) {
    issues.push({
      url,
      issue_type: "http_error",
      severity: "standard",
      details: { status_code: statusCode },
    });
  }

  // Slow response
  if (elapsed > 3000) {
    issues.push({
      url,
      issue_type: "slow_response",
      severity: "standard",
      details: { response_time_ms: elapsed },
    });
  }

  // Title
  const title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) {
    issues.push({
      url,
      issue_type: "missing_title",
      severity: "standard",
      details: {},
    });
  }

  // Meta description
  const metaDesc = html.match(
    /<meta\s+[^>]*name=["']description["'][^>]*>/i
  );
  if (!metaDesc) {
    issues.push({
      url,
      issue_type: "missing_meta_description",
      severity: "standard",
      details: {},
    });
  }

  // OG tags
  const ogTitle = html.match(
    /<meta\s+[^>]*property=["']og:title["'][^>]*>/i
  );
  const ogDesc = html.match(
    /<meta\s+[^>]*property=["']og:description["'][^>]*>/i
  );
  if (!ogTitle || !ogDesc) {
    issues.push({
      url,
      issue_type: "missing_og",
      severity: "standard",
      details: {
        missing_og_title: !ogTitle,
        missing_og_description: !ogDesc,
      },
    });
  }

  // Canonical
  const canonical = html.match(
    /<link\s+[^>]*rel=["']canonical["'][^>]*>/i
  );
  if (!canonical) {
    issues.push({
      url,
      issue_type: "missing_canonical",
      severity: "standard",
      details: {},
    });
  }

  // Structured data
  const schema = html.match(
    /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>/i
  );
  if (!schema) {
    issues.push({
      url,
      issue_type: "missing_schema",
      severity: "standard",
      details: {},
    });
  }

  // Blog content checks
  if (url.includes("/blog/")) {
    const stripped = stripHtml(html);
    const wordCount = stripped.split(/\s+/).filter(Boolean).length;

    if (wordCount < 100) {
      issues.push({
        url,
        issue_type: "soft_404",
        severity: "standard",
        details: { word_count: wordCount },
      });
    } else if (wordCount < 800) {
      issues.push({
        url,
        issue_type: "thin_content",
        severity: "standard",
        details: { word_count: wordCount },
      });
    }
  }

  return issues;
}

async function processInPool(
  urls: string[],
  concurrency: number
): Promise<SeoIssue[]> {
  const allIssues: SeoIssue[] = [];
  let index = 0;

  async function next(): Promise<void> {
    while (index < urls.length) {
      const currentIndex = index++;
      const issues = await processUrl(urls[currentIndex]);
      allIssues.push(...issues);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () =>
    next()
  );
  await Promise.all(workers);
  return allIssues;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Fetch and parse sitemap
    const sitemapRes = await fetch("https://tgyardcare.com/sitemap.xml", {
      headers: { "User-Agent": "TotalGuard-SEO-Crawler/1.0" },
    });
    const sitemapXml = await sitemapRes.text();

    const urls: string[] = [];
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match: RegExpExecArray | null;
    while ((match = locRegex.exec(sitemapXml)) !== null) {
      urls.push(match[1]);
    }

    if (urls.length === 0) {
      await supabase.from("automation_runs").insert({
        automation_slug: "seo-crawl",
        status: "error",
        result_summary: "No URLs found in sitemap",
        completed_at: new Date().toISOString(),
        pages_affected: 0,
      });
      return NextResponse.json(
        { success: false, error: "No URLs found in sitemap" },
        { status: 500 }
      );
    }

    // 2. Crawl with concurrency pool of 5
    const allIssues = await processInPool(urls, 5);

    // 3. Upsert issues into seo_heal_queue
    const flaggedKeys = new Set<string>();

    for (const issue of allIssues) {
      const key = `${issue.url}::${issue.issue_type}`;
      flaggedKeys.add(key);

      await supabase
        .from("seo_heal_queue")
        .upsert(
          {
            url: issue.url,
            issue_type: issue.issue_type,
            severity: issue.severity,
            details: issue.details,
            status: "pending",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "url,issue_type" }
        );
    }

    // 4. Auto-resolve: mark items resolved if not flagged this run
    const { data: existingItems } = await supabase
      .from("seo_heal_queue")
      .select("id, url, issue_type")
      .eq("status", "pending");

    let resolvedCount = 0;
    if (existingItems && existingItems.length > 0) {
      const toResolve = existingItems.filter(
        (item: { id: string; url: string; issue_type: string }) =>
          !flaggedKeys.has(`${item.url}::${item.issue_type}`)
      );

      if (toResolve.length > 0) {
        const resolveIds = toResolve.map(
          (item: { id: string }) => item.id
        );
        await supabase
          .from("seo_heal_queue")
          .update({
            status: "resolved",
            updated_at: new Date().toISOString(),
          })
          .in("id", resolveIds);
        resolvedCount = toResolve.length;
      }
    }

    // 5. Log to automation_runs
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-crawl",
      status: "success",
      result_summary: `Crawled ${urls.length} URLs, found ${allIssues.length} issues`,
      completed_at: new Date().toISOString(),
      pages_affected: allIssues.length,
    });

    return NextResponse.json({
      success: true,
      urls_crawled: urls.length,
      issues_found: allIssues.length,
      resolved: resolvedCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    await supabase.from("automation_runs").insert({
      automation_slug: "seo-crawl",
      status: "error",
      result_summary: `SEO crawl failed: ${message}`,
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
