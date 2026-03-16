---
phase: 03-seo-domination
plan: 03
subsystem: automation
tags: [n8n, gsc, seo, rank-tracking, index-monitoring, url-inspection-api, sms-alerts]

# Dependency graph
requires:
  - phase: 03-seo-domination (03-01)
    provides: TG-96 daily GSC sync, index_coverage_log table, gsc_search_queries table
  - phase: 02-crm-unification
    provides: TG-94 unified SMS sender (AprqI2DgQA8lehij)
provides:
  - TG-97 rank drop + CTR anomaly detector (daily, triggered by TG-96)
  - TG-100 index coverage monitor (weekly Tuesday)
  - Real-time SEO alerting for rank drops and deindexing
affects: [03-04 (gap analysis), 03-05 (weekly summary via TG-102)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sub-workflow pattern: TG-96 -> TG-97 via executeWorkflow"
    - "SplitInBatches with Wait for rate-limited API calls (URL Inspection)"
    - "Previous verdict comparison for deindex detection"

key-files:
  created:
    - automation/n8n-workflows/TG-97-rank-drop-detector.json
    - automation/n8n-workflows/TG-100-index-coverage-monitor.json
  modified:
    - automation/n8n-workflows/TG-96-gsc-daily-sync.json

key-decisions:
  - "TG-97 uses executeWorkflowTrigger typeVersion 1 (not 1.1) for n8n compatibility"
  - "Rank drop thresholds: urgent >= 10 pos + >= 50 impressions, warning 5-9 pos + >= 20 impressions"
  - "CTR anomaly threshold: > 30% drop with both periods >= 50 impressions"
  - "SMS alert limited to top 3 rank drops + 2 CTR anomalies for brevity"
  - "TG-100 uses 200ms Wait between URL Inspection API calls (600 QPM limit)"
  - "Deindex detection: only PASS -> FAIL/NEUTRAL triggers alert (not new NEUTRAL pages)"

patterns-established:
  - "executeWorkflowTrigger typeVersion 1 for sub-workflows (1.1 requires extra params)"
  - "n8n API rate limit: ~10 calls before 401 lockout (need to pace deployments)"

# Metrics
duration: 12min
completed: 2026-03-16
---

# Phase 3 Plan 3: SEO Alert Workflows Summary

**TG-97 rank drop + CTR anomaly detector and TG-100 index coverage monitor -- early warning SMS alerts for SEO problems**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-16T07:52:12Z
- **Completed:** 2026-03-16T08:04:00Z
- **Tasks:** 2
- **Files created:** 2, Files modified: 1

## Accomplishments
- Built and deployed TG-97 rank drop detector (ID: NPxVFCf05a15PjBH, ACTIVE)
- Built TG-100 index coverage monitor JSON (deployment pending n8n API access restoration)
- Updated TG-96 local JSON with TG-97 real workflow ID (NPxVFCf05a15PjBH)
- TG-97 detects urgent rank drops (>= 10 positions, >= 50 impressions) and CTR anomalies (> 30% drop)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build and deploy TG-97 Rank Drop Detector** - `7e4a31b` (feat)
2. **Task 2: Build TG-100 Index Coverage Monitor** - `991e8ff` (feat)

## Files Created/Modified
- `automation/n8n-workflows/TG-97-rank-drop-detector.json` - Daily rank drop + CTR anomaly detection sub-workflow
- `automation/n8n-workflows/TG-100-index-coverage-monitor.json` - Weekly index coverage monitor with URL Inspection API
- `automation/n8n-workflows/TG-96-gsc-daily-sync.json` - Updated TG-97 workflow ID placeholder to real ID

## n8n Workflow Reference
- **TG-97 workflow ID:** NPxVFCf05a15PjBH (ACTIVE, executeWorkflowTrigger)
- **TG-100 workflow ID:** PENDING DEPLOYMENT (n8n API rate limited)
- **TG-96 status:** Local JSON updated with TG-97 real ID; n8n deployment of update pending API access

## Decisions Made
- **executeWorkflowTrigger typeVersion 1**: n8n v1.1 requires additional parameters that cause activation failure; typeVersion 1 works for sub-workflows receiving data from parent
- **Alert thresholds**: Urgent SMS for >= 10 position drop with >= 50 weekly impressions (avoids noise from low-traffic queries). CTR anomaly requires both periods to have >= 50 impressions
- **SMS brevity**: Capped at 3 rank drops + 2 CTR anomalies per message to keep SMS readable
- **Deindex detection logic**: Only PASS -> FAIL/NEUTRAL transitions trigger alerts (new pages showing NEUTRAL are expected, not alarming)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] executeWorkflowTrigger typeVersion downgrade**
- **Found during:** Task 1 (TG-97 activation)
- **Issue:** n8n returned "Missing or invalid required parameters" for executeWorkflowTrigger v1.1
- **Fix:** Changed typeVersion from 1.1 to 1 (matching TG-76 pattern), redeployed and activated
- **Files modified:** automation/n8n-workflows/TG-97-rank-drop-detector.json
- **Verification:** TG-97 activated successfully (active: true confirmed)
- **Committed in:** 7e4a31b

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for workflow activation. No scope change.

## Issues Encountered
- **n8n API rate limiting**: After ~10 API calls, all subsequent calls returned 401 "unauthorized". This blocked: TG-100 deployment, TG-96 update on n8n, verification of TG-97 final state. The API key is valid (confirmed working on initial calls) but n8n cloud appears to enforce a per-session rate limit.

## Remaining Deployment Steps
When n8n API access is restored:
1. Deploy TG-100: `POST /api/v1/workflows` with TG-100 JSON, then activate
2. Update TG-96 on n8n: Replace "Trigger TG-97 (placeholder)" Code node with executeWorkflow node pointing to NPxVFCf05a15PjBH
3. Reactivate TG-96 after update

## Alert Threshold Summary
| Alert Type | Trigger | Channel | Frequency |
|---|---|---|---|
| Urgent rank drop | >= 10 positions AND >= 50 impressions | SMS via TG-94 | Daily (after GSC sync) |
| Warning rank drop | 5-9 positions AND >= 20 impressions | Weekly digest only | Stored for TG-102 |
| CTR anomaly | > 30% CTR drop, both periods >= 50 impressions | SMS via TG-94 | Daily (after GSC sync) |
| Deindex event | PASS -> FAIL/NEUTRAL verdict | SMS via TG-94 | Weekly (Tuesday) |

## Next Phase Readiness
- TG-97 active and ready to receive triggers from TG-96 once GSC data flows
- TG-100 JSON ready for deployment when API access restores
- Both workflows feed into TG-102 weekly summary (Phase 3, Plan 05)
- Content gap detection (03-04) and weekly summary (03-05) can proceed independently

---
*Phase: 03-seo-domination*
*Completed: 2026-03-16*
