-- Migration 036: Commercial Account Management
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Multi-location commercial contracts, service scheduling, and revenue tracking
-- Enables: Commercial account CRM, location-level service tracking, and commercial dashboard

-- ============================================================================
-- 1. COMMERCIAL ACCOUNTS TABLE
-- Stores company-level account info, contracts, and financials
-- ============================================================================
CREATE TABLE IF NOT EXISTS commercial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,

    -- Account details
    account_type TEXT DEFAULT 'standard' CHECK (account_type IN ('standard', 'enterprise', 'franchise')),
    total_locations INTEGER DEFAULT 1,
    service_agreement TEXT,
    contract_start_date DATE,
    contract_end_date DATE,

    -- Financials
    monthly_contract_value NUMERIC(10,2) DEFAULT 0,
    annual_contract_value NUMERIC(10,2) DEFAULT 0,
    total_revenue NUMERIC(10,2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'net_30',

    -- Status
    status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'proposal', 'negotiation', 'active', 'paused', 'cancelled')),

    -- Attribution
    lead_id UUID REFERENCES leads(id),
    jobber_customer_id TEXT,

    -- Notes
    notes TEXT,
    last_contact_at TIMESTAMPTZ,
    next_followup_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. COMMERCIAL LOCATIONS TABLE
-- Stores individual service locations for each commercial account
-- ============================================================================
CREATE TABLE IF NOT EXISTS commercial_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES commercial_accounts(id),
    location_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT DEFAULT 'WI',
    zip_code TEXT,

    -- Service details
    services TEXT[] DEFAULT '{}',
    service_frequency TEXT CHECK (service_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed')),
    last_service_date DATE,
    next_service_date DATE,

    -- Pricing
    per_service_price NUMERIC(10,2),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_commercial_accounts_status ON commercial_accounts(status);
CREATE INDEX IF NOT EXISTS idx_commercial_accounts_type ON commercial_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_commercial_accounts_company ON commercial_accounts(company_name);
CREATE INDEX IF NOT EXISTS idx_commercial_accounts_lead ON commercial_accounts(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commercial_accounts_jobber ON commercial_accounts(jobber_customer_id) WHERE jobber_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commercial_accounts_next_followup ON commercial_accounts(next_followup_at) WHERE next_followup_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_commercial_locations_account ON commercial_locations(account_id);
CREATE INDEX IF NOT EXISTS idx_commercial_locations_city ON commercial_locations(city);
CREATE INDEX IF NOT EXISTS idx_commercial_locations_next_service ON commercial_locations(next_service_date) WHERE next_service_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commercial_locations_active ON commercial_locations(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 4. TRIGGER: auto-update updated_at on commercial_accounts
-- ============================================================================
CREATE OR REPLACE FUNCTION update_commercial_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_commercial_accounts_updated_at ON commercial_accounts;
CREATE TRIGGER trg_commercial_accounts_updated_at
    BEFORE UPDATE ON commercial_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_commercial_accounts_updated_at();

-- ============================================================================
-- 5. SEED DATA: Known commercial accounts for TotalGuard Yard Care
-- ============================================================================

-- Property management companies operating in Madison / Dane County
INSERT INTO commercial_accounts (
    company_name, account_type, total_locations, status,
    monthly_contract_value, annual_contract_value, total_revenue,
    payment_terms, notes
) VALUES (
    'Madison Property Management Group', 'enterprise', 15, 'prospect',
    2000.00, 24000.00, 0,
    'net_30', 'Large property management firm managing residential and commercial properties across Dane County.'
) ON CONFLICT DO NOTHING;

INSERT INTO commercial_accounts (
    company_name, account_type, total_locations, status,
    monthly_contract_value, annual_contract_value, total_revenue,
    payment_terms, notes
) VALUES (
    'Dane County HOA Services', 'standard', 5, 'prospect',
    800.00, 9600.00, 0,
    'net_30', 'HOA management company overseeing multiple neighborhoods in the Madison metro area.'
) ON CONFLICT DO NOTHING;

INSERT INTO commercial_accounts (
    company_name, account_type, total_locations, status,
    monthly_contract_value, annual_contract_value, total_revenue,
    payment_terms, notes
) VALUES (
    'Capitol Commercial Properties', 'standard', 3, 'prospect',
    500.00, 6000.00, 0,
    'net_30', 'Commercial property owner with office and retail locations near downtown Madison.'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. VIEW: commercial_dashboard
-- Aggregated commercial account metrics for reporting
-- ============================================================================
CREATE OR REPLACE VIEW commercial_dashboard AS
WITH account_stats AS (
    SELECT
        COUNT(*) AS total_accounts,
        COUNT(*) FILTER (WHERE status = 'active') AS active_accounts,
        COUNT(*) FILTER (WHERE status = 'prospect') AS prospect_accounts,
        COUNT(*) FILTER (WHERE status = 'proposal') AS proposal_accounts,
        COALESCE(SUM(annual_contract_value) FILTER (WHERE status = 'active'), 0) AS total_annual_contract_value,
        COALESCE(SUM(monthly_contract_value) FILTER (WHERE status = 'active'), 0) AS total_monthly_contract_value,
        COALESCE(SUM(total_revenue), 0) AS total_lifetime_revenue
    FROM commercial_accounts
),
location_stats AS (
    SELECT
        COUNT(*) FILTER (
            WHERE cl.next_service_date IS NOT NULL
              AND cl.next_service_date <= (CURRENT_DATE + INTERVAL '30 days')
              AND cl.next_service_date >= CURRENT_DATE
              AND cl.is_active = TRUE
        ) AS services_due_this_month,
        COUNT(*) FILTER (
            WHERE cl.next_service_date IS NOT NULL
              AND cl.next_service_date < CURRENT_DATE
              AND cl.is_active = TRUE
        ) AS overdue_services
    FROM commercial_locations cl
    JOIN commercial_accounts ca ON ca.id = cl.account_id
    WHERE ca.status = 'active'
),
revenue_by_account AS (
    SELECT
        json_agg(
            json_build_object(
                'company_name', ca.company_name,
                'status', ca.status,
                'annual_contract_value', ca.annual_contract_value,
                'total_revenue', ca.total_revenue,
                'total_locations', ca.total_locations
            ) ORDER BY ca.annual_contract_value DESC
        ) AS accounts_detail
    FROM commercial_accounts ca
    WHERE ca.status IN ('active', 'proposal', 'negotiation')
)
SELECT
    a.total_accounts,
    a.active_accounts,
    a.prospect_accounts,
    a.proposal_accounts,
    a.total_annual_contract_value,
    a.total_monthly_contract_value,
    a.total_lifetime_revenue,
    l.services_due_this_month,
    l.overdue_services,
    r.accounts_detail AS revenue_by_account
FROM account_stats a, location_stats l, revenue_by_account r;

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================
ALTER TABLE commercial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on commercial_accounts" ON commercial_accounts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on commercial_locations" ON commercial_locations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read commercial_accounts" ON commercial_accounts
    FOR SELECT USING (true);

CREATE POLICY "Anon read commercial_locations" ON commercial_locations
    FOR SELECT USING (true);

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================
COMMENT ON TABLE commercial_accounts IS 'Commercial account CRM: company-level contracts, financials, and status tracking for TotalGuard Yard Care';
COMMENT ON TABLE commercial_locations IS 'Individual service locations for commercial accounts with scheduling and pricing';
COMMENT ON VIEW commercial_dashboard IS 'Aggregated commercial metrics: accounts, contract values, service schedule status';
