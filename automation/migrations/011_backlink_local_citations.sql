-- Migration 011: Local Citations & NAP Management
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tracks directory submissions, NAP consistency, and citation health

-- ============================================================
-- Table: nap_baseline
-- Single source of truth for business NAP (Name, Address, Phone)
-- ============================================================
CREATE TABLE IF NOT EXISTS nap_baseline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core NAP data
  business_name TEXT DEFAULT 'TotalGuard Yard Care',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT DEFAULT 'Madison',
  state TEXT DEFAULT 'WI',
  zip_code TEXT,

  -- Contact info
  phone TEXT NOT NULL,
  phone_alt TEXT,
  website TEXT DEFAULT 'https://tgyardcare.com',
  email TEXT DEFAULT 'totalguardllc@gmail.com',

  -- Additional business info
  hours_of_operation JSONB,             -- {"mon": "7am-7pm", ...}
  service_areas TEXT[],                  -- ['Madison', 'Middleton', 'Waunakee', ...]
  primary_categories TEXT[],             -- ['Lawn Mowing', 'Fertilization', 'Aeration', ...]

  -- Variations to watch for (common misspellings, old addresses)
  known_variations JSONB DEFAULT '[]',

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: local_citations
-- Track all directory/citation submissions and their status
-- ============================================================
CREATE TABLE IF NOT EXISTS local_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Directory info
  directory_name TEXT NOT NULL,
  directory_url TEXT NOT NULL,
  submission_url TEXT,
  priority_tier INTEGER DEFAULT 2,       -- 1=critical, 2=important, 3=nice-to-have
  domain_authority INTEGER,

  -- NAP data submitted (frozen at submission time)
  submitted_name TEXT,
  submitted_address TEXT,
  submitted_city TEXT,
  submitted_state TEXT,
  submitted_zip TEXT,
  submitted_phone TEXT,
  submitted_website TEXT,

  -- Submission tracking
  submission_status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,

  -- Account info
  account_email TEXT,
  login_notes TEXT,

  -- Citation health
  is_live BOOLEAN DEFAULT FALSE,
  nap_consistent BOOLEAN,
  has_backlink BOOLEAN DEFAULT FALSE,
  backlink_type TEXT,
  backlink_url TEXT,

  -- Audit tracking
  last_audit_at TIMESTAMPTZ,
  audit_issues TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(directory_name)
);

-- ============================================================
-- Table: citation_audits
-- ============================================================
CREATE TABLE IF NOT EXISTS citation_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citation_id UUID REFERENCES local_citations(id) ON DELETE CASCADE,
  audit_date DATE DEFAULT CURRENT_DATE,

  found_name TEXT,
  found_address TEXT,
  found_phone TEXT,
  found_website TEXT,

  name_matches BOOLEAN,
  address_matches BOOLEAN,
  phone_matches BOOLEAN,
  website_matches BOOLEAN,
  overall_consistent BOOLEAN,

  issues_found TEXT[],
  screenshot_url TEXT,

  audit_method TEXT DEFAULT 'automated',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: citation_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS citation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citation_id UUID REFERENCES local_citations(id) ON DELETE CASCADE,

  queued_for DATE,
  queue_position INTEGER,

  submission_data JSONB,
  submission_instructions TEXT,

  completed_at TIMESTAMPTZ,
  completed_by TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_citations_status ON local_citations(submission_status);
CREATE INDEX IF NOT EXISTS idx_citations_priority ON local_citations(priority_tier);
CREATE INDEX IF NOT EXISTS idx_citations_live ON local_citations(is_live);
CREATE INDEX IF NOT EXISTS idx_citations_audit_date ON local_citations(last_audit_at);

CREATE INDEX IF NOT EXISTS idx_audits_citation ON citation_audits(citation_id);
CREATE INDEX IF NOT EXISTS idx_audits_date ON citation_audits(audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_audits_consistent ON citation_audits(overall_consistent);

CREATE INDEX IF NOT EXISTS idx_queue_date ON citation_queue(queued_for);

-- ============================================================
-- View: citation_dashboard
-- ============================================================
CREATE OR REPLACE VIEW citation_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE submission_status = 'pending') AS pending_submissions,
  COUNT(*) FILTER (WHERE submission_status = 'submitted') AS awaiting_verification,
  COUNT(*) FILTER (WHERE is_live = true) AS live_citations,
  COUNT(*) FILTER (WHERE is_live = true AND nap_consistent = true) AS consistent_citations,
  COUNT(*) FILTER (WHERE is_live = true AND nap_consistent = false) AS inconsistent_citations,
  COUNT(*) FILTER (WHERE has_backlink = true) AS citations_with_backlinks,
  COUNT(*) FILTER (WHERE has_backlink = true AND backlink_type = 'dofollow') AS dofollow_backlinks,
  COUNT(*) FILTER (WHERE last_audit_at < CURRENT_DATE - INTERVAL '30 days') AS needs_audit
FROM local_citations;

-- ============================================================
-- View: pending_citation_queue
-- ============================================================
CREATE OR REPLACE VIEW pending_citation_queue AS
SELECT
  cq.id AS queue_id,
  lc.directory_name,
  lc.directory_url,
  lc.submission_url,
  lc.priority_tier,
  cq.queue_position,
  cq.submission_data,
  cq.submission_instructions,
  cq.queued_for
