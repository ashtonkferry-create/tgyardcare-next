-- Migration 022: AI Quoting Engine
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Real-time pricing for voice AI integration using TotalGuard's 15 services

-- ============================================================
-- Table: ai_service_pricing
-- ============================================================
DROP TABLE IF EXISTS ai_service_pricing CASCADE;
CREATE TABLE IF NOT EXISTS ai_service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL UNIQUE,
  service_name TEXT NOT NULL,
  service_description TEXT,
  pricing_model TEXT NOT NULL,  -- 'per_unit' | 'per_sqft' | 'per_linear_foot' | 'flat_rate' | 'per_1000sqft'
  pricing_unit TEXT NOT NULL,
  base_price_per_unit NUMERIC(10,4) NOT NULL,
  minimum_price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  seasonal_only BOOLEAN DEFAULT FALSE,
  season_start_month INTEGER,
  season_end_month INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_service_pricing_type ON ai_service_pricing(service_type);

-- Table: ai_house_size_estimates
DROP TABLE IF EXISTS ai_house_size_estimates CASCADE;
CREATE TABLE IF NOT EXISTS ai_house_size_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_category TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sqft_estimate INTEGER NOT NULL,
  lot_sqft_estimate INTEGER NOT NULL,
  gutter_linear_ft_estimate INTEGER NOT NULL,
  default_stories INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ai_story_multipliers
DROP TABLE IF EXISTS ai_story_multipliers CASCADE;
CREATE TABLE IF NOT EXISTS ai_story_multipliers (
  stories INTEGER PRIMARY KEY,
  multiplier NUMERIC(4,2) NOT NULL,
  label TEXT NOT NULL
);

-- Table: ai_package_tiers
DROP TABLE IF EXISTS ai_package_tiers CASCADE;
CREATE TABLE IF NOT EXISTS ai_package_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  tier_label TEXT NOT NULL,
  price_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  includes TEXT[] DEFAULT '{}',
  UNIQUE(service_type, tier_name)
);

-- Table: ai_quotes
DROP TABLE IF EXISTS ai_quotes CASCADE;
CREATE TABLE IF NOT EXISTS ai_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id TEXT,
  caller_phone TEXT,
  caller_name TEXT,
  caller_email TEXT,
  property_address TEXT,
  property_city TEXT DEFAULT 'Madison',
  property_state TEXT DEFAULT 'WI',
  property_zip TEXT,
  property_type TEXT DEFAULT 'residential',
  property_size TEXT,
  property_sqft INTEGER,
  lot_sqft INTEGER,
  stories INTEGER DEFAULT 1,
  primary_service TEXT NOT NULL,
  additional_services TEXT[],
  package_tier TEXT DEFAULT 'standard',
  service_breakdown JSONB,
  subtotal NUMERIC(10,2),
  bundle_discount_percent INTEGER DEFAULT 0,
  bundle_discount_amount NUMERIC(10,2) DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL,
  quote_accepted BOOLEAN DEFAULT FALSE,
  appointment_booked BOOLEAN DEFAULT FALSE,
  preferred_date DATE,
  preferred_time_slot TEXT,
  booked_date DATE,
  booked_time_slot TEXT,
  jobber_customer_id TEXT,
  jobber_job_id TEXT,
  synced_to_jobber BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  status TEXT DEFAULT 'generated',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_quotes_call ON ai_quotes(call_id);
CREATE INDEX IF NOT EXISTS idx_ai_quotes_phone ON ai_quotes(caller_phone);
CREATE INDEX IF NOT EXISTS idx_ai_quotes_status ON ai_quotes(status);

-- Table: ai_booking_slots
DROP TABLE IF EXISTS ai_booking_slots CASCADE;
CREATE TABLE IF NOT EXISTS ai_booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  slot_time_start TIME NOT NULL,
  slot_time_end TIME NOT NULL,
  slot_label TEXT NOT NULL,
  max_jobs INTEGER DEFAULT 4,
  current_jobs INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slot_date, slot_time_start)
);

CREATE INDEX IF NOT EXISTS idx_ai_slots_date ON ai_booking_slots(slot_date);

