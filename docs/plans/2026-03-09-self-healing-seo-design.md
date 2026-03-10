# Self-Healing SEO System — Design Document

**Date**: 2026-03-09
**Status**: Approved
**Approach**: Pipeline Architecture (3 crons in sequence)

## Problem

Google Search Console flags issues (soft 404s, thin content, missing metadata, broken links) that require manual detection and fixing. The site has 72+ URLs and 30 existing SEO crons, but none of them detect AND fix problems autonomously.

## Solution

A fully automated self-healing pipeline that crawls the site, detects SEO issues, fixes them without human intervention, and pings Google to recrawl. Zero manual work. Everything logged to Supabase for the admin dashboard.

## Architecture

```
sitemap.xml (72 URLs)
       │
       ▼
┌──────────────┐   every 6h    ┌──────────────────┐
│  seo-crawl   │──────────────▶│  seo_heal_queue   │
│  (detector)  │               │  (Supabase table)  │
└──────────────┘               └────────┬───────────┘
                                        │
                               30min later
                                        │
                                        ▼
                               ┌──────────────┐
                               │   seo-heal   │──▶ Claude API (expand content)
                               │   (fixer)    │──▶ seo_redirects table
                               └──────┬───────┘──▶ blog_posts table (updates)
                                      │          ──▶ IndexNow (per-fix ping)
                                      │
                                      ▼
                               ┌──────────────────┐
                               │  seo_heal_log    │
                               │  (audit trail)    │
                               └──────────────────┘

┌──────────────┐   daily 6am
│  seo-ping    │──────────────▶ IndexNow batch (all 72 URLs)
│  (recrawl)   │
└──────────────┘
```

## Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Timing | Hybrid — crawl every 6h, batch ping daily | Critical issues caught fast, daily ping keeps Google fresh |
| Thin content fix | Expand existing content via Claude | Preserves backlinks and existing rankings at that URL |
| 404 redirect strategy | Smart match first, parent section fallback | Captures maximum link equity |
| Data store | Supabase (existing) | Already connected, admin dashboard reads from it |
| Notification | None — auto-fix + log | User explicitly requested zero manual work, no alerts |

## Cron Route Specifications

### 1. `api/cron/seo-crawl` — Every 6 hours

**Purpose**: Detect SEO issues across all public pages.

**Process**:
1. Fetch live sitemap from `https://tgyardcare.com/sitemap.xml`
2. For each URL, fetch with `HEAD` first (status code), then `GET` for content analysis
3. Check each page for:
   - HTTP status (404, 5xx, redirect chains)
   - `<title>` tag exists and is non-empty
   - `<meta name="description">` exists and is non-empty
   - `og:title` and `og:description` present
   - Canonical URL present and matches the page URL
   - JSON-LD `<script type="application/ld+json">` present
   - Word count for `/blog/*` pages (minimum 800 words)
   - Response time (flag if > 3 seconds)
   - Internal links — check all `<a href>` pointing to tgyardcare.com resolve
4. For each issue found, upsert into `seo_heal_queue` (deduplicate by url + issue_type)
5. Auto-close queue items where the issue no longer exists (page was fixed externally)
6. Log run summary to `automation_runs`

**Issue Types Detected**:
- `http_error` — 404, 5xx status codes
- `soft_404` — 200 status but < 100 words of visible content
- `thin_content` — Blog post under 800 words
- `missing_title` — No `<title>` tag
- `missing_meta_description` — No meta description
- `missing_og` — Missing OpenGraph tags
- `missing_canonical` — No canonical URL
- `missing_schema` — No JSON-LD on page
- `slow_response` — Response time > 3 seconds
- `broken_internal_link` — Internal link returns 404

### 2. `api/cron/seo-heal` — Every 6 hours (30min offset)

**Purpose**: Auto-fix all pending issues in the queue.

**Fix Strategies by Issue Type**:

