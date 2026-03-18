# Smart Breadcrumb System — Design Doc
**Date:** 2026-03-18
**Status:** Approved, ready for implementation

---

## Problem

Breadcrumbs only exist on the 96 dynamic city-service pages (`[cityService]`). Every other page — services, commercial, blog, locations, about, etc. — has no navigation trail. Visitors can't orient themselves or click back up the hierarchy. This hurts conversion and UX.

## Goal

A single `SmartBreadcrumb` component, added once to the root layout, that automatically generates the correct breadcrumb trail on every page from the URL alone. No per-page work required.

---

## Architecture

### Component: `SmartBreadcrumb`
- Location: `src/components/SmartBreadcrumb.tsx`
- Type: `'use client'` (needs `usePathname()`)
- Reads current pathname, splits into segments, maps each to a human-readable label
- Generates array of `{ label, href }` items and renders the breadcrumb strip + JSON-LD schema
- Returns `null` on excluded paths

### Config: `src/lib/breadcrumbConfig.ts`
Central slug→label map covering every static route segment:
```ts
export const BREADCRUMB_LABELS: Record<string, string> = {
  'services': 'Services',
  'mowing': 'Lawn Mowing',
  'fertilization': 'Fertilization & Weed Control',
  'spring-cleanup': 'Spring Cleanup',
  'fall-cleanup': 'Fall Cleanup',
  'leaf-removal': 'Leaf Removal',
  'gutter-cleaning': 'Gutter Cleaning',
  'gutter-guards': 'Gutter Guards',
  'snow-removal': 'Snow Removal',
  'aeration': 'Aeration',
  'hardscaping': 'Hardscaping',
  'herbicide': 'Herbicide Treatment',
  'weeding': 'Weeding',
  'mulching': 'Mulching',
  'garden-beds': 'Garden Beds',
  'pruning': 'Bush Trimming & Pruning',
  'commercial': 'Commercial',
  'lawn-care': 'Lawn Care',
  'property-enhancement': 'Property Enhancement',
  'seasonal': 'Seasonal Services',
  'residential': 'Residential Services',
  'locations': 'Service Areas',
  'service-areas': 'Service Areas',
  'blog': 'Blog',
  'category': 'Category',
  'about': 'About',
  'team': 'Our Team',
  'reviews': 'Reviews',
  'gallery': 'Gallery',
  'faq': 'FAQ',
  'contact': 'Contact',
  'careers': 'Careers',
  'get-quote': 'Get a Quote',
  'annual-plan': 'Annual Plan',
  'lawn-care-guide': 'Lawn Care Guide',
  'lawn-care-costs-dane-county': 'Lawn Care Costs',
  'seasonal-lawn-calendar-madison': 'Seasonal Calendar',
  // Cities
  'madison': 'Madison',
  'middleton': 'Middleton',
  'waunakee': 'Waunakee',
  'sun-prairie': 'Sun Prairie',
  'monona': 'Monona',
  'fitchburg': 'Fitchburg',
  'verona': 'Verona',
  'mcfarland': 'McFarland',
  'deforest': 'DeForest',
  'cottage-grove': 'Cottage Grove',
  'oregon': 'Oregon',
  'stoughton': 'Stoughton',
}
```

### Dynamic Route Resolution

**`/[cityService]`** (e.g. `fall-cleanup-oregon-wi`):
- Strip `-wi` suffix
- Match against `cityServiceConfig` to find city slug + service slug
- Build trail: Home › Service Areas › [City] › [Service]
- This REPLACES the existing inline breadcrumb on these pages

**`/blog/[slug]`**:
- Title-case the slug (replace hyphens with spaces, capitalize each word)
- Truncate display at 45 chars with ellipsis
- Trail: Home › Blog › [Post Title]

**`/blog/category/[slug]`**:
- Title-case category slug
- Trail: Home › Blog › [Category]

**`/locations/[city]`**:
- Look up city display name from BREADCRUMB_LABELS
- Trail: Home › Service Areas › [City]

### Layout Integration

```tsx
// src/app/layout.tsx
import SmartBreadcrumb from '@/components/SmartBreadcrumb'

// Between <Navigation /> and {children}:
<Navigation showPromoBanner />
<SmartBreadcrumb />
{children}
```

SmartBreadcrumb renders in normal document flow — heroes keep existing `pt-24 md:pt-28` padding. No layout shifts.

---

## Visual Design

### The Strip
```
Home  ›  Services  ›  Lawn Mowing
```
- Background: `#052e16` (green-950) — seamlessly extends hero
- Height: `py-3` — thin, editorial, unobtrusive
- Container: `container mx-auto px-4 sm:px-6`
- Bottom edge: `border-b border-white/[0.04]` — hairline separator
- Fade-in on mount: subtle `opacity-0 → opacity-100` over 200ms

### Typography
- Links: `text-xs text-white/40 hover:text-white/70 transition-colors duration-150`
- Separators `›`: `text-white/20 mx-1.5`
- Current page (last item, no link): `text-xs text-white/70`

### JSON-LD Schema
SmartBreadcrumb also outputs `<script type="application/ld+json">` BreadcrumbList schema for every page — SEO win.

---

## "Serving X, WI" Badge

**No changes to `[cityService]` pages** — badge already exists there, SmartBreadcrumb just replaces the inline breadcrumb above it.

**Add to 12 `/locations/[city]` content files:**
- Same pill style: `bg-emerald-500/[0.08] border border-emerald-500/20 text-[#a7f3d0]`
- Uses location pin emoji: `📍 Serving [City], WI`
- Positioned directly below SmartBreadcrumb, above the H1 (same position as city-service pages)

---

## Pages Hidden

SmartBreadcrumb returns `null` for:
- `/` (homepage)
- `/admin` and all `/admin/*`
- `/portal` and all `/portal/*`
- `/r/*` (referral links)
- `/privacy`, `/terms`, `/botfeedback`

---

## What Gets Removed

- Inline breadcrumb code in `src/app/[cityService]/page.tsx` — replaced by SmartBreadcrumb
- Any duplicate breadcrumb renders on location pages

---

## File Changelist

| File | Action |
|------|--------|
| `src/lib/breadcrumbConfig.ts` | **CREATE** — slug→label map + cityService resolver |
| `src/components/SmartBreadcrumb.tsx` | **CREATE** — smart URL-parsing breadcrumb component |
| `src/app/layout.tsx` | **MODIFY** — add `<SmartBreadcrumb />` between nav and children |
| `src/app/[cityService]/page.tsx` | **MODIFY** — remove inline breadcrumb (SmartBreadcrumb takes over) |
| `src/app/locations/*/[city]Content.tsx` (×12) | **MODIFY** — add "Serving X, WI" badge below hero heading |

---

## Success Criteria

- [ ] Breadcrumb appears on every non-excluded page with correct trail
- [ ] Dynamic city-service pages show correct city + service in trail
- [ ] Blog post pages show readable post title
- [ ] Location pages show "Serving X, WI" badge
- [ ] JSON-LD BreadcrumbList schema present on every page
- [ ] No layout shifts — existing hero spacing unchanged
- [ ] Hidden correctly on homepage, admin, portal, utility pages
- [ ] Visually seamless with green-950 hero backgrounds
