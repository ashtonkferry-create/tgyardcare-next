-- Migration 020: Customer Referral Program
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks customer-to-customer referrals with reward tracking

CREATE TABLE IF NOT EXISTS referral_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referring customer
  referrer_email TEXT NOT NULL,
  referrer_name TEXT,
  referrer_phone TEXT,
  jobber_customer_id TEXT,

  -- Referral code
  referral_code TEXT UNIQUE NOT NULL,
  referral_url TEXT NOT NULL,

  -- Reward structure
  referrer_reward_type TEXT DEFAULT 'discount',   -- 'discount' | 'credit' | 'cash'
  referrer_reward_amount NUMERIC(10,2) DEFAULT 25.00,
  referee_reward_type TEXT DEFAULT 'discount',    -- reward for the new customer
  referee_reward_amount NUMERIC(10,2) DEFAULT 15.00,
  referee_reward_code TEXT,

  -- Stats
  total_referrals INTEGER DEFAULT 0,
  total_jobs_booked INTEGER DEFAULT 0,
  total_rewards_earned NUMERIC(10,2) DEFAULT 0,
  total_rewards_paid NUMERIC(10,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active',   -- 'active' | 'paused' | 'expired'
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_program_id UUID REFERENCES referral_program(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,

  -- New customer info
  referee_email TEXT,
  referee_name TEXT,
  referee_phone TEXT,
  referee_address TEXT,

  -- Conversion tracking
  referral_source TEXT DEFAULT 'referral_link',
  referred_at TIMESTAMPTZ DEFAULT NOW(),

  -- Job tracking
  job_booked BOOLEAN DEFAULT FALSE,
  jobber_job_id TEXT,
  job_booked_at TIMESTAMPTZ,
  job_completed BOOLEAN DEFAULT FALSE,
  job_completed_at TIMESTAMPTZ,
  job_service_type TEXT,
  job_total NUMERIC(10,2),

  -- Reward tracking
  referrer_reward_status TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'paid' | 'cancelled'
  referrer_reward_paid_at TIMESTAMPTZ,
  referee_discount_applied BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_program_email ON referral_program(referrer_email);
CREATE INDEX IF NOT EXISTS idx_referral_program_code ON referral_program(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_program_status ON referral_program(status);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_program ON referral_conversions(referral_program_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_code ON referral_conversions(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referee ON referral_conversions(referee_email);

-- Function: create_referral_code
CREATE OR REPLACE FUNCTION create_referral_code(
  p_referrer_email TEXT,
  p_referrer_name TEXT DEFAULT NULL,
  p_jobber_customer_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_code TEXT;
  v_name_part TEXT;
BEGIN
  -- Check if already enrolled
  SELECT id INTO v_id FROM referral_program WHERE referrer_email = LOWER(p_referrer_email);
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;

  -- Generate code from name
  v_name_part := UPPER(LEFT(REGEXP_REPLACE(COALESCE(p_referrer_name, 'FRIEND'), '[^a-zA-Z]', '', 'g'), 6));
  v_code := 'TG-' || v_name_part || '-' || UPPER(SUBSTR(MD5(p_referrer_email), 1, 4));

  WHILE EXISTS (SELECT 1 FROM referral_program WHERE referral_code = v_code) LOOP
    v_code := 'TG-' || v_name_part || '-' || UPPER(SUBSTR(MD5(p_referrer_email || NOW()::TEXT), 1, 4));
  END LOOP;

  INSERT INTO referral_program (
    referrer_email, referrer_name, jobber_customer_id,
    referral_code, referral_url
  ) VALUES (
    LOWER(p_referrer_email), p_referrer_name, p_jobber_customer_id,
    v_code, 'https://tgyardcare.com/refer/' || v_code
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_program_service ON referral_program FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY referral_conversions_service ON referral_conversions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY referral_program_read ON referral_program FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY referral_conversions_read ON referral_conversions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY referral_conversions_anon_insert ON referral_conversions FOR INSERT WITH CHECK (auth.role() = 'anon');
