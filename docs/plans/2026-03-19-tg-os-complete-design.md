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

## LAYER 6: CONTENT & BRAND ENGINE

### Content Machine
| Type | Cadence | Workflow |
|------|---------|----------|
| Blog posts | 3x/week | TG-99 |
| City/service pages | On-demand | TG-103 |
| GBP posts | 2x/week | TG-46 |
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
**~81 workflows** (down from 114) — 68 existing rebuilt + 13 new
Every single one has a data source, a purpose, and a revenue impact.
