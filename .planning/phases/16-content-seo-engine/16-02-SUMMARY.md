---
phase: 16-content-seo-engine
plan: 02
subsystem: seo-monitoring
tags: [gsc, seo, rank-tracking, telegram-alerts, n8n]
dependency-graph:
  requires: [16-01]
  provides: [SEO-04, SEO-05, SEO-06]
  affects: [16-03]
tech-stack:
  added: []
  patterns: [gsc-api-sync, keyword-rank-tracking, rank-drop-alerting, 7-day-comparison-window]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-96-gsc-daily-sync.json
    - automation/n8n-workflows/TG-45-keyword-rank-tracker.json
    - automation/n8n-workflows/TG-97-rank-drop-detector.json
decisions:
  - id: seo-02-01
    decision: "TG-96 uses n8n Google Service Account credential reference (not hardcoded bearer token)"
    rationale: "Proper credential management; Vance must create the credential in n8n UI and grant GSC access to service account"
  - id: seo-02-02
    decision: "TG-97 runs on standalone 10am UTC schedule (removed executeWorkflow trigger from TG-96)"
    rationale: "Independent scheduling is more reliable; TG-96 no longer chains to TG-97 directly"
  - id: seo-02-03
    decision: "TG-45 expanded to 177 keywords (14 core services x 12 cities + 9 generic/brand terms)"
    rationale: "Full coverage of all TotalGuard service areas per plan requirement"
  - id: seo-02-04
    decision: "TG-97 uses OWNER_TELEGRAM_CHAT_ID placeholder (consistent with other workflows)"
    rationale: "Vance must set actual chat ID in n8n; same pattern used across all TG-* Telegram workflows"
  - id: seo-02-05
    decision: "TG-97 detects disappeared keywords (previously ranking, now absent from GSC data)"
    rationale: "Complete de-indexing is worse than a rank drop and deserves alerting"
metrics:
  duration: "5m 26s"
  completed: "2026-03-19"
---

# Phase 16 Plan 02: Rank Monitoring Pipeline Summary

**One-liner:** GSC daily sync + 177-keyword rank tracker + rank drop detector with Telegram alerts across 12 Madison-area cities.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Audit and update TG-96, TG-45, TG-97 workflow JSONs | 1cc106e | Fixed all placeholders, expanded keywords, added automation_runs logging |
| 2 | Deploy TG-96, TG-45, TG-97 to n8n and activate | (API-only) | All 3 PUT-updated and activated via n8n API |

## What Was Built

### TG-96 GSC Daily Sync (6am UTC / 1am CT)
- Queries Google Search Console API for tgyardcare.com
- Pulls page-level and query-level metrics (clicks, impressions, CTR, position)
- Syncs last 3 days of data (accounts for GSC 2-day lag)
- Upserts to `gsc_pages` and `gsc_search_queries` Supabase tables
- Logs run to `automation_runs`
- **n8n ID:** Vt8uzm8RGy3QXv3B

### TG-45 Keyword Rank Tracker (8am UTC / 3am CT)
- Tracks 177 target keywords across 12 service areas
- Reads from `gsc_search_queries` table (populated by TG-96)
- Matches target keywords against GSC data
- Stores daily rank snapshots in `seo_rankings` table
- Reports tracked vs missing keyword counts
- **n8n ID:** niQsYkoGk7EZvAqo

### TG-97 Rank Drop Detector (10am UTC / 5am CT)
- Compares current GSC data vs 7 days prior
- Detects rank drops > 3 positions (threshold: 10+ impressions)
- Detects CTR anomalies > 30% drop (threshold: 50+ impressions)
- Detects disappeared keywords (previously had impressions, now absent)
- Sends Telegram alert with categorized findings
- Logs summary to `automation_runs`
- **n8n ID:** NPxVFCf05a15PjBH

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed stale TG-97 executeWorkflow trigger from TG-96**
- **Found during:** Task 1
- **Issue:** TG-96 had a "Trigger TG-97" node referencing stale workflow ID NPxVFCf05a15PjBH via executeWorkflow
- **Fix:** Removed the sub-workflow trigger; TG-97 now runs independently on its own 10am UTC schedule
- **Files modified:** TG-96-gsc-daily-sync.json

**2. [Rule 2 - Missing Critical] Added disappeared-keyword detection to TG-97**
- **Found during:** Task 1
- **Issue:** Plan specified "alert if a previously-ranking keyword disappeared entirely" but original workflow only detected position drops
- **Fix:** Added disappeared keyword detection comparing previous vs current query sets
- **Files modified:** TG-97-rank-drop-detector.json

**3. [Rule 1 - Bug] Fixed GSC authentication approach in TG-96**
- **Found during:** Task 1
- **Issue:** Original used hardcoded GSC_BEARER_TOKEN_PLACEHOLDER in HTTP headers (bearer tokens expire hourly)
- **Fix:** Switched to n8n predefinedCredentialType `googleApi` with credential reference for proper OAuth/service account handling
- **Files modified:** TG-96-gsc-daily-sync.json

## Manual Setup Required

Vance must complete these steps for the pipeline to function:

1. **Google Service Account in n8n:** Create a "Google Service Account (GSC)" credential in n8n with the service account JSON key that has GSC access to tgyardcare.com
2. **Update credential ID:** Replace `GOOGLE_CREDENTIAL_ID` in TG-96 with the actual n8n credential ID (via n8n UI)
3. **Telegram chat ID:** Set `OWNER_TELEGRAM_CHAT_ID` in TG-97 to Vance's actual Telegram chat ID (same as other TG-* workflows)
4. **Supabase tables:** Ensure these tables exist: `gsc_pages`, `gsc_search_queries`, `seo_rankings`, `seo_weekly_reports`, `automation_runs`

## Active Workflow Count

30 workflows now active on n8n (added TG-96, TG-45, TG-97).

## Next Phase Readiness

- TG-96 data feeds TG-45 (keyword matching) and TG-97 (drop detection)
- Plan 16-03 can reference `seo_rankings` table for weekly digest content
- GSC credential setup is blocking: until done, TG-96 will fail on the GSC API call (TG-45 and TG-97 will run but find no data)
