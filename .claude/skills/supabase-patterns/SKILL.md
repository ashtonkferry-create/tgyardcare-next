---
name: supabase-patterns
description: Supabase database patterns, migrations, RLS policies, and auth flows for workely.ai. Use when creating tables, writing migrations, fixing RLS, or working with auth.
---

# Supabase Patterns — Workely.AI

Use this skill when working with database, migrations, RLS policies, or auth.

## Project
- Ref: `fvjeweajwwktipiifxua`
- 30+ tables with org-aware RLS

## Client Setup
- Browser client: `src/lib/supabase/client.ts` — for client components (limited, RLS-enforced)
- Server client: `src/lib/supabase/server.ts` — for RSC and Server Actions (cookie-based auth)
- Admin client: `src/lib/supabase/admin.ts` — service role, bypasses RLS (background jobs only)
- Middleware: `src/lib/supabase/middleware.ts` — refreshes auth session on every request

## Org-Aware RLS Pattern (from migration 025)
Every user-facing table follows this pattern:
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Read: org members can see their org's data
CREATE POLICY "org_read" ON table_name
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Write: org members can insert for their org
CREATE POLICY "org_insert" ON table_name
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Update: org members can update their org's data
CREATE POLICY "org_update" ON table_name
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Delete: only owner/admin can delete
CREATE POLICY "org_delete" ON table_name
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

## Migration Conventions
- Location: `supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Always include rollback instructions as SQL comments
- Test locally before applying to production
- Support tables (migration 024): tickets, knowledge base, SLA tracking

## Table Design Rules
- Primary keys: `uuid` with `DEFAULT gen_random_uuid()`
- Timestamps: `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
- Foreign keys: `REFERENCES parent_table(id) ON DELETE CASCADE` where appropriate
- Soft deletes: prefer `deleted_at TIMESTAMPTZ` over hard deletes for user data
- Indexes: add for any column used in WHERE, JOIN, or ORDER BY

## Query Patterns (in data layer)
```typescript
// Always use the server client in RSC/actions
import { createClient } from '@/lib/supabase/server';

export async function getLeads(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('org_id', orgId)  // RLS also enforces this, but be explicit
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

## Auth Flow
1. User signs in → Supabase creates session cookie
2. Middleware refreshes session on each request
3. Server Components/Actions read session from cookies
4. `getOrgContext()` extracts orgId, userId, role from session
5. Data layer uses orgId for all queries (+ RLS as safety net)
