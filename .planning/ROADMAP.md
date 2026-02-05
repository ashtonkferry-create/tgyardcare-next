# Roadmap: TG Yard Care v2.0

**Created:** 2026-02-04
**Milestone:** v2.0 — Billion-Dollar Transformation
**Phases:** 8 (Phases 6–13, continuing from v1.0)
**Core Value:** Convert property owners into qualified, high-AOV leads through instant pricing transparency and zero-friction quote flows

## Phase Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 6 | Foundation & Database | Domain, Next.js project, Supabase schema, seed data | INFRA-01–04, DB-04–08 | ○ Pending |
| 7 | Data Layer & Design System | Supabase client, pricing calculator, types, layout, design | DATA-01–03, DSGN-01–04 | ○ Pending |
| 8 | Core Pages | Homepage, service pages with pricing tiers | PAGE-01–02, PRICE-01–02, PRICE-04 | ○ Pending |
| 9 | Location System | Dynamic location pages, local pricing, local FAQs/content | PAGE-03, PRICE-03, CONT-04–05 | ○ Pending |
| 10 | Quote & Conversion Engine | Multi-step quote flow, lead scoring, notifications | QUOTE-01–05, PRICE-05 | ○ Pending |
| 11 | SEO & Blog System | Schema markup, sitemap, blog pages, internal links | SEO-01–05, PAGE-05–06 | ○ Pending |
| 12 | Content & Trust | Blog posts, reviews, about page, topic clusters | CONT-01–03, DB-09, PAGE-04 | ○ Pending |
| 13 | Launch Preparation | Lighthouse CI, redirects, deploy, verify indexing | LNCH-01–04 | ○ Pending |

---

## Phase 6: Foundation & Database

**Status:** ○ Pending
**Goal:** Set up Next.js project on Vercel, consolidate domains, create complete Supabase schema, and seed all reference data.

**Requirements:**
- [ ] INFRA-01: 301 redirect from totalguardyardcare.com to tgyardcare.com
- [ ] INFRA-02: Professional email (hello@tgyardcare.com)
- [ ] INFRA-03: Next.js App Router project initialized on Vercel
- [ ] INFRA-04: Repository restructured per target architecture
- [ ] DB-04: All 17 Supabase tables created via migrations
- [ ] DB-05: Core data seeded (services, business_info, site_config)
- [ ] DB-06: Pricing data seeded (Good/Better/Best tiers, lot sizes)
- [ ] DB-07: Location data seeded (15-20 Dane County municipalities)
- [ ] DB-08: FAQ data seeded (per service + top 5 locations)

**Success Criteria:**
1. `npx next dev` runs without errors with App Router structure
2. Vercel preview deployment accessible
3. All 17 Supabase tables exist with correct schemas
4. `SELECT count(*) FROM services` returns 6 rows
5. `SELECT count(*) FROM locations` returns 15+ rows
6. totalguardyardcare.com redirects to tgyardcare.com

---

## Phase 7: Data Layer & Design System

**Status:** ○ Pending
**Goal:** Build typed Supabase data fetchers, pricing calculator, and implement the premium design system with root layout.

**Requirements:**
- [ ] DATA-01: Supabase client with typed data fetchers for all tables
- [ ] DATA-02: Pricing calculator (seasonal modifiers, lot-size logic, tier display)
- [ ] DATA-03: TypeScript interfaces for all Supabase schemas
- [ ] DSGN-01: Premium design system (earth tones, clean typography, whitespace)
- [ ] DSGN-02: Root layout with responsive header and footer
- [ ] DSGN-03: Footer NAP from Supabase business_info
- [ ] DSGN-04: Mobile-responsive with sticky "Get Your Price" CTA

**Success Criteria:**
1. `getServices()`, `getPricing()`, `getLocations()` return typed data
2. Pricing calculator correctly applies seasonal multipliers and lot-size ranges
3. Layout renders header/footer on all pages with correct NAP
4. Mobile viewport shows sticky CTA bar
5. Design matches premium specification (not stock landscaping aesthetic)

---

## Phase 8: Core Pages

**Status:** ○ Pending
**Goal:** Build homepage and all 6 service pages with dynamic pricing tiers from Supabase.

**Requirements:**
- [ ] PAGE-01: Homepage with 7 content blocks
- [ ] PAGE-02: 6 service pages (lawn-care, gutter-care, landscaping, mulch-installation, seasonal-cleanup, window-cleaning)
- [ ] PRICE-01: Good/Better/Best tiers on service pages
- [ ] PRICE-02: Seasonal pricing modifiers displayed
- [ ] PRICE-04: Starting prices on homepage service cards

**Success Criteria:**
1. Homepage renders all 7 blocks with live Supabase data
2. Each service page shows correct pricing tiers from database
3. Seasonal modifier label appears during peak months (Apr–Oct)
4. Homepage service cards show "From $X/visit" pulled from Supabase
5. All pages server-side rendered (view-source shows content)

