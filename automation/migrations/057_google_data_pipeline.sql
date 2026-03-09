-- Migration 057: Google Search Console & GA4 Data Pipeline
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Creates tables to store automated daily pulls from Google APIs

-- =============================================================================
-- GOOGLE SEARCH CONSOLE TABLES
-- =============================================================================

-- Daily query-level performance data from GSC
CREATE TABLE IF NOT EXISTS gsc_search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    page TEXT,
    country TEXT DEFAULT 'USA',
    device TEXT CHECK (device IN ('DESKTOP', 'MOBILE', 'TABLET')),
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    position DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gsc_queries_unique
    ON gsc_search_queries (query, COALESCE(page, ''), date, COALESCE(device, ''));
CREATE INDEX IF NOT EXISTS idx_gsc_queries_date ON gsc_search_queries (date);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_query ON gsc_search_queries (query);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_page ON gsc_search_queries (page);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_clicks ON gsc_search_queries (clicks DESC);

-- Page-level aggregated GSC performance
CREATE TABLE IF NOT EXISTS gsc_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    avg_position DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gsc_pages_unique ON gsc_pages (page, date);
CREATE INDEX IF NOT EXISTS idx_gsc_pages_date ON gsc_pages (date);
CREATE INDEX IF NOT EXISTS idx_gsc_pages_page ON gsc_pages (page);

-- =============================================================================
-- GOOGLE ANALYTICS 4 TABLES
-- =============================================================================

