# Design: app.workely.ai — Deployment Readiness
**Date:** 2026-03-17
**Scope:** Backend security, correctness, and functional completeness for production go-live
**Constraint:** No visual/UI changes unless fixing broken UI (e.g. missing images)

---

## Executive Summary

The app is ~80% production-ready. The core user loop (auth → onboarding → agents → deploy → billing) is architecturally complete. What's blocking real users from safely using it are **4 critical security/correctness bugs, 3 functional gaps, and several hardening items**. This roadmap fixes all of them in priority order across 4 phases.

Google OAuth is pending external approval — that's outside our control. Everything else is fixable today.

---

## What a Real User Flow Looks Like Today

```
marketing site → /auth (sign up) → /onboarding/quick-start → /agents (enable agents)
→ /integrations (connect tools) → /deploy (6-step wizard) → /settings/billing (upgrade plan)
```

This flow **works** end-to-end architecturally. The issues are underneath the surface — in what happens when Stripe fires a webhook, when a user invites a teammate, when n8n dispatches a task, and when a paying customer looks at their invoices.

---

## Phase 1 — Critical Security & Correctness (Pre-Launch Blockers)
*These must be fixed before a single real user signs up. They are silent failures or security vulnerabilities.*

### 1.1 Fix Stripe Price ID Collision
**File:** `src/lib/stripe/server.ts`
**Problem:** `growth` and `scale` both map to `price_1SiTjYQ5jokLmQZObHPz3Zln`. The `priceIdToPlan()` reverse-lookup always returns `'growth'`. Any user who selects Scale is billed at Growth and stored as Growth in the database.
**Fix:** Create a real Scale price in the Stripe dashboard and update the `STRIPE_PRICE_ID_SCALE` env var. The code already reads from env vars — this is a config fix, not a code fix.
**Impact:** CRITICAL — charging users the wrong price is a legal/trust issue.

### 1.2 Encrypt n8n API Keys at Rest
**File:** `src/app/api/n8n/connect/route.ts:81`
**Problem:** `api_key_encrypted: api_key` — field name claims encryption but stores plaintext. The encryption infrastructure (`CREDENTIAL_ENCRYPTION_KEY`, `CREDENTIAL_KEY_ID`) already exists in env vars — it was never wired in.
**Fix:** Use AES-256-GCM encryption on `api_key` before storing. The `integrations/connectors/` lib already has a credential helper pattern to follow. Same decrypt on read.
**Impact:** CRITICAL — database breach exposes every user's n8n instance credentials.

### 1.3 Fix Stripe Webhook Idempotency
**File:** `src/app/api/stripe/webhook/route.ts:15`
**Problem:** `const processedEvents = new Set<string>()` — module-level, lost on every cold start. Vercel runs multiple concurrent instances, each with their own empty set. A `checkout.session.completed` event can be processed 2-3x, creating duplicate subscriptions or plan upgrades.
**Fix:** Replace the in-memory Set with an `idempotency_keys` Supabase table. Check before processing, insert after. Use `ON CONFLICT DO NOTHING`.
**Impact:** CRITICAL — duplicate billing events in production.

### 1.4 Fix DEFAULT_USER_ID Dev Artifact
**Files:** `api/n8n/webhook/dispatch-tasks/route.ts:64`, `api/n8n/coach/save-report/route.ts:50`
**Problem:** n8n machine-to-machine webhooks fall back to `process.env.DEFAULT_USER_ID` when no auth session exists. All scheduled workflow data gets written to one hardcoded account.
**Fix:** n8n webhooks must pass a `workspace_id` or `user_id` in the request body/header. The webhook handler validates this against `n8n_instances` table (confirm the n8n instance belongs to that workspace). Remove `DEFAULT_USER_ID` entirely.
**Impact:** CRITICAL — multi-tenant data integrity. User A's data routed to User B's account.

### 1.5 Enforce Webhook Signature Verification
**File:** `api/n8n/webhook/dispatch-tasks/route.ts:49`
**Problem:** `if (signature && webhookSecret)` — both must be present to verify. Either can be omitted to bypass auth. Unauthenticated POSTs can inject arbitrary agent tasks.
**Fix:** Invert the logic — reject if signature absent OR if verification fails. Return 401.
**Impact:** HIGH — unauthenticated task injection.

