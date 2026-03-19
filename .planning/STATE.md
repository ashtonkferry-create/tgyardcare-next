# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Build an autonomous business nervous system — acquires customers, converts leads, delivers excellence, retains accounts, amplifies brand, reports via Telegram.
**Current focus:** M4 TG-OS Business Automation — Phase 12 in progress (Conversion Engine)

## Current Position

Phase: 12 of 20 (Conversion Engine)
Plan: 1 of 4 in Phase 12 (12-01 complete)
Status: In progress
Last activity: 2026-03-19 — Completed 12-01-PLAN.md (TG-01 instant multi-channel response)

Progress M4: [█████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 6/62 requirements (12-01 COMPLETE)
Progress M3: [████████████████████████████████] 36/36 plans (COMPLETE)
Progress M2: [█████████████████████████████████] 34/34 plans (COMPLETE)

## Performance Metrics

**Velocity:**
- Total plans completed: 74 (M2: 34 + M3: 36 + M4: 4)
- M4 Phase 11: 5 requirements complete (INFRA-01, INFRA-02, 11-02 key audit, 11-03 auto-posting, 11-01 TG-92/TG-113 activation)
- M4 Phase 12: 1 plan complete (12-01 instant multi-channel response)

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

### Pending Todos

- Replace OWNER_TELEGRAM_CHAT_ID in TG-01 Build Telegram Alert node with Vance's actual Telegram chat ID

### Blockers/Concerns

- Twilio A2P 10DLC campaign status unknown — ALL outbound SMS may be carrier-filtered
- Twilio inbound webhook points to demo.twilio.com — needs manual fix
- Quo missed call webhook not configured — needs manual setup
- Facebook page hacked — no FB workflows until resolved
- GBP API access pending verification — GBP posting manual until approved
- TG-94 has duplicate URL bug in Supabase HTTP requests — will fail on actual SMS consent/rate-limit checks

## Session Continuity

Last session: 2026-03-19
Stopped at: Completed 12-01-PLAN.md (TG-01 instant multi-channel response)
Resume file: None
Next: Execute 12-02-PLAN.md (next plan in Phase 12)
