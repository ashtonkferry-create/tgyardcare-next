# app.workely.ai — Deployment Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix every critical security bug and broken feature blocking real users from safely using app.workely.ai in production.

**Architecture:** 11 targeted surgical fixes across security, billing correctness, and functional completeness. No UI changes. No new features. Minimum viable production.

**Tech Stack:** Next.js 15/16, Supabase, Stripe, Node.js built-in `crypto` (no new deps for encryption), Resend not needed (invite URL pattern instead).

**Working directory:** `c:/Users/vance/OneDrive/Desktop/claude-workspace/workely.ai/apps/web/`

---

## PHASE 1 — Security & Correctness

---

### Task 1: Fix Stripe Scale Price ID (1 manual step + 1 code change)

**Files:**
- Modify: `src/lib/stripe/server.ts`
- Modify: `.env.example`

**Step 1: Manual — Create Scale price in Stripe Dashboard**

In the Stripe dashboard (dashboard.stripe.com):
1. Go to Products → find the Workely subscription product
2. Add a new price for "Scale" tier (different from Growth)
3. Copy the new `price_xxxxx` ID

**Step 2: Update server.ts to read Scale price from env var**

Open `src/lib/stripe/server.ts`. Replace lines 27-32:

```ts
export const STRIPE_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || 'price_1SiTjSQ5jokLmQZOmVGEMipA',
  growth:  process.env.STRIPE_PRICE_ID_GROWTH  || 'price_1SiTjYQ5jokLmQZObHPz3Zln',
  scale:   process.env.STRIPE_PRICE_ID_SCALE   || '',
  ultimate: process.env.STRIPE_PRICE_ID_ULTIMATE || 'price_1SiTjaQ5jokLmQZOfomE7P9X',
}
```

**Step 3: Update .env.example** — add after `STRIPE_WEBHOOK_SECRET`:

```
STRIPE_PRICE_ID_STARTER=price_1SiTjSQ5jokLmQZOmVGEMipA
STRIPE_PRICE_ID_GROWTH=price_1SiTjYQ5jokLmQZObHPz3Zln
STRIPE_PRICE_ID_SCALE=price_REPLACE_WITH_REAL_SCALE_ID
STRIPE_PRICE_ID_ULTIMATE=price_1SiTjaQ5jokLmQZOfomE7P9X
```

**Step 4: Set env var in Vercel**

In Vercel dashboard → Settings → Environment Variables:
- Add `STRIPE_PRICE_ID_SCALE` = the new Stripe price ID you created in Step 1

**Step 5: Commit**

```bash
git add src/lib/stripe/server.ts .env.example
git commit -m "fix(billing): scale plan now reads from STRIPE_PRICE_ID_SCALE env var — was sharing growth price ID"
```

---

### Task 2: Add AES-256-GCM Encryption Utility

**Files:**
- Create: `src/lib/crypto.ts`

**Step 1: Create the crypto utility**

Create `src/lib/crypto.ts`:

```ts
/**
 * AES-256-GCM encryption for sensitive credentials stored in Supabase.
 * Uses Node.js built-in crypto — no external dependencies.
 *
 * Env vars required:
 *   CREDENTIAL_ENCRYPTION_KEY  — 64 hex chars (32 bytes). Generate with:
 *     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *   CREDENTIAL_KEY_ID          — label for key rotation (e.g. "v1")
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_BYTES = 12   // 96-bit IV recommended for GCM
const TAG_BYTES = 16  // 128-bit auth tag

function getKey(): Buffer {
  const hex = process.env.CREDENTIAL_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string.
 * Returns a colon-separated string: keyId:iv:tag:ciphertext (all hex).
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const keyId = process.env.CREDENTIAL_KEY_ID || 'default'
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [keyId, iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Decrypt a string produced by encrypt().
 * Throws on tampered ciphertext (auth tag mismatch).
 */
export function decrypt(encoded: string): string {
  const parts = encoded.split(':')
  if (parts.length !== 4) throw new Error('Invalid encrypted format')
  const [, ivHex, tagHex, ciphertextHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8')
}

/** Returns true if the string looks like an encrypted blob (not plaintext). */
export function isEncrypted(value: string): boolean {
  return value.split(':').length === 4
}
```

