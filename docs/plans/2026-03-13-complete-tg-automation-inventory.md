# Complete TG Automation Inventory vs TTW — The REAL Picture

**Date**: 2026-03-13

TG doesn't just have 80 n8n workflows. It has **3 automation layers**:
- **Layer 1**: 80 n8n workflows (automation engine)
- **Layer 2**: 41 Vercel cron jobs (SEO/content/GBP automation)
- **Layer 3**: Self-healing SEO system + 18 JSON-LD schema builders + GBP library + Admin dashboard

**Total TG automations: 121+** (not 80)

TTW has **250 n8n workflows** (67 active) and no known Vercel cron or self-healing layer.

---

## COMPLETE TG vs TTW — Every Capability Mapped

### SEO AUTOMATION

| Capability | TG (Vercel Cron) | TG (n8n) | TTW (n8n) | Who Wins |
|-----------|-----------------|---------|----------|----------|
| **Daily site crawl (21 issue types)** | seo-crawl (487 lines, 13 checks, CrUX) | — | — | **TG** — TTW has nothing like this |
| **Self-healing auto-fix (8 strategies)** | seo-heal (791 lines, Claude-powered) | — | — | **TG** — TTW has nothing like this |
| **Daily SEO health score (0-100)** | seo-score (6 component metrics) | — | — | **TG** — TTW has nothing like this |
| **Weekly SEO report** | seo-report (trend analysis) | TG-51 local-seo-report | 168 Weekly SEO Report (inactive) | **TG** — has both cron + n8n versions |
| **IndexNow ping** | seo-ping (daily, includes healed URLs) | TG-47 (no key configured) | TWC-238 IndexNow Ping (ACTIVE) | **TIE** — TG cron works, n8n doesn't. TTW's works |
| **Sitemap validation** | sitemap-check (HEAD requests, queues broken) | — | — | **TG** |
| **Robots.txt guard** | robots-guard (daily compliance check) | — | — | **TG** |
| **Blog auto-generation** | blog-generator (1200-1500 word posts, Fridays) | — | TWC-127 AI Blog Pipeline (ACTIVE, 3/week) | **TTW** — 3/week vs TG's 1/week |
| **Content freshness tracking** | content-freshness (flags >90 days stale) | TG-50 content-refresher | — | **TG** |
| **Content refresh with AI** | content-refresher (Claude rewrites stale posts) | TG-50 content-refresher | — | **TG** |
| **Meta description generation** | meta-gen (Claude Haiku, missing metas) | TG-54 ai-meta-generator | TWC-232 Title/Meta Auto-Optimizer (ACTIVE) | **TTW** — auto-optimizes from CTR data, TG just generates |
| **Heading structure audit** | heading-auditor (H1 count, hierarchy) | — | — | **TG** |
| **Image alt text checker** | image-alt-checker (13 pages scanned) | — | — | **TG** |
| **NAP consistency checker** | nap-checker (13 pages verified) | — | — | **TG** |
| **Geo signal audit** | geo-signal-auditor (LocalBusiness, geo meta, maps) | — | — | **TG** |
| **Internal link optimization** | internal-link-optimizer (orphan page detection) | — | — | **TG** |
| **Local gap finder** | local-gap-finder (missing location pages) | — | — | **TG** |
| **AEO optimizer** | aeo-optimizer (AI answer engine optimization) | — | 183 AI Visibility Monitor (inactive) | **TG** — live vs TTW's inactive |
| **Keyword rank tracking** | rank-tracker (20 keywords, Wednesdays) | TG-45 (no GSC token) | 182 Keyword Rank Tracker (inactive) | **TG** cron works, n8n doesn't |
| **Page speed monitoring** | page-speed-monitor (Google PageSpeed API) | TG-53 page-speed-monitor | — | **TG** |
| **Competitor monitoring** | competitor-monitor (5 competitors, monthly) | TG-39 (ACTIVE), TG-44 | 120 Competitive Intel (ACTIVE) | **TIE** |
| **Citation sync** | citation-sync (7 directories, monthly) | TG-48 citation-monitor | 184/185 Citation (inactive) | **TG** |
| **Backlink monitoring** | backlink-monitor (3 known backlinks) | TG-49 (no API) | TWC Backlink Tracker (inactive) | **TG** cron works, n8n limited |
| **GSC daily data sync** | — | — | TWC-164 GSC Daily Sync (ACTIVE) | **TTW** — TG has no GSC sync |
| **Rank drop alerts** | — | — | TWC-208 Rank Drop Alert (ACTIVE) | **TTW** — TG has no alerts |
| **City/neighborhood content gen** | — | — | TWC-215/215b City Content Generator (ACTIVE) | **TTW** — TG has no programmatic pages |
| **Ranking opportunity detector** | — | — | TWC-231 Ranking Opp Detector (ACTIVE) | **TTW** — TG has nothing |
| **Content gap detector** | — | — | TWC-234 Content Gap Detector (ACTIVE) | **TTW** — TG has nothing |
| **Neighborhood content health** | — | — | TWC-234 Neighborhood Health (ACTIVE) | **TTW** — TG has nothing |
| **Index coverage monitor** | — | — | TWC-235 Index Coverage (ACTIVE) | **TTW** — TG has nothing |
| **Content uniqueness report** | — | — | TWC-236 Uniqueness Report (ACTIVE) | **TTW** — TG has nothing |
| **Neighborhood page performance** | — | — | TWC-237 Page Performance (ACTIVE) | **TTW** — TG has nothing |
| **GBP auto-applier** | — | — | 193 GBP Auto-Applier (ACTIVE) | **TTW** — TG audits but doesn't auto-fix GBP |
| **Content type rotator** | — | — | TWC-196 Content Rotator (ACTIVE) | **TTW** |
| **Brand mention outreach** | — | — | TWC Brand Mention (inactive) | **TTW** (inactive) |
| **Guest post pitcher** | — | — | TWC Guest Post (inactive) | **TTW** (inactive) |
| **Geo-grid rank scanner** | — | — | TWC-212 Geo-Grid (inactive) | **TTW** (inactive) |
| **GBP photo publisher** | — | — | TWC-211 GBP Photo (inactive) | **TTW** (inactive) |
| **Map pack health report** | — | — | TWC-216 Map Pack (inactive) | **TTW** (inactive) |

