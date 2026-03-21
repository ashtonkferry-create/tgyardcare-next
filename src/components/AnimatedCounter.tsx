'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const finalDisplay = decimals > 0 ? end.toFixed(decimals) : String(end);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [display, setDisplay] = useState(finalDisplay);

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    // Reset to 0 and animate up when scrolled into view
    setDisplay('0');
    setHasAnimated(true);
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = end * eased;
      setDisplay(decimals > 0 ? current.toFixed(decimals) : String(Math.floor(current)));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, end, duration, decimals, hasAnimated]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}{display}{suffix}
    </span>
  );
}
