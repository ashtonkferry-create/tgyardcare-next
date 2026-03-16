# Phase 4 Plan 5: Wave 2 Monitoring Guardrails Summary

**One-liner:** Three monitoring workflows — KPI anomaly detector, ad budget guardian, ad conversion watchdog — all routing through TG-113

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | TG-110 Anomaly Detector | 9f3c852 | TG-110-anomaly-detector.json |
| 2 | TG-111 Ad Budget Guardian | 9f3c852 | TG-111-ad-budget-guardian.json |
| 3 | TG-112 Ad Conversion Watchdog | 9f3c852 | TG-112-ad-conversion-watchdog.json |

## What Was Built

### TG-110 Anomaly Detector
- Cron: `0 14 * * *` (9 AM CT daily)
- Fetches today's KPIs from `intelligence_metrics` + 4-week history
- Parallel fetch with Merge wait node
- For each metric: calculates rolling avg, flags >25% deviation
- Severity: >50% = critical, 25-50% = warning
- Skips metrics with <7 data points or avg=0
- Sends color-coded HTML table alert via TG-113

### TG-111 Ad Budget Guardian
- Cron: `0 */4 * * *` (every 4 hours)
- Graceful skip if `$vars.TG_GOOGLE_ADS_CUSTOMER_ID` is empty
- Fetches today's spend from `google_ads_daily`
- Compares to `$vars.TG_GOOGLE_ADS_DAILY_BUDGET` (default $50)
- Alert at 80% (warning) and 100%+ (critical)
- Includes per-campaign spend breakdown in alert
- Logs to `google_ads_alerts` table

### TG-112 Ad Conversion Watchdog
- Cron: `0 0,12 * * *` (every 12 hours)
- Graceful skip if `$vars.TG_GOOGLE_ADS_CUSTOMER_ID` is empty
- Fetches last 48h from `google_ads_daily`
- Groups by campaign, sums conversions
- Flags campaigns with 0 conversions AND cost > 0
- Always severity=critical (money being wasted)
- Auto-pause not yet implemented (noted in alert body), alerts only
- Logs to `google_ads_alerts` with `action_taken: 'alert_only'`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| TG-112 alerts only, no auto-pause | Google Ads API credentials not yet configured; alerting sufficient for now |
| Default budget $50/day | Uses `TG_GOOGLE_ADS_DAILY_BUDGET` variable, configurable without code change |
| Min 7 data points for anomaly detection | Avoids false positives during initial ramp-up period |

## Deviations from Plan

None - plan executed exactly as written.

## Duration

~3 minutes

## Next Phase Readiness

Wave 2 complete. TG-110, TG-111, TG-112 ready for n8n deployment (pending API rate limit availability). All three depend on TG-113 being active (confirmed active from 04-02).
