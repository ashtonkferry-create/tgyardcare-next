# Phase 1 Plan 7: TG-86 Plan Enrollment + TG-87 Renewal Reminder Summary

**One-liner:** Sub-workflow for plan enrollment creating customer_subscriptions + daily cron sending idempotent renewal reminders at 30/14/3 days via Brevo email

## Results

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Create TG-86 Plan Enrollment and TG-87 Plan Renewal Reminder | Done | 0e463d2 |

## Workflow IDs

| Workflow | n8n ID | Purpose |
|----------|--------|---------|
| TG-86 | wJvqFV6PyGvUZccX | Plan enrollment processor (sub-workflow called by TG-05) |
| TG-87 | 68jK9m7qXO5vQBef | Daily plan renewal reminder (9 AM CT cron) |

## What Was Built

### TG-86: Plan Enrollment Processor
- **Trigger:** executeWorkflowTrigger (called by TG-05 plan_accepted route)
- **Flow:** Extract data -> Look up lead by phone -> Look up subscription plans -> Match plan by service name -> Create customer_subscription record (active, with start/end dates) -> Send welcome email via Brevo
- **Key behavior:** Matches incoming service name to subscription_plans table, calculates end_date based on plan duration_months, creates active subscription record

### TG-87: Plan Renewal Reminder
- **Trigger:** scheduleTrigger at 14:00 UTC (9 AM CT)
- **Flow:** Query active subscriptions expiring within 31 days (with lead join) -> Determine which reminder tier applies (30d/14d/3d) -> Filter already-sent reminders -> Send email via Brevo -> Mark reminder as sent in customer_subscriptions
- **Idempotency:** Tracks renewal_reminder_30d_sent, renewal_reminder_14d_sent, renewal_reminder_3d_sent timestamps to prevent duplicates
- **Email-only:** No SMS (no consent checks needed)

### TG-05 Integration
- Updated TG-05's "Call TG-86 Plan Enrollment" node (id: call-tg86) with workflowId: wJvqFV6PyGvUZccX
- TG-05 now has ALL sub-workflow IDs populated: TG-83, TG-84, TG-86, TG-88, TG-89

## TG-05 Activation Status

All sub-workflow IDs are now backfilled in TG-05:
- call-tg83: 9m2sID72Fz1PF0HY (Quote Follow-up)
- call-tg84: 63t7K6gAdW1aPupP (Invoice Collections)
- call-tg86: wJvqFV6PyGvUZccX (Plan Enrollment)
- call-tg88: 2IB0qFPgBm0YxNtP (On My Way SMS)
- call-tg89: 3gQKfREf9c9cyE0w (Invoice Delivery)

TG-05 can now be activated once Twilio credentials are added to n8n (blocking TG-88/89 SMS nodes).

## Deviations from Plan

None - plan executed exactly as written.

## Files

### Created
- `tgyardcare/automation/n8n-workflows/TG-86-plan-enrollment.json`
- `tgyardcare/automation/n8n-workflows/TG-87-plan-renewal-reminder.json`

### Modified (in n8n)
- TG-05 (Jf5VYdWpDs3VgRzd) - updated call-tg86 workflowId

## Commits
- `0e463d2` (tgyardcare): feat(01-07): deploy TG-86 plan enrollment and TG-87 renewal reminder
- `63c4a21` (workspace): chore(01-07): update tgyardcare submodule ref for TG-86/TG-87

## Duration
~6 minutes

## Next Phase Readiness
- TG-05 has all sub-workflow IDs populated
- TG-05 activation still blocked by missing Twilio credentials in n8n
- TG-87 needs to be activated after verifying customer_subscriptions table has the renewal_reminder columns
