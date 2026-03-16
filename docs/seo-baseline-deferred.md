# SEO Baseline -- Deferred

**Requirement:** FOUND-09 -- Capture SEO baseline from Google Search Console before major site changes
**Status:** DEFERRED to Phase 6+
**Reason:** GSC service account credentials need rotation after security cleanup (git history scrub of `gsc-service-account.json`). Cannot reliably query GSC API until new credentials are provisioned.

## Prerequisites for Completion
1. Rotate GSC service account key (new JSON key from Google Cloud Console)
2. Update `scripts/gsc-*.mjs` with new credentials
3. Verify API access works: `node scripts/gsc-fetch.mjs` (or equivalent)

## What to Capture
- Top 20 pages by impressions (last 90 days)
- Top 20 queries by clicks (last 90 days)
- Average position for branded terms ("TotalGuard", "tgyardcare")
- Total indexed pages count

## When to Do This
- After GSC credentials are rotated (Phase 6 prerequisite)
- Before any major URL structure changes or content overhaul
