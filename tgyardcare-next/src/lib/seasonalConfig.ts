import type { Season } from '@/contexts/SeasonalThemeContext';

/**
 * Centralized seasonal configuration for stats, SEO, and content
 * 
 * IMPORTANT: This site uses 3 display seasons (Summer, Fall, Winter)
 * Spring dates use the Summer theme - there is no separate spring theme.
 * The system internally maps spring → summer for theming purposes.
 */

// ============================================
// SITE-WIDE STATISTICS (Totals across all seasons)
// ============================================
export const SITE_STATS = {
  totalClients: 500,
  googleRating: 4.9,
  reviewCount: 60,
  yearsInBusiness: 8,
} as const;

// ============================================
// SEASONAL STATISTICS (Season-specific accomplishments)
// Summer stats include spring work (March-August combined)
// ============================================
export interface SeasonalStats {
  heroStat: {
    value: string;
    label: string;
  };
  secondaryStat: {
    value: string;
    label: string;
  };
  badgeText: string;
}

export const SEASONAL_STATS: Record<Season, SeasonalStats> = {
  summer: {
    heroStat: { value: '500+', label: 'Clients Served' },
    secondaryStat: { value: '4.9★', label: 'Google Rating' },
    badgeText: 'Peak Season',
  },
  fall: {
    heroStat: { value: '500+', label: 'Clients Served' },
    secondaryStat: { value: '4.9★', label: 'Google Rating' },
    badgeText: 'Book Early',
  },
  winter: {
    heroStat: { value: '500+', label: 'Clients Served' },
    secondaryStat: { value: '4.9★', label: 'Google Rating' },
    badgeText: '24/7 Response',
  },
} as const;

// ============================================
// SEASONAL SEO CONFIGURATION
// Auto-updates meta tags based on current season
// Summer SEO covers spring+summer period (March-August)
// ============================================
export interface SeasonalSEO {
  homeTitle: string;
  homeDescription: string;
  homeKeywords: string;
  focusService: string;
  urgencyMessage: string;
  advertisedServices: string[];
}

export const SEASONAL_SEO: Record<Season, SeasonalSEO> = {
  summer: {
    homeTitle: 'Lawn Care & Mowing Services Madison WI',
    homeDescription: 'Professional lawn mowing, herbicide, fertilization & aeration in Madison WI. Weekly routes, reliable crews, beautiful results. Reserve your spot today!',
    homeKeywords: 'lawn mowing Madison WI, lawn care, herbicide treatment, fertilization, aeration, property maintenance Madison',
    focusService: 'Lawn Mowing',
    urgencyMessage: 'Weekly routes filling fast!',
    advertisedServices: ['Lawn Mowing', 'Herbicide', 'Fertilization', 'Aeration'],
  },
  fall: {
    homeTitle: 'Fall Cleanup & Leaf Removal Services Madison WI',
    homeDescription: 'Professional fall leaf cleanup, gutter cleaning, aeration & overseeding in Madison WI. Multi-visit packages available. Book before the rush!',
    homeKeywords: 'fall cleanup Madison WI, leaf removal, gutter cleaning, aeration, overseeding, fall yard work Madison',
    focusService: 'Fall Cleanup',
    urgencyMessage: 'Fall packages booking now!',
    advertisedServices: ['Fall Cleanup', 'Leaf Removal', 'Aeration', 'Gutter Cleaning'],
  },
  winter: {
    homeTitle: 'Snow Removal & Plowing Services Madison WI',
    homeDescription: 'Reliable snow plowing and removal in Madison WI. 24/7 response, seasonal contracts, residential & commercial. Lock in your snow contract today!',
    homeKeywords: 'snow removal Madison WI, snow plowing, driveway clearing, ice management, winter services Madison',
    focusService: 'Snow Removal',
    urgencyMessage: 'Priority contracts available!',
    advertisedServices: ['Snow Removal', 'Ice Management'],
  },
} as const;

// ============================================
// SEASONAL SCHEMA / STRUCTURED DATA
// For LocalBusiness & Service schemas
// ============================================
export interface SeasonalSchema {
  primaryService: string;
  serviceDescription: string;
  priceRange: string;
}

export const SEASONAL_SCHEMA: Record<Season, SeasonalSchema> = {
  summer: {
    primaryService: 'Lawn Mowing & Maintenance',
    serviceDescription: 'Weekly lawn mowing, herbicide, fertilization, aeration, and property maintenance services',
    priceRange: '$$',
  },
  fall: {
    primaryService: 'Fall Cleanup & Leaf Removal',
    serviceDescription: 'Complete fall leaf removal, gutter cleaning, aeration, and yard preparation services',
    priceRange: '$$',
  },
  winter: {
    primaryService: 'Snow Removal & Plowing',
    serviceDescription: '24/7 snow plowing, driveway clearing, and ice management services',
    priceRange: '$$',
  },
} as const;

// ============================================
// GEOGRAPHIC CONFIGURATION
// ============================================
export const GEO_CONFIG = {
  region: 'US-WI',
  primaryCity: 'Madison',
  state: 'Wisconsin',
  stateAbbr: 'WI',
  serviceAreas: [
    'Madison', 'Middleton', 'Sun Prairie', 'Fitchburg', 'Verona',
    'Waunakee', 'DeForest', 'Monona', 'McFarland', 'Oregon',
    'Stoughton', 'Cottage Grove'
  ],
  coordinates: {
    latitude: 43.0731,
    longitude: -89.4012,
  },
} as const;

// ============================================
// BUSINESS CONFIGURATION
// ============================================
export const BUSINESS_CONFIG = {
  name: 'TG Yard Care',
  legalName: 'TotalGuard Yard Care LLC',
  phone: '608-535-6057',
  phoneFormatted: '+1-608-535-6057',
  email: 'totalguardllc@gmail.com',
  website: 'https://tgyardcare.com',
  foundedYear: 2017,
  socialMedia: {
    facebook: 'https://facebook.com/totalguardyardcare',
    instagram: 'https://instagram.com/tgyardcare',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the current year's season label (e.g., "Spring 2025")
 */
export function getSeasonLabel(season: Season): string {
  const year = new Date().getFullYear();
  const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
  return `${capitalizedSeason} ${year}`;
}

/**
 * Get seasonal stats for a specific season
 */
export function getSeasonalStats(season: Season): SeasonalStats {
  return SEASONAL_STATS[season];
}

/**
 * Get seasonal SEO config for a specific season
 */
export function getSeasonalSEO(season: Season): SeasonalSEO {
  return SEASONAL_SEO[season];
}

/**
 * Get seasonal schema data for structured data
 */
export function getSeasonalSchema(season: Season): SeasonalSchema {
  return SEASONAL_SCHEMA[season];
}
