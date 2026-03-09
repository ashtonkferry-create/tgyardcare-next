-- Migration 20250222000044: Collections & Estimates Automation System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Automated collections, estimate follow-up, unscheduled job booking, and seasonal pre-booking
-- Tables: collection_attempts, estimate_followups, scheduling_followups, rebook_attempts
-- RPCs: get_overdue_invoices, get_stale_estimates, get_unscheduled_jobs, get_seasonal_rebook_candidates
-- Views: collections_dashboard (v2), estimate_followup_dashboard, rebook_dashboard

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- Collection attempts tracking
CREATE TABLE IF NOT EXISTS collection_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text NOT NULL,
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  invoice_number text,
  amount numeric(10,2),
  days_overdue integer,
  attempt_type text NOT NULL CHECK (attempt_type IN ('email_reminder', 'sms_reminder', 'escalation', 'owner_alert')),
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  sent_at timestamptz DEFAULT now(),
  response_received boolean DEFAULT false,
  payment_received boolean DEFAULT false,
  payment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Estimate follow-up tracking
CREATE TABLE IF NOT EXISTS estimate_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id text NOT NULL,
  customer_id text,
  customer_name text,
  customer_email text,
  service_type text,
  estimate_amount numeric(10,2),
  days_since_created integer,
  followup_type text NOT NULL CHECK (followup_type IN ('warm', 'urgent', 'discount', 'breakup')),
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  discount_offered numeric(5,2) DEFAULT 0,
  sent_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Scheduling follow-up tracking for unscheduled jobs
CREATE TABLE IF NOT EXISTS scheduling_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL,
  customer_id text,
  customer_name text,
  service_type text,
  job_amount numeric(10,2),
  days_unscheduled integer,
  followup_type text NOT NULL CHECK (followup_type IN ('initial', 'reminder', 'urgent', 'owner_alert')),
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  sent_at timestamptz DEFAULT now(),
  scheduled boolean DEFAULT false,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Seasonal rebook attempt tracking
CREATE TABLE IF NOT EXISTS rebook_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_type text NOT NULL,
  last_service_date date,
  suggested_date date,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  discount_offered numeric(5,2) DEFAULT 0,
  sent_at timestamptz DEFAULT now(),
  booked boolean DEFAULT false,
  booked_at timestamptz,
  season text CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. RPCs
-- ============================================================================

-- Get overdue invoices by cross-referencing leads with collection_attempts
CREATE OR REPLACE FUNCTION get_overdue_invoices()
RETURNS TABLE (
  invoice_id text,
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  invoice_number text,
  amount numeric,
  days_overdue integer,
  last_attempt_at timestamptz,
  attempt_count integer
) LANGUAGE sql STABLE AS $$
  SELECT
    l.id::text as invoice_id,
    l.id::text as customer_id,
    COALESCE(TRIM(COALESCE(l.first_name, '') || ' ' || COALESCE(l.last_name, '')), 'Unknown') as customer_name,
    l.email as customer_email,
    l.phone as customer_phone,
    'INV-' || LEFT(l.id::text, 8) as invoice_number,
    COALESCE(l.total_revenue, l.first_job_revenue, 0) as amount,
    EXTRACT(DAY FROM now() - COALESCE(l.updated_at, l.created_at))::integer as days_overdue,
    (SELECT MAX(ca.sent_at) FROM collection_attempts ca WHERE ca.customer_id = l.id::text) as last_attempt_at,
    (SELECT COUNT(*)::integer FROM collection_attempts ca WHERE ca.customer_id = l.id::text) as attempt_count
  FROM leads l
  WHERE l.status = 'booked'
    AND COALESCE(l.total_revenue, l.first_job_revenue, 0) > 0
    AND EXTRACT(DAY FROM now() - COALESCE(l.updated_at, l.created_at)) > 3
    AND NOT EXISTS (
      SELECT 1 FROM collection_attempts ca
      WHERE ca.customer_id = l.id::text
        AND ca.payment_received = true
    )
  ORDER BY days_overdue DESC;
$$;

