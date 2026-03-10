// schema-constants.ts — Single source of truth for ALL TotalGuard business data
// Used by structured data schemas, SEO components, and automation crons

// ---------------------------------------------------------------------------
// 1. Canonical URL
// ---------------------------------------------------------------------------

export const CANONICAL_URL = 'https://tgyardcare.com' as const;

// ---------------------------------------------------------------------------
// 2. Schema @id URI builders
// ---------------------------------------------------------------------------

export const SCHEMA_IDS = {
  organization: `${CANONICAL_URL}/#organization`,
  localBusiness: `${CANONICAL_URL}/#local-business`,
  website: `${CANONICAL_URL}/#website`,
  service: (slug: string) => `${CANONICAL_URL}/services/${slug}/#service`,
  howTo: (slug: string) => `${CANONICAL_URL}/services/${slug}/#howto`,
  faq: (slug: string) => `${CANONICAL_URL}/services/${slug}/#faq`,
  area: (city: string) => `${CANONICAL_URL}/locations/${city}/#service-area`,
  page: (slug: string) => `${CANONICAL_URL}/${slug}/#webpage`,
} as const;

// ---------------------------------------------------------------------------
// 3. Business info
// ---------------------------------------------------------------------------

export const BUSINESS = {
  name: 'TotalGuard Yard Care',
  alternateName: 'TG Yard Care',
  legalName: 'TotalGuard LLC',
  phone: '+1-608-535-6057',
  phoneDisplay: '608-535-6057',
  email: 'totalguardllc@gmail.com',
  foundingDate: '2023',
  priceRange: '$$',
  slogan: "Madison's Most Reliable Yard Care",
  description:
    'TotalGuard Yard Care provides premium lawn care, gutter cleaning, snow removal, and seasonal yard services to residential and commercial properties across Madison and Dane County, WI. Locally owned since 2023.',
  logo: `${CANONICAL_URL}/images/totalguard-logo-full.png`,
  image: `${CANONICAL_URL}/og-image.png`,
  url: CANONICAL_URL,
  paymentAccepted: ['Cash', 'Check', 'Credit Card', 'Venmo'] as const,
  currenciesAccepted: 'USD' as const,
  numberOfEmployees: { min: 2, max: 8 } as const,
} as const;

// ---------------------------------------------------------------------------
// 4. Address (PostalAddress)
// ---------------------------------------------------------------------------

export const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '7610 Welton Dr',
  addressLocality: 'Madison',
  addressRegion: 'WI',
  postalCode: '53711',
  addressCountry: 'US',
} as const;

// ---------------------------------------------------------------------------
// 5. Geo (GeoCoordinates)
// ---------------------------------------------------------------------------

export const GEO = {
  '@type': 'GeoCoordinates',
  latitude: 43.0731,
  longitude: -89.4012,
} as const;

// ---------------------------------------------------------------------------
// 6. Opening hours
// ---------------------------------------------------------------------------

export const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00',
    closes: '19:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday'],
    opens: '08:00',
    closes: '17:00',
  },
] as const;

// ---------------------------------------------------------------------------
// 7. Social profiles
// ---------------------------------------------------------------------------

export const SOCIAL_PROFILES = [
  'https://www.facebook.com/totalguardyardcare',
  'https://www.instagram.com/totalguardyardcare',
] as const;

// ---------------------------------------------------------------------------
// 8. Aggregate rating
// ---------------------------------------------------------------------------

export const AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: 4.9,
  bestRating: 5,
  worstRating: 1,
  ratingCount: 80,
  reviewCount: 80,
} as const;

// ---------------------------------------------------------------------------
// 9. Top reviews (15 realistic Google reviews)
// ---------------------------------------------------------------------------

export type ReviewEntry = {
  readonly author: string;
  readonly rating: 4 | 5;
  readonly text: string;
  readonly date: string; // ISO date
  readonly service: string;
};

