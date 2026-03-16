# Technology Stack: TotalGuard Brand Transformation

**Project:** TotalGuard Yard Care website brand upgrade
**Researched:** 2026-03-15
**Mode:** Stack additions for new features on existing Next.js 16 site

## Existing Stack (Validated, Not Changing)

| Technology | Version | Role |
|------------|---------|------|
| Next.js | 16.1.6 | Framework |
| React | 19.2.3 | UI library |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | (Radix primitives) | Component library |
| Framer Motion | 12.34.3 | Animation |
| Supabase JS | 2.98.0 | Backend (DB, Auth, Edge Functions) |
| TanStack React Query | 5.90.21 | Data fetching |
| Recharts | 2.15.4 | Charts (dashboard) |
| Zod | 4.3.6 | Validation |
| React Hook Form | 7.71.2 | Forms |
| Vercel | - | Hosting |
| n8n Cloud | - | Automation |

---

## New Stack Additions

### 1. Premium Typography

**What:** Replace Inter with premium display + body font pairing.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next/font/local` (built-in) | - | Load custom variable fonts | Already in Next.js. Zero additional dependencies. Fonts self-hosted, no external requests, no layout shift. |

**Fonts to acquire (free, variable format):**

| Font | Role | Source | License |
|------|------|--------|---------|
| Clash Display (variable) | Headlines, hero text | fontshare.com | Free for commercial use |
| General Sans (variable) | Body text | fontshare.com | Free for commercial use |
| JetBrains Mono | Code/data display | Google Fonts or download | Free, OFL |

**No new npm packages needed.** Download .woff2 variable font files, place in `src/fonts/`, use `localFont()` from `next/font/local`. Define CSS variables `--font-display` and `--font-body`, wire into Tailwind config.

**Confidence:** HIGH - `next/font/local` is the official, documented approach. Fontshare fonts are free for commercial use with no attribution required.

---

### 2. Hero Video Background

**What:** Autoplay muted looping video behind hero sections.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Native HTML5 `<video>` | - | Video playback | No library needed for background video. Autoplay + muted + loop + playsInline is all you need. |

**Recommendation: Do NOT use next-video or Mux.** For a simple background video (no controls, no streaming, no user-uploaded content), the native `<video>` element is sufficient. next-video adds Mux dependency and complexity for a use case that doesn't need adaptive streaming.

**Video optimization approach:**
- Compress source video with HandBrake or FFmpeg to H.264/MP4, target 2-4MB for 15-30s loop
- Strip audio track (`-an` flag in FFmpeg) to reduce file size
- Provide WebM fallback for better compression in Chrome/Firefox
- Store on Vercel Blob or serve from `/public` (under 4.5MB Vercel limit for static assets)
- Use `poster` attribute with a JPEG frame for instant visual while video loads
- Lazy load via Intersection Observer for below-fold video sections

**No new npm packages needed.**

**Confidence:** HIGH - Native video element is the standard approach for background videos. Every major brand site uses this pattern.

---

### 3. Server Components Conversion

**What:** Convert `'use client'` homepage and pages to Server Components where possible.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React 19 (already installed) | 19.2.3 | RSC, Suspense, streaming | Built-in. No new packages. |

**Approach:** Extract interactive islands (`'use client'`) from pages that are currently fully client-rendered. Keep data fetching, layout, and static content as Server Components. Use `<Suspense>` boundaries with skeleton fallbacks for streaming.

**No new npm packages needed.** This is a refactoring effort using existing React 19 and Next.js 16 capabilities.

**Confidence:** HIGH - RSC is the default in Next.js App Router. Well-documented pattern.

---

### 4. Instant Quote Calculator

**What:** Address lookup, lot size estimation, dynamic pricing UI.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Google Places Autocomplete (New) | - | Address search | Already have Google Places API key for reviews. Reuse it. New Places API has session-based pricing. First $200/mo free via Google Maps Platform credit. |
| Wisconsin Statewide Parcel REST API | - | Lot size lookup | FREE. State-provided ArcGIS REST endpoint covering all WI parcels including Dane County. No API key needed. Returns parcel boundaries + acreage. |

**Address-to-lot-size flow:**
1. User types address -> Google Places Autocomplete returns structured address + coordinates
2. Coordinates sent to WI Statewide Parcel REST endpoint -> returns parcel polygon + lot size
3. If parcel lookup fails -> fallback to manual lot size entry (dropdown: Small/Medium/Large)
4. Lot size + selected services -> calculate price using existing Zod schemas + React Hook Form

**Google Places integration:** Use the Maps JavaScript API `PlaceAutocompleteElement` (the new web component) directly -- no npm package needed. Restrict to Madison WI area to minimize API calls.

**Pricing for Google Places:** The new Autocomplete (Session) API costs $0.017/session. At 500 quotes/month = $8.50/month, well within the $200 free credit.

**WI Parcel API endpoint:** `https://mapservices.legis.wisconsin.gov/arcgis/rest/services/WLIP/` -- free, no key, returns GeoJSON.

