-- Migration 043: Pricing Optimization Feedback Loop
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Track quote acceptance rates by service/lot size/season and generate
-- AI-driven pricing recommendations. Creates a closed-loop between quoting
-- and booking so prices converge toward the revenue-maximizing acceptance rate.
-- Depends on: 022_ai_quoting_engine (ai_service_pricing)

-- ============================================================================
-- 1. TABLE: pricing_performance — tracks quote outcomes
-- ============================================================================
CREATE TABLE IF NOT EXISTS pricing_performance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type    TEXT NOT NULL,
    house_size      TEXT CHECK (house_size IN ('small', 'medium', 'large', 'xlarge')),
    season          TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
    quoted_price    NUMERIC(10,2),
    accepted        BOOLEAN,
    actual_revenue  NUMERIC(10,2),
    quote_source    TEXT,                    -- 'website', 'ai_voice', 'manual'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pricing_performance IS 'Quote outcome log — every TotalGuard quote tracked with acceptance/rejection and actual revenue for pricing feedback loop';

-- ============================================================================
-- 2. TABLE: pricing_recommendations — AI-generated pricing adjustments
-- ============================================================================
CREATE TABLE IF NOT EXISTS pricing_recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type        TEXT NOT NULL,
    house_size          TEXT,
    season              TEXT,
    current_avg_price   NUMERIC(10,2),
    recommended_price   NUMERIC(10,2),
    acceptance_rate     NUMERIC(5,2),
    sample_size         INTEGER,
    recommendation      TEXT,               -- 'increase', 'decrease', 'maintain'
    confidence          TEXT DEFAULT 'low' CHECK (confidence IN ('low', 'medium', 'high')),
    applied             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pricing_recommendations IS 'AI pricing recommendations — generated weekly by n8n workflow, applied manually by owner';

-- ============================================================================
-- 3. VIEW: pricing_optimization_dashboard
-- ============================================================================
CREATE OR REPLACE VIEW pricing_optimization_dashboard AS
SELECT
    service_type,
    house_size,
    season,
    COUNT(*) AS total_quotes,
    COUNT(*) FILTER (WHERE accepted = true) AS accepted,
    COUNT(*) FILTER (WHERE accepted = false) AS rejected,
    ROUND(COUNT(*) FILTER (WHERE accepted = true)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS acceptance_rate,
    ROUND(AVG(quoted_price)::numeric, 2) AS avg_quoted_price,
    ROUND(AVG(quoted_price) FILTER (WHERE accepted = true)::numeric, 2) AS avg_accepted_price,
    ROUND(AVG(quoted_price) FILTER (WHERE accepted = false)::numeric, 2) AS avg_rejected_price
FROM pricing_performance
GROUP BY service_type, house_size, season
ORDER BY service_type, house_size, season;

COMMENT ON VIEW pricing_optimization_dashboard IS 'Aggregated quote acceptance metrics by service/size/season — powers weekly pricing optimization workflow';

-- ============================================================================
-- 4. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pricing_perf_service_type ON pricing_performance(service_type);
CREATE INDEX IF NOT EXISTS idx_pricing_perf_house_size ON pricing_performance(house_size);
CREATE INDEX IF NOT EXISTS idx_pricing_perf_season ON pricing_performance(season);
CREATE INDEX IF NOT EXISTS idx_pricing_perf_accepted ON pricing_performance(accepted);
CREATE INDEX IF NOT EXISTS idx_pricing_perf_created_at ON pricing_performance(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_perf_quote_source ON pricing_performance(quote_source);
CREATE INDEX IF NOT EXISTS idx_pricing_perf_composite ON pricing_performance(service_type, house_size, season);

CREATE INDEX IF NOT EXISTS idx_pricing_rec_service_type ON pricing_recommendations(service_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rec_applied ON pricing_recommendations(applied);
CREATE INDEX IF NOT EXISTS idx_pricing_rec_created_at ON pricing_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_rec_confidence ON pricing_recommendations(confidence);

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE pricing_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY pricing_perf_service ON pricing_performance
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY pricing_rec_service ON pricing_recommendations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY pricing_rec_anon_read ON pricing_recommendations
    FOR SELECT USING (true);
