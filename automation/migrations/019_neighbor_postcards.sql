-- Migration 019: Neighbor Postcard System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks postcard campaigns sent to neighbors after job completion
-- Supports "Just Serviced Your Neighbor's Lawn" radius marketing with QR code tracking

CREATE TABLE IF NOT EXISTS neighbor_postcard_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job info from Jobber webhook
  job_id TEXT NOT NULL,
  job_completed_at TIMESTAMPTZ NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  jobber_customer_id TEXT,
  service_type TEXT NOT NULL,  -- 'lawn_mowing' | 'fertilization' | 'aeration' | 'gutter_cleaning' | 'snow_removal' | etc.
  job_total NUMERIC(10,2),

  -- Job location
  job_address TEXT NOT NULL,
  job_city TEXT,
  job_state TEXT DEFAULT 'WI',
  job_zip TEXT,
  job_lat NUMERIC(10,7),
  job_lng NUMERIC(10,7),

  -- Queue status
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,

  -- Targeting
  target_radius_miles NUMERIC(3,2) DEFAULT 0.30,
  estimated_neighbors INTEGER,

  -- Promo code for tracking
  promo_code TEXT UNIQUE,
  promo_discount_percent INTEGER DEFAULT 10,
  promo_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_postcard_queue_status ON neighbor_postcard_queue(status);
CREATE INDEX IF NOT EXISTS idx_postcard_queue_job_id ON neighbor_postcard_queue(job_id);
CREATE INDEX IF NOT EXISTS idx_postcard_queue_created_at ON neighbor_postcard_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_postcard_queue_promo_code ON neighbor_postcard_queue(promo_code);
CREATE INDEX IF NOT EXISTS idx_postcard_queue_city ON neighbor_postcard_queue(job_city);

CREATE TABLE IF NOT EXISTS neighbor_postcards_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES neighbor_postcard_queue(id) ON DELETE CASCADE,
  neighbor_address TEXT NOT NULL,
  neighbor_city TEXT,
  neighbor_state TEXT DEFAULT 'WI',
  neighbor_zip TEXT,
  neighbor_lat NUMERIC(10,7),
  neighbor_lng NUMERIC(10,7),
  distance_miles NUMERIC(4,3),
  lob_postcard_id TEXT,
  lob_status TEXT,
  lob_tracking_number TEXT,
  lob_expected_delivery_date DATE,
  lob_actual_delivery_date DATE,
  lob_cost_cents INTEGER,
  template_id TEXT DEFAULT 'tg_neighbor_v1',
  personalization_data JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_postcards_sent_queue_id ON neighbor_postcards_sent(queue_id);
