# God-Tier Menu System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace current menus with cinematic spring-physics animations, glassmorphism, hover intent detection, staggered cascades, conversion intelligence, and a mobile bottom sheet — making TotalGuard's navigation feel like a $100M brand.

**Architecture:** Two new hooks (`useHoverIntent`, `useMagneticCursor`) provide reusable physics primitives. Navigation.tsx gets upgraded animation variants, glassmorphism MegaMenu, expanded Company dropdown, magnetic CTA, and full ARIA/keyboard support. MobileNavMenu.tsx is rewritten as a Framer Motion bottom sheet with spring gestures, animated sections, and persistent bottom bar.

**Tech Stack:** React 19, Framer Motion 11+, Next.js 15, Tailwind CSS v4, Lucide React icons

**Design doc:** `docs/plans/2026-03-18-god-tier-menus-design.md`

---

## Task 1: Create `useHoverIntent` Hook

**Files:**
- Create: `src/hooks/useHoverIntent.ts`

**Step 1: Create the hook**

```typescript
// src/hooks/useHoverIntent.ts
import { useRef, useCallback } from 'react';

interface UseHoverIntentOptions {
  /** Delay before onOpen fires (ms) — prevents accidental hover-throughs */
  openDelay?: number;
  /** Grace period before onClose fires (ms) — forgiveness zone */
  closeDelay?: number;
  onOpen: () => void;
  onClose: () => void;
}

export function useHoverIntent({
  openDelay = 120,
  closeDelay = 250,
  onOpen,
  onClose,
}: UseHoverIntentOptions) {
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = useRef(false);

  const handleMouseEnter = useCallback(() => {
    // Cancel any pending close
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    // If already open, no delay needed
    if (isOpen.current) return;

    // Delay open to detect intent
    openTimer.current = setTimeout(() => {
      isOpen.current = true;
      onOpen();
    }, openDelay);
  }, [openDelay, onOpen]);

  const handleMouseLeave = useCallback(() => {
    // Cancel any pending open
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }

    // Grace period before close
    closeTimer.current = setTimeout(() => {
      isOpen.current = false;
      onClose();
    }, closeDelay);
  }, [closeDelay, onClose]);

  // Cleanup function for unmount
  const cleanup = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return { handleMouseEnter, handleMouseLeave, cleanup };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useHoverIntent.ts
git commit -m "feat(hooks): add useHoverIntent — hover delay + forgiveness zone"
```

---

## Task 2: Create `useMagneticCursor` Hook

**Files:**
- Create: `src/hooks/useMagneticCursor.ts`

**Step 1: Create the hook**

```typescript
// src/hooks/useMagneticCursor.ts
import { useRef, useEffect, useCallback, useState } from 'react';

interface UseMagneticCursorOptions {
  /** Radius within which the element is attracted to cursor (px) */
  radius?: number;
  /** Maximum displacement in px */
  maxDisplacement?: number;
  /** Whether the effect is enabled */
  enabled?: boolean;
}

export function useMagneticCursor({
  radius = 80,
  maxDisplacement = 3,
  enabled = true,
}: UseMagneticCursorOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  // Check prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || !enabled || prefersReduced) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const strength = 1 - dist / radius;
        setTransform({
          x: dx * strength * (maxDisplacement / radius),
          y: dy * strength * (maxDisplacement / radius),
        });
      } else {
        setTransform({ x: 0, y: 0 });
      }
    });
  }, [enabled, radius, maxDisplacement, prefersReduced]);

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!enabled || prefersReduced) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, enabled, prefersReduced]);

  const style = {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    transition: transform.x === 0 && transform.y === 0
      ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none',
  };

  return { ref, style, onMouseLeave: handleMouseLeave };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useMagneticCursor.ts
git commit -m "feat(hooks): add useMagneticCursor — magnetic attraction physics for CTAs"
```

---

## Task 3: Upgrade Navigation.tsx — Animation Engine

**Files:**
- Modify: `src/components/Navigation.tsx:1-26` (imports + variants)
- Modify: `src/components/Navigation.tsx:663-710` (Navigation component state + hover intent)
- Modify: `src/components/Navigation.tsx:800-946` (desktop menus + CTA)

