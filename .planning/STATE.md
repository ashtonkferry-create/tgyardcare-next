# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Build an autonomous business nervous system — acquires customers, converts leads, delivers excellence, retains accounts, amplifies brand, reports via Telegram.
**Current focus:** M4 TG-OS Business Automation — Phase 17 In Progress (Social Media Machine)

## Current Position

Phase: 17 of 20 (Social Media Machine)
Plan: 3 of 3 in Phase 17 -- PHASE COMPLETE
Status: Phase 17 complete
Last activity: 2026-03-19 — Completed 17-03-PLAN.md (daily publisher + engagement tracker)

Progress M4: [████████████████████████░░░░░░░░] 31/62 requirements (Phase 17 COMPLETE)
Progress M3: [████████████████████████████████] 36/36 plans (COMPLETE)
Progress M2: [█████████████████████████████████] 34/34 plans (COMPLETE)

## Performance Metrics

**Velocity:**
- Total plans completed: 86 (M2: 34 + M3: 36 + M4: 16)
- M4 Phase 11: 5 requirements complete (INFRA-01, INFRA-02, 11-02 key audit, 11-03 auto-posting, 11-01 TG-92/TG-113 activation)
- M4 Phase 12: 4 plans complete (12-01 instant response, 12-02 speed-to-lead, 12-03 follow-up sequence, 12-04 lead scoring) -- PHASE COMPLETE
- M4 Phase 14: 2 plans complete (14-01 review request, 14-02 review monitoring + response pipeline)
- M4 Phase 15: 4 plans complete (15-01 referral, 15-02 loyalty, 15-03 winback, 15-04 newsletter + cross-sell) -- PHASE COMPLETE
- M4 Phase 16: 3 plans complete (16-01 content generation, 16-02 rank monitoring, 16-03 content refresh) -- PHASE COMPLETE
- M4 Phase 17: 3 plans complete (17-01 content batch generator, 17-02 review-to-social pipeline, 17-03 daily publisher + engagement tracker) -- PHASE COMPLETE

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
- [M4 Phase 12]: TG-126 speed-to-lead timer deployed (n8n ID: jfz05ofLDaMdKbBV), 6 nodes, active
- [M4 Phase 12]: TG-126 uses real Telegram credential V404qLIDXjmyzNeS (not placeholder)
- [M4 Phase 12]: lead_alerts table needs manual creation in Supabase for dedup (workflow degrades gracefully without it)
- [M4 Phase 12]: 12 workflows now active: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07
- [M4 Phase 12]: TG-07 rebuilt with 3-dimension scoring (static 50pt + engagement 30pt + recency 20pt)
- [M4 Phase 12]: TG-07 writes scores directly to leads table (lead_score, lead_tier) — no longer uses lead_scores table
- [M4 Phase 12]: TG-07 newly-hot detection prevents repeat Telegram alerts for already-hot leads
- [M4 Phase 12]: TG-07 deployed (n8n ID: rCRdV1aDoIlEpHiH), daily 7am CT
- [M4 Phase 12]: TG-09 rebuilt as 5-touch follow-up (Day 1/5 SMS, Day 3/7/14 email) with dynamic Google reviews
- [M4 Phase 12]: TG-09 uses flat JSON data flow — SMS/email payloads at root level for TG-94/TG-95 compatibility
- [M4 Phase 12]: TG-09 stage tracking via leads.follow_up_stage integer (0-5), not sequence_enrollments table
- [M4 Phase 13]: TG-05 enhanced with scheduled_date/time/crew_name extraction, job_created event type, 8 Switch outputs
- [M4 Phase 13]: TG-05 Switch output indices shifted — job_created at index 1, all others +1
- [M4 Phase 13]: TG-127 pre-job notification deployed (n8n ID: SsYWWFSHSOfnv7ex), sends 4PM day-before SMS
- [M4 Phase 13]: TG-128 post-job quality check deployed (n8n ID: GZ7ZxOanSNceWeVV), 14-node dual-trigger with sentiment analysis
- [M4 Phase 13]: TG-05 wired to real TG-127/TG-128 IDs, full pipeline active
- [M4 Phase 13]: TG-128 webhook URL: https://tgyardcare.app.n8n.cloud/webhook/tg128-quality-reply
- [M4 Phase 13]: 15 workflows now active (added TG-127, TG-128)
- [M4 Phase 13]: n8n API PUT returns 400 "Could not find property option" — deploy via UI import only
- [M4 Phase 12]: TG-09 deployed and active (n8n ID: ZjG32DE8KI9SHyxo), daily 10am CT
- [M4 Phase 12]: follow_up_stage column needs manual addition to leads table (workflow degrades gracefully without it)
- [M4 Phase 14]: TG-129 deployed (n8n ID: F8lA6eWLeHANSsuI), daily 10 AM CT, 7 nodes, review request SMS
- [M4 Phase 14]: TG-130 deployed (n8n ID: oSCqlDyHoKpC6aFy), daily 2 PM CT, 6 nodes, follow-up email
- [M4 Phase 14]: TG-95 reactivated — was inactive, blocking TG-130 sub-workflow dependency
- [M4 Phase 14]: review_requests table needs manual creation in Supabase (see 14-01-SUMMARY.md for SQL)
- [M4 Phase 14]: 17 workflows now active (added TG-129, TG-130, reactivated TG-95)
- [M4 Phase 14]: TG-131 Google Review Poller deployed (n8n ID: iU1iQCwa6QivxXgw), polls every 6h, needs manual activation
- [M4 Phase 14]: TG-132 Review Response Drafter deployed (n8n ID: byGsDMUSiClnuH1G), template-based responses (no AI API cost)
- [M4 Phase 14]: Template-based drafts instead of Claude Haiku — 9 templates across 4 rating tiers with service keyword detection
- [M4 Phase 14]: Google Places API (New) used — no GBP verification required, returns 5 most recent reviews
- [M4 Phase 14]: Hash-based review dedup (gr_ + hash of author+publishTime)
- [M4 Phase 14]: 18 workflows active (TG-132 added; TG-131 pending manual activation)
- [M4 Phase 15]: TG-22 rebuilt — 10 nodes, polls google_reviews every 30 min for 5-star reviews, sends referral SMS via TG-94
- [M4 Phase 15]: TG-34 rebuilt — 12 nodes, webhook POST at /tg34-referral-log, logs to referrals table, thanks referrer via SMS
- [M4 Phase 15]: Name-based lead lookup for phone numbers (Google reviews don't include phone)
- [M4 Phase 15]: TG-22 deployed (n8n ID: YnLX05UbBgZI7YO6), active
- [M4 Phase 15]: TG-34 deployed (n8n ID: Gu61j7HgsWFyMsEU), webhook URL: https://tgyardcare.app.n8n.cloud/webhook/tg34-referral-log
- [M4 Phase 15]: 20 workflows now active (added TG-22, TG-34)
- [M4 Phase 15]: TG-56 weather campaign rebuilt — 10 nodes, every 2h OpenWeatherMap check, 4 weather types, 48h dedup
- [M4 Phase 15]: TG-56 deployed (n8n ID: ghoTVdCTc6zwq6UQ), active
- [M4 Phase 15]: TG-63 win-back engine rebuilt — 10 nodes, weekly Monday, dual SMS+email, 10% discount, 30-day dedup
- [M4 Phase 15]: TG-63 deployed (n8n ID: dvjImP2y2xvIsvXp), active
- [M4 Phase 15]: 22 workflows now active (added TG-56, TG-63)

- [M4 Phase 15]: TG-32 seasonal router deployed (n8n ID: 2kXMNdKdLW9l0m40), 1st of month 9am CT, routes March/Sept/Nov
- [M4 Phase 15]: TG-14 spring deployed (nAYg8H9q6kqhtGbT), TG-15 fall (RRym6KRyPue6GABC), TG-16 snow (EUZtUKUAHDMUfgmi)
- [M4 Phase 15]: Seasonal campaigns use FSRv5y8YzMjpyBtc (canonical TG-95), n8n POST /activate works
- [M4 Phase 15]: TG-81 monthly newsletter rebuilt — 8 nodes, 15th of month, 12 seasonal tips, review spotlight
- [M4 Phase 15]: TG-81 deployed (n8n ID: dk884SJOQYXVUL7b), active
- [M4 Phase 15]: TG-10 cross-sell engine rebuilt — 7 nodes, bi-monthly, 11-service cross-sell map
- [M4 Phase 15]: TG-10 deployed (n8n ID: 5DYd0WpgnHJVLA21), active
- [M4 Phase 15]: Newsletter uses TG-95 per-recipient; recommend Brevo campaigns if customer count exceeds 100
- [M4 Phase 15]: n8n API PUT requires removing 'active' field from body (read-only field causes 400)
- [M4 Phase 15]: Two TG-95 copies exist — FSRv5y8YzMjpyBtc (canonical) and IUDLrQrAkcLFLsIC (old copy, also active)
- [M4 Phase 16]: TG-96 GSC daily sync deployed (n8n ID: Vt8uzm8RGy3QXv3B), 6am UTC, needs Google credential setup
- [M4 Phase 16]: TG-45 keyword rank tracker deployed (n8n ID: niQsYkoGk7EZvAqo), 8am UTC, 177 keywords across 12 cities
- [M4 Phase 16]: TG-97 rank drop detector deployed (n8n ID: NPxVFCf05a15PjBH), 10am UTC, Telegram alerts on drops > 3 positions
- [M4 Phase 16]: 30 workflows now active (added TG-96, TG-45, TG-97)
- [M4 Phase 16]: TG-96 uses n8n Google Service Account credential reference (GOOGLE_CREDENTIAL_ID placeholder)
- [M4 Phase 16]: TG-97 detects disappeared keywords + CTR anomalies in addition to rank drops
- [M4 Phase 16]: TG-99 rebuilt with internal linking (service + city page URLs in Claude prompt), Telegram replaces SMS
- [M4 Phase 16]: TG-103 rebuilt with internal linking (service pages + recent blog posts), removed stale TG-104 ref
- [M4 Phase 16]: TG-47 rebuilt with error handling (Check IndexNow Result node), enhanced logging
- [M4 Phase 16]: TG-99 deployed (ANcn1PWAky4GoCbb), TG-103 (igtaJUnj9xDXcV2B), TG-47 (rshVSBVpDprurfIa) — all active
- [M4 Phase 16]: TG-99/TG-103 call TG-47 as sub-workflow for IndexNow (DRY pattern)
- [M4 Phase 16]: n8n API PUT rejects read-only 'tags' field — strip before deployment
- [M4 Phase 16]: 33 workflows now active (added TG-99, TG-103, TG-47)
- [M4 Phase 16]: TG-50 content refresher deployed (n8n ID: UXfMkQzkfVcpwhNm), Saturday 9am CT, max 3 posts/run
- [M4 Phase 16]: TG-50 uses dual fetch: rank-prioritized RPC with age-based fallback (90-day threshold)
- [M4 Phase 16]: TG-50 direct HTTP to IndexNow (not sub-workflow), structured Claude prompt format
- [M4 Phase 16]: 34 workflows now active (added TG-50) — Phase 16 COMPLETE, all 8 SEO requirements covered
- [M4 Phase 17]: TG-133 Weekly Content Batch deployed (n8n ID: 412qRf23ZeC9HxTC), Monday 6am CT, 8 nodes, active
- [M4 Phase 17]: TG-133 generates 7 pillar-based posts via Claude Haiku 4.5, stores in social_posts table
- [M4 Phase 17]: Platforms: Instagram + Google Business Profile only (no Facebook, no TikTok)
- [M4 Phase 17]: social_posts table needs manual creation in Supabase (SQL in SOCIAL-CONTENT-CALENDAR.md)
- [M4 Phase 17]: TG-134 review-to-social deployed (n8n ID: KQ8jyy2xFQ4ud6YH), daily 8am CT, 8 nodes
- [M4 Phase 17]: TG-134 converts 5-star reviews into branded social posts for Instagram/LinkedIn/Pinterest
- [M4 Phase 17]: social_posted flag on google_reviews for dedup, Wednesday 10am CT scheduled posting
- [M4 Phase 17]: 36 workflows now active (added TG-133, TG-134)

### Pending Todos

- Replace OWNER_TELEGRAM_CHAT_ID in TG-01 Build Telegram Alert node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-126 Send Telegram Warning node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-07 Send Hot Lead Telegram node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-14, TG-15, TG-16, TG-32 Telegram nodes with Vance's actual chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-132 Send Draft to Telegram node with Vance's actual Telegram chat ID
- Create lead_alerts table in Supabase SQL Editor (see 12-02-SUMMARY.md for SQL)
- Add follow_up_stage column to leads table: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_stage integer DEFAULT 0;`
- Add parsed_scheduled_date, parsed_scheduled_time, parsed_crew_name columns to jobber_email_events table
- Create review_requests table in Supabase SQL Editor (see 14-01-SUMMARY.md for SQL)
- Create google_reviews table in Supabase SQL Editor (see 14-02-SUMMARY.md for SQL)
- Activate TG-131 in n8n UI (schedule trigger can't be activated via API)
- Set GOOGLE_PLACES_API_KEY_PLACEHOLDER in TG-131 Fetch Place Details node
- Set SUPABASE_ANON_KEY_PLACEHOLDER in TG-131 dedup and save nodes (3 occurrences)
- Add referral_sms_sent column to google_reviews table: `ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS referral_sms_sent boolean DEFAULT false;`
- Create referrals table in Supabase SQL Editor (see 15-01-SUMMARY.md for SQL)
- Replace OWNER_TELEGRAM_CHAT_ID in TG-22 Telegram Notification node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-34 Telegram Alert node with Vance's actual Telegram chat ID
- Replace SUPABASE_ANON_KEY_PLACEHOLDER in TG-22 (3 occurrences) and TG-34 (3 occurrences) via n8n UI

- Replace OWNER_TELEGRAM_CHAT_ID in TG-56 Telegram Alert node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-63 Telegram Summary node with Vance's actual Telegram chat ID
- Ensure TG_OPENWEATHER_API_KEY n8n variable is set for TG-56 weather checks
- Create weather_campaigns table in Supabase (see 15-03-SUMMARY.md for SQL)
- Add winback_sent_at column to leads table: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS winback_sent_at timestamptz;`
- Replace OWNER_TELEGRAM_CHAT_ID in TG-81 Telegram Summary node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-10 Telegram Summary node with Vance's actual Telegram chat ID
- Set SUPABASE_ANON_KEY_PLACEHOLDER in TG-81 (Fetch 5-Star Review + Fetch Active Customers, 4 occurrences)
- Set SUPABASE_ANON_KEY_PLACEHOLDER in TG-10 (Fetch Customers, 2 occurrences)
- Create Google Service Account credential in n8n for GSC access (TG-96 needs it)
- Update GOOGLE_CREDENTIAL_ID in TG-96 with actual n8n credential ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-97 Send Telegram Alert node with Vance's actual Telegram chat ID
- Create gsc_pages, gsc_search_queries, seo_rankings, seo_weekly_reports tables in Supabase
- Replace OWNER_TELEGRAM_CHAT_ID in TG-99 Telegram Notification node with Vance's actual Telegram chat ID
- Set ANTHROPIC_API_KEY in n8n for TG-99 and TG-103 Claude content generation
- Set SUPABASE_SECRET_KEY in n8n for TG-99, TG-103, TG-47 Supabase API calls
- Create seo_target_cities table in Supabase for TG-103 city processing
- Replace OWNER_TELEGRAM_CHAT_ID in TG-50 Telegram Summary node with Vance's actual Telegram chat ID
- Set CLAUDE_API_KEY env variable in n8n for TG-50 AI refresh
- Add last_refreshed_at column to blog_posts table: `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS last_refreshed_at timestamptz;`
- (Optional) Create get_stale_posts_ranked RPC in Supabase for rank-prioritized refresh ordering
- Create social_posts table in Supabase SQL Editor (SQL in automation/SOCIAL-CONTENT-CALENDAR.md)
- Set ANTHROPIC_API_KEY in TG-133 Generate 7 Posts node x-api-key header
- Set TELEGRAM_BOT_TOKEN and OWNER_TELEGRAM_CHAT_ID env variables in n8n for TG-133 Telegram notification

### Blockers/Concerns

- Twilio A2P 10DLC campaign status unknown — ALL outbound SMS may be carrier-filtered
- Twilio inbound webhook points to demo.twilio.com — needs manual fix
- Quo missed call webhook not configured — needs manual setup
- Facebook page hacked — no FB workflows until resolved
- GBP API access pending verification — GBP posting manual until approved
- TG-94 has duplicate URL bug in Supabase HTTP requests — will fail on actual SMS consent/rate-limit checks

## Session Continuity

Last session: 2026-03-19
Stopped at: Completed 17-01-PLAN.md (weekly content batch generator) — deployed TG-133 to n8n
Resume file: None
Next: 17-03-PLAN.md (daily social publisher) or next Phase 17 plan
