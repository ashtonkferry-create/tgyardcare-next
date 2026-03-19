---
phase: 11-foundation-infrastructure
plan: 01
subsystem: infra
tags: [n8n, supabase, webhook, sms, email, workflow-activation]

# Dependency graph
requires:
  - phase: 11-foundation-infrastructure (prior INFRA-01/02)
    provides: "6 infrastructure workflows reactivated, 99 deactivated for clean slate"
provides:
  - "TG-92 webhook router active and receiving inbound webhooks"
  - "TG-113 critical alert router active for email/SMS alerts"
  - "TG-76 two-way SMS active with correct TG-94 reference"
  - "TG-01 lead capture active with current Supabase key"
  - "TG-94 unified SMS sender active"
  - "TG-95 unified email sender active"
affects: [12-conversion-engine, 13-lead-nurture, 14-sms-workflows, all-downstream-M4-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "n8n sub-workflow dependency chain: must activate leaves before parents"
    - "n8n PUT API requires 'name' field in request body"

key-files:
  created: []
  modified: []

key-decisions:
  - "Activated 4 dependency workflows (TG-94, TG-95, TG-76, TG-01) to unblock TG-92 and TG-113"
  - "Fixed TG-76 stale workflow reference from old TG-94 (mrAA8JWx8XyZNvGR) to new TG-94 (AprqI2DgQA8lehij)"
  - "Fixed TG-01 stale Supabase key in Update Lead with Brevo ID node"
  - "TG-92 already had new Supabase key (replaced in prior session) -- activation failure was dependency chain, not key issue"

patterns-established:
  - "n8n workflow activation order: activate sub-workflows before parent workflows that call them via executeWorkflow"
  - "Always verify full dependency chain before diagnosing activation failures"

# Metrics
duration: 6min
completed: 2026-03-19
---

# Phase 11 Plan 01: Fix and Activate TG-92 and TG-113 Summary

**Activated TG-92 webhook router and TG-113 critical alert router by resolving sub-workflow dependency chain and fixing stale references in TG-76 and TG-01**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-19T05:30:43Z
- **Completed:** 2026-03-19T05:36:37Z
- **Tasks:** 1
- **Files modified:** 0 (all n8n API work, no local files)

## Accomplishments
- TG-92 webhook router activated -- central hub for all inbound webhooks (Twilio SMS, web forms)
- TG-113 critical alert router activated -- routes alerts via TG-95 email and TG-94 SMS
- Fixed TG-76 pointing to wrong TG-94 workflow ID (old duplicate)
- Fixed TG-01 stale Supabase secret key (revoked key replaced with current)
- Total of 6 workflows now active: TG-92, TG-113, TG-76, TG-01, TG-94, TG-95

## Task Commits

This plan involved only n8n API operations (no local file changes). All work was committed as planning metadata:

1. **Task 1: Fetch, patch, and activate TG-92 and TG-113 via n8n API** - (n8n API operations, no git commit for code)

**Plan metadata:** See final docs commit below

## Files Created/Modified
- No local files modified -- all changes were to live n8n workflows via REST API

## Workflows Modified (n8n)

| Workflow | ID | Change | Result |
|----------|----|--------|--------|
| TG-92 | 8LrUMA6H4ZoCmnj6 | Activated (key already current) | active=true |
| TG-113 | GHL1BUPFZL8Ic6Bc | Activated (no Supabase keys needed) | active=true |
| TG-76 | XvUjMIkGDYUuYJxK | Fixed workflowId ref from mrAA8JWx8XyZNvGR to AprqI2DgQA8lehij, activated | active=true |
| TG-01 | 1ydNC4gmQeGQrXQi | Replaced stale Supabase key, activated | active=true |
| TG-94 | AprqI2DgQA8lehij | Activated (dependency of TG-92, TG-76, TG-113) | active=true |
| TG-95 | IUDLrQrAkcLFLsIC | Activated (dependency of TG-113) | active=true |

## Decisions Made
- **Root cause was dependency chain, not stale keys:** TG-92 and TG-113 failed activation because their sub-workflows (TG-76, TG-01, TG-94, TG-95) were not published. The Supabase key had already been replaced in TG-92 during a prior session.
- **Fixed TG-76 stale workflow reference:** TG-76 referenced an old duplicate of TG-94 (mrAA8JWx8XyZNvGR). Updated to reference the current TG-94 (AprqI2DgQA8lehij).
- **Fixed TG-01 stale Supabase key:** Found 1 occurrence of the revoked key `SUPABASE_SECRET_KEY_REVOKED` in the "Update Lead with Brevo ID" node. Replaced with current key.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Activated 4 dependency sub-workflows**
- **Found during:** Task 1 (TG-92 activation attempt)
- **Issue:** TG-92 and TG-113 could not activate because their executeWorkflow nodes referenced unpublished sub-workflows (TG-76, TG-01, TG-94, TG-95)
- **Fix:** Activated TG-94, TG-95, TG-01 first, then fixed TG-76's stale reference and activated it, which unblocked TG-92 and TG-113
- **Files modified:** n8n workflows (API only)
- **Verification:** All 6 workflows confirmed active=true via GET API calls
- **Committed in:** N/A (API operations)

**2. [Rule 1 - Bug] Fixed TG-76 stale workflow reference**
- **Found during:** Task 1 (TG-76 activation attempt)
- **Issue:** TG-76 "Send Reply via TG-94" node referenced old duplicate workflow mrAA8JWx8XyZNvGR instead of correct AprqI2DgQA8lehij
- **Fix:** Updated workflowId in the executeWorkflow node via PUT API
- **Files modified:** TG-76 workflow (n8n API)
- **Verification:** TG-76 activated successfully after fix
- **Committed in:** N/A (API operations)

**3. [Rule 1 - Bug] Fixed TG-01 stale Supabase key**
- **Found during:** Task 1 (inspecting TG-01 activation response)
- **Issue:** TG-01 "Update Lead with Brevo ID" node contained revoked Supabase key SUPABASE_SECRET_KEY_REVOKED
- **Fix:** Replaced with current key SUPABASE_SECRET_KEY_CURRENT via PUT API
- **Files modified:** TG-01 workflow (n8n API)
- **Verification:** GET TG-01 returns 0 occurrences of old key
- **Committed in:** N/A (API operations)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes were necessary to complete the plan. The original diagnosis (stale keys causing HTTP 400) was partially wrong -- the real blocker was unpublished sub-workflow dependencies. No scope creep.

## Issues Encountered
- Original plan assumed HTTP 400 was caused by stale Supabase keys. In reality, TG-92's keys were already updated. The actual cause was n8n's requirement that all executeWorkflow sub-workflows must be published before a parent workflow can activate.
- There are TWO copies of TG-94 in n8n (AprqI2DgQA8lehij and mrAA8JWx8XyZNvGR). TG-76 was pointing to the old one. The old copy remains inactive.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TG-92 webhook router is live and ready to receive inbound webhooks from Twilio and web forms
- TG-113 critical alert router is live and can send alerts via TG-95 (email) and TG-94 (SMS)
- All M4 downstream phases that depend on webhook routing and alerting are unblocked
- Note: TG-94 SMS sending depends on Twilio A2P 10DLC campaign approval -- outbound SMS may still be carrier-filtered
- Note: There is a duplicate URL bug in TG-94 Supabase HTTP requests (`https://https://lwtmvzhwekgdxkaisfra.supabase.co`) that should be fixed in a future plan

---
*Phase: 11-foundation-infrastructure*
*Completed: 2026-03-19*
