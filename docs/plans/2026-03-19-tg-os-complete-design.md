# TG-OS: The TotalGuard Operating System
## Complete Business Automation Design Document
**Date:** 2026-03-19
**Status:** APPROVED
**Scope:** Every aspect of TotalGuard business operations

---

## Vision

An autonomous business nervous system that acquires customers, converts leads, delivers excellence, retains accounts, generates referrals, monitors competitors, optimizes marketing, amplifies the brand, and reports everything via Telegram — while the owner sleeps.

---

## Current State (As of 2026-03-19)

### n8n Instance: tgyardcare.app.n8n.cloud
- **114 workflows** (97 active, 17 inactive)
- **UNHEALTHY:** 25+ workflows failing daily, 100 errors in 3 days
- **Root causes:** Malformed URLs (`==https://`), stale Supabase keys, no data sources (Jobber API not available)
- **~15 workflows** active but effectively dead (need Jobber API)
- **17 duplicate inactive workflows** creating clutter

### Integrations Available
- Supabase (DB + Edge Functions)
- Brevo (email marketing)
- Twilio (SMS — A2P campaign status unknown)
- Quo/OpenPhone (business phone)
- Google Places API
- OpenWeatherMap API
- Telegram Bot
- Gmail IMAP (Jobber email parsing)
- Resend (transactional email)
- Cloudflare (DNS)
- UptimeRobot (keep-alive)

### Integrations NOT Available
- Jobber API (no API plan — email parsing only via TG-05)
- Stripe (using Jobber Payments)
- Vapi (organic human calls preferred)
- Google Business Profile API (pending verification)

### Social Media Audit
| Platform | Status | Issues |
|----------|--------|--------|
| Google Business Profile | ACTIVE, 4.9★, 80+ reviews | Strongest asset |
| Nextdoor | ACTIVE, 5.0★, 110 reviews | Name says "Home Care" not "Yard Care" |
| Facebook | EXISTS | Website links to personal profile, not business page |
| Instagram | UNCLEAR | Likely dormant |
| Yelp | EXISTS | Top 10 listed, claim status unknown |
| BBB | EXISTS, A rating | Wrong phone numbers |
| LinkedIn | EXISTS | Personal profile, not company page |
| YouTube | NOT FOUND | Zero presence |
| TikTok | NOT FOUND | Zero presence |
| Pinterest | NOT FOUND | Zero presence |

### Revenue Source
- Quote forms on website (organic Google search) — only active lead source

---

## Architecture: 10 Layers

```
L10: SCALE & FRANCHISE READINESS
L9:  INTELLIGENCE & COMMAND CENTER
L8:  COMMUNITY & LOCAL PARTNERSHIPS
L7:  SOCIAL MEDIA MACHINE
L6:  CONTENT & BRAND ENGINE
L5:  PAID ADVERTISING AUTOMATION
L4:  RETENTION, REFERRAL & LIFETIME VALUE
L3:  DELIVERY EXCELLENCE
L2:  CONVERSION ENGINE
L1:  FOUNDATION & MARKETING INFRASTRUCTURE
```

---

## LAYER 1: FOUNDATION & MARKETING INFRASTRUCTURE

### 1A — n8n Cleanup
1. Deactivate all 97 active workflows
2. Delete 17 inactive duplicates
3. Fix `==https://` URL bug pattern across all workflows
4. Update stale Supabase keys (rotated 2026-03-15)
5. Fix TG-94/TG-95 duplicates (one SMS sender, one email sender)
6. Verify Twilio A2P campaign approval status
7. Fix Twilio inbound webhook (demo.twilio.com → n8n TG-76)
8. Configure Quo missed call webhook → n8n TG-85

### 1B — Reactivate Infrastructure
| Workflow | Purpose |
|----------|---------|
| TG-79 | Universal webhook router |
| TG-92 | Secondary webhook router |
| TG-94 (one copy) | Unified SMS sender |
| TG-95 (one copy) | Unified email sender |
| TG-70 | System health monitor |
| TG-74 | Telegram bot |
| TG-113 | Critical alert router |

