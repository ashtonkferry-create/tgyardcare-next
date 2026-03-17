# SEO Dominance Engine — Design Document

**Date:** 2026-03-17
**Status:** Approved
**Author:** Claude (strategist) + Vance (approval)

---

## Objective

Transform TotalGuard's web presence from 76 pages to 175+ pages with a city-service page matrix, 1,200+ contextual internal links, and 3 linkable assets — owning every "[service] [city] wi" search result in Dane County.

---

## Pillar 1: City-Service Page System (96 new pages)

### URL Pattern
`/{service}-{city}-wi`

Examples:
- `/lawn-mowing-madison-wi`
- `/gutter-cleaning-middleton-wi`
- `/snow-removal-sun-prairie-wi`

### Service Matrix (8 services × 12 cities)

| Service | URL Slug |
|---------|----------|
| Lawn Mowing | `lawn-mowing` |
| Fertilization & Weed Control | `fertilization-weed-control` |
| Gutter Cleaning | `gutter-cleaning` |
| Gutter Guard Installation | `gutter-guard-installation` |
| Fall Cleanup | `fall-cleanup` |
| Spring Cleanup | `spring-cleanup` |
| Snow Removal | `snow-removal` |
| Hardscaping | `hardscaping` |

Cities: Madison, Middleton, Waunakee, Sun Prairie, Fitchburg, Monona, Verona, McFarland, Cottage Grove, DeForest, Oregon, Stoughton

### Page Structure (per page)

1. **Hero** — "{Service} in {City}, WI" + city-specific subheadline + CTA
2. **Why {City} Homeowners Choose Us** — 3-4 bullets with local context (neighborhoods, common yard challenges)
3. **Service Details** — what's included, process steps (pulled from parent service data)
4. **Pricing Context** — "Starting at $X" badge + "Pricing varies by lot size in {City}"
5. **Neighborhoods Served** — unique per city (e.g., Madison: Maple Bluff, Nakoma, Shorewood Hills)
6. **Nearby Cities** — links to same service in 3-4 adjacent cities
7. **Related Services** — links to other services in same city (7 links)
8. **CTA Section** — "Get Your Free {City} {Service} Quote"
9. **Schema** — LocalBusiness + Service + BreadcrumbList + FAQPage (2-3 city-specific FAQs)

### Implementation

- One dynamic route: `src/app/[cityService]/page.tsx`
- Data config: `src/data/city-service-config.ts` — per-city content (neighborhoods, challenges, nearby cities, coordinates)
- `generateStaticParams()` produces all 96 pages at build time
- `generateMetadata()` creates unique title/description per page
- Existing 4 city-service pages (`/lawn-care-madison-wi`, etc.) get 301 redirects to new URL pattern

### Content Uniqueness Strategy

Each page is unique through:
- City-specific neighborhood lists (researched per city)
- City-specific yard challenges ("Madison's clay-heavy soil requires...", "Waunakee's new construction lots need...")
- City-specific pricing context
- Unique nearby city link sets (based on geography)
- City-specific FAQs

---

## Pillar 2: Internal Link Web (1,200+ new contextual links)

### 2a. Service Page → City Variants (96 links)
New section on each of 8 service pages: "We Serve {Service} Across Dane County"
Styled grid of 12 city links, each pointing to that service's city page.

### 2b. City-Service → Related + Nearby (1,008 links)
Each of 96 city-service pages gets:
- **"More Services in {City}"** — 7 links to other services in that city (672 links)
- **"Also Serving Nearby"** — 3-4 links to same service in adjacent cities (336 links)

### 2c. Location Pages → City-Service Pages (108 upgraded links)
Existing 12 location pages upgrade from generic `/services/mowing` to city-specific `/lawn-mowing-madison-wi`.

### 2d. Blog Auto-Linking (component)
`InlineServiceLinks` utility component:
- Scans blog post content for service/city keywords
- Wraps with contextual links (max 3 per keyword to avoid spam)
- Keyword map: "lawn mowing" → `/services/mowing`, "Madison lawn care" → `/lawn-mowing-madison-wi`
- Runs at render time, no manual tagging needed

### 2e. Visible Breadcrumbs (all pages)
`Breadcrumb` UI component (not just schema — actual visible breadcrumbs):
- Service pages: `Home → Services → Lawn Mowing`
- City-service pages: `Home → Service Areas → Madison → Lawn Mowing`
- Location pages: `Home → Service Areas → Madison`
- Blog posts: `Home → Blog → {Category} → {Title}`
- Minimal design: small text, seasonal accent color on links

---

## Pillar 3: Linkable Assets (3 new pages)

### 3a. Dane County Lawn Care Cost Guide 2026
**URL:** `/lawn-care-costs-dane-county`

Content:
- Average pricing tables per service per city
- Lot size impact on pricing
- Seasonal pricing breakdown
- DIY vs. professional comparison
- "What affects your lawn care cost" explainer

Schema: Article + FAQPage
Why it earns backlinks: Journalists, real estate blogs, homeowner forums link to pricing data.

### 3b. Madison Area Seasonal Lawn Calendar
**URL:** `/seasonal-lawn-calendar-madison`

Content:
- Month-by-month guide (what to do each month)
- Tied to TotalGuard's actual 5-step fertilizer program
- Each month links to the relevant service page
- Printable/shareable format

Schema: Article + HowTo
Why it earns backlinks: Garden clubs, neighborhood associations, UW Extension forums.

### 3c. Interactive Service Area Map
**URL:** `/service-area-map`

Content:
- Visual map of Dane County with 12 service areas highlighted
- Click a city → see available services + link to city page
- Embeddable snippet for partners/referrers

Schema: WebPage + LocalBusiness
Why it earns backlinks: Real estate agents, property managers, local directories.

---

## Pillar 4: SEO Infrastructure Updates

### Sitemap
- Add 96 city-service pages: priority 0.85, changefreq monthly
- Add 3 linkable assets: priority 0.7, changefreq monthly
- Keep existing priorities unchanged

### Schema Per Page Type
| Page Type | Schema Types |
|-----------|-------------|
| City-service | LocalBusiness + Service + BreadcrumbList + FAQPage |
| Cost guide | Article + FAQPage |
| Lawn calendar | Article + HowTo |
| Service area map | WebPage + LocalBusiness |

### Redirects
| Old URL | New URL | Type |
|---------|---------|------|
| `/lawn-care-madison-wi` | `/lawn-mowing-madison-wi` | 301 |
| `/lawn-care-middleton-wi` | `/lawn-mowing-middleton-wi` | 301 |
| `/gutter-cleaning-madison-wi` | `/gutter-cleaning-madison-wi` | Keep (matches new pattern) |
| `/snow-removal-madison-wi` | `/snow-removal-madison-wi` | Keep (matches new pattern) |

---

## What We Don't Do

- No outbound links to big brands (Scotts, Toro) — keeps authority on our domain
- No link exchanges or PBNs — Google penalizes these
- No thin/templated content — every page has unique city context
- No keyword stuffing — city name appears 3-5 times max per page
- Only outbound links: BBB, local Chamber of Commerce, Dane County government (authority signals)

---

## Expected Impact

- **96 new city-service pages** targeting "[service] [city] wi" queries
- **1,200+ contextual internal links** (Google weights these 5-10x more than nav links)
- **3 linkable assets** designed to earn external backlinks organically
- **Visible breadcrumbs** on every page (Google shows these in search results)
- **Target:** First page for every "[service] [city] wi" query in Dane County within 3-6 months
