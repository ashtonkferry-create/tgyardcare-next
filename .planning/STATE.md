# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Build an autonomous business nervous system — acquires customers, converts leads, delivers excellence, retains accounts, amplifies brand, reports via Telegram.
**Current focus:** M4 TG-OS Business Automation — Phase 14 next (Review Generation Machine)

## Current Position

Phase: 14 of 20 (Review Generation Machine)
Plan: 0 of 3 in Phase 14 (Plans created, ready to execute)
Status: Phase 13 COMPLETE, Phase 14 PLANNED
Last activity: 2026-03-19 — Completed all Phase 13 plans (13-01, 13-02, 13-03)

Progress M4: [████████████░░░░░░░░░░░░░░░░░░░░] 14/62 requirements (Phase 13 COMPLETE)
Progress M3: [████████████████████████████████] 36/36 plans (COMPLETE)
Progress M2: [█████████████████████████████████] 34/34 plans (COMPLETE)

## Performance Metrics

**Velocity:**
- Total plans completed: 78 (M2: 34 + M3: 36 + M4: 8)
- M4 Phase 11: 5 requirements complete (INFRA-01, INFRA-02, 11-02 key audit, 11-03 auto-posting, 11-01 TG-92/TG-113 activation)
- M4 Phase 12: 4 plans complete (12-01 instant response, 12-02 speed-to-lead, 12-03 follow-up sequence, 12-04 lead scoring) -- PHASE COMPLETE

## Accumulated Context

### Decisions