### 1C — Social Profile Optimization
**Every platform rebuilt to perfection with consistent NAP:**
- Name: TotalGuard Yard Care
- Address: 7610 Welton Dr, Madison, WI 53719
- Phone: (608) 535-6057
- Website: tgyardcare.com

**Profiles to fix:** Facebook (URL mismatch), Instagram (reactivate), Nextdoor (rename), BBB (fix phones), LinkedIn (create company page), Yelp (claim)

**Profiles to create:** YouTube, TikTok, Pinterest

### 1D — Auto-Posting Infrastructure
- Install Upload-Post ($16/mo) or LATE ($19/mo) n8n community node
- Single API call posts to all connected platforms
- Supports: Facebook, Instagram, TikTok, YouTube, LinkedIn, Pinterest, Twitter/X

### 1E — Email Marketing (Brevo)
Existing lists: All Leads (6), Active Customers (7), VIP (8), Dormant 90+ (9), Newsletter (10)
New lists: Referral Sources, Annual Plan Members, Commercial Leads

---

## LAYER 2: CONVERSION ENGINE

### Quote Form Pipeline
```
Form submitted → [0s] Supabase + Brevo + Telegram alert + SMS to customer + email confirmation
→ [2h] Speed-to-lead warning if not contacted
→ [24h] Follow-up SMS
→ [3d] Email with social proof (latest 5★ reviews)
→ [5d] SMS with 10% offer
→ [7d] Final email
→ [14d] Move to nurture list
```

### Workflows
| ID | Name | Status |
|----|------|--------|
| TG-01 | Lead capture (rebuild) | Multi-channel instant response |
| TG-09 | Follow-up sequences (rebuild) | 5-touch across SMS + email |
| TG-91 | Abandoned quote SMS (fix) | Nudge unaccepted quotes |
| TG-83 | Quote follow-up sequence (fix) | Quote-specific follow-up |
| TG-07 | Lead scoring (rebuild) | Score by engagement signals |
| NEW: TG-120 | Speed-to-lead timer | Escalating Telegram reminders |

---

## LAYER 3: DELIVERY EXCELLENCE

### Jobber Email Intelligence (TG-05 Enhancement)
Parse ALL Jobber email types: job created, scheduled, completed, quote sent/accepted, invoice sent/paid

### Workflows
| ID | Name | Status |
|----|------|--------|
| TG-05 | Jobber email parser (enhance) | Parse all event types |
| TG-88 | On-my-way SMS (fix) | Crew ETA notification |
| TG-18 | Post-job review request (rebuild) | 24h after job complete |
| NEW: TG-121 | Pre-job notification | Day-before reminder SMS |
| NEW: TG-122 | Job complete notification | Post-job SMS with quality check |

### Quality Feedback Loop
Positive reply → trigger review request
Negative reply → URGENT Telegram alert + auto-apology
No reply 48h → gentle check-in

---

## LAYER 4: RETENTION, REFERRAL & LIFETIME VALUE

### Review Generation Machine (Goal: 5+/week)
Job complete → [24h] SMS review request → [72h] email follow-up
5★ → auto-thank + referral ask + social post
1-3★ → URGENT alert + apology + owner call

### Referral Engine
5★ review → "Refer a neighbor, both get $25 off" → track in Supabase → notify when referral books

### Annual Plan & Upsell
| ID | Name | Trigger |
|----|------|---------|
| TG-86 | Plan enrollment | After 2nd service |
| TG-87 | Plan renewal reminder | 30 days before expiry |
| TG-65 | Subscription upsell | Mow-only customers |
| TG-10 | Cross-sell | Active customers, seasonal |
| TG-12 | VIP upgrade | 5+ jobs completed |
| TG-90 | Fertilizer schedule | Step notifications |
| TG-63 | Win-back engine | 90+ days dormant |
| TG-11 | Reengagement ladder | 60 days dormant |
| TG-60 | NPS survey | Quarterly |

