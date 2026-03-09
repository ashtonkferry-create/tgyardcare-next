-- Migration: ResponsiBid Comparison, Winback, Service Area Analysis, Pricing Calibration
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Adds tables for ResponsiBid replacement testing, customer winback campaigns,
--              service area analysis, and pricing calibration logging.

-- ============================================================================
-- 1. RESPONSIBID COMPARISON LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS responsibid_comparison_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text,
  service text,
  sqft integer,
  stories integer DEFAULT 1,
  tier text,
  our_price numeric(10,2),
  expected_min numeric(10,2),
  expected_max numeric(10,2),
  in_range boolean DEFAULT false,
  deviation_pct numeric(5,1),
  status text CHECK (status IN ('PASS', 'CLOSE', 'FAIL')),
  tested_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. CUSTOMER WINBACK LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS winback_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  first_name text,
  email text,
  phone text,
  tier text CHECK (tier IN ('gentle_nudge', 'value_offer', 'last_chance')),
  discount integer DEFAULT 0,
  promo_code text,
  months_since_job integer,
  lifetime_value numeric(10,2) DEFAULT 0,
  channel text CHECK (channel IN ('email', 'sms', 'both')),
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  rebooked boolean DEFAULT false,
  rebooked_at timestamptz,
  revenue_recovered numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. SERVICE AREA ANALYSIS
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_area_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date timestamptz DEFAULT now(),
  total_leads_analyzed integer DEFAULT 0,
  unique_zips integer DEFAULT 0,
  unique_cities integer DEFAULT 0,
  top_zips jsonb,
  top_cities jsonb,
  expansion_opportunities jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. PRICING ANALYSIS LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS pricing_analysis_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date timestamptz DEFAULT now(),
  total_leads_analyzed integer DEFAULT 0,
  overall_conversion integer DEFAULT 0,
  by_service jsonb,
  recommendations jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. VIEWS
-- ============================================================================

-- ResponsiBid replacement readiness dashboard
CREATE OR REPLACE VIEW responsibid_readiness AS
SELECT
  COUNT(*) as total_tests,
  COUNT(*) FILTER (WHERE status = 'PASS') as passed,
  COUNT(*) FILTER (WHERE status = 'CLOSE') as close_match,
  COUNT(*) FILTER (WHERE status = 'FAIL') as failed,
  ROUND(COUNT(*) FILTER (WHERE status = 'PASS')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as pass_rate,
  ROUND(AVG(deviation_pct), 1) as avg_deviation,
  MAX(tested_at) as last_tested,
  CASE
    WHEN COUNT(*) FILTER (WHERE status IN ('PASS', 'CLOSE')) >= COUNT(*) * 0.9 THEN 'READY_TO_REPLACE'
    WHEN COUNT(*) FILTER (WHERE status IN ('PASS', 'CLOSE')) >= COUNT(*) * 0.7 THEN 'GETTING_CLOSE'
    ELSE 'NEEDS_CALIBRATION'
  END as replacement_status
FROM responsibid_comparison_log
WHERE tested_at >= (SELECT MAX(tested_at) FROM responsibid_comparison_log);

-- Customer winback performance
CREATE OR REPLACE VIEW winback_dashboard AS
SELECT
  COUNT(*) as total_winbacks_sent,
  COUNT(*) FILTER (WHERE rebooked) as total_rebooked,
  ROUND(COUNT(*) FILTER (WHERE rebooked)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as rebook_rate,
  COALESCE(SUM(revenue_recovered), 0) as total_revenue_recovered,
  ROUND(AVG(discount), 1) as avg_discount_pct,
  ROUND(AVG(months_since_job), 1) as avg_months_since_job,
  jsonb_build_object(
    'gentle_nudge', jsonb_build_object(
      'sent', COUNT(*) FILTER (WHERE tier = 'gentle_nudge'),
      'rebooked', COUNT(*) FILTER (WHERE tier = 'gentle_nudge' AND rebooked)
    ),
    'value_offer', jsonb_build_object(
      'sent', COUNT(*) FILTER (WHERE tier = 'value_offer'),
      'rebooked', COUNT(*) FILTER (WHERE tier = 'value_offer' AND rebooked)
    ),
    'last_chance', jsonb_build_object(
      'sent', COUNT(*) FILTER (WHERE tier = 'last_chance'),
      'rebooked', COUNT(*) FILTER (WHERE tier = 'last_chance' AND rebooked)
    )
  ) as by_tier
FROM winback_log;

-- Service area hotspots
CREATE OR REPLACE VIEW service_area_hotspots AS
SELECT
  analysis_date,
  unique_zips,
  unique_cities,
  total_leads_analyzed,
  expansion_opportunities
FROM service_area_analysis
ORDER BY analysis_date DESC
LIMIT 1;

-- Pricing optimization summary
CREATE OR REPLACE VIEW pricing_optimization_summary AS
SELECT
  analysis_date,
  overall_conversion,
  total_leads_analyzed,
  by_service,
  recommendations
FROM pricing_analysis_log
ORDER BY analysis_date DESC
LIMIT 1;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE responsibid_comparison_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE winback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_area_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_analysis_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'responsibid_comparison_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON responsibid_comparison_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'winback_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON winback_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_area_analysis' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON service_area_analysis FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing_analysis_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON pricing_analysis_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_responsibid_tested ON responsibid_comparison_log(tested_at);
CREATE INDEX IF NOT EXISTS idx_responsibid_service ON responsibid_comparison_log(service);
CREATE INDEX IF NOT EXISTS idx_winback_lead ON winback_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_winback_sent ON winback_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_winback_tier ON winback_log(tier);
CREATE INDEX IF NOT EXISTS idx_service_area_date ON service_area_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_pricing_date ON pricing_analysis_log(analysis_date);
