---
phase: 04-intelligence-layer
plan: 04
subsystem: automation
tags: [n8n, google-ads, ab-testing, gaql, supabase]

requires:
  - phase: 04-01
    provides: google_ads_daily table, ab_test_sends table, intelligence_reports table
  - phase: 04-02
    provides: TG-113 alert router, TG-105 A/B test router
provides:
  - TG-109 Google Ads daily sync (stub until API configured)
  - TG-106 A/B test auto-winner declaration
  - Wave 1 data pipeline foundation complete
affects: [04-05, 04-06, 04-07, 04-08]

tech-stack:
  added: []
  patterns:
    - "n8n $vars check for graceful degradation when API not configured"
    - "continueOnFail on external API nodes with error handling in next Code node"
    - "Code node to split array items for per-item processing (replaces SplitInBatches)"

key-files:
  created:
    - automation/n8n-workflows/TG-109-google-ads-daily-sync.json
    - automation/n8n-workflows/TG-106-ab-test-auto-winner.json
  modified: []

key-decisions:
  - "TG-109 uses $vars check for graceful skip — workflow stays ACTIVE even without Google Ads credentials"
  - "TG-109 uses GAQL v17 API with searchStream endpoint"
  - "TG-106 uses Code node to split tests instead of SplitInBatches for simpler data flow"
  - "TG-106 winner threshold: >20% relative improvement with minimum 30 sends per variant"

patterns-established:
  - "Stub workflow pattern: IF $vars check -> skip gracefully, allowing activation before credentials exist"

duration: 4min
completed: 2026-03-16
---

# Phase 4 Plan 4: Google Ads Sync + A/B Auto-Winner Summary

**TG-109 Google Ads daily sync (stub with graceful skip) + TG-106 A/B test auto-winner with 20% relative improvement threshold — completes Wave 1 data pipeline**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T21:14:28Z
- **Completed:** 2026-03-16T21:18:30Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- TG-109 deployed as functional stub — runs daily at 7 AM CT, gracefully skips if Google Ads API not configured
- TG-106 deployed — runs daily at 9 PM CT, auto-declares A/B test winners when sample size and improvement criteria met
- Wave 1 of Phase 4 Intelligence Layer is complete (6 workflows: TG-105, TG-106, TG-107, TG-108, TG-109, TG-113)

## Task Commits

1. **Tasks 1+2: TG-109 + TG-106** - `ca3e1bb` (feat)

**Plan metadata:** pending

## Workflow IDs

| Workflow | n8n ID | Cron (UTC) | Status |
|----------|--------|------------|--------|
| TG-109 Google Ads Daily Sync | rD7Tiz6WgIOI8ndG | 0 12 * * * (7 AM CT) | ACTIVE (stub) |
| TG-106 A/B Test Auto-Winner | 4LByKtLiF2hQO5Ut | 0 2 * * * (9 PM CT) | ACTIVE |

## Files Created
- `automation/n8n-workflows/TG-109-google-ads-daily-sync.json` - Daily Google Ads data sync with graceful skip
- `automation/n8n-workflows/TG-106-ab-test-auto-winner.json` - A/B test auto-winner declaration

## Decisions Made
- TG-109 uses n8n `$vars.TG_GOOGLE_ADS_CUSTOMER_ID` check — workflow stays ACTIVE and runs daily but gracefully exits the false branch if variable is not set
- TG-109 uses Google Ads API v17 searchStream endpoint with GAQL query for ad_group level metrics
- TG-109 has `continueOnFail: true` on the HTTP Request node to catch API errors without crashing
- TG-106 uses Code node to flatten test array (simpler than SplitInBatches for this use case)
- TG-106 winner criteria: both variants >= min_sends_per_variant (default 30), >20% relative conversion improvement
- TG-106 logs winner declarations to intelligence_reports table for pickup by weekly reports

## Deviations from Plan
None - plan executed exactly as written.

## Google Ads API Configuration Status
**Not configured (stub).** To enable real data sync, set these n8n variables:
- `TG_GOOGLE_ADS_CUSTOMER_ID` — Google Ads customer ID
- `TG_GOOGLE_ADS_ACCESS_TOKEN` — OAuth access token
- `TG_GOOGLE_ADS_DEV_TOKEN` — Developer token

## n8n API Calls Used
4 calls: create TG-109, activate TG-109, create TG-106, activate TG-106

## Issues Encountered
None.

## User Setup Required
None - both workflows are active. TG-109 will gracefully skip until Google Ads credentials are configured.

## Next Phase Readiness
- Wave 1 complete: all 6 data pipeline workflows deployed and active
- Ready for Wave 2 (04-05 through 04-08): weekly intelligence reports, learning engine, ad optimization
- Google Ads API credentials needed before TG-109 produces real data

---
*Phase: 04-intelligence-layer*
*Completed: 2026-03-16*
