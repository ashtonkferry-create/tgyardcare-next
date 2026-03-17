# SmartQuoteFlow — Billionaire Quote System Design
Date: 2026-03-17
Status: Approved (owner-directed)

---

## Vision

Every visitor on a service page gets a premium, guided quote experience that feels like a personal consultation — not a contact form. The system knows their property before they type a single number. Service-specific questions capture exactly what the team needs to price the job accurately. The whole thing takes under 60 seconds and feels like a $1B brand.

---

## Architecture

### Entry Points

**Service pages (15):**
Replace `ServicePageQuickQuote` inline form with a full-width CTA card. The card has the service name, a trust line, and one amber shimmer button: "Get My {Service} Quote →". Click opens `SmartQuoteFlow` as a full-screen overlay with the service pre-selected.

**`/get-quote` (full page):**
SmartQuoteFlow renders as a full page with an added Step 0: service picker grid (16 service cards with icons). User picks a service → slides to Step 1.

### Component Files

```
src/components/SmartQuoteFlow.tsx     — Main overlay component
src/lib/serviceQuestions.ts           — Service-specific question definitions
src/app/api/parcel-lookup/route.ts    — Server-side Dane County GIS lookup
```

---

## The 5-Step Flow (from service page)

```
Step 1: ADDRESS
"Where's your property?"
→ Google Places autocomplete (existing AddressAutocomplete component)
→ On select: animate "Analyzing your property..." loader
→ Call /api/parcel-lookup with lat/lng
→ Slide to Step 2

Step 2: PROPERTY CONFIRMED
"We found your property"
→ Show address, lot size, estimated turf area (lot - 800 sqft)
→ "Looks right?" → confirm button
→ Manual override: "Edit" opens sqft text input
→ Slide to Step 3

Step 3: SERVICE QUESTIONS
"A few quick questions about your {service}"
→ 1-2 service-specific questions (visual option cards)
→ Each question: 3-4 option cards with emoji icon + label + desc
→ Selecting an option auto-advances to next question
→ Slide to Step 4

Step 4: CONTACT INFO
"How should we reach you?"
→ Name, Email, Phone (all required)
→ Address pre-filled from Step 1
→ "Get My Quote →" submits to /api/contact
→ Slide to Step 5

Step 5: CONFIRMATION
"You're all set — we'll reach out today"
→ Premium summary card: address + service + selections
→ "Our team will review your property details and reach out within the same business day"
→ Animated checkmark + confetti
```

**Step 0 (at /get-quote only):**
Service picker grid — 16 service cards in a 4×4 grid. Each has emoji icon + name + one-line desc. Click a service → slides to Step 1 with that service pre-selected.

---

## Property Auto-Lookup

**API route:** `POST /api/parcel-lookup`
**Input:** `{ lat: number, lng: number }`
**Process:** Query Dane County GIS REST API by geographic point → return lot size in sqft
**Fallback:** If GIS fails or address is outside Dane County → return `null` → Step 2 shows manual sqft input instead

**Turf area calculation:** `turfArea = lotSizeSqft - 800`
(800 sqft average house footprint subtraction — covers most Madison single-family homes)

**Display:**
```
✓ 123 Main Street, Madison, WI
  Lot size: 8,400 sq ft
  Estimated turf area: ~7,600 sq ft
```

---

## Service-Specific Question Map

```typescript
mowing:           frequency (Weekly/Bi-Weekly/Monthly) + condition (Good/Needs Work/Overgrown)
fertilization:    lawn_health (Mostly Green/Patchy/Weed-Dominated) + pets (No Pets/Yes Pets)
aeration:         last_aeration (Within 2 Years/3+ Years/Never)
spring-cleanup:   trees (1-5/6-15/15+)
fall-cleanup:     trees (1-5/6-15/15+)
leaf-removal:     trees (1-5/6-15/15+)
mulching:         beds (1-2/3-5/6+)
gutter-cleaning:  stories (1/2/3+) + last_cleaned (< 1yr/1-3yrs/Never)
gutter-guards:    stories (1/2/3+)
snow-removal:     driveway (Single/Double/Long) + sidewalks (None/Front/Perimeter)
herbicide:        severity (Minor/Moderate/Severe)
weeding:          area (Beds/Edges/Both)
garden-beds:      beds (1-2/3-5/6+)
pruning:          plants (Shrubs/Trees/Both)
hardscaping:      project_type (Patio/Walkway/Wall/Multiple)
```

---

## Visual Design

