-- Migration 063: Financial Daily Snapshots
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Stores daily portfolio summaries for trend tracking and the daily KPI digest workflow

CREATE TABLE IF NOT EXISTS financial_daily_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  total_balance NUMERIC(12,2),
  business_balance NUMERIC(12,2),
  personal_balance NUMERIC(12,2),
  investment_balance NUMERIC(12,2),
  account_count INTEGER,
  total_income NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  net_cashflow NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_fds_date ON financial_daily_snapshots(snapshot_date);

ALTER TABLE financial_daily_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON financial_daily_snapshots FOR ALL USING (auth.role() = 'service_role');