### SCHEMA & STRUCTURED DATA

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **JSON-LD schema factory (18 builders)** | schema-factory.ts (Organization, LocalBusiness, WebSite, Service, HowTo, FAQ, Breadcrumb, Location, Article, Review, Navigation, WebPage, ItemList, Contact, About, Gallery, JobPosting, Event) | — | **TG** — 18 schema types, TTW has zero known schema system |
| **Schema constants (single source of truth)** | schema-constants.ts (business data, reviews, geo, social) | — | **TG** |
| **Service configs (15 services)** | schema-config.ts (15 services with keywords, seasonality, pricing, howTo steps) | — | **TG** |
| **Location configs (12 cities)** | schema-config.ts (12 cities with lat/lng, zip, radius) | — | **TG** |
| **Schema auto-generation cron** | schema-generator (23 routes scanned) | — | — | **TG** |
| **Schema validation cron** | schema-validator (12 key pages validated) | TG-52 schema-validator | — | **TG** |
| **Review schema auto-update** | review-schema-updater (aggregateRating from real reviews) | — | — | **TG** |
| **FAQ schema from reviews** | review-faq-miner + faq-builder (Claude mines reviews for FAQ content) | — | — | **TG** |

### GBP (GOOGLE BUSINESS PROFILE)

| Capability | TG (Vercel Cron) | TG (n8n) | TTW (n8n) | Who Wins |
|-----------|-----------------|---------|----------|----------|
| **GBP post generation** | gbp-post (Claude, 4 post types, seasonal) | TG-46 (GBP blocked) | 115/66 GBP Auto-Post (inactive) | **TG** cron is more sophisticated |
| **GBP post publishing** | gbp-post-publisher (validates, publishes, holds on failure) | — | — | **TG** |
| **GBP audit** | gbp-audit (detects removals, response rate, weekly digest) | TG-55 gbp-optimization-scorer | 192 GBP Audit Scanner (inactive), 193 Auto-Applier (ACTIVE) | **TTW** for auto-applying fixes |
| **Review auto-responder** | review-responder (Claude drafts, auto-responds 4-5★, holds 1-2★) | TG-20 ai-review-response | 117 Review AI Drafter (inactive) | **TG** |
| **Review response drafting** | review-response-drafter (Claude Haiku) | — | — | **TG** |
| **Review-to-FAQ mining** | review-faq-miner (extracts FAQ from reviews) | — | — | **TG** |
| **GBP library (full SDK)** | src/lib/gbp/ (client, types, validator, prompts) | — | — | **TG** |
| **Admin review approval UI** | /api/admin/gbp-review-action (approve/reject) | — | — | **TG** |
| **GBP health diagnostic** | /api/admin/gbp-health (7-step check) | — | — | **TG** |

