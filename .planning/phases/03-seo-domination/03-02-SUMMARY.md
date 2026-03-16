---
phase: 03-seo-domination
plan: 02
subsystem: content-generation
tags: [n8n, claude-api, seo, content, supabase]
dependency-graph:
  requires: []
  provides: [TG-103-city-content-generator, TG-104-content-quality-checker]
  affects: [03-03, 03-04, 03-05]
tech-stack:
  added: [anthropic-claude-api]
  patterns: [ai-content-generation, quality-validation-pipeline, sub-workflow-chaining]
key-files:
  created:
    - automation/n8n-workflows/TG-103-city-content-generator.json
    - automation/n8n-workflows/TG-104-content-quality-checker.json
  modified: []
decisions:
  - TG-103 uses claude-sonnet-4-6 model for content generation
  - 15 active target cities (not 12 as originally estimated)
  - Local details hardcoded per city in Code node for prompt enrichment
  - SplitInBatches output[1] triggers TG-104 after all cities processed
  - TG-104 checks drafts from last 24 hours only
metrics:
  duration: ~5 minutes
  completed: 2026-03-16
---

# Phase 03 Plan 02: City Content Generation Pipeline Summary

AI content generation pipeline using Claude API to produce city-specific lawn care guides for 15 Dane County cities, with automated quality validation before human review.

## What Was Built

### TG-103 City Content Generator (n8n ID: igtaJUnj9xDXcV2B, ACTIVE)
- **Schedule**: Weekly Wednesday 9 AM CT (cron: 0 14 * * 3) + manual trigger
- **Flow**: Get target cities -> Get existing content -> Find gaps -> Generate via Claude -> Save as draft -> Trigger TG-104
- **Cities covered**: All 15 active seo_target_cities (Madison, Middleton, Sun Prairie, Fitchburg, Verona, Monona, Waunakee, DeForest, Stoughton, Oregon, McFarland, Cottage Grove, Cross Plains, Windsor, Mount Horeb)
- **Local detail enrichment**: Each city has hardcoded neighborhood names, parks/landmarks, soil types, local quirks, and USDA growing zones fed into the prompt
- **Safety**: Always saves with status=draft, ai_generated=true. Never auto-publishes.
- **Rate limiting**: 2-second wait between Claude API calls

### TG-104 Content Quality Checker (n8n ID: qzRRPT7goiYxJsxL, ACTIVE)
- **Trigger**: Execute Workflow Trigger (called by TG-103 after batch completes)
- **Checks performed**:
  - Word count >= 800 (HTML stripped)
  - No placeholder text ([insert], [TBD], etc.)
  - 3+ H2 headings
  - 2+ local references (Wisconsin, Dane County, Zone 5a, silt loam, Madison, etc.)
  - CTA presence (608 phone number or tgyardcare.com reference)
- **Reporting**: Builds HTML table of issues and sends via TG-95 (IUDLrQrAkcLFLsIC) to totalguardllc@gmail.com

## blog_posts Table Columns Available

id, title, slug, excerpt, content, category, keywords, published_at, status, reading_time, meta_title, meta_description, created_at, updated_at, target_keyword, secondary_keywords, word_count, reading_time_minutes, ai_generated, ai_model, ai_generated_at, published_url, page_views, leads_generated, tags

## Quality Check Thresholds

| Check | Threshold | Rationale |
|-------|-----------|-----------|
| Word count | >= 800 | Minimum for substantive SEO content |
| Placeholder text | 0 occurrences | No [insert], [TBD], [TODO] patterns |
| H2 headings | >= 3 | Structured content for SEO |
| Local references | >= 2 | Must mention WI/Dane County/Zone 5a/soil/Madison |
| CTA | Present | Must include 608 phone or tgyardcare.com |

## Decisions Made

1. **15 cities, not 12**: seo_target_cities has 15 active entries including Cross Plains, Windsor, and Mount Horeb
2. **Claude Sonnet 4.6**: Selected for cost-efficiency on long-form content generation
3. **Hardcoded local details**: Each city's neighborhoods, parks, soil types, and quirks stored in Code node rather than external lookup for reliability
4. **24-hour window for quality checks**: TG-104 only checks drafts created in last 24 hours to avoid re-checking old content
5. **SplitInBatches done output**: Uses output[1] of SplitInBatches v3 to trigger TG-104 after all cities processed

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| be8ad4d | feat | TG-103 city content generator workflow |
| 1d6536b | feat | TG-104 content quality checker + TG-103 linkage |

## Next Phase Readiness

- TG-103 and TG-104 are both ACTIVE on n8n
- API keys need to be set in n8n (SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY) before first real execution
- Content will appear in blog_posts table as drafts for human review
- Ready for 03-03 (GSC monitoring) which is independent of this content pipeline
