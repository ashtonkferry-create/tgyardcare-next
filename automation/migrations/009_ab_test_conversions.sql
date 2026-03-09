-- Migration 009: Add A/B test conversion tracking table
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)

CREATE TABLE IF NOT EXISTS ab_test_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('cta_click', 'form_submit', 'phone_click')),
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test ON ab_test_conversions (test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_date ON ab_test_conversions (created_at);