### CONTENT GENERATION

| Capability | TG (Vercel Cron) | TG (n8n) | TTW (n8n) | Who Wins |
|-----------|-----------------|---------|----------|----------|
| **Blog post generation** | blog-generator (weekly, 1200-1500 words, auto-publishes + IndexNow) | — | TWC-127 Blog Pipeline (ACTIVE, 3/week) | **TTW** — 3x frequency |
| **FAQ generation** | faq-builder (6 service pages, Claude) | — | — | **TG** |
| **Social auto-posting** | social-auto-post (seasonal posts, Claude) | TG-35-38 (no FB token) | 118 Social Scheduler (inactive) | **TG** cron works |
| **Content refresh** | content-refresher (AI rewrites stale posts) | TG-50 | — | **TG** |
| **Meta description gen** | meta-gen (Claude Haiku) | TG-54 | TWC-232 Auto-Optimizer (ACTIVE) | **TTW** — data-driven optimization |

### LEAD CAPTURE & CRM

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Website form capture** | /api/contact + TG-01 | TWC Lead Capture v2 (ACTIVE) | TIE |
| **Phone lead capture** | TG-02 | TWC Phone Lead Capture (ACTIVE) | TIE |
| **Facebook lead capture** | TG-03 (no FB token) | TWC Facebook Lead Capture (inactive) | Neither works |
| **Manual lead entry** | TG-04 | TWC Manual Lead Entry (ACTIVE) | TIE |
| **Lead scoring** | TG-07 | TWC 41 Lead Score Validator (inactive) | **TG** |
| **Lead response timer** | lead-response-timer cron (alerts on 2hr+ unresponded) | — | **TG** |
| **LSA lead capture** | — | TWC LSA Lead Capture (ACTIVE) | **TTW** |
| **Missed call AI capture** | — | 34 Missed Call Capture (ACTIVE) | **TTW** |
| **CRM API proxy** | — | TWC 200 HCP API Proxy (ACTIVE) | **TTW** |
| **CRM webhook receiver** | /api/webhooks/jobber (logs events) | TG-05 (INACTIVE) | 07 HCP Webhook Receiver (ACTIVE) | **TTW** — full event processing vs TG's logging |
| **CRM customer sync** | — | — | 06 HCP Customer Sync (ACTIVE) | **TTW** |
| **Invoice/estimate sync** | — | — | 64 HCP Invoice & Estimate Sync (ACTIVE) | **TTW** |
| **CRM webhook router** | — | — | TWC 250 CRM Webhook Router (ACTIVE) | **TTW** |
| **Jobber OAuth flow** | /api/integrations/connect+callback/jobber | — | — | **TG** (but handshake not completed) |

