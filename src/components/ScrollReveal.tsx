'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMobilePerf } from '@/hooks/useMobilePerf';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  once?: boolean;
  amount?: number;
}

const directionOffsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
};

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  once = true,
  amount = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px', amount });
  const { blurAmount, duration, maxStaggerDelay } = useMobilePerf();

  const cappedDelay = Math.min(delay, maxStaggerDelay);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: `blur(${blurAmount})`, ...directionOffsets[direction] }}
      animate={isInView ? { opacity: 1, filter: 'blur(0px)', y: 0, x: 0 } : {}}
      transition={{ duration, delay: cappedDelay, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — wraps children and applies incremental delays */
export function ScrollRevealGroup({
  children,
  staggerDelay = 0.08,
  className,
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <ScrollReveal key={i} delay={i * staggerDelay}>
              {child}
            </ScrollReveal>
          ))
        : <ScrollReveal>{children}</ScrollReveal>
      }
    </div>
  );
}
