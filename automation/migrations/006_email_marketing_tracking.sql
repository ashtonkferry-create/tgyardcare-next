-- Migration 006: Email Marketing Tracking Tables
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Supports n8n automation sequences with send tracking, goal completion, and cooldowns

-- ============================================================
-- Table: email_sends
-- Tracks every automated email sent to prevent duplicates
-- and measure sequence performance
-- ============================================================
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  brevo_message_id TEXT,

  -- Metadata
  sequence_step INTEGER,           -- Which step in the sequence (1, 2, 3, etc.)
  template_id INTEGER,             -- Brevo template ID used
  campaign_id INTEGER,             -- If sent via campaign

  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_sends
CREATE INDEX IF NOT EXISTS idx_email_sends_contact ON email_sends (contact_email);
CREATE INDEX IF NOT EXISTS idx_email_sends_workflow ON email_sends (workflow_name);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_workflow_email ON email_sends (workflow_name, contact_email);

-- ============================================================
-- Table: sequence_goals
-- Tracks when a contact achieves a sequence's goal (booking, review, etc.)
-- Used to stop sequences when goal is achieved
-- ============================================================
CREATE TABLE IF NOT EXISTS sequence_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email TEXT NOT NULL,
  sequence_name TEXT NOT NULL,
  goal_achieved TEXT NOT NULL,     -- e.g., 'booked_service', 'left_review', 'upgraded_plan'
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  metadata JSONB,                  -- Additional details about the goal achievement

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sequence_goals
CREATE INDEX IF NOT EXISTS idx_sequence_goals_contact ON sequence_goals (contact_email);
CREATE INDEX IF NOT EXISTS idx_sequence_goals_sequence ON sequence_goals (sequence_name);
CREATE INDEX IF NOT EXISTS idx_sequence_goals_contact_sequence ON sequence_goals (contact_email, sequence_name);

-- ============================================================
-- Table: weather_alerts_sent
-- Tracks weather alert cooldowns to prevent over-sending
-- ============================================================
CREATE TABLE IF NOT EXISTS weather_alerts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,        -- 'first_snow', 'major_storm', 'spring_thaw', 'mowing_season_start', etc.
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  list_id INTEGER,                 -- Brevo list targeted
  contact_count INTEGER,           -- Number of contacts notified
  weather_data JSONB,              -- Weather API response that triggered the alert

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for weather_alerts_sent
CREATE INDEX IF NOT EXISTS idx_weather_alerts_type ON weather_alerts_sent (alert_type);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_sent_at ON weather_alerts_sent (sent_at DESC);

-- ============================================================
-- Table: sequence_enrollments
-- Tracks which contacts are enrolled in which sequences
-- Allows pausing/resuming and prevents duplicate enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email TEXT NOT NULL,
  sequence_name TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),

  -- Progress tracking
  current_step INTEGER DEFAULT 0,
  next_send_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active',    -- 'active', 'paused', 'completed', 'goal_achieved', 'unsubscribed'
  completed_at TIMESTAMPTZ,

  -- Unique constraint: one enrollment per contact per sequence
  UNIQUE (contact_email, sequence_name)
);

-- Indexes for sequence_enrollments
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_contact ON sequence_enrollments (contact_email);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_sequence ON sequence_enrollments (sequence_name);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_status ON sequence_enrollments (status);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_next_send ON sequence_enrollments (next_send_at) WHERE status = 'active';

-- ============================================================
-- View: active_sequences
-- Quick view of all active sequence enrollments
-- ============================================================
CREATE OR REPLACE VIEW active_sequences AS
SELECT
  se.contact_email,
  se.sequence_name,
  se.current_step,
  se.next_send_at,
  se.enrolled_at,
  COUNT(es.id) AS emails_sent,
  MAX(es.sent_at) AS last_email_sent
FROM sequence_enrollments se
LEFT JOIN email_sends es ON es.contact_email = se.contact_email
  AND es.workflow_name = se.sequence_name
WHERE se.status = 'active'
GROUP BY se.contact_email, se.sequence_name, se.current_step, se.next_send_at, se.enrolled_at;

-- ============================================================
-- Function: check_recent_weather_alert
-- Returns TRUE if a weather alert of given type was sent within cooldown_hours
-- ============================================================
CREATE OR REPLACE FUNCTION check_recent_weather_alert(
  p_alert_type TEXT,
  p_cooldown_hours INTEGER DEFAULT 24
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM weather_alerts_sent
    WHERE alert_type = p_alert_type
    AND sent_at > NOW() - (p_cooldown_hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Function: can_send_to_contact
-- Checks if a contact can receive an email (not sent same workflow email in last N days)
-- ============================================================
CREATE OR REPLACE FUNCTION can_send_to_contact(
  p_contact_email TEXT,
  p_workflow_name TEXT,
  p_email_type TEXT,
  p_cooldown_days INTEGER DEFAULT 7
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM email_sends
    WHERE contact_email = p_contact_email
    AND workflow_name = p_workflow_name
    AND email_type = p_email_type
    AND sent_at > NOW() - (p_cooldown_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;
