import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * SEASON SYSTEM:
 * This site uses 3 display seasons: Summer, Fall, Winter
 * Spring calendar dates (March-May) use the Summer theme.
 * The database may still have 'spring' entries for backwards compatibility,
 * but they're mapped to 'summer' for display purposes.
 */
export type Season = 'summer' | 'fall' | 'winter';
export type DatabaseSeason = 'spring' | 'summer' | 'fall' | 'winter';

// Map database season to display season (spring → summer)
function mapToDisplaySeason(dbSeason: DatabaseSeason): Season {
  if (dbSeason === 'spring') return 'summer';
  return dbSeason;
}

interface SeasonSettings {
  season: DatabaseSeason;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  theme_colors: {
    accent?: string;
    badge?: string;
  };
}

interface SeasonOverride {
  active_override: 'auto' | DatabaseSeason;
  preview_mode: boolean;
  preview_season: DatabaseSeason | null;
}

interface SeasonalSlide {
  id: string;
  season: DatabaseSeason;
  slide_order: number;
  headline: string;
  bullets: string[];
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  trust_chips: string[];
  background_image_url: string | null;
  is_active: boolean;
}

interface PriorityService {
  id: string;
  season: DatabaseSeason;
  service_order: number;
  service_name: string;
  service_path: string;
  service_description: string | null;
  badge_text: string | null;
  is_bundle: boolean;
  bundle_discount: string | null;
  limited_slots: boolean;
  slots_remaining: number | null;
  is_active: boolean;
}

