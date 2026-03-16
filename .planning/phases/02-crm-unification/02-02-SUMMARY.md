---
phase: 02-crm-unification
plan: 02
subsystem: automation
tags: [n8n, webhook, twilio, supabase, sms, routing, idempotency, consent, rate-limiting]

# Dependency graph
requires:
  - phase: 02-crm-unification/01
    provides: webhook_events table, dispatch_log table, sms_consent table, sms_sends table, TG-76 sub-workflow
provides:
  - TG-92 webhook router deployed to n8n (inactive) with 36 nodes
  - Single POST /tg-router endpoint for all inbound events
  - SMS intent classification (dispatch_confirm, dispatch_flag, opt_out, opt_in, help, general)
  - Idempotency deduplication via MessageSid
  - SMS consent gating and rate limiting (3/day) on DEFAULT branch
  - Dispatch confirmation routing (owner replies 1/2)
  - Web form routing to TG-01
affects: [02-03, 02-04, 02-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Webhook router pattern: single entry point with source detection and intent classification"
    - "respondToWebhook BEFORE executeWorkflow for Twilio 1-sec timeout compliance"
    - "Placeholder-based secret management: local JSON uses SUPABASE_SECRET_KEY etc, deploy script substitutes real values"
    - "Webhook event lifecycle: received -> processed/blocked_opted_out/rate_limited/unrouted with routed_to field"

key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-92-webhook-router.json

key-decisions:
  - "smsIntent classified in Detect Source node (not separate Classify node) — fewer nodes, cleaner data flow"
  - "dispatch_log PATCH uses status=eq.pending (most recent pending dispatch gets confirmed/flagged)"
  - "Local JSON keeps placeholders for git safety; real credentials injected only during n8n API deployment"
  - "TG-92 n8n workflow ID: 8LrUMA6H4ZoCmnj6"

patterns-established:
  - "Placeholder-based secret management: local JSON uses SUPABASE_SECRET_KEY etc, deploy script substitutes real values"
  - "Webhook event lifecycle: received -> processed/blocked_opted_out/rate_limited/unrouted with routed_to field"

# Metrics
duration: 9min
completed: 2026-03-16
---

# Phase 2 Plan 02: TG-92 Webhook Router Summary

**Central n8n webhook router (TG-92) with idempotency, SMS intent classification, consent gating, rate limiting, and sub-workflow dispatch to TG-76 and TG-01 — deployed inactive to n8n**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-16T05:22:35Z
- **Completed:** 2026-03-16T05:31:33Z
- **Tasks:** 2/2
- **Files modified:** 1

## Accomplishments
- Built 36-node TG-92 webhook router with corrected architecture (smsIntent from Detect Source, no redundant Classify node)
- TwiML response fires FIRST (parallel with intent classification) to satisfy Twilio 1-sec timeout
- SMS consent check + rate limit (3/day) gates DEFAULT branch before routing to TG-76
- Dispatch confirmation replies (owner "1"/"2") update dispatch_log with pending->confirmed/flagged
- Opt-out/opt-in handlers update sms_consent table and send Twilio confirmation SMS
- Web form submissions route to TG-01 lead capture workflow
- Unknown events logged as unrouted (never silently dropped)
- Deployed to n8n as INACTIVE (ID: 8LrUMA6H4ZoCmnj6) -- activation deferred to Plan 02-05

## Task Commits

1. **Task 1 (original skeleton):** `20dc2c0` (feat) - from prior session
2. **Task 2 (original branches):** `f11dab1` (feat) - from prior session
3. **Task 1+2 (corrected rebuild):** `1c0787f` (fix) - this session, rebuilt with plan-spec architecture + redeployed to n8n

**Prior fix commit:** `4ec027a` (fix) - replaced exposed secrets with placeholders

## Key References for Downstream Plans

| Reference | Value |
|-----------|-------|
| TG-92 workflow ID on n8n | `8LrUMA6H4ZoCmnj6` |
| TG-92 workflow name | `TG-92-webhook-router` |
| TG-92 webhook path | `/webhook/tg-router` |
| TG-92 status | INACTIVE (activation deferred to 02-05) |
| Linked: TG-76 (SMS handler) | `XvUjMIkGDYUuYJxK` via executeWorkflow |
| Linked: TG-01 (lead capture) | `1ydNC4gmQeGQrXQi` via executeWorkflow |
| Twilio credential ID | `cwxndVw60DCxqeNg` |

## Files Created/Modified
- `automation/n8n-workflows/TG-92-webhook-router.json` - Complete 36-node webhook router (local uses placeholders, n8n has real credentials)

## Decisions Made
- **Merged Tasks 1+2 in correction**: Previous session committed old architecture; this session rebuilt as single corrected commit
- **Placeholder-based secrets**: Local JSON uses `SUPABASE_SECRET_KEY`, `OWNER_PHONE_PLACEHOLDER`, `TWILIO_FROM_PLACEHOLDER` -- real values injected only during n8n API deployment
- **smsIntent in Detect Source**: Classifies intent immediately in the first Code node rather than using a separate Classify SMS Intent node -- cleaner data flow, fewer nodes
- **dispatch_log status=eq.pending**: Plan spec says pending (not sent) for dispatch confirmation matching

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Previous deployment used old architecture with wrong Detect Source code**
- **Found during:** Task 1 (skeleton verification)
- **Issue:** Deployed n8n workflow had old Detect Source without smsIntent, used separate Classify SMS Intent node, had wrong field names (raw_body vs raw_payload), dispatch_log used status=eq.sent instead of pending
- **Fix:** Rebuilt complete workflow with corrected architecture per plan spec, redeployed to n8n via PUT API
- **Files modified:** automation/n8n-workflows/TG-92-webhook-router.json
- **Verification:** 16/16 deployment checks pass
- **Committed in:** 1c0787f

---

**Total deviations:** 1 auto-fixed (architecture correction from prior incomplete session)
**Impact on plan:** Essential for correctness. No scope creep.

## Architecture Notes

### TG-92 Node Flow (36 nodes total)

```
Webhook POST /tg-router
  -> Detect Source (classify source + SMS intent in one node)
  -> Check Idempotency (webhook_events lookup by MessageSid)
  -> Evaluate Duplicate
  -> IF Duplicate? Yes: Respond 200 TwiML, Stop
  -> Log to webhook_events (processing_status: received)
  -> Prepare Route Data (carries smsIntent, from_phone, message_body, webhook_event_id)
  -> Switch on Source:
    CASE twilio_sms:
      -> Respond TwiML (IMMEDIATE - parallel with intent routing)
      -> Switch SMS Intent:
        dispatch_confirm: PATCH dispatch_log status=confirmed -> Update webhook_events
        dispatch_flag: PATCH dispatch_log status=flagged -> Update webhook_events
        opt_out: UPSERT sms_consent opted_out -> Send Twilio unsubscribe confirmation
        opt_in: UPSERT sms_consent opted_in -> Send Twilio subscribe confirmation
        default: Check Consent -> IF Opted Out? Log blocked_opted_out
                                : Rate Limit Check -> IF Limited? Log rate_limited
                                : Prepare TG-76 Input -> Execute TG-76 -> Update webhook_events routed_to=TG-76
    CASE web_form:
      -> Respond JSON { success: true } (IMMEDIATE - parallel)
      -> Prepare TG-01 Input -> Execute TG-01 -> Update webhook_events routed_to=TG-01
    DEFAULT (unknown):
      -> Respond JSON { success: true, status: logged }
      -> Update webhook_events processing_status=unrouted
```

## Next Phase Readiness

**Ready for 02-03 (TG-93 Auto-Dispatch):**
- TG-92 dispatch_confirm/dispatch_flag branches are wired to update dispatch_log
- dispatch_log table ready (from 02-01)

**Ready for 02-04 (TG-94 Unified SMS Sender):**
- TG-92 opt-out/opt-in branches manage sms_consent
- Rate limiting queries sms_sends table
- All SMS sends can be redirected through TG-94 in future

**Ready for 02-05 (Activation + Twilio Cutover):**
- TG-92 deployed but INACTIVE
- Webhook path: /webhook/tg-router
- Twilio just needs SMS webhook URL pointed to n8n

---
*Phase: 02-crm-unification*
*Completed: 2026-03-16*
