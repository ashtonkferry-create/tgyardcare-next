# TotalGuard — Roadmap

## Milestones

- [x] **M2: Automation Gap Closer** - Phases 0-4.1 (complete)
- [x] **M3: Billionaire Brand Transformation** - Phases 5-10 (complete)
- [ ] **M4: TG-OS Business Automation** - Phases 11-20

---

<details>
<summary>M2: Automation Gap Closer (Phases 0-4) — COMPLETE</summary>
34 plans completed. 88 n8n workflows, CRM unification, SEO monitoring, intelligence layer.
</details>

<details>
<summary>M3: Billionaire Brand Transformation (Phases 5-10) — COMPLETE</summary>
36 plans completed. Premium design, conversion features, customer portal, referral engine, 96 city-service pages.
</details>

---

## M4: TG-OS Business Automation

**Goal**: Build an autonomous business operating system that acquires customers, converts leads, delivers excellence, retains accounts, generates referrals, amplifies brand across all channels, and reports everything via Telegram — turning TotalGuard into a fully automated, GOD TIER company.

**Starting Position**: 105 n8n workflows exist but only 6 infrastructure workflows are active. Website is complete (M3). All automation is paused for clean rebuild. TG-OS design doc approved.

**Success Criteria**:
- ~85 purposeful workflows active (rebuilt from clean slate)
- Instant lead response (< 5 seconds SMS + Telegram alert)
- Review generation machine producing 5+ Google reviews per week
- Auto-posting to 5+ social platforms daily
- GBP posts 3x/week with seasonal FAQ rotation
- Daily Telegram briefing + weekly report + real-time alerts
- Weather-triggered marketing campaigns active
- All customer lifecycle automated (lead → customer → retention → referral)

**Phase Numbering:** Continues from M3 (11+)

- [x] **Phase 11: Foundation & Infrastructure** — Clean n8n instance, fix remaining issues, auto-posting setup
- [x] **Phase 12: Conversion Engine** — Instant lead response, follow-up sequences, speed-to-lead
- [ ] **Phase 13: Delivery Excellence** — Jobber email parsing, pre/post-job automation, quality loops
- [ ] **Phase 14: Review Generation Machine** — Post-job review requests, AI responses, social proof pipeline
- [ ] **Phase 15: Retention & Lifetime Value** — Referrals, annual plans, cross-sell, win-back, seasonal, weather
- [ ] **Phase 16: Content & SEO Engine** — Blog publisher, city pages, rank tracking, content refresh
- [ ] **Phase 17: Social Media Machine** — Multi-platform auto-posting, content engine, captions
- [ ] **Phase 18: GBP Domination** — Automated posting, FAQ rotation, optimization scoring
- [ ] **Phase 19: Intelligence Command Center** — Daily/weekly Telegram reports, alerts, competitor monitoring
- [ ] **Phase 20: Community & Field Marketing** — Neighbor marketing, yard signs, crew reminders

## Phase Details

