# Domain Pitfalls: TotalGuard Brand Transformation

**Domain:** Adding major features (server components conversion, customer portal, instant pricing, video, typography overhaul) to a large existing Next.js production site
**Researched:** 2026-03-15
**Context:** 65+ pages, 47 API routes, 38 cron jobs, no tests, `ignoreBuildErrors: true`, 500+ properties served, strong local SEO

---

## Critical Pitfalls

Mistakes that cause SEO loss, downtime, or data corruption. These can directly cost revenue.

---

### Pitfall 1: SEO Regression from URL or Rendering Changes

**What goes wrong:** Changing page structure, URLs, or rendering strategy (client to server components) causes Google to re-evaluate pages. Small businesses commonly lose 30-60% of organic traffic after a redesign. For a local service business with strong rankings, this is catastrophic.

**Why it happens:**
- Moving from `'use client'` (client-rendered) to server components changes how Googlebot receives the page
- Restructuring components can accidentally remove or alter structured data (16 schema components at risk)
- Font/layout changes cause CLS spikes that hurt Core Web Vitals scores
- Internal link structures change during component refactoring
- Dynamic sitemap generation breaks if route structure changes

**Consequences:** Loss of Google rankings that took months/years to build. For a local lawn care business, organic search is a primary lead source. Even a 2-week ranking drop during peak season means lost revenue.

**Warning signs:**
- Google Search Console shows "Page experience" degradation
- Crawl errors appear in GSC after deployment
- `robots.txt` or `sitemap.xml` routes return errors
- Schema validation tools show missing or broken structured data
- CLS scores jump above 0.1

**Prevention:**
1. **Baseline everything before touching anything:** Export GSC performance data, screenshot all top-ranking pages, catalog every schema component and its output
2. **Never change URL structure** without 301 redirect mapping on a page-by-page basis
3. **Test schema output** on every page before and after changes (compare JSON-LD output)
4. **Monitor daily** for 30 days post-launch using GSC
5. **Server components actually HELP SEO** (HTML delivered pre-rendered) -- but only if the migration is done correctly without removing metadata or structured data

**Which phase should address it:** Phase 1 (foundation/safety nets) -- establish SEO monitoring and baselines before any visual changes begin.

**Severity:** CRITICAL

**Confidence:** HIGH -- well-documented pattern across redesign case studies

---

### Pitfall 2: The "ignoreBuildErrors Iceberg" -- Removing TypeScript Safety on a Fragile Codebase

**What goes wrong:** The site currently runs with `ignoreBuildErrors: true`, meaning TypeScript errors are silently swallowed during builds. When you start refactoring (especially client-to-server component conversion), you will encounter dozens or hundreds of type errors that have been accumulating. Teams either (a) keep ignoring them and ship runtime crashes, or (b) try to fix them all at once and introduce regressions across 65+ pages.

**Why it happens:**
- `ignoreBuildErrors: true` is the "nuclear option" -- it removes the primary safety net for catching mistakes
- No tests exist to catch what TypeScript would have caught
- Server components have stricter requirements than client components (no hooks, no browser APIs, no event handlers) -- converting components surfaces type errors that were previously hidden
- Each type error you fix may cascade into other files

**Consequences:** Runtime crashes in production. Broken pages that were working fine. A whack-a-mole cycle where fixing one thing breaks another.

**Warning signs:**
- Running `tsc --noEmit` reveals 50+ errors (very likely given current state)
- Components crash after conversion to server components because they use `useState`, `useEffect`, or browser APIs
- Build times increase dramatically when you re-enable type checking
- 14 existing Supabase console errors suggest type/runtime issues already exist

**Prevention:**
1. **Run `tsc --noEmit` immediately** to understand the scope of existing errors (do NOT try to fix them all at once)
2. **Create a "type error budget"** -- catalog all existing errors, set a rule that new code must not add errors
3. **Use `@ts-expect-error` with TODO comments** on existing errors rather than `ignoreBuildErrors` globally
4. **Convert components one at a time** with explicit testing of that page after each conversion
5. **Add minimal smoke tests** (even just "does this page render without crashing") BEFORE refactoring
6. **Re-enable `ignoreBuildErrors: false`** only after error count is manageable (under 20)

**Which phase should address it:** Phase 1 -- must establish type safety baseline before any feature work.

**Severity:** CRITICAL

**Confidence:** HIGH -- directly observable from project state

---

### Pitfall 3: Breaking 38 Cron Jobs During Refactoring

