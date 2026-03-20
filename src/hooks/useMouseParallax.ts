'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ParallaxState {
  x: number;
  y: number;
}

interface UseMouseParallaxOptions {
  enabled?: boolean;
  smoothing?: number;
}

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

  useEffect(() => {
    isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || isTouchRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    targetRef.current = {
      x: Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2))),
      y: Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2))),
    };
    startLoop(); // kick off RAF only when mouse moves
  }, [startLoop]);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
    startLoop(); // animate back to center then stop
  }, [startLoop]);

  // RAF loop that stops itself when position converges (no continuous loop)
  const isRunningRef = useRef(false);

  const startLoop = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    function tick() {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * smoothing;
      cur.y += (tgt.y - cur.y) * smoothing;

      const moving = Math.abs(cur.x - tgt.x) > 0.001 || Math.abs(cur.y - tgt.y) > 0.001 ||
                     Math.abs(cur.x) > 0.001 || Math.abs(cur.y) > 0.001;

      if (moving) {
        setPosition({ x: cur.x, y: cur.y });
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Converged — stop the loop, save battery
        isRunningRef.current = false;
        if (cur.x !== 0 || cur.y !== 0) {
          cur.x = 0;
          cur.y = 0;
          setPosition({ x: 0, y: 0 });
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [smoothing]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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

  const getLayerStyle = useCallback((intensity: number) => ({
    transform: `translate(${-position.x * intensity}px, ${-position.y * intensity}px)`,
    transition: 'none' as const,
    willChange: 'transform' as const,
  }), [position.x, position.y]);

  const getTiltStyle = useCallback((maxDeg: number = 8) => ({
    transform: `perspective(1000px) rotateY(${position.x * maxDeg}deg) rotateX(${-position.y * maxDeg}deg)`,
    transition: isTouchRef.current ? 'none' as const : 'transform 0.1s ease-out',
    willChange: 'transform' as const,
  }), [position.x, position.y]);

  return { containerRef, position, getLayerStyle, getTiltStyle };
}
