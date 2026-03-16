# Blog Auto-Publisher System Design

**Date**: 2026-03-16
**Status**: Approved
**Deliverables**: TG-99 n8n workflow + BlogContent.tsx pagination fix

---

## Problem

The Vercel cron at `/api/cron/blog-generator` has **never fired** because the project defines 42 cron jobs but the Vercel plan only supports a handful. Result: only 8 seed posts exist (all from March 6), zero auto-generated posts.

Additionally, the blog listing page (`BlogContent.tsx`) loads all posts with no pagination — unsustainable at scale.

## Solution

Replace the broken Vercel cron with an **n8n workflow (TG-99)** that runs 3x/week and auto-publishes AI-generated blog posts. Add pagination to the blog listing page.

---

## Deliverable 1: TG-99 Blog Auto-Publisher (n8n Workflow)

### Schedule

- **Frequency**: Mon / Wed / Fri at 3pm UTC (10am Central Time)
- **Cron expression**: `0 15 * * 1,3,5`
- **Rationale**: 3 posts/week builds a content moat (150+ posts/year). 10am CT is peak engagement for local service businesses.

### Architecture (9 nodes)

```
[1] Schedule Trigger (Mon/Wed/Fri 10am CT)
    |
[2] Fetch Existing Posts (Supabase GET)
    |
[3] Pick Topic (Code node)
    |
[4] Generate Article (HTTP POST -> Claude API)
    |
[5] Validate + Structure (Code node)
    |
[6] Publish to Supabase (HTTP POST)
    |
[7] Ping IndexNow (HTTP POST, best-effort)
    |
[8] Log to automation_runs (Supabase POST)
    |
[9] SMS Notification (Twilio HTTP POST)
```

### Node Details

#### [1] Schedule Trigger
- Type: `n8n-nodes-base.scheduleTrigger` v1.2
- Cron: `0 15 * * 1,3,5`

#### [2] Fetch Existing Posts
- Type: `n8n-nodes-base.httpRequest` v4.2
- Method: GET
- URL: `={{$vars.TG_SUPABASE_URL}}/rest/v1/blog_posts?select=slug,category&status=eq.published`
- Headers:
  - `apikey`: `={{$vars.TG_SUPABASE_ANON_KEY}}`
  - `Authorization`: `=Bearer {{$vars.TG_SUPABASE_SERVICE_KEY}}`

#### [3] Pick Topic (Code Node)
- 4-season model (fixes current 3-season bug):
  - Spring: Mar 15 - Jun 14
  - Summer: Jun 15 - Sep 14
  - Fall: Sep 15 - Nov 14
  - Winter: Nov 15 - Mar 14
- Topic bank: 60+ topics across 5 categories (seasonal-tips, service-guides, local-guides, how-to, faq-answers)
- Category balancing: pick from least-covered category
- Dedup: filter out already-published slugs
- Random selection within bucket for variety
- If all topics exhausted: return `{ stop: true }` to halt workflow

#### [4] Generate Article (Claude API)
- Type: `n8n-nodes-base.httpRequest` v4.2
- Method: POST
- URL: `https://api.anthropic.com/v1/messages`
- Headers:
  - `x-api-key`: `={{$vars.TG_ANTHROPIC_API_KEY}}`
  - `anthropic-version`: `2023-06-01`
  - `Content-Type`: `application/json`
- Body:
  - `model`: `claude-sonnet-4-6`
  - `max_tokens`: 4096
  - `system`: TotalGuard blog writer system prompt (1200-1500 words, HTML, Madison-specific, internal service links)
  - `messages`: User prompt with topic, category, keywords, season, month
  - Response format: JSON with title, slug, excerpt, content, meta_title, meta_description, keywords

#### [5] Validate + Structure (Code Node)
Quality gates:
- Parse JSON from Claude response (handle code fences, extract from braces)
- Word count >= 800 (reject thin content)
- Title <= 65 chars
- Meta description <= 155 chars
- Slug uniqueness check against fetched list
- Calculate reading_time (words / 200, ceil)
- Append slug suffix if duplicate detected
- Set: `ai_generated=true`, `ai_model='claude-sonnet-4-6'`, `ai_generated_at=now()`
- If validation fails: return `{ error: true, reason: '...' }`

#### [6] Publish to Supabase
- Type: `n8n-nodes-base.httpRequest` v4.2
- Method: POST
- URL: `={{$vars.TG_SUPABASE_URL}}/rest/v1/blog_posts`
- Headers:
  - `apikey`: `={{$vars.TG_SUPABASE_ANON_KEY}}`
  - `Authorization`: `=Bearer {{$vars.TG_SUPABASE_SERVICE_KEY}}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- Body fields:
  - `title`, `slug`, `excerpt`, `content`, `category`
  - `keywords` (array), `meta_title`, `meta_description`
  - `reading_time`, `reading_time_minutes`, `word_count`
  - `status`: `published`
  - `published_at`: current ISO timestamp
  - `author`: `TotalGuard Yard Care`
  - `ai_generated`: `true`
  - `ai_model`: `claude-sonnet-4-6`
  - `ai_generated_at`: current ISO timestamp

#### [7] Ping IndexNow
- Type: `n8n-nodes-base.httpRequest` v4.2
- Method: POST
- URL: `https://api.indexnow.org/indexnow`
- Body: `{ host: "tgyardcare.com", key: "tg2026indexnow8x4k", urlList: ["https://tgyardcare.com/blog/{slug}"] }`
- Continue on fail: YES (best-effort, known 403 issue)

