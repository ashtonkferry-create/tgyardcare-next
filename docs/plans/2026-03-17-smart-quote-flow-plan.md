# SmartQuoteFlow — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic 4-field ServicePageQuickQuote with a premium 5-step service-aware quote funnel that auto-looks up property size from Dane County GIS and captures service-specific data.

**Architecture:** Three new files (API route, question definitions, main component) + 15 service page edits + /get-quote page update.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Google Places API (already integrated in AddressAutocomplete), Dane County GIS REST API.

---

### Task 1: Create /api/parcel-lookup Route

**Files:**
- Create: `src/app/api/parcel-lookup/route.ts`

**Step 1: Research the Dane County GIS endpoint**

Run a test query in Node to find the correct endpoint:

```bash
# Test Dane County GIS - parcels by point (lat/lng for 123 Main St Madison area)
curl "https://gis.countyofdane.com/arcgis/rest/services/Parcel/MapServer/0/query?geometry=%7B%22x%22%3A-89.4012%2C%22y%22%3A43.0731%7D&geometryType=esriGeometryPoint&inSR=4326&outFields=*&f=json" 2>/dev/null | head -500
```

If that returns no data or 404, try:
```bash
curl "https://gis.countyofdane.com/arcgis/rest/services/" 2>/dev/null | head -200
```

Find the correct parcel service name and layer ID. Look for fields like `CALC_ACRES`, `SHAPE_Area`, or similar that give lot size.

**Step 2: Create the API route**

Create `src/app/api/parcel-lookup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Dane County GIS REST API — public parcel data
// Covers all of TotalGuard's service area (Dane County WI)
const DANE_COUNTY_GIS_BASE =
  'https://gis.countyofdane.com/arcgis/rest/services/Parcel/MapServer/0/query';

interface ParcelFeature {
  attributes: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body as { lat: number; lng: number };

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      geometry: JSON.stringify({ x: lng, y: lat }),
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      outFields: '*',
      returnGeometry: 'false',
      f: 'json',
    });

    const res = await fetch(`${DANE_COUNTY_GIS_BASE}?${params}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // cache for 1 hour — lot sizes don't change
    });

    if (!res.ok) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    const data = (await res.json()) as { features?: ParcelFeature[] };

    if (!data.features || data.features.length === 0) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    const attrs = data.features[0].attributes;

    // Try common field names for lot size in acres
    // Dane County GIS uses CALC_ACRES for calculated lot acreage
    const acresRaw =
      (attrs['CALC_ACRES'] as number | null) ??
      (attrs['SHAPE_Area'] as number | null) ??
      null;

    if (acresRaw === null) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    // Convert acres to sqft: 1 acre = 43,560 sqft
    // If the field is SHAPE_Area it may already be in sqft (check units from GIS)
    const lotSizeSqft = Math.round(Number(acresRaw) * 43560);

    // Sanity check — reject implausible values
    if (lotSizeSqft < 1000 || lotSizeSqft > 5_000_000) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    return NextResponse.json({ lotSizeSqft }, { status: 200 });
  } catch {
    // Never throw — always return gracefully so UI can fallback to manual input
    return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
  }
}
```

**IMPORTANT:** After writing the route, test the actual GIS endpoint with a known Madison address. If `CALC_ACRES` doesn't exist, inspect the actual field names from the response and update the route. If the GIS uses a different URL structure, adapt it. The goal is to return `lotSizeSqft: number | null` — the UI handles both cases.

**Step 3: TypeScript check**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare && npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 4: Commit**

```bash
git add src/app/api/parcel-lookup/route.ts
git commit -m "feat: add Dane County GIS parcel lookup API route

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create serviceQuestions.ts

**Files:**
- Create: `src/lib/serviceQuestions.ts`

**Step 1: Create the file**

