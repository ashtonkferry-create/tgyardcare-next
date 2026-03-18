# Full TG vs TTW Analysis — Every Workflow, Honest Status

**Date**: 2026-03-13
**TG**: 80 deployed (78 active, 2 inactive) + 2 local-only (TG-81, TG-82)
**TTW**: 250 deployed (67 active, 183 inactive)

---

## PART 1: Side-by-Side — What TG Has vs TTW Equivalent

### Lead Capture & CRM

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-01 Lead Capture | ACTIVE | TWC Lead Capture v2 | ACTIVE | Both have it |
| TG-02 Phone Lead Capture | ACTIVE | TWC Phone Lead Capture | ACTIVE | Both have it |
| TG-03 Facebook Lead Capture | ACTIVE (no FB token) | TWC Facebook Lead Capture | inactive | TG has def, no API key |
| TG-04 Manual Lead Entry | ACTIVE | TWC Manual Lead Entry | ACTIVE | Both have it |
| TG-05 Jobber Email Parser | INACTIVE | 06 HCP Customer Sync | ACTIVE | TTW's CRM sync is live, TG's isn't |
| TG-06 Zapier Bridge Receiver | INACTIVE | TWC Universal Webhook Router | ACTIVE | TTW's router is more sophisticated |
| TG-07 Lead Scoring | ACTIVE | TWC 41 Lead Score Validator | inactive | TG has it live, TTW has validation layer |
| — | — | TWC Simple Lead Capture (Sub-Workflow) | ACTIVE | TG has no sub-workflow pattern |
| — | — | TWC LSA Lead Capture | ACTIVE | **TG MISSING**: Google Local Service Ads capture |
| — | — | 07 HCP Webhook Receiver | ACTIVE | **TG MISSING**: Deep CRM webhook integration |
| — | — | TWC 200 HCP API Proxy | ACTIVE | **TG MISSING**: Centralized CRM API proxy |
| — | — | 64 HCP Invoice & Estimate Sync | ACTIVE | **TG MISSING**: Invoice/estimate data sync |
| — | — | TWC 250 CRM Webhook Router | ACTIVE | **TG MISSING**: Unified CRM event router |

### Email Marketing

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-08 Welcome Series | ACTIVE | TWC Welcome Series | ACTIVE | Both have it |
| TG-09 Followup Sequences | ACTIVE | TWC Follow-Up Sequences | inactive | TG has it live |
| TG-10 Cross-Sell | ACTIVE | TWC Cross-Sell by Service / 142 | inactive | TG has it live |
| TG-11 Re-engagement Ladder | ACTIVE | TWC Re-Engagement Ladder | inactive | TG has it live |
| TG-12 VIP Upgrade | ACTIVE | TWC VIP Upgrade Path | inactive | TG has it live |
| TG-14 Spring Nurture | ACTIVE | TWC Spring Nurture | inactive | TG has it live |
| TG-15 Fall Nurture | ACTIVE | TWC Fall Nurture | inactive | TG has it live |
| TG-16 Snow Nurture | ACTIVE | TWC Snow Event Auto-Creator | ACTIVE | Different: TG sends emails, TTW creates jobs |
| TG-17 Brevo Segmentation | ACTIVE | 105 Brevo Auto-Segmentation | inactive | TG has it live |
| TG-81 Newsletter (local only) | NOT DEPLOYED | — | — | TG unique but not in n8n |
| TG-82 Flash Sales (local only) | NOT DEPLOYED | — | — | TG unique but not in n8n |
| — | — | 89 Email Send Time Optimizer | inactive | **TG MISSING** |
| — | — | 90 Email Subject Line A/B Tester | inactive | **TG MISSING** |
| — | — | TWC 218 Email Classifier + Auto-Responder | ACTIVE | **TG MISSING**: AI email triage |
| — | — | TWC 219 Email Feedback Handler | ACTIVE | **TG MISSING**: Email feedback processing |
| — | — | TWC Commercial Nurture | inactive | **TG MISSING**: Commercial email sequence |

