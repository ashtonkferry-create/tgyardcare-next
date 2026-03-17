---
phase: 05-safety-nets-foundation
verified: 2026-03-16T00:00:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: Animated stat counters on homepage display correct values (4.9 stars, 80+ customers, 100% satisfaction, 24hr response)
    status: partial
    reason: HomeContent.tsx trustStats shows 500+/4.9star/12/24hr. Values 80+ and 100% are not standalone counters.
    artifacts:
      - path: src/app/HomeContent.tsx
        issue: trustStats array (lines 163-168) defines 500+, 4.9star, 12, 24hr. None match 80+ or 100% as counter values per spec.
    missing:
      - Add 80+ and 100% as distinct stat counters to trustStats, OR update the must-have spec to reflect actual design intent
  - truth: Homepage loads with zero console errors (no Supabase 400/401/500 errors)
    status: partial
    reason: SeasonalThemeContext fully fixed. usePromoSettings.ts line 31 still uses .single() not .maybeSingle() on season_override. If table is empty Supabase returns 406 visible in DevTools Network tab.
    artifacts:
      - path: src/hooks/usePromoSettings.ts
        issue: Line 31 uses .single() which produces 406 when season_override table is empty. SeasonalThemeContext line 166 already has this fix but usePromoSettings was not updated.
    missing:
      - Change .single() to .maybeSingle() at line 31 of src/hooks/usePromoSettings.ts
human_verification:
  - test: Load homepage with DevTools Network tab open; check for 406 from /rest/v1/season_override
    expected: No 406 errors (season_override table has at least one row)
    why_human: Cannot verify Supabase table row population without live database access
  - test: Inspect h1 heading computed font-family in browser DevTools
    expected: Shows Clash Display variable font, not Inter or system-ui
    why_human: Actual font rendering requires visual or inspector confirmation
  - test: Confirm whether stat counter values (500+, 4.9star, 12, 24hr) are intended design or should match spec
    expected: Explicit decision -- either update code or mark spec as outdated
    why_human: Product design decision between two defensible choices
  - test: WCAG AA contrast check on dark sections using browser accessibility checker
    expected: All text on dark backgrounds passes 4.5:1 ratio
    why_human: Requires visual tooling against rendered colors
---

# Phase 5: Safety Nets & Foundation Verification Report

