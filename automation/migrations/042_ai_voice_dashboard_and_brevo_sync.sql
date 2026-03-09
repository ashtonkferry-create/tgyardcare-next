-- Migration 042: AI Voice Quote Dashboard + Brevo Sync View
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Dashboard view for AI voice quoting system (Vapi) metrics,
-- plus a segmentation view that powers daily Brevo list auto-sync.
-- Depends on: 022_ai_quoting_engine (ai_quotes, ai_booking_slots),
--             001_base_leads_system (leads),
--             004_jobber_integration (lead_score),
--             030_customer_health_scoring (health_tier, lifetime_value, total_jobs, last_job_at)

-- ============================================================================
-- 1. VIEW: ai_voice_dashboard — metrics for the AI voice quoting system
-- ============================================================================
CREATE OR REPLACE VIEW ai_voice_dashboard AS
SELECT
    (SELECT COUNT(*) FROM ai_quotes) AS total_quotes,
    (SELECT COUNT(*) FROM ai_quotes WHERE created_at >= NOW() - INTERVAL '7 days') AS quotes_7d,
    (SELECT COUNT(*) FROM ai_quotes WHERE created_at >= NOW() - INTERVAL '30 days') AS quotes_30d,
    (SELECT ROUND(COALESCE(AVG(final_price), 0)::numeric, 2) FROM ai_quotes) AS avg_quote_value,
    (SELECT COUNT(*) FROM ai_quotes WHERE appointment_booked = true) AS total_appointments,
    (SELECT COUNT(*) FROM ai_quotes WHERE appointment_booked = true AND created_at >= NOW() - INTERVAL '30 days') AS appointments_30d,
    (SELECT ROUND(
        COUNT(*) FILTER (WHERE appointment_booked = true)::numeric /
        NULLIF(COUNT(*), 0) * 100, 1
    ) FROM ai_quotes) AS conversion_rate_pct,
    (SELECT COALESCE(SUM(final_price), 0) FROM ai_quotes WHERE appointment_booked = true) AS total_booked_revenue,
    (SELECT COALESCE(SUM(final_price), 0) FROM ai_quotes WHERE appointment_booked = true AND created_at >= NOW() - INTERVAL '30 days') AS booked_revenue_30d,
    (SELECT ROUND(COALESCE(AVG(final_price), 0)::numeric, 2) FROM ai_quotes WHERE appointment_booked = true) AS avg_booked_value,
    (SELECT COUNT(DISTINCT caller_phone) FROM ai_quotes) AS unique_callers,
    (SELECT COUNT(DISTINCT caller_phone) FROM ai_quotes WHERE created_at >= NOW() - INTERVAL '30 days') AS unique_callers_30d
;

COMMENT ON VIEW ai_voice_dashboard IS 'AI voice quoting system metrics: quote volume, conversion rate, booked revenue, unique callers — TotalGuard Yard Care';

-- ============================================================================
-- 2. VIEW: ai_voice_quotes_by_service — breakdown by primary service
-- ============================================================================
CREATE OR REPLACE VIEW ai_voice_quotes_by_service AS
SELECT
    primary_service,
    COUNT(*) AS total_quotes,
    COUNT(*) FILTER (WHERE appointment_booked = true) AS booked,
    ROUND(
        COUNT(*) FILTER (WHERE appointment_booked = true)::numeric /
        NULLIF(COUNT(*), 0) * 100, 1
    ) AS conversion_rate_pct,
    ROUND(AVG(final_price)::numeric, 2) AS avg_quote_value,
    COALESCE(SUM(final_price) FILTER (WHERE appointment_booked = true), 0) AS booked_revenue
FROM ai_quotes
GROUP BY primary_service
ORDER BY total_quotes DESC;

COMMENT ON VIEW ai_voice_quotes_by_service IS 'AI voice quote breakdown by service type — identifies top-performing TotalGuard services';