### 1.6 Add Security Headers
**File:** `next.config.ts`
**Problem:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Referrer-Policy` headers.
**Fix:** Add `headers()` config in `next.config.ts` covering all standard security headers. CSP should whitelist Supabase, Stripe, Anthropic domains. `X-Frame-Options: DENY`. HSTS with 1-year max-age.
**Impact:** HIGH — required for any SaaS handling financial/OAuth data. Also required for passing security audits.

### 1.7 Guard Middleware Against Missing Env Vars
**File:** `src/lib/supabase/middleware.ts:12`
**Problem:** If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, middleware silently passes — all protected routes become public.
**Fix:** If env vars are missing, respond with 503 (Service Unavailable) rather than passing through. This makes misconfiguration visible immediately instead of silently exposing the app.
**Impact:** HIGH — catastrophic misconfiguration window.

---

## Phase 2 — Functional Completeness (Broken Features)
*These are features the UI presents as working but have no backend implementation.*

### 2.1 Wire Invoice Fetching
**File:** `src/lib/data/billing.ts:100`
**Problem:** `getInvoicesForOrg()` always returns `[]`. The Stripe SDK is already initialized. Comment says "TODO: implement".
**Fix:** Implement the Stripe `invoices.list()` call, filtering by `stripe_customer_id` from the `organizations` table. Return last 12 invoices with amount, date, status, PDF URL.
**Impact:** HIGH — paying customers cannot see their billing history.

### 2.2 Implement Team Invitation Emails
**File:** `src/app/api/organizations/invite/route.ts:377`
**Problem:** Invite token is generated and returned in the API response, but no email is sent. Users invited to a workspace never receive notification.
**Fix:** Use Resend (already in the codebase for TotalGuard) to send a templated invite email with the token URL. The `NEXT_PUBLIC_APP_URL` env var is already available for building the invite link. Simple transactional email — no HTML template complexity needed for v1.
**Impact:** HIGH — team onboarding is completely broken.

### 2.3 Connect Achievements to Real Data
**File:** `src/app/(dashboard)/achievements/page.tsx`
**Problem:** 100% hardcoded demo data. Every user sees the same 7 achievements and 360 XP.
**Fix:** Create `/api/achievements` route that queries actual user activity (agent toggles, conversations count, goals created, etc.) to compute earned achievements. Map to existing achievement definitions in `src/lib/gamification/`. Replace hardcoded state with `useEffect` fetch.
**Impact:** HIGH — visible demo data destroys trust with real users.

### 2.4 Fix Auth Page Missing Avatars
**File:** `src/app/auth/page.tsx:369`
**Problem:** References `/avatars/team-1.png` through `team-5.png` which likely don't exist. Also shows "Trusted by 2,500+ teams" — fake at launch.
**Fix:** Either add real placeholder avatars to `public/avatars/` or remove the social proof section until there are real numbers. Replace testimonial with a generic brand statement.
**Impact:** MEDIUM — broken images on the first screen users see.

---

## Phase 3 — Production Hardening
*Makes the app production-grade — not blocking launch but critical within first 2 weeks.*

### 3.1 Add Idempotency Table Migration (Supabase)
Create `webhook_idempotency_keys` table as part of Phase 1.3 fix. This is the first step toward proper migration history.

### 3.2 Consolidate Env Var Documentation
Merge `.env.example` and `.env.local.example` into a single, complete, annotated `.env.example`. Remove `n8n_api_key` (wrong casing). Remove `DEFAULT_USER_ID`. Add comments explaining what each var is for.

### 3.3 Export Supabase Schema Snapshot
There are no migration files in the repo. Run `supabase db dump --schema public > supabase/schema.sql` to capture the current production schema as a baseline. This enables staging environments and disaster recovery.

### 3.4 Clean Up Console Warnings
Remove `console.warn` from `src/lib/data/billing.ts:109` — fires on every user page load, floods Vercel logs.

### 3.5 Redirect Legacy Onboarding Route
`/onboarding` uses old `user_id`-based schema instead of `organization_id`. Since it already redirects to `/deploy` for most users, add a server-side `redirect('/onboarding/quick-start')` to prevent any edge cases where the legacy form writes to the wrong schema.

---

## Phase 4 — Nice-to-Have Pre-Launch
*Not blocking. Can ship after first real users.*

### 4.1 Real Status Page
Connect `/status` to Vercel deployment health and Supabase status API. Even a simple HTTP ping to key endpoints every 5 minutes via a cron job beats hardcoded "all green."

### 4.2 Basic Referrals Backend
Create `/api/referrals` route that reads/generates a referral code per workspace from the `profiles` table. No tracking needed for v1 — just a stable code per user that doesn't regenerate on every page load.

### 4.3 Server-Side Auth Defense in Dashboard Layout
Add `supabase.auth.getUser()` check in `src/app/(dashboard)/layout.tsx` as defense-in-depth. Redirects to login if middleware was somehow bypassed. One additional line of protection.

---

## Google OAuth Unblock Checklist
*When Google approves the app, these need to be verified:*

- [ ] Authorized redirect URIs in Google Console include: `https://[supabase-project].supabase.co/auth/v1/callback`
- [ ] OAuth consent screen has correct `app.workely.ai` domain verified
- [ ] Supabase Google provider has matching Client ID + Secret from Google Console
- [ ] Test full OAuth flow: `/auth` → Google consent → `/auth/callback` → `/` dashboard redirect

---

## Priority Order for Execution

| Phase | Items | Blocker? |
|-------|-------|----------|
| **Phase 1** | 1.1–1.7 | YES — fix before any real users |
| **Phase 2** | 2.1–2.4 | YES — features presented as working are broken |
| **Phase 3** | 3.1–3.5 | No — within 2 weeks of launch |
| **Phase 4** | 4.1–4.3 | No — post first 10 customers |

**Total work estimate:** Phase 1 = ~1 day. Phase 2 = ~1 day. Phases 3-4 = ~half day each.

---

## What We Are NOT Changing
- No visual/UI redesigns (the app looks good)
- No new agent types or features
- No changes to the marketing site
- No changes to the deploy wizard UX
- No changes to the Stripe pricing tiers (just fixing the price ID config)
