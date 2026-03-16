# Phase 2: CRM Unification - Research

**Researched:** 2026-03-16
**Domain:** n8n workflow automation, webhook routing, SMS/email communication infrastructure
**Confidence:** HIGH

## Summary

This phase builds the communication nervous system for TotalGuard: a single n8n webhook endpoint that routes all inbound events (Jobber email notifications, Twilio SMS replies, web form submissions) to the correct handler workflows, plus a notification-based auto-dispatch system for the owner. All work is pure n8n automation infrastructure -- no new UI.

The critical constraint is that Jobber is on the Core plan ($39/mo) with NO API and NO Zapier. All Jobber "events" arrive as email notifications parsed by TG-05 (IMAP) from `notification@txn.getjobber.com`. The webhook router does not receive real Jobber webhooks -- it receives structured events emitted by TG-05 after parsing emails. This is the single most important architectural fact for this phase.

The existing Supabase schema already has: `sms_consent` table, `sms_sends` table, `can_send_sms()` function, `jobber_email_events` table, and `jobber_events` table. New tables needed: `webhook_events` (debug log + idempotency) and `dispatch_log` (dispatch tracking).

**Primary recommendation:** Build 4 n8n workflows: (1) TG-92 webhook router (single public endpoint), (2) unified SMS sender (sub-workflow), (3) unified email sender (sub-workflow), (4) TG-93 auto-dispatch handler (sub-workflow). Extend TG-05 to call the router/dispatch via Execute Workflow. Convert TG-76 from standalone webhook to sub-workflow called by TG-92.

## Standard Stack

### Core (Already in Place)
| Tool | Instance | Purpose | Status |
|------|----------|---------|--------|
| n8n Cloud | tgyardcare.app.n8n.cloud | Workflow automation engine | Live, 82+ workflows, paid plan |
| Supabase | lwtmvzhwekgdxkaisfra.supabase.co | Database + REST API | Live, 70+ migrations applied |
| Twilio | TWILIO_PHONE | Outbound/inbound automated SMS | Number active, A2P 10DLC pending |
| Resend | hello@tgyardcare.com | Transactional email | Domain verified, DKIM+SPF set |
| Brevo | vance@tgyardcare.com | Marketing email | API key in Supabase vault |
| Gmail IMAP | totalguardllc@gmail.com | Jobber email parsing (TG-05) | App password: hzie adml avxq npbs |
| Quo/OpenPhone | OWNER_PHONE | Customer-facing business line | API key rotated 2026-03-15 |

### n8n Nodes Used
| Node | Purpose | Notes |
|------|---------|-------|
| Webhook | Single public entry point for router | Only public-facing webhook in system |
| Execute Sub-workflow | Internal workflow calls | Parent passes data, receives results |
| Execute Sub-workflow Trigger | Entry point in child workflows | Defines input schema for sub-workflows |
| Switch | Multi-branch routing by event_type | Better than chained IFs for 5+ branches |
| Code (JavaScript) | Payload parsing, transformation | Keep logic minimal |
| HTTP Request | Supabase REST API, Twilio API, Resend API | For operations n8n nodes don't cover |
| Twilio (native) | Send SMS | Simpler than HTTP Request for basic sends |
| Wait | 2-hour dispatch reminder delay | Owner confirmation timeout |
| Respond to Webhook | Immediate HTTP response to caller | Critical for Twilio's 1-second timeout |
| IF | Binary routing decisions | Consent checks, rate limit checks |

### API Endpoints
| Service | Endpoint | Auth |
|---------|----------|------|
| Supabase REST | `https://lwtmvzhwekgdxkaisfra.supabase.co/rest/v1/{table}` | `apikey` + `Authorization: Bearer` (service key) |
| Supabase RPC | `https://lwtmvzhwekgdxkaisfra.supabase.co/rest/v1/rpc/{fn}` | Same as above |
| Twilio SMS | `https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json` | Basic Auth (SID:AuthToken) |
| Resend Email | `https://api.resend.com/emails` | `Authorization: Bearer {key}` |
| Quo SMS | `https://api.openphone.com/v1/messages` | `Authorization: {api_key}` (no "Bearer") |
| Google Maps | `https://www.google.com/maps/search/?api=1&query={encoded}` | No auth -- static URL |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| n8n Supabase node for upsert | HTTP Request + Supabase REST API | REST API supports ON CONFLICT upserts; native node does not |
| Multiple public webhooks | Single router webhook | Router is cleaner, single auth point, full event logging |
| Redis for idempotency | Supabase UNIQUE constraint | Supabase is already in stack, volume is low |
| Real Jobber webhooks | IMAP email parsing (TG-05) | Jobber Core has no API -- IMAP is the only option |

