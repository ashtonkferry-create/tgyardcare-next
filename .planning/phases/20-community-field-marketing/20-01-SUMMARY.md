# Phase 20 Plan 01: Neighbor Outreach + Crew Field Marketing Summary

**One-liner:** Daily neighbor SMS outreach to same-zip leads after job completion + crew field marketing checklists with yard sign tracking via Telegram.

## Results

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | TG-143 neighbor outreach SMS workflow | c2973a6 | Done |
| 2 | TG-144 crew field marketing reminders + yard sign tracking | 696782c | Done |

## What Was Built

### TG-143 Neighbor Outreach (n8n ID: n9mFQIJyE1RDfELe)
- **Schedule:** Daily 11 AM CT (16:00 UTC cron)
- **Flow:** Fetch completed jobs (24h) -> Extract Madison-area zip codes -> Find non-converted leads in same zip -> Build SMS with rotation -> Send via TG-94 -> Log to neighbor_outreach -> Telegram summary
- **Dedup:** 30-day window via neighbor_outreach table (checks lead_phone + zip_code against sent_at)
- **SMS templates:** 2 variations rotating, both mention neighborhood + service type
- **A2P compliance:** "Reply STOP to opt out" included in every message
- **Nodes:** 8

### TG-144 Crew Field Reminders (n8n ID: 7I6mwt3Mqim69RSy)
- **Schedule:** Daily 6 AM CT (11:00 UTC cron)
- **Flow:** Fetch today's scheduled jobs -> Check yard signs due for collection -> Build field marketing checklist -> Send via Telegram -> Log to automation_runs
- **Checklist items:** Place yard sign, leave 3 door hangers, carry business cards, take before/after photo, ask for Google review
- **Yard sign tracking:** Signs placed 7+ days ago get collection reminders; signs 14+ days auto-expire to "expired" status
- **Nodes:** 6

## Supabase Tables Required

```sql
-- TG-143: Neighbor outreach dedup and history
CREATE TABLE IF NOT EXISTS neighbor_outreach (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_phone text,
  lead_name text,
  zip_code text,
  job_service_type text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_neighbor_outreach_phone ON neighbor_outreach(lead_phone);
CREATE INDEX idx_neighbor_outreach_sent ON neighbor_outreach(sent_at);

-- TG-144: Yard sign placement tracking
CREATE TABLE IF NOT EXISTS yard_sign_placements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_reference text,
  customer_name text,
  location text,
  placed_at timestamptz DEFAULT now(),
  collected_at timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_yard_signs_status ON yard_sign_placements(status);
```

## Important Notes

1. **OWNER_TELEGRAM_CHAT_ID placeholder**: Both workflows use this placeholder for the Telegram chat ID. Vance must set the actual chat ID in the n8n UI for both TG-143 and TG-144 Telegram nodes.

2. **Twilio A2P 10DLC compliance**: TG-143 sends marketing SMS. The A2P campaign must be approved before these messages will deliver. All messages include "Reply STOP to opt out" for compliance.

3. **Address/zip availability**: Neighbor outreach depends on customer_address being available in jobber_email_events. This requires TG-05 email parser to extract addresses from Jobber notification emails. If addresses are missing, no outreach will fire (graceful degradation).

4. **Madison area zip validation**: TG-143 only processes zip codes in the Madison metro area (53703-53726, 53562, 53597, 53590, 53593, 53558) to prevent outreach to distant leads.

5. **Yard sign reply tracking**: The plan mentioned Telegram reply-based sign tracking ("sign {job_id}"). For MVP, yard sign collection checks run daily but sign placement must be logged manually or via a future Telegram command router. The table is ready for this.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed time window calculation in TG-143**
- **Found during:** Task 1
- **Issue:** Existing workflow had inverted time window variables (yesterday20h and yesterday28h were swapped)
- **Fix:** Simplified to straightforward 24-hour lookback from current time
- **Files modified:** TG-143-neighbor-outreach.json

**2. [Rule 2 - Missing Critical] Added A2P opt-out language**
- **Found during:** Task 1
- **Issue:** Plan's success criteria mention "Twilio A2P compliance maintained" but SMS templates had no opt-out text
- **Fix:** Added "Reply STOP to opt out." to both SMS template variations
- **Files modified:** TG-143-neighbor-outreach.json

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| 30-day dedup via separate neighbor_outreach table | More reliable than field on leads table; provides outreach history for reporting |
| Madison-area zip validation whitelist | Prevents outreach to leads far from service area |
| Yard sign auto-expire at 14 days | Assumes sign collected or lost; keeps data clean |
| Combined jobs + sign collection in single Telegram message | Reduces notification noise for crew |

## Metrics

- **Duration:** ~5 minutes
- **Completed:** 2026-03-19
- **Tasks:** 2/2
- **Workflows deployed:** 2
- **Total active n8n workflows:** 17 (added TG-143, TG-144)
