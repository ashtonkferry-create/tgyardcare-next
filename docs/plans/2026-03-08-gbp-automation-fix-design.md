# GBP Automation Fix — Design Doc

**Date**: 2026-03-08
**Status**: Approved
**Project**: TotalGuard Yard Care (tgyardcare)

## Problem

The entire GBP (Google Business Profile) automation system is architecturally complete but has never worked in production because:

1. **GBP API access not granted** — APIs enabled in Google Cloud but quota = 0 QPM. Google requires a separate access application via [support form](https://support.google.com/business/contact/api_default). Application submitted 2026-03-08, expected approval within 5 days.
2. **Env vars missing on Vercel** — `GOOGLE_SERVICE_ACCOUNT_JSON`, `GBP_LOCATION_NAME`, and `ANTHROPIC_API_KEY` were never added to Vercel production env vars.
3. **`CRON_SECRET` has trailing `\n`** — Vercel env var was saved with a newline, breaking external auth.
4. **`GBP_LOCATION_NAME` format unknown** — User has CID `14385740332903995343` but the API uses `accounts/X/locations/Y` format. Needs API access to resolve.

## What Already Works (Code Complete)

- `src/lib/gbp/client.ts` — OAuth2 auth, review CRUD, post CRUD
- `src/lib/gbp/validator.ts` — 3-layer content validation
- `src/lib/gbp/prompts.ts` — Claude prompts for replies and posts
- `src/lib/gbp/types.ts` — Full type definitions
- 8 cron routes: review-responder, review-response-drafter, review-request, review-schema-updater, review-faq-miner, gbp-post-publisher, gbp-post, gbp-audit
- Admin dashboard with review feed, post calendar, manual triggers
- Supabase tables: reviews, gbp_posts, gbp_content_rules, automation_config, automation_runs

## Solution (4 Parts)

### Part 1: Fix Vercel Production Env Vars

Add to Vercel production environment:
- `GOOGLE_SERVICE_ACCOUNT_JSON` = base64-encoded service account key
- `GBP_LOCATION_NAME` = placeholder until API approved, then update
- `ANTHROPIC_API_KEY` = Claude API key for AI crons
- Fix `CRON_SECRET` — re-save without trailing `\n`

### Part 2: Manual Review Intake (Bridge)

New route: `POST /api/admin/add-review`
- Auth: admin JWT (same as other admin routes)
- Input: `{ reviewer_name, rating, review_text, source? }`
- Action: Insert into `reviews` table, then immediately generate AI draft via Claude
- Returns: the drafted response text
- Purpose: Handle reviews manually until GBP API is approved

### Part 3: GBP Health Check Diagnostic

New route: `GET /api/admin/gbp-health`
- Auth: admin JWT
- Tests (sequential):
  1. OAuth2 token exchange — is service account valid?
  2. Account listing — is API quota > 0?
  3. Location lookup — find correct `accounts/X/locations/Y`
  4. Review listing — can we fetch reviews?
- Returns: pass/fail for each step + discovered location name
- Purpose: One-time diagnostic after Google approves access

### Part 4: Location Name Resolution

Once `/api/admin/gbp-health` discovers the correct location name:
- Update `GBP_LOCATION_NAME` on Vercel
- Update `.env.local`
- All existing crons will work immediately

## Env Vars Summary

| Var | .env.local | Vercel Prod | Status |
|-----|-----------|-------------|--------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Set | **MISSING** | Add |
| `GBP_LOCATION_NAME` | Set (placeholder) | **MISSING** | Add, update after API approved |
| `ANTHROPIC_API_KEY` | Set | **UNKNOWN** | Verify/add |
| `CRON_SECRET` | Set | Has `\n` bug | Re-save |
| `SLACK_WEBHOOK_URL` | Not set | Not set | Optional, add later |

## Service Account

- **Email**: `tg-gbp-automation@tg-yard-care-gbp-api.iam.gserviceaccount.com`
- **Project**: tg-yard-care-gbp-api (project number: 149162590372)
- **Required**: Must be invited as Manager on the GBP listing

## Timeline

1. **Today**: Parts 1-3 (env vars, manual intake, health check)
2. **Within 5 days**: Google approves API access
3. **After approval**: Run health check → resolve location name → update env → verify all crons work