**Step 2: Generate and set env var in Vercel**

Run locally to generate a key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output → Vercel dashboard → `CREDENTIAL_ENCRYPTION_KEY` = the 64-char hex string.
Set `CREDENTIAL_KEY_ID` = `v1`.

**Step 3: Commit**

```bash
git add src/lib/crypto.ts
git commit -m "feat(security): add AES-256-GCM credential encryption utility"
```

---

### Task 3: Encrypt n8n API Keys on Store, Decrypt on Read

**Files:**
- Modify: `src/app/api/n8n/connect/route.ts` (line 81 — write, lines ~165 — read)
- Modify: `src/app/api/n8n/health/route.ts` (if it reads api_key_encrypted)

**Step 1: Fix the write path — encrypt before storing**

In `src/app/api/n8n/connect/route.ts`, at the top add:

```ts
import { encrypt } from '@/lib/crypto'
```

Find line 81:
```ts
api_key_encrypted: api_key, // In production, encrypt this
```
Replace with:
```ts
api_key_encrypted: api_key ? encrypt(api_key) : null,
```

**Step 2: Fix the read path — decrypt before using**

In the same file, find where the n8n client is constructed for health check (around line 71):
```ts
const n8nClient = new N8nClient({ baseUrl: base_url, apiKey: api_key })
```
This already uses the user-provided `api_key` (before storage), so this line is fine.

Find the `GET` handler (if present) or anywhere `instance.api_key_encrypted` is read to build an N8nClient. Add import at top and decrypt:

```ts
import { decrypt, isEncrypted } from '@/lib/crypto'

// When reading from DB to use:
const apiKey = instance.api_key_encrypted
  ? isEncrypted(instance.api_key_encrypted)
    ? decrypt(instance.api_key_encrypted)
    : instance.api_key_encrypted  // legacy plaintext — still works
  : undefined
```

**Step 3: Fix the safe-response pattern (fragile undefined)**

Find:
```ts
const safeInstance = {
  ...instance,
  api_key_encrypted: undefined,
}
```
Replace with:
```ts
const { api_key_encrypted: _omit, ...safeInstance } = instance
```

**Step 4: Commit**

```bash
git add src/app/api/n8n/connect/route.ts
git commit -m "fix(security): encrypt n8n API keys at rest with AES-256-GCM"
```

---

### Task 4: Fix Stripe Webhook Idempotency (DB-backed)

**Files:**
- Create: `src/lib/supabase/webhook-idempotency.ts`
- Modify: `src/app/api/stripe/webhook/route.ts` (lines 13-28)

**Step 1: Create the idempotency helper**

Create `src/lib/supabase/webhook-idempotency.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

/**
 * DB-backed idempotency for Stripe webhooks.
 * Uses the service role client so it works from route handlers.
 *
 * Table: stripe_webhook_events (id TEXT PK, processed_at TIMESTAMPTZ)
 * Must create this table in Supabase before deploying.
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * Returns true if this event should be processed (first time seen).
 * Returns false if already processed (duplicate — skip).
 * Atomically marks as processed using INSERT ... ON CONFLICT DO NOTHING.
 */
export async function claimWebhookEvent(eventId: string): Promise<boolean> {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from('stripe_webhook_events')
    .insert({ id: eventId, processed_at: new Date().toISOString() })

  // error.code '23505' = unique_violation = duplicate event
  if (error) {
    if (error.code === '23505') return false  // already processed
    // Any other error: log but allow processing (fail-open to avoid lost events)
    console.error('[webhook-idempotency] DB error:', error)
    return true
  }
  return true
}
```

