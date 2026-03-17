---
phase: 07-conversion-features
plan: 01
subsystem: infra
tags: [leaflet, react-leaflet, mapbox, geocoding, geojson, supabase, migration]

# Dependency graph
requires:
  - phase: 05-safety-nets-foundation
    provides: TypeScript error budget baseline (84 errors)
  - phase: 06-brand-transformation
    provides: Server component patterns, brand design tokens
provides:
  - leaflet + react-leaflet installed and importable
  - Mapbox Geocoding v6 server action (searchAddresses)
  - Static GeoJSON city boundary data for 12 Dane County cities
  - leads.selected_services jsonb column (migration 073)
affects: [07-02 quote autocomplete, 07-03 interactive map, 07-04 annual plan configurator]

# Tech tracking
tech-stack:
  added: [leaflet@1.9.4, react-leaflet@5.0.0, @types/leaflet@1.9.21]
  patterns: [server-action geocoding, static GeoJSON boundary data]

key-files:
  created:
    - src/lib/geocoding.ts
    - src/data/daneCountyBoundaries.ts
    - supabase/migrations/073_add_selected_services_to_leads.sql
  modified:
    - package.json

key-decisions:
  - "Mapbox Geocoding v6 (not v5) for forward geocoding with autocomplete"
  - "Simplified rectangular polygons for city boundaries (not real GIS data) — sufficient for service area visualization"
  - "Server action pattern keeps MAPBOX_ACCESS_TOKEN off client bundle"

patterns-established:
  - "Server action geocoding: 'use server' + env var + graceful empty-array fallback"
  - "Static GeoJSON: typed CityBoundary interface with [lat,lng] Leaflet format"

# Metrics
duration: 4min
completed: 2026-03-17
---

# Phase 7 Plan 01: Shared Infrastructure Summary

**Leaflet packages installed, Mapbox geocoding server action created, 12-city boundary GeoJSON data built, leads.selected_services migration ready**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-17T15:28:29Z
- **Completed:** 2026-03-17T15:32:12Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Installed leaflet, react-leaflet, and @types/leaflet for interactive map support
- Created Mapbox Geocoding v6 server action with Madison WI proximity bias and graceful degradation
- Built static boundary data for all 12 Dane County service cities with green-shade palette
- Created migration 073 to add selected_services jsonb column to leads table

## Task Commits

Each task was committed atomically:

1. **Task 1: Install leaflet packages + create Mapbox geocoding server action** - `e36c910` (feat)
2. **Task 2: Create Dane County city boundaries data + DB migration** - `5206088` (feat)

## Files Created/Modified
- `src/lib/geocoding.ts` - Mapbox Geocoding v6 server action with searchAddresses export
- `src/data/daneCountyBoundaries.ts` - Static CityBoundary data for 12 Dane County cities
- `supabase/migrations/073_add_selected_services_to_leads.sql` - Add selected_services jsonb to leads
- `package.json` - Added leaflet, react-leaflet, @types/leaflet dependencies

## Decisions Made
- Used Mapbox Geocoding v6 API (latest) with proximity bias toward Madison WI (43.073, -89.401)
- Simplified rectangular polygons for city boundaries — real GIS data unnecessary for service area visualization
- Server action pattern ensures MAPBOX_ACCESS_TOKEN never exposed to client
- Green-shade color palette for city polygons matches TotalGuard brand

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

- **MAPBOX_ACCESS_TOKEN** environment variable must be set in `.env.local` for geocoding to work
- Migration 073 must be applied to production Supabase instance (`supabase db push` or manual SQL execution)

## Next Phase Readiness
- Plans 02 (quote autocomplete), 03 (interactive map), and 04 (annual plan configurator) are now unblocked
- All shared dependencies installed and typed
- Zero new TypeScript errors (budget remains at 84/85)

---
*Phase: 07-conversion-features*
*Completed: 2026-03-17*
