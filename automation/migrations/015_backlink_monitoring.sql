-- Migration 015: Backlink Monitoring & Competitor Tracking
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)

CREATE TABLE IF NOT EXISTS backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  target_url TEXT DEFAULT 'https://tgyardcare.com',
  target_page TEXT,
  anchor_text TEXT,
  link_type TEXT NOT NULL,
  link_context TEXT,
  source_domain_authority INTEGER,
  source_page_authority INTEGER,
  source_spam_score INTEGER,
  source_traffic_estimate INTEGER,
  acquisition_method TEXT NOT NULL,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  acquisition_cost DECIMAL(10,2) DEFAULT 0,
  related_opportunity_id UUID,
  is_live BOOLEAN DEFAULT TRUE,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ,
  last_seen_live_at TIMESTAMPTZ,
  link_lost_at TIMESTAMPTZ,
  check_failures INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_url, target_url)
);

CREATE TABLE IF NOT EXISTS backlink_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backlink_id UUID REFERENCES backlinks(id) ON DELETE CASCADE,
  check_date TIMESTAMPTZ DEFAULT NOW(),
  check_result TEXT NOT NULL,
  found_link BOOLEAN,
  found_anchor_text TEXT,
  found_link_type TEXT,
  http_status INTEGER,
  response_time_ms INTEGER,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  website TEXT,
  location TEXT,
  services TEXT[],
  domain_authority INTEGER,
  total_backlinks INTEGER,
  referring_domains INTEGER,
  organic_traffic_estimate INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 2,
  last_analyzed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain)
);

