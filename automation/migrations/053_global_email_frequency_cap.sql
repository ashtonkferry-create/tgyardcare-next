-- Migration 053: Global Email Frequency Cap
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Prevent over-emailing by enforcing a max 2 emails per 7-day
--          rolling window per contact across ALL sources (campaigns,
--          automations, weather triggers).
-- Exception: Snow alerts (first_snow, major_storm) and severe_weather
--            ALWAYS bypass the cap — safety-critical weather notifications.

-- ============================================================================
-- 1. FUNCTION: check_global_frequency(contact_email, bypass_type)
--    Returns TRUE if the contact CAN receive another email.
--    Returns FALSE if they've hit the 7-day cap (2 emails).
-- ============================================================================
CREATE OR REPLACE FUNCTION check_global_frequency(
  p_contact_email TEXT,
  p_source_type   TEXT DEFAULT NULL   -- optional: 'first_snow', 'major_storm', 'severe_weather', etc.
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_recent_count INTEGER;
  v_max_per_week INTEGER := 2;
  v_bypass_types TEXT[] := ARRAY['first_snow', 'major_storm', 'severe_weather', 'snow_alert'];
BEGIN
  -- Critical weather alerts ALWAYS go through
  IF p_source_type IS NOT NULL AND p_source_type = ANY(v_bypass_types) THEN
    RETURN TRUE;
  END IF;

  -- Count emails sent to this contact in the last 7 days
  SELECT COUNT(*)
    INTO v_recent_count
    FROM email_sends
   WHERE contact_email = p_contact_email
     AND sent_at > NOW() - INTERVAL '7 days';

  RETURN v_recent_count < v_max_per_week;
END;
$$;

-- ============================================================================
-- 2. FUNCTION: log_email_send(...)
--    Convenience wrapper — checks frequency then logs if allowed.
--    Returns the new email_sends.id if sent, NULL if blocked.
-- ============================================================================
CREATE OR REPLACE FUNCTION log_email_send(
  p_contact_email  TEXT,
  p_workflow_name  TEXT,
  p_email_type     TEXT,
  p_template_id    INTEGER DEFAULT NULL,
  p_campaign_id    INTEGER DEFAULT NULL,
  p_source_type    TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_send_id UUID;
BEGIN
  -- Check global frequency (bypasses for critical weather)
  IF NOT check_global_frequency(p_contact_email, p_source_type) THEN
    RETURN NULL;  -- blocked by frequency cap
  END IF;

  -- Also check per-workflow cooldown (same email type, same workflow, 7 days)
  IF NOT can_send_to_contact(p_contact_email, p_workflow_name, p_email_type, 7) THEN
    RETURN NULL;  -- blocked by per-workflow cooldown
  END IF;

  -- Insert the send record
  INSERT INTO email_sends (contact_email, workflow_name, email_type, template_id, campaign_id)
  VALUES (p_contact_email, p_workflow_name, p_email_type, p_template_id, p_campaign_id)
  RETURNING id INTO v_send_id;

  RETURN v_send_id;
END;
$$;

-- ============================================================================
-- 3. VIEW: contact_email_frequency
--    Dashboard view — shows each contact's send count over rolling 7 days.
-- ============================================================================
CREATE OR REPLACE VIEW contact_email_frequency AS
SELECT
  contact_email,
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '7 days')  AS emails_last_7_days,
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '30 days') AS emails_last_30_days,
  MAX(sent_at) AS last_email_sent,
  CASE
    WHEN COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '7 days') >= 2
    THEN FALSE
    ELSE TRUE
  END AS can_receive_email
FROM email_sends
GROUP BY contact_email;

-- ============================================================================
-- 4. INDEX: speed up the 7-day lookback query
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_email_sends_contact_sent
  ON email_sends (contact_email, sent_at DESC);

-- ============================================================================
-- 5. COMMENT on the bypass rule for future maintainers
-- ============================================================================
COMMENT ON FUNCTION check_global_frequency IS
  'Global email frequency cap: max 2 emails per 7-day rolling window per contact. '
  'Snow alerts (first_snow, major_storm, snow_alert) and severe_weather bypass the cap — '
  'these are safety-critical weather notifications that must always be delivered to TotalGuard customers.';