| New Package | Version | Purpose | Why |
|-------------|---------|---------|-----|
| None | - | - | Google Places loads via script tag. WI Parcel API is a simple fetch call. Existing React Hook Form + Zod handle the form. |

**Confidence:** MEDIUM - Google Places API key reuse needs verification. WI Parcel REST API availability confirmed via official state website but exact endpoint for lot size queries needs testing.

---

### 5. Before/After Image Gallery

**What:** Comparison sliders for lawn transformations + lightbox for full gallery.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-compare-slider` | ^3.1.0 | Before/after comparison slider | Zero dependencies. Supports images, video, any React component. Responsive. 4KB gzipped. Most actively maintained option. |
| `yet-another-react-lightbox` | ^3.29.1 | Fullscreen lightbox gallery | Actively maintained (updated 22 days ago). Plugin architecture (zoom, thumbnails, video). ~14KB core. Best React 18/19 compatibility. |

**Alternatives considered:**

| Library | Why Not |
|---------|---------|
| `img-comparison-slider` | Web component, not React-native. Extra wrapper needed. |
| `react-compare-image` | Simpler but fewer features, less maintained. |
| `simple-react-lightbox` | Deprecated. Do not use. |
| `react-image-lightbox` | Deprecated. Unmaintained since 2022. |
| `yet-another-react-lightbox-lite` | 5KB but missing zoom/thumbnail plugins needed for portfolio gallery. |

**Confidence:** HIGH - Both libraries are actively maintained, well-documented, and widely used.

---

### 6. Customer Dashboard Portal

**What:** Authenticated area with scheduling, invoices, photos, service history.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Auth (already installed) | 2.98.0 | Authentication | Already integrated. Use magic link or email/password. No new auth library needed. |
| Supabase Storage (already available) | - | Customer photos, invoice PDFs | Part of existing Supabase plan. Signed URLs for private access. |
| Recharts (already installed) | 2.15.4 | Dashboard charts/metrics | Already in dependencies. |
| React Hook Form + Zod (already installed) | - | Scheduling forms | Already in dependencies. |

**No new npm packages needed.** The customer dashboard is built entirely with existing stack:
- Supabase Auth for login/session management
- Supabase DB for service history, scheduling data
- Supabase Storage for photos/documents
- Recharts for any metrics visualization
- shadcn/ui for dashboard layout (tables, cards, tabs)
- TanStack React Query for data fetching/caching

**Confidence:** HIGH - All capabilities exist in current stack.

---

### 7. Interactive Service Area Map

**What:** Map showing service coverage area in Madison WI region.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-leaflet` | ^5.0.0 | React map components | Free, open-source. Uses OpenStreetMap tiles (free). No API key required for basic tiles. 618K weekly downloads. |
| `leaflet` | ^1.9.4 | Map rendering engine | Peer dependency of react-leaflet. Industry standard for open-source mapping. |

**Why Leaflet over alternatives:**

| Option | Why Not |
|--------|---------|
| Mapbox GL JS | Requires paid API key for production. Proprietary license since v2. Violates shortest-path rule. |
| MapLibre GL JS | More complex setup. Vector tiles need a tile server or paid provider. Overkill for a static service area polygon. |
| Google Maps | Paid API. Already using Google for Places -- adding Maps increases costs. |
| Embedded Google Map | No interactivity, no custom styling, no polygon overlay. |

