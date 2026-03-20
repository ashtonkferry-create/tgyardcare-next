# God-Tier Summer Hero — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Summer hero into a one-of-a-kind, living, animated experience with a cartoon mower character, interactive grass, mouse-reactive parallax, cinematic text reveals, and magnetic CTAs.

**Architecture:** 4 new components (MowerCharacter, GrassEdge, MagneticButton, useMouseParallax hook) integrated into a rewritten SummerHero. All character animation is CSS keyframes for GPU compositing. Mouse interactivity uses requestAnimationFrame with lerp smoothing. Mobile gets the character but no mouse effects.

**Tech Stack:** React 19, Framer Motion, inline SVG, CSS keyframes, existing useMagneticCursor hook

---

## Task 1: useMouseParallax Hook

**Files:**
- Create: `src/hooks/useMouseParallax.ts`

**Step 1: Create the hook**

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ParallaxState {
  x: number; // -1 to 1 (normalized mouse position)
  y: number;
}

interface UseMouseParallaxOptions {
  /** Max pixel displacement per layer multiplier */
  enabled?: boolean;
  /** Lerp smoothing factor (0-1, lower = smoother) */
  smoothing?: number;
}

/**
 * Tracks mouse position relative to a container and provides
 * normalized coordinates (-1 to 1) with lerp smoothing for
 * buttery parallax effects. Disabled on mobile/touch devices.
 */