-- Get stale estimates that need follow-up
CREATE OR REPLACE FUNCTION get_stale_estimates()
RETURNS TABLE (
  estimate_id text,
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_type text,
  amount numeric,
  days_since_created integer,
  last_followup_at timestamptz,
  followup_count integer
) LANGUAGE sql STABLE AS $$
  SELECT
    l.id::text as estimate_id,
    l.id::text as customer_id,
    COALESCE(TRIM(COALESCE(l.first_name, '') || ' ' || COALESCE(l.last_name, '')), 'Unknown') as customer_name,
    l.email as customer_email,
    l.phone as customer_phone,
    COALESCE(l.services[1], 'General Service') as service_type,
    COALESCE(l.first_job_revenue, 0) as amount,
    EXTRACT(DAY FROM now() - l.created_at)::integer as days_since_created,
    (SELECT MAX(ef.sent_at) FROM estimate_followups ef WHERE ef.estimate_id = l.id::text) as last_followup_at,
    (SELECT COUNT(*)::integer FROM estimate_followups ef WHERE ef.estimate_id = l.id::text) as followup_count
  FROM leads l
  WHERE l.status IN ('quoted', 'new')
    AND l.email IS NOT NULL
    AND EXTRACT(DAY FROM now() - l.created_at) > 3
    AND (
      NOT EXISTS (
        SELECT 1 FROM estimate_followups ef
        WHERE ef.estimate_id = l.id::text
          AND ef.sent_at > now() - interval '3 days'
      )
    )
  ORDER BY days_since_created DESC;
$$;

-- Get unscheduled jobs that need scheduling follow-up
CREATE OR REPLACE FUNCTION get_unscheduled_jobs()
RETURNS TABLE (
  job_id text,
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_type text,
  amount numeric,
  days_since_created integer,
  last_followup_at timestamptz,
  followup_count integer
) LANGUAGE sql STABLE AS $$
  SELECT
    l.id::text as job_id,
    l.id::text as customer_id,
    COALESCE(TRIM(COALESCE(l.first_name, '') || ' ' || COALESCE(l.last_name, '')), 'Unknown') as customer_name,
    l.email as customer_email,
    l.phone as customer_phone,
    COALESCE(l.services[1], 'General Service') as service_type,
    COALESCE(l.first_job_revenue, 0) as amount,
    EXTRACT(DAY FROM now() - l.created_at)::integer as days_since_created,
    (SELECT MAX(sf.sent_at) FROM scheduling_followups sf WHERE sf.job_id = l.id::text) as last_followup_at,
    (SELECT COUNT(*)::integer FROM scheduling_followups sf WHERE sf.job_id = l.id::text) as followup_count
  FROM leads l
  WHERE l.status = 'contacted'
    AND l.email IS NOT NULL
    AND EXTRACT(DAY FROM now() - l.created_at) > 1
    AND (
      NOT EXISTS (
        SELECT 1 FROM scheduling_followups sf
        WHERE sf.job_id = l.id::text
          AND sf.sent_at > now() - interval '3 days'
      )
    )
  ORDER BY days_since_created DESC;
$$;

-- Get seasonal rebook candidates based on past service history
CREATE OR REPLACE FUNCTION get_seasonal_rebook_candidates()
RETURNS TABLE (
  customer_id text,
  first_name text,
  customer_email text,
  customer_phone text,
  service_type text,
  last_service_date date,
  service_description text,
  suggested_season text,
  days_since_last_service integer
) LANGUAGE sql STABLE AS $$
  WITH last_services AS (
    SELECT
      l.id::text as customer_id,
      l.first_name,
      l.email as customer_email,
      l.phone as customer_phone,
      COALESCE(l.services[1], 'General Service') as svc_type,
      l.created_at::date as last_service_date,
      CASE
        WHEN EXTRACT(MONTH FROM l.created_at) IN (3,4,5) THEN 'spring'
        WHEN EXTRACT(MONTH FROM l.created_at) IN (6,7,8) THEN 'summer'
        WHEN EXTRACT(MONTH FROM l.created_at) IN (9,10,11) THEN 'fall'
        ELSE 'winter'
      END as service_season,
      CASE
        WHEN EXTRACT(MONTH FROM now()) IN (3,4,5) THEN 'spring'
        WHEN EXTRACT(MONTH FROM now()) IN (6,7,8) THEN 'summer'
        WHEN EXTRACT(MONTH FROM now()) IN (9,10,11) THEN 'fall'
        ELSE 'winter'
      END as current_season
    FROM leads l
    WHERE l.status = 'booked'
      AND l.created_at > now() - interval '18 months'
      AND l.created_at < now() - interval '9 months'
      AND l.email IS NOT NULL
  )
  SELECT
    ls.customer_id,
    ls.first_name,
    ls.customer_email,
    ls.customer_phone,
    ls.svc_type as service_type,
    ls.last_service_date,
    ls.svc_type || ' service' as service_description,
    ls.current_season as suggested_season,
    EXTRACT(DAY FROM now() - ls.last_service_date::timestamptz)::integer as days_since_last_service
  FROM last_services ls
  WHERE ls.service_season = ls.current_season
    AND NOT EXISTS (
      SELECT 1 FROM rebook_attempts ra
      WHERE ra.customer_id = ls.customer_id
        AND ra.sent_at > now() - interval '30 days'
    )
  ORDER BY ls.last_service_date;
