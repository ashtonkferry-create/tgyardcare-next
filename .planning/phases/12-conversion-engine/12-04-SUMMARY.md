---
phase: 12-conversion-engine
plan: 04
subsystem: automation
tags: [n8n, lead-scoring, engagement-signals, telegram, supabase, scoring-algorithm]

dependency_graph:
  requires:
    - phase: 12-01
      provides: TG-01 lead capture with instant multi-channel response
  provides:
    - CONV-07 engagement-based lead scoring with static + dynamic + recency factors
    - Hot lead Telegram alerts with tap-to-call
    - Daily automated lead scoring at 7am CT
  affects: [12-02, 12-03]

tech_stack:
  added: []
  patterns: [multi-source-data-enrichment, engagement-signal-scoring, newly-hot-detection]

key_files:
  created: []
  modified: [automation/n8n-workflows/TG-07-lead-scoring.json]

key-decisions:
  - "Wrote scores directly to leads table (lead_score, lead_tier) instead of separate lead_scores table"
  - "Only newly-hot leads trigger Telegram alerts to prevent daily spam for already-hot leads"
  - "Used OWNER_TELEGRAM_CHAT_ID placeholder matching TG-01 pattern -- Vance must set actual chat ID"
  - "SMS send history fetch uses continueOnFail: true since sms_sends table may have different schema"

patterns-established:
  - "Engagement scoring: look up email_sends/sms_sends history for cross-workflow engagement signals"
  - "Newly-hot detection: compare current tier against previous tier to avoid repeat alerts"

metrics:
  duration: ~3.5min
  completed: 2026-03-19
---

# Phase 12 Plan 04: Engagement-Based Lead Scoring Summary

**TG-07 rebuilt with 3-dimension scoring (static attributes 50pt + engagement signals 30pt + recency 20pt), direct leads table updates, and Telegram alerts for newly-hot leads at 7am CT daily.**

## Performance

- **Duration:** ~3.5 minutes
- **Started:** 2026-03-19T06:03:16Z
- **Completed:** 2026-03-19T06:06:49Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Rebuilt TG-07 scoring algorithm from simple 3-factor static scoring to comprehensive 3-dimension model
- Added engagement signal scoring: email/SMS send history from TG-09 follow-ups + follow-up stage tracking
- Added granular recency scoring with 5 tiers (1d/3d/7d/14d/30d) instead of original 3 tiers
- Added Telegram alerts for newly-hot leads with tap-to-call link for immediate callback
- Scores now written directly to leads table (lead_score, lead_tier) via PATCH instead of separate lead_scores table
- 3 parallel fetch nodes for leads + email history + SMS history for efficient data gathering

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild TG-07 lead scoring with engagement signals and hot-lead Telegram alerts** - `63bdee6` (feat)
2. **Task 2: Deploy rebuilt TG-07 to n8n** - No file changes (deployment operation only)

## Files Created/Modified

- `automation/n8n-workflows/TG-07-lead-scoring.json` - Rebuilt from 4 nodes to 8 nodes with engagement-based scoring algorithm

## Decisions Made

1. **Direct leads table writes instead of lead_scores table:** The old version wrote to a separate `lead_scores` table. The new version patches `leads.lead_score` and `leads.lead_tier` directly. These fields already exist from TG-01 initial capture. The `lead_scores` table is left intact (not dropped) in case other workflows reference it.

2. **Newly-hot detection prevents alert spam:** Only leads that transition TO hot (were not previously hot) trigger Telegram alerts. Leads already marked hot from a prior scoring run don't re-alert. This prevents Vance from getting daily notifications for the same leads.

3. **OWNER_TELEGRAM_CHAT_ID placeholder:** Same pattern as TG-01 from plan 12-01. Vance must replace this with his actual Telegram chat ID once.

4. **continueOnFail on SMS history fetch:** The `sms_sends` table may not exist or may have a different schema. Setting `continueOnFail: true` ensures scoring proceeds even if SMS history lookup fails, just without SMS engagement bonus points.

