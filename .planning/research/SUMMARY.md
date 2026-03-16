# Project Research Summary

**Project:** TotalGuard Yard Care — M3 Brand Transformation
**Domain:** Premium local lawn care service website — feature expansion on existing Next.js production site
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

TotalGuard is an existing, revenue-generating local lawn care site (65+ pages, 47 API routes, 38 active cron jobs, 500+ customers) built on Next.js 16 + Supabase. The goal is a brand transformation that adds premium visual identity, conversion-driving features (instant quote calculator, before/after gallery, service area map, hero video), and a customer retention layer (portal, referral engine). The site already has a strong foundation — existing QuoteFlow, pricing hooks, Supabase schema, and Jobber integration — but carries technical debt that is the primary execution risk: everything is `'use client'`, TypeScript errors are silently suppressed with `ignoreBuildErrors: true`, and no automated tests exist.

The recommended approach is disciplined phase ordering: safety nets and foundation work before any visual changes. The codebase is fragile (no tests, suppressed errors, 546-line monolithic client component for the homepage, 1300-line Navigation), and moving directly to the exciting brand features risks cascading failures across a site with real production traffic. The research across all 4 dimensions (stack, features, architecture, pitfalls) converges on the same conclusion: spend Phase 1 exclusively on protection — audit cron jobs, baseline SEO metrics, fix Supabase errors, remove committed credentials, consolidate design tokens, and establish the server-side Supabase client pattern.

The good news is that the feature roadmap is well-supported by the existing stack. The only net-new npm packages needed are `react-leaflet`, `react-compare-slider`, `yet-another-react-lightbox`, `nanoid`, and `@next/mdx` dependencies. Everything else — auth, payments, charts, forms, animations, data fetching — is already installed and configured. This means Phase 2+ can move quickly once the foundation is hardened.

---

## Key Findings

### Recommended Stack

The existing stack is excellent and requires minimal additions. Next.js 16 + React 19 + Supabase + TanStack Query + Framer Motion covers virtually every feature requirement. The research identified zero cases where the recommended approach requires a paid third-party service that isn't already in use — every new capability can be built free or nearly free (Google Places reuses existing API key, WI Parcel data is a free state endpoint, OpenStreetMap tiles require no key, Fontshare fonts are free for commercial use).

**Core technologies — additions only:**

| Package | Purpose | Why |
|---------|---------|-----|
| `react-leaflet@^5.0.0` + `leaflet@^1.9.4` | Interactive service area map | Free, no API key, 1.4M downloads/month. Mapbox/Google Maps violates shortest-path rule. |
| `react-compare-slider@^3.1.0` | Before/after image slider | Zero dependencies, 4KB gzipped, actively maintained, touch-friendly. |
| `yet-another-react-lightbox@^3.29.1` | Fullscreen photo gallery | Actively maintained (updated 22 days ago), React 19 compatible, plugin architecture. |
| `nanoid@^5.1.5` | Referral code generation | 130 bytes, URL-friendly, cryptographically secure. shortid is deprecated. |
| `@next/mdx@^16.1.6` + peers | MDX blog content (if not using Supabase blog) | Official Next.js integration — BUT architecture research recommends against this (see below). |
| Native `<video>` element | Hero video background | No library needed. next-video/Mux is overkill for a looping background video. |
| `next/font/local` (built-in) | Premium typography | Already in Next.js. Zero extra dependency. Self-hosted woff2 fonts, no layout shift. |

**Fonts to download (not npm — free commercial license):**
- Clash Display Variable → fontshare.com
- General Sans Variable → fontshare.com

**External APIs (no new packages):**

| API | Cost | Auth |
|-----|------|------|
| Google Places Autocomplete | ~$8.50/mo at 500 quotes (within $200 free credit) | Existing API key |
| WI Statewide Parcel REST API | Free | No key required |
| OpenStreetMap tiles (Leaflet) | Free | No key required |

**Do NOT add:** next-video/Mux, Mapbox GL, Contentlayer (abandoned), Auth0/Clerk (Supabase Auth already integrated), Prisma/Drizzle (Supabase client handles all DB ops), Tailwind v4 (migration risk mid-project).

### Expected Features

**Table Stakes — must ship for the site to feel complete:**