```typescript
export interface QuestionOption {
  value: string;
  label: string;
  emoji: string;
  desc: string;
}

export interface ServiceQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

export const SERVICE_QUESTIONS: Record<string, ServiceQuestion[]> = {
  mowing: [
    {
      id: 'frequency',
      question: 'How often do you want your lawn mowed?',
      options: [
        { value: 'weekly', label: 'Weekly', emoji: '📅', desc: 'Best for fast-growing lawns' },
        { value: 'biweekly', label: 'Bi-Weekly', emoji: '🗓️', desc: 'Most popular choice' },
        { value: 'monthly', label: 'Monthly', emoji: '📆', desc: 'Light maintenance' },
      ],
    },
    {
      id: 'condition',
      question: "What's your lawn's current condition?",
      options: [
        { value: 'good', label: 'Well Maintained', emoji: '✅', desc: 'Regular upkeep, looking good' },
        { value: 'average', label: 'Needs Some Work', emoji: '⚠️', desc: 'A few patches, some weeds' },
        { value: 'overgrown', label: 'Overgrown', emoji: '🌿', desc: "Hasn't been cut in a while" },
      ],
    },
  ],
  fertilization: [
    {
      id: 'lawn_health',
      question: 'How would you describe your lawn?',
      options: [
        { value: 'good', label: 'Mostly Green', emoji: '💚', desc: 'Some thin spots, few weeds' },
        { value: 'average', label: 'Patchy & Thin', emoji: '🟡', desc: 'Needs thickening up' },
        { value: 'poor', label: 'Lots of Weeds', emoji: '🌾', desc: 'Weeds taking over' },
      ],
    },
    {
      id: 'pets',
      question: 'Do you have pets that use the lawn?',
      options: [
        { value: 'no', label: 'No Pets', emoji: '🏡', desc: 'Standard treatment program' },
        { value: 'yes', label: 'Yes, Pets', emoji: '🐕', desc: 'We use pet-safe products' },
      ],
    },
  ],
  aeration: [
    {
      id: 'last_aeration',
      question: 'When was your lawn last aerated?',
      options: [
        { value: 'recent', label: 'Within 2 Years', emoji: '✅', desc: 'Good rhythm' },
        { value: 'overdue', label: '3+ Years Ago', emoji: '⚠️', desc: 'Soil compaction likely' },
        { value: 'never', label: 'Never', emoji: '🌱', desc: 'First-time service' },
      ],
    },
  ],
  'spring-cleanup': [
    {
      id: 'trees',
      question: 'How many trees are on your property?',
      options: [
        { value: 'few', label: 'A Few (1–5)', emoji: '🌳', desc: 'Light leaf/debris volume' },
        { value: 'several', label: 'Several (6–15)', emoji: '🌲', desc: 'Moderate cleanup' },
        { value: 'many', label: 'Many (15+)', emoji: '🌲', desc: 'Heavy cleanup needed' },
      ],
    },
  ],
  'fall-cleanup': [
    {
      id: 'trees',
      question: 'How many trees drop leaves on your property?',
      options: [
        { value: 'few', label: 'A Few (1–5)', emoji: '🍂', desc: 'Light leaf volume' },
        { value: 'several', label: 'Several (6–15)', emoji: '🍁', desc: 'Moderate leaf fall' },
        { value: 'many', label: 'Many (15+)', emoji: '🌿', desc: 'Heavy leaf removal' },
      ],
    },
  ],
  'leaf-removal': [
    {
      id: 'trees',
      question: 'How many trees drop leaves on your property?',
      options: [
        { value: 'few', label: 'A Few (1–5)', emoji: '🍂', desc: 'Light volume' },
        { value: 'several', label: 'Several (6–15)', emoji: '🍁', desc: 'Moderate' },
        { value: 'many', label: 'Many (15+)', emoji: '🌿', desc: 'Heavy' },
      ],
    },
  ],
  mulching: [
    {
      id: 'beds',
      question: 'How many garden beds need mulching?',
      options: [
        { value: 'small', label: '1–2 Beds', emoji: '🌸', desc: 'Small project' },
        { value: 'medium', label: '3–5 Beds', emoji: '🌺', desc: 'Medium project' },
        { value: 'large', label: '6+ Beds', emoji: '🌻', desc: 'Large property' },
      ],
    },
  ],
  'gutter-cleaning': [
    {
      id: 'stories',
      question: 'How many stories is your home?',
      options: [
        { value: '1', label: '1 Story', emoji: '🏠', desc: 'Ranch or bungalow' },
        { value: '2', label: '2 Stories', emoji: '🏡', desc: 'Most common' },
        { value: '3+', label: '3+ Stories', emoji: '🏢', desc: 'Taller home' },
      ],
    },
    {
      id: 'last_cleaned',
      question: 'When were your gutters last cleaned?',
      options: [
        { value: 'recent', label: 'Within 1 Year', emoji: '✅', desc: 'Regular maintenance' },
        { value: 'medium', label: '1–3 Years Ago', emoji: '⚠️', desc: 'May have buildup' },
        { value: 'unknown', label: 'Never / Unknown', emoji: '❓', desc: 'Full clean needed' },
      ],
    },
  ],
  'gutter-guards': [
    {
      id: 'stories',
      question: 'How many stories is your home?',
      options: [
        { value: '1', label: '1 Story', emoji: '🏠', desc: 'Ranch or bungalow' },
        { value: '2', label: '2 Stories', emoji: '🏡', desc: 'Most common' },
        { value: '3+', label: '3+ Stories', emoji: '🏢', desc: 'Taller home' },
      ],
    },
  ],
  'snow-removal': [
    {
      id: 'driveway',
      question: "What's your driveway situation?",
      options: [
        { value: 'single', label: 'Single Car', emoji: '🚗', desc: 'Up to 12 ft wide' },
        { value: 'double', label: 'Double Car', emoji: '🚙', desc: '12–24 ft wide' },
        { value: 'long', label: 'Long Driveway', emoji: '🛣️', desc: 'Over 50 ft long' },
      ],
    },
    {
      id: 'sidewalks',
      question: 'Do you need sidewalks cleared?',
      options: [
        { value: 'none', label: 'No Sidewalks', emoji: '🏠', desc: 'Driveway only' },
        { value: 'front', label: 'Front Walk', emoji: '🚶', desc: 'Front path to door' },
        { value: 'full', label: 'Full Perimeter', emoji: '🔄', desc: 'All sidewalks' },
      ],
    },
  ],
  herbicide: [
    {
      id: 'severity',
      question: 'How bad is your weed problem?',
      options: [
        { value: 'minor', label: 'Minor', emoji: '🌱', desc: 'Scattered weeds' },
        { value: 'moderate', label: 'Moderate', emoji: '⚠️', desc: 'Noticeable coverage' },
        { value: 'severe', label: 'Severe', emoji: '🌾', desc: 'Weeds dominating' },
      ],
    },
  ],
  weeding: [
    {
      id: 'area',
      question: 'What needs weeding?',
      options: [
        { value: 'beds', label: 'Garden Beds', emoji: '🌸', desc: 'Flower/plant beds' },
        { value: 'edges', label: 'Lawn Edges', emoji: '✂️', desc: 'Along walkways/drive' },
        { value: 'both', label: 'Both', emoji: '🏡', desc: 'Full property' },
      ],
    },
  ],
  'garden-beds': [
    {
      id: 'beds',
      question: 'How many garden beds need care?',
      options: [
        { value: 'small', label: '1–2 Beds', emoji: '🌸', desc: 'Small project' },
        { value: 'medium', label: '3–5 Beds', emoji: '🌺', desc: 'Medium project' },
        { value: 'large', label: '6+ Beds', emoji: '🌻', desc: 'Large property' },
      ],
    },
  ],
  pruning: [
    {
      id: 'plants',
      question: 'What needs pruning?',
      options: [
        { value: 'shrubs', label: 'Shrubs Only', emoji: '🌿', desc: 'Bushes and hedges' },
        { value: 'trees', label: 'Trees Only', emoji: '🌳', desc: 'Small to medium trees' },
        { value: 'both', label: 'Both', emoji: '🌲', desc: 'Full property' },
      ],
    },
  ],
  hardscaping: [
    {
      id: 'project_type',
      question: 'What type of hardscaping project?',
      options: [
        { value: 'patio', label: 'Patio', emoji: '🪑', desc: 'Outdoor living space' },
        { value: 'walkway', label: 'Walkway', emoji: '🚶', desc: 'Path or steps' },
        { value: 'wall', label: 'Retaining Wall', emoji: '🧱', desc: 'Grade or erosion control' },
        { value: 'multiple', label: 'Multiple', emoji: '🏗️', desc: 'More than one type' },
      ],
    },
  ],
};

export function getServiceQuestions(serviceSlug: string): ServiceQuestion[] {
  return SERVICE_QUESTIONS[serviceSlug] ?? [];
}
```

