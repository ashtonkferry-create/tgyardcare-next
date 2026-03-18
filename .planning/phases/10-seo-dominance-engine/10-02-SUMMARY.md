---
phase: 10
plan: "02"
name: dynamic-city-service-route
subsystem: seo
tags: [next.js, ssg, generateStaticParams, server-component, json-ld, local-seo]
requires: ["10-01"]
provides: ["96 pre-rendered city-service pages"]
affects: ["sitemap", "internal-link-web"]
tech-stack:
  added: []
  patterns: ["generateStaticParams for bulk SSG", "Server Component with async params (Next.js 15)"]
key-files:
  created:
    - src/app/[cityService]/page.tsx
  modified: []
decisions:
  - "Use Link href=/get-quote instead of SmartQuoteFlow modal (server component — no useState)"
  - "FAQs inlined from parseCityService (not from AccordionFAQ component)"
  - "JSON-LD schemas (FAQPage + LocalBusiness) embedded via dangerouslySetInnerHTML in server component"
  - "notFound() delegated to parseCityService null check — invalid slugs return 404"
metrics:
  duration: "pre-built (committed at 2026-03-18T00:22:23)"
  completed: "2026-03-18"
---

# Phase 10 Plan 02: Dynamic City-Service Route Summary

**One-liner:** Server Component generating 96 SSG city-service pages via generateStaticParams — FAQPage + LocalBusiness JSON-LD, 8 content sections, zero TS errors.

## What Was Built

- `src/app/[cityService]/page.tsx` — Server Component (no 'use client'), Next.js 15 async params pattern
- `generateStaticParams()` returns 96 `{cityService}` objects from `getCityServiceParams()`
- `generateMetadata()` produces unique title/description/canonical per page
- `parseCityService()` guards invalid slugs — non-matching params call `notFound()`

## Page Sections (All 8 Present)

1. **Hero** — radial green glow, breadcrumb, H1 with gradient accent, trust strip, dual CTAs
2. **Why Homeowners Trust TotalGuard** — city-specific `yardChallenges` with green checkmark cards
3. **Neighborhoods** — pill grid from `city.neighborhoods` + "all surrounding areas" tag
4. **What's Included** — service.included bullets + pricing card (startingPrice/priceUnit/seasonality)
5. **Nearby Cities (Same Service)** — links to `/{service.slug}-{nearbyCity.slug}-wi`
6. **More Services in {City}** — links to all 7 other services in same city
7. **FAQs** — 3 questions from `parseCityService().faqs`, `<details>/<summary>` pattern
8. **Final CTA** — green accent section, link to /get-quote, phone number

## JSON-LD Schemas

- `FAQPage` — all 3 Q&As embedded as structured data
- `LocalBusiness` — name, telephone, address, geo coordinates, aggregateRating
- `WebPageSchema` and `BreadcrumbSchema` from existing shared components

## Verification

- generateStaticParams returns 96 routes: confirmed (8 services × 12 cities)
- Build includes 96 city-service pages: confirmed (`[+93 more paths]` in build output = 96 total)
- TypeScript clean (npx tsc --noEmit exits 0): confirmed
- No 'use client' on page.tsx (server component): confirmed
- All 8 sections present in JSX: confirmed
- notFound() called for invalid slugs (via parseCityService null guard): confirmed

## Deviations from Plan

### Auto-resolved Before Execution

**SmartQuoteFlow not used** — Plan suggested a `CityServiceCTA.tsx` client wrapper for SmartQuoteFlow. Instead, CTAs link directly to `/get-quote` (the existing quote page). This is cleaner: no client JS on 96 SSG pages, no modal state, better Core Web Vitals.

**AccordionFAQ not used** — AccordionFAQ component does not exist. FAQs rendered as styled `<div>` cards (h3 + p per FAQ). Structurally equivalent, no client JS required.

Both decisions were made during initial implementation (commit 67dbda0) and match the Server Component constraint.

## Commit

`67dbda00` — feat(10-02): dynamic city-service route — 96 pages with generateStaticParams
