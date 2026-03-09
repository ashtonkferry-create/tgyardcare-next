-- ============================================================================
-- Migration 062: Institutional Outreach RPCs + Workflow Registry
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Depends on: 061_institutional_outreach (tables)
-- Date: 2026-02-26
-- ============================================================================

-- ============================================================================
-- 1. RPC: get_institutional_pipeline_summary()
-- Called by WF 126 (Weekly Owner Report) and WF 147 (Daily KPI Digest)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institutional_pipeline_summary()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_orgs', (SELECT COUNT(*) FROM institutional_orgs),
    'by_stage', (
      SELECT jsonb_object_agg(stage, cnt) FROM (
        SELECT pipeline_stage AS stage, COUNT(*) AS cnt
        FROM institutional_orgs
        GROUP BY pipeline_stage
      ) s
    ),
    'by_sector', (
      SELECT jsonb_object_agg(sec, cnt) FROM (
        SELECT sector AS sec, COUNT(*) AS cnt
        FROM institutional_orgs
        GROUP BY sector
      ) s
    ),
    'total_pipeline_value', COALESCE((SELECT SUM(estimated_annual_value) FROM institutional_orgs), 0),
    'active_vendor_value', COALESCE((SELECT SUM(estimated_annual_value) FROM institutional_orgs WHERE pipeline_stage = 'active_vendor'), 0),
    'approved_applications', (SELECT COUNT(*) FROM vendor_list_applications WHERE decision = 'approved'),
    'pending_applications', (SELECT COUNT(*) FROM vendor_list_applications WHERE decision = 'pending' AND submitted_at IS NOT NULL),
    'open_rfps', (SELECT COUNT(*) FROM rfp_opportunities WHERE bid_status IN ('identified','reviewing','preparing_bid') AND submission_deadline >= CURRENT_DATE),
    'renewals_due_30d', (SELECT COUNT(*) FROM vendor_list_applications WHERE decision = 'approved' AND contract_expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30),
    'outreach_this_week', (SELECT COUNT(*) FROM institutional_outreach_log WHERE sent_at >= NOW() - INTERVAL '7 days'),
    'contacts_with_email', (SELECT COUNT(*) FROM institutional_contacts WHERE email IS NOT NULL AND do_not_contact = FALSE),
    'contacts_replied', (SELECT COUNT(*) FROM institutional_contacts WHERE outreach_status = 'replied')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 2. RPC: advance_institutional_pipeline_stage()