**What goes wrong:** The site has 38 cron jobs running on Vercel. Refactoring API routes, changing file structure, or modifying shared utilities can silently break cron jobs. Since crons only run on production deployments, you won't discover breakage in preview deployments.

**Why it happens:**
- Cron jobs are defined in `vercel.json` with specific route paths -- moving or renaming API routes breaks them
- Shared utilities used by both crons and pages may be refactored in ways that break cron handlers
- Server component conversion may change module resolution that cron routes depend on
- Cron jobs don't follow redirects -- a 3xx response means the job silently completes without doing work
- No tests exist to verify cron job behavior

**Consequences:** Silent data corruption. SEO crons stop updating (losing the competitive advantage). Customer notifications stop. Admin reports break. You won't know until someone notices missing data days or weeks later.

**Warning signs:**
- Cron job logs show 3xx, 4xx, or 5xx responses after deployment
- SEO-related automated tasks (sitemap regeneration, schema updates) stop running
- Data that should be updated daily/weekly goes stale
- Vercel dashboard shows cron invocations with errors

**Prevention:**
1. **Catalog all 38 cron jobs** with their routes, schedules, and what they do BEFORE any refactoring
2. **Add `export const dynamic = 'force-dynamic'`** to every cron route handler (prevents caching issues)
3. **Never rename or move cron route files** without updating `vercel.json` in the same commit
4. **Add health check responses** to each cron endpoint that log success/failure
5. **Monitor cron execution** in Vercel dashboard for 48 hours after every deployment
6. **Test cron routes manually** by hitting them with `curl` after each deployment

**Which phase should address it:** Phase 1 -- audit and protect before refactoring begins.

**Severity:** CRITICAL

**Confidence:** HIGH -- Vercel documentation explicitly warns about these patterns

---

### Pitfall 4: Customer Portal Auth Leaking into Public Pages

**What goes wrong:** Adding Supabase authentication for a customer portal introduces middleware, cookie handling, and auth state that can interfere with public-facing pages. Common failures: public pages start requiring auth, ISR/SSG pages get cached with auth tokens, or the Supabase client initialization conflicts between authenticated and anonymous contexts.

**Why it happens:**
- Supabase middleware that refreshes auth tokens runs on ALL routes unless explicitly scoped
- ISR (Incremental Static Regeneration) pages with auth can cache one user's session and serve it to another
- The existing 14 Supabase console errors suggest the Supabase client is already misconfigured
- `'use client'` components may initialize Supabase differently than server components
- CDN caching of `Set-Cookie` headers can serve wrong user sessions

**Consequences:** Public pages break or slow down. Worst case: one customer sees another customer's data. Auth token caching can serve logged-in state to anonymous visitors (breaking SEO crawlers).

**Warning signs:**
- Public pages start showing loading spinners (waiting for auth check)
- Google Search Console reports pages as "noindex" or "blocked"
- Supabase console errors increase after portal deployment
- Users report seeing other users' information
- `getUser()` calls on public pages cause unnecessary latency

**Prevention:**
1. **Scope auth middleware explicitly** -- use `matcher` config to only run on `/portal/*` routes
2. **Use `export const dynamic = 'force-dynamic'`** on ALL authenticated routes
3. **Never use ISR on authenticated pages** -- force-dynamic or SSR only
4. **Separate Supabase client creation** for public (anon key only) vs authenticated contexts
5. **Fix the existing 14 Supabase console errors** BEFORE adding portal auth
6. **Verify with `getUser()` on server** -- never trust `getClaims()` alone for session validation
7. **Set `Cache-Control: private, no-store`** on all authenticated responses

**Which phase should address it:** Phase 2 or 3 (whenever portal is built) -- but Phase 1 must fix existing Supabase errors first.

**Severity:** CRITICAL

**Confidence:** HIGH -- Supabase official docs explicitly document these Next.js integration pitfalls

---

## High Pitfalls

Mistakes that cause significant rework, performance degradation, or user experience problems.

---

### Pitfall 5: HomeContent.tsx "Big Bang" Refactor

**What goes wrong:** The homepage is a single 546-line `'use client'` component (`HomeContent.tsx`). The temptation is to break it up into server/client components in one big refactoring effort. This invariably introduces visual regressions, broken animations, and state management issues across a page that is the primary lead generator.

**Why it happens:**
- 546 lines of tightly coupled client-side code likely has shared state, animation orchestration, and event handlers interleaved with static content
- Extracting server components requires identifying which pieces use browser APIs, hooks, or event handlers -- easy to miss one
- Animation libraries (Framer Motion) have specific client/server boundaries that are easy to violate
- The homepage is the highest-traffic page -- any regression is immediately visible

