-- Migration: Commercial Outreach, Cross-Sell Intelligence, Revenue Forecasting, Weather Alerts
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Adds tables for commercial account management, cross-sell tracking,
--              revenue forecasting, and weather-based damage prevention alerts.

-- ============================================================================
-- 1. COMMERCIAL OUTREACH LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS commercial_outreach_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  account_name text,
  tier text CHECK (tier IN ('platinum', 'gold', 'silver')),
  plan_type text,
  discount integer DEFAULT 0,
  total_jobs integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  channel text DEFAULT 'email',
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  replied boolean DEFAULT false,
  meeting_booked boolean DEFAULT false,
  meeting_date timestamptz,
  contract_signed boolean DEFAULT false,
  contract_value numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. CROSS-SELL LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS cross_sell_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  current_services text[],
  recommended_service text,
  all_recommendations text[],
  cross_sell_score integer DEFAULT 0,
  estimated_revenue numeric(10,2) DEFAULT 0,
  promo_code text,
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  booked boolean DEFAULT false,
  booked_at timestamptz,
  actual_revenue numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. REVENUE FORECASTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date timestamptz DEFAULT now(),
  trailing_12m_revenue numeric(10,2) DEFAULT 0,
  avg_monthly numeric(10,2) DEFAULT 0,
  pipeline_value numeric(10,2) DEFAULT 0,
  pipeline_expected_conversion numeric(10,2) DEFAULT 0,
  open_pipeline_count integer DEFAULT 0,
  next_6_months jsonb,
  total_6m_forecast numeric(10,2) DEFAULT 0,
  annualized_forecast numeric(10,2) DEFAULT 0,
  months_of_data integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. WEATHER ALERT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS weather_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text CHECK (alert_type IN ('high_wind', 'heavy_rain', 'freeze_warning', 'hail_risk', 'heat_wave', 'snow_forecast')),
  severity text CHECK (severity IN ('moderate', 'severe')),
  details text,
  customers_alerted integer DEFAULT 0,
  channel text DEFAULT 'email',
  sent_at timestamptz DEFAULT now(),
  bookings_generated integer DEFAULT 0,
  revenue_generated numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. VIEWS
-- ============================================================================

-- Commercial accounts pipeline
CREATE OR REPLACE VIEW commercial_pipeline_dashboard AS
SELECT
  COUNT(*) as total_outreach,
  COUNT(*) FILTER (WHERE replied) as total_replied,
  COUNT(*) FILTER (WHERE meeting_booked) as meetings_booked,
  COUNT(*) FILTER (WHERE contract_signed) as contracts_signed,
  COALESCE(SUM(contract_value) FILTER (WHERE contract_signed), 0) as total_contract_value,
  ROUND(COUNT(*) FILTER (WHERE contract_signed)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
  jsonb_build_object(
    'platinum', COUNT(*) FILTER (WHERE tier = 'platinum'),
    'gold', COUNT(*) FILTER (WHERE tier = 'gold'),
    'silver', COUNT(*) FILTER (WHERE tier = 'silver')
  ) as by_tier
FROM commercial_outreach_log;

-- Cross-sell performance
-- Service slugs adapted for TotalGuard Yard Care
CREATE OR REPLACE VIEW cross_sell_dashboard AS
SELECT
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE booked) as total_booked,
  ROUND(COUNT(*) FILTER (WHERE booked)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as booking_rate,
  COALESCE(SUM(actual_revenue) FILTER (WHERE booked), 0) as total_revenue,
  ROUND(AVG(cross_sell_score), 1) as avg_score,
  jsonb_build_object(
    'aeration', COUNT(*) FILTER (WHERE recommended_service = 'aeration'),
    'fertilization', COUNT(*) FILTER (WHERE recommended_service = 'fertilization'),
    'mulching', COUNT(*) FILTER (WHERE recommended_service = 'mulching'),
    'gutter_cleaning', COUNT(*) FILTER (WHERE recommended_service = 'gutter_cleaning'),
    'spring_cleanup', COUNT(*) FILTER (WHERE recommended_service = 'spring_cleanup'),
    'fall_cleanup', COUNT(*) FILTER (WHERE recommended_service = 'fall_cleanup'),
    'snow_removal', COUNT(*) FILTER (WHERE recommended_service = 'snow_removal')
  ) as by_service
FROM cross_sell_log;

-- Revenue forecast summary
CREATE OR REPLACE VIEW revenue_forecast_latest AS
SELECT
  forecast_date,
  trailing_12m_revenue,
  avg_monthly,
  pipeline_value,
  open_pipeline_count,
  total_6m_forecast,
  annualized_forecast,
  next_6_months
FROM revenue_forecasts
ORDER BY forecast_date DESC
LIMIT 1;

-- Weather alert effectiveness
CREATE OR REPLACE VIEW weather_alert_effectiveness AS
SELECT
  alert_type,
  COUNT(*) as total_alerts,
  SUM(customers_alerted) as total_customers_alerted,
  SUM(bookings_generated) as total_bookings,
  COALESCE(SUM(revenue_generated), 0) as total_revenue,
  ROUND(SUM(bookings_generated)::numeric / NULLIF(SUM(customers_alerted), 0) * 100, 1) as booking_rate
FROM weather_alert_log
GROUP BY alert_type
ORDER BY total_revenue DESC;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE commercial_outreach_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_sell_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alert_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commercial_outreach_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON commercial_outreach_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cross_sell_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON cross_sell_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'revenue_forecasts' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON revenue_forecasts FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weather_alert_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON weather_alert_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_commercial_outreach_lead ON commercial_outreach_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_commercial_outreach_tier ON commercial_outreach_log(tier);
CREATE INDEX IF NOT EXISTS idx_cross_sell_lead ON cross_sell_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_cross_sell_service ON cross_sell_log(recommended_service);
CREATE INDEX IF NOT EXISTS idx_cross_sell_sent ON cross_sell_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_forecast_date ON revenue_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_weather_alert_type ON weather_alert_log(alert_type);
CREATE INDEX IF NOT EXISTS idx_weather_alert_sent ON weather_alert_log(sent_at);
