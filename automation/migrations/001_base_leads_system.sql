-- Migration: 001_base_leads_system.sql
-- Description: Create base leads and lead_timeline tables
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Date: 2026-02-04

-- ============================================
-- 1. Create leads table
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  source_detail TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'WI',
  zip_code TEXT,
  property_type TEXT,
  services TEXT[],
  message TEXT,
  status TEXT DEFAULT 'new',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  landing_page TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Create lead_timeline table
-- ============================================

CREATE TABLE IF NOT EXISTS lead_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  performed_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_lead_id ON lead_timeline(lead_id);

-- ============================================
-- 4. Enable RLS
-- ============================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_timeline ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on lead_timeline" ON lead_timeline
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 5. jobber_email_events table (TotalGuard-specific)
-- Parses inbound Jobber notification emails into structured events
-- ============================================

CREATE TABLE IF NOT EXISTS jobber_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_email_subject text,
  raw_email_body text,
  parsed_event_type text CHECK (parsed_event_type IN ('new_request','job_scheduled','job_completed','invoice_sent','payment_received')),
  parsed_customer_name text,
  parsed_customer_email text,
  parsed_customer_phone text,
  parsed_service text,
  parsed_address text,
  parsed_amount numeric,
  parsed_job_status text,
  parsed_at timestamptz,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending','processed','failed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobber_email_events_event_type ON jobber_email_events(parsed_event_type);
CREATE INDEX IF NOT EXISTS idx_jobber_email_events_processing_status ON jobber_email_events(processing_status);

ALTER TABLE jobber_email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on jobber_email_events" ON jobber_email_events
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE leads IS 'Lead capture from all sources (website, LSA, phone, Facebook, manual) for TotalGuard Yard Care';
COMMENT ON TABLE lead_timeline IS 'Timeline of events for each lead (status changes, contacts, etc.)';
COMMENT ON TABLE jobber_email_events IS 'Parsed Jobber email notifications — new requests, scheduled jobs, completions, invoices, payments';
