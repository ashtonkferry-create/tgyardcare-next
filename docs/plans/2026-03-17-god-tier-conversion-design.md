# God-Tier Conversion System — Design
Date: 2026-03-17
Status: Approved

---

## Problem Statement

The TotalGuard site has 77 pages and 68 CTAs — all routing to the same generic `/contact` form. There is no personalization, no inline capture on service pages, no activated QuoteFlow (built but dormant), no neighborhood-specific social proof, and no post-form expectation setting. The annual plan page shows fake pricing that means nothing. The result: high drop-off, low-intent leads, and a site that feels like a brochure rather than a conversion machine.

---

## Approved Decisions

- **All form fields required: Name, Email, Phone, Address** — no optional fields on any form
- **No pricing shown anywhere** — every property is different; Vance's team quotes after contact
- **Jobber handles scheduling** — team reaches out to client before each service; no calendar booking link needed
- **No 24/7 promise** — honest expectation setting only
- **Phone-first** — phone is promoted as prominently as the form on mobile

---

## The 6-System Architecture

### System 1: Annual Plan → Service Wishlist

**What changes:** `src/components/AnnualPlanConfigurator.tsx`

Remove entirely:
- `usePricing` hook and all imports
- `calculateBundlePricing()` function and `PricingResult` type
- Price display in sticky panel ($287/month, $3,444/year)
- Bundle progress bar (3-segment fill)
- Savings badge ("You save $607")
- `BUNDLE_DISCOUNT` and `BUNDLE_MIN` constants (or keep BUNDLE_MIN if still referenced)

Keep:
- `useReducer` state management (service selections by season)
- `STATIC_SERVICES` array (8 services with icons, descriptions, availableSeasons)
- Season pill grid on each card (S/S/F/W toggles, disabled states, "All Year" shortcut)
- Sticky plan panel — rebuild as "YOUR SERVICE WISHLIST"
- Mini 12-month calendar (shows which months have active services)
- In-panel contact form (Name, Email, Phone, Address — all required)

Sticky panel becomes:
```
┌─────────────────────────────┐
│ YOUR SERVICE WISHLIST        │
│ ─────────────────────────── │
│ Lawn Mowing — Spring, Summer │  ← one line per selected service
│ Fertilization — Spring, Fall │
│ Snow Removal — Winter        │
│ ─────────────────────────── │
│ [Mini calendar — 12 months]  │
│ ─────────────────────────── │
│ [Get My Custom Quote →]      │  ← amber shimmer button
│ We'll reach out to discuss   │
│ your property & get you      │
│ scheduled.                   │
│ ─────────────────────────── │
│ [Contact form slides in]     │
└─────────────────────────────┘
```

Empty state: "Select services on the left to start building your wishlist."
CTA disabled state: when no services selected, button is muted + `cursor: not-allowed`

Hero subheadline update: Remove "Bundle 3+ services to save 15%" — replace with "Tell us what you want. We'll call with a price built for your exact property."

---

### System 2: ServicePageQuickQuote — Inline Form on Every Service Page

**New component:** `src/components/ServicePageQuickQuote.tsx`

**Props:**
```typescript
interface ServicePageQuickQuoteProps {
  serviceName: string;  // "Lawn Mowing"
  serviceSlug: string;  // "mowing"
}
```

**Fields (all required):** Full Name, Email, Phone, Property Address

**Behavior:**
- Submits to `/api/contact` (same endpoint as ContactContent.tsx)
- Passes `service` as hidden field mapped to serviceSlug
- Pre-populates `message` as `"I'm interested in ${serviceName} service."`
- On success: inline success state — no page navigation
- On error: inline error message

**Design:** Dark glass card (`bg-white/[0.03]`, `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 16px`), amber submit button matching service page hero CTAs.

**Headline:** `"Get Your {serviceName} Quote"`
**Subtext:** `"We'll reach out to discuss your property and get you scheduled."`

**Placement in each service page:** After the hero section, before the "Who This Is For" / problem section. This is the highest-intent real estate — user just read the headline and is in the mindset.

**Files to modify (15 content files):**
- `src/app/services/mowing/MowingContent.tsx`
- `src/app/services/fertilization/FertilizationContent.tsx`
- `src/app/services/aeration/AerationContent.tsx`
- `src/app/services/spring-cleanup/SpringCleanupContent.tsx`
- `src/app/services/fall-cleanup/FallCleanupContent.tsx`
- `src/app/services/leaf-removal/LeafRemovalContent.tsx`
- `src/app/services/mulching/MulchingContent.tsx`
- `src/app/services/gutter-cleaning/GutterCleaningContent.tsx`
- `src/app/services/gutter-guards/GutterGuardsContent.tsx`
- `src/app/services/snow-removal/SnowRemovalContent.tsx`
- `src/app/services/herbicide/HerbicideContent.tsx`
- `src/app/services/weeding/WeedingContent.tsx`
- `src/app/services/garden-beds/GardenBedsContent.tsx`
- `src/app/services/pruning/PruningContent.tsx`
- `src/app/services/hardscaping/HardscapingContent.tsx`

---

### System 3: QuoteFlow Activation

**What changes:** `src/app/get-quote/page.tsx`

Currently: `redirect('/contact')` — this wastes a fully-built 7-step quote wizard.

Replace with: Server Component that renders `<QuoteFlow />` wrapped in `<Navigation />` and `<Footer showCloser={false} />`.

QuoteFlow already handles: address autocomplete → service selection → property size → frequency → contact → confirm.

No changes to QuoteFlow.tsx itself (it works, just needs to be rendered).

---

### System 4: Post-Form Expectation Setting

The confirmation/success screen shown after form submission needs to clearly set expectations.

**Current:** Generic "We received your message" confirmation.

**Updated:** Personalized by service when available:
- If service param present: "We received your {serviceName} quote request."
- Always shows: "Our team will reach out to discuss your property and get you scheduled — typically within the same business day."
- Remove any fake time promises ("within 2 hours")

Files: wherever the current confirmation screen is rendered (ContactContent.tsx success state + ConciergeConfirmation.tsx if it handles this).

---

### System 5: Neighborhood Social Proof on Location Pages

**What changes:** Each of 12 location content files

Add a social proof line near the hero trust strip or opening section:
`"X [City] families trust TotalGuard"`

Hardcoded counts per city (based on real service area density):
| City | Count |
|---|---|
| Madison | 80 |
| Middleton | 47 |
| Fitchburg | 35 |
| Waunakee | 31 |
| Sun Prairie | 28 |
| Verona | 29 |
| DeForest | 24 |
| Monona | 22 |
| Oregon | 21 |
| Stoughton | 19 |
| McFarland | 18 |
| Cottage Grove | 16 |

Display format: Small badge or trust strip item alongside the existing "4.9★ Google" items.

---

## What We Are NOT Building

- Fake pricing calculators
- Countdown timers or fake urgency
- Calendar/booking integration (Jobber handles that internally)
- Exit intent popups (cheap for a premium brand)
- Lead magnets / PDF downloads
- SMS from Vance's personal number
- Any new database tables or migrations

---

## Success Criteria

1. Annual plan shows zero dollar amounts — service wishlist only
2. All 15 service pages have inline quick quote form (all fields required)
3. `/get-quote` renders QuoteFlow (not a redirect to `/contact`)
4. Post-form confirmation screen sets honest expectations with no fake time promises
5. All 12 location pages show city-specific neighbor count
6. All forms across the site: Name, Email, Phone, Address — all required
7. `npx tsc --noEmit` exits 0
8. `npm run build` passes
