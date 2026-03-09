-- Migration 008: Add follow-up sequence tracking columns to leads table
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Enables timed nurture sequences that stop when leads book

-- Add booking_detected_at column (timestamp when job.completed was received from Jobber)
-- NULL means lead hasn't booked yet; used to stop follow-up sequence
ALTER TABLE leads ADD COLUMN IF NOT EXISTS booking_detected_at TIMESTAMPTZ;

-- Add booking_jobber_job_id column (Jobber job ID for reference)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS booking_jobber_job_id TEXT;

-- Add followup_sequence_status column (status of the follow-up sequence)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_sequence_status TEXT DEFAULT 'enrolled';

-- Add CHECK constraint for valid followup_sequence_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_followup_sequence_status_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_followup_sequence_status_check
      CHECK (followup_sequence_status IN ('enrolled', 'paused', 'completed', 'goal_achieved'));
  END IF;
END $$;

-- Add followup_email_day1_sent_at column (when Day 1 follow-up email was sent)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_email_day1_sent_at TIMESTAMPTZ;

-- Add followup_sms_day3_sent_at column (when Day 3 follow-up SMS was sent)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_sms_day3_sent_at TIMESTAMPTZ;

-- Add followup_email_day7_sent_at column (when Day 7 final follow-up email was sent)
-- Day 7 email includes a discount offer code (FIRST15)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_email_day7_sent_at TIMESTAMPTZ;

-- Add composite index for follow-up status queries
CREATE INDEX IF NOT EXISTS idx_leads_followup_status
  ON leads (followup_sequence_status, booking_detected_at);

-- Add partial index for pending follow-up queries
CREATE INDEX IF NOT EXISTS idx_leads_followup_pending
  ON leads (created_at)
  WHERE booking_detected_at IS NULL AND followup_sequence_status = 'enrolled';

-- Add index on booking_detected_at for booking analysis queries
CREATE INDEX IF NOT EXISTS idx_leads_booking_detected_at
  ON leads (booking_detected_at)
  WHERE booking_detected_at IS NOT NULL;
