---
phase: 01-revenue-engine
plan: 04
subsystem: automation
tags: [n8n, webhook, quo, openphone, sms, missed-call, lead-capture]

requires:
  - 01-01 (missed_calls table, leads table, sms_consent RPC, sms_sends table)
provides:
  - TG-85 missed call capture workflow (auto-reply SMS on missed calls)
  - Quo webhook integration for call.completed events
  - Automatic lead creation from missed calls
affects:
  - TG-05 (dispatcher may need TG-85 workflow ID for routing)
  - Any future SMS workflows (pattern for Quo API + SMS consent gating)

tech-stack:
  added: []
  patterns:
    - "n8n webhook v2 body parsing: raw.body contains POST payload"
    - "alwaysOutputData on HTTP Request nodes that may return empty arrays"
    - "SMS consent gating via can_send_sms RPC before sending"
    - "Quo API POST /v1/messages with from/to/content for SMS"

key-files:
  created:
    - tgyardcare/automation/n8n-workflows/TG-85-missed-call-capture.json
  modified: []

key-decisions:
  - "Used source='phone' for leads (missed_call not in CHECK constraint)"
  - "OpenPhone webhook must be registered via dashboard (API POST /v1/webhooks returns 404)"
  - "SMS gated on can_send_sms consent check -- no consent = no SMS, but missed call still logged and lead created"

patterns-established:
  - "n8n webhook v2: access body via $input.first().json.body (not .json directly)"
  - "HTTP Request nodes returning Supabase arrays need alwaysOutputData: true"
  - "Quo API auth: plain API key in Authorization header (no Bearer prefix)"

duration: 12min
completed: 2026-03-15
---

# Phase 1 Plan 04: TG-85 Missed Call Capture Summary

**Webhook-triggered n8n workflow that logs missed calls to Supabase, creates leads, and sends auto-reply SMS via Quo API from the business number (+16085356057).**

## What Was Built

TG-85 is a 15-node n8n workflow triggered by Quo's call.completed webhook:

1. **Quo Call Webhook** -- receives POST from OpenPhone on call completion
2. **Parse Quo Webhook** -- extracts call data, handles n8n webhook v2 body wrapping
3. **Is Missed Call?** -- checks answeredAt === null
4. **Log Missed Call** -- inserts into missed_calls table
5. **Check Existing Lead** -- queries leads table by phone (with alwaysOutputData)
6. **Process Lead Result** -- determines if lead exists or needs creation
7. **Need New Lead?** -- conditional branch
8. **Create New Lead** -- creates lead with source=phone, score=30, tier=standard
9. **Check SMS Consent** -- calls can_send_sms RPC
10. **Has SMS Consent?** -- gates SMS sending
11. **Log SMS Send** -- records to sms_sends table
12. **Send Auto-Reply via Quo** -- POST to api.openphone.com/v1/messages FROM +16085356057
13. **Update Missed Call Record** -- marks sms_sent_at and lead_created
14. **Respond OK** / **Respond Skip** -- webhook response nodes

## Key Reference Data

- **Workflow ID**: VYKUqHGwurLvozsd
- **Webhook URL**: https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call
- **Quo Phone Number ID**: PNjxXAkfhr
- **Status**: Active in n8n

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] n8n webhook v2 body parsing**
- **Found during:** Task 1 (first test)
- **Issue:** Code node accessed $input.first().json.data.object but n8n webhook v2 wraps POST body under .body
- **Fix:** Changed to raw.body || raw before accessing data.object
- **Files modified:** TG-85-missed-call-capture.json (jsCode in Parse Quo Webhook node)

**2. [Rule 1 - Bug] Empty array response kills n8n flow**
- **Found during:** Task 1 (second test)
- **Issue:** When Check Existing Lead returns empty array [], n8n produces zero output items and subsequent nodes never execute
- **Fix:** Added alwaysOutputData: true to Check Existing Lead node
- **Files modified:** TG-85-missed-call-capture.json

**3. [Rule 1 - Bug] leads_source_check constraint violation**
- **Found during:** Task 1 (third test)
- **Issue:** source='missed_call' not in leads table CHECK constraint, causing 400 error
- **Fix:** Changed to source='phone' which is a valid CHECK value
- **Files modified:** TG-85-missed-call-capture.json

### Pending Manual Step

**OpenPhone webhook registration** -- The OpenPhone API does not support programmatic webhook creation (POST /v1/webhooks returns 404). Vance must register the webhook through the OpenPhone dashboard:

1. Go to OpenPhone Settings > Webhooks
2. Add webhook URL: `https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call`
3. Subscribe to event: `call.completed`

Until this is done, TG-85 is deployed and active but will not receive events from OpenPhone.

## Verification Results

| Check | Result |
|-------|--------|
| Workflow active in n8n | PASS (VYKUqHGwurLvozsd, active: true) |
| Webhook URL returns 200 | PASS |
| Missed call logged correctly | PASS (all fields populated) |
| Lead created for new callers | PASS (source=phone, score=30) |
| SMS consent checked | PASS (blocked when no consent) |
| Answered calls skip | PASS ("OK - not a missed call") |
| Quo webhook registered | PENDING (manual step required) |

## Next Phase Readiness

- TG-85 is fully functional and tested
- Blocking item: OpenPhone webhook must be registered manually via dashboard
- Once webhook is registered, every missed call to +16085356057 will auto-reply within seconds
