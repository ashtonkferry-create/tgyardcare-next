# Requirements: TotalGuard M3 — Billionaire Brand Transformation

**Defined:** 2026-03-15
**Core Value:** Transform tgyardcare.com from a functional local business site into a billion-dollar brand experience that converts visitors at 3-5x current rates while protecting existing SEO rankings and lead flow.

## v1 Requirements

Requirements for M3 milestone. Each maps to roadmap phases.

### Foundation & Safety (FOUND)

- [ ] **FOUND-01**: All 14 Supabase console errors on production are resolved (zero errors in DevTools)
- [ ] **FOUND-02**: Animated stat counters display correct values (4.9, 80+, 100%, 24hr) on all pages — not "0"
- [ ] **FOUND-03**: TypeScript errors cataloged via `tsc --noEmit` with error budget established (new code adds zero errors)
- [ ] **FOUND-04**: All 38 cron jobs audited with route paths, schedules, and purpose documented
- [ ] **FOUND-05**: `gsc-service-account.json` removed from git history, key rotated
- [ ] **FOUND-06**: Server-side Supabase client created (`src/lib/supabase/server.ts`) using `@supabase/ssr`
- [ ] **FOUND-07**: Auth middleware scoped to `/portal/*` and `/admin/*` routes only
- [ ] **FOUND-08**: Seasonal theme colors consolidated into single CSS variable source of truth (not duplicated across 5+ files)
- [ ] **FOUND-09**: SEO baseline captured from Google Search Console (clicks, impressions, rankings for top 20 pages)
- [ ] **FOUND-10**: Smoke tests added for top 10 public pages and admin dashboard critical paths

### Typography & Design System (TYPO)

- [ ] **TYPO-01**: Inter font replaced with Clash Display (headings) + General Sans (body) via `next/font/local`
- [ ] **TYPO-02**: Font files (woff2) self-hosted — zero external font requests
- [ ] **TYPO-03**: Typography scale established with CSS variables (display, heading, body, small, mono sizes)
- [ ] **TYPO-04**: Text contrast meets WCAG AA on all dark sections (text opacity/brightness increased where needed)
- [ ] **TYPO-05**: Brand name unified to "TotalGuard" consistently across all titles, headings, meta tags

### Hero & Visual Impact (HERO)

- [ ] **HERO-01**: Homepage hero displays cinematic video background (autoplay, muted, loop) with poster image fallback
- [ ] **HERO-02**: Video lazy-loaded via Intersection Observer — does not block LCP or affect CWV negatively
- [ ] **HERO-03**: Mobile hero falls back to optimized static image (no autoplay video on mobile to save bandwidth)
- [ ] **HERO-04**: Before/after transformation gallery page with 20+ image pairs using comparison sliders
- [ ] **HERO-05**: Gallery includes fullscreen lightbox for detailed viewing
- [ ] **HERO-06**: Gallery organized by service type with neighborhood names for local SEO

### Server Components & Performance (PERF)

- [ ] **PERF-01**: HomeContent.tsx decomposed from single 546-line client component into server-rendered sections with client islands
- [ ] **PERF-02**: Homepage is server-rendered (hero, stats, services grid, reviews render without JavaScript)
- [ ] **PERF-03**: Only interactive elements (carousel, seasonal theme toggle, chatbot) remain as client components
- [ ] **PERF-04**: Lighthouse Performance score ≥ 90 on desktop, ≥ 75 on mobile for homepage
- [ ] **PERF-05**: All 16 schema components preserved — JSON-LD output identical before and after conversion

### Instant Quote Calculator (QUOTE)

- [ ] **QUOTE-01**: User can enter their address with Google Places autocomplete suggestions
- [ ] **QUOTE-02**: System looks up lot size automatically via WI Parcel API (with manual fallback dropdown)
- [ ] **QUOTE-03**: User selects desired services from checkbox list
- [ ] **QUOTE-04**: User sees estimated price range within 30 seconds of starting (no waiting for callback)
- [ ] **QUOTE-05**: Price display shows range (e.g., "$45-65/visit") with "Get exact quote" CTA for precision
- [ ] **QUOTE-06**: Quote calculator captures lead data (name, email, phone, address, selected services) to Supabase
- [ ] **QUOTE-07**: Existing QuoteFlow.tsx enhanced (not rewritten) — preserves current pricing logic

