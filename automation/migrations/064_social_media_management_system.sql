-- Migration 064: Social Media Management System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Replaces Paige by Merchynt with full content factory + multi-platform posting
-- Tables: content_ideas, viral_hooks, keyword_rankings, ai_visibility_checks,
--         social_engagement_pulls, review_request_links, competitor_social_posts
-- Views: content_idea_pipeline, keyword_ranking_trends, ai_visibility_summary, social_content_performance
-- RPCs: get_top_hooks, update_hook_performance, get_scriptable_ideas

-- =============================================================================
-- SCHEMA UPDATE: Expand social_posts platform + post_type constraints
-- =============================================================================
ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS social_posts_platform_check;
ALTER TABLE social_posts ADD CONSTRAINT social_posts_platform_check
  CHECK (platform IN ('google_business', 'facebook', 'instagram', 'nextdoor', 'tiktok', 'youtube', 'x_twitter', 'linkedin'));

ALTER TABLE social_posts DROP CONSTRAINT IF EXISTS social_posts_post_type_check;
ALTER TABLE social_posts ADD CONSTRAINT social_posts_post_type_check
  CHECK (post_type IN (
    'job_highlight', 'service_spotlight', 'review_highlight', 'seasonal_tip',
    'promotion', 'update', 'offer', 'event', 'scheduled', 'planned',
    'shorts', 'reel', 'community_post', 'thread', 'before_after',
    'tip', 'behind_scenes', 'customer_story', 'transformation', 'educational'
  ));

-- Add content_idea_id FK column to social_posts
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS content_idea_id uuid;

-- =============================================================================
-- TABLE: content_ideas
-- Content factory pipeline: trending topics -> ideas -> scripted captions -> posts
-- =============================================================================
CREATE TABLE IF NOT EXISTS content_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN (
    'trending_topic', 'competitor_analysis', 'seasonal_calendar',
    'customer_review', 'ai_generated', 'manual', 'news_hook',
    'user_question', 'before_after', 'weather_triggered'
  )),
  platform text CHECK (platform IN (
    'instagram', 'facebook', 'google_business', 'nextdoor',
    'tiktok', 'youtube', 'x_twitter', 'linkedin', 'all'
  )),
  idea_text text NOT NULL,
  hook_text text,
  full_caption text,
  platform_captions jsonb DEFAULT '{}',
  hashtags text[] DEFAULT '{}',
  content_type text CHECK (content_type IN (
    'before_after', 'tip', 'behind_scenes', 'customer_story',
    'transformation', 'myth_busting', 'seasonal', 'promotional',
    'community', 'trending_hook', 'educational', 'listicle',
    'satisfying_clean', 'day_in_the_life', 'cost_breakdown',
    'pov', 'hot_take', 'client_reaction'
  )),
  service_type text,
  seasonal_relevance text CHECK (seasonal_relevance IN (
    'spring', 'summer', 'fall', 'winter', 'evergreen'
  )),
  virality_score integer CHECK (virality_score BETWEEN 1 AND 10),
  source_url text,
  source_data jsonb DEFAULT '{}',
  media_asset_id uuid,
  viral_hook_id uuid,
  status text DEFAULT 'idea' CHECK (status IN (
    'idea', 'scripted', 'approved', 'scheduled', 'posted', 'rejected'
  )),
  posted_to_social_post_id uuid,
  ai_model text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_content_ideas_platform ON content_ideas(platform);
