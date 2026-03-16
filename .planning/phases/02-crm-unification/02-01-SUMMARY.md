# Phase 2 Plan 01: CRM Foundation Tables + TG-76 Conversion Summary

**One-liner:** Three Supabase tables for webhook routing/dispatch/SMS tracking + TG-76 converted from webhook to executeWorkflowTrigger sub-workflow

## Metadata

| Field | Value |
|-------|-------|
| Phase | 02-crm-unification |
| Plan | 01 |
| Subsystem | automation, database |
| Duration | ~8 minutes |
| Completed | 2026-03-16 |
| Tasks | 2/2 |

## What Was Done

### Task 1: Supabase Tables Created

Three new tables deployed to `lwtmvzhwekgdxkaisfra.supabase.co`:

1. **webhook_events** — Logs every inbound webhook with idempotency_key for dedup. Indexes on source and created_at.
2. **dispatch_log** — Tracks job dispatch notifications to owner with full lifecycle (sent, response, reminder, status). Indexes on status and created_at.
3. **sms_sends** — Pre-existed from Phase 1 with richer schema than planned (message_body, from_phone, message_type, external_message_id, delivered_at, failed_at, failure_reason). CREATE IF NOT EXISTS preserved existing schema. Index on to_phone+sent_at for rate limiting queries.

All tables have RLS enabled with service_role full access policy.

**Confirmed existing:** sms_consent table from Phase 1 still present.

### Task 2: TG-76 Sub-Workflow Conversion

Converted TG-76 from standalone webhook workflow to executeWorkflowTrigger sub-workflow.

**Removed:**
- `n8n-nodes-base.webhook` trigger node (was "Inbound SMS Webhook")
- `n8n-nodes-base.respondToWebhook` node (was "TwiML Auto-Reply")

**Added:**
- `n8n-nodes-base.executeWorkflowTrigger` (v1) — receives `{from, messageText, messageSid}` from TG-92
- `n8n-nodes-base.if` node — conditionally forwards to owner only for general/quote_request intents

**Updated:**
- Parse Inbound SMS reads from `$input.first().json` (trigger data) instead of `$input.first().json.body` (webhook body)
- Build Smart Reply now returns `{reply, forward_to_owner, customer_id, intent}` as output data
- Supabase URL hardcoded (was `$vars.TG_SUPABASE_URL`)
- Supabase secret key updated to rotated key (old one was revoked)
- Twilio credential ID set to `cwxndVw60DCxqeNg` (actual n8n credential)
- Owner phone numbers hardcoded from live workflow values

**All 8 keyword intents preserved:** opt_out, opt_in, help, quote_request, schedule_request, confirm, cancel, general

## Key References for Downstream Plans

| Reference | Value |
|-----------|-------|
| TG-76 workflow ID on n8n | `XvUjMIkGDYUuYJxK` |
| TG-76 workflow name | `TG-76-two-way-sms` |
| Twilio credential ID | `cwxndVw60DCxqeNg` |
| webhook_events table | Live, RLS enabled |
| dispatch_log table | Live, RLS enabled |
| sms_sends table | Live (pre-existed from Phase 1, richer schema) |
| sms_consent table | Live (Phase 1, confirmed present) |

## Commits

| Hash | Message |
|------|---------|
| `7dc37c2` | feat(02-01): create webhook_events, dispatch_log, sms_sends tables |
| `30435b3` | feat(02-01): convert TG-76 from webhook to executeWorkflowTrigger sub-workflow |
| `357f077` | fix(02-01): document sms_sends pre-existing schema in migration |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] sms_sends table had different schema than planned**
- **Found during:** Task 1 verification
- **Issue:** Plan specified `message TEXT` column but pre-existing sms_sends table from Phase 1 uses `message_body TEXT` with additional columns (from_phone, message_type, external_message_id, delivered_at, failed_at, failure_reason)
- **Fix:** `CREATE TABLE IF NOT EXISTS` correctly preserved the existing richer schema. Updated migration SQL comments to document this.
- **Files modified:** supabase/migrations/20260316_phase2_crm_tables.sql
- **Commit:** 357f077

**2. [Rule 1 - Bug] Live TG-76 had revoked Supabase secret key**
- **Found during:** Task 2 inspection of live workflow
- **Issue:** Live TG-76 on n8n used `sb_secret_QlNjUO_5qHPcZRbdoCqZ3w_w72F3OQ3` which was revoked on 2026-03-15 after GitHub exposure
- **Fix:** Updated to current rotated key during the conversion deployment
- **Files modified:** automation/n8n-workflows/TG-76-two-way-sms.json (deployed to n8n)
- **Commit:** 30435b3

**3. [Rule 2 - Missing Critical] Added IF node for conditional owner forwarding**
- **Found during:** Task 2 conversion
- **Issue:** Original workflow always forwarded to owner via connection from Build Smart Reply. The converted version needs explicit conditional logic since the respondToWebhook and forward-to-owner ran in parallel before.
- **Fix:** Added IF Forward to Owner node that checks `forward_to_owner` boolean
- **Files modified:** automation/n8n-workflows/TG-76-two-way-sms.json
- **Commit:** 30435b3

## Next Phase Readiness

**Ready for 02-02 (TG-92 Webhook Router):**
- TG-76 workflow ID: `XvUjMIkGDYUuYJxK` (needed for executeWorkflow call)
- webhook_events table ready for logging
- TG-76 accepts `{from, messageText, messageSid}` input and returns `{reply, forward_to_owner, customer_id, intent}`

**Ready for 02-03 (TG-93 Auto-Dispatch):**
- dispatch_log table ready for tracking

**Ready for 02-04 (TG-94 Unified SMS Sender):**
- sms_sends table ready for rate limiting queries
