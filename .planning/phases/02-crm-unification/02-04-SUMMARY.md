---
phase: 02-crm-unification
plan: 04
subsystem: automation
tags: [n8n, twilio, resend, sms, email, sub-workflow, consent, rate-limiting]

# Dependency graph
requires:
  - phase: 02-01
    provides: sms_sends table, can_send_sms() RPC, TG-76 converted to sub-workflow
provides:
  - TG-94 unified SMS sender sub-workflow (consent + rate limiting + logging)
  - TG-95 unified email sender sub-workflow (Resend with retry)
  - TG-76 auto-reply routing through TG-94
affects: [02-05, all-future-sms-workflows, all-future-email-workflows]

# Tech tracking
tech-stack:
  added: []
  patterns: [sub-workflow-based-sms-sending, sub-workflow-based-email-sending, consent-before-send, daily-rate-limiting]

key-files:
  created:
    - automation/n8n-workflows/TG-94-unified-sms-sender.json
    - automation/n8n-workflows/TG-95-unified-email-sender.json
  modified:
    - automation/n8n-workflows/TG-76-two-way-sms.json

key-decisions:
  - "TG-94 workflow ID: AprqI2DgQA8lehij"
  - "TG-95 workflow ID: IUDLrQrAkcLFLsIC"
  - "Daily SMS rate limit set to 3 per phone number"
  - "TG-76 customer auto-reply routes through TG-94 (consent + rate check)"
  - "Forward to Owner Twilio node left unchanged (owner dispatch bypasses TG-94)"
  - "Resend API key hardcoded in HTTP Request headers (no n8n credential store)"

patterns-established:
  - "All customer-facing SMS must call TG-94 via executeWorkflow"
  - "All transactional email must call TG-95 via executeWorkflow"
  - "Consent check + rate limit + logging happens transparently in sub-workflow"

# Metrics
duration: ~8min
completed: 2026-03-16
---

# Phase 2 Plan 04: Unified SMS/Email Sender Summary

**TG-94 SMS sender with consent/rate-limiting, TG-95 email sender with Resend retry, TG-76 updated to route customer auto-replies through TG-94**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-16T05:19:30Z
- **Completed:** 2026-03-16T05:28:00Z
- **Tasks:** 3/3
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

### Task 1: TG-94 Unified SMS Sender

Created and deployed as executeWorkflowTrigger sub-workflow (17 nodes).

**Input:** `{to_phone, message_body, workflow_name, message_type}`

**Pipeline:**
1. Validate Input -- rejects missing to_phone or message_body
2. Check Consent -- Supabase RPC `can_send_sms(phone_number)`
3. Check Rate Limit -- count sms_sends for today via content-range header
4. Send SMS via Twilio -- continueOnFail enabled for error routing
5. Check Twilio Error -- routes to success or failure logging
6. Log to sms_sends -- full metadata (to_phone, from_phone, message_type, workflow_name, status, external_message_id)
7. Return -- `{sent: true, message_sid}` or `{sent: false, reason}`

**Rejection reasons:** `no_consent`, `rate_limited` (>=3/day), `twilio_error`, `missing_params`

### Task 2: TG-95 Unified Email Sender

Created and deployed as executeWorkflowTrigger sub-workflow (10 nodes).

**Input:** `{to_email, subject, html_body, workflow_name, email_type}`

**Pipeline:**
1. Validate Input -- rejects missing to_email, subject, or html_body
2. Send via Resend API -- `POST https://api.resend.com/emails`, continueOnFail
3. Check result -- success returns email_id, failure triggers retry
4. Wait 10s -- delay before retry attempt
5. Retry once -- second Resend API call
6. Return -- `{sent: true, email_id}` or `{sent: false, error}`

**From:** `TotalGuard <hello@tgyardcare.com>`

### Task 3: TG-76 Updated for TG-94 Routing

