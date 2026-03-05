-- Jobber Integration Tables
-- Stores OAuth tokens and webhook events

-- 1. Jobber OAuth tokens
CREATE TABLE IF NOT EXISTS jobber_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  scopes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Only one row ever — singleton token store
CREATE UNIQUE INDEX IF NOT EXISTS jobber_tokens_singleton ON jobber_tokens ((true));

-- 2. Jobber webhook events log
CREATE TABLE IF NOT EXISTS jobber_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobber_events_type ON jobber_events (event_type);
CREATE INDEX IF NOT EXISTS idx_jobber_events_processed ON jobber_events (processed);

-- 3. RLS policies
ALTER TABLE jobber_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobber_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access jobber_tokens" ON jobber_tokens FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin read jobber_tokens" ON jobber_tokens FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role full access jobber_events" ON jobber_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin read jobber_events" ON jobber_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
