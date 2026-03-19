---
phase: 15-retention-lifetime-value
plan: 04
subsystem: automation-retention
tags: [n8n, newsletter, cross-sell, email, retention]
dependency_graph:
  requires: [11-infra, 12-lead-capture, 14-review-pipeline]
  provides: [monthly-newsletter, cross-sell-engine, customer-engagement-automation]
  affects: [16-analytics, retention-metrics]
tech_stack:
  added: []
  patterns: [seasonal-content-rotation, cross-sell-mapping, multiplex-merge]
key_files:
  created: []
  modified:
    - automation/n8n-workflows/TG-81-newsletter-yard-report.json
    - automation/n8n-workflows/TG-10-cross-sell.json
decisions:
  - id: newsletter-via-tg95
    choice: "Send newsletter through TG-95 unified sender (not Brevo campaign API)"
    reason: "Better per-recipient tracking; customer count currently under 100. Recommend switching to Brevo campaigns if count exceeds 100."
  - id: merge-node-multiplex
    choice: "Used Merge node v3 with multiplex mode for parallel data aggregation in TG-81"
    reason: "Schedule trigger fans out to 3 parallel fetches (month context, reviews, customers), merge combines them for newsletter build."
  - id: cross-sell-frequency
    choice: "Bi-monthly cross-sell cadence (every other month)"
    reason: "Avoids over-contacting customers. Newsletter runs monthly on 15th, cross-sell runs 1st of odd months -- never overlapping same week."
metrics:
  duration: "8 minutes"
  completed: "2026-03-19"
---

# Phase 15 Plan 04: Monthly Newsletter + Cross-Sell Engine Summary

**TG-81 monthly newsletter with 12-month seasonal content + TG-10 cross-sell engine with 11-service recommendation map, both deployed and active on n8n.**

## What Was Built

### TG-81 Monthly Newsletter (8 nodes)
- **Schedule**: 15th of every month at 10am CT (cron `0 15 15 * *`)
- **Parallel fetch**: Month context (code), 5-star reviews (Supabase), active customers (Supabase)
- **Merge**: Multiplex merge combines all three data streams
- **Build**: Branded HTML newsletter with 4 sections:
  1. Seasonal greeting with lawn care tip (12 unique tips, one per month)
  2. Featured service of the month (seasonal upsell)
  3. 5-star review spotlight (random from recent reviews)
  4. CTA to book featured service
- **Send**: Via TG-95 unified email sender (FSRv5y8YzMjpyBtc)
- **Summary**: Telegram notification with recipient count and featured service
- **n8n ID**: dk884SJOQYXVUL7b (active)

### TG-10 Cross-Sell Engine (7 nodes)
- **Schedule**: 1st of every other month at 10am CT (cron `0 15 1 */2 *`)
- **Fetch**: All active/customer/converted leads with service field
- **Analyze**: Cross-sell map covers 11 services:
  - mowing -> fertilization, aeration, spring cleanup, fall cleanup
  - lawn care -> mulching, garden bed care, bush trimming, gutter cleaning
  - fertilization -> aeration, herbicide, overseeding
  - aeration -> fertilization, overseeding
  - spring cleanup -> mulching, garden bed care, fertilization
  - fall cleanup -> leaf removal, gutter cleaning, snow removal
  - mulching -> garden bed care, bush trimming, weeding
  - snow removal -> gutter guard installation, gutter cleaning
  - gutter cleaning -> gutter guard installation
  - hardscaping -> mulching, garden bed care, lawn care
- **Build**: Branded HTML email with personalized rec1/rec2, social proof bar
- **Send**: Via TG-95 unified email sender (FSRv5y8YzMjpyBtc)
- **Summary**: Telegram notification with send count
- **n8n ID**: 5DYd0WpgnHJVLA21 (active)

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email delivery | TG-95 per-recipient (not Brevo bulk) | Better tracking; under 100 customers currently |
| Newsletter schedule | 15th of month | Mid-month timing avoids bill-payment stress of 1st |
| Cross-sell frequency | Bi-monthly (odd months) | Prevents over-contacting; staggers with newsletter |
| Data merging | Multiplex merge node | Cleanly combines 3 parallel data streams |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Merge node for parallel data aggregation**
- **Found during:** Task 1
- **Issue:** Plan specified parallel fetch of month context, reviews, and customers but didn't specify how to combine them before the Build Newsletter node
- **Fix:** Added Merge node v3 with multiplex mode as intermediary
- **Files modified:** TG-81-newsletter-yard-report.json

**2. [Rule 3 - Blocking] Added Filter node to TG-10 for skip handling**
- **Found during:** Task 2
- **Issue:** When no eligible customers exist, the analyze node returns a `_skip: true` sentinel. Without filtering, TG-95 would receive invalid payloads.
- **Fix:** Added Filter Valid Customers node between analyze and build-email
- **Files modified:** TG-10-cross-sell.json

**3. [Rule 1 - Bug] Fixed TG-95 workflowId in TG-10**
- **Found during:** Task 2
- **Issue:** Existing TG-10 referenced wrong TG-95 copy (IUDLrQrAkcLFLsIC instead of FSRv5y8YzMjpyBtc)
- **Fix:** Updated to correct FSRv5y8YzMjpyBtc
- **Files modified:** TG-10-cross-sell.json

## Pending Manual Steps

- Replace OWNER_TELEGRAM_CHAT_ID in TG-81 Telegram Summary node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-10 Telegram Summary node with Vance's actual Telegram chat ID
- Set SUPABASE_ANON_KEY_PLACEHOLDER in TG-81 Fetch 5-Star Review and Fetch Active Customers nodes (2 nodes, 4 occurrences)
- Set SUPABASE_ANON_KEY_PLACEHOLDER in TG-10 Fetch Customers node (2 occurrences)
- If customer count exceeds 100, consider switching TG-81 to Brevo campaign API for bulk sends

## Volume Note

Both workflows use TG-95 for per-recipient email delivery. This is optimal for current customer counts (under 100). If customer base grows beyond 100, TG-81 newsletter should be migrated to Brevo campaign API for better bulk delivery and compliance. TG-10 cross-sell can stay on TG-95 since it only targets single-service customers (subset of total).

## Active Workflow Count

20 workflows now active on n8n (added TG-81, TG-10):
TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07, TG-09, TG-127, TG-128, TG-129, TG-130, TG-132, TG-81, TG-10

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | e48e4d3 | TG-81 monthly newsletter with seasonal content |
| 2 | ae433a8 | TG-10 cross-sell engine, deploy both workflows |