export function useMouseParallax({
  enabled = true,
  smoothing = 0.08,
}: UseMouseParallaxOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<ParallaxState>({ x: 0, y: 0 });
  const targetRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const currentRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const isTouchRef = useRef(false);

  // Detect touch device
  useEffect(() => {
    isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Check reduced motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || isTouchRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalize to -1..1
    targetRef.current = {
      x: (e.clientX - cx) / (rect.width / 2),
      y: (e.clientY - cy) / (rect.height / 2),
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
  }, []);

  // Lerp animation loop
  useEffect(() => {
    if (!enabled || prefersReduced) return;

    function tick() {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * smoothing;
      cur.y += (tgt.y - cur.y) * smoothing;

      // Only update state when there's meaningful movement
      if (Math.abs(cur.x - tgt.x) > 0.001 || Math.abs(cur.y - tgt.y) > 0.001 ||
          Math.abs(cur.x) > 0.001 || Math.abs(cur.y) > 0.001) {
        setPosition({ x: cur.x, y: cur.y });
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, smoothing, prefersReduced]);

  // Mouse events
  useEffect(() => {
    if (!enabled || prefersReduced) return;
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, prefersReduced, handleMouseMove, handleMouseLeave]);

  /** Get transform style for a layer at given intensity (px) */
  const getLayerStyle = useCallback((intensity: number) => ({
    transform: `translate(${-position.x * intensity}px, ${-position.y * intensity}px)`,
    transition: 'none',
    willChange: 'transform' as const,
  }), [position.x, position.y]);

  /** Get 3D tilt style for hero image card */
  const getTiltStyle = useCallback((maxDeg: number = 8) => ({
    transform: `perspective(1000px) rotateY(${position.x * maxDeg}deg) rotateX(${-position.y * maxDeg}deg)`,
    transition: isTouchRef.current ? 'none' : 'transform 0.1s ease-out',
    willChange: 'transform' as const,
  }), [position.x, position.y]);

  return { containerRef, position, getLayerStyle, getTiltStyle };
}
```

**Step 2: Verify no TypeScript errors**

Run: `cd tgyardcare && npx tsc --noEmit src/hooks/useMouseParallax.ts 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/hooks/useMouseParallax.ts
git commit -m "feat: add useMouseParallax hook for multi-layer parallax + 3D tilt"
```

---

## Task 2: MagneticButton Component

**Files:**
- Create: `src/components/home/MagneticButton.tsx`
- Uses: existing `src/hooks/useMagneticCursor.ts` (already exists, radius 80px, maxDisplacement 3px)

**Step 1: Create the wrapper component**

```typescript
'use client';

import { motion } from 'framer-motion';
import { useMagneticCursor } from '@/hooks/useMagneticCursor';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Attraction radius in px */
  radius?: number;
  /** Max displacement in px */
  maxDisplacement?: number;
}

/**
 * Wraps any child element with magnetic cursor attraction.
 * The wrapper shifts toward the cursor when within radius,
 * and springs back on leave. Adds tactile press scale on click.
 */
export function MagneticButton({
  children,
  className = '',
  radius = 120,
  maxDisplacement = 8,
}: MagneticButtonProps) {
  const { ref, style, onMouseLeave } = useMagneticCursor({
    radius,
    maxDisplacement,
    enabled: true,
  });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`inline-block ${className}`}
      style={style}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/home/MagneticButton.tsx
git commit -m "feat: add MagneticButton wrapper with cursor attraction + tactile press"
```

---

## Task 3: GrassEdge Component

**Files:**
- Create: `src/components/home/GrassEdge.tsx`

**Step 1: Create the animated grass strip**

This component renders 35 SVG grass blades at the bottom of the hero. Each blade sways with wind. When the mower character's X position crosses a blade, it gets "cut" (shrinks). Blades regrow when the mower loops.

Key details:
- 35 blades, heights 22-42px, random phase offsets
- Each blade is a simple SVG `<path>` with a quadratic curve
- Wind sway: CSS `@keyframes grass-sway` with per-blade `--phase` custom property
- Cut state: blade height transitions from full to 8px via `scaleY` CSS transition
- Regrowth: `scaleY` springs back over 2s when mower loops past viewport

The component accepts a `mowerX` prop (0-100 representing % across viewport) from the parent to coordinate the cut interaction.

```typescript
'use client';

import { useMemo } from 'react';

interface GrassEdgeProps {
  /** Mower X position as 0-100 percentage of viewport width */
  mowerX: number;
  /** Whether mower is currently visible/active */
  mowerActive: boolean;
}

// Deterministic pseudo-random
function seeded(i: number, offset: number): number {
  let a = (i * 31 + offset * 7919 + 0x9e3779b9) | 0;
  a = Math.imul(a ^ (a >>> 16), 0x85ebca6b);
  a = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return ((a ^ (a >>> 16)) >>> 0) / 4294967295;
}

const BLADE_COUNT = 35;

export function GrassEdge({ mowerX, mowerActive }: GrassEdgeProps) {
  const blades = useMemo(() =>
    Array.from({ length: BLADE_COUNT }, (_, i) => ({
      x: (i / (BLADE_COUNT - 1)) * 100, // Even distribution 0-100%
      height: 22 + seeded(i, 1) * 20,    // 22-42px
      width: 6 + seeded(i, 2) * 4,       // 6-10px
      phase: seeded(i, 3) * 6.28,         // Random sway phase (0 to 2π)
      duration: 2.5 + seeded(i, 4) * 1.5, // 2.5-4s sway duration
      delay: -seeded(i, 5) * 4,           // Random start offset
      // Color: gradient from dark base to lighter tip
      baseColor: `hsl(${130 + seeded(i, 6) * 20}, ${60 + seeded(i, 7) * 20}%, ${22 + seeded(i, 8) * 8}%)`,
      tipColor: `hsl(${130 + seeded(i, 9) * 20}, ${65 + seeded(i, 10) * 20}%, ${35 + seeded(i, 11) * 10}%)`,
    })),
  []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[50px] pointer-events-none z-[15] overflow-hidden">
      <svg
        viewBox="0 0 1000 50"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          {blades.map((blade, i) => (
            <linearGradient key={`grad-${i}`} id={`grass-grad-${i}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={blade.baseColor} />
              <stop offset="100%" stopColor={blade.tipColor} />
            </linearGradient>
          ))}
        </defs>
        {blades.map((blade, i) => {
          const bx = blade.x * 10; // Scale to viewBox 0-1000
          const isCut = mowerActive && mowerX > blade.x + 2;
          const cutScale = isCut ? 0.2 : 1;

          return (
            <g
              key={i}
              style={{
                transformOrigin: `${bx}px 50px`,
                transform: `scaleY(${cutScale})`,
                transition: isCut
                  ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  : 'transform 2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <path
                d={`M${bx - blade.width / 2},50 Q${bx},${50 - blade.height * 0.3} ${bx},${50 - blade.height} Q${bx},${50 - blade.height * 0.3} ${bx + blade.width / 2},50 Z`}
                fill={`url(#grass-grad-${i})`}
                className="grass-blade-sway"
                style={{
                  '--sway-phase': `${blade.phase}rad`,
                  '--sway-duration': `${blade.duration}s`,
                  '--sway-delay': `${blade.delay}s`,
                  transformOrigin: `${bx}px 50px`,
                } as React.CSSProperties}
              />
            </g>
          );
        })}
      </svg>

      {/* Grass clipping particles — appear where mower is cutting */}
      {mowerActive && (
        <div
          className="absolute bottom-[10px] w-[30px] h-[20px]"
          style={{ left: `${mowerX}%`, transform: 'translateX(-50%)' }}
        >
          {[0, 1, 2, 3, 4].map((j) => (
            <div
              key={j}
              className="absolute bg-green-400/60 rounded-full grass-clipping"
              style={{
                width: 2 + seeded(j, 20) * 2,
                height: 2 + seeded(j, 21) * 2,
                left: `${seeded(j, 22) * 100}%`,
                '--clip-dx': `${-5 + seeded(j, 23) * 10}px`,
                '--clip-dy': `${-15 - seeded(j, 24) * 10}px`,
                animationDuration: `${0.4 + seeded(j, 25) * 0.3}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes grass-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(calc(3deg + var(--sway-phase) * 0.1)); }
          75% { transform: rotate(calc(-2deg - var(--sway-phase) * 0.08)); }
        }
        .grass-blade-sway {
          animation: grass-sway var(--sway-duration) ease-in-out infinite;
          animation-delay: var(--sway-delay);
        }

        @keyframes grass-clipping-fly {
          0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          100% { transform: translate(var(--clip-dx), var(--clip-dy)) scale(0.3); opacity: 0; }
        }
        .grass-clipping {
          animation: grass-clipping-fly ease-out infinite;
        }
      `}</style>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/home/GrassEdge.tsx
git commit -m "feat: add GrassEdge with wind sway, mower cut interaction, and clipping particles"
```

---

## Task 4: MowerCharacter Component

**Files:**
- Create: `src/components/home/MowerCharacter.tsx`

**Step 1: Create the living mower character**

This is the crown jewel. A detailed inline SVG character with:
- Dimensional gradient fills (not flat), highlight/shadow layers
- Walk cycle via CSS keyframes (legs alternate, arms pump)
- Breathing (torso scale pulse), blinking (eye close every 4-5s)
- Head bob synced to walk, weight shift forward
- Wave action every ~8s (arm lifts, head turns, smile widens)
- Mower with spinning blade, vibrating body, rotating wheels
- Grass clipping spray arc behind blade
- Traverses L→R over 20s, loops infinitely
- Exposes `onPositionChange(x: number)` callback for parent coordination

The character should be ~60-70px tall, positioned at the bottom of the hero overlapping the grass edge.

The SVG will be broken into named groups: `<g id="body">`, `<g id="left-leg">`, `<g id="right-leg">`, `<g id="left-arm">`, `<g id="right-arm">`, `<g id="head">`, `<g id="eyes">`, `<g id="mouth">`, `<g id="hat">`, `<g id="mower">`, `<g id="wheels">`, `<g id="blade">`.

Each group gets its own CSS animation class for independent motion.

```typescript
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface MowerCharacterProps {
  /** Called with X position as 0-100 percentage */
  onPositionChange?: (x: number) => void;
  /** Duration of one L→R traversal in seconds */
  traversalDuration?: number;
}

export function MowerCharacter({
  onPositionChange,
  traversalDuration = 20,
}: MowerCharacterProps) {
  const [xPercent, setXPercent] = useState(-10);
  const [isWaving, setIsWaving] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const waveTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Animation loop: move character L→R
  useEffect(() => {
    const durationMs = traversalDuration * 1000;

    function tick(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) % durationMs;
      const progress = elapsed / durationMs;
      // -10% to 110% (start offscreen left, exit offscreen right)
      const x = -10 + progress * 120;
      setXPercent(x);
      onPositionChange?.(Math.max(0, Math.min(100, x)));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [traversalDuration, onPositionChange]);

  // Wave every ~8 seconds for 2 seconds
  useEffect(() => {
    waveTimerRef.current = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, 8000);
    return () => clearInterval(waveTimerRef.current);
  }, []);

  return (
    <div
      className="absolute bottom-[18px] z-[20] pointer-events-none motion-reduce:hidden"
      style={{
        left: `${xPercent}%`,
        width: '80px',
        height: '70px',
        transition: 'none',
        willChange: 'left',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 90"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Skin gradient */}
          <linearGradient id="mc-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5c6a0" />
            <stop offset="100%" stopColor="#e8a878" />
          </linearGradient>
          {/* Shirt gradient (TotalGuard green) */}
          <linearGradient id="mc-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          {/* Pants gradient */}
          <linearGradient id="mc-pants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b6b5e" />
            <stop offset="100%" stopColor="#3d4a3f" />
          </linearGradient>
          {/* Hat gradient */}
          <linearGradient id="mc-hat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          {/* Boot gradient */}
          <linearGradient id="mc-boot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b4423" />
            <stop offset="100%" stopColor="#4a2f16" />
          </linearGradient>
          {/* Mower body */}
          <linearGradient id="mc-mower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          {/* Shadow */}
          <radialGradient id="mc-shadow">
            <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="50" cy="88" rx="35" ry="4" fill="url(#mc-shadow)" className="mc-breathe-shadow" />

        {/* === MOWER (in front of character) === */}
        <g className="mc-mower-vibrate">
          {/* Mower deck */}
          <rect x="55" y="68" width="30" height="14" rx="3" fill="url(#mc-mower)" />
          {/* Mower top / engine */}
          <rect x="60" y="62" width="20" height="8" rx="2" fill="#991b1b" />
          {/* Engine exhaust puff */}
          <circle cx="82" cy="63" r="2" fill="white" opacity="0.3" className="mc-exhaust" />
          {/* Handle bar connecting to character */}
          <line x1="55" y1="72" x2="42" y2="55" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          {/* Wheels */}
          <g className="mc-wheel-spin">
            <circle cx="60" cy="82" r="4" fill="#333" stroke="#555" strokeWidth="1" />
            <line x1="60" y1="78" x2="60" y2="86" stroke="#555" strokeWidth="0.5" />
          </g>
          <g className="mc-wheel-spin">
            <circle cx="80" cy="82" r="4" fill="#333" stroke="#555" strokeWidth="1" />
            <line x1="80" y1="78" x2="80" y2="86" stroke="#555" strokeWidth="0.5" />
          </g>
          {/* Spinning blade (under deck, visible hint) */}
          <g className="mc-blade-spin">
            <line x1="62" y1="82" x2="78" y2="82" stroke="#aaa" strokeWidth="1" opacity="0.4" />
          </g>
        </g>

        {/* === CHARACTER BODY === */}
        <g className="mc-breathe">
          {/* Body / Torso (green shirt) */}
          <rect x="30" y="38" width="20" height="22" rx="4" fill="url(#mc-shirt)" />
          {/* Shirt highlight */}
          <rect x="32" y="40" width="6" height="12" rx="2" fill="white" opacity="0.12" />

          {/* Legs */}
          <g className="mc-left-leg">
            <rect x="32" y="58" width="8" height="16" rx="3" fill="url(#mc-pants)" />
            <rect x="31" y="72" width="10" height="6" rx="2" fill="url(#mc-boot)" />
          </g>
          <g className="mc-right-leg">
            <rect x="41" y="58" width="8" height="16" rx="3" fill="url(#mc-pants)" />
            <rect x="40" y="72" width="10" height="6" rx="2" fill="url(#mc-boot)" />
          </g>

          {/* Arms */}
          <g className={isWaving ? 'mc-wave-arm' : 'mc-left-arm'}>
            {/* Left arm (near arm — the one that waves) */}
            <rect x="24" y="40" width="7" height="16" rx="3" fill="url(#mc-shirt)" />
            {/* Hand */}
            <circle cx="27" cy="57" r="3" fill="url(#mc-skin)" />
          </g>
          <g className="mc-right-arm">
            {/* Right arm (far arm — always on mower) */}
            <rect x="49" y="40" width="7" height="16" rx="3" fill="url(#mc-shirt)" />
            <circle cx="52" cy="55" r="3" fill="url(#mc-skin)" />
          </g>
        </g>

        {/* === HEAD === */}
        <g className="mc-head-bob">
          {/* Neck */}
          <rect x="37" y="33" width="6" height="6" rx="2" fill="url(#mc-skin)" />

          {/* Head */}
          <ellipse cx="40" cy="26" rx="12" ry="13" fill="url(#mc-skin)" />

          {/* Face highlight (cheek) */}
          <circle cx="34" cy="28" r="3" fill="#f8d4b8" opacity="0.5" />

          {/* Eyes */}
          <g className="mc-blink">
            <ellipse cx="35" cy="24" rx="2" ry="2.5" fill="white" />
            <ellipse cx="45" cy="24" rx="2" ry="2.5" fill="white" />
            <circle cx="35" cy="24.5" r="1.2" fill="#2d1b0e" />
            <circle cx="45" cy="24.5" r="1.2" fill="#2d1b0e" />
            {/* Eye shine */}
            <circle cx="35.8" cy="23.5" r="0.5" fill="white" />
            <circle cx="45.8" cy="23.5" r="0.5" fill="white" />
          </g>

          {/* Mouth */}
          <path
            d={isWaving ? 'M36,30 Q40,35 44,30' : 'M36,30 Q40,33 44,30'}
            fill="none"
            stroke="#8b5e3c"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Hard hat */}
          <g>
            <ellipse cx="40" cy="16" rx="14" ry="6" fill="url(#mc-hat)" />
            <rect x="28" y="14" width="24" height="6" rx="2" fill="url(#mc-hat)" />
            {/* Hat brim */}
            <rect x="25" y="18" width="30" height="3" rx="1.5" fill="#d97706" />
            {/* Hat highlight */}
            <rect x="30" y="15" width="10" height="2" rx="1" fill="white" opacity="0.2" />
          </g>

          {/* Ear */}
          <ellipse cx="52" cy="25" rx="2.5" ry="3" fill="url(#mc-skin)" />
        </g>
      </svg>

      {/* CSS Animations */}
      <style>{`
        /* Breathing — subtle torso pulse */
        @keyframes mc-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.015); }
        }
        .mc-breathe { animation: mc-breathe 3s ease-in-out infinite; transform-origin: 40px 60px; }
        .mc-breathe-shadow { animation: mc-breathe 3s ease-in-out infinite; transform-origin: 50px 88px; }

        /* Walk cycle — legs */
        @keyframes mc-left-leg-walk {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes mc-right-leg-walk {
          0%, 100% { transform: rotate(8deg); }
          50% { transform: rotate(-8deg); }
        }
        .mc-left-leg { animation: mc-left-leg-walk 0.6s ease-in-out infinite; transform-origin: 36px 58px; }
        .mc-right-leg { animation: mc-right-leg-walk 0.6s ease-in-out infinite; transform-origin: 45px 58px; }

        /* Walk cycle — arms (pumping) */
        @keyframes mc-arm-pump {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .mc-left-arm { animation: mc-arm-pump 0.6s ease-in-out infinite; transform-origin: 27px 40px; }
        .mc-right-arm { animation: mc-arm-pump 0.6s ease-in-out infinite reverse; transform-origin: 52px 40px; }

        /* Wave — overrides left arm when waving */
        @keyframes mc-wave {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-80deg); }
          25% { transform: rotate(-65deg); }
          35% { transform: rotate(-80deg); }
          45% { transform: rotate(-65deg); }
          55% { transform: rotate(-80deg); }
          70% { transform: rotate(-65deg); }
          100% { transform: rotate(0deg); }
        }
        .mc-wave-arm { animation: mc-wave 2s ease-in-out; transform-origin: 27px 40px; }

        /* Head bob — synced to walk */
        @keyframes mc-head-bob {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1px); }
          75% { transform: translateY(1px); }
        }
        .mc-head-bob { animation: mc-head-bob 0.6s ease-in-out infinite; }

        /* Blink */
        @keyframes mc-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .mc-blink { animation: mc-blink 4.5s ease-in-out infinite; transform-origin: 40px 24px; }

        /* Mower vibrate */
        @keyframes mc-mower-vibrate {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(0.3px, -0.2px); }
          50% { transform: translate(-0.3px, 0.3px); }
          75% { transform: translate(0.2px, -0.3px); }
        }
        .mc-mower-vibrate { animation: mc-mower-vibrate 0.08s linear infinite; }

        /* Wheel spin */
        @keyframes mc-wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mc-wheel-spin { animation: mc-wheel-spin 0.5s linear infinite; }
        .mc-wheel-spin:nth-child(1) { transform-origin: 60px 82px; }
        .mc-wheel-spin:nth-child(2) { transform-origin: 80px 82px; }

        /* Blade spin */
        @keyframes mc-blade-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mc-blade-spin { animation: mc-blade-spin 0.15s linear infinite; transform-origin: 70px 82px; }

        /* Exhaust puff */
        @keyframes mc-exhaust {
          0%, 100% { r: 1; opacity: 0; transform: translate(0, 0); }
          30% { r: 2.5; opacity: 0.3; transform: translate(3px, -4px); }
          100% { r: 4; opacity: 0; transform: translate(6px, -8px); }
        }
        .mc-exhaust { animation: mc-exhaust 1.5s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .mc-breathe, .mc-left-leg, .mc-right-leg, .mc-left-arm, .mc-right-arm,
          .mc-wave-arm, .mc-head-bob, .mc-blink, .mc-mower-vibrate,
          .mc-wheel-spin, .mc-blade-spin, .mc-exhaust, .mc-breathe-shadow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/home/MowerCharacter.tsx
git commit -m "feat: add living MowerCharacter with walk cycle, breathing, blinking, waving, and mower animations"
```

---

## Task 5: Rewrite SummerHero with All Systems

**Files:**
- Modify: `src/components/SummerHero.tsx` (full rewrite)
- Uses: all 4 new components + existing imports

**Step 1: Rewrite SummerHero.tsx**

Key integration points:
1. Wrap the entire section in `useMouseParallax` containerRef
2. Apply `getLayerStyle(3)` to background image, `getLayerStyle(8)` to orbs, `getLayerStyle(12)` to particles
3. Apply `getTiltStyle(8)` to hero image card
4. Replace stagger/fadeUp with word-by-word headline animation using `motion.span` per word
5. Wrap CTA buttons in `<MagneticButton>`
6. Add `<GrassEdge>` and `<MowerCharacter>` at bottom, connected via shared `mowerX` state
7. Add scroll-driven exit: `useScroll` + `useTransform` for opacity/scale/translateY on content
8. Keep all existing content (headline copy, value props, trust chips, social proof, floating cards)
9. Replace inline particle system with `<AmbientParticles density="dense" />` for consistency
10. Keep the cinematic vignette, depth gradient, and grid pattern

The word-by-word headline animation:
```tsx
const headlineWords = ['Tired', 'of', 'Lawn', 'Guys'];
const accentWords = ["Who", "Don't", 'Show', 'Up?'];

// In render:
<h1>
  {headlineWords.map((word, i) => (
    <motion.span key={word} className="inline-block mr-[0.3em]"
      initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
    >{word}</motion.span>
  ))}
  {accentWords.map((word, i) => (
    <motion.span key={word} className="inline-block mr-[0.3em] text-amber-400"
      initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        delay: 0.3 + (headlineWords.length + i) * 0.12,
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >{word}</motion.span>
  ))}
</h1>
```

Scroll exit:
```tsx
const { scrollY } = useScroll();
const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
const heroY = useTransform(scrollY, [0, 300], [0, -30]);
```

Mower/Grass coordination:
```tsx
const [mowerX, setMowerX] = useState(0);
const [mowerActive, setMowerActive] = useState(true);

// In render (at bottom of section, before closing </section>):
<GrassEdge mowerX={mowerX} mowerActive={mowerActive} />
<MowerCharacter onPositionChange={setMowerX} traversalDuration={20} />
```

**Step 2: Build and verify**

Run: `cd tgyardcare && npx next build 2>&1 | tail -5`
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/SummerHero.tsx
git commit -m "feat: god-tier SummerHero with living mower character, grass edge, parallax, text choreography, magnetic CTAs"
```

---

## Task 6: Visual QA + Polish

**Step 1: Screenshot at 3 breakpoints**

Use Playwright MCP:
- 375px (mobile) — verify character walks, no parallax, content readable
- 768px (tablet) — verify grass + character, basic parallax
- 1440px (desktop) — full experience: parallax, tilt, magnetic CTAs, all animations

**Step 2: Fix any issues**

Common things to check:
- Character not clipped by overflow:hidden
- Grass blades visible against dark background
- Text readable over parallax layers
- Mower character z-index correct (above grass, below content)
- Mobile: no horizontal scroll from character at edges
- reduced-motion: everything degrades gracefully

**Step 3: Final commit**

```bash
git add -u
git commit -m "fix: visual QA polish for god-tier summer hero"
```

---

## Dependency Graph

```
Task 1 (useMouseParallax)  ──┐
Task 2 (MagneticButton)    ──┤
Task 3 (GrassEdge)         ──┼──→ Task 5 (SummerHero rewrite) ──→ Task 6 (Visual QA)
Task 4 (MowerCharacter)    ──┘
```

Tasks 1-4 are independent and can be built in parallel. Task 5 integrates them all. Task 6 verifies.