### Phase 11: Foundation & Infrastructure
**Goal**: Clean n8n instance with zero errors, infrastructure workflows running, remaining config issues fixed, auto-posting infrastructure ready.
**Depends on**: Nothing (first M4 phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Plans:** 3 plans
Plans:
- [x] 11-01-PLAN.md — Fix TG-92 and TG-113 (dependency chain fix + activation)
- [x] 11-02-PLAN.md — Audit all local workflow JSONs for leaked keys (PASS — all clean)
- [x] 11-03-PLAN.md — Create auto-posting workflow template and setup documentation
**Success Criteria**:
  1. Zero workflow errors in n8n execution log over 24 hours ✓
  2. TG-92 and TG-113 successfully activated ✓
  3. All local workflow JSONs use placeholder keys ✓
  4. Auto-posting template ready (pending Vance account setup) ✓
**Status**: Complete (2026-03-19)

### Phase 12: Conversion Engine
**Goal**: Every quote form submission gets instant multi-channel response (SMS + Telegram + email), followed by a 5-touch follow-up sequence with dynamic social proof — nobody falls through the cracks.
**Depends on**: Phase 11 (infrastructure workflows active)
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04, CONV-05, CONV-06, CONV-07
**Plans:** 4 plans
Plans:
- [x] 12-01-PLAN.md — TG-01 enhanced with instant SMS + Telegram + email (CONV-01/02/03)
- [x] 12-02-PLAN.md — TG-126 speed-to-lead timer deployed (CONV-04)
- [x] 12-03-PLAN.md — TG-09 rebuilt with 5-touch sequence + dynamic reviews (CONV-05/06)
- [x] 12-04-PLAN.md — TG-07 rebuilt with 3-dimension scoring + hot lead alerts (CONV-07)
**Status**: Complete (2026-03-19)

### Phase 13: Delivery Excellence
**Goal**: Every Jobber email event triggers appropriate automation — pre-job reminders, on-my-way SMS, post-job quality checks — making every customer feel like they have a personal lawn care concierge.
**Depends on**: Phase 12 (conversion pipeline flowing data)
**Requirements**: DELV-01, DELV-02, DELV-03, DELV-04, DELV-05
**Plans:** 3 plans
Plans:
- [ ] 13-01-PLAN.md — Enhance TG-05 parser with richer extraction + downstream routing (DELV-01)
- [ ] 13-02-PLAN.md — TG-127 pre-job + TG-128 post-job quality check workflows (DELV-02/03/04)
- [ ] 13-03-PLAN.md — Reactivate TG-88 on-my-way SMS with fixed credentials (DELV-05)
**Success Criteria**:
  1. TG-05 correctly parses job_created, job_scheduled, job_completed, quote_sent, invoice_sent emails
  2. Customer receives SMS day before their scheduled service
  3. Customer receives "how does it look?" SMS after job completion
  4. Negative reply triggers URGENT Telegram alert + auto-apology SMS

### Phase 14: Review Generation Machine
**Goal**: Automated post-job review request pipeline that generates 5+ Google reviews per week, with AI-drafted responses and social proof amplification.
**Depends on**: Phase 13 (job completion triggers)
**Requirements**: REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, REVW-07
**Plans:** 2 plans
Plans:
- [ ] 14-01-PLAN.md — TG-129 review request SMS (24h) + TG-130 follow-up email (72h)
- [ ] 14-02-PLAN.md — TG-131 Google review poller + TG-132 AI response drafter with Telegram approval
**Success Criteria**:
  1. Review request SMS sent 24h after every job completion
  2. Follow-up email sent if no review after 72h
  3. New Google reviews synced to Supabase within 24h
  4. AI response drafts appear in Telegram for approval
  5. 5-star reviews auto-queued as social media posts

### Phase 15: Retention & Lifetime Value
**Goal**: Every customer lifecycle stage is automated — referrals, annual plans, cross-sell, seasonal nurture, weather campaigns, win-back, newsletter — maximizing lifetime value.
**Depends on**: Phase 14 (review system feeds referral triggers)
**Requirements**: RETN-01 through RETN-09
**Plans:** 4 plans
Plans:
- [ ] 15-01-PLAN.md — TG-22 review-to-referral + TG-34 referral program (RETN-01/02)
- [ ] 15-02-PLAN.md — TG-14/15/16 seasonal campaigns + TG-32 seasonal router (RETN-03/04)
- [ ] 15-03-PLAN.md — TG-56 weather campaigns + TG-63 win-back engine (RETN-05/06/07)
- [ ] 15-04-PLAN.md — TG-81 monthly newsletter + TG-10 cross-sell (RETN-08/09)
**Success Criteria**:
  1. 5-star reviewers receive referral SMS within 1h
  2. Seasonal campaigns auto-launch (spring March, fall Sept, snow Nov)
  3. Weather events trigger appropriate email campaigns within 2h
  4. Dormant 90+ day customers receive win-back sequence
  5. Monthly newsletter sends to all active customers

### Phase 16: Content & SEO Engine
**Goal**: SEO automation producing 3 blog posts/week, monitoring rankings, refreshing stale content, and auto-linking new content to service/city pages.
**Depends on**: Phase 11 (infrastructure)
**Requirements**: SEO-01 through SEO-08
**Plans:** 3 plans
Plans:
- [ ] 16-01-PLAN.md — Content production pipeline: TG-99 blog publisher + TG-103 city content + TG-47 IndexNow + internal linking (SEO-01/02/03/08)
- [ ] 16-02-PLAN.md — Rank monitoring pipeline: TG-96 GSC sync + TG-45 rank tracker + TG-97 drop detector with Telegram alerts (SEO-04/05/06)
- [ ] 16-03-PLAN.md — Content refresh: TG-50 stale post detection + AI refresh + IndexNow re-submission (SEO-07)
**Success Criteria**:
  1. TG-99 publishing 3 blog posts per week (Mon/Wed/Fri)
  2. New pages instantly submitted to IndexNow
  3. Rank drops > 3 positions trigger Telegram alert
  4. Stale posts (> 90 days) auto-detected and queued for refresh

### Phase 17: Social Media Machine
**Goal**: Auto-posting to 5+ social platforms daily with AI-generated content following a weekly pillar calendar.
**Depends on**: Phase 11 (auto-posting infrastructure)
**Requirements**: SOCL-01 through SOCL-06
**Plans:** 3 plans
Plans:
- [ ] 17-01-PLAN.md — Supabase schema + pillar calendar + TG-133 weekly content batch generator (SOCL-01/02)
- [ ] 17-02-PLAN.md — TG-134 review-to-social pipeline (SOCL-04)
- [ ] 17-03-PLAN.md — TG-135 daily publisher + TG-136 engagement tracker (SOCL-03/05/06)
**Success Criteria**:
  1. Posts auto-publish to Instagram, TikTok, YouTube, LinkedIn, Pinterest daily
  2. Weekly content batch of 7 posts generated by AI
  3. 5-star reviews auto-converted to social posts
  4. Engagement metrics tracked in Supabase

### Phase 18: GBP Domination
**Goal**: Google Business Profile fully automated with 3x/week posts, quarterly FAQ rotation, and optimization scoring. GBP API pending verification -- builds manual posting queue via Telegram approval, ready to auto-post when API arrives.
**Depends on**: Phase 14 (review system)
**Requirements**: GBP-01 through GBP-05
**Plans:** 2 plans
Plans:
- [ ] 18-01-PLAN.md — TG-133 GBP post generator (AI + Telegram approval) + TG-134 publisher (manual/API dual-mode)
- [ ] 18-02-PLAN.md — TG-135 quarterly FAQ rotation + TG-136 monthly GBP optimization score
**Success Criteria**:
  1. GBP posts generated and queued 3x/week (Mon/Wed/Fri)
  2. Seasonal FAQs rotate quarterly with Telegram approval
  3. GBP optimization score tracked monthly

### Phase 19: Intelligence Command Center
**Goal**: Complete business visibility via Telegram — daily briefing, weekly report, real-time alerts for leads/reviews/competitors/system health.
**Depends on**: All previous phases (aggregates data from all systems, degrades gracefully)
**Requirements**: INTL-01 through INTL-06
**Plans:** 3 plans
Plans:
- [ ] 19-01-PLAN.md — TG-137 daily 7 AM briefing + TG-138 Sunday weekly business report
- [ ] 19-02-PLAN.md — TG-139 real-time lead alert + TG-140 review alert + TG-141 system health monitor
- [ ] 19-03-PLAN.md — TG-142 weekly competitor monitoring via Google Places API
**Success Criteria**:
  1. Daily 7 AM Telegram briefing with leads, weather, reviews, SEO, system health
  2. Weekly Sunday report with full business metrics rollup
  3. New lead alerts appear on Telegram within 5 seconds
  4. Negative review alerts trigger immediately with CRITICAL severity

### Phase 20: Community & Field Marketing
**Goal**: Neighbor marketing automation and field marketing crew coordination.
**Depends on**: Phase 13 (job completion triggers)
**Requirements**: COMM-01 through COMM-03
**Plans:** 1 plan
Plans:
- [ ] 20-01-PLAN.md — TG-143 neighbor outreach SMS (same-zip leads) + TG-144 crew field marketing reminders + yard sign tracking
**Success Criteria**:
  1. Job completion triggers outreach to same-zip leads
  2. Crew receives field marketing reminders via Telegram
  3. Yard sign placement/collection tracked in Supabase

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. Foundation & Infrastructure | M4 | 5/5 | Complete | 2026-03-19 |
| 12. Conversion Engine | M4 | 7/7 | Complete | 2026-03-19 |
| 13. Delivery Excellence | M4 | 0/3 | In Progress | - |
| 14. Review Generation | M4 | 0/2 | Not Started | - |
| 15. Retention & LTV | M4 | 0/4 | Not Started | - |
| 16. Content & SEO | M4 | 0/3 | Not Started | - |
| 17. Social Media | M4 | 0/3 | Not Started | - |
| 18. GBP Domination | M4 | 0/2 | Not Started | - |
| 19. Intelligence Center | M4 | 0/3 | Not Started | - |
| 20. Community Marketing | M4 | 0/1 | Not Started | - |