CREATE INDEX IF NOT EXISTS idx_postcards_sent_lob_id ON neighbor_postcards_sent(lob_postcard_id);
CREATE INDEX IF NOT EXISTS idx_postcards_sent_sent_at ON neighbor_postcards_sent(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_postcards_sent_city ON neighbor_postcards_sent(neighbor_city);

CREATE TABLE IF NOT EXISTS postcard_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES neighbor_postcard_queue(id) ON DELETE CASCADE,
  promo_code TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  conversion_source TEXT,
  qr_scan_at TIMESTAMPTZ,
  job_booked BOOLEAN DEFAULT FALSE,
  jobber_job_id TEXT,
  job_booked_at TIMESTAMPTZ,
  job_service_type TEXT,
  job_total NUMERIC(10,2),
  discount_applied NUMERIC(10,2),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_queue_id ON postcard_redemptions(queue_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_promo_code ON postcard_redemptions(promo_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_redeemed_at ON postcard_redemptions(redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_job_booked ON postcard_redemptions(job_booked);

CREATE TABLE IF NOT EXISTS postcard_qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code TEXT NOT NULL,
  queue_id UUID REFERENCES neighbor_postcard_queue(id),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT,
  scan_city TEXT,
  scan_region TEXT,
  session_id TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_page INTEGER,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_promo_code ON postcard_qr_scans(promo_code);
CREATE INDEX IF NOT EXISTS idx_qr_scans_queue_id ON postcard_qr_scans(queue_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON postcard_qr_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_converted ON postcard_qr_scans(converted);

-- Views
CREATE OR REPLACE VIEW neighbor_postcard_metrics AS
SELECT
  (SELECT COUNT(*) FROM neighbor_postcard_queue WHERE status = 'pending') AS pending_count,
  (SELECT COUNT(*) FROM neighbor_postcard_queue WHERE status = 'approved') AS approved_count,
  (SELECT COUNT(*) FROM neighbor_postcard_queue WHERE status = 'sent') AS sent_count,
  (SELECT COUNT(*) FROM neighbor_postcard_queue WHERE status = 'skipped') AS skipped_count,
  (SELECT COUNT(*) FROM neighbor_postcards_sent WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days') AS postcards_sent_30d,
  (SELECT COALESCE(SUM(lob_cost_cents), 0) / 100.0 FROM neighbor_postcards_sent WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days') AS cost_30d_dollars,
  (SELECT COUNT(*) FROM postcard_qr_scans WHERE scanned_at >= CURRENT_DATE - INTERVAL '30 days') AS qr_scans_30d,
  (SELECT COUNT(*) FROM postcard_redemptions WHERE redeemed_at >= CURRENT_DATE - INTERVAL '30 days') AS redemptions_30d,
  (SELECT COUNT(*) FROM postcard_redemptions WHERE job_booked = true AND job_booked_at >= CURRENT_DATE - INTERVAL '30 days') AS jobs_booked_30d,
  (SELECT COALESCE(SUM(job_total), 0) FROM postcard_redemptions WHERE job_booked = true AND job_booked_at >= CURRENT_DATE - INTERVAL '30 days') AS revenue_30d,
  (SELECT
    ROUND(100.0 * COUNT(*) FILTER (WHERE converted = true) / NULLIF(COUNT(*), 0), 2)
   FROM postcard_qr_scans WHERE scanned_at >= CURRENT_DATE - INTERVAL '90 days'
  ) AS qr_conversion_rate_90d;

-- Functions
CREATE OR REPLACE FUNCTION generate_promo_code(p_city TEXT DEFAULT 'MAD')
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_city_prefix TEXT;
  v_random_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_random TEXT := '';
  v_i INTEGER;
BEGIN
  v_city_prefix := UPPER(LEFT(COALESCE(p_city, 'MAD'), 3));
  FOR v_i IN 1..4 LOOP
    v_random := v_random || SUBSTR(v_random_chars, FLOOR(RANDOM() * LENGTH(v_random_chars) + 1)::INTEGER, 1);
  END LOOP;
  v_code := 'NEIGHBOR-' || v_city_prefix || '-' || v_random;
  WHILE EXISTS (SELECT 1 FROM neighbor_postcard_queue WHERE promo_code = v_code) LOOP
    v_random := '';
    FOR v_i IN 1..4 LOOP
      v_random := v_random || SUBSTR(v_random_chars, FLOOR(RANDOM() * LENGTH(v_random_chars) + 1)::INTEGER, 1);
    END LOOP;
    v_code := 'NEIGHBOR-' || v_city_prefix || '-' || v_random;
  END LOOP;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION queue_neighbor_postcard(
  p_job_id TEXT,
  p_job_completed_at TIMESTAMPTZ,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_jobber_customer_id TEXT DEFAULT NULL,
  p_service_type TEXT DEFAULT NULL,
  p_job_total NUMERIC DEFAULT NULL,
  p_job_address TEXT DEFAULT NULL,
  p_job_city TEXT DEFAULT NULL,
  p_job_state TEXT DEFAULT 'WI',
  p_job_zip TEXT DEFAULT NULL,
  p_job_lat NUMERIC DEFAULT NULL,
  p_job_lng NUMERIC DEFAULT NULL,
  p_target_radius_miles NUMERIC DEFAULT 0.30,
  p_promo_discount_percent INTEGER DEFAULT 10
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_promo_code TEXT;
BEGIN
  v_promo_code := generate_promo_code(p_job_city);
  INSERT INTO neighbor_postcard_queue (
    job_id, job_completed_at, customer_name, customer_email, jobber_customer_id,
    service_type, job_total, job_address, job_city, job_state, job_zip,
    job_lat, job_lng, target_radius_miles, promo_code, promo_discount_percent, promo_expires_at
  ) VALUES (
    p_job_id, p_job_completed_at, p_customer_name, p_customer_email, p_jobber_customer_id,
    p_service_type, p_job_total, p_job_address, p_job_city, p_job_state, p_job_zip,
    p_job_lat, p_job_lng, p_target_radius_miles, v_promo_code, p_promo_discount_percent,
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE neighbor_postcard_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbor_postcards_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE postcard_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE postcard_qr_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighbor_postcard_queue_service ON neighbor_postcard_queue FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY neighbor_postcards_sent_service ON neighbor_postcards_sent FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY postcard_redemptions_service ON postcard_redemptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY postcard_qr_scans_service ON postcard_qr_scans FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY neighbor_postcard_queue_read ON neighbor_postcard_queue FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY neighbor_postcards_sent_read ON neighbor_postcards_sent FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY postcard_redemptions_read ON postcard_redemptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY postcard_qr_scans_read ON postcard_qr_scans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY postcard_qr_scans_anon_insert ON postcard_qr_scans FOR INSERT WITH CHECK (auth.role() = 'anon');
