-- Migration 021: Partner Program System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks realtor/property manager partner relationships, referrals, and commissions
-- $50 flat commission per booked job

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type TEXT NOT NULL,  -- 'realtor' | 'property_manager' | 'contractor' | 'other'
  company_name TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_title TEXT,
  business_address TEXT,
  business_city TEXT,
  business_state TEXT DEFAULT 'WI',
  business_zip TEXT,
  website TEXT,
  linkedin_url TEXT,
  partner_code TEXT UNIQUE NOT NULL,
  partner_url TEXT NOT NULL,
  commission_type TEXT DEFAULT 'flat',
  commission_amount NUMERIC(10,2) DEFAULT 50.00,
  commission_percentage NUMERIC(5,2),
  total_referrals INTEGER DEFAULT 0,
  total_jobs_booked INTEGER DEFAULT 0,
  total_revenue_generated NUMERIC(10,2) DEFAULT 0,
  total_commissions_earned NUMERIC(10,2) DEFAULT 0,
  total_commissions_paid NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'prospect',
  partnership_tier TEXT DEFAULT 'standard',
  first_contact_at TIMESTAMPTZ,
  first_contact_method TEXT,
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  outreach_stage TEXT DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  last_referral_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(contact_email);
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(partner_code);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_city ON partners(business_city);
CREATE INDEX IF NOT EXISTS idx_partners_outreach_stage ON partners(outreach_stage);

