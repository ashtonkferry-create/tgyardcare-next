-- Migration 023: Attribution & Self-Improvement System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)

-- ============================================================================
-- PART 1: Lead Attribution Columns
-- ============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS job_booked_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS job_jobber_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS attributed_campaign_id INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS attributed_email_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_engagement_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_job_booked ON leads(job_booked_at) WHERE job_booked_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_engagement_score ON leads(email_engagement_score);

-- ============================================================================
-- PART 2: A/B Test Performance View
-- ============================================================================

CREATE OR REPLACE VIEW ab_test_performance AS
SELECT
  t.id as test_id,
  t.id as test_name,
  t.status as test_status,
  v.id as variant_id,
  v.title as variant_name,
  v.weight as traffic_percentage,
  COUNT(DISTINCT i.visitor_id) as impressions,
  COUNT(DISTINCT c.id) as conversions,
  CASE
    WHEN COUNT(DISTINCT i.visitor_id) > 0
    THEN ROUND(100.0 * COUNT(DISTINCT c.id) / COUNT(DISTINCT i.visitor_id), 2)
    ELSE 0
  END as conversion_rate,
  t.created_at as test_started_at,
  NOW() - t.created_at as test_duration
FROM ab_tests t
JOIN ab_test_variants v ON v.test_id = t.id
LEFT JOIN ab_test_impressions i ON i.variant_id = v.id
LEFT JOIN ab_test_conversions c ON c.variant_id = v.id
GROUP BY t.id, t.status, v.id, v.title, v.weight, t.created_at;

-- ============================================================================
-- PART 3: Lead Score Accuracy View
-- ============================================================================

CREATE OR REPLACE VIEW lead_score_accuracy AS
SELECT
  CASE
    WHEN lead_score >= 80 THEN 'hot'
    WHEN lead_score >= 50 THEN 'warm'
    WHEN lead_score >= 30 THEN 'standard'
    ELSE 'cold'
  END as score_tier,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE job_booked_at IS NOT NULL) as booked,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(100.0 * COUNT(*) FILTER (WHERE job_booked_at IS NOT NULL) / COUNT(*), 2)
    ELSE 0
  END as booking_rate,
  AVG(lead_score) as avg_score
FROM leads
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY 1;

-- ============================================================================
-- PART 4: Email Performance Enhancements
-- ============================================================================

ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS segment_name TEXT;
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_email_sends_segment ON email_sends(segment_name) WHERE segment_name IS NOT NULL;

-- Email performance view
CREATE OR REPLACE VIEW email_performance AS
SELECT
  workflow_name,
  email_type,
  sequence_step,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as total_opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicked,
  COUNT(*) FILTER (WHERE converted_at IS NOT NULL) as total_converted,
  ROUND(100.0 * COUNT(*) FILTER (WHERE opened_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as open_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as click_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE converted_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as conversion_rate
FROM email_sends
WHERE sent_at > NOW() - INTERVAL '90 days'
GROUP BY workflow_name, email_type, sequence_step
ORDER BY workflow_name, sequence_step;

-- ============================================================================
-- PART 5: Source Attribution View
-- ============================================================================

CREATE OR REPLACE VIEW source_attribution AS
SELECT
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE job_booked_at IS NOT NULL) as total_booked,
  ROUND(100.0 * COUNT(*) FILTER (WHERE job_booked_at IS NOT NULL) / NULLIF(COUNT(*), 0), 1) as booking_rate,
  AVG(lead_score) as avg_lead_score,
  ROUND(AVG(EXTRACT(EPOCH FROM (auto_response_sent_at - created_at))) / 60, 1) as avg_response_min
FROM leads
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY source
ORDER BY total_leads DESC;
