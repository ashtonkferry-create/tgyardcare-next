-- Migration 034: Gift Certificate System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Gift certificate purchasing, redemption tracking, and fulfillment
-- Enables: Gift certificate sales from website, code generation, balance tracking, and dashboard

-- ============================================================================
-- 1. GIFT CERTIFICATES TABLE
-- Stores each gift certificate with purchaser/recipient info and balance
-- ============================================================================
CREATE TABLE IF NOT EXISTS gift_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    remaining_balance NUMERIC(10,2) NOT NULL,

    -- Purchaser
    purchaser_name TEXT,
    purchaser_email TEXT,
    purchaser_phone TEXT,

    -- Recipient
    recipient_name TEXT,
    recipient_email TEXT,
    personal_message TEXT,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'partially_used', 'fully_used', 'expired', 'refunded')),

    -- Tracking
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    delivery_method TEXT CHECK (delivery_method IN ('email', 'sms', 'print', 'manual')),
    first_used_at TIMESTAMPTZ,
    fully_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Attribution
    lead_id UUID REFERENCES leads(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. GIFT CERTIFICATE TRANSACTIONS TABLE
-- Tracks every purchase, redemption, and refund against a certificate
-- ============================================================================
CREATE TABLE IF NOT EXISTS gift_certificate_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID NOT NULL REFERENCES gift_certificates(id),
    amount NUMERIC(10,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund')),
    description TEXT,
    job_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. FUNCTION: generate_gift_code()
-- Returns a unique 8-character alphanumeric code prefixed with 'TG-'
-- Example: TG-A3B7K9M2
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_gift_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
    candidate TEXT;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
        END LOOP;
        candidate := 'TG-' || result;

        -- Check uniqueness
        IF NOT EXISTS (SELECT 1 FROM gift_certificates WHERE code = candidate) THEN
            RETURN candidate;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FUNCTION: redeem_gift_certificate(p_code, p_amount, p_job_id)
-- Validates, deducts balance, creates transaction, updates status
-- Returns the remaining balance after redemption
-- ============================================================================
CREATE OR REPLACE FUNCTION redeem_gift_certificate(
    p_code TEXT,
    p_amount NUMERIC,
    p_job_id TEXT DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_cert RECORD;
    v_new_balance NUMERIC;
BEGIN
    -- Look up the certificate and lock the row
    SELECT id, remaining_balance, status, first_used_at
    INTO v_cert
    FROM gift_certificates
    WHERE code = p_code
    FOR UPDATE;

    -- Validate certificate exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gift certificate code "%" not found.', p_code;
    END IF;

    -- Validate certificate is active or partially used
    IF v_cert.status NOT IN ('active', 'partially_used') THEN
        RAISE EXCEPTION 'Gift certificate "%" is not redeemable (status: %).', p_code, v_cert.status;
    END IF;

    -- Validate sufficient balance
    IF v_cert.remaining_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. Requested: $%, Available: $%.', p_amount, v_cert.remaining_balance;
    END IF;

    -- Calculate new balance
    v_new_balance := v_cert.remaining_balance - p_amount;

    -- Update the certificate
    UPDATE gift_certificates
    SET remaining_balance = v_new_balance,
        status = CASE
            WHEN v_new_balance = 0 THEN 'fully_used'
            ELSE 'partially_used'
        END,
        first_used_at = CASE
            WHEN v_cert.first_used_at IS NULL THEN NOW()
            ELSE v_cert.first_used_at
        END,
        fully_used_at = CASE
            WHEN v_new_balance = 0 THEN NOW()
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = v_cert.id;

    -- Create the redemption transaction
    INSERT INTO gift_certificate_transactions (certificate_id, amount, transaction_type, description, job_id)
    VALUES (v_cert.id, p_amount, 'redemption', 'Redeemed $' || p_amount || ' against job ' || COALESCE(p_job_id, 'N/A'), p_job_id);

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_gift_certificates_code ON gift_certificates(code);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_status ON gift_certificates(status);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_purchaser_email ON gift_certificates(purchaser_email);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_recipient_email ON gift_certificates(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_lead ON gift_certificates(lead_id);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_expires ON gift_certificates(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gift_cert_transactions_cert ON gift_certificate_transactions(certificate_id);
CREATE INDEX IF NOT EXISTS idx_gift_cert_transactions_type ON gift_certificate_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gift_cert_transactions_job ON gift_certificate_transactions(job_id) WHERE job_id IS NOT NULL;

-- ============================================================================
-- 6. TRIGGER: auto-update updated_at on gift_certificates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_gift_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gift_certificates_updated_at ON gift_certificates;
CREATE TRIGGER trg_gift_certificates_updated_at
    BEFORE UPDATE ON gift_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_gift_certificates_updated_at();

-- ============================================================================
-- 7. VIEW: gift_certificate_dashboard
-- Aggregated overview of gift certificate program metrics
-- ============================================================================
CREATE OR REPLACE VIEW gift_certificate_dashboard AS
WITH cert_stats AS (
    SELECT
        COUNT(*) AS total_sold,
        COALESCE(SUM(amount), 0) AS total_revenue,
        COALESCE(SUM(remaining_balance), 0) AS total_outstanding_balance,
        COALESCE(SUM(amount - remaining_balance), 0) AS total_redeemed,
        COUNT(*) FILTER (WHERE status IN ('active', 'partially_used')) AS active_count,
        COUNT(*) FILTER (WHERE status = 'expired') AS expired_count,
        COUNT(*) FILTER (WHERE status = 'fully_used') AS fully_used_count,
        COUNT(*) FILTER (WHERE status = 'refunded') AS refunded_count,
        COUNT(*) FILTER (WHERE status = 'partially_used') AS partially_used_count
    FROM gift_certificates
)
SELECT
    total_sold,
    total_revenue,
    total_outstanding_balance,
    total_redeemed,
    active_count,
    expired_count,
    fully_used_count,
    refunded_count,
    partially_used_count
FROM cert_stats;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================
ALTER TABLE gift_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_certificate_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on gift_certificates" ON gift_certificates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on gift_certificate_transactions" ON gift_certificate_transactions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read gift_certificates" ON gift_certificates
    FOR SELECT USING (true);

CREATE POLICY "Anon read gift_certificate_transactions" ON gift_certificate_transactions
    FOR SELECT USING (true);
