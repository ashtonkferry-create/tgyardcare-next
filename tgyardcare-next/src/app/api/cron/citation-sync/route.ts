import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Citation Sync — runs monthly on the 10th at 9am.
// Attempts to fetch known citation pages for TotalGuard Yard Care.
// Checks that NAP (Name, Address, Phone) appears correctly.
// Reports discrepancies or missing citations to Slack.

const CANONICAL_NAP = {
  name: "TotalGuard Yard Care",
  nameAlt: "TotalGuard",
  phone: "608-535-6057",
  phoneAlt: "(608) 535-6057",
  phoneDigits: "6085356057",
  city: "Madison",
  state: "WI",
};

// These are placeholder URLs — update with real listing URLs when available
const CITATION_SOURCES = [
  { name: "Yelp", url: "https://www.yelp.com/search?find_desc=TotalGuard+Yard+Care&find_loc=Madison%2C+WI", type: "search" },
  { name: "Yellow Pages", url: "https://www.yellowpages.com/search?search_terms=TotalGuard+Yard+Care&geo_location_terms=Madison%2C+WI", type: "search" },
  { name: "Angi", url: "https://www.angi.com/search?q=TotalGuard+Yard+Care&location=Madison%2C+WI", type: "search" },
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

  const issues: string[] = [];
  const results: { source: string; found: boolean; hasCorrectNAP: boolean; status: string }[] = [];

  for (const citation of CITATION_SOURCES) {
    try {
      const res = await fetch(citation.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (res.status === 403 || res.status === 429) {
        results.push({ source: citation.name, found: false, hasCorrectNAP: false, status: "blocked" });
        continue;
      }

      if (!res.ok) {
        results.push({ source: citation.name, found: false, hasCorrectNAP: false, status: `HTTP ${res.status}` });
        continue;
      }

      const html = await res.text();
      const lower = html.toLowerCase();

      // Check if business is found
      const found = lower.includes("totalguard") || lower.includes("total guard yard");

      if (!found) {
        issues.push(`${citation.name}: TotalGuard Yard Care not found in listing`);
        results.push({ source: citation.name, found: false, hasCorrectNAP: false, status: "not-found" });
        continue;
      }

      // Check NAP consistency
      const hasPhone = html.includes(CANONICAL_NAP.phone) ||
        html.includes(CANONICAL_NAP.phoneAlt) ||
        html.includes(CANONICAL_NAP.phoneDigits);
      const hasCity = lower.includes("madison") && lower.includes("wi");

      const napIssues: string[] = [];
      if (!hasPhone) napIssues.push("phone number not found");
      if (!hasCity) napIssues.push("city/state not found");

      if (napIssues.length > 0) {
        issues.push(`${citation.name}: NAP issues — ${napIssues.join(", ")}`);
      }

      results.push({
        source: citation.name,
        found: true,
        hasCorrectNAP: napIssues.length === 0,
        status: napIssues.length === 0 ? "ok" : "nap-mismatch",
      });
    } catch {
      results.push({ source: citation.name, found: false, hasCorrectNAP: false, status: "error" });
    }
  }

  const status = issues.length === 0 ? "success" : "warning";
  const summary = issues.length === 0
    ? "Citation NAP consistent across checked sources"
    : `${issues.length} citation issue(s) found`;

  if (issues.length > 0) {
    await sendSlack([
      `*Citation Sync — ${issues.length} issue(s)*`,
      ...issues.map(i => `• ${i}`),
      `Update your listings to ensure NAP consistency.`,
    ].join("\n"));
  }

  await supabase.from("automation_runs").insert({
    automation_slug: "citation-sync",
    status,
    result_summary: summary,
    completed_at: new Date().toISOString(),
    pages_affected: issues.length,
  });

  await supabase
    .from("automation_config")
    .update({ last_run_at: new Date().toISOString() })
    .eq("slug", "citation-sync");

  return NextResponse.json({ status, summary, results, issues });
}
