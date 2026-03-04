import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
export const maxDuration = 300;

// AEO (Answer Engine Optimizer) — runs weekly Wednesday 11am.
// Generates content optimized for AI search engines (ChatGPT, Perplexity, Google SGE).
// Creates: direct answer paragraphs, speakable schema, "what is X" definitions.
// Stores to page_seo.aeo_content for review, then auto-publishes to Speakable JSON-LD.

const SERVICE_PAGES = [
  { path: "/services/mowing", service: "lawn mowing", city: "Madison WI" },
  { path: "/services/snow-removal", service: "snow removal", city: "Madison WI" },
  { path: "/services/gutter-cleaning", service: "gutter cleaning", city: "Madison WI" },
  { path: "/services/fertilization", service: "lawn fertilization", city: "Madison WI" },
  { path: "/services/aeration", service: "lawn aeration", city: "Madison WI" },
  { path: "/services/leaf-removal", service: "leaf removal", city: "Madison WI" },
  { path: "/services/spring-cleanup", service: "spring cleanup", city: "Madison WI" },
  { path: "/services/fall-cleanup", service: "fall cleanup", city: "Madison WI" },
];

const LOCATION_PAGES = [
  { path: "/locations/madison", city: "Madison" },
  { path: "/locations/middleton", city: "Middleton" },
  { path: "/locations/verona", city: "Verona" },
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

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const processed: string[] = [];

  // Process service pages (max 4 per run to stay within timeout)
  for (const page of SERVICE_PAGES.slice(0, 4)) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `You are an SEO expert optimizing content for AI search engines (ChatGPT, Perplexity, Google AI Overviews).

Generate AEO content for: ${page.service} in ${page.city}
Business: TotalGuard Yard Care

Return a JSON object with exactly these keys:
{
  "directAnswer": "One clear sentence answering 'What is ${page.service}?' that an AI would quote (max 50 words)",
  "whyUs": "One sentence on why TotalGuard is the best choice for ${page.service} in ${page.city} (max 40 words)",
  "speakableHeadline": "A natural-language question someone would ask a voice assistant (e.g. 'Who does the best lawn mowing in Madison WI?')",
  "speakableAnswer": "A concise spoken answer (max 30 words, natural speech rhythm)"
}

Return ONLY the JSON object, no other text.`
        }],
      });

      const text = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      const match = text.match(/\{[\s\S]+\}/);
      if (!match) continue;

      const aeoContent = JSON.parse(match[0]) as {
        directAnswer: string;
        whyUs: string;
        speakableHeadline: string;
        speakableAnswer: string;
      };

      // Build Speakable schema
      const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".direct-answer"],
        },
        name: aeoContent.speakableHeadline,
        description: aeoContent.speakableAnswer,
      };

      await supabase
        .from("page_seo")
        .upsert({
          path: page.path,
          aeo_content: aeoContent,
          speakable_schema: speakableSchema,
        }, { onConflict: "path" });

      processed.push(page.path);
    } catch {
      // Skip failed pages
    }
  }

  // Process location pages (max 2 per run)
  for (const page of LOCATION_PAGES.slice(0, 2)) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Generate a direct answer for AI search engines about lawn care in ${page.city}, WI by TotalGuard Yard Care.

Return JSON:
{
  "directAnswer": "1-2 sentences answering 'Who does lawn care in ${page.city} WI?' — cite TotalGuard specifically",
  "speakableAnswer": "30-word spoken answer for voice search about lawn care in ${page.city}"
}

Return ONLY the JSON.`
        }],
      });

      const text = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      const match = text.match(/\{[\s\S]+\}/);
      if (!match) continue;

      const aeoContent = JSON.parse(match[0]);
      await supabase
        .from("page_seo")
        .upsert({ path: page.path, aeo_content: aeoContent }, { onConflict: "path" });

      processed.push(page.path);
    } catch {
      // Skip
    }
  }

  const summary = `AEO content generated for ${processed.length} page(s)`;

  await sendSlack([
    `*AEO Optimizer — ${processed.length} page(s) optimized for AI search*`,
    ...processed.map(p => `• ${p}`),
  ].join("\n"));

  await supabase.from("automation_runs").insert({
    automation_slug: "aeo-optimizer",
    status: "success",
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: processed.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "aeo-optimizer");

  return NextResponse.json({ status: "success", summary, processed });
}