### Seasonal Email Calendar
Jan: Early bird booking | Feb: Annual plan push | Mar: Spring cleanup
Apr: Fertilizer Step 1 | May: Cross-sell aeration | Jun: Steps 2&3
Jul: Drought care | Aug: Fall pre-booking | Sep: Fall cleanup + Step 4
Oct: Leaf cleanup + Step 5 | Nov: Snow enrollment | Dec: Year review + renewals

### Workflows
TG-14 (spring), TG-15 (fall), TG-16 (snow), TG-32 (seasonal transition), TG-56 (weather-triggered), TG-81 (monthly newsletter)

---

## LAYER 5: PAID ADVERTISING AUTOMATION

### Google Local Service Ads (Priority #1)
- $10-30/lead, appears above all other ads
- Requirements: background check, insurance, GBP verified
- Budget: $500-1000/mo to start
- LSA leads → parse → instant TG-01 pipeline

### Facebook/Instagram Ads
- ~$28/lead, target homeowners by zip code
- TG-40 already syncs Facebook leads
- Best creative: before/after photos and video

### Google Ads
- ~$88/lead, best for high-ticket services
- TG-109 syncs daily performance data

### Weather-Triggered Ad Budgets
NEW: TG-123 — Storm forecast → increase ad spend. Nice weather → reduce.

---

## LAYER 5B: GOOGLE BUSINESS PROFILE DOMINATION

GBP is TotalGuard's #1 asset (4.9 stars, 80+ reviews). Once API access is approved, this becomes fully automated. Until then, we build the content engine and queue everything.

### GBP Profile Optimization (GOD TIER)

**Business Information:**
- Name: TotalGuard Yard Care
- Primary Category: Lawn care service
- Secondary Categories: Landscaper, Garden maintenance, Snow removal service, Fertilization service
- Description (750 chars, keyword-rich):
  "TotalGuard Yard Care is Madison's premier full-service lawn care and landscaping company. We deliver professional lawn mowing, fertilization programs, spring and fall cleanups, mulching, edging, aeration, overseeding, hardscaping, gutter cleaning, and snow removal across Madison, Middleton, Sun Prairie, Fitchburg, Verona, Waunakee, and surrounding Dane County communities. Our 5-step fertilizer program and annual care plans keep your lawn lush year-round. 4.9-star rated with 80+ Google reviews. Locally owned. Licensed and insured. Free estimates — call or text today."
- Service area: Madison, Middleton, Sun Prairie, Fitchburg, Verona, Oregon, Waunakee, DeForest, Stoughton, McFarland, Monona, Cottage Grove, Cross Plains, Mount Horeb
- Hours: Mon-Sat 7:00 AM - 7:00 PM, Sun Closed
- Phone: (608) 535-6057
- Website: https://tgyardcare.com
- Appointment URL: https://tgyardcare.com/quote

**Services (SEO-Optimized Titles & Descriptions):**

