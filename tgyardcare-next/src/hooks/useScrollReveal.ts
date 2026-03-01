'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';

export function useScrollReveal(options?: { once?: boolean; margin?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    margin: options?.margin ?? '-80px',
    amount: options?.amount ?? 0.2,
  });
  return { ref, isInView };
}
