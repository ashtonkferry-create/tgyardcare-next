'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const EXCLUDED_PREFIXES = ['/admin', '/portal', '/get-quote', '/contact'];
const MIN_TIME_MS = 15_000;         // 15 seconds minimum on page
const MIN_SCROLL_DEPTH = 0.30;      // 30% of page scrolled
const MOBILE_SCROLL_UP_PX = 100;    // deliberate upward scroll threshold
const SESSION_KEY = 'tg-exit-shown';
const CONVERTED_KEY = 'tg-converted';

export function useExitIntent() {
  const [triggered, setTriggered] = useState(false);
  const pathname = usePathname();
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const scrollUpStartRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const firedRef = useRef(false);

  const isExcluded = useCallback(
    () => EXCLUDED_PREFIXES.some(p => pathname?.startsWith(p)),
    [pathname]
  );

  const canFire = useCallback(() => {
    if (isExcluded()) return false;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return false;
      if (localStorage.getItem(CONVERTED_KEY)) return false;
    } catch { /* storage unavailable — allow */ }
    if (Date.now() - startTimeRef.current < MIN_TIME_MS) return false;
    if (maxScrollRef.current < MIN_SCROLL_DEPTH) return false;
    return true;
  }, [isExcluded]);

  const fire = useCallback(() => {
    if (firedRef.current) return;   // fast in-memory gate
    if (!canFire()) return;
    firedRef.current = true;
    try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch {}
    setTriggered(true);
  }, [canFire]);

  const dismiss = useCallback(() => setTriggered(false), []);

  // Reset engagement trackers on each navigation
  useEffect(() => {
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    scrollUpStartRef.current = null;
    firedRef.current = false;
    if (typeof window !== 'undefined') lastScrollYRef.current = window.scrollY;
    if (isExcluded()) setTriggered(false);  // close modal if user navigates to excluded route
  }, [pathname, isExcluded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 768px)');
    let isMobile = mq.matches;

    const trackScrollDepth = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        maxScrollRef.current = Math.max(maxScrollRef.current, window.scrollY / total);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 20) fire();
    };

    const handleMobileScroll = () => {
      trackScrollDepth();
      const currentY = window.scrollY;
      if (currentY < lastScrollYRef.current) {
        if (scrollUpStartRef.current === null) {
          scrollUpStartRef.current = lastScrollYRef.current;
        }
        if (scrollUpStartRef.current - currentY >= MOBILE_SCROLL_UP_PX) {
          fire();
        }
      } else {
        scrollUpStartRef.current = null;
      }
      lastScrollYRef.current = currentY;
    };

    const attach = () => {
      if (isMobile) {
        lastScrollYRef.current = window.scrollY;
        window.addEventListener('scroll', handleMobileScroll, { passive: true });
      } else {
        window.addEventListener('scroll', trackScrollDepth, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
      }
    };

    const detach = () => {
      window.removeEventListener('scroll', handleMobileScroll);
      window.removeEventListener('scroll', trackScrollDepth);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };

    const handleMqChange = (e: MediaQueryListEvent) => {
      detach();
      isMobile = e.matches;
      attach();
    };

    attach();
    mq.addEventListener('change', handleMqChange);

    return () => {
      detach();
      mq.removeEventListener('change', handleMqChange);
    };
  }, [fire]); // fire is stable — memoized by useCallback

  return { triggered, dismiss };
}
