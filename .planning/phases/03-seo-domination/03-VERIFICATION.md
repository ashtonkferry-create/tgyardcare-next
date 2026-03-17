---
phase: 03-seo-domination
verified: 2026-03-16T08:38:44Z
status: gaps_found
score: 13/17 must-haves verified
gaps:
  - truth: "TG-96 paginates through results using startRow increments of 25000"
    status: failed
    reason: "startRow is hardcoded to 0 in both GSC fetch nodes. A comment acknowledges a loop should be added for >25K rows but no loop node exists."
    artifacts:
      - path: "automation/n8n-workflows/TG-96-gsc-daily-sync.json"
        issue: "Both Fetch Page Data and Fetch Query Data nodes have startRow hardcoded to 0. No loop node increments startRow."
    missing:
      - "A looping node that increments startRow by 25000 until rows returned < 25000"
      - "A conditional check: if rows.length equals 25000, fetch next page"
  - truth: "TG-103 reads seo_target_cities for all 12 Dane County cities"
    status: partial
    reason: "TG-103 queries seo_target_cities with active=eq.true. Whether all 12 cities have active=true is a data concern not verifiable from code alone."
    artifacts:
      - path: "automation/n8n-workflows/TG-103-city-content-generator.json"
        issue: "Query is ?active=eq.true. If any of the 12 cities are missing or have active=false, they will not be processed."
    missing:
      - "Human verification: confirm seo_target_cities has 12 active Dane County cities with active=true"
  - truth: "TG-102 aggregates data from TG-97, TG-98, TG-99, and TG-101 into a single weekly email"
    status: failed
    reason: "TG-102 does not include opportunity count from TG-99 or staleness count from TG-101. Two of four required sources are absent."
    artifacts:
      - path: "automation/n8n-workflows/TG-102-weekly-seo-summary.json"
        issue: "Compile Summary node has contentGapCount but no opportunityCount or stalenessCount. Spec requires aggregating all four workflow sources."
    missing:
      - "A fetch of ranking opportunities count written by TG-99"
      - "A fetch of staleness count written by TG-101"
      - "opportunityCount and stalenessCount in the summary email and stored report"
  - truth: "seo_weekly_reports table schema is compatible with TG-97 and TG-102 upserts and queries"
    status: failed
    reason: "The seo_weekly_reports table (migration 057) has no report_type or report_date columns. TG-97 and TG-102 store and query these non-existent columns, breaking rank alert persistence and lookup."
    artifacts:
      - path: "automation/n8n-workflows/TG-97-rank-drop-detector.json"
        issue: "Stores report_date field that does not exist in seo_weekly_reports."
      - path: "automation/n8n-workflows/TG-102-weekly-seo-summary.json"
        issue: "Stores report_date and report_type. Queries report_type=eq.rank_drop_alert. Neither field exists. Query always returns empty."
      - path: "automation/migrations/057_google_data_pipeline.sql"
        issue: "Actual schema has week_start, week_end, report_data, top_gaining/losing_keywords. No report_type or report_date columns."
    missing:
      - "Migration adding report_date DATE and report_type TEXT to seo_weekly_reports, OR"
      - "Updated TG-97 and TG-102 upsert payloads conforming to actual schema"
      - "Updated TG-102 rank drop fetch query to use actual schema fields"
---

# Phase 3: SEO Domination - Verification Report

