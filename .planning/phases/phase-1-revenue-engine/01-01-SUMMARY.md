---
phase: 01-revenue-engine
plan: 01
subsystem: database
tags: [postgres, supabase, migration, fertilizer, rls]

requires: []
provides:
  - fertilizer_schedule table for 5-step program workflows
  - missed_calls table for Twilio auto-SMS workflow
  - Extended jobber_email_events CHECK for quote_sent and visit_confirmed
  - Renewal reminder tracking on customer_subscriptions
  - Quote followup tracking on estimates (TG-83)
  - Invoice collections tracking on invoices (TG-84)
  - 2026 fertilizer schedule seeded for 4 customers
affects:
  - 01-02 (fertilizer reminder cron)
  - 01-03 (missed call auto-SMS)
  - 01-04 (quote followup sequences)
  - 01-05 (invoice collections)
  - 01-06 (subscription renewal reminders)

tech-stack:
  added: []
  patterns:
    - "Single migration file per plan for all schema changes"
    - "RLS enabled with permissive service_role policy on automation tables"
    - "Idempotent seeding with ON CONFLICT DO NOTHING"

key-files:
  created:
    - tgyardcare/automation/migrations/20260314000070_revenue_engine_schema.sql
  modified: []

key-decisions:
  - "Used source='other' for lead creation since 'manual' not in CHECK constraint"
  - "Customers created in leads table since they didn't exist yet"
  - "Permissive RLS policy (service_role_all) since these tables are only accessed by n8n automation"

patterns-established:
  - "Management API for SQL execution: POST api.supabase.com/v1/projects/{id}/database/query"
  - "Node.js scripts for complex seeding operations"

duration: 4min
completed: 2026-03-14
---

# Phase 1 Plan 01: Revenue Engine DB Migration Summary

**Created fertilizer_schedule and missed_calls tables, extended 4 existing tables with tracking columns, seeded 20 fertilizer schedule rows for 2026 5-step program.**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-03-15T04:40:27Z
- **Completed:** 2026-03-15T04:44:30Z
- **Tasks:** 2/2
- **Files created:** 1

## Accomplishments

- Created `fertilizer_schedule` table with lead FK, 5-step constraint, unique index
- Created `missed_calls` table with Twilio call_sid tracking
- Extended `jobber_email_events` CHECK to accept `quote_sent` and `visit_confirmed`
- Added 3 renewal reminder columns to `customer_subscriptions`
- Added 5 followup tracking columns to `estimates` (TG-83)
- Added 5 collections tracking columns to `invoices` (TG-84)
- Enabled RLS on both new tables with service_role policies
- Seeded 20 fertilizer schedule rows (5 steps x 4 customers) for 2026
- Created 4 leads (Mike Flint, Dennis Lahay, Zach McClelland, William Simpson) with source='other'

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create and apply Phase 1 database migration | d5113fa | 20260314000070_revenue_engine_schema.sql |
| 2 | Seed 2026 fertilizer schedule | (data-only, no file commit) | fertilizer_schedule: 20 rows |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] leads source CHECK constraint rejected 'manual'**
- **Found during:** Task 2
- **Issue:** The plan specified `source='manual'` for creating missing leads, but the `leads_source_check` constraint only allows: website, lsa, phone, facebook, social, print, referral, other, responsibid, ai-voice, admin
- **Fix:** Used `source='other'` instead
- **Commit:** Part of Task 2 data seeding (no file change)

**2. [Rule 2 - Missing Critical] Customers not in leads table**
- **Found during:** Task 2
- **Issue:** All 4 fertilizer customers (Mike Flint, Dennis Lahay, Zach McClelland, William Simpson) did not exist in the leads table
- **Fix:** Created them as leads with source='other', status='customer' before seeding fertilizer_schedule
- **Commit:** Part of Task 2 data seeding (no file change)

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| New tables exist | 2 | 2 | PASS |
| CHECK has quote_sent | true | true | PASS |
| CHECK has visit_confirmed | true | true | PASS |
| Renewal columns | 3 | 3 | PASS |
| Followup columns | >=5 | 9 | PASS |
| Collections columns | >=5 | 11 | PASS |
| Fertilizer rows | 20 | 20 | PASS |
| Distinct customers | 4 | 4 | PASS |

## Next Phase Readiness

All Phase 1 workflows now have their required database schema in place. No blockers for plans 01-02 through 01-08.
