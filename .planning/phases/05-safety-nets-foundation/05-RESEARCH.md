# Phase 5: Safety Nets & Foundation - Research

**Researched:** 2026-03-16
**Domain:** Next.js hardening, Supabase SSR, typography, testing, security
**Confidence:** HIGH

## Summary

This phase is a hardening/stabilization phase for an existing Next.js 16 + Supabase site that currently has significant technical debt: everything is `'use client'`, there is no server-side Supabase client, TypeScript checking is disabled (`ignoreBuildErrors: true`, `strict: false`), the wrong font is used (Inter instead of Clash Display + General Sans), and 14 Supabase errors fire on every page load.

The codebase currently has a single Supabase client at `src/integrations/supabase/client.ts` using `createClient` from `@supabase/supabase-js` with `localStorage` auth. There are 41 cron job routes in `vercel.json` (40 cron entries). The middleware handles 410 Gone responses and dynamic redirects but has no auth protection for `/portal/*` or `/admin/*`. Seasonal theme colors are fetched client-side from Supabase via `SeasonalThemeContext.tsx` on every page load, which is the primary source of console errors.

**Primary recommendation:** Work in this order: (1) fix Supabase console errors, (2) set up `@supabase/ssr` server client, (3) replace fonts, (4) establish TypeScript error budget, (5) add smoke tests, (6) handle security items. Each is independent enough to ship incrementally.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | ^0.5+ | Server-side Supabase client with cookie-based auth | Official replacement for `@supabase/auth-helpers-nextjs` |
| `next/font/local` | (built-in to Next.js 16) | Self-hosted font loading with zero CLS | Built-in, handles preloading and `font-display: swap` automatically |
| `@playwright/test` | ^1.50+ | Smoke tests for public pages | Official Next.js recommended E2E testing framework |
| `git-filter-repo` | latest | Remove `gsc-service-account.json` from git history | GitHub-recommended tool, faster than BFG for single-file removal |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `axe-core` or `@axe-core/playwright` | ^4.10+ | WCAG AA contrast checking in Playwright tests | Automated accessibility verification during smoke tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `git-filter-repo` | BFG Repo-Cleaner | BFG is simpler for large repos, but filter-repo is GitHub's official recommendation and handles edge cases better |
| Playwright | Cypress | Playwright is faster, supports multiple browsers, and is Next.js's official recommendation |
| `@supabase/ssr` | Raw `createClient` per-request | SSR package handles cookie serialization/parsing, auth token refresh in middleware, and avoids the localStorage-on-server error |

**Installation:**
```bash
npm install @supabase/ssr
npm install -D @playwright/test
npx playwright install chromium
```

## Architecture Patterns

### Recommended Supabase Client Structure
```
src/lib/supabase/
  client.ts          # Browser client (createBrowserClient)
  server.ts          # Server client (createServerClient with cookies)
  middleware.ts       # Middleware client (createServerClient with request/response cookies)
```

### Font File Structure
```
src/app/fonts/
  ClashDisplay-Variable.woff2
  GeneralSans-Variable.woff2
```

### Test Structure
```
tests/
  smoke/
    public-pages.spec.ts     # Top 10 public pages load without errors
    admin-critical.spec.ts   # Admin dashboard critical paths
  playwright.config.ts
```

