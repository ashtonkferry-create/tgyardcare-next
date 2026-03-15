# Phase 1 Plan 8: TG-90 Fertilizer Schedule Engine Summary

**One-liner:** Daily cron sends SMS + email reminders 7 days before each fertilizer treatment step

## What Was Done

### Task 1: Create and deploy TG-90 Fertilizer Schedule Engine
- **Commit:** `f3f52a3`
- Created TG-90 workflow with 10 nodes:
  1. **Schedule Trigger** - Daily at 14:30 UTC (9:30 AM CT)
  2. **Find Due Reminders** - Queries `fertilizer_schedule` where `scheduled_date = NOW() + 7 days` AND `reminder_sent_at IS NULL`
  3. **Split Results** - Converts array response to individual items
  4. **Any Due?** - Boolean gate to skip empty results
  5. **Check SMS Consent** - Calls `can_send_sms` RPC function
  6. **Has Consent?** - Routes to SMS+email or email-only path
  7. **Log SMS Send** - Records SMS in `sms_sends` table
  8. **Send Reminder SMS** - Twilio SMS delivery
  9. **Send Reminder Email** - Brevo transactional email with HTML template
  10. **Mark Reminder Sent** - PATCHes `reminder_sent_at` for idempotency
- Deployed to n8n (inactive, pending Twilio credential setup)
- Saved sanitized JSON locally with placeholder keys

## Key Artifacts

| Artifact | Value |
|----------|-------|
| TG-90 Workflow ID | `nzLYQlLtJ0j5elJf` |
| n8n Status | Deployed, inactive |
| Local JSON | `tgyardcare/automation/n8n-workflows/TG-90-fertilizer-schedule-engine.json` |

## Decisions Made

1. **Twilio credential placeholder:** No Twilio credential exists in n8n yet (confirmed via API lookup). Used `TG_TWILIO` placeholder -- same pattern as TG-88/89. SMS sending will work once Vance adds Twilio creds to n8n.
2. **Workflow left inactive:** Cannot activate without valid Twilio credential. Will activate after creds are added.
3. **Email-only fallback:** When SMS consent is denied, customer still gets email reminder (no-consent path connects directly to Send Reminder Email).

## Deviations from Plan

None -- plan executed exactly as written.

## Blockers for Activation

- Twilio credentials must be added to n8n instance (manual step for Vance)
- Once added, update the Twilio credential ID in the workflow and activate

## Verification Results

- [x] TG-90 exists in n8n (ID: nzLYQlLtJ0j5elJf)
- [x] Schedule trigger set to 14:30 UTC (9:30 AM CT)
- [x] Query filters by scheduled_date = NOW() + 7 days AND reminder_sent_at IS NULL
- [x] Sends both SMS and email reminders
- [x] Marks reminder_sent_at to prevent duplicates
- [x] Local JSON file saved with placeholder keys

## Metrics

- **Duration:** ~4 minutes
- **Completed:** 2026-03-15
- **Tasks:** 1/1
