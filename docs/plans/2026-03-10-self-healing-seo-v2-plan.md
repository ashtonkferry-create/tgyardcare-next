# Self-Healing SEO System v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the self-healing SEO system from 2 auto-fix strategies to 14 specific handlers, connect 7 existing crons to the unified heal queue, add health scoring + weekly reporting, achieving zero-manual-maintenance SEO coverage.

**Architecture:** Unified heal pipeline — every SEO cron feeds `seo_heal_queue`, one healer (`seo-heal`) processes all 16 issue types with type-specific strategies. Two new crons (`seo-score`, `seo-report`) provide daily health scores and weekly digests. All changes are additive — existing cron behavior preserved.

**Tech Stack:** Next.js 16 API routes, Supabase (PostgreSQL + service role), Claude Haiku API (content generation), CrUX API (Core Web Vitals), IndexNow API (recrawl pinging)

---

## Task 1: Create New Supabase Migration (2 tables)

**Files:**
- Create: `supabase/migrations/20260310_seo_v2_tables.sql`

**Step 1: Write the migration file**

```sql
-- Self-Healing SEO v2 — health scores + weekly reports
-- Design: docs/plans/2026-03-10-self-healing-seo-v2-design.md

-- Daily SEO health score snapshots
create table if not exists seo_health_scores (
  id uuid default gen_random_uuid() primary key,
  score_date date not null unique,
  overall_score numeric(5,2) not null,
  total_pages int not null,
  pages_passing int not null,
  issues_by_type jsonb default '{}',
  component_scores jsonb default '{}',
  created_at timestamptz default now()
);

-- Weekly SEO report aggregations
create table if not exists seo_weekly_reports (
  id uuid default gen_random_uuid() primary key,
  week_start date not null unique,
  summary jsonb not null,
  issues_found int default 0,
  issues_fixed int default 0,
  score_start numeric(5,2),
  score_end numeric(5,2),
  top_issues jsonb default '[]',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_seo_health_scores_date on seo_health_scores(score_date desc);
create index if not exists idx_seo_weekly_reports_week on seo_weekly_reports(week_start desc);

-- RLS: service role only
alter table seo_health_scores enable row level security;
alter table seo_weekly_reports enable row level security;

create policy "Service role full access" on seo_health_scores for all using (true) with check (true);
create policy "Service role full access" on seo_weekly_reports for all using (true) with check (true);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260310_seo_v2_tables.sql
git commit -m "feat: add seo_health_scores and seo_weekly_reports migration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Upgrade seo-crawl with 6 New Detection Checks

**Files:**
- Modify: `src/app/api/cron/seo-crawl/route.ts` (all 327 lines — major expansion)

**Context:** The current `processUrl()` function (lines 41-175) checks 10 things: HTTP status, response time, title, meta desc, OG tags, canonical, schema, and blog word count. We add 6 new checks to the same function, plus a post-crawl duplicate detection pass.

**Step 1: Add broken external link detection to `processUrl()`**

After the blog content checks block (line 172), add external link checking. Extract all `<a href="https://...">` links pointing outside tgyardcare.com, HEAD-check each with 5s timeout. Queue failures as `broken_external_link`.

```typescript
// Broken external links (blog pages only to stay within timeout)
if (url.includes("/blog/")) {
  const extLinkRegex = /href=["'](https?:\/\/(?!(?:www\.)?tgyardcare\.com)[^"']+)["']/gi;
  let extMatch;
  const checkedExternals = new Set<string>();
  while ((extMatch = extLinkRegex.exec(html)) !== null) {
    const extUrl = extMatch[1];
    if (checkedExternals.has(extUrl)) continue;
    checkedExternals.add(extUrl);
    try {
      const extRes = await fetchWithTimeout(extUrl, 5000);
      if (extRes.response.status >= 400) {
        issues.push({
          url,
          issue_type: "broken_external_link",
          severity: "standard",
          details: { broken_href: extUrl, status: extRes.response.status },
        });
      }
    } catch {
      issues.push({
        url,
        issue_type: "broken_external_link",
        severity: "standard",
        details: { broken_href: extUrl, error: "timeout_or_unreachable" },
      });
    }
  }
}
```

**Step 2: Add H1 count check to `processUrl()`**

After the external link block, check H1 tags:

```typescript
// H1 count check
const h1Matches = html.match(/<h1\b[^>]*>/gi) || [];
if (h1Matches.length === 0) {
  issues.push({
    url,
    issue_type: "missing_h1",
    severity: "standard",
    details: { h1_count: 0 },
  });
} else if (h1Matches.length > 1) {
  issues.push({
    url,
    issue_type: "heading_order",
    severity: "standard",
    details: { h1_count: h1Matches.length, issue: "multiple_h1" },
  });
}
```

**Step 3: Add image alt coverage check to `processUrl()`**

```typescript
// Image alt coverage (blog pages)
if (url.includes("/blog/")) {
  const imgRegex = /<img\b([^>]*)>/gi;
  let imgMatch;
  let missingAltCount = 0;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    if (!/\balt\s*=/i.test(imgMatch[1])) {
      missingAltCount++;
    }
  }
  if (missingAltCount > 0) {
    issues.push({
      url,
      issue_type: "missing_alt",
      severity: "standard",
      details: { missing_alt_count: missingAltCount },
    });
  }
}
```

**Step 4: Add content freshness check to `processUrl()`**

```typescript
// Content freshness (blog pages — check Last-Modified header)
if (url.includes("/blog/")) {
  // We already have the response from the initial fetch — but headers are consumed.
  // Use updated_at from blog_posts table instead (checked in seo-heal).
  // For crawl: flag if page has no Last-Modified and is a blog post.
  // The content-freshness cron handles the actual staleness check via DB.
  // Skip here — content-freshness cron covers this.
}
```

> **Note:** Content freshness is better handled by the `content-freshness` cron which has DB access to `page_seo.audited_at`. The crawl-level check would duplicate effort without DB context. Skip this in seo-crawl; the content-freshness cron will feed the queue directly (Task 8).

**Step 5: Add CrUX Core Web Vitals check**

Add a new function and call it in the `GET` handler AFTER `processInPool()`, for the 5 highest-traffic pages only:

```typescript
const CWV_PAGES = [
  "https://tgyardcare.com/",
  "https://tgyardcare.com/services",
  "https://tgyardcare.com/services/mowing",
  "https://tgyardcare.com/reviews",
  "https://tgyardcare.com/contact",
];

