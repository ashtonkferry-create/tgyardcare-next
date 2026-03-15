---
phase: 01-revenue-engine
plan: 03
subsystem: customer-notifications
tags: [n8n, sms, email, twilio, brevo, sub-workflows]
dependency-graph:
  requires: [01-01, 01-02]
  provides: [TG-88-on-my-way-sms, TG-89-invoice-delivery-sms-email]
  affects: [01-04, 01-05, 01-06, 01-07, 01-08]
tech-stack:
  added: []
  patterns: [execute-sub-workflow-trigger, sms-consent-check, fan-out-notification]
key-files:
  created:
    - tgyardcare/automation/n8n-workflows/TG-88-on-my-way-sms.json
    - tgyardcare/automation/n8n-workflows/TG-89-invoice-delivery.json
  modified:
    - tgyardcare/automation/n8n-workflows/TG-05-jobber-email-parser.json
decisions:
  - id: D-0103-1
    decision: "Twilio node created without credentials (no twilioApi credential exists in n8n)"
    reason: "No Twilio credentials configured in n8n instance yet. Nodes use continueOnFail:true"
    impact: "SMS sending will fail gracefully until Twilio credentials are added to n8n"
  - id: D-0103-2
    decision: "TG-05 remains inactive after TG-88/89 wiring"
    reason: "TG-83, TG-84, TG-86 Execute Sub-workflow nodes still have empty workflowId"
    impact: "TG-05 activation blocked until Wave 3-4 plans create remaining sub-workflows"
metrics:
  duration: "7 minutes"
  completed: "2026-03-15"
---

# Phase 1 Plan 03: TG-88/TG-89 Sub-workflow Deployment Summary

**One-liner:** Deployed TG-88 On My Way SMS and TG-89 Invoice Delivery SMS+Email sub-workflows to n8n, wired both into TG-05's execute-sub-workflow nodes.

## Critical Reference Data

| Workflow | n8n ID | Name |
|----------|--------|------|
| TG-88 | `2IB0qFPgBm0YxNtP` | TG-88-on-my-way-sms |
| TG-89 | `3gQKfREf9c9cyE0w` | TG-89-invoice-delivery-sms-email |
| TG-05 | `Jf5VYdWpDs3VgRzd` | TG-05-jobber-email-parser |

## What Was Done

### Task 1: TG-88 On My Way SMS
Created and deployed a 7-node sub-workflow:
- **Trigger**: executeWorkflowTrigger (called by TG-05 on visit_confirmed)
- **Consent Check**: Calls Supabase `can_send_sms` RPC
- **IF Branch**: Routes based on consent result
- **Log SMS Send**: Inserts pending record to sms_sends table
- **Send SMS**: Twilio node (from +16089953554) with continueOnFail
- **Update Status**: PATCHes sms_sends record with sent status + twilio_sid
- **No Consent Skip**: Returns skip status for non-consented phones

Wired TG-88 ID into TG-05's "Call TG-88 On My Way" node.

### Task 2: TG-89 Invoice Delivery SMS+Email
Created and deployed a 7-node sub-workflow:
- **Trigger**: executeWorkflowTrigger (called by TG-05 on invoice_sent)
- **Consent Check**: Same can_send_sms RPC pattern
- **IF Branch**: Consent routes to SMS path; both paths send email
- **Log SMS Send**: Inserts to sms_sends with invoice message
- **Send SMS**: Twilio node with invoice notification text
- **Send Email**: Brevo API with branded HTML invoice notification email
- **Done**: Returns completion status

Wired TG-89 ID into TG-05's "Call TG-89 Invoice Delivery" node.

### TG-05 Activation Attempt
Attempted activation after wiring TG-88 and TG-89. Failed as expected with "Could not find property option" because TG-83, TG-84, TG-86 nodes still have empty workflowId fields.

## TG-05 Sub-workflow Status

| Node | Workflow | Status |
|------|----------|--------|
| Call TG-83 Quote Follow-up | - | EMPTY (Wave 3) |
| Call TG-84 Invoice Collections | - | EMPTY (Wave 3) |
| Call TG-86 Plan Enrollment | - | EMPTY (Wave 4) |
| Call TG-88 On My Way | 2IB0qFPgBm0YxNtP | WIRED |
| Call TG-89 Invoice Delivery | 3gQKfREf9c9cyE0w | WIRED |

## Deviations from Plan

### [Rule 3 - Blocking] TG-05 nodes missing from live n8n

- **Found during:** Pre-Task 1 investigation
- **Issue:** The 5 Execute Sub-workflow nodes added in 01-02 existed in the local JSON but were not present in the live n8n workflow (the PUT in 01-02 likely failed silently)
- **Fix:** Pushed the local TG-05 JSON to n8n before proceeding with Task 1
- **Impact:** None -- all 14 nodes now live in n8n

### [Rule 2 - Missing Critical] No Twilio credentials in n8n

- **Found during:** Task 1 credential lookup
- **Issue:** No `twilioApi` credential type exists in n8n. Plan specified using Twilio native node with credential reference.
- **Resolution:** Created Twilio nodes without credential block. Nodes have `continueOnFail: true` so workflow won't crash. SMS will fail gracefully until Twilio credentials are added.
- **Action Required:** Vance needs to add Twilio credentials to n8n instance

## Commits

| Hash | Message | Files |
|------|---------|-------|
| 1fc20da | feat(01-03): deploy TG-88 On My Way SMS sub-workflow | TG-88-on-my-way-sms.json, TG-05-jobber-email-parser.json |
| 6be9b79 | feat(01-03): deploy TG-89 Invoice Delivery SMS+Email sub-workflow | TG-89-invoice-delivery.json, TG-05-jobber-email-parser.json |

## Next Phase Readiness

- TG-88 and TG-89 are deployed but inactive (sub-workflows don't need to be active to be called)
- Twilio credentials must be added to n8n before SMS sending works
- TG-05 remains inactive until TG-83/84/86 are created in Waves 3-4
- Plans 01-04 through 01-08 can proceed independently