### COMMUNICATION

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Unified CRM SMS** | — | TWC 251 CRM Send SMS (ACTIVE) | **TTW** |
| **Unified CRM email** | — | TWC 252 CRM Send Email (ACTIVE) | **TTW** |
| **On My Way SMS** | — | TWC 253 On My Way SMS (ACTIVE) | **TTW** |
| **Invoice delivery** | — | TWC 254 Invoice Delivery (ACTIVE) | **TTW** |
| **Email classifier + auto-responder** | — | TWC 218 Email Classifier (ACTIVE) | **TTW** |
| **Email feedback handler** | — | TWC 219 Email Feedback (ACTIVE) | **TTW** |
| **Telegram bot** | TG-74 (basic bot) | — | **TG** |
| **Two-way SMS** | TG-76 (Twilio unverified) | TWC 251 (ACTIVE) | **TTW** — theirs works |
| **VAPI voice agent** | TG-78 (not built) | — | Neither |

### REVENUE & PAYMENTS

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **AI quoting** | TG-75 | 36 AI Real-Time Quote (ACTIVE) | TIE |
| **AI booking sync** | TG-77 | 37 AI Booking & HCP Sync (ACTIVE) | TIE |
| **Photo-based quoting** | — | TWC 201 ResponsiBid (ACTIVE) | **TTW** |
| **Quote follow-up sequence** | — | TWC 203 Quote Follow-up (ACTIVE) | **TTW** |
| **Estimate status tracking** | — | TWC 204 Estimate Sync (ACTIVE) | **TTW** |
| **Plan enrollment** | — | TWC 206 Plan Enrollment (ACTIVE) | **TTW** |
| **Plan renewal reminders** | — | TWC 205 Plan Renewal (ACTIVE) | **TTW** |
| **Installment billing** | — | TWC 255 Payment Plan (ACTIVE) | **TTW** |
| **Invoice collections** | — | 111/62 Invoice Collections (inactive) | **TTW** (inactive) |

### OPERATIONS

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Crew daily briefing** | TG-25 (no weather API) | 57 Daily Briefing (inactive) | TG has it but weather broken |
| **Field marketing** | TG-24, 26-31 (7 workflows) | 51-60 (inactive) | **TG** — all active |
| **Auto-dispatch** | — | TWC 202 Auto-Dispatch (ACTIVE) | **TTW** |
| **Territory assignment** | — | 262 Daily Territory (ACTIVE) | **TTW** |
| **Bonus calculator** | — | 263 Weekly Bonus (ACTIVE) | **TTW** |
| **Snow event auto-creator** | TG-56 (no weather API, triggers campaigns only) | TWC Snow Event Auto-Creator (ACTIVE, creates jobs) | **TTW** — creates actual jobs |
| **Season switcher** | season-switcher cron (switches UI context daily) | — | **TG** |

### EMAIL MARKETING

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Welcome series (5 emails)** | TG-08 (branded HTML) | TWC Welcome Series (ACTIVE) | **TG** — 67 branded templates |
| **Follow-up sequences** | TG-09 (branded HTML) | TWC Follow-Up (inactive) | **TG** |
| **Cross-sell** | TG-10 (branded HTML) | TWC Cross-Sell (inactive) | **TG** |
| **Re-engagement ladder** | TG-11 (branded HTML) | TWC Re-Engagement (inactive) | **TG** |
| **VIP upgrade** | TG-12 (branded HTML) | TWC VIP Upgrade (inactive) | **TG** |
| **Spring/Fall/Snow nurture** | TG-14, 15, 16 (branded HTML) | TWC Spring/Fall (inactive), Snow Auto-Creator (ACTIVE) | **TG** for emails, TTW for job creation |
| **Brevo segmentation** | TG-17 | 105 Brevo Auto-Segmentation (inactive) | **TG** |
| **Newsletter** | TG-81 (local only, not deployed) | — | TG has it but not deployed |
| **Flash sales** | TG-82 (local only, not deployed) | — | TG has it but not deployed |
| **Email send time optimizer** | — | 89 (inactive) | **TTW** (inactive) |
| **Subject line A/B tester** | — | 90 (inactive) | **TTW** (inactive) |

