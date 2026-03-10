# Self-Healing SEO System v2 — "Can't Get Better" Design

**Date**: 2026-03-10
**Status**: Approved
**Predecessor**: `docs/plans/2026-03-09-self-healing-seo-design.md` (v1 — 3 crons, 2 fix types)
**Approach**: Unified Heal Pipeline — every cron feeds one queue, one healer fixes everything

## Problem

v1 detects 10 issue types but only auto-fixes 2 (thin_content, http_error). The other 8 are marked "unfixable." Meanwhile, 10 existing SEO crons (schema-validator, heading-auditor, image-alt-checker, etc.) detect additional problems but only log to `automation_runs` — they don't feed the heal pipeline. That's security cameras with no guards.

## Solution

1. **Upgrade seo-crawl** with 6 new detection checks (16 total issue types)
2. **Upgrade seo-heal** with 14 specific fix strategies (up from 2)
3. **Connect 7 existing crons** to also write to `seo_heal_queue`
4. **Add 2 new crons**: daily health score + weekly report
5. **Add 2 new Supabase tables**: `seo_health_scores`, `seo_weekly_reports`
6. **Apply existing `page_seo` migration** that was never deployed

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              DETECTION LAYER                         │
│                                                      │
│  PRIMARY (every 6h):                                 │
│    seo-crawl → 16 issue types → seo_heal_queue      │
│                                                      │
│  SUPPLEMENTARY (existing schedules):                 │
│    schema-validator    → schema_error                │
│    heading-auditor     → missing_h1, heading_order   │
│    image-alt-checker   → missing_alt                 │
│    content-freshness   → stale_content               │
│    internal-link-opt   → orphan_page                 │
│    sitemap-check       → sitemap_mismatch            │
│    nap-checker         → nap_mismatch                │
│                                                      │
│  ALL → seo_heal_queue (unified, deduped by url+type) │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│             HEALING LAYER (30min after crawl)         │
│                                                      │
│  seo-heal processes ALL issue types:                 │
│                                                      │
│  AUTO-FIXABLE (8 types):                             │
│    thin_content      → Claude expand to 1200+ words  │
│    http_error        → Smart redirect (Levenshtein)  │
│    soft_404          → Auto-noindex or Claude gen     │
│    slow_response     → Vercel revalidate cache purge │
│    broken_internal   → Auto-redirect nearest match   │
│    broken_external   → Remove dead href from content │
│    stale_content     → Claude refresh + update date  │
│    missing_alt       → Claude generate alt text      │
│                                                      │
│  LOGGED-ONLY (8 types):                              │
│    missing_title     → Resolve (false positive)      │
│    missing_meta_desc → Resolve (false positive)      │
│    missing_og        → Resolve (false positive)      │
│    missing_canonical → Resolve (false positive)      │
│    missing_schema    → Resolve (AutoSchema covers)   │
│    missing_h1        → Flag critical (code-level)    │
│    heading_order     → Flag critical (code-level)    │
│    duplicate_title   → Flag (hardcoded metadata)     │
│    orphan_page       → Flag + suggest links          │
│    nap_mismatch      → Flag critical (hardcoded)     │
│    sitemap_mismatch  → Flag (sitemap is dynamic)     │
│    schema_error      → Flag (schema components)      │
│    cwv_poor          → Cache purge + flag             │
│                                                      │
│  After each fix → IndexNow ping                      │
│  All actions → seo_heal_log (audit trail)            │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           REPORTING LAYER                            │
│                                                      │
│  seo-score  (daily 7am)  → health score 0-100       │
│  seo-report (Mon 8am)    → weekly digest to Supabase│
│  seo-ping   (daily 6am)  → IndexNow batch (existing)│
│                                                      │
│  All data → admin dashboard (existing)               │
└─────────────────────────────────────────────────────┘
```

## n8n Workflow Compatibility

The v2 design operates entirely within Vercel crons. The 80 n8n workflows (including 17 SEO-related) remain untouched:

| n8n Workflow | Vercel Equivalent | Relationship |
|-------------|-------------------|--------------|
| TG-47 IndexNow submitter | seo-ping | Complementary — n8n is on-demand, Vercel is batch |
| TG-50 Content refresher | seo-heal stale_content | Complementary — n8n weekly slow (Sonnet), Vercel 6h urgent (Haiku) |
| TG-52 Schema validator | schema-validator | Complementary — different pages, different tables |
| TG-54 AI meta generator | meta-gen | Complementary — both write page_seo, different schedules |
| TG-48 Citation monitor | citation-sync | Same purpose, different tables (seo_intelligence_log vs automation_runs) |

n8n writes to `seo_intelligence_log`. Vercel writes to `seo_heal_queue`/`automation_runs`. No table collisions.

## Issue Types — Complete Reference (16 types)

### Auto-Fixable (8 types)

| Issue Type | Detected By | Fix Strategy | Target |
|-----------|-------------|--------------|--------|
| `thin_content` | seo-crawl (blog < 800 words) | Claude Haiku expand to 1200+ words | blog_posts.content |
| `http_error` | seo-crawl (404/5xx) | Levenshtein redirect + parent section fallback | seo_redirects |
| `soft_404` | seo-crawl (< 100 words) | Blog category: resolve (already noindexed). Blog post: Claude generate. Other: flag. | blog_posts.content |
| `slow_response` | seo-crawl (> 3s) | On-demand revalidation via fetch to the URL with cache-bust. If 3+ consecutive: flag needs_review. | Vercel edge cache |
| `broken_internal_link` | seo-crawl (internal href → 404) | Same redirect logic as http_error — insert into seo_redirects | seo_redirects |
| `broken_external_link` | seo-crawl (outbound href → 404) | Strip `<a>` tag from blog_posts.content, keep link text. Non-blog: flag. | blog_posts.content |
| `stale_content` | content-freshness (> 180 days) | Claude refresh blog content with current info. Validate > 800 words. Update updated_at. | blog_posts.content |
| `missing_alt` | image-alt-checker (img without alt) | For blog images: Claude generate alt text from surrounding context. Non-blog: flag. | blog_posts.content |

### Logged-Only (8+ types)

| Issue Type | Detected By | Why Not Auto-Fixable | Action |
|-----------|-------------|---------------------|--------|
| `missing_title` | seo-crawl | All pages have hardcoded metadata. False positive from SSR HTML parsing. | Auto-resolve |
| `missing_meta_description` | seo-crawl | Same — all 76 pages have meta desc in metadata export. | Auto-resolve |
| `missing_og` | seo-crawl | All 53 public pages have OG tags (Phase 4 added them). | Auto-resolve |
| `missing_canonical` | seo-crawl | All pages have alternates.canonical in metadata. | Auto-resolve |
| `missing_schema` | seo-crawl | AutoSchema.tsx auto-generates WebPage + Breadcrumb for all pages. | Auto-resolve |
| `missing_h1` | heading-auditor | Code-level: H1 is in React component JSX. | Flag `needs_review` |
| `heading_order` | heading-auditor | Code-level: heading hierarchy in component tree. | Flag `needs_review` |
| `duplicate_title` | seo-crawl (new check) | Titles are hardcoded in page.tsx metadata exports. | Flag `needs_review` |
| `orphan_page` | internal-link-optimizer | Requires adding links to static page components. | Flag + log suggestion |
| `nap_mismatch` | nap-checker | NAP data is in schema-constants.ts (hardcoded). | Flag `needs_review` |
| `sitemap_mismatch` | sitemap-check | Sitemap is dynamically generated from routes. | Flag `needs_review` |
| `schema_error` | schema-validator | Schema is generated by factory functions. | Flag `needs_review` |
| `cwv_poor` | seo-crawl (CrUX API) | Core Web Vitals require code optimization. | Cache purge + flag |

## New seo-crawl Checks (added to existing 10)

1. **Broken external links** — For each page, extract all outbound `<a href>` pointing outside tgyardcare.com. HEAD-check each (with 5s timeout). Queue failures as `broken_external_link`.

2. **Duplicate title/description** — After crawling all pages, compare title+description pairs. If any two pages share the same title, queue both as `duplicate_title`.

3. **Content freshness** — Check `Last-Modified` header. If > 180 days old (or missing), queue as `stale_content` for blog URLs.

4. **Core Web Vitals** — For 5 key pages, call Chrome UX Report (CrUX) API. If LCP > 2.5s or CLS > 0.1, queue as `cwv_poor`. (Requires no API key — CrUX is free.)

5. **H1 count check** — Count `<h1>` tags in HTML. If != 1, queue as `missing_h1` (0 H1s) or `heading_order` (multiple H1s).

6. **Image alt coverage** — Count `<img>` tags without `alt` attribute. If any found in blog pages, queue as `missing_alt`.

## Existing Crons — Queue Integration (7 crons get ~10 lines added each)

Each cron keeps its existing behavior (log to automation_runs) and ALSO writes to `seo_heal_queue`:

| Cron | New Queue Write | Issue Type |
|------|----------------|------------|
| schema-validator | Schema errors detected | `schema_error` |
| heading-auditor | H1 violations | `missing_h1`, `heading_order` |
| image-alt-checker | Missing alt text | `missing_alt` |
| content-freshness | Stale pages (90d+) | `stale_content` |
| internal-link-optimizer | Orphan pages (< 2 incoming) | `orphan_page` |
| sitemap-check | Broken sitemap URLs | `sitemap_mismatch` |
| nap-checker | NAP inconsistencies | `nap_mismatch` |

## New Cron Routes (2)

### `api/cron/seo-score` — Daily at 7am

Computes site-wide SEO health score:

```
score = (
  (pages_no_issues / total_pages) * 40 +      // Issue-free ratio (40%)
  (avg_speed_score / 100) * 20 +               // Performance (20%)
  (pages_with_schema / total_pages) * 15 +     // Schema coverage (15%)
  (images_with_alt / total_images) * 10 +      // Accessibility (10%)
  (pages_with_internal_links / total) * 10 +   // Link health (10%)
  (fresh_pages / total_pages) * 5              // Freshness (5%)
)
```

Reads from: `seo_heal_queue` (issue counts), `automation_runs` (latest audit data)
Writes to: `seo_health_scores` (daily snapshot)

### `api/cron/seo-report` — Weekly Monday 8am

Aggregates the week's activity:
- Issues detected (by type)
- Issues auto-fixed (by type)
- Health score trend (7-day)
- Top 5 problematic pages
- Redirects created
- Content expanded/refreshed

Reads from: `seo_heal_queue`, `seo_heal_log`, `seo_health_scores`, `seo_redirects`
Writes to: `seo_weekly_reports`

## New Database Tables (2)

### `seo_health_scores`
```sql
create table seo_health_scores (
  id uuid default gen_random_uuid() primary key,
  score_date date not null unique,
  overall_score numeric(5,2) not null,
  total_pages int not null,
  pages_passing int not null,
  issues_by_type jsonb default '{}',
  component_scores jsonb default '{}',
  created_at timestamptz default now()
);
```

### `seo_weekly_reports`
```sql
create table seo_weekly_reports (
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
```

Both tables: RLS enabled, service role full access policy.

## Existing Migration to Apply

`supabase/migrations/20260303_page_seo_columns.sql` adds `seo_score`, `audit_issues`, `audited_at`, `suggested_meta_description`, `schema_data`, `needs_refresh` columns to `page_seo` table. This migration was NEVER applied. It must be applied for the `stale_content` fix to read `needs_refresh` and for `meta-gen` integration.

## vercel.json Additions

```json
{ "path": "/api/cron/seo-score",  "schedule": "0 7 * * *"   },
{ "path": "/api/cron/seo-report", "schedule": "0 8 * * 1"   }
```

Total crons: 42 (up from 40)

## File Changes Summary

| Category | Files | Action |
|----------|-------|--------|
| seo-crawl upgrade | 1 | Add 6 new checks (external links, duplicates, freshness, CWV, H1, alt) |
| seo-heal upgrade | 1 | Replace catch-all "unfixable" with 14 specific handlers |
| Existing cron upgrades | 7 | Add ~10 lines each to write to seo_heal_queue |
| New cron routes | 2 | seo-score, seo-report |
| New migration | 1 | seo_health_scores + seo_weekly_reports tables |
| Apply existing migration | 1 | page_seo columns (20260303) |
| vercel.json | 1 | Add 2 cron entries |
| **Total files touched** | **13** | |

## Success Criteria

1. All 16 issue types detected and processed (8 auto-fixed, 8 flagged)
2. Health score computed daily and trending upward
3. Weekly report generated every Monday
4. Zero manual SEO maintenance required
5. All existing crons continue working unchanged (additive changes only)
6. n8n workflows unaffected
7. Build passes with no errors
8. Complete audit trail in seo_heal_log for every action

## Env Vars Required

All already exist:
- `ANTHROPIC_API_KEY` — Claude content expansion/generation
- `CRON_SECRET` — Cron authentication
- `INDEXNOW_KEY` — IndexNow pinging
- `SUPABASE_SERVICE_ROLE_KEY` — DB writes
- `NEXT_PUBLIC_SUPABASE_URL` — DB connection
- `NEXT_PUBLIC_SITE_URL` — Site URL for crawling

No new env vars needed.
