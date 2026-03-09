-- Migration 035: Email Send Time Optimization
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Track per-customer email open patterns and calculate optimal send times
-- Enables: Personalized email delivery timing to maximize open rates

-- ============================================================================
-- 1. ADD SEND TIME OPTIMIZATION COLUMNS TO LEADS TABLE
-- ============================================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_send_hour INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_send_day INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_open_history JSONB DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS send_time_calculated_at TIMESTAMPTZ;

-- Add CHECK constraints for valid hour (0-23) and day (0-6, 0=Sunday)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'leads_preferred_send_hour_range'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT leads_preferred_send_hour_range
            CHECK (preferred_send_hour IS NULL OR (preferred_send_hour >= 0 AND preferred_send_hour <= 23));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'leads_preferred_send_day_range'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT leads_preferred_send_day_range
            CHECK (preferred_send_day IS NULL OR (preferred_send_day >= 0 AND preferred_send_day <= 6));
    END IF;
END $$;

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_preferred_send_hour ON leads(preferred_send_hour)
    WHERE preferred_send_hour IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_send_time_calculated_at ON leads(send_time_calculated_at);

-- ============================================================================
-- 3. FUNCTION: calculate_preferred_send_time(p_lead_id UUID)
-- Analyzes email_open_history to determine the optimal hour and day to send
-- Returns INTEGER (the preferred hour 0-23)
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_preferred_send_time(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_open_history JSONB;
    v_best_hour INTEGER;
    v_best_day INTEGER;
    v_max_hour_count INTEGER := 0;
    v_max_day_count INTEGER := 0;
    v_hour INTEGER;
    v_day INTEGER;
    v_hour_count INTEGER;
    v_day_count INTEGER;
BEGIN
    -- Get the email_open_history for this lead
    SELECT email_open_history INTO v_open_history
    FROM leads
    WHERE id = p_lead_id;

    -- If no history or empty array, return NULL
    IF v_open_history IS NULL OR jsonb_array_length(v_open_history) = 0 THEN
        RETURN NULL;
    END IF;

    -- Find the hour with the highest open frequency
    -- Each entry in email_open_history is: {"opened_at": "...", "hour": 14, "day_of_week": 2}
    FOR v_hour IN 0..23 LOOP
        SELECT COUNT(*) INTO v_hour_count
        FROM jsonb_array_elements(v_open_history) AS elem
        WHERE (elem->>'hour')::INTEGER = v_hour;

        IF v_hour_count > v_max_hour_count THEN
            v_max_hour_count := v_hour_count;
            v_best_hour := v_hour;
        END IF;
    END LOOP;

    -- Find the day_of_week with the highest open frequency
    FOR v_day IN 0..6 LOOP
        SELECT COUNT(*) INTO v_day_count
        FROM jsonb_array_elements(v_open_history) AS elem
        WHERE (elem->>'day_of_week')::INTEGER = v_day;

        IF v_day_count > v_max_day_count THEN
            v_max_day_count := v_day_count;
            v_best_day := v_day;
        END IF;
    END LOOP;

    -- Update the lead with calculated preferences
    UPDATE leads
    SET
        preferred_send_hour = v_best_hour,
        preferred_send_day = v_best_day,
        send_time_calculated_at = NOW()
    WHERE id = p_lead_id;

    RETURN v_best_hour;
END;
$$;

-- ============================================================================
-- 4. VIEW: send_time_distribution
-- Shows distribution of preferred send hours across all leads
-- Helps understand when customers are most active
-- ============================================================================
CREATE OR REPLACE VIEW send_time_distribution AS
WITH hour_counts AS (
    SELECT
        preferred_send_hour AS hour,
        COUNT(*) AS lead_count
    FROM leads
    WHERE preferred_send_hour IS NOT NULL
    GROUP BY preferred_send_hour
),
day_counts AS (
    SELECT
        preferred_send_day AS day,
        COUNT(*) AS lead_count
    FROM leads
    WHERE preferred_send_day IS NOT NULL
    GROUP BY preferred_send_day
),
total AS (
    SELECT COUNT(*) AS total_optimized
    FROM leads
    WHERE preferred_send_hour IS NOT NULL
),
hour_summary AS (
    SELECT
        h.hour,
        CASE h.hour
            WHEN 0 THEN '12 AM'
            WHEN 1 THEN '1 AM'
            WHEN 2 THEN '2 AM'
            WHEN 3 THEN '3 AM'
            WHEN 4 THEN '4 AM'
            WHEN 5 THEN '5 AM'
            WHEN 6 THEN '6 AM'
            WHEN 7 THEN '7 AM'
            WHEN 8 THEN '8 AM'
            WHEN 9 THEN '9 AM'
            WHEN 10 THEN '10 AM'
            WHEN 11 THEN '11 AM'
            WHEN 12 THEN '12 PM'
            WHEN 13 THEN '1 PM'
            WHEN 14 THEN '2 PM'
            WHEN 15 THEN '3 PM'
            WHEN 16 THEN '4 PM'
            WHEN 17 THEN '5 PM'
            WHEN 18 THEN '6 PM'
            WHEN 19 THEN '7 PM'
            WHEN 20 THEN '8 PM'
            WHEN 21 THEN '9 PM'
            WHEN 22 THEN '10 PM'
            WHEN 23 THEN '11 PM'
        END AS hour_label,
        h.lead_count,
        ROUND(h.lead_count::NUMERIC / NULLIF(t.total_optimized, 0) * 100, 1) AS pct_of_total
    FROM hour_counts h
    CROSS JOIN total t
)
SELECT
    hs.hour,
    hs.hour_label,
    hs.lead_count,
    hs.pct_of_total
FROM hour_summary hs
ORDER BY hs.lead_count DESC, hs.hour ASC;