CREATE TABLE IF NOT EXISTS competitor_backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  link_type TEXT,
  anchor_text TEXT,
  domain_authority INTEGER,
  page_authority INTEGER,
  is_opportunity BOOLEAN DEFAULT FALSE,
  opportunity_type TEXT,
  opportunity_notes TEXT,
  we_have_link BOOLEAN DEFAULT FALSE,
  our_backlink_id UUID REFERENCES backlinks(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backlink_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  report_date DATE DEFAULT CURRENT_DATE,
  total_backlinks INTEGER,
  total_referring_domains INTEGER,
  dofollow_count INTEGER,
  nofollow_count INTEGER,
  avg_domain_authority DECIMAL(5,2),
  new_backlinks INTEGER,
  lost_backlinks INTEGER,
  net_change INTEGER,
  by_method JSONB,
  top_new_backlinks JSONB,
  alerts JSONB,
  summary_text TEXT,
  report_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_backlinks_domain ON backlinks(source_domain);
CREATE INDEX IF NOT EXISTS idx_backlinks_live ON backlinks(is_live);
CREATE INDEX IF NOT EXISTS idx_backlinks_method ON backlinks(acquisition_method);
CREATE INDEX IF NOT EXISTS idx_backlinks_date ON backlinks(acquisition_date DESC);
CREATE INDEX IF NOT EXISTS idx_backlinks_da ON backlinks(source_domain_authority DESC);
CREATE INDEX IF NOT EXISTS idx_backlinks_check ON backlinks(last_checked_at);

CREATE INDEX IF NOT EXISTS idx_checks_backlink ON backlink_checks(backlink_id);
CREATE INDEX IF NOT EXISTS idx_checks_date ON backlink_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_checks_result ON backlink_checks(check_result);

CREATE INDEX IF NOT EXISTS idx_competitors_active ON competitors(is_active);
CREATE INDEX IF NOT EXISTS idx_competitor_links_competitor ON competitor_backlinks(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_links_opportunity ON competitor_backlinks(is_opportunity);
CREATE INDEX IF NOT EXISTS idx_competitor_links_domain ON competitor_backlinks(source_domain);

CREATE INDEX IF NOT EXISTS idx_reports_type_date ON backlink_reports(report_type, report_date DESC);

-- Views
CREATE OR REPLACE VIEW backlink_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE is_live = true) AS total_live_backlinks,
  COUNT(DISTINCT source_domain) FILTER (WHERE is_live = true) AS referring_domains,
  COUNT(*) FILTER (WHERE link_type = 'dofollow' AND is_live = true) AS dofollow_count,
  COUNT(*) FILTER (WHERE link_type = 'nofollow' AND is_live = true) AS nofollow_count,
  COUNT(*) FILTER (WHERE acquisition_method = 'citation' AND is_live = true) AS citation_links,
  COUNT(*) FILTER (WHERE acquisition_method = 'guest_post' AND is_live = true) AS guest_post_links,
  COUNT(*) FILTER (WHERE acquisition_method = 'haro' AND is_live = true) AS haro_links,
  COUNT(*) FILTER (WHERE acquisition_method = 'organic' AND is_live = true) AS organic_links,
  COUNT(*) FILTER (WHERE acquisition_method = 'pr' AND is_live = true) AS pr_links,
  COUNT(*) FILTER (WHERE acquisition_method = 'outreach' AND is_live = true) AS outreach_links,
  ROUND(AVG(source_domain_authority) FILTER (WHERE is_live = true), 1) AS avg_domain_authority,
  COUNT(*) FILTER (WHERE source_domain_authority >= 50 AND is_live = true) AS high_da_links,
  COUNT(*) FILTER (WHERE acquisition_date >= CURRENT_DATE - INTERVAL '7 days') AS new_this_week,
  COUNT(*) FILTER (WHERE acquisition_date >= CURRENT_DATE - INTERVAL '30 days') AS new_this_month,
  COUNT(*) FILTER (WHERE link_lost_at >= CURRENT_DATE - INTERVAL '7 days') AS lost_this_week,
  COUNT(*) FILTER (WHERE last_checked_at < CURRENT_DATE - INTERVAL '7 days' AND is_live = true) AS needs_check,
  COUNT(*) FILTER (WHERE check_failures >= 2 AND is_live = true) AS at_risk
FROM backlinks;

CREATE OR REPLACE VIEW competitor_opportunities AS
SELECT
  cb.source_domain, cb.source_url, cb.domain_authority, cb.opportunity_type,
  cb.opportunity_notes, c.name AS competitor_name, cb.discovered_at,
  CASE
    WHEN cb.domain_authority >= 50 THEN 'high'
    WHEN cb.domain_authority >= 30 THEN 'medium'
    ELSE 'low'
  END AS priority
FROM competitor_backlinks cb
JOIN competitors c ON c.id = cb.competitor_id
WHERE cb.is_opportunity = true AND cb.we_have_link = false
ORDER BY cb.domain_authority DESC;

-- Function: record_backlink_check
CREATE OR REPLACE FUNCTION record_backlink_check(
  p_backlink_id UUID,
  p_result TEXT,
  p_found_link BOOLEAN,
  p_found_anchor TEXT DEFAULT NULL,
  p_found_type TEXT DEFAULT NULL,
  p_http_status INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO backlink_checks (backlink_id, check_result, found_link, found_anchor_text, found_link_type, http_status)
  VALUES (p_backlink_id, p_result, p_found_link, p_found_anchor, p_found_type, p_http_status);

  IF p_found_link THEN
    UPDATE backlinks SET last_checked_at = NOW(), last_seen_live_at = NOW(), check_failures = 0, updated_at = NOW()
    WHERE id = p_backlink_id;
  ELSE
    UPDATE backlinks SET
      last_checked_at = NOW(),
      check_failures = check_failures + 1,
      is_live = CASE WHEN check_failures >= 2 THEN false ELSE is_live END,
      link_lost_at = CASE WHEN check_failures >= 2 THEN NOW() ELSE link_lost_at END,
      updated_at = NOW()
    WHERE id = p_backlink_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed: Madison lawn care competitors
INSERT INTO competitors (name, domain, location, services, priority) VALUES
('ABC Lawn Service Madison', 'abclawnservicemadison.com', 'madison', ARRAY['lawn_mowing', 'fertilization'], 1),
('Badger State Lawn Care', 'badgerstatelawncare.com', 'madison', ARRAY['lawn_mowing', 'aeration', 'fertilization'], 1),
('Madison Lawn Pros', 'madisonlawnpros.com', 'dane_county', ARRAY['lawn_mowing', 'snow_removal'], 2),
('Capital Lawn & Landscape', 'capitallawnandlandscape.com', 'madison', ARRAY['lawn_mowing', 'landscaping', 'hardscaping'], 2),
('Dane County Lawn Care', 'danecountylawncare.com', 'dane_county', ARRAY['lawn_mowing', 'fertilization', 'aeration'], 2)
ON CONFLICT (domain) DO NOTHING;