-- Daily aggregated GA4 metrics
CREATE TABLE IF NOT EXISTS ga4_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    sessions INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    avg_session_duration DECIMAL(10,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ga4_daily_date ON ga4_daily_metrics (date);

-- Per-channel daily breakdown
CREATE TABLE IF NOT EXISTS ga4_traffic_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    channel_group TEXT NOT NULL,
    source TEXT,
    medium TEXT,
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    avg_session_duration DECIMAL(10,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ga4_sources_unique
    ON ga4_traffic_sources (date, channel_group);
CREATE INDEX IF NOT EXISTS idx_ga4_sources_date ON ga4_traffic_sources (date);
CREATE INDEX IF NOT EXISTS idx_ga4_sources_channel ON ga4_traffic_sources (channel_group);

-- Daily top page performance
CREATE TABLE IF NOT EXISTS ga4_top_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    page_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_on_page DECIMAL(10,2) DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ga4_pages_unique ON ga4_top_pages (date, page_path);
CREATE INDEX IF NOT EXISTS idx_ga4_pages_date ON ga4_top_pages (date);
CREATE INDEX IF NOT EXISTS idx_ga4_pages_path ON ga4_top_pages (page_path);

-- Weekly demographic snapshots
CREATE TABLE IF NOT EXISTS ga4_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    dimension_type TEXT NOT NULL CHECK (dimension_type IN ('age', 'gender', 'city', 'region')),
    dimension_value TEXT NOT NULL,
    users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ga4_demo_unique
    ON ga4_demographics (week_start, dimension_type, dimension_value);
CREATE INDEX IF NOT EXISTS idx_ga4_demo_week ON ga4_demographics (week_start);

-- SEO intelligence report snapshots
CREATE TABLE IF NOT EXISTS seo_weekly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}',
    top_gaining_keywords JSONB DEFAULT '[]',
    top_losing_keywords JSONB DEFAULT '[]',
    new_keywords JSONB DEFAULT '[]',
    declining_pages JSONB DEFAULT '[]',
    total_clicks INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seo_reports_week ON seo_weekly_reports (week_start);

-- =============================================================================
-- ANALYTICS VIEWS
-- =============================================================================

-- Keyword trends: week-over-week comparison for top queries
CREATE OR REPLACE VIEW gsc_keyword_trends AS
WITH weekly AS (
    SELECT
        query,
        date_trunc('week', date)::date AS week_start,
        SUM(clicks) AS clicks,
        SUM(impressions) AS impressions,
        CASE WHEN SUM(impressions) > 0
            THEN SUM(clicks)::decimal / SUM(impressions)
            ELSE 0 END AS ctr,
        AVG(position) AS avg_position
    FROM gsc_search_queries
    GROUP BY query, date_trunc('week', date)
),
ranked AS (
    SELECT
        w.*,
        LAG(clicks) OVER (PARTITION BY query ORDER BY week_start) AS prev_clicks,
        LAG(impressions) OVER (PARTITION BY query ORDER BY week_start) AS prev_impressions,
        LAG(avg_position) OVER (PARTITION BY query ORDER BY week_start) AS prev_position
    FROM weekly w
)
SELECT
    query,
    week_start,
    clicks,
    impressions,
    ROUND(ctr::numeric, 4) AS ctr,
    ROUND(avg_position::numeric, 2) AS avg_position,
    clicks - COALESCE(prev_clicks, 0) AS click_change,
    impressions - COALESCE(prev_impressions, 0) AS impression_change,
    ROUND((avg_position - COALESCE(prev_position, avg_position))::numeric, 2) AS position_change
FROM ranked
ORDER BY week_start DESC, clicks DESC;

-- GA4 weekly summary: aggregated weekly metrics
CREATE OR REPLACE VIEW ga4_weekly_summary AS
SELECT
    date_trunc('week', date)::date AS week_start,
    SUM(sessions) AS total_sessions,
    SUM(total_users) AS total_users,
    SUM(new_users) AS total_new_users,
    SUM(page_views) AS total_page_views,
    ROUND(AVG(bounce_rate)::numeric, 4) AS avg_bounce_rate,
    ROUND(AVG(avg_session_duration)::numeric, 2) AS avg_session_duration,
    SUM(conversions) AS total_conversions
FROM ga4_daily_metrics
GROUP BY date_trunc('week', date)
ORDER BY week_start DESC;

-- Combined SEO page performance: GSC + GA4 data per page (TotalGuard domain)
CREATE OR REPLACE VIEW seo_page_performance AS
SELECT
    gp.page,
    date_trunc('week', gp.date)::date AS week_start,
    SUM(gp.clicks) AS gsc_clicks,
    SUM(gp.impressions) AS gsc_impressions,
    ROUND(AVG(gp.avg_position)::numeric, 2) AS avg_gsc_position,
    COALESCE(SUM(ga.page_views), 0) AS ga_page_views,
    COALESCE(SUM(ga.conversions), 0) AS ga_conversions,
    COALESCE(ROUND(AVG(ga.bounce_rate)::numeric, 4), 0) AS ga_bounce_rate
FROM gsc_pages gp
LEFT JOIN ga4_top_pages ga
    ON REPLACE(gp.page, 'https://tgyardcare.com', '') = ga.page_path
    AND gp.date = ga.date
GROUP BY gp.page, date_trunc('week', gp.date)
ORDER BY week_start DESC, gsc_clicks DESC;

-- Traffic source trends
CREATE OR REPLACE VIEW ga4_source_trends AS
WITH weekly AS (
    SELECT
        channel_group,
        date_trunc('week', date)::date AS week_start,
        SUM(sessions) AS sessions,
        SUM(users) AS users,
        SUM(conversions) AS conversions
    FROM ga4_traffic_sources
    GROUP BY channel_group, date_trunc('week', date)
),
ranked AS (
    SELECT
        w.*,
        LAG(sessions) OVER (PARTITION BY channel_group ORDER BY week_start) AS prev_sessions,
        LAG(conversions) OVER (PARTITION BY channel_group ORDER BY week_start) AS prev_conversions
    FROM weekly w
)
SELECT
    channel_group,
    week_start,
    sessions,
    users,
    conversions,
    sessions - COALESCE(prev_sessions, 0) AS session_change,
    conversions - COALESCE(prev_conversions, 0) AS conversion_change,
    CASE WHEN COALESCE(prev_sessions, 0) > 0
        THEN ROUND(((sessions - prev_sessions)::decimal / prev_sessions * 100)::numeric, 1)
        ELSE 0 END AS session_change_pct
FROM ranked
ORDER BY week_start DESC, sessions DESC;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE gsc_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_top_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_weekly_reports ENABLE ROW LEVEL SECURITY;

-- Service role: full access
CREATE POLICY "service_role_gsc_queries" ON gsc_search_queries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_gsc_pages" ON gsc_pages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ga4_daily" ON ga4_daily_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ga4_sources" ON ga4_traffic_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ga4_pages" ON ga4_top_pages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ga4_demo" ON ga4_demographics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_seo_reports" ON seo_weekly_reports FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon: read-only for dashboard display
CREATE POLICY "anon_read_ga4_daily" ON ga4_daily_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_ga4_sources" ON ga4_traffic_sources FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_ga4_pages" ON ga4_top_pages FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_seo_reports" ON seo_weekly_reports FOR SELECT TO anon USING (true);