**Consequences:** Broken homepage for hours/days. Animations stop working. Conversion rate drops. Lead capture flow breaks.

**Warning signs:**
- Multiple components crash with "useState is not allowed in server components"
- Animations that depended on shared parent state stop coordinating
- Layout shifts appear where none existed before
- Contact form or quote wizard stops submitting

**Prevention:**
1. **Screenshot the homepage at 375px, 768px, 1440px BEFORE any changes** -- this is your regression baseline
2. **Decompose incrementally** -- extract one section at a time into its own component file, keeping everything `'use client'` initially
3. **Only THEN convert individual sections** to server components where they don't need interactivity
4. **Keep the "interactive shell" pattern** -- page.tsx is a server component that composes client component islands
5. **Test the lead capture flow** (form submission, quote wizard, chatbot) after EVERY extraction step
6. **Do NOT change any visual styling during the component extraction phase** -- separate structural refactoring from visual redesign

**Which phase should address it:** Phase 1 (structural cleanup) -- but spread across multiple sub-steps, not one PR.

**Severity:** HIGH

**Confidence:** HIGH -- standard pattern for large client component decomposition

---

### Pitfall 6: Video Embedding Destroys Core Web Vitals

**What goes wrong:** Adding hero videos or background videos to a service business site tanks LCP (Largest Contentful Paint) and CLS scores. YouTube embeds alone cause CLS of 0.25+ (threshold is 0.1). Self-hosted videos without proper optimization block page rendering.

**Why it happens:**
- Video files are large and block LCP if they're the largest element
- YouTube/Vimeo iframes have no explicit dimensions by default, causing layout shift
- Autoplay videos on mobile consume bandwidth and slow initial page load
- Video loading competes with critical resources (fonts, hero images, above-fold content)

**Consequences:** Core Web Vitals fail. Google ranking drops (CWV is a ranking signal). Mobile users experience janky loading. Page speed scores plummet.

**Warning signs:**
- Lighthouse LCP exceeds 2.5 seconds after adding video
- CLS score jumps above 0.1
- Mobile PageSpeed Insights score drops below 50
- Google Search Console flags "Core Web Vitals" issues

**Prevention:**
1. **Never autoplay video above the fold on mobile** -- use a poster image with play button instead
2. **Always set explicit `width` and `height`** on video elements and iframes
3. **Use `loading="lazy"`** on videos below the fold
4. **For YouTube embeds, use lite-youtube-embed** or similar facade pattern (loads iframe only on click)
5. **Self-hosted video: use `<video preload="none">`** with poster image
6. **Measure CWV before and after** every video addition using Lighthouse
7. **Consider using `next/dynamic`** to lazy-load video components

**Which phase should address it:** Whichever phase adds video content -- include CWV testing as a gate.

**Severity:** HIGH

**Confidence:** HIGH -- well-documented performance pattern, specific CLS numbers from Vercel and web.dev

---

### Pitfall 7: Typography Overhaul Causes Layout Shift Cascade

**What goes wrong:** Changing fonts site-wide (e.g., to premium fonts like Clash Display, Satoshi) causes text to reflow, shift, and flash on every page. On a 65+ page site, this means checking every single page for visual breakage.

**Why it happens:**
- Different fonts have different metrics (x-height, character width, line height) -- even at the same CSS font-size, text occupies different space
- If fonts are not loaded via `next/font`, FOUT (Flash of Unstyled Text) or FOIT (Flash of Invisible Text) occurs
- Custom fonts from external sources (not Google Fonts) may not have `next/font` support, requiring manual `size-adjust` configuration
- Seasonal theme colors duplicated across 5+ files means font color changes must be coordinated across all of them

**Consequences:** CLS spikes across all pages. Text overlaps containers. Buttons and CTAs break layout. Every page needs visual QA.

**Warning signs:**
- Text overflows its containers after font change
- CLS scores increase across pages
- FOUT visible on page load (text flickers between fonts)
- Headings that fit on one line now wrap to two lines (or vice versa)

