# Roadmap: TotalGuard Yard Care

**Created:** 2026-02-02
**Phases:** 5
**Core Value:** Automate the lead-to-customer pipeline

## Phase Overview

| # | Phase | Goal | Requirements |
|---|-------|------|--------------|
| 1 | GitHub + Lovable Setup | Connect code repository to Lovable | SETUP-01, SETUP-02 |
| 2 | Supabase Backend | Database and auth foundation | SETUP-03, DB-01, DB-02, ANLYT-01, ANLYT-02 |
| 3 | Lead Notifications | Instant alerts when leads come in | SETUP-04, AUTO-01, AUTO-02 |
| 4 | Jobber Integration | Sync leads to CRM and automate reviews | AUTO-03, AUTO-04 |
| 5 | Admin Dashboard | Manage leads and content | DB-03, ADMIN-01, ADMIN-02, ADMIN-03, ANLYT-03 |

---

## Phase 1: GitHub + Lovable Setup

**Goal:** Connect Lovable project to GitHub for version control

**Requirements:**
- SETUP-01: GitHub repository created
- SETUP-02: Lovable connected to GitHub

**Plans:** 1 plan

Plans:
- [x] 01-01-PLAN.md - Connect Lovable to GitHub and verify two-way sync

**Success Criteria:**
1. GitHub repo exists at github.com/totalguardllc/tgyardcare
2. Lovable project syncs code to GitHub on save
3. Claude Code can clone and push to repository

**Depends On:** None

---

## Phase 2: Supabase Backend

**Goal:** Set up database to store form submissions and enable auth

**Requirements:**
- SETUP-03: Supabase project created
- DB-01: Contact form submissions stored
- DB-02: Admin authentication
- ANLYT-01: Traffic tracking
- ANLYT-02: Form submission events

**Success Criteria:**
1. Supabase project connected to Lovable site
2. Contact form saves to Supabase `leads` table
3. Admin can authenticate via Supabase Auth
4. Analytics tracking code installed

**Depends On:** Phase 1

---

## Phase 3: Lead Notifications

**Goal:** Get notified instantly when someone submits contact form

**Requirements:**
- SETUP-04: n8n instance set up
- AUTO-01: Lead notification to owner
- AUTO-02: Thank-you email to customer

**Success Criteria:**
1. n8n workflow triggers on new Supabase row
2. Owner receives SMS/email within 60 seconds
3. Customer receives thank-you email immediately

**Depends On:** Phase 2

---

## Phase 4: Jobber Integration

**Goal:** Auto-create leads in Jobber and request reviews after jobs

**Requirements:**
- AUTO-03: Lead synced to Jobber
- AUTO-04: Review request after job complete

**Success Criteria:**
1. New lead in Supabase creates customer/lead in Jobber
2. Job completion in Jobber triggers review request
3. No manual data entry required

**Depends On:** Phase 3

---

## Phase 5: Admin Dashboard

**Goal:** Simple dashboard to view leads and manage content

**Requirements:**
- DB-03: Website content table
- ADMIN-01: Admin login
- ADMIN-02: View submissions
- ADMIN-03: Edit content
- ANLYT-03: Conversion funnel visible

**Success Criteria:**
1. Admin can log in at /admin
2. Dashboard shows all contact form submissions
3. Admin can edit service descriptions without code
4. Basic analytics visible

**Depends On:** Phase 2

---

## Milestone Completion Criteria

All phases complete when:
- [ ] Website code syncs to GitHub
- [ ] Contact forms save to Supabase
- [ ] Owner notified within 60 seconds of new lead
- [ ] Leads auto-create in Jobber
- [ ] Reviews requested after job completion
- [ ] Admin dashboard functional

---
*Roadmap created: 2026-02-02*
*Phase 1 planned: 2026-02-02*