| Feature | Complexity | Key Dependency |
|---------|------------|----------------|
| Premium typography (Clash Display + General Sans) | Low | next/font/local + woff2 downloads |
| Hero video background with poster/fallback | Low-Med | Native `<video>` + Vercel Blob storage |
| Instant quote calculator with address autocomplete | Med | Google Places (existing key) + WI Parcel API |
| Before/after gallery with slider | Med | react-compare-slider + yet-another-react-lightbox |
| Interactive service area map | Med | react-leaflet + OpenStreetMap |
| Server component conversion (fix FCP, SEO, CWV) | High | RSC refactoring of HomeContent.tsx + server Supabase client |
| Fix 14 Supabase console errors | Med | Diagnostic + targeted fixes |
| Fix broken animated counters | Med | Root cause diagnosis (hydration or Intersection Observer) |

**Differentiators — set TotalGuard apart from TruGreen and local competitors:**

| Feature | Complexity | Why It Differentiates |
|---------|------------|----------------------|
| Annual plan configurator (visual 12-month builder) | High | No local competitor offers this. Sunday does it for DIY products; nobody does it for professional services. |
| Referral engine ($50/$50 with dashboard) | Med | Most lawn care referral programs are informal. A trackable, transparent system with real-time status is rare. |
| Crew rating / service feedback | Med | TruGreen has terrible service reviews. Soliciting feedback is a trust signal that converts. |
| Customer dashboard portal | High | Only builds if Jobber's client hub can't be styled to match — otherwise embed Jobber. |
| Smart content hub (local expertise angle) | Med | Madison-specific content (soil, frost dates, Dane County water restrictions) vs TruGreen's generic national content. |

