'use client';

import { useMemo } from 'react';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';

/**
 * ContactParticles — Bold, organic floating particle system for the contact section.
 *
 * Uses deterministic chaos (golden-ratio-based scattering) so dots are
 * visibly spread across the entire area with NO recognizable grid or pattern.
 * Each particle has a unique multi-waypoint drift path + opacity pulse.
 *
 * Season-adaptive: emerald (summer), amber (fall), cyan (winter).
 */

const SEASON_PALETTE = {
  summer: {
    primary: 'rgba(16,185,129,',   // emerald-500
    secondary: 'rgba(52,211,153,', // emerald-400
    tertiary: 'rgba(110,231,183,', // emerald-300
    glow: 'rgba(16,185,129,0.4)',
    ring: 'rgba(16,185,129,0.15)',
  },
  fall: {
    primary: 'rgba(245,158,11,',
    secondary: 'rgba(251,191,36,',
    tertiary: 'rgba(253,224,71,',
    glow: 'rgba(245,158,11,0.4)',
    ring: 'rgba(245,158,11,0.15)',
  },
  winter: {
    primary: 'rgba(6,182,212,',
    secondary: 'rgba(103,232,249,',
    tertiary: 'rgba(165,243,252,',
    glow: 'rgba(6,182,212,0.4)',
    ring: 'rgba(6,182,212,0.15)',
  },
} as const;

// Golden ratio scatter — spreads points with maximum visual separation
const PHI = 1.618033988749895;
const PHI2 = PHI * PHI;

function scatter(index: number, seed: number): number {
  // Weyl sequence: irrational rotation prevents repetition
  return ((index * PHI + seed * PHI2) % 1 + 1) % 1;
}

// Splitmix hash for secondary randomness
function hash(n: number): number {
  let a = (n + 0x9e3779b9) | 0;
  a = Math.imul(a ^ (a >>> 16), 0x85ebca6b);
  a = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return (a ^ (a >>> 16)) >>> 0;
}
function rand(i: number, offset: number): number {
  return (hash(i * 37 + offset * 8191) % 10000) / 10000;
}

interface ParticleConfig {
  x: number; y: number;
  size: number; opacity: number;
  color: string;
  dur: number; delay: number;
  // 4-waypoint drift path (px)
  wx1: number; wy1: number;
  wx2: number; wy2: number;
  wx3: number; wy3: number;
  wx4: number; wy4: number;
  // Opacity pulse range
  opLow: number; opHigh: number;
  blur: number;
}

interface RingConfig {
  x: number; y: number;
  dur: number; delay: number;
  maxSize: number;
  color: string;
}

