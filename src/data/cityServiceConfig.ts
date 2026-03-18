// cityServiceConfig.ts — Phase 10 SEO Dominance Engine
// 8 services × 12 cities = 96 city-service pages
// This is the data layer. No UI here.

// ─── Types ────────────────────────────────────────────────────────────────────

export type Service = typeof SERVICES[number];

export interface City {
  slug: string;
  name: string;
  county: string;
  coordinates: { lat: number; lng: number };
  neighborhoods: string[];
  yardChallenges: string[];
  characteristics: string;
  nearbySlug: string[];
}

export interface FAQ {
  q: string;
  a: string;
}

export interface CityServiceContent {
  service: Service;
  city: City;
  nearbyServices: readonly Service[];
  nearbyCities: City[];
  faqs: FAQ[];
  title: string;
  description: string;
  canonical: string;
}

// ─── Services (8) ─────────────────────────────────────────────────────────────

export const SERVICES = [
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing',
    shortName: 'Mowing',
    emoji: '🌿',
    startingPrice: 45,
    priceUnit: 'visit',
    included: ['Precision mowing at optimal height', 'String trimming edges & borders', 'Blowing clippings from hard surfaces', 'Debris removal from mowing area'],
    seasonality: 'April through November (weekly or bi-weekly)',
  },
  {
    slug: 'fertilization-weed-control',
    name: 'Fertilization & Weed Control',
    shortName: 'Fertilization',
    emoji: '🌱',
    startingPrice: 89,
    priceUnit: 'treatment',
    included: ['Soil-matched fertilizer blend', 'Pre-emergent crabgrass control', 'Broadleaf weed treatment', '5-step annual program'],
    seasonality: 'April through October (5 applications)',
  },
  {
    slug: 'gutter-cleaning',
    name: 'Gutter Cleaning',
    shortName: 'Gutters',
    emoji: '🏠',
    startingPrice: 149,
    priceUnit: 'service',
    included: ['Hand-remove all debris from gutters', 'Flush downspouts with high pressure', 'Check for proper drainage flow', 'Bag and remove all debris'],
    seasonality: 'Spring (May) and Fall (October–November)',
  },
  {
    slug: 'gutter-guard-installation',
    name: 'Gutter Guard Installation',
    shortName: 'Gutter Guards',
    emoji: '🛡️',
    startingPrice: 299,
    priceUnit: 'project',
    included: ['Micro-mesh gutter guard system', 'Professional installation by length', 'Gutter cleaning before install', '5-year manufacturer warranty'],
    seasonality: 'Year-round installation available',
  },
  {
    slug: 'fall-cleanup',
    name: 'Fall Cleanup',
    shortName: 'Fall Cleanup',
    emoji: '🍂',
    startingPrice: 199,
    priceUnit: 'cleanup',
    included: ['Complete leaf removal from lawn & beds', 'Haul all debris off property', 'Edge cleanup & bed borders', 'Final mowing at winter height'],
    seasonality: 'September through December',
  },
  {
    slug: 'spring-cleanup',
    name: 'Spring Cleanup',
    shortName: 'Spring Cleanup',
    emoji: '🌸',
    startingPrice: 179,
    priceUnit: 'cleanup',
    included: ['Remove winter debris & dead material', 'Edge beds and clean borders', 'First mow of season', 'Inspect lawn for winter damage'],
    seasonality: 'March through May',
  },
  {
    slug: 'snow-removal',
    name: 'Snow Removal',
    shortName: 'Snow Removal',
    emoji: '❄️',
    startingPrice: 65,
    priceUnit: 'visit',
    included: ['Driveway and walkway clearing', 'Salt/sand application for ice control', '24-hour service after snowfall', 'Seasonal contract options available'],
    seasonality: 'November through March',
  },
  {
    slug: 'hardscaping',
    name: 'Hardscaping',
    shortName: 'Hardscaping',
    emoji: '🪨',
    startingPrice: 1500,
    priceUnit: 'project',
    included: ['Patio design and installation', 'Retaining walls and edging', 'Proper gravel base for Wisconsin freeze-thaw', 'Permit coordination if required'],
    seasonality: 'April through November',
  },
] as const;

// ─── Cities (12, Dane County WI) ──────────────────────────────────────────────

