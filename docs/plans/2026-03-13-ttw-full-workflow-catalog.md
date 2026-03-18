# TotalWash (TWC) — Complete Workflow Catalog

**Date**: 2026-03-13
**Source**: workelyai.app.n8n.cloud API (250 workflows)
**Active**: 67 | **Inactive**: 183

---

## ACTIVE WORKFLOWS (67) — What's Actually Running

### CRM & Lead Management (11 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 1 | TWC - Lead Capture v2 (33 nodes) | Main lead intake from website forms — routes, scores, creates contact in CRM | TG-01 (simpler version) |
| 2 | TWC - Phone Lead Capture (20 nodes) | Captures phone inquiries into pipeline | TG-02 |
| 3 | TWC - Manual Lead Entry (26 nodes) | Staff manually adds leads with Supabase + Twilio SMS confirmation | TG-04 |
| 4 | TWC - Simple Lead Capture (Sub-Workflow) (4 nodes) | Lightweight sub-workflow called by other workflows to log a lead | No TG equivalent |
| 5 | TWC - LSA Lead Capture (25 nodes) | **Google Local Service Ads** — monitors Gmail for LSA lead emails, extracts info, creates lead | **NO TG EQUIVALENT** |
| 6 | TWC - Universal Webhook Router (7 nodes) | Routes incoming webhooks to the right workflow based on payload type | TG-79 |
| 7 | TWC 250 - CRM Webhook Router (13 nodes) | Unified router for ALL CRM events (HCP webhooks → routes to correct handler) | **NO TG EQUIVALENT** |
| 8 | 06 - HCP Customer Sync (23 nodes) | Syncs customer data between HouseCall Pro and Supabase | TG-05 (Jobber version, INACTIVE) |
| 9 | 07 - HCP Webhook Receiver (34 nodes) | Receives all HouseCall Pro webhooks (job created, completed, customer updated, etc.) | **NO TG EQUIVALENT** (TG has no deep CRM webhook integration) |
| 10 | TWC 200 - HCP API Proxy (12 nodes) | Centralized proxy for all HouseCall Pro API calls — auth, rate limiting, retry | **NO TG EQUIVALENT** |
| 11 | 64 - HCP Invoice & Estimate Sync (11 nodes) | Syncs invoices and estimates from HCP to Supabase for reporting | **NO TG EQUIVALENT** |

### Revenue & Quoting (7 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 12 | 36 - AI Real-Time Quote (5 nodes) | Customer describes job → AI generates instant price quote | TG-75 |
| 13 | 37 - AI Booking & HCP Sync (16 nodes) | AI books the job and syncs to HouseCall Pro | TG-77 |
| 14 | TWC 201 - ResponsiBid Quote Pipeline (33 nodes) x2 | **Photo-based quoting** — customer submits property photos, AI analyzes and generates quote. Full pipeline with follow-up | **NO TG EQUIVALENT** |
| 15 | TWC 203 - Quote Follow-up Email Sequence (12 nodes) | Automated email sequence when quote sent but not accepted — multiple touchpoints to close | **NO TG EQUIVALENT** |
| 16 | TWC 204 - HCP Estimate Status Sync (10 nodes) | Monitors HCP for estimate status changes (viewed, accepted, declined) → triggers appropriate follow-up | **NO TG EQUIVALENT** |
| 17 | 34 - Missed Call Capture AI Fallback (11 nodes) | **When a call is missed, AI picks up**, captures lead info, enters pipeline. No lead lost to voicemail | **NO TG EQUIVALENT** |

