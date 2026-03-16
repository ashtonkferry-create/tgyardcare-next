---
phase: 05-safety-nets-foundation
plan: 04
subsystem: auth
tags: [supabase-ssr, middleware, auth, cookies, next.js]

# Dependency graph
requires:
  - phase: 05-safety-nets-foundation
    provides: "Existing middleware with 410 Gone + redirect logic"
provides:
  - "@supabase/ssr server client (cookie-based auth for Server Components)"
  - "@supabase/ssr browser client (cookie-based auth for Client Components)"
  - "Auth middleware protecting /portal/* and /admin/* routes"
affects: [phase-7-portal, phase-8-retention, admin-pages]

# Tech tracking
tech-stack:
  added: ["@supabase/ssr@0.9.0"]
  patterns: ["cookie-based Supabase auth via @supabase/ssr", "middleware auth guard with cookie detection"]

key-files:
  created:
    - src/lib/supabase/server.ts
    - src/lib/supabase/client.ts
  modified:
    - src/middleware.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Cookie-based auth detection in middleware (not full Supabase client in middleware)"
  - "Old client at src/integrations/supabase/client.ts left untouched for 57+ existing imports"
  - "Explicit matcher entries (/admin/:path*, /portal/:path*) instead of modifying existing catch-all"

patterns-established:
  - "New server code imports from src/lib/supabase/server.ts (async createClient)"
  - "New client code imports from src/lib/supabase/client.ts (sync createClient)"
  - "Auth middleware checks for -auth-token cookie, redirects to /admin/login with redirect param"

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 5 Plan 4: Supabase SSR Clients + Auth Middleware Summary

**@supabase/ssr server + browser clients with cookie-based auth middleware protecting /portal/* and /admin/* routes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-16T23:27:58Z
- **Completed:** 2026-03-16T23:31:15Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Installed @supabase/ssr v0.9.0 for proper cookie-based Supabase auth
- Created server-side client (src/lib/supabase/server.ts) using createServerClient + cookies()
- Created browser client (src/lib/supabase/client.ts) using createBrowserClient
- Added auth middleware for /portal/* and /admin/* with redirect to /admin/login
- Preserved all existing middleware logic (410 Gone, www redirect, dynamic redirects)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @supabase/ssr and create server + browser clients** - `864c4a3` (feat)
2. **Task 2: Add auth middleware for /portal/* and /admin/* routes** - `9296533` (feat)

## Files Created/Modified
- `src/lib/supabase/server.ts` - Server-side Supabase client factory using createServerClient + cookies()
- `src/lib/supabase/client.ts` - Browser Supabase client factory using createBrowserClient
- `src/middleware.ts` - Auth check for protected routes added after existing 410/redirect logic
- `package.json` - Added @supabase/ssr dependency
- `package-lock.json` - Lock file updated

## Decisions Made
- **Cookie detection over full Supabase client in middleware:** Middleware checks for `-auth-token` cookie presence rather than instantiating a full Supabase client. This is lighter weight; actual auth verification happens in page components via the server client.
- **Explicit matcher entries:** Added `/admin/:path*` and `/portal/:path*` as separate matcher entries rather than modifying the existing catch-all pattern. Safer approach that preserves existing behavior.
- **Old client untouched:** `src/integrations/supabase/client.ts` (57+ imports) left as-is. New code uses the new clients; migration happens in a later plan.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Server + browser Supabase clients ready for use in portal/admin pages
- Auth middleware provides redirect guard; page-level auth verification via server client is the next step
- Old client coexists safely for gradual migration

---
*Phase: 05-safety-nets-foundation*
*Completed: 2026-03-16*
