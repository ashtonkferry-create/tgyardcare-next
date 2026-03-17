'use client';

import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { WinterHero } from '@/components/WinterHero';
import { SummerHero } from '@/components/SummerHero';
import { FallHero } from '@/components/FallHero';

/**
 * Client island that switches between seasonal hero components
 * based on the active season from SeasonalThemeContext.
 *
 * Each hero is a standalone component with its own cinematic treatment.
 * This component simply selects the correct one based on context.
 */
export function HeroSection() {
  const { activeSeason } = useSeasonalTheme();

  switch (activeSeason) {
    case 'winter':
      return <WinterHero />;
    case 'fall':
      return <FallHero />;
    case 'summer':
    default:
      return <SummerHero />;
  }
}