### Interactive Service Area Map (MAP)

- [ ] **MAP-01**: Interactive map displays TotalGuard's coverage area across 12 Dane County cities
- [ ] **MAP-02**: Map uses Leaflet + OpenStreetMap tiles (free, no API key required)
- [ ] **MAP-03**: Each city is clickable and links to its location page
- [ ] **MAP-04**: Map renders client-side only (SSR disabled via `next/dynamic`) to avoid Leaflet window dependency
- [ ] **MAP-05**: Service area boundaries are visually highlighted (polygon overlay)

### Annual Plan Configurator (PLAN)

- [ ] **PLAN-01**: User can toggle services on/off by season (Spring, Summer, Fall, Winter)
- [ ] **PLAN-02**: User sees a visual 12-month calendar showing when each service occurs
- [ ] **PLAN-03**: Bundle pricing updates in real-time as services are added/removed
- [ ] **PLAN-04**: Bundle discount shown vs. booking services individually (e.g., "Save 15%")
- [ ] **PLAN-05**: "Lock In My Plan" CTA captures lead with selected package details
- [ ] **PLAN-06**: Configurator uses existing Supabase pricing data (no hardcoded prices)

### Customer Dashboard Portal (PORT)

- [ ] **PORT-01**: Customers can sign up / log in via magic link (email-based, passwordless)
- [ ] **PORT-02**: Dashboard shows upcoming service schedule
- [ ] **PORT-03**: Dashboard shows service history with dates and services performed
- [ ] **PORT-04**: Dashboard shows invoices with payment status
- [ ] **PORT-05**: Customers can request additional services from their dashboard
- [ ] **PORT-06**: Customers can rate their crew after each visit (1-5 stars + optional comment)
- [ ] **PORT-07**: Portal routes are auth-protected — public pages remain unaffected
- [ ] **PORT-08**: Portal styling matches TotalGuard brand (dark theme, same typography)

### Referral Engine (REF)

- [ ] **REF-01**: Each customer gets a unique referral link (e.g., tgyardcare.com/r/ABC123)
- [ ] **REF-02**: Referred visitor sees personalized landing page ("Your neighbor [Name] recommends us")
- [ ] **REF-03**: Referrer earns $50 credit when referred customer books first service
- [ ] **REF-04**: Referred customer gets $50 off first service
- [ ] **REF-05**: Referral status trackable in customer portal (pending, qualified, credited)
- [ ] **REF-06**: Referral codes generated with nanoid (URL-friendly, cryptographically secure)

### Content Hub & Education (CONT)

- [ ] **CONT-01**: Blog posts organized by categories (Lawn Care, Seasonal, Gutters, etc.)
- [ ] **CONT-02**: Blog posts tagged for cross-referencing
- [ ] **CONT-03**: "Madison Lawn Care Guide" hub page aggregating all educational content
- [ ] **CONT-04**: Seasonal content calendar surfacing relevant guides by time of year
- [ ] **CONT-05**: Lead magnet CTA embedded in content (e.g., "Get your free lawn care checklist")
- [ ] **CONT-06**: Content system extends existing Supabase `blog_posts` table (no MDX migration)

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Mobile app (PWA or native wrapper around customer portal)
- **ADV-02**: Push notifications for upcoming service visits
- **ADV-03**: In-app crew tipping
- **ADV-04**: Property photo timeline (lawn progress over months)
- **ADV-05**: Franchise/license model documentation and playbook
- **ADV-06**: Dynamic satellite-imagery pricing
- **ADV-07**: Partnership/integration pages (Nest, Ring, HOA portals)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| AI-powered lawn analysis from photos | Sunday raised $78M for this — don't compete at local scale |
| Real-time GPS crew tracking | Customers hated this when Uber-for-lawns companies tried it |
| In-app crew chat | Crews are mowing, not texting |
| Custom CRM/scheduling system | Jobber exists for exactly this reason |
| Satellite lawn health scoring | Requires multispectral imagery + ML infrastructure |
| Full e-commerce store | Competes with the service business model |
| Video testimonials platform | 80+ Google reviews at 4.9 stars are already better social proof |
| MDX blog migration | Architecture research recommends extending existing Supabase blog |
| Tailwind v4 migration | Migration risk during active feature work |
| White/light background redesign | User explicitly wants to keep current dark color palette |

