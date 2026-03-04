import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
export const maxDuration = 120;

// Review Request Automation — runs daily at 10am.
// Finds recently completed service jobs where review hasn't been requested.
// Generates personalized review request messages using Claude.
// Stores drafts for human approval — does NOT auto-send.

const MAX_REQUESTS_PER_RUN = 5;
const REVIEW_LINK = "https://g.page/r/TotalGuardYardCare/review";

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

  // Find submissions that could benefit from review requests (recent, not yet requested)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: submissions } = await supabase
    .from("contact_submissions")
    .select("id, name, email, message, created_at")
    .is("review_requested_at", null)
    .gte("created_at", sevenDaysAgo)
    .lte("created_at", threeDaysAgo)
    .limit(MAX_REQUESTS_PER_RUN);

  if (!submissions?.length) {
    await supabase.from("automation_runs").insert({
      automation_slug: "review-request",
      status: "success",
      result_summary: "No new review requests to generate",
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });
    return NextResponse.json({ generated: 0 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const generated: string[] = [];

  for (const sub of submissions as { id: string; name: string; email: string; message: string; created_at: string }[]) {
    try {
      const firstName = sub.name?.split(" ")[0] ?? "there";
      const serviceHint = sub.message?.slice(0, 100) ?? "your recent service";

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Write a short, genuine review request text message (SMS-style, 2-3 sentences max) for:
Customer: ${firstName}
Service context: ${serviceHint}
Business: TotalGuard Yard Care, Madison WI
Review link: ${REVIEW_LINK}

Tone: friendly, personal, not corporate. Thank them, mention the specific job if possible, ask for review.
Return ONLY the message text, no subject line, no intro.`
        }],
      });

      const draft = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      // Store draft and mark as requested
      await supabase
        .from("contact_submissions")
        .update({
          review_request_draft: draft,
          review_requested_at: new Date().toISOString(),
        })
        .eq("id", sub.id);

      generated.push(`${firstName} (${sub.email})`);
    } catch {
      // Skip
    }
  }

  const summary = `Generated ${generated.length} review request draft(s)`;

  if (generated.length > 0) {
    await sendSlack([
      `*Review Request — ${generated.length} draft(s) ready*`,
      ...generated.map(g => `• ${g}`),
      `Approve and send at: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com"}/admin`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "review-request",
    status: "success",
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: generated.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "review-request");

  return NextResponse.json({ generated: generated.length, drafts: generated });
}
