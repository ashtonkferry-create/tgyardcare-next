-- Migration 037: Location SEO Pages
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Location-specific SEO pages for every [service] [city] combo in Madison WI metro
-- Enables: Local organic search traffic via auto-generated, AI-written service+city landing pages

-- ============================================================================
-- 1. SEO TARGET CITIES TABLE
-- Cities in the Madison WI metro area to generate location pages for
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_target_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL UNIQUE,
    state TEXT DEFAULT 'WI',
    county TEXT,
    population INTEGER,
    distance_from_madison_miles NUMERIC,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. SEO LOCATION PAGES TABLE
-- Tracks generated location SEO pages for each city+service combination
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_location_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN (
        'lawn_mowing', 'fertilization', 'aeration', 'herbicide_services',
        'weeding', 'mulching', 'garden_bed_care', 'bush_trimming_pruning',
        'hardscaping', 'spring_cleanup', 'fall_cleanup', 'leaf_removal',
        'gutter_cleaning', 'gutter_guard_installation', 'snow_removal'
    )),
    slug TEXT UNIQUE NOT NULL,
    page_title TEXT,
    meta_description TEXT,
    h1_text TEXT,
    content TEXT,
    target_keyword TEXT,
    secondary_keywords TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),

    -- AI generation tracking
    ai_generated BOOLEAN DEFAULT TRUE,
    ai_model TEXT,
    ai_generated_at TIMESTAMPTZ,

    -- Publishing
    published_at TIMESTAMPTZ,

    -- Performance metrics
    page_views INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(city, service_type)
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_seo_location_pages_city ON seo_location_pages(city);
CREATE INDEX IF NOT EXISTS idx_seo_location_pages_service_type ON seo_location_pages(service_type);
CREATE INDEX IF NOT EXISTS idx_seo_location_pages_slug ON seo_location_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_location_pages_status ON seo_location_pages(status);
CREATE INDEX IF NOT EXISTS idx_seo_location_pages_published ON seo_location_pages(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seo_location_pages_city_service ON seo_location_pages(city, service_type);

CREATE INDEX IF NOT EXISTS idx_seo_target_cities_priority ON seo_target_cities(priority);
CREATE INDEX IF NOT EXISTS idx_seo_target_cities_active ON seo_target_cities(active) WHERE active = TRUE;

-- ============================================================================
-- 4. TRIGGER: auto-update updated_at on seo_location_pages
-- ============================================================================
CREATE OR REPLACE FUNCTION update_seo_location_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seo_location_pages_updated_at ON seo_location_pages;
CREATE TRIGGER trg_seo_location_pages_updated_at
    BEFORE UPDATE ON seo_location_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_location_pages_updated_at();

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================
ALTER TABLE seo_location_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_target_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on seo_location_pages" ON seo_location_pages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on seo_target_cities" ON seo_target_cities
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read seo_location_pages" ON seo_location_pages
    FOR SELECT USING (true);

CREATE POLICY "Anon read seo_target_cities" ON seo_target_cities
    FOR SELECT USING (true);

-- ============================================================================
-- 6. SEED DATA: Madison WI Metro Target Cities (TotalGuard service area)
-- ============================================================================
INSERT INTO seo_target_cities (city, state, county, population, distance_from_madison_miles, priority) VALUES
    ('Madison',        'WI', 'Dane', 270000, 0,  'high'),
    ('Middleton',      'WI', 'Dane', 22000,  8,  'high'),
    ('Sun Prairie',    'WI', 'Dane', 36000,  13, 'high'),
    ('Fitchburg',      'WI', 'Dane', 33000,  6,  'high'),
    ('Verona',         'WI', 'Dane', 14000,  10, 'high'),
    ('Monona',         'WI', 'Dane', 8000,   4,  'high'),
    ('Waunakee',       'WI', 'Dane', 16000,  15, 'normal'),
    ('DeForest',       'WI', 'Dane', 12000,  16, 'normal'),
    ('Stoughton',      'WI', 'Dane', 13000,  20, 'normal'),
    ('Oregon',         'WI', 'Dane', 11000,  12, 'normal'),
    ('McFarland',      'WI', 'Dane', 9000,   8,  'normal'),
    ('Cottage Grove',  'WI', 'Dane', 7000,   14, 'normal'),
    ('Cross Plains',   'WI', 'Dane', 4000,   18, 'low'),
    ('Windsor',        'WI', 'Dane', 8000,   12, 'low'),
    ('Mount Horeb',    'WI', 'Dane', 8000,   25, 'low')
ON CONFLICT (city) DO NOTHING;

-- ============================================================================
-- 7. RPC FUNCTION: get_missing_seo_pages
-- Returns city+service combos that don't have pages yet (for n8n workflow)
-- Prioritizes high-priority cities first, then normal, then low
-- ============================================================================
CREATE OR REPLACE FUNCTION get_missing_seo_pages()
RETURNS TABLE (
    city TEXT,
    service_type TEXT,
    state TEXT,
    county TEXT,
    population INTEGER,
    priority TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.city,
        s.service_type,
        c.state,
        c.county,
        c.population,
        c.priority
    FROM seo_target_cities c
    CROSS JOIN (
        VALUES
            ('lawn_mowing'::TEXT),
            ('fertilization'::TEXT),
            ('aeration'::TEXT),
            ('herbicide_services'::TEXT),
            ('weeding'::TEXT),
            ('mulching'::TEXT),
            ('garden_bed_care'::TEXT),
            ('bush_trimming_pruning'::TEXT),
            ('hardscaping'::TEXT),
            ('spring_cleanup'::TEXT),
            ('fall_cleanup'::TEXT),
            ('leaf_removal'::TEXT),
            ('gutter_cleaning'::TEXT),
            ('gutter_guard_installation'::TEXT),
            ('snow_removal'::TEXT)
    ) AS s(service_type)
    LEFT JOIN seo_location_pages p
        ON p.city = c.city AND p.service_type = s.service_type
    WHERE c.active = TRUE
      AND p.id IS NULL
    ORDER BY
        CASE c.priority
            WHEN 'high' THEN 1
            WHEN 'normal' THEN 2
            WHEN 'low' THEN 3
        END,
        c.population DESC,
        s.service_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. VIEW: seo_page_dashboard
-- Aggregated SEO page metrics by service type
-- ============================================================================
CREATE OR REPLACE VIEW seo_page_dashboard AS
SELECT
    service_type,
    COUNT(*) AS total_pages,
    COUNT(*) FILTER (WHERE status = 'published') AS published,
    COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
    SUM(page_views) AS total_views,
    SUM(leads_generated) AS total_leads
FROM seo_location_pages
GROUP BY service_type;

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================
COMMENT ON TABLE seo_location_pages IS 'AI-generated location-specific SEO landing pages for each city+service combination in the Madison WI metro area — TotalGuard Yard Care';
COMMENT ON TABLE seo_target_cities IS 'Target cities in the Madison WI metro area for location SEO page generation';
COMMENT ON VIEW seo_page_dashboard IS 'Aggregated SEO page metrics: page counts by status, views, and leads per service type';
