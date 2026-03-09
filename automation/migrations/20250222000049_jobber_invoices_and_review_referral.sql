-- Migration: Jobber Invoice Sync, Revenue Attribution, Review-Referral Bridge
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Adds tables for Jobber invoice tracking, revenue sync logging,
--              review-to-referral bridge, and extends linkedin_prospects + google_reviews.
--              CRM: Jobber (replacing HouseCall Pro / HCP)

-- ============================================================================
-- 1. JOBBER INVOICES TABLE (revenue attribution)
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobber_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jobber_invoice_id text UNIQUE,
  jobber_customer_id text,
  customer_name text,
  customer_email text,
  total_amount numeric(10,2) DEFAULT 0,
  paid_amount numeric(10,2) DEFAULT 0,
  balance_due numeric(10,2) DEFAULT 0,
  status text DEFAULT 'unknown',
  invoice_date timestamptz,
  paid_at timestamptz,
  service_type text,
  job_id text,
  -- Attribution
  lead_id uuid,
  lead_source text,
  attributed boolean DEFAULT false,
  attributed_at timestamptz,
  -- Sync tracking
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. REVENUE SYNC LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS revenue_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date timestamptz NOT NULL DEFAULT now(),
  invoices_synced integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  total_paid numeric(10,2) DEFAULT 0,
  outstanding numeric(10,2) DEFAULT 0,
  errors text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. REVIEW-REFERRAL BRIDGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_referral_bridge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid,
  lead_id uuid,
  reviewer_name text,
  channel text CHECK (channel IN ('email', 'sms', 'both')),
  sent_at timestamptz DEFAULT now(),
  referral_link_clicked boolean DEFAULT false,
  referral_converted boolean DEFAULT false,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. EXTEND GOOGLE_REVIEWS FOR REFERRAL TRACKING
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'google_reviews') THEN
    ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS referral_prompted boolean DEFAULT false;
    ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS referral_prompted_at timestamptz;
  END IF;
END $$;

-- ============================================================================
-- 5. EXTEND LINKEDIN_PROSPECTS FOR OUTREACH ENGINE
-- ============================================================================
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS role_category text;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 1;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS next_outreach_date timestamptz;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS last_outreach_at timestamptz;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS apollo_id text;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'unknown';
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS source text DEFAULT 'apollo';
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE linkedin_prospects ADD COLUMN IF NOT EXISTS company_size_num integer;

-- ============================================================================
-- 6. LINKEDIN SCRAPE LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS linkedin_scrape_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_prospects_found integer DEFAULT 0,
  with_email integer DEFAULT 0,
  with_linkedin integer DEFAULT 0,
  avg_score integer DEFAULT 0,
  search_queries jsonb,
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. RPC: GET LEADS MISSING SMS CONSENT
-- ============================================================================
CREATE OR REPLACE FUNCTION get_leads_missing_sms_consent()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT l.id, l.first_name, l.last_name, l.email, l.phone
  FROM leads l
  WHERE l.phone IS NOT NULL
    AND l.phone != ''
    AND (l.sms_consent IS NULL OR l.sms_consent = false)
    AND (l.sms_opt_out IS NULL OR l.sms_opt_out = false)
    AND l.status NOT IN ('junk', 'spam', 'invalid')
    AND NOT EXISTS (
      SELECT 1 FROM sms_consent_log scl
      WHERE scl.lead_id = l.id
        AND scl.created_at > now() - interval '30 days'
    )
  ORDER BY l.created_at DESC
  LIMIT 50;
$$;

