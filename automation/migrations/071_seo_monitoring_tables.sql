-- Migration 071: SEO Monitoring Tables for Phase 3
-- Creates index_coverage_log and seo_content_gaps tables
-- These support index coverage monitoring (TG-100) and content gap detection (TG-99)
-- Applied: 2026-03-16

-- =============================================================================
-- 1. index_coverage_log — Tracks Google indexing status per page per day
-- =============================================================================
CREATE TABLE IF NOT EXISTS index_coverage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_url TEXT NOT NULL,
    check_date DATE NOT NULL,
    verdict TEXT,
    coverage_state TEXT,
    indexing_state TEXT,
    last_crawl_time TIMESTAMPTZ,
    page_fetch_state TEXT,
    robots_txt_state TEXT,
    google_canonical TEXT,
    previous_verdict TEXT,
    alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_index_coverage_unique
    ON index_coverage_log (page_url, check_date);
CREATE INDEX IF NOT EXISTS idx_index_coverage_page
    ON index_coverage_log (page_url);
CREATE INDEX IF NOT EXISTS idx_index_coverage_verdict
    ON index_coverage_log (verdict);

-- =============================================================================
-- 2. seo_content_gaps — Queries with impressions but no dedicated page
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_content_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2),
    priority_score DECIMAL(10,2),
    has_dedicated_page BOOLEAN DEFAULT FALSE,
    suggested_page_type TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'planned', 'created', 'dismissed')),
    detected_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_gaps_query
    ON seo_content_gaps (query, detected_at);
CREATE INDEX IF NOT EXISTS idx_content_gaps_priority
    ON seo_content_gaps (priority_score DESC);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE index_coverage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_gaps ENABLE ROW LEVEL SECURITY;

-- Service role: full access (same pattern as migration 057)
CREATE POLICY "service_role_index_coverage" ON index_coverage_log
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_content_gaps" ON seo_content_gaps
    FOR ALL TO service_role USING (true) WITH CHECK (true);