**Installation:** No new packages. All integrations use existing n8n HTTP Request or native nodes.

## Architecture Patterns

### Recommended Workflow Structure
```
TG-92  Webhook Router (NEW -- single public webhook)
  |
  +-- Twilio inbound SMS --> calls TG-76 (converted to sub-workflow)
  +-- Web form submissions --> calls TG-01 (lead capture)
  +-- Unknown events --> log to webhook_events, no routing
  |
TG-93  Auto-Dispatch (NEW -- sub-workflow)
  |
  +-- Called by TG-05 on job_created/quote_approved
  +-- Sends owner SMS with job details + Google Maps link
  +-- Waits 2 hours, checks for owner confirmation
  +-- Sends reminder if no confirmation
  |
TG-05  Jobber Email Parser (EXTEND)
  |
  +-- After parsing, calls TG-93 via Execute Workflow for job_created/quote_approved
  +-- Also emits events to router for logging (optional)
  |
TG-76  Two-Way SMS (MODIFY -- convert from standalone webhook to sub-workflow)
  |
  +-- Remove public webhook, add Execute Sub-workflow Trigger
  +-- Called by TG-92 for inbound SMS handling
  |
NEW    Unified SMS Sender (sub-workflow)
  +-- Consent check via can_send_sms() RPC
  +-- Rate limit check (3/day per phone)
  +-- Twilio send + sms_sends logging
  |
NEW    Unified Email Sender (sub-workflow)
  +-- Resend send via hello@tgyardcare.com
  +-- Logging
```

### Pattern 1: Webhook Router (TG-92) with Immediate Response
**What:** Single webhook receives all inbound events. Responds IMMEDIATELY, then routes asynchronously.
**When to use:** Always -- this is the only public entry point.

**CRITICAL:** Twilio requires a response within ~1 second. The webhook MUST use `responseMode: responseNode` and send the response BEFORE any Execute Workflow calls.

```
Webhook Node (POST /tg-inbound, responseMode: responseNode)
  --> Code Node: parse payload, detect source, extract event_type + webhook_id
  --> Respond to Webhook: return 200 (TwiML for Twilio, JSON for others)
  --> HTTP Request: INSERT into webhook_events (log ALWAYS, before routing)
  --> HTTP Request: check idempotency (SELECT WHERE webhook_id = X AND processed = true)
  --> IF (duplicate?) --> stop
  --> Switch (by event_type):
       "sms.inbound"       --> Execute Workflow: TG-76 (SMS keyword handler)
       "form.submitted"    --> Execute Workflow: TG-01 (lead capture)
       default             --> no routing (already logged in webhook_events)
  --> HTTP Request: UPDATE webhook_events SET processed = true
```

**n8n webhook URL:** `https://tgyardcare.app.n8n.cloud/webhook/tg-inbound`

**Twilio TwiML response (must be immediate):**
```xml
<?xml version="1.0" encoding="UTF-8"?><Response/>
```
Set `Content-Type: text/xml` header in the Respond to Webhook node.

### Pattern 2: TG-05 Emitting Events to Dispatch
**What:** TG-05 parses Jobber emails via IMAP. When it detects job_created or quote_approved, it calls TG-93 via Execute Workflow.
**Why not route through TG-92:** TG-05 and TG-93 are both internal n8n workflows. Execute Workflow is direct, fast, and doesn't need HTTP. No point routing through the webhook router for internal events.

```
TG-05 (IMAP trigger, polls totalguardllc@gmail.com)
  --> Code Node: parse email subject/body
  --> Switch: by parsed_event_type
       "job_created"    --> Execute Workflow: TG-93 (dispatch)
       "quote_approved" --> Execute Workflow: TG-93 (dispatch)
       "job_completed"  --> Execute Workflow: TG-18 + TG-89 + TG-61
       "invoice_sent"   --> Execute Workflow: TG-84
       "payment_received" --> Execute Workflow: TG-65
  --> HTTP Request: INSERT into jobber_email_events (already exists)
```

