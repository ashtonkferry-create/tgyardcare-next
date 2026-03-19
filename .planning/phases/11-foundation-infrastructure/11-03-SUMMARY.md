---
phase: 11-foundation-infrastructure
plan: 03
subsystem: infra
tags: [n8n, social-media, auto-posting, upload-post, late, automation]

# Dependency graph
requires:
  - phase: 11-foundation-infrastructure
    provides: n8n instance clean and active, infrastructure workflows running
provides:
  - n8n workflow template for multi-platform social media auto-posting
  - Setup guide for Upload-Post or LATE aggregator service
  - Facebook exclusion enforcement at code level
affects: [phase-14-review-reputation, phase-17-social-media-machine]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auto-posting via aggregator service (Upload-Post/LATE) instead of per-platform APIs"
    - "Facebook exclusion enforced in workflow code (filter at Validate Input node)"
    - "Workflow template with placeholder credentials for manual activation"

key-files:
  created:
    - automation/n8n-workflows/TG-AUTOPOST-social-publisher.json
    - automation/AUTOPOST-SETUP.md
  modified: []

key-decisions:
  - "Used HTTP Request node approach (not community node) for maximum flexibility with either Upload-Post or LATE"
  - "Facebook filtered at code level in Validate Input node -- even if passed in platforms array, it gets stripped"
  - "Default platforms set to instagram + linkedin + pinterest (most business-relevant)"
  - "Workflow designed as sub-workflow (executeWorkflowTrigger) for reuse by TG-99, Phase 14, Phase 17"

patterns-established:
  - "Auto-posting sub-workflow pattern: caller passes post_text + platforms, TG-AUTOPOST handles publishing"
  - "Placeholder credential pattern: AUTOPOST_API_URL and AUTOPOST_API_KEY replaced during manual setup"

# Metrics
duration: 5min
completed: 2026-03-19
---

# Phase 11 Plan 03: Auto-Posting Infrastructure Summary

**n8n workflow template for multi-platform social publishing via Upload-Post/LATE with Facebook exclusion enforced at code level**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-19T05:31:24Z
- **Completed:** 2026-03-19T05:36:00Z
- **Tasks:** 1 (+ 1 checkpoint auto-approved)
- **Files created:** 2

## Accomplishments

- Created TG-AUTOPOST-social-publisher.json -- a proper n8n workflow with 5 nodes: trigger, input validation, payload builder, HTTP publish, result logger
- Created AUTOPOST-SETUP.md -- comprehensive setup guide comparing Upload-Post ($16/mo) vs LATE ($19/mo) with step-by-step instructions
- Facebook exclusion enforced at every level: code filter in Validate Input, excluded from allowed platforms list, explicit warnings in documentation
- No real API keys or credentials committed -- uses descriptive placeholders only

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auto-posting workflow template and setup documentation** - `8d0b9fa` (feat)

**Plan metadata:** see final commit below (docs: complete plan)

## Files Created/Modified

- `automation/n8n-workflows/TG-AUTOPOST-social-publisher.json` - n8n workflow with executeWorkflowTrigger, Validate Input (strips Facebook), Build API Payload (placeholder credentials), Publish Post (HTTP Request), Log Result
- `automation/AUTOPOST-SETUP.md` - Setup guide: service comparison, platform list, step-by-step setup, testing instructions, input schema, integration points, troubleshooting

## Decisions Made

- **HTTP Request over community node:** Used generic HTTP Request node so the workflow works with either Upload-Post or LATE without needing a specific n8n community node installed
- **Default platforms:** Set to instagram, linkedin, pinterest as the most business-relevant for a yard care company (TikTok and YouTube available but not defaulted)
- **Dual Facebook filter:** Both an explicit `facebook`/`fb` string filter AND an allowlist-only approach -- belt and suspenders

## Deviations from Plan

None -- plan executed exactly as written.

## User Setup Required

**External service requires manual configuration.** Vance must:

1. Choose Upload-Post ($16/mo) or LATE ($19/mo) and create an account
2. Connect 5 social accounts (Instagram, TikTok, YouTube, LinkedIn, Pinterest -- NOT Facebook)
3. Get API key and endpoint URL from the service
4. Import TG-AUTOPOST-social-publisher.json into n8n
5. Replace `AUTOPOST_API_URL` and `AUTOPOST_API_KEY` placeholders with real values
6. Activate and test the workflow

See `automation/AUTOPOST-SETUP.md` for detailed instructions.

## Issues Encountered

None.

## Next Phase Readiness

- Auto-posting infrastructure template is ready for Phase 17 (Social Media Machine)
- TG-99 blog auto-publisher can be wired to call TG-AUTOPOST for social sharing
- Phase 14 review workflows can share 5-star reviews to social platforms
- **Blocker:** Workflow is non-functional until Vance creates an account and provides credentials (expected -- this is a template)

---
*Phase: 11-foundation-infrastructure*
*Completed: 2026-03-19*
