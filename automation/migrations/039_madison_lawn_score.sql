-- Migration 039: Madison Lawn Score
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Proprietary neighborhood lawn health ranking system for PR/linkbait
-- Scores Madison neighborhoods on lawn/yard health based on service data + reviews + public data

-- ============================================================================
-- 1. NEIGHBORHOOD SCORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS neighborhood_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_name TEXT NOT NULL,
    city TEXT DEFAULT 'Madison',
    zip_code TEXT,
    clean_score NUMERIC(4,1),              -- 0-100 scale (lawn health score)
    rank INTEGER,
    total_properties_estimated INTEGER,
    properties_serviced INTEGER DEFAULT 0,
    service_penetration NUMERIC(5,2),      -- % of properties serviced
    avg_service_frequency NUMERIC(4,2),    -- avg services per property per year
    top_services TEXT[],                   -- most common services in neighborhood
    review_mentions INTEGER DEFAULT 0,     -- times neighborhood mentioned in reviews
    last_calculated_at TIMESTAMPTZ,
    trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(neighborhood_name, city)
);

-- ============================================================================
-- 2. CLEAN SCORE HISTORY TABLE — monthly snapshots
-- ============================================================================
CREATE TABLE IF NOT EXISTS clean_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID REFERENCES neighborhood_scores(id) ON DELETE CASCADE,
    score NUMERIC(4,1),
    rank INTEGER,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    month DATE NOT NULL
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_neighborhood_scores_city ON neighborhood_scores(city);
CREATE INDEX IF NOT EXISTS idx_neighborhood_scores_zip ON neighborhood_scores(zip_code);
CREATE INDEX IF NOT EXISTS idx_neighborhood_scores_rank ON neighborhood_scores(rank);
CREATE INDEX IF NOT EXISTS idx_neighborhood_scores_clean_score ON neighborhood_scores(clean_score DESC);
CREATE INDEX IF NOT EXISTS idx_neighborhood_scores_name_city ON neighborhood_scores(neighborhood_name, city);

