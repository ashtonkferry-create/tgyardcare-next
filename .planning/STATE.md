# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Transform tgyardcare.com into a billion-dollar brand experience that converts at 3-5x current rates while protecting existing SEO rankings and lead flow.
**Current focus:** Phase 2 — CRM Unification (M2)

## Current Position

Phase: 2 of 4 (CRM Unification) — M2
Plan: 5 of 5 complete (all waves complete)
Status: Phase 2 COMPLETE — outbound SMS pending A2P 10DLC carrier approval
Last activity: 2026-03-16 — Completed 02-05-PLAN.md (Activation + Twilio Cutover) + spreadsheet stack (quick tasks 003-007)

Progress: [==================] 15/15 plans (Phase 2 complete)

Executing Milestone 2: CRM Unification
- Phase 0 (Fix Existing): Ready to execute
- Phase 1 (Revenue Engine): COMPLETE (9/9 plans)
- Phase 2 (CRM Unification): COMPLETE (5/5 plans, all waves)
  - 02-01: DONE — DB tables + TG-76 conversion [wave 1]
  - 02-02: DONE — TG-92 Webhook Router (n8n ID: 8LrUMA6H4ZoCmnj6, ACTIVE) [wave 2]
  - 02-03: DONE — TG-93 Auto-Dispatch (n8n ID: JBZCSMGKzBoTz7se, ACTIVE) [wave 2]
  - 02-04: DONE — TG-94 (AprqI2DgQA8lehij) + TG-95 (IUDLrQrAkcLFLsIC) + TG-76 updated [wave 2]
  - 02-05: DONE — All 5 workflows active, Twilio confirmed on tg-router, inbound verified [wave 3]
- Phase 3-4: Not started

Parallel: Milestone 3 (Billionaire Brand Transformation)
- Phase 5-9: Not started

## Performance Metrics

**Velocity:**
- Total plans completed: 14 (9 M2-Phase 1 + 5 M2-Phase 2)
- Last plan duration: ~9 minutes (02-03)
- Total execution time: N/A

*Updated after each plan completion*

## Accumulated Context

### Decisions