## Traceability

Updated during roadmap creation (2026-03-15).

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 5 | Pending |
| FOUND-02 | Phase 5 | Pending |
| FOUND-03 | Phase 5 | Pending |
| FOUND-04 | Phase 5 | Pending |
| FOUND-05 | Phase 5 | Pending |
| FOUND-06 | Phase 5 | Pending |
| FOUND-07 | Phase 5 | Pending |
| FOUND-08 | Phase 5 | Pending |
| FOUND-09 | Phase 5 | Pending |
| FOUND-10 | Phase 5 | Pending |
| TYPO-01 | Phase 5 | Pending |
| TYPO-02 | Phase 5 | Pending |
| TYPO-03 | Phase 5 | Pending |
| TYPO-04 | Phase 5 | Pending |
| TYPO-05 | Phase 5 | Pending |
| HERO-01 | Phase 6 | Pending |
| HERO-02 | Phase 6 | Pending |
| HERO-03 | Phase 6 | Pending |
| HERO-04 | Phase 6 | Pending |
| HERO-05 | Phase 6 | Pending |
| HERO-06 | Phase 6 | Pending |
| PERF-01 | Phase 6 | Pending |
| PERF-02 | Phase 6 | Pending |
| PERF-03 | Phase 6 | Pending |
| PERF-04 | Phase 6 | Pending |
| PERF-05 | Phase 6 | Pending |
| QUOTE-01 | Phase 7 | Pending |
| QUOTE-02 | Phase 7 | Pending |
| QUOTE-03 | Phase 7 | Pending |
| QUOTE-04 | Phase 7 | Pending |
| QUOTE-05 | Phase 7 | Pending |
| QUOTE-06 | Phase 7 | Pending |
| QUOTE-07 | Phase 7 | Pending |
| MAP-01 | Phase 7 | Pending |
| MAP-02 | Phase 7 | Pending |
| MAP-03 | Phase 7 | Pending |
| MAP-04 | Phase 7 | Pending |
| MAP-05 | Phase 7 | Pending |
| PLAN-01 | Phase 7 | Pending |
| PLAN-02 | Phase 7 | Pending |
| PLAN-03 | Phase 7 | Pending |
| PLAN-04 | Phase 7 | Pending |
| PLAN-05 | Phase 7 | Pending |
| PLAN-06 | Phase 7 | Pending |
| PORT-01 | Phase 8 | Pending |
| PORT-02 | Phase 8 | Pending |
| PORT-03 | Phase 8 | Pending |
| PORT-04 | Phase 8 | Pending |
| PORT-05 | Phase 8 | Pending |
| PORT-06 | Phase 8 | Pending |
| PORT-07 | Phase 8 | Pending |
| PORT-08 | Phase 8 | Pending |
| REF-01 | Phase 8 | Pending |
| REF-02 | Phase 8 | Pending |
| REF-03 | Phase 8 | Pending |
| REF-04 | Phase 8 | Pending |
| REF-05 | Phase 8 | Pending |
| REF-06 | Phase 8 | Pending |
| CONT-01 | Phase 9 | Pending |
| CONT-02 | Phase 9 | Pending |
| CONT-03 | Phase 9 | Pending |
| CONT-04 | Phase 9 | Pending |
| CONT-05 | Phase 9 | Pending |
| CONT-06 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 64 total
- Mapped to phases: 64
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 — roadmap created, traceability expanded per-requirement*
