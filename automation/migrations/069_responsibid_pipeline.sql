-- Migration 069: ResponsiBid Pipeline Support
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Extends the leads table to support ResponsiBid as a lead source,
-- adds quote metadata storage, and follow-up tracking columns.

-- ============================================
-- 1. Update source CHECK constraint
-- ============================================
-- Drop existing constraint and recreate with new values
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;

ALTER TABLE leads ADD CONSTRAINT leads_source_check
  CHECK (source IN (
    'website', 'lsa', 'phone', 'facebook', 'social',
    'print', 'referral', 'other', 'responsibid', 'ai-voice', 'admin'
  ));

-- ============================================
-- 2. Add quote_metadata JSONB column
-- ============================================
-- Stores quote history: { quotes: [{ service_slug, tier, size_key, quoted_price, multipliers, responsibid_bid_id, timestamp }] }
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_metadata JSONB DEFAULT '{}';

-- ============================================
-- 3. Add quote follow-up tracking columns
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_followup_status TEXT DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_followup_enrolled_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_email_1_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_email_2_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_email_3_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_email_4_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_email_5_sent_at TIMESTAMPTZ;

-- ============================================
-- 4. Create index for follow-up queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_quote_followup
  ON leads(quote_followup_status)
  WHERE quote_followup_status IS NOT NULL;

-- ============================================
-- 5. Add comment for documentation
-- ============================================
COMMENT ON COLUMN leads.quote_metadata IS 'JSONB storing quote history from ResponsiBid and admin quote builder. Structure: { quotes: [{ service_slug, tier, size_key, quoted_price, multipliers, responsibid_bid_id, timestamp }] }';
COMMENT ON COLUMN leads.quote_followup_status IS 'Follow-up email sequence status: enrolled, in_progress, completed, unsubscribed';