### Review Management

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-13 Review Followup | ACTIVE | TWC Review Follow-Up (Milestones) | inactive | TG has it live |
| TG-18 Post-Job Review Request | ACTIVE | 28 Post-Job Review Request | ACTIVE | Both have it |
| TG-19 Google Review Sync | ACTIVE (no Places key) | 29 Google Review Sync | ACTIVE | TTW's works, TG's can't pull reviews |
| TG-20 AI Review Response | ACTIVE | 117 Review Response AI Drafter | inactive | TG has it live |
| TG-21 Review Re-engagement | ACTIVE | 30 Review Re-engagement | inactive | TG has it live |
| TG-22 Review to Referral | ACTIVE | 65/102 Review to Referral | inactive | TG has it live |
| TG-23 Nextdoor Reputation | ACTIVE | 123 Nextdoor Auto-Posting | inactive | Different approach |
| — | — | 186 Review Request Link & QR Generator | inactive | **TG MISSING**: QR code review links |

### Field Operations

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-24 Post-Job Field Marketing | ACTIVE | 51 Post-Job Field Marketing | inactive | TG has it live |
| TG-25 Crew Daily Briefing | ACTIVE (no weather API) | 57 Daily Marketing Briefing | inactive | TG has it but weather part broken |
| TG-26 Field Marketing Reminder | ACTIVE | 52 Field Marketing Reminder | inactive | TG has it live |
| TG-27 Compliance Check | ACTIVE | 53 Daily Compliance Check | inactive | TG has it live |
| TG-28 Missed Task Escalation | ACTIVE | 55 Missed Task Escalation | inactive | TG has it live |
| TG-29 Technician Photo Upload | ACTIVE | TWC 152 Technician Photo Upload | inactive | TG has it live |
| TG-30 Inventory Alert | ACTIVE | 59 Inventory Alert | inactive | TG has it live |
| TG-31 Yard Sign Collection | ACTIVE | 60 Yard Sign Collection | inactive | TG has it live |
| — | — | 56 Field Marketing Form Handler | inactive | **TG MISSING**: Crew form submissions |
| — | — | 58 Campaign Prep Reminder | inactive | **TG MISSING** |
| — | — | TWC 153 Media Asset AI Tagger | inactive | **TG MISSING**: AI auto-tags uploaded photos |
| — | — | 262 Daily Territory Assignment | ACTIVE | **TG MISSING**: Automated crew routing |
| — | — | 263 Weekly Bonus Calculator | ACTIVE | **TG MISSING**: Crew incentive tracking |
| — | — | TWC 202 Auto-Dispatch Monitor | ACTIVE | **TG MISSING**: Auto job dispatching |

### Seasonal & Programs

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-32 Seasonal Transition | ACTIVE | 61/114/TWC 155 | inactive | TG has it live |
| TG-33 Neighbor Postcards | ACTIVE (no Lob key) | 31 Neighbor Postcards | inactive | Neither works without mail API |
| TG-34 Referral Program | ACTIVE | 32 Referral Program | inactive | TG has it live |
| — | — | 33 Realtor Partner Outreach | inactive | **TG MISSING**: Realtor referral partnerships |
| — | — | 129 Holiday Lights Upsell | inactive | TG MISSING (if service offered) |
| — | — | TWC Snow Event Auto-Creator | ACTIVE | **TG MISSING**: Auto-creates jobs from weather |

### Social Media

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-35 Social Posting Scheduler | ACTIVE (no FB token) | 118 Social Posting Scheduler | inactive | TG has def, no API |
| TG-36 Content Calendar Generator | ACTIVE | 180 Monthly Content Calendar | inactive | TG has it live |
| TG-37 AI Caption Generator | ACTIVE | TWC 181 Unified Smart Social Poster | inactive | TTW version more comprehensive |
| TG-38 Review to Social | ACTIVE | 116/67 FB Auto-Post from Jobs | inactive | Different approach |
| TG-39 Competitor Monitor | ACTIVE | 120 Competitive Intelligence | ACTIVE | Both have it live |
| TG-40 Facebook Lead Sync | ACTIVE (no FB token) | TWC Facebook Lead Capture | inactive | Neither fully works |
| TG-41 Social Engagement Puller | ACTIVE (no APIs) | 187 Social Engagement Data Puller | inactive | TG has def, no APIs |
| TG-42 YouTube Shorts Planner | ACTIVE | TWC 190 YouTube Shorts Generator | inactive | TTW generates, TG plans |
| TG-43 Monthly Content Calendar | ACTIVE | 180 Monthly Content Calendar | inactive | Duplicate of TG-36 concept |
| TG-44 Competitor Content Analyzer | ACTIVE | 179 Competitor Content Analyzer | inactive | TG has it live |
| — | — | 122 Instagram Auto-Posting | inactive | **TG MISSING**: Instagram auto-post |
| — | — | 87 Instagram Auto-Post | inactive | **TG MISSING** |
| — | — | 188 Weekly Social Performance Report | inactive | **TG MISSING** |
| — | — | TWC 189 Image Geotagging | inactive | **TG MISSING** |
| — | — | TWC 191 YouTube Analytics | inactive | **TG MISSING** |
| — | — | TWC 195 AI Video Creator | inactive | **TG MISSING** |
| — | — | TWC 196 Content Type Rotator | ACTIVE | **TG MISSING**: Rotates content types |

