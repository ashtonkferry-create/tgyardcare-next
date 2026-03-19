# Smart Breadcrumb System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add URL-derived breadcrumb navigation to every public page via a single SmartBreadcrumb component embedded in Navigation.tsx — zero per-page changes required.

**Architecture:** SmartBreadcrumb is a `'use client'` component that reads `usePathname()` and generates a breadcrumb trail from the URL. It renders inside Navigation.tsx's existing fixed-position wrapper, just below the nav bar. Navigation already has a spacer div (`h-16 md:h-18 lg:h-20`) that clears the fixed header — updating that spacer is the only layout change needed.

**Tech Stack:** Next.js 15 App Router, `usePathname()`, Tailwind CSS, existing `CITIES`/`SERVICES` from `src/data/cityServiceConfig.ts`

---

## Critical Context

- Navigation.tsx lines 760–958: `<div class="fixed left-0 right-0 z-50">` wraps the entire nav bar. SmartBreadcrumb goes INSIDE this div, after `</nav>` (line 957) and before `</div>` (line 958).
- Navigation.tsx lines 959–960: `<div class="h-16 md:h-18 lg:h-20" />` is the spacer that clears the fixed header. Update this to include breadcrumb height.
- `src/data/cityServiceConfig.ts` exports `CITIES` (array of `{slug, name, ...}`) and `SERVICES` (array of `{slug, name, ...}`) — use these for city-service path resolution.
- `[cityService]/page.tsx` lines 113–122: inline `<nav>` breadcrumb that SmartBreadcrumb replaces. Remove it.
- The 12 location content files at `src/app/locations/[city]/[City]Content.tsx` need the "Serving X, WI" badge added after the breadcrumb, above the H1.

---

## Task 1: Create breadcrumb config

**Files:**
- Create: `src/data/breadcrumbConfig.ts`

**Step 1: Create the file**

```ts
// src/data/breadcrumbConfig.ts
import { CITIES, SERVICES } from '@/data/cityServiceConfig';

// ── Slug → human label map ────────────────────────────────────────────────────
export const BREADCRUMB_LABELS: Record<string, string> = {
  // Route segments
  services: 'Services',
  commercial: 'Commercial',
  residential: 'Residential Services',
  locations: 'Service Areas',
  'service-areas': 'Service Areas',
  blog: 'Blog',
  category: 'Category',
  about: 'About',
  team: 'Our Team',
  reviews: 'Reviews',
  gallery: 'Gallery',
  faq: 'FAQ',
  contact: 'Contact',
  careers: 'Careers',
  'get-quote': 'Get a Quote',
  'annual-plan': 'Annual Plan',
  'lawn-care-guide': 'Lawn Care Guide',
  'lawn-care-costs-dane-county': 'Lawn Care Costs',
  'seasonal-lawn-calendar-madison': 'Seasonal Calendar',
  'lawn-care-madison-wi': 'Lawn Care in Madison',
  'lawn-care-middleton-wi': 'Lawn Care in Middleton',
  'gutter-cleaning-madison-wi': 'Gutter Cleaning in Madison',
  'snow-removal-madison-wi': 'Snow Removal in Madison',
  // Service slugs
  mowing: 'Lawn Mowing',
  fertilization: 'Fertilization & Weed Control',
  'fertilization-weed-control': 'Fertilization & Weed Control',
  herbicide: 'Herbicide Treatment',
  weeding: 'Weeding',
  mulching: 'Mulching',
  'garden-beds': 'Garden Beds',
  pruning: 'Bush Trimming & Pruning',
  'spring-cleanup': 'Spring Cleanup',
  'fall-cleanup': 'Fall Cleanup',
  'leaf-removal': 'Leaf Removal',
  aeration: 'Aeration',
  'gutter-cleaning': 'Gutter Cleaning',
  'gutter-guards': 'Gutter Guards',
  'snow-removal': 'Snow Removal',
  hardscaping: 'Hardscaping',
  // Commercial sub-routes
  'lawn-care': 'Lawn Care',
  'property-enhancement': 'Property Enhancement',
  seasonal: 'Seasonal Services',
  gutters: 'Gutter Services',
  // City slugs
  madison: 'Madison',
  middleton: 'Middleton',
  waunakee: 'Waunakee',
  'sun-prairie': 'Sun Prairie',
  monona: 'Monona',
  fitchburg: 'Fitchburg',
  verona: 'Verona',
  mcfarland: 'McFarland',
  deforest: 'DeForest',
  'cottage-grove': 'Cottage Grove',
  oregon: 'Oregon',
  stoughton: 'Stoughton',
};

// ── City-service slug resolver ────────────────────────────────────────────────
// Handles slugs like "fall-cleanup-oregon-wi" or "lawn-mowing-madison-wi"
export interface ResolvedCityService {
  citySlug: string;
  cityName: string;
  serviceSlug: string;
  serviceName: string;
}

export function resolveCityService(slug: string): ResolvedCityService | null {
  // Must end in -wi
  if (!slug.endsWith('-wi')) return null;
  const withoutWi = slug.slice(0, -3); // remove "-wi"

  // Try every city slug to find a match
  for (const city of CITIES) {
    if (withoutWi.endsWith(`-${city.slug}`)) {
      const serviceSlug = withoutWi.slice(0, -(city.slug.length + 1));
      const service = SERVICES.find(s => s.slug === serviceSlug);
      if (service) {
        return {
          citySlug: city.slug,
          cityName: city.name,
          serviceSlug: service.slug,
          serviceName: service.name,
        };
      }
    }
  }
  return null;
}

// ── Title case fallback for unknown slugs ────────────────────────────────────
export function titleCase(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .slice(0, 48);
}
```