**Phase Goal:** Visitors experience zero console errors, see correct stat values, and the codebase is hardened with type safety, smoke tests, server-side data fetching, and SEO baselines -- enabling all subsequent phases to ship without breaking production.
**Verified:** 2026-03-16
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Homepage loads with zero console errors | PARTIAL | SeasonalThemeContext fully fixed with Promise.allSettled + maybeSingle. usePromoSettings.ts line 31 still uses .single() creating 406 risk if season_override is empty. No console.warn/error calls in either file confirmed. |
| 2 | Animated stat counters show correct values (4.9 stars, 80+ customers, 100% satisfaction, 24hr response) | PARTIAL | HomeContent.tsx trustStats = [500+, 4.9star, 12, 24hr]. Values 80+ and 100% are NOT standalone counters. 80+ appears as label suffix for 4.9star; 100% appears only in a badge card. |
| 3 | Headings render in Clash Display, body in General Sans -- no Inter, no font-loading flash | VERIFIED | ClashDisplay-Variable.woff2 (29,432 bytes) and GeneralSans-Variable.woff2 (38,132 bytes) confirmed present. layout.tsx uses next/font/local with display:swap. globals.css h1-h6 rule at line 458. Tailwind fontFamily.display and fontFamily.sans wired. No Inter references found. |
| 4 | Light text on dark backgrounds passes WCAG AA contrast on all sections | UNCERTAIN | .dark-section utility class defined (lines 464-470, #f0f0f5 = 18:1 on dark bg). CSS values correct. Whether .dark-section is applied to every dark section requires human visual check. |
| 5 | tsc --noEmit produces cataloged error list with established budget -- Phase 6+ adds zero new errors | VERIFIED | .tsc-error-budget.json present with errorCount: 85, 7 codes, CI checkCommand. Actual tsc run returns 84 errors (below budget of 85). |

**Score:** 3/5 truths fully verified, 2 partial/uncertain

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| src/contexts/SeasonalThemeContext.tsx | VERIFIED | 283 lines, Promise.allSettled line 164, maybeSingle line 166, no console output |
| src/app/fonts/ClashDisplay-Variable.woff2 | VERIFIED | 29,432 bytes |
| src/app/fonts/GeneralSans-Variable.woff2 | VERIFIED | 38,132 bytes |
| src/app/layout.tsx | VERIFIED | localFont for both fonts, CSS variable classes on html element, no Inter |
| src/app/globals.css | VERIFIED | --font-display/body vars (lines 59-61), h1-h6 rule (line 458), seasonal vars (lines 87-198), .dark-section (lines 464-470) |
| tailwind.config.ts | VERIFIED | fontFamily.sans -> var(--font-general-sans), fontFamily.display -> var(--font-clash-display) |
| .tsc-error-budget.json | VERIFIED | errorCount: 85, 7 error codes, checkCommand present |
| src/lib/supabase/server.ts | VERIFIED | createServerClient + cookies() from next/headers |
| src/lib/supabase/client.ts | VERIFIED | createBrowserClient |
| src/middleware.ts | VERIFIED | Auth guard lines 112-123, -auth-token cookie check, /admin/login redirect |
| playwright.config.ts | VERIFIED | 22 lines, webServer command npm run dev, reuseExistingServer true |
| tests/smoke/public-pages.spec.ts | VERIFIED | 10 pages in PUBLIC_PAGES, console error capture, 200 status assertions |
| docs/cron-audit.md | VERIFIED | 91 lines |
| docs/seo-baseline-deferred.md | VERIFIED | File exists |
| src/hooks/usePromoSettings.ts | PARTIAL | No console.warn/error confirmed. Line 31 uses .single() not .maybeSingle() on season_override -- 406 risk if table empty |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| SeasonalThemeContext | 4 Supabase tables | Promise.allSettled | WIRED | All 4 queries with per-query silent fallback, maybeSingle on override |
| layout.tsx | woff2 font files | next/font/local | WIRED | CSS variables injected on html element via className |
| globals.css | h1-h6 elements | font-family var(--font-display) | WIRED | Body font-family: var(--font-body), h1-h6: var(--font-display) |
| middleware.ts | /portal/* and /admin/* | cookie check + redirect | WIRED | Lines 112-123 |
| usePromoSettings.ts | season_override | .single() | PARTIAL | Should be .maybeSingle() |
| HomeContent.tsx trustStats | spec values per must-have | hardcoded array | PARTIAL | 500+/12 differ from spec 80+/100% |

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| FOUND-01 Supabase error resilience | SATISFIED | SeasonalThemeContext fully fixed |
| FOUND-02 + TYPO-01-05 Typography | SATISFIED | Self-hosted fonts, CSS vars, Tailwind config |
| FOUND-03 TypeScript budget | SATISFIED | 84/85 errors, budget file present |
| FOUND-04 Supabase SSR clients | SATISFIED | server.ts and client.ts created |
| FOUND-05 Auth middleware | SATISFIED | /portal/* and /admin/* protected |
| FOUND-06 Seasonal CSS | SATISFIED | Single source of truth in globals.css |
| FOUND-07 Brand name | SATISFIED | TotalGuard Yard Care in layout.tsx metadata |
| FOUND-08 Stat counter values | PARTIAL | Values differ from spec (500+/12 vs 80+/100%) |
| FOUND-09 SEO baseline | DEFERRED | docs/seo-baseline-deferred.md documents prerequisites |
| FOUND-10 Smoke tests | SATISFIED | 10 Playwright smoke tests + cron audit |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/hooks/usePromoSettings.ts | 31 | .single() on potentially-empty table | Warning | 406 Supabase network error if season_override is empty (JS caught, visible in Network tab) |
| src/app/HomeContent.tsx | 163-168 | Stat values 500+/4.9star/12/24hr do not match spec | Info | Spec says 80+/100%, actual design uses different values |

### Human Verification Required

#### 1. Network Tab Supabase 406 Check

**Test:** Load the homepage with DevTools Network tab open, filter by Fetch/XHR, check for requests to /rest/v1/season_override returning 406.
**Expected:** Either 200 (row exists) or no 406.
**Why human:** Cannot verify Supabase table row population without live access. The .single() in usePromoSettings.ts will produce a 406 if the season_override table has no rows.

#### 2. Typography Rendering

**Test:** Open homepage in browser, right-click an h1 heading, inspect Computed > font-family in DevTools.
**Expected:** Computed font shows Clash Display variable font, not Inter or system-ui.
**Why human:** Actual font rendering requires visual or inspector confirmation.

#### 3. Stat Counter Values Decision

**Test:** Confirm with product owner whether the current stats (500+, 4.9star, 12, 24hr) are the intended design or should match the phase spec (4.9star, 80+, 100%, 24hr).
**Expected:** Explicit decision made -- either update code or mark spec as outdated.
**Why human:** Product design decision. Both value sets are defensible but spec and code currently disagree.

#### 4. WCAG AA Contrast Audit

**Test:** Use browser accessibility checker (Chrome DevTools Accessibility tab) on dark-background sections of the homepage and service pages.
**Expected:** All text passes 4.5:1 ratio.
**Why human:** Requires visual tooling against rendered colors.

### Gaps Summary

Two gaps prevent full goal achievement:

**Gap 1 (must-have 2) -- Stat counter values mismatch:** The homepage trust stats strip shows 500+ / 4.9star / 12 / 24hr. The phase spec required 4.9 stars / 80+ customers / 100% satisfaction / 24hr response. Values 80+ and 100% do not appear as standalone animated stat counters. The 05-05 executor noted the values were already correct per design intent, but the must-have spec disagrees. This requires a product decision: update the code or update the spec.

**Gap 2 (must-have 1, partial) -- usePromoSettings .single() risk:** src/hooks/usePromoSettings.ts line 31 still calls .single() instead of .maybeSingle() on the season_override query. SeasonalThemeContext received this fix (line 166) but usePromoSettings did not. This will emit a 406 Supabase network error visible in DevTools Network tab if the season_override table has no rows -- a partial violation of the zero-console-errors goal. The additional context mentioned fixing console.warn calls in this file, but the .single()/.maybeSingle() change was not applied.

All other deliverables are confirmed in the codebase: self-hosted fonts wired end-to-end, TypeScript budget at 84/85 errors, Supabase SSR clients created, auth middleware protecting /portal and /admin, seasonal CSS variables consolidated in globals.css, Playwright smoke test suite for 10 public pages, and cron audit documentation complete.

---

_Verified: 2026-03-16_
_Verifier: Claude (gsd-verifier)_