### SEO

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-45 Keyword Rank Tracker | ACTIVE (no GSC token) | 182 Keyword Rank Tracker | inactive | TG has def, no API |
| TG-46 GBP Post Scheduler | ACTIVE (GBP blocked) | 115/66 GBP Auto-Posting | inactive | TG has def, GBP pending |
| TG-47 IndexNow Submitter | ACTIVE (no key) | TWC 238 IndexNow Sitemap Ping | ACTIVE | TTW's works, TG's doesn't |
| TG-48 Citation Monitor | ACTIVE | 184/185 Citation Submission + NAP Audit | inactive | TTW splits into 2 workflows |
| TG-49 Backlink Tracker | ACTIVE (no API) | TWC Backlink Health Tracker | inactive | Neither fully works |
| TG-50 Content Refresher | ACTIVE | 197/198 Content A/B Test Creator/Analyzer | inactive | TTW does A/B testing |
| TG-51 Local SEO Report | ACTIVE | 168/194 SEO Intelligence Report | inactive | TG has it live |
| TG-52 Schema Validator | ACTIVE | — | — | **TG UNIQUE** |
| TG-53 Page Speed Monitor | ACTIVE | — | — | **TG UNIQUE** |
| TG-54 AI Meta Generator | ACTIVE | TWC 232 Title/Meta Auto-Optimizer | ACTIVE | TTW auto-optimizes from data, TG generates |
| TG-55 GBP Optimization Scorer | ACTIVE (GBP blocked) | 192/193 GBP Audit + Auto-Applier | ACTIVE | TTW scans AND auto-fixes |
| — | — | TWC 127 AI Blog Content Pipeline | ACTIVE | **TG MISSING**: 3 posts/week auto-generated |
| — | — | TWC 164 GSC Daily Sync | ACTIVE | **TG MISSING**: Google Search Console data |
| — | — | TWC 208 Rank Drop Alert | ACTIVE | **TG MISSING**: Instant rank drop alerts |
| — | — | TWC 215/215b City Content Generator | ACTIVE | **TG MISSING**: Programmatic city pages |
| — | — | TWC 231 Ranking Opportunity Detector | ACTIVE | **TG MISSING**: Quick-win keyword finder |
| — | — | TWC 234 Content Gap Detector | ACTIVE | **TG MISSING**: Topics competitors rank for |
| — | — | TWC 234 Neighborhood Content Health | ACTIVE | **TG MISSING**: Local page monitoring |
| — | — | TWC 235 Index Coverage Monitor | ACTIVE | **TG MISSING**: Indexing health tracking |
| — | — | TWC 236 Content Uniqueness Report | ACTIVE | **TG MISSING**: Duplicate content detection |
| — | — | TWC 237 Neighborhood Page Performance | ACTIVE | **TG MISSING**: Local page analytics |
| — | — | 177 Content Research & Trend Scanner | inactive | **TG MISSING** |
| — | — | 183 AI Visibility Monitor | inactive | **TG MISSING**: AI search visibility |
| — | — | TWC 211 GBP Photo Auto-Publisher | inactive | **TG MISSING** |
| — | — | TWC 212 Geo-Grid Rank Scanner | inactive | **TG MISSING** |
| — | — | TWC 216 Monthly Map Pack Health | inactive | **TG MISSING** |
| — | — | TWC Brand Mention Auto-Outreach | inactive | **TG MISSING** |
| — | — | TWC Guest Post Auto-Pitcher | inactive | **TG MISSING** |
| — | — | TWC HARO Auto-Responder | inactive | **TG MISSING** |

