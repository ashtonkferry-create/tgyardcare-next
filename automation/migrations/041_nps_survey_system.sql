-- Migration 041: NPS Survey System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Post-job NPS survey that measures customer satisfaction,
-- identifies promoters vs detractors, and calculates Net Promoter Score.
-- Complements existing review tracking (018) with quantitative scoring.

-- ============================================================================
-- 1. NPS_SURVEYS TABLE — tracks each survey sent and response
-- ============================================================================
CREATE TABLE IF NOT EXISTS nps_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    job_reference TEXT,                     -- Jobber job ID or description
    service_type TEXT,                      -- lawn_mowing, aeration, gutter_cleaning, etc.
    score INTEGER CHECK (score >= 0 AND score <= 10),  -- NPS score (0-10)
    feedback TEXT,                          -- optional written feedback
    category TEXT CHECK (category IN ('promoter', 'passive', 'detractor')),  -- auto-set based on score
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'completed', 'expired')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_nps_surveys_lead_id ON nps_surveys(lead_id);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_status ON nps_surveys(status);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_category ON nps_surveys(category);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_score ON nps_surveys(score);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_service_type ON nps_surveys(service_type);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_sent_at ON nps_surveys(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_completed_at ON nps_surveys(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_lead_sent ON nps_surveys(lead_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_created_at ON nps_surveys(created_at DESC);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on nps_surveys" ON nps_surveys
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon insert nps_surveys" ON nps_surveys
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon update nps_surveys" ON nps_surveys
    FOR UPDATE USING (true);

CREATE POLICY "Anon select nps_surveys" ON nps_surveys
    FOR SELECT USING (true);

-- ============================================================================
-- 4. RPC FUNCTION: submit_nps_response
-- Score mapping: 9-10 = promoter, 7-8 = passive, 0-6 = detractor
-- ============================================================================
CREATE OR REPLACE FUNCTION submit_nps_response(
    p_survey_id UUID,
    p_score INTEGER,
    p_feedback TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_category TEXT;
    v_survey RECORD;
BEGIN
    IF p_score < 0 OR p_score > 10 THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Score must be between 0 and 10');
    END IF;

    SELECT id, status INTO v_survey
    FROM nps_surveys
    WHERE id = p_survey_id;

    IF v_survey.id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Survey not found');
    END IF;

    IF v_survey.status = 'completed' THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Survey already completed');
    END IF;

    v_category := CASE
        WHEN p_score >= 9 THEN 'promoter'
        WHEN p_score >= 7 THEN 'passive'
        ELSE 'detractor'
    END;

    UPDATE nps_surveys
    SET score = p_score,
        feedback = p_feedback,
        category = v_category,
        status = 'completed',
        completed_at = NOW()
    WHERE id = p_survey_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'survey_id', p_survey_id,
        'score', p_score,
        'category', v_category,
        'completed_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. VIEW: nps_dashboard — program-wide NPS metrics
-- ============================================================================
CREATE OR REPLACE VIEW nps_dashboard AS
SELECT
    COUNT(*) FILTER (WHERE status = 'completed') AS total_responses,
    COUNT(*) FILTER (WHERE status = 'sent') AS pending,
    COUNT(*) FILTER (WHERE category = 'promoter') AS promoters,
    COUNT(*) FILTER (WHERE category = 'passive') AS passives,
    COUNT(*) FILTER (WHERE category = 'detractor') AS detractors,
    ROUND(AVG(score) FILTER (WHERE score IS NOT NULL)::numeric, 1) AS avg_score,
    ROUND(
        (COUNT(*) FILTER (WHERE category = 'promoter')::numeric -
         COUNT(*) FILTER (WHERE category = 'detractor')::numeric) /
        NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0) * 100
    , 1) AS nps_score,
    COUNT(*) FILTER (WHERE completed_at >= NOW() - INTERVAL '30 days') AS responses_30d
FROM nps_surveys;

COMMENT ON VIEW nps_dashboard IS 'NPS program metrics: total responses, promoter/passive/detractor counts, NPS score, 30-day activity';

-- ============================================================================
-- 6. VIEW: nps_by_service — NPS breakdown by service type
-- ============================================================================
CREATE OR REPLACE VIEW nps_by_service AS
SELECT
    service_type,
    COUNT(*) FILTER (WHERE status = 'completed') AS total_responses,
    COUNT(*) FILTER (WHERE category = 'promoter') AS promoters,
    COUNT(*) FILTER (WHERE category = 'passive') AS passives,
    COUNT(*) FILTER (WHERE category = 'detractor') AS detractors,
    ROUND(AVG(score) FILTER (WHERE score IS NOT NULL)::numeric, 1) AS avg_score,
    ROUND(
        (COUNT(*) FILTER (WHERE category = 'promoter')::numeric -
         COUNT(*) FILTER (WHERE category = 'detractor')::numeric) /
        NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0) * 100
    , 1) AS nps_score
FROM nps_surveys
WHERE service_type IS NOT NULL
GROUP BY service_type
ORDER BY nps_score DESC NULLS LAST;

COMMENT ON VIEW nps_by_service IS 'NPS breakdown by service type — identifies strongest and weakest TotalGuard service lines';

-- ============================================================================
-- 7. TABLE COMMENTS
-- ============================================================================
COMMENT ON TABLE nps_surveys IS 'NPS survey tracking — post-job surveys with 0-10 scoring, auto-categorization, and feedback collection for TotalGuard Yard Care';
