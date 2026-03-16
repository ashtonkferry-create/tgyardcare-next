# Phase 4 Plan 10: Self-Improvement Utility Workflows Summary

**One-liner:** 4 utility workflows for A/B test seeding, workflow health tracking, lead score recalibration, and dashboard summary refresh.

## Commits

| Hash | Message |
|------|---------|
| 70da464 | feat(04-10): TG-122 A/B test seed manager + TG-123 workflow performance tracker |
| bcd2eb2 | feat(04-10): TG-124 lead score recalibrator + TG-125 dashboard updater |

## What Was Built

### TG-122 A/B Test Seed Manager
- Sub-workflow (executeWorkflowTrigger v1) for creating/updating A/B tests
- Create action: POST ab_tests + POST ab_test_variants (2 variants with IDs test_id-a / test_id-b)
- Update action: PATCH ab_tests + PATCH both variants with provided fields
- Input validation with meaningful error messages
- Returns { success, test_id, action }

### TG-123 Workflow Performance Tracker
- Weekly cron: Monday 7 AM CT (0 12 * * 1 UTC)
- Fetches last 250 n8n executions via API
- Groups by workflowId, calculates total/success/error counts and error_rate
- Upserts per-workflow metrics to intelligence_metrics
- Alerts via TG-113 when error_rate > 10% (critical if > 25%)

### TG-124 Lead Score Recalibrator
- Monthly cron: 1st of month 8 AM CT (0 13 1 * * UTC)
- Analysis only — no automatic score changes
- Fetches 90-day leads with scores + booking events
- Groups by 5 tiers (0-20, 21-40, 41-60, 61-80, 81-100)
- Compares actual booking rates vs expected rates per tier
- Stores full report in intelligence_reports
- Alerts via TG-113 if any tier deviates > 10% from expected

### TG-125 Intelligence Dashboard Updater
- Daily cron: 10 AM CT (0 15 * * * UTC) — after all daily pipelines
- Parallel fetch: 7d metrics, 30d metrics, active A/B test count, unresolved alert count
- Computes rolling averages per metric_type for both windows
- Upserts ~14 summary metrics (summary_7d_avg_*, summary_30d_avg_*, counts)

## Files Created

- `automation/n8n-workflows/TG-122-ab-test-seed-manager.json`
- `automation/n8n-workflows/TG-123-workflow-performance-tracker.json`
- `automation/n8n-workflows/TG-124-lead-score-recalibrator.json`
- `automation/n8n-workflows/TG-125-intelligence-dashboard-updater.json`

## Deviations from Plan

None — plan executed exactly as written.

## Duration

~3 minutes