**Step 2: Create the Supabase table**

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id           TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-delete events older than 30 days to keep table small
CREATE INDEX IF NOT EXISTS stripe_webhook_events_processed_at_idx
  ON stripe_webhook_events (processed_at);
```

**Step 3: Replace in-memory Set with DB check**

In `src/app/api/stripe/webhook/route.ts`, replace lines 13-28:

```ts
// ─── Idempotency ─────────────────────────────────────────────────────────────
// REMOVED: in-memory Set (resets on every cold start / new instance)
// NOW: DB-backed via stripe_webhook_events table
import { claimWebhookEvent } from '@/lib/supabase/webhook-idempotency'
```

Find the existing `markProcessed(event.id)` call (or equivalent usage of the Set). Replace:

```ts
// OLD:
if (!markProcessed(event.id)) {
  return NextResponse.json({ received: true })
}

// NEW:
const shouldProcess = await claimWebhookEvent(event.id)
if (!shouldProcess) {
  return NextResponse.json({ received: true })
}
```

Remove the old `processedEvents`, `MAX_PROCESSED`, and `markProcessed` function entirely.

**Step 4: Commit**

```bash
git add src/lib/supabase/webhook-idempotency.ts src/app/api/stripe/webhook/route.ts
git commit -m "fix(billing): replace in-memory webhook idempotency with DB-backed stripe_webhook_events table"
```

---

### Task 5: Fix DEFAULT_USER_ID in n8n Webhook Routes

**Files:**
- Modify: `src/app/api/n8n/webhook/dispatch-tasks/route.ts`
- Modify: `src/app/api/n8n/coach/save-report/route.ts`

**The Problem:** Both routes use `process.env.DEFAULT_USER_ID` to attribute machine-triggered tasks. In multi-tenant production, every customer's n8n sends to the same endpoint — data must be routed by `workspace_id` passed in the request body.

**Step 1: Update dispatch-tasks route**

In `src/app/api/n8n/webhook/dispatch-tasks/route.ts`, find (around line 62-67):

```ts
// Get user ID from environment for scheduled workflows
const userId = process.env.DEFAULT_USER_ID;
if (!userId) {
  return NextResponse.json({ error: 'User ID not configured' }, { status: 400 });
}
```

Replace with:

```ts
// Resolve user from workspace_id passed by n8n workflow context
const workspaceId: string | undefined = (taskData as any).workspace_id
if (!workspaceId) {
  return NextResponse.json(
    { error: 'workspace_id is required in request body' },
    { status: 400 }
  )
}

// Look up n8n instance to validate workspace owns this endpoint
const supabase = await createClient()
const { data: n8nInstance } = await supabase
  .from('n8n_instances')
  .select('user_id')
  .eq('user_id', workspaceId)
  .eq('is_active', true)
  .single()

if (!n8nInstance) {
  return NextResponse.json({ error: 'No active n8n instance for workspace' }, { status: 403 })
}

const userId = n8nInstance.user_id
```

**Step 2: Do the same in save-report route**

In `src/app/api/n8n/coach/save-report/route.ts`, find the equivalent `DEFAULT_USER_ID` usage and apply the same pattern — require `workspace_id` in body, look up `n8n_instances`, use `user_id` from the result.

**Step 3: Remove DEFAULT_USER_ID from .env.example**

Delete the line:
```
DEFAULT_USER_ID=your-default-user-id
```

**Step 4: Commit**

```bash
git add src/app/api/n8n/webhook/dispatch-tasks/route.ts \
        src/app/api/n8n/coach/save-report/route.ts \
        .env.example
git commit -m "fix(security): remove DEFAULT_USER_ID — n8n webhooks now route by workspace_id from request body"
```

---

### Task 6: Enforce n8n Webhook Signature (Make it Mandatory)

**Files:**
- Modify: `src/app/api/n8n/webhook/dispatch-tasks/route.ts` (lines 45-60)

**Step 1: Invert the signature check**

Find:
```ts
const signature = request.headers.get('x-n8n-signature');
const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