**Defer to v2+ (anti-features):**
- AI-powered lawn analysis from photos (Sunday raised $78M for this — don't compete)
- Real-time GPS crew tracking (customers hated this when Uber-for-lawns companies tried it)
- In-app crew chat (crews are mowing, not texting)
- Custom CRM/scheduling system (Jobber exists for exactly this reason)
- Satellite lawn health scoring (requires multispectral imagery + ML infrastructure)
- Full e-commerce store (competes with the service business)
- Video testimonials platform (80+ Google reviews at 4.9 stars are already better)

### Architecture Approach

The architecture must follow a progressive island extraction strategy — NOT a big bang rewrite. The existing site is a Vite-era SPA that was migrated to Next.js App Router without being converted to Server Components. The critical structural work is: (1) create `src/lib/supabase/server.ts` using `@supabase/ssr`, (2) decompose `HomeContent.tsx` (546 lines, all client) into server-rendered sections with client islands for interactivity, (3) add `src/middleware.ts` with route-level auth for `/portal/*` and `/admin/*`. All new features build on this foundation.

**Major components and their approach:**

| Component | Pattern | Key Files |
|-----------|---------|-----------|
| Server-side Supabase client | `createServerClient()` factory with `cookies()` | `src/lib/supabase/server.ts` (new) |
| Auth middleware | Matcher-scoped to `/portal/*` only | `src/middleware.ts` (new/enhance) |
| Homepage decomposition | Server orchestrator + client islands | `src/app/page.tsx` → 8-10 child components |
| Quote calculator | Enhance existing `QuoteFlow.tsx` — don't rewrite | Add address step + live price preview |
| Service area map | `next/dynamic` with `ssr: false` (Leaflet requires `window`) | `src/components/map/ServiceAreaMapInner.tsx` |
| Customer portal | Route group `(portal)` with server layout auth check | `src/app/(portal)/portal/layout.tsx` |
| Referral engine | New tables + `/r/[code]` redirect route | Requires portal to be built first |
| Content hub | Extend existing `blog_posts` table — do NOT add MDX | Add categories, tags, content_type column |
| Video hero | Lazy-loaded `<video>` with Intersection Observer | `src/components/hero/VideoHero.tsx` (new) |

**New Supabase tables needed (phased):**
- Phase 3: `customer_profiles`, `service_appointments`, `customer_invoices`, `referral_codes`, `referral_submissions`
- Phase 4: `blog_categories`, `blog_tags`, `blog_post_tags`
- Column additions: `seasonal_slides.video_url`, `blog_posts.content_type`, `locations.lat/lng`

**Architecture decision — MDX vs Supabase blog:** Architecture research strongly recommends against adding MDX (`@next/mdx`). The `blog_posts` table already exists with a working dynamic route and auto-generating cron jobs. MDX introduces build-time dependency and conflicts with the DB-driven blog. Extend the existing system instead.

### Critical Pitfalls

1. **SEO regression from rendering/structure changes** — Moving from client-rendered to server components changes how Googlebot receives the page. For a local business where organic search is the primary lead source, a 2-week ranking drop during peak season means lost revenue. Prevention: baseline all GSC metrics before touching anything, monitor daily for 30 days post-launch, verify all 16 schema components preserve their JSON-LD output. Severity: CRITICAL.

2. **The `ignoreBuildErrors` iceberg** — TypeScript errors have been accumulating silently. Server component conversion will surface them all at once. Running `tsc --noEmit` will likely reveal 50+ errors. Prevention: catalog all existing errors first, create a "type error budget" (new code must not add errors), use `@ts-expect-error` with TODO comments on existing errors rather than the global flag, convert one component at a time with testing between each. Severity: CRITICAL.

3. **Breaking 38 cron jobs during refactoring** — Crons are defined in `vercel.json` with exact route paths. Moving or renaming API routes silently breaks them (crons don't follow redirects). Breakage only appears in production, not preview. Prevention: catalog all 38 cron jobs with routes and schedules before any refactoring, never move cron routes without updating `vercel.json` in the same commit, monitor Vercel cron dashboard for 48 hours after every deploy. Severity: CRITICAL.

4. **Customer portal auth leaking into public pages** — Supabase middleware that refreshes auth tokens runs on ALL routes unless explicitly scoped. Public pages can start requiring auth, ISR pages can cache auth tokens. The existing 14 Supabase console errors suggest the client is already misconfigured. Prevention: scope auth middleware with explicit `matcher` to `/portal/*` only, use `force-dynamic` on all authenticated routes, fix existing Supabase errors before adding portal auth. Severity: CRITICAL.

5. **HomeContent.tsx and Navigation.tsx big-bang refactors** — HomeContent.tsx is 546 lines of tightly coupled client-side state. Navigation.tsx is 1300 lines and appears on every page. Attempting to refactor either in one PR will introduce regressions across the highest-traffic pages. Prevention: screenshot baseline at 375/768/1440px before touching either, extract one section at a time keeping everything `'use client'` first, then convert to server where safe. Severity: HIGH.

6. **Video embedding destroys Core Web Vitals** — YouTube iframes cause CLS of 0.25+ (threshold is 0.1). Self-hosted video without proper implementation blocks LCP. Prevention: never autoplay video above fold on mobile, use `<video preload="none">` with poster image (poster serves as LCP element), measure CWV before and after. Severity: HIGH.

7. **Committed GSC service account JSON** — A `gsc-service-account.json` file is committed to the repo root with private keys. Prevention: remove from git history using `git filter-repo`, move to environment variables, rotate the key (assume compromised). Severity: MODERATE (CRITICAL if repo ever becomes public).

---

## Implications for Roadmap

All four research files agree on the same phase structure. The ordering is non-negotiable due to hard dependencies.

### Phase 1: Safety Nets and Foundation

**Rationale:** Every other feature degrades on a fragile, error-ridden, slow codebase. The `ignoreBuildErrors: true` flag and zero tests mean changes can break things silently. This phase has no visible deliverables to end users but is the highest-leverage investment in the project.

**Delivers:** Protected production site, established server-side data fetching pattern, TypeScript error baseline, design token system, SEO monitoring baseline.

**Addresses:** Typography system (design tokens first), broken animated counters, 14 Supabase console errors, committed credentials.

**Avoids:** Pitfalls 1 (SEO regression), 2 (TypeScript iceberg), 3 (cron job breakage), 7 (security credential), 10 (animation bug cascade), 11 (color proliferation), 12 (credential exposure).

**Non-negotiable deliverables before Phase 2:**
- Run `tsc --noEmit`, catalog all errors, set error budget
- Audit all 38 cron jobs with routes, schedules, and purpose
- Remove `gsc-service-account.json` from git history, rotate key
- Baseline all GSC metrics (clicks, impressions, rankings for top 20 pages)
- Fix 14 Supabase console errors
- Fix broken animated counters (root cause, not workaround)
- Consolidate seasonal colors into single CSS variable source of truth
- Create `src/lib/supabase/server.ts` (server-side client factory)
- Create `src/middleware.ts` (scoped to admin routes only for now)
- Download and configure Clash Display + General Sans via `next/font/local`
- Add smoke tests for top 10 pages and admin dashboard critical paths

**Research flag:** Standard patterns — no additional research needed for this phase.

---

### Phase 2: Brand Transformation and Visual Impact

**Rationale:** With safety nets in place, this phase delivers the high-visibility changes that transform the brand perception. Video hero and gallery are independent of each other and of portal infrastructure, so they can be parallelized. Typography changes (done in Phase 1 foundation) enable this phase to layer in the visual design system.

**Delivers:** Premium visual identity, hero video on homepage, before/after gallery with slider and lightbox, redesigned homepage sections with server component architecture.

**Addresses:** Hero video background, before/after gallery, typography hierarchy in use, homepage SSR conversion.

**Stack additions activated:** `react-compare-slider`, `yet-another-react-lightbox`, native `<video>` pattern, `next/font` fonts in active use.

**Avoids:** Pitfall 5 (HomeContent big-bang — extract sections one at a time), Pitfall 6 (video destroying CWV — use poster image as LCP, lazy load, mobile fallback to static image), Pitfall 7 (typography cascade — test on 5 representative pages before site-wide rollout).

**Key constraint:** Decompose `HomeContent.tsx` incrementally — one section per PR. Test lead capture flow after every extraction.

**Research flag:** Standard patterns — well-documented RSC island architecture and video optimization.

---

### Phase 3: Conversion Features (Revenue)

**Rationale:** The brand is polished, the foundation is solid. Now add the features that directly drive new customer acquisition. Quote calculator builds on the existing QuoteFlow.tsx (enhance, don't rewrite). Service area map is independent and can ship anytime in this phase. Annual plan configurator is the differentiating feature that no local competitor offers.

**Delivers:** Instant quote calculator with address autocomplete and lot-size estimation, interactive service area map, annual plan configurator (visual 12-month builder).

**Stack additions activated:** `react-leaflet` + `leaflet`, Google Places Autocomplete (existing API key), WI Parcel REST API, new API routes for geocoding proxy and parcel lookup.

**Addresses:** Instant quote calculator (table stakes), interactive service area map (table stakes), annual plan configurator (primary differentiator).

**Avoids:** Pitfall 9 (pricing state complexity — store rules in Supabase, show ranges not exact prices, add "Get exact quote" CTA next to estimate).

**Research flag:** MEDIUM confidence — WI Parcel REST API endpoint for lot size queries needs testing against real Madison addresses before committing to the implementation. Have the manual lot-size dropdown fallback ready.

---

### Phase 4: Customer Retention Layer (Portal + Referrals)

**Rationale:** Requires middleware from Phase 1 and stable site from Phase 2. The customer portal decision (custom vs embed Jobber client hub) must be made before this phase begins. If Jobber's portal can be styled to match the brand, use it — building custom is 100+ hours for feature parity with what Jobber already provides.

**Delivers:** Customer authentication, dashboard with service history and invoices, referral engine with trackable links and credit system, crew rating/feedback.

**Stack additions activated:** `nanoid` (referral codes), Supabase Storage (customer documents), new Supabase tables (`customer_profiles`, `service_appointments`, `customer_invoices`, `referral_codes`, `referral_submissions`).

**Addresses:** Customer dashboard portal, referral engine, crew rating system.

**Avoids:** Pitfall 4 (auth leaking into public pages — middleware scoped to `/portal/*` only, `force-dynamic` on all portal routes, `Cache-Control: private, no-store`).

**Research flag:** Needs decision — Jobber client hub styling capability must be investigated before committing to custom portal build. Research question: Can Jobber's client hub be embedded with custom CSS to match TotalGuard's brand? This determines Phase 4 scope dramatically.

---

### Phase 5: Content and SEO Growth

**Rationale:** SEO content benefits from the stable, server-rendered foundation. The blog system already exists and auto-generates content via cron jobs. This phase enhances organization and discoverability rather than building from scratch.

**Delivers:** Blog categories and tags, guide and tips content types, local-expert content hub (Madison-specific lawn care authority), lead magnets per topic.

**Addresses:** Smart content hub (differentiator), topic-organized content, seasonal content surfacing.

**Avoids:** MDX complexity (architecture research recommends extending existing Supabase blog, not adding MDX).

**Research flag:** Standard patterns — extending existing blog infrastructure is well-documented. Content strategy (topics, lead magnets) is an ops decision, not a dev decision.

---

### Phase Ordering Rationale

The dependency chain is: Foundation → Brand visuals (independent of auth) → Conversion features (independent of portal) → Customer portal (depends on Foundation middleware) → Content (always independent).

The features research and architecture research both identify the same dependency bottleneck: the server-side Supabase client and auth middleware. Without these, both the portal and the SSR homepage conversion cannot be built correctly. This is why Phase 1 is non-negotiable and why it has no user-visible deliverables — it's the load-bearing work that enables everything else.

The pitfalls research adds one more dimension: the SEO risk means the Phase 2 brand transformation must be done with extreme care around schema components, URL structure, and structured data. No URL changes, no schema component removal, baseline before and monitor after.

---

### Research Flags

**Needs deeper research during planning:**
- **Phase 3:** WI Statewide Parcel REST API — confirm exact endpoint and response format for lot size lookup before committing to this approach. Have manual fallback (dropdown) ready.
- **Phase 4:** Jobber client hub styling capability — must investigate before choosing custom vs embedded portal. This is a make-or-break decision for scope.

**Standard patterns (skip research-phase):**
- **Phase 1:** All safety net work is well-documented (TypeScript config, Supabase auth, Vercel cron monitoring, git history cleanup).
- **Phase 2:** RSC island architecture, video optimization, and typography via `next/font` are all fully documented in Next.js official docs.
- **Phase 5:** Blog extension is CRUD on existing Supabase tables — no novel patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every recommendation backed by official docs or npm download data. Only MEDIUM item is WI Parcel API endpoint (needs testing). |
| Features | HIGH | Competitor analysis (LawnStarter, TruGreen, Sunday, Lawn Love) well-documented. Feature priorities align with business logic. |
| Architecture | HIGH | Codebase was analyzed directly. RSC patterns, Supabase auth middleware, and Leaflet SSR constraints are all from official sources. |
| Pitfalls | HIGH | Most pitfalls are directly observable in the codebase (suppressed errors, committed credentials, monolithic components, broken counters). |

**Overall confidence: HIGH**

### Gaps to Address

- **WI Parcel API endpoint format:** Stack and architecture research flag this as MEDIUM confidence. Test the endpoint with real Madison addresses (`https://mapservices.legis.wisconsin.gov/arcgis/rest/services/WLIP/`) before committing. Dane County's AccessDane portal is a fallback option.
- **Jobber client hub customizability:** Feature research recommends embedding Jobber's portal rather than building custom, but does not verify whether Jobber allows sufficient CSS customization to match the TotalGuard brand. Validate this before Phase 4 planning.
- **Scope of TypeScript errors:** The `tsc --noEmit` audit is listed as Phase 1 work because the actual error count is unknown. If it exceeds 200+ errors, the Phase 1 timeline will expand significantly. This should be the first thing run.
- **Current Supabase console error root causes:** All 14 errors are listed as "known" but their root causes are undiagnosed. They may be trivial (missing optional fields) or structural (auth client misconfiguration). Diagnose before estimating fix effort.

---

## Sources

### Primary — HIGH Confidence
- Next.js 16 official documentation (fonts, video, MDX, RSC, middleware)
- Supabase official documentation (server-side auth for Next.js, troubleshooting guide)
- Vercel official documentation (cron jobs, video hosting, Blob storage)
- npm package data (react-leaflet v5, react-compare-slider v3, yet-another-react-lightbox v3, nanoid v5)
- Direct codebase analysis (ARCHITECTURE.md agent read every referenced file)

### Secondary — MEDIUM Confidence
- Competitor analysis: LawnStarter, TruGreen, Sunday Lawn Care, Lawn Love, GorillaDesk, RealGreen
- Wisconsin Statewide Parcel Map (sco.wisc.edu) — endpoint confirmed, query format unverified
- Google Places Autocomplete pricing documentation (pricing verified, session-based model)
- Fontshare.com commercial license terms (Clash Display, General Sans)

### Tertiary — LOW Confidence
- Website redesign SEO checklist (community sources — patterns observed, not officially verified)
- RSC best practices 2025 (community blog — supplements official docs)
- Before/after gallery conversion rate claims (industry marketing data — directionally useful)

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
