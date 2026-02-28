'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { useSeasonalTheme, useSeasonalCTA, Season } from '@/contexts/SeasonalThemeContext';
import { Phone, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileSeasonalCTA() {
  const { activeSeason, isLoading } = useSeasonalTheme();
  const { label, path } = useSeasonalCTA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show after scrolling 300px
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setIsVisible(scrolled && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  // Reset dismissed state when user navigates away
  useEffect(() => {
    return () => setIsDismissed(false);
  }, []);

  if (isLoading || isDismissed) return null;

  const seasonGradients: Record<Season, string> = {
    summer: 'from-green-600 to-emerald-700',
    fall: 'from-orange-500 to-red-600',
    winter: 'from-blue-500 to-cyan-600',
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 safe-area-bottom",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className={cn(
        "bg-gradient-to-r text-white p-4 shadow-2xl",
        seasonGradients[activeSeason]
      )}>
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold opacity-90 truncate">Limited seasonal availability</p>
            <p className="font-bold text-sm truncate">{label}</p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-foreground hover:bg-white/90 font-bold text-xs px-3"
              asChild
            >
              <a href="tel:608-535-6057">
                <Phone className="h-4 w-4" />
              </a>
            </Button>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
              asChild
            >
              <Link href={path}>
                Quote <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
