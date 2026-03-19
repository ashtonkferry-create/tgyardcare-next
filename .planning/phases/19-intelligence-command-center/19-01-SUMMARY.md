# Phase 19 Plan 01: Daily Briefing + Weekly Report Summary

**One-liner:** Daily 7 AM and Sunday 8 AM Telegram intelligence reports aggregating leads, weather, jobs, reviews, and system health with week-over-week trends.

## Results

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | TG-137 daily briefing workflow | 49f6c74 | Deployed + active |
| 2 | TG-138 weekly business report | 8709a71 | Deployed + active |

### TG-137 Daily Briefing
- **n8n ID:** Fuz98FVF0YhO37SY
- **Schedule:** Daily 7 AM CT (cron: `0 12 * * *` UTC)
- **Nodes:** 4 (Schedule Trigger -> Fetch All Data -> Build Briefing Message -> Send Briefing)
- **Data sources:**
  - Supabase `leads` table (new leads last 24h, pending follow-ups)
  - Supabase `jobber_email_events` table (today's scheduled jobs)
  - wttr.in free API (Madison WI weather, no key needed)
  - Supabase `google_reviews` table (new reviews + overall stats)
  - n8n API (execution errors last 24h, active workflow count)
- **Telegram credential:** V404qLIDXjmyzNeS

### TG-138 Weekly Business Report
- **n8n ID:** 6uc1VDZ4rWiKvsaq
- **Schedule:** Sunday 8 AM CT (cron: `0 13 * * 0` UTC)
- **Nodes:** 5 (Schedule Trigger -> Aggregate Metrics -> Calculate Trends -> Build Report -> Send Report)
- **Data sources:**
  - Supabase `leads` (by source, conversion rate, hot leads)
  - Supabase `jobber_email_events` (jobs by event type)
  - Supabase `google_reviews` (new + overall rating)
  - Supabase `review_requests` (sent vs completed rate)
  - Supabase `blog_posts` (published this week)
  - Supabase `gbp_posts` (published this week)
  - Supabase `social_posts` (published this week)
  - n8n API (execution count, error count, most-errored workflows)
- **Features:** Week-over-week trends with directional arrows, TOP WIN / TOP ISSUE highlights
- **Telegram credential:** V404qLIDXjmyzNeS

## Decisions Made

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Single code node for all data fetching (not parallel HTTP nodes) | Simpler topology, easier error handling, acceptable latency for daily/weekly reports |
| 2 | `$vars` references for all credentials | Consistent with project pattern, no hardcoded keys in workflow JSONs |
| 3 | `safeFetch` helper pattern | Graceful degradation when tables don't exist yet (reviews, social, etc.) |
| 4 | POST /activate endpoint for n8n activation | PATCH returns 405, POST /workflows/{id}/activate works correctly |

## Placeholders Requiring Manual Setup

- **OWNER_TELEGRAM_CHAT_ID** in both TG-137 and TG-138 Send nodes -- set to Vance's actual Telegram chat ID
- **TG_N8N_API_KEY** n8n variable -- set for system health monitoring (errors + active workflow count)
- All Supabase tables referenced degrade gracefully if not yet created

## Graceful Degradation Notes

All data fetches wrapped in try/catch returning empty arrays on failure. Missing tables will show "0" or "None" in reports rather than crashing. This means reports work immediately even before all Phase 14-18 tables exist.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed hardcoded Supabase keys**
- **Found during:** Task 1
- **Issue:** Previous version had hardcoded anon key in workflow JSON
- **Fix:** Replaced with `$vars.TG_SUPABASE_ANON_KEY` and `$vars.TG_SUPABASE_SERVICE_KEY` references
- **Files modified:** TG-137-daily-briefing.json, TG-138-weekly-report.json

**2. [Rule 2 - Missing Critical] Added overall review stats and active workflow count**
- **Found during:** Task 1
- **Issue:** Original daily briefing lacked overall review average and active workflow count
- **Fix:** Added `allReviews` fetch for overall stats and `/workflows?active=true` for workflow count
- **Files modified:** TG-137-daily-briefing.json

**3. [Rule 3 - Blocking] n8n PATCH activation returns 405**
- **Found during:** Task 1 deployment
- **Issue:** PATCH /workflows/{id} with `{active: true}` returns 405
- **Fix:** Used POST /workflows/{id}/activate endpoint instead
- **Commit:** deployment step (no file change)

## Duration

~8 minutes
