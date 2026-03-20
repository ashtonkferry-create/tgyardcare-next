'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface MowerCharacterProps {
  onPositionChange?: (x: number) => void;
  traversalDuration?: number;
}

export function MowerCharacter({
  onPositionChange,
  traversalDuration = 18,
}: MowerCharacterProps) {
  const [xPercent, setXPercent] = useState(-10);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleOpacity, setBubbleOpacity] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bubbleFadeRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastCycleRef = useRef<number>(-1);

  // Speech bubble lifecycle per traversal cycle
  const triggerBubble = useCallback(() => {
    setShowBubble(true);
    setBubbleOpacity(1);
    // Hold for 4 seconds then fade
    bubbleFadeRef.current = setTimeout(() => {
      setBubbleOpacity(0);
      setTimeout(() => setShowBubble(false), 500);
    }, 4000);
  }, []);

  useEffect(() => {
    const durationMs = traversalDuration * 1000;

    function tick(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) % durationMs;
      const progress = elapsed / durationMs;
      const x = -10 + progress * 120;
      setXPercent(x);
      onPositionChange?.(Math.max(0, Math.min(100, x)));

      // Detect new cycle for speech bubble
      const currentCycle = Math.floor((timestamp - startTimeRef.current) / durationMs);
      if (currentCycle !== lastCycleRef.current) {
        lastCycleRef.current = currentCycle;
        // Trigger bubble 2 seconds into each cycle
        clearTimeout(bubbleTimerRef.current);
        clearTimeout(bubbleFadeRef.current);
        setShowBubble(false);
        setBubbleOpacity(0);
        bubbleTimerRef.current = setTimeout(triggerBubble, 2000);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(bubbleTimerRef.current);
      clearTimeout(bubbleFadeRef.current);
    };
  }, [traversalDuration, onPositionChange, triggerBubble]);

  return (
    <div
      className="absolute bottom-[18px] z-[20] pointer-events-none motion-reduce:hidden"
      style={{
        left: `${xPercent}%`,
        width: '90px',
        height: '80px',
        willChange: 'left',
      }}
      aria-hidden="true"
    >
      {/* Speech Bubble */}
      {showBubble && (
        <div
          className="mc-bubble-pop"
          style={{
            position: 'absolute',
            top: '-52px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: bubbleOpacity,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <svg width="140" height="48" viewBox="0 0 140 48" style={{ overflow: 'visible' }}>
            <defs>
              <filter id="mc-bubble-shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
              </filter>
            </defs>
            {/* Bubble body */}
            <path
              d="M10,4 Q4,4 4,12 L4,30 Q4,38 12,38 L58,38 L70,46 L74,38 L128,38 Q136,38 136,30 L136,12 Q136,4 128,4 Z"
              fill="white"
              stroke="#e0e0e0"
              strokeWidth="1"
              filter="url(#mc-bubble-shadow)"
            />
            {/* Text */}
            <text
              x="70"
              y="24"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#1a5c2a"
              fontSize="9.5"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="700"
            >
              Welcome to TotalGuard!
            </text>
          </svg>
        </div>
      )}

      <svg viewBox="0 0 120 100" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          {/* Skin gradients */}
          <linearGradient id="mc2-skin" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fdd9b5" />
            <stop offset="50%" stopColor="#f5c6a0" />
            <stop offset="100%" stopColor="#e8a878" />
          </linearGradient>
          <radialGradient id="mc2-cheek" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#f8a0a0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f8a0a0" stopOpacity="0" />
          </radialGradient>

          {/* Green shirt */}
          <linearGradient id="mc2-shirt" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#34d058" />
            <stop offset="40%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="mc2-shirt-sleeve" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2ebd54" />
            <stop offset="100%" stopColor="#18944a" />
          </linearGradient>

          {/* Green pants */}
          <linearGradient id="mc2-pants" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#2d6a3e" />
            <stop offset="100%" stopColor="#1a4028" />
          </linearGradient>

          {/* Amber hard hat */}
          <linearGradient id="mc2-hat" x1="0.1" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="mc2-hat-brim" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#e8960a" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="mc2-hat-shine" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Brown boots */}
          <linearGradient id="mc2-boot" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#8b5e3c" />
            <stop offset="50%" stopColor="#6b4423" />
            <stop offset="100%" stopColor="#4a2f16" />
          </linearGradient>
          <linearGradient id="mc2-boot-sole" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2914" />
            <stop offset="100%" stopColor="#2a1d0e" />
          </linearGradient>

          {/* Red mower */}
          <linearGradient id="mc2-mower" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="mc2-mower-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="mc2-handle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#888" />
            <stop offset="100%" stopColor="#555" />
          </linearGradient>

          {/* Wheel */}
          <radialGradient id="mc2-wheel" cx="0.4" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#555" />
            <stop offset="100%" stopColor="#222" />
          </radialGradient>

          {/* Ground shadow */}
          <radialGradient id="mc2-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Character drop shadow */}
          <filter id="mc2-char-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
          </filter>

          {/* Hair */}
          <linearGradient id="mc2-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5c3a1e" />
            <stop offset="100%" stopColor="#3d2614" />
          </linearGradient>

          {/* Grass clipping */}
          <linearGradient id="mc2-grass-clip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="60" cy="96" rx="42" ry="4" fill="url(#mc2-shadow)" className="mc2-breathe-shadow" />

        {/* === GRASS CLIPPINGS spraying behind mower === */}
        <g className="mc2-grass-spray">
          <path d="M88,86 L91,80 L89,86" fill="#4ade80" opacity="0.7" className="mc2-clip1" />
          <path d="M90,88 L94,82 L91,87" fill="#22c55e" opacity="0.6" className="mc2-clip2" />
          <path d="M86,87 L90,83 L88,88" fill="#86efac" opacity="0.5" className="mc2-clip3" />
          <path d="M92,85 L96,79 L93,84" fill="#4ade80" opacity="0.6" className="mc2-clip4" />
          <path d="M87,84 L92,78 L89,83" fill="#bbf7d0" opacity="0.4" className="mc2-clip5" />
          <path d="M91,90 L95,84 L92,89" fill="#22c55e" opacity="0.5" className="mc2-clip6" />
        </g>

        {/* === RED PUSH MOWER === */}
        <g className="mc2-mower-vibrate">
          {/* Mower body - organic curved shape */}
          <path
            d="M62,76 C62,72 64,69 68,69 L84,69 C88,69 90,72 90,76 L90,82 C90,85 88,87 84,87 L68,87 C64,87 62,85 62,82 Z"
            fill="url(#mc2-mower)"
          />
          {/* Mower top engine housing */}
          <path
            d="M66,69 C66,65 68,63 71,63 L81,63 C84,63 86,65 86,69"
            fill="url(#mc2-mower-top)"
          />
          {/* Engine cap */}
          <ellipse cx="76" cy="63" rx="6" ry="2" fill="#991b1b" />
          {/* Shine on mower body */}
          <path
            d="M64,74 C64,72 66,71 68,71 L74,71 C74,73 72,75 68,75 Z"
            fill="white"
            opacity="0.15"
          />
          {/* Exhaust puff */}
          <circle cx="87" cy="64" r="1.5" fill="white" opacity="0.2" className="mc2-exhaust1" />
          <circle cx="90" cy="62" r="1" fill="white" opacity="0.15" className="mc2-exhaust2" />

          {/* Handle - curves from mower to character's hand */}
          <path
            d="M64,75 C58,72 52,64 48,58"
            fill="none"
            stroke="url(#mc2-handle)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Handle grip */}
          <path
            d="M47,56 C46,55 46,57 48,59"
            fill="none"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Front wheel */}
          <g className="mc2-wheel-spin" style={{ transformOrigin: '84px 90px' }}>
            <circle cx="84" cy="90" r="4.5" fill="url(#mc2-wheel)" />
            <circle cx="84" cy="90" r="3" fill="none" stroke="#444" strokeWidth="0.5" />
            <circle cx="84" cy="90" r="1" fill="#666" />
            {/* Spokes */}
            <line x1="84" y1="86" x2="84" y2="94" stroke="#444" strokeWidth="0.6" />
            <line x1="80" y1="90" x2="88" y2="90" stroke="#444" strokeWidth="0.6" />
          </g>

          {/* Rear wheel */}
          <g className="mc2-wheel-spin" style={{ transformOrigin: '68px 90px' }}>
            <circle cx="68" cy="90" r="4.5" fill="url(#mc2-wheel)" />
            <circle cx="68" cy="90" r="3" fill="none" stroke="#444" strokeWidth="0.5" />
            <circle cx="68" cy="90" r="1" fill="#666" />
            <line x1="68" y1="86" x2="68" y2="94" stroke="#444" strokeWidth="0.6" />
            <line x1="64" y1="90" x2="72" y2="90" stroke="#444" strokeWidth="0.6" />
          </g>
        </g>

        {/* === CHARACTER === */}
        <g filter="url(#mc2-char-shadow)">
          {/* BODY + TORSO with breathing */}
          <g className="mc2-breathe" style={{ transformOrigin: '40px 65px' }}>
            {/* Torso - curved organic shape */}
            <path
              d="M30,44 C30,42 32,40 36,39 L44,39 C48,40 50,42 50,44 L50,60 C50,63 48,64 44,64 L36,64 C32,64 30,63 30,60 Z"
              fill="url(#mc2-shirt)"
            />
            {/* Shirt collar */}
            <path
              d="M36,39 C38,42 42,42 44,39"
              fill="none"
              stroke="#15803d"
              strokeWidth="1"
            />
            {/* Shirt highlight */}
            <path
              d="M32,43 C32,42 34,41 36,42 L36,52 C34,52 32,50 32,48 Z"
              fill="white"
              opacity="0.1"
            />
            {/* TG Logo on chest */}
            <text
              x="40"
              y="52"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="5.5"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              opacity="0.85"
            >
              TG
            </text>

            {/* === LEFT LEG (front leg in walk) === */}
            <g className="mc2-left-leg" style={{ transformOrigin: '37px 63px' }}>
              {/* Thigh + shin - curved */}
              <path
                d="M34,62 C33,62 32,64 32,66 L32,76 C32,78 33,79 35,79 L39,79 C41,79 42,78 42,76 L42,66 C42,64 41,62 40,62 Z"
                fill="url(#mc2-pants)"
              />
              {/* Boot */}
              <path
                d="M31,77 C31,76 32,75 34,75 L40,75 C42,75 43,76 43,77 L43,80 C43,81 42,82 40,82 L29,82 C28,82 27,81 28,80 Z"
                fill="url(#mc2-boot)"
              />
              {/* Boot sole */}
              <path
                d="M28,81 L43,81 C43,82.5 42,83 40,83 L29,83 C28,83 27,82.5 28,81 Z"
                fill="url(#mc2-boot-sole)"
              />
              {/* Boot shine */}
              <path
                d="M33,76 C33,76 35,76 35,78"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </g>

            {/* === RIGHT LEG (back leg in walk) === */}
            <g className="mc2-right-leg" style={{ transformOrigin: '43px 63px' }}>
              <path
                d="M38,62 C37,62 36,64 36,66 L36,76 C36,78 37,79 39,79 L43,79 C45,79 46,78 46,76 L46,66 C46,64 45,62 44,62 Z"
                fill="url(#mc2-pants)"
              />
              <path
                d="M35,77 C35,76 36,75 38,75 L44,75 C46,75 47,76 47,77 L47,80 C47,81 46,82 44,82 L33,82 C32,82 31,81 32,80 Z"
                fill="url(#mc2-boot)"
              />
              <path
                d="M32,81 L47,81 C47,82.5 46,83 44,83 L33,83 C32,83 31,82.5 32,81 Z"
                fill="url(#mc2-boot-sole)"
              />
            </g>

            {/* === LEFT ARM (swinging arm) === */}
            <g className="mc2-left-arm" style={{ transformOrigin: '30px 43px' }}>
              {/* Sleeve */}
              <path
                d="M28,41 C26,41 24,43 24,45 L24,48 C24,50 26,51 28,51 L32,51 C32,49 32,43 30,41 Z"
                fill="url(#mc2-shirt-sleeve)"
              />
              {/* Forearm */}
              <path
                d="M25,50 C24,50 23,52 23,54 L23,58 C23,60 24,61 26,61 L29,61 C31,61 31,60 31,58 L31,54 C31,52 30,50 29,50 Z"
                fill="url(#mc2-skin)"
              />
              {/* Hand */}
              <path
                d="M24,59 C23,60 23,62 25,63 C27,64 29,63 30,62 C31,61 31,59 29,59 Z"
                fill="url(#mc2-skin)"
              />
            </g>

            {/* === RIGHT ARM (on mower handle) === */}
            <g className="mc2-right-arm-mower" style={{ transformOrigin: '50px 43px' }}>
              {/* Sleeve */}
              <path
                d="M48,41 C50,41 52,43 52,45 L52,48 C52,50 50,51 48,51 L46,51 C46,49 47,43 48,41 Z"
                fill="url(#mc2-shirt-sleeve)"
              />
              {/* Forearm reaching toward handle */}
              <path
                d="M48,50 C50,50 51,51 51,53 L50,57 C49,58 48,58 47,57 L46,53 C46,51 47,50 48,50 Z"
                fill="url(#mc2-skin)"
              />
              {/* Hand gripping handle */}
              <path
                d="M46,56 C45,57 46,59 48,59 C50,59 51,58 50,56 Z"
                fill="url(#mc2-skin)"
              />
            </g>
          </g>

          {/* === HEAD (with bob) === */}
          <g className="mc2-head-bob">
            {/* Neck */}
            <path
              d="M37,38 C37,36 39,35 40,35 C41,35 43,36 43,38 L43,41 L37,41 Z"
              fill="url(#mc2-skin)"
            />

            {/* Head - rounded organic shape */}
            <path
              d="M28,26 C28,17 33,12 40,12 C47,12 52,17 52,26 C52,33 48,37 40,37 C32,37 28,33 28,26 Z"
              fill="url(#mc2-skin)"
            />

            {/* Left cheek blush */}
            <circle cx="32" cy="29" r="3" fill="url(#mc2-cheek)" />
            {/* Right cheek blush */}
            <circle cx="48" cy="29" r="3" fill="url(#mc2-cheek)" />

            {/* Hair peeking from under hat */}
            <path
              d="M29,22 C28,20 29,18 30,17 L50,17 C51,18 52,20 51,22"
              fill="url(#mc2-hair)"
            />
            {/* Sideburns */}
            <path d="M29,22 C28,22 28,26 29,27" fill="url(#mc2-hair)" strokeWidth="0" />
            <path d="M51,22 C52,22 52,26 51,27" fill="url(#mc2-hair)" strokeWidth="0" />

            {/* Left ear */}
            <path
              d="M28,24 C26,24 25,26 26,28 C27,30 28,30 29,28"
              fill="url(#mc2-skin)"
            />
            {/* Right ear */}
            <path
              d="M52,24 C54,24 55,26 54,28 C53,30 52,30 51,28"
              fill="url(#mc2-skin)"
            />

            {/* === EYES with blink === */}
            <g className="mc2-blink" style={{ transformOrigin: '40px 24px' }}>
              {/* Left eye white */}
              <ellipse cx="35" cy="24" rx="3.5" ry="4" fill="white" />
              {/* Right eye white */}
              <ellipse cx="45" cy="24" rx="3.5" ry="4" fill="white" />

              {/* Left iris */}
              <ellipse cx="36" cy="24.5" rx="2" ry="2.5" fill="#4a3728" />
              {/* Right iris */}
              <ellipse cx="46" cy="24.5" rx="2" ry="2.5" fill="#4a3728" />

              {/* Left pupil */}
              <circle cx="36.3" cy="24.8" r="1.2" fill="#1a0f08" />
              {/* Right pupil */}
              <circle cx="46.3" cy="24.8" r="1.2" fill="#1a0f08" />

              {/* Eye shine - top left highlight */}
              <circle cx="34.5" cy="23" r="1" fill="white" opacity="0.9" />
              <circle cx="44.5" cy="23" r="1" fill="white" opacity="0.9" />
              {/* Secondary smaller shine */}
              <circle cx="37" cy="25.5" r="0.5" fill="white" opacity="0.5" />
              <circle cx="47" cy="25.5" r="0.5" fill="white" opacity="0.5" />
            </g>

            {/* Eyebrows */}
            <path
              d="M31,20 C32,18.5 35,18 37.5,19"
              fill="none"
              stroke="#4a3020"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M42.5,19 C45,18 48,18.5 49,20"
              fill="none"
              stroke="#4a3020"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Nose - subtle curved hint */}
            <path
              d="M39,27 C39,28.5 40,29.5 41,29.5 C42,29.5 42,28.5 41.5,27.5"
              fill="none"
              stroke="#d4956b"
              strokeWidth="0.8"
              strokeLinecap="round"
            />

            {/* Smile - friendly curved mouth */}
            <path
              d="M35,31 C37,34 43,34 45,31"
              fill="none"
              stroke="#a0522d"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Smile dimple lines */}
            <path d="M34,30.5 C34.5,31.5 35,32 35.5,31.5" fill="none" stroke="#c0825d" strokeWidth="0.5" />
            <path d="M46,30.5 C45.5,31.5 45,32 44.5,31.5" fill="none" stroke="#c0825d" strokeWidth="0.5" />

            {/* === HARD HAT === */}
            <g>
              {/* Hat dome - smooth curved */}
              <path
                d="M27,18 C27,10 33,6 40,6 C47,6 53,10 53,18 L53,20 L27,20 Z"
                fill="url(#mc2-hat)"
              />
              {/* Hat brim */}
              <path
                d="M24,19 C24,17 26,16 28,17 L52,17 C54,16 56,17 56,19 C56,21 54,22 52,21 L28,21 C26,22 24,21 24,19 Z"
                fill="url(#mc2-hat-brim)"
              />
              {/* Hat shine highlight */}
              <path
                d="M32,8 C34,7 38,7 40,8 C42,9 42,12 40,12 C38,12 34,11 32,10 Z"
                fill="url(#mc2-hat-shine)"
              />
              {/* Hat band */}
              <rect x="28" y="16" width="24" height="2.5" rx="1" fill="#d97706" opacity="0.6" />

              {/* TG Logo on hat */}
              <text
                x="40"
                y="14"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="6"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                opacity="0.9"
              >
                TG
              </text>
            </g>
          </g>
        </g>
      </svg>

      <style>{`
        /* === SPEECH BUBBLE POP === */
        @keyframes mc2-bubble-pop {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          60% { transform: translateX(-50%) scale(1.12); opacity: 1; }
          80% { transform: translateX(-50%) scale(0.95); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        .mc-bubble-pop {
          animation: mc2-bubble-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* === BREATHING === */
        @keyframes mc2-breathe {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(1.012) scaleX(1.005); }
        }
        .mc2-breathe { animation: mc2-breathe 3.5s ease-in-out infinite; }
        .mc2-breathe-shadow { animation: mc2-breathe 3.5s ease-in-out infinite; transform-origin: 60px 96px; }

        /* === WALK CYCLE - smooth sinusoidal leg motion === */
        @keyframes mc2-left-leg-walk {
          0% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
          100% { transform: rotate(-10deg); }
        }
        @keyframes mc2-right-leg-walk {
          0% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }
        .mc2-left-leg { animation: mc2-left-leg-walk 0.7s cubic-bezier(0.37, 0, 0.63, 1) infinite; }
        .mc2-right-leg { animation: mc2-right-leg-walk 0.7s cubic-bezier(0.37, 0, 0.63, 1) infinite; }

        /* === ARM SWING (left arm swings with walk) === */
        @keyframes mc2-arm-swing {
          0% { transform: rotate(6deg); }
          50% { transform: rotate(-6deg); }
          100% { transform: rotate(6deg); }
        }
        .mc2-left-arm { animation: mc2-arm-swing 0.7s cubic-bezier(0.37, 0, 0.63, 1) infinite; }

        /* === RIGHT ARM subtle motion on mower === */
        @keyframes mc2-arm-mower {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .mc2-right-arm-mower { animation: mc2-arm-mower 0.7s cubic-bezier(0.37, 0, 0.63, 1) infinite; }

        /* === HEAD BOB synced to walk === */
        @keyframes mc2-head-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-0.8px) rotate(0.5deg); }
          75% { transform: translateY(0.8px) rotate(-0.5deg); }
        }
        .mc2-head-bob { animation: mc2-head-bob 0.35s cubic-bezier(0.37, 0, 0.63, 1) infinite; }

        /* === BLINK every ~4.5 seconds === */
        @keyframes mc2-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          93% { transform: scaleY(0.05); }
          96% { transform: scaleY(1); }
        }
        .mc2-blink { animation: mc2-blink 4.5s ease-in-out infinite; }

        /* === MOWER VIBRATE (subtle engine rumble) === */
        @keyframes mc2-mower-vibrate {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(0.3px, -0.3px); }
          50% { transform: translate(-0.2px, 0.2px); }
          75% { transform: translate(0.2px, -0.2px); }
        }
        .mc2-mower-vibrate { animation: mc2-mower-vibrate 0.06s linear infinite; }

        /* === WHEEL SPIN === */
        @keyframes mc2-wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mc2-wheel-spin { animation: mc2-wheel-spin 0.4s linear infinite; }

        /* === EXHAUST PUFFS === */
        @keyframes mc2-exhaust1 {
          0% { opacity: 0; transform: translate(0, 0) scale(1); }
          30% { opacity: 0.25; transform: translate(2px, -3px) scale(1.3); }
          100% { opacity: 0; transform: translate(5px, -8px) scale(1.8); }
        }
        @keyframes mc2-exhaust2 {
          0% { opacity: 0; transform: translate(0, 0) scale(1); }
          40% { opacity: 0.2; transform: translate(3px, -4px) scale(1.2); }
          100% { opacity: 0; transform: translate(7px, -10px) scale(1.6); }
        }
        .mc2-exhaust1 { animation: mc2-exhaust1 2s ease-out infinite; }
        .mc2-exhaust2 { animation: mc2-exhaust2 2s ease-out infinite 0.5s; }

        /* === GRASS CLIPPINGS === */
        @keyframes mc2-clip-fly1 {
          0% { opacity: 0.7; transform: translate(0, 0) rotate(0deg); }
          50% { opacity: 0.5; transform: translate(6px, -10px) rotate(180deg); }
          100% { opacity: 0; transform: translate(12px, 2px) rotate(360deg); }
        }
        @keyframes mc2-clip-fly2 {
          0% { opacity: 0.6; transform: translate(0, 0) rotate(0deg); }
          50% { opacity: 0.4; transform: translate(8px, -8px) rotate(-150deg); }
          100% { opacity: 0; transform: translate(14px, 4px) rotate(-300deg); }
        }
        @keyframes mc2-clip-fly3 {
          0% { opacity: 0.5; transform: translate(0, 0) rotate(0deg); }
          50% { opacity: 0.3; transform: translate(5px, -12px) rotate(120deg); }
          100% { opacity: 0; transform: translate(10px, -2px) rotate(240deg); }
        }
        .mc2-clip1 { animation: mc2-clip-fly1 0.8s ease-out infinite; }
        .mc2-clip2 { animation: mc2-clip-fly2 0.8s ease-out infinite 0.15s; }
        .mc2-clip3 { animation: mc2-clip-fly3 0.8s ease-out infinite 0.3s; }
        .mc2-clip4 { animation: mc2-clip-fly1 0.8s ease-out infinite 0.45s; }
        .mc2-clip5 { animation: mc2-clip-fly2 0.8s ease-out infinite 0.1s; }
        .mc2-clip6 { animation: mc2-clip-fly3 0.8s ease-out infinite 0.55s; }

        /* === REDUCED MOTION === */
        @media (prefers-reduced-motion: reduce) {
          .mc2-breathe, .mc2-left-leg, .mc2-right-leg, .mc2-left-arm,
          .mc2-right-arm-mower, .mc2-head-bob, .mc2-blink, .mc2-mower-vibrate,
          .mc2-wheel-spin, .mc2-exhaust1, .mc2-exhaust2, .mc2-breathe-shadow,
          .mc2-clip1, .mc2-clip2, .mc2-clip3, .mc2-clip4, .mc2-clip5, .mc2-clip6,
          .mc-bubble-pop {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