**Step 2: TypeScript check**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare && npx tsc --noEmit 2>&1
```

**Step 3: Commit**

```bash
git add src/lib/serviceQuestions.ts
git commit -m "feat: add service-specific question definitions for SmartQuoteFlow

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Build SmartQuoteFlow Component

**Files:**
- Create: `src/components/SmartQuoteFlow.tsx`

**Step 1: Read AddressAutocomplete to understand its interface**

```bash
cat src/components/AddressAutocomplete.tsx
```

Note the props, especially: what callback does it fire on selection? Does it return a string or an object with lat/lng?

**Step 2: Create SmartQuoteFlow.tsx**

This is the main component. Build it with these exact requirements:

**Interface:**
```typescript
interface SmartQuoteFlowProps {
  serviceSlug: string;    // e.g. "mowing"
  serviceName: string;    // e.g. "Lawn Mowing"
  serviceEmoji: string;   // e.g. "🌿"
  isOpen: boolean;
  onClose: () => void;
  // When used at /get-quote with no pre-selected service, serviceSlug = ''
}
```

**State:**
```typescript
type Step = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = service picker (only at /get-quote)
// 1 = address
// 2 = property confirmed
// 3 = service questions (sub-indexed by currentQuestionIndex)
// 4 = contact info
// 5 = confirmation

interface FlowState {
  step: Step;
  currentQuestionIndex: number;  // which question in step 3
  address: string;
  lat: number | null;
  lng: number | null;
  lotSizeSqft: number | null;
  turfAreaSqft: number | null;
  isLookingUpParcel: boolean;
  parcelLookupFailed: boolean;
  manualSqft: string;
  selections: Record<string, string>;  // questionId → selectedValue
  contact: { name: string; email: string; phone: string };
  isSubmitting: boolean;
  submitError: string | null;
  // service (only used when step 0 is shown)
  selectedSlug: string;
  selectedName: string;
  selectedEmoji: string;
}
```

