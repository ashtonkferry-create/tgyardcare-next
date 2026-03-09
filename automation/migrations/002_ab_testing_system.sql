-- Migration: 002_ab_testing_system.sql
-- Description: Create A/B testing tables for CTA and content optimization
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Date: 2026-02-04

-- ============================================
-- 1. ab_tests table handled in 016_fix_ab_tests_id_type.sql
-- ============================================

-- ============================================
-- 2. Create ab_test_variants table
-- ============================================

CREATE TABLE IF NOT EXISTS ab_test_variants (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  title TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Create ab_test_impressions table
-- ============================================

CREATE TABLE IF NOT EXISTS ab_test_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test_id ON ab_test_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_impressions_test ON ab_test_impressions(test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_impressions_date ON ab_test_impressions(created_at);

-- ============================================
-- 5. Enable RLS
-- ============================================

ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_impressions ENABLE ROW LEVEL SECURITY;

-- Anon can read variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ab_test_variants' AND policyname = 'Anon can read ab_test_variants'
  ) THEN
    CREATE POLICY "Anon can read ab_test_variants" ON ab_test_variants FOR SELECT USING (true);
  END IF;
END $$;

-- Anon can insert impressions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ab_test_impressions' AND policyname = 'Anon can insert impressions'
  ) THEN
    CREATE POLICY "Anon can insert impressions" ON ab_test_impressions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Service role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ab_test_variants' AND policyname = 'Service role full access on ab_test_variants'
  ) THEN
    CREATE POLICY "Service role full access on ab_test_variants" ON ab_test_variants FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ab_test_impressions' AND policyname = 'Service role full access on ab_test_impressions'
  ) THEN
    CREATE POLICY "Service role full access on ab_test_impressions" ON ab_test_impressions FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE ab_test_variants IS 'Variants for each A/B test with weighting';
COMMENT ON TABLE ab_test_impressions IS 'Track which variant each visitor sees';