**Inherent delay:** IMAP polling has 0-15 minute delay. The owner gets the dispatch SMS within 15 minutes of the Jobber action, not instantly. This is a Jobber Core plan limitation.

### Pattern 3: Auto-Dispatch with Owner Confirmation (TG-93)
**What:** Sub-workflow that sends dispatch SMS to owner, waits for confirmation, sends reminder if needed.

```
Execute Sub-workflow Trigger (receives: customer_name, address, service_type, scheduled_time, event_type, jobber_email_event_id)
  --> Code Node: format dispatch SMS with Google Maps link
  --> Twilio Node: send SMS to owner (OWNER_PHONE)
  --> HTTP Request: INSERT dispatch_log (status: pending)
  --> Wait Node: 2 hours
  --> HTTP Request: SELECT dispatch_log WHERE id = X
  --> IF (status still 'pending')
       YES --> Twilio Node: send reminder SMS to owner
             --> HTTP Request: UPDATE dispatch_log SET reminder_sent_at
       NO  --> end (owner already confirmed or flagged)
```

**Owner SMS format:**
```
NEW JOB -- [Customer Name]
Service: [Service Type]
Address: [Address]
Scheduled: [Date/Time]
Maps: https://www.google.com/maps/search/?api=1&query=[encoded_address]

Reply 1 to confirm, 2 to flag issue
```

**Owner reply handling (separate execution path):**
```
Owner texts "1" or "2" to Twilio number
  --> TG-92 receives inbound SMS
  --> Code Node detects from_phone = owner's number
  --> IF (body = "1" or "2")
       --> HTTP Request: UPDATE dispatch_log SET status = confirmed/flagged
            WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1
```

### Pattern 4: Unified SMS Sender (Sub-workflow)
**What:** Every CUSTOMER-facing SMS goes through this sub-workflow for consent + rate limiting + logging.
**When to use:** All workflows that send SMS to customers. NOT for owner notifications.

```
Execute Sub-workflow Trigger (receives: to_phone, message_body, workflow_name, message_type)
  --> HTTP Request: Supabase RPC can_send_sms(to_phone)
  --> IF (can_send = false) --> log "blocked: no consent" --> return {sent: false}
  --> HTTP Request: GET sms_sends WHERE to_phone = X AND sent_at > today_start
  --> Code Node: count results
  --> IF (count >= 3) --> log "blocked: rate limit" --> return {sent: false}
  --> Twilio Node: send SMS (from: TWILIO_PHONE)
  --> HTTP Request: INSERT sms_sends (log the send)
  --> return {sent: true, message_sid: X}
```

**Owner notifications bypass this sub-workflow entirely.** Dispatch SMS (TG-93) sends directly via Twilio node -- owner is not a "customer" subject to consent/rate limits.

### Pattern 5: Idempotency via Supabase UNIQUE Constraint
**What:** Prevent duplicate processing using webhook_id UNIQUE constraint on webhook_events table.
**When to use:** Every inbound event.

Idempotency key sources:
- **Twilio SMS:** `MessageSid` field (guaranteed unique per message)
- **Web forms:** `contact_submissions.id` from Supabase (if form handler creates record first)
- **TG-05 Jobber events:** Hash of `email_subject + parsed_at` (TG-05 generates this)

Pattern: INSERT with ON CONFLICT DO NOTHING, then check if your insert succeeded:
```
POST /rest/v1/webhook_events
Headers: Prefer: return=representation
Body: { webhook_id: "SM123...", source: "twilio", ... }

-- If response has data --> new event, proceed with routing
-- If response is empty (conflict) --> duplicate, stop
```

