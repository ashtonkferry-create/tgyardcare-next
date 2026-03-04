import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Competitor Monitor — runs monthly on the 5th at 9am.
// Fetches competitor homepages, extracts page structure and service mentions.
// Compares to last month's snapshot to detect new offerings or changes.
// Reports competitive intel to Slack.

const COMPETITORS = [
  { name: "Green Side Up Lawn", url: "https://greensideuplawn.com" },
  { name: "Majestic Lawn Care", url: "https://majesticlawncaremadison.com" },
];

const SERVICE_KEYWORDS = [
  "lawn mowing", "snow removal", "gutter cleaning", "fertilization",
  "aeration", "mulching", "spring cleanup", "fall cleanup", "landscaping",
  "irrigation", "tree trimming", "pest control", "commercial",
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

  const changes: string[] = [];
  const snapshots: { name: string; services: string[]; status: string }[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const res = await fetch(competitor.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SEO-monitor/1.0)" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        snapshots.push({ name: competitor.name, services: [], status: `HTTP ${res.status}` });
        continue;
      }

      const html = await res.text().catch(() => "");
      const lower = html.toLowerCase();

      // Find which services competitor mentions
      const detectedServices = SERVICE_KEYWORDS.filter(kw => lower.includes(kw));

      // Get previous snapshot
      const { data: prev } = await supabase
        .from("competitor_snapshots")
        .select("pages")
        .eq("competitor_name", competitor.name)
        .order("snapshot_at", { ascending: false })
        .limit(1)
        .single();

      const prevServices = (prev as { pages: { services: string[] } } | null)?.pages?.services ?? [];

      // Detect new services
      const newServices = detectedServices.filter(s => !prevServices.includes(s));
      const removedServices = prevServices.filter((s: string) => !detectedServices.includes(s));

      if (newServices.length > 0) {
        changes.push(`${competitor.name} added: ${newServices.join(", ")}`);
      }
      if (removedServices.length > 0) {
        changes.push(`${competitor.name} removed: ${removedServices.join(", ")}`);
      }

      // Store new snapshot
      await supabase.from("competitor_snapshots").insert({
        competitor_name: competitor.name,
        pages: { services: detectedServices, url: competitor.url },
        snapshot_at: new Date().toISOString(),
      });

      snapshots.push({ name: competitor.name, services: detectedServices, status: "ok" });
    } catch {
      snapshots.push({ name: competitor.name, services: [], status: "blocked/error" });
    }
  }

  const summary = changes.length === 0
    ? "No competitor changes detected"
    : `${changes.length} competitive change(s) detected`;

  if (changes.length > 0) {
    await sendSlack([
      `*Competitor Monitor — ${changes.length} change(s) detected*`,
      ...changes.map(c => `• ${c}`),
      `Review competitive intel and update your service pages accordingly.`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "competitor-monitor",
    status: "success",
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: changes.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "competitor-monitor");

  return NextResponse.json({ status: "success", summary, changes, snapshots });
}
