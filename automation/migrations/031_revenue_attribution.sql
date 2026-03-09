-- Migration 031: Revenue Attribution System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Close the data loop from lead source -> job -> revenue
-- Enables: ROI tracking per lead source, service type, and time period

-- ============================================================================
-- 1. ADD REVENUE COLUMNS TO LEADS TABLE
-- ============================================================================
-- Note: lifetime_value, total_jobs, last_job_at already exist from migration 030
-- We add the revenue-specific columns needed for attribution tracking

ALTER TABLE leads ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(10,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_job_revenue NUMERIC(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_job_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS latest_job_revenue NUMERIC(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS latest_job_at TIMESTAMPTZ;

-- ============================================================================
-- 2. ADD ATTRIBUTION COLUMNS TO INVOICES TABLE
-- ============================================================================
-- Note: lead_id already exists from migration 026, skip it

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS attributed BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS attributed_at TIMESTAMPTZ;

-- ============================================================================
-- 3. REVENUE ATTRIBUTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS revenue_attribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    invoice_id UUID REFERENCES invoices(id),
    jobber_job_id TEXT,
    revenue NUMERIC(10,2) NOT NULL,
    lead_source TEXT,
    service_type TEXT,
    attributed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES ON REVENUE ATTRIBUTION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_lead ON revenue_attribution(lead_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_source ON revenue_attribution(lead_source);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_date ON revenue_attribution(attributed_at);

-- Index on invoices for attribution queries
CREATE INDEX IF NOT EXISTS idx_invoices_attributed ON invoices(attributed) WHERE attributed IS NOT TRUE;

-- ============================================================================
-- 5. FUNCTION: attribute_invoice_revenue(p_invoice_id UUID)
-- Matches an invoice to a lead and creates the attribution record
-- Returns the lead_id (or NULL if no match)
-- ============================================================================
CREATE OR REPLACE FUNCTION attribute_invoice_revenue(p_invoice_id UUID)
RETURNS UUID AS $$
DECLARE
    v_invoice RECORD;
    v_lead_id UUID;
    v_lead_source TEXT;
    v_existing_revenue NUMERIC(10,2);
    v_existing_jobs INTEGER;
    v_first_job_at TIMESTAMPTZ;
BEGIN
    -- Fetch the invoice
    SELECT id, jobber_job_id, customer_email, customer_phone, total, service_type, paid_at, lead_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice % not found', p_invoice_id;
    END IF;

    -- If invoice already has a lead_id linked, use that
    IF v_invoice.lead_id IS NOT NULL THEN
        v_lead_id := v_invoice.lead_id;
    ELSE
        -- Try to match by email first
        IF v_invoice.customer_email IS NOT NULL AND v_invoice.customer_email != '' THEN
            SELECT id INTO v_lead_id
            FROM leads
            WHERE LOWER(email) = LOWER(v_invoice.customer_email)
            LIMIT 1;
        END IF;

        -- If no email match, try phone
        IF v_lead_id IS NULL AND v_invoice.customer_phone IS NOT NULL AND v_invoice.customer_phone != '' THEN
            SELECT id INTO v_lead_id
            FROM leads
            WHERE phone = v_invoice.customer_phone
               OR REPLACE(REPLACE(REPLACE(REPLACE(phone, '-', ''), '(', ''), ')', ''), ' ', '')
                  = REPLACE(REPLACE(REPLACE(REPLACE(v_invoice.customer_phone, '-', ''), '(', ''), ')', ''), ' ', '')
            LIMIT 1;
        END IF;
    END IF;

    -- Get lead source if we found a lead
    IF v_lead_id IS NOT NULL THEN
        SELECT source INTO v_lead_source FROM leads WHERE id = v_lead_id;
    ELSE
        v_lead_source := 'unknown';
    END IF;

    -- Create the revenue_attribution record
    INSERT INTO revenue_attribution (
        lead_id, invoice_id, jobber_job_id, revenue, lead_source, service_type, attributed_at
    ) VALUES (
        v_lead_id,
        p_invoice_id,
        v_invoice.jobber_job_id,
        v_invoice.total,
        v_lead_source,
        v_invoice.service_type,
        NOW()
    );

    -- Update the lead's revenue tracking if we found a match
    IF v_lead_id IS NOT NULL THEN
        -- Get current lead stats
        SELECT
            COALESCE(total_revenue, 0),
            COALESCE(total_jobs, 0),
            first_job_at
        INTO v_existing_revenue, v_existing_jobs, v_first_job_at
        FROM leads
        WHERE id = v_lead_id;

        -- Update lead
        UPDATE leads SET
            total_revenue = v_existing_revenue + v_invoice.total,
            latest_job_revenue = v_invoice.total,
            latest_job_at = COALESCE(v_invoice.paid_at, NOW()),
            total_jobs = v_existing_jobs + 1,
            -- Set first_job fields only if this is the first attributed job
            first_job_revenue = CASE
                WHEN v_first_job_at IS NULL THEN v_invoice.total
                ELSE first_job_revenue
            END,
            first_job_at = CASE
                WHEN v_first_job_at IS NULL THEN COALESCE(v_invoice.paid_at, NOW())
                ELSE first_job_at
            END,
            -- Also update lifetime_value and last_job_at from migration 030
            lifetime_value = v_existing_revenue + v_invoice.total,
            last_job_at = COALESCE(v_invoice.paid_at, NOW()),
            avg_job_value = ROUND((v_existing_revenue + v_invoice.total) / (v_existing_jobs + 1), 2)
        WHERE id = v_lead_id;
    END IF;

    -- Mark the invoice as attributed
    UPDATE invoices SET
        attributed = TRUE,
        attributed_at = NOW(),
        lead_id = COALESCE(v_lead_id, lead_id),
        lead_source = v_lead_source
    WHERE id = p_invoice_id;

    RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. VIEW: revenue_by_source
-- Shows total revenue, customer count, and avg value per lead source
-- ============================================================================
CREATE OR REPLACE VIEW revenue_by_source AS
SELECT
    lead_source,
    COUNT(DISTINCT lead_id) AS customers,
    COUNT(*) AS total_jobs,
    SUM(revenue) AS total_revenue,
    AVG(revenue) AS avg_job_value,
    ROUND(SUM(revenue) / NULLIF(COUNT(DISTINCT lead_id), 0), 2) AS revenue_per_customer
FROM revenue_attribution
GROUP BY lead_source
ORDER BY total_revenue DESC;

-- ============================================================================
-- 7. VIEW: monthly_revenue
-- Revenue trends over time
-- ============================================================================
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', attributed_at) AS month,
    COUNT(*) AS jobs,
    SUM(revenue) AS revenue,
    AVG(revenue) AS avg_job_value,
    COUNT(DISTINCT lead_id) AS unique_customers
FROM revenue_attribution
GROUP BY DATE_TRUNC('month', attributed_at)
ORDER BY month DESC;

-- ============================================================================
-- 8. VIEW: revenue_by_service
-- Revenue breakdown by service type
-- ============================================================================
CREATE OR REPLACE VIEW revenue_by_service AS
SELECT
    service_type,
    COUNT(*) AS total_jobs,
    SUM(revenue) AS total_revenue,
    AVG(revenue) AS avg_job_value,
    COUNT(DISTINCT lead_id) AS unique_customers
FROM revenue_attribution
GROUP BY service_type
ORDER BY total_revenue DESC;

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================
ALTER TABLE revenue_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on revenue_attribution" ON revenue_attribution
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read revenue_attribution" ON revenue_attribution
    FOR SELECT USING (true);
