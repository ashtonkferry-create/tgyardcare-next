---
phase: 13-delivery-excellence
plan: 01
subsystem: automation
tags: [n8n, imap, email-parsing, jobber, regex, sub-workflow]

# Dependency graph
requires:
  - phase: 11-infrastructure
    provides: TG-05 IMAP listener active on n8n, Supabase jobber_email_events table
provides:
  - Enhanced TG-05 parser with scheduled_date, scheduled_time, crew_name extraction
  - 8-event-type Switch routing (added job_created)
  - Downstream wiring for TG-127 (pre-job) and TG-128 (post-job) sub-workflows
affects: [13-02 pre-job notifications, 13-03 post-job quality checks, 14-retention]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Multi-regex date extraction with named-month, numeric, and day-of-week patterns"
    - "Placeholder workflow IDs in executeWorkflow nodes for forward references"

key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-05-jobber-email-parser.json

key-decisions:
  - "job_created event type positioned at Switch index 1, shifting all subsequent indices"
  - "Placeholder IDs (PLACEHOLDER_TG127_ID, PLACEHOLDER_TG128_ID) used for not-yet-created sub-workflows"
  - "Three new Supabase columns noted for manual addition (parsed_scheduled_date, parsed_scheduled_time, parsed_crew_name)"
  - "n8n API PUT fails with 'Could not find property option' -- deploy must be done via n8n UI import"

patterns-established:
  - "Forward-reference pattern: use PLACEHOLDER_TGXXX_ID in executeWorkflow nodes, replace when sub-workflow created"
  - "Graceful degradation: continueOnFail:true on Insert Email Event handles missing columns"

# Metrics
duration: 15min
completed: 2026-03-19
---

# Phase 13 Plan 01: TG-05 Enhanced Email Parser Summary

**TG-05 Jobber email parser enhanced with scheduled_date/time/crew extraction, job_created event type, and TG-127/TG-128 sub-workflow wiring for pre-job and post-job automation**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-19T13:30:00Z
- **Completed:** 2026-03-19T13:46:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added 3 new data extraction fields: `scheduled_date` (ISO YYYY-MM-DD via 3 regex patterns), `scheduled_time` (original format), `crew_name`
- Added `job_created` event type detection (distinct from `new_request`) bringing Switch to 8 total outputs
- Wired `job_scheduled` output to Call TG-127 Pre-Job Notification executeWorkflow node
- Wired `job_completed` output to Call TG-128 Post-Job Quality Check executeWorkflow node
- All 3 new fields stored in `jobber_email_events` via Insert Email Event HTTP Request

## Task Commits

Both tasks were committed together (code changes are inseparable in a single JSON file):

1. **Task 1 + Task 2: Enhanced parser + downstream routing** - `86d7acb` (feat)

## Files Created/Modified

- `automation/n8n-workflows/TG-05-jobber-email-parser.json` - Enhanced parser with richer data extraction, 8 event types, TG-127/TG-128 wiring

## Switch Output Index Mapping (Reference for Downstream Plans)

| Index | Event Type | Downstream Targets |
|-------|-----------|-------------------|
| 0 | new_request | Upsert Lead + TG-93 Auto-Dispatch |
| 1 | job_created | TG-93 Auto-Dispatch |
| 2 | job_scheduled | TG-93 Auto-Dispatch + TG-127 Pre-Job Notification |
| 3 | job_completed | Wait 24h -> Review Request + TG-128 Post-Job Quality Check |
| 4 | quote_sent | TG-83 Quote Follow-up |
| 5 | invoice_sent | TG-84 Invoice Collections + TG-89 Invoice Delivery |
| 6 | visit_confirmed | TG-88 On My Way |
| 7 | plan_accepted | TG-86 Plan Enrollment + TG-93 Auto-Dispatch |

## Placeholder Workflow IDs (Must Be Replaced)

| Placeholder | Node Name | Replace When |
|------------|-----------|-------------|
| `PLACEHOLDER_TG127_ID` | Call TG-127 Pre-Job Notification | Plan 13-02 creates TG-127 |
| `PLACEHOLDER_TG128_ID` | Call TG-128 Post-Job Quality Check | Plan 13-03 creates TG-128 |

## Decisions Made

- **job_created at index 1:** Inserted after new_request, shifting all other outputs by +1. This was specified in the plan but has downstream implications -- any code referencing Switch output indices must use the new mapping above.
- **Placeholder IDs:** Used `PLACEHOLDER_TG127_ID` and `PLACEHOLDER_TG128_ID` strings since TG-127 and TG-128 don't exist yet. These must be replaced with real n8n workflow IDs when those workflows are created in Plans 13-02 and 13-03.
- **Three regex patterns for dates:** Named month ("March 25, 2026"), numeric ("03/25/2026"), and day-of-week ("on Tuesday, March 25") patterns cover the known Jobber email date formats.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **n8n API PUT returns 400 "Could not find property option":** Attempted deployment via `PUT /api/v1/workflows/Jf5VYdWpDs3VgRzd` with multiple payload variations (full JSON, minimal payload, live data round-trip). All returned the same 400 error. Even sending the live workflow's own data back to the API fails with this error -- this is an n8n cloud API limitation, not a data issue. The local JSON file is the source of truth and must be deployed via n8n UI import.

## User Setup Required

**Database columns** -- Run in Supabase SQL Editor:
```sql
ALTER TABLE jobber_email_events
  ADD COLUMN IF NOT EXISTS parsed_scheduled_date text,
  ADD COLUMN IF NOT EXISTS parsed_scheduled_time text,
  ADD COLUMN IF NOT EXISTS parsed_crew_name text;
```

**n8n deployment** -- The updated TG-05 JSON could not be deployed via API (400 error). To deploy:
1. Open n8n UI at https://tgyardcare.app.n8n.cloud
2. Navigate to TG-05 workflow
3. Import the updated JSON from `automation/n8n-workflows/TG-05-jobber-email-parser.json`
4. Or manually copy the updated Parse Jobber Email code, Switch rules, and new executeWorkflow nodes

## Next Phase Readiness

- TG-05 parser is ready for Plan 13-02 (TG-127 pre-job notifications) and Plan 13-03 (TG-128 post-job quality checks)
- When TG-127 and TG-128 are created, their n8n workflow IDs must be patched into TG-05's `call-tg127` and `call-tg128` nodes
- The `jobber_email_events` table needs the 3 new columns added manually (workflow degrades gracefully without them via `continueOnFail: true`)

---
*Phase: 13-delivery-excellence*
*Completed: 2026-03-19*