### Anti-Patterns to Avoid
- **Multiple public webhooks:** Context explicitly says router is ONLY public webhook. Convert TG-76 to sub-workflow.
- **Direct Twilio/Resend calls from individual workflows:** All customer SMS/email must go through unified senders.
- **Silently dropping unknown events:** Context requires all events logged to webhook_events. Never noOp.
- **Assuming Jobber sends real webhooks:** Jobber Core has NO API. All events come through TG-05 email parsing.
- **Responding to Twilio AFTER sub-workflow calls:** Twilio times out in ~1 second. Always Respond to Webhook BEFORE Execute Workflow.
- **Sending owner dispatch SMS through unified sender:** Owner is exempt from consent checks and rate limits.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SMS consent checking | Custom IF logic per workflow | `can_send_sms()` RPC (migration 027, already exists) | Centralized, TCPA compliant |
| SMS rate limiting | New rate limit table | COUNT on `sms_sends` WHERE to_phone + 24h window | Table + index already exist |
| SMS send logging | Custom tracking | `sms_sends` table (migration 027) | Has to_phone, workflow_name, status, sent_at |
| STOP/HELP handling | Custom keyword parser | Twilio Advanced Opt-Out (automatic for A2P 10DLC) | Twilio intercepts STOP/HELP before your webhook sees them |
| Google Maps link | Maps Embed API | Static URL: `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(address)}` | No API key needed |
| Webhook deduplication | n8n Remove Duplicates node | Supabase UNIQUE constraint on webhook_id | Remove Duplicates only works within single execution, not across executions |
| Jobber event receiver | Jobber webhook registration | TG-05 IMAP parsing + Execute Workflow | No Jobber API on Core plan |
| Route table in database | New routing config table | Switch node in TG-92 Code node | Simple enough; DB table is over-engineering |

**Key insight about Twilio STOP/HELP:** Twilio automatically handles STOP, UNSTOP, HELP, and INFO keywords for A2P 10DLC numbers. When a customer texts STOP, Twilio blocks future messages and sends a confirmation -- your webhook never sees these messages. However, consider syncing Twilio's opt-out status back to `sms_consent` via Twilio status callbacks to keep local state accurate.

## New Supabase Tables Required

### webhook_events (idempotency + debug logging)
```sql
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT UNIQUE,             -- MessageSid, jobber hash, or form ID
  source TEXT NOT NULL,               -- 'twilio', 'web_form', 'jobber_email', 'unknown'
  event_type TEXT NOT NULL,           -- 'sms.inbound', 'form.submitted', 'job.created', etc.
  payload JSONB NOT NULL,             -- Full raw payload for debugging
  routed_to TEXT,                     -- Workflow called (e.g., 'TG-76', 'TG-93')
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_source ON webhook_events(source);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_received ON webhook_events(received_at DESC);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON webhook_events FOR ALL
  USING (auth.role() = 'service_role');
```

**Note:** A `jobber_events` table already exists (migration 20260305) but it was designed for real Jobber API webhooks (has `event_type` + `payload` JSONB). The new `webhook_events` table serves a different purpose: unified routing log for ALL sources with idempotency. Keep both.

### dispatch_log (owner confirmation tracking)
```sql
CREATE TABLE IF NOT EXISTS dispatch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,           -- 'job.created' or 'quote.approved'
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  service_type TEXT,
  address TEXT,
  scheduled_time TEXT,
  maps_url TEXT,

  -- Dispatch status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'flagged', 'expired', 'failed')),
  dispatch_sms_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  owner_response TEXT,                -- '1' or '2'
  owner_responded_at TIMESTAMPTZ,
  flag_reason TEXT,

  -- Source tracking
  webhook_event_id UUID,
  jobber_email_event_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispatch_log_status ON dispatch_log(status);
CREATE INDEX idx_dispatch_log_created ON dispatch_log(created_at DESC);

ALTER TABLE dispatch_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON dispatch_log FOR ALL
  USING (auth.role() = 'service_role');
```

## Common Pitfalls

### Pitfall 1: Twilio 1-Second Webhook Timeout
**What goes wrong:** Twilio marks webhook as failed and retries, causing duplicate executions and duplicate dispatch SMS to owner.
**Why it happens:** Execute Workflow calls are synchronous and can take 2-5+ seconds. If the webhook response waits for sub-workflow completion, Twilio times out.
**How to avoid:** Use `responseMode: responseNode` on the Webhook node. Place a `Respond to Webhook` node immediately after payload parsing, BEFORE any Execute Workflow calls. Return empty TwiML `<Response/>` for Twilio, or `{"status": "received"}` for other sources.
**Warning signs:** Twilio console shows repeated webhook deliveries for same MessageSid; owner receives duplicate SMS.

