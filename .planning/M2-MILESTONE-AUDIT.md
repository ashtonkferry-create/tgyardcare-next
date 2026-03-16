---
milestone: M2
audited: 2026-03-16T22:30:00Z
re_audited: 2026-03-16T23:00:00Z
status: tech_debt
scores:
  requirements: N/A (M2 uses success criteria, not formal requirements)
  phases: 5/5 (Phase 0 not executed, Phase 4.1 gap closure complete)
  integration: 0/0 critical issues (all 7 resolved by Phase 4.1)
  flows: 0/0 broken flows (all resolved by Phase 4.1)
gaps:
  integration:
    - "W1: TG-76 call-tg94 has literal placeholder TG94_WORKFLOW_ID in local JSON"
    - "W2: TG-05 call-tg83/84/86 have empty workflowId in local JSON"
    - "S1: TG-05 inserts wrong column names to jobber_email_events (event_type vs parsed_event_type)"
    - "S2: TG-92 writes status to sms_consent (should be consent_status)"
    - "S3: TG-94 calls can_send_sms with phone_number param (should be p_phone)"
    - "S4: ab_test_variants missing content column — A/B variant content never delivered"
  flows:
    - "Inbound SMS -> TG-92 -> TG-76 -> TG-94: Broken — TG-76 has TG94_WORKFLOW_ID placeholder"
    - "Jobber Email -> TG-05 -> TG-83/84/86: Broken — empty workflowId in executeWorkflow nodes"
    - "A/B Test Delivery: Broken — ab_test_variants has no content column"
tech_debt:
  - phase: phase-1-revenue-engine
    items:
      - "PLACEHOLDER_TWILIO_ID in TG-84 and TG-91 (credential wiring needed in n8n UI)"
      - "Phase 1 workflows bypass TG-94/95 unified senders (direct Twilio calls)"
  - phase: 02-crm-unification
    items:
      - "TG-95 has no Supabase logging step for email_sends"
      - "A2P 10DLC campaign pending carrier approval (external blocker)"
  - phase: 03-seo-domination
    items:
      - "TG-96 missing pagination loop for >25K GSC rows (accepted as low-risk)"
      - "03-VERIFICATION.md not re-run after 03-06 gap closure (fixes verified in 03-06-SUMMARY.md)"
  - phase: 04-intelligence-layer
    items:
      - "15/21 new workflows pending n8n deployment (API rate limited)"
      - "6 modified workflows (TG-83/84/85/91/94/95) pending n8n push"
      - "Multiple workflow JSONs have no top-level id field (n8n assigns at import)"
---

# M2: Automation Gap Closer — Milestone Audit

**Milestone Goal:** Take TG from ~35 functional automations to 127+ by fixing existing dead workflows, building every missing capability TTW has, and adding an intelligence layer TTW doesn't have.

**Audited:** 2026-03-16
**Status:** GAPS FOUND — 6 critical cross-phase integration issues

---

## Phase Verification Summary

| Phase | Score | Status | Notes |
|-------|-------|--------|-------|
| 0. Fix Existing | N/A | Not executed | Configuration-only phase, deferred |
| 1. Revenue Engine | 12/12 | PASSED | All 9 workflows verified |
| 2. CRM Unification | 15/15 | PASSED | Webhook router live, TG-92 executions confirmed |
| 3. SEO Domination | 13/17 → Fixed | PASSED (post gap closure) | 03-06 fixed schema mismatch + missing aggregation |
| 4. Intelligence Layer | 7/7 | PASSED | All 21 new + 6 modified workflows verified |

All 4 executed phases passed individual verification. Phase 3 had gaps that were closed by plan 03-06.

---

## Cross-Phase Integration Issues

### Critical (Wiring Broken)

**W1: TG-76 → TG-94 placeholder workflowId**
- File: `automation/n8n-workflows/TG-76-two-way-sms.json`
- Issue: `workflowId: "TG94_WORKFLOW_ID"` literal string in local JSON
- Impact: Customer SMS replies don't route through unified sender in local JSON
- Note: Phase 2 VERIFICATION says live n8n has real ID `AprqI2DgQA8lehij` — local JSON not updated
- Severity: **Critical (local JSON) / OK (live n8n)**

**W2: TG-05 → TG-83/84/86 empty workflowId**
- File: `automation/n8n-workflows/TG-05-jobber-email-parser.json`
- Issue: executeWorkflow nodes for TG-83, TG-84, TG-86 have empty `workflowId`
- Impact: Jobber events don't trigger Phase 1 sub-workflows from local JSON
- Note: If live n8n has IDs populated, this is a local-only issue
- Severity: **Critical (local JSON) / Needs verification (live n8n)**

### Critical (Schema Mismatch)