-- ============================================================
-- SEED: Service Pricing for TotalGuard's 15 services
-- ============================================================
INSERT INTO ai_service_pricing (service_type, service_name, service_description, pricing_model, pricing_unit, base_price_per_unit, minimum_price) VALUES
  ('lawn_mowing', 'Lawn Mowing', 'Weekly or bi-weekly lawn mowing service', 'per_1000sqft', '1,000 sq ft', 15.00, 45.00),
  ('fertilization', 'Fertilization', 'Lawn fertilization treatment', 'per_1000sqft', '1,000 sq ft', 12.00, 65.00),
  ('aeration', 'Aeration', 'Core aeration to improve lawn health', 'per_1000sqft', '1,000 sq ft', 18.00, 75.00),
  ('herbicide_services', 'Herbicide Services', 'Weed control and herbicide application', 'per_1000sqft', '1,000 sq ft', 14.00, 65.00),
  ('weeding', 'Weeding', 'Hand weeding of garden beds and borders', 'flat_rate', 'visit', 85.00, 85.00),
  ('mulching', 'Mulching', 'Mulch installation in garden beds', 'per_unit', 'cubic yard', 75.00, 150.00),
  ('garden_bed_care', 'Garden Bed Care', 'Full garden bed maintenance', 'flat_rate', 'visit', 95.00, 95.00),
  ('bush_trimming', 'Bush Trimming/Pruning', 'Shrub and bush trimming and pruning', 'flat_rate', 'visit', 110.00, 110.00),
  ('hardscaping', 'Hardscaping', 'Patio, walkway, and retaining wall installation', 'flat_rate', 'project', 1500.00, 500.00),
  ('spring_cleanup', 'Spring Cleanup', 'Full spring yard cleanup and preparation', 'flat_rate', 'visit', 175.00, 175.00),
  ('fall_cleanup', 'Fall Cleanup', 'Full fall yard cleanup including leaf removal', 'flat_rate', 'visit', 175.00, 175.00),
  ('leaf_removal', 'Leaf Removal', 'Leaf collection and removal service', 'per_1000sqft', '1,000 sq ft', 20.00, 95.00),
  ('gutter_cleaning', 'Gutter Cleaning', 'Complete gutter cleaning and downspout flushing', 'per_linear_foot', 'linear ft', 1.25, 125.00),
  ('gutter_guard_installation', 'Gutter Guard Installation', 'Professional gutter guard installation', 'per_linear_foot', 'linear ft', 8.00, 200.00),
  ('snow_removal', 'Snow Removal', 'Driveway and walkway snow plowing and removal', 'flat_rate', 'visit', 75.00, 75.00)
ON CONFLICT (service_type) DO UPDATE SET
  base_price_per_unit = EXCLUDED.base_price_per_unit,
  minimum_price = EXCLUDED.minimum_price,
  updated_at = NOW();

-- Mark seasonal services
UPDATE ai_service_pricing SET seasonal_only = true, season_start_month = 11, season_end_month = 3
WHERE service_type = 'snow_removal';
UPDATE ai_service_pricing SET seasonal_only = true, season_start_month = 3, season_end_month = 5
WHERE service_type = 'spring_cleanup';
UPDATE ai_service_pricing SET seasonal_only = true, season_start_month = 10, season_end_month = 11
WHERE service_type IN ('fall_cleanup', 'leaf_removal');

-- SEED: House Size Estimates (lot-based for lawn care)
INSERT INTO ai_house_size_estimates (size_category, display_name, sqft_estimate, lot_sqft_estimate, gutter_linear_ft_estimate, default_stories) VALUES
  ('small', 'Small (under 5,000 sq ft lot)', 1500, 4000, 120, 1),
  ('medium', 'Medium (5,000-8,000 sq ft lot)', 2000, 6500, 160, 1),
  ('large', 'Large (8,000-12,000 sq ft lot)', 2500, 10000, 200, 2),
  ('xlarge', 'X-Large (12,000-20,000 sq ft lot)', 3000, 16000, 240, 2),
  ('estate', 'Estate (20,000+ sq ft lot)', 4000, 25000, 300, 2)