FROM citation_queue cq
JOIN local_citations lc ON lc.id = cq.citation_id
WHERE cq.completed_at IS NULL
  AND cq.queued_for <= CURRENT_DATE
ORDER BY cq.queued_for, cq.queue_position;

-- ============================================================
-- Function: populate_citation_queue
-- ============================================================
CREATE OR REPLACE FUNCTION populate_citation_queue(
  p_queue_date DATE DEFAULT CURRENT_DATE,
  p_max_items INTEGER DEFAULT 3
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_citation RECORD;
  v_nap RECORD;
BEGIN
  SELECT * INTO v_nap FROM nap_baseline LIMIT 1;

  FOR v_citation IN
    SELECT lc.id, lc.directory_name, lc.directory_url, lc.submission_url
    FROM local_citations lc
    WHERE lc.submission_status = 'pending'
      AND NOT EXISTS (
        SELECT 1 FROM citation_queue cq
        WHERE cq.citation_id = lc.id AND cq.completed_at IS NULL
      )
    ORDER BY lc.priority_tier, lc.created_at
    LIMIT p_max_items
  LOOP
    INSERT INTO citation_queue (
      citation_id,
      queued_for,
      queue_position,
      submission_data,
      submission_instructions
    ) VALUES (
      v_citation.id,
      p_queue_date,
      v_count + 1,
      jsonb_build_object(
        'business_name', v_nap.business_name,
        'address', v_nap.address_line1,
        'city', v_nap.city,
        'state', v_nap.state,
        'zip', v_nap.zip_code,
        'phone', v_nap.phone,
        'website', v_nap.website,
        'email', v_nap.email,
        'categories', v_nap.primary_categories,
        'service_areas', v_nap.service_areas
      ),
      'Submit listing with exact NAP data above. Use professional description: "Professional lawn care and yard maintenance in Madison, WI. Lawn mowing, fertilization, aeration, gutter cleaning, hardscaping, snow removal, and more. 5-star rated. Serving Dane County — Madison, Middleton, Waunakee, Monona, Sun Prairie, Fitchburg, Verona, McFarland, Cottage Grove, DeForest, Oregon, Stoughton."'
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Seed: NAP baseline for TotalGuard Yard Care
-- ============================================================
INSERT INTO nap_baseline (business_name, address_line1, city, state, zip_code, phone, website, email, service_areas, primary_categories)
VALUES (
  'TotalGuard Yard Care',
  '7610 Welton Dr',
  'Madison',
  'WI',
  '53711',
  '(608) 535-6057',
  'https://tgyardcare.com',
  'totalguardllc@gmail.com',
  ARRAY['Madison', 'Middleton', 'Waunakee', 'Monona', 'Sun Prairie', 'Fitchburg', 'Verona', 'McFarland', 'Cottage Grove', 'DeForest', 'Oregon', 'Stoughton'],
  ARRAY['Lawn Mowing', 'Fertilization', 'Aeration', 'Herbicide Services', 'Weeding', 'Mulching', 'Garden Bed Care', 'Bush Trimming', 'Hardscaping', 'Spring Cleanup', 'Fall Cleanup', 'Leaf Removal', 'Gutter Cleaning', 'Gutter Guard Installation', 'Snow Removal']
);

-- ============================================================
-- Seed: Initial directory list
-- ============================================================
INSERT INTO local_citations (directory_name, directory_url, priority_tier, domain_authority, submission_status) VALUES
-- Tier 1: Critical directories
('Google Business Profile', 'https://business.google.com', 1, 100, 'verified'),
('Yelp', 'https://biz.yelp.com', 1, 94, 'pending'),
('Facebook Business', 'https://business.facebook.com', 1, 96, 'pending'),
('Apple Maps Connect', 'https://mapsconnect.apple.com', 1, 100, 'pending'),
('Bing Places', 'https://www.bingplaces.com', 1, 93, 'pending'),
('Nextdoor Business', 'https://business.nextdoor.com', 1, 72, 'pending'),
('BBB', 'https://www.bbb.org', 1, 91, 'pending'),
('Angi', 'https://www.angi.com', 1, 90, 'pending'),
('HomeAdvisor', 'https://pro.homeadvisor.com', 1, 87, 'pending'),
('Thumbtack', 'https://www.thumbtack.com', 1, 82, 'pending'),
-- Tier 2: Important directories
('Manta', 'https://www.manta.com', 2, 68, 'pending'),
('YellowPages', 'https://www.yellowpages.com', 2, 75, 'pending'),
('Superpages', 'https://www.superpages.com', 2, 63, 'pending'),
('MapQuest', 'https://www.mapquest.com', 2, 69, 'pending'),
('Foursquare', 'https://foursquare.com', 2, 81, 'pending'),
('Hotfrog', 'https://www.hotfrog.com', 2, 48, 'pending'),
('EZLocal', 'https://www.ezlocal.com', 2, 42, 'pending'),
-- Tier 3: Madison/Wisconsin specific
('Madison Chamber of Commerce', 'https://www.madisonbiz.com', 3, 55, 'pending'),
('Dane County Directory', 'https://www.countyofdane.com', 3, 60, 'pending'),
('madison.com Business Directory', 'https://madison.com', 3, 70, 'pending'),
('Wisconsin Business Directory', 'https://www.wisbusiness.com', 3, 45, 'pending')
ON CONFLICT (directory_name) DO NOTHING;
