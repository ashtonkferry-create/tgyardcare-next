# TotalGuard Yard Care — Marketing Automation Roadmap

## Milestone 1: Full Marketing Automation System

**Goal**: Deploy complete 88-workflow marketing automation stack on top of existing Next.js website. Turn TotalGuard into a self-running marketing machine.

**Success Criteria**:
- All 70+ Supabase tables live and seeded
- All 88 n8n workflows imported, tagged TotalGuard, and active
- Jobber email bridge parsing real notification emails
- Brevo sending automated email sequences
- Twilio sending review requests and crew briefings
- Owner receiving daily KPI SMS digest
- Google reviews syncing and getting AI responses

---

## Phase 1: Database Foundation
**Goal**: Apply all 71 adapted SQL migrations to Supabase. Creates the complete data layer for all automation workflows.
**Output**: 70+ tables, views, RPCs, RLS policies live in Supabase project lwtmvzhwekgdxkaisfra
**Status**: 🔄 IN PROGRESS — migrations being generated

## Phase 2: Lead Capture & Jobber Bridge (n8n)
**Goal**: 7 workflows — website lead capture, phone/Facebook leads, Jobber email parser, Zapier bridge, lead scoring
**Output**: TG-01 through TG-07 imported and active in n8n
**Status**: ✅ Files generated (TG-01 through TG-07)

## Phase 3: Email Marketing & Nurture (n8n)
**Goal**: 10 workflows — welcome series, followup sequences, cross-sell, reengagement, VIP upgrade, seasonal nurtures
**Output**: TG-08 through TG-17 imported and active
**Status**: 🔄 IN PROGRESS — agent running

## Phase 4: Review & Reputation Management (n8n)
**Goal**: 6 workflows — post-job review request, Google review sync, AI response, reengagement, review-to-referral
**Output**: TG-18 through TG-23 imported and active
**Status**: 🔄 IN PROGRESS — agent running

## Phase 5: Field Marketing & Operations (n8n)
**Goal**: 11 workflows — post-job field tasks, crew daily briefing, compliance, photo upload, inventory, postcards, referrals
**Output**: TG-24 through TG-34 imported and active
**Status**: 🔄 IN PROGRESS — TG-24 through TG-33 written

## Phase 6: Social Media & Content (n8n)
**Goal**: 13 workflows — social scheduler, content calendar, AI captions, competitor monitoring, YouTube planner
**Output**: TG-35 through TG-44 imported and active
**Status**: 🔄 IN PROGRESS — TG-38 through TG-44 written

## Phase 7: SEO Dashboard & Analytics (n8n)
**Goal**: 11 workflows — keyword tracking, GBP automation, IndexNow, citation monitor, backlink tracker, content refresh
**Output**: TG-45 through TG-55 imported and active
**Status**: ⏳ Pending — agent running

## Phase 8: Advanced Automation (n8n)
**Goal**: 15 workflows — weather-triggered campaigns, health scoring, pricing optimization, SMS consent, NPS, loyalty
**Output**: TG-56 through TG-65 imported and active
**Status**: ⏳ Pending — agent running

## Phase 9: Reporting & Intelligence (n8n)
**Goal**: 8 workflows — daily KPI digest, weekly owner report, revenue forecaster, system health monitor
**Output**: TG-66 through TG-73 imported and active
**Status**: ⏳ Pending — agent running

## Phase 10: AI & Bot Layer (n8n)
**Goal**: 7 workflows — Telegram bot, AI quoting, two-way SMS, voice sync, universal router
**Output**: TG-74 through TG-80 imported and active
**Status**: ⏳ Pending — agent running

## Phase 11: Prerequisites & Account Setup
**Goal**: Set up all external accounts (Brevo, Twilio, Gmail bridge, OpenWeather, Google APIs) and configure n8n variables
**Output**: All n8n variables set, credentials configured, workflows activatable
**Status**: ⏳ Waiting on Vance to create accounts

## Phase 12: Import, Activate & Test
**Goal**: Run import-tg-workflows.js to push all 88 workflows to n8n, activate them, smoke-test key flows
**Output**: All workflows live, Jobber bridge tested, review request tested, daily briefing SMS confirmed
**Status**: ⏳ Blocked on Phase 11