-- Used by WF 173 (Relationship Tracker) to promote orgs through stages
-- ============================================================================
CREATE OR REPLACE FUNCTION advance_institutional_pipeline_stage(
  p_org_id UUID,
  p_new_stage TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE institutional_orgs
  SET
    pipeline_stage = p_new_stage,
    notes = CASE
      WHEN p_notes IS NOT NULL THEN COALESCE(notes, '') || E'\n[' || NOW()::DATE || '] Stage -> ' || p_new_stage || ': ' || p_notes
      ELSE notes
    END,
    first_contacted_at = CASE
      WHEN p_new_stage = 'first_contact' AND first_contacted_at IS NULL THEN NOW()
      ELSE first_contacted_at
    END,
    updated_at = NOW()
  WHERE id = p_org_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 3. RPC: check_vendor_list_renewals()
-- Called by WF 175 daily to find upcoming expirations
-- ============================================================================
CREATE OR REPLACE FUNCTION check_vendor_list_renewals()
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_type TEXT,
  list_name TEXT,
  days_until_expiry INTEGER,
  procurement_contact_email TEXT,
  revenue_from_list NUMERIC,
  vendor_number TEXT,
  application_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.org_name,
    o.org_type,
    v.list_name,
    (v.contract_expiry_date - CURRENT_DATE)::INTEGER,
    o.procurement_contact_email,
    v.revenue_from_list,
    v.vendor_number,
    v.id
  FROM institutional_orgs o
  JOIN vendor_list_applications v ON v.org_id = o.id
  WHERE v.decision = 'approved'
    AND v.contract_expiry_date IS NOT NULL
    AND v.contract_expiry_date >= CURRENT_DATE
    AND v.contract_expiry_date <= CURRENT_DATE + INTERVAL '90 days'
  ORDER BY v.contract_expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 4. RPC: log_institutional_outreach()
-- Called by WF 172 to log each outreach and update counters
-- ============================================================================
CREATE OR REPLACE FUNCTION log_institutional_outreach(
  p_org_id UUID,
  p_contact_id UUID,
  p_channel TEXT,
  p_subject TEXT,
  p_message_preview TEXT,
  p_template_name TEXT,
  p_sequence_step INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Insert outreach log
  INSERT INTO institutional_outreach_log (org_id, contact_id, channel, subject, message_preview, template_name, sequence_step)
  VALUES (p_org_id, p_contact_id, p_channel, p_subject, p_message_preview, p_template_name, p_sequence_step)
  RETURNING id INTO log_id;

  -- Update org counters
  UPDATE institutional_orgs SET
    total_contacts_sent = total_contacts_sent + 1,
    last_contacted_at = NOW()
  WHERE id = p_org_id;

  -- Update contact status
  IF p_contact_id IS NOT NULL THEN
    UPDATE institutional_contacts SET
      outreach_status = CASE WHEN outreach_status = 'new' OR outreach_status = 'enriched' THEN 'contacted' ELSE outreach_status END,
      last_contacted_at = NOW(),
      current_sequence_step = COALESCE(p_sequence_step, current_sequence_step + 1)
    WHERE id = p_contact_id;
  END IF;

  -- Auto-advance pipeline stage on first contact
  IF (SELECT pipeline_stage FROM institutional_orgs WHERE id = p_org_id) IN ('discovery', 'research') THEN
    UPDATE institutional_orgs SET pipeline_stage = 'first_contact', first_contacted_at = NOW() WHERE id = p_org_id;
  END IF;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 5. RPC: get_institutional_followup_due()
-- Called by WF 172 to get contacts ready for outreach
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institutional_followup_due(p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_type TEXT,
  sector TEXT,
  priority TEXT,
  pipeline_stage TEXT,
  next_followup_at TIMESTAMPTZ,
  total_contacts_sent INTEGER,
  estimated_annual_value NUMERIC,
  services_needed TEXT[],
  contact_id UUID,
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_email TEXT,
  contact_title TEXT,
  contact_role TEXT,
  current_sequence_step INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.org_name,
    o.org_type,
    o.sector,
    o.priority,
    o.pipeline_stage,
    o.next_followup_at,
    o.total_contacts_sent,
    o.estimated_annual_value,
    o.services_needed,
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.title,
    c.contact_role,
    c.current_sequence_step
  FROM institutional_orgs o
  LEFT JOIN institutional_contacts c ON c.org_id = o.id
    AND c.is_primary_contact = TRUE
    AND c.do_not_contact = FALSE
    AND c.email IS NOT NULL
  WHERE o.next_followup_at <= NOW()
    AND o.pipeline_stage NOT IN ('active_vendor', 'lost', 'on_hold')
    AND c.id IS NOT NULL
  ORDER BY
    CASE o.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END,
    o.next_followup_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 6. Workflow Registry Entries (169-175)
-- ============================================================================
INSERT INTO workflow_registry (workflow_number, name, description, category, trigger_type, schedule, env_vars_required, credentials_required, supabase_tables)
VALUES
  (169, 'Institutional Prospect Scraper', 'Weekly Apollo.io scrape for procurement/facilities contacts at gov, edu, healthcare orgs in Dane County', 'institutional', 'cron', '0 6 * * 2',
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,APOLLO_API_KEY}', '{}',
    '{institutional_orgs,institutional_contacts}'),
  (170, 'RFP Monitor & Classifier', 'Daily scrape of WI VendorNet, DemandStar, and municipal portals for lawn care bids. Claude classifies relevance.', 'institutional', 'cron', '0 6 * * *',
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,ANTHROPIC_API_KEY}', '{}',
    '{rfp_opportunities,institutional_orgs}'),
  (171, 'Institutional Contact Enricher', 'Enriches institutional contacts via Apollo people-match API', 'institutional', 'cron', '0 7 * * *',
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,APOLLO_API_KEY}', '{}',
    '{institutional_contacts,institutional_orgs}'),
  (172, 'Institutional Outreach Sender', 'Sends sector-specific email sequences to procurement contacts with cadence guardrails', 'institutional', 'cron', '0 9,13 * * 2-4',
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,BREVO_API_KEY}', '{SMTP_BREVO}',
    '{institutional_orgs,institutional_contacts,institutional_outreach_log}'),
  (173, 'Institutional Relationship Tracker', 'Sub-workflow: processes replies, advances pipeline, schedules follow-ups', 'institutional', 'sub_workflow', NULL,
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,ANTHROPIC_API_KEY}', '{}',
    '{institutional_orgs,institutional_contacts,institutional_outreach_log}'),
  (174, 'Vendor Application Tracker', 'Weekly digest of vendor list applications, deadlines, renewals, and RFP opportunities', 'institutional', 'cron', '0 8 * * 1',
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,BREVO_API_KEY}', '{TG_TWILIO}',
    '{vendor_list_applications,institutional_orgs,rfp_opportunities}'),
  (175, 'Vendor List Renewal Engine', 'Sends renewal reminders at 90/60/30/14-day intervals, escalates to SMS', 'institutional', 'cron', '0 8 * * *',
    '{SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,BREVO_API_KEY}', '{TG_TWILIO}',
    '{vendor_list_applications,institutional_orgs}')
ON CONFLICT (workflow_number) DO NOTHING;