### Pitfall 2: Treating Jobber "Webhooks" as Real Webhooks
**What goes wrong:** Building webhook signature verification for Jobber events, expecting real-time HTTP payloads from Jobber.
**Why it happens:** CONTEXT.md says "Jobber job.created webhook" which sounds like real webhooks. Jobber Core has NO API and NO webhooks.
**How to avoid:** ALL Jobber events come through TG-05 IMAP parsing with 0-15 minute delay. TG-05 calls TG-93 via Execute Workflow. Never attempt to register Jobber webhooks or verify Jobber signatures.
**Warning signs:** Any reference to "Jobber API key", "Jobber webhook secret", or "real-time Jobber events" in the plan.

### Pitfall 3: Wait Node + Inbound SMS Race Condition
**What goes wrong:** TG-93 dispatch workflow has a Wait node (2 hours). Owner replies "1" via SMS. The reply arrives at TG-92 as a separate execution. If TG-93's Wait expires and checks dispatch_log before TG-92 has written the owner's response, the owner gets an unnecessary reminder.
**Why it happens:** Two separate n8n executions running concurrently on shared state.
**How to avoid:** The window is tiny (milliseconds). But to be safe: TG-93's post-wait check should use `status != 'pending'` rather than `status = 'confirmed'` -- any status change means the owner responded. If still pending after 2 hours, that's a genuine no-response.
**Warning signs:** Owner confirmed but still receives reminder SMS.

### Pitfall 4: n8n Supabase Node Limitations
**What goes wrong:** Trying to do upserts, RPC calls, or COUNT queries with the native Supabase node.
**Why it happens:** The n8n Supabase node supports basic CRUD (select, insert, delete) but NOT upsert, RPC, or aggregation.
**How to avoid:** Use HTTP Request node with Supabase REST API for: upserts (Prefer: resolution=merge-duplicates), RPC calls (/rest/v1/rpc/can_send_sms), COUNT queries (Prefer: count=exact). Native node is fine for simple SELECT and INSERT.
**Warning signs:** Workflow errors on "operation not supported" or complex workarounds for check-then-insert.

### Pitfall 5: Owner SMS Through Unified Sender
**What goes wrong:** Dispatch SMS to owner goes through unified SMS sender, which checks can_send_sms() and rate limits. Owner has no sms_consent record, so SMS is blocked.
**Why it happens:** Taking "all SMS goes through unified sender" too literally.
**How to avoid:** Owner notifications are internal business communication, NOT customer-facing marketing. Dispatch SMS (TG-93) sends directly via Twilio node to owner's number, bypassing consent and rate limit checks entirely. Only CUSTOMER-facing SMS uses the unified sender.
**Warning signs:** Dispatch notifications silently failing; no error because can_send_sms returns false gracefully.

### Pitfall 6: Converting TG-76 While Twilio Points to It
**What goes wrong:** Converting TG-76 from standalone webhook to sub-workflow breaks inbound SMS if Twilio is pointing to TG-76's webhook URL.
**Why it happens:** Changing the workflow trigger type without updating Twilio configuration.
**How to avoid:** Per `reference_phone_numbers.md`, Twilio is currently pointing at `demo.twilio.com`, NOT TG-76. This means the conversion is zero-risk. Configure Twilio to point directly to TG-92's URL from the start.
**Warning signs:** Check Twilio console before making changes. If it already points to TG-76, update Twilio to TG-92 first.

## Code Examples

### Webhook Router Source Detection (n8n Code Node)
```javascript
// Source: adapted from existing TG-79 universal router pattern
const body = $input.first().json.body || $input.first().json;

let source = 'unknown';
let eventType = 'unknown';
let webhookId = null;

// Twilio inbound SMS (form-urlencoded, has MessageSid)
if (body.MessageSid) {
  source = 'twilio';
  eventType = 'sms.inbound';
  webhookId = body.MessageSid;
}
// Web form submission (has email field)
else if (body.source === 'web_form' || (body.email && body.first_name)) {
  source = 'web_form';
  eventType = 'form.submitted';
  webhookId = body.submission_id || `form_${Date.now()}`;
}

return [{
  json: {
    source,
    event_type: eventType,
    webhook_id: webhookId,
    from_phone: body.From || null,
    message_body: body.Body || null,
    payload: body,
    received_at: new Date().toISOString()
  }
}];
```

