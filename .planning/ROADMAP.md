# Roadmap: TotalGuard Yard Care

**Created:** 2026-02-02
**Phases:** 5
**Core Value:** Automate the lead-to-customer pipeline

## Phase Overview

| # | Phase | Goal | Status |
|---|-------|------|--------|
| 1 | GitHub + Lovable Setup | Connect code repository to Lovable | ✓ Complete |
| 2 | Supabase Backend | Database and auth foundation | ✓ Complete |
| 3 | Lead Notifications | Instant alerts when leads come in | ○ Pending |
| 4 | Jobber Integration | Sync leads to CRM and automate reviews | ○ Pending |
| 5 | Admin Dashboard | Manage leads and content | ✓ Complete |

---

## Phase 1: GitHub + Lovable Setup ✓

**Status:** Complete
**Goal:** Connect Lovable project to GitHub for version control

**Requirements:**
- [x] SETUP-01: GitHub repository created
- [x] SETUP-02: Lovable connected to GitHub

Plans:
- [x] 01-01-PLAN.md - Connect Lovable to GitHub and verify two-way sync

**Outcome:**
- GitHub repo: TotalGuardYardCare/tgyardcarecom
- Two-way sync working

---

## Phase 2: Supabase Backend ✓

**Status:** Complete (pre-existing)
**Goal:** Set up database to store form submissions and enable auth

**Requirements:**
- [x] SETUP-03: Supabase project created
- [x] DB-01: Contact form submissions stored
- [x] DB-02: Admin authentication
- [ ] ANLYT-01: Traffic tracking (skipped)
- [ ] ANLYT-02: Form submission events (skipped)

Plans:
- [x] 02-01-PLAN.md — Supabase project setup (pre-existing)
- [x] 02-02-PLAN.md — Contact form integration (pre-existing)
- [x] 02-03-PLAN.md — Admin authentication (pre-existing)
- [x] 02-04-PLAN.md — Google Analytics (skipped)

**Outcome:**
- Supabase: mxhalirruvyxdkppjsqf.supabase.co
- 16 database tables including contact_submissions
- Admin login with role-based access
- GA4 analytics skipped for now

---

## Phase 3: Lead Notifications

**Status:** Pending
**Goal:** Get notified instantly when someone submits contact form

**Requirements:**
- [ ] SETUP-04: n8n instance set up
- [ ] AUTO-01: Lead notification to owner
- [ ] AUTO-02: Thank-you email to customer

**Success Criteria:**
1. n8n workflow triggers on new Supabase row
2. Owner receives SMS/email within 60 seconds
3. Customer receives thank-you email immediately

**Depends On:** Phase 2 ✓

---

## Phase 4: Jobber Integration

**Status:** Pending
**Goal:** Auto-create leads in Jobber and request reviews after jobs

**Requirements:**
- [ ] AUTO-03: Lead synced to Jobber
- [ ] AUTO-04: Review request after job complete

**Success Criteria:**
1. New lead in Supabase creates customer/lead in Jobber
2. Job completion in Jobber triggers review request
3. No manual data entry required

**Depends On:** Phase 3

---

## Phase 5: Admin Dashboard ✓

**Status:** Complete (pre-existing)
**Goal:** Simple dashboard to view leads and manage content

**Requirements:**
- [x] DB-03: Website content table
- [x] ADMIN-01: Admin login
- [x] ADMIN-02: View submissions
- [x] ADMIN-03: Edit content
- [ ] ANLYT-03: Conversion funnel visible

**Outcome:**
- Admin dashboard at /admin with role-based access
- Leads panel with search, filter, CSV export
- Content management for SEO, blog, gallery, seasons, promos
- Performance audits and tools

---

## Milestone Completion Criteria

All phases complete when:
- [x] Website code syncs to GitHub
- [x] Contact forms save to Supabase
- [ ] Owner notified within 60 seconds of new lead
- [ ] Leads auto-create in Jobber
- [ ] Reviews requested after job completion
- [x] Admin dashboard functional

---
*Roadmap created: 2026-02-02*
*Phase 1 complete: 2026-02-02*
*Phase 2 verified complete: 2026-02-03*
*Phase 5 verified complete: 2026-02-03*
