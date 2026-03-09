-- Migration 032: Blog Content Pipeline
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: AI-generated blog posts with human review workflow
-- Note: blog_posts table already exists from earlier migration. Adding missing columns.

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO blog_posts (table already exists)
-- ============================================================================
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS target_keyword TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_model TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS leads_generated INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================================================
-- 2. CONTENT CALENDAR TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID REFERENCES blog_posts(id),
    scheduled_date DATE NOT NULL,
    topic TEXT NOT NULL,
    target_keyword TEXT,
    category TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'generating', 'generated', 'published', 'skipped')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_target_keyword ON blog_posts(target_keyword);
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);

-- ============================================================================
-- 4. UPDATED_AT TRIGGER ON BLOG_POSTS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- content_calendar
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on content_calendar" ON content_calendar
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read content_calendar" ON content_calendar
    FOR SELECT USING (true);

-- ============================================================================
-- 6. SEED CONTENT CALENDAR — 12 months of 2026 topics for TotalGuard Yard Care
-- ============================================================================
INSERT INTO content_calendar (scheduled_date, topic, target_keyword, category, priority, notes) VALUES
    ('2026-01-15', 'Winter Lawn Care Tips for Madison Homeowners', 'winter lawn care Madison', 'lawn_care', 'high', 'Seasonal relevance. Mention snow removal and protecting lawn from salt damage.'),
    ('2026-02-15', 'Why Early Spring Aeration Should Be on Your 2026 To-Do List', 'spring lawn aeration Madison', 'aeration', 'high', 'Pre-season booking push. Target early-bird scheduling.'),
    ('2026-03-15', 'The Complete Guide to Spring Cleanup in Madison, WI', 'spring yard cleanup Madison', 'spring_cleanup', 'normal', 'Spring thaw content. Educate on debris removal, bed prep, and first mow timing.'),
    ('2026-04-15', '5 Signs Your Gutters Need Professional Cleaning This Spring', 'gutter cleaning signs Madison', 'gutter_cleaning', 'normal', 'Spring rain season. Highlight foundation damage and overflow consequences.'),
    ('2026-05-15', 'How Often Should You Mow Your Lawn? A Madison Homeowner''s Guide', 'lawn mowing frequency Madison', 'lawn_mowing', 'high', 'Peak mowing season opener. Include local grass types and growth patterns.'),
    ('2026-06-15', 'Fertilization vs Weed Control: What Madison Homeowners Need to Know', 'lawn fertilization weed control Madison', 'fertilization', 'normal', 'High-value service education. Explain the seasonal program approach.'),
    ('2026-07-15', 'The Best Time to Schedule Lawn Services in Madison, WI', 'lawn service schedule Madison', 'lawn_care', 'normal', 'Mid-summer scheduling content. Bundle promotion angle for mowing + fertilization.'),
    ('2026-08-15', 'How Professional Landscaping Increases Your Home''s Value', 'landscaping home value Madison', 'landscaping', 'high', 'Real estate tie-in. Target homeowners considering selling.'),
    ('2026-09-15', 'Fall Aeration and Overseeding: Why September is the Perfect Time', 'fall aeration overseeding Madison', 'aeration', 'high', 'Pre-fall timing. Prevent bare spots and strengthen lawn before winter.'),
    ('2026-10-15', 'Leaf Removal Services: When to Book in Madison', 'leaf removal service Madison WI', 'leaf_removal', 'high', 'Early booking push for fall cleanup. Highlight efficiency of professional service.'),
    ('2026-11-15', 'Snow Removal Services: How to Prepare Your Property for Winter', 'snow removal service Madison WI', 'snow_removal', 'high', 'Pre-winter prep. Highlight commercial and residential snow removal programs.'),
    ('2026-12-15', 'Year in Review: TotalGuard Yard Care''s Biggest Moments of 2026', 'TotalGuard Yard Care Madison 2026', 'business_tips', 'normal', 'Community engagement piece. Highlight growth and customer stories.')
ON CONFLICT DO NOTHING;
