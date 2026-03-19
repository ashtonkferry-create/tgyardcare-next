---
phase: 13-delivery-excellence
plan: 02
subsystem: automation
tags: [n8n, sms, quality-check, pre-job, sentiment, review-request]
dependency-graph:
  requires: ["13-01"]
  provides: ["TG-127 pre-job notification", "TG-128 post-job quality check with feedback loop"]
  affects: ["13-03", "TG-76 inbound SMS routing"]
tech-stack:
  added: []
  patterns: ["sub-workflow with wait node for timed sends", "dual-trigger workflow (executeWorkflowTrigger + webhook)", "keyword-based sentiment analysis for reply routing"]
key-files:
  created:
    - automation/n8n-workflows/TG-127-pre-job-notification.json
    - automation/n8n-workflows/TG-128-post-job-quality-check.json
  modified:
    - automation/n8n-workflows/TG-05-jobber-email-parser.json
decisions:
  - id: tg127-timing
    choice: "4PM day before service for pre-job SMS"
    reason: "Late enough to be relevant, early enough for customer to prepare"
  - id: tg128-dual-trigger
    choice: "Dual trigger: executeWorkflowTrigger from TG-05 + webhook for reply processing"
    reason: "Self-contained workflow handles both outbound quality check and inbound reply routing"
  - id: sentiment-keyword
    choice: "Keyword-based sentiment analysis (no AI/LLM)"
    reason: "Simple, fast, zero-cost, sufficient for binary positive/negative classification"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-19"
---

# Phase 13 Plan 02: Pre-Job Notification & Post-Job Quality Check Summary

**One-liner:** TG-127 sends day-before SMS reminders, TG-128 sends post-job quality check with sentiment-driven review request or URGENT alert + apology loop.

## What Was Built

### TG-127 Pre-Job Notification (n8n ID: SsYWWFSHSOfnv7ex)
- 7-node sub-workflow called by TG-05 on `job_scheduled` events
- Calculates wait duration to send SMS at 4PM the day before service
- If job is today/tomorrow, sends immediately (no wait)
- SMS includes service type and approximate time when available
- SMS sent via TG-94 unified sender (consent checks, logging, rate limiting)
- Message: "Hi {name}! This is TotalGuard Yard Care. Just a friendly reminder that we'll be at your property tomorrow for {service} around {time}. Please make sure gates are unlocked and pets are secured. Questions? Call 608-535-6057"

### TG-128 Post-Job Quality Check (n8n ID: GZ7ZxOanSNceWeVV)
- 14-node dual-trigger workflow
- **Path 1 (from TG-05):** On `job_completed`, sends quality check SMS asking "How does everything look?"
- **Path 2 (webhook):** Processes customer replies via `tg128-quality-reply` webhook
- Sentiment analysis routes replies:
  - **Positive** (great, awesome, perfect, love, etc.) -> Google review request SMS with link: https://g.page/r/CQEMNig5DhIBEAI/review
  - **Negative** (bad, terrible, missed, problem, etc.) -> URGENT TG-113 Telegram alert + auto-apology SMS to customer
  - **Neutral** -> No action (falls through)
- Logs quality check status to Supabase `jobber_email_events` table

### TG-05 Integration
- Replaced `PLACEHOLDER_TG127_ID` with `SsYWWFSHSOfnv7ex`
- Replaced `PLACEHOLDER_TG128_ID` with `GZ7ZxOanSNceWeVV`
- Deployed and verified via n8n API GET
- Full pipeline: Jobber email -> TG-05 parse -> route -> TG-127/TG-128 -> TG-94 SMS

## Workflow IDs

| Workflow | n8n ID | Status |
|----------|--------|--------|
| TG-127 Pre-Job Notification | SsYWWFSHSOfnv7ex | Active |
| TG-128 Post-Job Quality Check | GZ7ZxOanSNceWeVV | Active |
| TG-05 Jobber Email Parser | Jf5VYdWpDs3VgRzd | Active (updated) |

## TG-128 Webhook URL

Reply processing webhook path: `tg128-quality-reply`
Full URL: `https://tgyardcare.app.n8n.cloud/webhook/tg128-quality-reply`

## Decisions Made

1. **4PM day-before timing**: Late enough to be relevant, early enough for customer prep
2. **Dual-trigger architecture**: executeWorkflowTrigger for TG-05 calls + webhook for reply processing keeps the workflow self-contained
3. **Keyword-based sentiment**: Simple word matching (17 positive, 19 negative keywords) is sufficient for binary routing; no LLM/AI cost needed

## Important Notes

### TG-76 Integration Gap
TG-76 (inbound SMS router) is already active and handles inbound SMS. For the TG-128 feedback loop to work end-to-end:
- TG-76 needs to detect quality check replies and forward them to TG-128's webhook
- Alternatively, the webhook URL can be registered directly in Twilio as a status callback
- This is a gap closure candidate for future work

### Twilio A2P 10DLC Blocker
All outbound SMS (pre-job reminders, quality checks, review requests, apologies) depend on Twilio A2P 10DLC campaign approval. Verify campaign status before expecting SMS delivery.

### Database Columns Needed
For TG-127 to receive scheduled date/time data, TG-05's email parser should extract and pass these fields:
- `scheduled_date` (YYYY-MM-DD format)
- `scheduled_time` (human-readable time)
- These are already in the TG-05 parser output from Plan 13-01

## Deviations from Plan

None - plan executed exactly as written.

## Active Workflow Count

After this plan: 14 workflows active on n8n
- TG-01, TG-05, TG-07, TG-09, TG-70, TG-74, TG-76, TG-79, TG-92, TG-94, TG-95, TG-113, TG-126, TG-127, TG-128

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 6347c67 | TG-127 pre-job notification created and deployed |
| 2 | 66de10a | TG-128 post-job quality check created and deployed |
| 3 | 2c4da37 | TG-05 wired to real TG-127/TG-128 IDs |