**Step 2: Commit**

```bash
git add src/data/breadcrumbConfig.ts
git commit -m "feat(breadcrumb): add breadcrumb config + city-service resolver"
```

---

## Task 2: Create SmartBreadcrumb component

**Files:**
- Create: `src/components/SmartBreadcrumb.tsx`

**Step 1: Create the component**

```tsx
// src/components/SmartBreadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BREADCRUMB_LABELS, resolveCityService, titleCase } from '@/data/breadcrumbConfig';

interface CrumbItem {
  label: string;
  href?: string;
}

// Paths where breadcrumb should NOT render
const HIDDEN_EXACT = new Set(['/', '/privacy', '/terms', '/botfeedback']);
const HIDDEN_PREFIXES = ['/admin', '/portal', '/r/'];

function buildTrail(pathname: string): CrumbItem[] {
  const items: CrumbItem[] = [{ label: 'Home', href: '/' }];

  // Strip leading slash, get raw slug
  const rawSlug = pathname.replace(/^\//, '');

  // ── City-service dynamic route (e.g. "fall-cleanup-oregon-wi") ──
  const resolved = resolveCityService(rawSlug);
  if (resolved) {
    items.push({ label: 'Service Areas', href: '/service-areas' });
    items.push({ label: resolved.cityName, href: `/locations/${resolved.citySlug}` });
    items.push({ label: resolved.serviceName }); // current page — no href
    return items;
  }

  // ── All other routes: split by "/" ──
  const segments = pathname.split('/').filter(Boolean);
  let builtPath = '';

  segments.forEach((seg, i) => {
    builtPath += `/${seg}`;
    const isLast = i === segments.length - 1;
    const label = BREADCRUMB_LABELS[seg] ?? titleCase(seg);
    items.push({
      label,
      href: isLast ? undefined : builtPath,
    });
  });

  return items;
}

export function SmartBreadcrumb() {
  const pathname = usePathname();

  // Hide on excluded paths
  if (HIDDEN_EXACT.has(pathname)) return null;
  if (HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) return null;

  const trail = buildTrail(pathname);

  // Only show if there's more than just "Home"
  if (trail.length <= 1) return null;

  return (
    <div className="bg-[#052e16] border-b border-white/[0.04]">
      <div className="container mx-auto px-4 sm:px-6 py-2.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-y-0.5 text-xs"
        >
          {trail.map((item, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && (
                <span className="mx-1.5 text-white/20 select-none">›</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-white/40 hover:text-white/70 transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/70">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/SmartBreadcrumb.tsx
git commit -m "feat(breadcrumb): add SmartBreadcrumb component with URL-derived trail"
```

---

## Task 3: Wire SmartBreadcrumb into Navigation

Navigation.tsx already has a fixed wrapper and a spacer. The breadcrumb goes inside the fixed wrapper; the spacer gets a height increase.

**Files:**
- Modify: `src/components/Navigation.tsx`

**Step 1: Add import at top of file**

Find the existing import block at the top of Navigation.tsx and add:

```tsx
import { SmartBreadcrumb } from '@/components/SmartBreadcrumb';
```

**Step 2: Insert SmartBreadcrumb inside the fixed wrapper**

Find this block (around line 957–960):
```tsx
    </nav>
    </div>
    {/* Spacer to offset fixed header */}
    <div className="h-16 md:h-18 lg:h-20" />
```

Replace with:
```tsx
    </nav>
    <SmartBreadcrumb />
    </div>
    {/* Spacer to offset fixed header (nav bar + breadcrumb strip ~36px) */}
    <div className="h-[100px] md:h-[108px] lg:h-[116px]" />
```

**Explanation of spacer math:**
- Mobile: nav `h-16` (64px) + breadcrumb ~36px = 100px
- md: nav `h-18` (72px) + breadcrumb ~36px = 108px
- lg: nav `h-20` (80px) + breadcrumb ~36px = 116px

**Step 3: Verify in browser**

Start the dev server and visit `/services/mowing`. You should see:
- Nav bar at top
- Thin breadcrumb strip directly below: `Home › Services › Lawn Mowing`
- No overlap with hero content
- No layout shift

