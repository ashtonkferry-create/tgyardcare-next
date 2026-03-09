-- Migration: Blog Content Pipeline Enhancements, Engagement Scoring, Seasonal Upsell Tracking
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Description: Extends existing blog_posts table with SEO metrics, adds blog calendar,
--              seasonal service campaign tracking, and engagement score history.

-- ============================================================================
-- 1. EXTEND EXISTING BLOG_POSTS TABLE (from migration 032)
-- ============================================================================
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS organic_impressions integer DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS organic_clicks integer DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS avg_position numeric(4,1);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS service_focus text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS location_focus text;

-- ============================================================================
-- 2. BLOG CONTENT CALENDAR
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE SET NULL,
  planned_date date NOT NULL,
  topic text NOT NULL,
  target_keyword text,
  category text,
  assigned_to text DEFAULT 'ai',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. SEASONAL SERVICE UPSELL CAMPAIGN TRACKING
-- Tracks seasonal campaigns (spring aeration, fall cleanup, winter snow, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS seasonal_service_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  campaign_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  season text CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  service_slug text,
  services_history text[],
  message_type text CHECK (message_type IN ('early_bird', 'standard', 'urgency', 'last_chance')),
  channel text CHECK (channel IN ('email', 'sms', 'both')),
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  booked boolean DEFAULT false,
  booked_at timestamptz,
  revenue numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. ENGAGEMENT SCORE HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS engagement_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  previous_score numeric(5,2),
  new_score numeric(5,2),
  score_change numeric(5,2),
  previous_tier text,
  new_tier text,
  factors jsonb,
  calculated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. VIEWS
-- ============================================================================

-- Blog content pipeline dashboard
CREATE OR REPLACE VIEW blog_pipeline_dashboard AS
SELECT
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE status = 'draft') as drafts,
  COUNT(*) FILTER (WHERE status = 'review') as in_review,
  COUNT(*) FILTER (WHERE status = 'idea') as ideas,
  COUNT(*) FILTER (WHERE ai_generated) as ai_generated,
  COALESCE(SUM(organic_clicks), 0) as total_organic_clicks,
  COALESCE(SUM(organic_impressions), 0) as total_impressions,
  COALESCE(SUM(leads_generated), 0) as total_leads_from_blog,
  ROUND(AVG(word_count) FILTER (WHERE status = 'published'), 0) as avg_word_count,
  jsonb_build_object(
    'how-to', COUNT(*) FILTER (WHERE category = 'how-to'),
    'seasonal', COUNT(*) FILTER (WHERE category = 'seasonal'),
    'local-seo', COUNT(*) FILTER (WHERE category = 'local-seo'),
    'case-study', COUNT(*) FILTER (WHERE category = 'case-study'),
    'tips', COUNT(*) FILTER (WHERE category = 'tips'),
    'commercial', COUNT(*) FILTER (WHERE category = 'commercial'),
    'faq', COUNT(*) FILTER (WHERE category = 'faq')
  ) as by_category
FROM blog_posts;

-- Seasonal service campaign performance
CREATE OR REPLACE VIEW seasonal_campaigns_dashboard AS
SELECT
  campaign_year,
  season,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE booked) as total_booked,
  ROUND(COUNT(*) FILTER (WHERE booked)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as booking_rate,
  COALESCE(SUM(revenue) FILTER (WHERE booked), 0) as total_revenue,
  COUNT(*) FILTER (WHERE opened) as total_opened,
  ROUND(COUNT(*) FILTER (WHERE opened)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate,
  jsonb_build_object(
    'early_bird', COUNT(*) FILTER (WHERE message_type = 'early_bird'),
    'standard', COUNT(*) FILTER (WHERE message_type = 'standard'),
    'urgency', COUNT(*) FILTER (WHERE message_type = 'urgency'),
    'last_chance', COUNT(*) FILTER (WHERE message_type = 'last_chance')
  ) as by_message_type
FROM seasonal_service_campaigns
GROUP BY campaign_year, season;

-- Engagement score trends
CREATE OR REPLACE VIEW engagement_score_trends AS
SELECT
  DATE_TRUNC('week', calculated_at)::date as week,
  COUNT(*) as scores_calculated,
  ROUND(AVG(new_score), 2) as avg_score,
  ROUND(AVG(score_change), 2) as avg_change,
  COUNT(*) FILTER (WHERE new_tier = 'champion') as champions,
  COUNT(*) FILTER (WHERE new_tier = 'active') as active,
  COUNT(*) FILTER (WHERE new_tier = 'at_risk') as at_risk,
  COUNT(*) FILTER (WHERE new_tier = 'dormant') as dormant,
  COUNT(*) FILTER (WHERE score_change > 0) as improved,
  COUNT(*) FILTER (WHERE score_change < 0) as declined
FROM engagement_score_history
GROUP BY DATE_TRUNC('week', calculated_at)
ORDER BY week DESC;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE blog_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_service_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_score_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_calendar' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON blog_calendar FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seasonal_service_campaigns' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON seasonal_service_campaigns FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'engagement_score_history' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON engagement_score_history FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_organic ON blog_posts(organic_clicks);
CREATE INDEX IF NOT EXISTS idx_blog_calendar_date ON blog_calendar(planned_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_campaigns_lead ON seasonal_service_campaigns(lead_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_campaigns_year_season ON seasonal_service_campaigns(campaign_year, season);
CREATE INDEX IF NOT EXISTS idx_engagement_history_lead ON engagement_score_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_engagement_history_date ON engagement_score_history(calculated_at);

-- ============================================================================
-- 8. SEED BLOG CONTENT CALENDAR (next 12 weeks - TotalGuard Yard Care topics)
-- ============================================================================
INSERT INTO blog_calendar (planned_date, topic, target_keyword, category) VALUES
  ('2026-03-02', '10 Signs Your Lawn Needs Professional Care This Spring', 'lawn care madison wi spring', 'how-to'),
  ('2026-03-09', 'Spring Lawn Care Checklist for Madison, WI Homeowners', 'spring lawn care checklist madison', 'seasonal'),
  ('2026-03-16', 'Why Aeration Is the #1 Thing Madison Lawns Need Every Fall', 'lawn aeration madison wi', 'tips'),
  ('2026-03-23', 'Commercial Lawn Maintenance: What Property Managers Need to Know', 'commercial lawn care madison wi', 'commercial'),
  ('2026-03-30', 'How Often Should You Fertilize Your Lawn in Wisconsin?', 'lawn fertilization schedule wisconsin', 'faq'),
  ('2026-04-06', 'Before & After: Spring Cleanup Transformation in Middleton, WI', 'spring cleanup middleton wi', 'case-study'),
  ('2026-04-13', 'The Complete Guide to Lawn Care in Madison, Wisconsin', 'lawn care guide madison wisconsin', 'how-to'),
  ('2026-04-20', 'Lawn Care Prices in Madison: What to Expect in 2026', 'lawn care prices madison wi', 'local-seo'),
  ('2026-04-27', '5 Reasons to Bundle Lawn and Gutter Services in Spring', 'lawn and gutter service bundle madison', 'tips'),
  ('2026-05-04', 'Best Time to Schedule Aeration and Overseeding in Wisconsin', 'lawn aeration season wisconsin', 'seasonal'),
  ('2026-05-11', 'Mulching Your Garden Beds: DIY vs Professional Service', 'mulching service madison wi', 'how-to'),
  ('2026-05-18', 'How TotalGuard Yard Care Helped a Waunakee HOA Save Time and Money', 'hoa lawn care waunakee wi', 'case-study')
ON CONFLICT DO NOTHING;
