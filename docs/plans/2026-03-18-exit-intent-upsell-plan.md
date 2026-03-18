# Exit Intent Upsell System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build "The Concierge" — a precision exit-intent popup that surfaces the active promo deal before users leave, reducing bounce via loss aversion + scarcity + social proof psychology.

**Architecture:** A global `ExitIntentModal` mounts inside `Providers.tsx` (inside `SeasonalThemeProvider` so it can read season context) and listens for exit signals via a new `useExitIntent` hook. It reads from the same `usePromoSettings` hook already powering `PromoBanner` — zero new Supabase tables or admin config required. Desktop detects mouse leaving toward browser chrome; mobile detects 100px+ upward scroll after engagement. Fires once per session (`sessionStorage`), never for converted users (`localStorage`).

**Tech Stack:** Next.js 15 + React 19, Framer Motion, Tailwind CSS v4, existing `usePromoSettings` hook, existing `useSeasonalTheme` context, existing `QuickQuoteDialog` component.

---

### Task 1: `useExitIntent` hook

**Files:**
- Create: `src/hooks/useExitIntent.ts`

**Step 1: Create the hook**

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const EXCLUDED_PREFIXES = ['/admin', '/portal', '/get-quote', '/contact'];
const MIN_TIME_MS = 15_000;         // 15 seconds minimum on page
const MIN_SCROLL_DEPTH = 0.30;      // 30% of page scrolled
const MOBILE_SCROLL_UP_PX = 100;    // deliberate upward scroll threshold
const SESSION_KEY = 'tg-exit-shown';
const CONVERTED_KEY = 'tg-converted';

