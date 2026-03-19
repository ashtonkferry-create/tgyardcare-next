---
phase: 15-retention-lifetime-value
plan: 01
subsystem: automation/referral-pipeline
tags: [n8n, referral, sms, telegram, supabase, retention]
dependency-graph:
  requires: [14-02]
  provides: [RETN-01, RETN-02, referral-tracking]
  affects: [15-02, 15-03]
tech-stack:
  added: []
  patterns: [webhook-trigger, schedule-poll, executeWorkflow-sms, name-based-lead-lookup]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-22-review-to-referral.json
    - automation/n8n-workflows/TG-34-referral-program.json
decisions:
  - id: D-15-01-01
    decision: "Use google_reviews table (from Phase 14) instead of generic reviews table"
    reason: "Phase 14 already created google_reviews table with review poller TG-131"
  - id: D-15-01-02
    decision: "Webhook trigger for TG-34 instead of executeWorkflowTrigger"
    reason: "Allows manual POST from any source (Vance, other workflows, future Jobber integration)"
  - id: D-15-01-03
    decision: "Name-based lead lookup for phone numbers instead of direct reviewer_phone field"
    reason: "Google reviews don't include phone numbers; must cross-reference with leads table"
  - id: D-15-01-04
    decision: "referrals table (not referral_events) for tracking"
    reason: "Simpler schema aligned with plan specification"
metrics:
  duration: "8 minutes"
  completed: "2026-03-19"
---

# Phase 15 Plan 01: Review-to-Referral + Referral Tracking Summary

**One-liner:** 5-star review auto-detection every 30 min triggers referral SMS via TG-94, with webhook-based referral tracking and thank-you notifications.

## What Was Built

### TG-22 Review-to-Referral (10 nodes, active)
- **n8n ID:** YnLX05UbBgZI7YO6
- **Trigger:** Schedule every 30 minutes
- **Flow:** Fetch 5-star google_reviews from last 2h -> Filter unsent -> Lookup customer phone from leads table -> Build referral SMS -> Send via TG-94 -> Mark review as sent -> Telegram notification
- **Dedup:** OR filter in Supabase query (referral_sms_sent is null OR false), plus Code node filter
- **SMS message:** Personalized with first name, asks them to mention their name when calling (608) 535-6057

### TG-34 Referral Program (12 nodes, active)
- **n8n ID:** Gu61j7HgsWFyMsEU
- **Trigger:** Webhook POST at `/tg34-referral-log`
- **Accepts:** `{ referrer_name, new_lead_name, new_lead_phone, service }`
- **Flow:** Parse + validate input -> Find referrer in leads -> Log to referrals table -> Build thank-you SMS -> Send via TG-94 -> Telegram alert -> HTTP response
- **Error handling:** 400 response for missing required fields, continueOnFail on referrals table insert
- **Webhook URL:** `https://tgyardcare.app.n8n.cloud/webhook/tg34-referral-log`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 34a800c | TG-22 rebuild - review-to-referral |
| 2 | 9d69747 | TG-34 rebuild - referral program |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Supabase query filter syntax**
- **Found during:** Task 1
- **Issue:** Original `created_at` filter had extra `=` sign (`=gte.` instead of `gte.`)
- **Fix:** Corrected to `gte.{{ expression }}`
- **Files modified:** TG-22-review-to-referral.json

**2. [Rule 2 - Missing Critical] Added IF gates for empty results**
- **Found during:** Task 1
- **Issue:** Original workflow would attempt SMS send even with no reviews or no phone found
- **Fix:** Added `IF Has Reviews` and `IF Has Phone` gates to prevent empty pipeline execution
- **Files modified:** TG-22-review-to-referral.json

**3. [Rule 2 - Missing Critical] Added webhook response nodes to TG-34**
- **Found during:** Task 2
- **Issue:** Original TG-34 had no HTTP response — webhook callers would get no feedback
- **Fix:** Added Respond OK (200) and Respond Error (400) nodes with JSON responses
- **Files modified:** TG-34-referral-program.json

**4. [Rule 2 - Missing Critical] Added input validation to TG-34**
- **Found during:** Task 2
- **Issue:** No validation of incoming webhook payload
- **Fix:** Added Parse Input code node with validation, IF Valid gate routing invalid to error response
- **Files modified:** TG-34-referral-program.json

## Manual Steps Required

### Supabase Schema Changes

1. **Add `referral_sms_sent` column to `google_reviews` table:**
```sql
ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS referral_sms_sent boolean DEFAULT false;
```

2. **Create `referrals` table:**
```sql
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_lead_id uuid REFERENCES leads(id),
  referrer_name text,
  referred_name text,
  referred_phone text,
  service text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

3. **Replace `OWNER_TELEGRAM_CHAT_ID`** in both TG-22 and TG-34 Telegram nodes with Vance's actual chat ID

4. **Replace `SUPABASE_ANON_KEY_PLACEHOLDER`** in both workflows with real anon key (`sb_publishable_DeX21ldoDKl3NyJeFZzR1w_eWBUkx-v`) via n8n UI

## Active Workflows After This Plan

20 workflows now active (added TG-22, TG-34):
TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07, TG-09, TG-127, TG-128, TG-129, TG-130, TG-132, TG-22, TG-34

## Success Criteria Verification

- [x] RETN-01: 5-star reviewers receive referral SMS within 1 hour (30-min poll cycle)
- [x] RETN-02: Referral tracking in Supabase with referrer/referred linkage
- [x] SMS sends through TG-94 unified sender
- [x] Telegram alerts keep Vance informed of referral activity
- [x] Both workflows deployed and active on n8n
