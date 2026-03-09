-- Migration 033: Subscription & Maintenance Plans System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Recurring revenue system with subscription plans, customer enrollments, and dashboard
-- Enables: Predictable revenue, customer retention, and automated service scheduling

-- ============================================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- Defines available maintenance plans with pricing and service details
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN (
        'residential_quarterly',
        'residential_biannual',
        'residential_annual',
        'commercial_monthly',
        'commercial_quarterly',
        'custom'
    )),
    services TEXT[] NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'biannual', 'annual')),
    base_price NUMERIC(10,2) NOT NULL,
    discount_pct NUMERIC(5,2) DEFAULT 0,
    effective_price NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CUSTOMER SUBSCRIPTIONS TABLE
-- Tracks individual customer enrollments in plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    next_service_date DATE,
    end_date DATE,
    total_services_completed INTEGER DEFAULT 0,
    total_revenue NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_lead ON customer_subscriptions(lead_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_plan ON customer_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_next_service ON customer_subscriptions(next_service_date)
    WHERE status = 'active';

-- ============================================================================
-- 4. TRIGGER: auto-update updated_at on customer_subscriptions
-- ============================================================================
CREATE OR REPLACE FUNCTION update_customer_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customer_subscriptions_updated_at ON customer_subscriptions;
CREATE TRIGGER trg_customer_subscriptions_updated_at
    BEFORE UPDATE ON customer_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_subscriptions_updated_at();

-- ============================================================================
-- 5. TRIGGER: auto-compute effective_price on subscription_plans insert/update
-- ============================================================================
CREATE OR REPLACE FUNCTION compute_effective_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.effective_price IS NULL THEN
        NEW.effective_price = ROUND(NEW.base_price * (1 - COALESCE(NEW.discount_pct, 0) / 100), 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_effective_price ON subscription_plans;
CREATE TRIGGER trg_compute_effective_price
    BEFORE INSERT OR UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION compute_effective_price();

-- ============================================================================
-- 6. SEED SUBSCRIPTION PLANS — TotalGuard Yard Care
-- ============================================================================
INSERT INTO subscription_plans (name, description, plan_type, services, frequency, base_price, discount_pct, effective_price)
VALUES
    (
        'Lawn Care Quarterly Plan',
        'Professional lawn mowing and fertilization every quarter. Keep your lawn healthy year-round with consistent, scheduled service.',
        'residential_quarterly',
        ARRAY['lawn_mowing', 'fertilization'],
        'quarterly',
        480.00,
        15.00,
        408.00
    ),
    (
        'Full Lawn Care Biannual Plan',
        'Complete seasonal lawn refresh twice a year. Includes mowing, fertilization, and aeration — spring and fall.',
        'residential_biannual',
        ARRAY['lawn_mowing', 'fertilization', 'aeration'],
        'biannual',
        890.00,
        15.00,
        756.50
    ),
    (
        'Residential Annual Complete Yard Care',
        'The ultimate yard maintenance plan. Mowing, fertilization, aeration, spring cleanup, fall cleanup, and gutter cleaning. Maximum savings and zero hassle.',
        'residential_annual',
        ARRAY['lawn_mowing', 'fertilization', 'aeration', 'spring_cleanup', 'fall_cleanup', 'gutter_cleaning'],
        'annual',
        2800.00,
        20.00,
        2240.00
    ),
    (
        'Commercial Monthly Grounds Maintenance',
        'Custom monthly maintenance plan for commercial properties. All services available on a monthly schedule. Pricing negotiated based on property size and service scope.',
        'commercial_monthly',
        ARRAY['lawn_mowing', 'fertilization', 'weeding', 'mulching'],
        'monthly',
        0.00,
        0.00,
        0.00
    ),
    (
        'Commercial Quarterly Grounds Care',
        'Custom quarterly maintenance plan for commercial properties. Full-service grounds care on a quarterly schedule. Pricing negotiated based on property size.',
        'commercial_quarterly',
        ARRAY['lawn_mowing', 'fertilization', 'aeration', 'gutter_cleaning'],
        'quarterly',
        0.00,
        0.00,
        0.00
    ),
    (
        'Gutter + Lawn Bundle',
        'Biannual gutter cleaning and seasonal lawn care bundle. Perfect for homeowners who want clean gutters and a healthy lawn twice a year at a bundled discount.',
        'residential_biannual',
        ARRAY['gutter_cleaning', 'lawn_mowing', 'fertilization'],
        'biannual',
        720.00,
        15.00,
        612.00
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. VIEW: subscription_dashboard
-- Aggregated overview of subscription metrics and upcoming services
-- ============================================================================
CREATE OR REPLACE VIEW subscription_dashboard AS
WITH active_subs AS (
    SELECT
        cs.id,
        cs.lead_id,
        cs.plan_id,
        cs.status,
        cs.next_service_date,
        cs.total_revenue,
        sp.name AS plan_name,
        sp.effective_price,
        sp.frequency,
        -- Annualize the effective price based on frequency
        CASE sp.frequency
            WHEN 'monthly'   THEN sp.effective_price * 12
            WHEN 'quarterly' THEN sp.effective_price * 4
            WHEN 'biannual'  THEN sp.effective_price * 2
            WHEN 'annual'    THEN sp.effective_price
            ELSE sp.effective_price
        END AS annualized_value
    FROM customer_subscriptions cs
    JOIN subscription_plans sp ON cs.plan_id = sp.id
),
totals AS (
    SELECT
        COUNT(*) FILTER (WHERE status = 'active') AS active_subscriptions,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_subscriptions,
        COUNT(*) AS total_subscriptions,
        COALESCE(SUM(annualized_value) FILTER (WHERE status = 'active'), 0) AS total_annual_recurring_revenue,
        COALESCE(ROUND(AVG(annualized_value) FILTER (WHERE status = 'active'), 2), 0) AS avg_subscription_value,
        CASE
            WHEN COUNT(*) > 0
            THEN ROUND(
                COUNT(*) FILTER (WHERE status = 'cancelled')::NUMERIC
                / COUNT(*)::NUMERIC * 100, 2
            )
            ELSE 0
        END AS churn_rate_pct
    FROM active_subs
),
upcoming AS (
    SELECT COUNT(*) AS services_due_this_month
    FROM active_subs
    WHERE status = 'active'
      AND next_service_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND next_service_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
)
SELECT
    t.active_subscriptions,
    t.cancelled_subscriptions,
    t.total_subscriptions,
    t.total_annual_recurring_revenue,
    t.avg_subscription_value,
    t.churn_rate_pct,
    u.services_due_this_month
FROM totals t, upcoming u;

-- ============================================================================
-- 8. VIEW: upcoming_subscription_services
-- Lists active subscriptions with upcoming service dates for scheduling
-- ============================================================================
CREATE OR REPLACE VIEW upcoming_subscription_services AS
SELECT
    cs.id AS subscription_id,
    l.id AS lead_id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.city,
    sp.name AS plan_name,
    sp.services,
    sp.frequency,
    cs.next_service_date,
    cs.total_services_completed,
    cs.total_revenue AS subscription_revenue
FROM customer_subscriptions cs
JOIN subscription_plans sp ON cs.plan_id = sp.id
JOIN leads l ON cs.lead_id = l.id
WHERE cs.status = 'active'
  AND cs.next_service_date IS NOT NULL
ORDER BY cs.next_service_date ASC;

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscription_plans" ON subscription_plans
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on customer_subscriptions" ON customer_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read subscription_plans" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "Anon read customer_subscriptions" ON customer_subscriptions
    FOR SELECT USING (true);
