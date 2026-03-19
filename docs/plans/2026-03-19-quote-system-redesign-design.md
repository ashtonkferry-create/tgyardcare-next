# Design: God-Tier Quote System Redesign

**Date**: 2026-03-19
**Status**: Approved
**Phase**: 10.2 (inserted decimal phase)

---

## Problem

The existing quote/CTA system fails on two dimensions:

1. **Visual**: The `ServicePageQuickQuote` section is a plain form card. The `ExitIntentModal` is acceptable but forgettable. Neither creates the shock-and-delight reaction a billion-dollar brand requires.
2. **Functional**: `SmartQuoteFlow` Step 1 has a "Skip" link that bypasses address — the most critical data point for accurate quoting. Service questions are too sparse (1–2 per service). `QuickQuoteDialog` has a broken submit path and no autocomplete.

---

## Strategy: Two-Tier System

| Entry Point | Flow | Friction | Goal |
|---|---|---|---|
| Exit intent modal | Name + Phone → callback | Ultra-low | Capture before they leave |
| Service page CTA section | Full SmartQuoteFlow (pre-loaded service) | Medium | Rich lead, accurate quote |
| Mobile sticky CTA bar | Full SmartQuoteFlow (service picker first) | Medium | Convert mobile browsers |
| /get-quote page | Full SmartQuoteFlow (service picker first) | Medium | Dedicated conversion page |

---

## Architecture: What Changes, What Stays

| Component | Change |
|---|---|
| `ServicePageQuickQuote.tsx` | Full rebuild — inline form removed, premium CTA section with one button → SmartQuoteFlow |
| `ExitIntentModal.tsx` | Visual overhaul + inline mini form (name+phone only) replaces QuickQuoteDialog |
| `SmartQuoteFlow.tsx` | Fix skip bug, add visual upgrades, add Special Notes step |
| `serviceQuestions.ts` | Add terrain, obstacles, gate access, overseeding, and application area questions |
| `MobileStickyCTA.tsx` | "Get Free Quote" opens SmartQuoteFlow instead of routing to /contact |
| `QuickQuoteDialog.tsx` | Retired — ExitIntentModal handles its own submission |
| `/api/contact` | Untouched |
| Supabase + n8n pipeline | Untouched |

---

## Component Designs

### 1. ServicePageQuickQuote — Premium CTA Section

**What it replaces**: The existing plain card form at the bottom of every service page.

**Layout** (desktop: 2-column, mobile: stacked):
- Left column: Clash Display headline "Get Your Free {serviceName} Quote", subtitle "Answer 4 quick questions — we'll call with a price built for your exact property.", 3 trust pills (★ 4.9 Google, 80+ Families, Same-Day Response), Nextdoor Fave badge
- Right column: Large amber shimmer CTA button "Get My Free Quote →", phone link below "(608) 535-6057"

**Visual**:
- Background: `#030c06` with animated emerald dot-pattern at 8% opacity
- Left section border: 4px emerald gradient glow strip (`#22c55e` → transparent)
- Button: amber/orange shimmer (`from-amber-500 to-orange-500`), scale 1.02 + amber glow on hover
- Section enters with stagger blur-fade on scroll

**Behavior**: Button opens `SmartQuoteFlow` with `serviceSlug` + `serviceName` pre-loaded. No inline form.

---

### 2. ExitIntentModal — Visual Overhaul + Mini Form

**Card**:
- Background: `#090d0a/97%` obsidian glass, `backdrop-blur-2xl`
- Border radius: 24px
- Double animated glow ring — outer pulses large+slow, inner pulses faster
- Top edge: 2px gradient shine strip `transparent → accent → transparent`
- Desktop: centered modal. Mobile: bottom sheet with 28px radius.

**Content** (top to bottom):
1. Service badge (larger pill, prominent glow border)
2. Discount in gradient text (3.5–4rem, 20% bigger than current)
3. Social proof: "47 Madison homeowners booked this week"
4. Countdown timer (keep existing)
5. Divider
6. **Mini form**: Full Name + Phone Number fields only
7. Submit button: full-width amber shimmer "Call Me With My Price →"
8. Ghost link: "Or call directly: (608) 535-6057"

