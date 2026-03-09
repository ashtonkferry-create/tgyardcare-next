-- Migration 018: Review Generation System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks review requests, synced reviews from Google, and provides dashboard metrics
-- Supports automated post-job review requests with 90-day cooldown

CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  jobber_customer_id TEXT,
  job_id TEXT,
  job_completed_at TIMESTAMPTZ,
  service_type TEXT,
  total_services INTEGER DEFAULT 1,

  -- Request type: 'post_job' | 'milestone' | 'reengagement' | 'campaign'
  request_type TEXT NOT NULL,
  template_id INTEGER,
  brevo_message_id TEXT,

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Conversion tracking
  review_received BOOLEAN DEFAULT FALSE,
  review_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_requests_email ON review_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_review_requests_sent_at ON review_requests(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_requests_job_id ON review_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_email_sent ON review_requests(customer_email, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_requests_type ON review_requests(request_type);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_review_id TEXT UNIQUE,
  author_name TEXT,
  author_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  published_at TIMESTAMPTZ,

  review_reply TEXT,
  replied_at TIMESTAMPTZ,

  source TEXT DEFAULT 'google',
  matched_request_id UUID REFERENCES review_requests(id),
  attribution_method TEXT,

  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_published_at ON reviews(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_google_id ON reviews(google_review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author_email ON reviews(author_email);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);

-- View: review_metrics_view
CREATE OR REPLACE VIEW review_metrics_view AS
SELECT
  (SELECT COUNT(*) FROM reviews WHERE source = 'google') AS total_google_reviews,
  (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE source = 'google') AS avg_google_rating,
  (SELECT COUNT(*) FROM review_requests WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days') AS requests_last_30_days,
  (SELECT COUNT(*) FROM reviews WHERE published_at >= CURRENT_DATE - INTERVAL '30 days') AS reviews_last_30_days,
  (SELECT
    ROUND(100.0 * COUNT(*) FILTER (WHERE review_received = true) / NULLIF(COUNT(*), 0), 1)
   FROM review_requests
   WHERE sent_at >= CURRENT_DATE - INTERVAL '90 days'
  ) AS conversion_rate_90d,
  (SELECT COUNT(*) FROM reviews WHERE published_at >= date_trunc('month', CURRENT_DATE)) AS reviews_this_month,
  (SELECT COUNT(*) FROM reviews
   WHERE published_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
     AND published_at < date_trunc('month', CURRENT_DATE)) AS reviews_last_month,
  (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews
   WHERE published_at >= CURRENT_DATE - INTERVAL '30 days') AS avg_rating_30d,
  (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews
   WHERE published_at >= CURRENT_DATE - INTERVAL '60 days'
     AND published_at < CURRENT_DATE - INTERVAL '30 days') AS avg_rating_prev_30d,
  (SELECT COUNT(*) FROM reviews WHERE rating = 5 AND source = 'google') AS five_star_count;

-- View: review_request_eligibility
CREATE OR REPLACE VIEW review_request_eligibility AS
SELECT
  customer_email,
  MAX(sent_at) AS last_request_at,
  (MAX(sent_at) < NOW() - INTERVAL '90 days' OR MAX(sent_at) IS NULL) AS eligible_for_request,
  COUNT(*) AS total_requests_sent,
  COUNT(*) FILTER (WHERE review_received = true) AS reviews_received
FROM review_requests
GROUP BY customer_email;

-- Function: can_request_review
CREATE OR REPLACE FUNCTION can_request_review(
  p_customer_email TEXT,
  p_cooldown_days INTEGER DEFAULT 90
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM review_requests
    WHERE customer_email = LOWER(p_customer_email)
    AND sent_at > NOW() - (p_cooldown_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

-- Function: match_review_to_request
CREATE OR REPLACE FUNCTION match_review_to_request(
  p_author_name TEXT,
  p_author_email TEXT DEFAULT NULL,
  p_published_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE(request_id UUID, method TEXT) AS $$
DECLARE
  v_request_id UUID;
BEGIN
  IF p_author_email IS NOT NULL THEN
    SELECT id INTO v_request_id
    FROM review_requests
    WHERE customer_email = LOWER(p_author_email)
      AND sent_at < p_published_at
      AND sent_at > p_published_at - INTERVAL '30 days'
      AND review_received = false
    ORDER BY sent_at DESC LIMIT 1;

    IF v_request_id IS NOT NULL THEN
      UPDATE review_requests SET review_received = true, review_id = v_request_id WHERE id = v_request_id;
      RETURN QUERY SELECT v_request_id, 'email_match'::TEXT;
      RETURN;
    END IF;
  END IF;

  SELECT id INTO v_request_id
  FROM review_requests
  WHERE LOWER(customer_name) = LOWER(p_author_name)
    AND sent_at < p_published_at
    AND sent_at > p_published_at - INTERVAL '14 days'
    AND review_received = false
  ORDER BY sent_at DESC LIMIT 1;

  IF v_request_id IS NOT NULL THEN
    UPDATE review_requests SET review_received = true, review_id = v_request_id WHERE id = v_request_id;
    RETURN QUERY SELECT v_request_id, 'name_match'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT NULL::UUID, 'unmatched'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function: log_review_request
CREATE OR REPLACE FUNCTION log_review_request(
  p_customer_email TEXT,
  p_customer_name TEXT DEFAULT NULL,
  p_jobber_customer_id TEXT DEFAULT NULL,
  p_job_id TEXT DEFAULT NULL,
  p_job_completed_at TIMESTAMPTZ DEFAULT NULL,
  p_service_type TEXT DEFAULT NULL,
  p_total_services INTEGER DEFAULT 1,
  p_request_type TEXT DEFAULT 'post_job',
  p_template_id INTEGER DEFAULT NULL,
  p_brevo_message_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO review_requests (
    customer_email, customer_name, jobber_customer_id, job_id, job_completed_at,
    service_type, total_services, request_type, template_id, brevo_message_id
  ) VALUES (
    LOWER(p_customer_email), p_customer_name, p_jobber_customer_id, p_job_id, p_job_completed_at,
    p_service_type, p_total_services, p_request_type, p_template_id, p_brevo_message_id
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Seed: Initial review data (existing 127 reviews at 5.0 rating for TotalGuard)
INSERT INTO reviews (google_review_id, author_name, rating, published_at, source, attribution_method)
SELECT
  'seed_' || gs AS google_review_id,
  'Customer ' || gs AS author_name,
  5 AS rating,
  CURRENT_DATE - (gs * 3 || ' days')::INTERVAL AS published_at,
  'google' AS source,
  'seed_data' AS attribution_method
FROM generate_series(1, 127) AS gs
ON CONFLICT (google_review_id) DO NOTHING;

-- RLS Policies
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY review_requests_service_policy ON review_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY reviews_service_policy ON reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY review_requests_read_policy ON review_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY reviews_read_policy ON reviews FOR SELECT USING (auth.role() = 'authenticated');
