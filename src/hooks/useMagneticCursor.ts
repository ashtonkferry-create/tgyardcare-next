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
      } else if (transform.x !== 0 || transform.y !== 0) {
        setTransform({ x: 0, y: 0 });
      }
    });
  }, [enabled, radius, maxDisplacement, prefersReduced, transform.x, transform.y]);

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
