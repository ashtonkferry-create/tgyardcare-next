export interface ServiceConfig {
  slug: string;
  name: string;
  shortName: string;
  emoji: string;
  startingPrice: number;
  priceUnit: string;
  included: string[];
  seasonality: string;
}

export interface CityConfig {
  slug: string;
  name: string;
  neighborhoods: string[];
  yardChallenges: string[];
  characteristics: string;
  nearbySlugs: string[];
  coordinates: { lat: number; lng: number };
}

export const CITY_SERVICE_SERVICES: ServiceConfig[] = [
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing',
    shortName: 'Mowing',
    emoji: '\u{1F33F}',
    startingPrice: 45,
    priceUnit: 'visit',
    included: ['Precision mowing at optimal height', 'String trimming edges & borders', 'Blowing clippings from hard surfaces', 'Debris removal from mowing area'],
    seasonality: 'April through November (weekly or bi-weekly)',
  },
  {
    slug: 'fertilization-weed-control',
    name: 'Fertilization & Weed Control',
    shortName: 'Fertilization',
    emoji: '\u{1F331}',
    startingPrice: 89,
    priceUnit: 'treatment',
    included: ['Soil-matched fertilizer blend', 'Pre-emergent crabgrass control', 'Broadleaf weed treatment', '5-step annual program'],
    seasonality: 'April through October (5 applications)',
  },
  {
    slug: 'gutter-cleaning',
    name: 'Gutter Cleaning',
    shortName: 'Gutter Cleaning',
    emoji: '\u{1F3E0}',
    startingPrice: 149,
    priceUnit: 'service',
    included: ['Hand-remove all debris from gutters', 'Flush downspouts with high pressure', 'Check for proper drainage flow', 'Bag and remove all debris'],
    seasonality: 'Spring (May) and Fall (October\u2013November)',
  },
  {
    slug: 'gutter-guard-installation',
    name: 'Gutter Guard Installation',
    shortName: 'Gutter Guards',
    emoji: '\u{1F6E1}\uFE0F',
    startingPrice: 299,
    priceUnit: 'project',
    included: ['Micro-mesh gutter guard system', 'Professional installation by length', 'Gutter cleaning before install', '5-year manufacturer warranty'],
    seasonality: 'Year-round installation available',
  },
  {
    slug: 'fall-cleanup',
    name: 'Fall Cleanup',
    shortName: 'Fall Cleanup',
    emoji: '\u{1F342}',
    startingPrice: 199,
    priceUnit: 'cleanup',
    included: ['Complete leaf removal from lawn & beds', 'Haul all debris off property', 'Edge cleanup & bed borders', 'Final mowing at winter height'],
    seasonality: 'September through December',
  },
  {
    slug: 'spring-cleanup',
    name: 'Spring Cleanup',
    shortName: 'Spring Cleanup',
    emoji: '\u{1F338}',
    startingPrice: 179,
    priceUnit: 'cleanup',
    included: ['Remove winter debris & dead material', 'Edge beds and clean borders', 'First mow of season', 'Inspect lawn for winter damage'],
    seasonality: 'March through May',
  },
  {
    slug: 'snow-removal',
    name: 'Snow Removal',
    shortName: 'Snow Removal',
    emoji: '\u2744\uFE0F',
    startingPrice: 65,
    priceUnit: 'visit',
    included: ['Driveway and walkway clearing', 'Salt/sand application for ice control', '24-hour service after snowfall', 'Seasonal contract options available'],
    seasonality: 'November through March',
  },
  {
    slug: 'hardscaping',
    name: 'Hardscaping',
    shortName: 'Hardscaping',
    emoji: '\u{1FAA8}',
    startingPrice: 1500,
    priceUnit: 'project',
    included: ['Patio design and installation', 'Retaining walls and edging', 'Proper gravel base for Wisconsin freeze-thaw', 'Permit coordination if required'],
    seasonality: 'April through November',
  },
];