| Service Title | Description | Price Display |
|--------------|-------------|---------------|
| Professional Lawn Mowing & Maintenance | Weekly or bi-weekly precision mowing with trimming, edging, and blowing. Consistent cut height for a healthy, manicured lawn all season. | From $45 |
| 5-Step Fertilizer & Weed Control Program | Science-based fertilization: spring wake-up, weed defense, summer stress support, fall recovery, and winterizer. Custom-blended for Wisconsin soil. | From $55/step |
| Spring Cleanup & Lawn Revival | Complete spring refresh: debris removal, bed edging, first mow, soil prep. Wake your lawn up right after Wisconsin winters. | From $150 |
| Fall Cleanup & Leaf Removal | Full leaf removal, final mow, bed cleanup, gutter clearing, and winterization prep. Protect your lawn before the freeze. | From $175 |
| Core Aeration & Overseeding | Professional core aeration to relieve compaction + premium seed blend for thicker, healthier turf. Best done in fall. | From $125 |
| Mulch Installation & Bed Maintenance | Fresh mulch delivery and installation for landscape beds. Weed suppression, moisture retention, and curb appeal. | From $75/yard |
| Hardscaping & Patio Installation | Custom patios, retaining walls, fire pits, and walkways. Transform your outdoor living space with professional hardscape design. | Custom quote |
| Gutter Cleaning & Guard Installation | Complete gutter flush, downspout clearing, and optional guard installation. Prevent water damage and ice dams. | From $125 |
| Snow Removal & Ice Management | Reliable residential and commercial snow plowing, shoveling, and salt/sand application. Priority response for contract customers. | From $50/visit |
| Annual Lawn Care Plan | All-inclusive yearly plan: weekly mowing, 5-step fertilizer, spring and fall cleanup, aeration. One price, zero hassle. | Custom quote |
| Landscape Design & Installation | Custom landscape design, plant selection, and professional installation. Native Wisconsin plants and drought-resistant options. | Custom quote |
| Bush & Hedge Trimming | Professional shaping and trimming of shrubs, hedges, and ornamental plants. Maintain clean lines and healthy growth. | From $75 |

**Products (for service packages):**

| Product Title | Description |
|--------------|-------------|
| TotalGuard Annual Plan | Complete year-round lawn care package. Weekly mowing, 5-step fertilizer, spring and fall cleanups, aeration, and priority scheduling. Save 15% vs individual services. |
| TotalGuard Fertilizer Program | 5-step professional fertilizer and weed control program. Applications in April, June (x2), September, and October. Customized for your lawn's needs. |
| Spring Starter Package | Spring cleanup + first mow + fertilizer Step 1. Everything your lawn needs to wake up from winter. |
| Fall Protection Package | Fall cleanup + leaf removal + aeration + winterizer. Set your lawn up for a strong spring comeback. |

### GBP Posting Strategy (Billionaire Schedule)

**Posting Cadence:** 3x/week (Mon, Wed, Fri at 10 AM CT)
- This cadence keeps the profile algorithmically active without over-posting
- Each post type rotates on a strategic schedule

**Weekly Rotation:**

| Day | Post Type | Content Strategy |
|-----|-----------|-----------------|
| **Monday** | UPDATE post | Seasonal tip or lawn care education. Positions TotalGuard as the local authority. Include a relevant photo. CTA: "Learn More" → blog post |
| **Wednesday** | OFFER post | Service promotion with urgency. Seasonal discount, limited-time deal, or package highlight. CTA: "Get Offer" → quote form |
| **Friday** | EVENT or WHAT'S NEW post | Before/after showcase, recent 5-star review highlight, team spotlight, or community involvement. CTA: "Call Now" or "Book Online" |

**Monthly Content Calendar:**

| Month | Monday Topics | Wednesday Offers | Friday Showcases |
|-------|-------------|-----------------|-----------------|
| **Jan** | "Preparing your lawn for spring" series | Early bird annual plan signup | Year-in-review, team intro |
| **Feb** | Winter lawn damage prevention | Pre-season booking discount 15% | Snow removal highlights |
| **Mar** | Spring lawn care checklist | Spring cleanup package deal | First cleanup before/afters |
| **Apr** | Fertilizer Step 1 education | Annual plan enrollment push | Green-up transformations |
| **May** | Mowing height & frequency tips | New customer first-mow discount | Best transformations of spring |
| **Jun** | Summer stress & watering guide | Mulch + mow combo deal | Lush lawn showcases |
| **Jul** | Drought survival tips | Mid-season checkup offer | Customer testimonial spotlight |
| **Aug** | Fall prep planning guide | Early fall cleanup booking | Summer's best work compilation |
| **Sep** | Aeration education series | Aeration + overseeding package | Fall color transformations |
| **Oct** | Winterization guide | Leaf cleanup + winterizer combo | Satisfying leaf cleanup content |
| **Nov** | Snow prep & contract info | Snow removal contract early bird | Community involvement spotlight |
| **Dec** | Year-end lawn care recap | Gift certificate promotion | Thank you to customers |

