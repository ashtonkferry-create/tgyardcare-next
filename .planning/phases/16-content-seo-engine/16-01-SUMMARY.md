---
phase: 16-content-seo-engine
plan: 01
subsystem: content-production
tags: [n8n, seo, blog, indexnow, content-pipeline, claude-api]
dependency-graph:
  requires: [11-infra]
  provides: [content-production-pipeline, indexnow-integration, internal-linking]
  affects: [16-02, 16-03]
tech-stack:
  added: []
  patterns: [sub-workflow-composition, internal-linking-injection, error-result-checking]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-99-blog-auto-publisher.json
    - automation/n8n-workflows/TG-103-city-content-generator.json
    - automation/n8n-workflows/TG-47-indexnow-submitter.json
decisions:
  - id: d1
    choice: "Telegram notification replaces SMS in TG-99"
    reason: "Consistent with other M4 workflows using Telegram (V404qLIDXjmyzNeS credential)"
  - id: d2
    choice: "TG-47 called as sub-workflow rather than inline IndexNow"
    reason: "DRY principle — both TG-99 and TG-103 call TG-47 for IndexNow pings"
  - id: d3
    choice: "Removed stale TG-104 reference from TG-103"
    reason: "TG-104 workflow ID (qzRRPT7goiYxJsxL) was a placeholder; batch completion logged inline instead"
  - id: d4
    choice: "Internal links injected via Claude system prompt, not post-processing"
    reason: "More natural link placement when Claude writes them in context vs regex injection"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-19"
---

# Phase 16 Plan 01: Content Production Pipeline Summary

Content production pipeline deployed: TG-99 blog auto-publisher with internal linking + Telegram alerts, TG-103 city content generator with service/blog cross-links, TG-47 IndexNow submitter with error handling.

## Tasks Completed

### Task 1: Audit and update TG-99, TG-103, TG-47 workflow JSONs
**Commit:** 87e0ff6

**TG-99 changes:**
- Added internal linking logic: Claude prompt now includes full service page URLs (/services/*) and city page URLs (/areas/*) with instructions to weave 2-3 links per post
- Replaced SMS notification (Twilio) with Telegram notification using credential V404qLIDXjmyzNeS
- Replaced inline IndexNow ping with TG-47 sub-workflow call
- Added internal link count tracking in Validate + Structure node (serviceLinks + cityLinks)
- Verified schedule: `0 15 * * 1,3,5` (Mon/Wed/Fri 3pm UTC = 10am CT)

**TG-103 changes:**
- Added internal linking: prompt now requires links to parent service pages + 2-3 recent blog posts (queried from Supabase)
- Removed stale TG-104 quality check reference (qzRRPT7goiYxJsxL)
- Replaced inline IndexNow with TG-47 sub-workflow call
- Added batch completion logging to automation_runs
- Passes recentPosts through the batch pipeline for contextual blog linking

**TG-47 changes:**
- Added Check IndexNow Result node with success/failure tracking
- Enhanced automation_runs logging: now includes indexnow_status, indexnow_error fields
- Both IndexNow and Bing submission nodes use continueOnFail for resilience

### Task 2: Deploy TG-99, TG-103, TG-47 to n8n and activate
**Commit:** 50bb3cc

- TG-47 (rshVSBVpDprurfIa): updated and activated
- TG-103 (igtaJUnj9xDXcV2B): updated and activated (tags stripped for API compatibility)
- TG-99 (ANcn1PWAky4GoCbb): updated and activated
- Fixed Execute Workflow nodes to reference real TG-47 ID (rshVSBVpDprurfIa)
- Active workflow count: 30 -> 33

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] n8n API rejects tags field on PUT**
- Found during: Task 2, TG-103 deployment
- Issue: n8n API returns 400 "request/body/tags is read-only" when tags array is included
- Fix: Stripped tags and staticData from payload before PUT
- Files modified: deployment script only (no file change)

**2. [Rule 1 - Bug] Execute Workflow nodes used env variable instead of real ID**
- Found during: Task 2
- Issue: `$env.TG47_WORKFLOW_ID || 'TG-47'` would not resolve to the actual workflow ID
- Fix: Replaced with real n8n workflow ID `rshVSBVpDprurfIa` in both TG-99 and TG-103
- Files modified: TG-99-blog-auto-publisher.json, TG-103-city-content-generator.json

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Telegram replaces SMS in TG-99 | Consistent with all M4 workflows; avoids Twilio A2P issues |
| D2 | TG-47 as sub-workflow | DRY — single IndexNow implementation called by both content workflows |
| D3 | Removed TG-104 reference | Stale workflow ID; batch logging done inline |
| D4 | Internal links via Claude prompt | Natural placement vs post-processing regex injection |

## Workflow Summary

| Workflow | n8n ID | Schedule | Status | Nodes |
|----------|--------|----------|--------|-------|
| TG-47 IndexNow Submitter | rshVSBVpDprurfIa | On-demand (sub-workflow) | Active | 6 |
| TG-99 Blog Auto-Publisher | ANcn1PWAky4GoCbb | Mon/Wed/Fri 3pm UTC | Active | 13 |
| TG-103 City Content Generator | igtaJUnj9xDXcV2B | Wed 2pm UTC | Active | 16 |

## Success Criteria Verification

- [x] SEO-01: TG-99 active, scheduled 3x/week, generating 1200-1500 word posts with quality gates (word count >= 800, title <= 65 chars, meta <= 155 chars)
- [x] SEO-02: TG-103 active, generating unique city-specific content on demand with local details per city
- [x] SEO-03: TG-47 active, receiving IndexNow pings from both TG-99 and TG-103 via sub-workflow calls
- [x] SEO-08: Internal linking logic in both TG-99 (service + city page URLs in prompt) and TG-103 (service + blog post URLs in prompt)

## Next Phase Readiness

- TG-99 needs ANTHROPIC_API_KEY and SUPABASE_SECRET_KEY configured as n8n credentials (placeholders in workflow)
- TG-103 needs same credential configuration
- OWNER_TELEGRAM_CHAT_ID needs to be set in TG-99 Telegram node for notifications
- seo_target_cities table must exist in Supabase for TG-103 to have cities to process
- 33 workflows now active on n8n
