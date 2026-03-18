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
    if (!canFire()) return;
    try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch {}
    setTriggered(true);
  }, [canFire]);

  const dismiss = useCallback(() => setTriggered(false), []);

  // Reset engagement trackers on each navigation
  useEffect(() => {
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    scrollUpStartRef.current = null;
    if (typeof window !== 'undefined') lastScrollYRef.current = window.scrollY;
    if (isExcluded()) setTriggered(false);  // close modal if user navigates to excluded route
  }, [pathname, isExcluded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const trackScrollDepth = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        maxScrollRef.current = Math.max(maxScrollRef.current, window.scrollY / total);
      }
    };

    // Desktop: mouse heading toward browser chrome (top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 20) fire();
    };

    // Mobile: deliberate scroll-back-up gesture after engagement
    const handleMobileScroll = () => {
      trackScrollDepth();
      const currentY = window.scrollY;
      if (currentY < lastScrollYRef.current) {
        // scrolling up
        if (scrollUpStartRef.current === null) {
          scrollUpStartRef.current = lastScrollYRef.current;
        }
        if (scrollUpStartRef.current - currentY >= MOBILE_SCROLL_UP_PX) {
          fire();
        }
      } else {
        // scrolling down — reset up-scroll tracking
        scrollUpStartRef.current = null;
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    if (isMobile) {
      lastScrollYRef.current = window.scrollY;
      window.addEventListener('scroll', handleMobileScroll, { passive: true });
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      if (isMobile) {
        window.removeEventListener('scroll', handleMobileScroll);
      } else {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [fire]); // fire is stable — memoized by useCallback

  return { triggered, dismiss };
}