### SMS Keyword Routing (n8n Code Node, within TG-76)
```javascript
const body = $input.first().json;
const text = (body.message_body || '').trim().toLowerCase();
const fromPhone = body.from_phone;
const ownerPhone = 'OWNER_PHONE';

let intent = 'general';

// Owner dispatch confirmation
if (fromPhone === ownerPhone) {
  if (['1', 'yes', 'confirm'].includes(text)) intent = 'dispatch_confirm';
  else if (['2', 'no', 'flag'].includes(text)) intent = 'dispatch_flag';
  else intent = 'owner_general';
}
// Customer keywords (STOP/HELP handled by Twilio automatically)
else {
  if (['yes'].includes(text)) intent = 'opt_in_confirm';
  else intent = 'customer_general';
}

return [{ json: { ...body, intent } }];
```

### Dispatch SMS Formatting (n8n Code Node)
```javascript
const data = $input.first().json;
const address = data.address || 'Address not available';
const encodedAddress = encodeURIComponent(address);
const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

const eventLabel = data.event_type === 'quote.approved' ? 'Quote approved' : 'New job';

const message = [
  `${eventLabel}: ${data.customer_name || 'Unknown'}`,
  `Service: ${data.service_type || 'Not specified'}`,
  `Address: ${address}`,
  `Scheduled: ${data.scheduled_time || 'TBD'}`,
  `Maps: ${mapsLink}`,
  '',
  'Reply 1 to confirm, 2 to flag issue'
].join('\n');

return [{ json: { sms_body: message, to_phone: 'OWNER_PHONE' } }];
```

### Rate Limit Check (HTTP Request to Supabase)
```
Method: GET
URL: https://lwtmvzhwekgdxkaisfra.supabase.co/rest/v1/sms_sends
  ?to_phone=eq.{phone}
  &sent_at=gte.{today_start_iso}
  &select=id
Headers:
  apikey: {SUPABASE_SERVICE_KEY}
  Authorization: Bearer {SUPABASE_SERVICE_KEY}
  Prefer: count=exact

-- Response header "content-range" gives count (e.g., "0-2/3")
-- If count >= 3, skip sending
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| TG-76 has own public webhook | TG-92 is sole entry point, TG-76 becomes sub-workflow | All SMS routing centralized |
| TG-79 is generic router (minimal) | TG-92 replaces TG-79 with full event routing | TG-79 can be deprecated |
| Each workflow sends SMS directly | Unified SMS sender sub-workflow | Consent + rate limiting enforced everywhere |
| No event logging | webhook_events table logs everything | Full audit trail for debugging |

**Deprecated/outdated:**
- TG-79 universal router: Replaced by TG-92's more capable routing
- Direct Twilio calls from individual workflows: Replaced by unified SMS sender
- `workelyhelp@gmail.com` IMAP: Should be `totalguardllc@gmail.com` (Phase 0 fix)

## Webhook Signature Verification (Claude's Discretion)

Since n8n Cloud doesn't natively support HMAC signature verification:

1. **For the public webhook router (TG-92):** Use n8n Webhook node's built-in Header Auth. Configure a custom header `X-Webhook-Secret` with a random 32-character string. External callers must include this header.

2. **For Twilio:** Configure the webhook URL in Twilio console with a query parameter secret: `https://tgyardcare.app.n8n.cloud/webhook/tg-inbound?secret=XXXXX`. First Code node verifies `$input.first().json.query.secret === expected`. This is simpler and more reliable than HMAC validation on n8n Cloud.

3. **For internal calls (TG-05 -> TG-93):** No verification needed -- Execute Workflow is inherently trusted (same n8n instance).

## Retry Logic (Claude's Discretion)

- **Supabase writes:** Retry 2x with 5-second delay. If all fail, log error and continue.
- **Twilio SMS sends:** Retry 1x with 10-second delay. If fails, log to sms_sends with status='failed'.
- **Resend email sends:** Retry 1x with 10-second delay. Same pattern as Twilio.
- **Execute Workflow calls:** No retry -- internal calls should not fail. If they do, it's a bug.

