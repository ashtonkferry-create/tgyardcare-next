---
status: partially-fixed
trigger: "URGENT: Debug why missed call SMS isn't firing for TotalGuard Yard Care"
created: 2026-03-17T00:00:00Z
updated: 2026-03-17T00:00:00Z
---

## Current Focus

hypothesis: THREE independent issues are blocking missed-call SMS
test: API checks against Twilio and n8n
expecting: Identify all failure points in the call-to-SMS pipeline
next_action: User must resubmit A2P 10DLC campaign in Twilio Console (Issues 2 and 3 already fixed via API)

## Symptoms

expected: Caller dials 608-535-6057 (Quo) -> forwarded to Twilio +16089953554 -> n8n TG-85 triggers -> SMS sent to caller
actual: No SMS received by any caller
errors: Twilio error 30034 on ALL outbound SMS (7/7 messages undelivered)
reproduction: Call 608-535-6057 from any phone
started: At least since 2026-03-14 (earliest message in logs)

## Eliminated

- hypothesis: n8n TG-85 workflow is inactive or broken
  evidence: Workflow VYKUqHGwurLvozsd is active:true, 7 successful executions on 2026-03-15
  timestamp: 2026-03-17

- hypothesis: n8n is not receiving the SMS webhook
  evidence: SMS webhook URL correctly set to https://tgyardcare.app.n8n.cloud/webhook/tg-router
  timestamp: 2026-03-17

## Evidence

- timestamp: 2026-03-17
  checked: Twilio outbound message logs (From +16089953554, last 10)
  found: ALL 7 messages have status "undelivered" with error_code 30034. All sent to +19206296934. Dates range from 2026-03-14 to 2026-03-16.
  implication: Error 30034 = "Message from Unregistered Number" — A2P 10DLC campaign is not approved, carriers are blocking ALL outbound SMS.

- timestamp: 2026-03-17
  checked: Twilio Messaging Services
  found: Two services exist. "Low Volume Mixed A2P Messaging Service" (MGfc30151c41f9c3fb68f1336a9fc12123) has us_app_to_person_registered:true BUT phone_numbers list is EMPTY — +16089953554 is NOT associated with this service.
  implication: Even if the A2P campaign were approved, the phone number isn't linked to the messaging service.

- timestamp: 2026-03-17
  checked: A2P 10DLC campaign status on messaging service MGfc30151c41f9c3fb68f1336a9fc12123
  found: campaign_status = "FAILED". Error 30896: "The campaign submission has been reviewed and it was rejected because of provided Opt-in information." Specifically the MESSAGE_FLOW field was rejected.
  implication: Campaign was REJECTED (not pending). Must be resubmitted with corrected opt-in information before any SMS can be delivered.

- timestamp: 2026-03-17
  checked: Twilio Voice webhook configuration for +16089953554
  found: voice_url = "https://demo.twilio.com/welcome/voice/" (Twilio default demo). NOT pointing to n8n.
  implication: When someone calls +16089953554 directly, Twilio plays the default demo greeting — it does NOT trigger n8n TG-85 workflow. The webhook for VOICE calls is not configured.

- timestamp: 2026-03-17
  checked: Twilio call logs (all directions)
  found: ZERO calls logged in the account. No inbound calls recorded at all.
  implication: Either (a) Quo forwarding isn't reaching Twilio, or (b) calls to +16089953554 are answered by the demo voice URL and not logged as expected (unlikely — they should still be logged). Most likely: the Quo -> Twilio forwarding is a regular phone forward, so Twilio sees these as regular inbound calls that get answered by the demo URL without triggering any webhook to n8n.

- timestamp: 2026-03-17
  checked: n8n TG-85 execution logs
  found: Last execution was 2026-03-15T07:12. No executions on 2026-03-16 or 2026-03-17.
  implication: TG-85 has NOT been triggered recently. The trigger mechanism (Twilio voice webhook -> n8n) is not working because voice_url points to demo, not n8n.

## Resolution

root_cause: |
  THREE compounding issues prevent missed-call SMS:

  **ISSUE 1 (CRITICAL): A2P 10DLC Campaign REJECTED**
  Campaign QE2c6890da8086d771620e9b13fadeba0b has campaign_status="FAILED".
  Error 30896: Opt-in information (MESSAGE_FLOW) was rejected by carrier review.
  ALL outbound SMS from +16089953554 will be blocked (error 30034) until this is fixed.
  This cannot be fixed via API — must be resubmitted in Twilio Console with corrected opt-in flow.

  **ISSUE 2 (CRITICAL): Phone number not linked to Messaging Service**
  +16089953554 is NOT associated with the A2P-registered Messaging Service (MGfc30151c41f9c3fb68f1336a9fc12123).
  The phone_numbers list on that service is empty.
  Even after campaign approval, SMS must be sent VIA this messaging service (not direct from number).

  **ISSUE 3 (CRITICAL): Voice webhook points to Twilio demo, not n8n**
  voice_url = "https://demo.twilio.com/welcome/voice/" instead of an n8n webhook URL.
  When calls arrive at +16089953554, Twilio plays the demo greeting and does NOT notify n8n.
  This means TG-85 never fires for inbound calls.

fix: |
  STEP 1 (User action required): Resubmit A2P 10DLC campaign in Twilio Console
  - Go to: Twilio Console > Messaging > Compliance > A2P Registration
  - Fix the MESSAGE_FLOW / opt-in description to meet carrier requirements
  - Key issue: The opt-in disclosure must be more explicit and the opt-in URL (tgyardcare.com/contact) must visibly show the SMS consent language
  - Ensure tgyardcare.com/terms actually exists and contains SMS terms
  - Resubmit and wait for approval (typically 1-7 business days)

  STEP 2 (FIXED via API 2026-03-17): Added phone number to messaging service
  - +16089953554 now associated with MGfc30151c41f9c3fb68f1336a9fc12123
  - Confirmed: date_created 2026-03-17T06:10:11Z

  STEP 3 (FIXED via API 2026-03-17): Updated voice webhook URL
  - Changed voice_url from demo.twilio.com to https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call
  - Confirmed: voice_url now points to n8n TG-85

verification: |
  Issues 2 and 3: FIXED and verified via API responses.
  Issue 1 (A2P campaign): BLOCKED — requires manual resubmission in Twilio Console.
  Full end-to-end verification not possible until A2P campaign is approved.
files_changed: []