CREATE INDEX IF NOT EXISTS idx_clean_score_history_neighborhood ON clean_score_history(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_clean_score_history_month ON clean_score_history(month DESC);
CREATE INDEX IF NOT EXISTS idx_clean_score_history_neighborhood_month ON clean_score_history(neighborhood_id, month DESC);

-- ============================================================================
-- 4. UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_neighborhood_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_neighborhood_scores_updated_at ON neighborhood_scores;
CREATE TRIGGER trg_neighborhood_scores_updated_at
    BEFORE UPDATE ON neighborhood_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_neighborhood_scores_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE neighborhood_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on neighborhood_scores" ON neighborhood_scores
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read neighborhood_scores" ON neighborhood_scores
    FOR SELECT USING (true);

ALTER TABLE clean_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on clean_score_history" ON clean_score_history
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read clean_score_history" ON clean_score_history
    FOR SELECT USING (true);

-- ============================================================================
-- 6. RPC FUNCTION: calculate_clean_scores()
-- Calculates lawn health scores for all neighborhoods based on:
--   service_penetration (40%) + avg_service_frequency (30%) +
--   review_mentions (20%) + service_diversity (10%)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_clean_scores()
RETURNS void AS $$
DECLARE
    rec RECORD;
    v_properties_serviced INTEGER;
    v_total_services INTEGER;
    v_distinct_service_types INTEGER;
    v_avg_frequency NUMERIC(4,2);
    v_penetration NUMERIC(5,2);
    v_review_mentions INTEGER;
    v_top_services TEXT[];
    v_score NUMERIC(4,1);
    v_prev_score NUMERIC(4,1);
    v_trend TEXT;
    v_current_month DATE;
BEGIN
    v_current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;

    -- Iterate over all seeded neighborhoods
    FOR rec IN
        SELECT id, neighborhood_name, city, zip_code, total_properties_estimated, clean_score AS previous_score
        FROM neighborhood_scores
    LOOP
        -- Count distinct customers serviced in this zip code (last 12 months)
        SELECT COUNT(DISTINCT l.id)
        INTO v_properties_serviced
        FROM leads l
        WHERE l.zip_code = rec.zip_code
          AND l.status = 'booked'
          AND l.created_at >= NOW() - INTERVAL '12 months';

        -- Total number of services (booked leads) in this zip code (last 12 months)
        SELECT COUNT(*)
        INTO v_total_services
        FROM leads l
        WHERE l.zip_code = rec.zip_code
          AND l.status = 'booked'
          AND l.created_at >= NOW() - INTERVAL '12 months';

        -- Average service frequency per property
        IF v_properties_serviced > 0 THEN
            v_avg_frequency := ROUND((v_total_services::NUMERIC / v_properties_serviced), 2);
        ELSE
            v_avg_frequency := 0;
        END IF;

        -- Service penetration (% of estimated properties serviced)
        IF COALESCE(rec.total_properties_estimated, 0) > 0 THEN
            v_penetration := ROUND((v_properties_serviced::NUMERIC / rec.total_properties_estimated * 100), 2);
        ELSE
            v_penetration := 0;
        END IF;

        -- Count distinct service types in this zip code
        SELECT COUNT(DISTINCT unnested)
        INTO v_distinct_service_types
        FROM leads l, LATERAL unnest(l.services) AS unnested
        WHERE l.zip_code = rec.zip_code
          AND l.status = 'booked'
          AND l.created_at >= NOW() - INTERVAL '12 months';

        -- Top services (most common, up to 5)
        SELECT ARRAY_AGG(svc ORDER BY cnt DESC)
        INTO v_top_services
        FROM (
            SELECT unnested AS svc, COUNT(*) AS cnt
            FROM leads l, LATERAL unnest(l.services) AS unnested
            WHERE l.zip_code = rec.zip_code
              AND l.status = 'booked'
              AND l.created_at >= NOW() - INTERVAL '12 months'
            GROUP BY unnested
            ORDER BY cnt DESC
            LIMIT 5
        ) sub;

        -- Count review mentions of this neighborhood name
        SELECT COUNT(*)
        INTO v_review_mentions
        FROM reviews r
        WHERE LOWER(r.review_text) LIKE '%' || LOWER(rec.neighborhood_name) || '%';

        -- ============================================================
        -- CALCULATE SCORE (0-100)
        -- service_penetration:    40% weight (capped at 10% = 100 pts)
        -- avg_service_frequency:  30% weight (capped at 4 = 100 pts)
        -- review_mentions:        20% weight (capped at 20 = 100 pts)
        -- service_diversity:      10% weight (capped at 6 types = 100 pts)
        -- ============================================================
        v_score := ROUND((
            -- Penetration component (40%)
            LEAST(v_penetration / 10.0, 1.0) * 40.0 +
            -- Frequency component (30%)
            LEAST(v_avg_frequency / 4.0, 1.0) * 30.0 +
            -- Review mentions component (20%)
            LEAST(v_review_mentions / 20.0, 1.0) * 20.0 +
            -- Service diversity component (10%)
            LEAST(COALESCE(v_distinct_service_types, 0) / 6.0, 1.0) * 10.0
        )::NUMERIC, 1);

        -- Determine trend compared to previous score
        v_prev_score := rec.previous_score;
        IF v_prev_score IS NULL THEN
            v_trend := 'stable';
        ELSIF v_score > v_prev_score + 1.0 THEN
            v_trend := 'improving';
        ELSIF v_score < v_prev_score - 1.0 THEN
            v_trend := 'declining';
        ELSE
            v_trend := 'stable';
        END IF;

        -- Upsert into neighborhood_scores
        UPDATE neighborhood_scores
        SET properties_serviced = v_properties_serviced,
            service_penetration = v_penetration,
            avg_service_frequency = v_avg_frequency,
            top_services = COALESCE(v_top_services, '{}'),
            review_mentions = v_review_mentions,
            clean_score = v_score,
            trend = v_trend,
            last_calculated_at = NOW()
        WHERE id = rec.id;

        -- Record snapshot in clean_score_history (upsert per month)
        INSERT INTO clean_score_history (neighborhood_id, score, rank, month)
        VALUES (rec.id, v_score, NULL, v_current_month)
        ON CONFLICT DO NOTHING;

    END LOOP;

    -- Update ranks across all neighborhoods (highest score = rank 1)
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY clean_score DESC NULLS LAST) AS new_rank
        FROM neighborhood_scores
    )
    UPDATE neighborhood_scores ns
    SET rank = r.new_rank
    FROM ranked r
    WHERE ns.id = r.id;

    -- Update ranks in this month's history snapshots
    UPDATE clean_score_history csh
    SET rank = ns.rank
    FROM neighborhood_scores ns
    WHERE csh.neighborhood_id = ns.id
      AND csh.month = v_current_month;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. SEED NEIGHBORHOOD DATA — well-known Madison / Dane County neighborhoods
-- ============================================================================
INSERT INTO neighborhood_scores (neighborhood_name, city, zip_code, total_properties_estimated) VALUES
    ('Downtown/Capitol',  'Madison',    '53703', 5000),
    ('Middleton',         'Middleton',  '53562', 8000),
    ('Sun Prairie',       'Sun Prairie','53590', 12000),
    ('Fitchburg',         'Fitchburg',  '53711', 11000),
    ('Verona',            'Verona',     '53593', 5000),
    ('Waunakee',          'Waunakee',   '53597', 5500),
    ('Monona',            'Monona',     '53716', 3500),
    ('East Madison',      'Madison',    '53704', 9000),
    ('West Madison',      'Madison',    '53705', 7000),
    ('South Madison',     'Madison',    '53713', 6000),
    ('North Madison',     'Madison',    '53714', 8000),
    ('Oregon',            'Oregon',     '53575', 4000),
    ('DeForest',          'DeForest',   '53532', 4500),
    ('Stoughton',         'Stoughton',  '53589', 5000),
    ('McFarland',         'McFarland',  '53558', 3500)
ON CONFLICT (neighborhood_name, city) DO NOTHING;

-- ============================================================================
-- 8. VIEW: clean_score_leaderboard
-- ============================================================================
CREATE OR REPLACE VIEW clean_score_leaderboard AS
SELECT neighborhood_name, city, zip_code, clean_score, rank,
       properties_serviced, service_penetration, trend,
       last_calculated_at
FROM neighborhood_scores
ORDER BY rank ASC NULLS LAST;

COMMENT ON VIEW clean_score_leaderboard IS 'Public leaderboard of Madison neighborhood lawn health rankings — TotalGuard PR/linkbait asset';
COMMENT ON TABLE neighborhood_scores IS 'Madison Lawn Score: proprietary neighborhood yard health ranking system — TotalGuard Yard Care';
COMMENT ON TABLE clean_score_history IS 'Monthly snapshots of neighborhood lawn scores for trend analysis';
