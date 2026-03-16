# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Transform tgyardcare.com into a billion-dollar brand experience that converts at 3-5x current rates while protecting existing SEO rankings and lead flow.
**Current focus:** Phase 3 COMPLETE — ready for Phase 4

## Current Position

Phase: 3 of 4 (SEO Domination) — COMPLETE
Plan: 5 of 5 complete
Status: Phase 3 complete
Last activity: 2026-03-16 — Completed 03-05-PLAN.md (Weekly SEO Summary)

Progress: [====================] 20/20 plans

Executing Milestone 2: CRM Unification
- Phase 0 (Fix Existing): Ready to execute
- Phase 1 (Revenue Engine): COMPLETE (9/9 plans)
- Phase 2 (CRM Unification): COMPLETE (5/5 plans, all waves)
  - 02-01: DONE — DB tables + TG-76 conversion [wave 1]
  - 02-02: DONE — TG-92 Webhook Router (n8n ID: 8LrUMA6H4ZoCmnj6, ACTIVE) [wave 2]
  - 02-03: DONE — TG-93 Auto-Dispatch (n8n ID: JBZCSMGKzBoTz7se, ACTIVE) [wave 2]
  - 02-04: DONE — TG-94 (AprqI2DgQA8lehij) + TG-95 (IUDLrQrAkcLFLsIC) + TG-76 updated [wave 2]
  - 02-05: DONE — All 5 workflows active, Twilio confirmed on tg-router, inbound verified [wave 3]
- Phase 3 (SEO Domination): COMPLETE (5/5 plans, all waves)
  - 03-01: DONE — Migration 071 (index_coverage_log + seo_content_gaps) + TG-96 (Vt8uzm8RGy3QXv3B, ACTIVE) [wave 1]
  - 03-02: DONE — TG-103 (igtaJUnj9xDXcV2B) + TG-104 (qzRRPT7goiYxJsxL) content pipeline [wave 1]
  - 03-03: DONE — TG-97 (NPxVFCf05a15PjBH, ACTIVE) rank drop detector + TG-100 (pending deploy) index coverage [wave 2]
  - 03-04: DONE — TG-98 + TG-99 + TG-101 SEO intelligence workflows [wave 2]
  - 03-05: DONE — TG-102 weekly SEO summary (pending deploy) [wave 3]
- Phase 4: Not started

Parallel: Milestone 3 (Billionaire Brand Transformation)
- Phase 5-9: Not started

## Performance Metrics

**Velocity:**
- Total plans completed: 20 (9 M2-Phase 1 + 5 M2-Phase 2 + 5 Phase 3 + 1 Phase 3 wave 3)
- Last plan duration: ~15 minutes (03-05)
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
- [Phase 3-02]: TG-103 workflow ID on n8n: igtaJUnj9xDXcV2B (ACTIVE) -- city content generator
- [Phase 3-02]: TG-104 workflow ID on n8n: qzRRPT7goiYxJsxL (ACTIVE) -- content quality checker
- [Phase 3-02]: 15 active cities in seo_target_cities (not 12)
- [Phase 3-02]: Claude Sonnet 4.6 used for content generation via HTTP Request
- [Phase 3-02]: blog_posts table has ai_generated, ai_model, ai_generated_at, word_count, reading_time_minutes columns
- [Phase 3-02]: TG-104 quality thresholds: 800+ words, 3+ H2s, 2+ local refs, CTA required, no placeholders
- [Phase 3-01]: TG-96 workflow ID on n8n: Vt8uzm8RGy3QXv3B (ACTIVE) -- daily GSC sync
- [Phase 3-01]: TG-96 cron: 0 11 * * * (6 AM CDT daily)
- [Phase 3-01]: TG-97 placeholder is Code node on n8n -- swap to executeWorkflow when TG-97 deployed
- [Phase 3-01]: GSC Bearer token is placeholder -- needs Google OAuth setup before first run
- [Phase 3-01]: Migration 071 applied -- index_coverage_log + seo_content_gaps tables created
- [Phase 3-01]: n8n activate endpoint: POST /api/v1/workflows/{id}/activate (not PATCH, not PUT)
- [Phase 3-03]: TG-97 workflow ID on n8n: NPxVFCf05a15PjBH (ACTIVE) -- rank drop + CTR anomaly detector
- [Phase 3-03]: TG-97 is sub-workflow triggered by TG-96 via executeWorkflow (not cron)
- [Phase 3-03]: executeWorkflowTrigger must use typeVersion 1 (v1.1 fails activation with "missing required parameters")
- [Phase 3-03]: Alert thresholds: urgent >= 10 pos drop + >= 50 impressions, warning 5-9 pos + >= 20 impressions, CTR > 30% drop
- [Phase 3-03]: TG-100 index coverage monitor built but deployment blocked by n8n API rate limit
- [Phase 3-03]: TG-96 local JSON updated with TG-97 real ID; n8n update pending API access
- [Phase 3-03]: n8n API rate limit: ~10 calls per session before 401 lockout (plan deployments carefully)
- [Phase 3-04]: TG-98 content gap detector — queries GSC for impressions without dedicated pages, upserts to seo_content_gaps
- [Phase 3-04]: TG-99 ranking opportunity detector — report-only, no DB storage (targets existing pages pos 4-20)
- [Phase 3-04]: TG-101 content staleness checker — checks blog_posts + seo_location_pages for updated_at < 180 days
- [Phase 3-04]: All three workflows send weekly email reports via TG-95 (IUDLrQrAkcLFLsIC)
- [Phase 3-04]: TG-98/TG-99 cron: 0 12 * * 1 (Monday 7am CT), TG-101 cron: 0 5 * * 0 (Sunday midnight CT)
- [Phase 3-04]: Existing TG-99-blog-auto-publisher.json is separate workflow; TG-99-ranking-opportunity-detector.json coexists
- [Phase 3-05]: TG-102 weekly SEO summary — aggregates GSC week-over-week + content gaps + rank alerts into Monday 8 AM email
- [Phase 3-05]: TG-102 pulls GSC data directly (not from gsc_queries table) for freshest weekly aggregate
- [Phase 3-05]: TG-102 cron: 0 13 * * 1 (Monday 8 AM CT), runs 1 hour after TG-98/99
- [Phase 3-05]: Phase 3 complete — 9 workflows total (TG-96 through TG-104), 4 active on n8n, 5 pending deploy

### Pending Todos

None yet.

### Blockers/Concerns

- WI Parcel REST API endpoint needs testing with real Madison addresses before Phase 7 planning
- Jobber client hub styling capability must be investigated before Phase 8 planning
- TypeScript error count unknown until `tsc --noEmit` runs in Phase 5
- n8n API rate limit hit during 03-03: TG-100 deployment + TG-96 update pending when API access restores

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
Stopped at: Completed 03-05-PLAN.md (Weekly SEO Summary) — Phase 3 COMPLETE
Resume file: None
