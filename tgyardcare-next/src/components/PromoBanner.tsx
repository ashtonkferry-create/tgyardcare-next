'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Percent, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { cn } from '@/lib/utils';
import { usePromoSettings } from '@/hooks/usePromoSettings';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { activeSeason } = useSeasonalTheme();
  const { promotions, isLoading, getPromoIndex, getTimeUntilNextPromo } = usePromoSettings();
  const isWinter = activeSeason === 'winter';
  const [promoIndex, setPromoIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  // Update promo index when promotions load
  useEffect(() => {
    if (promotions.length > 0) {
      setPromoIndex(getPromoIndex());
    }
  }, [promotions, getPromoIndex]);

  const currentPromo = promotions[promoIndex] || promotions[0];

  const calculateTimeLeft = useCallback(() => {
    if (promotions.length === 0) return;

    const remaining = getTimeUntilNextPromo();

    if (remaining <= 0) {
      setPromoIndex(getPromoIndex());
      return;
    }

    setTimeLeft({
      hours: Math.floor(remaining / (1000 * 60 * 60)),
      minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((remaining % (1000 * 60)) / 1000),
    });
  }, [promotions, getPromoIndex, getTimeUntilNextPromo]);

  useEffect(() => {
    if (promotions.length === 0) return;

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft, promotions]);

  if (!isVisible || isLoading || !currentPromo) return null;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const BannerContent = () => (
    <>
      <div className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
        <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <p className="text-sm sm:text-base font-medium whitespace-nowrap">
        Save <span className={cn("font-bold", isWinter && "animate-frost-text-glow")}>{currentPromo.discount} OFF</span> on {currentPromo.service}
      </p>

      {/* Compact Countdown Timer */}
      <div className="flex items-center gap-1.5 ml-2">
        <span className="bg-white/20 rounded px-2 py-0.5 font-mono font-bold text-sm">
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </>
  );

  return (
    <div className={cn(
      "text-white py-2.5 px-4 border-b relative overflow-hidden",
      isWinter
        ? "bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border-cyan-400/10"
        : "bg-primary border-primary-foreground/10"
    )}>
      {/* Winter snow particles */}
      {isWinter && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-snow-fall"
              style={{
                width: `${1.5 + Math.random() * 3}px`,
                height: `${1.5 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${-(Math.random() * 8)}s`,
                animationDuration: `${5 + Math.random() * 3}s`,
                filter: 'blur(0.5px) drop-shadow(0 0 2px rgba(147, 197, 253, 0.5))',
              }}
            />
          ))}
        </div>
      )}
      {/* Frost shimmer bottom line */}
      {isWinter && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
      )}
      <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-4 relative z-10">
        {/* Mobile: entire content is clickable */}
        <Link
          href={currentPromo.path}
          className="flex sm:hidden items-center gap-2 flex-1 justify-center group"
        >
          <div className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 flex-shrink-0">
            <Percent className="h-3.5 w-3.5" />
          </div>
          <p className="text-sm font-medium whitespace-nowrap">
            <span className={cn("font-bold", isWinter && "animate-frost-text-glow")}>{currentPromo.discount} OFF</span> {currentPromo.service}
          </p>
          <div className="flex items-center gap-0.5 ml-1">
            <span className="bg-white/20 rounded px-1 py-0.5 font-mono font-bold text-[10px]">
              {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 opacity-70 group-active:translate-x-0.5 transition-transform" />
        </Link>

        {/* Desktop: content is not clickable, separate button */}
        <div className="hidden sm:flex items-center gap-3 flex-1 justify-center">
          <BannerContent />
        </div>

        <Link
          href={currentPromo.path}
          className="hidden sm:inline-flex bg-white text-primary hover:bg-white/95 px-4 py-1.5 rounded-md font-semibold text-sm transition-all whitespace-nowrap"
        >
          Get Your Fast Quote
        </Link>

        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
