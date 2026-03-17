# Phase 7: Conversion Features - Research

**Researched:** 2026-03-17
**Domain:** Quote Calculator / Interactive Map / Annual Plan Configurator / Lead Capture
**Confidence:** HIGH (for stack and architecture); MEDIUM (for parcel API); LOW (for Mapbox free tier specifics)

---

## Summary

Phase 7 builds three interactive conversion tools on top of an already-substantial existing foundation. The codebase already has a working `QuoteFlow.tsx` multi-step form, a `useLeads` hook writing to Supabase, pricing data in the `pricing` table with tier/lot-size breakdowns, and 12 city `locations` entries with `geo_lat`/`geo_lng`. The service-areas page already lists all 12 cities and links to `/locations/{slug}` pages.

The three main new capabilities are: (1) address autocomplete + automated lot size lookup integrated into QuoteFlow, (2) an interactive Leaflet map replacing the current Google Maps `<iframe>` on the service-areas page, and (3) a new Annual Plan Configurator component that uses the existing `services`, `pricing`, and `seasonal_modifiers` Supabase tables.

The critical blocker identified in prior planning — whether a free Wisconsin parcel API exists for lot size lookup — has a definitive answer: **no direct free public REST API for Wisconsin/Dane County parcel data is reliably accessible**. The fallback approach (manual lot-size dropdown, which already exists in `QuoteFlow.tsx`) is the correct primary path. Address autocomplete should use Mapbox Geocoding v6 (free tier adequate for a small local business) with Nominatim as a zero-cost fallback for development/low volume.

**Primary recommendation:** Enhance `QuoteFlow.tsx` to add Mapbox address autocomplete as the first step, use the existing lot-size dropdown (already built) as the primary sizing method, build the Leaflet map as a direct replacement for the Google Maps iframe on `/service-areas`, and create `AnnualPlanConfigurator.tsx` as a new client component consuming existing Supabase pricing data.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-leaflet | v5.0.0 | Interactive map with polygon overlays, click events | MAP-02 explicitly requires Leaflet + OpenStreetMap. Peer deps: React 19 (already installed), Leaflet 1.9.4 |
| leaflet | 1.9.4 | Underlying map engine used by react-leaflet | Only stable release; v2.0.0-alpha not production-ready |
| @types/leaflet | latest | TypeScript definitions for Leaflet | Required for TS strict mode |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Mapbox Geocoding v6 | REST API | Address autocomplete for quote form | QUOTE-01 requires autocomplete. 10K free requests/month on Essentials plan. No npm package needed — raw fetch to `https://api.mapbox.com/search/geocode/v6/forward` |
| next/dynamic | built-in | SSR-disable wrapper for Leaflet map | Mandatory — Leaflet calls `window` on load, crashes SSR without this |

### Already Installed (No New Packages Needed)
| Library | Purpose | Used By |
|---------|---------|---------|
| @tanstack/react-query v5 | Server state, caching pricing data | All hooks already use it |
| framer-motion v12 | Real-time price transition animations | Plan configurator price updates |
| react-hook-form v7 | Form validation in quote flow | Already in package.json |
| zod v4 | Schema validation | Already in package.json |
| @supabase/ssr + supabase-js | Lead submission | `useLeads.ts` already works |
| date-fns | Calendar rendering in annual plan | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Mapbox Geocoding | Google Places Autocomplete | Google changed to per-SKU pricing (10K free/SKU). Mapbox simpler for just address lookup |
| Mapbox Geocoding | Nominatim (OSS) | Nominatim hard-rate-limited to 1 req/sec TOTAL across all users — cannot use in production |
| Mapbox Geocoding | geocode.maps.co | 25K req/month free but 1 req/sec after first few — unreliable for autocomplete typing UX |
| react-leaflet | Mapbox GL JS | Heavier bundle, requires paid API key for tiles. Requirements explicitly say Leaflet |
| react-leaflet | Google Maps JS API | Costs money; requirements explicitly say Leaflet + OpenStreetMap |

**Installation (only net-new packages):**
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

---

## Architecture Patterns

### Recommended Project Structure (new files only)
```
src/
├── components/
│   ├── QuoteFlow.tsx              # EXISTING — enhance, do not rewrite
│   ├── AddressAutocomplete.tsx    # NEW — Mapbox-powered address search
│   ├── ServiceAreaMap.tsx         # NEW — Leaflet map, next/dynamic wrapped
│   └── AnnualPlanConfigurator.tsx # NEW — multi-service, multi-season selector
├── app/
│   ├── service-areas/
│   │   └── ServiceAreasContent.tsx  # EXISTING — swap iframe for <ServiceAreaMap/>
│   └── get-quote/
│       └── GetQuoteContent.tsx      # EXISTING — unchanged, QuoteFlow handles it
├── lib/
│   └── geocoding.ts               # NEW — Mapbox API helper (server action)
└── data/
    └── daneCountyBoundaries.ts    # NEW — static GeoJSON for 12 city polygons
```

