# Phase 1 Plan 6: Invoice Collections + Abandoned Quote SMS Summary

**One-liner:** TG-84 3-touch invoice collections sequence (SMS/Email/SMS over 17 days) + TG-91 daily abandoned quote nudge SMS

---

## What Was Built

### TG-84 Invoice Collections Sequence (ID: 63t7K6gAdW1aPupP)
Sub-workflow triggered by TG-05 when `invoice_sent` is detected. Executes a 3-touch collections sequence over 17 days:

1. **Day 3 - SMS Touch 1**: Friendly payment reminder via Twilio
2. **Day 10 - Email Touch 2**: Formal reminder email via Brevo SMTP
3. **Day 17 - SMS Touch 3**: Overdue notice with contact info via Twilio

Key behaviors:
- Enrolls invoice in collections (sets `collections_status = 'enrolled'`)
- After each Wait node, checks invoice payment status before proceeding
- If customer pays during sequence, exits early (no further touches)
- SMS touches check consent via `can_send_sms()` RPC before sending
- No-consent paths exit cleanly without sending or marking status
- Status progression: `enrolled` -> `day3_sent` -> `day10_sent` -> `escalated`
- All SMS sends logged to `sms_sends` table

### TG-91 Abandoned Quote SMS (ID: 0qSgxknCY9LTcKBU)
Standalone scheduled workflow running daily at 10 AM CT (15:00 UTC):

- Queries estimates older than 48h with `followup_status IS NULL` (up to 14 days old)
- For each abandoned quote, checks SMS consent
- If consent: sends nudge SMS, logs to `sms_sends`, marks `followup_status = 'abandoned_nudge_sent'`
- If NO consent: **skips entirely** -- does NOT mark `abandoned_nudge_sent` (critical requirement)
- Workflow activated and running on schedule

### TG-05 Integration
- Updated `call-tg84` node with workflowId `63t7K6gAdW1aPupP`
- TG-05 still inactive (TG-83 and TG-86 workflowIds still empty)

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Twilio credential placeholder | No twilioApi credential exists in n8n yet (known blocker from 01-03) |
| TG-91 activated immediately | Schedule trigger is safe to activate; will query but SMS won't send without Twilio cred |
| TG-84 left inactive | Sub-workflow, only called by TG-05 which is also inactive |
| 14-day lookback window for TG-91 | Prevents re-querying very old quotes; only nudges recent ones |

---

## Deviations from Plan

None -- plan executed exactly as written.

Note: Twilio credentials remain a known blocker from 01-03. All Twilio nodes have `continueOnFail: true` so workflows won't break when credentials are missing.

---

## Commits

| Hash | Description |
|------|-------------|
| b06ed36 | feat(01-06): deploy TG-84 Invoice Collections Sequence to n8n |
| 5fb4120 | feat(01-06): deploy TG-91 Abandoned Quote SMS to n8n |

---

## Key Files

### Created
- `tgyardcare/automation/n8n-workflows/TG-84-invoice-collections-sequence.json`
- `tgyardcare/automation/n8n-workflows/TG-91-abandoned-quote-sms.json`

### Modified (in n8n)
- TG-05 workflow: `call-tg84` node updated with workflowId `63t7K6gAdW1aPupP`

---

## Workflow IDs Reference

| Workflow | ID | Status |
|----------|----|--------|
| TG-84 Invoice Collections | 63t7K6gAdW1aPupP | Inactive (sub-workflow) |
| TG-91 Abandoned Quote SMS | 0qSgxknCY9LTcKBU | Active (daily 10 AM CT) |

---

## Next Phase Readiness

### Remaining Blockers
- Twilio credentials need to be added to n8n for any SMS to actually send
- TG-05 still needs TG-83 and TG-86 workflowIds before it can be activated
- TG-84 won't fire until TG-05 is active

### Ready For
- 01-07 and 01-08 plans can proceed independently
- Once Twilio cred is added, TG-91 will start sending abandoned quote nudges automatically

---

**Duration:** ~5 minutes
**Completed:** 2026-03-15
