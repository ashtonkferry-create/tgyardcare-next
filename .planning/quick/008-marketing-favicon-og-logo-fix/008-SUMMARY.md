---
phase: quick
plan: 008
subsystem: marketing-branding
tags: [favicon, og-image, social-sharing, next-js, imageresponse]
completed: 2026-03-16
duration: ~5 minutes
tech-stack:
  patterns: [next-js-file-based-metadata, imageresponse-dynamic-images]
key-files:
  created:
    - workely.ai/apps/marketing/src/app/icon.tsx
    - workely.ai/apps/marketing/src/app/apple-icon.tsx
    - workely.ai/apps/marketing/src/app/opengraph-image.tsx
    - workely.ai/apps/marketing/src/app/twitter-image.tsx
  modified:
    - workely.ai/apps/marketing/src/components/layout/navbar.tsx
    - workely.ai/apps/marketing/src/components/layout/footer.tsx
---

# Quick Task 008: Marketing Favicon, OG Image & Logo Fix Summary

Dynamic favicon set, premium OG image for social sharing, and logo sizing corrections using Next.js file-based metadata API with ImageResponse.

## What Was Done

### Task 1: Favicon Set (icon.tsx + apple-icon.tsx)
- Created `icon.tsx` generating a 32x32 favicon with a geometric W mark
- Created `apple-icon.tsx` generating a 180x180 Apple touch icon
- Both use SVG path for a stylized W with blue-to-purple gradient (#3C83F6 to #8236EC)
- Dark background (#07080d) with rounded corners
- Uses Next.js `ImageResponse` from `next/og`

### Task 2: Premium OG Image + Twitter Image
- Created `opengraph-image.tsx` generating a 1200x630 branded social image
- Dark gradient background with subtle grid pattern overlay
- Blue radial glow effect behind centered headline
- W mark logo with "Workely.AI" branding in top-left
- "The AI Workforce Platform" headline in Space Grotesk Bold 64px
- "Deploy 30+ AI agents in 5 minutes" tagline in Inter 24px
- Gradient accent line (blue to purple)
- "workely.ai" URL in bottom-right
- Created `twitter-image.tsx` with Twitter-specific alt text
- Fonts loaded from fontsource CDN as woff format (woff2 not supported by Satori)

### Task 3: Logo Sizing Fix
- Navbar logo: 38x38 -> 44x44px
- Navbar brand text: 20px -> 22px
- Footer logo: 28x28 -> 32x32px
- Matches Lovable original design proportions

## Commits

| Hash | Message |
|------|---------|
| c36ca6e | feat(quick-008): add dynamic favicon and apple-icon using Next.js ImageResponse |
| 58aa184 | feat(quick-008): add premium OG image and Twitter image for social sharing |
| 679f598 | fix(quick-008): adjust logo sizing in navbar and footer to match Lovable original |
| 963717a | fix(quick-008): use woff fonts instead of woff2 for OG image compatibility |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] woff2 font format unsupported by Satori**
- **Found during:** Build verification after Task 2
- **Issue:** `ImageResponse` (Satori) throws "Unsupported OpenType signature wOF2" with woff2 fonts
- **Fix:** Switched from Google Fonts woff2 URLs to fontsource CDN woff URLs
- **Files modified:** opengraph-image.tsx, twitter-image.tsx
- **Commit:** 963717a

## Verification

- TypeScript compilation: PASS (no errors)
- Full production build: PASS (all routes generated)
- Routes confirmed: /icon, /apple-icon, /opengraph-image, /twitter-image all render as static content