### Communication Layer (9 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 18 | TWC 251 - CRM Send SMS (3 nodes) x2 | **Unified SMS sender** — all outbound SMS goes through this one workflow. Logs to CRM | TG-76 (but TG's isn't unified or CRM-integrated) |
| 19 | TWC 252 - CRM Send Email (3 nodes) x2 | **Unified email sender** — all outbound email goes through this. Logs to CRM | **NO TG EQUIVALENT** |
| 20 | TWC 253 - CRM On My Way SMS (5 nodes) x2 | **Crew ETA notification** — sends "Your technician is on the way" SMS with arrival estimate | **NO TG EQUIVALENT** |
| 21 | TWC 254 - Invoice Delivery SMS + Email (7 nodes) x2 | **Automated invoice delivery** — sends invoice via both SMS and email after job completion | **NO TG EQUIVALENT** |
| 22 | TWC 218 - Email Classifier + Auto-Responder (27 nodes) x2 | **AI email triage** — reads incoming emails, classifies (quote request, complaint, scheduling, spam), auto-responds or routes | **NO TG EQUIVALENT** |
| 23 | TWC 219 - Email Feedback Handler (17 nodes) | Processes customer feedback from email replies — sentiment analysis, routing, follow-up | **NO TG EQUIVALENT** |
| 24 | TWC 222 - Gmail Watch Renewal (7 nodes) | Keeps Gmail push notification subscription alive for email classifier | **NO TG EQUIVALENT** (infrastructure) |

### Membership & Payments (3 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 25 | TWC 205 - Plan Renewal Reminder (7 nodes) | Reminds customers when their service plan is about to expire — drives renewals | **NO TG EQUIVALENT** |
| 26 | TWC 206 - Plan Enrollment Processor (12 nodes) | Processes new plan sign-ups — creates recurring schedule, sets up billing, sends confirmation | **NO TG EQUIVALENT** |
| 27 | TWC 255 - Payment Plan Installment Cron (7 nodes) x2 | Processes recurring installment payments on schedule | **NO TG EQUIVALENT** |

