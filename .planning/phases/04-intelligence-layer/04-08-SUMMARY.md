# Phase 4 Plan 8: Weekly Ad Performance + What Got Smarter Digest

TG-116 weekly ad performance report with campaign breakdown and WoW comparison; TG-117 flagship "What Got Smarter" weekly intelligence digest replacing TG-67

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | TG-116 Weekly Ad Performance | a3540d8 | TG-116-weekly-ad-performance.json |
| 2 | TG-117 Weekly What Got Smarter | 8a02f41 | TG-117-weekly-what-got-smarter.json |

## What Was Built

### TG-116 — Weekly Ad Performance
- **Cron:** Monday 8 AM CT (0 13 * * 1)
- **Data sources:** google_ads_daily (this week + previous week), google_ads_alerts
- **Aggregation:** By campaign — spend, clicks, conversions, CPC, CTR, ROAS, cost/conversion, week-over-week
- **Two paths:** Full report with data, graceful no-data report with actionable guidance
- **Output chain:** TG-118 (HTML) -> TG-95 (email) -> intelligence_reports (storage)
- **Report type:** ad_performance

### TG-117 — Weekly What Got Smarter
- **Cron:** Monday 9 AM CT (0 14 * * 1) — runs 1 hour after TG-114/115/116
- **Data sources:** intelligence_reports (revenue_attribution, ab_test_results, ad_performance), ab_tests (completed winners), intelligence_metrics (2-week range for WoW)
- **Digest sections:**
  1. Metrics: Revenue, Leads, Active A/B Tests, Anomalies
  2. Highlights: A/B winners deployed, revenue insights, ad performance
  3. Key Numbers table: This week vs last week for 6 core KPIs
  4. Anomalies: KPI deviations >25% from previous week
  5. Actions: Prioritized to-do list for the week
- **Replaces:** TG-67 (Weekly Owner Report) with intelligence superset
- **Output chain:** TG-118 (HTML) -> TG-95 (email) -> intelligence_reports (report_type=what_got_smarter)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| TG-116 estimates $150/conversion for ROAS | Conservative estimate for yard care lead value; configurable in code |
| TG-117 computes its own anomalies from metrics WoW | Independent from TG-110 daily anomalies; provides weekly context |
| TG-117 uses fallback messages when sub-reports missing | Graceful degradation while intelligence layer builds baseline |

## Deviations from Plan

None — plan executed exactly as written.

## Duration

~3 minutes