**Step 1: Replace `dropdownVariants` with spring physics + add stagger variants**

Replace lines 21-26 with:

```typescript
// Spring-based dropdown animation — snappy open, fast close
const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.96, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28,
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    filter: 'blur(2px)',
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 35,
      staggerChildren: 0.015,
      staggerDirection: -1,
    },
  },
} as Variants;

// Individual item cascade
const itemVariants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, y: -4, filter: 'blur(2px)' },
} as Variants;

// Sidebar slides in from right
const sidebarVariants = {
  hidden: { opacity: 0, x: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 350, damping: 30, delay: 0.08 },
  },
  exit: { opacity: 0, x: 10, filter: 'blur(2px)' },
} as Variants;

// Chevron spring rotation
const chevronVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180, transition: { type: 'spring', stiffness: 300, damping: 20 } },
} as Variants;
```

**Step 2: Import new hooks and wire hover intent into Navigation component**

Add to imports (line 3):
```typescript
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
```

Add after existing imports (line 19):
```typescript
import { useHoverIntent } from '@/hooks/useHoverIntent';
import { useMagneticCursor } from '@/hooks/useMagneticCursor';
```

Replace the `openResidential/openCommercial/openAbout` callbacks (lines 703-706) with hover intent wiring:

```typescript
  // Hover intent — delay open 120ms, forgiveness zone 250ms
  const residentialIntent = useHoverIntent({
    openDelay: 120,
    closeDelay: 250,
    onOpen: useCallback(() => { setCommercialOpen(false); setAboutOpen(false); setResidentialOpen(true); }, []),
    onClose: useCallback(() => setResidentialOpen(false), []),
  });

  const commercialIntent = useHoverIntent({
    openDelay: 120,
    closeDelay: 250,
    onOpen: useCallback(() => { setResidentialOpen(false); setAboutOpen(false); setCommercialOpen(true); }, []),
    onClose: useCallback(() => setCommercialOpen(false), []),
  });

  const aboutIntent = useHoverIntent({
    openDelay: 120,
    closeDelay: 250,
    onOpen: useCallback(() => { setResidentialOpen(false); setCommercialOpen(false); setAboutOpen(true); }, []),
    onClose: useCallback(() => setAboutOpen(false), []),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      residentialIntent.cleanup();
      commercialIntent.cleanup();
      aboutIntent.cleanup();
    };
  }, []);

  // Magnetic CTA
  const magneticCta = useMagneticCursor({ radius: 80, maxDisplacement: 3 });
```

**Step 3: Update dropdown triggers to use hover intent**

Replace the Residential dropdown trigger (lines 804-833):
```tsx
<div
  className="relative"
  onMouseEnter={residentialIntent.handleMouseEnter}
  onMouseLeave={residentialIntent.handleMouseLeave}
>
  <button
    className={`flex items-center text-white/90 ${t.hoverText} transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg hover:bg-white/5`}
    aria-expanded={residentialOpen}
    aria-controls="residential-mega"
  >
    Residential Services
    <motion.span variants={chevronVariants} animate={residentialOpen ? 'open' : 'closed'} className="ml-1.5 inline-flex">
      <ChevronDown className="h-4 w-4" />
    </motion.span>
  </button>

  <AnimatePresence>
    {residentialOpen && (
      <motion.div
        key="residential-mega"
        id="residential-mega"
        role="region"
        aria-labelledby="residential-trigger"
        variants={dropdownVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute top-full left-0 pt-2 z-[100]"
      >
        <MegaMenu
          columns={residentialColumns}
          sidebar={residentialSidebar}
          season={activeSeason}
          isActivePath={isActivePath}
        />
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

Apply same pattern to Commercial (lines 836-866) and Company (lines 869-918) dropdown triggers.

**Step 4: Wire magnetic CTA**

Replace the "Get a Free Quote" link (lines 940-946):
```tsx
<Link
  href="/contact"
  ref={magneticCta.ref as React.Ref<HTMLAnchorElement>}
  style={magneticCta.style}
  onMouseLeave={magneticCta.onMouseLeave}
  className={`flex items-center gap-2 bg-gradient-to-r ${t.ctaFrom} ${t.ctaTo} text-white font-bold text-sm xl:text-base px-5 xl:px-7 py-2.5 rounded-full shadow-lg ${t.ctaShadow} hover:shadow-xl ${t.ctaShadowHover} hover:scale-105 transition-all`}
