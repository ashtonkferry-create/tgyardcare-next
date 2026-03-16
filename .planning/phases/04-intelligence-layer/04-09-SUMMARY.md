# Phase 4 Plan 9: Monthly Reports (TG-119 + TG-120 + TG-121) Summary

**One-liner:** Three monthly intelligence workflows — trend analysis, channel ROI, and learning digest — all firing on the 1st of each month.

## Completed Tasks

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | TG-119 Monthly Trend Analysis | df2b949 | automation/n8n-workflows/TG-119-monthly-trend-analysis.json |
| 2 | TG-120 Monthly Channel ROI | df2b949 | automation/n8n-workflows/TG-120-monthly-channel-roi.json |
| 3 | TG-121 Monthly Learning Report | df2b949 | automation/n8n-workflows/TG-121-monthly-learning-report.json |

## What Was Built

### TG-119: Monthly Trend Analysis
- Cron: `0 13 1 * *` (1st of month, 8 AM CT)
- Fetches intelligence_metrics for previous month and 2 months ago
- Calculates per-metric monthly averages and MoM change %
- Identifies top 3 gainers and top 3 decliners
- Stores as `report_type='monthly_trend'` in intelligence_reports
- 9 nodes, parallel fetch with merge pattern

### TG-120: Monthly Channel ROI
- Cron: `0 13 1 * *` (1st of month, 8 AM CT)
- Fetches revenue_attribution, google_ads_daily, and leads for the month
- Normalizes channels: google_organic, google_ads, referral, direct, nextdoor, facebook, yard_sign
- Calculates per channel: revenue, cost, ROI%, leads, cost/lead, conversion rate
- Stores as `report_type='channel_roi'` in intelligence_reports
- 11 nodes, triple parallel fetch with two merge stages

### TG-121: Monthly Learning Report
- Cron: `0 14 1 * *` (1st of month, 9 AM CT — 1 hour after TG-119/120)
- Aggregates intelligence_reports from the month (TG-119 + TG-120 + weekly sub-reports)
- Fetches A/B test winners declared this month
- Counts anomalies detected from anomaly_log
- Assembles "What The System Learned This Month" digest
- Stores as `report_type='learning_report'` in intelligence_reports
- 11 nodes, triple parallel fetch with two merge stages

### Common Patterns
- All three call TG-118 (rOeTPPi2kW6thURB) for HTML email rendering
- All three call TG-95 (IUDLrQrAkcLFLsIC) for email delivery
- All three store results to intelligence_reports table
- SUPABASE_SECRET_KEY_PLACEHOLDER used for all API keys

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Single commit for all 3 workflows | All three are a cohesive unit for monthly reporting |
| Channel normalization in TG-120 | Handles variant source names (fb/facebook/meta) into canonical channels |
| TG-121 fetches anomaly_log directly | More accurate count than parsing sub-reports |

## Duration

~3 minutes
