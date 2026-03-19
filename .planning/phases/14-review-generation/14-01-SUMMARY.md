---
phase: 14-review-generation
plan: 01
subsystem: automation
tags: [n8n, review-requests, sms, email, supabase]
dependency-graph:
  requires: [13-02]
  provides: [review-request-pipeline, review-requests-table]
  affects: [14-02]
tech-stack:
  added: []
  patterns: [scheduled-batch-processing, dedup-via-supabase, sub-workflow-delegation]
key-files:
  created:
    - automation/n8n-workflows/TG-129-review-request-sequence.json
    - automation/n8n-workflows/TG-130-review-followup-email.json
  modified: []
decisions:
  - id: d14-01-1
    decision: "TG-95 reactivated as dependency for TG-130 email sending"
    rationale: "TG-95 was inactive, blocking TG-130 activation. Sub-workflow must be published for callers to activate."
  - id: d14-01-2
    decision: "TG-129 uses 20-28h window instead of exact 24h for completions"
    rationale: "8-hour window ensures no jobs are missed due to timing edge cases with daily schedule"
  - id: d14-01-3
    decision: "TG-130 uses 68-76h window instead of exact 72h for follow-ups"
    rationale: "Same windowing approach for reliability"
metrics:
  duration: "~5 minutes"
  completed: 2026-03-19
---

# Phase 14 Plan 01: Review Request Pipeline Summary

**One-liner:** TG-129 sends review request SMS 24h after job completion, TG-130 follows up with branded email 72h later if no review received.

## What Was Built

### TG-129 Review Request SMS Sequence
- **n8n ID:** F8lA6eWLeHANSsuI
- **Schedule:** Daily 10 AM CT (15:00 UTC)
- **Nodes:** 7
- **Flow:** Schedule Trigger -> Fetch jobs completed 20-28h ago -> Filter has phone -> Dedup against review_requests table (30-day window) -> Build SMS with Google review link -> Send via TG-94 -> Log to review_requests table

### TG-130 Review Follow-up Email
- **n8n ID:** oSCqlDyHoKpC6aFy
- **Schedule:** Daily 2 PM CT (19:00 UTC)
- **Nodes:** 6
- **Flow:** Schedule Trigger -> Fetch review_requests 68-76h old (no review, no followup) -> Filter has email -> Build branded HTML email with green CTA -> Send via TG-95 -> Update followup_sent flag

### Google Review Link
Both workflows use: `https://g.page/r/CQEMNig5DhIBEAI/review`

## Supabase Table Required (Manual Creation)

The `review_requests` table must be created manually in Supabase:

```sql
CREATE TABLE IF NOT EXISTS review_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone text,
  customer_email text,
  customer_name text,
  request_type text NOT NULL,
  source_workflow text NOT NULL,
  google_review_received boolean DEFAULT false,
  followup_sent boolean DEFAULT false,
  followup_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_review_requests_phone ON review_requests(customer_phone);
CREATE INDEX idx_review_requests_created ON review_requests(created_at);
```

## Blockers / Notes

1. **Twilio A2P 10DLC:** SMS delivery depends on Twilio A2P campaign approval status. Review request SMS will not deliver if campaign is not approved.
2. **TG-95 reactivated:** Was inactive, blocking TG-130. Now active again.
3. **review_requests table:** Must be created in Supabase before workflows can log/dedup. Workflows degrade gracefully (continueOnFail) without the table but dedup won't work.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TG-95 was inactive, blocking TG-130 activation**
- **Found during:** Task 2 deployment
- **Issue:** n8n requires sub-workflows to be published/active before callers can activate
- **Fix:** Activated TG-95 via API before activating TG-130
- **Commit:** 0b772ec

## Active Workflows After This Plan

17 workflows now active (added TG-129, TG-130, reactivated TG-95):
- TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07, TG-09, TG-127, TG-128, TG-129, TG-130

## Commits

| Commit | Description |
|--------|-------------|
| 9350b08 | feat(14-01): deploy TG-129 review request SMS workflow |
| 0b772ec | feat(14-01): deploy TG-130 review follow-up email workflow |
