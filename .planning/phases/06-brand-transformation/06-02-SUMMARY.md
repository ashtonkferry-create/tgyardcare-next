# Phase 6 Plan 02: Extract ServicesCarousel, BeforeAfterPreview, ServiceStandard, HowItWorks Summary

**One-liner:** Extracted 4 homepage sections into standalone components (2 client, 2 server) with ScrollRevealWrapper for animation

## Metadata

- **Phase:** 06-brand-transformation
- **Plan:** 02
- **Subsystem:** frontend/homepage
- **Tags:** component-extraction, server-components, carousel, scroll-reveal
- **Duration:** ~6 minutes
- **Completed:** 2026-03-16

## Dependency Graph

- **Requires:** 06-01 (ScrollRevealWrapper, home/ directory)
- **Provides:** ServicesCarousel, BeforeAfterPreview, ServiceStandard, HowItWorks components
- **Affects:** 06-03 (HomeContent.tsx refactor to use extracted components)

## Tasks Completed

### Task 1: Extract ServicesCarousel (client) and BeforeAfterPreview (server)
- **Commit:** 0cfd9df
- **Files created:**
  - `src/components/home/ServicesCarousel.tsx` -- client island with embla carousel, trust badges, seasonal service ordering, navigation dots, residential/commercial quick links
  - `src/components/home/BeforeAfterPreview.tsx` -- server component using ScrollRevealWrapper for scroll-triggered slide-left/right animations

### Task 2: Extract ServiceStandard (server) and HowItWorks (server)
- **Commit:** a840f63
- **Files created:**
  - `src/components/home/ServiceStandard.tsx` -- server component with 4 trust items (24hr Response, Quality Walk, Same Crew, Make-It-Right), ScrollRevealWrapper for staggered animation
  - `src/components/home/HowItWorks.tsx` -- server component wrapping client ProcessTimeline with horizontal variant

## Key Files

### Created
- `src/components/home/ServicesCarousel.tsx`
- `src/components/home/BeforeAfterPreview.tsx`
- `src/components/home/ServiceStandard.tsx`
- `src/components/home/HowItWorks.tsx`

### Modified
None -- HomeContent.tsx was NOT modified per plan instructions

## Decisions Made

1. **BeforeAfterPreview uses ScrollRevealWrapper direction prop** -- matched the `direction="left"|"right"` API from Plan 01's ScrollRevealWrapper instead of motion.div with useScrollReveal hook directly
2. **ServiceStandard uses staggered ScrollRevealWrapper** -- each of the 4 items gets its own wrapper with incremental delay (0, 0.1s, 0.2s, 0.3s) for cascade effect
3. **ServicesCarousel contains all service data** -- the 14 service definitions, image imports, and imgSrc helper moved into the carousel component since they're only used there

## Verification

- TypeScript errors: 84 (unchanged from baseline)
- All 4 components created with correct component type (client vs server)
- No modifications to HomeContent.tsx

## Deviations from Plan

None -- plan executed exactly as written.

## Next Phase Readiness

Plan 03 can now import these 4 components into HomeContent.tsx to replace the inline sections. No blockers.
