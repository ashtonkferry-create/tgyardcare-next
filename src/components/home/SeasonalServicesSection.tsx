'use client';

import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { WinterValueProposition } from '@/components/WinterValueProposition';
import { WinterPriorityServices } from '@/components/WinterPriorityServices';
import { SeasonalPriorityServices } from '@/components/SeasonalPriorityServices';

/**
 * Client island that renders season-appropriate priority services.
 *
 * Winter: WinterValueProposition + WinterPriorityServices (comparison + packages)
 * Summer/Fall: SeasonalPriorityServices (pricing cards with dark cinematic theme)
 *
 * Needs 'use client' because it reads activeSeason from SeasonalThemeContext.
 */
export function SeasonalServicesSection() {
  const { activeSeason } = useSeasonalTheme();

  if (activeSeason === 'winter') {
    return (
      <>
        <WinterValueProposition />
        <WinterPriorityServices />
      </>
    );
  }

  return <SeasonalPriorityServices />;
}