**Post Best Practices:**
- Every post includes a high-quality photo (before/after, crew at work, or result shot)
- Every post includes a CTA button (Call, Book, Get Offer, Learn More)
- Keywords naturally embedded: "lawn care Madison," "landscaping," service-specific terms
- Character sweet spot: 150-300 words per post
- Include seasonal emojis sparingly for visual appeal

### GBP FAQ Strategy (Rotating & SEO-Optimized)

**Core FAQs (Always Active — Never Remove):**

| Question | Answer |
|----------|--------|
| How much does lawn mowing cost in Madison? | Our professional mowing starts at $45 per visit for standard residential lots. Price depends on lawn size, obstacles, and frequency. We offer weekly and bi-weekly options with discounts for annual plan members. Call (608) 535-6057 for a free estimate. |
| Do you offer free estimates? | Yes! We provide free, no-obligation estimates for all services. Call or text us at (608) 535-6057, or fill out the form on our website at tgyardcare.com/quote. We typically respond within 1 hour. |
| What areas do you serve? | We serve Madison and the greater Dane County area including Middleton, Sun Prairie, Fitchburg, Verona, Oregon, Waunakee, DeForest, Stoughton, McFarland, Monona, Cottage Grove, Cross Plains, and Mount Horeb. |
| What is your 5-step fertilizer program? | Our 5-step program includes: (1) Early Spring Wake-Up, (2) Late Spring Weed Defense, (3) Summer Stress Support, (4) Fall Recovery, and (5) Winterizer. Each application is timed to Wisconsin's growing season for maximum results. |
| Are you licensed and insured? | Yes, TotalGuard Yard Care is fully licensed and insured. We carry general liability insurance and all crew members are covered by workers' compensation. |
| Do you offer annual lawn care plans? | Yes! Our Annual Plan includes weekly mowing, the full 5-step fertilizer program, spring and fall cleanups, and aeration — all for one simple price. Annual plan members save 15% compared to individual services. |

**Seasonal FAQ Rotation (Swap quarterly):**

**Spring FAQs (March-May):**
| Question | Answer |
|----------|--------|
| When should I start mowing in Madison? | In the Madison area, we typically begin mowing in mid-to-late April once grass reaches 3-3.5 inches. We monitor conditions and will let you know when it's time to start your service. |
| What does a spring cleanup include? | Our spring cleanup includes debris removal, leaf cleanup, bed edging, first mow of the season, and assessment of any winter damage. We'll get your property looking pristine for the growing season. |
| When should I apply the first fertilizer in Wisconsin? | Step 1 of our fertilizer program goes down in mid-April when soil temperatures consistently reach 55 degrees F. Timing is critical — too early wastes product, too late misses the growth window. |

**Summer FAQs (June-August):**
| Question | Answer |
|----------|--------|
| How often should I water my lawn in summer? | Water deeply 2-3 times per week rather than daily light watering. Aim for 1 inch of water per week total (including rain). Water early morning to reduce evaporation and disease risk. |
| Should I mow shorter in hot weather? | No — keep your mowing height at 3-3.5 inches during summer. Taller grass shades the soil, retains moisture, and handles heat stress better. We adjust our cutting height seasonally. |
| Do you treat for grubs? | We offer targeted grub treatment as part of our lawn health services. Signs of grub damage include brown patches that pull up like carpet. Contact us for an assessment if you notice these signs. |

**Fall FAQs (September-November):**
| Question | Answer |
|----------|--------|
| When should I aerate my lawn in Wisconsin? | The ideal window for core aeration in the Madison area is September through mid-October. Fall aeration combined with overseeding produces the best results for thickening your lawn before winter. |
| Do you do leaf removal? | Yes! Our fall cleanup includes complete leaf removal from lawn, beds, and hard surfaces. We also clear gutters and do a final mow. Book early — fall fills up fast. |
| What is winterizer fertilizer? | Our Step 5 winterizer is applied in October and provides essential nutrients that help grassroots store energy for winter dormancy. This is the most important fertilizer application of the year for Wisconsin lawns. |

