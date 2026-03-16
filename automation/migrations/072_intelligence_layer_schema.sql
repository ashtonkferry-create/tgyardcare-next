-- Migration 072: Intelligence Layer Schema for Phase 4
-- Creates 5 new tables: intelligence_reports, intelligence_metrics, ab_test_sends,
--   google_ads_daily, google_ads_alerts
-- Extends 4 existing tables: ab_tests, ab_test_conversions, email_sends, sms_sends
-- Applied: 2026-03-16

-- =============================================================================
-- PART A: NEW TABLES
-- =============================================================================

-- 1. intelligence_reports — stores weekly/monthly intelligence reports
CREATE TABLE IF NOT EXISTS intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL CHECK (report_type IN (
        'weekly_intelligence', 'monthly_trend', 'ad_performance',
        'ab_test_results', 'revenue_attribution', 'channel_roi',
        'learning_report', 'what_got_smarter'
    )),
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    report_data JSONB,
    highlights JSONB,
    anomalies JSONB,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_intelligence_reports_unique
    ON intelligence_reports (report_type, report_period_start);

-- 2. intelligence_metrics — time-series KPI snapshots for anomaly detection
CREATE TABLE IF NOT EXISTS intelligence_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_intelligence_metrics_unique
    ON intelligence_metrics (metric_date, metric_name);
CREATE INDEX IF NOT EXISTS idx_intelligence_metrics_date
    ON intelligence_metrics (metric_date);

-- 3. ab_test_sends — SMS/email A/B test send tracking
CREATE TABLE IF NOT EXISTS ab_test_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
    recipient_phone TEXT,
    recipient_email TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered BOOLEAN DEFAULT FALSE,
    opened BOOLEAN DEFAULT FALSE,
    clicked BOOLEAN DEFAULT FALSE,
    converted BOOLEAN DEFAULT FALSE,
    conversion_event TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_test_sends_test
    ON ab_test_sends (test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_sends_variant
    ON ab_test_sends (test_id, variant_id);

-- 4. google_ads_daily — daily Google Ads metrics
CREATE TABLE IF NOT EXISTS google_ads_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    campaign_id TEXT,
    campaign_name TEXT,
    ad_group_id TEXT,
    ad_group_name TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions DECIMAL(8,2) DEFAULT 0,
    cost_micros BIGINT DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(6,4) DEFAULT 0,
    avg_cpc DECIMAL(8,2) DEFAULT 0,
    roas DECIMAL(6,2) DEFAULT 0,
    search_impression_share DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_google_ads_daily_unique
    ON google_ads_daily (metric_date, campaign_id, COALESCE(ad_group_id, ''));

-- 5. google_ads_alerts — budget guardrails and anomaly alerts
CREATE TABLE IF NOT EXISTS google_ads_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'budget_exceeded', 'no_conversions_48h', 'cpc_spike',
        'roas_drop', 'spend_anomaly'
    )),
    campaign_id TEXT,
    campaign_name TEXT,
    alert_data JSONB,
    action_taken TEXT DEFAULT 'none',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_ads_alerts_type
    ON google_ads_alerts (alert_type);
CREATE INDEX IF NOT EXISTS idx_google_ads_alerts_unresolved
    ON google_ads_alerts (resolved) WHERE resolved = FALSE;

-- =============================================================================
-- PART B: COLUMN EXTENSIONS ON EXISTING TABLES
-- =============================================================================

-- ab_tests: extend for SMS/email testing
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'website';

DO $$ BEGIN
    ALTER TABLE ab_tests DROP CONSTRAINT IF EXISTS ab_tests_channel_check;
    ALTER TABLE ab_tests ADD CONSTRAINT ab_tests_channel_check
        CHECK (channel IN ('website', 'sms', 'email'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS min_sends_per_variant INTEGER DEFAULT 30;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS auto_winner BOOLEAN DEFAULT TRUE;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS winner_variant_id TEXT;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS winner_declared_at TIMESTAMPTZ;

-- Update ab_tests status CHECK to include 'winner_declared'
ALTER TABLE ab_tests DROP CONSTRAINT IF EXISTS ab_tests_status_check;
ALTER TABLE ab_tests ADD CONSTRAINT ab_tests_status_check
    CHECK (status IN ('active', 'paused', 'completed', 'winner_declared'));

-- ab_test_conversions: extend event_type for SMS/email
ALTER TABLE ab_test_conversions DROP CONSTRAINT IF EXISTS ab_test_conversions_event_type_check;
ALTER TABLE ab_test_conversions ADD CONSTRAINT ab_test_conversions_event_type_check
    CHECK (event_type IN (
        'cta_click', 'form_submit', 'phone_click',
        'sms_reply', 'email_open', 'email_click',
        'quote_accepted', 'job_booked'
    ));

-- email_sends: add A/B test tracking
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS ab_test_id TEXT;
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS ab_variant_id TEXT;

-- sms_sends: add A/B test tracking
ALTER TABLE sms_sends ADD COLUMN IF NOT EXISTS ab_test_id TEXT;
ALTER TABLE sms_sends ADD COLUMN IF NOT EXISTS ab_variant_id TEXT;

-- =============================================================================
-- PART C: ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_alerts ENABLE ROW LEVEL SECURITY;

-- Service role: full access (same pattern as migration 071)
CREATE POLICY "service_role_intelligence_reports" ON intelligence_reports
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_intelligence_metrics" ON intelligence_metrics
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ab_test_sends" ON ab_test_sends
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_google_ads_daily" ON google_ads_daily
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_google_ads_alerts" ON google_ads_alerts
    FOR ALL TO service_role USING (true) WITH CHECK (true);