$$;

-- ============================================================================
-- 3. VIEWS
-- ============================================================================

-- Drop existing collections_dashboard view so we can replace it
DROP VIEW IF EXISTS collections_dashboard;

-- Collections dashboard view (v2) - based on collection_attempts table
CREATE OR REPLACE VIEW collections_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE NOT ca.payment_received) as total_outstanding,
  COALESCE(SUM(ca.amount) FILTER (WHERE NOT ca.payment_received), 0) as total_amount_outstanding,
  COUNT(*) FILTER (WHERE ca.payment_received) as total_collected,
  COALESCE(SUM(ca.amount) FILTER (WHERE ca.payment_received), 0) as total_amount_collected,
  COUNT(*) FILTER (WHERE ca.sent_at > now() - interval '7 days') as attempts_last_7d,
  COUNT(*) FILTER (WHERE ca.payment_received AND ca.payment_date > now() - interval '30 days') as collected_last_30d,
  COALESCE(SUM(ca.amount) FILTER (WHERE ca.payment_received AND ca.payment_date > now() - interval '30 days'), 0) as collected_amount_30d
FROM collection_attempts ca
WHERE ca.sent_at = (
  SELECT MAX(ca2.sent_at) FROM collection_attempts ca2 WHERE ca2.invoice_id = ca.invoice_id
);

-- Estimate follow-up dashboard view
CREATE OR REPLACE VIEW estimate_followup_dashboard AS
SELECT
  COUNT(DISTINCT ef.estimate_id) as total_estimates_followed_up,
  COUNT(DISTINCT ef.estimate_id) FILTER (WHERE ef.converted) as total_converted,
  COALESCE(SUM(ef.estimate_amount) FILTER (WHERE ef.converted), 0) as revenue_from_conversions,
  ROUND(
    COUNT(DISTINCT ef.estimate_id) FILTER (WHERE ef.converted)::numeric /
    NULLIF(COUNT(DISTINCT ef.estimate_id), 0) * 100, 1
  ) as conversion_rate,
  COUNT(*) FILTER (WHERE ef.sent_at > now() - interval '7 days') as followups_last_7d
FROM estimate_followups ef;

-- Rebook dashboard view
CREATE OR REPLACE VIEW rebook_dashboard AS
SELECT
  COUNT(*) as total_rebook_attempts,
  COUNT(*) FILTER (WHERE ra.booked) as total_rebooked,
  ROUND(
    COUNT(*) FILTER (WHERE ra.booked)::numeric / NULLIF(COUNT(*), 0) * 100, 1
  ) as rebook_rate,
  COUNT(*) FILTER (WHERE ra.sent_at > now() - interval '30 days') as attempts_last_30d,
  COUNT(*) FILTER (WHERE ra.booked AND ra.booked_at > now() - interval '30 days') as rebooked_last_30d,
  COUNT(DISTINCT ra.customer_id) as unique_customers_contacted
FROM rebook_attempts ra;

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE collection_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebook_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON collection_attempts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON estimate_followups FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON scheduling_followups FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON rebook_attempts FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_collection_attempts_invoice ON collection_attempts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_collection_attempts_customer ON collection_attempts(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimate_followups_estimate ON estimate_followups(estimate_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_followups_job ON scheduling_followups(job_id);
CREATE INDEX IF NOT EXISTS idx_rebook_attempts_customer ON rebook_attempts(customer_id);
CREATE INDEX IF NOT EXISTS idx_rebook_attempts_season ON rebook_attempts(season);
