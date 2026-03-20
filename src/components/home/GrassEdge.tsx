'use client';

import { useMemo } from 'react';

interface GrassEdgeProps {
  mowerX: number;
  mowerActive: boolean;
}

// Deterministic pseudo-random for consistent blade generation
function seeded(i: number, offset: number): number {
  let a = (i * 31 + offset * 7919 + 0x9e3779b9) | 0;
  a = Math.imul(a ^ (a >>> 16), 0x85ebca6b);
  a = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return ((a ^ (a >>> 16)) >>> 0) / 4294967295;
}

const VB_WIDTH = 2000;
const VB_HEIGHT = 20;

// 3 rows for depth: back (tallest/darkest), middle, front (shortest/lightest)
const ROWS = [
  { count: 140, minH: 9, maxH: 11, yBase: VB_HEIGHT, hueMin: 130, hueMax: 135, satMin: 55, satMax: 60, lightMin: 20, lightMax: 25, bladeW: 4.5 },
  { count: 150, minH: 7, maxH: 9,  yBase: VB_HEIGHT, hueMin: 130, hueMax: 135, satMin: 60, satMax: 65, lightMin: 28, lightMax: 32, bladeW: 4 },
  { count: 130, minH: 5, maxH: 7,  yBase: VB_HEIGHT, hueMin: 125, hueMax: 130, satMin: 65, satMax: 70, lightMin: 33, lightMax: 38, bladeW: 3.5 },
];

interface Blade {
  x: number;
  h: number;
  w: number;
  curve: number;
  color: string;
  swayDur: number;
  swayDelay: number;
  row: number;
}

function generateBlades(): Blade[] {
  const blades: Blade[] = [];
  ROWS.forEach((row, ri) => {
    for (let i = 0; i < row.count; i++) {
      const r = seeded(i, ri * 1000);
      const x = (i / (row.count - 1)) * VB_WIDTH;
      // Slight random x offset for natural feel (up to +/- 3px)
      const xOff = (seeded(i, ri * 1000 + 1) - 0.5) * 6;
      const h = row.minH + seeded(i, ri * 1000 + 2) * (row.maxH - row.minH);
      const hue = row.hueMin + seeded(i, ri * 1000 + 3) * (row.hueMax - row.hueMin);
      const sat = row.satMin + seeded(i, ri * 1000 + 4) * (row.satMax - row.satMin);
      const light = row.lightMin + seeded(i, ri * 1000 + 5) * (row.lightMax - row.lightMin);
      const curve = (seeded(i, ri * 1000 + 6) - 0.5) * 3; // slight lean left or right

      blades.push({
        x: Math.max(0, Math.min(VB_WIDTH, x + xOff)),
        h,
        w: row.bladeW,
        curve,
        color: `hsl(${Math.round(hue)}, ${Math.round(sat)}%, ${Math.round(light)}%)`,
        swayDur: 3 + seeded(i, ri * 1000 + 7) * 2,
        swayDelay: -(seeded(i, ri * 1000 + 8) * 5),
        row: ri,
      });
    }
  });
  return blades;
}

export function GrassEdge({ mowerX, mowerActive }: GrassEdgeProps) {
  const blades = useMemo(() => generateBlades(), []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[20px] pointer-events-none z-[15] overflow-hidden">
      <svg
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Soil/ground base strip */}
        <rect x="0" y={VB_HEIGHT - 3} width={VB_WIDTH} height="3" fill="hsl(30, 30%, 15%)" />

        {blades.map((blade, i) => {
          // Convert blade x position to percentage for mower comparison
          const bladePercent = (blade.x / VB_WIDTH) * 100;
          const isCut = mowerActive && mowerX > bladePercent + 1;
          const scale = isCut ? 0.6 : 1;

          // Blade path: a slightly curved thick blade
          const bx = blade.x;
          const by = VB_HEIGHT; // base at bottom
          const topY = by - blade.h * scale;
          const halfW = blade.w / 2;
          const cpx = bx + blade.curve; // control point x for lean

          return (
            <path
              key={i}
              d={`M${bx - halfW},${by} Q${cpx - halfW * 0.3},${topY + blade.h * 0.3} ${cpx},${topY} Q${cpx + halfW * 0.3},${topY + blade.h * 0.3} ${bx + halfW},${by} Z`}
              fill={blade.color}
              className="grass-blade-sway"
              style={{
                transformOrigin: `${bx}px ${by}px`,
                '--sway-dur': `${blade.swayDur}s`,
                '--sway-delay': `${blade.swayDelay}s`,
                transition: isCut
                  ? 'd 0.1s ease-out'
                  : 'd 3s ease-in-out',
              } as React.CSSProperties}
            />
          );
        })}
      </svg>

      {/* Grass clipping particles at mower position */}
      {mowerActive && (
        <div
          className="absolute bottom-[4px] w-[20px] h-[14px]"
          style={{ left: `${mowerX}%`, transform: 'translateX(-50%)' }}
        >
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <div
              key={j}
              className="absolute rounded-full grass-clipping"
              style={{
                width: 2 + seeded(j, 50) * 1.5,
                height: 1.5 + seeded(j, 51) * 1,
                left: `${seeded(j, 52) * 100}%`,
                backgroundColor: `hsl(${125 + seeded(j, 53) * 15}, ${55 + seeded(j, 54) * 15}%, ${30 + seeded(j, 55) * 15}%)`,
                opacity: 0.7,
                '--clip-dx': `${-4 + seeded(j, 56) * 8}px`,
                '--clip-dy': `${-6 - seeded(j, 57) * 8}px`,
                animationDuration: `${0.3 + seeded(j, 58) * 0.3}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes grass-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1.2deg); }
          75% { transform: rotate(-1deg); }
        }
        .grass-blade-sway {
          animation: grass-sway var(--sway-dur) ease-in-out infinite;
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