| Issue Type | Auto-Fix Action |
|------------|----------------|
| `thin_content` | Send existing content to Claude Haiku: "Expand this blog post to 1200+ words. Keep the same topic, tone, and structure. Add more depth, examples, and Madison WI local context." Update `blog_posts.content` in Supabase. |
| `http_error` (404) | Check if URL matches a known pattern. Smart redirect: fuzzy match against all sitemap URLs using Levenshtein distance. If match score > 0.6, redirect there. Else redirect to parent section (`/services/*` → `/services`). Write to `seo_redirects` table. |
| `soft_404` | If blog category with 0 posts → mark as `unfixable` (already handled by noindex). If other page → log for review. |
| `missing_title` / `missing_meta_description` / `missing_og` | These are code-level (Next.js metadata). Mark as `unfixable` with details. The crawl detection itself is the value — visible in admin dashboard. |
| `missing_schema` | Mark as `unfixable` — schema is generated by code components. |
| `missing_canonical` | Mark as `unfixable` — requires code change. |
| `slow_response` | Mark as `unfixable` — infrastructure/code optimization needed. |
| `broken_internal_link` | Log the source page and broken href. Mark as `needs_review`. |

**After each fix**:
1. Update queue item: `status = 'fixed'`, `fixed_at = now()`
2. Write to `seo_heal_log` with `before_state` and `after_state`
3. Ping IndexNow for the fixed URL immediately

### 3. `api/cron/seo-ping` — Daily at 6am

**Purpose**: Force Google to recrawl the entire site.

**Process**:
1. Fetch all URLs from sitemap
2. Batch submit to IndexNow API (max 10,000 URLs per request)
3. Log submission count to `automation_runs`

## Database Schema

### `seo_heal_queue`
```sql
create table seo_heal_queue (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  issue_type text not null,
  severity text not null default 'standard',
  details jsonb default '{}',
  status text not null default 'pending',
  fixed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(url, issue_type)
);
```

### `seo_heal_log`
```sql
create table seo_heal_log (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  url text not null,
  issue_type text,
  before_state jsonb default '{}',
  after_state jsonb default '{}',
  created_at timestamptz default now()
);
```

### `seo_redirects`
```sql
create table seo_redirects (
  id uuid default gen_random_uuid() primary key,
  source_path text not null unique,
  destination_path text not null,
  status_code int default 301,
  created_by text default 'seo-heal',
  hit_count int default 0,
  created_at timestamptz default now()
);
```

## Middleware Enhancement

`middleware.ts` gains a dynamic redirect lookup:
1. If request path doesn't match any app route → check `seo_redirects` table
2. If match found → return 301 redirect to `destination_path`, increment `hit_count`
3. Cache redirects in-memory for 5 minutes to avoid DB calls on every request
4. Existing 410 Gone patterns and www→non-www redirect take priority (run first)

## vercel.json Additions

```json
{ "path": "/api/cron/seo-crawl", "schedule": "0 */6 * * *" },
{ "path": "/api/cron/seo-heal", "schedule": "30 */6 * * *" },
{ "path": "/api/cron/seo-ping", "schedule": "0 6 * * *" }
```

## Environment Variables Required

- `ANTHROPIC_API_KEY` — For Claude content expansion (already exists for blog-generator)
- `CRON_SECRET` — For cron authentication (already exists)
- `INDEXNOW_KEY` — For IndexNow pinging (already exists)
- `SUPABASE_SERVICE_ROLE_KEY` — For DB writes (already exists)

No new env vars needed.

## Admin Dashboard Integration

The existing admin SEO pages (`/admin/seo`, `/admin/site-health`) will read from:
- `seo_heal_queue` — Show pending issues, issue breakdown by type
- `seo_heal_log` — Show recent auto-fix actions with before/after
- `seo_redirects` — Show auto-created redirects with hit counts

New admin widget: **SEO Health Score** = (pages passing all checks / total pages) * 100

## Success Criteria

1. Zero manual SEO maintenance required
2. All 72+ sitemap URLs pass all checks within 24h of deployment
3. Thin blog posts auto-expanded to 1200+ words
4. 404s from external links auto-redirected within 6 hours
5. Google recrawl triggered daily via IndexNow
6. Complete audit trail in Supabase for every action taken
7. Admin dashboard shows real-time health score
