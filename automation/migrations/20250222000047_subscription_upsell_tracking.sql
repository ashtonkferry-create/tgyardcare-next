-- Migration: Subscription Upsell Tracking & Service Upsell Campaigns
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Adds tables and views for tracking subscription upsell offers,
--              service upsell campaigns, and scheduled reminders for TotalGuard Yard Care.

-- =============================================================================
-- TABLES
-- =============================================================================

-- Subscription offers sent to customers (quarterly, annual, biannual plans)
CREATE TABLE IF NOT EXISTS subscription_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  customer_name text,
  customer_email text,
  plan_type text NOT NULL CHECK (plan_type IN ('quarterly_commercial', 'annual_residential', 'biannual_residential', 'custom')),
  services text[],
  offer_amount numeric(10,2),
  discount_percent numeric(5,2),
  estimated_savings numeric(10,2),
  estimated_mrr numeric(10,2),
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  converted boolean DEFAULT false,
  converted_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

-- Service upsell log (e.g. suggesting aeration to a lawn mowing customer)
CREATE TABLE IF NOT EXISTS service_upsell_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  customer_name text,
  customer_email text,
  current_services text[],
  suggested_service text NOT NULL,
  suggested_price numeric(10,2),
  bundle_discount numeric(5,2) DEFAULT 0,
  upsell_reason text,
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  converted boolean DEFAULT false,
  converted_at timestamptz,
  revenue_generated numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Scheduled reminders for gift cert expiration, subscription renewals, and more
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_type text NOT NULL CHECK (reminder_type IN ('gift_cert_expiry', 'subscription_renewal', 'seasonal_rebook', 'review_followup', 'custom')),
  target_id text,
  target_email text,
  target_name text,
  subject text,
  body_template text,
  scheduled_for timestamptz NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Dashboard view for subscription upsell performance
CREATE OR REPLACE VIEW subscription_upsell_dashboard AS
SELECT
  COUNT(*) as total_offers_sent,
  COUNT(*) FILTER (WHERE converted) as total_converted,
  ROUND(COUNT(*) FILTER (WHERE converted)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
  COALESCE(SUM(estimated_mrr) FILTER (WHERE converted), 0) as converted_mrr,
  COALESCE(SUM(offer_amount) FILTER (WHERE converted), 0) as converted_revenue,
  COUNT(*) FILTER (WHERE sent_at > now() - interval '7 days') as sent_last_7d,
  COUNT(*) FILTER (WHERE converted AND converted_at > now() - interval '30 days') as converted_last_30d,
  jsonb_build_object(
    'quarterly_commercial', COUNT(*) FILTER (WHERE plan_type = 'quarterly_commercial'),
    'annual_residential', COUNT(*) FILTER (WHERE plan_type = 'annual_residential'),
    'biannual_residential', COUNT(*) FILTER (WHERE plan_type = 'biannual_residential')
  ) as by_plan_type
FROM subscription_offers;

-- Dashboard view for service upsell performance
-- Service slugs adapted for TotalGuard Yard Care
CREATE OR REPLACE VIEW service_upsell_dashboard AS
SELECT
  COUNT(*) as total_upsells_sent,
  COUNT(*) FILTER (WHERE converted) as total_converted,
  ROUND(COUNT(*) FILTER (WHERE converted)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
  COALESCE(SUM(revenue_generated), 0) as total_revenue_generated,
  COUNT(*) FILTER (WHERE sent_at > now() - interval '7 days') as sent_last_7d,
  (SELECT suggested_service FROM service_upsell_log GROUP BY suggested_service ORDER BY COUNT(*) FILTER (WHERE converted) DESC LIMIT 1) as top_converting_service,
  jsonb_build_object(
    'aeration', COUNT(*) FILTER (WHERE suggested_service = 'aeration'),
    'fertilization', COUNT(*) FILTER (WHERE suggested_service = 'fertilization'),
    'mulching', COUNT(*) FILTER (WHERE suggested_service = 'mulching'),
    'gutter_cleaning', COUNT(*) FILTER (WHERE suggested_service = 'gutter_cleaning'),
    'spring_cleanup', COUNT(*) FILTER (WHERE suggested_service = 'spring_cleanup'),
    'fall_cleanup', COUNT(*) FILTER (WHERE suggested_service = 'fall_cleanup'),
    'snow_removal', COUNT(*) FILTER (WHERE suggested_service = 'snow_removal')
  ) as by_service
FROM service_upsell_log;

-- View for the reminder processor to pick up due reminders
CREATE OR REPLACE VIEW pending_reminders AS
SELECT *
FROM scheduled_reminders
WHERE status = 'pending'
  AND scheduled_for <= now()
ORDER BY scheduled_for ASC;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE subscription_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_upsell_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON subscription_offers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON service_upsell_log FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON scheduled_reminders FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_subscription_offers_customer ON subscription_offers(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_upsell_customer ON service_upsell_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_due ON scheduled_reminders(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_type ON scheduled_reminders(reminder_type);