**Phase Goal:** Build 9 n8n SEO monitoring workflows (TG-96 through TG-104) providing daily GSC data sync, rank drop detection, content gap analysis, ranking opportunities, content staleness checking, index coverage monitoring, city content generation, content quality checking, and weekly summary aggregation.
**Verified:** 2026-03-16T08:38:44Z
**Status:** gaps_found
**Re-verification:** No - initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1 | index_coverage_log and seo_content_gaps tables exist with correct schemas | VERIFIED | migration 071 creates both tables with correct columns and unique indexes |
| 2 | TG-96 pulls page-level and query-level GSC data for date 2 days ago | VERIFIED | Calculate Sync Date node: now minus 2 days in milliseconds |
| 3 | TG-96 upserts data without duplicating rows | VERIFIED | Both upsert nodes use Prefer: resolution=merge-duplicates |
| 4 | TG-96 paginates using startRow increments of 25000 | FAILED | startRow hardcoded to 0 in both GSC fetch nodes; no loop node exists |
| 5 | TG-96 triggers TG-97 via executeWorkflow after sync completes | VERIFIED | Final node is executeWorkflow with workflowId NPxVFCf05a15PjBH |
| 6 | TG-103 reads seo_target_cities for 12 Dane County cities and generates drafts for missing cities | PARTIAL | Reads active cities correctly; local detail map covers 12+ cities; 12-city completeness depends on DB data |
| 7 | Generated content references real local details (neighborhoods, parks, soil) | VERIFIED | Build City Prompt embeds per-city local details; prompt requires 3+ specific local references |
| 8 | Content saved as status=draft and ai_generated=true, never auto-published | VERIFIED | Save Draft node: status=draft, ai_generated=true; no auto-publish path exists |
| 9 | TG-104 validates drafts for word count 800+, local detail presence, no placeholder text | VERIFIED | Validate Quality checks word count, placeholder regex, H2 count, local term count, CTA |
| 10 | TG-104 flags low-quality drafts via email through TG-95 | VERIFIED | Build Quality Report Email feeds Send Report via TG-95 (IUDLrQrAkcLFLsIC) |
| 11 | TG-97 detects rank drops comparing current vs 7 days ago | VERIFIED | Calculates previousDate = currentDate minus 7 days; compares position delta |
| 12 | Rank drops >= 10 positions with >= 50 impressions trigger urgent SMS via TG-94 | VERIFIED | positionDrop >= 10 AND prev.impressions >= 50 sends SMS via TG-94 (AprqI2DgQA8lehij) |
| 13 | Rank drops 5-9 positions stored for weekly digest, no SMS | VERIFIED | warnings array collected; only urgentAlerts and ctrAnomalies go to the SMS branch |
| 14 | CTR anomaly (>30% drop, stable impressions) detected and included in alerts | VERIFIED | ctrDrop > 0.30 with >= 50 impressions both weeks; added to hasUrgent OR condition |
| 15 | TG-100 inspects pages via URL Inspection API weekly; deindex events trigger SMS; stored in index_coverage_log | VERIFIED | Uses urlInspection/index:inspect; PASS to FAIL triggers TG-94 SMS; upserts to index_coverage_log |
| 16 | TG-98 gaps stored with correct priority_score; TG-99 finds position 4-20; TG-101 identifies 6-month stale content; all email via TG-95 | VERIFIED | All three workflows confirmed substantive and wired to TG-95 |
| 17 | TG-102 aggregates all four sources into weekly email; stores to seo_weekly_reports; Monday 8 AM CT | FAILED | Missing TG-99 opportunity count and TG-101 staleness count; seo_weekly_reports schema mismatch |

**Score: 13/17 truths verified**

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| automation/migrations/071_seo_monitoring_tables.sql | VERIFIED | 65 lines; index_coverage_log and seo_content_gaps with unique indexes and RLS |
| automation/n8n-workflows/TG-96-gsc-daily-sync.json | PARTIAL | 233 lines; missing pagination loop for >25K rows |
| automation/n8n-workflows/TG-97-rank-drop-detector.json | PARTIAL | 251 lines; schema mismatch when storing to seo_weekly_reports |
| automation/n8n-workflows/TG-98-content-gap-detector.json | VERIFIED | 280 lines; all wiring correct |
| automation/n8n-workflows/TG-99-ranking-opportunity-detector.json | VERIFIED | 164 lines; all wiring correct |
| automation/n8n-workflows/TG-100-index-coverage-monitor.json | VERIFIED | 331 lines; full loop, deindex detection, SMS, storage wired |
| automation/n8n-workflows/TG-101-content-staleness-checker.json | VERIFIED | 192 lines; 180-day threshold; blog and location pages; TG-95 email |
| automation/n8n-workflows/TG-102-weekly-seo-summary.json | PARTIAL | 360 lines; missing opportunity and staleness counts; schema mismatch on upsert |
| automation/n8n-workflows/TG-103-city-content-generator.json | VERIFIED | 488 lines; reads seo_target_cities; generates with real local details; saves draft |
| automation/n8n-workflows/TG-104-content-quality-checker.json | VERIFIED | 224 lines; validates 800+ words, placeholders, H2 headings, local refs, CTA |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| TG-96 | TG-97 | executeWorkflow | WIRED | workflowId NPxVFCf05a15PjBH |
| TG-97 | TG-94 SMS | executeWorkflow | WIRED | workflowId AprqI2DgQA8lehij |
| TG-97 | seo_weekly_reports | HTTP POST | BROKEN | Stores report_date and report_type which do not exist in table schema |
| TG-98 | seo_content_gaps | HTTP POST merge-duplicates | WIRED | Upserts top 30 gaps with correct priority_score |
| TG-98 | TG-95 email | executeWorkflow | WIRED | workflowId IUDLrQrAkcLFLsIC |
| TG-99 | TG-95 email | executeWorkflow | WIRED | workflowId IUDLrQrAkcLFLsIC |
| TG-100 | index_coverage_log | HTTP POST merge-duplicates | WIRED | Unique constraint on page_url + check_date |
| TG-100 | TG-94 SMS | executeWorkflow | WIRED | workflowId AprqI2DgQA8lehij |
| TG-101 | TG-95 email | executeWorkflow | WIRED | workflowId IUDLrQrAkcLFLsIC |
| TG-102 | seo_weekly_reports write | HTTP POST | BROKEN | Stores report_date and report_type; actual schema needs week_start and week_end |
| TG-102 | seo_weekly_reports read rank drops | HTTP GET | BROKEN | Queries report_type=eq.rank_drop_alert; column does not exist; always empty |
| TG-102 | TG-95 email | executeWorkflow | WIRED | workflowId IUDLrQrAkcLFLsIC |
| TG-103 | seo_target_cities | HTTP GET | WIRED | active=true filter; table exists since migration 037 |
| TG-103 | Claude API | HTTP POST | WIRED | anthropic.com/v1/messages with claude-sonnet-4-6 |
| TG-103 | blog_posts save draft | HTTP POST | WIRED | status=draft, ai_generated=true |
| TG-103 | TG-104 | executeWorkflow | WIRED | Triggered from SplitInBatches done branch |
| TG-104 | TG-95 email | executeWorkflow | WIRED | workflowId IUDLrQrAkcLFLsIC |

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| TG-96-gsc-daily-sync.json | startRow hardcoded to 0; comment acknowledges missing pagination loop | Warning | Low risk for this small site but violates plan spec |
| TG-97-rank-drop-detector.json | Stores report_date and report_type fields that do not exist in seo_weekly_reports | Blocker | TG-102 rank drop lookup always returns empty; rank alert data not correctly persisted |
| TG-102-weekly-seo-summary.json | Queries report_type=eq.rank_drop_alert on a non-existent column | Blocker | Rank alert section in weekly email always empty regardless of actual rank drops |
| TG-102-weekly-seo-summary.json | OWNER_EMAIL_PLACEHOLDER in to_email field | Warning | Weekly summary sent to placeholder address unless TG-95 overrides it |