if (signature && webhookSecret) {
  // only verify if BOTH present
  ...
}
```

Replace with:
```ts
const signature = request.headers.get('x-n8n-signature')
const webhookSecret = process.env.N8N_WEBHOOK_SECRET

if (!signature || !webhookSecret) {
  return NextResponse.json(
    { error: 'Webhook signature required' },
    { status: 401 }
  )
}

const verifyRequest = new Request(request.url, {
  method: 'POST',
  headers: request.headers,
  body,
})

const verification = await verifyWebhookRequest(verifyRequest, webhookSecret)
if (!verification.verified) {
  return NextResponse.json(
    { error: verification.error || 'Invalid signature' },
    { status: 401 }
  )
}
```

**Step 2: Commit**

```bash
git add src/app/api/n8n/webhook/dispatch-tasks/route.ts
git commit -m "fix(security): enforce n8n webhook signature — was optional, now mandatory"
```

---

### Task 7: Add Security Headers

**Files:**
- Modify: `next.config.ts`

**Step 1: Add security headers to the existing `headers()` function**

In `next.config.ts`, find the existing `async headers()` function and add a new entry **before** the static asset entries:

```ts
async headers() {
  return [
    // ── Security headers (all routes) ─────────────────────────────────
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://lh3.googleusercontent.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.stripe.com",
            "frame-src https://js.stripe.com https://hooks.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
          ].join('; '),
        },
      ],
    },
    // ── Static asset caching (existing) ───────────────────────────────
    {
      source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
      // ... (keep existing)
    },
    // ... (rest of existing entries unchanged)
  ]
}
```

**Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "fix(security): add security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy"
```

---

### Task 8: Fix Middleware Auth Guard

**Files:**
- Modify: `src/lib/supabase/middleware.ts` (lines 12-14)

**Step 1: Make missing env vars fail closed (503), not open (pass-through)**

Find:
```ts
if (!supabaseUrl || !supabaseAnonKey) {
  return supabaseResponse
}
```

Replace with:
```ts
if (!supabaseUrl || !supabaseAnonKey) {
  // Fail closed: missing env vars = all protected routes return 503
  // This makes misconfiguration immediately visible instead of silently public
  return new NextResponse('Service unavailable — auth not configured', { status: 503 })
}
```

**Step 2: Commit**

```bash
git add src/lib/supabase/middleware.ts
git commit -m "fix(security): middleware fails closed (503) when Supabase env vars missing — was silently passing all requests"
```

---

## PHASE 2 — Functional Completeness

---

### Task 9: Wire Stripe Invoice Fetching

**Files:**
- Modify: `src/lib/data/billing.ts` (lines 95-111)

**Step 1: Implement the Stripe invoices.list() call**

In `src/lib/data/billing.ts`, add import at top:
```ts
import { getStripe } from '@/lib/stripe/server'
```

Find and replace the stubbed function body (lines 95-111):

```ts
export async function getInvoicesForOrg(orgId: string): Promise<Invoice[]> {
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', orgId)
    .single()

  if (!org?.stripe_customer_id) return []

  try {
    const stripe = getStripe()
    const invoices = await stripe.invoices.list({
      customer: org.stripe_customer_id,
      limit: 12,
    })

    return invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_due,
      currency: inv.currency,
      status: inv.status ?? 'unknown',
      invoice_pdf: inv.invoice_pdf ?? '',
      created: inv.created,
      period_start: inv.period_start,
      period_end: inv.period_end,
    }))
  } catch (err) {
    console.error('[billing] Failed to fetch invoices from Stripe:', err)
    return []
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/data/billing.ts
git commit -m "fix(billing): implement Stripe invoice fetching — was returning empty array for all users"
```

