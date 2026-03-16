---
phase: 04-intelligence-layer
plan: 11
subsystem: automation-ab-testing
tags: [n8n, a/b-testing, sms, email, workflow-integration]
depends_on: ["04-02", "04-04"]
provides: ["ab-test-integration-in-send-workflows"]
affects: ["future-ab-test-activation"]
tech-stack:
  patterns: [execute-sub-workflow-ab-routing, is_default-fallback-pattern]
key-files:
  modified:
    - automation/n8n-workflows/TG-83-quote-followup-sequence.json
    - automation/n8n-workflows/TG-84-invoice-collections-sequence.json
    - automation/n8n-workflows/TG-85-missed-call-capture.json
    - automation/n8n-workflows/TG-91-abandoned-quote-sms.json
    - automation/n8n-workflows/TG-94-unified-sms-sender.json
    - automation/n8n-workflows/TG-95-unified-email-sender.json
metrics:
  duration: ~4 minutes
  completed: 2026-03-16
---

# Phase 4 Plan 11: A/B Test Integration into Existing Workflows Summary

**One-liner:** 6 workflows modified to call TG-105 A/B test router before sending, with is_default fallback ensuring zero behavior change when no test active.

## Tasks Completed

### Task 1: Modify TG-83, TG-84, TG-85, TG-91 for A/B test integration
- **TG-83** (quote followup): Added 4 nodes -- 2 A/B test points (tg83-day2-sms before Touch 1 SMS, tg83-day7-email before Touch 2 Email). Each calls TG-105 (6qhihK1RPUzwk2pd) via executeWorkflow, then Apply node checks is_default to decide between original hardcoded message and variant_content.
- **TG-84** (invoice collections): Added 4 nodes -- 2 A/B test points (tg84-day3-sms before Touch 1 SMS, tg84-day10-email before Touch 2 Email). Same pattern as TG-83.
- **TG-85** (missed call capture): Added 2 nodes -- 1 A/B test point (tg85-autoreply-sms before auto-reply). Inserts between Has SMS Consent? and Log SMS Send.
- **TG-91** (abandoned quote): Added 2 nodes -- 1 A/B test point (tg91-reengagement-sms before nudge SMS). Inserts between Has Consent? and Log SMS Send.

### Task 2: Modify TG-94 + TG-95 for A/B logging
- **TG-94** (unified SMS sender): Validate Input now accepts optional ab_test_id/ab_variant_id. Log SMS Success and Log SMS Failure both include these fields in the sms_sends INSERT.
- **TG-95** (unified email sender): Validate Input now accepts optional ab_test_id/ab_variant_id. Check Send Result and Check Retry Result both pass these fields through in return data.

## Key Design Decisions

1. **Execute Sub-workflow pattern**: Each A/B test point calls TG-105 via executeWorkflow with test_id and channel parameters.
2. **is_default fallback**: Apply nodes check `is_default === true` -- if so, use the original hardcoded message. Only use variant_content when TG-105 returns an active variant.
3. **Backward compatibility**: When no A/B test is active for a given test_id, TG-105 returns is_default=true, so all workflows behave identically to before.
4. **ab_test_id/ab_variant_id propagation**: SMS log nodes in TG-83/84/85/91 include these fields. TG-94/95 accept them as optional inputs for centralized logging.
5. **Local-only**: JSONs saved locally, not deployed to n8n (rate limit concern). Deploy in next session.

## Deviations from Plan

None -- plan executed exactly as written.

## Commit Log

| Hash | Message |
|------|---------|
| b3df5ed | feat(04-11): integrate A/B testing into TG-83/84/85/91 + TG-94/95 A/B logging |
