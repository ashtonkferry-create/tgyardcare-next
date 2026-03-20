'use client';

import { useEffect, useRef, useState } from 'react';

interface MowerCharacterProps {
  onPositionChange?: (x: number) => void;
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
  const waveTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const durationMs = traversalDuration * 1000;

    function tick(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) % durationMs;
      const progress = elapsed / durationMs;
      const x = -10 + progress * 120;
      setXPercent(x);
      onPositionChange?.(Math.max(0, Math.min(100, x)));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [traversalDuration, onPositionChange]);

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
        willChange: 'left',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 90" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="mc-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5c6a0" />
            <stop offset="100%" stopColor="#e8a878" />
          </linearGradient>
          <linearGradient id="mc-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="mc-pants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b6b5e" />
            <stop offset="100%" stopColor="#3d4a3f" />
          </linearGradient>
          <linearGradient id="mc-hat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="mc-boot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b4423" />
            <stop offset="100%" stopColor="#4a2f16" />
          </linearGradient>
          <linearGradient id="mc-mower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <radialGradient id="mc-shadow">
            <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="50" cy="88" rx="35" ry="4" fill="url(#mc-shadow)" className="mc-breathe-shadow" />

        {/* MOWER */}
        <g className="mc-mower-vibrate">
          <rect x="55" y="68" width="30" height="14" rx="3" fill="url(#mc-mower)" />
          <rect x="60" y="62" width="20" height="8" rx="2" fill="#991b1b" />
          <circle cx="82" cy="63" r="2" fill="white" opacity="0.3" className="mc-exhaust" />
          <line x1="55" y1="72" x2="42" y2="55" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          <g className="mc-wheel-spin" style={{ transformOrigin: '60px 82px' }}>
            <circle cx="60" cy="82" r="4" fill="#333" stroke="#555" strokeWidth="1" />
            <line x1="60" y1="78" x2="60" y2="86" stroke="#555" strokeWidth="0.5" />
          </g>
          <g className="mc-wheel-spin" style={{ transformOrigin: '80px 82px' }}>
            <circle cx="80" cy="82" r="4" fill="#333" stroke="#555" strokeWidth="1" />
            <line x1="80" y1="78" x2="80" y2="86" stroke="#555" strokeWidth="0.5" />
          </g>
          <g className="mc-blade-spin" style={{ transformOrigin: '70px 82px' }}>
            <line x1="62" y1="82" x2="78" y2="82" stroke="#aaa" strokeWidth="1" opacity="0.4" />
          </g>
        </g>

        {/* CHARACTER BODY */}
        <g className="mc-breathe" style={{ transformOrigin: '40px 60px' }}>
          <rect x="30" y="38" width="20" height="22" rx="4" fill="url(#mc-shirt)" />
          <rect x="32" y="40" width="6" height="12" rx="2" fill="white" opacity="0.12" />

          <g className="mc-left-leg" style={{ transformOrigin: '36px 58px' }}>
            <rect x="32" y="58" width="8" height="16" rx="3" fill="url(#mc-pants)" />
            <rect x="31" y="72" width="10" height="6" rx="2" fill="url(#mc-boot)" />
          </g>
          <g className="mc-right-leg" style={{ transformOrigin: '45px 58px' }}>
            <rect x="41" y="58" width="8" height="16" rx="3" fill="url(#mc-pants)" />
            <rect x="40" y="72" width="10" height="6" rx="2" fill="url(#mc-boot)" />
          </g>

          <g className={isWaving ? 'mc-wave-arm' : 'mc-left-arm'} style={{ transformOrigin: '27px 40px' }}>
            <rect x="24" y="40" width="7" height="16" rx="3" fill="url(#mc-shirt)" />
            <circle cx="27" cy="57" r="3" fill="url(#mc-skin)" />
          </g>
          <g className="mc-right-arm" style={{ transformOrigin: '52px 40px' }}>
            <rect x="49" y="40" width="7" height="16" rx="3" fill="url(#mc-shirt)" />
            <circle cx="52" cy="55" r="3" fill="url(#mc-skin)" />
          </g>
        </g>

        {/* HEAD */}
        <g className="mc-head-bob">
          <rect x="37" y="33" width="6" height="6" rx="2" fill="url(#mc-skin)" />
          <ellipse cx="40" cy="26" rx="12" ry="13" fill="url(#mc-skin)" />
          <circle cx="34" cy="28" r="3" fill="#f8d4b8" opacity="0.5" />

          <g className="mc-blink" style={{ transformOrigin: '40px 24px' }}>
            <ellipse cx="35" cy="24" rx="2" ry="2.5" fill="white" />
            <ellipse cx="45" cy="24" rx="2" ry="2.5" fill="white" />
            <circle cx="35" cy="24.5" r="1.2" fill="#2d1b0e" />
            <circle cx="45" cy="24.5" r="1.2" fill="#2d1b0e" />
            <circle cx="35.8" cy="23.5" r="0.5" fill="white" />
            <circle cx="45.8" cy="23.5" r="0.5" fill="white" />
          </g>

          <path
            d={isWaving ? 'M36,30 Q40,35 44,30' : 'M36,30 Q40,33 44,30'}
            fill="none"
            stroke="#8b5e3c"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          <g>
            <ellipse cx="40" cy="16" rx="14" ry="6" fill="url(#mc-hat)" />
            <rect x="28" y="14" width="24" height="6" rx="2" fill="url(#mc-hat)" />
            <rect x="25" y="18" width="30" height="3" rx="1.5" fill="#d97706" />
            <rect x="30" y="15" width="10" height="2" rx="1" fill="white" opacity="0.2" />
          </g>

          <ellipse cx="52" cy="25" rx="2.5" ry="3" fill="url(#mc-skin)" />
        </g>
      </svg>

      <style>{`
        @keyframes mc-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.015); }
        }
        .mc-breathe { animation: mc-breathe 3s ease-in-out infinite; }
        .mc-breathe-shadow { animation: mc-breathe 3s ease-in-out infinite; transform-origin: 50px 88px; }

        @keyframes mc-left-leg-walk {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes mc-right-leg-walk {
          0%, 100% { transform: rotate(8deg); }
          50% { transform: rotate(-8deg); }
        }
        .mc-left-leg { animation: mc-left-leg-walk 0.6s ease-in-out infinite; }
        .mc-right-leg { animation: mc-right-leg-walk 0.6s ease-in-out infinite; }

        @keyframes mc-arm-pump {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .mc-left-arm { animation: mc-arm-pump 0.6s ease-in-out infinite; }
        .mc-right-arm { animation: mc-arm-pump 0.6s ease-in-out infinite reverse; }

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
        .mc-wave-arm { animation: mc-wave 2s ease-in-out; }

        @keyframes mc-head-bob {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1px); }
          75% { transform: translateY(1px); }
        }
        .mc-head-bob { animation: mc-head-bob 0.6s ease-in-out infinite; }

        @keyframes mc-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .mc-blink { animation: mc-blink 4.5s ease-in-out infinite; }

        @keyframes mc-mower-vibrate {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(0.3px, -0.2px); }
          50% { transform: translate(-0.3px, 0.3px); }
          75% { transform: translate(0.2px, -0.3px); }
        }
        .mc-mower-vibrate { animation: mc-mower-vibrate 0.08s linear infinite; }

        @keyframes mc-wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mc-wheel-spin { animation: mc-wheel-spin 0.5s linear infinite; }

        @keyframes mc-blade-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mc-blade-spin { animation: mc-blade-spin 0.15s linear infinite; }

        @keyframes mc-exhaust {
          0%, 100% { opacity: 0; }
          30% { opacity: 0.3; }
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