---

### Task 10: Fix Team Invitations (Show Copy Link Instead of Silent Email)

**Files:**
- Modify: `src/app/api/organizations/invite/route.ts` (line 380-393)

**The fix:** The API already returns `inviteUrl` in the response. The problem is the `message` field says "Invitation sent to [email]" which implies an email was sent. Fix the API response to be honest, so the UI can show a copy-link flow.

**Step 1: Update the API response message**

Find (around line 377):
```ts
// TODO: Send email with invitation link
// For now, return the token for testing
const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`

return NextResponse.json(
  {
    success: true,
    invitation: { ... },
    inviteUrl,
    message: `Invitation sent to ${email} to join ${org?.name}`,
  },
  { status: 201 }
)
```

Replace with:
```ts
const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`

return NextResponse.json(
  {
    success: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expires_at: invitation.expires_at,
    },
    inviteUrl,
    // Honest message — UI should show copy-link flow
    message: `Invitation link created for ${email}. Share the link below to give them access to ${org?.name ?? 'your workspace'}.`,
    requiresManualShare: true,
  },
  { status: 201 }
)
```

**Step 2: Commit**

```bash
git add src/app/api/organizations/invite/route.ts
git commit -m "fix(teams): invitation response is now honest — returns copy link instead of claiming email was sent"
```

---

### Task 11: Connect Achievements to Real Data

**Files:**
- Create: `src/app/api/achievements/route.ts`
- Modify: `src/app/(dashboard)/achievements/page.tsx`

**Step 1: Create the achievements API route**

Create `src/app/api/achievements/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Gather signals from DB in parallel
  const [
    { data: profile },
    { count: agentCount },
    { count: integrationCount },
    { count: conversationCount },
    { count: leadCount },
    { count: goalCount },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, company_name').eq('id', user.id).single(),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
    supabase.from('n8n_instances').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const signals: Record<string, number> = {
    login: 1,  // if we got here, user has logged in
    profile_complete: (profile?.full_name && profile?.company_name) ? 1 : 0,
    active_agents: agentCount ?? 0,
    active_integrations: integrationCount ?? 0,
    conversations: conversationCount ?? 0,
    leads: leadCount ?? 0,
    goals: goalCount ?? 0,
  }

  // Evaluate which achievements are unlocked
  const unlockedIds: string[] = []
  let totalXp = 0

  for (const achievement of ACHIEVEMENTS) {
    const { type, value, metric } = achievement.condition
    const signal = signals[metric ?? type] ?? 0
    if (signal >= value) {
      unlockedIds.push(achievement.id)
      totalXp += achievement.xpReward
    }
  }

  return NextResponse.json({ unlockedIds, totalXp })
}
```

**Step 2: Update the achievements page to fetch from API**

In `src/app/(dashboard)/achievements/page.tsx`, replace the hardcoded state:

```ts
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { PageTransition } from '@/components/animations/page-transition'
import { AchievementsGrid } from '@/components/gamification'

export default function AchievementsPage() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements')
      .then((r) => r.json())
      .then(({ unlockedIds, totalXp }) => {
        setUnlockedIds(unlockedIds ?? [])
        setTotalXp(totalXp ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Achievements</h1>
          </div>
          <p className="text-slate-500">Track your progress and unlock rewards</p>
        </motion.div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading achievements…</div>
        ) : (
          <AchievementsGrid unlockedIds={unlockedIds} totalXp={totalXp} />
        )}
      </div>
    </PageTransition>
  )
}
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/app/api/achievements/route.ts src/app/(dashboard)/achievements/page.tsx
git commit -m "fix(gamification): connect achievements page to real user data — was showing hardcoded demo data"
```

---

## PHASE 3 — Production Hardening

---

### Task 12: Clean Up Dev Artifacts