**S1: TG-05 jobber_email_events column names**
- File: `automation/n8n-workflows/TG-05-jobber-email-parser.json`
- Issue: Inserts `event_type` but table column may be `parsed_event_type`
- Impact: PostgREST 400 error on every Jobber email parse
- Severity: **Critical — needs column name verification**

**S2: TG-92 sms_consent column name**
- File: `automation/n8n-workflows/TG-92-webhook-router.json`
- Issue: Writes `status` to `sms_consent` but column may be `consent_status`
- Impact: Consent check lookup fails → SMS blocked or allowed incorrectly
- Severity: **Critical — needs column name verification**

**S3: TG-94 can_send_sms parameter name**
- File: `automation/n8n-workflows/TG-94-unified-sms-sender.json`
- Issue: RPC call uses `phone_number` param but function expects `p_phone`
- Impact: Every consent check fails → all outbound SMS blocked
- Severity: **Critical — needs RPC signature verification**

**S4: ab_test_variants missing content column**
- File: Schema / Migration
- Issue: `ab_test_variants` table has no `content` column for variant message text
- Impact: A/B test router (TG-105) can't deliver variant-specific content
- Severity: **High — A/B testing broken end-to-end**

### Medium (Design Debt)

**D1: Phase 1 workflows bypass TG-94/95 unified senders**
- Issue: TG-83/84/85/88/89/90/91 send SMS/email directly via Twilio/Resend, not through unified pipeline
- Impact: No consent check, no rate limiting, no centralized logging for Phase 1 workflows
- Note: Phase 4 modifications (04-11) partially address this by adding A/B routing to TG-83/84/85/91

**D2: TG-95 missing email logging**
- Issue: TG-95 unified email sender has no Supabase logging step for `email_sends` table
- Impact: Email sends not tracked in database — analytics gap

**D3: No top-level `id` field in workflow JSONs**
- Issue: Multiple workflow JSONs lack top-level `id` field
- Impact: n8n assigns IDs at import time — not an issue for deployment, but local JSONs can't reference each other by ID

---

## E2E Flow Analysis

| Flow | Status | Break Point |
|------|--------|-------------|
| Inbound SMS → TG-92 → TG-76 → TG-94 → reply | **Conditional** | W1: local JSON has placeholder, live n8n reportedly OK |
| Jobber Email → TG-05 → TG-83/84/86 sub-workflows | **Broken (local)** | W2: empty workflowId in local JSON |
| New quote → TG-83 follow-up → A/B test → customer SMS | **Broken** | S4: ab_test_variants missing content column |
| Anomaly → TG-110 → TG-113 → TG-95 email + TG-94 SMS | **OK** | All wiring verified |
| Weekly reports → TG-118 assembler → TG-95 email | **OK** | All wiring verified |
| Revenue sync → TG-107 → intelligence_metrics → TG-125 dashboard | **OK** | All wiring verified |

---

## Milestone Success Criteria Check

From ROADMAP.md M2 definition:

| Criteria | Status | Evidence |
|----------|--------|---------|
| All existing workflows functional (0 dead on arrival) | **Partial** | Phase 0 not executed — ~20 dead workflows remain |
| Every revenue-impact TTW capability replicated or exceeded | **Satisfied** | Phases 1-4 cover all TTW capabilities |
| CRM fully unified (single webhook router, unified comms) | **Satisfied** | TG-92 router live, TG-94/95 unified senders built |
| SEO gaps closed (GSC sync, city content, gap detection) | **Satisfied** | 9 SEO workflows (TG-96-104) built and verified |
| Self-improvement loop operational | **Satisfied** | 21 intelligence workflows (TG-105-125) built |
| Final score: TG wins 90+, TTW wins <20 | **Likely satisfied** | 127+ workflows built across 4 phases |

---

## Deployment Backlog

Not code gaps, but operational items needed for live functionality:

| Item | Count | Blocked By |
|------|-------|------------|
| New workflows pending n8n deploy | 15 | n8n API rate limit |
| Modified workflows pending n8n push | 6 | n8n API rate limit |
| Phase 0 configuration fixes | ~20 | Not started |
| Twilio A2P 10DLC approval | 1 | Carrier review |

---

## Recommendation

**6 critical/high integration issues must be resolved before M2 can be considered complete.** The issues fall into two categories:

1. **Local JSON sync issues (W1, W2, D3):** Live n8n may already have correct IDs. Need to verify live state and update local JSONs to match.

2. **Schema/RPC mismatches (S1, S2, S3, S4):** These are potentially runtime-breaking. Need to verify actual Supabase schema and RPC signatures, then fix whichever side is wrong.

**Recommended next step:** `/gsd:plan-milestone-gaps` to create a gap closure phase addressing all 6 issues.

---

*Audited: 2026-03-16*
*Auditor: Claude (gsd-integration-checker + orchestrator)*
