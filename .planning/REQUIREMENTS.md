# Requirements: TotalGuard M4 — TG-OS Business Automation

**Defined:** 2026-03-19
**Core Value:** Build an autonomous business nervous system that acquires customers, converts leads, delivers excellence, retains accounts, generates referrals, amplifies brand, and reports everything via Telegram — while the owner sleeps.

## v1 Requirements

### n8n Foundation & Cleanup (INFRA)

- [x] **INFRA-01**: All duplicate workflows deleted, all broken workflows deactivated (clean slate)
- [x] **INFRA-02**: Layer 1 infrastructure workflows active: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95
- [x] **INFRA-03**: TG-92 and TG-113 fixed (dependency chain resolved + activated)
- [x] **INFRA-04**: All workflow JSON files audited clean (zero real keys)
- [x] **INFRA-05**: Auto-posting infrastructure set up (template + setup guide created)

### Conversion Engine (CONV)

- [ ] **CONV-01**: Quote form submission triggers instant SMS to customer within 5 seconds
- [ ] **CONV-02**: Quote form submission triggers instant Telegram alert to Vance with one-tap call
- [ ] **CONV-03**: Branded email confirmation sent to customer immediately after quote submission
- [ ] **CONV-04**: Speed-to-lead timer: Telegram warning if lead not contacted within 2 hours
- [ ] **CONV-05**: 5-touch follow-up sequence across SMS + email over 14 days
- [ ] **CONV-06**: Every follow-up includes dynamic latest 5-star Google review
- [ ] **CONV-07**: Lead scoring based on engagement signals

### Delivery Excellence (DELV)

- [ ] **DELV-01**: TG-05 enhanced to parse ALL Jobber email types
- [ ] **DELV-02**: Pre-job SMS notification day before scheduled service
- [ ] **DELV-03**: Job complete notification SMS with quality check prompt
- [ ] **DELV-04**: Quality feedback loop (positive → review, negative → alert + apology)
- [ ] **DELV-05**: On-my-way SMS (TG-88) reactivated

### Review Generation (REVW)

- [ ] **REVW-01**: Post-job review request SMS 24h after completion with direct Google link
- [ ] **REVW-02**: Follow-up email if no review in 72h
- [ ] **REVW-03**: 5-star → auto-thank SMS + referral ask
- [ ] **REVW-04**: 1-3 star → URGENT Telegram alert + auto-apology
- [ ] **REVW-05**: Google reviews synced to Supabase (TG-19)
- [ ] **REVW-06**: AI review responses → Telegram for approval (TG-20)
- [ ] **REVW-07**: 5-star reviews → social media post queue (TG-38)

### Retention & Lifetime Value (RETN)

- [ ] **RETN-01**: Referral program SMS after 5-star reviews
- [ ] **RETN-02**: Referral tracking with booking notification
- [ ] **RETN-03**: Annual plan enrollment pitch after 2nd service
- [ ] **RETN-04**: Annual plan renewal reminder 30 days before expiry
- [ ] **RETN-05**: Cross-sell automation (mow-only → fertilizer, spring → aeration)
- [ ] **RETN-06**: Win-back campaign for 90+ day dormant customers
- [ ] **RETN-07**: Seasonal nurture campaigns auto-launch
- [ ] **RETN-08**: Weather-triggered campaigns (storm, freeze, drought)
- [ ] **RETN-09**: Monthly newsletter to active customers

### Content & SEO Automation (SEO)

- [ ] **SEO-01**: Blog auto-publisher (TG-99) publishing 3x/week
- [ ] **SEO-02**: City content generator (TG-103) for new pages
- [ ] **SEO-03**: IndexNow submitter (TG-47) on every new page
- [ ] **SEO-04**: GSC daily sync (TG-96) tracking performance
- [ ] **SEO-05**: Keyword rank tracker (TG-45) monitoring targets
- [ ] **SEO-06**: Rank drop detector (TG-97) alerting on Telegram
- [ ] **SEO-07**: Content refresher (TG-50) updating stale posts
- [ ] **SEO-08**: Internal linking automation for new posts

### Social Media Automation (SOCL)

- [ ] **SOCL-01**: Auto-posting to 5+ platforms via aggregator
- [ ] **SOCL-02**: Weekly AI content batch generation
- [ ] **SOCL-03**: Daily scheduled auto-publish from queue
- [ ] **SOCL-04**: Review-to-social pipeline
- [ ] **SOCL-05**: Social engagement metrics tracked
- [ ] **SOCL-06**: AI caption generator

### GBP Automation (GBP)

- [ ] **GBP-01**: GBP posts generated 3x/week
- [ ] **GBP-02**: Posts queued in Supabase (manual until API approved)
- [ ] **GBP-03**: Seasonal FAQ rotation quarterly
- [ ] **GBP-04**: GBP optimization scorer
- [ ] **GBP-05**: Monthly photo upload reminder

### Intelligence & Command Center (INTL)

- [ ] **INTL-01**: Daily 7 AM briefing on Telegram
- [ ] **INTL-02**: Weekly Sunday 8 PM report on Telegram
- [ ] **INTL-03**: Real-time alerts (new lead, review, negative review)
- [ ] **INTL-04**: Speed-to-lead warning alert
- [ ] **INTL-05**: Competitor monitoring
- [ ] **INTL-06**: System health monitoring

### Community & Field Marketing (COMM)

- [ ] **COMM-01**: Neighbor marketing post-job outreach
- [ ] **COMM-02**: Field marketing crew reminders
- [ ] **COMM-03**: Yard sign tracking

## v2 Requirements (Deferred)

- **SCALE-01**: Multi-location workflow templates
- **ADS-01**: Google LSA lead integration
- **ADS-02**: Weather-triggered ad budget automation
- **VAPI-01**: AI phone agent when call volume exceeds capacity

## Out of Scope

| Feature | Reason |
|---------|--------|
| Jobber API integration | No API plan — email parsing only |
| Stripe payment automation | Uses Jobber Payments |
| AI phone agent (Vapi) | Organic human calls preferred |
| Facebook auto-posting | Facebook page currently hacked |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 11 | Complete |
| INFRA-02 | Phase 11 | Complete |
| INFRA-03 to INFRA-05 | Phase 11 | Complete |
| CONV-01 to CONV-07 | Phase 12 | Pending |
| DELV-01 to DELV-05 | Phase 13 | Pending |
| REVW-01 to REVW-07 | Phase 14 | Pending |
| RETN-01 to RETN-09 | Phase 15 | Pending |
| SEO-01 to SEO-08 | Phase 16 | Pending |
| SOCL-01 to SOCL-06 | Phase 17 | Pending |
| GBP-01 to GBP-05 | Phase 18 | Pending |
| INTL-01 to INTL-06 | Phase 19 | Pending |
| COMM-01 to COMM-03 | Phase 20 | Pending |

**Coverage:**
- v1 requirements: 62 total
- Mapped to phases: 62
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-19*
