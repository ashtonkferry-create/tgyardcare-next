# Architecture Patterns

**Domain:** TotalGuard Yard Care website — billionaire brand feature integration
**Researched:** 2026-03-15
**Overall confidence:** HIGH (based on direct codebase analysis + verified external sources)

## Current Architecture Snapshot

### What Exists Today

```
src/
  app/
    page.tsx              → Server Component (metadata only, renders <HomeContent />)
    HomeContent.tsx        → 'use client' (546 lines, ALL homepage logic)
    layout.tsx             → Server Component, wraps <Providers> (client boundary)
    blog/[slug]/page.tsx   → Server Component (fetches from Supabase with service role key)
    admin/                 → 18 admin pages, no layout-level auth guard
    api/
      admin/               → 6 admin API routes
      contact/route.ts     → Lead submission
      cron/                → 40+ automated cron jobs (SEO, blog, reviews, etc.)
      integrations/        → Jobber OAuth connect/callback
      webhooks/jobber/     → Jobber webhook handler
  components/
    Navigation.tsx         → 1300+ lines, 'use client', mega-menu
    Providers.tsx          → QueryClient, SeasonalTheme, Chat, Toasters, BackToTop
    QuoteFlow.tsx          → Multi-step quote wizard (service → property → frequency → pricing → contact)
    QuickQuoteDialog.tsx   → Dialog-based quick quote with seasonal themes
    60+ custom components  → All 'use client'
    40+ shadcn/ui          → Base component layer
    16 schema components   → JSON-LD structured data
  contexts/
    SeasonalThemeContext   → Season detection + DB overrides + slide data
    ChatContext            → Chatbot state
  hooks/
    usePricing.ts          → Supabase pricing lookup with seasonal modifiers
    useLeads.ts            → Lead submission + scoring
    useServices.ts         → Service data from Supabase
    useLocations.ts        → Location data from Supabase
    15 total hooks         → All use client-side Supabase client
  integrations/supabase/
    client.ts              → Browser Supabase client (anon key, localStorage auth)
    types.ts               → Generated types (13 tables known)
  lib/
    seasonalServices.ts    → Service ordering by season
    validation.ts          → Form validation
    jobber/                → Jobber integration utilities
```

### Key Architecture Problems to Address

| Problem | Impact | Root Cause |
|---------|--------|-----------|
| Everything is 'use client' | Poor LCP, no streaming, large JS bundles | Migrated from Vite/React SPA without RSC refactoring |
| No server-side Supabase client | No SSR data fetching, no server actions | Only `client.ts` exists (browser client with localStorage) |
| Navigation.tsx is 1300+ lines | Hard to maintain, blocks all page renders | Mega-menu with seasonal logic, inline data, animation config |
| `ignoreBuildErrors: true` | Silent type failures, hidden bugs | Supabase generated types are incomplete |
| No auth middleware | Admin pages unprotected at route level | Auth checked per-component, not per-route |
| No customer-facing auth | Blocks customer portal | Only admin role exists in user_roles table |

### Supabase Schema (Known Tables)

```
blog_posts            → Content hub (already exists)
chat_conversations    → Chatbot history
chat_session_secrets  → Chatbot session auth
chatbot_feedback      → Rating/feedback
contact_submissions   → Contact form leads
gallery_items         → Before/after photos
lead_follow_ups       → Automated follow-up tracking
page_seo              → Per-page SEO metadata
performance_audits    → Lighthouse scores
promo_settings        → Seasonal promotions
season_override       → Manual season control
season_settings       → Season date ranges + theme colors
seasonal_priority_services → Season-specific service ordering
seasonal_slides       → Hero carousel content
upsell_clicks         → Click tracking
user_roles            → Role-based access (admin | user enum exists)

-- Tables referenced in hooks but NOT in generated types:
pricing               → Tier-based pricing (good/better/best)
services              → Service definitions
locations             → Service area locations
leads                 → Lead management with scoring
faqs                  → FAQ data
```