export const CITY_SERVICE_CITIES: CityConfig[] = [
  {
    slug: 'madison',
    name: 'Madison',
    neighborhoods: ['Nakoma', 'Maple Bluff', 'Shorewood Hills', 'Westmorland', 'Regent', 'Willy Street', 'Tenney-Lapham'],
    yardChallenges: ['Heavy clay soil causes drainage issues and compaction', 'Dense mature tree canopy creates heavy shade and debris', 'Lake proximity means high moisture and unique pest pressure'],
    characteristics: 'Madison\'s established neighborhoods feature mature trees, clay-heavy soil, and properties that demand expert seasonal care to maintain their value.',
    nearbySlugs: ['middleton', 'fitchburg', 'monona', 'sun-prairie'],
    coordinates: { lat: 43.0731, lng: -89.4012 },
  },
  {
    slug: 'middleton',
    name: 'Middleton',
    neighborhoods: ['Pheasant Branch', 'Bishops Bay', 'Century Farm', 'Greenway Station', 'Stone Creek'],
    yardChallenges: ['Rapid new construction creates compacted subsoil that needs remediation', 'Prairie-adjacent lots see aggressive weed pressure', 'Sandy loam areas drain too quickly, requiring deep watering schedules'],
    characteristics: 'Middleton\'s mix of established suburbs and new construction creates diverse lawn care needs, from restoring compacted builder soil to maintaining mature estates.',
    nearbySlugs: ['madison', 'waunakee', 'verona'],
    coordinates: { lat: 43.1053, lng: -89.5040 },
  },
  {
    slug: 'waunakee',
    name: 'Waunakee',
    neighborhoods: ['Westbury', 'Prairie Crossing', 'River Oaks', 'Brookstone', 'Sugar River'],
    yardChallenges: ['Newer subdivisions built on former agricultural land with variable soil quality', 'Flat terrain creates drainage challenges during heavy Wisconsin rains', 'High wind exposure from open areas accelerates soil moisture loss'],
    characteristics: 'Waunakee\'s fast-growing community features newer properties with young landscaping that benefits from expert establishment programs.',
    nearbySlugs: ['middleton', 'madison', 'deforest'],
    coordinates: { lat: 43.1928, lng: -89.4590 },
  },
  {
    slug: 'sun-prairie',
    name: 'Sun Prairie',
    neighborhoods: ['American Center', 'Token Creek', 'Old Town', 'Prairie View', 'Cardinal Glenn'],
    yardChallenges: ['Flat topography leads to pooling and standing water after heavy rains', 'High wind exposure from open terrain increases water evaporation', 'Rapid residential growth means many lawns need establishment care'],
    characteristics: 'Sun Prairie\'s open landscape and growing neighborhoods create unique turf challenges that require expertise in both establishment and maintenance.',
    nearbySlugs: ['madison', 'cottage-grove', 'deforest'],
    coordinates: { lat: 43.1836, lng: -89.2137 },
  },
  {
    slug: 'fitchburg',
    name: 'Fitchburg',
    neighborhoods: ['Seminole', 'Leopold', 'Swan Creek', 'Capital Springs', 'Nine Springs'],
    yardChallenges: ['Mixed soil types across hilly terrain require property-by-property assessment', 'Heavy tree coverage in older sections creates shade and root competition', 'Creek proximity means some areas see flooding and soil saturation'],
    characteristics: 'Fitchburg\'s rolling terrain and mix of urban and rural edges create a diverse range of lawn care challenges best handled by experienced professionals.',
    nearbySlugs: ['madison', 'verona', 'oregon'],
    coordinates: { lat: 43.0286, lng: -89.4226 },
  },
  {
    slug: 'monona',
    name: 'Monona',
    neighborhoods: ['Winnequah', 'Maywood', 'Schluter', 'Tonyawatha Trail', 'Lake Ridge'],
    yardChallenges: ['Compact lakefront lots require precision work with less margin for error', 'Lake proximity creates high-moisture conditions favorable to disease', 'Limited lot depth means efficient scheduling and precise equipment handling'],
    characteristics: 'Monona\'s lakefront character and compact neighborhood lots demand the precision and expertise that TotalGuard has provided to this community for years.',
    nearbySlugs: ['madison', 'mcfarland', 'cottage-grove'],
    coordinates: { lat: 43.0633, lng: -89.3357 },
  },
  {
    slug: 'verona',
    name: 'Verona',
    neighborhoods: ['Black Earth Creek', 'Valley View', 'Prairie Creek', 'West End', 'Liberty Hills'],
    yardChallenges: ['Rural-edge properties with significant wildlife pressure (deer, rabbits)', 'Oak-heavy areas produce heavy acorn and leaf loads requiring multi-pass cleanup', 'Variable lot sizes from quarter-acre city lots to multi-acre rural properties'],
    characteristics: 'Verona\'s blend of suburban neighborhoods and rural character creates properties that benefit from TotalGuard\'s expertise with both urban and acreage lawn care.',
    nearbySlugs: ['fitchburg', 'middleton', 'madison', 'oregon'],
    coordinates: { lat: 42.9905, lng: -89.5326 },
  },
  {
    slug: 'mcfarland',
    name: 'McFarland',
    neighborhoods: ['Lake Farm', 'McFarland Meadows', 'Elf Lake Road', 'Yahara Hills', 'South Shore'],
    yardChallenges: ['Lake-adjacent properties experience extreme wet springs followed by summer dry spells', 'Shoreline erosion pressure on lakefront properties requires careful service protocols', 'New development areas have thin topsoil over heavy clay subsoil'],
    characteristics: 'McFarland\'s lakeside character and growing residential areas create a unique service environment where precision and local knowledge make a real difference.',
    nearbySlugs: ['monona', 'cottage-grove', 'stoughton'],
    coordinates: { lat: 43.0153, lng: -89.2942 },
  },
  {
    slug: 'cottage-grove',
    name: 'Cottage Grove',
    neighborhoods: ['Cottage Grove Village', 'Thompson Road', 'River Road', 'Oak Crest', 'Meadow Valley'],
    yardChallenges: ['Rapid residential growth means many properties have young, establishing turf', 'Agricultural land conversion creates variable soil profiles', 'Community growth creates high seasonal service demand \u2014 early booking essential'],
    characteristics: 'Cottage Grove is one of Dane County\'s fastest-growing communities, creating strong demand for professional lawn care that helps new lawns establish and thrive.',
    nearbySlugs: ['mcfarland', 'sun-prairie', 'stoughton'],
    coordinates: { lat: 43.0717, lng: -89.1997 },
  },
  {
    slug: 'deforest',
    name: 'DeForest',
    neighborhoods: ['River Road', 'Windsor Park', 'Prairie Ridge', 'Airport Road', 'North DeForest'],
    yardChallenges: ['Cold air pockets from low-lying terrain mean later spring starts and early fall kills', 'Airport area sees high wind exposure that accelerates soil drying', 'Late spring frost risk requires delayed fertilization timing compared to Madison'],
    characteristics: 'DeForest\'s northern location in Dane County creates a slightly different growing calendar that TotalGuard accounts for with location-specific service timing.',
    nearbySlugs: ['waunakee', 'sun-prairie', 'madison'],
    coordinates: { lat: 43.2494, lng: -89.3429 },
  },
  {
    slug: 'oregon',
    name: 'Oregon',
    neighborhoods: ['Oregon Prairie', 'Netherwood', 'Fish Lake Road', 'Liberty', 'Pioneer Heights'],
    yardChallenges: ['Rural acreage lots require different equipment and multi-pass service protocols', 'Thick thatch buildup is common on older Oregon properties', 'Distance from Madison creates scheduling efficiencies that benefit regular clients'],
    characteristics: 'Oregon\'s mix of village properties and rural acreage creates a diverse client base that appreciates TotalGuard\'s ability to handle both compact neighborhoods and large estates.',
    nearbySlugs: ['fitchburg', 'verona', 'stoughton'],
    coordinates: { lat: 42.9244, lng: -89.3743 },
  },
  {
    slug: 'stoughton',
    name: 'Stoughton',
    neighborhoods: ['Downtown Stoughton', 'East Side Bluffs', 'Lake Kegonsa', 'Viking Drive', 'Kegonsa Park'],
    yardChallenges: ['Lake Kegonsa proximity creates high-moisture conditions in eastern neighborhoods', 'Established Norwegian-heritage properties feature mature landscapes needing expert care', 'Bluff terrain creates drainage patterns that require knowledge of local topography'],
    characteristics: 'Stoughton\'s proud community character and established neighborhoods create a client base that values consistent, high-quality service that respects their investment.',
    nearbySlugs: ['mcfarland', 'cottage-grove', 'oregon'],
    coordinates: { lat: 42.9167, lng: -89.2218 },
  },
];

export function getCityServiceParams(): { cityService: string }[] {
  const params: { cityService: string }[] = [];
  for (const service of CITY_SERVICE_SERVICES) {
    for (const city of CITY_SERVICE_CITIES) {
      params.push({ cityService: `${service.slug}-${city.slug}-wi` });
    }
  }
  return params; // 96 items
}

export function parseCityServiceSlug(slug: string): { service: ServiceConfig; city: CityConfig } | null {
  // slug format: {service-slug}-{city-slug}-wi
  // Try each service slug to find the match
  for (const service of CITY_SERVICE_SERVICES) {
    if (slug.startsWith(service.slug + '-') && slug.endsWith('-wi')) {
      const citySlug = slug.slice(service.slug.length + 1, -3); // remove service- prefix and -wi suffix
      const city = CITY_SERVICE_CITIES.find(c => c.slug === citySlug);
      if (city) return { service, city };
    }
  }
  return null;
}
