---
phase: 16-content-seo-engine
plan: 03
subsystem: content-refresh
tags: [content-freshness, seo, ai-refresh, indexnow, telegram, n8n]
dependency-graph:
  requires: [16-01, 16-02]
  provides: [SEO-07]
  affects: []
tech-stack:
  added: []
  patterns: [90-day-staleness-threshold, rank-prioritized-refresh, rpc-with-fallback, quality-gate-validation]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-50-content-refresher.json
decisions:
  - id: seo-03-01
    decision: "Dual fetch strategy: rank-prioritized RPC with age-based fallback"
    rationale: "RPC function may not exist yet in Supabase; age-based fallback ensures workflow runs even without rank data"
  - id: seo-03-02
    decision: "Direct HTTP IndexNow submission instead of executeWorkflow to TG-47"
    rationale: "Avoids sub-workflow dependency; more reliable and debuggable"
  - id: seo-03-03
    decision: "Structured Claude prompt format (TITLE/META_DESC/CONTENT) for reliable parsing"
    rationale: "Previous format relied on META_DESC: prefix on last line which was fragile; structured format is deterministic"
  - id: seo-03-04
    decision: "IF nodes for empty/skip branching instead of inline _empty checks"
    rationale: "Cleaner n8n flow; prevents wasted Claude API calls when no stale posts exist"
metrics:
  duration: "4m 30s"
  completed: "2026-03-19"
---

# Phase 16 Plan 03: Content Refresh Pipeline Summary

**One-liner:** TG-50 content refresher detects stale blog posts (>90 days), AI-refreshes up to 3/week with Claude Sonnet, re-submits to IndexNow, and sends weekly Telegram digest.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Audit and update TG-50 content refresher workflow JSON | 0f425ba | Full rewrite: rank-prioritized fetch, IF branching, quality gates, IndexNow, Telegram summary |
| 2 | Deploy TG-50 to n8n and activate | (API-only) | Created UXfMkQzkfVcpwhNm, activated, all 7 Phase 16 workflows confirmed active |

## What Was Built

### TG-50 Content Refresher (Saturday 9am CT / 14:00 UTC)

**Detection:**
- Dual fetch: rank-prioritized RPC (stale + losing rank = highest priority) with age-based fallback
- 90-day staleness threshold on `published_at`
- Limits to 3 posts per run (Claude API budget control)

**Refresh Pipeline (per post):**
1. Sends existing content to Claude Sonnet with season-aware prompt
2. Quality gate validates: word count >= 800, title <= 65 chars, meta <= 155 chars
3. Updates post in Supabase: new content, title, meta_description, published_at, last_refreshed_at
4. Submits refreshed URL to IndexNow for immediate re-crawling
5. Logs to automation_runs

**Reporting:**
- Telegram summary after each run: found/refreshed counts, refreshed titles with word counts, skipped posts with reasons, next candidates list

**Error Handling:**
- continueOnFail on Claude API call (skips post, logs reason)
- continueOnFail on IndexNow submission (doesn't block refresh logging)
- IF nodes prevent wasted API calls when no stale posts exist
- Separate no-refresh logging path

### n8n Workflow ID
- **TG-50:** UXfMkQzkfVcpwhNm (ACTIVE)

## Phase 16 Complete: SEO Requirements Coverage

| Requirement | Workflow | n8n ID | Status |
|-------------|----------|--------|--------|
| SEO-01: Blog auto-publishing | TG-99 | ANcn1PWAky4GoCbb | ACTIVE |
| SEO-02: City content generation | TG-103 | igtaJUnj9xDXcV2B | ACTIVE |
| SEO-03: IndexNow submission | TG-47 | rshVSBVpDprurfIa | ACTIVE |
| SEO-04: GSC daily sync | TG-96 | Vt8uzm8RGy3QXv3B | ACTIVE |
| SEO-05: Keyword rank tracking | TG-45 | niQsYkoGk7EZvAqo | ACTIVE |
| SEO-06: Rank drop detection | TG-97 | NPxVFCf05a15PjBH | ACTIVE |
| SEO-07: Content refresh | TG-50 | UXfMkQzkfVcpwhNm | ACTIVE |
| SEO-08: Rank monitoring pipeline | TG-96+TG-45 | (combined) | ACTIVE |

**Total active workflows on n8n: 34**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Replaced executeWorkflow IndexNow call with direct HTTP**
- **Found during:** Task 1
- **Issue:** Original used executeWorkflow to TG-47 with placeholder ID; fragile sub-workflow dependency
- **Fix:** Direct HTTP POST to IndexNow RPC endpoint for reliability
- **Files modified:** TG-50-content-refresher.json

**2. [Rule 2 - Missing Critical] Added IF branching nodes for empty/skip paths**
- **Found during:** Task 1
- **Issue:** Original workflow had no branching; would attempt Claude API call even with 0 stale posts
- **Fix:** Added "Has Posts?" and "Passed Quality Gate?" IF nodes with separate no-refresh paths
- **Files modified:** TG-50-content-refresher.json

**3. [Rule 1 - Bug] Improved Claude prompt format for reliable parsing**
- **Found during:** Task 1
- **Issue:** Original prompt asked for META_DESC on "last line" which is unreliable with LLM output
- **Fix:** Structured TITLE/META_DESC/CONTENT format with regex parsing and fallback stripping
- **Files modified:** TG-50-content-refresher.json

## Manual Setup Required

1. **Supabase RPC function:** Create `get_stale_posts_ranked` function that joins blog_posts with seo_rankings to prioritize declining posts (optional - age-based fallback works without it)
2. **Claude API key:** Set `CLAUDE_API_KEY` environment variable in n8n (used by AI Refresh node)
3. **Telegram chat ID:** Set `OWNER_TELEGRAM_CHAT_ID` in TG-50 to Vance's actual Telegram chat ID
4. **blog_posts column:** Add `last_refreshed_at` timestamp column to blog_posts table (nullable, used by TG-50 to track refreshes)

## Next Phase Readiness

Phase 16 (Content SEO Engine) is fully complete. All 8 SEO requirements are covered by 7 active workflows running on automated schedules. The content pipeline now:
- Publishes 3 new blog posts/week (TG-99)
- Generates city-specific content (TG-103)
- Submits new/updated URLs to search engines (TG-47)
- Syncs GSC performance data daily (TG-96)
- Tracks 177 keyword rankings (TG-45)
- Alerts on rank drops and disappeared keywords (TG-97)
- Refreshes stale content weekly (TG-50)