>
  Get a Free Quote
  <ArrowRight className="h-4 w-4" />
</Link>
```

**Step 5: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(nav): spring physics animations, hover intent, magnetic CTA"
```

---

## Task 4: Upgrade MegaMenu — Glassmorphism, Stagger, Conversion

**Files:**
- Modify: `src/components/Navigation.tsx:427-654` (MegaMenu component)

**Step 1: Upgrade MegaMenu wrapper to glassmorphism**

Replace the outer `<div>` (line 491):
```tsx
<div className={cn(
  "w-[960px] rounded-xl shadow-2xl overflow-hidden relative",
  "backdrop-blur-xl border border-white/[0.08]",
  "bg-gradient-to-br",
  // Seasonal glass tint
  season === 'winter' ? 'from-slate-950/90 via-slate-900/85 to-blue-950/90' :
  season === 'fall' ? 'from-stone-950/90 via-stone-900/85 to-amber-950/90' :
  'from-[#0f2a1a]/90 via-[#142e1e]/85 to-[#1a3a2a]/90',
)}>
  {/* Shimmer sweep on open */}
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '200%' }}
    transition={{ duration: 0.8, ease: 'easeInOut' }}
    className={cn("absolute top-0 left-0 w-1/3 h-1 z-10", accent.barGradient, "opacity-60")}
  />
  {/* Static gradient top bar */}
  <div className={`h-px ${accent.barGradient} opacity-40`} />

  {/* Inner top-edge highlight */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
```

**Step 2: Wrap column items in `motion.div` with `itemVariants` for stagger cascade**

Inside the column items loop (around lines 523-576), wrap each `<Link>` with:
```tsx
<motion.div key={item.path + item.name} variants={itemVariants}>
  <Link ...>
    {/* existing content */}
  </Link>
</motion.div>
```

And wrap the column container in a `motion.div` with `variants`:
```tsx
<motion.div className="space-y-0.5" variants={dropdownVariants}>
  {col.items.map((item) => (
    <motion.div key={...} variants={itemVariants}>
      ...
    </motion.div>
  ))}
</motion.div>
```

**Step 3: Add inline social proof below column headers**

After each column header `<div>` (line 520), add:
```tsx
<p className="text-[10px] text-white/25 mt-1">
  ★ 4.9 · 500+ properties served
</p>
```

**Step 4: Add urgency badges to seasonal services**

In the service item render, add conditional urgency badge:
```tsx
{/* Urgency badge for seasonal services */}
{(item.path.includes('spring-cleanup') || item.path.includes('fall-cleanup') || item.path.includes('snow-removal')) && (
  <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-emerald-300/80 whitespace-nowrap">
    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
    Booking Now
  </span>
)}
```

**Step 5: Wrap sidebar in `motion.div` with `sidebarVariants`**

Replace sidebar wrapper (line 598):
```tsx
<motion.div variants={sidebarVariants} className="w-[260px] bg-white/[0.04] backdrop-blur-sm border-l border-white/[0.06] p-5 flex flex-col">
```

**Step 6: Upgrade sidebar CTA + add phone**

After the CTA button (line 629), add:
```tsx
{/* Or call */}
<p className="text-[10px] text-white/35 text-center mt-1.5">
  Or call{' '}
  <a href="tel:608-535-6057" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
    (608) 535-6057
  </a>
</p>
<p className="text-[9px] text-white/25 text-center">Same-day quotes available</p>
```

Update CTA `ctaHref` to include service param:
```tsx
// In activeSidebar computation (line 461):
ctaHref: hoveredItem ? `/contact?service=${hoveredItem.path.split('/').pop()}` : sidebar.ctaHref,
```

**Step 7: Add bottom bar with trust micro-text**

