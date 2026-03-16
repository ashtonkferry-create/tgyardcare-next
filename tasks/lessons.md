# TotalGuard — Lessons Learned

## Twilio

### A2P 10DLC Campaign Required for Outbound SMS
**What happened:** Built and wired full TG-92 → TG-76 → TG-94 → Twilio send pipeline. End-to-end routing worked correctly in n8n but no SMS reply arrived at test phone. Spent time debugging n8n node bugs before realizing Twilio was silently dropping outbound messages.

**Root cause:** Twilio requires an approved A2P 10DLC campaign to send SMS from a 10-digit local number (+16089953554) to US numbers. Until the campaign is approved, outbound messages are filtered by carriers. **Inbound messages still work fine.** The number was registered but the campaign approval was still pending.

**How to detect early:** When testing SMS automation, check Twilio's Message Logs for outbound sends. A delivered message shows `status: delivered`. A filtered message shows `status: undelivered` or `status: failed` with an error code (30007 = carrier filtering).

**Rule going forward:**
- Before building any outbound SMS feature, verify: `Is the A2P 10DLC campaign approved?`
- Twilio Console → Messaging → Regulatory Compliance → Campaign Registry
- If pending: inbound works, outbound will silently fail
- Never assume "no reply" means the n8n pipeline is broken — check Twilio logs first

---

## n8n

### Supabase GET returning empty array halts workflow
**What happened:** Any n8n `httpRequest` node making a Supabase REST GET that returns `[]` (no rows found) outputs 0 items. n8n treats this as "nothing to process" and silently stops the execution. Downstream nodes never run. The execution shows `status: success` which is misleading.

**Affected nodes in TG-92:** Check Idempotency, Check SMS Consent (both fixed with `fullResponse: true`).

**Fix:** Add `"options": { "response": { "response": { "fullResponse": true } } }` to any httpRequest GET node where an empty result is a valid non-error case. With `fullResponse: true`, the node always outputs `{statusCode, headers, body}` as 1 item. Update the downstream Code node to read `fullResp.body !== undefined ? fullResp.body : fullResp`.

**Rule going forward:**
- Any Supabase GET that checks for existence (not guaranteed to return rows) needs `fullResponse: true`
- Pattern: "does this phone exist in sms_consent?" → empty = valid answer → needs fullResponse
- Pattern: "does this MessageSid exist in webhook_events?" → empty = valid answer → needs fullResponse
- Contrast: Supabase POST/PATCH/DELETE always return data or error, no empty array issue

### n8n expression corruption on deploy
**What happened:** When deploying TG-92 via n8n API PUT, expression strings like `={{ $json.source }}` got stored as `={{ .source }}` in the live workflow. This caused Switch nodes to error because `.source` is invalid expression syntax.

**Fix:** After any n8n API deployment, verify Switch/IF node `leftValue` expressions in the live workflow by re-fetching via GET and checking for `={{ .` patterns. Fix by re-deploying the corrected JSON.

**Rule going forward:**
- After deploying workflows with Switch or IF nodes via API, always verify expressions look correct in n8n UI or via GET response
- Look for `={{ .xxx }}` (broken) vs `={{ $json.xxx }}` (correct)
