import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// IndexNow Submitter — runs daily after sitemap updates.
// Submits all site URLs to Bing/IndexNow for faster crawl discovery.
// IndexNow is free, no API key needed (key is self-hosted at /indexnow.txt).
// Supported by Bing, Yandex, and indirectly benefits Google.

const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "tgyardcare-indexnow-key";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com";

// Core pages to always submit
const CORE_PAGES = [
  "/", "/about", "/contact", "/service-areas", "/services", "/locations",
  "/services/lawn-care", "/services/mowing", "/services/snow-removal",
  "/services/gutter-cleaning", "/services/fertilization", "/services/aeration",
  "/services/leaf-removal", "/services/mulching", "/services/spring-cleanup",
  "/services/fall-cleanup", "/services/herbicide", "/services/pruning",
  "/locations/madison", "/locations/middleton", "/locations/verona",
  "/locations/fitchburg", "/locations/sun-prairie", "/locations/waunakee",
  "/locations/cottage-grove", "/locations/deforest", "/locations/mcfarland",
  "/locations/monona", "/locations/oregon", "/locations/stoughton",
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

  // Also pull any recently updated pages from page_seo
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentPages } = await supabase
    .from("page_seo")
    .select("path")
    .gt("audited_at", oneDayAgo);

  const recentPaths = (recentPages ?? []).map((p: { path: string }) => p.path);
  const allPaths = [...new Set([...CORE_PAGES, ...recentPaths])];
  const urlList = allPaths.map(p => `${SITE_URL}${p}`);

  let submitted = 0;
  let failed = false;

  try {
    // Submit to Bing IndexNow
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_URL.replace("https://", "").replace("http://", ""),
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });

    submitted = urlList.length;
    if (!res.ok && res.status !== 202) {
      failed = true;
    }
  } catch {
    failed = true;
  }

  const status = failed ? "warning" : "success";
  const summary = failed
    ? "IndexNow submission failed"
    : `Submitted ${submitted} URL(s) to IndexNow`;

  if (!failed) {
    await sendSlack(`*IndexNow* — ${submitted} URL(s) submitted for fast crawl indexing`);
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "indexnow-submitter",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: submitted,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "indexnow-submitter");

  return NextResponse.json({ status, submitted, failed });
}