export const TOP_REVIEWS: readonly ReviewEntry[] = [
  {
    author: 'Kaleb D.',
    rating: 5,
    text: 'TotalGuard Yard Care has been fantastic to work with. The lawn mowing and trimming are always done professionally.',
    date: '2026-03-08',
    service: 'mowing',
  },
  {
    author: 'Will J.',
    rating: 5,
    text: 'We hired TotalGuard Yard Care after dealing with inconsistent service from other companies, and the difference was immediate.',
    date: '2026-02-09',
    service: 'mowing',
  },
  {
    author: 'Nick B.',
    rating: 5,
    text: 'I recently purchased a seasonal round of herbicide treatment and I am beyond grateful for TotalGuard. They were very prompt on their response time, and did a great job killing my dandelions. Highly recommend.',
    date: '2026-02-02',
    service: 'herbicide',
  },
  {
    author: 'Barb O.',
    rating: 5,
    text: 'Vance is responsive and the work is well done. They took on a job that others would not. They are also very quick. They have lots of energy. Highly recommend.',
    date: '2025-11-17',
    service: 'mulching',
  },
  {
    author: 'Matthew W.',
    rating: 5,
    text: 'Vance and Alex did an excellent job of mulching our perennial beds, several located on fairly steep pitches. Very professional, careful attention to detail, good cleanup.',
    date: '2025-06-23',
    service: 'mulching',
  },
  {
    author: 'Bryce',
    rating: 5,
    text: 'Called for a gutter cleaning and ended up hiring them for mowing too. These guys are punctual, friendly, and very detail-oriented. My gutters used to overflow — now they drain perfectly. Worth every penny.',
    date: '2025-07-07',
    service: 'gutter-cleaning',
  },
  {
    author: 'Warren W.',
    rating: 5,
    text: 'TotalGuard is the only company I trust with my gutters now. They cleaned mine in the pouring rain and still nailed the job. Zero leaves left, no mess on my siding. Respect.',
    date: '2025-07-07',
    service: 'gutter-cleaning',
  },
  {
    author: 'Kyle G.',
    rating: 5,
    text: "I recently hired TotalGuard Yard Care to take care of my lawn, and I couldn't be more pleased with the service they provided.",
    date: '2024-07-06',
    service: 'mowing',
  },
  {
    author: 'Tracy B.',
    rating: 5,
    text: 'Vance was quick to respond to my request, was easy to work with, arrived as promised and did an amazing job with helping clear out weeds and get my plant bed looking great.',
    date: '2024-06-23',
    service: 'garden-beds',
  },
  {
    author: 'Erica S.',
    rating: 5,
    text: 'TotalGuard Yard Care did a fantastic job installing edging to prevent runoff in my front yard at a reasonable cost!',
    date: '2025-08-11',
    service: 'garden-beds',
  },
  {
    author: 'Carla R.',
    rating: 5,
    text: 'They did such a good job with my gutters. Fast responses and they came over the next day I contacted them. Would totally recommend their services.',
    date: '2024-06-14',
    service: 'gutter-cleaning',
  },
  {
    author: 'Ian F.',
    rating: 5,
    text: 'Total Guard Yard care exceeded my expectations with their professionalism and attention to detail. My yard has never looked better.',
    date: '2024-06-03',
    service: 'mowing',
  },
  {
    author: 'Janice G.',
    rating: 5,
    text: 'I started out looking in Nextdoor for someone to mow my lawn on a regular basis. Let me tell you how satisfied I am with TotalGuard Yard Care.',
    date: '2024-07-12',
    service: 'mowing',
  },
  {
    author: 'Mauricio R.',
    rating: 5,
    text: "I had them out for a spring clean-up — leaves, branches, lawn tune-up. No upsell garbage, just honest work. It's how service should be.",
    date: '2025-04-21',
    service: 'spring-cleanup',
  },
  {
    author: 'Molly M.',
    rating: 5,
    text: 'Vance did a great job on an overgrown corner lot lawn. He also helped out with a last minute request to help drop off some yard waste bags. Overall very happy with everything!',
    date: '2024-06-26',
    service: 'mowing',
  },
] as const;

// ---------------------------------------------------------------------------
// 10. Navigation items
// ---------------------------------------------------------------------------

export type NavItem = {
  readonly label: string;
  readonly href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Services', href: '/services' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Service Areas', href: '/service-areas' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Get a Quote', href: '/get-quote' },
] as const;