### Customer Intelligence & Marketing

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-56 Weather Campaign Trigger | ACTIVE (no weather API) | 104/144 Weather Integration | inactive | TG has def, no API |
| TG-57 Customer Health Scorer | ACTIVE | 74 Customer Health Score | inactive | TG has it live |
| TG-58 Pricing Optimizer | ACTIVE | 136 Pricing Validation | ACTIVE | Both have it |
| TG-59 SMS Consent Manager | ACTIVE | 100/131/139 SMS Opt-In | inactive | TG has it live |
| TG-60 NPS Survey | ACTIVE | 101 NPS Survey Engine | inactive | TG has it live |
| TG-61 Loyalty Points | ACTIVE | 97 Loyalty Points Engine | inactive | TG has it live |
| — | — | 79 Churn Intervention Engine | inactive | **TG MISSING**: Auto churn prevention |
| — | — | 99 Multi-Service Progression Tracker | inactive | **TG MISSING** |
| — | — | 130 Daily Engagement Score Updater | inactive | **TG MISSING** |
| — | — | 146 Customer Birthday/Anniversary | inactive | **TG MISSING** |
| — | — | 145 Appointment Reminder Optimizer | inactive | **TG MISSING** |
| — | — | 148 Stale Lead Reactivator | inactive | **TG MISSING** |
| — | — | 96 Madison Clean Score Calculator | inactive | TTW-specific |

### Sales & Revenue

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-62 Commercial Prospector | ACTIVE | 35/141 Commercial Outreach | inactive | TG has it live |
| TG-63 Winback Engine | ACTIVE | 137 Customer Winback | inactive | TG has it live |
| TG-64 Gift Certificates | ACTIVE | 85/121 Gift Certificate | inactive | TG has it live |
| TG-65 Subscription Upsell | ACTIVE | 124 Subscription Upsell | inactive | TG has it live |
| — | — | 34 Missed Call Capture (AI Fallback) | ACTIVE | **TG MISSING**: AI missed call capture |
| — | — | 36 AI Real-Time Quote | ACTIVE | TG-75 equivalent |
| — | — | 37 AI Booking & HCP Sync | ACTIVE | TG-77 equivalent |
| — | — | TWC 201 ResponsiBid Quote Pipeline | ACTIVE | **TG MISSING**: Photo-based instant quoting |
| — | — | TWC 203 Quote Follow-up Email Seq | ACTIVE | **TG MISSING**: Automated quote follow-up |
| — | — | TWC 204 HCP Estimate Status Sync | ACTIVE | **TG MISSING**: Estimate tracking |
| — | — | TWC 205 Plan Renewal Reminder | ACTIVE | **TG MISSING**: Plan renewal automation |
| — | — | TWC 206 Plan Enrollment Processor | ACTIVE | **TG MISSING**: Membership signup |
| — | — | TWC 255 Payment Plan Installment | ACTIVE | **TG MISSING**: Installment billing |
| — | — | 111 Automated Invoice Collections | inactive | **TG MISSING**: Invoice follow-up |
| — | — | 62 Invoice Collections Sequence | inactive | **TG MISSING** |
| — | — | 63 Estimate Follow-Up Sequence | inactive | **TG MISSING** |
| — | — | 112 Open Estimate Follow-Up | inactive | **TG MISSING** |
| — | — | 113 Unscheduled Job Booker | inactive | **TG MISSING**: Fill schedule gaps |
| — | — | 72 Unscheduled Job Booking Bot | inactive | **TG MISSING** |
| — | — | 119 AI Quote Follow-Up (Leads) | inactive | **TG MISSING** |
| — | — | 78 AI Quote Follow-Up Agent | inactive | **TG MISSING** |
| — | — | 73 Seasonal Pre-Booking Engine | inactive | **TG MISSING** |
| — | — | 83 Subscription Plan Outreach | inactive | **TG MISSING** |
| — | — | 125 High-Value Service Upsell | inactive | **TG MISSING** |
| — | — | TWC Bundle Upsell (After Quote) | inactive | **TG MISSING** |

