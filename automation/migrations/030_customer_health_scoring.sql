-- Migration 030: Customer Health Scoring
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks customer lifetime value, churn risk, and engagement health

CREATE TABLE IF NOT EXISTS customer_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  jobber_customer_id TEXT UNIQUE,
  phone TEXT,

  -- Health scoring (0-100)
  health_score INTEGER DEFAULT 50,
  health_tier TEXT DEFAULT 'at_risk',  -- 'champion' | 'loyal' | 'healthy' | 'at_risk' | 'churned'
  churn_risk_pct INTEGER DEFAULT 50,   -- 0-100 probability of churning

  -- Service history
  first_service_date DATE,
  last_service_date DATE,
  total_jobs INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  avg_job_value NUMERIC(10,2) DEFAULT 0,
  services_used TEXT[],

  -- Engagement
  last_email_open_at TIMESTAMPTZ,
  last_email_click_at TIMESTAMPTZ,
  email_engagement_score INTEGER DEFAULT 0,
  review_left BOOLEAN DEFAULT FALSE,
  referrals_made INTEGER DEFAULT 0,

  -- Recency / Frequency / Monetary (RFM)
  rfm_recency_score INTEGER,      -- 1-5
  rfm_frequency_score INTEGER,    -- 1-5
  rfm_monetary_score INTEGER,     -- 1-5
  rfm_total_score INTEGER,        -- sum of above

  -- Churn signals
  days_since_last_service INTEGER,
  missed_seasonal_service BOOLEAN DEFAULT FALSE,
  payment_issues BOOLEAN DEFAULT FALSE,

  -- Winback tracking
  winback_eligible BOOLEAN DEFAULT FALSE,
  winback_campaign_sent BOOLEAN DEFAULT FALSE,
  winback_sent_at TIMESTAMPTZ,
  winback_converted BOOLEAN DEFAULT FALSE,

  last_scored_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_health_email ON customer_health(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_health_jobber ON customer_health(jobber_customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_health_score ON customer_health(health_score);
CREATE INDEX IF NOT EXISTS idx_customer_health_tier ON customer_health(health_tier);
CREATE INDEX IF NOT EXISTS idx_customer_health_churn ON customer_health(churn_risk_pct DESC);

-- View: customer_health_dashboard
CREATE OR REPLACE VIEW customer_health_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE health_tier = 'champion') AS champions,
  COUNT(*) FILTER (WHERE health_tier = 'loyal') AS loyal,
  COUNT(*) FILTER (WHERE health_tier = 'healthy') AS healthy,
  COUNT(*) FILTER (WHERE health_tier = 'at_risk') AS at_risk,
  COUNT(*) FILTER (WHERE health_tier = 'churned') AS churned,
  ROUND(AVG(health_score), 1) AS avg_health_score,
  COUNT(*) FILTER (WHERE winback_eligible = true AND winback_campaign_sent = false) AS winback_eligible_unsent,
  COUNT(*) FILTER (WHERE churn_risk_pct >= 70) AS high_churn_risk,
  COALESCE(SUM(total_revenue) FILTER (WHERE health_tier = 'at_risk'), 0) AS at_risk_revenue
FROM customer_health;

-- View: at_risk_customers
CREATE OR REPLACE VIEW at_risk_customers AS
SELECT
  customer_email, customer_name, jobber_customer_id, health_score, churn_risk_pct,
  days_since_last_service, last_service_date, total_revenue, services_used,
  missed_seasonal_service, payment_issues
FROM customer_health
WHERE health_tier IN ('at_risk', 'churned')
  AND winback_converted = false
ORDER BY churn_risk_pct DESC, total_revenue DESC;

-- Function: score_customer_health
CREATE OR REPLACE FUNCTION score_customer_health(p_customer_email TEXT) RETURNS INTEGER AS $$
DECLARE
  v_customer RECORD;
  v_score INTEGER := 50;
  v_days_since INTEGER;
BEGIN
  SELECT * INTO v_customer FROM customer_health WHERE customer_email = LOWER(p_customer_email);
  IF v_customer IS NULL THEN RETURN 50; END IF;

  v_days_since := COALESCE(v_customer.days_since_last_service, 999);

  -- Recency scoring
  IF v_days_since <= 30 THEN v_score := v_score + 20;
  ELSIF v_days_since <= 60 THEN v_score := v_score + 10;
  ELSIF v_days_since <= 90 THEN v_score := v_score + 0;
  ELSIF v_days_since <= 180 THEN v_score := v_score - 15;
  ELSE v_score := v_score - 30;
  END IF;

  -- Frequency scoring
  IF v_customer.total_jobs >= 10 THEN v_score := v_score + 15;
  ELSIF v_customer.total_jobs >= 5 THEN v_score := v_score + 10;
  ELSIF v_customer.total_jobs >= 2 THEN v_score := v_score + 5;
  END IF;

  -- Monetary scoring
  IF v_customer.total_revenue >= 1000 THEN v_score := v_score + 10;
  ELSIF v_customer.total_revenue >= 500 THEN v_score := v_score + 5;
  END IF;

  -- Engagement bonuses
  IF v_customer.review_left THEN v_score := v_score + 5; END IF;
  IF v_customer.referrals_made > 0 THEN v_score := v_score + 5; END IF;

  -- Risk penalties
  IF v_customer.payment_issues THEN v_score := v_score - 10; END IF;

  v_score := GREATEST(0, LEAST(100, v_score));

  UPDATE customer_health SET
    health_score = v_score,
    health_tier = CASE
      WHEN v_score >= 80 THEN 'champion'
      WHEN v_score >= 65 THEN 'loyal'
      WHEN v_score >= 50 THEN 'healthy'
      WHEN v_score >= 30 THEN 'at_risk'
      ELSE 'churned'
    END,
    churn_risk_pct = GREATEST(0, 100 - v_score),
    last_scored_at = NOW(),
    updated_at = NOW()
  WHERE customer_email = LOWER(p_customer_email);

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE customer_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_health_service ON customer_health FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY customer_health_read ON customer_health FOR SELECT USING (auth.role() = 'authenticated');
