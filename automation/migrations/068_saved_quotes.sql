-- Migration 068: Saved Quotes + Estimated Hours
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Adds saved_quotes table for quote pipeline tracking and
-- estimated_hours column to pricing_services for labor cost calculation.

-- ============================================================
-- 1. Add estimated_hours to pricing_services
-- ============================================================
ALTER TABLE pricing_services ADD COLUMN IF NOT EXISTS estimated_hours JSONB DEFAULT '{}';

-- Seed estimated_hours for TotalGuard services
UPDATE pricing_services SET estimated_hours = '{"small": 0.75, "medium": 1.0, "large": 1.5, "xl": 2.0}'::jsonb WHERE slug = 'lawn-mowing';
UPDATE pricing_services SET estimated_hours = '{"small": 0.5, "medium": 0.75, "large": 1.0, "xl": 1.25}'::jsonb WHERE slug = 'fertilization';
UPDATE pricing_services SET estimated_hours = '{"small": 1.0, "medium": 1.5, "large": 2.0, "xl": 2.5}'::jsonb WHERE slug = 'aeration';
UPDATE pricing_services SET estimated_hours = '{"small": 0.5, "medium": 0.75, "large": 1.0, "xl": 1.25}'::jsonb WHERE slug = 'herbicide-services';
UPDATE pricing_services SET estimated_hours = '{"small": 1.0, "medium": 1.5, "large": 2.0, "xl": 2.5}'::jsonb WHERE slug = 'weeding';
UPDATE pricing_services SET estimated_hours = '{"small": 1.5, "medium": 2.5, "large": 3.5, "xl": 4.5}'::jsonb WHERE slug = 'mulching';
UPDATE pricing_services SET estimated_hours = '{"small": 1.0, "medium": 1.5, "large": 2.0, "xl": 2.5}'::jsonb WHERE slug = 'garden-bed-care';
UPDATE pricing_services SET estimated_hours = '{"small": 1.0, "medium": 1.5, "large": 2.0, "xl": 2.5}'::jsonb WHERE slug = 'bush-trimming';
UPDATE pricing_services SET estimated_hours = '{"small": 1.5, "medium": 2.0, "large": 3.0, "xl": 4.0}'::jsonb WHERE slug = 'spring-cleanup';
UPDATE pricing_services SET estimated_hours = '{"small": 1.5, "medium": 2.0, "large": 3.0, "xl": 4.0}'::jsonb WHERE slug = 'fall-cleanup';
UPDATE pricing_services SET estimated_hours = '{"small": 0.75, "medium": 1.0, "large": 1.5, "xl": 2.0}'::jsonb WHERE slug = 'leaf-removal';
UPDATE pricing_services SET estimated_hours = '{"small": 1.0, "medium": 1.5, "large": 2.0, "xl": 2.5}'::jsonb WHERE slug = 'gutter-cleaning';
UPDATE pricing_services SET estimated_hours = '{"small": 0.5, "medium": 0.75, "large": 1.0, "xl": 1.25}'::jsonb WHERE slug = 'snow-removal';

-- ============================================================
-- 2. Create saved_quotes table
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Quote data: full breakdown (services, tiers, sizes, multipliers, prices, bundle discount)
  quote_data JSONB NOT NULL,

  -- Optional customer info
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,

  -- Optional link to existing lead
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Pipeline tracking
  pipeline_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (pipeline_status IN ('draft', 'sent', 'accepted', 'completed', 'cancelled')),

  -- Jobber integration IDs (CRM for TotalGuard)
  jobber_estimate_id TEXT,
  jobber_invoice_id TEXT,
  jobber_job_id TEXT,

  -- Metadata
  notes TEXT,
  total_amount NUMERIC(10,2),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_quotes_pipeline_status ON saved_quotes(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_created_at ON saved_quotes(created_at DESC);

-- ============================================================
-- 3. Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_saved_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_saved_quotes_updated_at
  BEFORE UPDATE ON saved_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_quotes_updated_at();

-- ============================================================
-- 4. RLS Policies
-- ============================================================
ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;

-- Permissive read/write for anon (no auth in this phase -- tech debt)
CREATE POLICY saved_quotes_anon_read ON saved_quotes FOR SELECT USING (true);
CREATE POLICY saved_quotes_anon_insert ON saved_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY saved_quotes_anon_update ON saved_quotes FOR UPDATE USING (true);
CREATE POLICY saved_quotes_anon_delete ON saved_quotes FOR DELETE USING (true);