### Pattern 1: Address Autocomplete as a Server Action
**What:** Wrap the Mapbox Geocoding v6 call in a Next.js server action, keeping the API key server-side only. Client sends the query string; server returns address suggestions.

**When to use:** Any time an API key must stay secret. Client never sees the Mapbox token.

**Example:**
```typescript
// src/lib/geocoding.ts
'use server';

export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('MAPBOX_ACCESS_TOKEN not set');

  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', query);
  url.searchParams.set('access_token', token);
  url.searchParams.set('country', 'US');
  url.searchParams.set('types', 'address');
  url.searchParams.set('proximity', '-89.401,43.073'); // bias toward Madison WI
  url.searchParams.set('autocomplete', 'true');
  url.searchParams.set('limit', '5');

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await res.json();

  return data.features.map((f: MapboxFeature) => ({
    place_name: f.properties.full_address,
    center: f.geometry.coordinates, // [lng, lat]
  }));
}
```

**Note on lot size from Mapbox:** Mapbox Geocoding does NOT return parcel area/lot size. It returns address coordinates only. Lot size lookup from parcel data requires a separate API — which does not have a reliable free public endpoint for Wisconsin. **Use the existing manual dropdown as the primary path.** The address autocomplete only fills in the address fields and auto-selects the city from the location list.

### Pattern 2: Leaflet Map with Static GeoJSON City Boundaries
**What:** Render an interactive map where each of the 12 service cities is a clickable colored polygon. City boundaries sourced from US Census TIGER data (free, static file).

**When to use:** MAP-01 through MAP-05 requirements. Replaces the current Google Maps `<iframe>` in ServiceAreasContent.tsx.

**Critical SSR rule:** react-leaflet v5 requires React 19 (already installed) and is incompatible with SSR. The component MUST be wrapped with `next/dynamic` with `ssr: false`.

**Example:**
```typescript
// src/components/ServiceAreaMap.tsx
'use client';
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// daneCountyBoundaries contains GeoJSON coordinates for each city
// sourced from Census TIGER or overpass-turbo export (see Open Questions)
import { CITY_BOUNDARIES } from '@/data/daneCountyBoundaries';

export function ServiceAreaMap() {
  return (
    <MapContainer
      center={[43.073, -89.401]} // Madison WI center
      zoom={11}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {CITY_BOUNDARIES.map(city => (
        <Polygon
          key={city.slug}
          positions={city.coordinates}
          pathOptions={{ color: '#22c55e', fillOpacity: 0.2 }}
          eventHandlers={{
            click: () => window.location.href = `/locations/${city.slug}`,
          }}
        >
          <Tooltip permanent>{city.name}</Tooltip>
        </Polygon>
      ))}
    </MapContainer>
  );
}
```

```typescript
// src/app/service-areas/ServiceAreasContent.tsx — map section only
import dynamic from 'next/dynamic';

const ServiceAreaMap = dynamic(
  () => import('@/components/ServiceAreaMap').then(m => m.ServiceAreaMap),
  { ssr: false, loading: () => <div style={{ height: 600 }} className="animate-pulse bg-white/5 rounded-xl" /> }
);
```

### Pattern 3: Annual Plan Configurator State Architecture
**What:** Client component using `useReducer` for multi-dimensional state (services × seasons). Reads existing `services` and `pricing` tables. Price recalculates on every toggle.

**When to use:** PLAN-01 through PLAN-06. New component, does not touch QuoteFlow.

**State shape:**
```typescript
interface PlanState {
  selections: Record<string, Record<'spring' | 'summer' | 'fall' | 'winter', boolean>>;
  // serviceId → season → selected
  bundleDiscount: number; // 0.15 when 3+ services selected
}
```

**Why useReducer not useState:** Multiple interdependent state transitions (toggle service, toggle season, recalculate discount) are cleaner as reducer actions than nested setState calls.

**Bundle discount rule:** Apply 15% discount when user has selected 3+ distinct services across any season. This mirrors the existing frequency discount pattern in QuoteFlow.

### Pattern 4: QuoteFlow Address Step Enhancement
**What:** Add a new first step to QuoteFlow — "Your Address" — with Mapbox autocomplete. On selection, auto-populate `address`, `city`, `zip`, and attempt to match `locationId` against existing locations list. Then proceed to existing "service" step.