## Recommended Architecture for New Features

### 1. Server Components Conversion Strategy

**Pattern: Progressive Island Architecture**

Do NOT attempt a full rewrite. Instead, extract server-renderable sections from HomeContent.tsx into server components, keeping interactive pieces as client islands.

**HomeContent.tsx decomposition:**

```
src/app/
  page.tsx (Server Component — orchestrator)
    ├── (server) HeroSection.tsx        → Season detection on server, pass season to client hero
    ├── (server) TrustStats.tsx         → Static data, animated counters are client island
    ├── (client) SeasonalHero/
    │     ├── WinterHero.tsx            → Keep as client (heavy animation)
    │     ├── SummerHero.tsx
    │     └── FallHero.tsx
    ├── (server) ServicesSection.tsx     → Service data fetched server-side
    │     └── (client) ServiceCarousel  → Carousel interaction only
    ├── (server) ReviewsSection.tsx     → Reviews fetched server-side
    ├── (server) ComparisonSection.tsx  → Static content
    ├── (server) ProcessSection.tsx     → Static content
    ├── (server) BlogSection.tsx        → Blog posts fetched server-side
    └── (server) CTASection.tsx         → Static with client CTA button
```

**Files to create:**
- `src/lib/supabase/server.ts` — Server-side Supabase client using `@supabase/ssr` with `cookies()`
- `src/lib/supabase/middleware.ts` — Auth middleware helper
- `src/middleware.ts` — Route protection + auth refresh (may already exist for 410s)

**Files to modify:**
- `src/app/page.tsx` — Convert from thin wrapper to server orchestrator
- `src/app/HomeContent.tsx` — Break into 8-10 smaller components
- `src/components/Providers.tsx` — Move season detection to server, pass initial value

**Critical constraint:** The `SeasonalThemeContext` currently fetches season from Supabase on the client. Move initial season detection to server (read `season_override` + `season_settings` in page.tsx), pass as prop to `SeasonalThemeProvider`. This eliminates the flash-of-wrong-season.

### 2. Customer Portal Architecture

**New route group with middleware-protected layout:**

```
src/app/
  (portal)/                            → Route group (no URL prefix)
    portal/
      layout.tsx                       → Server Component, auth check
      page.tsx                         → Dashboard (upcoming services, invoices)
      services/page.tsx                → Service history
      invoices/page.tsx                → Payment history
      referrals/page.tsx               → Referral dashboard
      settings/page.tsx                → Profile, notifications
    login/page.tsx                     → Customer login (email magic link)
    signup/page.tsx                    → Customer signup (tied to lead/contact)
```

**Auth strategy:**

The `user_roles` table already has an `app_role` enum with `"admin" | "user"`. Use this:

1. Customers sign up via magic link (no password) — Supabase Auth sends email
2. On first login, create `user_roles` entry with `role: 'user'`
3. Link customer to their `contact_submissions` or `leads` record via email match
4. Middleware checks auth + role for `/portal/*` routes and `/admin/*` routes separately

**New Supabase tables needed:**

```sql
-- Customer profiles (extends auth.users)
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  address TEXT,
  city TEXT,
  zip TEXT,
  lot_size TEXT,                    -- small/medium/large/xlarge
  property_lat DOUBLE PRECISION,
  property_lng DOUBLE PRECISION,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service appointments (synced from Jobber eventually)
CREATE TABLE service_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id),
  service_id UUID REFERENCES services(id),
  scheduled_date DATE,
  status TEXT DEFAULT 'scheduled',  -- scheduled, completed, cancelled
  crew_notes TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices (synced from Jobber/Stripe)
CREATE TABLE customer_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id),
  amount_cents INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',    -- pending, paid, overdue
  due_date DATE,
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  jobber_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS policies:**
- `customer_profiles`: Users can read/update only their own profile
- `service_appointments`: Users can read only their own appointments
- `customer_invoices`: Users can read only their own invoices
- Admin role bypasses all RLS

### 3. Instant Quote Calculator

**Builds on existing QuoteFlow.tsx** — don't rewrite, enhance.

The existing `QuoteFlow.tsx` already has the multi-step wizard pattern (service -> property -> frequency -> pricing -> contact). The "instant" upgrade adds:

**New capabilities needed:**
1. Address autocomplete with geocoding (lot size estimation)
2. Real-time price calculation without form submission
3. Visual lot size display on map

**Architecture:**

```
src/app/instant-quote/
  page.tsx                            → Server Component with metadata
  InstantQuoteWizard.tsx              → Enhanced client component

