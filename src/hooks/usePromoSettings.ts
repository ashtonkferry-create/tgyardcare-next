import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface Promotion {
  id: string;
  service: string;
  discount: string;
  path: string;
  seasons: Season[];
  duration_hours: number;
}

// Fallback promotions if database is unavailable
const FALLBACK_PROMOTIONS: Promotion[] = [
  { id: '1', service: 'Spring Cleanup', discount: '15%', path: '/services/spring-cleanup', seasons: ['spring'], duration_hours: 24 },
  { id: '2', service: 'Mowing', discount: '10%', path: '/services/mowing', seasons: ['summer'], duration_hours: 24 },
  { id: '3', service: 'Fall Cleanup', discount: '15%', path: '/services/fall-cleanup', seasons: ['fall'], duration_hours: 24 },
  { id: '4', service: 'Snow Removal', discount: '20%', path: '/services/snow-removal', seasons: ['winter'], duration_hours: 24 },
];

// Calculate current season - syncs with season settings from DB when available
const getCurrentSeason = async (): Promise<Season> => {
  try {
    // Try to get season override first
    const { data: override } = await supabase
      .from('season_override')
      .select('active_override, preview_mode, preview_season')
      .limit(1)
      .single();

    if (override) {
      // Check for preview mode
      if (override.preview_mode && override.preview_season) {
        return override.preview_season as Season;
      }
      // Check for active override
      if (override.active_override && override.active_override !== 'auto') {
        return override.active_override as Season;
      }
    }

    // Try to get season settings
    const { data: settings } = await supabase
      .from('season_settings')
      .select('season, start_month, start_day, end_month, end_day');

    if (settings && settings.length > 0) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();

      for (const setting of settings) {
        const { start_month, start_day, end_month, end_day, season } = setting;

        // Handle cross-year seasons (e.g., winter: Dec-Feb)
        if (start_month > end_month) {
          if (month > start_month || (month === start_month && day >= start_day)) {
            return season as Season;
          }
          if (month < end_month || (month === end_month && day <= end_day)) {
            return season as Season;
          }
        } else {
          const afterStart = month > start_month || (month === start_month && day >= start_day);
          const beforeEnd = month < end_month || (month === end_month && day <= end_day);
          if (afterStart && beforeEnd) {
            return season as Season;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch season settings for promos:', err);
  }

  // Fallback based on month
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

export const usePromoSettings = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSeason, setCurrentSeason] = useState<Season>('winter');

  const fetchPromotions = useCallback(async () => {
    try {
      // Get active season first (respects overrides)
      const activeSeason = await getCurrentSeason();
      setCurrentSeason(activeSeason);

      const { data, error } = await supabase
        .from('promo_settings')
        .select('id, service, discount, path, seasons, duration_hours')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Filter promotions by the active season
      const seasonalPromos = (data as Promotion[]).filter(p => 
        p.seasons.includes(activeSeason)
      );

      setPromotions(seasonalPromos.length > 0 ? seasonalPromos : FALLBACK_PROMOTIONS.filter(p => p.seasons.includes(activeSeason)));
    } catch (err) {
      console.warn('Failed to fetch promotions, using fallback:', err);
      const fallbackSeason = await getCurrentSeason();
      setCurrentSeason(fallbackSeason);
      setPromotions(FALLBACK_PROMOTIONS.filter(p => p.seasons.includes(fallbackSeason)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Get current promo index based on time
  const getPromoIndex = useCallback(() => {
    if (promotions.length === 0) return 0;
    
    // Use the first promo's duration or default to 24 hours
    const durationMs = (promotions[0]?.duration_hours || 24) * 60 * 60 * 1000;
    const startDate = new Date('2025-01-01T00:00:00').getTime();
    const elapsed = Date.now() - startDate;
    return Math.floor(elapsed / durationMs) % promotions.length;
  }, [promotions]);

  // Get time until next promo switch
  const getTimeUntilNextPromo = useCallback(() => {
    const durationMs = (promotions[0]?.duration_hours || 24) * 60 * 60 * 1000;
    const startDate = new Date('2025-01-01T00:00:00').getTime();
    const elapsed = Date.now() - startDate;
    return durationMs - (elapsed % durationMs);
  }, [promotions]);

  return {
    promotions,
    isLoading,
    currentSeason,
    getPromoIndex,
    getTimeUntilNextPromo,
  };
};
