---
phase: 17-social-media-machine
plan: 01
subsystem: social-media
tags: [n8n, social-media, ai-content, supabase, claude-api]
dependency-graph:
  requires: [11-03]
  provides: [TG-133-weekly-content-batch, social_posts-table-sql, pillar-calendar]
  affects: [17-02, 17-03]
tech-stack:
  added: [claude-haiku-4-5]
  patterns: [weekly-batch-generation, pillar-calendar, ai-content-pipeline]
file-tracking:
  key-files:
    created:
      - automation/SOCIAL-CONTENT-CALENDAR.md
      - automation/n8n-workflows/TG-133-weekly-content-batch.json
    modified: []
decisions:
  - id: SOCL-01
    decision: "7-day pillar calendar with distinct content types per day"
    rationale: "Variety keeps audience engaged, each pillar serves different marketing goal"
  - id: SOCL-02
    decision: "Claude Haiku 4.5 for content generation (not Sonnet)"
    rationale: "Cost-effective for social media copy, Haiku sufficient for short-form content"
  - id: SOCL-03
    decision: "Instagram + Google Business Profile only (no Facebook, no TikTok)"
    rationale: "Facebook hacked, TikTok requires video which AI text generation cannot produce"
  - id: SOCL-04
    decision: "Wednesday review spotlight populated by TG-134 when available, AI placeholder otherwise"
    rationale: "Real reviews more authentic than AI-generated review posts"
  - id: SOCL-05
    decision: "Batch dedup via batch_week check prevents duplicate content on re-runs"
    rationale: "Monday cron may fire multiple times due to retries or manual triggers"
metrics:
  duration: "8 minutes"
  completed: "2026-03-19"
---

# Phase 17 Plan 01: Weekly Content Batch Generator Summary

**TG-133 weekly AI content engine generating 7 pillar-based social posts every Monday via Claude Haiku 4.5, stored in Supabase for daily publishing.**

## What Was Built

### Task 1: Social Content Calendar Documentation
- Created `automation/SOCIAL-CONTENT-CALENDAR.md` with 4 sections:
  1. **Supabase SQL** -- `social_posts` table with indexes, update trigger, RLS enabled
  2. **7-Day Pillar Calendar** -- Tips/Before-After/Review/Seasonal/Community/Education/Promo
  3. **AI Prompt Templates** -- System prompt + 7 per-pillar Claude prompts with brand voice
  4. **Integration Notes** -- TG-133 writes, TG-134 fills Wednesday, TG-135 publishes

### Task 2: TG-133 Weekly Content Batch Workflow
- Built 8-node n8n workflow:
  1. **Schedule Trigger** -- Monday 6am CT (cron `0 11 * * 1` UTC)
  2. **Get Current Context** -- Derives month, season, batch_week, pillar assignments
  3. **Check Existing Batch** -- Supabase REST GET dedup check by batch_week
  4. **IF No Existing Posts** -- Prevents duplicate generation
  5. **Generate 7 Posts** -- Claude Haiku 4.5 API call with pillar calendar prompt
  6. **Parse AI Response** -- Validates 7 posts, adds scheduled_for timestamps (10am CT)
  7. **Insert Posts to Supabase** -- Batch POST to social_posts table
  8. **Telegram Notification** -- Alerts Vance that weekly batch is ready for review

### Deployment
- **n8n ID:** `412qRf23ZeC9HxTC`
- **Status:** Active
- **Cron:** Every Monday at 6am CT

## Deviations from Plan

None -- plan executed exactly as written. Both artifacts were pre-built in a prior session and validated against all plan criteria.

## Verification Results

- SOCIAL-CONTENT-CALENDAR.md has all 4 sections (SQL, calendar, prompts, integration notes)
- TG-133 JSON is valid with 8 nodes
- No Facebook in any platforms array (only Instagram + Google Business Profile)
- No real API keys committed (ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, OWNER_TELEGRAM_CHAT_ID are placeholders)
- Supabase anon key is publishable (`sb_publishable_...`)
- Supabase URL correct: `lwtmvzhwekgdxkaisfra.supabase.co`
- Schedule trigger fires Monday 6am CT (UTC `0 11 * * 1`)
- Claude model: `claude-haiku-4-5-20251001`

## Pending Setup (Vance)

- Create `social_posts` table in Supabase SQL Editor (SQL in SOCIAL-CONTENT-CALENDAR.md Section 1)
- Set `ANTHROPIC_API_KEY` in TG-133 Generate 7 Posts node header
- Set `OWNER_TELEGRAM_CHAT_ID` and `TELEGRAM_BOT_TOKEN` environment variables in n8n (or update TG-133 Telegram node)

## Next Phase Readiness

- TG-133 provides the content supply for TG-135 (daily social publisher, Plan 17-03)
- Wednesday slots can be overridden by TG-134 (review-to-social, Plan 17-02)
- `social_posts` table must be created before first Monday run
