-- Migration 007: Add auto-response tracking columns to leads table
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Enables sub-2-minute SLA monitoring and prevents duplicate auto-responses

-- Add auto_response_sent_at column (timestamp when first auto-response was sent)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS auto_response_sent_at TIMESTAMPTZ;

-- Add auto_response_email_sent column (whether auto-response email was sent)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS auto_response_email_sent BOOLEAN DEFAULT FALSE;

-- Add auto_response_sms_sent column (whether auto-response SMS was sent)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS auto_response_sms_sent BOOLEAN DEFAULT FALSE;

-- Add auto_response_email_message_id column (Brevo messageId for delivery tracking)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS auto_response_email_message_id TEXT;

-- Add index on auto_response_sent_at for efficient SLA monitoring queries
CREATE INDEX IF NOT EXISTS idx_leads_auto_response_sent_at ON leads (auto_response_sent_at);