### Overlay
- Full viewport overlay: `position: fixed; inset: 0; z-index: 9999`
- Background: `#050d07` with animated gradient mesh (radial glow from center)
- 16 deterministic floating particles (matching annual plan hero)
- Backdrop: `rgba(0,0,0,0.95)` beneath for the rest of the page

### Progress Bar
- Thin 2px bar at very top of overlay
- Fills left→right across steps 1-5
- Color: `#22c55e` (emerald) — matches service theme

### Service Badge (top left throughout flow)
```
[emoji] Service Name
```
Small pill, `rgba(255,255,255,0.08)` background, service accent color border

### Close Button
- Top right: X icon, `rgba(255,255,255,0.4)`, hover → white
- Clicking closes overlay (state is preserved if user re-opens in same session)

### Step Container
- `max-w-lg mx-auto` centered
- Each step slides in from right, slides out to left (framer-motion)
- Step title: `text-3xl font-bold text-white`
- Step subtitle: `text-sm text-white/45`

### Address Input (Step 1)
- Large, prominent: full-width input with search icon
- Matching site's existing AddressAutocomplete component
- On select: beautiful "Analyzing your property..." state
  - Animated rings/pulse in emerald
  - Text: "Fetching Dane County parcel data..."
  - Resolves in ~1s → slides to Step 2

### Property Card (Step 2)
- Glass card: `rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.10)`
- Checkmark icon in emerald circle
- Address bold, lot size + turf area in lighter text
- "Edit" link opens inline sqft input
- "Looks Right — Continue →" amber shimmer button

### Question Option Cards (Step 3)
- Grid: 3 cards per row (4 if 4 options)
- Each card: `96px tall`, glass background
- Emoji icon `text-2xl` centered at top
- Label `text-sm font-bold text-white` below
- Description `text-xs text-white/40` below that
- **Hover:** `translateY(-2px)`, border brightens, subtle glow
- **Selected:** emerald border, `rgba(34,197,94,0.08)` background, checkmark overlay
- Clicking a card immediately selects it and auto-advances after 300ms

### Contact Fields (Step 4)
- Same dark glass input style as ServicePageQuickQuote
- Name, Email, Phone — all required
- Address shown as read-only pre-filled field with lock icon
- Submit button: amber shimmer, full width

### Confirmation (Step 5)
- Large animated checkmark (framer-motion draw animation)
- Summary card showing: service, address, turf area, selections made
- "Our team will review your property details and reach out within the same business day."
- No fake time promises

### Mobile
- Full screen (no side margins on mobile)
- Option cards stack to 2-column grid
- Address autocomplete keyboard-aware (scroll to keep input above keyboard)
- Bottom navigation buttons fixed at viewport bottom on mobile

---

## Lead Submission

Uses `/api/contact` with:
```typescript
{
  name,
  email,
  phone,
  address,           // from Step 1
  service: serviceSlug,
  message: buildMessage(serviceSlug, selections, turfArea)
}
```

`buildMessage` produces:
```
"Quote request for {Service Name}.
Property: {address}
Lot size: {lotSqft} sq ft | Turf area: ~{turfSqft} sq ft
{question label}: {selected option label}
{question label}: {selected option label}"
```

This gives the team everything they need to prepare before calling.

---

## Service Page CTA Card (replaces ServicePageQuickQuote)

After the hero section, instead of an inline form, a premium CTA card:

```
┌─────────────────────────────────────────────────┐
│ 🌿  Get Your Lawn Mowing Quote                   │
│     Answer 5 quick questions — we'll call with   │
│     a price built for your exact property.       │
│                                                   │
│ [Get My Free Quote →]  📞 (608) 535-6057         │
│                                                   │
│ ★ 4.9 Google · 80+ Families · Same-Day Response │
└─────────────────────────────────────────────────┘
```

- Dark glass card, emerald accent border-left
- Amber shimmer button triggers SmartQuoteFlow overlay
- Phone link for users who'd rather call
- Trust strip underneath

---

## What We're NOT Building

- Fake price estimates displayed to users
- Any Dollar amounts
- Countdown timers
- Third-party paid APIs (Regrid, ATTOM) — Dane County GIS is free
- PDF downloads or lead magnets

---

## Success Criteria

1. SmartQuoteFlow opens as overlay from all 15 service pages
2. Dane County GIS lookup returns lot size for Madison-area addresses
3. Fallback to manual sqft input when GIS fails
4. Service-specific questions render correctly for all 15 services
5. Lead submitted with full property + selection details in message field
6. `/get-quote` renders SmartQuoteFlow with service picker (Step 0)
7. All contact fields required (Name, Email, Phone)
8. Mobile: full-screen, usable on 375px viewport
9. TypeScript clean, build passes