**Prevention:**
1. **Use `next/font` for ALL font loading** -- it eliminates FOUT/FOIT and auto-generates `size-adjust` for fallback fonts
2. **Use `next/font/local`** for premium fonts not available through `next/font/google`
3. **Test typography changes on 5 representative pages first** (homepage, a service page, contact page, blog post, pricing page) before rolling out site-wide
4. **Set explicit `line-height` and `letter-spacing`** in your design tokens -- don't rely on font defaults
5. **Consolidate seasonal theme colors** into a single source of truth BEFORE changing fonts (otherwise you're chasing changes across 5+ files)
6. **Variable fonts** are preferred -- single file, better performance, more flexibility

**Which phase should address it:** Early phase (design system setup) -- typography must be settled before building new components.

**Severity:** HIGH

**Confidence:** HIGH -- Next.js docs and Vercel blog specifically address this with `next/font`

---

### Pitfall 8: Navigation.tsx (1300 lines) Becomes the Bottleneck

**What goes wrong:** The 1300-line Navigation component is likely imported on every page. Any change to it (adding portal links, changing design, adding auth state) risks breaking the entire site. It's also likely a `'use client'` component, meaning all 1300 lines ship as client JavaScript on every page.

**Why it happens:**
- A monolithic nav component accumulates logic over time: responsive behavior, dropdown menus, scroll detection, seasonal theming, active state tracking, etc.
- Adding auth-aware navigation (show "My Portal" when logged in) adds client-side state to an already complex component
- It's the single component that appears on every page -- a bug here is a site-wide bug

**Consequences:** Breaking Navigation.tsx breaks every page simultaneously. Performance degrades because 1300 lines of JS loads on every page. Auth state in nav causes hydration mismatches.

**Warning signs:**
- Changes to Navigation.tsx cause unexpected behavior on unrelated pages
- Bundle analyzer shows Navigation as one of the largest client chunks
- Hydration warnings appear after adding auth-aware elements
- Mobile and desktop nav behaviors start conflicting

**Prevention:**
1. **Decompose BEFORE adding features** -- split into NavigationDesktop, NavigationMobile, NavLinks, NavAuth, etc.
2. **Keep nav links as a server component** -- only interactive parts (hamburger menu, dropdowns) need `'use client'`
3. **Auth-aware nav elements should be isolated** in their own client component that's dynamically imported
4. **Use Suspense boundaries** around auth-dependent nav sections to prevent blocking page render
5. **Extract nav data (links, structure)** into a config file, not hardcoded in the component

**Which phase should address it:** Phase 1 (structural cleanup) -- Navigation must be decomposed before portal or design changes.

**Severity:** HIGH

**Confidence:** HIGH -- directly observable from codebase state

---

## Moderate Pitfalls

Mistakes that cause delays, tech debt, or suboptimal results.

---

### Pitfall 9: Instant Pricing Calculator State Management Complexity

**What goes wrong:** Building a real-time pricing calculator (lawn size + services + frequency = price) seems simple but quickly becomes complex. Teams underestimate the state management, validation, edge cases (minimum lot size, service area restrictions, seasonal pricing), and the UX of showing prices that might not match what the business actually charges.

**Why it happens:**
- Pricing logic has many variables: lot size tiers, service bundles, seasonal multipliers, add-on services
- The calculator must stay in sync with actual business pricing (which changes)
- Users expect instant feedback but complex calculations may need server-side validation
- Quote wizard already exists -- the new pricing tool must not conflict with the existing flow

**Prevention:**
1. **Store pricing rules in Supabase** (not hardcoded) so the business owner can update without deployments
2. **Show price ranges, not exact prices** ("Starting at $X/month") to avoid pricing disputes
3. **Add a "Get exact quote" CTA** next to the estimate -- the calculator feeds into the lead capture, not replaces it
4. **Test with real pricing data** from the business before launch
5. **Handle the "your yard is outside our service area" case** gracefully

**Which phase should address it:** Mid-phase (after foundation is solid).

**Severity:** MODERATE

**Confidence:** MEDIUM -- based on general pricing tool patterns, not TotalGuard-specific data

---

### Pitfall 10: Animated Counter "0" Bug Pattern Repeats

**What goes wrong:** The site already has broken animated counters showing "0" on every page. This is likely an Intersection Observer or hydration issue. Adding MORE animations (border-beam, shimmer buttons, scroll-triggered reveals) without fixing the root cause will multiply this problem.

**Why it happens:**
- Counter animations typically trigger on scroll-into-view using Intersection Observer
- In `'use client'` components, SSR renders "0" and the client-side animation may never trigger if the observer setup fails
- Hydration mismatches between server-rendered "0" and client-animated value
- If the fix is applied to individual counters rather than the root cause, it will keep recurring

**Prevention:**
1. **Diagnose and fix the existing counter bug FIRST** -- understand whether it's hydration, Intersection Observer, or component lifecycle
2. **Use a single animation library consistently** (Framer Motion or one Magic UI approach, not mixing)
3. **Test all animations in both SSR and CSR modes** -- the server-rendered HTML should show a reasonable fallback
4. **Wrap animated components in `<ClientOnly>` boundaries** if they can't gracefully SSR

**Which phase should address it:** Phase 1 -- fix existing bugs before adding more animations.

**Severity:** MODERATE

**Confidence:** HIGH -- bug is directly observable in production

---

### Pitfall 11: Seasonal Theme Color Proliferation Gets Worse

**What goes wrong:** Seasonal colors are already duplicated across 5+ files. Adding a "billionaire brand" design system on top creates a third layer of design tokens (original colors, seasonal overrides, new brand colors). The result is visual inconsistency and a maintenance nightmare.

**Why it happens:**
- No single source of truth for design tokens exists
- CSS variables, Tailwind config, and inline styles may all define colors independently
- Seasonal themes (spring green, fall orange) need to work with the new premium brand palette
- Developers copy color values rather than referencing tokens

**Prevention:**
1. **Consolidate ALL colors into CSS custom properties** in a single file BEFORE the brand transformation
2. **Define seasonal variants as CSS variable overrides** on `<html>` or `<body>`, not scattered across components
3. **Create a design token mapping** that shows: base brand color -> seasonal variant -> component usage
4. **Audit all 5+ files** with duplicated colors and refactor to reference the single source

**Which phase should address it:** Phase 1 -- design token consolidation must happen before brand changes.

**Severity:** MODERATE

**Confidence:** HIGH -- directly observable from codebase state

---

### Pitfall 12: gsc-service-account.json Security Exposure

**What goes wrong:** A Google Search Console service account JSON file is committed to the repo root. This contains private keys. If the repo is public or becomes public, these credentials are exposed. Even in a private repo, this is a security anti-pattern that can lead to credential theft.

**Why it happens:**
- Service account files get added to the repo for convenience during initial setup
- `.gitignore` wasn't updated to exclude it
- It's been there long enough that no one remembers to remove it

**Prevention:**
1. **Remove from git history** using `git filter-repo` or BFG Repo Cleaner (not just deleting the file)
2. **Move credentials to environment variables** (Vercel env vars for production, `.env.local` for dev)
3. **Add `*.json` patterns for credential files to `.gitignore`**
4. **Rotate the service account key** after removing from repo (assume it's compromised)
5. **Audit for other committed secrets** while you're at it

**Which phase should address it:** Phase 1 -- security issues before any other work.

**Severity:** MODERATE (assuming private repo -- CRITICAL if public)

**Confidence:** HIGH -- directly observable security issue

---

## Minor Pitfalls

Mistakes that cause friction but are recoverable.

---

### Pitfall 13: Preview Deployment Divergence

**What goes wrong:** With 38 cron jobs and Supabase integration, preview deployments don't behave like production. Developers test features in preview, think they work, but they break in production because crons don't run in preview and the Supabase instance may differ.

**Prevention:**
1. **Document what works differently in preview vs production**
2. **Test cron-dependent features manually** by hitting endpoints with curl
3. **Use the same Supabase project for staging** or create explicit test procedures

**Which phase should address it:** Phase 1 -- documentation and testing procedures.

**Severity:** MINOR

---

### Pitfall 14: Component Library Version Conflicts

**What goes wrong:** Adding Magic UI, Aceternity UI, or shadcn/ui components to an existing site can cause version conflicts with existing dependencies (React 19, Tailwind v4, Framer Motion versions).

**Prevention:**
1. **Check compatibility with React 19 and Tailwind v4** before installing any component library
2. **Install one library at a time** and verify the build succeeds
3. **Prefer copying component source** (shadcn pattern) over adding package dependencies

**Which phase should address it:** Phase 1 -- dependency audit during setup.

**Severity:** MINOR

---

### Pitfall 15: Admin Dashboard Regression

**What goes wrong:** Refactoring shared components or utilities breaks the admin dashboard that the business relies on daily for operations. Since there are no tests, these regressions are only caught when the owner tries to use the dashboard.

**Prevention:**
1. **Identify all shared dependencies** between public site and admin dashboard
2. **Add smoke tests for admin dashboard** critical paths (login, view customers, manage services)
3. **Test admin dashboard after every refactoring PR** -- don't assume isolated changes stay isolated

**Which phase should address it:** Phase 1 -- admin dashboard protection before refactoring.

**Severity:** MINOR to MODERATE (depends on business impact)

---

## Phase-Specific Warning Summary

| Phase Topic | Likely Pitfall | Mitigation | Severity |
|---|---|---|---|
| Foundation/Safety Nets | TypeScript errors cascade when `ignoreBuildErrors` removed (#2) | Catalog errors first, fix incrementally, add smoke tests | CRITICAL |
| Foundation/Safety Nets | Cron jobs break silently (#3) | Audit all 38, add monitoring | CRITICAL |
| Foundation/Safety Nets | Security credential in repo (#12) | Remove, rotate, add to .gitignore | MODERATE |
| Component Decomposition | HomeContent.tsx big bang refactor (#5) | Incremental extraction, visual regression testing | HIGH |
| Component Decomposition | Navigation.tsx bottleneck (#8) | Decompose before adding features | HIGH |
| Design System Setup | Font change cascades across 65+ pages (#7) | Use next/font, test on representative pages first | HIGH |
| Design System Setup | Seasonal color proliferation (#11) | Consolidate tokens before brand changes | MODERATE |
| Brand Transformation | SEO regression from rendering/structure changes (#1) | Baseline SEO metrics, monitor GSC daily for 30 days | CRITICAL |
| Brand Transformation | Animated counter bug pattern repeats (#10) | Fix root cause before adding more animations | MODERATE |
| Video Integration | CWV degradation from video (#6) | Facade pattern, explicit dimensions, lazy loading | HIGH |
| Customer Portal | Auth leaking into public pages (#4) | Scope middleware, force-dynamic on auth routes | CRITICAL |
| Instant Pricing | State management underestimated (#9) | Store pricing in DB, show ranges not exact prices | MODERATE |

---

## The Meta-Pitfall: Moving Fast on a Fragile Codebase

The single biggest risk across all of these is the combination of:
- No tests (zero safety net)
- Suppressed TypeScript errors (second safety net disabled)
- Large codebase (65+ pages, many interdependencies)
- Production traffic (real customers, real revenue)
- Ambitious scope (brand transformation touching nearly everything)

**The temptation** is to start building the exciting new features (video, animations, premium design) immediately. **The discipline** is to spend the first phase exclusively on safety nets: tests, type safety, monitoring, cron audits, security fixes. Every hour spent on foundation saves 10 hours of emergency debugging later.

**Non-negotiable Phase 1 deliverables before ANY visual changes:**
1. Run `tsc --noEmit` and catalog all errors
2. Add smoke tests for top 10 pages and admin dashboard
3. Audit and document all 38 cron jobs
4. Remove committed credentials
5. Baseline SEO metrics from GSC
6. Fix the existing 14 Supabase console errors
7. Fix the broken animated counters

---

## Sources

### Official Documentation (HIGH confidence)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth Troubleshooting for Next.js](https://supabase.com/docs/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)
- [Vercel Cron Jobs Management](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [Vercel Cron Jobs Troubleshooting](https://vercel.com/kb/guide/troubleshooting-vercel-cron-jobs)
- [Next.js TypeScript Configuration](https://nextjs.org/docs/app/api-reference/config/typescript)
- [Next.js Font Optimization](https://nextjs.org/learn/dashboard-app/optimizing-fonts-images)
- [Vercel next/font Blog Post](https://vercel.com/blog/nextjs-next-font)

### Verified Third-Party Sources (MEDIUM confidence)
- [Core Web Vitals Optimization Guide](https://eastondev.com/blog/en/posts/dev/20251219-nextjs-core-web-vitals/)
- [Website Redesign SEO Checklist 2026](https://www.boralagency.com/website-redesign/)
- [Shopify: Website Redesign SEO Preservation](https://www.shopify.com/blog/website-redesign-seo)
- [Disabling TypeScript Build Checks: The Nuclear Option](https://www.codu.co/articles/disabling-typescript-build-checks-in-next-js-the-nuclear-option-vkavaqef)
- [Web Fonts and CLS (Sentry)](https://blog.sentry.io/web-fonts-and-the-dreaded-cumulative-layout-shift/)

### Community/WebSearch Sources (LOW confidence -- patterns observed but not officially verified)
- [Site Migration SEO Checklist 2025](https://webifytech.netlify.app/resources/site-migration-seo-checklist-2025)
- [RSC Best Practices 2025 Practical Guide](https://www.sachith.co.uk/react-server-components-what-to-adopt-now-best-practices-in-2025-practical-guide-mar-14-2026/)
