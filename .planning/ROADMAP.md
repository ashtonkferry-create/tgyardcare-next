# TotalGuard — Roadmap

## Milestones

- [x] **M2: Automation Gap Closer** - Phases 0-4 (in progress)
- [ ] **M3: Billionaire Brand Transformation** - Phases 5-9 (planned)

---

<details>
<summary>M2: Automation Gap Closer (Phases 0-4)</summary>

**Goal**: Take TG from ~35 functional automations to 127+ by fixing existing dead workflows, building every missing capability TTW has, and adding an intelligence layer TTW doesn't have. Execute with zero wasted motion.

**Starting Position**: TG wins 65, TTW wins 48, 7 ties. But ~20 TG workflows are dead on arrival (missing API keys), and 25 active TTW capabilities have zero TG equivalent.

**Success Criteria**:
- All existing workflows functional (0 dead on arrival)
- Every revenue-impact TTW capability replicated or exceeded
- CRM fully unified (single webhook router, unified comms)
- SEO gaps closed (GSC sync, city content, gap detection)
- Self-improvement loop operational (TG's only category at 0)
- Final score: TG wins 90+, TTW wins <20

---

## Phase 0: Fix Existing (Zero Build Cost)
**Goal**: Unlock ~20 dead workflows by adding missing API keys, fixing broken env vars, completing OAuth handshakes, and deploying undeployed workflows. No new code — pure configuration.
**Impact**: 35 functional -> 55+ functional
**Status**: Ready to execute

## Phase 1: Revenue Engine
**Goal**: Build 9 n8n workflows (TG-83 through TG-91) that automate revenue-generating customer communication: quote follow-ups, invoice collections, missed call capture, plan enrollment/renewal, on-my-way SMS, invoice delivery, fertilizer schedule reminders, and abandoned quote recovery.
**Impact**: Recover 10-20% lost leads, increase quote-to-close 15-25%, enable recurring revenue
**Status**: Complete
**Plans:** 9 plans

Plans:
- [x] 01-01-PLAN.md -- Database migrations + fertilizer schedule seeding
- [x] 01-02-PLAN.md -- TG-05 extension (new routes, $vars fix, poll frequency reduction)
- [x] 01-03-PLAN.md -- TG-88 On My Way SMS + TG-89 Invoice Delivery
- [x] 01-04-PLAN.md -- TG-85 Missed Call AI Capture (tested, SMS confirmed)
- [x] 01-05-PLAN.md -- TG-83 Quote Follow-up Sequence
- [x] 01-06-PLAN.md -- TG-84 Invoice Collections + TG-91 Abandoned Quote
- [x] 01-07-PLAN.md -- TG-86 Plan Enrollment + TG-87 Renewal Reminder (+ SMS added)
- [x] 01-08-PLAN.md -- TG-90 Fertilizer Schedule Engine
- [x] 01-09-PLAN.md -- Email system migrated Brevo->Resend across all workflows

## Phase 2: CRM Unification
**Goal**: Build webhook router (TG-92), auto-dispatch notifications (TG-93), unified SMS sender (TG-94), unified email sender (TG-95), and convert TG-76 to sub-workflow -- single public webhook, owner dispatch with confirmation, all events logged, all communication gated through consent and rate limiting.
**Impact**: Eliminate manual CRM work, unified customer communication layer
**Status**: Planning complete
**Plans:** 5 plans

Plans:
- [ ] 02-01-PLAN.md -- DB tables (webhook_events, dispatch_log) + TG-76 sub-workflow conversion
- [ ] 02-02-PLAN.md -- TG-92 Webhook Router (deployed inactive)
- [ ] 02-03-PLAN.md -- TG-93 Auto-Dispatch + TG-05 extension
- [ ] 02-04-PLAN.md -- TG-94 Unified SMS Sender + TG-95 Unified Email Sender + TG-76 customer reply routing
- [ ] 02-05-PLAN.md -- Activate TG-92/TG-93, point Twilio, end-to-end verification

## Phase 3: SEO Domination
**Goal**: Build 14 workflows/crons that close remaining SEO gaps — GSC daily sync, city/neighborhood content generator, content gap detector, ranking opportunity detector, index coverage monitor, rank drop alerts.
**Impact**: Fill the only SEO category where TTW beats TG (monitoring: 10-5)
**Status**: Pending Phase 2

## Phase 4: Intelligence Layer
**Goal**: Build 20+ workflows for self-improvement, revenue attribution, A/B testing, ad optimization, and AI learning reports. This is TTW's only 12-0 category — TG currently has zero.
**Impact**: TG becomes a self-optimizing system that gets smarter every week
**Status**: Pending Phase 3

</details>

---

## M3: Billionaire Brand Transformation

**Goal**: Transform tgyardcare.com from a functional local business site into a billion-dollar brand experience that converts visitors at 3-5x current rates while protecting existing SEO rankings and lead flow.

**Starting Position**: Production site has 65+ pages, 47 API routes, 38 cron jobs, 500+ customers. But everything is `'use client'`, TypeScript errors are suppressed with `ignoreBuildErrors: true`, 14 Supabase console errors fire on every page load, and animated counters show "0" instead of real values.

**Success Criteria**:
- Zero production console errors (Supabase and TypeScript)
- Premium visual identity (Clash Display + General Sans typography, hero video, dark theme polish)
- Lighthouse Performance 90+ desktop, 75+ mobile
- Three new conversion engines live (instant quote, annual plan builder, referral program)
- Customer portal with auth-protected dashboard
- Content hub with category-organized educational content
- SEO rankings preserved or improved through entire transformation

**Phase Numbering:**
- Integer phases (5, 6, 7, 8, 9): Planned milestone work
- Decimal phases (5.1, 6.1): Urgent insertions if needed (marked with INSERTED)

- [ ] **Phase 5: Safety Nets & Foundation** - Fix production bugs, harden the codebase, establish design tokens and server-side patterns
- [ ] **Phase 6: Brand Transformation & Visual Impact** - Hero video, before/after gallery, Server Component conversion, premium typography in action
- [ ] **Phase 7: Conversion Features** - Instant quote calculator, interactive service area map, annual plan configurator
- [ ] **Phase 8: Customer Retention Layer** - Auth-protected customer portal, referral engine with tracking
- [ ] **Phase 9: Content & SEO Growth** - Blog categories/tags, Madison lawn care hub, seasonal content surfacing

## Phase Details

### Phase 5: Safety Nets & Foundation
**Goal**: Visitors experience zero console errors, see correct stat values, and the codebase is hardened with type safety, smoke tests, server-side data fetching, and SEO baselines — enabling all subsequent phases to ship without breaking production.
**Depends on**: Nothing (first M3 phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10, TYPO-01, TYPO-02, TYPO-03, TYPO-04, TYPO-05
**Success Criteria** (what must be TRUE):
  1. Homepage loads with zero errors in browser DevTools console (no Supabase 400/401/500 errors, no unhandled promise rejections)
  2. Animated stat counters on homepage display their correct values (4.9 stars, 80+ customers, 100% satisfaction, 24hr response) on first load and after navigation
  3. All page headings render in Clash Display and body text renders in General Sans — no Inter, no font-loading flash
  4. Light text on dark backgrounds passes WCAG AA contrast check on every section of the homepage and service pages
  5. Running `tsc --noEmit` produces a cataloged error list with an established budget — new code in Phase 6+ adds zero new errors
**Plans**: TBD

### Phase 6: Brand Transformation & Visual Impact
**Goal**: Visitors land on a homepage with cinematic video hero, can browse 20+ before/after transformation photos with interactive sliders, and experience a server-rendered page that loads fast and ranks well in Google.
**Depends on**: Phase 5 (server-side Supabase client, typography system, error-free baseline)
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. Homepage hero plays a looping background video on desktop with a poster image visible before video loads — mobile visitors see an optimized static image instead
  2. Transformation gallery page displays 20+ before/after image pairs with draggable comparison sliders, organized by service type with Madison neighborhood names
  3. Homepage HTML source (view-source) contains rendered content for hero, stats, services grid, and reviews — not an empty div waiting for JavaScript
  4. Lighthouse Performance score is 90+ on desktop and 75+ on mobile for the homepage
  5. All 16 existing JSON-LD schema components produce identical structured data output before and after the Server Component conversion
**Plans**: TBD

### Phase 7: Conversion Features
**Goal**: Visitors can get an instant price estimate for their property in under 30 seconds, explore TotalGuard's service area on an interactive map, and build a custom annual lawn care plan with real-time bundle pricing.
**Depends on**: Phase 6 (server-rendered homepage, stable visual foundation)
**Requirements**: QUOTE-01, QUOTE-02, QUOTE-03, QUOTE-04, QUOTE-05, QUOTE-06, QUOTE-07, MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06
**Success Criteria** (what must be TRUE):
  1. User types their address and sees autocomplete suggestions, selects one, and the system displays their estimated lot size within 5 seconds (with manual dropdown fallback if parcel lookup fails)
  2. User selects services and sees a price range (e.g., "$45-65/visit") within 30 seconds of starting the quote flow — no waiting for a callback
  3. Interactive map displays all 12 Dane County service cities with highlighted boundaries, and clicking a city navigates to its location page
  4. User can toggle services on/off by season in the annual plan configurator and sees a 12-month calendar with bundle pricing that updates in real-time
  5. "Lock In My Plan" and "Get Exact Quote" CTAs both capture lead data (name, email, phone, address, selections) to Supabase
**Plans**: TBD

### Phase 8: Customer Retention Layer
**Goal**: Existing customers can log in to a branded portal to view their service history, upcoming schedule, and invoices — and can share a referral link that gives both parties $50 off.
**Depends on**: Phase 5 (auth middleware), Phase 7 (stable conversion features)
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06, PORT-07, PORT-08, REF-01, REF-02, REF-03, REF-04, REF-05, REF-06
**Success Criteria** (what must be TRUE):
  1. Customer receives a magic link email, clicks it, and lands on their authenticated dashboard — no password required
  2. Dashboard displays upcoming service schedule, past service history with dates, and invoices with payment status
  3. Customer can request an additional service and rate their crew (1-5 stars) from the dashboard
  4. Customer can copy their unique referral link (e.g., tgyardcare.com/r/ABC123) and a referred visitor sees a personalized landing page with the referrer's name
  5. When a referred customer books their first service, the referrer sees "$50 credit" status update in their portal and the new customer received $50 off
**Plans**: TBD

### Phase 9: Content & SEO Growth
**Goal**: Visitors find TotalGuard's educational content organized by topic, discover the "Madison Lawn Care Guide" hub as a local authority resource, and encounter lead magnets that convert readers into leads.
**Depends on**: Phase 6 (server-rendered pages for SEO)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06
**Success Criteria** (what must be TRUE):
  1. Blog index page shows posts organized by categories (Lawn Care, Seasonal, Gutters, etc.) with clickable category filters
  2. "Madison Lawn Care Guide" hub page aggregates all educational content as a single authoritative resource with internal linking
  3. Seasonal content surfaces automatically based on current time of year (spring content in March-May, fall content in September-November)
  4. Every blog post and guide page includes a contextual lead magnet CTA (e.g., "Get your free lawn care checklist") that captures email to Supabase
**Plans**: TBD

---

## Progress

**Execution Order:** Phases execute in numeric order: 5 -> 6 -> 7 -> 8 -> 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 0. Fix Existing | M2 | 0/? | Ready to execute | - |
| 1. Revenue Engine | M2 | 9/9 | Complete | 2026-03-15 |
| 2. CRM Unification | M2 | 0/? | Not started | - |
| 3. SEO Domination | M2 | 0/? | Not started | - |
| 4. Intelligence Layer | M2 | 0/? | Not started | - |
| 5. Safety Nets & Foundation | M3 | 0/? | Not started | - |
| 6. Brand Transformation | M3 | 0/? | Not started | - |
| 7. Conversion Features | M3 | 0/? | Not started | - |
| 8. Customer Retention | M3 | 0/? | Not started | - |
| 9. Content & SEO Growth | M3 | 0/? | Not started | - |
