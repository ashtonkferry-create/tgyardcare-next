# Annual Plan Page — Billionaire Rebuild Design
Date: 2026-03-17
Status: Approved

---

## Problem Statement

The `/annual-plan` page has two hard failures:
1. **Services don't render** — `useServices()` hits Supabase on mount; if slow or empty, users see an indefinite skeleton with zero fallback. Fatal for conversion on a page whose entire value is interactivity.
2. **The configurator looks like a CRUD admin panel** — plain text rows, tiny pill toggles, no icons, no descriptions, no visual hierarchy. Nothing makes the user feel like they're building something premium.

Additionally, the standalone "annual plan" CTA banner inserted between `HowItWorks` and `LatestBlogPosts` on the homepage is contextually disconnected and visually inconsistent with the rest of the page.

---

## Site Placement Strategy

### What changes where

| Location | Change |
|---|---|
| `src/app/page.tsx` | Remove standalone inline annual-plan banner (lines 77–95). Add nothing new — FullSeasonContract handles it. |
| `src/components/FullSeasonContract.tsx` | Add secondary CTA "Or build your custom plan →" as a `Link` beside the existing gold button. This is the only homepage entry point. |
| `src/app/services/ServicesContent.tsx` | After the service category grids, add a "Bundle & Save 15%" callout strip with link to `/annual-plan`. |
| Individual service pages (all `*Content.tsx` files with service detail) | Add "Add to Your Annual Plan" CTA card near the bottom CTA section. Link to `/annual-plan`. |
| `src/app/annual-plan/*` | Complete rebuild — see below. |

### Why FullSeasonContract is the right homepage anchor
It already owns the "full year coverage" narrative with 4 season cards, a 12-month timeline bar, and benefit stats. Inserting the annual plan link there is contextually perfect — the user is already in "year-round" mindset. A secondary CTA (not competing with the gold primary) keeps conversion hierarchy clean.

---

## Annual Plan Page — Architecture

### File structure (no new files needed)
```
src/app/annual-plan/page.tsx          — Server Component, metadata (unchanged)
src/app/annual-plan/AnnualPlanContent.tsx  — Client island, complete rebuild
src/components/AnnualPlanConfigurator.tsx  — Complete rebuild
```

### Layout: Two-Column Sticky Configurator

```
┌─────────────────────────────────────────────────────────────┐
│  HERO — full-width, immersive                               │
│  Animated mesh bg + particles + headline + trust strip      │
├─────────────────────────────────────────┬───────────────────┤
│  SERVICE GRID (left, 2/3 width)         │ PLAN PANEL        │
│                                         │ (right, 1/3,      │
│  2×4 grid of service cards              │  sticky)          │
│  Each card:                             │                   │
│  - Icon + service name                  │ Progress bar      │
│  - One-line description                 │ Live price        │
│  - Season toggles (S/S/F/W pills)       │ Savings badge     │
│  - "All Year" shortcut                  │ Mini calendar     │
│  - Hover glow in season color           │ CTA button        │
│                                         │ Contact form      │
├─────────────────────────────────────────┴───────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

Mobile: Single column. Plan panel becomes sticky bottom bar (price + CTA visible at all times).

---

## Hero Section

**Background:** Animated gradient mesh — deep forest `#050d07` → `#0a1a0d` → `#020b05`, layered with a radial glow emanating from center. Floating particle system (20 small green orbs at 20–60% opacity, random drift animation via framer-motion). Subtle dot grid at 6% opacity.

**Content (centered):**
```
[Badge] CUSTOM ANNUAL LAWN CARE
[H1] Build Your Plan. Lock In Your Price.
[Sub] Choose your services by season and see your annual cost update in real time.
      Bundle 3+ services to save 15% — automatically applied.
[Trust strip] ★ 4.9 Google · 80+ Madison Families · 15% Bundle Savings · Fully Insured
[CTA] ↓ Start Building  (ghost button, scroll-anchors to configurator)
```

**Animations:**
- H1: blur-fade-in, stagger each word (50ms delay)
- Sub: fade up, 300ms delay
- Trust strip: fade in, 500ms delay
- Particles: continuous slow drift using `motion.div` with `animate` loop
- No skeleton, no loading state — hero renders server-side

---

## Service Cards (Left Column)

### Static fallback — renders immediately, no Supabase required
8 hardcoded services render on first paint. Supabase enriches them (description, pricing) when the query resolves.