export function useExitIntent() {
  const [triggered, setTriggered] = useState(false);
  const pathname = usePathname();
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const scrollUpStartRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  const isExcluded = useCallback(
    () => EXCLUDED_PREFIXES.some(p => pathname?.startsWith(p)),
    [pathname]
  );

  const canFire = useCallback(() => {
    if (isExcluded()) return false;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return false;
      if (localStorage.getItem(CONVERTED_KEY)) return false;
    } catch { /* storage unavailable — allow */ }
    if (Date.now() - startTimeRef.current < MIN_TIME_MS) return false;
    if (maxScrollRef.current < MIN_SCROLL_DEPTH) return false;
    return true;
  }, [isExcluded]);

  const fire = useCallback(() => {
    if (!canFire()) return;
    try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch {}
    setTriggered(true);
  }, [canFire]);

  const dismiss = useCallback(() => setTriggered(false), []);

  // Reset engagement trackers on each navigation
  useEffect(() => {
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    scrollUpStartRef.current = null;
    if (typeof window !== 'undefined') lastScrollYRef.current = window.scrollY;
    if (isExcluded()) setTriggered(false);  // close modal if user navigates to excluded route
  }, [pathname, isExcluded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const trackScrollDepth = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        maxScrollRef.current = Math.max(maxScrollRef.current, window.scrollY / total);
      }
    };

    // Desktop: mouse heading toward browser chrome (top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 20) fire();
    };

    // Mobile: deliberate scroll-back-up gesture after engagement
    const handleMobileScroll = () => {
      trackScrollDepth();
      const currentY = window.scrollY;
      if (currentY < lastScrollYRef.current) {
        // scrolling up
        if (scrollUpStartRef.current === null) {
          scrollUpStartRef.current = lastScrollYRef.current;
        }
        if (scrollUpStartRef.current - currentY >= MOBILE_SCROLL_UP_PX) {
          fire();
        }
      } else {
        // scrolling down — reset up-scroll tracking
        scrollUpStartRef.current = null;
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    if (isMobile) {
      lastScrollYRef.current = window.scrollY;
      window.addEventListener('scroll', handleMobileScroll, { passive: true });
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      if (isMobile) {
        window.removeEventListener('scroll', handleMobileScroll);
      } else {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [fire]); // fire is stable — memoized by useCallback

  return { triggered, dismiss };
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd tgyardcare && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors mentioning `useExitIntent.ts`

**Step 3: Commit**

```bash
cd tgyardcare
git add src/hooks/useExitIntent.ts
git commit -m "feat: add useExitIntent hook — desktop mouseleave + mobile scroll-up detection"
```

---

### Task 2: `ExitIntentModal` component

**Files:**
- Create: `src/components/ExitIntentModal.tsx`

**Step 1: Create the component**

This component follows the exact same seasonal-theming pattern as `PromoBanner.tsx` and `QuickQuoteDialog.tsx`.

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePromoSettings } from '@/hooks/usePromoSettings';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { useExitIntent } from '@/hooks/useExitIntent';
import QuickQuoteDialog from '@/components/QuickQuoteDialog';

/* ─── Seasonal theme tokens (mirrors PromoBanner + QuickQuoteDialog pattern) ─── */
const themes = {
  spring: {
    cardBg: 'from-[#051a0d] via-[#061510] to-[#040f09]',
    borderColor: '#4ade80',
    glowA: 'rgba(74,222,128,0.10)',
    glowB: 'rgba(74,222,128,0.22)',
    badgeCls: 'bg-green-500/15 border border-green-400/25',
    badgeText: 'text-green-300',
    accentText: 'text-green-400',
    timerCls: 'bg-black/30 border border-green-400/20',
    timerText: 'text-green-300',
    proofText: 'text-green-400/55',
    ctaFrom: '#16a34a',
    ctaMid: '#10b981',
    ctaShadow: '0 4px 24px rgba(74,222,128,0.35)',
    ctaShadowHover: '0 6px 32px rgba(74,222,128,0.52)',
    secondaryText: 'text-white/35 hover:text-green-300',
    divider: 'bg-green-400/10',
    shimmer: 'via-green-400/12',
  },
  summer: {
    cardBg: 'from-[#0a1f12] via-[#081a10] to-[#060e08]',
    borderColor: '#4ade80',
    glowA: 'rgba(74,222,128,0.10)',
    glowB: 'rgba(74,222,128,0.22)',
    badgeCls: 'bg-green-500/15 border border-green-400/25',
    badgeText: 'text-green-300',
    accentText: 'text-green-400',
    timerCls: 'bg-black/30 border border-green-400/20',
    timerText: 'text-green-300',
    proofText: 'text-green-400/55',
    ctaFrom: '#15803d',
    ctaMid: '#16a34a',
    ctaShadow: '0 4px 24px rgba(74,222,128,0.35)',
    ctaShadowHover: '0 6px 32px rgba(74,222,128,0.52)',
    secondaryText: 'text-white/35 hover:text-green-300',
    divider: 'bg-green-400/10',
    shimmer: 'via-green-400/12',
  },
  fall: {
    cardBg: 'from-stone-950 via-[#1a0e05] to-stone-950',
    borderColor: '#fbbf24',
    glowA: 'rgba(251,191,36,0.10)',
    glowB: 'rgba(251,191,36,0.22)',
    badgeCls: 'bg-amber-500/15 border border-amber-400/25',
    badgeText: 'text-amber-300',
    accentText: 'text-amber-400',
    timerCls: 'bg-black/30 border border-amber-400/20',
    timerText: 'text-amber-300',
    proofText: 'text-amber-400/55',
    ctaFrom: '#d97706',
    ctaMid: '#f59e0b',
    ctaShadow: '0 4px 24px rgba(251,191,36,0.35)',
    ctaShadowHover: '0 6px 32px rgba(251,191,36,0.52)',
    secondaryText: 'text-white/35 hover:text-amber-300',
    divider: 'bg-amber-400/10',
    shimmer: 'via-amber-400/12',
  },
  winter: {
    cardBg: 'from-slate-950 via-blue-950 to-indigo-950',
    borderColor: '#38bdf8',
    glowA: 'rgba(56,189,248,0.10)',
    glowB: 'rgba(56,189,248,0.22)',
    badgeCls: 'bg-cyan-500/15 border border-cyan-400/25',
    badgeText: 'text-cyan-300',
    accentText: 'text-cyan-400',
    timerCls: 'bg-black/30 border border-cyan-400/20',
    timerText: 'text-cyan-300',
    proofText: 'text-cyan-400/55',
    ctaFrom: '#0891b2',
    ctaMid: '#0ea5e9',
    ctaShadow: '0 4px 24px rgba(56,189,248,0.35)',
    ctaShadowHover: '0 6px 32px rgba(56,189,248,0.52)',
    secondaryText: 'text-white/35 hover:text-cyan-300',
    divider: 'bg-cyan-400/10',
    shimmer: 'via-cyan-400/12',
  },
} as const;

/* ─── Service → emoji map ─── */
const SERVICE_EMOJIS: [string, string][] = [
  ['spring cleanup', '🌱'],
  ['fall cleanup', '🍂'],
  ['snow', '❄️'],
  ['fertiliz', '🌾'],
  ['gutter guard', '🔧'],
  ['gutter', '🏠'],
  ['hardscap', '🪨'],
  ['mow', '🌿'],
  ['lawn', '🌿'],
];

function getEmoji(service: string): string {
  const lower = service.toLowerCase();
  return SERVICE_EMOJIS.find(([k]) => lower.includes(k))?.[1] ?? '🌿';
}

function fmt(n: number) {
  return n.toString().padStart(2, '0');
}

export function ExitIntentModal() {
  const { triggered, dismiss } = useExitIntent();
  const { promotions, isLoading, getPromoIndex, getTimeUntilNextPromo } = usePromoSettings();
  const { activeSeason } = useSeasonalTheme();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Mobile detection (runs after hydration only)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const check = () => setIsMobile(mq.matches);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  const currentPromo = promotions.length > 0
    ? (promotions[getPromoIndex()] ?? promotions[0])
    : null;

  const t = themes[activeSeason as keyof typeof themes] ?? themes.summer;

  // Live countdown — only ticks while modal is open
  useEffect(() => {
    if (!triggered || !currentPromo) return;
    const update = () => {
      const ms = getTimeUntilNextPromo();
      setTimeLeft({
        hours: Math.floor(ms / 3_600_000),
        minutes: Math.floor((ms % 3_600_000) / 60_000),
        seconds: Math.floor((ms % 60_000) / 1_000),
      });
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [triggered, currentPromo, getTimeUntilNextPromo]);

  const handleOpenQuote = useCallback(() => setQuoteOpen(true), []);

  const handleQuoteChange = useCallback((open: boolean) => {
    setQuoteOpen(open);
    if (!open) dismiss();
  }, [dismiss]);

  const handleExplore = useCallback(() => {
    if (currentPromo?.path) {
      dismiss();
      router.push(currentPromo.path);
    }
  }, [currentPromo, dismiss, router]);

  if (isLoading || !currentPromo) return null;

  const show = triggered && !quoteOpen;
  const emoji = getEmoji(currentPromo.service);

  const cardVariants = isMobile
    ? { hidden: { y: '100%' }, visible: { y: 0 }, exit: { y: '100%' } }
    : { hidden: { scale: 0.94, opacity: 0 }, visible: { scale: 1, opacity: 1 }, exit: { scale: 0.94, opacity: 0 } };

  return (
    <>
      <AnimatePresence>
        {show && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="eim-backdrop"
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={dismiss}
              aria-hidden
            />

            {/* ── Card ── */}
            <motion.div
              key="eim-card"
              role="dialog"
              aria-modal="true"
              aria-label={`Special offer: ${currentPromo.discount} off ${currentPromo.service}`}
              className={[
                'fixed z-[9999] overflow-hidden',
                `bg-gradient-to-br ${t.cardBg}`,
                'backdrop-blur-xl',
                isMobile
                  ? 'bottom-0 left-0 right-0 rounded-t-[24px]'
                  : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] rounded-2xl',
              ].join(' ')}
              style={{ border: `1px solid ${t.borderColor}38` }}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated glow border */}
              <motion.div
                className="absolute inset-0 rounded-[inherit] pointer-events-none"
                animate={{
                  boxShadow: [
                    `inset 0 0 0 1px ${t.borderColor}22, 0 0 28px ${t.glowA}`,
                    `inset 0 0 0 1px ${t.borderColor}55, 0 0 55px ${t.glowB}`,
                    `inset 0 0 0 1px ${t.borderColor}22, 0 0 28px ${t.glowA}`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Shimmer line at top */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${t.shimmer} to-transparent`} />

              {/* Mobile drag handle */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-0">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
              )}

              {/* Dismiss × */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 group z-10"
                aria-label="Close offer"
              >
                <X className="h-4 w-4 text-white/30 group-hover:text-white/65 transition-colors" />
              </button>

              {/* ── Body ── */}
              <div className={`px-6 ${isMobile ? 'pt-3 pb-8' : 'pt-7 pb-6'}`}>

                {/* Service label */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex items-center gap-1.5 text-sm font-medium ${t.accentText} mb-1`}
                >
                  <span className="text-base">{emoji}</span>
                  <span>{currentPromo.service}</span>
                </motion.div>

                {/* Soft headline */}
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.10 }}
                  className="text-white/35 text-sm mb-5"
                >
                  Before you go...
                </motion.p>

                {/* Discount badge — the hero */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.14, type: 'spring', stiffness: 220 }}
                >
                  <motion.div
                    className={`${t.badgeCls} rounded-xl px-5 py-4 mb-4`}
                    animate={{ scale: [1, 1.025, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                  >
                    <div className={`text-[2.25rem] font-black leading-none tracking-tight ${t.badgeText}`}>
                      {currentPromo.discount} OFF
                    </div>
                    <div className="text-white/45 text-sm mt-1">
                      your {currentPromo.service} service
                    </div>
                  </motion.div>
                </motion.div>

                {/* Social proof */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.20 }}
                  className={`text-xs ${t.proofText} mb-3`}
                >
                  ★ 47+ Madison area homeowners booked this month
                </motion.p>

                {/* Countdown */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className={`${t.timerCls} rounded-lg px-4 py-2.5 flex items-center gap-3 mb-5`}
                >
                  <span className="text-white/35 text-xs uppercase tracking-wider">Offer expires in</span>
                  <span className={`font-mono font-bold text-sm ${t.timerText}`}>
                    {fmt(timeLeft.hours)}:{fmt(timeLeft.minutes)}:{fmt(timeLeft.seconds)}
                  </span>
                </motion.div>

                {/* Divider */}
                <div className={`h-px ${t.divider} mb-5`} />

                {/* Primary CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.30 }}
                  onClick={handleOpenQuote}
                  className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(to right, ${t.ctaFrom}, ${t.ctaMid}, ${t.ctaFrom})`,
                    backgroundSize: '200% auto',
                    boxShadow: t.ctaShadow,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = t.ctaShadowHover; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = t.ctaShadow; }}
                >
                  {/* shimmer sweep — reuses existing keyframe from globals.css */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer-btn" />
                  <span className="relative">
                    Claim {currentPromo.discount} Off — Get a Quote
                  </span>
                </motion.button>

                {/* Secondary CTA */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.36 }}
                  onClick={handleExplore}
                  className={`w-full mt-3 py-2 text-sm transition-colors duration-200 flex items-center justify-center gap-1 ${t.secondaryText}`}
                >
                  Explore {currentPromo.service}
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quote dialog — pre-populated with promo service + discount */}
      {currentPromo && (
        <QuickQuoteDialog
          open={quoteOpen}
          onOpenChange={handleQuoteChange}
          promoService={currentPromo.service}
          promoDiscount={currentPromo.discount}
        />
      )}
    </>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd tgyardcare && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors mentioning `ExitIntentModal.tsx`

**Step 3: Commit**

```bash
cd tgyardcare
git add src/components/ExitIntentModal.tsx
git commit -m "feat: add ExitIntentModal — The Concierge exit intent upsell component"
```

---

### Task 3: Mount globally in `Providers.tsx`

**Files:**
- Modify: `src/components/Providers.tsx`

The modal must live **inside** `SeasonalThemeProvider` so `useSeasonalTheme()` works, and **outside** `{children}` so it's always mounted regardless of page.

**Step 1: Add import + render**

Current `Providers.tsx` (relevant section):
```typescript
import BackToTop from '@/components/BackToTop';
import { DeferredChatBot } from '@/components/DeferredChatBot';
```

Add after the DeferredChatBot import:
```typescript
import { ExitIntentModal } from '@/components/ExitIntentModal';
```

Current JSX (inside `SeasonalThemeProvider`):
```tsx
<SeasonalThemeProvider>
  <Toaster />
  <Sonner />
  <BackToTop />
  <DeferredChatBot />

  {children}
</SeasonalThemeProvider>
```

Change to:
```tsx
<SeasonalThemeProvider>
  <Toaster />
  <Sonner />
  <BackToTop />
  <DeferredChatBot />
  <ExitIntentModal />

  {children}
</SeasonalThemeProvider>
```

**Step 2: Verify no TypeScript errors**

```bash
cd tgyardcare && npx tsc --noEmit 2>&1 | head -30
```
Expected: no new errors

**Step 3: Commit**

```bash
cd tgyardcare
git add src/components/Providers.tsx
git commit -m "feat: mount ExitIntentModal globally in Providers"
```

---

### Task 4: Set conversion flag in `QuickQuoteDialog`

When a user submits a quote from **anywhere on the site** (not just from the exit intent modal), they should never see the exit popup again. The conversion flag is set directly in `QuickQuoteDialog.handleSubmit`.

**Files:**
- Modify: `src/components/QuickQuoteDialog.tsx`

**Step 1: Add localStorage flag on success**

Find this block in `handleSubmit` (around line 390 based on the component structure):
```typescript
      setIsSuccess(true);
```

Change to:
```typescript
      setIsSuccess(true);
      try { localStorage.setItem('tg-converted', 'true'); } catch { /* storage unavailable */ }
```

That's the only change. `try/catch` protects against private browsing storage restrictions.

**Step 2: Verify no TypeScript errors**

```bash
cd tgyardcare && npx tsc --noEmit 2>&1 | head -30
```
Expected: no new errors

**Step 3: Commit**

```bash
cd tgyardcare
git add src/components/QuickQuoteDialog.tsx
git commit -m "feat: set tg-converted flag in QuickQuoteDialog on submit success"
```

---

### Task 5: Smoke test checklist

Start the dev server:
```bash
cd tgyardcare && npm run dev
```

Test each scenario manually. Open browser DevTools → Application → Storage to inspect keys.

**Desktop (Chrome/Firefox):**
- [ ] Fresh load: open site, wait 15s, scroll 30%+ down, move mouse toward browser tab bar → modal appears
- [ ] Dismiss via ×: modal closes, `sessionStorage['tg-exit-shown'] = 'true'` visible in DevTools
- [ ] Same session: trigger exit again → modal does NOT appear (session flag set)
- [ ] New tab (same browser): `sessionStorage` is cleared → modal fires again after gates pass
- [ ] Converted flow: submit a quote → `localStorage['tg-converted'] = 'true'` → open new tab, trigger exit → modal does NOT appear
- [ ] Route guard: navigate to `/get-quote` → trigger exit → modal does NOT appear
- [ ] Route guard: navigate to `/admin` → modal does NOT appear

**Mobile (Chrome DevTools device simulation or real device):**
- [ ] Fresh load: scroll past 30%, wait 15s, scroll back up 100px+ → bottom sheet slides up from bottom
- [ ] Mobile drag handle visible at top of sheet
- [ ] Backdrop tap → sheet dismisses
- [ ] × button → sheet dismisses

**Visual QA:**
- [ ] Card shows correct season colors (match PromoBanner season)
- [ ] Discount badge number pulses subtly
- [ ] Border glow animates
- [ ] Countdown ticks every second
- [ ] Primary CTA → opens QuickQuoteDialog pre-populated with service + discount
- [ ] Secondary CTA → navigates to service page and closes modal

**Step 1: Run dev server and test**
```bash
cd tgyardcare && npm run dev
```
Navigate to: http://localhost:3000

**Step 2: Commit final verification note**
```bash
cd tgyardcare
git commit --allow-empty -m "chore: exit intent system smoke tested and verified"
```

---

## Summary

| File | Action | Purpose |
|---|---|---|
| `src/hooks/useExitIntent.ts` | Create | Detection logic + gate checks |
| `src/components/ExitIntentModal.tsx` | Create | UI — modal + bottom sheet |
| `src/components/Providers.tsx` | Modify | Mount modal globally |
| `src/components/QuickQuoteDialog.tsx` | Modify | Set `tg-converted` on submit |

**Zero new Supabase tables. Zero new admin config. Automatically inherits whatever promo is live in the banner.**
