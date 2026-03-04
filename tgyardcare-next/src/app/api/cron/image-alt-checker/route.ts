import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Image Alt Text Checker — runs Tuesday 8am.
// Crawls key pages, finds <img> tags missing alt attributes,
// reports to Slack so they can be fixed for accessibility + SEO.

const PAGES_TO_CHECK = [
  "/", "/about", "/contact", "/service-areas",
  "/services/lawn-care", "/services/lawn-mowing", "/services/snow-removal",
  "/services/gutter-cleaning", "/services/fertilization", "/services/aeration",
  "/services/mulching", "/services/spring-cleanup", "/services/fall-cleanup",
  "/locations/madison", "/locations/middleton", "/locations/verona",
  "/locations/fitchburg", "/locations/sun-prairie", "/locations/waunakee",
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

  const issues: { path: string; missingAlt: string[] }[] = [];
  let totalMissing = 0;

  for (const path of PAGES_TO_CHECK) {
    try {
      const res = await fetch(`${base}${path}`, { next: { revalidate: 0 } });
      if (!res.ok) continue;
      const html = await res.text();

      // Find all <img> tags
      const imgMatches = html.match(/<img[^>]+>/gi) ?? [];
      const missingAlt: string[] = [];

      for (const img of imgMatches) {
        // Check if alt attribute exists and has a value
        const hasAlt = /alt=["'][^"']+["']/.test(img);
        if (!hasAlt) {
          // Extract src for reporting
          const srcMatch = img.match(/src=["']([^"']{0,80})["']/i);
          missingAlt.push(srcMatch ? srcMatch[1] : "(unknown src)");
        }
      }

      if (missingAlt.length > 0) {
        issues.push({ path, missingAlt });
        totalMissing += missingAlt.length;
      }
    } catch {
      // Skip pages that error
    }
  }

  const status = totalMissing === 0 ? "success" : totalMissing > 10 ? "warning" : "success";
  const summary = totalMissing === 0
    ? "All images have alt text"
    : `${totalMissing} image(s) missing alt text across ${issues.length} page(s)`;

  if (issues.length > 0) {
    await sendSlack([
      `*Image Alt Text Checker — ${totalMissing} missing*`,
      ...issues.slice(0, 8).map(i =>
        `• ${i.path}: ${i.missingAlt.length} image(s) — ${i.missingAlt.slice(0, 2).join(", ")}`
      ),
      `Fix at: ${base}/admin/seo`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "image-alt-checker",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: issues.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "image-alt-checker");

  return NextResponse.json({ status, summary, issues });
}
