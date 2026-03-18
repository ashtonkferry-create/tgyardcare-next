# Exit Intent Upsell System — Design Doc
_Date: 2026-03-18 | Status: Approved_

## Overview

A GOD TIER exit-intent popup system that surfaces the active promo deal when a user is about to leave the site. Reduces bounce rate through precision psychology — loss aversion, scarcity, local social proof — without ever feeling desperate or intrusive. Fully automatic: mirrors whatever the admin has live in the promo banner with zero additional config.

---

## Approach: "The Concierge"

Focused, centered modal card (480px desktop / bottom sheet mobile). Dark glassmorphism with seasonal glow border. The user sees the page blurred behind it — reinforcing they're about to leave something valuable.

---

## Visual Design

### Desktop Modal
- **Size**: 480px wide, centered vertically + horizontally
- **Card**: `bg-black/80 backdrop-blur-xl border border-[seasonal]/30`
- **Backdrop**: `bg-black/55 backdrop-blur-sm` — page remains visible (intentional)
- **Border glow**: animated shimmer pulse using current seasonal accent color
- **Dismiss**: × top-right. No dark patterns ("no thanks I hate saving money").

### Mobile Bottom Sheet
- Slides up from bottom edge
- 24px rounded top corners
- Pill drag handle indicator at top
- Full-width minus margins
- Swipe-down or × to dismiss

### Content Layout (top to bottom)
```
[×]
[service emoji]  [Service Name]
"Before you go..."
┌──────────────────────────────┐
│         15% OFF              │  ← seasonal color badge, subtle pulse
│  your Spring Cleanup service │
└──────────────────────────────┘
47 Madison homeowners booked this month
⏱  Offer expires in  02 : 14 : 33
[  Claim 15% Off — Get a Quote  ✦  ]   ← shimmer button, primary
       Explore Spring Cleanup →          ← ghost text link, secondary
```

### Seasonal Color Inheritance
Automatically inherits current season from `SeasonalThemeContext`:
- **Spring**: green accent glow + green badge
- **Summer**: gold accent glow + gold badge
- **Fall**: orange accent glow + orange badge
- **Winter**: cyan accent glow + cyan badge

---

## Animation

| Event | Spec |
|---|---|
| Open (desktop) | `scale(0.95) + opacity(0)` → `scale(1) + opacity(1)`, 280ms spring |
| Open (mobile) | `translateY(100%)` → `translateY(0)`, 350ms spring |
| Glow border | Continuous 3s shimmer pulse |
| Discount badge | 1.5s scale pulse (1.0 → 1.03 → 1.0), repeating |
| Dismiss | Reverse entrance, 180ms |

All animations respect `prefers-reduced-motion`.

---

## Psychology Stack

Applied in visual order:

1. **Service + emoji** — immediate relevance recognition
2. **"Before you go..."** — conversational interruption. Stops close reflex without aggression
3. **Discount badge** — loss aversion. The number they're about to leave behind
4. **Social proof** — `"[N] [city] homeowners booked this month"` — local anchor, neighbor validation
5. **Countdown timer** — real scarcity from promo duration, not fake urgency
6. **CTA: "Claim"** — implies discount is already theirs, just unclaimed
7. **Ghost secondary** — no-commitment option that keeps user on site

---

## System Architecture

```
Providers.tsx
  └── ExitIntentProvider  (global wrapper, mounts once)
        ├── useExitIntent()       — detection + gate logic
        ├── usePromoSettings()    — existing hook, shared with PromoBanner
        └── ExitIntentModal       — UI component
```

### Files to Create
| File | Purpose |
|---|---|
| `src/hooks/useExitIntent.ts` | Exit signal detection + gate logic |
| `src/components/ExitIntentModal.tsx` | Modal + bottom sheet UI |

### Files to Modify
| File | Change |
|---|---|
| `src/components/Providers.tsx` | Mount `ExitIntentProvider` globally |

---

## Detection Logic

### Desktop
```typescript
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 20) triggerModal(); // heading toward browser chrome
});
```

### Mobile
Upward scroll velocity trigger: user scrolling back toward top after ≥30% scroll depth.

### Gates (ALL must pass before modal fires)
```typescript
const canShow = (
  timeOnPage >= 15_000 &&          // ≥15s engagement
  scrollDepth >= 0.30 &&            // ≥30% page scrolled
  !sessionStorage.getItem('tg-exit-shown') &&   // once per session
  !localStorage.getItem('tg-converted') &&       // never show to converted users
  !isExcludedRoute(pathname)         // route guard
);
```

### Excluded Routes
- `/admin/*`
- `/portal/*`
- `/get-quote`
- `/contact`

---

## State Management

| Key | Storage | Value | Clears |
|---|---|---|---|
| `tg-exit-shown` | `sessionStorage` | `'true'` | On tab close |
| `tg-converted` | `localStorage` | `'true'` | Never |

`tg-converted` is set when `QuickQuoteDialog` fires its `onSubmitSuccess` callback.

---

## Data Flow

1. `ExitIntentModal` consumes `usePromoSettings()` — same hook as `PromoBanner`
2. Current active promo auto-populates: service name, discount, countdown, service path
3. **"Claim X% Off — Get a Quote"** → opens `QuickQuoteDialog` pre-populated with `{ service, discount }`
4. **"Explore [Service]"** → navigates to `promo.path`
5. **Quote submitted** → sets `localStorage['tg-converted']`
6. **Dismissed** → sets `sessionStorage['tg-exit-shown']`

Zero new form infrastructure. Zero new admin config. Fully automatic.

---

## Frequency Rules

| Scenario | Behavior |
|---|---|
| User dismisses | Won't show again this session |
| User submits a quote | Never shows again on this device |
| User returns next session | Shows again (new session = new opportunity) |
| User on excluded route | Never fires |
| User hasn't scrolled/waited | Never fires (engagement gates) |

---

## Success Metrics to Watch
- Quote form open rate from exit intent source
- Quote submission rate from exit intent source
- Bounce rate delta (Google Analytics / Vercel Analytics)
- Return session conversion rate
