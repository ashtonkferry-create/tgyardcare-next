import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
export const maxDuration = 120;

// Review Response Drafter — runs Wednesday 9am.
// Finds reviews in DB without a response draft.
// Uses Claude to generate professional, personalized response drafts.
// Stores to DB for human approval before posting.

const MAX_REVIEWS_PER_RUN = 5;

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

  // Ensure reviews table exists (create it if not)
  // This is a soft check — the cron won't fail if table doesn't exist yet
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, review_text, source")
    .is("response_draft", null)
    .limit(MAX_REVIEWS_PER_RUN);

  if (error || !reviews?.length) {
    const summary = error ? `Table error: ${error.message}` : "No reviews need response drafts";
    await supabase.from("automation_runs").insert({
      automation_slug: "review-response-drafter",
      status: "success",
      result_summary: summary,
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });
    return NextResponse.json({ drafted: 0, note: summary });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const drafted: string[] = [];

  for (const review of reviews as { id: string; reviewer_name: string; rating: number; review_text: string; source: string }[]) {
    try {
      const sentiment = review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative";

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Write a professional Google review response for TotalGuard Yard Care (Madison, WI).

Reviewer: ${review.reviewer_name ?? "Customer"}
Rating: ${review.rating}/5 stars (${sentiment})
Review: "${review.review_text ?? "Great service!"}"

Guidelines:
- Thank them by first name if possible
- Reference something specific from their review
- For positive: express genuine gratitude, invite them back
- For negative: apologize sincerely, offer to make it right, include contact info (608-535-6057)
- Length: 2-4 sentences
- Tone: warm, professional, genuine — NOT corporate or scripted
- Sign as: TotalGuard Yard Care Team

Return ONLY the response text.`
        }],
      });

      const draft = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      await supabase
        .from("reviews")
        .update({ response_draft: draft })
        .eq("id", review.id);

      drafted.push(`${review.reviewer_name ?? "Anonymous"} (${review.rating}★)`);
    } catch {
      // Skip
    }
  }

  const summary = `Drafted ${drafted.length} review response(s)`;

  if (drafted.length > 0) {
    await sendSlack([
      `*Review Response Drafter — ${drafted.length} draft(s) ready*`,
      ...drafted.map(d => `• ${d}`),
      `Approve at: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com"}/admin/reviews`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "review-response-drafter",
    status: "success",
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: drafted.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "review-response-drafter");

  return NextResponse.json({ drafted: drafted.length, names: drafted });
}
