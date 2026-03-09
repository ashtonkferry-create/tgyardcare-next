-- Migration 005: Add Brevo nurture tracking columns to leads table
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Prepares DB for Brevo email nurture integration

-- Add brevo_contact_id column (stores Brevo's contact ID after creation)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS brevo_contact_id TEXT;

-- Add nurture_status column for tracking email nurture state
-- Valid values: NULL (not evaluated), 'enrolled', 'no_email', 'completed', 'skipped'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nurture_status TEXT DEFAULT NULL;

-- Add CHECK constraint for nurture_status values (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_nurture_status_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_nurture_status_check
      CHECK (nurture_status IS NULL OR nurture_status IN ('enrolled', 'no_email', 'completed', 'skipped'));
  END IF;
END $$;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_leads_nurture_status ON leads (nurture_status);
CREATE INDEX IF NOT EXISTS idx_leads_brevo_contact_id ON leads (brevo_contact_id);