Before closing `</div>` of the mega menu (line 652):
```tsx
{/* Bottom trust bar */}
<div className="px-5 py-2 border-t border-white/[0.04] flex items-center justify-center gap-2">
  <Shield className="h-3 w-3 text-white/20" />
  <p className="text-[9px] text-white/20 tracking-wide">
    Licensed & Insured · Serving All of Dane County · Est. 2024
  </p>
</div>
```

**Step 8: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(mega-menu): glassmorphism, stagger cascade, social proof, urgency badges"
```

---

## Task 5: Upgrade Company Dropdown

**Files:**
- Modify: `src/components/Navigation.tsx:289-301` (aboutPages data)
- Modify: `src/components/Navigation.tsx:889-914` (Company dropdown content)

**Step 1: Update aboutPages data with icons and descriptions**

Replace `aboutPages` (lines 294-301):
```typescript
const aboutPages = [
  { name: "About Us", path: "/about", icon: Users, description: "Our story & mission" },
  { name: "Meet Our Team", path: "/team", icon: Users, description: "The crew behind the work" },
  { name: "Portfolio", path: "/gallery", icon: Award, description: "Before & after gallery" },
  { name: "Service Areas", path: "/service-areas", icon: TreePine, description: "Cities we serve" },
  { name: "FAQ", path: "/faq", icon: FileText, description: "Common questions" },
  { name: "Blog", path: "/blog", icon: FileText, description: "Tips & lawn care guides" },
];
```

**Step 2: Replace Company dropdown with 2-column panel**

Replace the company dropdown content (lines 889-914):
```tsx
<div className="w-[420px] backdrop-blur-xl bg-gradient-to-br from-[#1a1a1a]/90 via-[#222222]/85 to-[#1a1a1a]/90 rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden relative">
  {/* Top shimmer bar */}
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '200%' }}
    transition={{ duration: 0.8, ease: 'easeInOut' }}
    className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 z-10"
  />
  <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

  <div className="flex">
    {/* Left: Page links */}
    <motion.div className="flex-1 p-3 space-y-0.5" variants={dropdownVariants}>
      {aboutPages.map((page) => {
        const PageIcon = page.icon;
        return (
          <motion.div key={page.path} variants={itemVariants}>
            <Link
              href={page.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActivePath(page.path)
                  ? 'bg-primary/20 text-primary'
                  : 'text-white/80 hover:bg-white/[0.06] hover:translate-x-0.5'
              )}
            >
              <PageIcon className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                isActivePath(page.path) ? 'text-primary' : 'text-white/40 group-hover:text-primary'
              )} />
              <div>
                <span className={cn(
                  "block text-sm font-medium leading-tight",
                  isActivePath(page.path) ? 'text-primary font-semibold' : 'text-white/90'
                )}>
                  {page.name}
                </span>
                <span className="block text-[10px] text-white/35 group-hover:text-white/50 transition-colors">
                  {page.description}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>

    {/* Right: About card */}
    <motion.div variants={sidebarVariants} className="w-[160px] bg-white/[0.03] border-l border-white/[0.06] p-4 flex flex-col items-center text-center">
      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-2">
        <TreePine className="h-5 w-5 text-primary" />
      </div>
      <p className="text-xs font-bold text-white leading-tight">TotalGuard</p>
      <p className="text-[10px] text-white/40 mt-0.5">Yard Care</p>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[10px] text-amber-400">★★★★★</span>
        <span className="text-[10px] text-white/40">4.9</span>
      </div>
      <p className="text-[9px] text-white/30 mt-1">Madison, WI</p>
      <a
        href="tel:608-535-6057"
        className="mt-3 flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 transition-colors font-semibold"
      >
        <Phone className="h-3 w-3" />
        Call Us
      </a>
    </motion.div>
  </div>
</div>
```

**Step 3: Move "Careers" link INTO the aboutPages data (above) — remove the standalone link**

Remove the standalone Careers link (lines 920-926). Add Careers to the aboutPages array:
```typescript
{ name: "Careers", path: "/careers", icon: Award, description: "Join our growing team" },
```

**Step 4: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(nav): upgrade Company dropdown — 2-column panel with about card"
```

---

## Task 6: Keyboard Navigation & Accessibility

**Files:**
- Modify: `src/components/Navigation.tsx` (desktop menus)

**Step 1: Add keyboard handler to each dropdown trigger**

Add `onKeyDown` handler to each dropdown `<button>`:
```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
    e.preventDefault();
    // Open the menu (use the same state setter)
    setResidentialOpen(true);
    setCommercialOpen(false);
    setAboutOpen(false);
  }
  if (e.key === 'Escape') {
    setResidentialOpen(false);
    (e.currentTarget as HTMLElement).focus();
  }
}}
```

**Step 2: Add focus trap logic inside mega menu**

Add `onKeyDown` to the mega menu `<motion.div>`:
```tsx
onKeyDown={(e) => {
  if (e.key === 'Escape') {
    setResidentialOpen(false);
    // Return focus to trigger
    (document.querySelector('[aria-controls="residential-mega"]') as HTMLElement)?.focus();
  }
  // Arrow key navigation within focusable links
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const focusable = e.currentTarget.querySelectorAll<HTMLElement>('a[href]');
    const current = document.activeElement as HTMLElement;
    const idx = Array.from(focusable).indexOf(current);
    if (e.key === 'ArrowDown') {
      focusable[Math.min(idx + 1, focusable.length - 1)]?.focus();
    } else {
      focusable[Math.max(idx - 1, 0)]?.focus();
    }
  }
}}
```

**Step 3: Add reduced-motion support**

At the top of the Navigation component, add:
```tsx
const prefersReduced = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
```

Use conditional variants:
```tsx
variants={prefersReduced ? undefined : dropdownVariants}
initial={prefersReduced ? { opacity: 0 } : "hidden"}
animate={prefersReduced ? { opacity: 1 } : "visible"}
exit={prefersReduced ? { opacity: 0 } : "exit"}
```

**Step 4: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(a11y): keyboard navigation, focus traps, reduced motion support"
```

---

## Task 7: Mobile Menu Rewrite — Bottom Sheet with Spring Physics

**Files:**
- Rewrite: `src/components/MobileNavMenu.tsx`

This is the largest task. The mobile menu gets completely rewritten with:
- Framer Motion `motion.div` with `dragElastic` for bottom sheet behavior
- Spring-based `AnimatePresence` for panel entrance
- Animated section expand/collapse via `motion.div` with `layout`
- Persistent dual-button bottom bar
- Quick actions 2x2 grid with glassmorphism cards
- Auto-collapse siblings (one section open at a time)

**Step 1: Rewrite the full MobileNavMenu component**

The complete rewrite should:

1. **Imports**: Add `motion, AnimatePresence, useDragControls, PanInfo` from framer-motion
2. **Bottom sheet entrance**: `motion.div` with `initial={{ y: '100%' }}` → `animate={{ y: '15%' }}` (85% height)
3. **Drag to close**: `drag="y" dragConstraints={{ top: 0 }} dragElastic={0.1}` with `onDragEnd` velocity check
4. **Backdrop**: `motion.div` with fade + `backdrop-blur-sm`
5. **Drag handle**: centered 40px pill `bg-white/20 rounded-full`
6. **Header**: phone + close button + seasonal accent line
7. **Quick Actions**: 2x2 grid of glassmorphism cards (`backdrop-blur-md bg-white/[0.06] border border-white/[0.08]`)
   - Each card: icon + name + short description
   - Seasonal badge on seasonal services ("Booking Now")
8. **Animated sections**: Framer Motion `AnimatePresence` + `motion.div` with height animation
   - Only ONE section open at a time (auto-collapse siblings)
   - Items stagger at 25ms
   - Active category: accent left border
9. **Bottom bar**: persistent, 2 buttons
   - "Get My Free Quote" (60% width, shimmer)
   - "Call Now" (40% width, phone icon)
   - Trust signal: "⚡ Average response: 12 min"

Key structural changes:
- Replace `createPortal` with portal-mounted `AnimatePresence`
- Replace instant accordion with spring-animated sections
- Replace single CTA footer with dual-button bar
- Add `onDragEnd` handler: if `velocity.y > 300 || offset.y > 200` → close

**Step 2: Commit**

```bash
git add src/components/MobileNavMenu.tsx
git commit -m "feat(mobile): bottom sheet with spring physics, animated sections, dual CTA bar"
```

---

## Task 8: Service Item Hover Micro-interactions Upgrade

**Files:**
- Modify: `src/components/Navigation.tsx:529-574` (service item render in MegaMenu)

**Step 1: Upgrade hover effects on service items**

Replace the service item `<Link>` styling:
```tsx
<Link
  key={item.path + item.name}
  href={item.path}
  onMouseEnter={() => setHoveredItem(item)}
  onMouseLeave={() => setHoveredItem(null)}
  className={cn(
    "group flex items-start gap-2.5 py-2.5 px-2.5 -mx-2.5 rounded-lg transition-all duration-200",
    active
      ? `${accent.activeItemBg} ${accent.activeItemText}`
      : related
        ? 'bg-white/[0.07]'
        : 'hover:bg-white/[0.06]'
  )}
>
  {/* Icon with spring scale on hover */}
  <motion.div
    whileHover={{ scale: 1.15 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className="flex-shrink-0 mt-0.5"
  >
    <ItemIcon className={cn(
      "h-4 w-4 transition-colors duration-200",
      active ? accent.activeItemText :
      hoveredItem === item ? accent.iconColor :
      related ? 'text-white/60' :
      `text-white/40 ${accent.hoverText}`
    )} />
  </motion.div>
  <div className="min-w-0 flex-1">
    <span className={cn(
      "block text-sm leading-tight transition-all duration-200",
      active ? `${accent.activeItemText} font-semibold` :
      hoveredItem === item ? 'text-white font-medium tracking-wide' :
      related ? 'text-white/80 font-medium' :
      'text-white/90 font-medium'
    )}>
      {item.name}
    </span>
    <span className={cn(
      "block text-[11px] leading-tight mt-0.5 transition-colors duration-200",
      related ? 'text-white/50' : 'text-white/35 group-hover:text-white/55'
    )}>
      {item.description}
    </span>
  </div>
  {/* Arrow indicator fades in */}
  <motion.div
    initial={{ opacity: 0, x: -4 }}
    animate={hoveredItem === item ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
    transition={{ duration: 0.15 }}
    className="ml-auto mt-1 flex-shrink-0"
  >
    <ArrowRight className={`h-3 w-3 ${accent.iconColor}`} />
  </motion.div>
  {/* Active pulse dot */}
  {active && (
    <div className={`ml-auto mt-1 w-1.5 h-1.5 ${accent.pulseDot} rounded-full animate-pulse flex-shrink-0`} />
  )}
</Link>
```

**Step 2: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(mega-menu): upgraded hover micro-interactions — spring scale, arrow fade, tracking"
```

---

## Task 9: Final Integration & Push

**Files:**
- All modified files

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors.

**Step 2: Run lint**

```bash
npx next lint
```

Fix any lint errors.

**Step 3: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: resolve type and lint errors from menu overhaul"
```

**Step 4: Push**

```bash
git push origin main
```

**Step 5: Verify deployment on Vercel**

Check the Vercel deployment for build errors. Test at:
- Desktop: hover mega menus, check spring animations, glassmorphism, stagger cascade
- Mobile: test bottom sheet, drag to close, animated sections, dual CTA bar
- Keyboard: Tab through dropdown triggers, Enter to open, Escape to close, Arrow keys

---

## Execution Notes

- Tasks 1-2 are independent (hooks) — can be built in parallel
- Tasks 3-6 are sequential (each builds on previous changes to Navigation.tsx)
- Task 7 (mobile rewrite) is independent from Tasks 3-6 — can be parallelized
- Task 8 depends on Task 4 (MegaMenu upgrades)
- Task 9 is final integration

**Optimal execution order:**
1. Tasks 1 + 2 (parallel — hooks)
2. Task 3 (animation engine)
3. Tasks 4 + 7 (parallel — mega menu + mobile)
4. Task 5 (company dropdown)
5. Task 6 (a11y)
6. Task 8 (hover micro-interactions)
7. Task 9 (integration + push)
