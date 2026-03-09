# STATE — TotalGuard Yard Care

**Last Updated**: 2026-03-09
**Current Phase**: Phase 1-10 parallel generation (mid-stream)
**Status**: Active — multiple background agents writing files

---

## Current Position

Executing Milestone 1: Full Marketing Automation System
- Phase 1 (DB migrations): Agent re-running to write 71 SQL files to automation/migrations/
- Phase 2 (Lead capture): ✅ COMPLETE — TG-01 through TG-07 written
- Phase 3-4 (Email + Reviews): Agent running, output pending
- Phase 5-6 (Field + Social): TG-24 through TG-33 written manually, TG-38 through TG-44 from agent; TG-34 through TG-37 still needed
- Phase 7-10 (SEO + Reporting + AI): Agent running, output pending

## Key Decisions
- Same Supabase project: lwtmvzhwekgdxkaisfra (existing TG project)
- Same tgyardcare repo: automation/ folder added (not a new separate repo)
- n8n tag created: "TotalGuard Yard Care" (ID: fPXl9eiMhJc3ISQQ)
- All workflows prefixed "TG-" to avoid collision with TWC workflows
- n8n API key stored in import-tg-workflows.js
- Subagents can't write files — main context writes all files after extracting from agent output

## Files Written So Far
### n8n-workflows/ (27 of 88)
- TG-01 through TG-07 (Phase 2 — lead capture)
- TG-24 through TG-33 (Phase 5 — field marketing, minus TG-34)
- TG-38 through TG-44 (Phase 6 — social media)

### migrations/ (0 of 71)
- Phase 1 agent re-running with correct directory

### scripts/
- import-tg-workflows.js ✅
- tg-route-table.json (pending Phase 7-10 agent)

## Active Background Agents
- a5c1c0ce76b83fc66: Phase 1 DB migrations (re-running, should now write)
- a94996af751602f0b: Phase 3-4 email + reviews
- a52e2d748a2886c51: Phase 7-10 SEO + reporting + AI

## Still Needed (workflow files)
- TG-34-referral-program.json
- TG-35-social-posting-scheduler.json
- TG-36-content-calendar-generator.json
- TG-37-ai-caption-generator.json
- TG-08 through TG-23 (Phases 3-4, from agent a94996af751602f0b)
- TG-45 through TG-80 (Phases 7-10, from agent a52e2d748a2886c51)

## Blockers
- External accounts not yet created: Brevo, Twilio, Gmail (tg.notifications@gmail.com), OpenWeather, Google Places API
- n8n variables not yet configured (needs accounts first)
- Workflows generated but not yet imported to n8n (blocked on accounts)

## Next Actions (after agents complete)
1. Extract + write Phase 3-4 workflows from agent output
2. Extract + write Phase 7-10 workflows from agent output
3. Write TG-34 through TG-37 directly
4. Verify all 71 SQL migrations written by Phase 1 agent
5. Apply migrations to Supabase via MCP
6. Vance creates: Brevo, Twilio, Gmail, OpenWeather, Google API accounts
7. Set all TG_ variables in n8n Settings → Variables
8. Run node automation/scripts/import-tg-workflows.js
9. Test: Jobber email bridge, review request flow, daily briefing SMS
