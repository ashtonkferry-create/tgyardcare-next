---
phase: 05-safety-nets-foundation
plan: 06
subsystem: testing
tags: [playwright, smoke-tests, cron, seo, documentation]

# Dependency graph
requires:
  - phase: 05-01
    provides: Silent fallback error handling (enables zero-console-error assertion)
  - phase: 05-02
    provides: Typography foundation (pages render correctly for smoke tests)
  - phase: 05-04
    provides: Supabase client setup (pages load without auth errors)
provides:
  - Playwright smoke test suite for 10 public pages
  - Complete cron job audit (41 jobs documented)
  - SEO baseline deferral artifact (FOUND-09)
affects: [phase-06, phase-07, ci-cd]

# Tech tracking
tech-stack:
  added: ["@playwright/test"]
  patterns: ["Smoke test pattern: HTTP 200 + console error capture per page"]

key-files:
  created:
    - playwright.config.ts
    - tests/smoke/public-pages.spec.ts
    - docs/cron-audit.md
    - docs/seo-baseline-deferred.md
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Used npm run dev (not build+start) for Playwright webServer — faster local testing, CI can override"
  - "Strict console error assertion (expect empty array) — Plan 01 already fixed silent fallbacks"
  - "blog-seed included in cron audit despite not being in vercel.json (manual trigger route)"

patterns-established:
  - "Smoke test pattern: loop over PUBLIC_PAGES array with page.goto + status + title + console error checks"
  - "Cron audit format: table with route, schedule, human-readable time, purpose, status"

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 5 Plan 6: Smoke Tests + Cron Audit Summary

**Playwright smoke tests for 10 public pages with HTTP 200 + console error checks, plus full audit of 41 cron jobs**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-16T23:37:23Z
- **Completed:** 2026-03-16T23:42:00Z
- **Tasks:** 3/3
- **Files modified:** 6

## Accomplishments
- Playwright installed with chromium; 10 public page smoke tests verify HTTP 200, page title, and zero console errors
- All 41 cron jobs documented with route, schedule (UTC + CT), purpose, and status
- FOUND-09 (SEO baseline) addressed with deferral artifact documenting prerequisites and scope

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up Playwright and create smoke tests** - `82b9803` (test)
2. **Task 2: Audit all cron jobs and document them** - `d45ee07` (docs)
3. **Task 3: Create SEO baseline deferral artifact** - `a795187` (docs)

## Files Created/Modified
- `playwright.config.ts` - Playwright config with dev server integration and chromium project
- `tests/smoke/public-pages.spec.ts` - 10 public page smoke tests (HTTP 200 + console errors + title)
- `docs/cron-audit.md` - Complete audit of 41 cron jobs with schedules, purposes, conflicts, and redundancies
- `docs/seo-baseline-deferred.md` - FOUND-09 deferral with prerequisites and capture scope
- `package.json` - Added test:smoke script
- `.gitignore` - Added test-results/ and playwright-report/

## Decisions Made
- Used `npm run dev` for Playwright webServer command (faster for local testing; CI can override with build+start)
- Strict console error assertion (empty array) based on Plan 01 having already fixed all Supabase silent fallbacks
- Included blog-seed route in cron audit even though it is not in vercel.json (manual-only trigger)
- Identified 2 potential redundancies: gbp-post vs gbp-post-publisher, seo-audit vs seo-crawl+seo-score pipeline

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- Smoke tests ready to run locally via `npm run test:smoke` (requires dev server or reuseExistingServer)
- Cron audit provides foundation for future cron cleanup/consolidation work
- SEO baseline capture blocked until GSC credentials are rotated (Phase 6 prerequisite)
- Plan 07 (final Phase 5 plan) is next

---
*Phase: 05-safety-nets-foundation*
*Completed: 2026-03-16*
