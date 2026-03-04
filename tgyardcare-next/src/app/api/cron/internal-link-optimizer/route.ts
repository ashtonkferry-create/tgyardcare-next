import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Internal Link Optimizer — runs monthly on the 1st at 10am.
// Fetches all key pages, counts internal links, flags thin pages.
// Goal: every page should link to at least 3 other pages on the site.

const ALL_PAGES = [
  "/", "/about", "/contact", "/service-areas",
  "/services/lawn-care", "/services/lawn-mowing", "/services/snow-removal",
  "/services/gutter-cleaning", "/services/fertilization", "/services/aeration",
  "/services/mulching", "/services/spring-cleanup", "/services/fall-cleanup",
  "/locations/madison", "/locations/middleton", "/locations/verona",
  "/locations/fitchburg", "/locations/sun-prairie", "/locations/waunakee",
];

const MIN_INTERNAL_LINKS = 3;

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
  const domain = "tgyardcare.com";

  const results: { path: string; internalLinkCount: number; thin: boolean }[] = [];
  const thinPages: string[] = [];

  for (const path of ALL_PAGES) {
    try {
      const res = await fetch(`${base}${path}`, { next: { revalidate: 0 } });
      if (!res.ok) continue;
      const html = await res.text();

      // Find all <a href="..."> links
      const hrefMatches = html.match(/href=["']([^"']+)["']/gi) ?? [];
      const internalLinks = new Set<string>();

      for (const match of hrefMatches) {
        const href = match.replace(/href=["']/i, "").replace(/["']$/, "");
        // Internal = starts with "/" or contains our domain, exclude anchors and current page
        if (
          (href.startsWith("/") || href.includes(domain)) &&
          !href.startsWith("#") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          href !== path &&
          href !== "/"
        ) {
          internalLinks.add(href.replace(`https://www.${domain}`, "").replace(`https://${domain}`, ""));
        }
      }

      const count = internalLinks.size;
      const thin = count < MIN_INTERNAL_LINKS;
      results.push({ path, internalLinkCount: count, thin });
      if (thin) thinPages.push(`${path} (${count} link${count !== 1 ? "s" : ""})`);
    } catch {
      // Skip failed pages
    }
  }

  const status = thinPages.length === 0 ? "success" : thinPages.length > 5 ? "warning" : "success";
  const summary = thinPages.length === 0
    ? `All ${ALL_PAGES.length} pages meet internal link minimum (${MIN_INTERNAL_LINKS}+)`
    : `${thinPages.length} page(s) have fewer than ${MIN_INTERNAL_LINKS} internal links`;

  if (thinPages.length > 0) {
    await sendSlack([
      `*Internal Link Optimizer — ${thinPages.length} thin page(s)*`,
      ...thinPages.slice(0, 10).map(p => `• ${p}`),
      `These pages need more internal links for SEO. Fix at: ${base}/admin/seo`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "internal-link-optimizer",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: thinPages.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "internal-link-optimizer");

  return NextResponse.json({ status, summary, results });
}