---

## Phase 9: Location System

**Status:** ○ Pending
**Goal:** Build dynamic location pages that auto-generate from Supabase data, with local pricing and FAQ/content blocks.

**Requirements:**
- [ ] PAGE-03: Dynamic location pages via /locations/[slug] route
- [ ] PRICE-03: Location-specific pricing on location pages
- [ ] CONT-04: Service-specific FAQ sections from Supabase
- [ ] CONT-05: Location-specific content blocks from Supabase

**Success Criteria:**
1. /locations/madison, /locations/middleton, etc. all render correctly
2. Location pages show services available in that municipality
3. Pricing reflects location-specific overrides where set
4. FAQ accordion renders service and location-tagged questions
5. Adding a new row to `locations` table auto-generates new page on rebuild

---

## Phase 10: Quote & Conversion Engine

**Status:** ○ Pending
**Goal:** Build the multi-step quote flow that delivers instant pricing and captures qualified leads with scoring.

**Requirements:**
- [ ] QUOTE-01: 6-step quote form (service → property → frequency → price → contact → confirm)
- [ ] QUOTE-02: Instant price range from Supabase with seasonal adjustment
- [ ] QUOTE-03: Lead data stored in Supabase leads table
- [ ] QUOTE-04: Quality score computed (recurring +30, multi-service +20, etc.)
- [ ] QUOTE-05: Founder notification on high-priority leads (Edge Function)
- [ ] PRICE-05: Upsell rules displayed when bundling services

**Success Criteria:**
1. User completes 6-step flow in under 60 seconds
2. Price range shown matches Supabase pricing × seasonal modifier
3. Lead appears in Supabase `leads` table with all fields populated
4. Quality score computed correctly (verified with test cases)
5. Founders receive email/notification within 60 seconds of high-priority submission

---

## Phase 11: SEO & Blog System

**Status:** ○ Pending
**Goal:** Implement schema markup on all pages, dynamic sitemap, blog system, and internal link graph.

**Requirements:**
- [ ] SEO-01: JSON-LD schema on all page types
- [ ] SEO-02: Dynamic sitemap from Supabase slugs
- [ ] SEO-03: Internal link graph from junction tables
- [ ] SEO-04: FAQPage schema on service and location pages
- [ ] SEO-05: robots.txt configured
- [ ] PAGE-05: Blog index page
- [ ] PAGE-06: Blog post pages with markdown rendering

**Success Criteria:**
1. Google Rich Results Test validates schema on homepage, service pages, location pages
2. /sitemap.xml lists all services, locations, and blog posts
3. Service pages cross-link to related blog posts and locations
4. Blog posts link back to parent service hub
5. robots.txt allows crawling of all public pages

---

## Phase 12: Content & Trust

**Status:** ○ Pending
**Goal:** Publish initial blog content, curate reviews, restructure about page, and implement topic cluster linking.

**Requirements:**
- [ ] CONT-01: Blog system with /content/blog/ markdown + Supabase metadata
- [ ] CONT-02: 5 blog posts published (cost guides, checklists, mulch guide)
- [ ] CONT-03: Topic cluster internal linking (hub-and-spoke)
- [ ] DB-09: 10-15 curated reviews in Supabase
- [ ] PAGE-04: About page (credentials-first, then story)

**Success Criteria:**
1. 5 blog posts accessible at /blog/[slug] with proper formatting
2. Each blog post links to its parent service page
3. Service pages link to their cluster blog posts
4. Reviews render on homepage and relevant location pages
5. About page leads with credentials/insurance, story is secondary

---

## Phase 13: Launch Preparation

**Status:** ○ Pending
**Goal:** Performance audit, redirect mapping, production deployment, and search console verification.

**Requirements:**
- [ ] LNCH-01: Lighthouse CI in GitHub Actions
- [ ] LNCH-02: 301 redirect map for all existing URLs
- [ ] LNCH-03: Production deployment to Vercel
- [ ] LNCH-04: Search Console indexing verified

**Success Criteria:**
1. Lighthouse scores 90+ on performance, accessibility, SEO
2. Every existing URL returns 301 to correct new URL (no 404s)
3. tgyardcare.com serves the new Next.js site
4. All pages appear in Google Search Console sitemap report
5. No console errors on any page

---

## Milestone Completion Criteria

All phases complete when:
- [ ] Next.js site live on tgyardcare.com via Vercel
- [ ] 50+ indexable pages (6 services + 15-25 locations + 5 blog + home + about + quote)
- [ ] Quote flow generates leads with instant pricing
- [ ] All pages have valid schema markup
- [ ] Lighthouse 90+ across all metrics
- [ ] Zero 404s from old URL structure
- [ ] Founders receiving lead notifications

---
*Roadmap created: 2026-02-04*
*Milestone v2.0: Phases 6–13*
