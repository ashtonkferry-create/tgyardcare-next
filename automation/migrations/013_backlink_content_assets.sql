-- Migration 013: Linkable Content Assets
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)

CREATE TABLE IF NOT EXISTS linkable_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  asset_type TEXT NOT NULL,
  description TEXT,
  target_keywords TEXT[],
  target_audience TEXT,
  content_url TEXT,
  embed_code TEXT,
  pdf_url TEXT,
  thumbnail_url TEXT,
  preview_image_url TEXT,
  status TEXT DEFAULT 'planning',
  published_at TIMESTAMPTZ,
  is_gated BOOLEAN DEFAULT FALSE,
  gate_type TEXT,
  leads_generated INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,
  bounce_rate DECIMAL(5,2),
  backlinks_earned INTEGER DEFAULT 0,
  referring_domains INTEGER DEFAULT 0,
  last_backlink_at TIMESTAMPTZ,
  creation_cost DECIMAL(10,2) DEFAULT 0,
  promotion_cost DECIMAL(10,2) DEFAULT 0,
  created_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES linkable_assets(id) ON DELETE CASCADE,
  promotion_type TEXT NOT NULL,
  channel TEXT,
  description TEXT,
  target_list_id INTEGER,
  target_audience TEXT,
  status TEXT DEFAULT 'planned',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  backlinks_from_promotion INTEGER DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  topic TEXT,
  target_keywords TEXT[],
  content_type TEXT,
  link_building_angle TEXT,
  target_publications TEXT[],
  outreach_planned BOOLEAN DEFAULT FALSE,
  planned_date DATE,
  assigned_to TEXT,
  status TEXT DEFAULT 'idea',
  draft_url TEXT,
  published_url TEXT,
  published_at TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  backlinks_earned INTEGER DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  is_seasonal BOOLEAN DEFAULT FALSE,
  season TEXT,
  evergreen BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_type ON linkable_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON linkable_assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_published ON linkable_assets(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_backlinks ON linkable_assets(backlinks_earned DESC);

CREATE INDEX IF NOT EXISTS idx_promotions_asset ON asset_promotions(asset_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON asset_promotions(status);

CREATE INDEX IF NOT EXISTS idx_blog_calendar_date ON blog_content_calendar(planned_date);
CREATE INDEX IF NOT EXISTS idx_blog_calendar_status ON blog_content_calendar(status);

-- Views
CREATE OR REPLACE VIEW asset_performance AS
SELECT
  la.id, la.title, la.asset_type, la.status, la.published_at,
  la.page_views, la.backlinks_earned, la.referring_domains, la.leads_generated,
  la.creation_cost + la.promotion_cost AS total_cost,
  CASE
    WHEN la.creation_cost + la.promotion_cost > 0
    THEN ROUND((la.backlinks_earned::DECIMAL / (la.creation_cost + la.promotion_cost + 1)) * 100, 2)
    ELSE 0
  END AS cost_per_link,
  COALESCE(SUM(ap.cost), 0) AS promotion_spend,
  COUNT(ap.id) AS promotion_count
FROM linkable_assets la
LEFT JOIN asset_promotions ap ON ap.asset_id = la.id
WHERE la.status = 'published'
GROUP BY la.id
ORDER BY la.backlinks_earned DESC;

CREATE OR REPLACE VIEW content_calendar_this_month AS
SELECT id, title, content_type, target_keywords, planned_date, status, link_building_angle, is_seasonal, season
FROM blog_content_calendar
WHERE planned_date >= date_trunc('month', CURRENT_DATE)
  AND planned_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
ORDER BY planned_date;

-- Seed: Initial linkable asset ideas for TotalGuard
INSERT INTO linkable_assets (title, slug, asset_type, description, target_keywords, target_audience, status) VALUES
('Madison Lawn Care Seasonal Calendar', 'madison-lawn-care-seasonal-calendar', 'guide', 'Month-by-month guide for Wisconsin homeowners covering all lawn and yard care tasks', ARRAY['madison lawn care schedule', 'wisconsin lawn care calendar', 'seasonal yard maintenance'], 'homeowners', 'planning'),
('Dane County Home Services Cost Guide 2026', 'dane-county-yard-care-cost-guide-2026', 'report', 'Comprehensive pricing guide for lawn and yard care services in the Madison area', ARRAY['madison lawn mowing cost', 'aeration cost madison wi', 'gutter cleaning prices madison'], 'homeowners', 'planning'),
('Madison Freeze-Thaw Lawn Damage Guide', 'madison-freeze-thaw-lawn-guide', 'guide', 'How Wisconsin freeze-thaw cycles damage lawns and what to do about it', ARRAY['wisconsin lawn freeze thaw damage', 'spring lawn recovery madison'], 'homeowners', 'planning'),
('Wisconsin Lawn Aeration Timing Calculator', 'wisconsin-aeration-timing-calculator', 'calculator', 'Interactive tool to determine the best aeration timing for your Madison lawn', ARRAY['when to aerate lawn wisconsin', 'best time aerate madison wi'], 'homeowners', 'planning'),
('Madison Curb Appeal Before/After Lawn Gallery', 'madison-curb-appeal-lawn-gallery', 'guide', 'Photo showcase of lawn and yard transformations in Madison neighborhoods', ARRAY['curb appeal madison lawn', 'before after lawn care madison'], 'homeowners', 'planning')
ON CONFLICT (slug) DO NOTHING;

-- Seed: Blog content ideas for TotalGuard
INSERT INTO blog_content_calendar (title, topic, content_type, target_keywords, link_building_angle, is_seasonal, season, status) VALUES
('Complete Guide to Lawn Care in Wisconsin', 'lawn care', 'guide', ARRAY['lawn care wisconsin', 'madison lawn maintenance guide'], 'Comprehensive resource that local contractors and home blogs can reference', FALSE, NULL, 'idea'),
('How to Prepare Your Madison Lawn for Winter', 'winter prep', 'checklist', ARRAY['winterize lawn madison', 'fall lawn care wisconsin'], 'Seasonal timing makes it highly shareable in fall', TRUE, 'fall', 'idea'),
('DIY vs Professional Lawn Mowing: Real Cost Analysis', 'lawn mowing', 'comparison', ARRAY['diy lawn mowing vs professional', 'lawn service cost madison'], 'Data-driven comparison that home improvement sites reference', FALSE, NULL, 'idea'),
('Madison Homeowner FAQ: Everything About Lawn Care', 'general', 'guide', ARRAY['madison lawn care faq', 'lawn maintenance questions wi'], 'FAQ format earns featured snippets and links', FALSE, NULL, 'idea'),
('When to Aerate, Overseed, and Fertilize in Madison, WI', 'lawn health', 'guide', ARRAY['when to aerate madison wi', 'overseed lawn wisconsin fall'], 'Highly actionable seasonal guide — shareable by realtors and home blogs', TRUE, 'fall', 'idea'),
('State of Madison Lawns: 2026 Report', 'annual report', 'report', ARRAY['madison lawn care market', 'dane county landscaping'], 'Original research earns news coverage and citations', FALSE, NULL, 'idea')
ON CONFLICT DO NOTHING;
