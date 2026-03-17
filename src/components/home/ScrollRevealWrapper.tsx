'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface ScrollRevealWrapperProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Direction to reveal from */
  direction?: RevealDirection;
  /** Legacy alias for direction (e.g. "slide-left" -> "left") */
  animation?: string;
  /** Only animate once */
  once?: boolean;
}

const directionOffsets = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: 30 },
  right: { x: -30 },
} as const;

/**
 * Tiny client island that wraps children with Framer Motion useInView reveal.
 * Used by Server Components (like StatsStrip) to add scroll-triggered animations
 * without making the parent a Client Component.
 */
/** Map legacy animation strings like "slide-left" to direction */
function parseAnimation(animation?: string): RevealDirection | undefined {
  if (!animation) return undefined;
  if (animation.includes('left')) return 'left';
  if (animation.includes('right')) return 'right';
  if (animation.includes('down')) return 'down';
  return 'up';
}

export function ScrollRevealWrapper({
  children,
  className,
  delay = 0,
  direction: directionProp,
  animation,
  once = true,
}: ScrollRevealWrapperProps) {
  const direction = directionProp ?? parseAnimation(animation) ?? 'up';
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px', amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionOffsets[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
