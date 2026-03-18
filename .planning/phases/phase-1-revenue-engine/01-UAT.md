---
status: testing
phase: phase-1-revenue-engine
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md, 01-06-SUMMARY.md, 01-07-SUMMARY.md, 01-08-SUMMARY.md, 01-09-SUMMARY.md]
started: 2026-03-15T17:30:00Z
updated: 2026-03-15T17:30:00Z
---

## Current Test

number: 8
name: TG-83 quote follow-up fires when triggered
expected: |
  In n8n, open TG-83. Click "Execute" (test run).
  It should attempt to fetch estimates from Supabase, find none pending (or find some), and process them.
  No error in the first Supabase fetch step. (SMS won't actually send without Twilio creds — that's expected.)
awaiting: user response

## Tests

### 1. Supabase — New automation tables exist
expected: In Supabase dashboard (lwtmvzhwekgdxkaisfra), go to Table Editor. You should see: fertilizer_schedule, missed_calls, sms_sends. fertilizer_schedule should have rows (4 customers × 5 steps = ~20 rows for 2026).
result: pass

### 2. n8n — Revenue Engine workflows exist
expected: Go to tgyardcare.app.n8n.cloud. In the workflow list you should see: TG-83 (Quote Follow-up), TG-84 (Invoice Collections), TG-85 (Missed Call Capture), TG-86 (Plan Enrollment), TG-87 (Plan Renewal Reminder), TG-88 (On My Way SMS), TG-89 (Invoice Delivery), TG-90 (Fertilizer Schedule Engine), TG-91 (Abandoned Quote SMS). That's 9 new workflows.
result: pass

### 3. TG-91 is active in n8n
expected: TG-91 (Abandoned Quote SMS) should show as ACTIVE (green toggle) in n8n. It runs daily at 10 AM CT and requires no external SMS credentials since it uses Brevo. This should be the one workflow that's live right now.
result: pass

### 4. TG-85 webhook URL is reachable
expected: The missed call webhook is deployed and listening. Go to n8n → TG-85 → click the Quo Call Webhook node. The webhook URL should show as https://tgyardcare.app.n8n.cloud/webhook/tg85-missed-call and the workflow should show as inactive (waiting for OpenPhone webhook registration).
result: pass

### 5. TG-87 is active in n8n
expected: TG-87 (Plan Renewal Reminder) should show as ACTIVE in n8n. It runs daily at 9 AM CT (14:00 UTC) and sends renewal reminder emails via Brevo. No SMS / no Twilio needed.
result: pass

### 6. TG-05 has sub-workflow IDs populated
expected: Open TG-05 in n8n. In the workflow, find the Execute Sub-workflow nodes (Call TG-83, Call TG-84, Call TG-86, Call TG-88, Call TG-89). Each should show a specific workflow ID selected (not blank). TG-05 itself is still inactive because Twilio credentials aren't added yet.
result: pass

### 7. Email templates exist in repo
expected: In VSCode/file explorer, check tgyardcare/automation/email-templates/. You should see 6 HTML files: tg-welcome.html, tg-educational.html, tg-hero.html, tg-referral.html, tg-review.html, tg-urgency.html. Also a campaigns/ folder with 10 JSON strategy files.
result: pass

### 8. TG-83 quote follow-up fires when triggered
expected: This one tests the sequence logic. In n8n, open TG-83. Click "Execute" (test run). It should attempt to fetch estimates from Supabase, find none pending (or find some), and process them. No error in the first Supabase fetch step. (SMS won't actually send without Twilio creds — that's expected.)
result: [pending]

### 9. Brevo setup guide is accessible
expected: In VSCode, open tgyardcare/automation/docs/brevo-setup-guide.md. It should exist and contain instructions for domain authentication, sender config, and the going-live checklist with DNS records to add in Cloudflare.
result: [pending]

## Summary

total: 9
passed: 7
issues: 0
pending: 2
skipped: 0

## Gaps

[none yet]
