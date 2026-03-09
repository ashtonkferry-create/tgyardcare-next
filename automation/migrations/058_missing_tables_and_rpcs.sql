-- Migration 058: Create missing tables and RPCs referenced by n8n workflows
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tables: booking_recovery_log, postcard_campaigns, door_hanger_batches, notification_log
-- RPCs: grant_sms_consent, increment_sequence_enrolled

-- 1. booking_recovery_log (WF 72 - Unscheduled Job Booking)
CREATE TABLE IF NOT EXISTS booking_recovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  recovery_type TEXT,
  recovery_status TEXT DEFAULT 'pending',
  original_estimate_date TIMESTAMPTZ,
  booked_at TIMESTAMPTZ,
  recovery_channel TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_recovery_lead ON booking_recovery_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_booking_recovery_status ON booking_recovery_log(recovery_status);

-- 2. postcard_campaigns (WF 103 - Postcard Lead Scoring)
CREATE TABLE IF NOT EXISTS postcard_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  target_area TEXT,
  target_zip TEXT,
  variant TEXT,
  sent_count INT DEFAULT 0,
  response_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  revenue_attributed NUMERIC(10,2) DEFAULT 0,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_postcard_campaigns_status ON postcard_campaigns(status);

-- 3. door_hanger_batches (WF 93 - Door Hanger Optimizer)
CREATE TABLE IF NOT EXISTS door_hanger_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant TEXT,
  area TEXT,
  zip_code TEXT,
  quantity INT DEFAULT 0,
  responses INT DEFAULT 0,
  conversions INT DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  revenue_attributed NUMERIC(10,2) DEFAULT 0,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_door_hanger_area ON door_hanger_batches(area);

-- 4. notification_log (WF 153 - Media AI Tagger, general use)
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  channel TEXT DEFAULT 'email',
  recipient TEXT,
  subject TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_type ON notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_recipient ON notification_log(recipient);

-- 5. RPC: grant_sms_consent (WF 100 - SMS Consent Collector)
CREATE OR REPLACE FUNCTION grant_sms_consent(p_lead_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE leads
  SET sms_consent = true,
      sms_consent_at = now(),
      updated_at = now()
  WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: increment_sequence_enrolled (WF 70 - LinkedIn Sequence Enrollment)
CREATE OR REPLACE FUNCTION increment_sequence_enrolled(p_sequence_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE linkedin_sequences
  SET enrolled_count = COALESCE(enrolled_count, 0) + 1,
      updated_at = now()
  WHERE id = p_sequence_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE booking_recovery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE postcard_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE door_hanger_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (n8n uses service role key)
CREATE POLICY "Service role full access" ON booking_recovery_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON postcard_campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON door_hanger_batches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON notification_log FOR ALL USING (auth.role() = 'service_role');