ON CONFLICT (size_category) DO UPDATE SET
  sqft_estimate = EXCLUDED.sqft_estimate,
  lot_sqft_estimate = EXCLUDED.lot_sqft_estimate,
  gutter_linear_ft_estimate = EXCLUDED.gutter_linear_ft_estimate;

-- SEED: Story Multipliers
INSERT INTO ai_story_multipliers (stories, multiplier, label) VALUES
  (1, 1.0, '1-Story Home'),
  (2, 1.25, '2-Story Home'),
  (3, 1.5, '3-Story Home')
ON CONFLICT (stories) DO UPDATE SET multiplier = EXCLUDED.multiplier;

-- SEED: Package Tiers for TotalGuard services
INSERT INTO ai_package_tiers (service_type, tier_name, tier_label, price_multiplier, includes) VALUES
  ('lawn_mowing', 'basic', 'Basic', 1.0, ARRAY['Mowing', 'Edging', 'Blowing clippings']),
  ('lawn_mowing', 'standard', 'Standard', 1.25, ARRAY['Mowing', 'Edging', 'Blowing', 'String trimming', 'Walkway blowing']),
  ('lawn_mowing', 'premium', 'Premium', 1.5, ARRAY['Mowing', 'Edging', 'Blowing', 'Trimming', 'Spot weed pull', 'Before/after photo']),
  ('fertilization', 'basic', 'Basic', 1.0, ARRAY['Standard granular fertilizer', 'Single application']),
  ('fertilization', 'standard', 'Standard', 1.3, ARRAY['Premium fertilizer blend', 'Soil test', 'Targeted application']),
  ('fertilization', 'premium', 'Premium', 1.6, ARRAY['Premium slow-release formula', 'Soil test', 'pH adjustment', 'Season plan']),
  ('aeration', 'basic', 'Basic', 1.0, ARRAY['Core aeration', 'Core removal']),
  ('aeration', 'standard', 'Standard', 1.3, ARRAY['Core aeration', 'Overseeding', 'Starter fertilizer']),
  ('aeration', 'premium', 'Premium', 1.65, ARRAY['Core aeration', 'Overseeding', 'Starter fertilizer', 'Top dressing', 'Season follow-up']),
  ('gutter_cleaning', 'basic', 'Basic', 1.0, ARRAY['Debris removal', 'Downspout flush']),
  ('gutter_cleaning', 'standard', 'Standard', 1.25, ARRAY['Debris removal', 'Downspout flush', 'Gutter inspection', 'Minor repairs']),
  ('gutter_cleaning', 'premium', 'Premium', 1.5, ARRAY['Debris removal', 'Downspout flush', 'Full inspection', 'Repairs', 'Before/after photos', 'Gutter brightening']),
  ('snow_removal', 'basic', 'Basic', 1.0, ARRAY['Driveway clearing', 'Single pass']),
  ('snow_removal', 'standard', 'Standard', 1.4, ARRAY['Driveway clearing', 'Sidewalk clearing', 'Steps', 'Salt application']),
  ('snow_removal', 'premium', 'Priority', 1.75, ARRAY['Priority scheduling', 'Driveway + all walks', 'Salt/de-icer', 'Return visit if needed'])
ON CONFLICT (service_type, tier_name) DO UPDATE SET
  price_multiplier = EXCLUDED.price_multiplier,
  includes = EXCLUDED.includes;

-- SEED: Booking Slots (next 30 days, Mon-Sat)
INSERT INTO ai_booking_slots (slot_date, slot_time_start, slot_time_end, slot_label, max_jobs)
SELECT
  d::date,
  t.start_time,
  t.end_time,
  t.label,
  4
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d
CROSS JOIN (
  VALUES
    ('07:00'::time, '12:00'::time, 'Morning (7am-12pm)'),
    ('12:00'::time, '17:00'::time, 'Afternoon (12pm-5pm)')
) AS t(start_time, end_time, label)
WHERE EXTRACT(DOW FROM d) NOT IN (0)  -- Exclude Sundays
ON CONFLICT (slot_date, slot_time_start) DO NOTHING;