Added 3 nodes to TG-76 to send customer auto-replies via TG-94:
1. **Prepare TG-94 Payload** -- shapes data from Build Smart Reply
2. **Send Reply via TG-94** -- executeWorkflow to AprqI2DgQA8lehij
3. **Merge TG-94 Result** -- combines TG-94 response with forward_to_owner flag

Forward to Owner Twilio node unchanged (owner SMS exempt from consent/rate limiting).

## Task Commits

| Hash | Message |
|------|---------|
| `7fbbf6b` | feat(02-04): create TG-94 unified SMS sender sub-workflow |
| `6e95416` | feat(02-04): create TG-95 unified email sender sub-workflow |
| `86e934e` | feat(02-04): update TG-76 to route customer SMS through TG-94 |

## Key References for Downstream Plans

| Reference | Value |
|-----------|-------|
| TG-94 workflow ID | `AprqI2DgQA8lehij` |
| TG-95 workflow ID | `IUDLrQrAkcLFLsIC` |
| TG-94 input contract | `{to_phone, message_body, workflow_name, message_type}` |
| TG-95 input contract | `{to_email, subject, html_body, workflow_name, email_type}` |
| TG-94 output contract | `{sent: bool, message_sid?, reason?}` |
| TG-95 output contract | `{sent: bool, email_id?, error?}` |
| SMS daily rate limit | 3 per customer per day |
| Email from address | `TotalGuard <hello@tgyardcare.com>` |

## Decisions Made

1. Daily SMS rate limit: 3 messages per phone number per day
2. Resend API key hardcoded in TG-95 HTTP Request headers (no native n8n credential for Resend)
3. TG-76 customer auto-replies route through TG-94 for consent + rate limit enforcement
4. Forward to Owner Twilio node unchanged -- owner notifications bypass unified sender

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added input validation to TG-94**
- **Found during:** Task 1 design
- **Issue:** Plan flow started from consent check, but missing/empty to_phone or message_body would cause downstream failures
- **Fix:** Added Validate Input code node as first step with early return
- **Files modified:** TG-94-unified-sms-sender.json
- **Commit:** 7fbbf6b

**2. [Rule 2 - Missing Critical] Added Twilio error routing to TG-94**
- **Found during:** Task 1 design
- **Issue:** Plan specified logging on failure but not how errors would be caught. Without continueOnFail, Twilio errors halt the workflow.
- **Fix:** Set continueOnFail on Twilio node, added Check Twilio Error + IF Twilio OK branching
- **Files modified:** TG-94-unified-sms-sender.json (deployed update)
- **Commit:** 7fbbf6b

**3. [Rule 3 - Blocking] No customer-facing Twilio nodes in TG-76 to replace**
- **Found during:** Task 3 analysis
- **Issue:** Plan said "find Twilio SMS nodes that send to CUSTOMER phones" but TG-76 had none -- only Forward to Owner. Auto-replies were returned as data to caller, never sent.
- **Fix:** Added Prepare TG-94 Payload + executeWorkflow + Merge Result nodes to actively send customer auto-replies via TG-94
- **Files modified:** TG-76-two-way-sms.json
- **Commit:** 86e934e

---
**Total deviations:** 3 auto-fixed (2 missing critical, 1 blocking)
**Impact on plan:** All fixes essential for correct operation. No scope creep.

## Next Phase Readiness

**Ready for 02-05 (Activation + Twilio Cutover):**
- TG-94 active and callable from any workflow (ID: `AprqI2DgQA8lehij`)
- TG-95 active and callable from any workflow (ID: `IUDLrQrAkcLFLsIC`)
- TG-76 customer SMS now goes through consent + rate limiting pipeline
- TG-92 (webhook router) can call TG-94 directly for SMS and TG-95 for email
- TG-93 (auto-dispatch) can call TG-95 for email notifications

---
*Phase: 02-crm-unification | Plan: 04 | Completed: 2026-03-16*
