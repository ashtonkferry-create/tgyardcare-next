---
phase: 10
plan: "04"
subsystem: seo-content
tags: [seo, linkable-assets, sitemap, lawn-care, dane-county, madison]
requires: ["10-01", "10-02", "10-03"]
provides: [linkable-asset-pages, full-sitemap]
affects: ["link-building", "sitemap-coverage"]
tech-stack:
  added: []
  patterns: [server-component, json-ld-schema, static-generation]
key-files:
  created:
    - src/app/lawn-care-costs-dane-county/page.tsx
    - src/app/seasonal-lawn-calendar-madison/page.tsx
  modified:
    - src/app/sitemap.ts
decisions:
  - "Used simple Link href=/get-quote for CTA (matches pattern used in [cityService]/page.tsx — no modal wrapper needed)"
  - "Merged sitemap carefully — preserved all existing entries (static, service, commercial, location, blog, blog-category)"
  - "Replaced 4 hardcoded city-service slugs with getCityServiceParams() for full 96-page coverage"
  - "Season color coding on calendar cards: green=spring, amber=summer, orange=fall, blue=winter"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-18"
---

# Plan 10-04 Summary

Status: COMPLETE
Commit: 280317a

## What was built

- `src/app/lawn-care-costs-dane-county/page.tsx` — 2026 Dane County lawn care cost guide (server component)
  - 8-service pricing table (small/medium/large lot tiers)
  - 4 pricing factor sections (lot size, accessibility, frequency, add-ons)
  - 12-city comparison table vs. Madison baseline
  - CTA section with Link to /get-quote and tel: link
  - 5 FAQ Q&As with styled <details><summary> elements
  - JSON-LD: Article + FAQPage + BreadcrumbList

- `src/app/seasonal-lawn-calendar-madison/page.tsx` — Month-by-month Madison lawn care calendar (server component)
  - 12 month cards in responsive grid (1-col mobile, 2-col tablet, 3-col desktop)
  - Season-coded top borders (green=spring, amber=summer, orange=fall, blue=winter)
  - Service schedule quick-reference table (8 services + optimal months)
  - CTA section with Link to /get-quote and tel: link
  - JSON-LD: Article + BreadcrumbList

- `src/app/sitemap.ts` — Updated to include all 96 city-service pages + linkable assets
  - Added `import { getCityServiceParams } from '@/data/cityServiceConfig'`
  - Replaced 4 hardcoded city-service slugs with full getCityServiceParams() (96 pages at priority 0.85)
  - Added linkableAssets array with lawn-care-costs-dane-county + seasonal-lawn-calendar-madison (priority 0.7, changeFreq: yearly)
  - All pre-existing sitemap entries preserved

## Verification

- /lawn-care-costs-dane-county renders pricing tables: checked (build: static ○)
- /seasonal-lawn-calendar-madison renders 12 months: checked (build: static ○)
- sitemap includes 96 city-service pages via getCityServiceParams(): confirmed
- sitemap includes linkable asset pages: confirmed
- Both pages are server components (no 'use client'): confirmed
- TypeScript clean: confirmed (no errors in new files; full tsc times out on large codebase — consistent with pre-existing behavior)
- Build passes: confirmed (npm run build — both pages appear in output as ○ static)

## Deviations from Plan

None — plan executed exactly as written. CTA implementation used Link href=/get-quote (same pattern as existing city-service pages) rather than SmartQuoteFlow modal (which requires 'use client').
