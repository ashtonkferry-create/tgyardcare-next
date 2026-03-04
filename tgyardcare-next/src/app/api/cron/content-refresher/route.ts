import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
export const maxDuration = 300;

// Content Refresher — runs monthly 1st at 9am.
// Picks up pages flagged as stale by content-freshness cron,
// uses Claude to generate updated intro content, stores to DB for review.
// Does NOT auto-publish — human approves at /admin/seo.

const MAX_PAGES_PER_RUN = 3;

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

  // Find stale pages
  const { data: stalePages } = await supabase
    .from("page_seo")
    .select("path, title")
    .eq("needs_refresh", true)
    .limit(MAX_PAGES_PER_RUN);

  if (!stalePages?.length) {
    await supabase.from("automation_runs").insert({
      automation_slug: "content-refresher",
      status: "success",
      result_summary: "No stale pages to refresh",
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });
    return NextResponse.json({ refreshed: 0 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const month = new Date().getMonth() + 1;
  const mmdd = month * 100 + new Date().getDate();
  const season = (mmdd >= 1115 || mmdd <= 314) ? "winter" : (mmdd >= 915 && mmdd <= 1114) ? "fall" : "summer";

  const refreshed: string[] = [];

  for (const page of stalePages as { path: string; title: string }[]) {
    try {
      // Fetch current page content
      const res = await fetch(`${base}${page.path}`, { next: { revalidate: 0 } });
      if (!res.ok) continue;
      const html = await res.text();

      // Extract text content (strip HTML)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2000);

      const service = page.path.replace(/^\/(?:services|locations)\//, "").replace(/-/g, " ");

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `You are writing fresh content for TotalGuard Yard Care (Madison, WI).

Page: ${page.title || service}
Path: ${page.path}
Current season: ${season}
Existing content summary: ${textContent.slice(0, 500)}

Write a fresh 2-paragraph intro section (150-200 words total) for this page.
Include: seasonal relevance, local Madison WI focus, TotalGuard brand, and a natural mention of the service/location.
Use conversational but professional tone. No headers. No bullet points. Just 2 natural paragraphs.
Return ONLY the paragraphs, no intro text.`
        }],
      });

      const freshContent = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      // Store to DB for human review
      await supabase
        .from("page_seo")
        .update({
          refreshed_content: freshContent,
          refreshed_at: new Date().toISOString(),
          needs_refresh: false,
        })
        .eq("path", page.path);

      refreshed.push(page.path);
    } catch {
      // Skip failed pages
    }
  }

  const summary = `${refreshed.length} page(s) refreshed: ${refreshed.join(", ")}`;

  if (refreshed.length > 0) {
    await sendSlack([
      `*Content Refresher — ${refreshed.length} page(s) ready for review*`,
      ...refreshed.map(p => `• ${p}`),
      `Review and publish at: ${base}/admin/seo`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "content-refresher",
    status: "success",
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: refreshed.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "content-refresher");

  return NextResponse.json({ refreshed, count: refreshed.length });
}
