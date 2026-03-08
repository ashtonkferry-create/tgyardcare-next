import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "No session" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roleData } = await supabase
    .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
  if (!roleData) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reviewer_name, rating, review_text, source } = await req.json() as {
    reviewer_name: string;
    rating: number;
    review_text: string;
    source?: string;
  };

  if (!reviewer_name || !rating || !review_text) {
    return NextResponse.json({ error: "Missing required fields: reviewer_name, rating, review_text" }, { status: 400 });
  }

  const { data: review, error: insertErr } = await supabase
    .from("reviews")
    .insert({
      reviewer_name,
      rating,
      review_text,
      source: source || "manual",
      response_status: "pending",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      review_id: review.id,
      draft: null,
      message: "Review saved but ANTHROPIC_API_KEY not set — no draft generated",
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are responding to a Google review for TotalGuard Yard Care, a lawn care and yard services company in Madison, WI. Write a professional, warm, and personal response. Keep it under 100 words. Don't be overly formal.\n\nReview by ${reviewer_name} (${rating}/5 stars):\n"${review_text}"\n\nWrite just the response text, no quotes or labels.`,
        }],
      }),
    });

    const data = await res.json();
    const draft = data.content?.[0]?.type === "text" ? data.content[0].text : null;

    if (draft) {
      await supabase
        .from("reviews")
        .update({ response_draft: draft, response_status: "needs_review" })
        .eq("id", review.id);
    }

    return NextResponse.json({
      success: true,
      review_id: review.id,
      draft,
      message: draft ? "Review saved and draft generated" : "Review saved but draft generation failed",
    });
  } catch {
    return NextResponse.json({
      success: true,
      review_id: review.id,
      draft: null,
      message: "Review saved but draft generation errored",
    });
  }
}