```typescript
const STATIC_SERVICES = [
  { id: 'mowing',       name: 'Lawn Mowing',              icon: '🌿', desc: 'Weekly or bi-weekly cuts, edging & trimming included.',       availableSeasons: ['spring','summer','fall'] },
  { id: 'fertilization',name: 'Fertilization & Weed Control', icon: '🌱', desc: 'Customized treatment program for a thick, weed-free lawn.',   availableSeasons: ['spring','summer','fall'] },
  { id: 'aeration',     name: 'Aeration & Overseeding',   icon: '🌾', desc: 'Core aeration + seed for a dense, healthy lawn.',             availableSeasons: ['spring','fall'] },
  { id: 'spring-cleanup',name: 'Spring Cleanup',          icon: '🌸', desc: 'Full property reset after winter — debris, beds, edging.',     availableSeasons: ['spring'] },
  { id: 'fall-cleanup', name: 'Fall Cleanup',             icon: '🍂', desc: 'Leaf removal, bed clearing, and winter prep.',                 availableSeasons: ['fall'] },
  { id: 'mulching',     name: 'Mulching',                 icon: '🪵', desc: 'Fresh mulch installation for beds and trees.',                 availableSeasons: ['spring','fall'] },
  { id: 'snow-removal', name: 'Snow Removal',             icon: '❄️', desc: 'Driveway, walkway, and parking area snow & ice clearing.',     availableSeasons: ['winter'] },
  { id: 'gutter-cleaning',name: 'Gutter Cleaning',        icon: '🏠', desc: 'Full gutter flush, downspout clear, and debris removal.',      availableSeasons: ['spring','fall'] },
];
```

When `useServices()` resolves, merge real IDs/pricing onto the static list by slug matching.

### Card design
```
┌─────────────────────────────────────────┐
│ [Icon 32px]  Service Name               │
│              One-line description       │
│                                         │
│  [Spring] [Summer] [Fall] [Winter]      │
│  [All Year ↻]                           │
└─────────────────────────────────────────┘
```

**Inactive state:** Dark glass card `#111118`, border `rgba(255,255,255,0.08)`, icon muted gray.

**Active state (any season selected):** Card glows with the dominant selected season's color — `box-shadow: 0 0 32px {seasonColor}30`. Border brightens to `rgba(255,255,255,0.15)`. Icon becomes full color.

**Season pill states:**
- Inactive: `bg-white/5`, muted gray text, no border
- Active: `backgroundColor: seasonColor`, white text, `box-shadow: 0 0 10px {seasonColor}50`
- Hover: scale(1.05), brighten

**Unavailable season:** If the service doesn't make sense in that season (e.g., snow removal in summer), the pill is dimmed with `opacity: 0.3` and `cursor: not-allowed`. `availableSeasons` drives this.

**Card hover:** `translateY(-4px)`, border opacity increases. No glow until a season is selected.

**Animations:** Cards stagger-fade in on mount (60ms between cards).

---

## Sticky Plan Panel (Right Column)

### Panel structure
```
┌─────────────────────────────┐
│ YOUR ANNUAL PLAN             │
│ ─────────────────────────── │
│ Progress: ██░ 2/3 services  │  ← bundle progress bar
│ "Add 1 more for 15% off"    │
│ ─────────────────────────── │
│ ~$287/month                 │  ← animated number ticker
│ ~$3,444/year                │
│ [You save $607 — 15% off ✓] │  ← appears at 3+ services
│ ─────────────────────────── │
│ Your calendar:              │
│ [Jan][Feb][Mar][Apr]        │  ← 4-col mini calendar
│ [May][Jun][Jul][Aug]        │     dots = active services
│ [Sep][Oct][Nov][Dec]        │
│ ─────────────────────────── │
│ [Lock In My Plan ▶▶]        │  ← shimmer button
│ Or get exact quote →        │
└─────────────────────────────┘
```

**Design:** Glassmorphism — `background: rgba(255,255,255,0.04)`, `backdrop-blur: 20px`, `border: 1px solid rgba(255,255,255,0.10)`, `border-radius: 20px`.

**Sticky behavior:** `position: sticky; top: 24px` — stays in viewport as user scrolls the service grid.

**Price display:**
- Uses `framer-motion` `AnimatePresence` with `key={price}` to animate the number changing
- Monthly price in `text-5xl font-bold text-white`
- Annual in `text-lg text-gray-400`
- When discount active: original crossed out in gray, discounted in emerald with pulse badge

