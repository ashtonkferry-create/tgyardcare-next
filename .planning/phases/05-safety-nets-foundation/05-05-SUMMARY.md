---
phase: 05-safety-nets-foundation
plan: 05
subsystem: ui
tags: [css-variables, seasonal-theme, wcag, brand-consistency, seo-metadata]

requires:
  - phase: 05-safety-nets-foundation
    provides: "Typography foundation (05-02), SeasonalThemeContext fix (05-01)"
provides:
  - "Seasonal CSS variables as single source of truth (--season-accent, --season-accent-light)"
  - "data-season attribute selectors for CSS-only seasonal theming"
  - "WCAG AA contrast utility classes (.dark-section)"
  - "Consistent TotalGuard Yard Care brand name in all metadata"
affects: [phase-6-brand-identity, phase-7-conversion, seo-schema]

tech-stack:
  added: []
  patterns:
    - "CSS custom property layering: --season-accent (simple) + --seasonal-accent (detailed)"
    - "Dual selector pattern: [data-season] + body.season-* for attribute and class-based theming"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/lib/seasonalConfig.ts
    - src/lib/seo/schema-config.ts

key-decisions:
  - "Added --season-accent variables alongside existing --seasonal-accent (not replacing) to provide simplified API"
  - "Used dual selectors [data-season] + body.season-* for backward compatibility"
  - "Limited brand name fix to layout.tsx + 2 SEO files (62 files total have TG Yard Care, bulk fix deferred)"

patterns-established:
  - "Seasonal color single source of truth: globals.css defines all season variants"
  - "Brand name: TotalGuard Yard Care (not TG Yard Care) in all user-visible metadata"

duration: 8min
completed: 2026-03-16
---

# Phase 5 Plan 5: Seasonal CSS + Brand Consistency Summary

**Consolidated seasonal colors into CSS variable single source of truth with data-season selectors, fixed TotalGuard brand name in layout metadata and SEO schemas**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-16T23:27:52Z
- **Completed:** 2026-03-16T23:36:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Seasonal CSS variables (--season-accent, --season-accent-light, --season-badge-bg/text) defined per season in globals.css
- Added [data-season] attribute selectors alongside existing body.season-* class selectors for all 4 seasons
- WCAG AA contrast utility classes (.dark-section, .dark-section .text-muted) established
- All layout.tsx metadata now uses "TotalGuard Yard Care" consistently
- Fixed 14 instances of "TG Yard Care" in schema-config.ts SEO service descriptions
- Fixed brand name in seasonalConfig.ts BUSINESS_CONFIG

## Task Commits

Each task was committed atomically:

1. **Task 1: Consolidate seasonal CSS variables and fix text contrast** - `fd0d646` (feat)
2. **Task 2: Fix brand name consistency and stat counter values** - `91ef253` (fix)

## Files Created/Modified
- `src/app/globals.css` - Added --season-accent variables, [data-season] selectors, WCAG AA contrast classes, migration TODO comments
- `src/app/layout.tsx` - Replaced all "TG Yard Care" with "TotalGuard Yard Care" in metadata
- `src/lib/seasonalConfig.ts` - Fixed BUSINESS_CONFIG.name to "TotalGuard Yard Care"
- `src/lib/seo/schema-config.ts` - Fixed 14 occurrences of "TG Yard Care" in service longDescriptions

## Decisions Made
- Added --season-accent as simplified API alongside existing --seasonal-accent (not replacing, additive)
- Dual selector pattern ([data-season] + body.season-*) ensures both JS attribute-setting and class-based approaches work
- Brand name bulk fix limited to 3 files (layout.tsx, seasonalConfig.ts, schema-config.ts) -- 59 remaining files with "TG Yard Care" documented for future cleanup
- Stat counters verified already correct (500+, 4.9, 12, 24hr) -- no changes needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Seasonal CSS variables ready for Phase 6 brand work to reference
- 59 files still contain "TG Yard Care" in user-visible text (services, locations, commercial pages) -- should be addressed in a dedicated cleanup plan
- Hardcoded hex colors in hero components (FallHero, WinterHero, SummerHero) documented for future migration to CSS variables

---
*Phase: 05-safety-nets-foundation*
*Completed: 2026-03-16*