### Communications

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-74 Telegram Bot | ACTIVE | — | — | **TG UNIQUE** |
| TG-75 AI Quoting | ACTIVE | 36 AI Real-Time Quote | ACTIVE | Both have it |
| TG-76 Two-Way SMS | ACTIVE (Twilio unverified) | TWC 251 CRM Send SMS | ACTIVE | TTW's is unified/CRM-integrated |
| TG-77 AI Booking Sync | ACTIVE | 37 AI Booking & HCP Sync | ACTIVE | Both have it |
| TG-78 Voice Agent Sync | ACTIVE (no VAPI) | — | — | Doesn't work |
| TG-79 Universal Router | ACTIVE | TWC Universal Webhook Router | ACTIVE | Both have it |
| TG-80 Daily Marketing Briefing | ACTIVE | 57 Daily Marketing Briefing | inactive | TG has it live |
| — | — | TWC 251 CRM Send SMS | ACTIVE | **TG MISSING**: Unified CRM SMS |
| — | — | TWC 252 CRM Send Email | ACTIVE | **TG MISSING**: Unified CRM email |
| — | — | TWC 253 CRM On My Way SMS | ACTIVE | **TG MISSING**: Crew ETA notifications |
| — | — | TWC 254 Invoice Delivery SMS+Email | ACTIVE | **TG MISSING**: Auto invoice delivery |
| — | — | TWC 222 Gmail Watch Renewal | ACTIVE | **TG MISSING**: Gmail subscription infra |

### Analytics & Reporting

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| TG-66 Daily KPI Digest | ACTIVE | 147 Daily KPI Digest SMS | inactive | TG has it live |
| TG-67 Weekly Owner Report | ACTIVE | 80/126 Weekly Owner Report | inactive | TG has it live |
| TG-68 Revenue Forecaster | ACTIVE | 143 Revenue Forecaster | inactive | TG has it live |
| TG-69 End-of-Day Reconciliation | ACTIVE | 110 End of Day Ops Recon | inactive | TG has it live |
| TG-70 System Health Monitor | ACTIVE | 150 System Health Monitor | inactive | TG has it live |
| TG-71 Financial Snapshot | ACTIVE | TWC 164-166 Sequence Finance | inactive | Different platforms |
| TG-72 Competitor Intelligence | ACTIVE | 84/120 Competitive Intelligence | ACTIVE | Both have it |
| TG-73 Weekly Execution Report | ACTIVE | 54 Weekly Execution Report | inactive | TG has it live |
| — | — | 77 Revenue Attribution Engine | inactive | **TG MISSING**: Multi-touch attribution |
| — | — | 149 GA4 Weekly Reporter | inactive | **TG MISSING** |
| — | — | 165 GA4 Daily Sync | inactive | **TG MISSING** |
| — | — | TWC 163 Weekly Marketing ROI Report | inactive | **TG MISSING** |
| — | — | TWC 221 Weekly AI Learning Report | ACTIVE | **TG MISSING**: AI self-assessment |
| — | — | 132 HCP Revenue Sync | inactive | **TG MISSING**: CRM revenue sync |

### Advertising

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| — | — | TWC 161 Ad Performance Auto-Optimizer | ACTIVE | **TG MISSING**: Auto-tune ads |
| — | — | TWC 159 FB/IG Ad Auto-Creator | inactive | **TG MISSING** |
| — | — | TWC 160 Google Ads Smart Campaign | inactive | **TG MISSING** |

### LinkedIn & Institutional

| TG Workflow | Status | TTW Equivalent | TTW Status | Verdict |
|-------------|--------|---------------|------------|---------|
| — | — | 68 LinkedIn Prospect Import | inactive | **TG MISSING** |
| — | — | 69 LinkedIn Prospect Enrichment | inactive | **TG MISSING** |
| — | — | 70 LinkedIn Sequence Auto-Enrollment | inactive | **TG MISSING** |
| — | — | 134 LinkedIn Prospect Scraper | inactive | **TG MISSING** |
| — | — | 169 Institutional Prospect Scraper | inactive | **TG MISSING** |
| — | — | 170 RFP Monitor & Classifier | inactive | **TG MISSING** |
| — | — | 171 Institutional Contact Enricher | inactive | **TG MISSING** |
| — | — | 172 Institutional Outreach Sender | inactive | **TG MISSING** |
| — | — | 173 Institutional Relationship Tracker | inactive | **TG MISSING** |

### Self-Improvement Loop (TTW Only)

