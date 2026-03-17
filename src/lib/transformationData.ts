export type ServiceCategory =
  | 'mowing'
  | 'leaf-cleanup'
  | 'snow-removal'
  | 'hardscaping'
  | 'gutter-cleaning'
  | 'mulching'
  | 'spring-cleanup'
  | 'fall-cleanup';

export interface TransformationPair {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  service: ServiceCategory;
  neighborhood: string;
  description?: string;
}

export const serviceCategories: { value: ServiceCategory; label: string }[] = [
  { value: 'mowing', label: 'Lawn Mowing' },
  { value: 'leaf-cleanup', label: 'Leaf Cleanup' },
  { value: 'snow-removal', label: 'Snow Removal' },
  { value: 'hardscaping', label: 'Hardscaping' },
  { value: 'gutter-cleaning', label: 'Gutter Cleaning' },
  { value: 'mulching', label: 'Mulching' },
  { value: 'spring-cleanup', label: 'Spring Cleanup' },
  { value: 'fall-cleanup', label: 'Fall Cleanup' },
];

export const transformations: TransformationPair[] = [
  // ── Mowing (4) ──────────────────────────────────────────────
  {
    id: 'mowing-middleton-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Overgrown lawn before mowing service in Middleton',
    afterAlt: 'Freshly mowed lawn after TotalGuard service in Middleton',
    service: 'mowing',
    neighborhood: 'Middleton',
    description: 'Weekly mowing transformation — 3 weeks of consistent service',
  },
  {
    id: 'mowing-waunakee-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Tall grass before mowing in Waunakee neighborhood',
    afterAlt: 'Clean-cut lawn after TotalGuard mowing in Waunakee',
    service: 'mowing',
    neighborhood: 'Waunakee',
    description: 'Bi-weekly mowing with edging and trimming included',
  },
  {
    id: 'mowing-westside-01',
    beforeSrc: '/lovable-uploads/mowing-ba-3.png',
    afterSrc: '/lovable-uploads/mowing-ba-3.png',
    beforeAlt: 'Unkempt yard before mowing on the West Side of Madison',
    afterAlt: 'Manicured lawn after TotalGuard mowing on West Side Madison',
    service: 'mowing',
    neighborhood: 'West Side Madison',
    description: 'Full-yard mowing with stripe pattern finish',
  },
  {
    id: 'mowing-sunprairie-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Neglected lawn before mowing service in Sun Prairie',
    afterAlt: 'Professionally mowed lawn in Sun Prairie by TotalGuard',
    service: 'mowing',
    neighborhood: 'Sun Prairie',
    description: 'Seasonal mowing contract — first service of the year',
  },

  // ── Leaf Cleanup (3) ───────────────────────────────────────
  {
    id: 'leaf-fitchburg-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Yard covered in fallen leaves in Fitchburg before cleanup',
    afterAlt: 'Clean yard after TotalGuard leaf removal in Fitchburg',
    service: 'leaf-cleanup',
    neighborhood: 'Fitchburg',
    description: 'Full leaf removal with curbside collection',
  },
  {
    id: 'leaf-verona-01',
    beforeSrc: '/lovable-uploads/mowing-ba-3.png',
    afterSrc: '/lovable-uploads/mowing-ba-3.png',
    beforeAlt: 'Heavy leaf buildup on Verona property before service',
    afterAlt: 'Leaf-free lawn after TotalGuard cleanup in Verona',
    service: 'leaf-cleanup',
    neighborhood: 'Verona',
    description: 'Late-season leaf cleanup with gutter check',
  },
  {
    id: 'leaf-crossplains-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Leaves blanketing a Cross Plains yard before service',
    afterAlt: 'Pristine lawn after leaf cleanup in Cross Plains',
    service: 'leaf-cleanup',
    neighborhood: 'Cross Plains',
    description: 'Oak and maple leaf removal from front and back yards',
  },

  // ── Snow Removal (3) ───────────────────────────────────────
  {
    id: 'snow-downtown-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Snow-covered driveway in Downtown Madison before plowing',
    afterAlt: 'Clear driveway after TotalGuard snow removal in Downtown Madison',
    service: 'snow-removal',
    neighborhood: 'Downtown Madison',
    description: 'Overnight snow removal — driveway and walkways cleared by 7 AM',
  },
  {
    id: 'snow-middleton-01',
    beforeSrc: '/lovable-uploads/mowing-ba-3.png',
    afterSrc: '/lovable-uploads/mowing-ba-3.png',
    beforeAlt: 'Heavy snowfall blocking Middleton driveway before service',
    afterAlt: 'Plowed and salted driveway in Middleton after TotalGuard service',
    service: 'snow-removal',
    neighborhood: 'Middleton',
    description: 'Commercial-grade plowing with de-icing treatment',
  },
  {
    id: 'snow-waunakee-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Ice and snow buildup on Waunakee walkway before treatment',
    afterAlt: 'Safe, clear walkway after TotalGuard snow service in Waunakee',
    service: 'snow-removal',
    neighborhood: 'Waunakee',
    description: 'Sidewalk and porch snow removal with salt application',
  },

  // ── Hardscaping (2) ────────────────────────────────────────
  {
    id: 'hardscape-sunprairie-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Bare dirt patio area in Sun Prairie before hardscaping',
    afterAlt: 'Finished paver patio installed by TotalGuard in Sun Prairie',
    service: 'hardscaping',
    neighborhood: 'Sun Prairie',
    description: 'Custom paver patio with border edging — 200 sq ft',
  },
  {
    id: 'hardscape-mounthoreb-01',
    beforeSrc: '/lovable-uploads/mowing-ba-3.png',
    afterSrc: '/lovable-uploads/mowing-ba-3.png',
    beforeAlt: 'Crumbling retaining wall in Mount Horeb before rebuild',
    afterAlt: 'New stone retaining wall by TotalGuard in Mount Horeb',
    service: 'hardscaping',
    neighborhood: 'Mount Horeb',
    description: 'Retaining wall replacement with natural stone',
  },

  // ── Gutter Cleaning (2) ────────────────────────────────────
  {
    id: 'gutter-westside-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Clogged gutters overflowing on West Side Madison home',
    afterAlt: 'Clean gutters with proper drainage after TotalGuard service',
    service: 'gutter-cleaning',
    neighborhood: 'West Side Madison',
    description: 'Full gutter cleanout with downspout flush',
  },
  {
    id: 'gutter-fitchburg-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Debris-filled gutters on Fitchburg property before cleaning',
    afterAlt: 'Spotless gutters after TotalGuard cleaning in Fitchburg',
    service: 'gutter-cleaning',
    neighborhood: 'Fitchburg',
    description: 'Spring gutter cleaning with leaf guard inspection',
  },

  // ── Mulching (2) ───────────────────────────────────────────
  {
    id: 'mulch-verona-01',
    beforeSrc: '/lovable-uploads/mowing-ba-3.png',
    afterSrc: '/lovable-uploads/mowing-ba-3.png',
    beforeAlt: 'Bare flower beds in Verona before mulch application',
    afterAlt: 'Fresh cedar mulch in Verona beds by TotalGuard',
    service: 'mulching',
    neighborhood: 'Verona',
    description: 'Cedar mulch installation — 5 cubic yards across front beds',
  },
  {
    id: 'mulch-windsor-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Faded old mulch around Windsor property landscaping',
    afterAlt: 'Vibrant new mulch installed by TotalGuard in Windsor',
    service: 'mulching',
    neighborhood: 'Windsor',
    description: 'Hardwood mulch refresh with weed barrier underlayment',
  },

  // ── Spring Cleanup (2) ─────────────────────────────────────
  {
    id: 'spring-middleton-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Winter debris covering Middleton yard before spring cleanup',
    afterAlt: 'Cleaned and prepped Middleton yard after TotalGuard spring service',
    service: 'spring-cleanup',
    neighborhood: 'Middleton',
    description: 'Full spring cleanup — debris removal, bed edging, first mow',
  },
  {
    id: 'spring-waunakee-01',
    beforeSrc: '/lovable-uploads/mowing-ba-3.png',
    afterSrc: '/lovable-uploads/mowing-ba-3.png',
    beforeAlt: 'Matted grass and sticks in Waunakee yard before spring service',
    afterAlt: 'Refreshed Waunakee lawn after TotalGuard spring cleanup',
    service: 'spring-cleanup',
    neighborhood: 'Waunakee',
    description: 'Dethatching, aeration, and overseeding package',
  },

  // ── Fall Cleanup (2) ───────────────────────────────────────
  {
    id: 'fall-sunprairie-01',
    beforeSrc: '/lovable-uploads/mowing-ba-1.png',
    afterSrc: '/lovable-uploads/mowing-ba-1.png',
    beforeAlt: 'Sun Prairie yard littered with fall debris before cleanup',
    afterAlt: 'Tidy Sun Prairie property after TotalGuard fall cleanup',
    service: 'fall-cleanup',
    neighborhood: 'Sun Prairie',
    description: 'End-of-season cleanup with leaf removal and bed prep',
  },
  {
    id: 'fall-crossplains-01',
    beforeSrc: '/lovable-uploads/mowing-ba-2.png',
    afterSrc: '/lovable-uploads/mowing-ba-2.png',
    beforeAlt: 'Autumn leaves and branches across Cross Plains yard',
    afterAlt: 'Winter-ready Cross Plains property after TotalGuard fall service',
    service: 'fall-cleanup',
    neighborhood: 'Cross Plains',
    description: 'Complete fall prep — leaf removal, gutter flush, final mow',
  },
];
