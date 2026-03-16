---
phase: 04-intelligence-layer
plan: 01
subsystem: database
tags: [migration, schema, intelligence, ab-testing, google-ads]
dependency-graph:
  requires: [phase-3]
  provides: [intelligence-reports-table, intelligence-metrics-table, ab-test-sends-table, google-ads-daily-table, google-ads-alerts-table, ab-tests-channel-extension, email-sms-ab-tracking]
  affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09, 04-10, 04-11, 04-12]
tech-stack:
  added: []
  patterns: [idempotent-migrations, rls-service-role-bypass]
key-files:
  created:
    - automation/migrations/072_intelligence_layer_schema.sql
  modified: []
decisions:
  - id: D-0401-01
    decision: "Expanded intelligence_reports.report_type CHECK to 8 types including learning_report and what_got_smarter for later plans"
    rationale: "User instruction to future-proof the CHECK constraint"
metrics:
  duration: "~4 minutes"
  completed: "2026-03-16"
---

# Phase 4 Plan 01: Intelligence Layer Schema Summary

**Migration 072 creates all Phase 4 database infrastructure: 5 new tables, 4 existing table extensions, full RLS**

## What Was Done

### Task 1: Create and apply migration 072

Created `automation/migrations/072_intelligence_layer_schema.sql` with three sections:

**Part A -- 5 New Tables:**
- `intelligence_reports` -- weekly/monthly intelligence reports with JSONB report_data, highlights, anomalies
- `intelligence_metrics` -- time-series KPI snapshots (metric_date + metric_name unique)
- `ab_test_sends` -- SMS/email A/B test send tracking with delivery/open/click/convert flags
- `google_ads_daily` -- daily campaign metrics (impressions, clicks, conversions, cost, ROAS, etc.)
- `google_ads_alerts` -- budget guardrails and anomaly alerts (5 alert types)

**Part B -- 4 Table Extensions:**
- `ab_tests`: added channel (website/sms/email), min_sends_per_variant, auto_winner, winner_variant_id, winner_declared_at; updated status CHECK to include 'winner_declared'
- `ab_test_conversions`: expanded event_type CHECK to include sms_reply, email_open, email_click, quote_accepted, job_booked
- `email_sends`: added ab_test_id, ab_variant_id
- `sms_sends`: added ab_test_id, ab_variant_id

**Part C -- RLS:**
- Enabled on all 5 new tables
- Service role bypass policies (FOR ALL TO service_role USING (true) WITH CHECK (true))

## Verification Results

All checks passed:
- 5/5 new tables confirmed in information_schema.tables
- 5/5 ab_tests new columns confirmed
- 2/2 email_sends new columns confirmed
- 2/2 sms_sends new columns confirmed
- 3/3 unique indexes confirmed (intelligence_reports, intelligence_metrics, google_ads_daily)
- ab_tests.channel CHECK: website, sms, email
- ab_tests.status CHECK: active, paused, completed, winner_declared
- ab_test_conversions.event_type CHECK: 8 event types including SMS/email
- RLS enabled on all 5 new tables

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 8ee31e0 | feat(04-01): migration 072 intelligence layer schema |

## Next Phase Readiness

All Phase 4 workflows (04-02 through 04-12) can now proceed. The database schema supports:
- Intelligence report generation and storage
- KPI metric tracking for anomaly detection
- SMS/email A/B testing with send tracking
- Google Ads daily metrics ingestion
- Budget guardrail alerting
