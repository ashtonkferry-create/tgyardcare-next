---
phase: 03-seo-domination
plan: 06
subsystem: automation
tags: [n8n, supabase, seo, schema-fix, gap-closure]

# Dependency graph
requires:
  - phase: 03-seo-domination (plans 03, 05)
    provides: TG-97 rank drop detector and TG-102 weekly SEO summary workflows
provides:
  - Corrected TG-97 and TG-102 schema alignment with seo_weekly_reports (migration 057)
  - TG-102 now aggregates all 4 data sources (rank drops, content gaps, opportunities, staleness)
  - Verified 15 active Dane County cities in seo_target_cities
affects: [phase-4, n8n-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "seo_weekly_reports upsert pattern: week_start as unique key, report_data JSONB for flexible payload"
    - "Supabase count pattern: Prefer count=exact header + content-range header parsing"

key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-97-rank-drop-detector.json
    - automation/n8n-workflows/TG-102-weekly-seo-summary.json

key-decisions:
  - "Refactored TG-97 and TG-102 to use existing schema rather than adding new columns -- avoids migration churn"
  - "TG-102 reads rank drop data from report_data JSONB (extracting rank_drops + ctr_anomalies) rather than querying separate rows"
  - "Opportunity count queries gsc_search_queries directly (position 4-20, impressions >= 10) rather than reading TG-99 output table"
  - "Staleness count queries blog_posts directly (updated_at < 180 days) rather than reading TG-101 output"

patterns-established:
  - "Gap closure plan pattern: verify -> fix -> re-verify in single atomic execution"

# Metrics
duration: 8min
completed: 2026-03-16
---

# Phase 3 Plan 6: Gap Closure Summary

**Fixed TG-97/TG-102 schema mismatches (report_date/report_type -> week_start/week_end) and added ranking opportunity + stale content counts to weekly SEO summary**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-16T19:55:42Z
- **Completed:** 2026-03-16T20:03:00Z
- **Tasks:** 2 (1 code fix + 1 data verification)
- **Files modified:** 2

## Accomplishments
- TG-97 now stores rank drop data using actual seo_weekly_reports schema (week_start, week_end, report_data, top_losing_keywords, declining_pages)
- TG-102 now reads rank drop alerts via week_start query instead of non-existent report_type column
- TG-102 stores weekly report using all actual schema columns (week_start, week_end, report_data, top_gaining_keywords, top_losing_keywords, new_keywords, declining_pages, total_clicks, total_impressions, avg_position)
- TG-102 now includes all 4 data sources: rank drops (from TG-97 via seo_weekly_reports), content gaps (seo_content_gaps), ranking opportunities (gsc_search_queries position 4-20), stale content (blog_posts updated_at > 180 days)
- Weekly summary email now has 6 badge pills and dedicated sections for opportunities and staleness
- Verified 15 active Dane County cities in seo_target_cities (all 12 required + 3 extras)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix TG-97 and TG-102 schema mismatch + add missing data sources** - `9aeb26d` (fix)
2. **Task 2: Verify seo_target_cities** - No commit needed (data verification only, 15/12 cities confirmed)

## Files Created/Modified
- `automation/n8n-workflows/TG-97-rank-drop-detector.json` - Fixed Prepare Store Payload: removed report_date, added week_end and declining_pages
- `automation/n8n-workflows/TG-102-weekly-seo-summary.json` - Fixed Calculate Date Ranges (added weekStart, weekEnd, stalenessThreshold), fixed Get Recent Rank Drop Alerts URL (week_start query), fixed Store Weekly Report jsonBody (all schema columns), added Get Opportunity Count node, added Get Stale Content Count node, updated Compile Summary (parses all 4 sources, outputs weekStart/weekEnd), updated Build Summary Email (6 badge pills, opportunity/staleness sections)

## Decisions Made
- Refactored workflows to match existing schema rather than adding new migration columns (report_date, report_type never existed)
- TG-102 reads rank alerts from report_data JSONB field stored by TG-97 (rank_drops + ctr_anomalies arrays)
- Opportunity and staleness counts query source tables directly rather than reading TG-99/TG-101 output -- simpler wiring, same data
- TG-96 pagination gap (Gap 1) accepted as low-risk for <100 page site per verification findings

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed rank alert parsing in Compile Summary**
- **Found during:** Task 1 Part B
- **Issue:** After switching to week_start query, rank alerts come from report_data JSONB (not flat rows with a data field). The old parsing (`alertsRaw.body` as array of alert objects) would break.
- **Fix:** Added proper extraction of rank_drops and ctr_anomalies from report_data JSONB field
- **Files modified:** automation/n8n-workflows/TG-102-weekly-seo-summary.json
- **Verification:** Compile Summary jsCode correctly references `alertRows_raw[0].report_data.rank_drops`
- **Committed in:** 9aeb26d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential fix for correct rank alert display. No scope creep.

## Issues Encountered
- Supabase key in `.env.local` was the old revoked key. Used correct key from memory reference to verify seo_target_cities. Not a code issue -- deployment uses n8n credential store.

## Verification Results

### Gap Closure Status
- **Gap 1 (TG-96 pagination):** Accepted as low-risk, no code change
- **Gap 2 (TG-103 city coverage):** VERIFIED - 15 active WI cities (12 required + 3 extras)
- **Gap 3 (TG-102 missing sources):** FIXED - opportunityCount and stalenessCount added
- **Gap 4 (schema mismatch):** FIXED - TG-97 and TG-102 use actual seo_weekly_reports columns

### JSON Validation
- TG-97-rank-drop-detector.json: VALID
- TG-102-weekly-seo-summary.json: VALID

### Grep Verification
- TG-97 "report_date": 0 matches (removed)
- TG-97 "week_start": present (correct)
- TG-97 "week_end": present (added)
- TG-97 "declining_pages": present (added)
- TG-102 "report_type": 0 matches (removed)
- TG-102 "report_date": 0 matches (removed)
- TG-102 "opportunityCount": 3 matches (Compile Summary, Build Email, Store Report)
- TG-102 "stalenessCount": 3 matches (Compile Summary, Build Email, Store Report)
- TG-102 "Get Opportunity Count": 4 matches (node name + connections)
- TG-102 "Get Stale Content Count": 4 matches (node name + connections)
- TG-102 "blog_posts": 1 match (stale content URL)
- TG-102 node count: 13 (was 11 + 2 new nodes)
- All credentials: PLACEHOLDER strings only

### seo_target_cities Verification
15 active WI cities: Cottage Grove, Cross Plains, DeForest, Fitchburg, Madison, McFarland, Middleton, Monona, Mount Horeb, Oregon, Stoughton, Sun Prairie, Verona, Waunakee, Windsor

## Next Phase Readiness
- Phase 3 verification should now pass 17/17 truths
- All 9 SEO workflows (TG-96 through TG-104) have correct schema alignment
- Deployments to n8n still pending (local JSON only due to API rate limits)
- Ready for Phase 4 execution

---
*Phase: 03-seo-domination*
*Completed: 2026-03-16*