**CRITICAL:** QUOTE-07 says "Existing QuoteFlow.tsx enhanced (not rewritten)." Add the address step by inserting it at index 0 of the `STEPS` array and adding a new case in `renderStepContent`. Do not restructure the component.

**Step flow after enhancement:**
```
address (NEW) → service → property → frequency → pricing → contact → confirm
```

### Anti-Patterns to Avoid
- **Calling Nominatim directly from client-side code:** Rate limit is 1 req/sec globally across all users. Will get throttled or banned immediately.
- **Putting Mapbox token in client-side JS:** Use a server action or an API route. The token is a secret.
- **Importing Leaflet outside a client component:** Will crash Next.js build. Must be in `'use client'` file with `next/dynamic ssr: false` wrapper.
- **Rewriting QuoteFlow from scratch:** QUOTE-07 explicitly forbids this. All existing pricing logic must be preserved.
- **Hardcoding prices in the plan configurator:** PLAN-06 requires using Supabase pricing data. Query the `pricing` table.
- **Building parcel lookup infrastructure:** No free, reliable API exists for Wisconsin parcel data. The manual lot-size dropdown is the correct fallback per QUOTE-02.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Address autocomplete debouncing | Custom debounce hook | Use existing `useDeferredValue` (React 19, built-in) or a simple `useEffect` with 300ms timeout | React 19 has `useDeferredValue` built-in |
| Map tile server | Self-hosted tiles | OpenStreetMap CDN (`{s}.tile.openstreetmap.org`) | Free, no API key, attribution required |
| Address parsing | Custom regex parser | Mapbox response includes structured fields: `address_number`, `street`, `place`, `postcode` | Parsing addresses is notoriously error-prone |
| City polygon boundaries | Manual coordinate entry | Static GeoJSON file from Census TIGER or overpass-turbo export | 12 city shapes are static data, not dynamic |
| Real-time pricing engine | Custom calculation server | Client-side calculation using data from existing Supabase `pricing` table | Pricing logic already exists in `calculatePrice()` in QuoteFlow |
| Lead deduplication | Custom logic | Upsert on email+service combination in Supabase | DB handles this; don't build application-layer dedup |

---

## Common Pitfalls

### Pitfall 1: Leaflet CSS Not Loading
**What goes wrong:** Map tiles render but marker icons are broken or invisible. Map displays but looks unstyled.
**Why it happens:** Leaflet CSS must be imported in the client component file itself (`import 'leaflet/dist/leaflet.css'`). Next.js with App Router sometimes doesn't pick it up from global CSS.
**How to avoid:** Import `'leaflet/dist/leaflet.css'` directly in `ServiceAreaMap.tsx`.
**Warning signs:** Map container renders but shows blank/grey, or pins appear as broken images.

### Pitfall 2: Leaflet Marker Icon 404 in Next.js
**What goes wrong:** Default Leaflet marker icons (the blue teardrop) throw 404 errors because webpack changes the asset paths.
**Why it happens:** Leaflet internally references `/images/marker-icon.png` etc., which don't exist in the Next.js build output.
**How to avoid:** Don't use default Leaflet markers. Use `<Tooltip permanent>` labels directly on polygon overlays (no marker icons needed for this use case).
**Warning signs:** 404 errors in DevTools network tab for `marker-icon-2x.png`, `marker-shadow.png`.

### Pitfall 3: TypeScript Errors from Leaflet in strict mode
**What goes wrong:** `LatLngExpression` types conflict with plain `[number, number][]` coordinates from GeoJSON.
**Why it happens:** GeoJSON stores coordinates as `[lng, lat]` but Leaflet expects `[lat, lng]`. Also GeoJSON types don't automatically match `LatLngExpression`.
**How to avoid:** Reverse coordinates when consuming GeoJSON (`[coord[1], coord[0]]`). Cast polygon positions as `LatLngExpression[][]`. Current TS budget is 84/85 — this phase must add zero errors.
**Warning signs:** TS errors like "Argument of type 'number[][]' is not assignable to parameter of type 'LatLngExpression[]'".

### Pitfall 4: Mapbox Autocomplete Hammering the API
**What goes wrong:** Every keystroke fires a Mapbox API call, burning through the free tier.
**Why it happens:** No debounce on the input handler.
**How to avoid:** Debounce the server action call by 300ms. Only call when input length >= 3 characters.
**Warning signs:** Mapbox dashboard shows unexpectedly high request counts.

