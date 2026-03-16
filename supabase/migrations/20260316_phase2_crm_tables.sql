-- Phase 2 CRM Unification: Core tables for webhook routing, dispatch tracking, and SMS rate limiting
-- Depends on: sms_consent table from Phase 1 (migration 027_sms_consent_tracking.sql)
-- Used by: TG-92 (webhook router), TG-93 (auto-dispatch), TG-94 (unified SMS sender)

-- webhook_events: logs every inbound webhook for debugging and idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE,
  source TEXT NOT NULL,
  event_type TEXT,
  payload JSONB,
  routed_to TEXT,
  processing_status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at);

-- dispatch_log: tracks job dispatch notifications to owner
CREATE TABLE IF NOT EXISTS dispatch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jobber_event_id UUID,
  event_type TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  address TEXT,
  service_type TEXT,
  scheduled_time TEXT,
  maps_url TEXT,
  dispatch_sms_sent_at TIMESTAMPTZ,
  owner_response TEXT,
  owner_responded_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_log_status ON dispatch_log(status);
CREATE INDEX IF NOT EXISTS idx_dispatch_log_created ON dispatch_log(created_at);

-- sms_sends: tracks outbound SMS for rate limiting (max 3/day per phone)
-- NOTE: This table already existed from Phase 1 with richer schema
-- (message_body, from_phone, message_type, external_message_id, delivered_at, failed_at, failure_reason).
-- CREATE IF NOT EXISTS preserves the existing schema. The definition below is the
-- minimum schema; actual table has additional columns from prior migration.
CREATE TABLE IF NOT EXISTS sms_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone TEXT NOT NULL,
  message_body TEXT,
  workflow_name TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_sends_phone_date ON sms_sends(to_phone, sent_at);

-- RLS: service_role full access (same permissive pattern as Phase 1)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_all ON webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE dispatch_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_all ON dispatch_log FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE sms_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_all ON sms_sends FOR ALL TO service_role USING (true) WITH CHECK (true);
