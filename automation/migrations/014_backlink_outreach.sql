-- Migration 014: Outreach & Guest Posting
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)

CREATE TABLE IF NOT EXISTS guest_post_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  write_for_us_url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  domain_authority INTEGER,
  monthly_traffic_estimate TEXT,
  relevance_category TEXT,               -- 'home_improvement', 'local_madison', 'real_estate', 'lawn_garden'
  guidelines_summary TEXT,
  accepted_topics TEXT[],
  word_count_min INTEGER,
  word_count_max INTEGER,
  includes_author_bio BOOLEAN DEFAULT TRUE,
  allows_contextual_links BOOLEAN DEFAULT TRUE,
  backlink_policy TEXT,
  discovery_method TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  outreach_status TEXT DEFAULT 'new',
  pitch_sent_at TIMESTAMPTZ,
  pitch_email_text TEXT,
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  response_type TEXT,
  article_topic TEXT,
  article_title TEXT,
  article_draft_url TEXT,
  article_submitted_at TIMESTAMPTZ,
  revision_requested BOOLEAN DEFAULT FALSE,
  revision_notes TEXT,
  article_published_at TIMESTAMPTZ,
  published_url TEXT,
  backlink_obtained BOOLEAN DEFAULT FALSE,
  backlink_url TEXT,
  backlink_anchor_text TEXT,
  notes TEXT,
  priority INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_url)
);

CREATE TABLE IF NOT EXISTS unlinked_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mention_url TEXT NOT NULL,
  mention_domain TEXT NOT NULL,
  page_title TEXT,
  mention_text TEXT,
  mention_context TEXT,
  anchor_text_suggested TEXT,
  domain_authority INTEGER,
  page_authority INTEGER,
  discovery_method TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  contact_email TEXT,
  contact_name TEXT,
  contact_form_url TEXT,
  outreach_status TEXT DEFAULT 'new',
  outreach_sent_at TIMESTAMPTZ,
  outreach_email_text TEXT,
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  link_added BOOLEAN DEFAULT FALSE,
  link_added_at TIMESTAMPTZ,
  link_type TEXT,
  priority INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mention_url)
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  description TEXT,
  target_asset_id UUID REFERENCES linkable_assets(id),
  target_url TEXT,
  search_queries TEXT[],
  status TEXT DEFAULT 'planning',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  prospects_found INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  links_acquired INTEGER DEFAULT 0,
  initial_email_template TEXT,
  follow_up_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  site_name TEXT,
  page_url TEXT,
  domain_authority INTEGER,
  contact_email TEXT,
  contact_name TEXT,
  contact_role TEXT,
  status TEXT DEFAULT 'prospect',
  initial_email_sent_at TIMESTAMPTZ,
  initial_email_opened BOOLEAN,
  follow_up_1_sent_at TIMESTAMPTZ,
  follow_up_2_sent_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  response_text TEXT,
  link_placed BOOLEAN DEFAULT FALSE,
  link_url TEXT,
  link_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_posts_status ON guest_post_opportunities(outreach_status);
CREATE INDEX IF NOT EXISTS idx_guest_posts_da ON guest_post_opportunities(domain_authority DESC);
CREATE INDEX IF NOT EXISTS idx_guest_posts_priority ON guest_post_opportunities(priority);

CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_status ON unlinked_mentions(outreach_status);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_da ON unlinked_mentions(domain_authority DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON outreach_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON outreach_campaigns(campaign_type);

CREATE INDEX IF NOT EXISTS idx_contacts_campaign ON outreach_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON outreach_contacts(status);

-- Views
CREATE OR REPLACE VIEW guest_post_pipeline AS
SELECT
  COUNT(*) FILTER (WHERE outreach_status = 'new') AS new_prospects,
  COUNT(*) FILTER (WHERE outreach_status = 'researching') AS researching,
  COUNT(*) FILTER (WHERE outreach_status = 'pitch_ready') AS pitches_ready,
  COUNT(*) FILTER (WHERE outreach_status = 'pitched') AS awaiting_response,
  COUNT(*) FILTER (WHERE outreach_status = 'accepted') AS accepted,
  COUNT(*) FILTER (WHERE outreach_status = 'writing') AS in_progress,
  COUNT(*) FILTER (WHERE outreach_status = 'submitted') AS submitted,
  COUNT(*) FILTER (WHERE outreach_status = 'published') AS published,
  COUNT(*) FILTER (WHERE backlink_obtained = true) AS backlinks_won,
  AVG(domain_authority) AS avg_target_da
FROM guest_post_opportunities;

CREATE OR REPLACE VIEW high_value_prospects AS
SELECT
  id, site_name, site_url, domain_authority, relevance_category, backlink_policy, outreach_status,
  CASE
    WHEN domain_authority >= 60 THEN 'high'
    WHEN domain_authority >= 40 THEN 'medium'
    ELSE 'low'
  END AS value_tier
FROM guest_post_opportunities
WHERE outreach_status NOT IN ('rejected', 'no_response', 'published')
ORDER BY domain_authority DESC, priority
LIMIT 50;

-- Function: generate_pitch_email (adapted for TotalGuard)
CREATE OR REPLACE FUNCTION generate_pitch_email(p_opportunity_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_opp RECORD;
  v_email TEXT;
BEGIN
  SELECT * INTO v_opp FROM guest_post_opportunities WHERE id = p_opportunity_id;
  IF v_opp IS NULL THEN RETURN NULL; END IF;

  v_email := format(
    E'Subject: Guest Post Pitch: %s\n\nHi %s,\n\nI''m reaching out because I noticed %s covers topics related to home maintenance and improvement. I run TotalGuard Yard Care, a Madison-based lawn care and yard maintenance company serving Dane County homeowners.\n\nI''d love to contribute a guest post on a topic that would resonate with your readers. Some ideas:\n\n1. "The Wisconsin Homeowner''s Complete Lawn Care Calendar"\n2. "Aeration, Overseeding, and Fertilization: Timing Everything Right in Madison"\n3. "How to Protect Your Lawn Through a Wisconsin Winter"\n\nI can provide original insights backed by real experience servicing hundreds of Madison-area lawns. The piece would be informative, practical, and include actionable tips for your readers.\n\nWould any of these topics work for your site? Happy to discuss other angles that fit better.\n\nBest,\n[Your Name]\nTotalGuard Yard Care\ntgyardcare.com',
    v_opp.site_name,
    COALESCE(v_opp.contact_name, 'there'),
    v_opp.site_name
  );

  RETURN v_email;
END;
$$ LANGUAGE plpgsql;
