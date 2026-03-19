# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Build an autonomous business nervous system — acquires customers, converts leads, delivers excellence, retains accounts, amplifies brand, reports via Telegram.
**Current focus:** M4 TG-OS Business Automation — Phase 11 in progress

## Current Position

Phase: 11 of 20 (Foundation & Infrastructure)
Plan: 2 of ? in Phase 11 (partially complete — INFRA-01, INFRA-02 done)
Status: IN PROGRESS — n8n cleaned, infrastructure active, remaining fixes needed
Last activity: 2026-03-19 — Phase 11 partial (99 workflows deactivated, 6 infra active, Facebook URL fixed)

Progress M4: [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 2/62 requirements (Phase 11 in progress)
Progress M3: [████████████████████████████████] 36/36 plans (COMPLETE)
Progress M2: [█████████████████████████████████] 34/34 plans (COMPLETE)

## Performance Metrics

**Velocity:**
- Total plans completed: 70 (M2: 34 + M3: 36)
- M4 Phase 11: 2 requirements complete (INFRA-01, INFRA-02)

## Accumulated Context

### Decisions

- [M4 Phase 11]: Clean slate approach — deactivated ALL 99 workflows, selectively reactivating
- [M4 Phase 11]: 6 infrastructure workflows reactivated: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95
- [M4 Phase 11]: TG-92 and TG-113 return HTTP 400 on activation — likely stale Supabase key
- [M4 Phase 11]: TG-05 can't be deactivated via API (IMAP listener blocks) — kept active intentionally
- [M4 Phase 11]: Facebook page is HACKED — no Facebook workflows to be activated
- [M4 Phase 11]: Auto-posting via Upload-Post ($16/mo) or LATE ($19/mo) recommended
- [M4 Phase 11]: Facebook URL fixed across 19 files in codebase
- [M4 Phase 11]: NAP consistency verified clean — (608) 535-6057 consistent everywhere
- [M4 General]: No Jobber API — all Jobber data via email parsing (TG-05 IMAP)
- [M4 General]: No Stripe — Jobber Payments handles billing
- [M4 General]: No Vapi — organic human calls only
- [M4 General]: GBP API pending verification
- [M4 General]: Twilio A2P campaign status unknown — must verify before SMS workflows work

### Pending Todos

None yet.

### Blockers/Concerns

- Twilio A2P 10DLC campaign status unknown — ALL outbound SMS may be carrier-filtered
- Twilio inbound webhook points to demo.twilio.com — needs manual fix
- Quo missed call webhook not configured — needs manual setup
- Facebook page hacked — no FB workflows until resolved
- GBP API access pending verification — GBP posting manual until approved
- TG-92 and TG-113 won't activate (HTTP 400) — needs investigation

## Session Continuity

Last session: 2026-03-19
Stopped at: Phase 11 partial — INFRA-01 + INFRA-02 complete, INFRA-03/04/05 remaining
Resume file: None
Next: Complete Phase 11, then plan and execute Phase 12 (Conversion Engine)
