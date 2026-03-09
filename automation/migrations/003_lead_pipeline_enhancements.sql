-- Migration: 003_lead_pipeline_enhancements.sql
-- Description: Enhance leads table with raw_payload, phone call fields, Facebook lead ID,
--              source CHECK constraint, upsert function, and supporting indexes.
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Date: 2026-02-04

-- ============================================
-- 1. Add new columns to leads table
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'raw_payload'
  ) THEN
    ALTER TABLE leads ADD COLUMN raw_payload JSONB;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'phone_call_duration'
  ) THEN
    ALTER TABLE leads ADD COLUMN phone_call_duration INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'phone_call_recording_url'
  ) THEN
    ALTER TABLE leads ADD COLUMN phone_call_recording_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'facebook_lead_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN facebook_lead_id TEXT;
  END IF;
END $$;

-- ============================================
-- 2. Add source CHECK constraint
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'leads' AND constraint_name = 'leads_source_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_source_check
      CHECK (source IN ('website', 'lsa', 'phone', 'facebook', 'social', 'print', 'referral', 'other'));
  END IF;
END $$;

-- ============================================
-- 3. Create upsert_lead function for dedup
-- ============================================

CREATE OR REPLACE FUNCTION upsert_lead(
  p_email TEXT,
  p_phone TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_source TEXT,
  p_source_detail TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT 'WI',
  p_zip_code TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_services TEXT[] DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL,
  p_landing_page TEXT DEFAULT NULL,
  p_raw_payload JSONB DEFAULT NULL,
  p_external_id TEXT DEFAULT NULL,
  p_phone_call_duration INTEGER DEFAULT NULL,
  p_phone_call_recording_url TEXT DEFAULT NULL,
  p_facebook_lead_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_lead_id UUID;
BEGIN
  -- Check for existing lead by email or phone
  SELECT id INTO v_lead_id FROM leads
  WHERE (p_email IS NOT NULL AND email = p_email)
     OR (p_phone IS NOT NULL AND phone = p_phone)
  LIMIT 1;

  IF v_lead_id IS NOT NULL THEN
    -- Update existing lead with new source info
    UPDATE leads SET
      source_detail = COALESCE(p_source_detail, source_detail),
      raw_payload = COALESCE(p_raw_payload, raw_payload),
      phone_call_duration = COALESCE(p_phone_call_duration, phone_call_duration),
      phone_call_recording_url = COALESCE(p_phone_call_recording_url, phone_call_recording_url),
      facebook_lead_id = COALESCE(p_facebook_lead_id, facebook_lead_id),
      updated_at = NOW()
    WHERE id = v_lead_id;

    -- Log the additional contact as a timeline event
    INSERT INTO lead_timeline (lead_id, event_type, event_data, performed_by)
    VALUES (
      v_lead_id,
      'additional_contact',
      jsonb_build_object(
        'source', p_source,
        'source_detail', p_source_detail,
        'raw_payload', p_raw_payload
      ),
      'system'
    );
  ELSE
    -- Insert new lead
    INSERT INTO leads (
      email, phone, first_name, last_name, source, source_detail,
      address, city, state, zip_code, property_type, services, message,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      landing_page, raw_payload, external_id,
      phone_call_duration, phone_call_recording_url, facebook_lead_id
    ) VALUES (
      p_email, p_phone, p_first_name, p_last_name, p_source, p_source_detail,
      p_address, p_city, p_state, p_zip_code, p_property_type, p_services, p_message,
      p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content,
      p_landing_page, p_raw_payload, p_external_id,
      p_phone_call_duration, p_phone_call_recording_url, p_facebook_lead_id
    ) RETURNING id INTO v_lead_id;

    -- Log creation event
    INSERT INTO lead_timeline (lead_id, event_type, event_data, performed_by)
    VALUES (
      v_lead_id,
      'created',
      jsonb_build_object('source', p_source, 'source_detail', p_source_detail),
      'system'
    );
  END IF;

  RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Add index for facebook_lead_id lookups
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_facebook_lead_id ON leads(facebook_lead_id);

-- ============================================
-- Comments
-- ============================================
COMMENT ON COLUMN leads.raw_payload IS 'Original webhook/trigger payload stored for debugging and audit';
COMMENT ON COLUMN leads.phone_call_duration IS 'Call duration in seconds, populated by CallRail webhook';
COMMENT ON COLUMN leads.phone_call_recording_url IS 'URL to call recording, populated by CallRail webhook';
COMMENT ON COLUMN leads.facebook_lead_id IS 'Facebook Lead Ads lead ID for deduplication';
COMMENT ON FUNCTION upsert_lead IS 'Upsert a lead by matching on email or phone. Updates existing or creates new. Logs timeline events.';
