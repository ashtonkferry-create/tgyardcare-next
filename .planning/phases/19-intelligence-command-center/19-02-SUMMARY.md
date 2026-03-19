---
phase: 19-intelligence-command-center
plan: 02
subsystem: alerts
tags: [n8n, telegram, alerts, monitoring, google-reviews, system-health]
dependency-graph:
  requires: [phase-12-instant-response, phase-14-review-monitoring]
  provides: [real-time-lead-alerts, review-severity-alerts, system-health-monitoring]
  affects: [phase-19-03-dashboard]
tech-stack:
  added: []
  patterns: [severity-based-routing, dedup-via-supabase, infrastructure-workflow-escalation]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-139-realtime-lead-alert.json
    - automation/n8n-workflows/TG-140-review-alert.json
    - automation/n8n-workflows/TG-141-system-health-alert.json
decisions:
  - id: alert-dedup
    decision: "TG-141 uses system_health_checks table with last_error_id for dedup; TG-140 uses google_reviews table with author_name+review_time"
  - id: severity-escalation
    decision: "3+ errors in 1hr for same workflow escalates severity (INFO->WARNING->CRITICAL)"
  - id: tg139-webhook
    decision: "TG-139 uses webhook trigger (not executeWorkflowTrigger) so TG-01 or external systems can POST lead data directly"
metrics:
  duration: "8 minutes"
  completed: 2026-03-19
---

# Phase 19 Plan 02: Real-time Alerts System Summary

**Three n8n workflows deployed for instant Telegram alerting on leads, reviews, and system errors with severity-based routing through TG-113 for CRITICAL items.**

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | TG-139 lead alert + TG-140 review alert | 6bd2907 | Webhook lead alert with urgency scoring; hourly review monitor with Google Places API dedup |
| 2 | TG-141 system health monitoring | 598121e | 5-min error monitor with infrastructure workflow escalation and health check logging |

## n8n Workflow IDs

| Workflow | n8n ID | Trigger | Status |
|----------|--------|---------|--------|
| TG-139 Real-time Lead Alert | J3RGGYS6Dp5buVkN | Webhook (POST /tg139-lead-alert) | Active |
| TG-140 Review Alert | 8Ja6PGcLXwbRpPvf | Schedule (hourly :30) + Webhook (/tg140-review-alert) | Active |
| TG-141 System Health Alert | 5JbCFiE6RJBKpght | Schedule (every 5 min) | Active |

## TG-139 Webhook URL

```
https://tgyardcare.app.n8n.cloud/webhook/tg139-lead-alert
```

POST body: `{ name, email, phone, source, service_type, message, lead_score, lead_tier }`

Wire into TG-01 after lead processing to send enriched intelligence alert.

## Severity Classification

### TG-140 Review Severity
| Rating | Severity | Route |
|--------|----------|-------|
| 1-2 stars | CRITICAL | TG-113 + Telegram |
| 3 stars | WARNING | Telegram |
| 4-5 stars | INFO | Telegram |

### TG-141 System Error Severity
| Workflow | Base Severity | Escalation |
|----------|--------------|------------|
| TG-01, TG-05, TG-94, TG-95 | CRITICAL | N/A (already max) |
| TG-09, TG-07, TG-126, TG-127, TG-128 | WARNING | CRITICAL at 3+ errors/hr |
| All others | INFO | WARNING at 3+ errors/hr |

## SQL for Required Tables

```sql
CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name text,
  rating integer NOT NULL,
  review_text text,
  review_time timestamptz,
  severity text,
  response_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_google_reviews_rating ON google_reviews(rating);

CREATE TABLE IF NOT EXISTS system_health_checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at timestamptz DEFAULT now(),
  error_count integer DEFAULT 0,
  critical_count integer DEFAULT 0,
  workflows_checked integer DEFAULT 0,
  last_error_id text,
  created_at timestamptz DEFAULT now()
);
```

## Placeholder Notes

- `OWNER_TELEGRAM_CHAT_ID` -- Vance must set actual Telegram chat ID in TG-139, TG-140, TG-141
- `GOOGLE_PLACES_API_KEY_PLACEHOLDER` -- Set in TG-140 for Google Places review fetch
- `N8N_API_KEY_PLACEHOLDER` -- Set in TG-141 for n8n executions API access

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TG-139 changed from executeWorkflowTrigger to webhook**
- **Found during:** Task 1
- **Issue:** Plan specifies webhook trigger for TG-139, existing file used executeWorkflowTrigger
- **Fix:** Rebuilt with proper webhook trigger at path `tg139-lead-alert`
- **Files modified:** TG-139-realtime-lead-alert.json

**2. [Rule 1 - Bug] TG-140 severity thresholds corrected**
- **Found during:** Task 1
- **Issue:** Existing TG-140 classified 3 stars as CRITICAL; plan says 1-2 = CRITICAL, 3 = WARNING
- **Fix:** Corrected severity classification to match plan
- **Files modified:** TG-140-review-alert.json

**3. [Rule 2 - Missing Critical] TG-141 missing infrastructure workflow escalation**
- **Found during:** Task 2
- **Issue:** Existing TG-141 had no severity classification -- all errors treated equally
- **Fix:** Added infrastructure workflow detection (TG-01/05/94/95=CRITICAL) and repeated error escalation
- **Files modified:** TG-141-system-health-alert.json

## Active Workflows After This Plan

18 workflows now active: TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07, TG-09, TG-127, TG-128, TG-139, TG-140, TG-141

## Next Phase Readiness

- Tables (google_reviews, system_health_checks) need manual creation in Supabase
- Placeholders (chat ID, API keys) need to be set in n8n workflow nodes
- TG-01 should be updated to POST to TG-139 webhook after lead processing
