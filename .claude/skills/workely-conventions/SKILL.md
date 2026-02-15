# Workely.AI Code Conventions

Use this skill when making any code change to the workely.ai project to ensure consistency.

## Data Access
- ALL database queries go through `src/lib/data/*` — NEVER inline Supabase calls in components or routes
- Import from data layer: `import { getLeads } from '@/lib/data/leads'`
- Data functions are server-only with `'use server'` or used in Server Components

## Authentication & Authorization
- Auth check: `getOrgContext()` returns `{ orgId, userId, role }` or redirects
- Every data query MUST be org-scoped — use the orgId from context
- Middleware handles session refresh: `src/lib/supabase/middleware.ts`
- Supabase clients: `client.ts` (browser), `server.ts` (RSC/actions), `admin.ts` (service role)

## Routing Architecture (Dual Layout)
- **V1 (current)**: `src/app/(app)/app/` — New pages go here
- **Legacy**: `src/app/(dashboard)/` — Existing pages being migrated
- V1 layout has Nebula theme, sidebar nav, org context provider
- Legacy layout is the original dashboard — do not add new features here

## Component Organization
- Dashboard components: `src/components/app/`
- Space/Nebula components: `src/components/space/`
- Shared UI primitives: `src/components/ui/`
- Page-specific components: colocated in the page's directory

## Mutations
- **Server Actions** for all user-triggered mutations
- Return `{ data, error }` objects — never throw errors
- Revalidate paths/tags after successful mutations
- API routes ONLY for: Stripe webhooks, n8n webhooks, external callbacks

## State Management
- Zustand for client-side state
- Store files: `src/lib/stores/`
- Keep stores minimal — prefer server state via RSC data fetching
- Optimistic updates in Zustand, rollback on server action failure

## TypeScript
- No `any` types — use proper interfaces/types
- No `as unknown as X` casts — fix the underlying type
- Shared types: `src/types/`
- Supabase types: auto-generated from schema

## Imports
- Path alias: `@/` maps to `src/`
- Example: `import { Button } from '@/components/ui/button'`
