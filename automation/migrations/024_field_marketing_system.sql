-- Migration 024: Field Marketing System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks yard signs, door hangers, compliance, and execution scores

CREATE TABLE IF NOT EXISTS territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,  -- e.g., 'MAD-CORE', 'MID-WEST', 'MIDDLETON'
  description TEXT,
  center_lat NUMERIC(10,7),
  center_lng NUMERIC(10,7),
  radius_miles NUMERIC(5,2) DEFAULT 3.0,
  zip_codes TEXT[],
  neighborhoods TEXT[],
  target_jobs_per_month INTEGER DEFAULT 20,
  target_signs_per_month INTEGER DEFAULT 15,
  target_hangers_per_month INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_territories_code ON territories(code);
CREATE INDEX IF NOT EXISTS idx_territories_active ON territories(is_active);
CREATE INDEX IF NOT EXISTS idx_territories_priority ON territories(priority);

CREATE TABLE IF NOT EXISTS yard_sign_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sign_code TEXT UNIQUE NOT NULL,
  sign_type TEXT DEFAULT 'standard',  -- 'standard' | 'premium' | 'seasonal'
  status TEXT DEFAULT 'available',    -- 'available' | 'deployed' | 'damaged' | 'lost' | 'retired'
  current_deployment_id UUID,
  condition TEXT DEFAULT 'good',
  has_stake BOOLEAN DEFAULT TRUE,
  purchase_cost NUMERIC(6,2),
  purchase_date DATE,
  total_deployments INTEGER DEFAULT 0,
  total_days_deployed INTEGER DEFAULT 0,
  leads_attributed INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sign_inventory_status ON yard_sign_inventory(status);
CREATE INDEX IF NOT EXISTS idx_sign_inventory_code ON yard_sign_inventory(sign_code);
CREATE INDEX IF NOT EXISTS idx_sign_inventory_type ON yard_sign_inventory(sign_type);

CREATE TABLE IF NOT EXISTS yard_sign_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  job_completed_at TIMESTAMPTZ,
  customer_name TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_zip TEXT,
  service_type TEXT,
  job_total NUMERIC(10,2),
  sign_inventory_id UUID REFERENCES yard_sign_inventory(id),
  sign_code TEXT,
  deployed_lat NUMERIC(10,7) NOT NULL,
  deployed_lng NUMERIC(10,7) NOT NULL,
  deployed_address TEXT,
  territory_id UUID REFERENCES territories(id),
  deployed_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_by TEXT,
  deployment_photo_url TEXT,
  placement_notes TEXT,
  target_collection_date DATE,
  target_duration_days INTEGER DEFAULT 7,
  collected_at TIMESTAMPTZ,
  collected_by TEXT,
  collection_photo_url TEXT,
  collection_status TEXT,
  collection_notes TEXT,
  leads_attributed INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sign_deployments_job ON yard_sign_deployments(job_id);