export const CITIES: City[] = [
  {
    slug: 'madison',
    name: 'Madison',
    county: 'Dane County',
    coordinates: { lat: 43.0731, lng: -89.4012 },
    neighborhoods: ['Nakoma', 'Maple Bluff', 'Shorewood Hills', 'Westmorland', 'Regent', 'Willy Street', 'Tenney-Lapham'],
    yardChallenges: [
      'Heavy clay soil causes drainage issues and compaction across many neighborhoods',
      'Dense mature tree canopy creates heavy shade and significant seasonal debris load',
      'Lake proximity means elevated moisture, unique pest pressure, and shoreline concerns',
    ],
    characteristics: "Madison's established neighborhoods feature mature trees, clay-heavy soil, and lakeside properties that demand expert seasonal care to protect their long-term value.",
    nearbySlug: ['middleton', 'fitchburg', 'monona', 'sun-prairie'],
  },
  {
    slug: 'middleton',
    name: 'Middleton',
    county: 'Dane County',
    coordinates: { lat: 43.1053, lng: -89.5040 },
    neighborhoods: ['Pheasant Branch', 'Bishops Bay', 'Century Farm', 'Greenway Station', 'Stone Creek'],
    yardChallenges: [
      'Rapid new construction leaves compacted subsoil that needs expert remediation before turf establishes',
      'Prairie-adjacent lots experience aggressive weed pressure from surrounding seed banks',
    ],
    characteristics: "Middleton's mix of established suburbs and ongoing new construction creates diverse lawn care needs — from restoring compacted builder soil to maintaining mature estates near Pheasant Branch Conservancy.",
    nearbySlug: ['madison', 'waunakee', 'verona'],
  },
  {
    slug: 'waunakee',
    name: 'Waunakee',
    county: 'Dane County',
    coordinates: { lat: 43.1928, lng: -89.4590 },
    neighborhoods: ['Westbury', 'Prairie Crossing', 'River Oaks', 'Brookstone', 'Sugar River'],
    yardChallenges: [
      'Newer subdivisions built on former agricultural land have variable soil quality and thin topsoil',
      'High wind exposure from open terrain accelerates soil moisture loss between service visits',
    ],
    characteristics: "Waunakee's fast-growing community features newer properties with young landscaping that benefits from expert soil remediation and establishment programs tailored to former farmland.",
    nearbySlug: ['middleton', 'madison', 'deforest'],
  },
  {
    slug: 'sun-prairie',
    name: 'Sun Prairie',
    county: 'Dane County',
    coordinates: { lat: 43.1836, lng: -89.2137 },
    neighborhoods: ['American Center', 'Token Creek', 'Old Town', 'Prairie View', 'Cardinal Glenn'],
    yardChallenges: [
      'Flat topography leads to pooling and standing water after heavy Wisconsin rains',
      'High wind exposure from open terrain increases water evaporation and stresses turf',
    ],
    characteristics: "Sun Prairie's open landscape and rapidly growing neighborhoods create turf challenges that require expertise in both new lawn establishment and long-term maintenance on flat, wind-exposed lots.",
    nearbySlug: ['madison', 'cottage-grove', 'deforest'],
  },
  {
    slug: 'fitchburg',
    name: 'Fitchburg',
    county: 'Dane County',
    coordinates: { lat: 43.0286, lng: -89.4226 },
    neighborhoods: ['Seminole', 'Leopold', 'Swan Creek', 'Capital Springs', 'Nine Springs'],
    yardChallenges: [
      'Mixed soil types across hilly terrain require a property-by-property assessment approach',
      'Heavy tree coverage in older sections creates deep shade and root competition for turf',
    ],
    characteristics: "Fitchburg's rolling terrain and mix of urban and rural edges create a diverse range of lawn care challenges best handled by experienced professionals with local knowledge.",
    nearbySlug: ['madison', 'verona', 'oregon'],
  },
  {
    slug: 'monona',
    name: 'Monona',
    county: 'Dane County',
    coordinates: { lat: 43.0633, lng: -89.3357 },
    neighborhoods: ['Winnequah', 'Maywood', 'Schluter', 'Tonyawatha Trail', 'Lake Ridge'],
    yardChallenges: [
      'Compact lakefront lots require precision equipment handling with minimal margin for error',
      'Lake proximity creates high-moisture conditions favorable to turf disease and moss',
    ],
    characteristics: "Monona's lakefront character and compact neighborhood lots demand the precision and care that TotalGuard has delivered to this close-knit community for years.",
    nearbySlug: ['madison', 'mcfarland', 'cottage-grove'],
  },
  {
    slug: 'verona',
    name: 'Verona',
    county: 'Dane County',
    coordinates: { lat: 42.9905, lng: -89.5326 },
    neighborhoods: ['Black Earth Creek', 'Valley View', 'Prairie Creek', 'West End', 'Liberty Hills'],
    yardChallenges: [
      'Rural-edge properties face significant wildlife pressure from deer, rabbits, and voles',
      'Oak-heavy areas produce heavy acorn and leaf loads that require multi-pass cleanup sessions',
    ],
    characteristics: "Verona's blend of suburban neighborhoods and rural character creates properties that benefit from TotalGuard's expertise with both compact city lots and larger acreage parcels near Black Earth Creek.",
    nearbySlug: ['fitchburg', 'middleton', 'madison', 'oregon'],
  },
  {
    slug: 'mcfarland',
    name: 'McFarland',
    county: 'Dane County',
    coordinates: { lat: 43.0153, lng: -89.2942 },
    neighborhoods: ['Lake Farm', 'McFarland Meadows', 'Elf Lake Road', 'Yahara Hills', 'South Shore'],
    yardChallenges: [
      'Lake-adjacent properties experience extremely wet springs followed by summer dry spells',
      'New development areas have thin topsoil laid over heavy clay subsoil that resists water absorption',
    ],
    characteristics: "McFarland's lakeside character and growing residential areas create a unique service environment where local knowledge of Dane County soils and seasonal patterns makes a real difference.",
    nearbySlug: ['monona', 'cottage-grove', 'stoughton'],
  },
  {
    slug: 'cottage-grove',
    name: 'Cottage Grove',
    county: 'Dane County',
    coordinates: { lat: 43.0717, lng: -89.1997 },
    neighborhoods: ['Cottage Grove Village', 'Thompson Road', 'River Road', 'Oak Crest', 'Meadow Valley'],
    yardChallenges: [
      'Rapid residential growth means many properties have young, still-establishing turf that needs expert care',
      'Agricultural land conversion creates highly variable soil profiles within the same development',
    ],
    characteristics: "Cottage Grove is one of Dane County's fastest-growing communities, creating strong demand for professional lawn care that helps new lawns establish and thrive from the start.",
    nearbySlug: ['mcfarland', 'sun-prairie', 'stoughton'],
  },
  {
    slug: 'deforest',
    name: 'DeForest',
    county: 'Dane County',
    coordinates: { lat: 43.2494, lng: -89.3429 },
    neighborhoods: ['River Road', 'Windsor Park', 'Prairie Ridge', 'Airport Road', 'North DeForest'],
    yardChallenges: [
      'Cold air pockets in low-lying terrain mean later spring green-up and earlier fall kill than Madison',
      'Late spring frost risk requires delayed fertilization timing compared to properties further south',
    ],
    characteristics: "DeForest's northern position in Dane County creates a slightly different growing calendar that TotalGuard accounts for with location-specific service timing — starting and ending the season at the right moment.",
    nearbySlug: ['waunakee', 'sun-prairie', 'madison'],
  },
  {
    slug: 'oregon',
    name: 'Oregon',
    county: 'Dane County',
    coordinates: { lat: 42.9244, lng: -89.3743 },
    neighborhoods: ['Oregon Prairie', 'Netherwood', 'Fish Lake Road', 'Liberty', 'Pioneer Heights'],
    yardChallenges: [
      'Rural acreage lots require different equipment configurations and multi-pass service protocols',
      'Thick thatch buildup is common on older Oregon properties that have never had professional care',
    ],
    characteristics: "Oregon's mix of village properties and rural acreage creates a diverse client base that values TotalGuard's ability to handle both compact residential lots and large rural estates with equal expertise.",
    nearbySlug: ['fitchburg', 'verona', 'stoughton'],
  },
  {
    slug: 'stoughton',
    name: 'Stoughton',
    county: 'Dane County',
    coordinates: { lat: 42.9167, lng: -89.2218 },
    neighborhoods: ['Downtown Stoughton', 'East Side Bluffs', 'Lake Kegonsa', 'Viking Drive', 'Kegonsa Park'],
    yardChallenges: [
      'Lake Kegonsa proximity creates high-moisture conditions in eastern neighborhoods prone to disease',
      'Bluff terrain creates complex drainage patterns that require knowledge of local topography',
    ],
    characteristics: "Stoughton's proud community character and established neighborhoods create a client base that values consistent, high-quality service that respects their investment and their Norwegian-heritage properties.",
    nearbySlug: ['mcfarland', 'cottage-grove', 'oregon'],
  },
];

