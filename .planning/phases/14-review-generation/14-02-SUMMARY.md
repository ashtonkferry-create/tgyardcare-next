---
phase: 14-review-generation
plan: 02
subsystem: automation
tags: [google-reviews, n8n, telegram, supabase, review-monitoring]
dependency-graph:
  requires: [14-01]
  provides: [review-monitoring-pipeline, ai-response-drafts, social-media-flagging]
  affects: [17-social-media]
tech-stack:
  added: []
  patterns: [template-based-response-drafting, google-places-api-new, review-dedup-hashing]
file-tracking:
  key-files:
    created:
      - automation/n8n-workflows/TG-131-google-review-poller.json
      - automation/n8n-workflows/TG-132-review-response-drafter.json
    modified: []
decisions:
  - id: dec-14-02-01
    description: "Template-based responses instead of Claude AI API calls to avoid paid service dependency"
    rationale: "No additional cost, faster execution, predictable output quality"
  - id: dec-14-02-02
    description: "Used Google Places API (New) instead of GBP API for review fetching"
    rationale: "No GBP verification required, returns up to 5 most recent reviews"
metrics:
  duration: "8 minutes"
  completed: "2026-03-19"
---

# Phase 14 Plan 02: Review Monitoring & AI Response Pipeline Summary

Template-based Google review monitoring with 6-hour polling, Supabase sync, rating-aware response drafts, and Telegram approval workflow.

## What Was Built

### TG-131 Google Review Poller (n8n ID: iU1iQCwa6QivxXgw)
- **Schedule:** Every 6 hours (0:00, 6:00, 12:00, 18:00 UTC)
- **API:** Google Places API (New) - `GET places/v1/places/ChIJMQEDNR3apwMRFbkOyDYmDAE`
- **Fields:** reviews, rating, userRatingCount
- **Flow:** Poll -> Extract -> Dedup against Supabase -> Save -> Route by rating
- **Routing:**
  - 1-3 stars: CRITICAL alert via TG-113 + response draft via TG-132
  - 4 stars: Response draft via TG-132
  - 5 stars: Response draft via TG-132 (flagged for social media)
- **8 nodes:** Schedule Trigger, HTTP Request, 2x Code, HTTP POST, Switch, Execute Workflow (TG-113), Execute Workflow (TG-132)

### TG-132 Review Response Drafter (n8n ID: byGsDMUSiClnuH1G)
- **Trigger:** Called by TG-131 for each new review
- **Response drafting:** Template-based (no AI API calls, zero cost)
- **Templates by rating:**
  - **5 stars:** 3 templates - enthusiastic thank you, mention specific service if detected, sign as Vance
  - **4 stars:** 2 templates - grateful, ask what could improve, express desire to earn 5th star
  - **3 stars:** 2 templates - empathetic, offer to make it right, include phone (608) 535-6057
  - **1-2 stars:** 2 templates - sincere apology, owner will personally follow up, phone number
- **Service detection:** Scans review text for 20+ service keywords (mowing, landscaping, fertiliz, etc.) for personalization
- **Telegram message:** Includes star rating, author, quoted review, draft response, approval instructions
- **Social flagging:** 5-star reviews auto-set `social_media_queued=true`
- **7 nodes:** Execute Workflow Trigger, Code (template), HTTP PATCH (save draft), Code (Telegram msg), Telegram, If (5-star check), HTTP PATCH (social flag)

## Supabase Table Required

Create this table manually in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id text UNIQUE NOT NULL,
  author_name text,
  rating integer NOT NULL,
  review_text text,
  publish_time timestamptz,
  overall_rating numeric(2,1),
  total_reviews integer,
  is_five_star boolean DEFAULT false,
  needs_response boolean DEFAULT true,
  response_draft text,
  response_approved boolean DEFAULT false,
  response_posted boolean DEFAULT false,
  social_media_queued boolean DEFAULT false,
  social_media_posted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_google_reviews_review_id ON google_reviews(review_id);
CREATE INDEX idx_google_reviews_rating ON google_reviews(rating);
```

## Decisions Made

1. **Template-based responses instead of AI API calls** - Uses Code node with 9 pre-written templates (3 for 5-star, 2 for 4-star, 2 for 3-star, 2 for 1-2-star) with random selection and service keyword detection for personalization. Zero cost, no API key needed.
2. **Google Places API (New)** - Does not require GBP verification. Returns up to 5 most recent reviews per poll. Rate limits: standard Google API quotas.
3. **Hash-based review dedup** - Creates `review_id` from `gr_` + hash of (author_name + publishTime) for stable deduplication.

## Manual Steps Required

1. **Create google_reviews table** in Supabase SQL Editor (SQL above)
2. **Activate TG-131** in n8n UI (schedule trigger can't be activated via API - known limitation)
3. **Set GOOGLE_PLACES_API_KEY_PLACEHOLDER** in TG-131 "Fetch Place Details" node with the Google Places API key from "TotalGuard Google Places" n8n credential
4. **Set SUPABASE_ANON_KEY_PLACEHOLDER** in TG-131 dedup and save nodes (3 occurrences) with: `sb_publishable_DeX21ldoDKl3NyJeFZzR1w_eWBUkx-v`
5. **Set OWNER_TELEGRAM_CHAT_ID** in TG-132 "Send Draft to Telegram" node with Vance's actual Telegram chat ID

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Template-based responses instead of Claude AI**
- **Found during:** Task 2 (per user instructions)
- **Issue:** Plan called for Claude Haiku API calls, but user requested template-based responses to avoid paid service dependency
- **Fix:** Built Code node with 9 response templates covering all star ratings, with service keyword detection for personalization
- **Files modified:** TG-132-review-response-drafter.json
- **Commit:** 5be537f

**2. [Rule 3 - Blocking] n8n API schedule trigger activation limitation**
- **Found during:** Task 1 deployment
- **Issue:** n8n API returns 400 "propertyValues[itemName] is not iterable" when activating schedule trigger workflows
- **Fix:** Documented as manual step (same issue encountered in Phase 13 with TG-127)

**3. [Rule 3 - Blocking] n8n API rejects `tags` field in POST body**
- **Found during:** Task 2 deployment
- **Issue:** API returns "request/body/tags is read-only"
- **Fix:** Strip tags, staticData, and id fields before POST

## Active Workflow Count

17 workflows now active (added TG-132; TG-131 pending manual activation):
TG-05, TG-70, TG-74, TG-79, TG-94, TG-95, TG-92, TG-113, TG-76, TG-01, TG-126, TG-07, TG-09, TG-127, TG-128, TG-132 (+ TG-131 pending)

## Next Phase Readiness

- google_reviews table must be created before TG-131 can sync reviews
- OWNER_TELEGRAM_CHAT_ID still needs to be set (same pending todo from Phase 12)
- Google Places API key must be configured in the workflow node
- Social media queue (social_media_queued flag) ready for Phase 17 consumption
