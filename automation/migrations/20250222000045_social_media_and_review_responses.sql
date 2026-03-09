-- Migration 20250222000045: Social Media Posting & AI Review Response Tracking
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Adds tables and views for social media post management
--              and AI-generated review response workflow for TotalGuard Yard Care

-- =============================================================================
-- TABLE: social_posts
-- Tracks posts across all social media platforms with engagement metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('google_business', 'facebook', 'instagram', 'nextdoor', 'tiktok')),
  post_type text NOT NULL CHECK (post_type IN ('job_highlight', 'service_spotlight', 'review_highlight', 'seasonal_tip', 'promotion', 'update', 'offer', 'event', 'scheduled', 'planned')),
  content text,
  content_brief text,
  media_urls text[],
  posted_at timestamptz,
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'scheduled', 'published', 'failed', 'deleted')),
  external_post_id text,
  engagement_likes integer DEFAULT 0,
  engagement_comments integer DEFAULT 0,
  engagement_shares integer DEFAULT 0,
  engagement_clicks integer DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  lead_source_id uuid,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: review_responses
-- Tracks AI-drafted review responses through the approval workflow
-- =============================================================================
CREATE TABLE IF NOT EXISTS review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid,
  reviewer_name text,
  review_rating integer,
  review_text text,
  response_text text NOT NULL,
  ai_model text DEFAULT 'claude-haiku-4-5',
  drafted_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  posted_at timestamptz,
  status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'posted', 'rejected', 'edited')),
  edited_text text,
  approved_by text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- VIEW: social_media_dashboard
-- Aggregated metrics for the social media overview dashboard
-- =============================================================================
CREATE OR REPLACE VIEW social_media_dashboard AS
SELECT
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE status = 'published') as published_posts,
  COUNT(*) FILTER (WHERE status = 'published' AND posted_at > now() - interval '7 days') as posts_last_7d,
  COUNT(*) FILTER (WHERE status = 'published' AND posted_at > now() - interval '30 days') as posts_last_30d,
  COALESCE(SUM(engagement_likes) FILTER (WHERE posted_at > now() - interval '30 days'), 0) as likes_30d,
  COALESCE(SUM(engagement_comments) FILTER (WHERE posted_at > now() - interval '30 days'), 0) as comments_30d,
  COALESCE(SUM(engagement_shares) FILTER (WHERE posted_at > now() - interval '30 days'), 0) as shares_30d,
  COALESCE(SUM(reach) FILTER (WHERE posted_at > now() - interval '30 days'), 0) as reach_30d,
  COUNT(DISTINCT platform) FILTER (WHERE status = 'published' AND posted_at > now() - interval '30 days') as active_platforms
FROM social_posts;

-- =============================================================================
-- VIEW: social_posts_by_platform
-- Per-platform breakdown of post counts and engagement
-- =============================================================================
CREATE OR REPLACE VIEW social_posts_by_platform AS
SELECT
  platform,
  COUNT(*) FILTER (WHERE status = 'published') as total_published,
  COUNT(*) FILTER (WHERE posted_at > now() - interval '7 days' AND status = 'published') as published_7d,
  COALESCE(SUM(engagement_likes + engagement_comments + engagement_shares) FILTER (WHERE posted_at > now() - interval '30 days'), 0) as total_engagement_30d,
  COALESCE(AVG(engagement_likes + engagement_comments + engagement_shares) FILTER (WHERE status = 'published'), 0)::numeric(10,1) as avg_engagement_per_post,
  MAX(posted_at) as last_posted_at
FROM social_posts
GROUP BY platform;

-- =============================================================================
-- VIEW: review_response_dashboard
-- Aggregated metrics for the review response workflow
-- =============================================================================
CREATE OR REPLACE VIEW review_response_dashboard AS
SELECT
  COUNT(*) as total_responses_drafted,
  COUNT(*) FILTER (WHERE status = 'posted') as total_posted,
  COUNT(*) FILTER (WHERE status = 'pending_approval') as pending_approval,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  ROUND(COUNT(*) FILTER (WHERE status = 'posted')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as approval_rate,
  COUNT(*) FILTER (WHERE review_rating <= 3) as negative_reviews_handled,
  COUNT(*) FILTER (WHERE drafted_at > now() - interval '7 days') as drafted_last_7d,
  ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(approved_at, now()) - drafted_at)) / 3600)::numeric, 1) as avg_approval_hours
FROM review_responses;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON social_posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON review_responses FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted_at ON social_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_review_responses_status ON review_responses(status);
CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);

-- =============================================================================
-- ALTER: google_reviews (conditional)
-- Add response tracking columns if the table exists
-- =============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'google_reviews') THEN
    ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS response_text text;
    ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS response_drafted_at timestamptz;
    ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS response_status text DEFAULT 'none' CHECK (response_status IN ('none', 'draft', 'approved', 'posted'));
  END IF;
END $$;