// ─── Adjacency Map ─────────────────────────────────────────────────────────────

export const CITY_ADJACENCY: Record<string, string[]> = {
  madison: ['middleton', 'fitchburg', 'monona', 'sun-prairie'],
  middleton: ['madison', 'waunakee', 'verona'],
  waunakee: ['middleton', 'madison', 'deforest'],
  'sun-prairie': ['madison', 'cottage-grove', 'deforest'],
  fitchburg: ['madison', 'verona', 'oregon'],
  monona: ['madison', 'mcfarland', 'cottage-grove'],
  verona: ['fitchburg', 'middleton', 'madison', 'oregon'],
  mcfarland: ['monona', 'cottage-grove', 'stoughton'],
  'cottage-grove': ['mcfarland', 'sun-prairie', 'stoughton'],
  deforest: ['waunakee', 'sun-prairie', 'madison'],
  oregon: ['fitchburg', 'verona', 'stoughton'],
  stoughton: ['mcfarland', 'cottage-grove', 'oregon'],
};

// ─── FAQ Generator ─────────────────────────────────────────────────────────────

function generateFAQs(service: Service, city: City): FAQ[] {
  const frequencyAnswer = (() => {
    if (service.slug === 'lawn-mowing') {
      return 'weekly mowing during the growing season (May–October)';
    }
    if (service.slug === 'fertilization-weed-control') {
      return 'a 4–5 application program spread throughout the growing season';
    }
    if (service.slug === 'snow-removal') {
      return 'per-event or seasonal contracts depending on your budget and risk tolerance';
    }
    return 'scheduling annually to keep your property in peak condition year over year';
  })();

  return [
    {
      q: `How much does ${service.name.toLowerCase()} cost in ${city.name}?`,
      a: `${service.name} in ${city.name} starts at $${service.startingPrice} per ${service.priceUnit}. Exact pricing depends on your lot size, property access, and service frequency. We offer free estimates — call (608) 535-6057 or get a quote online and we'll respond same day.`,
    },
    {
      q: `Does TotalGuard serve all of ${city.name}?`,
      a: `Yes, we serve all neighborhoods in ${city.name} including ${city.neighborhoods.join(', ')} and all surrounding areas. We're a Dane County team, so we know ${city.name} properties — the soil, the seasonal timing, and the local challenges — inside and out.`,
    },
    {
      q: `How often should I schedule ${service.name.toLowerCase()} for my ${city.name} property?`,
      a: `For ${city.name} properties, we recommend ${frequencyAnswer}. Our team will assess your specific yard, soil type, and landscape during a free walk-through and recommend the right frequency and program for your situation.`,
    },
  ];
}

