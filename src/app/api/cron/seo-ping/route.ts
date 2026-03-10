import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

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
    // 1. Fetch sitemap and extract all URLs
    const sitemapRes = await fetch("https://tgyardcare.com/sitemap.xml");
    const sitemapXml = await sitemapRes.text();
    const locRegex = /<loc>(.*?)<\/loc>/g;
    const allUrls = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = locRegex.exec(sitemapXml)) !== null) {
      allUrls.add(match[1]);
    }

    // 2. Fetch recently-healed URLs from seo_heal_log (last 24h)
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: healedRows } = await supabase
      .from("seo_heal_log")
      .select("url")
      .gte("created_at", twentyFourHoursAgo)
      .eq("action", "expanded_content");

    if (healedRows && healedRows.length > 0) {
      for (const row of healedRows) {
        if (row.url) {
          allUrls.add(row.url);
        }
      }
    }

    // 3. POST to IndexNow API
    const key = process.env.INDEXNOW_KEY || "tgyardcare-indexnow-key";
    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: "tgyardcare.com",
        key,
        keyLocation: `https://tgyardcare.com/${key}.txt`,
        urlList: Array.from(allUrls),
      }),
    });

    // 4. Log success to automation_runs
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-ping",
      status: "success",
      result_summary: `Pinged IndexNow with ${allUrls.size} URLs`,
      completed_at: new Date().toISOString(),
      pages_affected: allUrls.size,
    });

    return NextResponse.json({
      success: true,
      urls_pinged: allUrls.size,
      indexnow_status: indexNowRes.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    await supabase.from("automation_runs").insert({
      automation_slug: "seo-ping",
      status: "error",
      result_summary: `SEO ping failed: ${message}`,
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
