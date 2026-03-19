---
phase: 17-social-media-machine
plan: 03
subsystem: automation
tags: [n8n, social-media, publishing, engagement, telegram]
dependency-graph:
  requires: ["17-01", "17-02"]
  provides: ["daily-social-publishing", "weekly-engagement-reports"]
  affects: ["18-analytics"]
tech-stack:
  added: []
  patterns: ["sub-workflow orchestration", "double-publish prevention", "retry-on-failure"]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-135-daily-social-publisher.json
decisions:
  - id: "deploy-autopost"
    decision: "Deployed TG-AUTOPOST sub-workflow to n8n as dependency for TG-135"
    reason: "TG-135 cannot activate without a published sub-workflow reference"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-19"
---

# Phase 17 Plan 03: Daily Social Publisher + Engagement Tracker Summary

JWT auth daily publishing orchestrator and weekly engagement tracker deployed to n8n with TG-AUTOPOST sub-workflow dependency resolved.

## What Was Done

### Task 1: TG-135 Daily Social Publisher
- Validated existing TG-135 JSON (11 nodes, all plan requirements met)
- Deployed TG-AUTOPOST sub-workflow (ID: MlEla7I3vz7c39NL) as prerequisite
- Deployed TG-135 (ID: vn8vyxRKbhr6gFu4) with real AUTOPOST ID replacing placeholder
- Activated successfully -- fires daily at 9:55 AM CT (14:55 UTC)
- Updated local JSON to store real workflow ID instead of PLACEHOLDER_AUTOPOST_ID

**TG-135 Flow:**
1. Schedule Trigger (9:55 AM CT daily)
2. Fetch scheduled post from Supabase (status=scheduled, scheduled_for <= now+1h)
3. IF post found -> Mark as "publishing" (double-publish prevention)
4. Call TG-AUTOPOST sub-workflow with post_text, image_url, platforms, post_type
5. Check result -> Success: mark "published" / Failure: retry once
6. If retry fails: mark "failed"
7. Telegram notification (success, failure, or no-post-today)

### Task 2: TG-136 Engagement Tracker
- Validated existing TG-136 JSON (5 nodes, all plan requirements met)
- Deployed TG-136 (ID: oodlVc3A9SImjXpE) and activated
- Fires every Sunday at 8 PM CT (01:00 UTC Monday)

**TG-136 Flow:**
1. Schedule Trigger (Sunday 8 PM CT weekly)
2. Fetch published posts from past 7 days
3. IF posts found -> Calculate stats (by pillar, platform, type)
4. Send formatted Telegram weekly report

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Deployed TG-AUTOPOST sub-workflow**
- **Found during:** Task 1 activation
- **Issue:** TG-135 could not activate because it referenced PLACEHOLDER_AUTOPOST_ID and n8n requires published sub-workflows
- **Fix:** Deployed TG-AUTOPOST-social-publisher.json to n8n (ID: MlEla7I3vz7c39NL), activated it, then updated TG-135 with real ID
- **Files modified:** automation/n8n-workflows/TG-135-daily-social-publisher.json (replaced placeholder with real ID)
- **Commit:** f7d29da

## n8n Workflow Registry

| Workflow | n8n ID | Status | Schedule |
|----------|--------|--------|----------|
| TG-AUTOPOST | MlEla7I3vz7c39NL | ACTIVE | Sub-workflow (called by TG-135) |
| TG-135 Daily Publisher | vn8vyxRKbhr6gFu4 | ACTIVE | Daily 9:55 AM CT |
| TG-136 Engagement Tracker | oodlVc3A9SImjXpE | ACTIVE | Sunday 8 PM CT |

## End-to-End Social Media Pipeline

The complete Phase 17 social media machine is now operational:

1. **TG-133** (Weekly Content Batch) -- Generates 7 posts/week with AI, stores in social_posts table
2. **TG-134** (Review-to-Social) -- Converts 5-star reviews into social content
3. **TG-135** (Daily Publisher) -- Publishes one scheduled post daily via TG-AUTOPOST
4. **TG-136** (Engagement Tracker) -- Weekly Telegram report on publishing metrics

## Manual Steps Required (Vance)

1. **TG-AUTOPOST API credentials**: Replace `AUTOPOST_API_URL` and `AUTOPOST_API_KEY` in the Build API Payload node with real Upload-Post or LATE credentials
2. **Telegram env vars**: Ensure `TELEGRAM_BOT_TOKEN` and `OWNER_TELEGRAM_CHAT_ID` are set in n8n environment
3. **social_posts table**: Ensure Supabase table exists with columns: id, post_text, image_url, platforms, post_type, pillar, status, scheduled_for, published_at, engagement_data

## Verification

- [x] TG-135 JSON valid with 11 nodes
- [x] TG-136 JSON valid with 5 nodes
- [x] TG-135 calls TG-AUTOPOST sub-workflow (not publishing directly)
- [x] TG-135 has retry logic and failure handling
- [x] TG-136 produces readable weekly Telegram report
- [x] No Facebook in any workflow
- [x] No real secret API keys committed (only publishable Supabase anon key)
- [x] Supabase URLs correct throughout
- [x] All 3 workflows deployed and ACTIVE in n8n
