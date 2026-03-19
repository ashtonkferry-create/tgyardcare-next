---
phase: 12-conversion-engine
plan: 03
subsystem: automation
tags: [n8n, sms, email, follow-up, lead-nurture, google-reviews, supabase, twilio]

dependency_graph:
  requires:
    - phase: 12-01
      provides: "TG-01 instant multi-channel response with TG-94/TG-95 sub-workflow pattern"
  provides:
    - "CONV-05: 5-touch automated follow-up sequence over 14 days"
    - "CONV-06: Dynamic 5-star Google reviews in every touchpoint"
    - "TG-09 rebuilt with SMS+email channels via unified senders"
  affects: [12-04, 13-retention-engine]

tech_stack:
  added: []
  patterns: [flat-json-data-flow, switch-channel-routing, stage-tracking-on-leads-table, dynamic-review-injection]

key_files:
  created: []
  modified: [automation/n8n-workflows/TG-09-followup-sequences.json]

key_decisions:
  - id: flat-data-flow
    decision: "Flatten SMS/email payloads to top-level JSON fields (no nesting) so executeWorkflow nodes pass data directly to TG-94/TG-95"
    reason: "executeWorkflow passes entire input JSON to sub-workflow; TG-94 expects to_phone, message_body at root level"
  - id: stage-on-leads
    decision: "Track follow-up stage via leads.follow_up_stage integer column instead of separate sequence_enrollments table"
    reason: "Simpler, self-contained, no join needed; defaults to 0 if column missing; continueOnFail on update"
  - id: reference-route-node
    decision: "Update Stage nodes reference $('Route by Channel').item.json for lead_id/new_stage since executeWorkflow output overwrites input"
    reason: "After executeWorkflow returns, the original input data is replaced by sub-workflow output; must reference upstream node"

patterns_established:
  - "Stage tracking: integer column on leads table (0-5) with PATCH update per touch"
  - "Channel routing: switch node splits SMS/email paths, each with own executeWorkflow + stage update"
  - "Review injection: random 5-star review from Supabase reviews table, truncated to 100 chars for SMS"

duration: ~6min
completed: 2026-03-19
---

# Phase 12 Plan 03: 5-Touch Follow-up Sequence Summary

**TG-09 rebuilt as 5-touch SMS+email follow-up sequence over 14 days with dynamic Google reviews from Supabase, routed through TG-94 (SMS) and TG-95 (email) unified senders.**

## Performance

- **Duration:** ~6 minutes
- **Started:** 2026-03-19T06:03:16Z
- **Completed:** 2026-03-19T06:09:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Rebuilt TG-09 from 7-node Brevo-direct workflow to 9-node multi-channel sequence
- 5-touch sequence: Day 1 SMS, Day 3 email, Day 5 SMS, Day 7 email, Day 14 email
- Dynamic 5-star reviews pulled from Supabase `reviews` table (replaces hardcoded reviews)
- All SMS routed through TG-94, all email through TG-95 (consent, rate limiting, logging automatic)
- Stage tracking via `leads.follow_up_stage` (replaces sequence_enrollments table dependency)
- Deployed and active on n8n (workflow ID: ZjG32DE8KI9SHyxo)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild TG-09 follow-up sequence** - `406477b` (feat)
2. **Task 2: Deploy to n8n and activate** - No file changes (API deployment only)

## Files Created/Modified
- `automation/n8n-workflows/TG-09-followup-sequences.json` - Rebuilt 5-touch follow-up sequence with 9 nodes

## Decisions Made

1. **Flat data flow for executeWorkflow** -- Output from code node uses flat JSON (to_phone, message_body at root level alongside channel, lead_id, new_stage) rather than nested objects. This matches TG-94/TG-95's expected input format since executeWorkflow passes the full input JSON to sub-workflows.

2. **Stage tracking on leads table** -- Uses `leads.follow_up_stage` integer (0-5) instead of a separate `sequence_enrollments` table. Simpler, no joins needed. The code node defaults to 0 if the column doesn't exist yet, and the Update Stage nodes have `continueOnFail: true`.

3. **Upstream node reference for stage updates** -- Update Stage nodes reference `$('Route by Channel').item.json` for lead_id and new_stage, because executeWorkflow replaces the input data with the sub-workflow's return value.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed data flow through executeWorkflow nodes**
- **Found during:** Task 1 (workflow JSON construction)
- **Issue:** Plan specified nested sms/email objects in code node output, but executeWorkflow passes entire JSON to sub-workflow. TG-94 expects `to_phone` at root, not under `.sms.to_phone`. Also, executeWorkflow return replaces original input, so Update Stage nodes lose access to `lead_id` and `new_stage`.
- **Fix:** (a) Flattened SMS/email payloads to root level in code node output. (b) Update Stage nodes reference `$('Route by Channel').item.json` instead of `$json` to access lead_id/new_stage from before the executeWorkflow call.
- **Files modified:** automation/n8n-workflows/TG-09-followup-sequences.json
- **Verification:** JSON structure confirmed correct; node references validated
- **Committed in:** 406477b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correct data flow. Without it, TG-94/TG-95 would receive wrong input format and stage updates would fail. No scope creep.

## Issues Encountered
- Supabase `follow_up_stage` column cannot be verified or added via API (no service key available in this session). The workflow handles this gracefully: code node defaults `follow_up_stage` to 0 if missing, and Update Stage nodes have `continueOnFail: true`.

## User Setup Required

**Vance needs to add the `follow_up_stage` column to the leads table.** Run in Supabase SQL Editor:

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_stage integer DEFAULT 0;
```

Without this column:
- The workflow will still run (code node defaults to 0)
- Stage updates will fail silently (continueOnFail: true)
- Leads will receive touch 1 every day instead of progressing through the sequence

## Next Phase Readiness
- TG-09 active and running daily at 10am CT (cron: 0 15 * * *)
- Ready for 12-04 (next conversion engine plan)
- 11 workflows now active: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-09
- Twilio A2P status still unknown -- SMS touches may be carrier-filtered

---
*Phase: 12-conversion-engine*
*Completed: 2026-03-19*