| TTW Workflow | Status | What It Does |
|-------------|--------|-------------|
| TWC 38 Lead Job Attribution | inactive | Which lead source → closed job |
| TWC 39 Email Engagement Scorer | inactive | Scores email engagement per contact |
| TWC 40 A/B Test Analyzer | inactive | Analyzes A/B test results |
| TWC 41 Lead Score Validator | inactive | Validates scores vs actual conversions |
| TWC 42 Cross-Sell Tracker | inactive | Tracks which cross-sell offers work |
| TWC 43 Weather Attribution | inactive | Links weather to revenue |
| TWC 44 Review Referral Linker | inactive | Links reviews to referrals |
| TWC 45 Backlink Outcome Tracker | inactive | Which backlinks drive traffic |
| TWC 46 A/B Auto Optimizer | inactive | Auto-selects winners |
| TWC 47 Email Template Optimizer | inactive | Optimizes templates from data |
| TWC 49 Lead Score Calibrator | inactive | Re-calibrates scoring model |
| TWC 50 Backlink Strategy Optimizer | inactive | Adjusts link strategy |

**TG has ZERO self-improvement workflows.**

---

## PART 2: What TTW Has ACTIVE That TG Doesn't Have At All

These are workflows running live in TTW right now that TG has no version of — not even a definition:

| # | TTW Active Workflow | What It Does | Impact |
|---|-------------------|-------------|--------|
| 1 | **TWC LSA Lead Capture** | Captures Google Local Service Ads leads from Gmail | HIGH — high-intent leads |
| 2 | **34 Missed Call Capture (AI Fallback)** | AI answers missed calls, captures lead info | HIGH — revenue recovery |
| 3 | **TWC 200 HCP API Proxy** | Centralized CRM API with auth/retry/rate limiting | HIGH — foundation layer |
| 4 | **07 HCP Webhook Receiver** | Receives all CRM events (job created/completed/etc) | HIGH — event-driven automation |
| 5 | **64 HCP Invoice & Estimate Sync** | Syncs invoice/estimate data to Supabase | HIGH — financial visibility |
| 6 | **TWC 201 ResponsiBid Quote Pipeline** | Photo-based instant quoting — customer sends photos, gets price | HIGH — removes estimate bottleneck |
| 7 | **TWC 203 Quote Follow-up Email Sequence** | Auto-follows up on sent quotes until accepted/declined | HIGH — closes more jobs |
| 8 | **TWC 204 HCP Estimate Status Sync** | Tracks when estimates are viewed/accepted/declined | HIGH — triggers right response |
| 9 | **TWC 205 Plan Renewal Reminder** | Reminds customers before plan expires | HIGH — reduces churn |
| 10 | **TWC 206 Plan Enrollment Processor** | Processes new membership sign-ups | HIGH — recurring revenue |
| 11 | **TWC 255 Payment Plan Installment Cron** | Processes recurring installment payments | HIGH — automated billing |
| 12 | **TWC 250 CRM Webhook Router** | Routes ALL CRM events to correct workflow | HIGH — unified event handling |
| 13 | **TWC 251 CRM Send SMS** | Unified SMS sender — all SMS through one pipeline | HIGH — communication layer |
| 14 | **TWC 252 CRM Send Email** | Unified email sender — all email through one pipeline | HIGH — communication layer |
| 15 | **TWC 253 CRM On My Way SMS** | "Your crew is on the way" ETA text | HIGH — massive CX improvement |
| 16 | **TWC 254 Invoice Delivery SMS + Email** | Auto-sends invoices via SMS and email | HIGH — eliminates manual billing |
| 17 | **TWC 218 Email Classifier + Auto-Responder** | AI reads incoming email, classifies, auto-responds/routes | HIGH — instant email handling |
| 18 | **TWC 219 Email Feedback Handler** | Processes customer feedback from email replies | MEDIUM |
| 19 | **TWC 222 Gmail Watch Renewal** | Keeps Gmail push notification alive for email classifier | LOW (infrastructure) |
| 20 | **TWC 202 Auto-Dispatch Monitor** | Auto-assigns jobs to available crews | HIGH — scales operations |
| 21 | **262 Daily Territory Assignment** | Optimizes crew routes each morning | HIGH — more jobs/day |
| 22 | **263 Weekly Bonus Calculator** | Calculates crew performance bonuses | MEDIUM — motivates teams |
| 23 | **TWC Snow Event Auto-Creator** | Weather → auto-creates snow removal jobs | HIGH — first-response advantage |
| 24 | **TWC 127 AI Blog Content Pipeline** | 3 blog posts/week auto-generated | HIGH — SEO content machine |
| 25 | **TWC 164 GSC Daily Sync** | Daily Google Search Console data pull | HIGH — SEO data foundation |
| 26 | **TWC 208 Rank Drop Alert** | Alerts when rankings drop | HIGH — catch SEO issues fast |
| 27 | **TWC 215/215b City Content Generator** | Programmatic city/neighborhood landing pages | HIGH — local SEO multiplier |
| 28 | **TWC 231 Ranking Opportunity Detector** | Finds keywords almost on page 1 | HIGH — quick SEO wins |
| 29 | **TWC 234 Content Gap Detector** | Finds topics competitors rank for that you don't | HIGH — content roadmap |
| 30 | **TWC 234 Neighborhood Content Health** | Monitors local page health | MEDIUM |
| 31 | **TWC 235 Index Coverage Monitor** | Tracks Google indexing status | MEDIUM |
| 32 | **TWC 236 Content Uniqueness Report** | Detects duplicate content | MEDIUM |
| 33 | **TWC 237 Neighborhood Page Performance** | Local page traffic/conversion tracking | MEDIUM |
| 34 | **TWC 161 Ad Performance Auto-Optimizer** | Auto-tunes ad campaigns | MEDIUM |
| 35 | **TWC 196 Content Type Rotator** | Rotates content types for freshness | LOW |
| 36 | **TWC 221 Weekly AI Learning Report** | AI self-assessment of all workflows | MEDIUM |
| 37 | **193 GBP Auto-Applier** | Auto-applies GBP optimization fixes | MEDIUM (TG has scorer but not auto-fix) |

