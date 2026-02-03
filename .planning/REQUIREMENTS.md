# Requirements: TotalGuard Yard Care

**Defined:** 2026-02-02
**Core Value:** Automate the lead-to-customer pipeline

## v1 Requirements

### Setup (SETUP)

- [x] **SETUP-01**: GitHub repository created (TotalGuardYardCare/tgyardcarecom)
- [x] **SETUP-02**: Lovable project connected to GitHub repository
- [x] **SETUP-03**: Supabase project created and configured
- [ ] **SETUP-04**: n8n instance set up (cloud or self-hosted)

### Database (DB)

- [x] **DB-01**: Contact form submissions stored in Supabase
- [x] **DB-02**: Admin user authentication via Supabase Auth
- [x] **DB-03**: Website content table for editable content

### Automation (AUTO)

- [ ] **AUTO-01**: Lead notification sent to owner within 60 seconds of form submission
- [ ] **AUTO-02**: Thank-you email sent to customer after form submission
- [ ] **AUTO-03**: New lead created in Jobber from website form submission
- [ ] **AUTO-04**: Review request sent after job marked complete in Jobber

### Admin (ADMIN)

- [x] **ADMIN-01**: Admin can log in to dashboard
- [x] **ADMIN-02**: Admin can view all contact form submissions
- [x] **ADMIN-03**: Admin can update website content without code changes

### Analytics (ANLYT)

- [ ] **ANLYT-01**: Website traffic tracked in analytics (skipped for now)
- [ ] **ANLYT-02**: Form submission events tracked (skipped for now)
- [ ] **ANLYT-03**: Conversion funnel visible in dashboard

## v2 Requirements

### Advanced Automation

- **AUTO-05**: Missed call text-back automation
- **AUTO-06**: Lead quality filtering and prioritization

### Advanced Admin

- **ADMIN-04**: Analytics dashboard with charts
- **ADMIN-05**: Email/SMS template editor

### Online Booking

- **BOOK-01**: Customer can book appointments online
- **BOOK-02**: Calendar syncs with Jobber availability

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom CRM | Jobber already handles this |
| Customer portal | Customers don't need accounts |
| Online payments | Handled through Jobber |
| Mobile app | Web-based admin sufficient |
| Multi-user roles | Owner-only access for v1 |
| Complex pricing calculator | Landscaping too variable |

**Note:** AI chatbot was implemented despite being originally out of scope.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Complete |
| SETUP-02 | Phase 1 | Complete |
| SETUP-03 | Phase 2 | Complete |
| SETUP-04 | Phase 3 | Pending |
| DB-01 | Phase 2 | Complete |
| DB-02 | Phase 2 | Complete |
| DB-03 | Phase 5 | Complete |
| AUTO-01 | Phase 3 | Pending |
| AUTO-02 | Phase 3 | Pending |
| AUTO-03 | Phase 4 | Pending |
| AUTO-04 | Phase 4 | Pending |
| ADMIN-01 | Phase 5 | Complete |
| ADMIN-02 | Phase 5 | Complete |
| ADMIN-03 | Phase 5 | Complete |
| ANLYT-01 | Phase 2 | Skipped |
| ANLYT-02 | Phase 2 | Skipped |
| ANLYT-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Complete: 10
- Pending: 5 (automation)
- Skipped: 2 (analytics)

---
*Requirements defined: 2026-02-02*
*Updated: 2026-02-03*