export function ContactParticles({ className = '' }: { className?: string }) {
  const { activeSeason } = useSeasonalTheme();
  const palette = SEASON_PALETTE[activeSeason];

  const { particles, rings, orbs } = useMemo(() => {
    const colors = [palette.primary, palette.secondary, palette.tertiary];

    // ── PARTICLES: 22 dots, golden-ratio scattered ──
    const pCount = 22;
    const pConfigs: ParticleConfig[] = Array.from({ length: pCount }, (_, i) => {
      // Golden-ratio scatter across full area with padding
      const rawX = scatter(i, 0);
      const rawY = scatter(i, 1);
      // Map to 5%-95% range with extra jitter
      const jx = (rand(i, 50) - 0.5) * 0.08;
      const jy = (rand(i, 51) - 0.5) * 0.08;
      const x = 5 + (rawX + jx) * 90;
      const y = 3 + (rawY + jy) * 94;

      const size = 3 + rand(i, 1) * 6; // 3-9px — noticeable
      const opacity = 0.15 + rand(i, 2) * 0.25; // 0.15-0.40 — visible
      const color = colors[i % 3];

      // Unique multi-waypoint drift (wider range for visible movement)
      const spread = 40 + rand(i, 10) * 60; // 40-100px total drift range
      return {
        x, y, size, opacity, color,
        dur: 8 + rand(i, 3) * 12, // 8-20s — varied speeds
        delay: -rand(i, 4) * 15,
        wx1: (rand(i, 5) - 0.5) * spread,
        wy1: (rand(i, 6) - 0.5) * spread * 0.6,
        wx2: (rand(i, 7) - 0.5) * spread,
        wy2: (rand(i, 8) - 0.5) * spread * 0.6,
        wx3: (rand(i, 9) - 0.5) * spread,
        wy3: (rand(i, 11) - 0.5) * spread * 0.6,
        wx4: (rand(i, 12) - 0.5) * spread * 0.7,
        wy4: (rand(i, 13) - 0.5) * spread * 0.5,
        opLow: Math.max(0.05, opacity - 0.1 - rand(i, 14) * 0.1),
        opHigh: Math.min(0.5, opacity + rand(i, 15) * 0.15),
        blur: rand(i, 16) > 0.6 ? 1 : 0, // 40% chance of soft blur
      };
    });

    // ── RINGS: 3 expanding pulse rings ──
    const rConfigs: RingConfig[] = Array.from({ length: 3 }, (_, i) => ({
      x: 15 + scatter(i, 5) * 70,
      y: 10 + scatter(i, 6) * 80,
      dur: 6 + rand(i, 30) * 6, // 6-12s
      delay: -rand(i, 31) * 10,
      maxSize: 80 + rand(i, 32) * 120, // 80-200px
      color: palette.ring,
    }));

    // ── ORBS: 2 large ambient glows ──
    const oConfigs = Array.from({ length: 2 }, (_, i) => ({
      x: 20 + scatter(i, 10) * 60,
      y: 15 + scatter(i, 11) * 70,
      size: 200 + rand(i, 40) * 200,
      color: colors[i % 2],
      opacity: 0.04 + rand(i, 41) * 0.04,
      dur: 18 + rand(i, 42) * 12,
      delay: -rand(i, 43) * 20,
      dx1: (rand(i, 44) - 0.5) * 60,
      dy1: (rand(i, 45) - 0.5) * 40,
      dx2: (rand(i, 46) - 0.5) * 50,
      dy2: (rand(i, 47) - 0.5) * 35,
    }));

    return { particles: pConfigs, rings: rConfigs, orbs: oConfigs };
  }, [activeSeason, palette]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none motion-reduce:hidden ${className}`}
      aria-hidden="true"
    >
      {/* LAYER 1: Large ambient orbs (desktop) */}
      {orbs.map((orb, i) => (
        <div
          key={`co-${i}`}
          className="absolute rounded-full blur-3xl hidden md:block _cp-orb"
          style={{
            top: `${orb.y}%`,
            left: `${orb.x}%`,
            width: orb.size,
            height: orb.size,
            background: `${orb.color}${orb.opacity})`,
            animationDuration: `${orb.dur}s`,
            animationDelay: `${orb.delay}s`,
            '--odx1': `${orb.dx1}px`, '--ody1': `${orb.dy1}px`,
            '--odx2': `${orb.dx2}px`, '--ody2': `${orb.dy2}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* LAYER 2: Expanding pulse rings */}
      {rings.map((ring, i) => (
        <div
          key={`cr-${i}`}
          className="absolute rounded-full _cp-ring hidden sm:block"
          style={{
            top: `${ring.y}%`,
            left: `${ring.x}%`,
            '--ring-max': `${ring.maxSize}px`,
            '--ring-color': ring.color,
            animationDuration: `${ring.dur}s`,
            animationDelay: `${ring.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* LAYER 3: Scattered floating dots */}
      {particles.map((p, i) => (
        <div
          key={`cp-${i}`}
          className="absolute rounded-full _cp-dot"
          style={{
            top: `${p.y}%`,
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `${p.color}1)`,
            boxShadow: `0 0 ${6 + p.size}px ${p.color}${p.opacity})`,
            filter: p.blur ? 'blur(1px)' : undefined,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            '--wx1': `${p.wx1}px`, '--wy1': `${p.wy1}px`,
            '--wx2': `${p.wx2}px`, '--wy2': `${p.wy2}px`,
            '--wx3': `${p.wx3}px`, '--wy3': `${p.wy3}px`,
            '--wx4': `${p.wx4}px`, '--wy4': `${p.wy4}px`,
            '--op-lo': p.opLow, '--op-hi': p.opHigh,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        /* Orb slow drift */
        @keyframes _cp-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(var(--odx1), var(--ody1)) scale(1.08); }
          70% { transform: translate(var(--odx2), var(--ody2)) scale(0.92); }
        }
        ._cp-orb { animation: _cp-orb-drift ease-in-out infinite; }

        /* Dot 4-waypoint organic drift + opacity pulse */
        @keyframes _cp-dot-drift {
          0%, 100% {
            transform: translate(0, 0);
            opacity: var(--op-hi);
          }
          15% {
            transform: translate(var(--wx1), var(--wy1));
            opacity: var(--op-lo);
          }
          38% {
            transform: translate(var(--wx2), var(--wy2));
            opacity: var(--op-hi);
          }
          58% {
            transform: translate(var(--wx3), var(--wy3));
            opacity: var(--op-lo);
          }
          82% {
            transform: translate(var(--wx4), var(--wy4));
            opacity: var(--op-hi);
          }
        }
        ._cp-dot { animation: _cp-dot-drift ease-in-out infinite; }

        /* Expanding pulse ring */
        @keyframes _cp-ring-expand {
          0% {
            width: 0; height: 0;
            border: 1px solid var(--ring-color);
            opacity: 0.6;
            transform: translate(-50%, -50%);
          }
          80% {
            width: var(--ring-max); height: var(--ring-max);
            border: 1px solid var(--ring-color);
            opacity: 0;
            transform: translate(-50%, -50%);
          }
          100% {
            width: var(--ring-max); height: var(--ring-max);
            border: 1px solid transparent;
            opacity: 0;
            transform: translate(-50%, -50%);
          }
        }
        ._cp-ring { animation: _cp-ring-expand ease-out infinite; }
      `}</style>
    </div>
  );
}