**Submission**:
- POST `/api/contact` with:
  - `name`, `phone`
  - `email`: `"pending-callback@placeholder.tg"` (satisfies Zod validation, flagged internally)
  - `address`: `"To be confirmed via callback"`
  - `message`: `"Exit intent capture — ${promoDiscount} off ${promoService}. Customer requested callback."`
  - `service`: `promoService`
- Same Supabase + n8n pipeline — lead is created, nurture triggers

**Removes**: Dependency on `QuickQuoteDialog` entirely.

---

### 3. SmartQuoteFlow — Fixes + Enhancements

#### Bug Fix: Address Required
Remove "Skip — I'll enter my size manually" button from Step 1.

Replace with: If user has typed 5+ characters WITHOUT selecting an autocomplete result, show an explicit "Use This Address →" button that advances to Step 2 with `parcelLookupFailed: true`.

#### Visual Upgrades
- Progress bar: 4px thick, animated shimmer sweep, labeled step names below bar ("Address", "Property", "Details", "Contact")
- Step transitions: `x: 40 → 0 → -40` replaced with `y: 20 → 0 → -20` (more natural vertical flow)
- Option cards: on hover, soft emerald glow emanates behind card
- Service badge: 20% larger, stronger border glow

#### New Step: Special Notes (between questions and contact)
- Single full-width textarea
- Prompt: "Anything else we should know?"
- Placeholder: "Hills, narrow gates, pets in yard, timing preferences..."
- Optional — user can skip with "Skip →" ghost button
- Appended to `message` in submission

---

### 4. serviceQuestions.ts — New Questions

#### mowing (add 3 questions):
```
terrain: "Does your lawn have slopes or hills?"
  → Flat & Level | Mild Slopes | Steep Hills

obstacles: "Any obstacles we should know about?"
  → Open Lawn | Trees & Beds | Fences & Gates | Complex Layout

gate_access: "Is there gate access for our equipment?"
  → Open Access | Gate Present (we can handle) | Front Lawn Only
```

#### fertilization (add 1 question):
```
area: "Which areas need treatment?"
  → Full Property | Front Lawn Only | Back Lawn Only
```

#### aeration (add 2 questions):
```
overseed: "Do you want overseeding included?"
  → Yes — Seed + Aerate | Aeration Only

terrain: "Terrain type?"
  → Flat | Has Slopes | Steep Grade
```

#### spring-cleanup + fall-cleanup (add 1 each):
```
gate_access: "Gate access for our crew?"
  → Full Access | Gate Present | Front Only
```

#### All services: Special Notes step added universally (see above).

---

### 5. MobileStickyCTA — Quick Fix

Change "Get Free Quote" from `<Link href="/contact">` to `<button onClick={() => setQuoteOpen(true)}>`.

Add state `quoteOpen` + render `<SmartQuoteFlow serviceSlug="" serviceName="" serviceEmoji="" isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />`.

Visual upgrade: Thicker pill buttons with subtle glow border. Phone button gets soft pulsing ring on mobile.

---

## Data Flow (Unchanged)

```
Any CTA click
  ↓
SmartQuoteFlow OR ExitIntentModal mini form
  ↓
POST /api/contact
  ↓
Supabase leads table (status: 'new', source: 'contact_form')
  ↓
n8n webhook → Brevo → nurture sequence
  ↓
Confirmation email to customer + owner notification
```

---

## Success Criteria

1. `ServicePageQuickQuote` section looks premium — customer reaction is "wow"
2. Address cannot be skipped in SmartQuoteFlow
3. Mowing flow has 5 questions (frequency, condition, terrain, obstacles, gate access) + special notes
4. Exit intent mini form submits successfully to Supabase
5. `MobileStickyCTA` "Get Free Quote" opens SmartQuoteFlow (not /contact)
6. `tsc --noEmit` exits clean
7. Build passes

---

## Files Modified

- `src/components/ServicePageQuickQuote.tsx` — full rebuild
- `src/components/ExitIntentModal.tsx` — visual overhaul + inline mini form
- `src/components/SmartQuoteFlow.tsx` — fix skip bug, add Special Notes step, visual upgrades
- `src/lib/serviceQuestions.ts` — add 8 new questions across 5 services
- `src/components/MobileStickyCTA.tsx` — open SmartQuoteFlow instead of routing
- `src/components/QuickQuoteDialog.tsx` — retired (file kept but no longer imported)
