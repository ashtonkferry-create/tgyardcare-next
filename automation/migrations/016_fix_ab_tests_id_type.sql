-- Migration: 016_fix_ab_tests_id_type.sql
-- Description: Change ab_tests.id from UUID to TEXT to support readable test IDs
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Date: 2026-02-12

-- Drop the table and recreate with TEXT id (table is empty)
DROP TABLE IF EXISTS ab_tests CASCADE;

CREATE TABLE ab_tests (
  id TEXT PRIMARY KEY,
  post_path TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'cta',
  status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anon can read active ab_tests" ON ab_tests
  FOR SELECT USING (status = 'active');

CREATE POLICY "Service role full access on ab_tests" ON ab_tests
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_path ON ab_tests(post_path);

COMMENT ON TABLE ab_tests IS 'A/B test definitions with page targeting for TotalGuard Yard Care';
