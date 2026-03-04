-- SEO Automation Suite Migration
-- Apply in Supabase Dashboard for project: lwtmvzhwekgdxkaisfra
-- Date: 2026-03-04

-- page_speed_results: stores Core Web Vitals data from PageSpeed Insights
CREATE TABLE IF NOT EXISTS page_speed_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  score integer,
  lcp_ms integer,
  cls numeric(6,4),
  tbt_ms integer,
  strategy text DEFAULT 'mobile',
  checked_at timestamptz DEFAULT now()
);

-- competitor_snapshots: stores monthly snapshots of competitor service pages
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_name text NOT NULL,
  pages jsonb,
  snapshot_at timestamptz DEFAULT now()
);

-- reviews: stores customer reviews for response drafting
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  source text DEFAULT 'google',
  response_draft text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- social_posts: stores AI-generated social content for approval
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_fb text,
  content_ig text,
  hashtags text,
  season text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'posted', 'rejected')),
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- page_seo additional columns for new automations
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS refreshed_content text;
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS refreshed_at timestamptz;
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS rankability_score integer;
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS speed_score integer;

-- contact_submissions: add review request columns
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS review_request_draft text;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS review_requested_at timestamptz;

-- automation_config: ensure all new slugs have entries
INSERT INTO automation_config (slug, is_active, description)
VALUES
  ('image-alt-checker', true, 'Checks pages for images missing alt text'),
  ('heading-auditor', true, 'Audits H1/H2 heading structure on key pages'),
  ('schema-validator', true, 'Validates JSON-LD structured data'),
  ('internal-link-optimizer', true, 'Identifies pages with too few internal links'),
  ('page-speed-monitor', true, 'Monitors Core Web Vitals via PageSpeed Insights'),
  ('content-refresher', true, 'Generates fresh content for stale pages'),
  ('rank-tracker', true, 'Tracks on-page keyword rankability signals'),
  ('competitor-monitor', true, 'Monitors competitor service page changes'),
  ('review-request', true, 'Generates personalized review request drafts'),
  ('review-response-drafter', true, 'Drafts responses for new reviews'),
  ('social-auto-post', true, 'Generates seasonal social media post drafts'),
  ('citation-sync', true, 'Checks NAP consistency across citation directories')
ON CONFLICT (slug) DO NOTHING;

-- RLS policies for new tables (service role has full access)
ALTER TABLE page_speed_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for cron routes using service role key)
CREATE POLICY "service_role_all" ON page_speed_results FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON competitor_snapshots FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON reviews FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all" ON social_posts FOR ALL TO service_role USING (true);
