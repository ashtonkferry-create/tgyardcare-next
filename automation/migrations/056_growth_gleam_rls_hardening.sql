-- Migration 056: Security Hardening for TotalGuard SEO tables
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Adds RLS to tables created by SEO system migrations
-- that exist in the shared database but were never given RLS

-- ============================================================
-- Tables from SEO system migrations missing RLS
-- ============================================================
ALTER TABLE seo_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON seo_improvements
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON seo_reports
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON keyword_rankings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON lead_events
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read SEO data (dashboard)
CREATE POLICY "Authenticated read seo_improvements" ON seo_improvements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read seo_reports" ON seo_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read keyword_rankings" ON keyword_rankings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read lead_events" ON lead_events
  FOR SELECT USING (auth.role() = 'authenticated');