**All services list for Step 0 (service picker):**
```typescript
const ALL_SERVICES = [
  { slug: 'mowing', name: 'Lawn Mowing', emoji: '🌿' },
  { slug: 'fertilization', name: 'Fertilization & Weed Control', emoji: '🌱' },
  { slug: 'aeration', name: 'Aeration & Overseeding', emoji: '🌾' },
  { slug: 'spring-cleanup', name: 'Spring Cleanup', emoji: '🌸' },
  { slug: 'fall-cleanup', name: 'Fall Cleanup', emoji: '🍂' },
  { slug: 'leaf-removal', name: 'Leaf Removal', emoji: '🍁' },
  { slug: 'mulching', name: 'Mulching', emoji: '🪵' },
  { slug: 'gutter-cleaning', name: 'Gutter Cleaning', emoji: '🏠' },
  { slug: 'gutter-guards', name: 'Gutter Guards', emoji: '🛡️' },
  { slug: 'snow-removal', name: 'Snow Removal', emoji: '❄️' },
  { slug: 'herbicide', name: 'Herbicide Treatment', emoji: '🌿' },
  { slug: 'weeding', name: 'Weeding', emoji: '✂️' },
  { slug: 'garden-beds', name: 'Garden Bed Care', emoji: '🌺' },
  { slug: 'pruning', name: 'Tree & Shrub Pruning', emoji: '🌳' },
  { slug: 'hardscaping', name: 'Hardscaping', emoji: '🪨' },
];
```

