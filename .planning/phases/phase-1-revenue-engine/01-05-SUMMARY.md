# Phase 1 Plan 5: TG-83 Quote Follow-up Sequence Summary

**One-liner:** 3-touch 14-day quote follow-up sub-workflow with SMS consent gating and status re-checks after every wait

---

## Metadata

- **Phase:** 01-revenue-engine
- **Plan:** 05
- **Subsystem:** n8n automation / quote follow-up
- **Tags:** n8n, twilio, brevo, supabase, sms-consent, follow-up-sequence
- **Completed:** 2026-03-15
- **Duration:** ~10 minutes

### Dependency Graph

- **Requires:** 01-01 (Supabase schema), 01-02 (TG-05 Jobber email parser)
- **Provides:** TG-83 quote follow-up sequence, TG-05 now routes quote_sent to TG-83
- **Affects:** 01-06 (TG-84), 01-07 (TG-86) -- remaining TG-05 sub-workflows

### Tech Stack

- **Patterns:** executeWorkflowTrigger sub-workflow, Wait node pacing, status state machine
- **APIs:** Supabase REST (estimates table), Supabase RPC (can_send_sms), Brevo SMTP, Twilio SMS

### Key Files

- **Created:** `tgyardcare/automation/n8n-workflows/TG-83-quote-followup-sequence.json`
- **Modified:** TG-05 workflow in n8n (Call TG-83 node now has workflowId)

---

## What Was Built

TG-83 is a sub-workflow triggered by TG-05 when a Jobber "quote sent" email is detected. It runs a 3-touch follow-up sequence over 14 days:

1. **Touch 1 (Day 2):** SMS check-in after 48 hours
2. **Touch 2 (Day 7):** Email with social proof testimonials after 5 more days
3. **Touch 3 (Day 14):** Final SMS with urgency after 7 more days, then marks quote expired

### Status State Machine

```
null -> enrolled -> day2_sent -> day7_sent -> expired
```

After each Wait node, the workflow re-queries the `estimates` table to check if `followup_status` still matches the expected value. If the customer responded (status changed externally), the sequence exits immediately via "Exit - Customer Responded" node.

### Consent Gating

- Touch 1 (SMS): Checks `can_send_sms(p_phone)` RPC before sending. No-consent -> "Exit - No Consent" (does NOT advance to "Mark Day 2 Sent")
- Touch 2 (Email): Relies on Brevo list suppression for email consent
- Touch 3 (SMS): Checks `can_send_sms(p_phone)` RPC before sending. No-consent -> "Exit - No Consent" (does NOT advance to "Mark Expired")

### Workflow IDs

- **TG-83:** `9m2sID72Fz1PF0HY`
- **TG-05:** `Jf5VYdWpDs3VgRzd` (Call TG-83 node updated with workflowId)

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Twilio credential placeholder `TG_TWILIO` used | No Twilio credential exists in n8n yet -- Vance needs to add manually |
| No-consent branches exit sequence entirely | Sending follow-up emails without prior SMS touch would confuse customer journey |
| Brevo handles email consent | Brevo has built-in suppression for unsubscribes/bounces, no need to duplicate |
| Workflow deployed inactive | Consistent with prior plans -- activate after all sub-workflows are wired |

---

## Deviations from Plan

None -- plan executed exactly as written.

---

## Blockers

- **Twilio credentials:** TG-83 Twilio nodes use placeholder `TG_TWILIO`. SMS sending will fail until Vance adds Twilio credentials to n8n.
- **TG-05 still inactive:** TG-84 and TG-86 sub-workflow IDs still empty. TG-05 cannot be activated until all sub-workflows are created.

---

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `7479a8e` | TG-83 deployed to n8n, TG-05 wired, local JSON saved |

---

## Verification Results

- [x] TG-83 exists in n8n with 29 nodes
- [x] TG-05's "Call TG-83 Quote Follow-up" node has workflowId `9m2sID72Fz1PF0HY`
- [x] 3 Wait nodes: 48 hours, 5 days, 7 days
- [x] Status re-checked after each Wait via Supabase GET
- [x] SMS consent checked before Touch 1 and Touch 3
- [x] No-consent T1 -> "Exit - No Consent" (NOT "Mark Day 2 Sent")
- [x] No-consent T3 -> "Exit - No Consent" (NOT "Mark Expired")
- [x] Local JSON saved with secrets redacted
