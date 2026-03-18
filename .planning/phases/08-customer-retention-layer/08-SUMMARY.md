# Phase 8: Customer Retention Layer Summary

**One-liner:** Magic link portal with dashboard, service history, invoices, crew ratings, and $50 referral engine

## What Was Built

### 08-01: Portal Database Schema (cdb9f59)
- 7 tables: portal_customers, service_records, upcoming_jobs, customer_invoices, service_ratings, referral_events, service_requests
- RLS policies: customers see own data only, public referral insert allowed
- Migration applied to production Supabase via `db query --linked`

### 08-02: Portal Auth Flow (f592e24)
- Middleware split: admin routes -> /admin/login, portal routes -> /portal/login
- Portal login page with magic link OTP (animated dark theme)
- Auth callback route at /portal/auth/callback exchanges code for session
- /portal/login and /portal/auth/* excluded from auth redirect

### 08-03: Portal Dashboard (10703c3)
- Portal layout with conditional nav rendering (no nav on login/auth pages)
- PortalNav: desktop sidebar (lg:w-64 fixed) + mobile bottom bar (5 items)
- Dashboard page: auto-creates portal_customers row with nanoid referral code
- Stats strip: upcoming jobs, services completed, outstanding balance, referral credits
- 4-card grid: UpcomingJobsCard, ReferralCard, ServiceHistoryCard, InvoicesCard
- RateCrewModal: 1-5 star rating with optional comment
- RequestServiceButton: modal with 15 service types + preferred date + notes
- All data fetched via Promise.allSettled for resilience
- nanoid dependency added for referral code generation

### 08-04: Service Actions + Referral Engine (e7f1916)
- POST /api/portal/rate-service: authenticated upsert to service_ratings
- POST /api/portal/request-service: authenticated insert to service_requests
- /r/[code] referral landing page: dynamic OG metadata with referrer name, $50 badge, trust stats, CTA to /get-quote?referral=CODE

### 08-05: Verification
- `npm run build` passes (140+ pages, 0 build errors)
- Portal routes confirmed in build output: /portal/auth/callback, /portal/dashboard, /portal/login, /r/[code]
- Migration file exists at supabase/migrations/20260318_phase8_portal_tables.sql
- All 7 tables verified in production Supabase

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Magic link OTP (no password) | Simpler UX for lawn care customers, fewer support tickets |
| Portal layout wraps all /portal/* pages | Nav conditionally rendered based on auth state, no route groups needed |
| nanoid for referral codes | 8-char uppercase codes (e.g., TG4X8B2K), collision-resistant |
| Service role key for /r/[code] | Public referral page needs to look up referrer name without auth |
| RLS with subquery pattern | `customer_id IN (SELECT id FROM portal_customers WHERE user_id = auth.uid())` for all child tables |
| Promise.allSettled for dashboard | Any single query failure doesn't break the entire dashboard |

## Deviations from Plan

None -- plan executed exactly as written.

## Files Created

| File | Purpose |
|------|---------|
| supabase/migrations/20260318_phase8_portal_tables.sql | 7 tables + RLS policies |
| src/middleware.ts | Updated: split admin/portal auth redirects |
| src/app/portal/login/page.tsx | Magic link login page |
| src/app/portal/auth/callback/route.ts | Auth code exchange |
| src/app/portal/layout.tsx | Portal layout with conditional nav |
| src/app/portal/dashboard/page.tsx | Dashboard server component |
| src/components/portal/PortalNav.tsx | Sidebar + mobile bottom bar |
| src/components/portal/UpcomingJobsCard.tsx | Upcoming jobs card |
| src/components/portal/ServiceHistoryCard.tsx | Service history timeline |
| src/components/portal/InvoicesCard.tsx | Invoice list with status |
| src/components/portal/ReferralCard.tsx | Referral program card |
| src/components/portal/RateCrewModal.tsx | Star rating modal |
| src/components/portal/RequestServiceButton.tsx | Service request modal |
| src/app/api/portal/rate-service/route.ts | Rating API route |
| src/app/api/portal/request-service/route.ts | Service request API route |
| src/app/r/[code]/page.tsx | Referral landing page |

## Next Phase Readiness

Phase 9 (Content & SEO Growth) can proceed. No blockers from Phase 8.
- Portal auth infrastructure is independent from content features
- Blog system already exists (blog_posts table + existing pages)
- Phase 9 will add categories, hub pages, and seasonal content surfacing
