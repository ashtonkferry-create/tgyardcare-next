---
phase: 17-social-media-machine
plan: 02
subsystem: social-media-automation
tags: [n8n, google-reviews, social-posts, supabase, telegram]
dependency-graph:
  requires: [14-02]
  provides: [review-to-social-pipeline, SOCL-04]
  affects: [17-03]
tech-stack:
  added: []
  patterns: [review-highlight-to-social, dedup-via-flag, branded-post-template]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-134-review-to-social.json
decisions:
  - id: D-1702-01
    decision: "Use social_posted boolean flag on google_reviews for dedup instead of separate tracking table"
    rationale: "Simpler, co-located with source data, query-efficient"
  - id: D-1702-02
    decision: "Telegram notification via HTTP Request node with placeholders instead of Telegram node"
    rationale: "Consistent with plan spec, avoids credential ID mismatch issues"
  - id: D-1702-03
    decision: "Schedule review posts for Wednesday 10am CT (review_spotlight pillar day)"
    rationale: "Aligns with content pillar calendar from 17-01"
metrics:
  duration: "4 minutes"
  completed: "2026-03-19"
---

# Phase 17 Plan 02: Review-to-Social Pipeline Summary

**One-liner:** TG-134 converts 5-star Google reviews into branded social posts for Instagram/LinkedIn/Pinterest, scheduled for Wednesday posting.

## What Was Built

TG-134 Review to Social Post workflow (n8n ID: KQ8jyy2xFQ4ud6YH) -- an 8-node pipeline that:

1. **Schedule Trigger** -- Fires daily at 8:00 AM CT (13:00 UTC cron)
2. **Fetch New 5-Star Reviews** -- Queries Supabase google_reviews table for rating=5, social_posted=false, limit 3
3. **IF Reviews Found** -- Graceful exit when no reviews (or table doesn't exist via continueOnFail)
4. **Loop Over Reviews** -- SplitInBatches processes each review individually
5. **Generate Social Post** -- Creates branded post with star emoji, truncated quote, CTA with phone + website
6. **Insert Social Post** -- POSTs to social_posts table with review_highlight type, review_spotlight pillar
7. **Mark Review as Posted** -- PATCHes google_reviews.social_posted=true for dedup
8. **Send Telegram Notification** -- Alerts Vance that a review was converted to social post

### Social Post Template
```
Star 5-Star Review from {author_name}!

"{review_text_truncated_to_200_chars}"

Thank you for trusting TotalGuard Yard Care with your lawn!
Your satisfaction means the world to us.

Ready for YOUR lawn transformation?
Free quote: tgyardcare.com/quote
(608) 535-6057

#TotalGuardYardCare #MadisonWI #LawnCare #5StarReview #HappyCustomer #MadisonLawnCare
```

### social_posts Insert Fields
- post_type: "review_highlight"
- pillar: "review_spotlight"
- platforms: ["instagram", "linkedin", "pinterest"] (NO Facebook)
- day_of_week: 3 (Wednesday)
- status: "scheduled"
- source: "review_highlight"
- scheduled_for: Next Wednesday 10:00 AM CT
- batch_week: Current Monday's date

## Deployment

- **n8n Workflow ID:** KQ8jyy2xFQ4ud6YH
- **Status:** Active
- **Schedule:** Daily 8:00 AM CT

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **social_posted flag for dedup** -- Uses boolean flag on google_reviews row rather than separate tracking table. Simpler and co-located with source data.
2. **Telegram via HTTP Request** -- Uses HTTP Request node with TELEGRAM_BOT_TOKEN and OWNER_TELEGRAM_CHAT_ID placeholders per plan spec.
3. **Wednesday 10am CT posting** -- Reviews scheduled for Wednesday to align with review_spotlight pillar day in content calendar.

## Commits

| Hash | Message |
|------|---------|
| 36e90f7 | feat(17-02): TG-134 review-to-social conversion workflow |

## Prerequisites

- google_reviews table must exist with social_posted column (Phase 14 creates this)
- social_posts table must exist (Phase 17-01 creates this)
- TELEGRAM_BOT_TOKEN and OWNER_TELEGRAM_CHAT_ID must be set in n8n environment or replaced in workflow

## Next Phase Readiness

Plan 17-03 can proceed -- social posts are being generated and inserted into social_posts table for the daily publisher to pick up.