**Step structure — build each step as a separate section in the render:**

**Step 0 (service picker):**
- Headline: "What service are you looking for?"
- Grid: 3 columns on desktop, 2 on mobile
- Each card: glass card, `emoji text-2xl`, `name text-sm font-semibold`
- Click → set selectedSlug/selectedName/selectedEmoji → setStep(1)

**Step 1 (address):**
- Headline: "Where's your property?"
- Subtext: "We'll look up your lot size automatically."
- Use AddressAutocomplete component (read its interface from Step 1 first)
- If AddressAutocomplete calls back with just a string address (no lat/lng), also use a hidden call to Google Geocoding or show manual sqft immediately
- If AddressAutocomplete gives lat/lng in its callback, use those to call /api/parcel-lookup
- On address selection → set isLookingUpParcel=true → call POST /api/parcel-lookup → setStep(2)
- "Skip — I'll enter manually" link → setParcelLookupFailed(true) → setStep(2)

**Parcel lookup flow:**
```typescript
const handleAddressSelect = async (addressData: { address: string; lat?: number; lng?: number }) => {
  setState(s => ({ ...s, address: addressData.address, isLookingUpParcel: true }));

  if (addressData.lat && addressData.lng) {
    try {
      const res = await fetch('/api/parcel-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: addressData.lat, lng: addressData.lng }),
      });
      const data = await res.json() as { lotSizeSqft: number | null };
      const lotSizeSqft = data.lotSizeSqft;
      const turfAreaSqft = lotSizeSqft ? Math.max(lotSizeSqft - 800, 500) : null;
      setState(s => ({
        ...s,
        lat: addressData.lat ?? null,
        lng: addressData.lng ?? null,
        lotSizeSqft,
        turfAreaSqft,
        isLookingUpParcel: false,
        parcelLookupFailed: !lotSizeSqft,
        step: 2,
      }));
    } catch {
      setState(s => ({ ...s, isLookingUpParcel: false, parcelLookupFailed: true, step: 2 }));
    }
  } else {
    setState(s => ({ ...s, isLookingUpParcel: false, parcelLookupFailed: true, step: 2 }));
  }
};
```

During lookup: show animated emerald rings + "Fetching your property details..." text. This replaces the address input while loading.

**Step 2 (property confirmed):**

If lotSizeSqft is available:
```
✓ 123 Main Street, Madison, WI
  Lot size: 8,400 sq ft
  Estimated turf area: ~7,600 sq ft
  [Edit size ↓]
```
Glass card, emerald checkmark icon.
"Edit size" expands a number input: `<input type="number" placeholder="Enter lot size in sq ft" />`

If parcelLookupFailed (or manual):
```
We couldn't auto-detect your lot size.
[Lot size: _______  sq ft]
(We'll subtract ~800 sq ft for your home's footprint)
Estimated turf area: ~{input - 800} sq ft (updates live)
```

"Looks Right — Continue →" amber button → setStep(3)

**Step 3 (service questions):**
- Get `questions = getServiceQuestions(activeSlug)` from serviceQuestions.ts
- Show one question at a time, indexed by `currentQuestionIndex`
- Question headline: `questions[currentQuestionIndex].question`
- Options: grid of cards (3-col desktop, 2-col mobile)
- Each option card: `emoji (2xl)` + `label (sm bold)` + `desc (xs muted)`
- On click: record selection, wait 300ms, then:
  - If more questions remain: increment currentQuestionIndex
  - If last question: setStep(4)
