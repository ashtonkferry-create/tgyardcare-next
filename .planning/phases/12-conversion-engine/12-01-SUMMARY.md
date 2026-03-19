---
phase: 12-conversion-engine
plan: 01
subsystem: automation
tags: [n8n, sms, telegram, email, lead-capture, instant-response, multi-channel]
dependency_graph:
  requires: [11-01]
  provides: [CONV-01-sms-confirmation, CONV-02-telegram-alert, CONV-03-email-confirmation]
  affects: [12-02, 12-03, 12-04]
tech_stack:
  added: []
  patterns: [parallel-branch-execution, sub-workflow-delegation, conditional-channel-routing]
key_files:
  created: []
  modified: [automation/n8n-workflows/TG-01-lead-capture.json]
decisions:
  - id: telegram-chat-id-placeholder
    decision: "Use OWNER_TELEGRAM_CHAT_ID placeholder in Build Telegram Alert node -- Vance must replace with actual chat ID"
    reason: "n8n variables API not available on current license; chat ID is a user secret"
  - id: no-parse-mode-telegram
    decision: "Send Telegram alerts as plain text with emojis (no parse_mode) rather than HTML"
    reason: "Plain text with Unicode emojis renders reliably; HTML parse_mode can break with special characters in lead names"
  - id: email-template-reuse
    decision: "Reused TG-09 buildEmailHtml pattern for branded confirmation email"
    reason: "Consistent branding across all TotalGuard emails; green #2D5A27 header, gold #C5A55A accents, trust strip, dark footer"
  - id: parallel-fire-and-forget
    decision: "SMS/Telegram/Email branches fire in parallel and don't block webhook response"
    reason: "Webhook response path (Brevo -> Build Response) stays fast; instant channels are fire-and-forget"
metrics:
  duration: ~4 minutes
  completed: 2026-03-19
---

# Phase 12 Plan 01: Instant Multi-Channel Lead Response Summary

**One-liner:** TG-01 enhanced with parallel SMS (TG-94), Telegram owner alert (tap-to-call), and branded email confirmation (TG-95) firing within seconds of every quote form submission.

## What Was Done

### Task 1: Add instant multi-channel response nodes to TG-01
**Commit:** `c2ed441`

Added 8 new nodes to TG-01-lead-capture.json (15 total, up from 7). Three parallel branches fire from "Extract Lead ID" alongside the existing Brevo sync:

**Branch 1 -- SMS Confirmation (CONV-01):**
- IF Has Phone -> Build SMS Body -> Send SMS via TG-94
- Friendly message: "Hi {name}! Thanks for requesting a {service} quote from TotalGuard Yard Care. We'll get back to you ASAP -- usually within the hour!"
- Delegates to TG-94 sub-workflow (AprqI2DgQA8lehij) for actual SMS delivery
- Skips silently if no phone number provided

**Branch 2 -- Telegram Owner Alert (CONV-02):**
- Build Telegram Alert -> Send Telegram Alert
- Rich alert with lead name, phone, email, service, source, score/tier, timestamp
- Includes `tel:` link for one-tap calling from Telegram
- Uses TG-74's Telegram credential pattern (id: "telegram", name: "Telegram")
- OWNER_TELEGRAM_CHAT_ID placeholder must be replaced with Vance's actual chat ID

**Branch 3 -- Email Confirmation (CONV-03):**
- IF Has Email -> Build Confirmation Email -> Send Email via TG-95
- Branded HTML email matching TG-09 template (green header, gold accents, trust strip, dark footer)
- Subject: "We received your quote request, {first_name}!"
- Trust signals: 4.9-star rating, 500+ properties, licensed & insured
- CTA: "Visit Our Website" linking to tgyardcare.com
- Delegates to TG-95 sub-workflow (IUDLrQrAkcLFLsIC) for actual email delivery
- Skips silently if no email provided

**Existing flow preserved exactly:** Webhook -> Normalize -> Score -> Insert Supabase -> Extract Lead ID -> Sync Brevo -> Build Response (all 7 original nodes untouched -- same IDs, positions, logic).

### Task 2: Deploy to n8n and verify activation
**No file changes (deployment operation)**

- PUT updated workflow JSON to n8n API (workflow ID: 1ydNC4gmQeGQrXQi)
- Workflow was already active from Phase 11; remained active after update
- Verified: 15 nodes present on n8n, all 8 new nodes confirmed, active: true

## Deviations from Plan

None -- plan executed exactly as written.

## User Setup Required

1. **Telegram Chat ID:** Replace `OWNER_TELEGRAM_CHAT_ID` in the "Build Telegram Alert" code node with Vance's actual Telegram chat ID. To find it: send any message to the TotalGuard Telegram bot, then check TG-74's execution logs for the `chatId` value. Until this is set, Telegram alerts will fail silently but SMS and email will still work.

2. **Twilio A2P Compliance:** SMS via TG-94 depends on Twilio A2P 10DLC campaign approval (status unknown per STATE.md). SMS may be carrier-filtered until campaign is approved.

## Verification Results

| Check | Result |
|-------|--------|
| Valid JSON | PASS |
| 15 nodes total (7 original + 8 new) | PASS |
| Extract Lead ID fans to 4 targets | PASS |
| TG-94 workflowId = AprqI2DgQA8lehij | PASS |
| TG-95 workflowId = IUDLrQrAkcLFLsIC | PASS |
| Telegram credential matches TG-74 | PASS |
| Original nodes unchanged (IDs, positions) | PASS |
| Workflow active on n8n | PASS |
| All new nodes visible on n8n | PASS |

## Success Criteria Status

- [x] CONV-01: SMS branch calls TG-94 with lead phone + confirmation message
- [x] CONV-02: Telegram branch sends alert with lead details + tap-to-call link
- [x] CONV-03: Email branch calls TG-95 with branded HTML confirmation
- [x] All 3 branches fire in parallel after "Extract Lead ID"
- [x] Existing lead capture flow untouched
- [x] Workflow deployed and active on n8n

## Next Phase Readiness

Phase 12 Plan 02 (lead scoring + routing) can proceed -- TG-01 infrastructure is live. The Telegram chat ID placeholder is the only setup item; it does not block other plans since SMS and email work independently.
