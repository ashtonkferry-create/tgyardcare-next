---
phase: 18-gbp-domination
plan: 02
subsystem: automation
tags: [gbp, faq, optimization, n8n, telegram]
dependency-graph:
  requires: ["18-01"]
  provides: ["TG-147 quarterly FAQ rotation", "TG-148 monthly GBP optimization score"]
  affects: ["gbp-profile-management"]
tech-stack:
  added: []
  patterns: ["quarterly-cron-schedule", "gbp-scoring-rubric", "ai-content-generation"]
key-files:
  created:
    - automation/n8n-workflows/TG-147-gbp-faq-rotation.json
    - automation/n8n-workflows/TG-148-gbp-optimization-score.json
  modified: []
decisions:
  - id: "18-02-D1"
    decision: "Used TG-147/TG-148 numbering (not TG-135/TG-136 from plan)"
    reason: "TG-145/TG-146 used by 18-01, sequential numbering"
  - id: "18-02-D2"
    decision: "Merge node for parallel Supabase fetches in TG-148"
    reason: "Posts and FAQs fetched in parallel then merged before scoring"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-19"
---

# Phase 18 Plan 02: FAQ Rotation + GBP Optimization Scoring Summary

Quarterly FAQ rotation via AI and monthly GBP optimization scoring with 6-dimension rubric, both deployed to n8n and reporting to Telegram.

## What Was Built

### TG-147: Quarterly FAQ Rotation (n8n ID: ed8yDBTZBLUjoFEq, ACTIVE)

Generates seasonal FAQ content for Google Business Profile quarterly.

**Schedule:** 1st of March, June, September, December at 9:00 AM CT (14:00 UTC)

**Flow:**
1. Schedule Trigger (cron: `0 14 1 3,6,9,12 *`)
2. Determine Current Season (maps month to season + relevant services)
3. AI Generate Seasonal FAQs (Claude Haiku - 5-7 Q&A pairs with Madison WI context)
4. Parse FAQ Response (extracts JSON, formats for Telegram)
5. Store in Supabase `gbp_faqs` table (season, quarter, content, status)
6. Send to Telegram for review

**Supabase Table Required:**
```sql
CREATE TABLE IF NOT EXISTS gbp_faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  season text NOT NULL,
  quarter text NOT NULL,
  faq_content jsonb NOT NULL,
  status text DEFAULT 'pending_review',
  created_at timestamptz DEFAULT now()
);
```

**Placeholder:** `ANTHROPIC_API_KEY` - needs Anthropic API key set in n8n

### TG-148: Monthly GBP Optimization Score (n8n ID: 6Jwk2EhjsfqDsg1q, ACTIVE)

Monthly audit of GBP profile health with 0-100 scoring across 6 dimensions.

**Schedule:** 1st of every month at 7:00 AM CT (12:00 UTC)

**Flow:**
1. Schedule Trigger (cron: `0 12 1 * *`)
2. Fetch Google Places Data (place ID: ChIJMQEDNR3apwMRFbkOyDYmDAE)
3. Fetch Recent Posts + Latest FAQ Date (parallel from Supabase)
4. Merge Internal Data
5. Calculate Score (6-dimension rubric, A-F grade, recommendations)
6. Store in Supabase `gbp_scores` table
7. Send detailed report to Telegram

**Scoring Rubric (100 points):**
| Dimension | Max Points | Thresholds |
|-----------|-----------|------------|
| Post frequency | 25 | 12+=25, 8-11=20, 4-7=15, 1-3=10, 0=0 |
| Review count | 20 | 50+=20, 30-49=15, 15-29=10, 5-14=5, <5=0 |
| Review rating | 15 | 4.5+=15, 4.0-4.4=10, 3.5-3.9=5, <3.5=0 |
| Photo count | 15 | 20+=15, 10-19=10, 5-9=5, <5=0 |
| FAQ freshness | 15 | <=90d=15, <=180d=10, >180d=0 |
| Hours accuracy | 10 | present=10, missing=0 |

**Grades:** A (90+), B (75-89), C (60-74), D (40-59), F (<40)

**Supabase Table Required:**
```sql
CREATE TABLE IF NOT EXISTS gbp_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  score integer NOT NULL,
  grade text NOT NULL,
  breakdown jsonb NOT NULL,
  review_count integer,
  review_rating numeric(2,1),
  post_count_30d integer,
  scored_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

**Placeholders:**
- `GOOGLE_PLACES_API_KEY` - needs Google Places API key set in n8n
- `OWNER_TELEGRAM_CHAT_ID` - needs Vance's Telegram chat ID
- `SUPABASE_SECRET_KEY` - needs Supabase service role key

## Commits

| Hash | Description |
|------|-------------|
| e0842a0 | feat(18-02): TG-147 quarterly FAQ rotation workflow |
| 2f73023 | feat(18-02): TG-148 monthly GBP optimization score workflow |

## Deviations from Plan

### Numbering Change
- Plan specified TG-135/TG-136, used TG-147/TG-148 per user instruction (TG-145/146 used by 18-01)

### Architecture Enhancement
- [Rule 2 - Missing Critical] Added Merge node in TG-148 for parallel Supabase fetches (posts + FAQs fetched simultaneously then merged before scoring) - improves execution efficiency

None other - plan executed as written.

## Next Phase Readiness

Both workflows are active. Before first execution:
1. Create `gbp_faqs` and `gbp_scores` tables in Supabase
2. Set `ANTHROPIC_API_KEY` credential in n8n for TG-147
3. Set `GOOGLE_PLACES_API_KEY` credential in n8n for TG-148
4. Set `OWNER_TELEGRAM_CHAT_ID` in both workflows
5. Set `SUPABASE_SECRET_KEY` in both workflows