### Pattern 1: Server-Side Supabase Client (Next.js App Router)
**What:** Create a `createClient()` helper that uses `cookies()` from `next/headers`
**When to use:** Any Server Component, Route Handler, or Server Action that needs Supabase
**Example:**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
```
Source: [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

### Pattern 2: Browser Client (replaces current singleton)
**What:** Replace the current `createClient` singleton with `createBrowserClient`
**When to use:** Client Components that need Supabase
**Example:**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```
Source: [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

### Pattern 3: Auth Middleware Scoped to Protected Routes
**What:** Middleware that refreshes auth tokens only for `/portal/*` and `/admin/*`
**When to use:** Replace the current middleware which runs on all routes
**Example:**
```typescript
// In middleware.ts, add auth refresh ONLY for protected routes:
if (pathname.startsWith('/portal') || pathname.startsWith('/admin')) {
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}
```

### Pattern 4: Local Font Setup with CSS Variables
**What:** Self-hosted Clash Display + General Sans via `next/font/local`
**When to use:** In `layout.tsx` root layout
**Example:**
```typescript
// src/app/layout.tsx
import localFont from 'next/font/local'

const clashDisplay = localFont({
  src: './fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash-display',
  display: 'swap',
  weight: '200 700',
})

const generalSans = localFont({
  src: './fonts/GeneralSans-Variable.woff2',
  variable: '--font-general-sans',
  display: 'swap',
  weight: '200 700',
})

// In the <html> tag:
<html lang="en" className={`${clashDisplay.variable} ${generalSans.variable}`}>
```
Source: [Next.js Font Docs](https://nextjs.org/docs/app/getting-started/fonts)

### Pattern 5: Typography CSS Variables
**What:** Establish a typography scale via CSS custom properties
**Example:**
```css
/* globals.css */
:root {
  --font-display: var(--font-clash-display), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-general-sans), ui-sans-serif, system-ui, sans-serif;

  /* Typography scale */
  --text-display-xl: 4.5rem;   /* 72px */
  --text-display: 3.75rem;     /* 60px */
  --text-heading-1: 3rem;      /* 48px */
  --text-heading-2: 2.25rem;   /* 36px */
  --text-heading-3: 1.875rem;  /* 30px */
  --text-heading-4: 1.5rem;    /* 24px */
  --text-body-lg: 1.125rem;    /* 18px */
  --text-body: 1rem;           /* 16px */
  --text-body-sm: 0.875rem;    /* 14px */
  --text-caption: 0.75rem;     /* 12px */
}

body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
}
```

### Anti-Patterns to Avoid
- **Importing from `@supabase/supabase-js` directly for auth on server:** Use `@supabase/ssr` instead; the raw client doesn't handle cookie-based session management
- **Using `typeof window !== 'undefined'` guards for SSR:** The current client does this; `@supabase/ssr` handles it properly
- **Loading fonts from Google Fonts CDN:** Self-host with `next/font/local` for zero external requests
- **Putting font files in `public/`:** Place them in `src/app/fonts/` so `next/font/local` can hash and optimize them
- **Running `tsc --noEmit` with `strict: true` initially:** Start with current `strict: false` settings to get baseline error count, then tighten incrementally

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based Supabase auth | Manual cookie parsing/setting | `@supabase/ssr` `createServerClient` | Handles token refresh, cookie chunking (tokens > 4KB), and race conditions |
| Font loading optimization | Manual `@font-face` declarations | `next/font/local` | Automatic preloading, CLS prevention, `size-adjust` for fallback fonts |
| WCAG contrast checking | Manual color calculations | `axe-core` or browser DevTools audit | Comprehensive rulesets, handles opacity, background layers |
| Git history rewriting | Manual `git filter-branch` | `git-filter-repo --path gsc-service-account.json --invert-paths` | 10-720x faster, safer, handles edge cases |
| Smoke test framework | Custom fetch scripts | Playwright `page.goto()` + console error capture | Handles JS errors, network failures, hydration mismatches |

**Key insight:** This phase is almost entirely about replacing hand-rolled solutions with standard library approaches. The current codebase uses raw `@supabase/supabase-js` where `@supabase/ssr` should be used, loads Inter from Google where local fonts should be used, and has no automated verification where Playwright should exist.

## Common Pitfalls

### Pitfall 1: Breaking Existing Client Components When Adding SSR Client
**What goes wrong:** Replacing the old `supabase` singleton export breaks all 50+ files that import it
**Why it happens:** The old client is a module-level singleton; the new pattern is a function call
**How to avoid:** Create the new server client at `src/lib/supabase/server.ts` WITHOUT touching `src/integrations/supabase/client.ts` initially. Migrate imports file-by-file or keep the old client working alongside the new one. The old client path (`@/integrations/supabase/client`) stays for client components; the new path (`@/lib/supabase/server`) is for server code only.
**Warning signs:** Build failures in 50+ files after changing the client import

### Pitfall 2: Supabase Console Errors from Missing Tables or RLS
**What goes wrong:** The `SeasonalThemeContext.tsx` queries 4 tables on every page load (`season_settings`, `season_override`, `seasonal_slides`, `seasonal_priority_services`). If any table is missing, has no rows, or has RLS policies blocking anon access, it throws errors.
**Why it happens:** Client-side Supabase queries use the anon key, which is subject to RLS policies
**How to avoid:** First, identify which of the 14 errors are RLS/table issues vs. other errors. Then either: (a) add appropriate RLS policies for `SELECT` on public-facing tables, or (b) move these queries server-side where the service role key can be used safely, or (c) add proper error handling so failures don't surface in the console.
**Warning signs:** 400/401/406 status codes in DevTools Network tab from `supabase.co` URLs

### Pitfall 3: Font Flash (FOUT/FOIT) After Font Swap
**What goes wrong:** Replacing Inter with Clash Display causes visible text re-render on page load
**Why it happens:** Font files load after initial HTML render
**How to avoid:** Use `display: 'swap'` (automatic with `next/font/local`). Variable font files (.woff2) keep payload small. Preloading is automatic with `next/font`.
**Warning signs:** Text briefly appears in fallback font then shifts

### Pitfall 4: TypeScript Error Explosion
**What goes wrong:** Running `tsc --noEmit` for the first time reveals hundreds/thousands of errors, causing despair
**Why it happens:** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` means the codebase has never been type-checked
**How to avoid:** The goal is NOT to fix all errors. The goal is to CATALOG them and set a budget. Run `tsc --noEmit 2>&1 | tail -1` to get the count. Save that number. New code in Phase 6+ must not increase it.
**Warning signs:** Trying to fix all errors at once instead of establishing a budget

### Pitfall 5: Middleware Breaking Existing Redirect Logic
**What goes wrong:** Adding auth middleware to handle `/admin/*` and `/portal/*` conflicts with existing 410 Gone and dynamic redirect logic
**Why it happens:** The current middleware has complex routing for legacy Wix URLs and Supabase-based redirects
**How to avoid:** Add auth checks AFTER the existing 410/redirect logic. Order matters: 410 Gone patterns first, then www redirect, then dynamic redirects, then auth check for protected routes.
**Warning signs:** Legacy redirect URLs start returning auth redirects instead of 410/301

### Pitfall 6: git-filter-repo Requires Fresh Clone
**What goes wrong:** `git-filter-repo` refuses to run on a repo with uncommitted changes or that isn't a fresh clone
**Why it happens:** Safety measure to prevent data loss
**How to avoid:** Create a fresh `--mirror` clone for the history rewrite, run `git-filter-repo`, then force-push. Coordinate with any collaborators since commit hashes will change.
**Warning signs:** "Aborting: Refusing to destructively overwrite repo history" error

## Code Examples

### Smoke Test for Public Pages (Playwright)
```typescript
// tests/smoke/public-pages.spec.ts
import { test, expect } from '@playwright/test'

const PUBLIC_PAGES = [
  '/',
  '/about',
  '/services',
  '/residential',
  '/commercial',
  '/contact',
  '/reviews',
  '/blog',
  '/faq',
  '/service-areas',
]

for (const path of PUBLIC_PAGES) {
  test(`${path} loads without console errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', err => errors.push(err.message))

    const response = await page.goto(path)
    expect(response?.status()).toBeLessThan(400)
    expect(errors).toEqual([])
  })
}
```

### Playwright Config for Next.js
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Seasonal Theme Colors Consolidated
```css
/* globals.css - single source of truth */
:root {
  --season-accent: #16a34a;        /* default: green */
  --season-accent-light: #22c55e;
  --season-badge-bg: #16a34a;
  --season-badge-text: #ffffff;
}

[data-season="summer"] {
  --season-accent: #16a34a;
  --season-accent-light: #22c55e;
}

[data-season="fall"] {
  --season-accent: #d97706;
  --season-accent-light: #f59e0b;
}

[data-season="winter"] {
  --season-accent: #3b82f6;
  --season-accent-light: #60a5fa;
}
```

### Brand Name Consistency Check (grep command)
```bash
# Find all inconsistent brand references
grep -rn "TG Yard Care\|Totalguard\|Total Guard\|TG yard care\|tg yard care" src/ --include="*.tsx" --include="*.ts"
# Should all be "TotalGuard Yard Care" or "TotalGuard" (camelCase G)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Auth helpers deprecated; SSR package is official replacement |
| `createClient` singleton for SSR | `createServerClient` per-request | 2024 | Prevents auth token leaks between requests |
| Google Fonts CDN | `next/font` self-hosting | Next.js 13+ (2023) | Zero external requests, no CLS, automatic optimization |
| `git filter-branch` | `git-filter-repo` | 2023 | GitHub officially recommends filter-repo; filter-branch is deprecated |
| Manual E2E scripts | Playwright | 2023+ | Next.js official testing recommendation, replaces Cypress for most use cases |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`
- `git filter-branch`: Replaced by `git-filter-repo` (GitHub docs explicitly warn against filter-branch)
- Loading Google Fonts via `<link>` tag: Use `next/font/google` or `next/font/local`

## Open Questions

1. **Exact count of TypeScript errors**
   - What we know: `strict: false`, `ignoreBuildErrors: true`, so errors are fully suppressed
   - What's unclear: Could be 50 or 5000 errors; unknown until `tsc --noEmit` runs
   - Recommendation: Run `tsc --noEmit 2>&1 | grep -c "error TS"` as first task; sets the budget baseline

2. **Which of the 14 Supabase console errors are RLS vs. missing tables vs. other**
   - What we know: `SeasonalThemeContext.tsx` queries 4 tables client-side on every page load
   - What's unclear: Whether errors are 400 (bad request), 401 (auth), 406 (not acceptable), or 500 (server)
   - Recommendation: Load production site in DevTools, filter Network tab for `supabase.co`, catalog each error type

3. **Whether `gsc-service-account.json` was ever in git history**
   - What we know: File is in `.gitignore` already; `git log` search returned empty
   - What's unclear: File may have been committed in early history before .gitignore was added, or may have never been committed
   - Recommendation: Run `git log --all --diff-filter=A -- gsc-service-account.json` to confirm; if never committed, skip filter-repo and just rotate the key

4. **Font licensing for Clash Display and General Sans**
   - What we know: Clash Display is free for personal and commercial use (Indian Type Foundry, free license)
   - What's unclear: General Sans licensing terms; may require checking fontshare.com or ITF
   - Recommendation: Both are available on fontshare.com (Indian Type Foundry) with free commercial licenses. Download variable .woff2 from there.

5. **Google Search Console API access for SEO baseline**
   - What we know: There are GSC scripts in `scripts/gsc-*.mjs` that use a service account
   - What's unclear: Whether current credentials still work after the key should be rotated
   - Recommendation: Capture SEO baseline BEFORE rotating the GSC service account key; or use a new key

## Sources

### Primary (HIGH confidence)
- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - createServerClient, createBrowserClient patterns
- [Supabase Next.js Auth Setup](https://supabase.com/docs/guides/auth/server-side/nextjs) - middleware, server client, cookie handling
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - next/font/local with woff2, CSS variables, display swap
- [Next.js Playwright Testing](https://nextjs.org/docs/pages/guides/testing/playwright) - official setup and config
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) - git-filter-repo workflow

### Secondary (MEDIUM confidence)
- Codebase analysis of `src/integrations/supabase/client.ts`, `src/middleware.ts`, `src/app/layout.tsx`, `src/contexts/SeasonalThemeContext.tsx` - current state verified by direct inspection
- [Clash Display on Cufonfonts](https://www.cufonfonts.com/font/clash-display) - font availability and licensing
- [Playwright Best Practices 2026](https://www.browserstack.com/guide/playwright-best-practices) - smoke test patterns

### Tertiary (LOW confidence)
- General Sans variable woff2 availability - assumed available on fontshare.com based on Indian Type Foundry catalog; needs verification before download

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified via official docs
- Architecture (Supabase SSR): HIGH - official Supabase docs provide exact Next.js patterns
- Architecture (fonts): HIGH - Next.js docs provide exact `localFont` patterns
- Architecture (smoke tests): HIGH - Playwright + Next.js integration is well-documented
- Pitfalls: HIGH - identified from direct codebase analysis (45 seasonal theme files, 57 Supabase client files, 41 cron routes)
- Security (git history): MEDIUM - need to verify if file was actually committed before running filter-repo
- SEO baseline: LOW - depends on GSC API access that may need credential rotation

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable domain, no fast-moving dependencies)