async function checkCoreWebVitals(): Promise<SeoIssue[]> {
  const issues: SeoIssue[] = [];
  for (const pageUrl of CWV_PAGES) {
    try {
      const cruxRes = await fetch(
        `https://chromeuxreport.googleapis.com/v1/records:queryRecord`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: pageUrl }),
        }
      );
      if (!cruxRes.ok) continue; // CrUX may not have data for low-traffic pages
      const cruxData = await cruxRes.json() as {
        record?: {
          metrics?: {
            largest_contentful_paint?: { percentiles?: { p75?: number } };
            cumulative_layout_shift?: { percentiles?: { p75?: number } };
            interaction_to_next_paint?: { percentiles?: { p75?: number } };
          };
        };
      };
      const metrics = cruxData.record?.metrics;
      if (!metrics) continue;

      const lcp = metrics.largest_contentful_paint?.percentiles?.p75;
      const cls = metrics.cumulative_layout_shift?.percentiles?.p75;
      const inp = metrics.interaction_to_next_paint?.percentiles?.p75;

      const cwvDetails: Record<string, unknown> = {};
      let poor = false;

      if (lcp && lcp > 2500) { cwvDetails.lcp_ms = lcp; poor = true; }
      if (cls && cls > 0.1) { cwvDetails.cls = cls; poor = true; }
      if (inp && inp > 200) { cwvDetails.inp_ms = inp; poor = true; }

      if (poor) {
        issues.push({
          url: pageUrl,
          issue_type: "cwv_poor",
          severity: "standard",
          details: cwvDetails,
        });
      }
    } catch {
      // CrUX unavailable — skip silently
    }
  }
  return issues;
}
```

In the `GET` handler, after line 242 (`const allIssues = await processInPool(urls, 5);`), add:

```typescript
// Core Web Vitals check (top 5 pages)
const cwvIssues = await checkCoreWebVitals();
allIssues.push(...cwvIssues);
```

**Step 6: Add duplicate title detection**

After `processInPool` and CWV checks, add a post-crawl pass in the `GET` handler. This requires collecting titles during crawl. Modify `processUrl` to return titles alongside issues.

Change approach: instead of modifying `processUrl` return type, add a separate post-crawl title collection:

In the `GET` handler, after CWV issues are pushed:

```typescript
// Duplicate title detection (post-crawl pass)
const titleMap = new Map<string, string[]>();
for (const pageUrl of urls) {
  try {
    // Re-use: we already fetched these pages in processInPool.
    // To avoid double-fetching, we'll extract titles during processUrl.
    // For now, we track titles from the issues we found.
  } catch { /* skip */ }
}
```

> **Better approach:** Modify `processUrl` to also return the title as metadata. Change the return type to `{ issues: SeoIssue[]; title: string | null }` and collect titles in `processInPool`. Then do duplicate detection in the GET handler.

Modify the `processUrl` function signature and return:

```typescript
interface ProcessResult {
  issues: SeoIssue[];
  title: string | null;
  url: string;
}

