-- Migration 066: Pricing System v2.0 Schema
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Replaces the per-unit calculation model (mig 022) with direct fixed-price lookups
-- matching TotalGuard's 15 services.
-- Does NOT drop or modify mig 022 tables (ai_service_pricing, etc.)

-- ============================================================
-- Table 1: pricing_services -- service definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'residential',  -- 'residential', 'commercial', 'specialty'

  -- Size system for this service
  size_system TEXT NOT NULL DEFAULT 'lot',  -- 'lot', 'linear-feet', 'per-visit', 'commercial-lot'

  -- Pricing model
  pricing_model TEXT NOT NULL DEFAULT 'fixed',  -- 'fixed', 'per-unit', 'hourly', 'custom', 'per-push', 'seasonal'
  per_unit_price NUMERIC(10,2),
  per_unit_label TEXT,
  hourly_rate NUMERIC(10,2),

  -- Minimums (per-service)
  minimum_one_time NUMERIC(10,2),
  minimum_recurring NUMERIC(10,2),

  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  seasonal_only BOOLEAN DEFAULT FALSE,
  season_start_month INTEGER,
  season_end_month INTEGER,

  -- Metadata
  description TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_services_slug ON pricing_services(slug);

-- ============================================================
-- Table 2: pricing_rates -- every price point
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES pricing_services(id) ON DELETE CASCADE,

  tier TEXT NOT NULL,        -- 'good', 'better', 'best'
  size_key TEXT NOT NULL,    -- 'small', 'medium', 'large', 'xl' (or service-specific)
  size_label TEXT NOT NULL,

  price NUMERIC(10,2) NOT NULL,
  price_max NUMERIC(10,2),   -- for commercial range pricing (most rows NULL)
  price_type TEXT NOT NULL DEFAULT 'one-time',  -- 'one-time', 'annual', 'seasonal', 'per-push', 'monthly', 'per-visit'

  includes TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(service_id, tier, size_key, price_type)
);

CREATE INDEX IF NOT EXISTS idx_pricing_rates_lookup ON pricing_rates(service_id, tier, size_key, price_type);

-- ============================================================
-- Table 3: pricing_multipliers -- adjustments
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,

  multiplier_type TEXT NOT NULL,  -- 'surcharge', 'discount', 'flat-fee'

  multiplier NUMERIC(6,4),       -- 1.25, 0.80, etc.
  flat_amount NUMERIC(10,2),     -- for flat fees

  applies_to TEXT[] DEFAULT '{all}',

  stackable BOOLEAN DEFAULT TRUE,
  max_discount_cap NUMERIC(4,2) DEFAULT 0.70,

  description TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_multipliers_slug ON pricing_multipliers(slug);

-- ============================================================
-- Table 4: pricing_bundles -- bundle definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_bundles_slug ON pricing_bundles(slug);

-- ============================================================
-- Table 5: pricing_bundle_services -- bundle membership
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_bundle_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES pricing_bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES pricing_services(id) ON DELETE CASCADE,

  default_tier TEXT,
  default_size_key TEXT,
  default_price_type TEXT,

  sort_order INTEGER DEFAULT 0,
  UNIQUE(bundle_id, service_id)
);

-- ============================================================
-- View: pricing_rate_card -- joins services + rates
-- ============================================================
CREATE OR REPLACE VIEW pricing_rate_card AS
SELECT
  s.slug AS service_slug,
  s.name AS service_name,
  s.category,
  s.size_system,
  s.pricing_model,
  r.tier,
  r.size_key,
  r.size_label,
  r.price,
  r.price_max,
  r.price_type,
  r.includes,
  s.minimum_one_time,
  s.minimum_recurring,
  s.seasonal_only,
  s.season_start_month,
  s.season_end_month,
  s.per_unit_price,
  s.per_unit_label,
  s.hourly_rate
FROM pricing_services s
LEFT JOIN pricing_rates r ON r.service_id = s.id
WHERE s.is_active = TRUE
ORDER BY s.sort_order, s.slug,
  CASE r.tier WHEN 'good' THEN 1 WHEN 'better' THEN 2 WHEN 'best' THEN 3 END,
  r.size_key;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE pricing_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_bundle_services ENABLE ROW LEVEL SECURITY;