**Step 4: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(breadcrumb): embed SmartBreadcrumb in Navigation fixed header"
```

---

## Task 4: Remove inline breadcrumb from [cityService] page

The dynamic city-service page has its own inline breadcrumb (lines 113–122) that SmartBreadcrumb now replaces.

**Files:**
- Modify: `src/app/[cityService]/page.tsx`

**Step 1: Remove the inline breadcrumb nav**

Find and delete this block entirely (lines ~113–122):
```tsx
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/service-areas" className="hover:text-white transition-colors">Service Areas</Link>
            <span>&rsaquo;</span>
            <Link href={`/locations/${city.slug}`} className="hover:text-white transition-colors">{city.name}</Link>
            <span>&rsaquo;</span>
            <span className="text-white">{service.name}</span>
          </nav>
```

Also remove the `BreadcrumbSchema` import if it's only used for the visual breadcrumb (check — it may still be needed for JSON-LD). If `BreadcrumbSchema` is imported but the SmartBreadcrumb now handles schema too, remove the import. If it's used elsewhere in the file, keep it.

**Step 2: Verify**

Visit a city-service page e.g. `/fall-cleanup-oregon-wi`. Should see:
- SmartBreadcrumb in nav area: `Home › Service Areas › Oregon › Fall Cleanup`
- "🌱 Serving Oregon, WI" badge still present (unchanged)
- H1 and rest of page unchanged

**Step 3: Commit**

```bash
git add "src/app/[cityService]/page.tsx"
git commit -m "fix(breadcrumb): remove inline breadcrumb from cityService page (SmartBreadcrumb takes over)"
```

---

## Task 5: Add "Serving X, WI" badge to 12 location pages

Each location content file (`MadisonContent.tsx`, `WaunakeeContent.tsx`, etc.) needs the badge added between the hero heading group and the H1. Use the same pill style as city-service pages.

**Files to modify (all 12):**
```
src/app/locations/madison/MadisonContent.tsx
src/app/locations/middleton/MiddletonContent.tsx
src/app/locations/waunakee/WaunakeeContent.tsx
src/app/locations/sun-prairie/SunPrairieContent.tsx
src/app/locations/monona/MononaContent.tsx
src/app/locations/fitchburg/FitchburgContent.tsx
src/app/locations/verona/VeronaContent.tsx
src/app/locations/mcfarland/McFarlandContent.tsx
src/app/locations/deforest/DeForestContent.tsx
src/app/locations/cottage-grove/CottageGroveContent.tsx
src/app/locations/oregon/OregonContent.tsx
src/app/locations/stoughton/StoughtonContent.tsx
```

**Step 1: Find the hero heading area in each file**

Look for the `<MapPin>` badge (the existing "City, Wisconsin" pill) in each file. The "Serving X, WI" badge goes DIRECTLY BELOW it, before the H1.

Current pattern (in every location file):
```tsx
<div className="inline-flex items-center bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
  <MapPin className="h-4 w-4 mr-2" />
  [City], Wisconsin
</div>
<h1 className="text-4xl md:text-5xl ...">
```

**Step 2: Insert the badge between the MapPin pill and H1**

After the `<div>` with MapPin, before `<h1>`, insert:
```tsx
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#a7f3d0' }}>
  <span>📍</span>
  Serving [CityName], WI
</div>
```

Replace `[CityName]` with the actual city name for each file:
- Madison, Middleton, Waunakee, Sun Prairie, Monona, Fitchburg, Verona, McFarland, DeForest, Cottage Grove, Oregon, Stoughton

**Step 3: Commit all 12 at once**

```bash
git add src/app/locations/
git commit -m "feat(breadcrumb): add Serving X WI badge to all 12 location pages"
```

---

## Task 6: Push and verify

**Step 1: Push to remote**

```bash
git push origin main
```

**Step 2: Spot-check these routes in the browser**

| URL | Expected breadcrumb | Expected badge |
|-----|--------------------|-|
| `/` | (hidden) | — |
| `/about` | Home › About | — |
| `/services/mowing` | Home › Services › Lawn Mowing | — |
| `/commercial/gutters` | Home › Commercial › Gutter Services | — |
| `/residential` | Home › Residential Services | — |
| `/blog` | Home › Blog | — |
| `/blog/spring-lawn-care-checklist` | Home › Blog › Spring Lawn Care Checklist | — |
| `/locations/oregon` | Home › Service Areas › Oregon | 📍 Serving Oregon, WI |
| `/fall-cleanup-oregon-wi` | Home › Service Areas › Oregon › Fall Cleanup | 🌱 Serving Oregon, WI |
| `/admin` | (hidden) | — |
| `/portal/dashboard` | (hidden) | — |

**Step 3: Check mobile**

Resize to 375px. Breadcrumb should wrap gracefully (uses `flex-wrap`), not overflow.

---

## Success Criteria

- [ ] Breadcrumb appears on every public page (excluding homepage, admin, portal, utility)
- [ ] Dynamic city-service slugs resolve correctly to `City › Service` trail
- [ ] Blog slugs title-case into readable labels
- [ ] Location pages have "Serving X, WI" badge
- [ ] No layout shift on any page — spacer math is correct
- [ ] No overlap between breadcrumb and hero content
- [ ] Mobile breadcrumb wraps gracefully at 375px
- [ ] Inline breadcrumb removed from `[cityService]/page.tsx` — no duplication