**Files:**
- Modify: `src/lib/data/billing.ts` (line 109 — remove console.warn)
- Modify: `src/app/auth/page.tsx` (fake social proof)
- Modify: `.env.example` (remove DEFAULT_USER_ID, fix n8n_api_key casing)

**Step 1: Remove console.warn from billing**

In `src/lib/data/billing.ts`, line 109, delete:
```ts
console.warn('Stripe SDK not configured - returning empty invoices list')
```
(This line is now unreachable after Task 9 implements real invoices — remove anyway.)

**Step 2: Fix auth page social proof**

In `src/app/auth/page.tsx`, find the section showing "Trusted by 2,500+ teams" and avatar images. Check if `public/avatars/team-1.png` through `team-5.png` exist:

```bash
ls apps/web/public/avatars/ 2>/dev/null || echo "missing"
```

If missing, either:
- Add real avatar images to `public/avatars/` (preferred)
- OR remove the social proof section from the auth page entirely (simpler)

**Step 3: Consolidate .env.example**

Clean up `.env.example`:
- Change `n8n_api_key` → `N8N_API_KEY` (consistent casing)
- Remove `DEFAULT_USER_ID` (removed in Task 5)
- Add `RESEND_API_KEY=` as optional (for future email)
- Ensure every env var used in the codebase is documented

**Step 4: Commit**

```bash
git add src/lib/data/billing.ts src/app/auth/page.tsx .env.example
git commit -m "chore: remove console.warn, fix auth page social proof, consolidate env.example"
```

---

### Task 13: Snapshot Supabase Schema

**Files:**
- Create: `supabase/schema.sql` (in repo root, not apps/web)

**Step 1: Export current schema**

Run in Supabase Dashboard → SQL Editor → copy the schema dump. Or use the CLI if available:

```bash
# If supabase CLI is installed:
supabase db dump --schema public > supabase/schema.sql
```

If not, go to Supabase Dashboard → Database → Backups → Download Schema.

**Step 2: Add the stripe_webhook_events table to schema**

Append to `supabase/schema.sql`:

```sql
-- Stripe webhook idempotency (added 2026-03-17)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id           TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stripe_webhook_events_processed_at_idx
  ON stripe_webhook_events (processed_at);
```

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "chore: add supabase/schema.sql baseline snapshot + stripe_webhook_events table"
```

---

## Google OAuth Launch Checklist

When Google approves your OAuth app, verify these **before** announcing the app publicly:

- [ ] In Google Cloud Console → Authorized redirect URIs includes:
  `https://[your-supabase-project-ref].supabase.co/auth/v1/callback`
- [ ] Supabase Dashboard → Auth → Providers → Google has matching Client ID + Client Secret
- [ ] Test the full OAuth flow end-to-end: click "Sign in with Google" → Google consent → redirects to `/` dashboard
- [ ] Confirm the OAuth consent screen shows "app.workely.ai" not "localhost"

---

## Final Checklist Before First Real User

- [ ] Task 1: Scale Stripe price ID created + env var set in Vercel
- [ ] Task 2: `CREDENTIAL_ENCRYPTION_KEY` and `CREDENTIAL_KEY_ID` set in Vercel
- [ ] Task 3: n8n API keys encrypted at rest
- [ ] Task 4: `stripe_webhook_events` table created in Supabase
- [ ] Task 5: DEFAULT_USER_ID removed, n8n webhooks route by workspace_id
- [ ] Task 6: Webhook signatures enforced
- [ ] Task 7: Security headers live (verify at securityheaders.com after deploy)
- [ ] Task 8: Middleware fails closed
- [ ] Task 9: Invoice fetching working
- [ ] Task 10: Invite flow shows copy-link
- [ ] Task 11: Achievements show real data
- [ ] Task 12: Dev artifacts cleaned up
- [ ] Task 13: Schema snapshotted
- [ ] Google OAuth approved + verified end-to-end

**Estimated total work: ~1.5–2 days of focused execution.**