CREATE TABLE IF NOT EXISTS partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  partner_code TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  referral_source TEXT,
  referral_notes TEXT,
  job_booked BOOLEAN DEFAULT FALSE,
  jobber_job_id TEXT,
  job_booked_at TIMESTAMPTZ,
  job_completed BOOLEAN DEFAULT FALSE,
  job_completed_at TIMESTAMPTZ,
  job_service_type TEXT,
  job_total NUMERIC(10,2),
  commission_amount NUMERIC(10,2),
  commission_status TEXT DEFAULT 'pending',
  commission_paid_at TIMESTAMPTZ,
  commission_payment_method TEXT,
  commission_payment_reference TEXT,
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id ON partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_code ON partner_referrals(partner_code);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_customer_email ON partner_referrals(customer_email);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_referred_at ON partner_referrals(referred_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_commission_status ON partner_referrals(commission_status);

CREATE TABLE IF NOT EXISTS partner_outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  outreach_type TEXT NOT NULL,
  outreach_stage TEXT NOT NULL,
  subject TEXT,
  message_preview TEXT,
  brevo_message_id TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced BOOLEAN DEFAULT FALSE,
  call_duration_seconds INTEGER,
  call_outcome TEXT,
  result TEXT,
  result_notes TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_log_partner_id ON partner_outreach_log(partner_id);
CREATE INDEX IF NOT EXISTS idx_outreach_log_type ON partner_outreach_log(outreach_type);
CREATE INDEX IF NOT EXISTS idx_outreach_log_stage ON partner_outreach_log(outreach_stage);
CREATE INDEX IF NOT EXISTS idx_outreach_log_sent_at ON partner_outreach_log(sent_at DESC);

CREATE TABLE IF NOT EXISTS partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  payout_amount NUMERIC(10,2) NOT NULL,
  payout_method TEXT NOT NULL,
  payout_reference TEXT,
  referral_ids UUID[] NOT NULL,
  referral_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_reason TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON partner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON partner_payouts(created_at DESC);

-- Views
CREATE OR REPLACE VIEW partner_metrics AS
SELECT
  (SELECT COUNT(*) FROM partners WHERE status = 'prospect') AS prospects,
  (SELECT COUNT(*) FROM partners WHERE status = 'contacted') AS contacted,
  (SELECT COUNT(*) FROM partners WHERE status = 'active') AS active_partners,
  (SELECT COUNT(*) FROM partner_referrals WHERE referred_at >= CURRENT_DATE - INTERVAL '30 days') AS referrals_30d,
  (SELECT COUNT(*) FROM partner_referrals WHERE job_booked = true AND job_booked_at >= CURRENT_DATE - INTERVAL '30 days') AS jobs_booked_30d,
  (SELECT COALESCE(SUM(job_total), 0) FROM partner_referrals WHERE job_booked = true AND job_booked_at >= CURRENT_DATE - INTERVAL '30 days') AS revenue_30d,
  (SELECT COALESCE(SUM(commission_amount), 0) FROM partner_referrals WHERE commission_status = 'pending') AS pending_commissions,
  (SELECT COALESCE(SUM(commission_amount), 0) FROM partner_referrals WHERE commission_status = 'paid') AS total_commissions_paid,
  (SELECT COUNT(*) FROM partner_outreach_log WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days') AS outreach_7d;

CREATE OR REPLACE VIEW partner_leaderboard AS
SELECT
  p.id, p.partner_type, p.company_name, p.contact_name, p.contact_email, p.partnership_tier,
  p.total_referrals, p.total_jobs_booked, p.total_revenue_generated,
  p.total_commissions_earned, p.total_commissions_paid,
  p.total_commissions_earned - p.total_commissions_paid AS commissions_owed,
  p.status, p.last_referral_at,
  RANK() OVER (ORDER BY p.total_referrals DESC, p.total_revenue_generated DESC) AS rank
FROM partners p
WHERE p.status = 'active'
ORDER BY p.total_referrals DESC, p.total_revenue_generated DESC;

-- Functions
CREATE OR REPLACE FUNCTION generate_partner_code(p_partner_type TEXT, p_contact_name TEXT) RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_type_prefix TEXT;
  v_name_part TEXT;
  v_counter INTEGER := 0;
BEGIN
  v_type_prefix := CASE UPPER(p_partner_type)
    WHEN 'REALTOR' THEN 'REALTOR'
    WHEN 'PROPERTY_MANAGER' THEN 'PM'
    WHEN 'CONTRACTOR' THEN 'CONTR'
    ELSE 'PARTNER'
  END;
  v_name_part := UPPER(LEFT(REGEXP_REPLACE(COALESCE(p_contact_name, 'UNKNOWN'), '[^a-zA-Z]', '', 'g'), 8));
  v_code := v_type_prefix || '-' || v_name_part;
  WHILE EXISTS (SELECT 1 FROM partners WHERE partner_code = v_code) LOOP
    v_counter := v_counter + 1;
    v_code := v_type_prefix || '-' || v_name_part || v_counter::TEXT;
  END LOOP;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_partner(
  p_partner_type TEXT,
  p_contact_name TEXT,
  p_contact_email TEXT,
  p_company_name TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL,
  p_contact_title TEXT DEFAULT NULL,
  p_business_city TEXT DEFAULT NULL,
  p_commission_amount NUMERIC DEFAULT 50.00
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_code TEXT;
  v_url TEXT;
BEGIN
  SELECT id INTO v_id FROM partners WHERE contact_email = LOWER(p_contact_email);
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  v_code := generate_partner_code(p_partner_type, p_contact_name);
  v_url := 'https://tgyardcare.com/partners/' || v_code;
  INSERT INTO partners (partner_type, company_name, contact_name, contact_email, contact_phone, contact_title, business_city, partner_code, partner_url, commission_amount)
  VALUES (p_partner_type, p_company_name, p_contact_name, LOWER(p_contact_email), p_contact_phone, p_contact_title, p_business_city, v_code, v_url, p_commission_amount)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Seed: Top Madison Realtors (placeholders)
INSERT INTO partners (partner_type, contact_name, contact_email, company_name, business_city, partner_code, partner_url, status)
VALUES
  ('realtor', 'Madison Top Realtor 1', 'realtor1@example.com', 'RE/MAX Preferred', 'Madison', 'REALTOR-MTR1', 'https://tgyardcare.com/partners/REALTOR-MTR1', 'prospect'),
  ('realtor', 'Madison Top Realtor 2', 'realtor2@example.com', 'Keller Williams', 'Madison', 'REALTOR-MTR2', 'https://tgyardcare.com/partners/REALTOR-MTR2', 'prospect'),
  ('realtor', 'Madison Top Realtor 3', 'realtor3@example.com', 'Coldwell Banker', 'Madison', 'REALTOR-MTR3', 'https://tgyardcare.com/partners/REALTOR-MTR3', 'prospect'),
  ('property_manager', 'Oakbrook Property Management', 'contact@oakbrook.com', 'Oakbrook Corporation', 'Madison', 'PM-OAKBROOK', 'https://tgyardcare.com/partners/PM-OAKBROOK', 'prospect'),
  ('property_manager', 'Madison Property Management', 'info@madisonpm.com', 'Madison Property Management', 'Madison', 'PM-MADISONP', 'https://tgyardcare.com/partners/PM-MADISONP', 'prospect')
ON CONFLICT (partner_code) DO NOTHING;

-- RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_outreach_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY partners_service ON partners FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY partner_referrals_service ON partner_referrals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY partner_outreach_log_service ON partner_outreach_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY partner_payouts_service ON partner_payouts FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY partners_read ON partners FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY partner_referrals_read ON partner_referrals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY partner_outreach_log_read ON partner_outreach_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY partner_payouts_read ON partner_payouts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY partner_referrals_anon_insert ON partner_referrals FOR INSERT WITH CHECK (auth.role() = 'anon');
