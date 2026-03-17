# Phase 6: Brand Transformation & Visual Impact - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Visitors land on a homepage with cinematic hero, can browse before/after transformation photos with interactive sliders, and experience a server-rendered page that loads fast and ranks well in Google. This phase converts the homepage from a fully client-rendered SPA into a server-rendered experience with client islands.

**Critical constraint:** No hero video exists yet. Phase must work without video content.

</domain>

<decisions>
## Implementation Decisions

### Hero experience (no video available)
- Skip video hero entirely — use a high-impact static hero with parallax/motion effects instead
- Hero should feature a large, optimized background image of a TotalGuard lawn transformation
- Add cinematic feel through CSS animations: subtle parallax scroll, gradient overlays, text reveal animations
- If/when video becomes available later, the hero component should be structured so a video can be swapped in (poster image slot = current static image)
- Mobile: same optimized static image, smaller resolution via next/image srcSet

### Before/after gallery
- Dedicated /gallery or /transformations page
- Draggable comparison slider (horizontal drag to reveal before vs after)
- Organize by service type: Mowing, Leaf Cleanup, Snow Removal, Hardscaping, Gutter Cleaning
- Each pair labeled with Madison neighborhood/city name for local SEO value
- Start with placeholder pairs if real photos aren't available — structure the component for easy photo swaps
- Lightbox for fullscreen viewing on click
- Grid layout: 2 columns desktop, 1 column mobile

### Server Component conversion strategy
- Homepage becomes a Server Component (no 'use client' at top level)
- Break HomeContent.tsx into server-rendered sections with client islands:
  - Server: hero, stats strip, services grid, reviews section, CTA sections, footer
  - Client islands: seasonal carousel (needs state), chatbot widget, promo banner countdown
- SeasonalThemeProvider stays as client context but wraps only the components that need it
- All JSON-LD schema output must be preserved identically (16 components)
- Use Suspense boundaries around client islands for progressive loading

### Visual polish
- Keep existing dark theme (#0a0a0f background) — don't change the palette
- Clash Display + General Sans already installed (Phase 5) — now apply them visually across all homepage sections
- Animation intensity: moderate — smooth reveals on scroll, subtle hover effects, nothing flashy or distracting
- Target feel: clean, professional lawn care company that looks like it was designed by a premium agency
- NOT trying to look like a tech startup — should feel trustworthy, established, local
- Lighthouse targets: 90+ desktop, 75+ mobile (per requirements)

### Claude's Discretion
- Exact section ordering on homepage
- Specific animation timings and easing curves
- How to handle the seasonal carousel in server component context (Suspense vs dynamic import)
- Gallery slider library choice (or custom implementation)
- Image optimization strategy (WebP, AVIF, sizes)
- How to structure the before/after photo data (Supabase table vs static JSON)
- Loading skeleton designs for client islands

</decisions>

<specifics>
## Specific Ideas

- No hero video exists — entire hero strategy must be static-image-based with motion effects
- The site already has a working dark theme with seasonal theming — preserve and polish, don't redesign
- Real before/after photos may not be available immediately — build the gallery infrastructure first, photos can be added incrementally
- User trusts Claude's design judgment — no specific visual references provided

</specifics>

<deferred>
## Deferred Ideas

- Hero video production/sourcing — requires real video content creation (separate from code)
- Video hosting/CDN setup — only needed when video exists
- Before/after photo sourcing — business operational task, not code

</deferred>

---

*Phase: 06-brand-transformation*
*Context gathered: 2026-03-16*
