'use client';

import { useMemo, useRef, useEffect } from 'react';

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

const BASE_Y = 16;

export function GrassEdge({ mowerX, mowerActive }: GrassEdgeProps) {
  const backRow = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: (i / 49) * 100,
      h: 10 + seeded(i, 1) * 4,
      w: 4 + seeded(i, 2) * 2.5,
      sway: Math.floor(seeded(i, 3) * 4),
    })),
  []);

  const frontRow = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: ((i + 0.5) / 50) * 100,
      h: 7 + seeded(i, 10) * 3,
      w: 3.5 + seeded(i, 11) * 2,
      sway: Math.floor(seeded(i, 12) * 4),
    })),
  []);

  // Direct DOM refs for each blade — avoids React re-renders on mowerX change
  const backRefs = useRef<(SVGPathElement | null)[]>([]);
  const frontRefs = useRef<(SVGPathElement | null)[]>([]);
  const cutStateBack = useRef<boolean[]>(new Array(50).fill(false));
  const cutStateFront = useRef<boolean[]>(new Array(50).fill(false));

  // Update blade cut state via direct DOM manipulation — no React re-render
  useEffect(() => {
    backRow.forEach((blade, i) => {
      const el = backRefs.current[i];
      if (!el) return;
      const shouldCut = mowerActive && mowerX > blade.x - 1;
      if (shouldCut !== cutStateBack.current[i]) {
        cutStateBack.current[i] = shouldCut;
        if (shouldCut) {
          el.style.transform = 'scaleY(0.35)';
          el.style.transition = 'transform 0.12s ease-out';
          el.classList.remove(`ge-sway-${blade.sway}`);
        } else {
          el.style.transform = '';
          el.style.transition = 'transform 2.5s ease-in-out';
          // Re-add sway after regrowth
          setTimeout(() => el.classList.add(`ge-sway-${blade.sway}`), 2500);
        }
      }
    });

    frontRow.forEach((blade, i) => {
      const el = frontRefs.current[i];
      if (!el) return;
      const shouldCut = mowerActive && mowerX > blade.x - 1;
      if (shouldCut !== cutStateFront.current[i]) {
        cutStateFront.current[i] = shouldCut;
        if (shouldCut) {
          el.style.transform = 'scaleY(0.3)';
          el.style.transition = 'transform 0.12s ease-out';
          el.classList.remove(`ge-sway-${blade.sway}`);
        } else {
          el.style.transform = '';
          el.style.transition = 'transform 2.5s ease-in-out';
          setTimeout(() => el.classList.add(`ge-sway-${blade.sway}`), 2500);
        }
      }
    });
  }, [mowerX, mowerActive, backRow, frontRow]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[24px] pointer-events-none z-[15]">
      <svg
        viewBox="0 0 1000 24"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ge-back" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(132, 55%, 18%)" />
            <stop offset="100%" stopColor="hsl(134, 60%, 28%)" />
          </linearGradient>
          <linearGradient id="ge-front" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(130, 60%, 24%)" />
            <stop offset="100%" stopColor="hsl(128, 68%, 36%)" />
          </linearGradient>
          <linearGradient id="ge-soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(28, 45%, 16%)" />
            <stop offset="60%" stopColor="hsl(25, 40%, 12%)" />
            <stop offset="100%" stopColor="hsl(22, 35%, 8%)" />
          </linearGradient>
        </defs>

        {/* Soil base */}
        <rect x="0" y="16" width="1000" height="8" fill="url(#ge-soil)" />

        {/* Back row — rendered once, cut state managed via refs */}
        {backRow.map((blade, i) => {
          const bx = blade.x * 10;
          return (
            <path
              key={`b-${i}`}
              ref={el => { backRefs.current[i] = el; }}
              d={`M${bx - blade.w / 2},${BASE_Y} Q${bx},${BASE_Y - blade.h * 0.4} ${bx},${BASE_Y - blade.h} Q${bx},${BASE_Y - blade.h * 0.4} ${bx + blade.w / 2},${BASE_Y} Z`}
              fill="url(#ge-back)"
              className={`ge-sway-${blade.sway}`}
              style={{ transformOrigin: `${bx}px ${BASE_Y}px` }}
            />
          );
        })}

        {/* Front row */}
        {frontRow.map((blade, i) => {
          const bx = blade.x * 10;
          return (
            <path
              key={`f-${i}`}
              ref={el => { frontRefs.current[i] = el; }}
              d={`M${bx - blade.w / 2},${BASE_Y} Q${bx},${BASE_Y - blade.h * 0.4} ${bx},${BASE_Y - blade.h} Q${bx},${BASE_Y - blade.h * 0.4} ${bx + blade.w / 2},${BASE_Y} Z`}
              fill="url(#ge-front)"
              className={`ge-sway-${blade.sway}`}
              style={{ transformOrigin: `${bx}px ${BASE_Y}px` }}
            />
          );
        })}
      </svg>

      <style>{`
        @keyframes ge-sway-a {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes ge-sway-b {
          0%, 100% { transform: rotate(0.5deg); }
          50% { transform: rotate(-1.5deg); }
        }
        @keyframes ge-sway-c {
          0%, 100% { transform: rotate(-0.5deg); }
          50% { transform: rotate(1.8deg); }
        }
        @keyframes ge-sway-d {
          0%, 100% { transform: rotate(1deg); }
          50% { transform: rotate(-2deg); }
        }
        .ge-sway-0 { animation: ge-sway-a 2.8s ease-in-out infinite; }
        .ge-sway-1 { animation: ge-sway-b 3.2s ease-in-out infinite; }
        .ge-sway-2 { animation: ge-sway-c 2.5s ease-in-out infinite; }
        .ge-sway-3 { animation: ge-sway-d 3.5s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ge-sway-0, .ge-sway-1, .ge-sway-2, .ge-sway-3 { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