interface SeasonalThemeContextValue {
  currentSeason: Season;
  activeSeason: Season; // May differ if override is set
  isPreviewMode: boolean;
  seasonSettings: SeasonSettings[];
  slides: SeasonalSlide[];
  priorityServices: PriorityService[];
  seasonBadge: string;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setPreviewSeason: (season: Season | null) => void;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextValue | null>(null);

// Calculate current season based on date and settings
// Returns the display season (spring is mapped to summer)
function calculateCurrentSeason(settings: SeasonSettings[]): Season {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  for (const setting of settings) {
    const { start_month, start_day, end_month, end_day, season } = setting;

    // Handle seasons that cross year boundary (e.g., winter: Dec-Feb)
    if (start_month > end_month) {
      // Cross-year season
      if (month > start_month || (month === start_month && day >= start_day)) {
        return mapToDisplaySeason(season);
      }
      if (month < end_month || (month === end_month && day <= end_day)) {
        return mapToDisplaySeason(season);
      }
    } else {
      // Normal season within same year
      const afterStart = month > start_month || (month === start_month && day >= start_day);
      const beforeEnd = month < end_month || (month === end_month && day <= end_day);
      if (afterStart && beforeEnd) {
        return mapToDisplaySeason(season);
      }
    }
  }

  // Fallback based on month (spring maps to summer)
  if (month >= 3 && month <= 8) return 'summer'; // March-August = Summer theme
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

// Default fallback data (using display seasons only)
const FALLBACK_SETTINGS: SeasonSettings[] = [
  { season: 'spring', start_month: 3, start_day: 1, end_month: 5, end_day: 31, theme_colors: { accent: '142 76% 36%', badge: 'Summer Mode' } },
  { season: 'summer', start_month: 6, start_day: 1, end_month: 8, end_day: 31, theme_colors: { accent: '142 76% 36%', badge: 'Summer Mode' } },
  { season: 'fall', start_month: 9, start_day: 1, end_month: 11, end_day: 30, theme_colors: { accent: '24 95% 53%', badge: 'Fall Mode' } },
  { season: 'winter', start_month: 12, start_day: 1, end_month: 2, end_day: 28, theme_colors: { accent: '200 98% 39%', badge: 'Winter Mode' } },
];

const FALLBACK_SLIDES: Record<Season, SeasonalSlide[]> = {
  summer: [
    { id: '1', season: 'summer', slide_order: 1, headline: 'Weekly Mowing Routes Now Open', bullets: ['Consistent schedule', 'Same crew every visit', 'Lock in your spot'], primary_cta_text: 'Reserve My Spot', primary_cta_link: '/contact', secondary_cta_text: 'See Services', secondary_cta_link: '/#services', trust_chips: ['Limited Spots', 'Weekly Service', 'Reliable'], background_image_url: null, is_active: true },
  ],
  fall: [
    { id: '3', season: 'fall', slide_order: 1, headline: 'Leaf Cleanup Packages Available', bullets: ['Multi-visit bundles', 'Complete removal', 'Book early'], primary_cta_text: 'Reserve Fall Package', primary_cta_link: '/contact', secondary_cta_text: 'See Services', secondary_cta_link: '/#services', trust_chips: ['Bundle & Save', 'Limited Slots', 'Fast Turnaround'], background_image_url: null, is_active: true },
  ],
  winter: [
    { id: '4', season: 'winter', slide_order: 1, headline: 'Snow Plowing Contracts Open', bullets: ['Priority service', '24/7 response', 'Lock in your spot'], primary_cta_text: 'Get Season Contract', primary_cta_link: '/contact', secondary_cta_text: 'See Services', secondary_cta_link: '/#services', trust_chips: ['Priority Service', 'Seasonal Savings', '24/7 Response'], background_image_url: null, is_active: true },
  ],
};

const FALLBACK_SERVICES: Record<Season, PriorityService[]> = {
  summer: [
    { id: '2', season: 'summer', service_order: 1, service_name: 'Weekly Mowing', service_path: '/services/mowing', service_description: 'Weekly service', badge_text: 'Limited Spots', is_bundle: false, bundle_discount: null, limited_slots: true, slots_remaining: 4, is_active: true },
  ],
  fall: [
    { id: '3', season: 'fall', service_order: 1, service_name: 'Leaf Cleanup', service_path: '/services/leaf-removal', service_description: 'Multi-visit bundles', badge_text: 'Bundle & Save', is_bundle: true, bundle_discount: '20% OFF', limited_slots: true, slots_remaining: 10, is_active: true },
  ],
  winter: [
    { id: '4', season: 'winter', service_order: 1, service_name: 'Snow Plowing', service_path: '/services/snow-removal', service_description: 'Seasonal contracts', badge_text: 'Priority', is_bundle: true, bundle_discount: '25% OFF', limited_slots: true, slots_remaining: 5, is_active: true },
  ],
};

export function SeasonalThemeProvider({ children }: { children: ReactNode }) {
  const [seasonSettings, setSeasonSettings] = useState<SeasonSettings[]>(FALLBACK_SETTINGS);
  const [override, setOverride] = useState<SeasonOverride>({ active_override: 'auto', preview_mode: false, preview_season: null });
  const [allSlides, setAllSlides] = useState<SeasonalSlide[]>([]);
  const [allServices, setAllServices] = useState<PriorityService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localPreviewSeason, setLocalPreviewSeason] = useState<Season | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [settingsRes, overrideRes, slidesRes, servicesRes] = await Promise.all([
        supabase.from('season_settings').select('*'),
        supabase.from('season_override').select('*').limit(1).single(),
        supabase.from('seasonal_slides').select('*').eq('is_active', true).order('slide_order'),
        supabase.from('seasonal_priority_services').select('*').eq('is_active', true).order('service_order'),
      ]);

      if (settingsRes.data && settingsRes.data.length > 0) {
        setSeasonSettings(settingsRes.data as SeasonSettings[]);
      }

      if (overrideRes.data) {
        setOverride(overrideRes.data as SeasonOverride);
      }

      if (slidesRes.data) {
        setAllSlides(slidesRes.data as SeasonalSlide[]);
      }

      if (servicesRes.data) {
        setAllServices(servicesRes.data as PriorityService[]);
      }
    } catch (err) {
      console.warn('Failed to fetch seasonal data:', err);
      setError('Failed to load seasonal settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate the current natural season
  const currentSeason = calculateCurrentSeason(seasonSettings);

  // Determine active season (considering overrides and preview)
  const activeSeason: Season = localPreviewSeason 
    ?? (override.preview_mode && override.preview_season ? mapToDisplaySeason(override.preview_season) : null)
    ?? (override.active_override !== 'auto' ? mapToDisplaySeason(override.active_override) : null)
    ?? currentSeason;

  const isPreviewMode = !!localPreviewSeason || override.preview_mode;

  // Filter slides and services for active season
  const slides = allSlides.length > 0 
    ? allSlides.filter(s => s.season === activeSeason)
    : (FALLBACK_SLIDES[activeSeason] || []);

  const priorityServices = allServices.length > 0
    ? allServices.filter(s => s.season === activeSeason)
    : (FALLBACK_SERVICES[activeSeason] || []);

  // Get season badge
  const currentSettings = seasonSettings.find(s => s.season === activeSeason);
  const seasonBadge = currentSettings?.theme_colors?.badge || `${activeSeason.charAt(0).toUpperCase() + activeSeason.slice(1)} Mode`;

  // Apply seasonal CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const settings = seasonSettings.find(s => s.season === activeSeason);
    
    if (settings?.theme_colors?.accent) {
      root.style.setProperty('--seasonal-accent', settings.theme_colors.accent);
    }
    
    // Add season class to body for CSS targeting
    document.body.classList.remove('season-spring', 'season-summer', 'season-fall', 'season-winter');
    document.body.classList.add(`season-${activeSeason}`);

    return () => {
      document.body.classList.remove(`season-${activeSeason}`);
    };
  }, [activeSeason, seasonSettings]);

  const setPreviewSeason = useCallback((season: Season | null) => {
    setLocalPreviewSeason(season);
  }, []);

  return (
    <SeasonalThemeContext.Provider value={{
      currentSeason,
      activeSeason,
      isPreviewMode,
      seasonSettings,
      slides,
      priorityServices,
      seasonBadge,
      isLoading,
      error,
      refreshData: fetchData,
      setPreviewSeason,
    }}>
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme() {
  const context = useContext(SeasonalThemeContext);
  if (!context) {
    throw new Error('useSeasonalTheme must be used within SeasonalThemeProvider');
  }
  return context;
}

// Helper hook for getting seasonal CTA label
export function useSeasonalCTA(): { label: string; path: string } {
  const { activeSeason } = useSeasonalTheme();
  
  const ctaMap: Record<Season, { label: string; path: string }> = {
    summer: { label: 'Reserve Mowing Slot', path: '/contact' },
    fall: { label: 'Book Fall Package', path: '/contact' },
    winter: { label: 'Get Snow Contract', path: '/contact' },
  };

  return ctaMap[activeSeason];
}
