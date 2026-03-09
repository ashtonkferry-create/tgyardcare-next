-- Migration: 010_dashboard_views.sql
-- Purpose: Create dashboard SQL views for owner dashboard metrics
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Pre-computed views for efficient dashboard querying without client-side aggregation

-- =============================================================================
-- VIEW 1: Dashboard Metrics (single row with key stats)
-- =============================================================================
CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT
  -- Lead volume metrics (week over week)
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)) AS leads_this_week,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '1 week'
                     AND created_at < date_trunc('week', CURRENT_DATE)) AS leads_last_week,

  -- Lead volume metrics (month over month)
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS leads_this_month,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
                     AND created_at < date_trunc('month', CURRENT_DATE)) AS leads_last_month,

  -- Lead quality distribution (90-day window)
  COUNT(*) FILTER (WHERE lead_score >= 70
                     AND created_at >= CURRENT_DATE - INTERVAL '90 days') AS hot_leads,
  COUNT(*) FILTER (WHERE lead_score >= 50 AND lead_score < 70
                     AND created_at >= CURRENT_DATE - INTERVAL '90 days') AS warm_leads,
  COUNT(*) FILTER (WHERE lead_score < 50
                     AND created_at >= CURRENT_DATE - INTERVAL '90 days') AS cold_leads,

  -- Conversion metrics (90-day window)
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE booking_detected_at IS NOT NULL
                               AND created_at >= CURRENT_DATE - INTERVAL '90 days')
    / NULLIF(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'), 0),
    1
  ) AS conversion_rate,

  -- Response time (90-day window, only for leads with responses)
  ROUND(
    AVG(EXTRACT(EPOCH FROM (auto_response_sent_at - created_at)))
    FILTER (WHERE auto_response_sent_at IS NOT NULL
              AND created_at >= CURRENT_DATE - INTERVAL '90 days')
  ) AS avg_response_time_seconds,

  -- Pipeline value (open leads * $275 average job value for lawn care)
  COUNT(*) FILTER (WHERE booking_detected_at IS NULL) * 275 AS pipeline_value

FROM leads;


-- =============================================================================
-- VIEW 2: Leads by Source (current month breakdown)
-- =============================================================================
CREATE OR REPLACE VIEW leads_by_source_view AS
WITH source_counts AS (
  SELECT
    source,
    COUNT(*) AS count
  FROM leads
  WHERE created_at >= date_trunc('month', CURRENT_DATE)
  GROUP BY source
),
total_count AS (
  SELECT SUM(count) AS total FROM source_counts
)
SELECT
  sc.source,
  sc.count,
  ROUND(100.0 * sc.count / NULLIF(tc.total, 0), 1) AS percentage
FROM source_counts sc
CROSS JOIN total_count tc
ORDER BY sc.count DESC;


-- =============================================================================
-- VIEW 3: Lead Volume by Week (last 8 weeks)
-- =============================================================================
CREATE OR REPLACE VIEW lead_volume_weekly_view AS
WITH week_series AS (
  SELECT
    date_trunc('week', CURRENT_DATE - INTERVAL '7 weeks' + (n || ' weeks')::INTERVAL)::DATE AS week_start
  FROM generate_series(0, 7) AS n
)
SELECT
  ws.week_start,
  COALESCE(COUNT(l.id), 0) AS lead_count
FROM week_series ws
LEFT JOIN leads l
  ON date_trunc('week', l.created_at)::DATE = ws.week_start
GROUP BY ws.week_start
ORDER BY ws.week_start ASC;


-- =============================================================================
-- VIEW 4: Conversion Funnel (current month stages)
-- =============================================================================
CREATE OR REPLACE VIEW conversion_funnel_view AS
WITH funnel_data AS (
  SELECT
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE auto_response_sent_at IS NOT NULL) AS contacted,
    COUNT(*) FILTER (WHERE jobber_sync_status = 'synced') AS quoted,
    COUNT(*) FILTER (WHERE booking_detected_at IS NOT NULL) AS booked
  FROM leads
  WHERE created_at >= date_trunc('month', CURRENT_DATE)
)
SELECT stage, stage_order, count
FROM (
  SELECT 'Leads' AS stage, 1 AS stage_order, total_leads AS count FROM funnel_data
  UNION ALL
  SELECT 'Contacted' AS stage, 2 AS stage_order, contacted AS count FROM funnel_data
  UNION ALL
  SELECT 'Quoted' AS stage, 3 AS stage_order, quoted AS count FROM funnel_data
  UNION ALL
  SELECT 'Booked' AS stage, 4 AS stage_order, booked AS count FROM funnel_data
) funnel
ORDER BY stage_order;


-- =============================================================================
-- VIEW 5: Needs Attention (leads requiring manual action)
-- =============================================================================
CREATE OR REPLACE VIEW needs_attention_view AS
SELECT
  id,
  first_name,
  last_name,
  email,
  phone,
  source,
  lead_score,
  created_at,
  CASE
    WHEN auto_response_sent_at IS NULL AND created_at < NOW() - INTERVAL '5 minutes' THEN 'response_failed'
    WHEN lead_score >= 70 AND auto_response_sent_at IS NOT NULL THEN 'hot_not_contacted'
    WHEN jobber_sync_status = 'failed' THEN 'jobber_sync_failed'
    WHEN updated_at < NOW() - INTERVAL '14 days' AND booking_detected_at IS NULL THEN 'stale_lead'
  END AS attention_reason,
  CASE
    WHEN auto_response_sent_at IS NULL AND created_at < NOW() - INTERVAL '5 minutes' THEN 1
    WHEN lead_score >= 70 AND auto_response_sent_at IS NOT NULL THEN 2
    WHEN jobber_sync_status = 'failed' THEN 3
    WHEN updated_at < NOW() - INTERVAL '14 days' AND booking_detected_at IS NULL THEN 4
  END AS priority_order
FROM leads
WHERE
  (auto_response_sent_at IS NULL AND created_at < NOW() - INTERVAL '5 minutes')
  OR (lead_score >= 70 AND auto_response_sent_at IS NOT NULL)
  OR (jobber_sync_status = 'failed')
  OR (updated_at < NOW() - INTERVAL '14 days' AND booking_detected_at IS NULL)
ORDER BY priority_order, created_at DESC;