// ─── Core Functions ────────────────────────────────────────────────────────────

/**
 * Returns 96 { cityService: string } objects for Next.js generateStaticParams.
 * Format: "{service-slug}-{city-slug}-wi"
 */
export function getCityServiceParams(): { cityService: string }[] {
  return CITIES.flatMap(city =>
    SERVICES.map(service => ({
      cityService: `${service.slug}-${city.slug}-wi`,
    }))
  );
}

/**
 * Parse a slug like "lawn-mowing-madison-wi" into full content.
 * Returns null if slug doesn't match any valid combination.
 */
export function parseCityService(slug: string): CityServiceContent | null {
  for (const service of SERVICES) {
    const withoutService = slug.replace(`${service.slug}-`, '');
    const citySlug = withoutService.replace(/-wi$/, '');
    const city = CITIES.find(c => c.slug === citySlug);
    if (city && slug === `${service.slug}-${city.slug}-wi`) {
      return getCityServiceContent(service.slug, city.slug);
    }
  }
  return null;
}

/**
 * Build the full content object for a given service + city combination.
 * Returns null if either slug is invalid.
 */
export function getCityServiceContent(serviceSlug: string, citySlug: string): CityServiceContent | null {
  const service = SERVICES.find(s => s.slug === serviceSlug);
  const city = CITIES.find(c => c.slug === citySlug);
  if (!service || !city) return null;

  const adjacentSlugs = CITY_ADJACENCY[citySlug] ?? city.nearbySlug;
  const nearbyCities = adjacentSlugs
    .map(slug => CITIES.find(c => c.slug === slug))
    .filter((c): c is City => c !== undefined);

  return {
    service,
    city,
    nearbyServices: SERVICES.filter(s => s.slug !== serviceSlug),
    nearbyCities,
    faqs: generateFAQs(service, city),
    title: `${service.name} in ${city.name}, WI | TotalGuard Yard Care`,
    description: `Professional ${service.name.toLowerCase()} in ${city.name}, WI. ${city.characteristics} Starting at $${service.startingPrice}. Call (608) 535-6057.`,
    canonical: `https://tgyardcare.com/${service.slug}-${city.slug}-wi`,
  };
}