**Winter FAQs (December-February):**
| Question | Answer |
|----------|--------|
| Do you offer snow removal? | Yes! We provide reliable residential and commercial snow plowing, shoveling, walkway clearing, and salt/sand application. Contract customers get priority response and guaranteed service within 4 hours of snowfall ending. |
| When should I book snow removal? | We recommend booking snow removal contracts by November 1st to guarantee priority service. Spots are limited — once our routes are full, we stop accepting new contracts. |
| Can I book spring services now? | Absolutely! Booking spring services in winter locks in your spot on our schedule and often qualifies for early-bird pricing. Call (608) 535-6057 or visit tgyardcare.com/quote to get on the spring calendar. |

**FAQ Automation Workflow:**
| Workflow | What It Does |
|----------|-------------|
| NEW: TG-127 GBP FAQ Rotator | Quarterly: swap seasonal FAQs on GBP via API. Keep core FAQs permanent. Alert on Telegram before swap for approval. |
| NEW: TG-128 GBP FAQ Monitor | Weekly: check if competitors have new Q&A, suggest new FAQs to add |

### GBP Photo Strategy

**Minimum 50 photos organized by category:**
- Logo (1)
- Cover photo (1, seasonal rotation)
- Interior/team (5-10)
- At work (10-15: crew mowing, trimming, mulching)
- Before/After (15-20: the money shots)
- Equipment (3-5)
- Completed projects (10+)

**Photo Automation:**
- Every "job complete" Jobber email → Telegram prompt: "Upload before/after photos for [customer] job"
- Monthly Telegram reminder: "Upload 5+ new GBP photos this month"
- Seasonal cover photo rotation (auto-remind on equinox/solstice dates)

### GBP Workflows Summary
| ID | Name | Status |
|----|------|--------|
| TG-19 | Google Review Sync | Fix & reactivate (works with Places API now) |
| TG-20 | AI Review Response | Fix & reactivate (draft → Telegram for approval) |
| TG-46 | GBP Post Scheduler | Rebuild (3x/week schedule, queue in Supabase) |
| TG-55 | GBP Optimization Scorer | Fix & reactivate |
| NEW: TG-127 | GBP FAQ Rotator | Quarterly FAQ swap |
| NEW: TG-128 | GBP FAQ Monitor | Competitor Q&A tracking |
| NEW: TG-129 | GBP Photo Reminder | Monthly photo upload prompts |
| NEW: TG-130 | GBP Post Generator | AI-generate posts following monthly calendar |

---

## LAYER 6: CONTENT & BRAND ENGINE

### Content Machine
| Type | Cadence | Workflow |
|------|---------|----------|
| Blog posts | 3x/week | TG-99 |
| City/service pages | On-demand | TG-103 |
| GBP posts | 3x/week (Mon/Wed/Fri) | TG-46 + TG-130 |
| Social captions | Daily | TG-37 |
| Newsletter | Monthly | TG-81 |

### SEO Workflows
TG-99 (blog), TG-103 (city pages), TG-47 (IndexNow), TG-96 (GSC sync), TG-45 (rank tracking), TG-97 (rank drop detector), TG-52 (schema validator), TG-53 (page speed), TG-54 (AI meta generator), TG-50 (content refresher), TG-104 (quality checker), TG-48 (citation monitor), TG-49 (backlink tracker)
NEW: TG-124 — Internal linking automation

---

## LAYER 7: SOCIAL MEDIA MACHINE

### Platform Strategy
| Platform | Frequency | Content Focus |
|----------|-----------|--------------|
| Facebook | 5x/week | Before/afters, tips, promos, reviews |
| Instagram | 5x/week | Before/afters, Reels |
| TikTok | 3-5x/week | Satisfying mows, transformations |
| YouTube Shorts | 3x/week | Cross-post from TikTok |
| LinkedIn | 2x/week | Business updates, commercial |
| Pinterest | 3x/week | Lawn inspiration, seasonal |
| GBP | 2x/week | Seasonal offers, tips |
| Nextdoor | 2x/week | Community tips (manual) |