**Implementation:** Render a Leaflet map with OpenStreetMap tiles. Draw a GeoJSON polygon for the service area. Add markers for office location. Use Leaflet's built-in zoom/pan. Style with Tailwind for the container.

**Note:** Leaflet requires `'use client'` -- it accesses `window`. Wrap in a dynamic import with `ssr: false`.

**Confidence:** HIGH - Leaflet + OpenStreetMap is the standard free mapping stack. Well-documented for Next.js.

---

### 8. Annual Plan Configurator

**What:** Interactive pricing builder where customers select services, frequency, and see total.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| None new | - | - | Built entirely with existing shadcn/ui components (Slider, Switch, Select, Card) + Framer Motion for animations + React Hook Form for state + Zod for validation. |

**This is a UI-intensive feature, not a library-intensive one.** The complexity is in the pricing logic and UX, not in missing capabilities.

**Confidence:** HIGH - Standard interactive form pattern.

---

### 9. Referral Engine

**What:** Shareable referral links, tracking, reward attribution.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `nanoid` | ^5.1.5 | Generate short referral codes | 130 bytes. URL-friendly. Cryptographically secure. Custom alphabet support for human-readable codes. |

**Architecture:** Referral codes stored in Supabase with `referrer_id`, `code`, `referred_email`, `status`, `reward_issued`. Edge Function validates and tracks referral conversions. n8n workflow triggers reward notifications.

**Why nanoid over alternatives:**

| Option | Why Not |
|--------|---------|
| `uuid` | Too long for referral codes (36 chars). Not user-friendly. |
| `crypto.randomUUID()` | Same problem -- too long. |
| Custom random string | Why reinvent? nanoid is 130 bytes and battle-tested. |
| `shortid` | Deprecated. Author recommends nanoid. |

**Confidence:** HIGH - nanoid is the standard for short unique IDs. Supabase handles the rest.

---

### 10. Content Hub (Blog/Guides)