CREATE INDEX IF NOT EXISTS idx_sign_deployments_city ON yard_sign_deployments(customer_city);
CREATE INDEX IF NOT EXISTS idx_sign_deployments_deployed ON yard_sign_deployments(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sign_deployments_territory ON yard_sign_deployments(territory_id);

CREATE TABLE IF NOT EXISTS door_hanger_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  territory_id UUID REFERENCES territories(id),
  target_area TEXT,
  target_neighborhoods TEXT[],
  target_zip_codes TEXT[],
  hanger_count INTEGER,
  hangers_distributed INTEGER DEFAULT 0,
  campaign_date DATE,
  distributed_by TEXT,
  distribution_method TEXT DEFAULT 'walking',  -- 'walking' | 'driving' | 'contractor'
  design_version TEXT,
  offer_type TEXT,
  offer_details TEXT,
  promo_code TEXT,
  photos_url TEXT[],
  leads_attributed INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(10,2) DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'planned',  -- 'planned' | 'in_progress' | 'completed' | 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hanger_campaigns_date ON door_hanger_campaigns(campaign_date DESC);
CREATE INDEX IF NOT EXISTS idx_hanger_campaigns_territory ON door_hanger_campaigns(territory_id);
CREATE INDEX IF NOT EXISTS idx_hanger_campaigns_status ON door_hanger_campaigns(status);

CREATE TABLE IF NOT EXISTS field_marketing_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_date DATE DEFAULT CURRENT_DATE,
  job_id TEXT NOT NULL,
  service_type TEXT,
  customer_city TEXT,
  sign_deployed BOOLEAN DEFAULT FALSE,
  sign_deployment_id UUID REFERENCES yard_sign_deployments(id),
  sign_deployed_at TIMESTAMPTZ,
  compliance_score INTEGER DEFAULT 0,
  missing_reason TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_date ON field_marketing_compliance(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_job ON field_marketing_compliance(job_id);
CREATE INDEX IF NOT EXISTS idx_compliance_score ON field_marketing_compliance(compliance_score);

-- View: field_marketing_dashboard
CREATE OR REPLACE VIEW field_marketing_dashboard AS
SELECT
  -- Signs
  (SELECT COUNT(*) FROM yard_sign_inventory WHERE status = 'available') AS signs_available,
  (SELECT COUNT(*) FROM yard_sign_inventory WHERE status = 'deployed') AS signs_deployed,
  (SELECT COUNT(*) FROM yard_sign_deployments WHERE deployed_at >= CURRENT_DATE - INTERVAL '30 days') AS signs_placed_30d,
  (SELECT COUNT(*) FROM yard_sign_deployments WHERE collected_at IS NULL AND target_collection_date < CURRENT_DATE) AS signs_overdue_collection,
  -- Door hangers
  (SELECT COALESCE(SUM(hangers_distributed), 0) FROM door_hanger_campaigns WHERE campaign_date >= CURRENT_DATE - INTERVAL '30 days') AS hangers_distributed_30d,
  -- Compliance
  (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE sign_deployed = true) / NULLIF(COUNT(*), 0), 1)
   FROM field_marketing_compliance WHERE check_date >= CURRENT_DATE - INTERVAL '30 days') AS sign_compliance_rate_30d;

-- Seed: TotalGuard service territories
INSERT INTO territories (name, code, description, zip_codes, priority) VALUES
  ('Madison Core', 'MAD-CORE', 'Primary Madison service area', ARRAY['53703','53704','53705','53711','53714','53715','53716'], 1),
  ('Middleton', 'MIDDLETON', 'Middleton service area', ARRAY['53562'], 1),
  ('Waunakee', 'WAUNAKEE', 'Waunakee service area', ARRAY['53597'], 2),
  ('Monona', 'MONONA', 'Monona service area', ARRAY['53716'], 2),
  ('Sun Prairie', 'SUN-PRAIRIE', 'Sun Prairie service area', ARRAY['53590'], 2),
  ('Fitchburg', 'FITCHBURG', 'Fitchburg service area', ARRAY['53711','53719'], 2),
  ('Verona', 'VERONA', 'Verona service area', ARRAY['53593'], 2),
  ('McFarland', 'MCFARLAND', 'McFarland service area', ARRAY['53558'], 3),
  ('Cottage Grove', 'COTTAGE-GROVE', 'Cottage Grove service area', ARRAY['53527'], 3),
  ('DeForest', 'DEFOREST', 'DeForest service area', ARRAY['53532'], 3),
  ('Oregon', 'OREGON', 'Oregon service area', ARRAY['53575'], 3),
  ('Stoughton', 'STOUGHTON', 'Stoughton service area', ARRAY['53589'], 3)
ON CONFLICT (code) DO NOTHING;

-- RLS
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE yard_sign_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE yard_sign_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE door_hanger_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_marketing_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY territories_service ON territories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY sign_inventory_service ON yard_sign_inventory FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY sign_deployments_service ON yard_sign_deployments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY hanger_campaigns_service ON door_hanger_campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY compliance_service ON field_marketing_compliance FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY territories_read ON territories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY sign_inventory_read ON yard_sign_inventory FOR SELECT USING (auth.role() = 'authenticated');
