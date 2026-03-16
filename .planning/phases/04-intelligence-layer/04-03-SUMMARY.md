# Phase 4 Plan 3: Daily Data Pipeline Workflows Summary

## One-Liner
TG-107 daily revenue sync from Jobber email events + TG-108 13-KPI daily snapshot feeding intelligence_metrics

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Build TG-107 Revenue Sync Daily | 38bdbf9 | automation/n8n-workflows/TG-107-revenue-sync-daily.json |
| 2 | Build TG-108 KPI Daily Snapshot | b1d54de | automation/n8n-workflows/TG-108-kpi-daily-snapshot.json |

## What Was Built

### TG-107 Revenue Sync Daily
- **Schedule**: 5 AM CT (0 10 * * * UTC) daily
- **Pipeline**: Schedule -> Calculate Yesterday -> Fetch payment_received events -> IF has payments -> Extract data -> Match leads by email/phone -> Build attribution records -> Upsert to revenue_attribution
- **Lead matching**: Email match first, then normalized phone (strip non-digits), unmatched payments get lead_source='unknown'
- **PostgREST pattern**: Uses `and` filter for date range (not duplicate params), fullResponse:true on GETs
- **Clean exit**: IF branch handles zero-payment days with logging

### TG-108 KPI Daily Snapshot
- **Schedule**: 6 AM CT (0 11 * * * UTC) daily — runs 1 hour after TG-107
- **Parallel fan-out**: 5 HTTP requests fire simultaneously after date calculation (leads total, leads 7d, revenue 30d, SMS yesterday, email yesterday)
- **Merge node**: Waits for all 5 data sources before KPI calculation
- **13 KPIs captured**:
  - `leads_total` — all-time count via content-range header
  - `revenue_total` — yesterday's attributed revenue
  - `avg_job_value` — 30-day rolling average
  - `conversion_rate` — 7-day (booked+completed / total)
  - `sms_response_rate` — yesterday (delivered / total)
  - `email_open_rate` — yesterday (opened / total)
  - `quote_conversion_rate` — 7-day (booked from quoted)
  - 6x `leads_by_source_*` — google_organic, google_ads, referral, direct, nextdoor, facebook
- **Upsert**: UNIQUE index on (metric_date, metric_name) enables merge-duplicates
- **Zero-safe**: All metrics default to 0 when source data is empty

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Removed workflow_attribution column from TG-107 output | Column doesn't exist in revenue_attribution schema (migration 031) — would cause insert failure |
| Used PostgREST `and` filter for date ranges | Duplicate query parameter names not reliable in PostgREST; `and=(created_at.gte.X,created_at.lte.Y)` is correct syntax |
| SMS "response rate" uses delivered_at (not reply) | sms_sends table tracks delivered_at but has no reply tracking column; delivered is closest proxy |
| Leads count uses content-range header + limit=0 | Efficient counting without fetching all rows; Prefer: count=exact returns total in header |
| Revenue total = yesterday only (not all-time) | Daily snapshot should capture daily revenue; all-time is captured via leads_total trend |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed non-existent workflow_attribution column**
- **Found during:** Task 1
- **Issue:** Plan specified `workflow_attribution` field in attribution records, but revenue_attribution table (migration 031) has no such column
- **Fix:** Removed the field from the Code node output to prevent PostgREST 400 error
- **Files modified:** TG-107-revenue-sync-daily.json

**2. [Rule 1 - Bug] Fixed PostgREST duplicate parameter names**
- **Found during:** Task 1
- **Issue:** Two `created_at` query parameters (gte and lte) would be ambiguous in PostgREST
- **Fix:** Used `and=(created_at.gte.X,created_at.lte.Y)` filter syntax instead
- **Files modified:** TG-107-revenue-sync-daily.json

## Duration
~3 minutes

## Artifacts

| File | Purpose |
|------|---------|
| automation/n8n-workflows/TG-107-revenue-sync-daily.json | Daily revenue attribution sync from Jobber email events |
| automation/n8n-workflows/TG-108-kpi-daily-snapshot.json | Daily 13-KPI snapshot for intelligence layer |
