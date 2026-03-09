-- Migration 040: Loyalty Points Program
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Comprehensive loyalty points system driving repeat business
-- Points per dollar spent, tier multipliers, redeemable for discounts on yard care services

-- ============================================================================
-- 1. LOYALTY_ACCOUNTS TABLE — one per customer
-- ============================================================================
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE UNIQUE,
    points_balance INTEGER DEFAULT 0,
    lifetime_points_earned INTEGER DEFAULT 0,
    lifetime_points_redeemed INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. LOYALTY_TRANSACTIONS TABLE — every point earn/redeem event
-- ============================================================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loyalty_account_id UUID REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'expire', 'adjustment')),
    points INTEGER NOT NULL,  -- positive for earn, negative for redeem
    description TEXT,
    reference_type TEXT,      -- 'job', 'review', 'referral', 'birthday', 'milestone'
    reference_id TEXT,        -- job ID, review ID, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. LOYALTY_REWARDS TABLE — available rewards catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('percentage_discount', 'flat_discount', 'free_addon', 'priority_scheduling')),
    reward_value NUMERIC(10,2),  -- discount % or dollar amount
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- loyalty_accounts
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_lead_id ON loyalty_accounts(lead_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON loyalty_accounts(tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_balance ON loyalty_accounts(points_balance DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_lifetime ON loyalty_accounts(lifetime_points_earned DESC);

-- loyalty_transactions
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account_id ON loyalty_transactions(loyalty_account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_ref_type ON loyalty_transactions(reference_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_ref_id ON loyalty_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account_created ON loyalty_transactions(loyalty_account_id, created_at DESC);

-- loyalty_rewards
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON loyalty_rewards(points_required ASC);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_type ON loyalty_rewards(reward_type);

-- ============================================================================
-- 5. UPDATED_AT TRIGGER on loyalty_accounts
-- ============================================================================
CREATE OR REPLACE FUNCTION update_loyalty_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_loyalty_accounts_updated_at ON loyalty_accounts;
CREATE TRIGGER trg_loyalty_accounts_updated_at
    BEFORE UPDATE ON loyalty_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_accounts_updated_at();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on loyalty_accounts" ON loyalty_accounts
    FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on loyalty_transactions" ON loyalty_transactions
    FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on loyalty_rewards" ON loyalty_rewards
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read loyalty_rewards" ON loyalty_rewards
    FOR SELECT USING (true);

-- ============================================================================
-- 7. RPC FUNCTION: earn_loyalty_points
-- Adds points, applies tier multiplier, updates balance, checks tier upgrade
--
-- Tier thresholds & multipliers:
--   Bronze:   0-499     lifetime points (1.0x)
--   Silver:   500-1499  lifetime points (1.25x)
--   Gold:     1500-3999 lifetime points (1.5x)
--   Platinum: 4000+     lifetime points (2.0x)
--
-- Point earning rates (before multiplier):
--   $1 spent = 1 point
--   Google review = 50 bonus points
--   Referral conversion = 100 bonus points
--   Birthday = 25 bonus points
--   5th service milestone = 200 bonus points
--   10th service milestone = 500 bonus points
-- ============================================================================
CREATE OR REPLACE FUNCTION earn_loyalty_points(
    p_lead_id UUID,
    p_points INTEGER,
    p_description TEXT,
    p_ref_type TEXT DEFAULT NULL,
    p_ref_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_account_id UUID;
    v_current_tier TEXT;
    v_multiplier NUMERIC(4,2);
    v_adjusted_points INTEGER;
    v_new_balance INTEGER;
    v_new_lifetime INTEGER;
    v_new_tier TEXT;
    v_tier_upgraded BOOLEAN := FALSE;
    v_txn_type TEXT;
BEGIN
    -- Get or create loyalty account
    SELECT id, tier INTO v_account_id, v_current_tier
    FROM loyalty_accounts
    WHERE lead_id = p_lead_id;

    IF v_account_id IS NULL THEN
        INSERT INTO loyalty_accounts (lead_id, tier, tier_updated_at)
        VALUES (p_lead_id, 'bronze', NOW())
        RETURNING id, tier INTO v_account_id, v_current_tier;
    END IF;

    -- Determine multiplier based on current tier
    v_multiplier := CASE v_current_tier
        WHEN 'bronze'   THEN 1.0
        WHEN 'silver'   THEN 1.25
        WHEN 'gold'     THEN 1.5
        WHEN 'platinum' THEN 2.0
        ELSE 1.0
    END;

    -- Apply multiplier (round up)
    v_adjusted_points := CEIL(p_points * v_multiplier);

    -- Determine transaction type
    v_txn_type := CASE
        WHEN p_ref_type IN ('review', 'referral', 'birthday', 'milestone') THEN 'bonus'
        ELSE 'earn'
    END;

    -- Record the transaction
    INSERT INTO loyalty_transactions (
        loyalty_account_id, type, points, description, reference_type, reference_id
    ) VALUES (
        v_account_id, v_txn_type, v_adjusted_points, p_description, p_ref_type, p_ref_id
    );

    -- Update account balance and lifetime totals
    UPDATE loyalty_accounts
    SET points_balance = points_balance + v_adjusted_points,
        lifetime_points_earned = lifetime_points_earned + v_adjusted_points
    WHERE id = v_account_id
    RETURNING points_balance, lifetime_points_earned
    INTO v_new_balance, v_new_lifetime;

    -- Check tier upgrade based on lifetime points
    v_new_tier := CASE
        WHEN v_new_lifetime >= 4000 THEN 'platinum'
        WHEN v_new_lifetime >= 1500 THEN 'gold'
        WHEN v_new_lifetime >= 500  THEN 'silver'
        ELSE 'bronze'
    END;

    IF v_new_tier <> v_current_tier THEN
        UPDATE loyalty_accounts
        SET tier = v_new_tier,
            tier_updated_at = NOW()
        WHERE id = v_account_id;
        v_tier_upgraded := TRUE;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'account_id', v_account_id,
        'base_points', p_points,
        'multiplier', v_multiplier,
        'adjusted_points', v_adjusted_points,
        'new_balance', v_new_balance,
        'new_lifetime', v_new_lifetime,
        'tier', v_new_tier,
        'tier_upgraded', v_tier_upgraded,
        'previous_tier', v_current_tier
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. RPC FUNCTION: redeem_loyalty_points
-- ============================================================================
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
    p_lead_id UUID,
    p_points INTEGER,
    p_description TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_account_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    SELECT id, points_balance INTO v_account_id, v_current_balance
    FROM loyalty_accounts
    WHERE lead_id = p_lead_id;

    IF v_account_id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No loyalty account found for this customer');
    END IF;

    IF v_current_balance < p_points THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Insufficient points balance',
            'current_balance', v_current_balance,
            'requested', p_points
        );
    END IF;

    INSERT INTO loyalty_transactions (
        loyalty_account_id, type, points, description, reference_type
    ) VALUES (
        v_account_id, 'redeem', -p_points, p_description, 'redemption'
    );

    UPDATE loyalty_accounts
    SET points_balance = points_balance - p_points,
        lifetime_points_redeemed = lifetime_points_redeemed + p_points
    WHERE id = v_account_id
    RETURNING points_balance INTO v_new_balance;

    RETURN jsonb_build_object(
        'success', TRUE,
        'account_id', v_account_id,
        'points_redeemed', p_points,
        'new_balance', v_new_balance,
        'lifetime_redeemed', (SELECT lifetime_points_redeemed FROM loyalty_accounts WHERE id = v_account_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. RPC FUNCTION: get_loyalty_status
-- ============================================================================
CREATE OR REPLACE FUNCTION get_loyalty_status(p_lead_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_account RECORD;
    v_next_tier TEXT;
    v_next_tier_threshold INTEGER;
    v_points_to_next_tier INTEGER;
    v_available_rewards JSONB;
    v_recent_transactions JSONB;
BEGIN
    SELECT * INTO v_account
    FROM loyalty_accounts
    WHERE lead_id = p_lead_id;

    IF v_account IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No loyalty account found', 'has_account', FALSE);
    END IF;

    CASE v_account.tier
        WHEN 'bronze' THEN v_next_tier := 'silver'; v_next_tier_threshold := 500;
        WHEN 'silver' THEN v_next_tier := 'gold'; v_next_tier_threshold := 1500;
        WHEN 'gold'   THEN v_next_tier := 'platinum'; v_next_tier_threshold := 4000;
        WHEN 'platinum' THEN v_next_tier := NULL; v_next_tier_threshold := NULL;
    END CASE;

    v_points_to_next_tier := CASE
        WHEN v_next_tier_threshold IS NOT NULL THEN GREATEST(0, v_next_tier_threshold - v_account.lifetime_points_earned)
        ELSE 0
    END;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', lr.id, 'name', lr.name, 'description', lr.description,
            'points_required', lr.points_required, 'reward_type', lr.reward_type,
            'reward_value', lr.reward_value,
            'can_redeem', (lr.points_required <= v_account.points_balance)
        ) ORDER BY lr.points_required ASC
    ), '[]'::jsonb) INTO v_available_rewards
    FROM loyalty_rewards lr WHERE lr.active = TRUE;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', lt.id, 'type', lt.type, 'points', lt.points,
            'description', lt.description, 'reference_type', lt.reference_type,
            'created_at', lt.created_at
        ) ORDER BY lt.created_at DESC
    ), '[]'::jsonb) INTO v_recent_transactions
    FROM (
        SELECT * FROM loyalty_transactions
        WHERE loyalty_account_id = v_account.id
        ORDER BY created_at DESC LIMIT 10
    ) lt;

    RETURN jsonb_build_object(
        'success', TRUE, 'has_account', TRUE, 'account_id', v_account.id,
        'points_balance', v_account.points_balance,
        'lifetime_points_earned', v_account.lifetime_points_earned,
        'lifetime_points_redeemed', v_account.lifetime_points_redeemed,
        'tier', v_account.tier, 'tier_updated_at', v_account.tier_updated_at,
        'next_tier', v_next_tier, 'next_tier_threshold', v_next_tier_threshold,
        'points_to_next_tier', v_points_to_next_tier,
        'available_rewards', v_available_rewards,
        'recent_transactions', v_recent_transactions
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. SEED LOYALTY_REWARDS — TotalGuard yard care rewards catalog
-- ============================================================================
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, reward_value) VALUES
    ('10% Off Next Service',
     'Save 10% on your next lawn mowing, fertilization, aeration, or any yard care service.',
     250, 'percentage_discount', 10.00),

    ('15% Off Next Service',
     'Save 15% on your next service. Great value for regular lawn maintenance customers.',
     400, 'percentage_discount', 15.00),

    ('$25 Off Any Service',
     '$25 discount applied to any single service booking.',
     500, 'flat_discount', 25.00),

    ('$50 Off Any Service',
     '$50 discount applied to any single service booking. Best for seasonal packages.',
     900, 'flat_discount', 50.00),

    ('Free Gutter Cleaning Add-On',
     'Add gutter cleaning at no extra charge when booking any other yard care service.',
     750, 'free_addon', 0.00),

    ('Priority Scheduling',
     'Jump to the front of the line — get the next available service slot in your area.',
     300, 'priority_scheduling', 0.00)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. VIEW: loyalty_leaderboard
-- ============================================================================
CREATE OR REPLACE VIEW loyalty_leaderboard AS
SELECT
    la.id AS account_id,
    la.lead_id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.city,
    la.points_balance,
    la.lifetime_points_earned,
    la.lifetime_points_redeemed,
    la.tier,
    la.tier_updated_at,
    la.created_at AS member_since,
    (SELECT COUNT(*) FROM loyalty_transactions lt WHERE lt.loyalty_account_id = la.id AND lt.type IN ('earn', 'bonus')) AS total_earn_transactions,
    (SELECT COUNT(*) FROM loyalty_transactions lt WHERE lt.loyalty_account_id = la.id AND lt.type = 'redeem') AS total_redemptions
FROM loyalty_accounts la
JOIN leads l ON l.id = la.lead_id
ORDER BY la.lifetime_points_earned DESC;

COMMENT ON VIEW loyalty_leaderboard IS 'Top customers ranked by lifetime loyalty points earned — TotalGuard Yard Care';

-- ============================================================================
-- 12. VIEW: loyalty_program_summary
-- ============================================================================
CREATE OR REPLACE VIEW loyalty_program_summary AS
SELECT
    (SELECT COUNT(*) FROM loyalty_accounts) AS total_accounts,
    (SELECT COALESCE(SUM(points_balance), 0) FROM loyalty_accounts) AS total_points_outstanding,
    (SELECT COALESCE(SUM(lifetime_points_earned), 0) FROM loyalty_accounts) AS total_points_ever_earned,
    (SELECT COALESCE(SUM(lifetime_points_redeemed), 0) FROM loyalty_accounts) AS total_points_ever_redeemed,
    (SELECT COUNT(*) FROM loyalty_accounts WHERE tier = 'bronze') AS bronze_count,
    (SELECT COUNT(*) FROM loyalty_accounts WHERE tier = 'silver') AS silver_count,
    (SELECT COUNT(*) FROM loyalty_accounts WHERE tier = 'gold') AS gold_count,
    (SELECT COUNT(*) FROM loyalty_accounts WHERE tier = 'platinum') AS platinum_count,
    (SELECT COUNT(*) FROM loyalty_transactions WHERE type IN ('earn', 'bonus') AND created_at >= NOW() - INTERVAL '30 days') AS transactions_last_30d,
    (SELECT COUNT(*) FROM loyalty_transactions WHERE type = 'redeem' AND created_at >= NOW() - INTERVAL '30 days') AS redemptions_last_30d,
    (SELECT COALESCE(SUM(points), 0) FROM loyalty_transactions WHERE type IN ('earn', 'bonus') AND created_at >= NOW() - INTERVAL '30 days') AS points_earned_last_30d,
    (SELECT COALESCE(SUM(ABS(points)), 0) FROM loyalty_transactions WHERE type = 'redeem' AND created_at >= NOW() - INTERVAL '30 days') AS points_redeemed_last_30d;

COMMENT ON VIEW loyalty_program_summary IS 'Program-wide loyalty metrics: accounts, points outstanding, tier distribution';

-- ============================================================================
-- 13. TABLE COMMENTS
-- ============================================================================
COMMENT ON TABLE loyalty_accounts IS 'Loyalty program accounts — one per customer, tracks points balance and tier';
COMMENT ON TABLE loyalty_transactions IS 'Every loyalty point earn/redeem/bonus/expire/adjustment event';
COMMENT ON TABLE loyalty_rewards IS 'Available rewards catalog — what customers can redeem points for at TotalGuard';
