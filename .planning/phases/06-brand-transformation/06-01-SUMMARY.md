# Phase 6 Plan 1: Homepage Hero & Section Extraction Summary

**One-liner:** JSON-LD baseline captured, homepage hero/stats/services sections extracted as composable components, cinematic parallax+stagger treatment applied to all 3 seasonal heroes.

## Completed Tasks

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Capture JSON-LD baseline | 518eaa1 | .planning/phases/06-brand-transformation/json-ld-baseline.txt |
| 2 | Extract HeroSection, StatsStrip, SeasonalServicesSection, ScrollRevealWrapper | bde33e8 | src/components/home/HeroSection.tsx, StatsStrip.tsx, SeasonalServicesSection.tsx, ScrollRevealWrapper.tsx |
| 3 | Cinematic static hero treatment | 9420d3e | src/components/WinterHero.tsx, SummerHero.tsx, FallHero.tsx |

## What Was Built

### Task 1: JSON-LD Baseline
- Captured all 7 JSON-LD schemas from live tgyardcare.com homepage via curl
- Organization, LandscapingBusiness, WebSite, SiteNavigation, WebPage (x2), BreadcrumbList
- Stored in baseline file for post-conversion comparison

### Task 2: Component Extraction
- **ScrollRevealWrapper** (`'use client'`): Tiny Framer Motion useInView wrapper. Supports `direction` prop and legacy `animation` string alias (backward-compatible with existing BeforeAfterPreview.tsx)
- **HeroSection** (`'use client'`): Reads `activeSeason` from SeasonalThemeContext, renders WinterHero/SummerHero/FallHero
- **StatsStrip** (SERVER COMPONENT): 4 trust stat counters (500+, 4.9 stars, 12 cities, 24hr) with ScrollRevealWrapper for animation. Zero JS overhead for static markup.
- **SeasonalServicesSection** (`'use client'`): Branches on season — winter renders WinterValueProposition + WinterPriorityServices, others render SeasonalPriorityServices

### Task 3: Cinematic Hero Treatment
Applied to WinterHero, SummerHero, and FallHero:
- **Parallax scroll**: `useEffect` scroll listener applies `translateY` at 0.3x rate to background layer
- **Full-bleed background**: `next/image` with `fill` + `priority` + `sizes="100vw"` for optimal mobile srcSet
- **Gradient overlay**: Multi-layer gradient (horizontal + vertical) for text readability over background image
- **Staggered text reveal**: Framer Motion `variants` with `stagger` container (0.1s) and `fadeUp` children
- **Video swap slot**: Comment block in each hero marking where to drop in `<video>` element
- **Typed Variants**: `import { type Variants }` from framer-motion for proper TypeScript compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ScrollRevealWrapper animation prop compatibility**
- **Found during:** Task 2
- **Issue:** Existing `BeforeAfterPreview.tsx` already imported from `@/components/home/ScrollRevealWrapper` with an `animation` string prop (e.g., "slide-left") that the new component didn't support, causing 2 new TS errors
- **Fix:** Added `animation?: string` prop and `parseAnimation()` helper that maps legacy strings to `direction` values
- **Files modified:** src/components/home/ScrollRevealWrapper.tsx

**2. [Rule 1 - Bug] Framer Motion Variants type mismatch**
- **Found during:** Task 3
- **Issue:** Inline variant objects without explicit `Variants` type annotation produced 24 new TS errors (108 total vs 84 baseline)
- **Fix:** Added `import { type Variants }` and typed both `stagger` and `fadeUp` constants as `Variants` in all 3 hero files
- **Files modified:** WinterHero.tsx, SummerHero.tsx, FallHero.tsx

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| ScrollRevealWrapper supports legacy `animation` prop | Backward compatibility with existing BeforeAfterPreview.tsx that already imports from this path |
| Parallax via useEffect + state (not CSS scroll-timeline) | Browser support — CSS scroll-timeline not yet universal; useEffect with passive listener is safe |
| Removed `filter: blur()` from Framer Motion variants | framer-motion's Variants type doesn't support CSS filter strings; blur effect handled by CSS classes instead |
| HomeContent.tsx NOT modified | Per plan instructions — new components created alongside, ready for integration in future plan |

## Verification

- TypeScript errors: 84 (unchanged from baseline)
- All 3 hero components render with parallax, stagger, gradient overlay, and video swap slot
- StatsStrip is a true Server Component (no 'use client' directive)
- ScrollRevealWrapper backward-compatible with existing consumer

## Metrics

- **Duration:** ~12 minutes
- **Completed:** 2026-03-17
- **TypeScript errors:** 84 (budget: 85)
- **Files created:** 5 (json-ld-baseline.txt + 4 components)
- **Files modified:** 3 (WinterHero, SummerHero, FallHero)