Implementation: Use n8n's built-in Error Trigger to catch failures and send alert SMS to owner.

## Open Questions

1. **TG-05 sub-workflow IDs:** TG-05 was noted as "inactive until sub-workflow IDs are populated." After building TG-93, its n8n workflow ID must be configured in TG-05's Execute Workflow nodes.
   - What we know: TG-05 parses emails and routes via Switch node
   - What's unclear: Current Execute Workflow node configuration in TG-05
   - Recommendation: Inspect TG-05 in n8n after building TG-93, update the workflow ID

2. **TG-79 disposition:** TG-79 exists as "universal-router." Is it actively used by anything?
   - What we know: It's registered in workflow_registry
   - Recommendation: Check if any external service points to TG-79's webhook URL. If not, deprecate it. If yes, migrate callers to TG-92.

3. **Twilio A2P 10DLC status:** SMS is "UNVERIFIED" -- A2P campaign registration pending.
   - Recommendation: Build all workflows regardless. They'll work once A2P is approved. Log all attempts.

4. **$vars support:** TG-76 references `$vars.TG_OWNER_PHONE`. Unknown if these variables are configured.
   - Recommendation: Check n8n Settings > Variables at build time. If populated, use $vars. If empty, hardcode with comments.

5. **Twilio currently points to demo.twilio.com:** Per reference_phone_numbers.md, inbound SMS webhook is NOT yet configured.
   - Recommendation: Point Twilio directly to TG-92's webhook URL when ready. No migration needed from TG-76.

## Sources

### Primary (HIGH confidence)
- `automation/migrations/027_sms_consent_tracking.sql` -- sms_consent, sms_sends, can_send_sms() verified
- `automation/migrations/001_base_leads_system.sql` -- jobber_email_events schema verified
- `supabase/migrations/20260305_jobber_integration.sql` -- jobber_events table schema verified
- `automation/migrations/20260314000070_revenue_engine_schema.sql` -- revenue engine schema verified
- `docs/plans/2026-03-14-tg-automation-roadmap.md` -- full workflow inventory and Jobber Core limitations
- Memory: `reference_phone_numbers.md` -- Twilio points to demo.twilio.com, not TG-76
- Memory: `reference_n8n.md` -- instance URL and API key confirmed
- Memory: `reference_gmail_totalguard.md` -- IMAP credentials confirmed
- Memory: `project_tg_email_pipeline.md` -- Resend/Brevo configuration confirmed

### Secondary (MEDIUM confidence)
- [n8n Execute Sub-workflow docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/) -- sub-workflow calling pattern
- [n8n Webhook node docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) -- authentication options
- [Twilio inbound SMS webhook format](https://www.twilio.com/docs/messaging/guides/webhook-request) -- MessageSid, Body, From fields
- [Twilio STOP/HELP automatic handling](https://support.twilio.com/hc/en-us/articles/223134027) -- A2P opt-out is automatic
- [n8n idempotency patterns](https://community.n8n.io/t/preventing-duplicate-webhook-executions-in-n8n-idempotency-gate-workflow/275249) -- UNIQUE constraint approach
- [n8n webhook HMAC discussion](https://community.n8n.io/t/feature-proposal-hmac-signature-verification-for-webhook-node/223375) -- no native HMAC, use Header Auth
- [n8n Supabase upsert limitations](https://community.n8n.io/t/supabase-node-support-upsert/16319) -- native node lacks upsert

### Tertiary (LOW confidence)
- Twilio 1-second webhook timeout -- well-established but not directly verified from current docs
- Google Maps static URL format -- well-known, verified by usage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools already deployed and verified in codebase
- Architecture: HIGH -- patterns adapted from existing TG workflows (TG-05, TG-76, TG-79)
- Database schemas: HIGH -- designed to match existing migration patterns
- Jobber constraint: HIGH -- confirmed by roadmap doc and memory files
- Pitfalls: HIGH -- derived from actual project constraints and verified infrastructure state
- Retry/verification recommendations: MEDIUM -- based on community best practices

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack, patterns don't change rapidly)
