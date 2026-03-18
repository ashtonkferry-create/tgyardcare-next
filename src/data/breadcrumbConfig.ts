// src/data/breadcrumbConfig.ts
import { CITIES, SERVICES } from '@/data/cityServiceConfig';

// ── Slug → human label map ────────────────────────────────────────────────────
export const BREADCRUMB_LABELS: Record<string, string> = {
  // Route segments
  services: 'Services',
  commercial: 'Commercial',
  residential: 'Residential Services',
  locations: 'Service Areas',
  'service-areas': 'Service Areas',
  blog: 'Blog',
  category: 'Category',
  about: 'About',
  team: 'Our Team',
  reviews: 'Reviews',
  gallery: 'Gallery',
  faq: 'FAQ',
  contact: 'Contact',
  careers: 'Careers',
  'get-quote': 'Get a Quote',
  'annual-plan': 'Annual Plan',
  'lawn-care-guide': 'Lawn Care Guide',
  'lawn-care-costs-dane-county': 'Lawn Care Costs',
  'seasonal-lawn-calendar-madison': 'Seasonal Calendar',
  'lawn-care-madison-wi': 'Lawn Care in Madison',
  'lawn-care-middleton-wi': 'Lawn Care in Middleton',
  'gutter-cleaning-madison-wi': 'Gutter Cleaning in Madison',
  'snow-removal-madison-wi': 'Snow Removal in Madison',
  // Service slugs
  mowing: 'Lawn Mowing',
  fertilization: 'Fertilization & Weed Control',
  'fertilization-weed-control': 'Fertilization & Weed Control',
  herbicide: 'Herbicide Treatment',
  weeding: 'Weeding',
  mulching: 'Mulching',
  'garden-beds': 'Garden Beds',
  pruning: 'Bush Trimming & Pruning',
  'spring-cleanup': 'Spring Cleanup',
  'fall-cleanup': 'Fall Cleanup',
  'leaf-removal': 'Leaf Removal',
  aeration: 'Aeration',
  'gutter-cleaning': 'Gutter Cleaning',
  'gutter-guards': 'Gutter Guards',
  'snow-removal': 'Snow Removal',
  hardscaping: 'Hardscaping',
  // Commercial sub-routes
  'lawn-care': 'Lawn Care',
  'property-enhancement': 'Property Enhancement',
  seasonal: 'Seasonal Services',
  gutters: 'Gutter Services',
  // City slugs
  madison: 'Madison',
  middleton: 'Middleton',
  waunakee: 'Waunakee',
  'sun-prairie': 'Sun Prairie',
  monona: 'Monona',
  fitchburg: 'Fitchburg',
  verona: 'Verona',
  mcfarland: 'McFarland',
  deforest: 'DeForest',
  'cottage-grove': 'Cottage Grove',
  oregon: 'Oregon',
  stoughton: 'Stoughton',
};

// ── City-service slug resolver ────────────────────────────────────────────────
// Handles slugs like "fall-cleanup-oregon-wi" or "lawn-mowing-madison-wi"
export interface ResolvedCityService {
  citySlug: string;
  cityName: string;
  serviceSlug: string;
  serviceName: string;
}

export function resolveCityService(slug: string): ResolvedCityService | null {
  // Must end in -wi
  if (!slug.endsWith('-wi')) return null;
  const withoutWi = slug.slice(0, -3); // remove "-wi"

  // Try every city slug to find a match
  for (const city of CITIES) {
    if (withoutWi.endsWith(`-${city.slug}`)) {
      const serviceSlug = withoutWi.slice(0, -(city.slug.length + 1));
      const service = SERVICES.find(s => s.slug === serviceSlug);
      if (service) {
        return {
          citySlug: city.slug,
          cityName: city.name,
          serviceSlug: service.slug,
          serviceName: service.name,
        };
      }
    }
  }
  return null;
}

// ── Title case fallback for unknown slugs ────────────────────────────────────
export function titleCase(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .slice(0, 48);
}
