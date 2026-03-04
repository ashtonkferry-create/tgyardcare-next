import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
export const maxDuration = 120;

// Social Auto-Post — runs Thursday 9am.
// Generates 3 seasonal social posts (educational, service highlight, community).
// Stores to DB for human approval. Sends preview to Slack.
// Does NOT auto-post to social platforms — human approves first.

async function sendSlack(msg: string) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: msg }),
  });
}

const POST_TYPES = [
  {
    type: "tip",
    description: "An educational lawn/yard care tip relevant to this season",
    format: "Facebook: 1-3 sentences with a practical tip. End with a question to drive engagement.",
  },
  {
    type: "service",
    description: "A seasonal service highlight for TotalGuard",
    format: "Facebook: Promote a specific service relevant to this season. Include value prop. 2-3 sentences.",
  },
  {
    type: "community",
    description: "A local community-focused post about serving Madison WI",
    format: "Facebook: Show love for the community. Mention a specific Madison neighborhood or area. Friendly tone.",
  },
];

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const month = new Date().getMonth() + 1;
  const mmdd = month * 100 + new Date().getDate();
  const season = (mmdd >= 1115 || mmdd <= 314) ? "winter" : (mmdd >= 915 && mmdd <= 1114) ? "fall" : "summer";
  const monthName = new Date().toLocaleDateString("en-US", { month: "long" });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const posts: { type: string; content: string }[] = [];

  for (const postType of POST_TYPES) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Write a social media post for TotalGuard Yard Care (Madison, WI).

Business: Professional lawn care company serving Madison, WI and surrounding areas.
Current month: ${monthName}
Season: ${season}
Post type: ${postType.description}
Format: ${postType.format}

Brand voice: Professional but approachable. Local. Trustworthy. No excessive exclamation points.
Do NOT use hashtags in the main post (add separately).
Return ONLY the post text.`
        }],
      });

      const content = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      posts.push({ type: postType.type, content });
    } catch {
      // Skip failed post
    }
  }

  // Store to DB
  if (posts.length > 0) {
    await supabase.from("social_posts").insert({
      content_fb: posts.map(p => `[${p.type.toUpperCase()}]\n${p.content}`).join("\n\n---\n\n"),
      season,
      status: "draft",
      created_at: new Date().toISOString(),
    });
  }

  const summary = `Generated ${posts.length} social post draft(s) for ${season} season`;

  await sendSlack([
    `*Social Auto-Post — ${posts.length} drafts for ${monthName}*`,
    ...posts.map(p => `\nPost type: ${p.type.toUpperCase()}\n${p.content.slice(0, 200)}${p.content.length > 200 ? "..." : ""}`),
    `\nApprove and schedule at: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com"}/admin`,
  ].join("\n"));

  await supabase.from("automation_runs").insert({
    automation_slug: "social-auto-post",
    status: "success",
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: posts.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "social-auto-post");

  return NextResponse.json({ status: "success", summary, posts });
}
