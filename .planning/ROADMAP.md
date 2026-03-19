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
- [ ] **Phase 12: Conversion Engine** — Instant lead response, follow-up sequences, speed-to-lead
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
- [ ] 11-01-PLAN.md — Fix TG-92 and TG-113 (stale Supabase key replacement + activation via n8n API)
- [ ] 11-02-PLAN.md — Audit all local workflow JSONs for leaked keys
- [ ] 11-03-PLAN.md — Create auto-posting workflow template and setup documentation
**Success Criteria**:
  1. Zero workflow errors in n8n execution log over 24 hours
  2. TG-92 and TG-113 successfully activated (stale key fixed)
  3. All local workflow JSONs use current Supabase secret key
  4. Upload-Post or LATE community node installed and configured
**Status**: In Progress (INFRA-01, INFRA-02 complete; 3 plans created for INFRA-03/04/05)

### Phase 12: Conversion Engine
**Goal**: Every quote form submission gets instant multi-channel response (SMS + Telegram + email), followed by a 5-touch follow-up sequence with dynamic social proof — nobody falls through the cracks.
**Depends on**: Phase 11 (infrastructure workflows active)
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04, CONV-05, CONV-06, CONV-07
**Success Criteria**:
  1. Quote form submit → SMS arrives on customer phone within 5 seconds
  2. Quote form submit → Telegram message appears on Vance's phone instantly
  3. Lead not contacted in 2h → escalating Telegram warnings
  4. 5-touch follow-up fires automatically over 14 days with latest Google review
  5. Lead scoring ranks leads by engagement signals in Supabase

### Phase 13: Delivery Excellence
**Goal**: Every Jobber email event triggers appropriate automation — pre-job reminders, on-my-way SMS, post-job quality checks — making every customer feel like they have a personal lawn care concierge.
**Depends on**: Phase 12 (conversion pipeline flowing data)
**Requirements**: DELV-01, DELV-02, DELV-03, DELV-04, DELV-05
**Success Criteria**:
  1. TG-05 correctly parses job_created, job_scheduled, job_completed, quote_sent, invoice_sent emails
  2. Customer receives SMS day before their scheduled service
  3. Customer receives "how does it look?" SMS after job completion
  4. Negative reply triggers URGENT Telegram alert + auto-apology SMS

### Phase 14: Review Generation Machine
**Goal**: Automated post-job review request pipeline that generates 5+ Google reviews per week, with AI-drafted responses and social proof amplification.
**Depends on**: Phase 13 (job completion triggers)
**Requirements**: REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, REVW-07
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
**Success Criteria**:
  1. TG-99 publishing 3 blog posts per week (Mon/Wed/Fri)
  2. New pages instantly submitted to IndexNow
  3. Rank drops > 3 positions trigger Telegram alert
  4. Stale posts (> 90 days) auto-detected and queued for refresh

### Phase 17: Social Media Machine
**Goal**: Auto-posting to 5+ social platforms daily with AI-generated content following a weekly pillar calendar.
**Depends on**: Phase 11 (auto-posting infrastructure)
**Requirements**: SOCL-01 through SOCL-06
**Success Criteria**:
  1. Posts auto-publish to Instagram, TikTok, YouTube, LinkedIn, Pinterest daily
  2. Weekly content batch of 7 posts generated by AI
  3. 5-star reviews auto-converted to social posts
  4. Engagement metrics tracked in Supabase

### Phase 18: GBP Domination
**Goal**: Google Business Profile fully automated with 3x/week posts, quarterly FAQ rotation, and optimization scoring.
**Depends on**: Phase 14 (review system)
**Requirements**: GBP-01 through GBP-05
**Success Criteria**:
  1. GBP posts generated and queued 3x/week (Mon/Wed/Fri)
  2. Seasonal FAQs rotate quarterly with Telegram approval
  3. GBP optimization score tracked monthly

### Phase 19: Intelligence Command Center
**Goal**: Complete business visibility via Telegram — daily briefing, weekly report, real-time alerts for leads/reviews/competitors/system health.
**Depends on**: All previous phases (aggregates data from all systems)
**Requirements**: INTL-01 through INTL-06
**Success Criteria**:
  1. Daily 7 AM Telegram briefing with leads, weather, reviews, SEO, system health
  2. Weekly Sunday report with full business metrics rollup
  3. New lead alerts appear on Telegram within 5 seconds
  4. Negative review alerts trigger immediately with CRITICAL severity

### Phase 20: Community & Field Marketing
**Goal**: Neighbor marketing automation and field marketing crew coordination.
**Depends on**: Phase 13 (job completion triggers)
**Requirements**: COMM-01 through COMM-03
**Success Criteria**:
  1. Job completion triggers outreach to same-zip leads
  2. Crew receives field marketing reminders via Telegram
  3. Yard sign placement/collection tracked in Supabase

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. Foundation & Infrastructure | M4 | 2/5 | In Progress | - |
| 12. Conversion Engine | M4 | 0/? | Not Started | - |
| 13. Delivery Excellence | M4 | 0/? | Not Started | - |
| 14. Review Generation | M4 | 0/? | Not Started | - |
| 15. Retention & LTV | M4 | 0/? | Not Started | - |
| 16. Content & SEO | M4 | 0/? | Not Started | - |
| 17. Social Media | M4 | 0/? | Not Started | - |
| 18. GBP Domination | M4 | 0/? | Not Started | - |
| 19. Intelligence Center | M4 | 0/? | Not Started | - |
| 20. Community Marketing | M4 | 0/? | Not Started | - |