-- ============================================================================
-- 8. RPC: UPDATE LEAD REVENUE FROM JOBBER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_lead_revenue_from_jobber(sync_date text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Match invoices to leads by email
  UPDATE jobber_invoices ji
  SET lead_id = l.id,
      lead_source = l.source,
      attributed = true,
      attributed_at = now()
  FROM leads l
  WHERE ji.customer_email = l.email
    AND ji.customer_email IS NOT NULL
    AND ji.customer_email != ''
    AND ji.attributed = false;

  -- Update lead revenue totals
  UPDATE leads l
  SET total_revenue = sub.total_rev,
      updated_at = now()
  FROM (
    SELECT lead_id, SUM(paid_amount) as total_rev
    FROM jobber_invoices
    WHERE lead_id IS NOT NULL AND attributed = true
    GROUP BY lead_id
  ) sub
  WHERE l.id = sub.lead_id
    AND sub.total_rev > COALESCE(l.total_revenue, 0);
END;
$$;

-- ============================================================================
-- 9. RPC: GET LINKEDIN PROSPECTS DUE FOR OUTREACH
-- ============================================================================
CREATE OR REPLACE FUNCTION get_linkedin_prospects_due_for_outreach()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company_name text,
  role_category text,
  current_step integer,
  prospect_score integer
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    lp.id,
    lp.first_name,
    lp.last_name,
    lp.email,
    lp.phone,
    COALESCE(lp.company_name, lp.company, '') as company_name,
    COALESCE(lp.role_category, lp.prospect_type, 'unknown') as role_category,
    COALESCE(lp.current_step, 1) as current_step,
    lp.prospect_score
  FROM linkedin_prospects lp
  WHERE lp.email IS NOT NULL
    AND lp.email != ''
    AND COALESCE(lp.status, lp.outreach_status) NOT IN ('converted', 'not_interested', 'do_not_contact', 'bounced', 'sequence_complete')
    AND (lp.next_outreach_date IS NULL OR lp.next_outreach_date <= now())
    AND COALESCE(lp.current_step, 1) <= 5
  ORDER BY lp.prospect_score DESC NULLS LAST
  LIMIT 20;
$$;

-- ============================================================================
-- 10. VIEWS
-- ============================================================================

-- Revenue attribution dashboard
CREATE OR REPLACE VIEW revenue_attribution_dashboard AS
SELECT
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE attributed) as attributed_invoices,
  ROUND(COUNT(*) FILTER (WHERE attributed)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as attribution_rate,
  COALESCE(SUM(total_amount), 0) as total_revenue,
  COALESCE(SUM(paid_amount), 0) as total_collected,
  COALESCE(SUM(balance_due), 0) as total_outstanding,
  COUNT(DISTINCT lead_source) FILTER (WHERE attributed) as unique_sources,
  jsonb_object_agg(
    COALESCE(lead_source, 'unattributed'),
    jsonb_build_object(
      'invoices', cnt,
      'revenue', rev
    )
  ) as by_source
FROM (
  SELECT
    lead_source,
    COUNT(*) as cnt,
    COALESCE(SUM(total_amount), 0) as rev,
    attributed,
    total_amount,
    paid_amount,
    balance_due
  FROM jobber_invoices
  GROUP BY lead_source, attributed, total_amount, paid_amount, balance_due
) sub;

-- Simpler revenue by source view
CREATE OR REPLACE VIEW revenue_by_lead_source AS
SELECT
  COALESCE(lead_source, 'Unattributed') as source,
  COUNT(*) as invoices,
  COALESCE(SUM(total_amount), 0) as total_revenue,
  COALESCE(SUM(paid_amount), 0) as collected,
  COALESCE(SUM(balance_due), 0) as outstanding,
  ROUND(AVG(total_amount), 2) as avg_invoice
FROM jobber_invoices
GROUP BY lead_source
ORDER BY total_revenue DESC;

-- Review-referral bridge performance
CREATE OR REPLACE VIEW review_referral_performance AS
SELECT
  COUNT(*) as total_prompted,
  COUNT(*) FILTER (WHERE referral_link_clicked) as clicked,
  COUNT(*) FILTER (WHERE referral_converted) as converted,
  ROUND(COUNT(*) FILTER (WHERE referral_converted)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
  COUNT(*) FILTER (WHERE channel = 'email') as via_email,
  COUNT(*) FILTER (WHERE channel = 'sms') as via_sms
FROM review_referral_bridge;

-- LinkedIn outreach pipeline
CREATE OR REPLACE VIEW linkedin_outreach_pipeline AS
SELECT
  COUNT(*) as total_prospects,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) = 'new') as new_prospects,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) IN ('in_sequence', 'sequence_enrolled', 'contacted')) as in_sequence,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) = 'replied') as replied,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) = 'interested') as interested,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) = 'meeting_booked') as meetings_booked,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) = 'converted') as converted,
  COUNT(*) FILTER (WHERE COALESCE(status, outreach_status) = 'not_interested') as not_interested,
  ROUND(AVG(prospect_score), 1) as avg_score,
  COUNT(*) FILTER (WHERE next_outreach_date <= now()) as due_today
FROM linkedin_prospects;

-- ============================================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE jobber_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_referral_bridge ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_scrape_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobber_invoices' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON jobber_invoices FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'revenue_sync_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON revenue_sync_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_referral_bridge' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON review_referral_bridge FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'linkedin_scrape_log' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON linkedin_scrape_log FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================================
-- 12. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_jobber_invoices_customer ON jobber_invoices(jobber_customer_id);
CREATE INDEX IF NOT EXISTS idx_jobber_invoices_email ON jobber_invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_jobber_invoices_lead ON jobber_invoices(lead_id);
CREATE INDEX IF NOT EXISTS idx_jobber_invoices_status ON jobber_invoices(status);
CREATE INDEX IF NOT EXISTS idx_jobber_invoices_date ON jobber_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_review_referral_review ON review_referral_bridge(review_id);
CREATE INDEX IF NOT EXISTS idx_review_referral_lead ON review_referral_bridge(lead_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_outreach_date ON linkedin_prospects(next_outreach_date);
CREATE INDEX IF NOT EXISTS idx_linkedin_step ON linkedin_prospects(current_step);