### CUSTOMER INTELLIGENCE

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Customer health scoring** | TG-57 | 74 (inactive) | **TG** |
| **Pricing optimization** | TG-58 | 136 Pricing Validation (ACTIVE) | TIE |
| **NPS survey** | TG-60 | 101 (inactive) | **TG** |
| **Loyalty points** | TG-61 | 97 (inactive) | **TG** |
| **Churn intervention** | — | 79 Churn Intervention (inactive) | **TTW** (inactive) |
| **Multi-service progression** | — | 99 Progression Tracker (inactive) | **TTW** (inactive) |
| **Birthday/anniversary** | — | 146 Birthday (inactive) | **TTW** (inactive) |
| **Engagement scoring** | — | 130 Daily Engagement (inactive) | **TTW** (inactive) |

### REPORTING

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Daily KPI digest** | TG-66 | 147 (inactive) | **TG** |
| **Weekly owner report** | TG-67 | 80/126 (inactive) | **TG** |
| **Weekly digest (Slack)** | weekly-digest cron | — | **TG** |
| **Revenue forecaster** | TG-68 | 143 (inactive) | **TG** |
| **End-of-day reconciliation** | TG-69 | 110 (inactive) | **TG** |
| **System health monitor** | TG-70 | 150 (inactive) | **TG** |
| **Weekly execution report** | TG-73 | 54 (inactive) | **TG** |
| **SEO weekly report** | seo-report cron | — | **TG** |
| **Revenue attribution** | — | 77 (inactive) | **TTW** (inactive) |
| **GA4 reporting** | — | 149/165 (inactive) | **TTW** (inactive) |
| **Marketing ROI report** | — | TWC 163 (inactive) | **TTW** (inactive) |
| **AI learning report** | — | TWC 221 (ACTIVE) | **TTW** |

### ADVERTISING

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Ad auto-optimizer** | — | TWC 161 (ACTIVE) | **TTW** |
| **FB/IG ad creator** | — | TWC 159 (inactive) | **TTW** (inactive) |
| **Google Ads manager** | — | TWC 160 (inactive) | **TTW** (inactive) |

### SELF-IMPROVEMENT (TTW Only — 12 workflows)

TG has **ZERO** self-improvement workflows. TTW has 12 (all inactive):
- Lead Job Attribution, Email Engagement Scorer, A/B Test Analyzer, Lead Score Validator, Cross-Sell Tracker, Weather Attribution, Review Referral Linker, Backlink Outcome Tracker, A/B Auto Optimizer, Email Template Optimizer, Lead Score Calibrator, Backlink Strategy Optimizer

### ADMIN & INFRASTRUCTURE

| Capability | TG | TTW | Who Wins |
|-----------|-----|-----|----------|
| **Admin dashboard (18 pages)** | Full admin panel with SEO manager, health, automations, leads, gallery, tools | Unknown | **TG** |
| **Manual cron trigger** | /api/admin/run-cron (14 allowed crons) | Unknown | **TG** |
| **Page meta analyzer** | /api/admin/page-meta (any page) | Unknown | **TG** |
| **SEO audit endpoint** | /api/admin/seo-audit (76 pages scored) | Unknown | **TG** |
| **GBP health diagnostic** | /api/admin/gbp-health (7 checks) | Unknown | **TG** |
| **Jobber webhook handler** | /api/webhooks/jobber (event logging) | HCP webhook receiver (full processing) | **TTW** — processes events, TG just logs |

---

## THE REAL SCORECARD