---

## Human Verification Required

### 1. seo_target_cities Data Check

**Test:** Query Supabase: SELECT city, active FROM seo_target_cities WHERE state = 'WI' ORDER BY city
**Expected:** 12 rows with active=true covering Madison, Middleton, Sun Prairie, Fitchburg, Verona, Monona, Waunakee, DeForest, Stoughton, Oregon, McFarland, Cottage Grove
**Why human:** Workflow logic is correct but depends on seed data in the table not verifiable from workflow JSON files alone.

### 2. TG-96 Pagination Risk Assessment

**Test:** Check unique page count: SELECT COUNT(DISTINCT page) FROM gsc_pages
**Expected:** Well under 25,000 unique pages for a local landscaping company
**Why human:** The missing pagination loop only matters if the site exceeds 25K GSC-indexed pages. Confirming page count removes practical risk uncertainty.

---

## Gaps Summary

Four gaps were identified. Two are blockers that break TG-102 core function. One is a spec violation with low practical risk. One requires data verification.

**Gap 1 - TG-96 missing pagination loop (low practical risk):** Both GSC fetch nodes have startRow hardcoded to 0. A comment in the workflow acknowledges a loop should be added for sites with more than 25K pages. For tgyardcare.com this threshold will almost certainly not be reached, but the spec required it.

**Gap 2 - TG-103 twelve-city coverage is a data dependency:** The workflow code is correct. The local details map inside Build City Prompt covers all 12+ Dane County cities with specific neighborhoods, parks, soil types, and quirks. Coverage depends on the seo_target_cities table having 12 rows with active=true.

**Gap 3 - TG-102 missing TG-99 and TG-101 aggregation:** The weekly summary includes gainers, losers, new keywords, lost keywords, and content gap count. It does not include a ranking opportunity count from TG-99 or a stale content count from TG-101. The spec explicitly requires aggregating all four workflow sources. Two of four sources are absent.

**Gap 4 - seo_weekly_reports schema mismatch (blocker):** The table in migration 057 has columns week_start, week_end, report_data, top_gaining_keywords, top_losing_keywords, new_keywords, declining_pages, total_clicks, total_impressions, avg_position. The columns report_type and report_date do not exist. TG-97 stores report_date and TG-102 stores report_date plus report_type, and TG-102 queries report_type=eq.rank_drop_alert. The result: TG-97 rank alert data is not persisted correctly, and TG-102 rank drop alert lookup always returns zero results so the weekly email Rank Drop Alerts section is always blank even when real rank drops occurred. Fix requires either a migration adding these columns or refactoring TG-97 and TG-102 to conform to the existing schema.

---

_Verified: 2026-03-16T08:38:44Z_
_Verifier: Claude (gsd-verifier)_