- [M4 Phase 11]: Clean slate approach — deactivated ALL 99 workflows, selectively reactivating
- [M4 Phase 11]: 6 infrastructure workflows reactivated: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95
- [M4 Phase 11]: TG-92/TG-113 HTTP 400 was NOT stale keys — was unpublished sub-workflow dependencies
- [M4 Phase 11]: TG-76 had stale workflow reference to old TG-94 duplicate (mrAA8JWx8XyZNvGR) — fixed to AprqI2DgQA8lehij
- [M4 Phase 11]: TG-01 had stale Supabase key in Update Lead with Brevo ID node — fixed
- [M4 Phase 11]: 10 workflows now active: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01
- [M4 Phase 11]: TG-05 can't be deactivated via API (IMAP listener blocks) — kept active intentionally
- [M4 Phase 11]: Facebook page is HACKED — no Facebook workflows to be activated
- [M4 Phase 11]: Auto-posting via Upload-Post ($16/mo) or LATE ($19/mo) recommended
- [M4 Phase 11]: Facebook URL fixed across 19 files in codebase
- [M4 Phase 11]: NAP consistency verified clean — (608) 535-6057 consistent everywhere
- [M4 Phase 11]: Supabase key audit PASS — all 127 workflow JSONs clean, zero real keys
- [M4 Phase 11]: Auto-posting template uses HTTP Request node (works with either Upload-Post or LATE)
- [M4 Phase 11]: Facebook excluded at code level in TG-AUTOPOST Validate Input node
- [M4 Phase 11]: TG-94 has duplicate URL bug (https://https://lwtmvzhwekgdxkaisfra.supabase.co) — needs future fix
- [M4 Phase 11]: Two copies of TG-94 exist — old one (mrAA8JWx8XyZNvGR) left inactive
- [M4 General]: No Jobber API — all Jobber data via email parsing (TG-05 IMAP)
- [M4 General]: No Stripe — Jobber Payments handles billing
- [M4 General]: No Vapi — organic human calls only
- [M4 General]: GBP API pending verification
- [M4 General]: Twilio A2P campaign status unknown — must verify before SMS workflows work
- [M4 Phase 12]: TG-01 enhanced with 3 parallel instant-response branches (SMS, Telegram, email)
- [M4 Phase 12]: Telegram alert uses OWNER_TELEGRAM_CHAT_ID placeholder — Vance must set actual chat ID
- [M4 Phase 12]: Email confirmation reuses TG-09 branded HTML template (green/gold/dark footer)
- [M4 Phase 12]: TG-01 now 15 nodes (was 7), deployed and active on n8n
- [M4 Phase 12]: TG-126 speed-to-lead timer deployed (n8n ID: jfz05ofLDaMdKbBV), 6 nodes, active
- [M4 Phase 12]: TG-126 uses real Telegram credential V404qLIDXjmyzNeS (not placeholder)
- [M4 Phase 12]: lead_alerts table needs manual creation in Supabase for dedup (workflow degrades gracefully without it)
- [M4 Phase 12]: 12 workflows now active: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07
- [M4 Phase 12]: TG-07 rebuilt with 3-dimension scoring (static 50pt + engagement 30pt + recency 20pt)
- [M4 Phase 12]: TG-07 writes scores directly to leads table (lead_score, lead_tier) — no longer uses lead_scores table
- [M4 Phase 12]: TG-07 newly-hot detection prevents repeat Telegram alerts for already-hot leads
- [M4 Phase 12]: TG-07 deployed (n8n ID: rCRdV1aDoIlEpHiH), daily 7am CT
- [M4 Phase 12]: TG-09 rebuilt as 5-touch follow-up (Day 1/5 SMS, Day 3/7/14 email) with dynamic Google reviews
- [M4 Phase 12]: TG-09 uses flat JSON data flow — SMS/email payloads at root level for TG-94/TG-95 compatibility
- [M4 Phase 12]: TG-09 stage tracking via leads.follow_up_stage integer (0-5), not sequence_enrollments table
- [M4 Phase 13]: TG-05 enhanced with scheduled_date/time/crew_name extraction, job_created event type, 8 Switch outputs
- [M4 Phase 13]: TG-05 Switch output indices shifted — job_created at index 1, all others +1
- [M4 Phase 13]: TG-127 pre-job notification deployed (n8n ID: SsYWWFSHSOfnv7ex), sends 4PM day-before SMS
- [M4 Phase 13]: TG-128 post-job quality check deployed (n8n ID: GZ7ZxOanSNceWeVV), 14-node dual-trigger with sentiment analysis
- [M4 Phase 13]: TG-05 wired to real TG-127/TG-128 IDs, full pipeline active
- [M4 Phase 13]: TG-128 webhook URL: https://tgyardcare.app.n8n.cloud/webhook/tg128-quality-reply
- [M4 Phase 13]: 15 workflows now active (added TG-127, TG-128)
- [M4 Phase 13]: n8n API PUT returns 400 "Could not find property option" — deploy via UI import only
- [M4 Phase 12]: TG-09 deployed and active (n8n ID: ZjG32DE8KI9SHyxo), daily 10am CT
- [M4 Phase 12]: follow_up_stage column needs manual addition to leads table (workflow degrades gracefully without it)

### Pending Todos

- Replace OWNER_TELEGRAM_CHAT_ID in TG-01 Build Telegram Alert node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-126 Send Telegram Warning node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-07 Send Hot Lead Telegram node with Vance's actual Telegram chat ID
- Create lead_alerts table in Supabase SQL Editor (see 12-02-SUMMARY.md for SQL)
- Add follow_up_stage column to leads table: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_stage integer DEFAULT 0;`
- Add parsed_scheduled_date, parsed_scheduled_time, parsed_crew_name columns to jobber_email_events table

### Blockers/Concerns

- Twilio A2P 10DLC campaign status unknown — ALL outbound SMS may be carrier-filtered
- Twilio inbound webhook points to demo.twilio.com — needs manual fix
- Quo missed call webhook not configured — needs manual setup
- Facebook page hacked — no FB workflows until resolved
- GBP API access pending verification — GBP posting manual until approved
- TG-94 has duplicate URL bug in Supabase HTTP requests — will fail on actual SMS consent/rate-limit checks

## Session Continuity

Last session: 2026-03-19
Stopped at: Completed 13-02-PLAN.md (TG-127 pre-job + TG-128 quality check)
Resume file: None
Next: Execute 13-03-PLAN.md (customer retention workflows)