-- Read access for all (public prices)
CREATE POLICY pricing_services_read ON pricing_services FOR SELECT USING (true);
CREATE POLICY pricing_rates_read ON pricing_rates FOR SELECT USING (true);
CREATE POLICY pricing_multipliers_read ON pricing_multipliers FOR SELECT USING (true);
CREATE POLICY pricing_bundles_read ON pricing_bundles FOR SELECT USING (true);
CREATE POLICY pricing_bundle_services_read ON pricing_bundle_services FOR SELECT USING (true);

-- Write access for service_role only
CREATE POLICY pricing_services_write ON pricing_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pricing_rates_write ON pricing_rates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pricing_multipliers_write ON pricing_multipliers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pricing_bundles_write ON pricing_bundles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pricing_bundle_services_write ON pricing_bundle_services FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA: pricing_services — TotalGuard's 15 services
-- ============================================================
INSERT INTO pricing_services (slug, name, category, size_system, pricing_model, per_unit_price, per_unit_label, hourly_rate, minimum_one_time, minimum_recurring, seasonal_only, season_start_month, season_end_month, description, sort_order)
VALUES
  -- Core Lawn Services (Residential)
  ('lawn-mowing',          'Lawn Mowing',                  'residential', 'lot',           'per-visit',  NULL, NULL, NULL,   45.00,  40.00, FALSE, NULL, NULL, 'Professional mowing, edging, blowing — weekly or bi-weekly', 1),
  ('fertilization',        'Fertilization',                'residential', 'lot',           'fixed',      NULL, NULL, NULL,   75.00,  65.00, FALSE, NULL, NULL, 'Seasonal fertilization program — up to 5 applications per year', 2),
  ('aeration',             'Lawn Aeration',                'residential', 'lot',           'fixed',      NULL, NULL, NULL,   95.00,  NULL,  FALSE, NULL, NULL, 'Core aeration to reduce compaction and improve root depth', 3),
  ('herbicide-services',   'Herbicide Services',           'residential', 'lot',           'fixed',      NULL, NULL, NULL,   75.00,  65.00, FALSE, NULL, NULL, 'Pre- and post-emergent weed control treatments', 4),
  ('weeding',              'Hand Weeding',                 'residential', 'lot',           'hourly',     NULL, NULL, 60.00,  60.00,  NULL,  FALSE, NULL, NULL, 'Hand weeding of beds, borders, and lawn areas', 5),
  ('mulching',             'Mulching',                     'residential', 'lot',           'fixed',      NULL, NULL, NULL,  150.00,  NULL,  FALSE, NULL, NULL, 'Mulch installation — pricing includes material and labor', 6),
  ('garden-bed-care',      'Garden Bed Care',              'residential', 'lot',           'hourly',     NULL, NULL, 60.00,  75.00,  60.00, FALSE, NULL, NULL, 'Seasonal garden bed maintenance, edging, and cleanup', 7),
  ('bush-trimming',        'Bush Trimming & Pruning',      'residential', 'lot',           'fixed',      NULL, NULL, NULL,  100.00,  NULL,  FALSE, NULL, NULL, 'Shrub, hedge, and ornamental bush shaping', 8),
  ('hardscaping',          'Hardscaping',                  'residential', 'lot',           'custom',     NULL, NULL, NULL,  500.00,  NULL,  FALSE, NULL, NULL, 'Patios, walkways, retaining walls — custom quoted', 9),

  -- Seasonal Services
  ('spring-cleanup',       'Spring Cleanup',               'residential', 'lot',           'fixed',      NULL, NULL, NULL,  150.00,  NULL,  TRUE,  3,    5,   'Debris removal, bed edging, first mow prep', 10),
  ('fall-cleanup',         'Fall Cleanup',                 'residential', 'lot',           'fixed',      NULL, NULL, NULL,  150.00,  NULL,  TRUE,  9,    11,  'Leaf removal, bed clearing, season-end prep', 11),
  ('leaf-removal',         'Leaf Removal',                 'residential', 'lot',           'fixed',      NULL, NULL, NULL,   80.00,  NULL,  TRUE,  9,    12,  'Stand-alone leaf blowing and removal service', 12),
  ('gutter-cleaning',      'Gutter Cleaning',              'residential', 'linear-feet',   'fixed',      NULL, NULL, NULL,  149.00,  NULL,  FALSE, NULL, NULL, 'Full gutter cleaning and downspout flush', 13),
  ('gutter-guard',         'Gutter Guard Installation',    'residential', 'linear-feet',   'per-unit',   8.00, 'linear ft', NULL, 249.00, NULL, FALSE, NULL, NULL, 'Micro-mesh gutter guard installation', 14),

  -- Snow Removal
  ('snow-removal',         'Snow Removal',                 'residential', 'per-push',      'fixed',      NULL, NULL, NULL,   65.00,  NULL,  TRUE,  11,   3,   'Driveway + walkway snow removal, salt always included', 15),

  -- Commercial
  ('commercial-lawn-mowing', 'Commercial Lawn Mowing',     'commercial',  'commercial-lot','custom',     NULL, NULL, NULL,  150.00,  NULL,  FALSE, NULL, NULL, 'Custom quoted commercial mowing programs', 20),
  ('commercial-snow',        'Commercial Snow Removal',    'commercial',  'commercial-lot','custom',     NULL, NULL, NULL,  NULL,    NULL,  TRUE,  11,   3,   'Commercial lot plowing + salting', 21);