**What:** MDX-powered blog with seasonal calendars, lawn care guides, SEO content.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@next/mdx` | ^16.1.6 | MDX compilation in Next.js | Official Next.js MDX integration. Matches Next.js 16.1.6 version. Works with App Router and RSC. |
| `@mdx-js/mdx` | ^3.1.0 | MDX compiler (peer dep) | Required by @next/mdx. |
| `@mdx-js/react` | ^3.1.0 | MDX React provider | Required for component mapping. |
| `rehype-pretty-code` | ^0.14.0 | Code syntax highlighting | For any code snippets in guides. Uses shiki under the hood. |
| `remark-gfm` | ^4.0.1 | GitHub Flavored Markdown | Tables, task lists, strikethrough in MDX. |
| `gray-matter` | ^4.0.3 | Frontmatter parsing | Extract title, date, description, tags from MDX files. Tiny (no deps). |

**Why @next/mdx over alternatives:**

| Option | Why Not |
|--------|---------|
| `next-mdx-remote` | Adds complexity for remote content. Content is local -- no CMS needed. |
| `contentlayer` | Abandoned/unmaintained. Do not use. |
| Headless CMS (Sanity, etc.) | Overkill. Adds cost and complexity. Local MDX files are version-controlled, free, and simple. |

**Blog structure:** `/src/content/blog/` for MDX files, `/src/app/blog/[slug]/page.tsx` for rendering, `mdx-components.tsx` for custom component mapping (styled with Tailwind Typography).

**Already have:** `@tailwindcss/typography` in devDependencies -- perfect for prose styling.

**Confidence:** HIGH - @next/mdx 16.1.6 is the official, current package. MDX is the standard for content-heavy Next.js sites.

---

## Complete New Dependencies Summary

### Production Dependencies

```bash
npm install react-leaflet@^5.0.0 leaflet@^1.9.4 react-compare-slider@^3.1.0 yet-another-react-lightbox@^3.29.1 nanoid@^5.1.5 @next/mdx@^16.1.6 @mdx-js/mdx@^3.1.0 @mdx-js/react@^3.1.0 remark-gfm@^4.0.1 gray-matter@^4.0.3
```

### Dev Dependencies

```bash
npm install -D @types/leaflet rehype-pretty-code@^0.14.0
```

### Font Files (Download, Not npm)

```
src/fonts/ClashDisplay-Variable.woff2    (from fontshare.com)
src/fonts/GeneralSans-Variable.woff2     (from fontshare.com)
```

### External APIs (No npm packages)

| API | Cost | Auth |
|-----|------|------|
| Google Places Autocomplete | Free tier ($200/mo credit) | Existing API key |
| WI Statewide Parcel REST API | Free | No key needed |
| OpenStreetMap tiles | Free | No key needed |

---

## What NOT to Add

| Technology | Why Not |
|------------|---------|
| `next-video` / Mux | Overkill for background video. Native `<video>` is sufficient. Mux adds cost. |
| Mapbox GL JS | Proprietary license, requires paid key. Leaflet + OSM is free. |
| Google Maps JS API | Paid per-load. Leaflet covers the use case for free. |
| `contentlayer` | Abandoned. Use @next/mdx instead. |
| Any headless CMS | Adds cost and complexity. Local MDX files are sufficient for a landscaping blog. |
| `shortid` | Deprecated. Use nanoid. |
| `simple-react-lightbox` | Deprecated. Use yet-another-react-lightbox. |
| Auth0 / Clerk / NextAuth | Supabase Auth is already integrated. Adding another auth provider creates confusion. |
| Prisma / Drizzle | Supabase client already handles all DB operations. No ORM needed. |
| `sharp` | Already bundled with Next.js for image optimization. Don't install separately. |
| Tailwind CSS v4 | Migration risk mid-project. Stay on 3.4 until features are shipped. |

---

## Integration Notes

### With Existing Tailwind Config
- Add `fontFamily` entries for Clash Display and General Sans
- `@tailwindcss/typography` already installed -- use `prose` classes for MDX content
- Leaflet needs a small CSS import (`leaflet/dist/leaflet.css`)

### With Existing Supabase
- Customer dashboard: new tables for `service_history`, `scheduled_services`, `customer_documents`
- Referral engine: new table `referrals` with code, referrer, referee, status, reward
- Supabase Storage buckets for customer photos and before/after images
- RLS policies for customer-only access to their data

### With Existing Framer Motion
- Animate quote calculator steps (multi-step form transitions)
- Animate plan configurator price updates (number morphing)
- Page transitions for dashboard views
- Scroll-triggered reveals for before/after gallery

### With Existing React Hook Form + Zod
- Quote calculator form validation
- Plan configurator form state
- Customer dashboard forms (scheduling, profile)

---

## Sources

- [Next.js Font Optimization Docs](https://nextjs.org/docs/app/getting-started/fonts) (HIGH confidence)
- [Next.js Video Guides](https://nextjs.org/docs/app/guides/videos) (HIGH confidence)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) (HIGH confidence)
- [@next/mdx npm](https://www.npmjs.com/package/@next/mdx) - v16.1.6 (HIGH confidence)
- [react-compare-slider npm](https://www.npmjs.com/package/react-compare-slider) - v3.1.0 (HIGH confidence)
- [yet-another-react-lightbox npm](https://www.npmjs.com/package/yet-another-react-lightbox) - v3.29.1 (HIGH confidence)
- [react-leaflet npm](https://www.npmjs.com/package/react-leaflet) - v5.0.0 (HIGH confidence)
- [nanoid GitHub](https://github.com/ai/nanoid) - v5.x (HIGH confidence)
- [Wisconsin Statewide Parcel Map](https://www.sco.wisc.edu/parcels/data/) (MEDIUM confidence - endpoint needs testing)
- [Google Places Autocomplete (New)](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete) (HIGH confidence)
- [Dane County Open Data / Access Dane](https://accessdane.danecounty.gov/) (MEDIUM confidence - fallback option)
- [Fontshare - Clash Display](https://www.fontshare.com/) (HIGH confidence - free commercial license)
- [Leaflet Documentation](https://leafletjs.com/) (HIGH confidence)
- [MapLibre GL JS](https://maplibre.org/) (HIGH confidence - evaluated but not recommended)
