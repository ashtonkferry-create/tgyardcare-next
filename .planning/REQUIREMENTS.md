# Requirements: TG Yard Care v2.0

**Defined:** 2026-02-04
**Core Value:** Convert property owners into qualified, high-AOV leads through instant pricing transparency and zero-friction quote flows

## v2.0 Requirements

### Infrastructure (INFRA)

- [ ] **INFRA-01**: 301 redirect configured from totalguardyardcare.com to tgyardcare.com
- [ ] **INFRA-02**: Professional email set up (hello@tgyardcare.com or similar)
- [ ] **INFRA-03**: Next.js App Router project initialized and deployed on Vercel
- [ ] **INFRA-04**: Repository restructured per target architecture (App Router pages, components, lib, types)

### Database (DB)

- [ ] **DB-04**: Supabase schema created with all tables (business_info, site_config, services, service_details, pricing, seasonal_modifiers, upsells, locations, location_services, location_service_content, faqs, reviews, leads, blog_posts, blog_categories, blog_post_services, related_posts)
- [ ] **DB-05**: Core data seeded (services, business_info, site_config)
- [ ] **DB-06**: Pricing data seeded with Good/Better/Best tiers for all 6 services, lot-size ranges
- [ ] **DB-07**: Location data seeded for 15-20 Dane County municipalities with location_services junction
- [ ] **DB-08**: FAQ data seeded per service and top 5 locations
- [ ] **DB-09**: Review data curated from Google/Yelp/Nextdoor (10-15 reviews) into Supabase

### Data Layer (DATA)

- [ ] **DATA-01**: Supabase client initialized with typed data fetchers for all tables
- [ ] **DATA-02**: Pricing calculator with seasonal modifiers, lot-size logic, and tier display
- [ ] **DATA-03**: TypeScript interfaces defined for all Supabase table schemas

### Design System (DSGN)

- [ ] **DSGN-01**: Premium design system implemented (earth tones, clean typography, generous whitespace)
- [ ] **DSGN-02**: Root layout with responsive header and footer
- [ ] **DSGN-03**: Footer displays consistent NAP from Supabase business_info table
- [ ] **DSGN-04**: Mobile-responsive with sticky primary CTA ("Get Your Price")

### Pages (PAGE)

- [ ] **PAGE-01**: Homepage with 7 content blocks (hero, trust bar, service cards, how-it-works, social proof, service area map, footer)
- [ ] **PAGE-02**: 6 service pages with pricing tiers, FAQ accordions, before/after gallery, related services cross-links
- [ ] **PAGE-03**: Dynamic location pages via [slug] route, auto-generated from Supabase locations table (15-25 pages)
- [ ] **PAGE-04**: About page restructured (credentials-first, then founding story)
- [ ] **PAGE-05**: Blog index page with category filtering
- [ ] **PAGE-06**: Individual blog post pages with markdown rendering and service tagging

### Pricing (PRICE)

- [ ] **PRICE-01**: Good/Better/Best tier pricing displayed on service pages from Supabase
- [ ] **PRICE-02**: Seasonal pricing modifiers applied automatically based on current month
- [ ] **PRICE-03**: Location-specific pricing displayed on location pages
- [ ] **PRICE-04**: Starting prices ("From $X/visit") on homepage service cards from Supabase
- [ ] **PRICE-05**: Upsell rules displayed during quote flow when bundling services

### Quote Flow (QUOTE)

- [ ] **QUOTE-01**: Multi-step quote form (service selection → property details → frequency → instant price → contact → confirmation)
- [ ] **QUOTE-02**: Instant price range calculated from Supabase pricing tables with seasonal adjustment
- [ ] **QUOTE-03**: Lead data captured and stored in Supabase leads table
- [ ] **QUOTE-04**: Lead quality score computed at submission (recurring +30, multi-service +20, commercial +15, best tier +15, etc.)
- [ ] **QUOTE-05**: Founder notification on new high-priority leads via Supabase Edge Function

### SEO & Discovery (SEO)

- [ ] **SEO-01**: JSON-LD schema markup on all page types (LocalBusiness, Service, FAQPage, Article)
- [ ] **SEO-02**: Dynamic sitemap generated from all Supabase slugs (services, locations, blog posts)
- [ ] **SEO-03**: Internal link graph computed from junction tables (services ↔ blog, services ↔ locations, blog ↔ blog)
- [ ] **SEO-04**: FAQPage schema on every service and location page
- [ ] **SEO-05**: robots.txt properly configured

### Content (CONT)