- If service has no questions (empty array): skip directly to step 4

**Step 4 (contact):**
- Headline: "How should we reach you?"
- Fields: Full Name (required), Email (required), Phone (required)
- Address displayed as read-only below: `🏠 {address}` in small muted text — not editable
- Submit button: "Get My Free Quote →"
- On submit: POST to /api/contact

Build the message string:
```typescript
function buildMessage(
  serviceName: string,
  lotSizeSqft: number | null,
  turfAreaSqft: number | null,
  selections: Record<string, string>,
  questions: ServiceQuestion[],
): string {
  const lines = [`Quote request for ${serviceName}.`];
  if (lotSizeSqft) {
    lines.push(`Property: ${lotSizeSqft.toLocaleString()} sq ft lot | ~${(turfAreaSqft ?? 0).toLocaleString()} sq ft turf area.`);
  }
  for (const q of questions) {
    const selectedValue = selections[q.id];
    if (selectedValue) {
      const option = q.options.find(o => o.value === selectedValue);
      if (option) {
        lines.push(`${q.question} → ${option.label}`);
      }
    }
  }
  return lines.join('\n');
}
```

POST body:
```typescript
{
  name: contact.name,
  email: contact.email,
  phone: contact.phone,
  address: address,
  service: activeSlug,
  message: buildMessage(activeName, lotSizeSqft, turfAreaSqft, selections, questions),
}
```

On success: setStep(5)
On error: setSubmitError('Something went wrong. Please call us at (608) 535-6057.')

**Step 5 (confirmation):**
- Large animated checkmark (motion.svg path draw animation)
- "You're All Set" headline
- Summary card:
  - Service: emoji + name
  - Property: address + turf area
  - Selections: each question answer
- Body: "Our team will review your property details and reach out within the same business day."
- "Back to Site" button → calls onClose()

**Overlay structure:**
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      key="smart-quote-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: '#050d07' }}
    >
      {/* Animated background */}
      {/* Progress bar */}
      {/* Close button */}
      {/* Service badge */}
      {/* Step content with AnimatePresence slide transitions */}
    </motion.div>
  )}
</AnimatePresence>
```

**Progress bar:**
- `position: fixed; top: 0; left: 0; height: 2px; background: #22c55e`
- Width: `${(step / 5) * 100}%` (or `${((step - 1) / 4) * 100}%` for steps 1-5)
- Animated with `motion.div`

**Step transitions:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={`step-${step}-${currentQuestionIndex}`}
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {/* current step content */}
  </motion.div>
</AnimatePresence>
```

**Back button:**
- Shows on steps 2-4 (not on 1 or 5)
- `←  Back` — small, `text-white/40`, hover → white
- onClick: decrement step (if step 3 and currentQuestionIndex > 0, decrement index first)

**Floating particles (deterministic, matching annual plan):**
Use 8 particles instead of 16 — lighter background effect. Same `motion.div` drift pattern.

**Step 3: TypeScript check**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare && npx tsc --noEmit 2>&1
```

Fix all errors. This component is complex — common issues:
- AddressAutocomplete callback type mismatch → adapt to actual interface
- `Record<string, string>` access on unknown question IDs → use optional chaining
- `motion.svg` path animation → ensure SVG types are correct

**Step 4: Commit**