-- Function: calculate_ai_quote
CREATE OR REPLACE FUNCTION calculate_ai_quote(
  p_service_type TEXT,
  p_property_size TEXT DEFAULT 'medium',
  p_stories INTEGER DEFAULT 1,
  p_package_tier TEXT DEFAULT 'standard'
) RETURNS JSONB AS $$
DECLARE
  v_pricing RECORD;
  v_estimates RECORD;
  v_story_multiplier NUMERIC;
  v_tier_multiplier NUMERIC;
  v_quantity NUMERIC;
  v_base_price NUMERIC;
  v_tiered_price NUMERIC;
  v_adjusted_price NUMERIC;
BEGIN
  SELECT * INTO v_pricing FROM ai_service_pricing WHERE service_type = p_service_type AND is_active = true;
  IF v_pricing IS NULL THEN
    RETURN jsonb_build_object('error', 'Service not found: ' || p_service_type);
  END IF;

  SELECT * INTO v_estimates FROM ai_house_size_estimates WHERE size_category = LOWER(p_property_size);
  IF v_estimates IS NULL THEN
    SELECT * INTO v_estimates FROM ai_house_size_estimates WHERE size_category = 'medium';
  END IF;

  SELECT multiplier INTO v_story_multiplier FROM ai_story_multipliers WHERE stories = p_stories;
  v_story_multiplier := COALESCE(v_story_multiplier, 1.0);

  SELECT price_multiplier INTO v_tier_multiplier FROM ai_package_tiers
  WHERE service_type = p_service_type AND tier_name = p_package_tier;
  v_tier_multiplier := COALESCE(v_tier_multiplier, 1.0);

  CASE v_pricing.pricing_model
    WHEN 'per_1000sqft' THEN v_quantity := v_estimates.lot_sqft_estimate / 1000.0;
    WHEN 'per_sqft' THEN v_quantity := v_estimates.lot_sqft_estimate;
    WHEN 'per_linear_foot' THEN v_quantity := v_estimates.gutter_linear_ft_estimate;
    WHEN 'flat_rate' THEN v_quantity := 1;
    WHEN 'per_unit' THEN v_quantity := 3;  -- default cubic yards for mulch
    ELSE v_quantity := 1;
  END CASE;

  v_base_price := v_pricing.base_price_per_unit * v_quantity;
  v_tiered_price := v_base_price * v_tier_multiplier;
  v_adjusted_price := v_tiered_price;

  -- For gutter cleaning, apply story multiplier
  IF p_service_type IN ('gutter_cleaning', 'gutter_guard_installation') THEN
    v_adjusted_price := v_adjusted_price * v_story_multiplier;
  END IF;

  IF v_pricing.minimum_price IS NOT NULL AND v_adjusted_price < v_pricing.minimum_price THEN
    v_adjusted_price := v_pricing.minimum_price;
  END IF;

  v_adjusted_price := ROUND(v_adjusted_price);

  RETURN jsonb_build_object(
    'service_type', p_service_type,
    'service_name', v_pricing.service_name,
    'property_size', p_property_size,
    'package_tier', p_package_tier,
    'pricing_model', v_pricing.pricing_model,
    'unit', v_pricing.pricing_unit,
    'quantity', v_quantity,
    'price_per_unit', v_pricing.base_price_per_unit,
    'base_price', ROUND(v_base_price, 2),
    'tier_multiplier', v_tier_multiplier,
    'calculated_price', v_adjusted_price,
    'minimum_price', v_pricing.minimum_price
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ai_service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_house_size_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_story_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_package_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_booking_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_pricing_service ON ai_service_pricing FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY ai_estimates_service ON ai_house_size_estimates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY ai_multipliers_service ON ai_story_multipliers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY ai_tiers_service ON ai_package_tiers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY ai_quotes_service ON ai_quotes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY ai_slots_service ON ai_booking_slots FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY ai_pricing_anon ON ai_service_pricing FOR SELECT USING (true);
CREATE POLICY ai_estimates_anon ON ai_house_size_estimates FOR SELECT USING (true);
CREATE POLICY ai_multipliers_anon ON ai_story_multipliers FOR SELECT USING (true);
CREATE POLICY ai_tiers_anon ON ai_package_tiers FOR SELECT USING (true);
