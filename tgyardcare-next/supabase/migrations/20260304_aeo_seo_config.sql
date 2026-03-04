-- AEO + SEO Config Migration
-- Apply in Supabase Dashboard for project: lwtmvzhwekgdxkaisfra
-- Date: 2026-03-04

-- seo_config: generic key/value store for dynamic SEO settings
CREATE TABLE IF NOT EXISTS seo_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Seed default aggregate rating (updated daily by review-schema-updater cron)
INSERT INTO seo_config (key, value)
VALUES ('aggregate_rating', '{"ratingValue": "4.9", "reviewCount": "80"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO seo_config (key, value)
VALUES ('domain_rank', '{"rank": null}')
ON CONFLICT (key) DO NOTHING;

-- page_seo: add AEO columns
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS aeo_content jsonb;
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS speakable_schema jsonb;

-- RLS for seo_config
ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON seo_config FOR ALL TO service_role USING (true);

-- automation_config: add new slugs
INSERT INTO automation_config (slug, name, description, tier, is_active, schedule)
VALUES
  ('indexnow-submitter', 'IndexNow Submitter', 'Submits updated URLs to Bing IndexNow for fast crawl discovery', 'foundation', true, '0 7 * * *'),
  ('aeo-optimizer', 'AEO Optimizer', 'Generates AI-search optimized content and speakable schema', 'ai', true, '0 11 * * 3'),
  ('review-schema-updater', 'Review Schema Updater', 'Updates LocalBusiness aggregate rating from reviews table', 'local', true, '0 7 * * *'),
  ('backlink-monitor', 'Backlink Monitor', 'Checks domain authority and known referring domain health', 'monitoring', true, '0 9 15 * *')
ON CONFLICT (slug) DO NOTHING;
