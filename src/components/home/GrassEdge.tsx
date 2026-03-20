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

const BLADE_COUNT = 35;

export function GrassEdge({ mowerX, mowerActive }: GrassEdgeProps) {
  const blades = useMemo(() =>
    Array.from({ length: BLADE_COUNT }, (_, i) => ({
      x: (i / (BLADE_COUNT - 1)) * 100,
      height: 22 + seeded(i, 1) * 20,
      width: 6 + seeded(i, 2) * 4,
      phase: seeded(i, 3) * 6.28,
      duration: 2.5 + seeded(i, 4) * 1.5,
      delay: -seeded(i, 5) * 4,
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
          const bx = blade.x * 10;
          const isCut = mowerActive && mowerX > blade.x + 2;

          return (
            <g
              key={i}
              style={{
                transformOrigin: `${bx}px 50px`,
                transform: `scaleY(${isCut ? 0.2 : 1})`,
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
