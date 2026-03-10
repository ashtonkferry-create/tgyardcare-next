import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  const stripped = stripHtml(text);
  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
}

function extractSlugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "";
  } catch {
    const segments = url.split("/").filter(Boolean);
    return segments[segments.length - 1] || "";
  }
}

function extractPathFromUrl(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function getParentSection(path: string): string {
  if (path.startsWith("/services/")) return "/services";
  if (path.startsWith("/blog/")) return "/blog";
  if (path.startsWith("/commercial/")) return "/commercial";
  if (path.startsWith("/locations/")) return "/locations";
  return "/";
}

async function pingIndexNow(url: string): Promise<void> {
  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: "tgyardcare.com",
      key: process.env.INDEXNOW_KEY || "tgyardcare-indexnow-key",
      urlList: [url],
    }),
  }).catch(() => {}); // best effort
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Fetch pending items from seo_heal_queue
    const { data: queueItems, error: queueError } = await supabase
      .from("seo_heal_queue")
      .select("*")
      .eq("status", "pending");

    if (queueError) {
      await supabase.from("automation_runs").insert({
        automation_slug: "seo-heal",
        status: "error",
        result_summary: `Failed to fetch queue: ${queueError.message}`,
        completed_at: new Date().toISOString(),
        pages_affected: 0,
      });
      return NextResponse.json(
        { success: false, error: queueError.message },
        { status: 500 }
      );
    }

    if (!queueItems || queueItems.length === 0) {
      await supabase.from("automation_runs").insert({
        automation_slug: "seo-heal",
        status: "skipped",
        result_summary: "No pending items in heal queue",
        completed_at: new Date().toISOString(),
        pages_affected: 0,
      });
      return NextResponse.json({ success: true, fixed: 0, unfixable: 0, skipped: 0 });
    }

    let fixed = 0;
    let unfixable = 0;
    let skipped = 0;

    // Pre-fetch sitemap paths for http_error handling
    let sitemapPaths: string[] = [];
    const hasHttpErrors = queueItems.some(
      (item: Record<string, unknown>) => item.issue_type === "http_error"
    );
    if (hasHttpErrors) {
      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "https://tgyardcare.com";
        const sitemapRes = await fetch(`${siteUrl}/sitemap.xml`);
        if (sitemapRes.ok) {
          const sitemapXml = await sitemapRes.text();
          const locMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
          sitemapPaths = locMatches.map((loc: string) => {
            const url = loc.replace(/<\/?loc>/g, "");
            return extractPathFromUrl(url);
          });
        }
      } catch {
        // Sitemap fetch failed — will use parent section fallback
      }
    }

    // 2. Process each item sequentially
    for (const item of queueItems) {
      const { id, url, issue_type } = item as {
        id: string;
        url: string;
        issue_type: string;
      };

      try {
        if (issue_type === "thin_content") {
          // --- THIN CONTENT FIX ---
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            await supabase
              .from("seo_heal_queue")
              .update({ status: "unfixable", fixed_at: new Date().toISOString() })
              .eq("id", id);
            await supabase.from("seo_heal_log").insert({
              action: "marked_unfixable",
              url,
              issue_type: "thin_content",
              before_state: {},
              after_state: { reason: "ANTHROPIC_API_KEY not configured" },
            });
            unfixable++;
            continue;
          }

          const slug = extractSlugFromUrl(url);
          if (!slug) {
            await supabase
              .from("seo_heal_queue")
              .update({ status: "unfixable", fixed_at: new Date().toISOString() })
              .eq("id", id);
            await supabase.from("seo_heal_log").insert({
              action: "marked_unfixable",
              url,
              issue_type: "thin_content",
              before_state: {},
              after_state: { reason: "Could not extract slug from URL" },
            });
            unfixable++;
            continue;
          }

          const { data: post, error: postError } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .single();

          if (postError || !post) {
            await supabase
              .from("seo_heal_queue")
              .update({ status: "unfixable", fixed_at: new Date().toISOString() })
              .eq("id", id);
            await supabase.from("seo_heal_log").insert({
              action: "marked_unfixable",
              url,
              issue_type: "thin_content",
              before_state: {},
              after_state: { reason: `Blog post not found for slug: ${slug}` },
            });
            unfixable++;
            continue;
          }

          const title = (post as Record<string, unknown>).title as string;
          const content = (post as Record<string, unknown>).content as string;
          const oldWordCount = countWords(content);

          const claudeRes = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 4096,
                messages: [
                  {
                    role: "user",
                    content: `You are a lawn care content expert in Madison, WI. Expand the following blog post to at least 1200 words. Keep the same topic, title, tone, and HTML structure. Add more depth, practical examples, Madison WI local context, and actionable tips. Return ONLY the expanded HTML content, no explanation.\n\nTitle: ${title}\n\nCurrent content:\n${content}`,
                  },
                ],
              }),
            }
          );

          if (!claudeRes.ok) {
            await supabase
              .from("seo_heal_queue")
              .update({ status: "unfixable", fixed_at: new Date().toISOString() })
              .eq("id", id);
            await supabase.from("seo_heal_log").insert({
              action: "marked_unfixable",
              url,
              issue_type: "thin_content",
              before_state: { word_count: oldWordCount },
              after_state: {
                reason: `Claude API error: ${claudeRes.status} ${claudeRes.statusText}`,
              },
            });
            unfixable++;
            continue;
          }

          const claudeData = (await claudeRes.json()) as {
            content: Array<{ type: string; text: string }>;
          };
          const expanded = claudeData.content[0].text;
          const newWordCount = countWords(expanded);

          if (newWordCount < 1000) {
            await supabase
              .from("seo_heal_queue")
              .update({ status: "unfixable", fixed_at: new Date().toISOString() })
              .eq("id", id);
            await supabase.from("seo_heal_log").insert({
              action: "marked_unfixable",
              url,
              issue_type: "thin_content",
              before_state: { word_count: oldWordCount },
              after_state: {
                word_count: newWordCount,
                reason: "Expanded content did not meet 1000 word minimum",
              },
            });
            unfixable++;
            continue;
          }

          // Update the blog post
          await supabase
            .from("blog_posts")
            .update({
              content: expanded,
              reading_time: Math.ceil(newWordCount / 200),
              updated_at: new Date().toISOString(),
            })
            .eq("slug", slug);

          // Log the fix
          await supabase.from("seo_heal_log").insert({
            action: "expanded_content",
            url,
            issue_type: "thin_content",
            before_state: { word_count: oldWordCount },
            after_state: { word_count: newWordCount },
          });

          // Mark as fixed
          await supabase
            .from("seo_heal_queue")
            .update({ status: "fixed", fixed_at: new Date().toISOString() })
            .eq("id", id);

          await pingIndexNow(url);
          fixed++;
        } else if (issue_type === "http_error") {
          // --- HTTP ERROR (404) FIX ---
          const path = extractPathFromUrl(url);

          let bestMatch = "";
          let bestScore = 0;

          for (const sitemapPath of sitemapPaths) {
            const score =
              1 -
              levenshtein(path, sitemapPath) /
                Math.max(path.length, sitemapPath.length);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = sitemapPath;
            }
          }

          const destinationPath =
            bestScore > 0.6 ? bestMatch : getParentSection(path);

          // Insert redirect
          await supabase.from("seo_redirects").insert({
            source_path: path,
            destination_path: destinationPath,
            status_code: 301,
            created_by: "seo-heal",
          });

          // Log the fix
          await supabase.from("seo_heal_log").insert({
            action: "created_redirect",
            url,
            issue_type: "http_error",
            before_state: { path, status: 404 },
            after_state: {
              destination: destinationPath,
              similarity_score: bestScore,
              match_type: bestScore > 0.6 ? "levenshtein" : "parent_section",
            },
          });

          // Mark as fixed
          await supabase
            .from("seo_heal_queue")
            .update({ status: "fixed", fixed_at: new Date().toISOString() })
            .eq("id", id);

          await pingIndexNow(url);
          fixed++;
        } else {
          // --- ALL OTHER ISSUE TYPES: mark as unfixable ---
          await supabase
            .from("seo_heal_queue")
            .update({ status: "unfixable", fixed_at: new Date().toISOString() })
            .eq("id", id);

          await supabase.from("seo_heal_log").insert({
            action: "marked_unfixable",
            url,
            issue_type,
            before_state: {},
            after_state: {
              reason: "Code-level issue — visible in admin dashboard",
            },
          });

          unfixable++;
        }
      } catch (itemError) {
        // Individual item failure — mark as unfixable and continue
        const reason =
          itemError instanceof Error ? itemError.message : "Unknown error";
        await supabase
          .from("seo_heal_queue")
          .update({ status: "unfixable", fixed_at: new Date().toISOString() })
          .eq("id", id);
        await supabase.from("seo_heal_log").insert({
          action: "marked_unfixable",
          url,
          issue_type,
          before_state: {},
          after_state: { reason },
        });
        unfixable++;
      }
    }

    // 5. Log automation run
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-heal",
      status: "success",
      result_summary: `Fixed ${fixed}, unfixable ${unfixable}`,
      completed_at: new Date().toISOString(),
      pages_affected: fixed,
    });

    return NextResponse.json({ success: true, fixed, unfixable, skipped });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-heal",
      status: "error",
      result_summary: message,
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
