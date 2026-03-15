# STATE — TotalGuard Automation Gap Closer

**Last Updated**: 2026-03-15
**Current Phase**: Phase 2 — CRM Unification (next)
**Status**: Phase 1 COMPLETE + VERIFIED ✓ (12/12 must-haves passed)

---

## Current Position

Phase: 1 of 4 (Revenue Engine)
Plan: 8 of 8 complete
Status: Phase 1 COMPLETE
Last activity: 2026-03-15 -- Completed 01-07-PLAN.md (TG-86 Plan Enrollment + TG-87 Renewal Reminder)

Progress: [========] 8/8 plans (100%)

Executing Milestone 2: Close Every Gap Against TTW
- Phase 0 (Fix Existing): PLANNING -- ready to execute
- Phase 1 (Revenue Engine): COMPLETE -- all 8 plans executed
- Phase 2 (CRM Unification): Not started
- Phase 3 (SEO Domination): Not started
- Phase 4 (Intelligence Layer): Not started

## Key Decisions
- Milestone 1 (88 n8n workflows) partially complete -- workflows exist but many non-functional
- Full audit completed 2026-03-13: TG has 121+ automations across 3 layers (n8n, Vercel crons, self-healing SEO)
- 25 active TTW capabilities with zero TG equivalent identified
- Phase 0 is pure configuration -- no code changes needed
- Revenue-first ordering: Phase 1 before CRM before SEO before Intelligence
- 01-01: Used source='other' for fertilizer customer leads (not 'manual' -- not in CHECK constraint)
- 01-01: Created 4 fertilizer customers in leads table (didn't exist previously)
- 01-01: Permissive RLS on automation tables (service_role_all)
- 01-02: TG-05 remains inactive until sub-workflow IDs are populated (n8n can't activate with empty executeWorkflow refs)
- 01-03: TG-88/89 Twilio nodes created without credentials (no twilioApi cred in n8n yet -- needs Vance to add)
- 01-03: TG-05 activation still blocked by empty TG-83/84/86 workflowIds
- 01-04: Used source='phone' for missed call leads (missed_call not in CHECK constraint)
- 01-04: OpenPhone webhook must be registered via dashboard (API doesn't support POST /v1/webhooks)
- 01-04: Fixed n8n webhook v2 body parsing (raw.body), empty array handling (alwaysOutputData), source CHECK

## Critical Reference Data
- TG-05 Workflow ID: Jf5VYdWpDs3VgRzd
- TG-05 Sub-workflow node IDs: call-tg83, call-tg84, call-tg86, call-tg88, call-tg89
- TG-85 Workflow ID: VYKUqHGwurLvozsd (Missed Call Capture)
- TG-85 Webhook URL: https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call
- TG-88 Workflow ID: 2IB0qFPgBm0YxNtP (On My Way SMS)
- TG-89 Workflow ID: 3gQKfREf9c9cyE0w (Invoice Delivery SMS+Email)
- Quo Phone Number ID: PNjxXAkfhr (+16085356057)
- TG-83 Workflow ID: 9m2sID72Fz1PF0HY (Quote Follow-up Sequence)
- TG-84 Workflow ID: 63t7K6gAdW1aPupP (Invoice Collections Sequence)
- TG-91 Workflow ID: 0qSgxknCY9LTcKBU (Abandoned Quote SMS - ACTIVE)
- TG-90 Workflow ID: nzLYQlLtJ0j5elJf (Fertilizer Schedule Engine - inactive, needs Twilio creds)
- TG-86 Workflow ID: wJvqFV6PyGvUZccX (Plan Enrollment - sub-workflow of TG-05)
- TG-87 Workflow ID: 68jK9m7qXO5vQBef (Plan Renewal Reminder - daily cron)

## Blockers
- GBP API quota approval pending since 2026-03-08 (Google manual review)
- Several API keys need Vance to create accounts (Facebook, OpenWeatherMap, etc.)
- Jobber OAuth handshake needs manual browser flow
- TG-05 has all sub-workflow IDs populated (TG-83, TG-84, TG-86, TG-88, TG-89) -- activation blocked only by Twilio creds
- Twilio credentials need to be added to n8n for SMS sending to work
- OpenPhone webhook for call.completed needs manual registration in dashboard

## Next Actions
1. Phase 1 COMPLETE -- move to Phase 2 (CRM Unification) or Phase 0 (Fix Existing)
2. Register OpenPhone webhook in dashboard: URL=https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call, event=call.completed
3. Add Twilio credentials to n8n (manual -- Vance) -- blocks TG-05 activation, TG-88, TG-89, TG-90 SMS sending
4. Execute Phase 0 plan (12 configuration tasks) -- still pending
5. Activate TG-87 renewal reminder after verifying customer_subscriptions has renewal_reminder columns

## Session Continuity
Last session: 2026-03-15T05:29Z
Stopped at: Completed 01-07-PLAN.md -- Phase 1 Revenue Engine 100% complete
Resume file: None
