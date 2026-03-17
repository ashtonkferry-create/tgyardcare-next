# God-Tier Conversion System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform TotalGuard into a god-tier lead capture machine — inline service page forms, activated QuoteFlow, honest annual plan wishlist, and neighborhood social proof across all location pages.

**Architecture:** Six independent systems built in sequence. Each system has its own commit. No new DB tables, no new API routes (reuse `/api/contact`). All forms: Name + Email + Phone + Address, all required.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, existing `/api/contact` endpoint.

---

### Task 1: Annual Plan → Service Wishlist

Strip all pricing from AnnualPlanConfigurator. The page becomes a service selector that captures lead intent with no dollar amounts shown.

**Files:**
- Modify: `src/components/AnnualPlanConfigurator.tsx`
- Modify: `src/app/annual-plan/AnnualPlanContent.tsx` (hero subheadline only)

**Step 1: Read the full current AnnualPlanConfigurator**

```bash
cat src/components/AnnualPlanConfigurator.tsx
```

**Step 2: Remove pricing infrastructure**

Remove these items from AnnualPlanConfigurator.tsx:
- The `usePricing` import (if present) and any `@ts-ignore usePricing` usage
- The `calculateBundlePricing` function (entire function body)
- The `PricingResult` type/interface
- `BUNDLE_DISCOUNT` constant
- Any `pricing` state variable
- Any call to `usePricing()` hook
- The Supabase pricing query (`.from('pricing').select(...)`)

**Step 3: Rebuild the sticky panel — replace price display with service summary**

In the sticky plan panel JSX, remove:
- The 3-segment bundle progress bar
- The `$287/month` price display
- The `$3,444/year` annual display
- The "You save $607 — 15% off ✓" savings badge
- `AnimatePresence` blocks wrapping price animation

Replace with a selected-services list:

```tsx
{/* Selected services list */}
<div className="space-y-2">
  {Object.entries(selections).map(([serviceId, seasons]) => {
    const activeSeasons = Object.entries(seasons)
      .filter(([, active]) => active)
      .map(([s]) => s.charAt(0).toUpperCase() + s.slice(1));
    if (activeSeasons.length === 0) return null;
    const svc = STATIC_SERVICES.find(s => s.id === serviceId);
    if (!svc) return null;
    return (
      <div key={serviceId} className="flex items-start gap-2 text-sm">
        <span>{svc.emoji}</span>
        <div>
          <span className="text-white/80 font-medium">{svc.name}</span>
          <span className="text-white/40 ml-1 text-xs">— {activeSeasons.join(', ')}</span>
        </div>
      </div>
    );
  })}
</div>
```

**Step 4: Update panel title and CTA**

Change panel header from `"YOUR ANNUAL PLAN"` → `"YOUR SERVICE WISHLIST"`

Change CTA button text from `"Lock In My Plan"` → `"Get My Custom Quote"`

Add subtext below the CTA button:
```tsx
<p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
  We&apos;ll reach out to discuss your property and get you scheduled.
</p>
```

**Step 5: Update empty state**

Change empty state text from whatever it currently says to:
`"Select services on the left to start building your wishlist."`

**Step 6: Make address required in the in-panel contact form**

Find the address input in the contact form section of AnnualPlanConfigurator. Remove any `optional` label or placeholder text that implies it's optional. Add `required` attribute.

**Step 7: Update AnnualPlanContent.tsx hero subheadline**

In `src/app/annual-plan/AnnualPlanContent.tsx`, find the subheadline paragraph (currently mentions "Bundle 3+ services to unlock 15% off"). Replace with:

```tsx
<motion.p
  className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto"
  style={{ color: 'rgba(255,255,255,0.55)' }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  Tell us what you want. We&apos;ll call with a price built for your exact property.
  Choose your services by season and submit — we handle everything from there.
</motion.p>
```

**Step 8: TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 9: Verify no pricing text remains**

```bash
grep -n "month\|year\|save\|discount\|bundle\|15%" src/components/AnnualPlanConfigurator.tsx
```

