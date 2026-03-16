# Phase 4 Plan 2: Shared Sub-Workflows (TG-113 + TG-105) Summary

## One-liner
Critical alert router (TG-113) and A/B test variant selector (TG-105) sub-workflows deployed as shared infrastructure for 15+ downstream workflows.

## What Was Done

### Task 1: TG-113 Critical Alert Router
- Built sub-workflow accepting `alert_type`, `alert_title`, `alert_body`, `severity`, `source_workflow`, `metadata`
- Color-coded HTML email with severity badges (critical=red, warning=orange, info=blue)
- Sends all alerts via TG-95 email (IUDLrQrAkcLFLsIC)
- Sends SMS via TG-94 (AprqI2DgQA8lehij) only for severity === 'critical'
- Returns `{ success, alert_type, severity, email_sent, sms_sent }`
- **Deployed**: n8n ID `GHL1BUPFZL8Ic6Bc` (ACTIVE)
- **Commit**: 18748b5

### Task 2: TG-105 A/B Test Router
- Built sub-workflow accepting `test_id`, `channel`, `recipient_phone`, `recipient_email`
- Handles 3 cases:
  1. No active test found -> returns `{ variant_id: null, variant_title: 'default', is_default: true }`
  2. Winner declared -> fetches winner variant from ab_test_variants, returns it
  3. Active test -> weighted random selection (default weight 50), logs to ab_test_sends
- Uses fullResponse:true on all GET requests
- **Deployed**: n8n ID `6qhihK1RPUzwk2pd` (ACTIVE)
- **Commit**: ed199d7

## Key Files

| File | Action | Purpose |
|------|--------|---------|
| `automation/n8n-workflows/TG-113-critical-alert-router.json` | Created | Unified alert delivery sub-workflow |
| `automation/n8n-workflows/TG-105-ab-test-router.json` | Created | A/B test variant selector sub-workflow |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| TG-113 n8n ID: GHL1BUPFZL8Ic6Bc | Deployed and activated |
| TG-105 n8n ID: 6qhihK1RPUzwk2pd | Deployed and activated |
| executeWorkflowTrigger typeVersion 1 on both | v1.1 fails activation with missing required parameters |
| SUPABASE_SECRET_KEY_PLACEHOLDER in local JSON | Real keys injected at deploy time only |
| OWNER_PHONE_PLACEHOLDER in TG-113 | Real phone injected at deploy time only |
| TG-113 sends SMS only for critical severity | Non-critical alerts don't warrant SMS interruption |
| TG-105 default weight = 50 per variant | Even distribution when weights not explicitly set |

## Deviations from Plan

None - plan executed exactly as written.

## Dependency Links

- **TG-113 calls**: TG-95 (email), TG-94 (SMS for critical)
- **TG-105 reads**: ab_tests, ab_test_variants (Supabase REST GET)
- **TG-105 writes**: ab_test_sends (Supabase REST POST)
- **Called by (future)**: TG-110 anomaly detection, TG-111 ad budget guardian, TG-112 ad conversion watchdog (TG-113); TG-83, TG-84, TG-85, TG-91 sending workflows (TG-105)

## Duration

~4 minutes

## Next Phase Readiness

Both sub-workflows are deployed and active. Downstream workflows in 04-03 through 04-12 can now call:
- TG-113 via `executeWorkflow` with ID `GHL1BUPFZL8Ic6Bc`
- TG-105 via `executeWorkflow` with ID `6qhihK1RPUzwk2pd`