**Progress bar:** 3-segment bar. Fills one segment per service selected. Color transitions from gray → emerald. When full: green glow pulse.

**Mini calendar:** 12 cells in 4 columns. Each cell shows month name + colored dots for active services. Uses same `monthActiveServices` computation from current code.

**Empty state:** When no services selected: "Select services on the left to start building your plan." with a subtle dashed border prompt.

**CTA — "Lock In My Plan":**
- Shimmer button: `background: linear-gradient(135deg, #22c55e, #16a34a)` with moving shimmer overlay
- On hover: `scale(1.02)`, `box-shadow: 0 0 32px rgba(34,197,94,0.35)`
- Disabled state (no services): muted, `cursor: not-allowed`
- On click: contact form slides down below the panel via `AnimatePresence`

**Contact form (in-panel, slides in):**
- Appears below the CTA button inside the panel
- Short: First name, Last name, Email, Phone, Address (optional)
- Submit → shows success state in panel

**Mobile sticky bar:**
- At ≤768px, panel becomes a fixed bottom bar
- Shows: price + "Lock In My Plan" button
- On CTA click: full-screen modal with complete plan summary + form

---

## AnnualPlanConfigurator — Technical Changes

### Remove
- Section header ("Build Your Annual Plan") — duplicate of hero
- Old pricing card section wrapper
- Old form inputs (replace with panel)

### Add
- `STATIC_SERVICES` fallback
- `availableSeasons` per service
- Card-based service grid (2-col)
- Season pill disabled states
- Sticky plan panel with glassmorphism
- `framer-motion` number animation on price
- Mobile sticky bottom bar
- `AnimatePresence` on contact form slide-in

### Keep (unchanged)
- `useReducer` state management
- `TOGGLE_SERVICE_SEASON` / `TOGGLE_ALL_SEASONS` actions
- `calculateBundlePricing()` function
- `useSubmitLead` + lead capture logic
- All pricing math (Supabase pricing table)

---

## FullSeasonContract — Changes

### Only one change: add secondary CTA

After the existing gold "Lock In Full Season Coverage" button, add:

```tsx
<Link href="/annual-plan" className="...">
  <Sparkles className="h-4 w-4" />
  Or build your custom plan
  <ArrowRight className="h-4 w-4" />
</Link>
```

Style: outlined pill, `border: 1px solid rgba(212,168,85,0.25)`, `color: #D4A855` at 70% opacity. Subtler than the primary CTA — doesn't compete.

---

## Homepage page.tsx — Change

Remove the inline annual plan banner (lines 77–95) added in Phase 7. The FullSeasonContract secondary CTA replaces it in the right location.

---

## Services Page — Addition

After the last service category grid (before `TotalGuard Standard`), add a `BundleSavingsStrip` inline component:

```
┌─────────────────────────────────────────────────────────┐
│  💰  Bundle any 3+ services and save 15% automatically  │
│  Build your custom annual plan →                        │
└─────────────────────────────────────────────────────────┘
```

Style: Dark glass card spanning full width, emerald accent border-left, link to `/annual-plan`.

---

## Animations Summary

| Element | Animation |
|---|---|
| Hero headline | blur-fade-in, word stagger |
| Hero particles | continuous drift loop |
| Service cards | stagger fade-up on mount (60ms each) |
| Season pill toggle | color transition 200ms + glow scale |
| Card selection glow | color transition 300ms |
| Price number | AnimatePresence key-change fade/slide |
| Bundle progress bar | fill animation per service added |
| Discount badge | slide in from left, pulse dot |
| Contact form | AnimatePresence height + opacity |
| Plan panel (mobile) | slide up from bottom |

---

## TypeScript Constraints

- Zero new TS errors (currently at 0 after Phase 7)
- All event handlers typed explicitly
- `STATIC_SERVICES` as `const` array with `as const`
- Supabase `@ts-ignore` pattern maintained where needed
- No `any` types introduced

---

## Success Criteria

1. Services render immediately on page load (static fallback, no skeleton wait)
2. Service cards have icons, descriptions, and season-aware disabled pills
3. Sticky plan panel visible on desktop at all times while scrolling service grid
4. Price animates when services are toggled
5. Bundle discount badge appears at 3+ services with savings amount
6. Contact form slides in within the panel on CTA click
7. Mobile sticky bottom bar shows price + CTA
8. FullSeasonContract on homepage has secondary "build your custom plan" CTA
9. Standalone homepage banner removed
10. Services page has bundle savings strip
11. Build passes, 0 TypeScript errors
