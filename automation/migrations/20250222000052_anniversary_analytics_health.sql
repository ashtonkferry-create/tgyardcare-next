-- Migration: Customer Anniversary, GA Reports, System Health, Lead Reactivation
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Final migration for the 150-workflow system. Adds tables for customer
--              anniversary tracking, Google Analytics reporting, system health monitoring,
--              and stale lead reactivation logging.

-- ============================================================================
-- 1. CUSTOMER ANNIVERSARY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_anniversary_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  first_name text,
  email text,
  years_as_customer integer DEFAULT 1,
  tier text CHECK (tier IN ('first_anniversary', 'loyal_returning', 'loyal_veteran')),
  discount integer DEFAULT 10,
  promo_code text,
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  revenue_generated numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. GOOGLE ANALYTICS REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ga_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date timestamptz DEFAULT now(),
  period_7d jsonb,
  period_30d jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. SYSTEM HEALTH LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_health_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamptz DEFAULT now(),
  all_healthy boolean DEFAULT true,
  total_systems integer DEFAULT 0,
  healthy integer DEFAULT 0,
  degraded integer DEFAULT 0,
  down integer DEFAULT 0,
  systems jsonb,
  alert_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. LEAD REACTIVATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_reactivation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  first_name text,
  email text,
  tier text CHECK (tier IN ('gentle', 'incentive', 'final')),
  days_stale integer DEFAULT 0,
  channel text DEFAULT 'email',
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  reactivated boolean DEFAULT false,
  reactivated_at timestamptz,
  booked boolean DEFAULT false,
  revenue_generated numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. RPC: GET UPCOMING CUSTOMER ANNIVERSARIES
-- ============================================================================
CREATE OR REPLACE FUNCTION get_upcoming_customer_anniversaries()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  total_jobs integer,
  years_as_customer integer
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    l.id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    COALESCE(l.total_jobs, 0) as total_jobs,
    GREATEST(1, EXTRACT(YEAR FROM age(now(), l.created_at))::integer) as years_as_customer
  FROM leads l
  WHERE l.email IS NOT NULL
    AND l.email != ''
    AND l.total_jobs >= 1
    AND EXTRACT(MONTH FROM l.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM l.created_at) BETWEEN EXTRACT(DAY FROM CURRENT_DATE) AND EXTRACT(DAY FROM CURRENT_DATE) + 7
    AND l.created_at < now() - interval '11 months'
    AND NOT EXISTS (
      SELECT 1 FROM customer_anniversary_log cal
      WHERE cal.lead_id = l.id
        AND cal.sent_at > now() - interval '11 months'
    )
  ORDER BY l.total_jobs DESC
  LIMIT 20;
$$;

-- ============================================================================
-- 6. VIEWS
-- ============================================================================

-- Anniversary campaign performance
CREATE OR REPLACE VIEW anniversary_dashboard AS
SELECT
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE redeemed) as total_redeemed,
  ROUND(COUNT(*) FILTER (WHERE redeemed)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as redemption_rate,
  COALESCE(SUM(revenue_generated), 0) as total_revenue,
  ROUND(AVG(years_as_customer), 1) as avg_years,
  jsonb_build_object(
    'first_anniversary', COUNT(*) FILTER (WHERE tier = 'first_anniversary'),
    'loyal_returning', COUNT(*) FILTER (WHERE tier = 'loyal_returning'),
    'loyal_veteran', COUNT(*) FILTER (WHERE tier = 'loyal_veteran')
  ) as by_tier
FROM customer_anniversary_log;

-- System health overview
CREATE OR REPLACE VIEW system_health_overview AS
SELECT
  checked_at,
  all_healthy,
  total_systems,
  healthy,
  degraded,
  down,
  systems
FROM system_health_log
ORDER BY checked_at DESC
LIMIT 1;

-- Lead reactivation performance
CREATE OR REPLACE VIEW lead_reactivation_dashboard AS
SELECT
  COUNT(*) as total_reactivation_attempts,
  COUNT(*) FILTER (WHERE reactivated) as total_reactivated,
  ROUND(COUNT(*) FILTER (WHERE reactivated)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as reactivation_rate,
  COUNT(*) FILTER (WHERE booked) as total_booked,
  COALESCE(SUM(revenue_generated), 0) as total_revenue,
  ROUND(AVG(days_stale), 0) as avg_days_stale,
  jsonb_build_object(
    'gentle', COUNT(*) FILTER (WHERE tier = 'gentle'),
    'incentive', COUNT(*) FILTER (WHERE tier = 'incentive'),
    'final', COUNT(*) FILTER (WHERE tier = 'final')
  ) as by_tier
FROM lead_reactivation_log;

-- Google Analytics summary
CREATE OR REPLACE VIEW ga_summary AS
SELECT
  report_date,
  period_7d,
  period_30d
FROM ga_reports
ORDER BY report_date DESC
LIMIT 1;

-- ============================================================================
-- 7. MASTER SYSTEM STATUS VIEW (aggregates all workflow categories)
-- ============================================================================
CREATE OR REPLACE VIEW master_system_status AS
SELECT
  150 as total_workflows,
  52 as total_migrations,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM leads WHERE total_jobs >= 1) as total_customers,
  (SELECT COALESCE(SUM(total_revenue), 0) FROM leads WHERE total_revenue > 0) as total_tracked_revenue,
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COUNT(*) FROM linkedin_prospects) as total_prospects,
  (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') as published_blogs,
  (SELECT all_healthy FROM system_health_log ORDER BY checked_at DESC LIMIT 1) as systems_healthy,
  now() as snapshot_at;

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE customer_anniversary_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reactivation_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_anniversary_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON customer_anniversary_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ga_reports' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON ga_reports FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_health_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON system_health_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lead_reactivation_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON lead_reactivation_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================================
-- 9. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_anniversary_lead ON customer_anniversary_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_anniversary_sent ON customer_anniversary_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_ga_reports_date ON ga_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_health_log_checked ON system_health_log(checked_at);
CREATE INDEX IF NOT EXISTS idx_reactivation_lead ON lead_reactivation_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_reactivation_sent ON lead_reactivation_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_reactivation_tier ON lead_reactivation_log(tier);
