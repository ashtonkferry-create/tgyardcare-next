'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

const SEASON_CONFIG = {
  spring: {
    emoji: '🌸',
    headline: "It's Spring in Madison — cleanup, aeration & fertilization time",
    cta: 'Spring Cleanup',
    href: '/services/spring-cleanup',
    color: '#a7f3d0',
    bgRgb: '34,197,94',
  },
  summer: {
    emoji: '☀️',
    headline: "Beat Madison's summer heat — lawn watering & mowing tips",
    cta: 'Summer Care Tips',
    href: '/lawn-care-guide#summer',
    color: '#eab308',
    bgRgb: '234,179,8',
  },
  fall: {
    emoji: '🍂',
    headline: 'Fall is critical — leaf cleanup, overseeding & gutter guards',
    cta: 'Fall Cleanup',
    href: '/services/fall-cleanup',
    color: '#f97316',
    bgRgb: '249,115,22',
  },
  winter: {
    emoji: '❄️',
    headline: 'Winter in Madison — snow removal tips & spring planning',
    cta: 'Snow Removal',
    href: '/services/snow-removal',
    color: '#38bdf8',
    bgRgb: '56,189,248',
  },
};

export default function SeasonalContentBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const wasDismissed = localStorage.getItem('seasonal-banner-dismissed');
      if (wasDismissed === getCurrentSeason()) setDismissed(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem('seasonal-banner-dismissed', getCurrentSeason());
    } catch {
      // localStorage unavailable
    }
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  const season = getCurrentSeason();
  const config = SEASON_CONFIG[season];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl mb-6 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
        style={{
          background: `rgba(${config.bgRgb},0.08)`,
          border: `1px solid rgba(${config.bgRgb},0.2)`,
        }}
      >
        <span className="text-2xl shrink-0">{config.emoji}</span>
        <p
          className="flex-1 text-sm font-medium"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {config.headline}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={config.href}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:brightness-110"
            style={{
              background: `rgba(${config.bgRgb},0.15)`,
              color: config.color,
              border: `1px solid rgba(${config.bgRgb},0.25)`,
            }}
          >
            {config.cta} →
          </Link>
          <button
            onClick={dismiss}
            className="text-lg leading-none hover:opacity-60 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
