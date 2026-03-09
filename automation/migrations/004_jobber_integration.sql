-- Migration: 004_jobber_integration.sql
-- Description: Add Jobber sync infrastructure columns, lead scoring columns, and indexes
--              to support central Jobber sync workflow.
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Date: 2026-02-04

-- ============================================
-- 1. Add lead scoring columns (IF NOT EXISTS)
-- ============================================

-- lead_score: numeric score computed by source workflows (0-100)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

-- lead_tier: tier derived from lead_score (cold, standard, warm, hot)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_tier TEXT DEFAULT 'cold';

-- ============================================
-- 2. Add Jobber sync columns
-- ============================================

-- jobber_customer_id: stores the Jobber customer ID after successful sync
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jobber_customer_id TEXT;

-- jobber_sync_status: tracks sync lifecycle (pending -> synced | rejected | failed | skipped)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jobber_sync_status TEXT DEFAULT 'pending';

-- jobber_sync_failures: retry counter, incremented on each failed sync attempt
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jobber_sync_failures INTEGER DEFAULT 0;

-- jobber_sync_notes: human-readable sync notes (spam reasons, error messages, etc.)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jobber_sync_notes TEXT;

-- jobber_synced_at: timestamp of when the lead was last synced to Jobber
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jobber_synced_at TIMESTAMPTZ;

-- ============================================
-- 3. Add CHECK constraint for jobber_sync_status
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'leads' AND constraint_name = 'leads_jobber_sync_status_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_jobber_sync_status_check
      CHECK (jobber_sync_status IN ('pending', 'synced', 'rejected', 'failed', 'skipped'));
  END IF;
END $$;

-- ============================================
-- 4. Add CHECK constraint for lead_tier
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'leads' AND constraint_name = 'leads_lead_tier_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_lead_tier_check
      CHECK (lead_tier IN ('cold', 'standard', 'warm', 'hot'));
  END IF;
END $$;

-- ============================================
-- 5. Add indexes for sync workflow queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_jobber_sync_status ON leads(jobber_sync_status);
CREATE INDEX IF NOT EXISTS idx_leads_jobber_customer_id ON leads(jobber_customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);

-- Composite partial index for the central sync query
CREATE INDEX IF NOT EXISTS idx_leads_sync_pending
  ON leads(jobber_sync_status, lead_score)
  WHERE jobber_sync_status = 'pending' AND lead_score >= 50;

-- ============================================
-- 6. Comments
-- ============================================

COMMENT ON COLUMN leads.lead_score IS 'Numeric lead quality score (0-100), calculated by source workflow scoring formula';
COMMENT ON COLUMN leads.lead_tier IS 'Lead quality tier derived from score: cold (<30), standard (30-49), warm (50-69), hot (70+)';
COMMENT ON COLUMN leads.jobber_customer_id IS 'Jobber customer ID, set after successful sync';
COMMENT ON COLUMN leads.jobber_sync_status IS 'Jobber sync lifecycle: pending (ready to sync), synced (done), rejected (spam), failed (3+ errors), skipped (score < 50)';
COMMENT ON COLUMN leads.jobber_sync_failures IS 'Number of failed sync attempts. After 3 failures, status moves to failed.';
COMMENT ON COLUMN leads.jobber_sync_notes IS 'Human-readable sync notes: spam reasons, error messages, dedup match info';
COMMENT ON COLUMN leads.jobber_synced_at IS 'Timestamp of last successful sync to Jobber';