-- ============================================================
-- SEED DATA: pricing_rates for TotalGuard's services
-- ============================================================

-- ----- 1. LAWN MOWING per-visit (9 rows: 3 sizes × 3 tiers) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'per-visit', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',    45.00, ARRAY['Mow, edge, blow — bi-weekly visits']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)', 60.00, ARRAY['Mow, edge, blow — bi-weekly visits']),
  ('good',   'large',  'Large lot (12-20,000 sqft)', 80.00, ARRAY['Mow, edge, blow — bi-weekly visits']),
  ('better', 'small',  'Small lot (<6,000 sqft)',    40.00, ARRAY['Mow, edge, blow — weekly visits']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)', 55.00, ARRAY['Mow, edge, blow — weekly visits']),
  ('better', 'large',  'Large lot (12-20,000 sqft)', 75.00, ARRAY['Mow, edge, blow — weekly visits']),
  ('best',   'small',  'Small lot (<6,000 sqft)',    38.00, ARRAY['Mow, edge, blow + trimming — weekly, season contract']),
  ('best',   'medium', 'Medium lot (6-12,000 sqft)', 52.00, ARRAY['Mow, edge, blow + trimming — weekly, season contract']),
  ('best',   'large',  'Large lot (12-20,000 sqft)', 70.00, ARRAY['Mow, edge, blow + trimming — weekly, season contract'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'lawn-mowing';

-- ----- 2. FERTILIZATION (9 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'per-application', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',    75.00, ARRAY['Single application — granular fertilizer']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)', 99.00, ARRAY['Single application — granular fertilizer']),
  ('good',   'large',  'Large lot (12-20,000 sqft)',130.00, ARRAY['Single application — granular fertilizer']),
  ('better', 'small',  'Small lot (<6,000 sqft)',   275.00, ARRAY['3-application season program (spring, summer, fall)']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)',349.00, ARRAY['3-application season program (spring, summer, fall)']),
  ('better', 'large',  'Large lot (12-20,000 sqft)',450.00, ARRAY['3-application season program (spring, summer, fall)']),
  ('best',   'small',  'Small lot (<6,000 sqft)',   425.00, ARRAY['5-application premium program (all season rounds)']),
  ('best',   'medium', 'Medium lot (6-12,000 sqft)',549.00, ARRAY['5-application premium program (all season rounds)']),
  ('best',   'large',  'Large lot (12-20,000 sqft)',699.00, ARRAY['5-application premium program (all season rounds)'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'fertilization';

-- ----- 3. AERATION (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',     95.00, ARRAY['Core aeration only']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)', 130.00, ARRAY['Core aeration only']),
  ('good',   'large',  'Large lot (12-20,000 sqft)', 175.00, ARRAY['Core aeration only']),
  ('better', 'small',  'Small lot (<6,000 sqft)',    149.00, ARRAY['Core aeration + overseeding']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)', 199.00, ARRAY['Core aeration + overseeding']),
  ('better', 'large',  'Large lot (12-20,000 sqft)', 265.00, ARRAY['Core aeration + overseeding'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'aeration';

-- ----- 4. HERBICIDE SERVICES (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'per-application', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',     75.00, ARRAY['Single treatment (pre- OR post-emergent)']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)',  99.00, ARRAY['Single treatment (pre- OR post-emergent)']),
  ('good',   'large',  'Large lot (12-20,000 sqft)', 130.00, ARRAY['Single treatment (pre- OR post-emergent)']),
  ('better', 'small',  'Small lot (<6,000 sqft)',    225.00, ARRAY['Season program (pre- + 2 post-emergent treatments)']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)', 299.00, ARRAY['Season program (pre- + 2 post-emergent treatments)']),
  ('better', 'large',  'Large lot (12-20,000 sqft)', 389.00, ARRAY['Season program (pre- + 2 post-emergent treatments)'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'herbicide-services';

-- ----- 5. MULCHING (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Up to 3 cubic yards',   150.00, ARRAY['Mulch delivery + installation (2-3 inch layer)']),
  ('good',   'medium', '3-6 cubic yards',        275.00, ARRAY['Mulch delivery + installation (2-3 inch layer)']),
  ('good',   'large',  '6+ cubic yards',         425.00, ARRAY['Mulch delivery + installation (2-3 inch layer)']),
  ('better', 'small',  'Up to 3 cubic yards',    199.00, ARRAY['Mulch + bed edging + old mulch removal']),
  ('better', 'medium', '3-6 cubic yards',         375.00, ARRAY['Mulch + bed edging + old mulch removal']),
  ('better', 'large',  '6+ cubic yards',          575.00, ARRAY['Mulch + bed edging + old mulch removal'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'mulching';

-- ----- 6. BUSH TRIMMING (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Up to 5 shrubs',       100.00, ARRAY['Trim + debris cleanup']),
  ('good',   'medium', '6-15 shrubs',           175.00, ARRAY['Trim + debris cleanup']),
  ('good',   'large',  '16+ shrubs',            275.00, ARRAY['Trim + debris cleanup']),
  ('better', 'small',  'Up to 5 shrubs',        135.00, ARRAY['Trim + debris cleanup + haul-away']),
  ('better', 'medium', '6-15 shrubs',            225.00, ARRAY['Trim + debris cleanup + haul-away']),
  ('better', 'large',  '16+ shrubs',             349.00, ARRAY['Trim + debris cleanup + haul-away'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'bush-trimming';

-- ----- 7. SPRING CLEANUP (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',    150.00, ARRAY['Debris removal, bed edging, first mow prep']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)', 225.00, ARRAY['Debris removal, bed edging, first mow prep']),
  ('good',   'large',  'Large lot (12-20,000 sqft)', 325.00, ARRAY['Debris removal, bed edging, first mow prep']),
  ('better', 'small',  'Small lot (<6,000 sqft)',    225.00, ARRAY['Debris removal, bed edging, first mow, bush trim']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)', 349.00, ARRAY['Debris removal, bed edging, first mow, bush trim']),
  ('better', 'large',  'Large lot (12-20,000 sqft)', 499.00, ARRAY['Debris removal, bed edging, first mow, bush trim'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'spring-cleanup';

-- ----- 8. FALL CLEANUP (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',    150.00, ARRAY['Leaf removal, bed clearing, season-end cleanup']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)', 225.00, ARRAY['Leaf removal, bed clearing, season-end cleanup']),
  ('good',   'large',  'Large lot (12-20,000 sqft)', 325.00, ARRAY['Leaf removal, bed clearing, season-end cleanup']),
  ('better', 'small',  'Small lot (<6,000 sqft)',    225.00, ARRAY['Leaf removal, bed clearing, final mow + mulch beds']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)', 349.00, ARRAY['Leaf removal, bed clearing, final mow + mulch beds']),
  ('better', 'large',  'Large lot (12-20,000 sqft)', 499.00, ARRAY['Leaf removal, bed clearing, final mow + mulch beds'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'fall-cleanup';

-- ----- 9. LEAF REMOVAL (6 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Small lot (<6,000 sqft)',     80.00, ARRAY['Blow + bag leaves at curb']),
  ('good',   'medium', 'Medium lot (6-12,000 sqft)', 120.00, ARRAY['Blow + bag leaves at curb']),
  ('good',   'large',  'Large lot (12-20,000 sqft)', 175.00, ARRAY['Blow + bag leaves at curb']),
  ('better', 'small',  'Small lot (<6,000 sqft)',    120.00, ARRAY['Blow + haul-away']),
  ('better', 'medium', 'Medium lot (6-12,000 sqft)', 175.00, ARRAY['Blow + haul-away']),
  ('better', 'large',  'Large lot (12-20,000 sqft)', 250.00, ARRAY['Blow + haul-away'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'leaf-removal';

-- ----- 10. GUTTER CLEANING (9 rows: 3 sizes × 3 tiers) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'one-time', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'small',  'Single-story (1-story)',       149.00, ARRAY['Scoop + bag debris, downspout check']),
  ('good',   'medium', 'Two-story (2-story)',           199.00, ARRAY['Scoop + bag debris, downspout check']),
  ('good',   'large',  'Large home (3-story or >3,500sf)', 275.00, ARRAY['Scoop + bag debris, downspout check']),
  ('better', 'small',  'Single-story (1-story)',        189.00, ARRAY['Full clean + downspout flush + exterior rinse']),
  ('better', 'medium', 'Two-story (2-story)',            249.00, ARRAY['Full clean + downspout flush + exterior rinse']),
  ('better', 'large',  'Large home (3-story or >3,500sf)', 349.00, ARRAY['Full clean + downspout flush + exterior rinse']),
  ('best',   'small',  'Single-story (1-story)',         249.00, ARRAY['Full clean + flush + inspection + before/after photos']),
  ('best',   'medium', 'Two-story (2-story)',             325.00, ARRAY['Full clean + flush + inspection + before/after photos']),
  ('best',   'large',  'Large home (3-story or >3,500sf)', 425.00, ARRAY['Full clean + flush + inspection + before/after photos'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'gutter-cleaning';

-- ----- 11. SNOW REMOVAL - PER PUSH (9 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'per-push', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'standard', 'Std Driveway (<600sf)',     65.00, ARRAY['Next-day response (within 24hrs)', 'Driveway + walkways + salt']),
  ('good',   'large',    'Large Driveway (600-1,200sf)', 90.00, ARRAY['Next-day response (within 24hrs)', 'Driveway + walkways + salt']),
  ('good',   'xl',       'XL/Double (1,200+sf)',     125.00, ARRAY['Next-day response (within 24hrs)', 'Driveway + walkways + salt']),
  ('better', 'standard', 'Std Driveway (<600sf)',     85.00, ARRAY['Same-day response (within 8hrs)', 'Driveway + walkways + salt']),
  ('better', 'large',    'Large Driveway (600-1,200sf)',115.00, ARRAY['Same-day response (within 8hrs)', 'Driveway + walkways + salt']),
  ('better', 'xl',       'XL/Double (1,200+sf)',     155.00, ARRAY['Same-day response (within 8hrs)', 'Driveway + walkways + salt']),
  ('best',   'standard', 'Std Driveway (<600sf)',    105.00, ARRAY['Priority response (within 3hrs of 1" accumulation)', 'Driveway + walkways + salt']),
  ('best',   'large',    'Large Driveway (600-1,200sf)',140.00, ARRAY['Priority response (within 3hrs of 1" accumulation)', 'Driveway + walkways + salt']),
  ('best',   'xl',       'XL/Double (1,200+sf)',     185.00, ARRAY['Priority response (within 3hrs of 1" accumulation)', 'Driveway + walkways + salt'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'snow-removal';

-- ----- 11b. SNOW REMOVAL - SEASONAL (9 rows) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_type, includes)
SELECT s.id, v.tier, v.size_key, v.size_label, v.price, 'seasonal', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('good',   'standard', 'Std Driveway (<600sf)',    395.00, ARRAY['Nov-Mar seasonal contract', 'Next-day response', 'Unlimited pushes at 1" trigger + salt']),
  ('good',   'large',    'Large Driveway (600-1,200sf)',525.00, ARRAY['Nov-Mar seasonal contract', 'Next-day response', 'Unlimited pushes at 1" trigger + salt']),
  ('good',   'xl',       'XL/Double (1,200+sf)',     725.00, ARRAY['Nov-Mar seasonal contract', 'Next-day response', 'Unlimited pushes at 1" trigger + salt']),
  ('better', 'standard', 'Std Driveway (<600sf)',    495.00, ARRAY['Nov-Mar seasonal contract', 'Same-day response', 'Unlimited pushes at 1" trigger + salt']),
  ('better', 'large',    'Large Driveway (600-1,200sf)',660.00, ARRAY['Nov-Mar seasonal contract', 'Same-day response', 'Unlimited pushes at 1" trigger + salt']),
  ('better', 'xl',       'XL/Double (1,200+sf)',     900.00, ARRAY['Nov-Mar seasonal contract', 'Same-day response', 'Unlimited pushes at 1" trigger + salt']),
  ('best',   'standard', 'Std Driveway (<600sf)',    625.00, ARRAY['Nov-Mar seasonal contract', 'Priority 3hr response', 'Unlimited pushes at 1" trigger + salt']),
  ('best',   'large',    'Large Driveway (600-1,200sf)',825.00, ARRAY['Nov-Mar seasonal contract', 'Priority 3hr response', 'Unlimited pushes at 1" trigger + salt']),
  ('best',   'xl',       'XL/Double (1,200+sf)',    1150.00, ARRAY['Nov-Mar seasonal contract', 'Priority 3hr response', 'Unlimited pushes at 1" trigger + salt'])
) AS v(tier, size_key, size_label, price, includes)
WHERE s.slug = 'snow-removal';

-- ----- 12. COMMERCIAL SNOW - PER PUSH (4 rows, range pricing) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_max, price_type, includes)
SELECT s.id, 'good', v.size_key, v.size_label, v.price_min, v.price_max, 'per-push', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('small',  'Small lot (<10 spaces)',    150.00, 250.00, ARRAY['Plow + salt included']),
  ('medium', 'Medium lot (10-30 spaces)', 250.00, 450.00, ARRAY['Plow + salt included']),
  ('large',  'Large lot (30-75 spaces)',  450.00, 750.00, ARRAY['Plow + salt included']),
  ('xl',     'XL lot (75+ spaces)',       750.00, NULL,   ARRAY['Plow + salt included', 'Custom quote'])
) AS v(size_key, size_label, price_min, price_max, includes)
WHERE s.slug = 'commercial-snow';

-- ----- 12b. COMMERCIAL SNOW - MONTHLY (4 rows, range pricing) -----
INSERT INTO pricing_rates (service_id, tier, size_key, size_label, price, price_max, price_type, includes)
SELECT s.id, 'good', v.size_key, v.size_label, v.price_min, v.price_max, 'monthly', v.includes
FROM pricing_services s
CROSS JOIN (VALUES
  ('small',  'Small lot (<10 spaces)',     350.00, 500.00,  ARRAY['Nov-Mar monthly contract', 'Unlimited pushes at 1" trigger + salt']),
  ('medium', 'Medium lot (10-30 spaces)',  500.00, 900.00,  ARRAY['Nov-Mar monthly contract', 'Unlimited pushes at 1" trigger + salt']),
  ('large',  'Large lot (30-75 spaces)',   900.00, 1500.00, ARRAY['Nov-Mar monthly contract', 'Unlimited pushes at 1" trigger + salt']),
  ('xl',     'XL lot (75+ spaces)',       1500.00, NULL,    ARRAY['Nov-Mar monthly contract', 'Unlimited pushes at 1" trigger + salt', 'Custom quote'])
) AS v(size_key, size_label, price_min, price_max, includes)
WHERE s.slug = 'commercial-snow';

-- ============================================================
-- SEED DATA: pricing_multipliers
-- ============================================================
INSERT INTO pricing_multipliers (slug, name, multiplier_type, multiplier, flat_amount, applies_to, stackable, max_discount_cap, description, sort_order)
VALUES
  -- Surcharges
  ('steep-terrain',      'Steep/Hilly Terrain',        'surcharge', 1.2000, NULL,   '{lawn-mowing,aeration,herbicide-services}',    TRUE, 0.70, 'Mowing/aeration on steep slopes requires extra time and equipment', 1),
  ('heavy-overgrowth',   'Heavy Overgrowth',            'surcharge', 1.2500, NULL,   '{lawn-mowing,spring-cleanup,fall-cleanup}',    TRUE, 0.70, 'Severely neglected lawns requiring extra passes/time', 2),
  ('heavy-debris',       'Heavy Leaf/Debris Load',      'surcharge', 1.2000, NULL,   '{leaf-removal,fall-cleanup,spring-cleanup}',   TRUE, 0.70, 'Excessive debris volume requiring extra trips or disposal', 3),
  ('rush-service',       'Emergency / Rush (24hr)',     'surcharge', 1.5000, NULL,   '{all}',                                        TRUE, 0.70, 'Drop-everything response within 24 hours', 4),
  ('after-hours',        'After-Hours / Weekend',       'surcharge', 1.1500, NULL,   '{commercial-lawn-mowing,commercial-snow}',     TRUE, 0.70, 'Commercial jobs scheduled outside normal hours', 5),

  -- Discounts
  ('recurring-member',   'Recurring Plan Member',       'discount',  0.8500, NULL,   '{all}',                                        TRUE, 0.70, '15% off per-visit rate for recurring plan commitment', 6),
  ('bundle-member',      'Bundle Package Member',       'discount',  0.9000, NULL,   '{all}',                                        TRUE, 0.70, '10% off when booking 2+ services together', 7),

  -- Flat fees
  ('travel-20-30',       'Travel 20-30 Miles',          'flat-fee',  NULL,   35.00,  '{all}',                                        TRUE, 0.70, 'Edge of service area (20-30 miles from Madison, WI 53711)', 8),
  ('travel-30-plus',     'Travel 30+ Miles',            'flat-fee',  NULL,   65.00,  '{all}',                                        TRUE, 0.70, 'Extended service area (30+ miles from Madison, WI 53711)', 9),

  -- Commercial frequency discounts
  ('commercial-weekly',    'Commercial Weekly',         'discount',  0.8000, NULL,   '{commercial-lawn-mowing}',                     TRUE, 0.70, '20% off per-visit rate for weekly commercial service', 10),
  ('commercial-biweekly',  'Commercial Bi-Weekly',      'discount',  0.8500, NULL,   '{commercial-lawn-mowing}',                     TRUE, 0.70, '15% off per-visit rate for bi-weekly commercial service', 11),
  ('commercial-monthly',   'Commercial Monthly',        'discount',  0.9000, NULL,   '{commercial-lawn-mowing}',                     TRUE, 0.70, '10% off per-visit rate for monthly commercial service', 12),

  -- Property management discounts
  ('property-mgmt-2-4',     'Property Mgmt 2-4 Units', 'discount',  0.9000, NULL,   '{all}',                                        TRUE, 0.70, '10% off per-property rates for 2-4 property portfolio', 14),
  ('property-mgmt-5-9',     'Property Mgmt 5-9 Units', 'discount',  0.8500, NULL,   '{all}',                                        TRUE, 0.70, '15% off per-property rates for 5-9 property portfolio', 15),
  ('property-mgmt-10-plus', 'Property Mgmt 10+ Units', 'discount',  0.8000, NULL,   '{all}',                                        TRUE, 0.70, '20% off per-property rates + dedicated account manager', 16);

-- ============================================================
-- SEED DATA: pricing_bundles
-- ============================================================
INSERT INTO pricing_bundles (slug, name, discount_percent, description, sort_order)
VALUES
  ('lawn-and-fert',       'Lawn Care + Fertilization',   15.00, 'Recurring mowing + season fertilization program — MOST POPULAR', 1),
  ('spring-full',         'Spring Full Service',         12.00, 'Spring Cleanup + First Aeration + Fertilization', 2),
  ('fall-full',           'Fall Full Service',           12.00, 'Fall Cleanup + Leaf Removal + Gutter Cleaning', 3),
  ('gutter-lawn-combo',   'Gutter & Lawn Combo',         10.00, 'Gutter Cleaning + Spring or Fall Cleanup', 4),
  ('winter-ready',        'Winter Ready Bundle',         10.00, 'Gutter Cleaning + Snow Removal Seasonal Contract', 5);

-- ============================================================
-- SEED DATA: pricing_bundle_services
-- ============================================================
INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 1
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'lawn-and-fert' AND s.slug = 'lawn-mowing';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 2
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'lawn-and-fert' AND s.slug = 'fertilization';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 1
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'spring-full' AND s.slug = 'spring-cleanup';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 2
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'spring-full' AND s.slug = 'aeration';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 3
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'spring-full' AND s.slug = 'fertilization';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 1
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'fall-full' AND s.slug = 'fall-cleanup';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 2
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'fall-full' AND s.slug = 'leaf-removal';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 3
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'fall-full' AND s.slug = 'gutter-cleaning';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 1
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'gutter-lawn-combo' AND s.slug = 'gutter-cleaning';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 2
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'gutter-lawn-combo' AND s.slug = 'spring-cleanup';

INSERT INTO pricing_bundle_services (bundle_id, service_id, sort_order)
SELECT b.id, s.id, 1
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'winter-ready' AND s.slug = 'gutter-cleaning';

INSERT INTO pricing_bundle_services (bundle_id, service_id, default_price_type, sort_order)
SELECT b.id, s.id, 'seasonal', 2
FROM pricing_bundles b, pricing_services s
WHERE b.slug = 'winter-ready' AND s.slug = 'snow-removal';
