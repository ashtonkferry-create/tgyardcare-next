-- Migration 028: Review-Referral Bridge
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Links review requests to referral program — customers who leave reviews get referral codes

CREATE TABLE IF NOT EXISTS review_referral_bridge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Review linkage
  review_request_id UUID REFERENCES review_requests(id),
  review_id UUID REFERENCES reviews(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,

  -- Referral program linkage
  referral_program_id UUID REFERENCES referral_program(id),
  referral_code TEXT,

  -- Flow tracking
  review_left BOOLEAN DEFAULT FALSE,
  review_left_at TIMESTAMPTZ,
  referral_offer_sent BOOLEAN DEFAULT FALSE,
  referral_offer_sent_at TIMESTAMPTZ,
  referral_code_used BOOLEAN DEFAULT FALSE,

  -- Attribution
  triggered_by TEXT DEFAULT 'post_review',  -- 'post_review' | 'milestone' | 'manual'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_referral_email ON review_referral_bridge(customer_email);
CREATE INDEX IF NOT EXISTS idx_review_referral_review ON review_referral_bridge(review_id);
CREATE INDEX IF NOT EXISTS idx_review_referral_code ON review_referral_bridge(referral_code);

-- Function: enroll_reviewer_in_referral
-- Called after a review is confirmed — creates referral code and sends offer
CREATE OR REPLACE FUNCTION enroll_reviewer_in_referral(
  p_customer_email TEXT,
  p_customer_name TEXT DEFAULT NULL,
  p_review_id UUID DEFAULT NULL,
  p_review_request_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_referral_id UUID;
  v_referral_code TEXT;
BEGIN
  -- Create or get referral program entry
  v_referral_id := create_referral_code(p_customer_email, p_customer_name);

  SELECT referral_code INTO v_referral_code FROM referral_program WHERE id = v_referral_id;

  -- Insert bridge record
  INSERT INTO review_referral_bridge (
    review_request_id, review_id, customer_email, customer_name,
    referral_program_id, referral_code, review_left, review_left_at
  ) VALUES (
    p_review_request_id, p_review_id, LOWER(p_customer_email), p_customer_name,
    v_referral_id, v_referral_code, true, NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE review_referral_bridge ENABLE ROW LEVEL SECURITY;
CREATE POLICY review_referral_bridge_service ON review_referral_bridge FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY review_referral_bridge_read ON review_referral_bridge FOR SELECT USING (auth.role() = 'authenticated');
