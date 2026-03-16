# 02-05 Activation Log

## Date: 2026-03-16

## Workflow Status (All Phase 2)

| Workflow | ID | Active | Notes |
|----------|-----|--------|-------|
| TG-76 (Two-Way SMS) | XvUjMIkGDYUuYJxK | YES | Active since 02-01 |
| TG-92 (Webhook Router) | 8LrUMA6H4ZoCmnj6 | **NO** | API activation failed - n8n bug (see below) |
| TG-93 (Auto-Dispatch) | JBZCSMGKzBoTz7se | YES | Active since 02-03 |
| TG-94 (Unified SMS Sender) | AprqI2DgQA8lehij | YES | Active since 02-04 |
| TG-95 (Unified Email Sender) | IUDLrQrAkcLFLsIC | YES | Active since 02-04 |

## TG-92 Activation Issue

**API endpoint tried:** `POST /api/v1/workflows/8LrUMA6H4ZoCmnj6/activate`
**Error:** `{"message":"propertyValues[itemName] is not iterable"}`
**Root cause:** n8n Cloud API bug when activating workflows with httpRequest nodes that have twilioApi credentials attached (credential ID: cwxndVw60DCxqeNg). The two affected nodes are "Send Opt-Out Confirmation" and "Send Opt-In Confirmation".
**Resolution:** Must activate manually via n8n UI toggle switch at https://tgyardcare.app.n8n.cloud/workflow/8LrUMA6H4ZoCmnj6

## Twilio Webhook Update

**Phone:** +16089953554 (SID: PNe5fa87e4ca3e4af55a65e09614a46567)
**Previous SMS URL:** https://demo.twilio.com/welcome/sms/reply
**New SMS URL:** https://tgyardcare.app.n8n.cloud/webhook/tg-router
**Method:** POST
**Status:** SUCCESS - verified via Twilio API read-back

## Remaining Action

1. Manually activate TG-92 in n8n UI (toggle on)
2. End-to-end SMS testing after TG-92 is active