**Total: 37 active TTW workflows that TG has NO version of.**

---

## PART 3: Everything TTW Has (Active + Inactive) That TG Doesn't Have At All

Combining active and inactive — every capability TTW has built that TG has zero version of:

### CRM & Infrastructure (7)
1. LSA Lead Capture (ACTIVE)
2. CRM Webhook Router (ACTIVE)
3. CRM API Proxy (ACTIVE)
4. CRM Webhook Receiver (ACTIVE)
5. Invoice & Estimate Sync (ACTIVE)
6. Gmail Watch Renewal (ACTIVE)
7. HCP Revenue Sync (inactive)

### Revenue & Quoting (12)
8. Missed Call AI Capture (ACTIVE)
9. ResponsiBid Photo Quote Pipeline (ACTIVE)
10. Quote Follow-up Email Sequence (ACTIVE)
11. Estimate Status Sync (ACTIVE)
12. Plan Renewal Reminder (ACTIVE)
13. Plan Enrollment Processor (ACTIVE)
14. Payment Plan Installment Cron (ACTIVE)
15. Automated Invoice Collections (inactive)
16. Invoice Collections Sequence (inactive)
17. Open Estimate Follow-Up (inactive)
18. Unscheduled Job Booker / Booking Bot (inactive)
19. AI Quote Follow-Up Agent (inactive)

### Communication Layer (6)
20. CRM Send SMS — unified (ACTIVE)
21. CRM Send Email — unified (ACTIVE)
22. On My Way SMS (ACTIVE)
23. Invoice Delivery SMS + Email (ACTIVE)
24. Email Classifier + Auto-Responder (ACTIVE)
25. Email Feedback Handler (ACTIVE)

### Operations (5)
26. Auto-Dispatch Monitor (ACTIVE)
27. Daily Territory Assignment (ACTIVE)
28. Weekly Bonus Calculator (ACTIVE)
29. Snow Event Auto-Creator (ACTIVE)
30. Media Asset AI Tagger (inactive)

### SEO (16)
31. AI Blog Content Pipeline (ACTIVE)
32. GSC Daily Sync (ACTIVE)
33. Rank Drop Alert (ACTIVE)
34. City Content Generator (ACTIVE)
35. Ranking Opportunity Detector (ACTIVE)
36. Content Gap Detector (ACTIVE)
37. Neighborhood Content Health (ACTIVE)
38. Index Coverage Monitor (ACTIVE)
39. Content Uniqueness Report (ACTIVE)
40. Neighborhood Page Performance (ACTIVE)
41. GBP Auto-Applier (ACTIVE)
42. Content Research & Trend Scanner (inactive)
43. AI Visibility Monitor (inactive)
44. GBP Photo Auto-Publisher (inactive)
45. Geo-Grid Rank Scanner (inactive)
46. Monthly Map Pack Health Report (inactive)

