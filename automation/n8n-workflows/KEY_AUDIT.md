# Supabase Key Audit Report

**Date:** 2026-03-19
**Auditor:** Claude (automated scan)
**Scope:** All workflow JSON files in `automation/n8n-workflows/`

## Background

On 2026-03-15, the Supabase secret key (`sb_secret_QlNjUO...`) was exposed on GitHub and subsequently rotated. Local workflow JSON files should use the placeholder `SUPABASE_SECRET_KEY` rather than any real key value. This audit confirms that policy is enforced.

## Scan Results

| Metric | Count |
|--------|-------|
| Total JSON files scanned | 127 |
| Files with real Supabase key (OLD revoked) | 0 |
| Files with real Supabase key (CURRENT) | 0 |
| Files with any `sb_secret_*` pattern (non-placeholder) | 0 |

**Result: PASS -- Zero real Supabase keys found in any workflow file.**

## Supabase Reference Breakdown

| Category | Count | Description |
|----------|-------|-------------|
| Placeholder `SUPABASE_SECRET_KEY` | 29 | Use the correct placeholder convention |
| `supabase.co` URL only (no placeholder) | 15 | Reference Supabase REST API URL but no key in file |
| Both placeholder and URL | 26 | Have both the placeholder key and Supabase URL |
| Any Supabase reference (union) | 44 | Total files that interact with Supabase |
| No Supabase reference | 83 | Workflows unrelated to Supabase |

### Files Using Placeholder (29 files -- compliant)

- TG-92, TG-94, TG-95, TG-96, TG-97, TG-98, TG-99
- TG-100, TG-101, TG-102, TG-105, TG-106, TG-107, TG-108, TG-109, TG-110
- TG-111, TG-112, TG-114, TG-115, TG-116, TG-117, TG-119, TG-120, TG-121
- TG-122, TG-123, TG-124, TG-125

### Files With Supabase URL Only (15 files -- no key present)

- TG-05, TG-76, TG-83, TG-84, TG-85, TG-86, TG-87, TG-88
- TG-89 (x2 variants), TG-90, TG-91, TG-93, TG-103, TG-104

These files reference `supabase.co` in API URLs but do not contain any secret key value (real or placeholder). The key is injected at runtime via n8n credentials, which is acceptable.

## Conclusion

**PASS** -- All 127 workflow JSON files are clean. No real Supabase secret keys (old or current) are present in any file. The 29 files that reference authentication use the `SUPABASE_SECRET_KEY` placeholder as required. The 15 files that only reference the Supabase URL rely on runtime credential injection, which is also safe.

## Recommendations

1. Continue using `SUPABASE_SECRET_KEY` placeholder in all workflow exports
2. Never export n8n workflows with credentials included (use n8n's "export without credentials" option)
3. Re-run this audit after any bulk workflow export or key rotation
