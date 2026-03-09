-- Migration: 017_ab_tests_seed_and_policy.sql
-- Description: Add anon insert policy for ab_tests and seed the data
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Date: 2026-02-12

-- 1. Allow anon to insert (for seeding via API)
CREATE POLICY "Anon can insert ab_tests" ON ab_tests
  FOR INSERT WITH CHECK (true);

-- 2. Seed data
INSERT INTO ab_tests (id, post_path, test_type, status)
VALUES
  ('hero-cta-copy-v1', '/', 'cta', 'active'),
  ('hero-cta-color-v1', '/', 'cta', 'paused')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 3. Seed variants
INSERT INTO ab_test_variants (id, test_id, title, weight)
VALUES
  ('hero-cta-copy-control', 'hero-cta-copy-v1', 'Get Your Free Quote', 50),
  ('hero-cta-copy-urgency', 'hero-cta-copy-v1', 'Get Your Free Estimate Today', 50)
ON CONFLICT (id) DO NOTHING;