src/app/api/geocode/
  route.ts                            → Proxy to geocoding API (hides API key)

src/app/api/lot-size/
  route.ts                            → Proxy to property data API
```

**Geocoding approach:** Use Google Places Autocomplete (you already have a Google Places API key per memory files) for address input. For lot size estimation, use the Regrid API (parcel data) or fall back to user self-selection (the existing LOT_SIZES array in QuoteFlow.tsx).

**Files to modify:**
- `src/components/QuoteFlow.tsx` — Add address autocomplete step, live price preview
- `src/hooks/usePricing.ts` — Add `calculateInstantPrice()` function that runs client-side

**Files to create:**
- `src/components/quote/AddressAutocomplete.tsx` — Google Places integration
- `src/components/quote/LotSizeMap.tsx` — Visual lot display (if map feature included)
- `src/app/api/geocode/route.ts` — Server-side geocoding proxy
- `src/components/quote/PricePreview.tsx` — Live updating price display

### 4. Interactive Service Area Map

**Recommendation: React Leaflet** (not MapLibre GL, not Mapbox)

Rationale:
- Service area map is simple (polygon overlays on Madison/Dane County, marker for office)
- No 3D, no vector tiles, no complex data visualization needed
- Leaflet is 1.4M downloads/month, mature, zero API key needed
- MapLibre/Mapbox are overkill for a service area display and add bundle size
- React Leaflet works with dynamic import (`next/dynamic`) to avoid SSR issues

**Architecture:**

```
src/app/service-areas/
  page.tsx                            → Server Component (metadata + location data fetch)
  ServiceAreasContent.tsx             → Client component with map

src/components/map/
  ServiceAreaMap.tsx                  → Dynamic import wrapper
  ServiceAreaMapInner.tsx             → Actual Leaflet map (client-only)
  LocationMarker.tsx                  → Reusable marker component
```

**Critical SSR constraint:** Leaflet accesses `window` on import. You MUST use `next/dynamic` with `ssr: false`:

```typescript
const ServiceAreaMap = dynamic(
  () => import('@/components/map/ServiceAreaMapInner'),
  { ssr: false, loading: () => <MapSkeleton /> }
);
```

**Data source:** The existing `locations` table in Supabase (referenced by `useLocations.ts` hook) likely has city/zip data. Add `lat`/`lng` columns if missing for marker placement. Service area polygons can be GeoJSON stored in a `service_area_boundaries` table or as static data in `src/lib/serviceAreaData.ts`.

### 5. Video Hero Optimization

**Vercel-specific constraints (HIGH confidence — verified with official Vercel docs):**

Vercel recommends:
1. Use Vercel Blob for video storage (not `/public` folder)
2. MP4 with H.264 for compatibility, WebM as progressive enhancement
3. For autoplay background videos: lazy load with Intersection Observer
4. Keep hero videos under 30 seconds, target 2-5MB compressed

**Architecture:**

```
src/components/hero/
  VideoHero.tsx                       → Client component
  VideoHeroFallback.tsx               → Static image fallback (for slow connections)
```

**Implementation pattern:**

```typescript
// VideoHero.tsx — lazy loading pattern
'use client';
import { useRef, useEffect, useState } from 'react';

