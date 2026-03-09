-- Migration: Competitive Intelligence, Quote Follow-Up AI Tracking, Gift Certificate Enhancements
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Adds tables for tracking competitor ratings/reviews, AI-powered quote follow-up
--              logging, and enhances the gift certificate system with fulfillment/redemption columns.

-- ============================================================================
-- 1. EXTEND EXISTING COMPETITORS TABLE (from migration 015_backlink_monitoring)
-- ============================================================================
-- Add review/rating tracking columns for competitive intelligence
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS google_place_id text;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS current_rating numeric(2,1);
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS rating_change numeric(3,2) DEFAULT 0;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS review_velocity integer DEFAULT 0;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS price_range text;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;

-- Seed competitors with domain (required NOT NULL from migration 015)
-- TotalGuard Yard Care (Madison, WI) lawn care competitors
INSERT INTO competitors (name, domain, services, is_active) VALUES
  ('Lawn Doctor of Madison', 'lawndoctor.com', ARRAY['lawn_mowing', 'fertilization', 'aeration'], true),
  ('Spring Green Lawn Care', 'spring-green.com', ARRAY['lawn_mowing', 'fertilization', 'herbicide_services'], true),
  ('TruGreen Madison', 'trugreen.com', ARRAY['fertilization', 'aeration', 'herbicide_services', 'lawn_mowing'], true),
  ('Weed Man Madison', 'weedmanusa.com', ARRAY['herbicide_services', 'fertilization', 'aeration'], true),
  ('Heartland Lawn & Landscape', 'heartlandlawn.com', ARRAY['lawn_mowing', 'mulching', 'spring_cleanup', 'fall_cleanup'], true)
ON CONFLICT (domain) DO NOTHING;

-- ============================================================================
-- 2. COMPETITOR SNAPSHOTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE,
  rating numeric(2,1),
  review_count integer,
  new_reviews_since_last integer DEFAULT 0,
  notable_changes text,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. QUOTE FOLLOW-UP LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_followup_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  customer_name text,
  customer_email text,
  services text[],
  days_since_quote integer,
  followup_bracket text CHECK (followup_bracket IN ('casual', 'social_proof', 'incentive', 'breakup')),
  ai_model text DEFAULT 'claude-haiku-4-5',
  generated_content text,
  subject_line text,
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  converted boolean DEFAULT false,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. GIFT CERTIFICATES TABLE ENHANCEMENTS
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_certificates') THEN
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS fulfilled boolean DEFAULT false;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS certificate_code text;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS expires_at timestamptz;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS redeemed boolean DEFAULT false;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS redeemed_at timestamptz;
    ALTER TABLE gift_certificates ADD COLUMN IF NOT EXISTS redeemed_by text;
  END IF;
END $$;

-- ============================================================================
-- 5. VIEWS
-- ============================================================================

-- Competitive dashboard: compare our metrics against tracked competitors
-- TotalGuard stats: 127 reviews at 4.9 rating
CREATE OR REPLACE VIEW competitive_dashboard AS
WITH our_stats AS (
  SELECT
    COALESCE(avg_google_rating, 4.9) as our_rating,
    COALESCE(total_google_reviews, 127) as our_reviews
  FROM review_metrics_view
  LIMIT 1
)
SELECT
  os.our_rating,
  os.our_reviews,
  COUNT(c.*) as tracked_competitors,
  ROUND(AVG(c.current_rating)::numeric, 2) as avg_competitor_rating,
  ROUND(AVG(c.total_reviews)::numeric, 0) as avg_competitor_reviews,
  MAX(c.current_rating) as highest_competitor_rating,
  (SELECT c2.name FROM competitors c2 WHERE c2.is_active ORDER BY c2.total_reviews DESC LIMIT 1) as most_reviewed_competitor,
  os.our_rating - ROUND(AVG(c.current_rating)::numeric, 2) as rating_advantage,
  os.our_reviews - ROUND(AVG(c.total_reviews)::numeric, 0)::integer as review_advantage
FROM competitors c, our_stats os
WHERE c.is_active = true
GROUP BY os.our_rating, os.our_reviews;

-- Quote follow-up dashboard: track AI follow-up performance
CREATE OR REPLACE VIEW quote_followup_dashboard AS
SELECT
  COUNT(*) as total_followups_sent,
  COUNT(*) FILTER (WHERE converted) as total_converted,
  ROUND(COUNT(*) FILTER (WHERE converted)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
  COUNT(*) FILTER (WHERE opened) as total_opened,
  ROUND(COUNT(*) FILTER (WHERE opened)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate,
  COUNT(*) FILTER (WHERE clicked) as total_clicked,
  COUNT(*) FILTER (WHERE sent_at > now() - interval '7 days') as sent_last_7d,
  COUNT(*) FILTER (WHERE converted AND converted_at > now() - interval '30 days') as converted_last_30d,
  jsonb_build_object(
    'casual', COUNT(*) FILTER (WHERE followup_bracket = 'casual'),
    'social_proof', COUNT(*) FILTER (WHERE followup_bracket = 'social_proof'),
    'incentive', COUNT(*) FILTER (WHERE followup_bracket = 'incentive'),
    'breakup', COUNT(*) FILTER (WHERE followup_bracket = 'breakup')
  ) as by_bracket
FROM quote_followup_log;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_followup_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON competitors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON competitor_snapshots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON quote_followup_log FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_competitor ON competitor_snapshots(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_date ON competitor_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_quote_followup_lead ON quote_followup_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_quote_followup_sent ON quote_followup_log(sent_at);
