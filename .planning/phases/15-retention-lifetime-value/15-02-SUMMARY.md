---
phase: 15-retention-lifetime-value
plan: 02
subsystem: automation
tags: [n8n, seasonal-campaigns, email-marketing, nurture]
dependency-graph:
  requires: [11-infra, 12-lead-response]
  provides: [seasonal-auto-campaigns, spring-fall-snow-nurture]
  affects: [15-03, 15-04]
tech-stack:
  added: []
  patterns: [seasonal-router, sub-workflow-campaigns, branded-email-templates]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-14-spring-nurture.json
    - automation/n8n-workflows/TG-15-fall-nurture.json
    - automation/n8n-workflows/TG-16-snow-nurture.json
    - automation/n8n-workflows/TG-32-seasonal-transition.json
decisions:
  - id: d-1502-01
    decision: "Use FSRv5y8YzMjpyBtc as canonical TG-95 ID (not IUDLrQrAkcLFLsIC duplicate)"
    rationale: "Deployed TG-130 uses FSRv5y8YzMjpyBtc, plan specifies it, matches production"
  - id: d-1502-02
    decision: "Use $vars.TG_SUPABASE_URL instead of hardcoded Supabase URL"
    rationale: "Consistent with other deployed workflows, avoids key leakage in JSON files"
  - id: d-1502-03
    decision: "Activate via POST /activate endpoint, not PATCH"
    rationale: "n8n cloud API does not support PATCH, POST /activate works"
metrics:
  duration: "4m 31s"
  completed: "2026-03-19"
---

# Phase 15 Plan 02: Seasonal Nurture Campaigns Summary

**One-liner:** Monthly seasonal router (TG-32) auto-triggers spring/fall/snow branded email campaigns to all active customers via TG-95 unified sender.

## What Was Done

### Task 1: TG-32 Seasonal Router + TG-14 Spring Campaign
- **TG-32** (8 nodes): Schedule trigger on 1st of each month at 9am CT, determines season via month check, routes March->TG-14, September->TG-15, November->TG-16 via Switch node with executeWorkflow sub-calls, Telegram notification on campaign launch
- **TG-14** (6 nodes): executeWorkflowTrigger -> fetch active customers from Supabase leads table -> filter for valid email -> build branded spring email (spring cleanup, 5-step fertilization, aeration, garden bed cleanup) -> send via TG-95 -> Telegram summary
- Wired TG-32 with real n8n IDs: TG-14=nAYg8H9q6kqhtGbT, TG-15=RRym6KRyPue6GABC, TG-16=EUZtUKUAHDMUfgmi
- Fixed TG-95 workflowId from IUDLrQrAkcLFLsIC to FSRv5y8YzMjpyBtc
- Fixed Supabase URL to use n8n environment variables

### Task 2: TG-15 Fall + TG-16 Snow Campaigns + Deployment
- **TG-15** (6 nodes): Fall campaign promoting fall cleanup, leaf removal, aeration & overseeding, gutter cleaning with amber/autumn color theme
- **TG-16** (6 nodes): Snow campaign promoting snow removal + gutter guard installation with blue/winter color theme and urgency messaging ("limited spots")
- All four workflows deployed via PUT API and activated via POST /activate
- All campaigns use consistent branded email template (green header, gold accents, dark footer, trust badges, CTA button)

## Deployed Workflows

| Workflow | n8n ID | Nodes | Schedule | Status |
|----------|--------|-------|----------|--------|
| TG-32 Seasonal Router | 2kXMNdKdLW9l0m40 | 8 | 1st of month, 9am CT | Active |
| TG-14 Spring Nurture | nAYg8H9q6kqhtGbT | 6 | Called by TG-32 in March | Active |
| TG-15 Fall Nurture | RRym6KRyPue6GABC | 6 | Called by TG-32 in September | Active |
| TG-16 Snow Nurture | EUZtUKUAHDMUfgmi | 6 | Called by TG-32 in November | Active |

**Total active workflows: 22 unique** (25 including duplicates TG-95 x2, plus some legacy)

## Campaign Content

| Campaign | Subject Line | Services Promoted | CTA | Color Theme |
|----------|-------------|-------------------|-----|-------------|
| Spring (TG-14) | "Spring is here, {name}! Time to wake up your lawn" | Spring Cleanup, 5-Step Fertilization, Aeration, Garden Bed | "Schedule My Spring Cleanup" | Green |
| Fall (TG-15) | "Fall is coming, {name}! Protect your lawn before winter" | Fall Cleanup, Leaf Removal, Aeration & Overseeding, Gutters | "Schedule My Fall Cleanup" | Amber |
| Snow (TG-16) | "Winter is coming, {name}! Lock in snow removal now" | Snow Removal, Gutter Guard Installation | "Reserve My Snow Removal Spot" | Blue |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Wrong TG-95 workflowId in all three campaign files**
- **Found during:** Task 1
- **Issue:** Files referenced IUDLrQrAkcLFLsIC (duplicate TG-95) instead of FSRv5y8YzMjpyBtc (canonical)
- **Fix:** Updated all three to FSRv5y8YzMjpyBtc
- **Files modified:** TG-14, TG-15, TG-16

**2. [Rule 1 - Bug] Hardcoded Supabase URL in TG-14, TG-15, TG-16**
- **Found during:** Task 1
- **Issue:** Supabase URL was hardcoded instead of using $vars.TG_SUPABASE_URL
- **Fix:** Changed to use n8n environment variable reference
- **Files modified:** TG-14, TG-15, TG-16

## Pending Todos

- Replace OWNER_TELEGRAM_CHAT_ID in TG-14, TG-15, TG-16, TG-32 Telegram nodes with Vance's actual chat ID

## Success Criteria Verification

- [x] RETN-03: Seasonal campaigns auto-launch (spring March, fall Sept, snow Nov) via TG-32 router
- [x] RETN-04: Each campaign includes personalized seasonal service upsells
- [x] Campaigns use branded TotalGuard email template (green/gold/dark)
- [x] TG-32 runs on 1st of each month as central router
- [x] All sends tracked via TG-95 unified sender (FSRv5y8YzMjpyBtc)
- [x] All four workflows deployed and active on n8n