#### [8] Log to automation_runs
- Type: `n8n-nodes-base.httpRequest` v4.2
- Method: POST
- URL: `={{$vars.TG_SUPABASE_URL}}/rest/v1/automation_runs`
- Body:
  - `automation_slug`: `blog-auto-publisher`
  - `status`: `success` (or `error` from error branch)
  - `result_summary`: `Published: {title} ({wordCount} words, {category})`
  - `pages_affected`: `1`
  - `started_at`: workflow start time
  - `completed_at`: current time

#### [9] SMS Notification
- HTTP POST to Twilio API (or reuse existing n8n Twilio pattern from TG-85/88/94)
- Message: `New blog published: "{title}" - tgyardcare.com/blog/{slug}`
- To: owner phone number

### Error Handling

- **IF node after [3]**: If `stop: true` (topics exhausted), log "all topics published" to automation_runs and end
- **IF node after [4]**: If Claude API returns non-200, log error to automation_runs and end
- **IF node after [5]**: If validation fails (thin content, parse error), log error with reason and end
- **Workflow-level retry**: 1 retry with 5-minute delay
- **Error workflow**: Catches unhandled errors, logs to automation_runs with `status: 'error'`

### Topic Bank

5 categories, 60+ topics:

| Category | Topics | Season Filter |
|----------|--------|---------------|
| seasonal-tips | 16 (4 per season) | Season-specific |
| service-guides | 10 (aeration, mulching, gutter guards, weed control, etc.) | All seasons |
| local-guides | 24 (2 per city x 12 cities) | All seasons |
| how-to | 6 (bare spots, soil testing, mower blades, etc.) | Mixed |
| faq-answers | 6 (mowing frequency, costs, timing, etc.) | All seasons |

Service areas: Madison, Middleton, Waunakee, Monona, Sun Prairie, Fitchburg, Verona, McFarland, Cottage Grove, DeForest, Oregon, Stoughton.

### System Prompt (Claude)

Same proven prompt from blog-generator/route.ts:
- Professional blog writer for TotalGuard Yard Care, Madison WI
- 1200-1500 words, HTML formatting (h2, h3, p, ul, li, blockquote, strong, em)
- No H1 (title rendered separately)
- Madison/Wisconsin/Dane County local details required
- Internal service links to 15 service pages
- Closing "Need professional help?" section with TotalGuard CTA
- 8th grade reading level
- JSON output: title, slug, excerpt, content, meta_title, meta_description, keywords

---

## Deliverable 2: Blog Pagination

### Current State
- `BlogContent.tsx` is a client component (`'use client'`)
- Fetches ALL published posts with no `.limit()` or `.range()`
- Renders in a 3-column grid (1/2/3 cols responsive)
- At 3 posts/week, this becomes 150+ posts on one page by December

### Changes
- Add `page` state derived from URL search params (default 1)
- Query with `.range(offset, offset + 8)` for 9 posts per page
- Add `.count('exact')` to get total post count
- Calculate total pages: `Math.ceil(totalCount / 9)`
- Render pagination UI at bottom:
  - Previous / Next buttons
  - Page number indicators
  - Disabled states at boundaries
- URL updates: `/blog?page=2` via `useSearchParams`
- Skeleton loading maintained during page transitions

---

## Credentials (all verified existing in n8n $vars)

| Variable | Purpose |
|----------|---------|
| `$vars.TG_SUPABASE_URL` | Supabase project URL |
| `$vars.TG_SUPABASE_ANON_KEY` | Supabase anon key (apikey header) |
| `$vars.TG_SUPABASE_SERVICE_KEY` | Supabase service role key (Authorization header) |
| `$vars.TG_ANTHROPIC_API_KEY` | Claude API key |

SMS credentials: reuse existing Twilio pattern from TG-85/88/94 workflows.

---

## What This Replaces

| Old (Vercel Cron) | New (n8n TG-99) |
|-------------------|------------------|
| Never fires (plan limit) | Always fires (n8n has no cron limits) |
| 1x/week | 3x/week |
| 3-season model (no spring) | 4-season model |
| Silent failures | n8n execution logs + SMS notification |
| No retry | Auto-retry with 5min delay |
| Wrong automation_runs columns | Correct columns |
| No AI tracking fields | Sets ai_generated, ai_model, ai_generated_at |
| All posts on one page | 9 per page with pagination |

---

## Out of Scope

- GBP auto-posting (separate workflow, pending verification)
- Social media auto-posting (separate workflow per user request)
- Content calendar UI / editorial dashboard
- Removing the old Vercel cron from vercel.json (can clean up later)
