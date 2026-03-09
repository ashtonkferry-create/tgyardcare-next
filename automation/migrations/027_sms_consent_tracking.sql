-- Migration 027: SMS Consent Tracking
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks SMS opt-in/opt-out for TCPA compliance

CREATE TABLE IF NOT EXISTS sms_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  email TEXT,
  customer_name TEXT,

  -- Consent status
  consent_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (consent_status IN ('pending', 'opted_in', 'opted_out', 'do_not_contact')),
  consent_method TEXT,   -- 'web_form' | 'verbal' | 'text_reply' | 'jobber' | 'import'
  consent_text TEXT,     -- exact opt-in language shown/used
  opted_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  opt_out_reason TEXT,

  -- TCPA compliance
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,

  -- Jobber linkage
  jobber_customer_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(phone)
);

CREATE INDEX IF NOT EXISTS idx_sms_consent_phone ON sms_consent(phone);
CREATE INDEX IF NOT EXISTS idx_sms_consent_email ON sms_consent(email);
CREATE INDEX IF NOT EXISTS idx_sms_consent_status ON sms_consent(consent_status);
CREATE INDEX IF NOT EXISTS idx_sms_consent_jobber ON sms_consent(jobber_customer_id);

-- Table: sms_sends
CREATE TABLE IF NOT EXISTS sms_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  from_phone TEXT,
  message_body TEXT NOT NULL,
  workflow_name TEXT,
  message_type TEXT,
  external_message_id TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_sends_phone ON sms_sends(to_phone);
CREATE INDEX IF NOT EXISTS idx_sms_sends_workflow ON sms_sends(workflow_name);
CREATE INDEX IF NOT EXISTS idx_sms_sends_sent_at ON sms_sends(sent_at DESC);

-- Function: can_send_sms
CREATE OR REPLACE FUNCTION can_send_sms(p_phone TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sms_consent
    WHERE phone = p_phone AND consent_status = 'opted_in'
  ) AND NOT EXISTS (
    SELECT 1 FROM sms_consent
    WHERE phone = p_phone AND consent_status = 'do_not_contact'
  );
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE sms_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY sms_consent_service ON sms_consent FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY sms_sends_service ON sms_sends FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY sms_consent_read ON sms_consent FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY sms_sends_read ON sms_sends FOR SELECT USING (auth.role() = 'authenticated');
