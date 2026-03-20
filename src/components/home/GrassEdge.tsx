'use client';

import { useMemo } from 'react';

interface GrassEdgeProps {
  mowerX: number;
  mowerActive: boolean;
}

function seeded(i: number, offset: number): number {
  let a = (i * 31 + offset * 7919 + 0x9e3779b9) | 0;
  a = Math.imul(a ^ (a >>> 16), 0x85ebca6b);
  a = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return ((a ^ (a >>> 16)) >>> 0) / 4294967295;
}

export function GrassEdge({ mowerX, mowerActive }: GrassEdgeProps) {
  // Back row: 40 taller, darker blades
  const backRow = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: (i / 39) * 100,
      h: 11 + seeded(i, 1) * 3, // 11-14px
      w: 4 + seeded(i, 2) * 2,  // 4-6px
      sway: Math.floor(seeded(i, 3) * 3), // 0, 1, or 2 — picks animation variant
    })),
  []);

  // Front row: 40 shorter, lighter blades (offset by half spacing)
  const frontRow = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: ((i + 0.5) / 40) * 100,
      h: 8 + seeded(i, 10) * 3, // 8-11px
      w: 3.5 + seeded(i, 11) * 2, // 3.5-5.5px
      sway: Math.floor(seeded(i, 12) * 3),
    })),
  []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[22px] pointer-events-none z-[15]">
      <svg
        viewBox="0 0 1000 22"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ge-back" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(132, 55%, 18%)" />
            <stop offset="100%" stopColor="hsl(134, 60%, 26%)" />
          </linearGradient>
          <linearGradient id="ge-front" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(130, 60%, 24%)" />
            <stop offset="100%" stopColor="hsl(128, 68%, 34%)" />
          </linearGradient>
          <linearGradient id="ge-cut" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(132, 45%, 14%)" />
            <stop offset="100%" stopColor="hsl(134, 50%, 18%)" />
          </linearGradient>
        </defs>

        {/* Soil base */}
        <rect x="0" y="18" width="1000" height="4" fill="hsl(25, 40%, 12%)" />

        {/* Cut strip — darker area where mower has passed */}
        {mowerActive && mowerX > 0 && (
          <rect
            x="0"
            y="14"
            width={mowerX * 10}
            height="8"
            fill="url(#ge-cut)"
            style={{ transition: 'width 0.1s linear' }}
          />
        )}

        {/* Back row blades */}
        {backRow.map((blade, i) => {
          const bx = blade.x * 10;
          return (
            <path
              key={`b-${i}`}
              d={`M${bx - blade.w / 2},18 Q${bx},${18 - blade.h * 0.4} ${bx},${18 - blade.h} Q${bx},${18 - blade.h * 0.4} ${bx + blade.w / 2},18 Z`}
              fill="url(#ge-back)"
              className={`ge-sway-${blade.sway}`}
              style={{ transformOrigin: `${bx}px 18px` }}
            />
          );
        })}

        {/* Front row blades */}
        {frontRow.map((blade, i) => {
          const bx = blade.x * 10;
          return (
            <path
              key={`f-${i}`}
              d={`M${bx - blade.w / 2},18 Q${bx},${18 - blade.h * 0.4} ${bx},${18 - blade.h} Q${bx},${18 - blade.h * 0.4} ${bx + blade.w / 2},18 Z`}
              fill="url(#ge-front)"
              className={`ge-sway-${blade.sway}`}
              style={{ transformOrigin: `${bx}px 18px` }}
            />
          );
        })}
      </svg>

      <style>{`
        @keyframes ge-sway-a {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes ge-sway-b {
          0%, 100% { transform: rotate(0.5deg); }
          50% { transform: rotate(-1deg); }
        }
        @keyframes ge-sway-c {
          0%, 100% { transform: rotate(-0.5deg); }
          50% { transform: rotate(1deg); }
        }
        .ge-sway-0 { animation: ge-sway-a 3s ease-in-out infinite; }
        .ge-sway-1 { animation: ge-sway-b 3.5s ease-in-out infinite; }
        .ge-sway-2 { animation: ge-sway-c 2.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ge-sway-0, .ge-sway-1, .ge-sway-2 { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