### Pitfall 5: Annual Plan Configurator Pricing Mismatch
**What goes wrong:** Prices shown in the configurator don't match prices in the QuoteFlow for the same service.
**Why it happens:** If the configurator uses hardcoded prices or a different calculation path than QuoteFlow.
**How to avoid:** Both components must query the same `pricing` Supabase table and use the same `formatPrice()` utility from `usePricing.ts`. Share the calculation helpers.

### Pitfall 6: Lead Capture Duplication
**What goes wrong:** "Lock In My Plan" (PLAN-05) and the existing QuoteFlow submit both call `useSubmitLead` but submit slightly different shapes, creating duplicate/inconsistent leads.
**Why it happens:** New component submits without all required fields (service_id, tier, etc.).
**How to avoid:** Annual Plan Configurator should capture the full `LeadInsert` shape from `useLeads.ts`, including all selected services as a serialized JSON string in the `notes` field (since leads table has a single `service_id` field, not multi-service).

---

## Code Examples

### Mapbox Address Autocomplete Component
```typescript
// Source: Mapbox Geocoding v6 docs + react-leaflet docs
'use client';
import { useState, useCallback } from 'react';
import { searchAddresses } from '@/lib/geocoding'; // server action

export function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (address: string, city: string, zip: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ place_name: string }[]>([]);
  const [open, setOpen] = useState(false);

  const handleChange = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 3) { setSuggestions([]); return; }
    // 300ms debounce handled by useEffect in full implementation
    const results = await searchAddresses(value);
    setSuggestions(results);
    setOpen(true);
  }, []);

  return (
    <div className="relative">
      <input value={query} onChange={e => handleChange(e.target.value)} />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-background border rounded-lg shadow-lg w-full mt-1">
          {suggestions.map(s => (
            <li key={s.place_name}
                className="px-4 py-2 hover:bg-accent cursor-pointer text-sm"
                onClick={() => {
                  // parse city/zip from place_name
                  onSelect(s.place_name, '', '');
                  setOpen(false);
                }}>
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Annual Plan Configurator Price Calculation
```typescript
// Source: existing calculatePrice() in QuoteFlow.tsx — adapted for multi-service
function calculateAnnualTotal(
  selections: PlanState['selections'],
  pricingData: Record<string, Pricing[]>
): { monthly: number; annual: number; savings: number } {
  let monthlyTotal = 0;
  const selectedServiceCount = Object.values(selections)
    .filter(seasons => Object.values(seasons).some(Boolean)).length;

  for (const [serviceId, seasons] of Object.entries(selections)) {
    const activeSeasons = Object.values(seasons).filter(Boolean).length;
    if (activeSeasons === 0) continue;

    const pricing = pricingData[serviceId] ?? [];
    const tierPricing = pricing.find(p => p.tier === 'better') ?? pricing[0];
    if (!tierPricing) continue;

    const basePrice = (tierPricing.price_min + tierPricing.price_max) / 2;
    // Weight by how many seasons it's active (out of 4)
    monthlyTotal += basePrice * (activeSeasons / 4);
  }

  const bundleDiscount = selectedServiceCount >= 3 ? 0.15 : 0;
  const discounted = monthlyTotal * (1 - bundleDiscount);
  const annual = discounted * 12;
  const savings = monthly * 12 - annual; // vs. non-bundled

  return { monthly: discounted, annual, savings };
}
```

### GeoJSON Coordinate Inversion Helper
```typescript
// Source: Leaflet docs — GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
function geoJsonToLeaflet(coords: number[][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Maps embed iframe | Leaflet + OSM (free) | Requirements explicitly call for this | Zero cost, full programmatic control |
| Manual address text input in QuoteFlow | Mapbox autocomplete + structured parse | Phase 7 | Removes friction, auto-fills city/zip |
| google.maps.places.Autocomplete | Mapbox Geocoding v6 | 2025 pricing change | Google now charges per SKU; Mapbox free tier sufficient |
| Leaflet 1.8 (was peer dep of react-leaflet v4) | Leaflet 1.9.4 (react-leaflet v5) | Dec 2024 | React 19 now required; already in this project |
| useQuery for pricing + manual price display | Same pattern for plan configurator | Existing | Reuse pattern, no new data-fetching approach |

**Deprecated/outdated:**
- `google.maps.places.Autocomplete` widget: Requires loading full Maps JS SDK, costs money per session. Avoid.
- Direct Nominatim calls from front-end: Rate-limited to 1 req/sec globally. Not viable for production.
- Wisconsin Parcel API via REST: No reliable free public endpoint confirmed after investigation. Use manual dropdown (already exists).

---

## Open Questions

1. **Dane County city boundary GeoJSON source**
   - What we know: Census TIGER has boundary data but the REST API query format for municipalities by county needed trial-and-error. Direct fetches to `tigerweb.geo.census.gov` returned "Failed to execute query" during research.
   - What's unclear: Whether a pre-built GeoJSON file for the 12 specific service cities exists publicly, or whether it needs to be manually assembled from overpass-turbo exports.
   - Recommendation: Use overpass-turbo.eu to export each city's administrative boundary as GeoJSON, then hardcode the simplified polygon coordinates into `src/data/daneCountyBoundaries.ts` as a static file. This is a one-time task. The 12 cities are static and won't change.

2. **Mapbox free tier exact count**
   - What we know: As of March 2025, Mapbox moved to "10K free calls per SKU monthly" on the Essentials plan. The Geocoding v6 endpoint (`/search/geocode/v6/forward`) is a single SKU.
   - What's unclear: Whether the "Essentials" plan requires a credit card on file or is truly zero-cost with no card needed.
   - Recommendation: Sign up for Mapbox, set up billing alert at $1, use 10K/month free tier. For a local lawn care business, typical traffic will be well under 1K geocoding requests/month. This is effectively free.

3. **Lead schema for multi-service annual plan**
   - What we know: `leads` table has a single `service_id` (FK to `services`), not an array. The annual plan configurator selects multiple services.
   - What's unclear: Whether to add a `selected_services jsonb` column to the leads table, or serialize into the `notes` field.
   - Recommendation: Add a `selected_services jsonb` column via migration. The `notes` field is a user-visible field and should not be overloaded with machine data. This keeps the admin leads panel accurate.

4. **WI Parcel API — is there any viable path?**
   - What we know: Dane County has a DCiMap viewer and an ArcGIS-backed GIS portal, but direct REST API access to parcel data was not confirmed during research (connection errors, auth walls). Regrid has a parcel API but is paid ($49+/month).
   - What's unclear: Whether Dane County's ArcGIS FeatureServer is publicly accessible without auth, and what parcel fields it exposes.
   - Recommendation: Treat parcel API as a future enhancement. For Phase 7, rely on the existing manual lot-size dropdown (already implemented in `QuoteFlow.tsx`). QUOTE-02 explicitly includes "with manual fallback dropdown if parcel lookup fails" — implement the fallback as the primary path.

---

## Sources

### Primary (HIGH confidence)
- react-leaflet official docs (react-leaflet.js.org) — v5 install, SSR incompatibility, MapContainer/Polygon/TileLayer API, eventHandlers pattern
- Leaflet 1.9.4 official docs (leafletjs.com/reference.html) — current version confirmed, CSS CDN URL confirmed
- Nominatim usage policy (operations.osmfoundation.org/policies/nominatim/) — 1 req/sec hard limit confirmed; production use discouraged
- Existing codebase audit (src/components/QuoteFlow.tsx, src/hooks/useLeads.ts, src/hooks/usePricing.ts, src/hooks/useLocations.ts, src/app/service-areas/ServiceAreasContent.tsx) — full understanding of existing data shapes and component structure

### Secondary (MEDIUM confidence)
- Mapbox Geocoding v6 docs (docs.mapbox.com/api/search/geocoding-v6/) — endpoint URL `https://api.mapbox.com/search/geocode/v6/forward` confirmed; `autocomplete` parameter confirmed
- Google Maps Platform pricing (mapsplatform.google.com/pricing) — 10K free calls/SKU/month as of March 2025 (confirmed new pricing model)
- Mapbox GL JS v3.20.0 confirmed current version from official guide

### Tertiary (LOW confidence)
- Mapbox 10K free tier for geocoding: Confirmed new pricing model exists but exact SKU count for Geocoding v6 specifically not shown in fetched content — assumed consistent with other SKUs
- Dane County GIS portal existence (dcimapapps.countyofdane.com, gis.countyofdane.com): Referenced by county website but connection refused/timed out during research; cannot confirm public API availability
- Wisconsin Parcel REST API: No working public endpoint found; connection refused on all attempted Dane County GIS URLs

---

## Metadata

**Confidence breakdown:**
- Standard stack (Leaflet, react-leaflet v5): HIGH — verified from official docs
- Address autocomplete approach (Mapbox): MEDIUM — endpoint format confirmed, free tier limits inferred from new pricing model structure
- Parcel API availability: LOW → confirmed NOT viable (all attempts failed; use manual fallback)
- Architecture patterns (SSR disable, server action for API key): HIGH — standard Next.js patterns, consistent with existing codebase
- Existing data shapes (leads, pricing, locations): HIGH — read directly from codebase
- City boundary GeoJSON sourcing: MEDIUM — overpass-turbo approach is standard but requires manual execution

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (libraries stable; Mapbox pricing may shift)