## Scoring Algorithm Details

| Dimension | Factor | Points | Max |
|-----------|--------|--------|-----|
| **Static** | Source quality (referral=30, organic=25, website=22, paid=20, facebook=18, manual=15) | 10-30 | 30 |
| **Static** | Service value (hardscaping/commercial=20, fertilization/mowing=12, cleanup/snow=8, other=5) | 5-20 | 20 |
| **Static** | Contact completeness (phone +5, email +5, address +5) | 0-15 | 15 |
| **Engagement** | Received follow-up email | +5 | 5 |
| **Engagement** | Received follow-up SMS | +5 | 5 |
| **Engagement** | Follow-up stage >= 2 | +10 | 10 |
| **Engagement** | Follow-up stage >= 4 | +10 | 10 |
| **Recency** | Created < 1 day | +20 | 20 |
| **Recency** | Created < 3 days | +15 | - |
| **Recency** | Created < 7 days | +10 | - |
| **Recency** | Created < 14 days | +5 | - |
| **Recency** | Created < 30 days | +2 | - |
| | **Total possible** | | **100** |

**Tier thresholds:** hot >= 70, warm >= 40, cold < 40

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| Valid JSON | PASS |
| Source scoring (max 30) | PASS |
| Service scoring (max 20) | PASS |
| Completeness scoring (max 15) | PASS |
| Engagement scoring (max 30) | PASS |
| Recency scoring (max 20) | PASS |
| Score capped at 100 | PASS |
| Tier thresholds correct | PASS |
| Newly-hot detection | PASS |
| Writes to leads table via PATCH | PASS |
| No writes to lead_scores table | PASS |
| IF Newly Hot node exists | PASS |
| Telegram alert node exists | PASS |
| Telegram credential matches TG-74 | PASS |
| 3 parallel fetch nodes | PASS |
| Trigger fans to 3 nodes | PASS |
| IF true -> Telegram | PASS |
| IF false -> end | PASS |
| Cron 0 12 * * * (7am CT) | PASS |
| Email history fetches TG-09 | PASS |
| SMS history fetches TG-09 | PASS |
| SMS fetch continueOnFail | PASS |
| Algorithm documented in comments | PASS |
| Deployed to n8n (ID: rCRdV1aDoIlEpHiH) | PASS |
| Workflow active on n8n | PASS |

## Success Criteria Status

- [x] CONV-07: Lead scoring runs daily incorporating service type, source, completeness, recency, and follow-up engagement
- [x] Scores stored in leads table (lead_score, lead_tier)
- [x] Hot leads (70+) trigger Telegram alert with tap-to-call
- [x] Only newly-hot leads trigger alerts (already-hot leads don't re-alert)
- [x] Scoring algorithm documented in code comments

## User Setup Required

1. **Telegram Chat ID:** Replace `OWNER_TELEGRAM_CHAT_ID` in the "Send Hot Lead Telegram" node with Vance's actual Telegram chat ID. Same placeholder as TG-01 from plan 12-01 -- needs to be set once across both workflows.

## n8n Deployment Details

- **Workflow ID:** rCRdV1aDoIlEpHiH
- **Status:** Active
- **Nodes:** 8 (schedule-trigger, fetch-leads, fetch-email-history, fetch-sms-history, calculate-scores, update-score, if-newly-hot, send-hot-alert)
- **Schedule:** Daily at 7am CT (cron: 0 12 * * *)
- **Active workflows on n8n:** TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-07 (11 total)

## Next Phase Readiness

Phase 12 plans 02 and 03 can proceed. TG-07 provides the scoring infrastructure that TG-09 follow-up sequences can leverage. The Telegram chat ID placeholder remains the only setup item (same as TG-01).

---
*Phase: 12-conversion-engine*
*Completed: 2026-03-19*