```bash
git add src/components/SmartQuoteFlow.tsx
git commit -m "feat: build SmartQuoteFlow — 5-step service-aware quote funnel with property lookup

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Replace ServicePageQuickQuote with SmartQuoteFlow on All Service Pages

**Strategy:** Replace the inline form with a premium CTA card that opens SmartQuoteFlow as an overlay.

**Files to modify (15 content files):**
```
src/app/services/mowing/MowingContent.tsx          (emoji: 🌿)
src/app/services/fertilization/FertilizationContent.tsx (emoji: 🌱)
src/app/services/aeration/AerationContent.tsx      (emoji: 🌾)
src/app/services/spring-cleanup/SpringCleanupContent.tsx (emoji: 🌸)
src/app/services/fall-cleanup/FallCleanupContent.tsx   (emoji: 🍂)
src/app/services/leaf-removal/LeafRemovalContent.tsx   (emoji: 🍁)
src/app/services/mulching/MulchingContent.tsx      (emoji: 🪵)
src/app/services/gutter-cleaning/GutterCleaningContent.tsx (emoji: 🏠)
src/app/services/gutter-guards/GutterGuardsContent.tsx (emoji: 🛡️)
src/app/services/snow-removal/SnowRemovalContent.tsx   (emoji: ❄️)
src/app/services/herbicide/HerbicideContent.tsx    (emoji: 🌿)
src/app/services/weeding/WeedingContent.tsx        (emoji: ✂️)
src/app/services/garden-beds/GardenBedsContent.tsx (emoji: 🌺)
src/app/services/pruning/PruningContent.tsx        (emoji: 🌳)
src/app/services/hardscaping/HardscapingContent.tsx (emoji: 🪨)
```

**For each file, make these changes:**

**A. Replace import:**
```tsx
// Remove:
import ServicePageQuickQuote from '@/components/ServicePageQuickQuote';
// Add:
import SmartQuoteFlow from '@/components/SmartQuoteFlow';
```

**B. Add state at the top of the component function:**
```tsx
const [quoteOpen, setQuoteOpen] = useState(false);
```
Add `useState` to the React import if not already there.

**C. Replace the `<ServicePageQuickQuote ... />` with the CTA card + overlay:**

```tsx
{/* Smart Quote CTA */}
<section className="container mx-auto px-4 py-10 md:py-14">
  <div
    className="max-w-xl mx-auto rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderLeft: '4px solid #22c55e',
    }}
  >
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-lg font-bold text-white">Get Your {serviceName} Quote</h2>
      </div>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Answer 5 quick questions — we&apos;ll call with a price built for your exact property.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span>★ 4.9 Google</span>
        <span>·</span>
        <span>80+ Families</span>
        <span>·</span>
        <span>Same-Day Response</span>
      </div>
    </div>
    <div className="flex flex-col gap-3 w-full md:w-auto">
      <button
        onClick={() => setQuoteOpen(true)}
        className="relative overflow-hidden rounded-xl px-6 py-3.5 text-sm font-bold text-white whitespace-nowrap transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          boxShadow: '0 0 24px rgba(245,158,11,0.30)',
        }}
      >
        Get My Free Quote →
      </button>
      <a
        href="tel:6085356057"
        className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        📞 (608) 535-6057
      </a>
    </div>
  </div>
</section>

<SmartQuoteFlow
  serviceSlug="{serviceSlug}"
  serviceName="{serviceName}"
  serviceEmoji="{emoji}"
  isOpen={quoteOpen}
  onClose={() => setQuoteOpen(false)}
/>
```

Replace `{emoji}`, `{serviceName}`, `{serviceSlug}` with the correct values for each file per the table above.

**Step 1: Read MowingContent.tsx first to verify the exact pattern, then apply to all 15**

**Step 2: TypeScript check**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare && npx tsc --noEmit 2>&1
```

Must exit 0.

**Step 3: Verify**

```bash
grep -rl "SmartQuoteFlow" src/app/services/ --include="*.tsx" | wc -l
# Expected: 15
grep -rn "ServicePageQuickQuote" src/app/services/ --include="*.tsx"
# Expected: 0 results (fully replaced)
```

**Step 4: Commit**