| Category | TG Wins | TTW Wins | Tie |
|----------|---------|----------|-----|
| **SEO crawl + healing** | 15 | 0 | 0 |
| **Schema/structured data** | 8 | 0 | 0 |
| **GBP automation** | 7 | 1 | 0 |
| **Content generation** | 3 | 2 | 0 |
| **Lead capture** | 2 | 5 | 3 |
| **Communication** | 1 | 6 | 0 |
| **Revenue/payments** | 0 | 6 | 2 |
| **Operations** | 2 | 3 | 0 |
| **Email marketing** | 7 | 0 | 0 |
| **Customer intel** | 3 | 0 | 1 |
| **Reporting** | 7 | 1 | 0 |
| **Advertising** | 0 | 1 | 0 |
| **SEO monitoring** | 5 | 10 | 1 |
| **Admin/infra** | 5 | 1 | 0 |
| **Self-improvement** | 0 | 12 | 0 |
| **TOTAL** | **65** | **48** | **7** |

---

## WHAT TG IS ACTUALLY MISSING (That TTW Has)

After accounting for ALL 3 layers, here's what TG genuinely doesn't have:

### ACTIVE in TTW — TG Has Nothing (25 capabilities)

**CRM/Communication (11):**
1. LSA Lead Capture
2. CRM Webhook Router (unified)
3. CRM API Proxy (centralized)
4. CRM Customer Sync (deep)
5. Invoice & Estimate Sync
6. Unified CRM SMS
7. Unified CRM Email
8. On My Way SMS
9. Invoice Delivery (SMS + Email)
10. Email Classifier + Auto-Responder
11. Email Feedback Handler

**Revenue (6):**
12. Missed Call AI Capture
13. Photo-Based Quoting (ResponsiBid)
14. Quote Follow-up Email Sequence
15. Estimate Status Sync
16. Plan Enrollment + Renewal
17. Payment Plan Installments

**Operations (3):**
18. Auto-Dispatch Monitor
19. Daily Territory Assignment
20. Weekly Bonus Calculator

**SEO (4):**
21. GSC Daily Sync
22. City/Neighborhood Content Generator
23. Content Gap Detector
24. Ranking Opportunity Detector

**Other (1):**
25. Ad Performance Auto-Optimizer

### INACTIVE in TTW — TG Has Nothing (30+ capabilities)

**Most valuable:**
- Revenue Attribution Engine
- Churn Intervention Engine
- Self-Improvement Loop (12 workflows)
- LinkedIn/Institutional Pipeline (9 workflows)
- Invoice Collections Automation
- GA4 Reporting
- Customer Birthday/Anniversary
- Commercial Nurture Sequence

---

## REVISED PRIORITY — What To Build

Now that we know TG has a massive SEO/schema advantage, the priorities shift:

### Phase 0: Fix Existing (Zero Build Cost)
1. Add missing API keys (Facebook, Google Places, GSC, OpenWeatherMap, IndexNow)
2. Complete Jobber OAuth handshake
3. Verify Twilio SMS campaign
4. Add Brevo DNS records
5. Deploy TG-81 and TG-82 to n8n
**Impact: ~35 functional → ~55+ functional**

### Phase 1: Revenue Impact (Build These First)
1. **Missed Call AI Capture** — extend VAPI
2. **Quote Follow-up Email Sequence** — simple, high ROI
3. **On My Way SMS** — simple, huge CX improvement
4. **Invoice Delivery Automation** — eliminate manual billing
5. **Plan Enrollment + Renewal** — recurring revenue

### Phase 2: CRM Unification
6. **CRM Webhook Router** — unified event handling
7. **CRM Send SMS/Email** — unified communication
8. **Estimate Status Tracking** — trigger right follow-ups
9. **Deep Jobber Integration** — full API proxy like TTW's HCP proxy

### Phase 3: SEO Gaps (TG Already Dominates Here — Fill Remaining Holes)
10. **GSC Daily Sync** — feed data into existing SEO system
11. **City Content Generator** — programmatic local pages (TG already has schema for 12 cities × 15 services)
12. **Content Gap Detector** — find missing topics
13. **Ranking Opportunity Detector** — quick wins

### Phase 4: Advanced
14. **Self-Improvement Loop** — meta-optimization
15. **Revenue Attribution** — know which channel drives revenue
16. **Churn Intervention** — auto-prevent customer loss