### Operations (4 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 28 | TWC 202 - Auto-Dispatch Monitor (10 nodes) | Monitors job queue, automatically assigns/dispatches to available crews | **NO TG EQUIVALENT** |
| 29 | 262 - Daily Territory Assignment (8 nodes) | Morning crew routing — assigns territories based on job locations, drive time, capacity | **NO TG EQUIVALENT** |
| 30 | 263 - Weekly Bonus Calculator (8 nodes) | Calculates crew performance bonuses (jobs completed, reviews earned, upsells, on-time %) | **NO TG EQUIVALENT** |
| 31 | TWC - Snow Event Auto-Creator (9 nodes) | Weather monitoring → auto-creates snow removal jobs when snowfall threshold hit | TG-56 (weather trigger only, doesn't create jobs) |

### SEO Engine (17 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 32 | TWC - 127 AI Blog Content Pipeline (14 nodes) | **Auto-generates 3 blog posts/week** (Mon/Wed/Fri 6am). AI writes, optimizes, publishes | **NO TG EQUIVALENT** (TG has cron blog gen but different approach) |
| 33 | TWC - 164 GSC Daily Sync (15 nodes) | **Pulls Google Search Console data daily** — clicks, impressions, positions, queries → Supabase | **NO TG EQUIVALENT** |
| 34 | TWC - 208 Rank Drop Alert (11 nodes) x2 | **Instant alerts when rankings drop** — compares daily positions, flags drops > threshold | **NO TG EQUIVALENT** |
| 35 | TWC - 215 City Content Generator (6 nodes) | **Programmatic local SEO** — generates city/neighborhood-specific landing pages with local content | **NO TG EQUIVALENT** |
| 36 | TWC - 215b City Content Batch (7 nodes) | Batch runner for city content — generates multiple city pages in one run | **NO TG EQUIVALENT** |
| 37 | TWC - 231 Ranking Opportunity Detector (14 nodes) | **Finds quick-win keywords** — pages ranking #4-20 that could reach page 1 with small improvements | **NO TG EQUIVALENT** |
| 38 | TWC - 232 Title/Meta Auto-Optimizer (19 nodes) x2 | **Auto-rewrites titles/metas** based on CTR and ranking data — improves without manual intervention | TG-54 (generates but doesn't auto-optimize from data) |
| 39 | TWC - 234 Content Gap Detector (15 nodes) | **Finds topics competitors rank for that you don't** — generates content briefs for missing topics | **NO TG EQUIVALENT** |
| 40 | TWC - 234 Neighborhood Content Health (7 nodes) x2 | Monitors health of neighborhood/city landing pages — freshness, ranking, engagement | **NO TG EQUIVALENT** |
| 41 | TWC - 235 Index Coverage Monitor (7 nodes) x2 | **Tracks what Google has indexed** — alerts on indexing issues, new pages not yet indexed | **NO TG EQUIVALENT** |
| 42 | TWC - 236 Content Uniqueness Report (5 nodes) x3 | **Detects duplicate content** — flags pages that are too similar, risking Google penalties | **NO TG EQUIVALENT** |
| 43 | TWC - 237 Neighborhood Page Performance (5 nodes) | Tracks performance of each local landing page — traffic, conversions, rankings | **NO TG EQUIVALENT** |
| 44 | TWC - 238 IndexNow Sitemap Ping (6 nodes) | **Pings search engines when content changes** — faster indexing via IndexNow protocol | TG-47 (but TG's has no IndexNow key configured) |
| 45 | 193 - GBP Auto-Applier (14 nodes) | **Auto-applies GBP optimization suggestions** — doesn't just audit, it fixes | TG-55 (audit only, can't auto-fix) |

### Review Management (2 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 46 | 28 - Post-Job Review Request (20 nodes) x2 | Multi-touch review request after job completion — SMS + email + follow-up | TG-18 |
| 47 | 29 - Google Review Sync (16 nodes) | Syncs Google reviews to database — new reviews trigger response workflows | TG-19 (but TG's has no Google Places key) |

### Marketing & Content (3 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 48 | TWC - Welcome Series (27 nodes) | 5-email welcome series over 30 days for new customers | TG-08 |
| 49 | 120 - Competitive Intelligence Monitor (10 nodes) | Monitors competitor websites, pricing, reviews, social for changes | TG-39 |
| 50 | TWC 196 - Content Type Rotator (15 nodes) | Rotates content types (tips, stories, promotions, educational) to keep marketing fresh | **NO TG EQUIVALENT** |

### Advertising (1 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 51 | TWC 161 - Ad Performance Auto-Optimizer (14 nodes) | **Auto-tunes ad campaigns** — adjusts bids, pauses underperformers, scales winners | **NO TG EQUIVALENT** |

### Intelligence (2 active)

| # | Workflow | What It Does | TG Equivalent? |
|---|---------|-------------|----------------|
| 52 | TWC 221 - Weekly AI Learning Report (10 nodes) | **AI self-assessment** — reports on what worked, what failed, what to adjust across all workflows | **NO TG EQUIVALENT** |
| 53 | 136 - Pricing Validation Weekly (5 nodes) | Validates pricing against market rates — ensures TG isn't under/overpriced | TG-58 |

**Note**: Some workflows appear twice (x2, x3) — these are duplicates/versions in n8n. The 67 "active" count includes these duplicates. Unique active workflows ≈ 50.

---

## INACTIVE WORKFLOWS (183) — The R&D Library

### Self-Improvement Loop (12 workflows)
These form a **meta-system that measures and auto-tunes other workflows**:

| # | Workflow | What It Does | Priority for TG |
|---|---------|-------------|-----------------|
| TWC 38 | Lead Job Attribution | Tracks which lead source produced each closed job | HIGH |
| TWC 39 | Email Engagement Scorer | Scores email engagement per contact to optimize send frequency | MEDIUM |
| TWC 40 | A/B Test Analyzer | Analyzes A/B test results across all campaigns | MEDIUM |
| TWC 41 | Lead Score Validator | Validates lead scores against actual conversion outcomes | HIGH |
| TWC 42 | Cross-Sell Tracker | Tracks which cross-sell offers convert | MEDIUM |
| TWC 43 | Weather Attribution | Links weather events to revenue changes | LOW |
| TWC 44 | Review Referral Linker | Links reviews to referral conversions | LOW |
| TWC 45 | Backlink Outcome Tracker | Tracks which backlinks actually drive traffic | LOW |
| TWC 46 | A/B Auto Optimizer | Auto-selects winning A/B variants | MEDIUM |
| TWC 47 | Email Template Optimizer | Optimizes email templates based on engagement data | MEDIUM |
| TWC 49 | Lead Score Calibrator | Re-calibrates lead scoring model based on outcomes | HIGH |
| TWC 50 | Backlink Strategy Optimizer | Adjusts link building strategy based on results | LOW |

### Email Marketing (10 workflows)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| TWC - Welcome Series | 5-email welcome (active version exists) | Already have active |
| TWC - Follow-Up Sequences (26 nodes) | Lead follow-up email drip | TG-09 exists |
| TWC - Re-Engagement Ladder (5 Stages) | Win-back dormant customers | TG-11 exists |
| TWC - Spring Nurture | Spring seasonal emails | TG-14 exists |
| TWC - Fall Nurture | Fall seasonal emails | TG-15 exists |
| TWC - VIP Upgrade Path | VIP status notification + exclusive offers | TG-12 exists |
| TWC - Commercial Nurture (5 emails / 60 days) | Nurture sequence for commercial prospects | **NEW** — HIGH |
| 89 - Email Send Time Optimizer | Per-customer optimal send times | MEDIUM |
| 90 - Email Subject Line A/B Tester | Auto-test subject line variants | MEDIUM |
| 105 - Brevo Auto-Segmentation Sync | Auto-segment contacts based on behavior | TG-17 exists |

### Review Management (8 workflows)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 30 - Review Re-engagement | Re-engage customers who left reviews for referrals | TG-21 exists |
| 65 - Review to Referral Pipeline | Convert reviewers into referrers | TG-22 exists |
| 102 - Review to Referral Pipeline Connector | Bridge between review and referral systems | LOW |
| 117 - Review Response AI Drafter | AI drafts review responses | TG-20 exists |
| 133 - Review Referral Bridge | Links reviews to referral tracking | LOW |
| 186 - Review Request Link & QR Generator | Generates personalized review links + QR codes for field crews | MEDIUM |
| TWC - Review Follow-Up (Milestones) | Follow-up at review milestones (10th, 25th, 50th review) | LOW |
| TWC - Review Request | SMS-based review request | TG-18 exists |

### Social Media (12 workflows)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 116 - Facebook Auto-Posting from Jobs | Posts job completions to Facebook automatically | MEDIUM |
| 118 - Social Posting Scheduler (x2) | Multi-platform social post scheduling | TG-35 exists |
| 122 - Instagram Auto-Posting | Before/after photos auto-posted to Instagram | MEDIUM |
| 123 - Nextdoor Auto-Posting | Community engagement on Nextdoor | TG-23 exists |
| 82 - Nextdoor Auto-Post | Simpler Nextdoor posting | TG-23 exists |
| 87 - Instagram Auto-Post | Basic Instagram posting | MEDIUM |
| TWC 181 - Unified Smart Social Poster (28 nodes) | **All-in-one social poster** — generates platform-specific content for FB, IG, Nextdoor, LinkedIn | HIGH |
| TWC 189 - Image Geotagging | Geotags images for local SEO before social posting | LOW |
| TWC 190 - YouTube Shorts Generator | Auto-generates YouTube Shorts from job footage | MEDIUM |
| TWC 191 - YouTube Analytics & Comment Monitor | Monitors YouTube performance and responds to comments | LOW |
| TWC 195 - AI Video Creator | AI-generated video content | LOW |
| 67 - Facebook Auto-Post from Jobs | Basic FB auto-posting | MEDIUM |

### SEO (18 inactive workflows)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 92 - Location SEO Page Generator | Programmatic local landing pages | HIGH (active version TWC-215 exists) |
| 115 - GBP Weekly Auto-Posting | Weekly GBP posts for local SEO | TG-46 exists |
| 168 - Weekly SEO Intelligence Report | Comprehensive SEO health digest | TG-51 exists |
| 177 - Content Research & Trend Scanner | Finds trending topics for content creation | MEDIUM |
| 179 - Competitor Content Analyzer | Deep analysis of competitor content strategy | TG-44 exists |
| 180 - Monthly Content Calendar Planner | AI plans next month's content calendar | TG-36 exists |
| 182 - Keyword Rank Tracker | Tracks keyword positions weekly | TG-45 exists |
| 183 - AI Visibility Monitor | Tracks brand visibility in AI answers (ChatGPT, Gemini, etc.) | HIGH — new concept |
| 184 - Citation Submission Automator | Auto-submits business to citation directories | TG-48 exists |
| 185 - Citation NAP Auditor | Audits Name/Address/Phone consistency across citations | TG-48 partial |
| 192 - GBP Audit Scanner (x2) | Scans GBP for optimization opportunities | TG-55 exists |
| 194 - SEO Intelligence Monitor (x2) | Comprehensive SEO monitoring dashboard | TG-51 exists |
| 197 - Content A/B Test Creator (x2) | Creates A/B test variants for content | **NEW** — MEDIUM |
| 198 - A/B Test Analyzer (x2) | Analyzes content A/B test results | **NEW** — MEDIUM |
| TWC - Backlink Health Tracker | Monitors backlink profile health | TG-49 exists |
| TWC - Brand Mention Auto-Outreach | Finds unlinked brand mentions, auto-requests link | MEDIUM |
| TWC - Citation NAP Audit | Monthly NAP consistency check | TG-48 partial |
| TWC - Citation Submission Queue | Queues citation submissions | TG-48 partial |
| TWC - 211 GBP Photo Auto-Publisher | Auto-publishes photos to GBP | MEDIUM |
| TWC - 212 Geo-Grid Rank Scanner | Visual grid of Google Maps rankings across service area | LOW |
| TWC - 216 Monthly Map Pack Health | Monthly report on Map Pack positions | MEDIUM |

### Field Operations (10 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 51 - Post-Job Field Marketing Task Creator | Creates marketing tasks after each job (door knockers, flyers) | TG-24 exists |
| 52 - Field Marketing Reminder | Hourly reminders for pending field marketing tasks | TG-26 exists |
| 53 - Daily Compliance Check | 8pm check that all field tasks were completed | TG-27 exists |
| 54 - Weekly Execution Report | Friday 5pm summary of field marketing execution | TG-73 exists |
| 55 - Missed Task Escalation | 9am alert for tasks not completed previous day | TG-28 exists |
| 56 - Field Marketing Form Handler | Processes crew-submitted field marketing forms | **NEW** — MEDIUM |
| 57 - Daily Marketing Briefing | 7am daily briefing for crews | TG-25/TG-80 exists |
| 58 - Campaign Prep Reminder | 8am reminder to prepare campaign materials | LOW |
| 59 - Inventory Alert | 9am check for low marketing material inventory | TG-30 exists |
| 60 - Yard Sign Collection Reminder | 8am reminder to collect yard signs | TG-31 exists |
| TWC 152 - Technician Photo Upload Receiver | Receives and processes field crew photos | TG-29 exists |
| TWC 153 - Media Asset AI Tagger | **AI auto-tags uploaded photos** (before/after, service type, quality) | **NEW** — MEDIUM |

### Sales & Commercial (13 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 35 - Commercial Client Outreach | Outreach to commercial prospects | TG-62 exists |
| 63 - Estimate Follow-Up Sequence (16 nodes) | Multi-step follow-up on sent estimates | **HIGH** — TG has nothing for this |
| 72 - Unscheduled Job Booking Bot | AI bot that books unscheduled jobs into open slots | **NEW** — HIGH |
| 73 - Seasonal Pre-Booking Engine | Pre-books recurring customers for next season | TG-32 partial |
| 78 - AI Quote Follow-Up Agent | AI-powered quote follow-up with personalized messaging | **NEW** — HIGH |
| 112 - Open Estimate Follow-Up | Follow-up on estimates that haven't been viewed | MEDIUM |
| 113 - Unscheduled Job Booker | Fills schedule gaps with unscheduled work | HIGH |
| 119 - AI Quote Follow-Up (Leads) | AI follow-up specifically for lead quotes | HIGH |
| TWC - Quote Follow-up (17 nodes) | General quote follow-up sequence | HIGH (active version TWC 203 exists) |
| TWC - Bundle Upsell (After Quote) | Upsells bundle packages after initial quote | MEDIUM |
| 111 - Automated Invoice Collections | Auto-follows up on overdue invoices | **HIGH** |
| 62 - Invoice Collections Sequence | Multi-step invoice collection with escalation | **HIGH** |
| 148 - Stale Lead Reactivator | Reactivates leads that went cold | MEDIUM |

### LinkedIn & Institutional (8 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 68 - LinkedIn Prospect Import & Scoring | Imports LinkedIn prospects and scores them | MEDIUM |
| 69 - LinkedIn Prospect Enrichment | Enriches LinkedIn prospect data | MEDIUM |
| 70 - LinkedIn Sequence Auto-Enrollment | Auto-enrolls prospects in outreach sequences | MEDIUM |
| 134 - LinkedIn Prospect Scraper (Apollo.io) | Weekly scrape of LinkedIn via Apollo.io | MEDIUM |
| 169 - Institutional Prospect Scraper | Scrapes institutional/municipal prospects | LOW |
| 170 - RFP Monitor & Classifier | Monitors government RFP postings for relevant bids | LOW |
| 171 - Institutional Contact Enricher | Enriches institutional contact data | LOW |
| 172 - Institutional Outreach Sender | Sends outreach to institutional prospects | LOW |
| 173 - Institutional Relationship Tracker | Tracks institutional sales relationships | LOW |

### Customer Intelligence (11 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 74 - Customer Health Score Calculator | Calculates customer health/churn risk score | TG-57 exists |
| 79 - Churn Intervention Engine | **Predicts churn and auto-intervenes** — personal outreach, special offers | **HIGH** |
| 96 - Madison Clean Score | Branded customer scoring system | LOW (market-specific) |
| 97 - Loyalty Points Engine (25 nodes) | Full loyalty points system with earning, redemption, tiers | TG-61 exists |
| 99 - Multi-Service Progression Tracker | Tracks customer journey up service ladder | **MEDIUM** |
| 100 - SMS Opt-In Consent Collector | TCPA-compliant SMS consent collection | TG-59 exists |
| 101 - NPS Survey Engine | Net Promoter Score survey automation | TG-60 exists |
| 130 - Daily Engagement Score Updater | Daily recalculation of customer engagement scores | MEDIUM |
| 131 - SMS Opt-In Collector (TCPA) | Twilio-based SMS consent | TG-59 exists |
| 146 - Customer Birthday/Anniversary | Sends personalized birthday/anniversary messages | **MEDIUM** — easy win |
| TWC - Customer Anniversary | Daily check for customer anniversaries | MEDIUM |

### Reporting & Analytics (9 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 77 - Revenue Attribution Engine (18 nodes) | **Multi-touch revenue attribution** — knows which channel drove each closed job | **HIGH** |
| 80 - Weekly Owner Intelligence Report | Comprehensive weekly digest for owner | TG-67 exists |
| 110 - End of Day Operations Reconciliation | Daily ops reconciliation | TG-69 exists |
| 126 - Weekly Owner Report (All Systems) | Full-system weekly report | TG-67 exists |
| 143 - Revenue Forecaster | Revenue prediction model | TG-68 exists |
| 147 - Daily KPI Digest SMS | Daily KPIs via SMS | TG-66 exists |
| 149 - Google Analytics 4 Weekly Reporter | GA4 automated reporting | **NEW** — MEDIUM |
| 150 - System Health Monitor (Capstone) | Master system health check | TG-70 exists |
| TWC 163 - Weekly Marketing ROI Report | Marketing ROI analysis | **NEW** — MEDIUM |

### Marketing Automation (11 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 103 - Postcard Lead Scoring Bonus | Bonus scoring for postcard-originated leads | LOW |
| 104 - Weather-to-Calendar Integration | Links weather events to job scheduling | TG-56 partial |
| 106 - Pricing Optimization Loop | Iterative pricing optimization | TG-58 partial |
| 107 - Content Performance Feedback Loop | Tracks which content drives leads | MEDIUM |
| 108 - NPS Feedback Response Automation | Auto-responds to NPS survey results | LOW |
| 125 - High-Value Service Upsell Engine | Upsells high-margin services | TG-65 partial |
| 128 - Scheduled Reminder Processor | Processes scheduled reminders every 2 hours | LOW |
| 129 - Holiday Lights Upsell Campaign | Seasonal upsell for holiday lights | LOW (unless TG offers this) |
| TWC 155 - Seasonal Campaign Auto-Creator | Auto-creates seasonal campaigns | TG-32 exists |
| TWC 157 - Lifecycle Campaign Generator | Generates campaigns based on customer lifecycle stage | **NEW** — MEDIUM |
| TWC 162 - Daily Marketing Automation Engine | Daily orchestrator that runs all marketing tasks | **NEW** — HIGH |

### Advertising (3 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| TWC 159 - Facebook/Instagram Ad Auto-Creator | Auto-creates FB/IG ads from job completions | MEDIUM |
| TWC 160 - Google Ads Smart Campaign Manager | Manages Google Ads campaigns automatically | MEDIUM |
| 84 - Competitive Intelligence Agent | Deep competitor analysis with AI | TG-39 exists |

### Financial (5 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 132 - HCP Revenue Sync | Syncs revenue data from HCP to Supabase | MEDIUM |
| TWC 164 - Sequence Account Balance Sync | Syncs bank account balances | LOW (platform-specific) |
| TWC 165 - Sequence Institution & Biller Sync | Syncs institutional payment data | LOW |
| TWC 166 - Cashflow Event Logger | Logs cashflow events for reporting | MEDIUM |
| 140 - Pricing Auto-Calibrator | Auto-adjusts pricing based on demand/competition | MEDIUM |

### Misc/Other (8 inactive)

| Workflow | What It Does | Priority for TG |
|---------|-------------|-----------------|
| 33 - Realtor Partner Outreach | Outreach to realtors for referral partnerships | MEDIUM |
| 61 - Seasonal Transition Alert | 1st-of-month seasonal transition notification | TG-32 exists |
| 83 - Subscription Plan Outreach | Cold outreach for subscription plans | MEDIUM |
| 85 - Gift Certificate Fulfillment | Processes gift certificate purchases | TG-64 exists |
| 86 - Service Area Expansion Analyzer | Analyzes potential new service areas | LOW |
| 94 - Winter Revenue Diversification | Identifies winter revenue opportunities | LOW |
| 109 - Real-Time Webhook Event Aggregator | Aggregates all webhook events for logging | LOW |
| 137 - Customer Winback Engine | Win-back dormant customers | TG-63 exists |
| 138 - Service Area Analyzer | Analyzes current service area efficiency | LOW |
| 145 - Appointment Reminder Optimizer | Optimizes appointment reminder timing | MEDIUM |
| TWC - Lead Reminders | Simple lead follow-up reminders | LOW |
| TWC - Local News Monitor | Monitors local news for marketing opportunities | LOW |
| TWC - Weekly Autonomous Activity Report | Weekly summary of what the automation system did | MEDIUM |
| TWC - Facebook Lead Capture | Captures Facebook ad leads | TG-03 exists |
| 199 - Smart Image Describer (x2) | AI describes uploaded images | LOW |
| TWC - Guest Post Auto-Pitcher | Auto-pitches guest posts to blogs | LOW |
| TWC - HARO Auto-Responder | Auto-responds to HARO journalist queries | LOW |
| TWC - Brand Mention Auto-Outreach | Converts brand mentions to backlinks | MEDIUM |
| 66 - GBP Auto-Post from Jobs | GBP posting from job completions | TG-46 exists |
| TWC 166 - GSC Historical Backfill | One-time GSC data backfill | LOW |
| TWC 167 - GA4 Historical Backfill | One-time GA4 data backfill | LOW |
| TWC - 215b City Content Batch Runner | One-time batch run for city pages | LOW |

---

## THE "STEAL LIST" — Top TTW Capabilities TG Should Build

Ranked by revenue impact and build effort:

### Tier 1: Steal Immediately (Direct Revenue Impact)

| # | Capability | TTW Source | Why It Matters | Build Effort |
|---|-----------|-----------|---------------|-------------|
| 1 | **Missed Call AI Capture** | 34 | Every missed call = lost $200-2000 job. AI captures the lead instead of voicemail | Medium |
| 2 | **Quote Follow-up Email Sequence** | TWC 203 | Most lawn care sends a quote and hopes. This auto-follows up until they close | Simple |
| 3 | **Invoice Collections Automation** | 111/62 | Auto-follows up on overdue invoices — direct cash recovery | Medium |
| 4 | **Photo-Based Instant Quoting** | TWC 201 (ResponsiBid) | Customer sends photos → gets price in minutes. Eliminates site visit bottleneck | Complex |
| 5 | **On My Way SMS** | TWC 253 | "Your crew is 15 min away" — massive CX improvement, reduces no-shows | Simple |
| 6 | **Plan Enrollment + Renewal** | TWC 205/206 | Recurring revenue = most valuable revenue. Automates the signup + renewal | Medium |
| 7 | **Estimate Status Sync + Follow-up** | TWC 204 | Know when customer views/ignores estimate → trigger right follow-up | Medium |

### Tier 2: Steal Next (Growth Multipliers)

| # | Capability | TTW Source | Why It Matters | Build Effort |
|---|-----------|-----------|---------------|-------------|
| 8 | **City Content Generator** | TWC 215/215b | Programmatic local SEO pages = organic traffic multiplier | Medium |
| 9 | **GSC Daily Sync** | TWC 164 | Without data, SEO is guesswork. This feeds all other SEO workflows | Simple |
| 10 | **Content Gap Detector** | TWC 234 | Finds keywords competitors rank for that you don't — content roadmap | Medium |
| 11 | **Ranking Opportunity Detector** | TWC 231 | Quick wins — pages almost on page 1 that need a small push | Medium |
| 12 | **CRM Communication Layer** | TWC 250-254 | Unified routing for ALL customer communication. Foundation for everything | Complex |
| 13 | **Email Classifier + Auto-Responder** | TWC 218 | AI triages inbox — quote requests auto-routed, complaints flagged, spam ignored | Medium |
| 14 | **Churn Intervention Engine** | 79 | Predicts who's about to leave and auto-intervenes | Medium |

### Tier 3: Steal When Ready (Operational Excellence)

| # | Capability | TTW Source | Why It Matters | Build Effort |
|---|-----------|-----------|---------------|-------------|
| 15 | **Auto-Dispatch Monitor** | TWC 202 | Auto-assigns jobs to crews. Scales from 3 to 10+ crews | Complex |
| 16 | **Daily Territory Assignment** | 262 | Optimized crew routing = more jobs/day, less fuel | Complex |
| 17 | **Weekly Bonus Calculator** | 263 | Automated crew incentives = motivated teams | Medium |
| 18 | **Revenue Attribution Engine** | 77 | Know which marketing channel actually drives revenue | Medium |
| 19 | **AI Blog Content Pipeline** | TWC 127 | 3 posts/week on autopilot. SEO content machine | Medium |
| 20 | **Self-Improvement Loop** | TWC 38-50 | Meta-system that auto-tunes all other workflows | Complex |

---

## QUICK STATS

| Category | TTW Active | TTW Inactive | TG Has Equivalent? |
|----------|-----------|-------------|-------------------|
| CRM/Lead Management | 11 | 3 | Partial (missing deep CRM integration) |
| Revenue/Quoting | 7 | 8 | Partial (missing photo quoting, estimate follow-up) |
| Communication Layer | 9 | 0 | NO (biggest gap) |
| Membership/Payments | 3 | 0 | NO |
| Operations | 4 | 10 | Partial (missing dispatch, territory, bonuses) |
| SEO Engine | 17 | 18 | Partial (missing programmatic content, GSC sync) |
| Review Management | 2 | 8 | Yes (mostly covered) |
| Email Marketing | 1 | 10 | Yes (TG's email system is stronger) |
| Social Media | 0 | 12 | Partial (definitions exist, APIs not configured) |
| Sales/Commercial | 0 | 13 | Partial (TG-62 exists but limited) |
| Customer Intelligence | 0 | 11 | Partial (health scoring exists) |
| Reporting | 0 | 9 | Yes (mostly covered) |
| Marketing Automation | 0 | 11 | Partial |
| Self-Improvement | 0 | 12 | NO |
| **TOTAL** | **67** | **183** | |