```bash
git add src/app/services/
git commit -m "feat: replace ServicePageQuickQuote with SmartQuoteFlow CTA on all service pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Update /get-quote to Use SmartQuoteFlow with Service Picker

**Files:**
- Modify: `src/app/get-quote/page.tsx`

**Step 1: Read current file**

```bash
cat src/app/get-quote/page.tsx
```

Currently renders `<QuoteFlow />` (which is the old multi-step wizard).

**Step 2: Replace QuoteFlow with SmartQuoteFlow**

Rewrite to use SmartQuoteFlow in "always open, no service pre-selected" mode (starts at Step 0 — service picker):

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';

// Note: metadata must be in a separate server component or page.tsx
// Since SmartQuoteFlow needs client state, wrap differently:

export default function GetQuotePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <Navigation />
      {mounted && (
        <SmartQuoteFlow
          serviceSlug=""
          serviceName=""
          serviceEmoji=""
          isOpen={true}
          onClose={() => {}} // no-op: can't close on /get-quote page
        />
      )}
    </div>
  );
}
```

**IMPORTANT:** Since this page uses client state, move metadata to a separate server component OR keep the page as a server component and extract the client logic. The simplest approach:

Keep `page.tsx` as a server component with metadata. Create `GetQuoteContent.tsx` as a client component. Import `GetQuoteContent` into `page.tsx`.

`src/app/get-quote/GetQuoteContent.tsx`:
```tsx
'use client';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';

export default function GetQuoteContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <Navigation />
      {mounted && (
        <SmartQuoteFlow
          serviceSlug=""
          serviceName=""
          serviceEmoji=""
          isOpen={true}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
```

`src/app/get-quote/page.tsx`:
```tsx
import type { Metadata } from 'next';
import GetQuoteContent from './GetQuoteContent';

export const metadata: Metadata = {
  title: 'Get a Free Quote | TotalGuard Yard Care',
  description:
    "Get a custom lawn care quote in minutes. We'll look up your property and ask the right questions — then call you with an accurate price. Serving Madison, WI & Dane County.",
  alternates: { canonical: 'https://tgyardcare.com/get-quote' },
};

export default function GetQuotePage() {
  return <GetQuoteContent />;
}
```

**When SmartQuoteFlow receives `serviceSlug=""`, it starts at Step 0 (service picker) instead of Step 1.**
Update SmartQuoteFlow to handle this: `const startStep = serviceSlug ? 1 : 0;` — use this as initial step state.

**Step 3: TypeScript check**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare && npx tsc --noEmit 2>&1
```

**Step 4: Commit**

```bash
git add src/app/get-quote/
git commit -m "feat: update /get-quote to use SmartQuoteFlow with service picker

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Final Verification

**Step 1: Full TypeScript check**

```bash
cd c:/Users/vance/OneDrive/Desktop/claude-workspace/tgyardcare && npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 2: Full build**

```bash
npm run build 2>&1 | tail -30
```

Expected: passes, BUILD_ID exists.

**Step 3: Grep checks**

```bash
# SmartQuoteFlow on all 15 service pages
grep -rl "SmartQuoteFlow" src/app/services/ --include="*.tsx" | wc -l
# Expected: 15

# No remaining ServicePageQuickQuote on service pages
grep -rn "ServicePageQuickQuote" src/app/services/ --include="*.tsx"
# Expected: 0 results

# Parcel lookup route exists
ls src/app/api/parcel-lookup/route.ts

# Service questions file exists
ls src/lib/serviceQuestions.ts

# /get-quote renders SmartQuoteFlow
grep -n "SmartQuoteFlow" src/app/get-quote/GetQuoteContent.tsx
```

**Step 4: Push**

```bash
git push origin main
```

---

## Success Criteria

- [ ] `/api/parcel-lookup` returns `{ lotSizeSqft: number }` for a Madison WI address
- [ ] SmartQuoteFlow opens as overlay from all 15 service pages
- [ ] Step 0 (service picker) shown at `/get-quote`
- [ ] Steps 1-5 animate correctly with slide transitions
- [ ] Service-specific questions appear in Step 3 for every service
- [ ] Contact step submits to `/api/contact` with full property + selection data in message
- [ ] Fallback to manual sqft when GIS lookup fails
- [ ] TypeScript: EXIT:0
- [ ] Build: passes
- [ ] Pushed to main
