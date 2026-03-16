---
phase: 04-intelligence-layer
plan: 07
subsystem: weekly-reports
tags: [n8n, revenue-attribution, ab-testing, weekly-report, intelligence]
dependency-graph:
  requires: [04-01, 04-03, 04-04, 04-06]
  provides: [TG-114-revenue-weekly, TG-115-ab-test-weekly]
  affects: [04-08, 04-09]
tech-stack:
  added: []
  patterns: [TG-118-html-assembler-consumer, TG-95-email-sender-consumer, intelligence-reports-storage]
key-files:
  created:
    - automation/n8n-workflows/TG-114-weekly-revenue-attribution.json
    - automation/n8n-workflows/TG-115-weekly-ab-test-report.json
  modified: []
decisions:
  - Both reports use TG-118 for HTML formatting (structured sections protocol)
  - Both store snapshots to intelligence_reports table for historical tracking
  - Empty data handled gracefully with prompts to check upstream workflows
metrics:
  duration: ~3 minutes
  completed: 2026-03-16
---

# Phase 4 Plan 7: Weekly Revenue Attribution + A/B Test Report Summary

TG-114 weekly revenue report with source/service breakdowns and WoW comparison; TG-115 weekly A/B test report with per-variant conversion rates and winner tracking.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | TG-114 Weekly Revenue Attribution | 0e99388 | TG-114-weekly-revenue-attribution.json |
| 2 | TG-115 Weekly A/B Test Report | 0e99388 | TG-115-weekly-ab-test-report.json |

## What Was Built

### TG-114 - Weekly Revenue Attribution
- **Schedule**: Monday 8 AM CT (cron: `0 13 * * 1`)
- **Data fetched**: revenue_attribution (this week + previous week), leads (this week)
- **Report sections**: Revenue Overview metrics (total revenue, leads, avg job value, conversion rate), Revenue by Source table, Revenue by Service table, Key Highlights, Recommended Actions
- **Week-over-week**: Full comparison with percentage changes per source and service
- **HTML**: Formatted via TG-118 sub-workflow (rOeTPPi2kW6thURB)
- **Email**: Sent via TG-95 sub-workflow (IUDLrQrAkcLFLsIC)
- **Storage**: intelligence_reports with report_type='revenue_attribution'

### TG-115 - Weekly A/B Test Report
- **Schedule**: Monday 8 AM CT (cron: `0 13 * * 1`)
- **Data fetched**: ab_tests (active + completed, SMS/email), ab_test_sends (this week), winners declared this week
- **Report sections**: A/B Testing Overview metrics, Test Results by Variant table, Key Highlights, Recommended Actions
- **Empty state**: When no tests exist, sends brief prompt to seed new tests via TG-105
- **HTML**: Formatted via TG-118 sub-workflow
- **Email**: Sent via TG-95 sub-workflow
- **Storage**: intelligence_reports with report_type='ab_test_results'

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Both workflows in single commit** - Both are part of the same plan and run on the same schedule
2. **Parallel data fetching** - Both workflows fan out HTTP requests in parallel after date calculation for efficiency
3. **TG-118 structured sections** - Used metrics/table/highlights/actions section types matching the assembler's protocol
4. **OWNER_EMAIL_PLACEHOLDER** - Consistent with TG-102 pattern for deploy-time injection

## Next Phase Readiness

Wave 3 continues. TG-114 and TG-115 are ready for n8n deployment alongside TG-118.