CREATE INDEX IF NOT EXISTS idx_content_ideas_virality ON content_ideas(virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_ideas_service ON content_ideas(service_type);
CREATE INDEX IF NOT EXISTS idx_content_ideas_created ON content_ideas(created_at DESC);

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON content_ideas FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: viral_hooks
-- Proven hook template library with performance tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS viral_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_template text NOT NULL,
  hook_category text NOT NULL CHECK (hook_category IN (
    'pov', 'hot_take', 'unpopular_opinion', 'story_time',
    'did_you_know', 'stop_doing_this', 'heres_why', 'myth_vs_reality',
    'before_after_reveal', 'day_in_the_life', 'client_reaction',
    'satisfying_clean', 'cost_breakdown', 'mistake_warning'
  )),
  platforms text[] DEFAULT '{instagram,facebook,tiktok}',
  service_types text[] DEFAULT '{}',
  times_used integer DEFAULT 0,
  avg_engagement numeric(10,2) DEFAULT 0,
  best_performing_post_id uuid,
  is_active boolean DEFAULT true,
  source text DEFAULT 'manual' CHECK (source IN (
    'manual', 'competitor_inspired', 'ai_generated', 'performance_winner'
  )),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viral_hooks_category ON viral_hooks(hook_category);
CREATE INDEX IF NOT EXISTS idx_viral_hooks_engagement ON viral_hooks(avg_engagement DESC);
CREATE INDEX IF NOT EXISTS idx_viral_hooks_active ON viral_hooks(is_active) WHERE is_active = true;

ALTER TABLE viral_hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON viral_hooks FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: keyword_rankings
-- Daily Google keyword position tracking for local SEO
-- Drop and recreate (table exists from earlier migration but lacks needed columns)
-- =============================================================================
DROP TABLE IF EXISTS keyword_rankings CASCADE;
CREATE TABLE keyword_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  search_engine text DEFAULT 'google' CHECK (search_engine IN ('google', 'google_maps', 'bing')),
  rank_position integer,
  previous_position integer,
  page_url text,
  search_location text DEFAULT 'Madison, WI',
  device text DEFAULT 'mobile' CHECK (device IN ('mobile', 'desktop')),
  local_pack boolean DEFAULT false,
  featured_snippet boolean DEFAULT false,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(keyword, search_engine, search_location, device, date)
);

CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_date ON keyword_rankings(date DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_position ON keyword_rankings(rank_position);

ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON keyword_rankings FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: ai_visibility_checks
-- Tracks TotalGuard mentions on ChatGPT, Gemini, Perplexity, Claude, Grok
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_visibility_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_platform text NOT NULL CHECK (ai_platform IN (
    'chatgpt', 'gemini', 'perplexity', 'claude', 'copilot', 'grok'
  )),
  query text NOT NULL,
  response_text text,
  mentioned boolean DEFAULT false,
  mention_position text CHECK (mention_position IN (
    'first', 'second', 'third', 'listed', 'not_mentioned'
  )),
  competitors_mentioned text[] DEFAULT '{}',
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative', 'not_applicable')),
  response_quality text CHECK (response_quality IN ('recommended', 'listed', 'mentioned', 'absent')),
  checked_at timestamptz DEFAULT now(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(ai_platform, query, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_visibility_platform ON ai_visibility_checks(ai_platform);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_date ON ai_visibility_checks(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_mentioned ON ai_visibility_checks(mentioned);

ALTER TABLE ai_visibility_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON ai_visibility_checks FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: social_engagement_pulls
-- Engagement data pulled back from platforms for each post
-- =============================================================================
CREATE TABLE IF NOT EXISTS social_engagement_pulls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id uuid REFERENCES social_posts(id),
  platform text NOT NULL,
  external_post_id text,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  profile_visits integer DEFAULT 0,
  follower_change integer DEFAULT 0,
  video_views integer DEFAULT 0,
  pulled_at timestamptz DEFAULT now(),
  raw_data jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_engagement_pulls_post ON social_engagement_pulls(social_post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_pulls_date ON social_engagement_pulls(pulled_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_pulls_platform ON social_engagement_pulls(platform);

ALTER TABLE social_engagement_pulls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON social_engagement_pulls FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: review_request_links
-- QR codes and short URLs for review collection
-- =============================================================================
CREATE TABLE IF NOT EXISTS review_request_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_type text NOT NULL CHECK (link_type IN ('short_url', 'qr_code', 'nfc_tag', 'email_link')),
  short_url text,
  qr_code_url text,
  google_review_url text NOT NULL,
  destination_url text,
  label text,
  scan_count integer DEFAULT 0,
  review_count integer DEFAULT 0,
  conversion_rate numeric(5,4) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_links_type ON review_request_links(link_type);
CREATE INDEX IF NOT EXISTS idx_review_links_active ON review_request_links(is_active) WHERE is_active = true;

ALTER TABLE review_request_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON review_request_links FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: competitor_social_posts
-- Competitor content tracking for content factory inspiration
-- =============================================================================
CREATE TABLE IF NOT EXISTS competitor_social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid,
  competitor_name text NOT NULL,
  platform text NOT NULL,
  post_url text,
  post_text text,
  post_type text,
  engagement_likes integer DEFAULT 0,
  engagement_comments integer DEFAULT 0,
  engagement_shares integer DEFAULT 0,
  total_engagement integer DEFAULT 0,
  estimated_reach integer,
  content_themes text[] DEFAULT '{}',
  hooks_used text[] DEFAULT '{}',
  lessons text,
  is_viral boolean DEFAULT false,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_social_competitor ON competitor_social_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_social_engagement ON competitor_social_posts(total_engagement DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_social_platform ON competitor_social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_competitor_social_viral ON competitor_social_posts(is_viral) WHERE is_viral = true;

ALTER TABLE competitor_social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON competitor_social_posts FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- VIEW: content_idea_pipeline
-- Dashboard of content ideas by status with virality breakdown
-- =============================================================================
CREATE OR REPLACE VIEW content_idea_pipeline AS
SELECT
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE virality_score >= 7) as high_potential,
  COUNT(*) FILTER (WHERE virality_score >= 4 AND virality_score < 7) as medium_potential,
  COUNT(*) FILTER (WHERE virality_score < 4 OR virality_score IS NULL) as low_potential,
  COUNT(*) FILTER (WHERE platform = 'instagram' OR platform = 'all') as for_instagram,
  COUNT(*) FILTER (WHERE platform = 'facebook' OR platform = 'all') as for_facebook,
  COUNT(*) FILTER (WHERE platform = 'google_business' OR platform = 'all') as for_gbp,
  COUNT(*) FILTER (WHERE platform = 'x_twitter' OR platform = 'all') as for_x,
  COUNT(*) FILTER (WHERE platform = 'linkedin' OR platform = 'all') as for_linkedin,
  COUNT(*) FILTER (WHERE platform = 'tiktok' OR platform = 'all') as for_tiktok,
  COUNT(*) FILTER (WHERE platform = 'youtube' OR platform = 'all') as for_youtube,
  COUNT(*) FILTER (WHERE platform = 'nextdoor' OR platform = 'all') as for_nextdoor,
  ROUND(AVG(virality_score)::numeric, 1) as avg_virality
FROM content_ideas
GROUP BY status;

-- =============================================================================
-- VIEW: keyword_ranking_trends
-- Week-over-week keyword position changes
-- =============================================================================
CREATE OR REPLACE VIEW keyword_ranking_trends AS
WITH current_week AS (
  SELECT keyword, search_engine, device,
    AVG(rank_position)::numeric(5,1) as avg_position,
    bool_or(local_pack) as in_local_pack,
    bool_or(featured_snippet) as has_snippet
  FROM keyword_rankings
  WHERE date >= CURRENT_DATE - 7
  GROUP BY keyword, search_engine, device
),
prev_week AS (
  SELECT keyword, search_engine, device,
    AVG(rank_position)::numeric(5,1) as avg_position
  FROM keyword_rankings
  WHERE date >= CURRENT_DATE - 14 AND date < CURRENT_DATE - 7
  GROUP BY keyword, search_engine, device
)
SELECT
  cw.keyword, cw.search_engine, cw.device,
  cw.avg_position as current_position,
  pw.avg_position as previous_position,
  ROUND((COALESCE(pw.avg_position, cw.avg_position) - cw.avg_position)::numeric, 1) as position_change,
  cw.in_local_pack,
  cw.has_snippet,
  CASE
    WHEN COALESCE(pw.avg_position, cw.avg_position) - cw.avg_position > 3 THEN 'improving'
    WHEN COALESCE(pw.avg_position, cw.avg_position) - cw.avg_position < -3 THEN 'declining'
    ELSE 'stable'
  END as trend
FROM current_week cw
LEFT JOIN prev_week pw USING (keyword, search_engine, device)
ORDER BY cw.avg_position;

-- =============================================================================
-- VIEW: ai_visibility_summary
-- Per-platform AI mention rates and recommendation counts
-- =============================================================================
CREATE OR REPLACE VIEW ai_visibility_summary AS
SELECT
  ai_platform,
  COUNT(*) as total_checks,
  COUNT(*) FILTER (WHERE mentioned) as times_mentioned,
  ROUND(100.0 * COUNT(*) FILTER (WHERE mentioned) / NULLIF(COUNT(*), 0), 1) as mention_rate_pct,
  COUNT(*) FILTER (WHERE response_quality = 'recommended') as times_recommended,
  COUNT(*) FILTER (WHERE response_quality = 'listed') as times_listed,
  COUNT(*) FILTER (WHERE date >= CURRENT_DATE - 7) as checks_last_7d,
  COUNT(*) FILTER (WHERE mentioned AND date >= CURRENT_DATE - 7) as mentions_last_7d,
  MAX(checked_at) as last_checked
FROM ai_visibility_checks
GROUP BY ai_platform;

-- =============================================================================
-- VIEW: social_content_performance
-- Joins posts + engagement + content ideas for full performance picture
-- =============================================================================
CREATE OR REPLACE VIEW social_content_performance AS
SELECT
  sp.id,
  sp.platform,
  sp.post_type,
  LEFT(sp.content, 200) as content_preview,
  sp.posted_at,
  sp.external_post_id,
  COALESCE(sep.likes, sp.engagement_likes, 0) as likes,
  COALESCE(sep.comments, sp.engagement_comments, 0) as comments,
  COALESCE(sep.shares, sp.engagement_shares, 0) as shares,
  COALESCE(sep.saves, 0) as saves,
  COALESCE(sep.reach, sp.reach, 0) as reach,
  COALESCE(sep.impressions, sp.impressions, 0) as impressions,
  COALESCE(sep.video_views, 0) as video_views,
  (COALESCE(sep.likes, sp.engagement_likes, 0)
   + COALESCE(sep.comments, sp.engagement_comments, 0)
   + COALESCE(sep.shares, sp.engagement_shares, 0)
   + COALESCE(sep.saves, 0)) as total_engagement,
  ci.hook_text,
  ci.content_type,
  ci.virality_score,
  ci.source as idea_source,
  vh.hook_category
FROM social_posts sp
LEFT JOIN LATERAL (
  SELECT * FROM social_engagement_pulls
  WHERE social_post_id = sp.id
  ORDER BY pulled_at DESC LIMIT 1
) sep ON true
LEFT JOIN content_ideas ci ON ci.posted_to_social_post_id = sp.id
LEFT JOIN viral_hooks vh ON vh.id = ci.viral_hook_id
WHERE sp.status = 'published'
ORDER BY sp.posted_at DESC;

-- =============================================================================
-- RPC: get_top_hooks
-- Fetch best-performing hooks by category for AI content prompting
-- =============================================================================
CREATE OR REPLACE FUNCTION get_top_hooks(
  p_category text DEFAULT NULL,
  p_service_type text DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  hook_template text,
  hook_category text,
  platforms text[],
  avg_engagement numeric,
  times_used integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT vh.id, vh.hook_template, vh.hook_category, vh.platforms,
         vh.avg_engagement, vh.times_used
  FROM viral_hooks vh
  WHERE vh.is_active = true
    AND (p_category IS NULL OR vh.hook_category = p_category)
    AND (p_service_type IS NULL OR p_service_type = ANY(vh.service_types) OR array_length(vh.service_types, 1) IS NULL)
  ORDER BY vh.avg_engagement DESC, vh.times_used DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RPC: update_hook_performance
-- Update a hook's running average engagement after a post uses it
-- =============================================================================
CREATE OR REPLACE FUNCTION update_hook_performance(
  p_hook_id uuid,
  p_engagement numeric,
  p_post_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE viral_hooks
  SET times_used = times_used + 1,
      avg_engagement = CASE
        WHEN times_used = 0 THEN p_engagement
        ELSE (avg_engagement * times_used + p_engagement) / (times_used + 1)
      END,
      best_performing_post_id = CASE
        WHEN p_engagement > avg_engagement AND p_post_id IS NOT NULL THEN p_post_id
        ELSE best_performing_post_id
      END
  WHERE id = p_hook_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RPC: get_scriptable_ideas
-- Fetch content ideas ready for caption generation
-- =============================================================================
CREATE OR REPLACE FUNCTION get_scriptable_ideas(
  p_platform text DEFAULT NULL,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  idea_text text,
  hook_text text,
  content_type text,
  service_type text,
  seasonal_relevance text,
  virality_score integer,
  media_asset_id uuid,
  source text
) AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, ci.idea_text, ci.hook_text, ci.content_type, ci.service_type,
         ci.seasonal_relevance, ci.virality_score, ci.media_asset_id, ci.source
  FROM content_ideas ci
  WHERE ci.status = 'idea'
    AND (p_platform IS NULL OR ci.platform = p_platform OR ci.platform = 'all')
  ORDER BY ci.virality_score DESC NULLS LAST, ci.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEED DATA: viral_hooks for TotalGuard Yard Care
-- 20 proven hook templates for the content factory
-- =============================================================================
INSERT INTO viral_hooks (hook_template, hook_category, platforms, service_types) VALUES
-- POV hooks
('POV: You finally hired a pro to mow your lawn and now you realize you''ve been butchering it for years', 'pov', '{instagram,facebook,tiktok}', '{lawn_mowing}'),
('POV: Your neighbor just got their lawn aerated and now YOUR yard looks like a patchy nightmare', 'pov', '{instagram,facebook,tiktok}', '{aeration}'),
('POV: You thought your gutters were fine until you saw what came out', 'pov', '{instagram,facebook,tiktok}', '{gutter_cleaning}'),

-- Before/After reveals
('Swipe to see what 3 years of neglect looks like vs. 3 hours of professional lawn care', 'before_after_reveal', '{instagram,facebook}', '{lawn_mowing,spring_cleanup}'),
('I need someone to explain to me why people wait THIS long to get their lawn aerated', 'before_after_reveal', '{instagram,facebook,tiktok}', '{aeration}'),

-- Hot takes
('Hot take: Your lawn''s curb appeal affects your home value more than your kitchen renovation', 'hot_take', '{instagram,facebook,linkedin}', '{}'),
('Unpopular opinion: Most homeowners waste money on landscaping when their lawn is dying from lack of basic care', 'unpopular_opinion', '{instagram,facebook,x_twitter}', '{}'),

-- Story time
('Story time: A customer called us in tears because their HOA sent them a warning letter about their lawn', 'story_time', '{instagram,facebook,tiktok}', '{lawn_mowing,fertilization}'),

-- Satisfying content
('There is NOTHING more satisfying than watching a patchy, brown lawn transform into a lush green carpet', 'satisfying_clean', '{instagram,facebook,tiktok}', '{fertilization,aeration}'),
('Watch this neglected lawn go from dead to lush in one season', 'satisfying_clean', '{instagram,facebook,tiktok,youtube}', '{lawn_mowing,fertilization}'),

-- Cost breakdowns
('What it ACTUALLY costs to get your lawn professionally fertilized (it''s way less than you think)', 'cost_breakdown', '{instagram,facebook,tiktok,youtube}', '{fertilization}'),
('The $150 service that can prevent $3,000 in gutter damage', 'cost_breakdown', '{instagram,facebook,linkedin}', '{gutter_cleaning}'),

-- Mistake warnings
('3 things your lawn care company should NEVER do (and one most do)', 'mistake_warning', '{instagram,facebook,youtube}', '{lawn_mowing}'),
('STOP mowing your lawn this short. Here''s why you''re scalping it and inviting weeds', 'stop_doing_this', '{instagram,facebook,tiktok}', '{lawn_mowing}'),

-- Day in the life
('Day in the life of Madison''s busiest lawn care crew (not what you''d expect)', 'day_in_the_life', '{instagram,tiktok,youtube}', '{}'),
('5am alarm. 8 lawns. 12 miles. Here''s what a typical Monday looks like', 'day_in_the_life', '{instagram,tiktok,youtube}', '{lawn_mowing}'),

-- Did you know
('Did you know mowing wet grass can permanently spread lawn disease? Here''s how to protect your yard', 'did_you_know', '{instagram,facebook,linkedin}', '{lawn_mowing}'),
('Your gutters are probably growing a literal ecosystem right now. Here''s what lives in there in Madison', 'did_you_know', '{instagram,facebook,tiktok}', '{gutter_cleaning}'),

-- Client reaction
('Homeowner''s reaction when they see their lawn after a full spring cleanup and first mow', 'client_reaction', '{instagram,facebook,tiktok}', '{spring_cleanup,lawn_mowing}'),

-- Myth vs reality
('MYTH: You only need to fertilize once a year. REALITY: Wisconsin lawns need 4-5 applications to thrive', 'myth_vs_reality', '{instagram,facebook,linkedin}', '{fertilization}');

-- =============================================================================
-- DONE
-- =============================================================================
