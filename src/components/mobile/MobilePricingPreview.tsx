'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { cn } from '@/lib/utils';

const seasonalAccent: Record<string, string> = {
  summer: 'from-emerald-600 to-emerald-500 shadow-emerald-900/20',
  fall:   'from-amber-600 to-amber-500 shadow-amber-900/20',
  winter: 'from-cyan-600 to-cyan-500 shadow-cyan-900/20',
};

interface MobilePricingPreviewProps {
  priceFrom: string;
  unit?: string;
  ctaHref: string;
  ctaLabel?: string;
  className?: string;
}

/**
 * Mobile-only pricing snapshot. Renders between TrustStrip and Whats Included.
 * Add to service pages in MOBILE_ORDER.PRICING slot.
 * Usage: <MobilePricingPreview priceFrom="$149" unit="/ visit" ctaHref="/contact?service=snow-removal" />
 */
export function MobilePricingPreview({
  priceFrom,
  unit = '/ visit',
  ctaHref,
  ctaLabel = 'Get Free Quote',
  className,
}: MobilePricingPreviewProps) {
  const { activeSeason } = useSeasonalTheme();
  const accent = seasonalAccent[activeSeason] ?? seasonalAccent.summer;

  return (
    <div className={cn('md:hidden px-4 py-3', className)}>
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3">
        <div>
          <p className="text-xs text-white/50 leading-none mb-0.5">Starting at</p>
          <p className="text-xl font-bold text-white leading-none">
            {priceFrom}
            <span className="text-sm font-normal text-white/50 ml-1">{unit}</span>
          </p>
        </div>
        <Link
          href={ctaHref}
          className={`flex items-center gap-1.5 bg-gradient-to-r ${accent} text-white font-semibold text-sm rounded-lg py-2.5 px-4 shadow-lg transition-all duration-200 whitespace-nowrap`}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