-- ============================================================================
-- 3. VIEW: brevo_segment_candidates — auto-segmentation for Brevo list sync
-- Each row = one lead with boolean flags for every segment they qualify for.
-- The n8n workflow reads this view daily and syncs to Brevo lists.
-- ============================================================================
CREATE OR REPLACE VIEW brevo_segment_candidates AS
SELECT
    l.id,
    l.email,
    l.first_name,
    l.last_name,
    l.city,
    l.services,
    l.total_jobs,
    l.lifetime_value,
    l.health_tier,
    l.lead_score,
    l.last_job_at,
    l.created_at,

    -- ========== Service-based segments ==========
    CASE WHEN 'lawn_mowing' = ANY(l.services) OR 'mowing' = ANY(l.services) OR 'lawn' = ANY(l.services)
         THEN true ELSE false END AS seg_lawn_mowing,
    CASE WHEN 'fertilization' = ANY(l.services) OR 'fertilizer' = ANY(l.services) OR 'fert' = ANY(l.services)
         THEN true ELSE false END AS seg_fertilization,
    CASE WHEN 'aeration' = ANY(l.services) OR 'aerating' = ANY(l.services)
         THEN true ELSE false END AS seg_aeration,
    CASE WHEN 'gutter_cleaning' = ANY(l.services) OR 'gutters' = ANY(l.services) OR 'gutter' = ANY(l.services)
         THEN true ELSE false END AS seg_gutter_cleaning,
    CASE WHEN 'snow_removal' = ANY(l.services) OR 'snow' = ANY(l.services) OR 'plowing' = ANY(l.services)
         THEN true ELSE false END AS seg_snow_removal,
    CASE WHEN 'spring_cleanup' = ANY(l.services) OR 'fall_cleanup' = ANY(l.services) OR 'leaf_removal' = ANY(l.services)
         THEN true ELSE false END AS seg_seasonal_cleanup,
    CASE WHEN 'hardscaping' = ANY(l.services) OR 'mulching' = ANY(l.services) OR 'garden_bed_care' = ANY(l.services)
         THEN true ELSE false END AS seg_landscape_enhancements,

    -- ========== Value-based segments ==========
    CASE WHEN COALESCE(l.lifetime_value, 0) >= 1000 THEN true ELSE false END AS seg_high_value,
    CASE WHEN COALESCE(l.total_jobs, 0) >= 3 THEN true ELSE false END AS seg_repeat_customer,
    CASE WHEN l.health_tier = 'champion' THEN true ELSE false END AS seg_vip,
    CASE WHEN l.health_tier IN ('at_risk', 'churning') THEN true ELSE false END AS seg_at_risk,

    -- ========== Engagement segments ==========
    CASE WHEN l.last_job_at >= NOW() - INTERVAL '90 days' THEN true ELSE false END AS seg_recently_active,
    CASE WHEN l.last_job_at < NOW() - INTERVAL '180 days' AND l.last_job_at IS NOT NULL THEN true ELSE false END AS seg_dormant,

    -- ========== Geographic segments ==========
    CASE WHEN LOWER(TRIM(l.city)) = 'madison' THEN true ELSE false END AS seg_madison_proper,
    CASE WHEN LOWER(TRIM(l.city)) IN ('middleton', 'sun prairie', 'fitchburg', 'verona', 'monona', 'waunakee', 'deforest', 'cottage grove', 'mcfarland', 'oregon', 'stoughton')
         THEN true ELSE false END AS seg_madison_suburbs,

    -- ========== Lead quality segments ==========
    CASE WHEN COALESCE(l.lead_score, 0) >= 70 THEN true ELSE false END AS seg_hot_lead,
    CASE WHEN l.created_at >= NOW() - INTERVAL '30 days' AND COALESCE(l.total_jobs, 0) = 0 THEN true ELSE false END AS seg_new_unconverted

FROM leads l
WHERE l.email IS NOT NULL
  AND l.email != ''
  AND l.status NOT IN ('junk', 'spam', 'duplicate');

COMMENT ON VIEW brevo_segment_candidates IS 'Auto-segmentation view for Brevo list sync — boolean flags per segment, read daily by n8n workflow for TotalGuard Yard Care';

-- ============================================================================
-- 4. INDEXES to support the views
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_quotes_appointment_booked ON ai_quotes(appointment_booked);
CREATE INDEX IF NOT EXISTS idx_ai_quotes_created_at ON ai_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email_not_null ON leads(email) WHERE email IS NOT NULL AND email != '';
CREATE INDEX IF NOT EXISTS idx_leads_services ON leads USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_last_job_at ON leads(last_job_at);