export function VideoHero({ videoUrl, posterUrl, fallbackImageUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-screen">
      {isVisible ? (
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <img src={fallbackImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Overlay content */}
    </div>
  );
}
```

**Files to modify:**
- `src/components/WinterHero.tsx`, `SummerHero.tsx`, `FallHero.tsx` — Add video option alongside existing image heroes
- `src/contexts/SeasonalThemeContext.tsx` — Add `video_url` to `SeasonalSlide` interface

**Supabase change:**
- Add `video_url TEXT` column to `seasonal_slides` table

**Storage:** Upload videos to Vercel Blob via admin panel, store URL in `seasonal_slides.video_url`. Size target: 1080p, 15-20 seconds, H.264, under 5MB.

### 6. Content Hub (Blog Enhancement)

**Use existing Supabase blog system** — do NOT add MDX.

Rationale:
- `blog_posts` table already exists with title, content, slug, excerpt, image, SEO fields
- Blog dynamic route `[slug]/page.tsx` already does server-side Supabase fetch
- `api/cron/blog-generator` already auto-generates content
- Adding MDX introduces build-time dependency, file management, and conflicts with the existing DB-driven approach
- Enhancement path: add categories, tags, related posts, and richer content types

**Architecture for content hub expansion:**

```
src/app/blog/
  page.tsx                            → Existing (add filtering, pagination)
  [slug]/page.tsx                     → Existing (add related posts, TOC)
  category/[slug]/page.tsx            → Existing (enhance)

src/app/guides/                       → NEW: Long-form guides
  page.tsx                            → Guide listing
  [slug]/page.tsx                     → Individual guide

src/app/tips/                         → NEW: Quick seasonal tips
  page.tsx                            → Tips feed
```

**New Supabase tables:**

```sql
-- Blog categories (may already exist, check DB)
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog tags for cross-referencing
CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Content type expansion
ALTER TABLE blog_posts ADD COLUMN content_type TEXT DEFAULT 'post';
-- 'post' | 'guide' | 'tip' | 'case-study'
ALTER TABLE blog_posts ADD COLUMN reading_time_minutes INTEGER;
ALTER TABLE blog_posts ADD COLUMN table_of_contents JSONB;
```

### 7. Referral Engine

**New feature — requires new tables and routes.**

```
src/app/(portal)/portal/referrals/
  page.tsx                            → Referral dashboard

src/app/api/referral/
  track/route.ts                      → Track referral link clicks
  submit/route.ts                     → Submit referred customer info

src/app/r/[code]/
  page.tsx                            → Public referral landing page (redirects with tracking)
```

**Supabase tables:**

```sql
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id),
  code TEXT UNIQUE NOT NULL,          -- e.g., 'SMITH2024'
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referral_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID REFERENCES referral_codes(id),
  referred_name TEXT NOT NULL,
  referred_email TEXT,
  referred_phone TEXT,
  referred_address TEXT,
  status TEXT DEFAULT 'pending',      -- pending, contacted, converted, expired
  reward_issued BOOLEAN DEFAULT false,
  reward_type TEXT,                   -- 'discount' | 'credit' | 'free_service'
  reward_amount_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Referral flow:**
1. Customer gets unique link: `tgyardcare.com/r/SMITH2024`
2. Link click tracked, redirects to `/get-quote?ref=SMITH2024`
3. When referred person submits contact form, `referral_source` field captures the code
4. Admin marks referral as converted in dashboard
5. System issues reward (discount code or service credit)

### 8. Annual Plan Configurator

**Enhances existing FullSeasonContract component.**

```
src/app/annual-plan/
  page.tsx                            → Dedicated annual plan page
  AnnualPlanConfigurator.tsx           → Interactive configurator (client)

src/components/annual-plan/
  SeasonColumn.tsx                    → Per-season service picker
  PriceSummary.tsx                    → Live price calculation
  BundleDiscount.tsx                  → Discount display
```

**Builds on existing data:**
- `pricing` table (tier-based pricing)
- `seasonal_priority_services` table (season-specific service recommendations)
- `usePricing.ts` hook (price calculation with seasonal modifiers)

No new Supabase tables needed — uses existing pricing + services data.

## Component Dependency Graph

```
                    Server Components Conversion
                              |
                    ┌─────────┴─────────┐
                    v                   v
            Supabase Server       Auth Middleware
            Client (new)           (new)
                    |                   |
                    v                   v
              Customer Portal ←── Auth for customers
                    |
         ┌─────────┼──────────┐
         v         v          v
    Referral    Service    Invoice
    Engine      History    Viewing
         |
         v
    Quote Calculator ←── Geocoding API route
         |
         v
    Interactive Map ←── Location data from Supabase

    (Independent)
    Video Hero ←── Vercel Blob storage
    Content Hub ←── Existing blog_posts table
    Annual Plan ←── Existing pricing tables
```

## Suggested Build Order (Dependencies)

### Phase 1: Foundation (must be first)
1. **Server-side Supabase client** (`src/lib/supabase/server.ts`)
2. **Auth middleware** (`src/middleware.ts`)
3. **HomeContent.tsx decomposition** into server + client islands

**Rationale:** Everything else depends on having server-side data fetching and proper auth. The HomeContent decomposition is the largest refactor and establishes the pattern for all new pages.

### Phase 2: Revenue Features (highest business value)
4. **Instant quote calculator** (enhanced QuoteFlow with geocoding)
5. **Annual plan configurator** (builds on existing pricing)
6. **Video hero** (visual impact, independent of other features)

**Rationale:** These directly drive conversions and revenue. Quote calculator builds on existing QuoteFlow.tsx. Annual plan builds on existing FullSeasonContract and pricing data.

### Phase 3: Customer Retention
7. **Customer portal** (auth for regular users, dashboard)
8. **Referral engine** (requires portal for referrer dashboard)

**Rationale:** Portal requires auth middleware from Phase 1. Referral engine requires portal for the referrer dashboard, making it dependent on portal.

### Phase 4: Content + Discovery
9. **Content hub** (blog categories, guides, tips)
10. **Interactive map** (service area visualization)

**Rationale:** These are SEO and discovery features. Less urgent than revenue and retention features. Can be built independently.

## Files Summary: New vs Modified

### New Files (create from scratch)

| File | Purpose |
|------|---------|
| `src/lib/supabase/server.ts` | Server-side Supabase client with cookies |
| `src/lib/supabase/middleware.ts` | Auth middleware helper |
| `src/middleware.ts` | Route protection (or enhance existing) |
| `src/app/(portal)/portal/layout.tsx` | Portal auth layout |
| `src/app/(portal)/portal/page.tsx` | Customer dashboard |
| `src/app/(portal)/portal/referrals/page.tsx` | Referral dashboard |
| `src/app/(portal)/login/page.tsx` | Customer login |
| `src/app/instant-quote/page.tsx` | Instant quote page |
| `src/app/annual-plan/page.tsx` | Annual plan configurator |
| `src/app/r/[code]/page.tsx` | Referral redirect |
| `src/app/api/geocode/route.ts` | Geocoding proxy |
| `src/app/api/referral/track/route.ts` | Referral tracking |
| `src/components/map/ServiceAreaMap.tsx` | Map wrapper |
| `src/components/map/ServiceAreaMapInner.tsx` | Leaflet map |
| `src/components/hero/VideoHero.tsx` | Video hero component |
| `src/components/quote/AddressAutocomplete.tsx` | Google Places input |
| `src/components/quote/PricePreview.tsx` | Live price display |
| `src/components/annual-plan/SeasonColumn.tsx` | Season service picker |
| `src/components/annual-plan/PriceSummary.tsx` | Price calculation display |

### Modified Files (enhance existing)

| File | Change |
|------|--------|
| `src/app/page.tsx` | Convert to server orchestrator (fetch data, pass to children) |
| `src/app/HomeContent.tsx` | Break into 8-10 smaller components |
| `src/components/Providers.tsx` | Accept initial season prop from server |
| `src/contexts/SeasonalThemeContext.tsx` | Accept server-provided initial season |
| `src/components/QuoteFlow.tsx` | Add address step, live pricing |
| `src/components/FullSeasonContract.tsx` | Link to annual plan configurator |
| `src/hooks/usePricing.ts` | Add `calculateInstantPrice()` |
| `src/app/blog/page.tsx` | Add category filtering, pagination |
| `src/app/blog/[slug]/page.tsx` | Add related posts, TOC |
| `src/app/service-areas/page.tsx` | Add interactive map |
| `src/integrations/supabase/types.ts` | Regenerate after schema changes |
| `next.config.ts` | Remove `ignoreBuildErrors` (aspirational, Phase 1) |

### New Supabase Tables

| Table | Feature | Priority |
|-------|---------|----------|
| `customer_profiles` | Customer portal | Phase 3 |
| `service_appointments` | Customer portal | Phase 3 |
| `customer_invoices` | Customer portal | Phase 3 |
| `referral_codes` | Referral engine | Phase 3 |
| `referral_submissions` | Referral engine | Phase 3 |
| `blog_categories` | Content hub | Phase 4 |
| `blog_tags` | Content hub | Phase 4 |
| `blog_post_tags` | Content hub | Phase 4 |

### Supabase Column Additions

| Table | Column | Feature |
|-------|--------|---------|
| `seasonal_slides` | `video_url TEXT` | Video hero |
| `blog_posts` | `content_type TEXT` | Content hub |
| `blog_posts` | `reading_time_minutes INT` | Content hub |
| `blog_posts` | `table_of_contents JSONB` | Content hub |
| `locations` | `lat DOUBLE PRECISION` | Interactive map |
| `locations` | `lng DOUBLE PRECISION` | Interactive map |

## Anti-Patterns to Avoid

### 1. Full Client-Side Rewrite Syndrome
**What:** Attempting to convert every component to server component at once
**Why bad:** Breaks everything, massive PR, untestable
**Instead:** Progressive island extraction. One section at a time from HomeContent.tsx.

### 2. Duplicate Supabase Clients
**What:** Creating ad-hoc `createClient()` calls in every server component (like blog/[slug]/page.tsx currently does)
**Why bad:** No session sharing, no cookie handling, inconsistent auth
**Instead:** Single `createServerClient()` factory in `src/lib/supabase/server.ts`

### 3. Customer Portal as SPA
**What:** Building portal as a client-side SPA with client routing
**Why bad:** Loses SSR benefits, poor SEO (less relevant for portal), but more critically adds unnecessary complexity
**Instead:** Use App Router file-based routing with server components for data fetching, client components only for interactive elements

### 4. Over-Engineering the Map
**What:** Using Mapbox GL / MapLibre with vector tiles for a simple service area display
**Why bad:** 200KB+ bundle addition, API key management, overkill for polygon + markers
**Instead:** React Leaflet with OpenStreetMap tiles. Free, lightweight, sufficient.

### 5. Video in /public Folder
**What:** Storing hero videos as static assets in the public folder
**Why bad:** Deployed to every Vercel edge node, inflates deployment size, no CDN optimization
**Instead:** Vercel Blob or external CDN (Cloudflare R2). Reference by URL.

## Sources

- Direct codebase analysis (HIGH confidence — read every referenced file)
- [Vercel: Best Practices for Hosting Videos](https://vercel.com/guides/best-practices-for-hosting-videos-on-vercel-nextjs-mp4-gif) (HIGH)
- [Next.js: Video Guide](https://nextjs.org/docs/app/guides/videos) (HIGH)
- [Geoapify: Map Libraries Comparison](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/) (MEDIUM)
- [MapLibre GL vs Leaflet](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/) (MEDIUM)
