-- Migration 026: Collections, Invoice Tracking & Estimate Follow-Up System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Automated collections for unpaid invoices + estimate conversion tracking

-- ============================================================================
-- 1. INVOICE TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobber_invoice_id TEXT UNIQUE NOT NULL,
    jobber_customer_id TEXT,
    jobber_job_id TEXT,
    lead_id UUID REFERENCES leads(id),

    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,

    invoice_number TEXT,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(10,2) NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'sent'
        CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void', 'collections')),
    sent_at TIMESTAMPTZ,
    due_date DATE,
    paid_at TIMESTAMPTZ,

    -- Collections sequence tracking
    collections_status TEXT DEFAULT 'none'
        CHECK (collections_status IN ('none', 'enrolled', 'day3_sent', 'day7_sent', 'day14_sent', 'escalated', 'resolved', 'written_off')),
    collections_enrolled_at TIMESTAMPTZ,
    collections_email_day3_sent_at TIMESTAMPTZ,
    collections_sms_day7_sent_at TIMESTAMPTZ,
    collections_email_day14_sent_at TIMESTAMPTZ,
    collections_escalated_at TIMESTAMPTZ,
    collections_resolved_at TIMESTAMPTZ,
    collections_notes TEXT,

    service_type TEXT,
    job_description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_collections_status ON invoices(collections_status);
CREATE INDEX IF NOT EXISTS idx_invoices_balance_due ON invoices(balance_due) WHERE balance_due > 0;
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status != 'paid';
CREATE INDEX IF NOT EXISTS idx_invoices_jobber_customer ON invoices(jobber_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_lead ON invoices(lead_id);

-- ============================================================================
-- 2. ESTIMATE TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobber_estimate_id TEXT UNIQUE NOT NULL,
    jobber_customer_id TEXT,
    lead_id UUID REFERENCES leads(id),

    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,

    estimate_number TEXT,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'sent'
        CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'declined', 'expired', 'converted')),
    sent_at TIMESTAMPTZ,
    expires_at DATE,
    approved_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    converted_to_job_at TIMESTAMPTZ,
    jobber_job_id TEXT,

    -- Follow-up sequence tracking
    followup_status TEXT DEFAULT 'none'
        CHECK (followup_status IN ('none', 'enrolled', 'day1_sent', 'day3_sent', 'day7_sent', 'day14_sent', 'completed', 'converted')),
    followup_enrolled_at TIMESTAMPTZ,
    followup_email_day1_sent_at TIMESTAMPTZ,
    followup_sms_day3_sent_at TIMESTAMPTZ,
    followup_email_day7_sent_at TIMESTAMPTZ,
    followup_email_day14_sent_at TIMESTAMPTZ,
    followup_notes TEXT,

    assigned_to TEXT,
    service_types TEXT[],
    service_description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_followup_status ON estimates(followup_status);
CREATE INDEX IF NOT EXISTS idx_estimates_jobber_customer ON estimates(jobber_customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_sent_at ON estimates(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_lead ON estimates(lead_id);

-- ============================================================================
-- 3. COLLECTIONS DASHBOARD VIEW
-- ============================================================================
CREATE OR REPLACE VIEW collections_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
  COALESCE(SUM(balance_due) FILTER (WHERE status = 'overdue'), 0) AS overdue_amount,
  COUNT(*) FILTER (WHERE collections_status = 'enrolled') AS in_collections,
  COALESCE(SUM(balance_due) FILTER (WHERE collections_status = 'enrolled'), 0) AS in_collections_amount,
  COUNT(*) FILTER (WHERE collections_status = 'escalated') AS escalated_count,
  COALESCE(SUM(balance_due) FILTER (WHERE collections_status = 'escalated'), 0) AS escalated_amount,
  COUNT(*) FILTER (WHERE status = 'paid' AND paid_at >= CURRENT_DATE - INTERVAL '30 days') AS paid_30d,
  COALESCE(SUM(total) FILTER (WHERE status = 'paid' AND paid_at >= CURRENT_DATE - INTERVAL '30 days'), 0) AS revenue_collected_30d
FROM invoices;

-- ============================================================================
-- 4. ESTIMATE PIPELINE VIEW
-- ============================================================================
CREATE OR REPLACE VIEW estimate_pipeline AS
SELECT
  COUNT(*) FILTER (WHERE status = 'sent') AS sent_count,
  COALESCE(SUM(total) FILTER (WHERE status = 'sent'), 0) AS sent_value,
  COUNT(*) FILTER (WHERE status = 'viewed') AS viewed_count,
  COALESCE(SUM(total) FILTER (WHERE status = 'viewed'), 0) AS viewed_value,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
  COALESCE(SUM(total) FILTER (WHERE status = 'approved'), 0) AS approved_value,
  COUNT(*) FILTER (WHERE status = 'converted') AS converted_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('approved','converted')) / NULLIF(COUNT(*) FILTER (WHERE status != 'draft'), 0), 1) AS conversion_rate
FROM estimates
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';

-- ============================================================================
-- 5. RLS Policies
-- ============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoices_service ON invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY estimates_service ON estimates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY invoices_read ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY estimates_read ON estimates FOR SELECT USING (auth.role() = 'authenticated');