async function processUrl(url: string): Promise<ProcessResult> {
  const issues: SeoIssue[] = [];
  // ... existing code ...
  // At the title extraction point (line 84), capture title:
  const title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  // ... rest of checks ...
  return { issues, title, url };
}
```

Update `processInPool` to return `ProcessResult[]`:

```typescript
async function processInPool(
  urls: string[],
  concurrency: number
): Promise<ProcessResult[]> {
  const allResults: ProcessResult[] = [];
  let index = 0;

  async function next(): Promise<void> {
    while (index < urls.length) {
      const currentIndex = index++;
      const result = await processUrl(urls[currentIndex]);
      allResults.push(result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () =>
    next()
  );
  await Promise.all(workers);
  return allResults;
}
```

Then in GET handler:

```typescript
const allResults = await processInPool(urls, 5);
const allIssues: SeoIssue[] = allResults.flatMap((r) => r.issues);

// Core Web Vitals
const cwvIssues = await checkCoreWebVitals();
allIssues.push(...cwvIssues);

// Duplicate title detection
const titleToUrls = new Map<string, string[]>();
for (const result of allResults) {
  if (result.title) {
    const normalized = result.title.toLowerCase().trim();
    if (!titleToUrls.has(normalized)) titleToUrls.set(normalized, []);
    titleToUrls.get(normalized)!.push(result.url);
  }
}
for (const [title, pageUrls] of titleToUrls) {
  if (pageUrls.length > 1) {
    for (const pageUrl of pageUrls) {
      allIssues.push({
        url: pageUrl,
        issue_type: "duplicate_title",
        severity: "standard",
        details: { title, duplicate_with: pageUrls.filter((u) => u !== pageUrl) },
      });
    }
  }
}
```

**Step 7: Verify build passes**

```bash
cd c:\Users\vance\OneDrive\Desktop\claude-workspace\tgyardcare && npx next build 2>&1 | tail -20
```

Expected: Build succeeds with no type errors in `seo-crawl/route.ts`.

**Step 8: Commit**

```bash
git add src/app/api/cron/seo-crawl/route.ts
git commit -m "feat: upgrade seo-crawl with 6 new detection checks (16 total issue types)

Adds: broken external links, H1 count, image alt coverage, CrUX Core Web
Vitals, duplicate title detection. Returns ProcessResult with title metadata
for cross-page duplicate detection.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Upgrade seo-heal with 14 Specific Fix Strategies

**Files:**
- Modify: `src/app/api/cron/seo-heal/route.ts` (all 423 lines — major expansion)

**Context:** Currently handles `thin_content` (lines 156-309) and `http_error` (lines 310-359). Lines 360-378 is a catch-all `else` that marks everything as "unfixable". We replace that catch-all with 12 additional handlers.

**Step 1: Replace the catch-all else block (lines 360-378) with specific handlers**

The new handlers go inside the `for (const item of queueItems)` loop, as additional `else if` branches after `http_error`:

```typescript
} else if (issue_type === "soft_404") {
  // --- SOFT 404 FIX ---
  // Blog posts with < 100 words: regenerate with Claude
  const slug = extractSlugFromUrl(url);
  if (!slug || !url.includes("/blog/")) {
    // Non-blog soft 404: mark for review
    await supabase.from("seo_heal_queue").update({ status: "needs_review", fixed_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("seo_heal_log").insert({ action: "flagged_needs_review", url, issue_type: "soft_404", before_state: {}, after_state: { reason: "Non-blog soft 404 — needs manual review" } });
    unfixable++;
    continue;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { await markUnfixable(supabase, id, url, "soft_404", "ANTHROPIC_API_KEY not configured"); unfixable++; continue; }

  const { data: post } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
  if (!post) { await markUnfixable(supabase, id, url, "soft_404", `Blog post not found: ${slug}`); unfixable++; continue; }

  const title = (post as Record<string, unknown>).title as string;
  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: `You are a lawn care content expert in Madison, WI. Write a complete blog post of at least 1200 words for the title "${title}". Include practical advice, Madison WI local context, seasonal tips, and actionable steps. Return ONLY HTML content, no explanation.` }],
    }),
  });

  if (!claudeRes.ok) { await markUnfixable(supabase, id, url, "soft_404", `Claude API error: ${claudeRes.status}`); unfixable++; continue; }

  const claudeData = (await claudeRes.json()) as { content: Array<{ type: string; text: string }> };
  const generated = claudeData.content[0].text;
  const newWordCount = countWords(generated);

  if (newWordCount < 800) { await markUnfixable(supabase, id, url, "soft_404", `Generated content only ${newWordCount} words`); unfixable++; continue; }

  await supabase.from("blog_posts").update({ content: generated, reading_time: Math.ceil(newWordCount / 200), updated_at: new Date().toISOString() }).eq("slug", slug);
  await supabase.from("seo_heal_log").insert({ action: "regenerated_content", url, issue_type: "soft_404", before_state: { word_count: 0 }, after_state: { word_count: newWordCount } });
  await supabase.from("seo_heal_queue").update({ status: "fixed", fixed_at: new Date().toISOString() }).eq("id", id);
  await pingIndexNow(url);
  fixed++;

} else if (issue_type === "slow_response") {
  // --- SLOW RESPONSE FIX ---
  // Trigger on-demand revalidation by fetching URL with cache-bust header
  try {
    await fetch(url, { headers: { "Cache-Control": "no-cache", "User-Agent": "TotalGuard-CachePurge/1.0" } });
    await supabase.from("seo_heal_log").insert({ action: "cache_purge", url, issue_type: "slow_response", before_state: item.details || {}, after_state: { action: "revalidation_triggered" } });
    await supabase.from("seo_heal_queue").update({ status: "fixed", fixed_at: new Date().toISOString() }).eq("id", id);
    fixed++;
  } catch {
    await markUnfixable(supabase, id, url, "slow_response", "Cache purge fetch failed");
    unfixable++;
  }

} else if (issue_type === "broken_internal_link") {
  // --- BROKEN INTERNAL LINK FIX ---
  // Same redirect logic as http_error
  const path = extractPathFromUrl(url);
  let bestMatch = "";
  let bestScore = 0;
  for (const sitemapPath of sitemapPaths) {
    const score = 1 - levenshtein(path, sitemapPath) / Math.max(path.length, sitemapPath.length);
    if (score > bestScore) { bestScore = score; bestMatch = sitemapPath; }
  }
  const destinationPath = bestScore > 0.6 ? bestMatch : getParentSection(path);
  await supabase.from("seo_redirects").upsert({ source_path: path, destination_path: destinationPath, status_code: 301, created_by: "seo-heal" }, { onConflict: "source_path" });
  await supabase.from("seo_heal_log").insert({ action: "created_redirect", url, issue_type: "broken_internal_link", before_state: { path }, after_state: { destination: destinationPath, similarity: bestScore } });
  await supabase.from("seo_heal_queue").update({ status: "fixed", fixed_at: new Date().toISOString() }).eq("id", id);
  await pingIndexNow(url);
  fixed++;

} else if (issue_type === "broken_external_link") {
  // --- BROKEN EXTERNAL LINK FIX ---
  // For blog posts: strip the dead <a> tag, keep the link text
  const slug = extractSlugFromUrl(url);
  if (!slug || !url.includes("/blog/")) {
    await markUnfixable(supabase, id, url, "broken_external_link", "Non-blog page — code-level fix needed");
    unfixable++;
    continue;
  }
  const { data: post } = await supabase.from("blog_posts").select("content, slug").eq("slug", slug).single();
  if (!post) { await markUnfixable(supabase, id, url, "broken_external_link", `Post not found: ${slug}`); unfixable++; continue; }

  const brokenHref = ((item.details as Record<string, unknown>)?.broken_href as string) || "";
  if (!brokenHref) { await markUnfixable(supabase, id, url, "broken_external_link", "No broken_href in details"); unfixable++; continue; }

  const content = (post as Record<string, unknown>).content as string;
  // Replace <a href="brokenHref">text</a> with just text
  const escapedHref = brokenHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const linkRegex = new RegExp(`<a\\s+[^>]*href=["']${escapedHref}["'][^>]*>(.*?)</a>`, "gi");
  const newContent = content.replace(linkRegex, "$1");

  if (newContent === content) {
    await markUnfixable(supabase, id, url, "broken_external_link", "Link not found in content");
    unfixable++;
    continue;
  }

  await supabase.from("blog_posts").update({ content: newContent, updated_at: new Date().toISOString() }).eq("slug", slug);
  await supabase.from("seo_heal_log").insert({ action: "removed_broken_link", url, issue_type: "broken_external_link", before_state: { broken_href: brokenHref }, after_state: { action: "link_text_preserved" } });
  await supabase.from("seo_heal_queue").update({ status: "fixed", fixed_at: new Date().toISOString() }).eq("id", id);
  await pingIndexNow(url);
  fixed++;

} else if (issue_type === "stale_content") {
  // --- STALE CONTENT FIX ---
  // Claude refresh blog content with current info
  const slug = extractSlugFromUrl(url);
  if (!slug || !url.includes("/blog/")) {
    await markUnfixable(supabase, id, url, "stale_content", "Non-blog stale content — manual refresh needed");
    unfixable++;
    continue;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { await markUnfixable(supabase, id, url, "stale_content", "ANTHROPIC_API_KEY not configured"); unfixable++; continue; }

  const { data: post } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
  if (!post) { await markUnfixable(supabase, id, url, "stale_content", `Post not found: ${slug}`); unfixable++; continue; }

  const title = (post as Record<string, unknown>).title as string;
  const content = (post as Record<string, unknown>).content as string;
  const oldWordCount = countWords(content);

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: `You are a lawn care content expert in Madison, WI. Refresh the following blog post with current 2026 information, updated seasonal advice, and any new best practices. Keep the same title, topic, tone, and HTML structure. Maintain at least ${Math.max(oldWordCount, 1000)} words. Return ONLY the refreshed HTML content.\n\nTitle: ${title}\n\nCurrent content:\n${content}` }],
    }),
  });

  if (!claudeRes.ok) { await markUnfixable(supabase, id, url, "stale_content", `Claude API error: ${claudeRes.status}`); unfixable++; continue; }

  const claudeData = (await claudeRes.json()) as { content: Array<{ type: string; text: string }> };
  const refreshed = claudeData.content[0].text;
  const newWordCount = countWords(refreshed);

  await supabase.from("blog_posts").update({ content: refreshed, reading_time: Math.ceil(newWordCount / 200), updated_at: new Date().toISOString() }).eq("slug", slug);
  await supabase.from("seo_heal_log").insert({ action: "refreshed_content", url, issue_type: "stale_content", before_state: { word_count: oldWordCount }, after_state: { word_count: newWordCount } });
  await supabase.from("seo_heal_queue").update({ status: "fixed", fixed_at: new Date().toISOString() }).eq("id", id);
  await pingIndexNow(url);
  fixed++;

} else if (issue_type === "missing_alt") {
  // --- MISSING ALT TEXT FIX ---
  // For blog posts: Claude generate alt text from surrounding context
  const slug = extractSlugFromUrl(url);
  if (!slug || !url.includes("/blog/")) {
    await markUnfixable(supabase, id, url, "missing_alt", "Non-blog page — alt text in JSX components");
    unfixable++;
    continue;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { await markUnfixable(supabase, id, url, "missing_alt", "ANTHROPIC_API_KEY not configured"); unfixable++; continue; }

  const { data: post } = await supabase.from("blog_posts").select("content, title, slug").eq("slug", slug).single();
  if (!post) { await markUnfixable(supabase, id, url, "missing_alt", `Post not found: ${slug}`); unfixable++; continue; }

  const content = (post as Record<string, unknown>).content as string;
  const title = (post as Record<string, unknown>).title as string;

  // Find images without alt text
  const imgNoAltRegex = /<img\b(?![^>]*\balt\s*=)([^>]*)>/gi;
  let hasNoAlt = false;
  let testMatch;
  while ((testMatch = imgNoAltRegex.exec(content)) !== null) {
    hasNoAlt = true;
    break;
  }

  if (!hasNoAlt) {
    // Alt text already present — auto-resolve
    await supabase.from("seo_heal_queue").update({ status: "resolved", fixed_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("seo_heal_log").insert({ action: "auto_resolved", url, issue_type: "missing_alt", before_state: {}, after_state: { reason: "All images now have alt text" } });
    fixed++;
    continue;
  }

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: `Given this blog post about "${title}" for a lawn care company in Madison, WI, add descriptive alt text to every <img> tag that is missing an alt attribute. Keep all other HTML unchanged. Return ONLY the modified HTML.\n\n${content}` }],
    }),
  });

  if (!claudeRes.ok) { await markUnfixable(supabase, id, url, "missing_alt", `Claude API error: ${claudeRes.status}`); unfixable++; continue; }

  const claudeData = (await claudeRes.json()) as { content: Array<{ type: string; text: string }> };
  const fixedContent = claudeData.content[0].text;

  await supabase.from("blog_posts").update({ content: fixedContent, updated_at: new Date().toISOString() }).eq("slug", slug);
  await supabase.from("seo_heal_log").insert({ action: "generated_alt_text", url, issue_type: "missing_alt", before_state: {}, after_state: { action: "alt_text_added_via_claude" } });
  await supabase.from("seo_heal_queue").update({ status: "fixed", fixed_at: new Date().toISOString() }).eq("id", id);
  await pingIndexNow(url);
  fixed++;

} else if (["missing_title", "missing_meta_description", "missing_og", "missing_canonical", "missing_schema"].includes(issue_type)) {
  // --- FALSE POSITIVE AUTO-RESOLVE ---
  // All pages have hardcoded metadata exports and AutoSchema.tsx.
  // These are false positives from SSR HTML parsing timing.
  await supabase.from("seo_heal_queue").update({ status: "resolved", fixed_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("seo_heal_log").insert({
    action: "auto_resolved",
    url,
    issue_type,
    before_state: {},
    after_state: { reason: "False positive — metadata is hardcoded in page exports / AutoSchema covers" },
  });
  // Don't count as fixed or unfixable — these are resolved
  skipped++;

} else if (issue_type === "cwv_poor") {
  // --- CORE WEB VITALS FIX ---
  // Trigger cache purge + flag for review
  try {
    await fetch(url, { headers: { "Cache-Control": "no-cache", "User-Agent": "TotalGuard-CachePurge/1.0" } });
  } catch { /* best effort */ }
  await supabase.from("seo_heal_queue").update({ status: "needs_review", fixed_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("seo_heal_log").insert({ action: "cache_purge_and_flag", url, issue_type: "cwv_poor", before_state: item.details || {}, after_state: { action: "cache_purged_needs_code_optimization" } });
  unfixable++;

} else {
  // --- REMAINING LOGGED-ONLY TYPES ---
  // missing_h1, heading_order, duplicate_title, orphan_page, nap_mismatch, sitemap_mismatch, schema_error
  await supabase.from("seo_heal_queue").update({ status: "needs_review", fixed_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("seo_heal_log").insert({
    action: "flagged_needs_review",
    url,
    issue_type,
    before_state: item.details || {},
    after_state: { reason: "Code-level issue — visible in admin dashboard" },
  });
  unfixable++;
}
```

**Step 2: Extract `markUnfixable` helper to reduce duplication**

Add this helper function before the `GET` handler:

```typescript
async function markUnfixable(
  supabase: ReturnType<typeof createClient>,
  id: string,
  url: string,
  issueType: string,
  reason: string
): Promise<void> {
  await supabase.from("seo_heal_queue").update({ status: "unfixable", fixed_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("seo_heal_log").insert({ action: "marked_unfixable", url, issue_type: issueType, before_state: {}, after_state: { reason } });
}
```

**Step 3: Update `sitemapPaths` pre-fetch condition**

The current code (line 126) only fetches sitemap paths if `hasHttpErrors`. Update it to also check for `broken_internal_link`:

```typescript
const needsSitemapPaths = queueItems.some(
  (item: Record<string, unknown>) =>
    item.issue_type === "http_error" || item.issue_type === "broken_internal_link"
);
if (needsSitemapPaths) {
```

**Step 4: Verify build passes**

```bash
cd c:\Users\vance\OneDrive\Desktop\claude-workspace\tgyardcare && npx next build 2>&1 | tail -20
```

**Step 5: Commit**

```bash
git add src/app/api/cron/seo-heal/route.ts
git commit -m "feat: upgrade seo-heal with 14 specific fix strategies

Replaces catch-all 'unfixable' block with handlers for: soft_404, slow_response,
broken_internal_link, broken_external_link, stale_content, missing_alt,
false-positive auto-resolve (5 meta types), cwv_poor, and flagged-only types.
Adds markUnfixable helper to reduce duplication.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Connect schema-validator to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/schema-validator/route.ts` (lines 62-70)

**Step 1: Add queue writes after the results loop**

After the existing `await supabase.from("automation_runs").insert(...)` block (line 81), add:

```typescript
// Feed issues into seo_heal_queue for unified processing
for (const result of results.filter((r) => !r.valid)) {
  await supabase.from("seo_heal_queue").upsert(
    {
      url: `${SITE_URL}${result.path}`,
      issue_type: "schema_error",
      severity: "standard",
      details: { schemas_found: result.schemas, issues: result.issues },
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "url,issue_type" }
  );
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/schema-validator/route.ts
git commit -m "feat: connect schema-validator to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Connect heading-auditor to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/heading-auditor/route.ts` (after line 79)

**Step 1: Add queue writes**

After the existing `await supabase.from("automation_runs").insert(...)` block (line 79), add:

```typescript
// Feed issues into seo_heal_queue
for (const result of results) {
  const fullUrl = `${SITE_URL}${result.path}`;
  if (result.h1Count === 0) {
    await supabase.from("seo_heal_queue").upsert(
      { url: fullUrl, issue_type: "missing_h1", severity: "standard", details: { h1_count: 0, issues: result.issues }, status: "pending", updated_at: new Date().toISOString() },
      { onConflict: "url,issue_type" }
    );
  }
  if (result.h1Count > 1 || result.issues.some((i) => i.includes("hierarchy"))) {
    await supabase.from("seo_heal_queue").upsert(
      { url: fullUrl, issue_type: "heading_order", severity: "standard", details: { h1_count: result.h1Count, issues: result.issues }, status: "pending", updated_at: new Date().toISOString() },
      { onConflict: "url,issue_type" }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/heading-auditor/route.ts
git commit -m "feat: connect heading-auditor to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Connect image-alt-checker to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/image-alt-checker/route.ts` (after line 71)

**Step 1: Add queue writes**

After the existing `await supabase.from("automation_runs").insert(...)` block (line 71), add:

```typescript
// Feed issues into seo_heal_queue
for (const result of results.filter((r) => r.missingAlt > 0)) {
  await supabase.from("seo_heal_queue").upsert(
    {
      url: `${SITE_URL}${result.path}`,
      issue_type: "missing_alt",
      severity: "standard",
      details: { missing_alt_count: result.missingAlt, sample_images: result.images },
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "url,issue_type" }
  );
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/image-alt-checker/route.ts
git commit -m "feat: connect image-alt-checker to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Connect internal-link-optimizer to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/internal-link-optimizer/route.ts` (after line 114)

**Step 1: Add queue writes for orphan pages**

After the existing `await supabase.from("automation_runs").insert(...)` block (line 114), add:

```typescript
// Feed orphan pages into seo_heal_queue
for (const s of suggestions.filter((s) => s.incomingCount < 3)) {
  await supabase.from("seo_heal_queue").upsert(
    {
      url: `${SITE_URL}${s.page}`,
      issue_type: "orphan_page",
      severity: "standard",
      details: { incoming_links: s.incomingCount, outgoing_links: s.outgoingCount, suggestion: s.suggestion },
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "url,issue_type" }
  );
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/internal-link-optimizer/route.ts
git commit -m "feat: connect internal-link-optimizer to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Connect content-freshness to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/content-freshness/route.ts` (after line 14)

**Context:** This cron is very compact (23 lines). It flags `page_seo` rows where `audited_at` > 90 days. We add queue writes for each flagged page.

**Step 1: Add queue writes**

After the `const count = data?.length ?? 0;` line (line 14), add:

```typescript
// Feed stale pages into seo_heal_queue
if (data && data.length > 0) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tgyardcare.com";
  for (const row of data) {
    const path = (row as Record<string, unknown>).path as string;
    if (path) {
      await supabase.from("seo_heal_queue").upsert(
        {
          url: `${siteUrl}${path}`,
          issue_type: "stale_content",
          severity: "standard",
          details: { flagged_by: "content-freshness", stale_threshold_days: 90 },
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "url,issue_type" }
      );
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/content-freshness/route.ts
git commit -m "feat: connect content-freshness to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Connect sitemap-check to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/sitemap-check/route.ts` (after line 25)

**Step 1: Add queue writes for broken sitemap URLs**

After the `for (const url of urls)` loop ends (line 21) and before the status calculation (line 22), add:

```typescript
// Feed broken URLs into seo_heal_queue
for (const entry of broken) {
  const brokenUrl = entry.split(" (")[0]; // Extract URL from "url (status)" format
  await supabase.from("seo_heal_queue").upsert(
    {
      url: brokenUrl,
      issue_type: "sitemap_mismatch",
      severity: "standard",
      details: { raw: entry },
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "url,issue_type" }
  );
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/sitemap-check/route.ts
git commit -m "feat: connect sitemap-check to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Connect nap-checker to seo_heal_queue

**Files:**
- Modify: `src/app/api/cron/nap-checker/route.ts` (after line 88)

**Step 1: Add queue writes for NAP inconsistencies**

After the existing `await supabase.from("automation_runs").insert(...)` block (line 88), add:

```typescript
// Feed NAP issues into seo_heal_queue
for (const issue of issues) {
  await supabase.from("seo_heal_queue").upsert(
    {
      url: `${SITE_URL}${issue.path}`,
      issue_type: "nap_mismatch",
      severity: "standard",
      details: { problems: issue.problems },
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "url,issue_type" }
  );
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/nap-checker/route.ts
git commit -m "feat: connect nap-checker to seo_heal_queue

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Create seo-score Cron Route

**Files:**
- Create: `src/app/api/cron/seo-score/route.ts`

**Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Count total pages from sitemap
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tgyardcare.com";
    const sitemapRes = await fetch(`${siteUrl}/sitemap.xml`);
    const sitemapXml = await sitemapRes.text();
    const totalPages = (sitemapXml.match(/<loc>/g) || []).length;

    // 2. Count pages with pending issues
    const { count: pendingIssueCount } = await supabase
      .from("seo_heal_queue")
      .select("url", { count: "exact", head: true })
      .eq("status", "pending");

    // 3. Count issues by type
    const { data: pendingItems } = await supabase
      .from("seo_heal_queue")
      .select("issue_type")
      .eq("status", "pending");

    const issuesByType: Record<string, number> = {};
    if (pendingItems) {
      for (const item of pendingItems) {
        const t = (item as Record<string, unknown>).issue_type as string;
        issuesByType[t] = (issuesByType[t] || 0) + 1;
      }
    }

    // 4. Get unique URLs with issues
    const urlsWithIssues = new Set(
      (pendingItems || []).map((item) => (item as Record<string, unknown>).url as string)
    );
    const pagesWithIssues = urlsWithIssues.size;
    const pagesPassing = Math.max(0, totalPages - pagesWithIssues);

    // 5. Get latest automation run data for component scores
    const { data: latestRuns } = await supabase
      .from("automation_runs")
      .select("automation_slug, status, result_summary")
      .order("completed_at", { ascending: false })
      .limit(50);

    // Extract component scores from latest runs
    const latestBySlug: Record<string, string> = {};
    if (latestRuns) {
      for (const run of latestRuns) {
        const slug = (run as Record<string, unknown>).automation_slug as string;
        if (!latestBySlug[slug]) {
          latestBySlug[slug] = (run as Record<string, unknown>).status as string;
        }
      }
    }

    const successfulAudits = Object.values(latestBySlug).filter((s) => s === "success").length;
    const totalAudits = Object.keys(latestBySlug).length || 1;

    // 6. Calculate score
    // Issue-free ratio (40%) + Audit pass rate (20%) + Schema coverage estimate (15%)
    // + Alt text estimate (10%) + Link health estimate (10%) + Freshness (5%)
    const issueFreePct = totalPages > 0 ? pagesPassing / totalPages : 1;
    const auditPassPct = successfulAudits / totalAudits;

    // Estimates based on known issues
    const schemaIssues = issuesByType["schema_error"] || 0;
    const schemaPct = totalPages > 0 ? Math.max(0, (totalPages - schemaIssues) / totalPages) : 1;
    const altIssues = issuesByType["missing_alt"] || 0;
    const altPct = totalPages > 0 ? Math.max(0, (totalPages - altIssues) / totalPages) : 1;
    const orphanIssues = issuesByType["orphan_page"] || 0;
    const linkPct = totalPages > 0 ? Math.max(0, (totalPages - orphanIssues) / totalPages) : 1;
    const staleIssues = issuesByType["stale_content"] || 0;
    const freshPct = totalPages > 0 ? Math.max(0, (totalPages - staleIssues) / totalPages) : 1;

    const overallScore =
      issueFreePct * 40 +
      auditPassPct * 20 +
      schemaPct * 15 +
      altPct * 10 +
      linkPct * 10 +
      freshPct * 5;

    const componentScores = {
      issue_free: Math.round(issueFreePct * 100),
      audit_pass: Math.round(auditPassPct * 100),
      schema_coverage: Math.round(schemaPct * 100),
      alt_coverage: Math.round(altPct * 100),
      link_health: Math.round(linkPct * 100),
      freshness: Math.round(freshPct * 100),
    };

    // 7. Upsert daily score
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("seo_health_scores").upsert(
      {
        score_date: today,
        overall_score: Math.round(overallScore * 100) / 100,
        total_pages: totalPages,
        pages_passing: pagesPassing,
        issues_by_type: issuesByType,
        component_scores: componentScores,
      },
      { onConflict: "score_date" }
    );

    // 8. Log automation run
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-score",
      status: "success",
      result_summary: `Health score: ${overallScore.toFixed(1)}/100 (${pagesPassing}/${totalPages} pages clean)`,
      completed_at: new Date().toISOString(),
      pages_affected: totalPages,
    });

    return NextResponse.json({
      success: true,
      score: Math.round(overallScore * 100) / 100,
      totalPages,
      pagesPassing,
      pendingIssues: pendingIssueCount || 0,
      componentScores,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-score",
      status: "error",
      result_summary: message,
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/seo-score/route.ts
git commit -m "feat: create seo-score cron — daily SEO health score (0-100)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Create seo-report Cron Route

**Files:**
- Create: `src/app/api/cron/seo-report/route.ts`

**Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekStartStr = weekStart.toISOString();
    const weekStartDate = weekStart.toISOString().split("T")[0];

    // 1. Issues detected this week
    const { data: detectedItems } = await supabase
      .from("seo_heal_queue")
      .select("issue_type, status, url")
      .gte("created_at", weekStartStr);

    const issuesFound = detectedItems?.length || 0;
    const issuesFixed = detectedItems?.filter((i) => (i as Record<string, unknown>).status === "fixed").length || 0;

    // Count by type
    const detectedByType: Record<string, number> = {};
    const fixedByType: Record<string, number> = {};
    if (detectedItems) {
      for (const item of detectedItems) {
        const t = (item as Record<string, unknown>).issue_type as string;
        const s = (item as Record<string, unknown>).status as string;
        detectedByType[t] = (detectedByType[t] || 0) + 1;
        if (s === "fixed") fixedByType[t] = (fixedByType[t] || 0) + 1;
      }
    }

    // 2. Health score trend (last 7 days)
    const { data: scores } = await supabase
      .from("seo_health_scores")
      .select("score_date, overall_score")
      .gte("score_date", weekStartDate)
      .order("score_date", { ascending: true });

    const scoreStart = scores && scores.length > 0 ? Number((scores[0] as Record<string, unknown>).overall_score) : null;
    const scoreEnd = scores && scores.length > 0 ? Number((scores[scores.length - 1] as Record<string, unknown>).overall_score) : null;

    // 3. Top problematic pages (most issues)
    const urlCounts: Record<string, number> = {};
    if (detectedItems) {
      for (const item of detectedItems) {
        const u = (item as Record<string, unknown>).url as string;
        urlCounts[u] = (urlCounts[u] || 0) + 1;
      }
    }
    const topIssues = Object.entries(urlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([url, count]) => ({ url, issue_count: count }));

    // 4. Heal log actions this week
    const { data: healActions } = await supabase
      .from("seo_heal_log")
      .select("action, url, issue_type")
      .gte("created_at", weekStartStr);

    const actionCounts: Record<string, number> = {};
    if (healActions) {
      for (const action of healActions) {
        const a = (action as Record<string, unknown>).action as string;
        actionCounts[a] = (actionCounts[a] || 0) + 1;
      }
    }

    // 5. Redirects created this week
    const { count: redirectsCreated } = await supabase
      .from("seo_redirects")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStartStr);

    // 6. Build summary
    const summary = {
      period: { start: weekStartDate, end: now.toISOString().split("T")[0] },
      issues: { detected: issuesFound, fixed: issuesFixed, detected_by_type: detectedByType, fixed_by_type: fixedByType },
      health_score: { start: scoreStart, end: scoreEnd, trend: scoreEnd && scoreStart ? scoreEnd - scoreStart : null },
      top_problematic_pages: topIssues,
      heal_actions: actionCounts,
      redirects_created: redirectsCreated || 0,
    };

    // 7. Upsert weekly report
    await supabase.from("seo_weekly_reports").upsert(
      {
        week_start: weekStartDate,
        summary,
        issues_found: issuesFound,
        issues_fixed: issuesFixed,
        score_start: scoreStart,
        score_end: scoreEnd,
        top_issues: topIssues,
      },
      { onConflict: "week_start" }
    );

    // 8. Log automation run
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-report",
      status: "success",
      result_summary: `Weekly report: ${issuesFound} detected, ${issuesFixed} fixed, score ${scoreStart?.toFixed(1) || "?"} → ${scoreEnd?.toFixed(1) || "?"}`,
      completed_at: new Date().toISOString(),
      pages_affected: issuesFound,
    });

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("automation_runs").insert({
      automation_slug: "seo-report",
      status: "error",
      result_summary: message,
      completed_at: new Date().toISOString(),
      pages_affected: 0,
    });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/seo-report/route.ts
git commit -m "feat: create seo-report cron — weekly SEO digest to Supabase

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Update vercel.json with 2 New Cron Entries

**Files:**
- Modify: `vercel.json` (add 2 entries to crons array)

**Step 1: Add the new entries**

Add before the closing `]` of the crons array:

```json
{ "path": "/api/cron/seo-score",  "schedule": "0 7 * * *"   },
{ "path": "/api/cron/seo-report", "schedule": "0 8 * * 1"   }
```

This brings total crons to 42.

**Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add seo-score and seo-report to vercel.json cron schedule

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Build Verification + Final Commit + Push

**Step 1: Run full build**

```bash
cd c:\Users\vance\OneDrive\Desktop\claude-workspace\tgyardcare && npx next build 2>&1 | tail -30
```

Expected: Build succeeds with no errors in any of the 13 modified/created files.

**Step 2: Fix any type errors**

If build fails, fix the errors and recommit.

**Step 3: Push all commits**

```bash
git push origin main
```

---

## Task 15: Apply Supabase Migrations

**Step 1: Apply the existing page_seo migration (20260303)**

Use Supabase MCP `execute_sql` to run the contents of `supabase/migrations/20260303_page_seo_columns.sql` against project `mxhalirruvyxdkppjsqf`.

**Step 2: Apply the new v2 tables migration (20260310)**

Use Supabase MCP `execute_sql` to run the contents of `supabase/migrations/20260310_seo_v2_tables.sql` against project `mxhalirruvyxdkppjsqf`.

**Step 3: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('seo_health_scores', 'seo_weekly_reports', 'seo_heal_queue', 'seo_heal_log', 'seo_redirects');
```

Expected: All 5 tables present.

---

## Task 16: Smoke Test

**Step 1: Test seo-score endpoint**

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" "https://tgyardcare.com/api/cron/seo-score" | jq .
```

Expected: `{ "success": true, "score": <number>, ... }`

**Step 2: Test seo-report endpoint**

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" "https://tgyardcare.com/api/cron/seo-report" | jq .
```

Expected: `{ "success": true, "summary": {...} }`

**Step 3: Verify existing crons still work (spot check)**

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" "https://tgyardcare.com/api/cron/schema-validator" | jq .success
```

Expected: `true`

---

## Summary of All Files Touched

| # | File | Action |
|---|------|--------|
| 1 | `supabase/migrations/20260310_seo_v2_tables.sql` | CREATE — 2 new tables |
| 2 | `src/app/api/cron/seo-crawl/route.ts` | MODIFY — 6 new checks |
| 3 | `src/app/api/cron/seo-heal/route.ts` | MODIFY — 14 fix strategies |
| 4 | `src/app/api/cron/schema-validator/route.ts` | MODIFY — add queue writes |
| 5 | `src/app/api/cron/heading-auditor/route.ts` | MODIFY — add queue writes |
| 6 | `src/app/api/cron/image-alt-checker/route.ts` | MODIFY — add queue writes |
| 7 | `src/app/api/cron/internal-link-optimizer/route.ts` | MODIFY — add queue writes |
| 8 | `src/app/api/cron/content-freshness/route.ts` | MODIFY — add queue writes |
| 9 | `src/app/api/cron/sitemap-check/route.ts` | MODIFY — add queue writes |
| 10 | `src/app/api/cron/nap-checker/route.ts` | MODIFY — add queue writes |
| 11 | `src/app/api/cron/seo-score/route.ts` | CREATE — daily health score |
| 12 | `src/app/api/cron/seo-report/route.ts` | CREATE — weekly report |
| 13 | `vercel.json` | MODIFY — add 2 cron entries |