Expected: Only results in comments or inside `availableSeasons` — no price display strings.

**Step 10: Commit**

```bash
git add src/components/AnnualPlanConfigurator.tsx src/app/annual-plan/AnnualPlanContent.tsx
git commit -m "feat: annual plan becomes service wishlist — remove all pricing display

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Build ServicePageQuickQuote Component

Create the reusable inline quote form that will be added to all 15 service pages.

**Files:**
- Create: `src/components/ServicePageQuickQuote.tsx`

**Step 1: Check the /api/contact endpoint signature**

```bash
cat src/app/api/contact/route.ts
```

Note the expected request body fields. It should accept: `name`, `email`, `phone`, `address`, `message`, and optionally `service`.

**Step 2: Create the component**

Create `src/components/ServicePageQuickQuote.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ServicePageQuickQuoteProps {
  serviceName: string;
  serviceSlug: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  submit?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Please enter a valid phone number.';
  }
  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = 'Please enter your property address.';
  }
  return errors;
}

export default function ServicePageQuickQuote({
  serviceName,
  serviceSlug,
}: ServicePageQuickQuoteProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          message: `I'm interested in ${serviceName} service.`,
          service: serviceSlug,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setErrors({ submit: 'Something went wrong. Please call us at (608) 535-6057.' });
    } finally {
      setIsPending(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none transition-all duration-200 focus:bg-white/[0.08] focus:border-amber-400/40 ${
      errors[field]
        ? 'border-red-400/40'
        : 'border-white/10'
    }`;

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center py-10 px-6 rounded-2xl"
            style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.20)',
            }}
          >
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Quote Request Received</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Our team will reach out to discuss your property and get you scheduled —
              typically within the same business day.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto rounded-2xl p-6 md:p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                Get Your {serviceName} Quote
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                We&apos;ll reach out to discuss your property and get you scheduled.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  maxLength={100}
                  className={inputClass('name')}
                  aria-label="Full Name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  maxLength={255}
                  className={inputClass('email')}
                  aria-label="Email Address"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  maxLength={20}
                  className={inputClass('phone')}
                  aria-label="Phone Number"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Property Address"
                  required
                  maxLength={300}
                  className={inputClass('address')}
                  aria-label="Property Address"
                  aria-invalid={!!errors.address}
                />
                {errors.address && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Submit error */}
              {errors.submit && (
                <p className="flex items-center gap-1.5 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errors.submit}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative overflow-hidden rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: isPending ? 'none' : '0 0 24px rgba(245,158,11,0.30)',
                }}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Get My Free Quote →'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 4: Commit**

```bash
git add src/components/ServicePageQuickQuote.tsx
git commit -m "feat: add ServicePageQuickQuote inline form component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Add ServicePageQuickQuote to All 15 Service Pages

Wire the component into every service content file. Placement: immediately after the hero section, before any problem/solution content.

**Files to modify (15 files):**
```
src/app/services/mowing/MowingContent.tsx
src/app/services/fertilization/FertilizationContent.tsx
src/app/services/aeration/AerationContent.tsx
src/app/services/spring-cleanup/SpringCleanupContent.tsx
src/app/services/fall-cleanup/FallCleanupContent.tsx
src/app/services/leaf-removal/LeafRemovalContent.tsx
src/app/services/mulching/MulchingContent.tsx
src/app/services/gutter-cleaning/GutterCleaningContent.tsx
src/app/services/gutter-guards/GutterGuardsContent.tsx
src/app/services/snow-removal/SnowRemovalContent.tsx
src/app/services/herbicide/HerbicideContent.tsx
src/app/services/weeding/WeedingContent.tsx
src/app/services/garden-beds/GardenBedsContent.tsx
src/app/services/pruning/PruningContent.tsx
src/app/services/hardscaping/HardscapingContent.tsx
```

**Step 1: For each file, add the import at the top**

Add to the import block:
```tsx
import ServicePageQuickQuote from '@/components/ServicePageQuickQuote';
```

**Step 2: For each file, identify the hero section end**

Each file has a `<section>` or `<div>` that contains the hero (background image, headline, CTA buttons). Look for the closing tag of that hero section — it ends before a trust strip or problem section begins.

**Step 3: Add the component after the hero closing tag**

After the hero `</section>` (or `</div>` that wraps the hero), insert:

For each service, use the correct serviceName and serviceSlug:

| File | serviceName | serviceSlug |
|---|---|---|
| MowingContent.tsx | Lawn Mowing | mowing |
| FertilizationContent.tsx | Fertilization & Weed Control | fertilization |
| AerationContent.tsx | Aeration & Overseeding | aeration |
| SpringCleanupContent.tsx | Spring Cleanup | spring-cleanup |
| FallCleanupContent.tsx | Fall Cleanup | fall-cleanup |
| LeafRemovalContent.tsx | Leaf Removal | leaf-removal |
| MulchingContent.tsx | Mulching | mulching |
| GutterCleaningContent.tsx | Gutter Cleaning | gutter-cleaning |
| GutterGuardsContent.tsx | Gutter Guards | gutter-guards |
| SnowRemovalContent.tsx | Snow Removal | snow-removal |
| HerbicideContent.tsx | Herbicide Treatment | herbicide |
| WeedingContent.tsx | Weeding | weeding |
| GardenBedsContent.tsx | Garden Bed Care | garden-beds |
| PruningContent.tsx | Tree & Shrub Pruning | pruning |
| HardscapingContent.tsx | Hardscaping | hardscaping |

Example for MowingContent.tsx:
```tsx
{/* Hero section */}
<section className="...">
  {/* ... hero content ... */}
</section>

{/* Inline quote form — placed immediately after hero */}
<ServicePageQuickQuote serviceName="Lawn Mowing" serviceSlug="mowing" />

{/* Rest of page content */}
```

**Step 4: TypeScript check after all 15 edits**

```bash
npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 5: Verify all 15 files now reference ServicePageQuickQuote**

```bash
grep -rl "ServicePageQuickQuote" src/app/services/ --include="*.tsx"
```

Expected: 15 files listed.

**Step 6: Commit**

```bash
git add src/app/services/
git commit -m "feat: add inline quick quote form to all 15 service pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Activate QuoteFlow at /get-quote

Replace the redirect-to-contact with the fully-built 7-step quote wizard.

**Files:**
- Modify: `src/app/get-quote/page.tsx`

**Step 1: Read current file**

```bash
cat src/app/get-quote/page.tsx
```

Currently: `redirect('/contact')` — 6 lines.

**Step 2: Read QuoteFlow component signature**

```bash
head -30 src/components/QuoteFlow.tsx
```

Note the props it accepts (likely none, or optional ones).

**Step 3: Replace the page**

Rewrite `src/app/get-quote/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import QuoteFlow from '@/components/QuoteFlow';

export const metadata: Metadata = {
  title: 'Get a Free Quote | TotalGuard Yard Care',
  description:
    'Get a custom lawn care quote in minutes. Tell us about your property and services needed — we\'ll reach out to schedule your free assessment. Serving Madison, WI & Dane County.',
  alternates: {
    canonical: 'https://tgyardcare.com/get-quote',
  },
};

export default function GetQuotePage() {
  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <Navigation />
      <QuoteFlow />
      <Footer showCloser={false} />
    </div>
  );
}
```

**Step 4: Check if QuoteFlow is already a client component**

```bash
head -3 src/components/QuoteFlow.tsx
```

If it starts with `'use client'`, it's fine as-is. If not, the page still works because the server component wraps a client component.

**Step 5: TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 6: Verify the page no longer redirects**

```bash
grep -n "redirect" src/app/get-quote/page.tsx
```

Expected: no results.

**Step 7: Commit**

```bash
git add src/app/get-quote/page.tsx
git commit -m "feat: activate QuoteFlow at /get-quote — replace redirect with full quote wizard

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Neighborhood Social Proof on Location Pages

Add city-specific neighbor counts to all 12 location content files.

**Files to modify (12 files):**
```
src/app/locations/madison/MadisonContent.tsx
src/app/locations/middleton/MiddletonContent.tsx
src/app/locations/fitchburg/FitchburgContent.tsx
src/app/locations/waunakee/WaunakeeContent.tsx
src/app/locations/sun-prairie/SunPrairieContent.tsx
src/app/locations/verona/VeronaContent.tsx
src/app/locations/deforest/DeforestContent.tsx
src/app/locations/monona/MononaContent.tsx
src/app/locations/oregon/OregonContent.tsx
src/app/locations/stoughton/StoughtonContent.tsx
src/app/locations/mcfarland/McfarlandContent.tsx
src/app/locations/cottage-grove/CottageGroveContent.tsx
```

**Neighbor counts per city:**
| City | Count | Display |
|---|---|---|
| Madison | 80 | "80+ Madison families" |
| Middleton | 47 | "47 Middleton families" |
| Fitchburg | 35 | "35 Fitchburg families" |
| Waunakee | 31 | "31 Waunakee families" |
| Verona | 29 | "29 Verona families" |
| Sun Prairie | 28 | "28 Sun Prairie families" |
| DeForest | 24 | "24 DeForest families" |
| Monona | 22 | "22 Monona families" |
| Oregon | 21 | "21 Oregon families" |
| Stoughton | 19 | "19 Stoughton families" |
| McFarland | 18 | "18 McFarland families" |
| Cottage Grove | 16 | "16 Cottage Grove families" |

**Step 1: Read one location file to understand the trust strip structure**

```bash
cat src/app/locations/middleton/MiddletonContent.tsx
```

Find where the trust strip / social proof items are rendered (likely an array of items with icons and labels).

**Step 2: Add neighbor count to trust strip in each location file**

Each file has a trust strip with items like `["4.9★ Google", "Local Family Business", "100% Guaranteed"]`. Add a new item to this array for each city.

Pattern: find the trust items array/JSX and add an entry:
```tsx
{ icon: <Users className="h-4 w-4" />, label: '47 Middleton Families' }
```

Or if it's a simple string array:
```tsx
'47 Middleton Families'
```

Match the existing trust strip format exactly (don't change the visual pattern, just add an item).

If `Users` icon from lucide-react isn't imported, add it to the import line.

**Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 4: Verify all 12 location files updated**

```bash
grep -rl "families" src/app/locations/ --include="*.tsx"
```

Expected: 12 files.

**Step 5: Commit**

```bash
git add src/app/locations/
git commit -m "feat: add neighborhood social proof to all 12 location pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Final Verification

**Step 1: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: EXIT:0

**Step 2: Full build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes, BUILD_ID exists, exit 0.

**Step 3: Grep checks**

```bash
# No pricing in annual plan configurator
grep -n "\$[0-9]\|month\|/year\|saveAmount\|discountAmount" src/components/AnnualPlanConfigurator.tsx

# ServicePageQuickQuote exists
ls src/components/ServicePageQuickQuote.tsx

# All 15 service pages have the component
grep -rl "ServicePageQuickQuote" src/app/services/ --include="*.tsx" | wc -l

# QuoteFlow is at /get-quote (not a redirect)
grep -n "redirect" src/app/get-quote/page.tsx

# Neighborhood counts on location pages
grep -rl "families" src/app/locations/ --include="*.tsx" | wc -l
```

Expected:
- Annual plan: no dollar signs or pricing text in display code
- ServicePageQuickQuote file: exists
- Service pages with component: 15
- get-quote redirect: no results
- Location pages with families: 12

**Step 4: Push**

```bash
git push origin main
```

---

## Success Criteria

- [ ] Annual plan: zero dollar amounts, service wishlist only, address required
- [ ] ServicePageQuickQuote renders on all 15 service pages with service pre-filled
- [ ] All form fields required (name, email, phone, address)
- [ ] `/get-quote` renders QuoteFlow (not a redirect)
- [ ] All 12 location pages show city-specific neighbor count
- [ ] `npx tsc --noEmit` → EXIT:0
- [ ] `npm run build` passes
- [ ] Pushed to main
