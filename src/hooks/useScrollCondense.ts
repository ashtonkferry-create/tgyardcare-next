'use client';

import { useState, useEffect, useRef } from 'react';

const SCROLL_THRESHOLD = 80;

export function useScrollCondense() {
  const [isCondensed, setIsCondensed] = useState(false);
  const rafRef = useRef(0);
  const lastValueRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const next = window.scrollY > SCROLL_THRESHOLD;
        if (next !== lastValueRef.current) {
          lastValueRef.current = next;
          setIsCondensed(next);
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return isCondensed;
}
