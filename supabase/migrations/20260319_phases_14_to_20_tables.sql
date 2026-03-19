-- Phase 14: Review Generation Machine
CREATE TABLE IF NOT EXISTS review_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone text,
  customer_email text,
  customer_name text,
  request_type text NOT NULL,
  source_workflow text NOT NULL,
  google_review_received boolean DEFAULT false,
  followup_sent boolean DEFAULT false,
  followup_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_review_requests_phone ON review_requests(customer_phone);
CREATE INDEX IF NOT EXISTS idx_review_requests_created ON review_requests(created_at);

CREATE TABLE IF NOT EXISTS google_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id text UNIQUE NOT NULL,
  author_name text,
  rating integer NOT NULL,
  review_text text,
  publish_time timestamptz,
  overall_rating numeric(2,1),
  total_reviews integer,
  is_five_star boolean DEFAULT false,
  needs_response boolean DEFAULT true,
  response_draft text,
  response_approved boolean DEFAULT false,
  response_posted boolean DEFAULT false,
  social_media_queued boolean DEFAULT false,
  social_media_posted boolean DEFAULT false,
  referral_sms_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_google_reviews_review_id ON google_reviews(review_id);
CREATE INDEX IF NOT EXISTS idx_google_reviews_rating ON google_reviews(rating);

-- Phase 15: Retention & Lifetime Value
CREATE TABLE IF NOT EXISTS weather_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  customer_count integer,
  conditions text
);

-- Add winback tracking to leads (safe if column already exists)
DO $$ BEGIN
  ALTER TABLE leads ADD COLUMN IF NOT EXISTS winback_sent_at timestamptz;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add neighbor outreach tracking to leads (Phase 20)
DO $$ BEGIN
  ALTER TABLE leads ADD COLUMN IF NOT EXISTS neighbor_sms_sent_at timestamptz;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Phase 17: Social Media Machine
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_text text NOT NULL,
  image_url text,
  platforms text[] DEFAULT ARRAY['instagram', 'linkedin', 'pinterest'],
  post_type text NOT NULL,
  pillar text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  scheduled_for timestamptz,
  published_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  batch_week date NOT NULL,
  engagement_data jsonb DEFAULT '{}',
  source text DEFAULT 'ai_generated' CHECK (source IN ('ai_generated', 'review_highlight', 'manual')),
  review_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_social_posts_batch ON social_posts(batch_week);

-- Phase 18: GBP Domination
CREATE TABLE IF NOT EXISTS gbp_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_content text NOT NULL,
  image_prompt text,
  season text,
  topic text,
  status text NOT NULL DEFAULT 'pending_approval',
  generated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  published_at timestamptz,
  published_via text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gbp_posts_status ON gbp_posts(status);
CREATE INDEX IF NOT EXISTS idx_gbp_posts_topic ON gbp_posts(topic);

CREATE TABLE IF NOT EXISTS gbp_faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  season text NOT NULL,
  quarter text NOT NULL,
  faq_content jsonb NOT NULL,
  status text DEFAULT 'pending_review',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gbp_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  score integer NOT NULL,
  grade text NOT NULL,
  breakdown jsonb NOT NULL,
  review_count integer,
  review_rating numeric(2,1),
  post_count_30d integer,
  scored_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Phase 19: Intelligence Command Center
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_name text NOT NULL,
  rating numeric(2,1),
  review_count integer,
  snapshot_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_date ON competitor_snapshots(snapshot_date);

-- Phase 16: Content SEO (keyword tracking)
CREATE TABLE IF NOT EXISTS seo_rankings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword text NOT NULL,
  position numeric(5,1),
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(keyword, date)
);
CREATE INDEX IF NOT EXISTS idx_seo_rankings_keyword ON seo_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_seo_rankings_date ON seo_rankings(date);
