---
phase: 03-seo-domination
plan: 01
subsystem: database, automation
tags: [supabase, n8n, gsc, google-search-console, seo, cron]

# Dependency graph
requires:
  - phase: 02-crm-unification
    provides: Supabase infrastructure, n8n deployment patterns, unified sender workflows
provides:
  - index_coverage_log table for index monitoring (TG-100)
  - seo_content_gaps table for gap detection (TG-99)
  - TG-96 daily GSC sync workflow (data foundation for all Phase 3 workflows)
affects: [03-02 (rank drop detection), 03-03 (gap analysis), 03-04 (index monitoring), 03-05 (weekly summary)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GSC searchAnalytics API with separate page and query dimension pulls"
    - "2-day lag sync date for GSC final data"
    - "Code node placeholder for sub-workflows not yet deployed"

key-files:
  created:
    - automation/migrations/071_seo_monitoring_tables.sql
    - automation/n8n-workflows/TG-96-gsc-daily-sync.json
  modified: []

key-decisions:
  - "Migration numbered 071 (after 070 revenue engine schema)"
  - "TG-97 placeholder uses Code node instead of executeWorkflow to allow activation before TG-97 exists"
  - "GSC Bearer token stays as placeholder — needs Google OAuth refresh token setup"
  - "Query-only sync sets page=null and device=null (matches COALESCE unique index)"

patterns-established:
  - "n8n activate endpoint: POST /api/v1/workflows/{id}/activate"
  - "Supabase Management API for SQL execution via access token"
  - "Phase 3 workflows use cron triggers (not webhook triggers)"

# Metrics
duration: 7min
completed: 2026-03-16
---

# Phase 3 Plan 1: GSC Data Foundation Summary

**Daily GSC sync workflow (TG-96) with index_coverage_log and seo_content_gaps tables — data spine for all SEO monitoring**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-16T07:41:24Z
- **Completed:** 2026-03-16T07:48:30Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Created index_coverage_log and seo_content_gaps tables in Supabase with RLS and unique indexes
- Built TG-96 daily GSC sync: fetches page-level and query-level data separately, upserts to existing gsc_pages and gsc_search_queries tables
- Deployed TG-96 to n8n (ID: Vt8uzm8RGy3QXv3B, ACTIVE, cron 0 11 * * *)
- TG-97 trigger placeholder ready for replacement once rank drop detector is built

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration for index_coverage_log and seo_content_gaps** - `547978e` (feat)
2. **Task 2: Build and deploy TG-96 GSC Daily Sync workflow** - `0afb539` (feat)

## Files Created/Modified
- `automation/migrations/071_seo_monitoring_tables.sql` - index_coverage_log + seo_content_gaps tables with RLS
- `automation/n8n-workflows/TG-96-gsc-daily-sync.json` - Daily GSC sync with page and query dimension pulls

## Decisions Made
- **Migration 071 naming**: Follows sequential numbering after 070 (revenue engine schema)
- **TG-97 Code node placeholder**: n8n refuses to activate workflows referencing unpublished sub-workflows, so TG-97 trigger uses a Code node that logs intent until TG-97 is deployed
- **GSC Bearer token as placeholder**: The deployed workflow has `GSC_BEARER_TOKEN_PLACEHOLDER` in GSC HTTP nodes — needs real Google OAuth token configured before first successful run
- **Null vs empty string for query-only sync**: Set page=null and device=null. The unique index uses COALESCE(page, '') and COALESCE(device, '') so nulls resolve to empty strings for uniqueness

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TG-97 executeWorkflow node replaced with Code placeholder**
- **Found during:** Task 2 (workflow activation)
- **Issue:** n8n API returned "Cannot publish workflow: Node Trigger TG-97 references workflow TG_97_WORKFLOW_ID_PLACEHOLDER which is not published"
- **Fix:** Replaced executeWorkflow node with Code node placeholder on deployed version. Local JSON retains executeWorkflow with placeholder ID for documentation.
- **Files modified:** Deployed workflow on n8n only (local JSON unchanged)
- **Verification:** Workflow activated successfully, confirmed active=true
- **Committed in:** 0afb539 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to allow activation. TG-97 placeholder will be swapped to executeWorkflow when TG-97 is deployed in plan 03-02.

## Issues Encountered
- Supabase CLI v2.78.1 lacks `db execute` command — used Management API (api.supabase.com) with access token instead
- n8n `active` field is read-only in PUT — activation requires POST to `/workflows/{id}/activate`

## n8n Workflow Reference
- **TG-96 workflow ID:** Vt8uzm8RGy3QXv3B
- **Status:** ACTIVE
- **Schedule:** Cron 0 11 * * * (6 AM CDT daily)
- **TG-97 placeholder:** Code node — replace with executeWorkflow when TG-97 is deployed

## User Setup Required
**GSC Bearer token must be configured** before TG-96 can successfully pull data. The deployed workflow uses `GSC_BEARER_TOKEN_PLACEHOLDER`. The owner needs to:
1. Set up Google OAuth credentials for Search Console API
2. Replace the placeholder in both "Fetch Page Data" and "Fetch Query Data" nodes on n8n

## Next Phase Readiness
- GSC data tables ready for all downstream workflows
- TG-96 active and will begin syncing once GSC token is configured
- TG-97 (rank drop detection) can now be built — it will receive trigger from TG-96

---
*Phase: 03-seo-domination*
*Completed: 2026-03-16*