- [ ] **CONT-01**: Blog system with markdown files in /content/blog/ and Supabase metadata
- [ ] **CONT-02**: First 5 blog posts published (lawn mowing cost guide, gutter cleaning cost guide, spring lawn care checklist, fall cleanup checklist, best mulch types for Wisconsin)
- [ ] **CONT-03**: Topic cluster internal linking implemented (hub-and-spoke from service pages)
- [ ] **CONT-04**: Service-specific FAQ sections rendered from Supabase faqs table
- [ ] **CONT-05**: Location-specific content blocks rendered from Supabase location_service_content table

### Launch (LNCH)

- [ ] **LNCH-01**: Lighthouse CI configured in GitHub Actions (performance, accessibility, SEO gates)
- [ ] **LNCH-02**: 301 redirect map for all existing URLs to new URL structure
- [ ] **LNCH-03**: Production deployment to Vercel with tgyardcare.com domain
- [ ] **LNCH-04**: Google Search Console indexing verified for all pages

## Future Requirements

### Post-Launch Automation

- **AUTO-05**: Automated email sequences for unconverted leads (48hr follow-up)
- **AUTO-06**: Review solicitation system (post-service Google review request)
- **AUTO-07**: Missed call text-back automation

### Expansion

- **EXPAND-01**: Commercial/property management landing page with volume pricing
- **EXPAND-02**: Additional 10 location pages per quarter
- **EXPAND-03**: Blog content calendar (2-4 posts/month)

### Advanced

- **ADV-01**: CRM integration when volume justifies
- **ADV-02**: Online booking synced with Jobber availability
- **ADV-03**: Analytics dashboard with conversion funnel visualization

## Out of Scope

| Feature | Reason |
|---------|--------|
| Customer portal/login | Customers don't need accounts for lawn care |
| Online payments | Handled through Jobber |
| Mobile app | Web-first, SSR handles mobile well |
| Chatbot/AI assistant | Not carrying forward from v1.0, adds complexity |
| Discount/coupon system | Never compete on price — urgency through scarcity |
| Multi-user admin roles | Owner-only access sufficient |
| Real-time scheduling | Jobber handles scheduling |
| E-commerce/product sales | Service business, not retail |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 6 | Pending |
| INFRA-02 | Phase 6 | Pending |
| INFRA-03 | Phase 6 | Pending |
| INFRA-04 | Phase 6 | Pending |
| DB-04 | Phase 6 | Pending |
| DB-05 | Phase 6 | Pending |
| DB-06 | Phase 6 | Pending |
| DB-07 | Phase 6 | Pending |
| DB-08 | Phase 6 | Pending |
| DATA-01 | Phase 7 | Pending |
| DATA-02 | Phase 7 | Pending |
| DATA-03 | Phase 7 | Pending |
| DSGN-01 | Phase 7 | Pending |
| DSGN-02 | Phase 7 | Pending |
| DSGN-03 | Phase 7 | Pending |
| DSGN-04 | Phase 7 | Pending |
| PAGE-01 | Phase 8 | Pending |
| PAGE-02 | Phase 8 | Pending |
| PRICE-01 | Phase 8 | Pending |
| PRICE-02 | Phase 8 | Pending |
| PRICE-03 | Phase 9 | Pending |
| PRICE-04 | Phase 8 | Pending |
| PRICE-05 | Phase 10 | Pending |
| PAGE-03 | Phase 9 | Pending |
| PAGE-04 | Phase 12 | Pending |
| PAGE-05 | Phase 11 | Pending |
| PAGE-06 | Phase 11 | Pending |
| QUOTE-01 | Phase 10 | Pending |
| QUOTE-02 | Phase 10 | Pending |
| QUOTE-03 | Phase 10 | Pending |
| QUOTE-04 | Phase 10 | Pending |
| QUOTE-05 | Phase 10 | Pending |
| SEO-01 | Phase 11 | Pending |
| SEO-02 | Phase 11 | Pending |
| SEO-03 | Phase 11 | Pending |
| SEO-04 | Phase 11 | Pending |
| SEO-05 | Phase 11 | Pending |
| CONT-01 | Phase 12 | Pending |
| CONT-02 | Phase 12 | Pending |
| CONT-03 | Phase 12 | Pending |
| CONT-04 | Phase 9 | Pending |
| CONT-05 | Phase 9 | Pending |
| DB-09 | Phase 12 | Pending |
| LNCH-01 | Phase 13 | Pending |
| LNCH-02 | Phase 13 | Pending |
| LNCH-03 | Phase 13 | Pending |
| LNCH-04 | Phase 13 | Pending |

**Coverage:**
- v2.0 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 after milestone v2.0 initialization*