### Advertising (3)
47. Ad Performance Auto-Optimizer (ACTIVE)
48. FB/IG Ad Auto-Creator (inactive)
49. Google Ads Smart Campaign Manager (inactive)

### Customer Intelligence (6)
50. Churn Intervention Engine (inactive)
51. Multi-Service Progression Tracker (inactive)
52. Daily Engagement Score Updater (inactive)
53. Customer Birthday/Anniversary (inactive)
54. Appointment Reminder Optimizer (inactive)
55. Stale Lead Reactivator (inactive)

### LinkedIn & Institutional (9)
56. LinkedIn Prospect Import & Scoring (inactive)
57. LinkedIn Prospect Enrichment (inactive)
58. LinkedIn Sequence Auto-Enrollment (inactive)
59. LinkedIn Prospect Scraper (inactive)
60. Institutional Prospect Scraper (inactive)
61. RFP Monitor & Classifier (inactive)
62. Institutional Contact Enricher (inactive)
63. Institutional Outreach Sender (inactive)
64. Institutional Relationship Tracker (inactive)

### Reporting (5)
65. Weekly AI Learning Report (ACTIVE)
66. Revenue Attribution Engine (inactive)
67. GA4 Weekly Reporter (inactive)
68. GA4 Daily Sync (inactive)
69. Weekly Marketing ROI Report (inactive)

### Self-Improvement Loop (12)
70. Lead Job Attribution (inactive)
71. Email Engagement Scorer (inactive)
72. A/B Test Analyzer (inactive)
73. Lead Score Validator (inactive)
74. Cross-Sell Tracker (inactive)
75. Weather Attribution (inactive)
76. Review Referral Linker (inactive)
77. Backlink Outcome Tracker (inactive)
78. A/B Auto Optimizer (inactive)
79. Email Template Optimizer (inactive)
80. Lead Score Calibrator (inactive)
81. Backlink Strategy Optimizer (inactive)

### Content & Marketing (11)
82. Content Type Rotator (ACTIVE)
83. Commercial Nurture (inactive)
84. Unified Smart Social Poster (inactive)
85. YouTube Shorts Generator (inactive)
86. YouTube Analytics & Comment Monitor (inactive)
87. AI Video Creator (inactive)
88. Image Geotagging (inactive)
89. Lifecycle Campaign Generator (inactive)
90. Daily Marketing Automation Engine (inactive)
91. Brand Mention Auto-Outreach (inactive)
92. Guest Post Auto-Pitcher (inactive)

### Misc (8)
93. HARO Auto-Responder (inactive)
94. Bundle Upsell After Quote (inactive)
95. Realtor Partner Outreach (inactive)
96. Subscription Plan Outreach (inactive)
97. High-Value Service Upsell Engine (inactive)
98. Seasonal Pre-Booking Engine (inactive)
99. Service Area Analyzer / Expansion (inactive)
100. Winter Revenue Diversification (inactive)

### Financial (3)
101. Sequence Account Balance Sync (inactive)
102. Sequence Institution & Biller Sync (inactive)
103. Cashflow Event Logger (inactive)

---

## SUMMARY

| Category | TTW Has That TG Doesn't | Active | Inactive |
|----------|------------------------|--------|----------|
| CRM & Infrastructure | 7 | 6 | 1 |
| Revenue & Quoting | 12 | 7 | 5 |
| Communication Layer | 6 | 6 | 0 |
| Operations | 5 | 4 | 1 |
| SEO | 16 | 11 | 5 |
| Advertising | 3 | 1 | 2 |
| Customer Intelligence | 6 | 0 | 6 |
| LinkedIn & Institutional | 9 | 0 | 9 |
| Reporting | 5 | 1 | 4 |
| Self-Improvement Loop | 12 | 0 | 12 |
| Content & Marketing | 11 | 1 | 10 |
| Misc | 8 | 0 | 8 |
| Financial | 3 | 0 | 3 |
| **TOTAL** | **103** | **37** | **66** |

**TG is missing 103 capabilities that TTW has built.**
- 37 of those are ACTIVE and running in TTW right now
- 66 are inactive/in development

**TG's unique advantages over TTW** (things TTW doesn't have):
- TG-74 Telegram Bot
- TG-52 Schema Validator
- TG-53 Page Speed Monitor
- TG-08-17 Full branded email marketing suite (67 HTML emails, all active)
- TG-81 Newsletter "The Yard Report" (local only)
- TG-82 Flash Sales engine (local only)
