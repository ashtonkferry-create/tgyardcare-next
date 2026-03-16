---
phase: 03-seo-domination
plan: 04
subsystem: automation
tags: [n8n, gsc, seo, content-gaps, ranking-opportunities, staleness, email-reports]

# Dependency graph
requires:
  - phase: 03-01
    provides: gsc_pages, gsc_search_queries, seo_content_gaps tables, TG-96 daily GSC sync
  - phase: 02-04
    provides: TG-95 unified email sender (IUDLrQrAkcLFLsIC)
provides:
  - TG-98 content gap detector workflow
  - TG-99 ranking opportunity detector workflow
  - TG-101 content staleness checker workflow
  - Weekly SEO intelligence email reports
affects: [03-05, content-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GSC query-only dimension fetch for content gap analysis"
    - "GSC query+page dimension fetch for ranking opportunity detection"
    - "fullResponse:true on all Supabase GET nodes"
    - "Parallel fetch pattern (multiple HTTP nodes from single trigger)"
    - "Skip-email pattern with IF node for empty results"

key-files:
  created:
    - automation/n8n-workflows/TG-98-content-gap-detector.json
    - automation/n8n-workflows/TG-99-ranking-opportunity-detector.json
    - automation/n8n-workflows/TG-101-content-staleness-checker.json
  modified: []

key-decisions:
  - "TG-99 is report-only (no storage) since opportunities target existing pages, not new content"
  - "TG-98 uses query-only GSC dimension; TG-99 uses query+page to identify which page ranks"
  - "Content gap matching: slug-based path matching + blog keyword/title fuzzy matching"
  - "TG-101 queries both blog_posts and seo_location_pages for comprehensive staleness detection"
  - "Staleness threshold: 180 days (6 months) calculated dynamically"

patterns-established:
  - "Weekly SEO report pattern: schedule -> fetch -> analyze -> build HTML -> IF check -> TG-95"
  - "Priority scoring: impressions * (1 - position/100) for gaps, impressions * (21 - position) for opportunities"

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 3 Plan 4: SEO Intelligence Workflows Summary

**Three weekly n8n workflows (TG-98, TG-99, TG-101) delivering content gap detection, ranking opportunity analysis, and staleness monitoring via HTML email reports through TG-95**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-16T07:53:08Z
- **Completed:** 2026-03-16T07:58:00Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments
- TG-98 identifies GSC queries with impressions but no dedicated page, upserts top 30 to seo_content_gaps
- TG-99 finds queries ranking 4-20 (quick-win optimization targets) with potential scoring
- TG-101 detects blog posts and location pages not updated in 6+ months
- All three send weekly HTML email reports via TG-95 (skip if no results)

## Schema Confirmation

**blog_posts** columns used: `id`, `title`, `slug`, `updated_at`, `status` (draft/scheduled/published), `category`, `target_keyword`

**seo_location_pages** columns used: `id`, `city`, `service_type`, `slug`, `updated_at`, `status` (draft/review/published/archived)

**seo_content_gaps** columns used: `query`, `impressions`, `clicks`, `avg_position`, `priority_score`, `has_dedicated_page`, `status`, `detected_at`

## Task Commits

Each task was committed atomically:

1. **Task 1: TG-98 Content Gap Detector** - `887c9da` (feat)
2. **Task 2: TG-99 Ranking Opportunity Detector** - `f51b2e1` (feat)
3. **Task 3: TG-101 Content Staleness Checker** - `4f90823` (feat)

## Files Created
- `automation/n8n-workflows/TG-98-content-gap-detector.json` - Weekly content gap detector (10 nodes, cron: 0 12 * * 1)
- `automation/n8n-workflows/TG-99-ranking-opportunity-detector.json` - Weekly ranking opportunity detector (7 nodes, cron: 0 12 * * 1)
- `automation/n8n-workflows/TG-101-content-staleness-checker.json` - Weekly staleness checker (7 nodes, cron: 0 5 * * 0)

## Decisions Made
- TG-99 is report-only (no DB storage) since these are optimization targets for existing pages, not new content gaps
- TG-98 priority_score formula: `impressions * (1 - position/100)` -- higher impressions at worse positions = bigger opportunity
- TG-99 potential_score formula: `impressions * (21 - position)` -- closer to top + more impressions = easier win
- Content gap detection uses slug path matching + blog keyword/title fuzzy matching to avoid false positives
- TG-101 fetches both blog_posts and seo_location_pages in parallel for efficiency
- All workflows skip email when no results found (no empty reports)

## Deviations from Plan

None - plan executed exactly as written.

**Note:** Existing `TG-99-blog-auto-publisher.json` is a separate workflow from a prior phase. The new `TG-99-ranking-opportunity-detector.json` coexists alongside it. The plan specified this filename explicitly.

## Issues Encountered
None

## User Setup Required
None - workflows use same PLACEHOLDER pattern as existing workflows. Real credentials injected at deploy time on n8n.

## Next Phase Readiness
- All three workflows ready for n8n import and activation
- Requires GSC Bearer token to be configured (same dependency as TG-96)
- TG-98 depends on TG-96 populating gsc_pages and gsc_search_queries data first
- Ready for 03-05 (remaining SEO workflows)

---
*Phase: 03-seo-domination*
*Completed: 2026-03-16*
