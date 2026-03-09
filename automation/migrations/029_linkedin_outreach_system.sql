-- Migration 029: LinkedIn Outreach System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Targets property managers, commercial accounts, and real estate professionals

CREATE TABLE IF NOT EXISTS linkedin_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_profile_url TEXT UNIQUE,
  full_name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  company_size TEXT,
  industry TEXT,
  location TEXT DEFAULT 'Madison, WI',

  -- Relevance
  prospect_type TEXT,  -- 'property_manager' | 'realtor' | 'commercial_decision_maker' | 'hoa_manager'
  relevance_score INTEGER DEFAULT 0,
  relevance_notes TEXT,

  -- Contact info (when found)
  email TEXT,
  phone TEXT,

  -- Outreach tracking
  outreach_status TEXT DEFAULT 'new',  -- 'new' | 'connection_sent' | 'connected' | 'messaged' | 'responded' | 'meeting_booked' | 'converted' | 'not_interested'
  connection_request_sent_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  first_message_sent_at TIMESTAMPTZ,
  first_message_text TEXT,
  follow_up_1_sent_at TIMESTAMPTZ,
  follow_up_2_sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_text TEXT,
  response_sentiment TEXT,  -- 'positive' | 'neutral' | 'negative'

  -- Outcome
  meeting_booked BOOLEAN DEFAULT FALSE,
  meeting_date DATE,
  became_partner BOOLEAN DEFAULT FALSE,
  became_customer BOOLEAN DEFAULT FALSE,
  jobber_customer_id TEXT,
  revenue_attributed NUMERIC(10,2) DEFAULT 0,

  notes TEXT,
  priority INTEGER DEFAULT 2,  -- 1=high, 2=medium, 3=low

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_status ON linkedin_prospects(outreach_status);
CREATE INDEX IF NOT EXISTS idx_linkedin_type ON linkedin_prospects(prospect_type);
CREATE INDEX IF NOT EXISTS idx_linkedin_relevance ON linkedin_prospects(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_priority ON linkedin_prospects(priority);

-- View: linkedin_pipeline
CREATE OR REPLACE VIEW linkedin_pipeline AS
SELECT
  COUNT(*) FILTER (WHERE outreach_status = 'new') AS new_prospects,
  COUNT(*) FILTER (WHERE outreach_status = 'connection_sent') AS connections_pending,
  COUNT(*) FILTER (WHERE outreach_status = 'connected') AS connected,
  COUNT(*) FILTER (WHERE outreach_status = 'messaged') AS messaged,
  COUNT(*) FILTER (WHERE outreach_status = 'responded') AS responded,
  COUNT(*) FILTER (WHERE outreach_status = 'meeting_booked') AS meetings_booked,
  COUNT(*) FILTER (WHERE became_partner = true) AS partners_converted,
  COUNT(*) FILTER (WHERE became_customer = true) AS customers_converted,
  ROUND(100.0 * COUNT(*) FILTER (WHERE outreach_status = 'responded') / NULLIF(COUNT(*) FILTER (WHERE outreach_status IN ('messaged','responded','meeting_booked')), 0), 1) AS response_rate
FROM linkedin_prospects;

-- RLS
ALTER TABLE linkedin_prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY linkedin_prospects_service ON linkedin_prospects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY linkedin_prospects_read ON linkedin_prospects FOR SELECT USING (auth.role() = 'authenticated');