### Content Pillars
Mon: Transformation | Tue: Tips | Wed: Behind the Scenes
Thu: Testimonial | Fri: Satisfying Video | Sat: Seasonal | Sun: Community

### Workflows
TG-35 (scheduler), TG-37 (AI captions), TG-38 (review→social), TG-41 (engagement), TG-42 (YouTube)
NEW: TG-125 (weekly content batch), NEW: TG-126 (multi-platform publisher)

---

## LAYER 8: COMMUNITY & LOCAL PARTNERSHIPS

### Neighbor Marketing
Job complete → extract address → email same-zip leads + generate door hanger + track density

### Partnership Outreach
Real estate agents, property managers, HOA boards, complementary services

### Community Goodwill
Free Mow for Veterans (monthly), Elderly Neighbor Care (quarterly)

### Workflows
TG-24 (post-job marketing), TG-26 (field marketing reminder), TG-31 (yard signs), TG-62 (commercial prospector)

---

## LAYER 9: INTELLIGENCE & COMMAND CENTER

### Daily Briefing (7 AM Telegram)
Leads, weather, reviews, SEO, email, social, revenue estimate, system health

### Weekly Report (Sunday 8 PM Telegram)
Full rollup: leads, conversions, revenue, review velocity, SEO, marketing, competitors, social

### Real-Time Alerts
New lead (instant), new review (instant), negative review (CRITICAL), rank drop (high), speed-to-lead warning, workflow failure, severe weather, competitor moves

### Workflows
TG-66 (daily KPI), TG-67 (weekly report), TG-70 (health monitor), TG-73 (execution report), TG-80 (marketing briefing), TG-113 (critical alerts), TG-118 (intelligence assembler), TG-39 (competitor monitor), TG-44 (competitor content), TG-72 (competitor report), TG-74 (Telegram bot)

---

## LAYER 10: SCALE & FRANCHISE READINESS

### A/B Testing
TG-105 (test router), TG-106 (auto-winner)

### Future Unlocks
- Jobber API (when budget allows)
- AI Phone Agent (when call volume exceeds capacity)
- Google Ads Automation (when >$1K/mo ads)
- Multi-Location (when expanding)
- "TG-OS" SaaS Product (sell the system)

---

## Execution Phases

| Phase | Layers | Days | Deliverable |
|-------|--------|------|-------------|
| 1 | L1 | 1-3 | Clean instance, social profiles, auto-post infra |
| 2 | L2 | 4-7 | Instant response, follow-up sequences |
| 3 | L3 + L4 (reviews) | 8-13 | Post-job automation, review machine |
| 4 | L4 (rest) | 14-18 | Referrals, annual plans, cross-sell |
| 5 | L6 | 19-22 | Blog, city pages, SEO monitoring |
| 6 | L7 | 23-26 | Auto-posting to 7+ platforms |
| 7 | L5 | 27-30 | Google LSA, Facebook Ads |
| 8 | L8 | 31-34 | Neighbor marketing, partnerships |
| 9 | L9 | 35-38 | Telegram command center |
| 10 | L10 | 39-42 | A/B testing, data foundation |

## Monthly Cost
| Item | Cost |
|------|------|
| n8n Cloud | ~$24/mo |
| Upload-Post | $16/mo |
| Twilio SMS | ~$10-30/mo |
| Brevo | Free tier |
| **Total (before ads)** | **~$50/mo** |

## Final Workflow Count
**~85 workflows** (down from 114) — 68 existing rebuilt + 17 new
Every single one has a data source, a purpose, and a revenue impact.
New GBP workflows: TG-127 (FAQ Rotator), TG-128 (FAQ Monitor), TG-129 (Photo Reminder), TG-130 (Post Generator)
