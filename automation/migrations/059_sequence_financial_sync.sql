-- Migration 059: Sequence Financial Sync & Cashflow Tracking
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Connects Sequence (getsequence.io) account balance data with business cashflow events

-- Account balance snapshots from Sequence API
CREATE TABLE IF NOT EXISTS sequence_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT DEFAULT 'Account', -- 'Account' or 'Income Source'
  institution_name TEXT,
  balance_cents BIGINT DEFAULT 0,
  balance_dollars NUMERIC(12,2) GENERATED ALWAYS AS (balance_cents / 100.0) STORED,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sequence_id)
);

-- Historical balance snapshots (taken every sync cycle)
CREATE TABLE IF NOT EXISTS account_balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES sequence_accounts(id) ON DELETE CASCADE,
  sequence_id TEXT NOT NULL,
  balance_cents BIGINT NOT NULL,
  balance_dollars NUMERIC(12,2) GENERATED ALWAYS AS (balance_cents / 100.0) STORED,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  snapshot_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Linked financial institutions from Sequence/Plaid
CREATE TABLE IF NOT EXISTS financial_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  institution_type TEXT DEFAULT 'DEPOSITORY',
  logo_url TEXT,
  provider TEXT DEFAULT 'PLAID',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cashflow events from all sources (Sequence, Jobber, manual)
CREATE TABLE IF NOT EXISTS cashflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('income', 'expense', 'transfer', 'refund', 'pending')),
  source TEXT NOT NULL CHECK (source IN ('sequence', 'jobber', 'manual', 'brevo', 'stripe', 'other')),
  source_id TEXT,
  description TEXT,
  amount_cents BIGINT NOT NULL,
  amount_dollars NUMERIC(12,2) GENERATED ALWAYS AS (amount_cents / 100.0) STORED,
  currency TEXT DEFAULT 'USD',
  category TEXT, -- 'service_revenue', 'supplies', 'marketing', 'payroll', etc.
  event_date DATE NOT NULL,
  account_sequence_id TEXT,
  lead_id UUID,
  customer_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Billers from Sequence
CREATE TABLE IF NOT EXISTS sequence_billers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_balance_history_account ON account_balance_history(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_date ON account_balance_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_balance_history_seq_id ON account_balance_history(sequence_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_events_date ON cashflow_events(event_date);
CREATE INDEX IF NOT EXISTS idx_cashflow_events_type ON cashflow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cashflow_events_source ON cashflow_events(source);
CREATE INDEX IF NOT EXISTS idx_cashflow_events_category ON cashflow_events(category);
CREATE INDEX IF NOT EXISTS idx_cashflow_events_account ON cashflow_events(account_sequence_id);

-- RPC: Get cashflow summary for a date range
CREATE OR REPLACE FUNCTION get_cashflow_summary(
  p_start_date DATE DEFAULT (now() - interval '30 days')::date,
  p_end_date DATE DEFAULT now()::date
) RETURNS TABLE (
  total_income NUMERIC,
  total_expenses NUMERIC,
  net_cashflow NUMERIC,
  total_transfers NUMERIC,
  event_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN ce.event_type = 'income' THEN ce.amount_cents END), 0) / 100.0 AS total_income,
    COALESCE(SUM(CASE WHEN ce.event_type = 'expense' THEN ce.amount_cents END), 0) / 100.0 AS total_expenses,
    COALESCE(SUM(CASE WHEN ce.event_type = 'income' THEN ce.amount_cents
                      WHEN ce.event_type IN ('expense', 'refund') THEN -ce.amount_cents
                      ELSE 0 END), 0) / 100.0 AS net_cashflow,
    COALESCE(SUM(CASE WHEN ce.event_type = 'transfer' THEN ce.amount_cents END), 0) / 100.0 AS total_transfers,
    COUNT(*) AS event_count
  FROM cashflow_events ce
  WHERE ce.event_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get account balance trends (last N days)
CREATE OR REPLACE FUNCTION get_balance_trends(
  p_days INTEGER DEFAULT 30
) RETURNS TABLE (
  snapshot_date DATE,
  account_name TEXT,
  balance_dollars NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    abh.snapshot_date,
    sa.name AS account_name,
    abh.balance_cents / 100.0 AS balance_dollars
  FROM account_balance_history abh
  JOIN sequence_accounts sa ON sa.id = abh.account_id
  WHERE abh.snapshot_date >= (CURRENT_DATE - p_days)
  ORDER BY abh.snapshot_date, sa.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get total portfolio value (sum of all account balances)
CREATE OR REPLACE FUNCTION get_total_portfolio_value()
RETURNS TABLE (
  total_balance NUMERIC,
  business_balance NUMERIC,
  personal_balance NUMERIC,
  investment_balance NUMERIC,
  account_count BIGINT,
  last_synced TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(sa.balance_cents), 0) / 100.0 AS total_balance,
    COALESCE(SUM(CASE WHEN sa.name ILIKE '%business%' OR sa.name ILIKE '%totalguard%' OR sa.name ILIKE '%tg%' THEN sa.balance_cents ELSE 0 END), 0) / 100.0 AS business_balance,
    COALESCE(SUM(CASE WHEN sa.name ILIKE '%personal%' THEN sa.balance_cents ELSE 0 END), 0) / 100.0 AS personal_balance,
    COALESCE(SUM(CASE WHEN sa.name ILIKE '%invest%' OR sa.name ILIKE '%robinhood%' OR sa.name ILIKE '%cd%' THEN sa.balance_cents ELSE 0 END), 0) / 100.0 AS investment_balance,
    COUNT(*) AS account_count,
    MAX(sa.last_synced_at) AS last_synced
  FROM sequence_accounts sa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE sequence_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_billers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON sequence_accounts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON account_balance_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON financial_institutions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON cashflow_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON sequence_billers FOR ALL USING (auth.role() = 'service_role');
