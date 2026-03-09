-- Migration 012: Media Opportunities & HARO Tracking
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)

CREATE TABLE IF NOT EXISTS media_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_id TEXT,
  source_email_id TEXT,
  query_title TEXT NOT NULL,
  query_text TEXT,
  query_category TEXT,
  query_deadline TIMESTAMPTZ,
  outlet_name TEXT,
  outlet_type TEXT,
  outlet_reach_estimate INTEGER,
  journalist_name TEXT,
  journalist_email TEXT,
  journalist_twitter TEXT,
  relevance_score INTEGER DEFAULT 0,
  relevance_factors JSONB,
  auto_respond BOOLEAN DEFAULT FALSE,
  response_status TEXT DEFAULT 'new',
  draft_response TEXT,
  final_response TEXT,
  response_sent_at TIMESTAMPTZ,
  sent_via TEXT,
  response_received BOOLEAN DEFAULT FALSE,
  response_type TEXT,
  published_url TEXT,
  published_at TIMESTAMPTZ,
  backlink_obtained BOOLEAN DEFAULT FALSE,
  backlink_type TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS local_news_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_summary TEXT,
  relevant_keywords TEXT[],
  published_at TIMESTAMPTZ,
  opportunity_type TEXT,
  action_status TEXT DEFAULT 'new',
  action_taken TEXT,
  action_result TEXT,
  resulted_in_coverage BOOLEAN DEFAULT FALSE,
  coverage_url TEXT,
  backlink_obtained BOOLEAN DEFAULT FALSE,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS press_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT,
  target_keywords TEXT[],
  distribution_channels TEXT[],
  distribution_date DATE,
  distribution_status TEXT DEFAULT 'draft',
  total_cost DECIMAL(10,2) DEFAULT 0,
  pickups_count INTEGER DEFAULT 0,
  pickup_urls TEXT[],
  backlinks_obtained INTEGER DEFAULT 0,
  backlink_urls TEXT[],
  triggered_by TEXT,
  milestone_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorship_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  organizer TEXT,
  event_date DATE,
  event_type TEXT,
  event_url TEXT,
  sponsorship_levels JSONB,
  minimum_cost DECIMAL(10,2),
  maximum_cost DECIMAL(10,2),
  benefits TEXT[],
  backlink_included BOOLEAN DEFAULT FALSE,
  relevance_score INTEGER,
  estimated_reach INTEGER,
  target_audience TEXT,
  status TEXT DEFAULT 'new',
  decision_deadline DATE,
  decision_notes TEXT,
  participated BOOLEAN DEFAULT FALSE,
  actual_cost DECIMAL(10,2),
  leads_generated INTEGER,
  backlinks_obtained TEXT[],
  photos_urls TEXT[],
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_ops_source ON media_opportunities(source);
CREATE INDEX IF NOT EXISTS idx_media_ops_status ON media_opportunities(response_status);
CREATE INDEX IF NOT EXISTS idx_media_ops_deadline ON media_opportunities(query_deadline);
CREATE INDEX IF NOT EXISTS idx_media_ops_relevance ON media_opportunities(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_media_ops_received ON media_opportunities(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_mentions_source ON local_news_mentions(source_name);
CREATE INDEX IF NOT EXISTS idx_news_mentions_status ON local_news_mentions(action_status);
CREATE INDEX IF NOT EXISTS idx_news_mentions_type ON local_news_mentions(opportunity_type);

CREATE INDEX IF NOT EXISTS idx_press_releases_status ON press_releases(distribution_status);
CREATE INDEX IF NOT EXISTS idx_press_releases_date ON press_releases(distribution_date);

CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorship_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_date ON sponsorship_opportunities(event_date);
CREATE INDEX IF NOT EXISTS idx_sponsorships_relevance ON sponsorship_opportunities(relevance_score DESC);

-- Views
CREATE OR REPLACE VIEW haro_pipeline AS
SELECT
  COUNT(*) FILTER (WHERE response_status = 'new' AND source = 'haro') AS new_queries,
  COUNT(*) FILTER (WHERE response_status = 'evaluating' AND source = 'haro') AS evaluating,
  COUNT(*) FILTER (WHERE response_status = 'drafting' AND source = 'haro') AS drafts_in_progress,
  COUNT(*) FILTER (WHERE response_status = 'review_pending' AND source = 'haro') AS pending_review,
  COUNT(*) FILTER (WHERE response_status = 'sent' AND source = 'haro') AS pitches_sent,
  COUNT(*) FILTER (WHERE response_status = 'published' AND source = 'haro') AS published,
  COUNT(*) FILTER (WHERE backlink_obtained = true AND source = 'haro') AS backlinks_won,
  AVG(relevance_score) FILTER (WHERE source = 'haro') AS avg_relevance_score
FROM media_opportunities;

CREATE OR REPLACE VIEW urgent_opportunities AS
SELECT
  id, source, query_title, outlet_name, journalist_name, query_deadline,
  relevance_score, response_status,
  draft_response IS NOT NULL AS has_draft,
  EXTRACT(EPOCH FROM (query_deadline - NOW())) / 3600 AS hours_until_deadline
FROM media_opportunities
WHERE response_status IN ('new', 'evaluating', 'drafting', 'review_pending')
  AND query_deadline IS NOT NULL
  AND query_deadline > NOW()
  AND query_deadline < NOW() + INTERVAL '48 hours'
ORDER BY query_deadline ASC;

CREATE OR REPLACE VIEW media_wins_this_month AS
SELECT source, query_title, outlet_name, published_url, published_at, backlink_obtained, backlink_type
FROM media_opportunities
WHERE response_status = 'published'
  AND published_at >= date_trunc('month', CURRENT_DATE)
ORDER BY published_at DESC;

-- Function: score_haro_relevance (adapted for lawn care keywords)
CREATE OR REPLACE FUNCTION score_haro_relevance(
  p_title TEXT,
  p_query TEXT,
  p_category TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_score INTEGER := 0;
  v_factors TEXT[] := '{}';
  v_text TEXT;
BEGIN
  v_text := LOWER(COALESCE(p_title, '') || ' ' || COALESCE(p_query, ''));

  -- Home/property keywords (+15)
  IF v_text ~ 'home|house|property|homeowner|yard|lawn|garden|curb appeal|real estate|outdoor' THEN
    v_score := v_score + 15;
    v_factors := array_append(v_factors, 'home_keyword');
  END IF;

  -- Service-specific keywords (+20)
  IF v_text ~ 'lawn|mowing|fertiliz|aeration|landscaping|snow removal|gutter|mulch|hardscap|weed' THEN
    v_score := v_score + 20;
    v_factors := array_append(v_factors, 'service_keyword');
  END IF;

  -- Local keywords (+25)
  IF v_text ~ 'madison|wisconsin|midwest|cold climate|winter|dane county' THEN
    v_score := v_score + 25;
    v_factors := array_append(v_factors, 'local_keyword');
  END IF;

  -- Expert/business owner keywords (+10)
  IF v_text ~ 'expert|professional|contractor|business owner|small business|entrepreneur' THEN
    v_score := v_score + 10;
    v_factors := array_append(v_factors, 'expert_keyword');
  END IF;

  -- Relevant categories (+10)
  IF LOWER(COALESCE(p_category, '')) ~ 'business|lifestyle|general|home' THEN
    v_score := v_score + 10;
    v_factors := array_append(v_factors, 'relevant_category');
  END IF;

  v_score := LEAST(v_score, 100);

  RETURN jsonb_build_object(
    'score', v_score,
    'factors', v_factors,
    'auto_respond', v_score >= 50
  );
END;
$$ LANGUAGE plpgsql;