- [M2 Phase 2]: Single webhook router (TG-92) replaces individual webhook endpoints
- [M2 Phase 2]: TG-76 becomes sub-workflow callable via executeWorkflowTrigger — DONE
- [M2 Phase 2]: ALL customer SMS goes through unified sender (TG-94)
- [M2 Phase 2]: Owner dispatch SMS bypasses unified sender (no consent needed)
- [M2 Phase 2]: Twilio currently points to demo.twilio.com — zero-risk conversion
- [M2 Phase 2-01]: sms_sends table pre-existed from Phase 1 with richer schema (message_body, from_phone, etc.)
- [M2 Phase 2-01]: TG-76 workflow ID on n8n: XvUjMIkGDYUuYJxK
- [M2 Phase 2-01]: Twilio credential ID on n8n: cwxndVw60DCxqeNg
- [M2 Phase 2-01]: Live TG-76 had revoked Supabase key — fixed during conversion
- [M2 Phase 2-02]: TG-92 workflow ID on n8n: 8LrUMA6H4ZoCmnj6 (INACTIVE)
- [M2 Phase 2-02]: TG-92 webhook path: /webhook/tg-router
- [M2 Phase 2-02]: TG-01 workflow ID on n8n: 1ydNC4gmQeGQrXQi (for web form routing)
- [M2 Phase 2-02]: TwiML response fires before executeWorkflow (Twilio 1-sec timeout satisfied)
- [M2 Phase 2-02]: Rate limit: 3 automated SMS per customer per 24 hours
- [M2 Phase 2-02]: CORRECTED: Rebuilt TG-92 with smsIntent in Detect Source (no separate Classify node), dispatch_log uses status=eq.pending
- [M2 Phase 2-02]: Local JSON uses placeholders (SUPABASE_SECRET_KEY, OWNER_PHONE_PLACEHOLDER, TWILIO_FROM_PLACEHOLDER) — real values injected at deploy time only
- [M2 Phase 2-04]: TG-94 workflow ID on n8n: AprqI2DgQA8lehij (ACTIVE) — unified SMS sender
- [M2 Phase 2-04]: TG-95 workflow ID on n8n: IUDLrQrAkcLFLsIC (ACTIVE) — unified email sender
- [M2 Phase 2-04]: TG-76 customer replies now route through TG-94 (consent + rate limit enforced)
- [M2 Phase 2-04]: TG-76 "Forward to Owner" node unchanged (owner phones bypass TG-94)
- [M2 Phase 2-04]: Resend API key hardcoded in TG-95 (no native n8n credential for Resend)
- [M2 Phase 2-04]: TG-94 input: {to_phone, message_body, workflow_name, message_type}
- [M2 Phase 2-04]: TG-95 input: {to_email, subject, html_body, workflow_name, email_type}
- [M2 Phase 2-03]: TG-93 workflow ID on n8n: JBZCSMGKzBoTz7se (ACTIVE)
- [M2 Phase 2-03]: TG-93 dispatches on new_request, job_scheduled, plan_accepted from TG-05
- [M2 Phase 2-03]: Dispatch SMS includes customer name, address, service, Google Maps link
- [M2 Phase 2-03]: 2-hour follow-up reminder if dispatch_log status still pending
- [M2 Phase 2-05]: TG-92 ACTIVE — Twilio webhook was already on tg-router, confirmed executions 272+273
- [M2 Phase 2-05]: Outbound SMS pending Twilio A2P 10DLC campaign approval (carrier block, not code)
- [M2 Phase 2-05]: fullResponse:true required on any Supabase HTTP GET node that may return empty array
- [M2 Phase 2-05]: Switch node expressions must use ={{ $json.fieldName }} — shorthand ={{ .fieldName }} silently fails in n8n
- [M3 Roadmap]: 5 phases (5-9) derived from 64 requirements across 10 categories
- [M3 Roadmap]: Phase ordering follows hard dependency chain: Foundation -> Brand -> Conversion -> Retention -> Content
- [M3 Roadmap]: Typography (TYPO) grouped with Foundation (Phase 5) because design tokens must exist before visual work
- [M3 Roadmap]: Portal (PORT) and Referral (REF) grouped together — referral requires portal auth infrastructure
- [M3 Research]: MDX rejected in favor of extending existing Supabase blog_posts table
- [M3 Research]: Jobber client hub styling needs investigation before Phase 8 (custom vs embed decision)

### Pending Todos

None yet.

### Blockers/Concerns

- WI Parcel REST API endpoint needs testing with real Madison addresses before Phase 7 planning
- Jobber client hub styling capability must be investigated before Phase 8 planning
- TypeScript error count unknown until `tsc --noEmit` runs in Phase 5

### Quick Tasks Completed

| # | Description | Date | Directory |
|---|-------------|------|-----------|
| 001 | 2026 TotalGuard Job Log Book (.xlsx) — 13-tab spreadsheet with dropdowns, conditional formatting, annual summary | 2026-03-15 | [001-2026-totalguard-job-log-book-xlsx](./quick/001-2026-totalguard-job-log-book-xlsx/) |
| 002 | 2026 TotalGuard Expense Tracker (.xlsx) — 5-tab expense system with Schedule C tax tracking, mileage deduction, monthly summaries | 2026-03-15 | [002-2026-totalguard-expense-tracker-xlsx](./quick/002-2026-totalguard-expense-tracker-xlsx/) |
| 003 | Revenue & Income Tracker (.xlsx) — 3-tab revenue log with service breakdown, monthly summary, collection rates | 2026-03-16 | — |
| 004 | P&L Dashboard (.xlsx) — 2-tab monthly P&L with quarterly summary, gross/net margin tracking | 2026-03-16 | — |
| 005 | Accounts Receivable (.xlsx) — 2-tab AR tracker with aging summary, days outstanding, follow-up dates | 2026-03-16 | — |
| 006 | Equipment & Asset Inventory (.xlsx) — 2-tab asset tracker with depreciation, maintenance log, 4 items pre-populated | 2026-03-16 | — |
| 007 | Customer Database (.xlsx) — 2-tab CRM lite with customer summary, by-city/by-source breakdowns | 2026-03-16 | — |

## Session Continuity

Last session: 2026-03-16
Stopped at: Phase 2 CRM Unification COMPLETE + spreadsheet stack (7 total)
Resume file: None
