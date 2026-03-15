# STATE — TotalGuard Automation Gap Closer

**Last Updated**: 2026-03-15
**Current Phase**: Phase 1 — Revenue Engine
**Status**: In progress — executing plans

---

## Current Position

Phase: 1 of 4 (Revenue Engine)
Plan: 4 of 8 complete
Status: In progress
Last activity: 2026-03-15 -- Completed 01-04-PLAN.md (TG-85 Missed Call Capture via Quo webhook + auto-reply SMS)

Progress: [====----] 4/8 plans (50%)

Executing Milestone 2: Close Every Gap Against TTW
- Phase 0 (Fix Existing): PLANNING -- ready to execute
- Phase 1 (Revenue Engine): EXECUTING -- 01-01 COMPLETE, 01-02 COMPLETE, 01-03 COMPLETE, 01-04 COMPLETE, 01-05 through 01-08 pending
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

## Blockers
- GBP API quota approval pending since 2026-03-08 (Google manual review)
- Several API keys need Vance to create accounts (Facebook, OpenWeatherMap, etc.)
- Jobber OAuth handshake needs manual browser flow
- TG-05 inactive until TG-83/84/86 are created and IDs backfilled
- Twilio credentials need to be added to n8n for SMS sending to work
- OpenPhone webhook for call.completed needs manual registration in dashboard

## Next Actions
1. Execute 01-05 through 01-08 plans (Phase 1 Revenue Engine Wave 2-4)
2. Register OpenPhone webhook in dashboard: URL=https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call, event=call.completed
3. After TG-83/84/86 created, backfill TG-05 workflowId fields and activate
4. Add Twilio credentials to n8n (manual -- Vance)
5. Execute Phase 0 plan (12 configuration tasks) -- still pending

## Session Continuity
Last session: 2026-03-15T05:05Z
Stopped at: Completed 01-04-PLAN.md
Resume file: None
