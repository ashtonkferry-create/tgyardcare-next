# Phase 2: CRM Unification - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build n8n workflows that unify all CRM communication: a single webhook router as the nervous system and notification-based auto-dispatch to the owner when jobs are created or quotes are approved. No new UI — this is pure automation infrastructure. No bonus calculator (no staff), no payment installments (Jobber handles invoicing).

</domain>

<decisions>
## Implementation Decisions

### Webhook Router
- Single n8n webhook endpoint receives ALL inbound events (Jobber, Twilio SMS replies, web form submissions)
- Routes by `event_type` or `source` field in payload
- Jobber events handled: job.created, job.completed, invoice.sent, payment.received, quote.approved
- Twilio inbound SMS routed based on keyword matching (YES/NO/STOP/HELP) and phone number lookup
- Unknown/unmatched events logged to Supabase `webhook_events` table for debugging — never silently dropped
- Idempotency: check for duplicate webhook_id before processing

### Auto-Dispatch
- Dispatch is **notification-based, not fully automated** — TotalGuard is owner-operated
- Trigger: Jobber `job.created` or `quote.approved` webhook → SMS to owner with job details (customer name, address, service type, scheduled time)
- Owner confirms via SMS reply ("1" to confirm, "2" to flag issue)
- If no confirmation within 2 hours → follow-up SMS reminder
- Log all dispatch events to Supabase `dispatch_log` table
- Dispatch SMS should include a Google Maps link to the customer address

### Unified Communication Layer
- All outbound SMS routes through single helper function that checks `can_send_sms()` consent before sending
- All outbound email routes through Resend with `hello@tgyardcare.com` sender
- All SMS sends logged to `sms_sends` table (already exists)
- Rate limiting: max 3 automated messages per customer per day across all workflows

### Claude's Discretion
- Webhook signature verification implementation
- Retry logic specifics for failed HTTP calls within workflows
- `dispatch_log` table schema
- `webhook_events` table schema (if not already in Supabase)

</decisions>

<specifics>
## Specific Ideas

- Webhook router should be the ONLY public-facing n8n webhook — all other workflows called internally via executeWorkflow

</specifics>

<deferred>
## Deferred Ideas

- Full crew scheduling calendar (would need a frontend — Phase 8 territory)
- Customer-facing dispatch tracking ("Your crew is 10 minutes away" with live map) — future phase
- Multi-crew territory routing at scale — not needed until 5+ crew members
- Bonus calculator — no staff currently
- Payment installments — Jobber handles invoicing/payments

</deferred>

---

*Phase: 02-crm-unification*
*Context gathered: 2026-03-16*
*Updated: 2026-03-16 — removed bonus calculator and payment installments (out of scope)*
