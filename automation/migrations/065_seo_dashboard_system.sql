-- Migration 065: SEO Dashboard System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Tables: seo_tasks, gbp_optimization_scores, content_ab_tests, content_ab_results, seo_intelligence_log
-- Views: seo_dashboard_overview, seo_task_summary, content_ab_test_results, keyword_heatmap_data
-- RPCs: get_gbp_optimization_score(), get_seo_task_queue(), reject_seo_task()

-- ============================================================
-- Table: seo_tasks
-- SEO action items with 24h auto-apply logic
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL CHECK (task_type IN (
    'gbp_update', 'photo_optimize', 'post_create',
    'citation_submit', 'keyword_target', 'content_recommendation',
    'attribute_update', 'category_update', 'description_update',
    'qa_response', 'review_response', 'seo_fix'
  )),
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'auto_applied', 'rejected'
  )),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'gbp', 'content', 'citations', 'keywords', 'technical', 'reviews', 'general'
  )),
  auto_apply_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  source_workflow TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_tasks_status ON seo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_auto_apply ON seo_tasks(auto_apply_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_seo_tasks_category ON seo_tasks(category);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_priority ON seo_tasks(priority DESC);

-- ============================================================
-- Table: gbp_optimization_scores
-- Historical GBP health scores with category breakdowns
-- ============================================================
CREATE TABLE IF NOT EXISTS gbp_optimization_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Expected structure:
  -- {
  --   "photos": { "score": 85, "count": 24, "recommendation": "..." },
  --   "description": { "score": 90, "length": 750, "has_keywords": true },
  --   "categories": { "score": 100, "primary": "...", "secondary": [...] },
  --   "attributes": { "score": 70, "total": 15, "filled": 10 },
  --   "posts": { "score": 80, "last_7_days": 3, "recommendation": "..." },
  --   "reviews": { "score": 95, "count": 127, "avg_rating": 4.9, "response_rate": 0.92 },
  --   "q_and_a": { "score": 60, "total": 5, "answered": 3 }
  -- }
  recommendations JSONB DEFAULT '[]'::jsonb,
  applied_changes JSONB DEFAULT '[]'::jsonb,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gbp_scores_scored_at ON gbp_optimization_scores(scored_at DESC);

-- ============================================================
-- Table: content_ab_tests
-- A/B test definitions for content variations
-- ============================================================
CREATE TABLE IF NOT EXISTS content_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  content_idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  variant_a JSONB NOT NULL,
  -- { "caption": "...", "hashtags": [...], "hook": "...", "media_url": "..." }
  variant_b JSONB NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  winner TEXT CHECK (winner IN ('a', 'b')),
  confidence_level FLOAT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN (
    'running', 'completed', 'inconclusive', 'cancelled'
  )),
  winning_insights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_ab_tests_status ON content_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_platform ON content_ab_tests(platform);
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_dates ON content_ab_tests(start_date, end_date);

-- ============================================================
-- Table: content_ab_results
-- Per-variant engagement measurements
-- ============================================================
CREATE TABLE IF NOT EXISTS content_ab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID NOT NULL REFERENCES content_ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
  social_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ab_results_test ON content_ab_results(ab_test_id);
CREATE INDEX IF NOT EXISTS idx_ab_results_variant ON content_ab_results(ab_test_id, variant);

-- ============================================================
-- Table: seo_intelligence_log
-- Algorithm changes and SEO best practice updates
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_intelligence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN (
    'google_blog', 'search_engine_journal', 'moz',
    'search_engine_land', 'semrush', 'ahrefs',
    'local_seo_guide', 'bright_local', 'manual', 'ai_analysis'
  )),
  change_type TEXT NOT NULL CHECK (change_type IN (
    'core_update', 'local_update', 'feature_change',
    'ranking_factor', 'best_practice', 'penalty_warning',
    'new_feature', 'deprecation'
  )),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  impact_assessment TEXT,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  source_url TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_intel_detected ON seo_intelligence_log(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_intel_type ON seo_intelligence_log(change_type);
CREATE INDEX IF NOT EXISTS idx_seo_intel_applied ON seo_intelligence_log(applied);

-- ============================================================
-- Add ai_descriptions column to media_assets if not exists
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'ai_descriptions'
  ) THEN
    ALTER TABLE media_assets ADD COLUMN ai_descriptions JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================
-- View: seo_dashboard_overview
-- Single-query dashboard data aggregation
-- ============================================================
CREATE OR REPLACE VIEW seo_dashboard_overview AS
SELECT
  -- Latest GBP Score
  (SELECT overall_score FROM gbp_optimization_scores ORDER BY scored_at DESC LIMIT 1) AS gbp_score,
  (SELECT category_scores FROM gbp_optimization_scores ORDER BY scored_at DESC LIMIT 1) AS gbp_categories,
  -- Previous GBP Score (for delta)
  (SELECT overall_score FROM gbp_optimization_scores ORDER BY scored_at DESC LIMIT 1 OFFSET 1) AS gbp_previous_score,
  -- Task counts
  (SELECT count(*) FROM seo_tasks WHERE status = 'pending') AS pending_tasks,
  (SELECT count(*) FROM seo_tasks WHERE status = 'completed' OR status = 'auto_applied') AS completed_tasks,
  (SELECT count(*) FROM seo_tasks WHERE status = 'pending' AND auto_apply_at <= now()) AS overdue_tasks,
  -- Keyword stats (last 7 days)
  (SELECT count(DISTINCT keyword) FROM keyword_rankings WHERE date >= CURRENT_DATE - 7) AS tracked_keywords,
  (SELECT count(*) FROM keyword_rankings WHERE date >= CURRENT_DATE - 7 AND rank_position <= 3) AS top3_keywords,
  (SELECT count(*) FROM keyword_rankings WHERE date >= CURRENT_DATE - 7 AND local_pack = true) AS local_pack_keywords,
  -- AI Visibility (latest)
  (SELECT count(*) FROM ai_visibility_checks WHERE date >= CURRENT_DATE - 7 AND mentioned = true) AS ai_mentions_count,
  (SELECT count(*) FROM ai_visibility_checks WHERE date >= CURRENT_DATE - 7) AS ai_checks_total,
  -- Social posts (last 30 days)
  (SELECT count(*) FROM social_posts WHERE created_at >= now() - interval '30 days') AS posts_last_30d,
  -- Active A/B tests
  (SELECT count(*) FROM content_ab_tests WHERE status = 'running') AS active_ab_tests,
  -- Content ideas pipeline
  (SELECT count(*) FROM content_ideas WHERE status = 'idea') AS ideas_pending,
  (SELECT count(*) FROM content_ideas WHERE status = 'scripted') AS ideas_scripted,
  -- SEO Intelligence
  (SELECT count(*) FROM seo_intelligence_log WHERE detected_at >= now() - interval '7 days') AS intel_updates_7d;

-- ============================================================
-- View: seo_task_summary
-- Task breakdown by status and category
-- ============================================================
CREATE OR REPLACE VIEW seo_task_summary AS
SELECT
  category,
  status,
  count(*) AS task_count,
  min(created_at) AS oldest_task,
  max(priority) AS highest_priority,
  count(*) FILTER (WHERE auto_apply_at IS NOT NULL AND auto_apply_at <= now() AND status = 'pending') AS overdue_count
FROM seo_tasks
GROUP BY category, status
ORDER BY category, status;

-- ============================================================
-- View: content_ab_test_results
-- Test results with engagement comparison
-- ============================================================
CREATE OR REPLACE VIEW content_ab_test_results AS
SELECT
  t.id AS test_id,
  t.test_name,
  t.platform,
  t.status,
  t.winner,
  t.confidence_level,
  t.start_date,
  t.end_date,
  t.winning_insights,
  -- Variant A totals
  COALESCE(a.total_impressions, 0) AS variant_a_impressions,
  COALESCE(a.total_engagement, 0) AS variant_a_engagement,
  COALESCE(a.total_clicks, 0) AS variant_a_clicks,
  CASE WHEN COALESCE(a.total_impressions, 0) > 0
    THEN round((COALESCE(a.total_engagement, 0)::numeric / a.total_impressions) * 100, 2)
    ELSE 0 END AS variant_a_engagement_rate,
  -- Variant B totals
  COALESCE(b.total_impressions, 0) AS variant_b_impressions,
  COALESCE(b.total_engagement, 0) AS variant_b_engagement,
  COALESCE(b.total_clicks, 0) AS variant_b_clicks,
  CASE WHEN COALESCE(b.total_impressions, 0) > 0
    THEN round((COALESCE(b.total_engagement, 0)::numeric / b.total_impressions) * 100, 2)
    ELSE 0 END AS variant_b_engagement_rate,
  -- Variant captions (for display)
  t.variant_a->>'caption' AS variant_a_caption,
  t.variant_b->>'caption' AS variant_b_caption
FROM content_ab_tests t
LEFT JOIN (
  SELECT ab_test_id,
    sum(impressions) AS total_impressions,
    sum(engagement) AS total_engagement,
    sum(clicks) AS total_clicks
  FROM content_ab_results WHERE variant = 'a'
  GROUP BY ab_test_id
) a ON a.ab_test_id = t.id
LEFT JOIN (
  SELECT ab_test_id,
    sum(impressions) AS total_impressions,
    sum(engagement) AS total_engagement,
    sum(clicks) AS total_clicks
  FROM content_ab_results WHERE variant = 'b'
  GROUP BY ab_test_id
) b ON b.ab_test_id = t.id
ORDER BY t.created_at DESC;

-- ============================================================
-- View: keyword_heatmap_data
-- Keyword x Date matrix for heatmap visualization
-- ============================================================
CREATE OR REPLACE VIEW keyword_heatmap_data AS
SELECT
  kr.keyword,
  kr.date,
  kr.rank_position,
  kr.previous_position,
  kr.local_pack,
  kr.search_engine,
  CASE
    WHEN kr.rank_position <= 3 THEN 'top3'
    WHEN kr.rank_position <= 10 THEN 'page1'
    WHEN kr.rank_position <= 20 THEN 'page2'
    WHEN kr.rank_position <= 50 THEN 'page3_5'
    ELSE 'beyond50'
  END AS position_tier,
  CASE
    WHEN kr.previous_position IS NOT NULL THEN kr.previous_position - kr.rank_position
    ELSE 0
  END AS position_change
FROM keyword_rankings kr
WHERE kr.date >= CURRENT_DATE - 30
ORDER BY kr.keyword, kr.date DESC;

-- ============================================================
-- RPC: get_gbp_optimization_score()
-- Returns latest score with delta from previous
-- ============================================================
CREATE OR REPLACE FUNCTION get_gbp_optimization_score()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest RECORD;
  previous RECORD;
  result JSONB;
BEGIN
  SELECT * INTO latest
  FROM gbp_optimization_scores
  ORDER BY scored_at DESC
  LIMIT 1;

  SELECT * INTO previous
  FROM gbp_optimization_scores
  ORDER BY scored_at DESC
  LIMIT 1 OFFSET 1;

  IF latest IS NULL THEN
    RETURN jsonb_build_object(
      'score', 0,
      'categories', '{}'::jsonb,
      'delta', 0,
      'recommendations', '[]'::jsonb,
      'scored_at', null,
      'has_data', false
    );
  END IF;

  result := jsonb_build_object(
    'score', latest.overall_score,
    'categories', latest.category_scores,
    'delta', COALESCE(latest.overall_score - previous.overall_score, 0),
    'recommendations', latest.recommendations,
    'applied_changes', latest.applied_changes,
    'scored_at', latest.scored_at,
    'has_data', true
  );

  RETURN result;
END;
$$;

-- ============================================================
-- RPC: get_seo_task_queue(p_status, p_limit)
-- Filterable task list with auto-apply countdown
-- ============================================================
CREATE OR REPLACE FUNCTION get_seo_task_queue(
  p_status TEXT DEFAULT 'pending',
  p_limit INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tasks JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'task_type', t.task_type,
      'title', t.title,
      'description', t.description,
      'priority', t.priority,
      'status', t.status,
      'category', t.category,
      'auto_apply_at', t.auto_apply_at,
      'hours_until_auto_apply',
        CASE WHEN t.auto_apply_at IS NOT NULL AND t.status = 'pending'
          THEN EXTRACT(EPOCH FROM (t.auto_apply_at - now())) / 3600
          ELSE null
        END,
      'is_overdue', (t.auto_apply_at IS NOT NULL AND t.auto_apply_at <= now() AND t.status = 'pending'),
      'metadata', t.metadata,
      'source_workflow', t.source_workflow,
      'created_at', t.created_at
    ) ORDER BY t.priority DESC, t.created_at ASC
  ), '[]'::jsonb) INTO tasks
  FROM seo_tasks t
  WHERE (p_status = 'all' OR t.status = p_status)
  LIMIT p_limit;

  RETURN jsonb_build_object(
    'tasks', tasks,
    'total', (SELECT count(*) FROM seo_tasks WHERE p_status = 'all' OR status = p_status),
    'pending_count', (SELECT count(*) FROM seo_tasks WHERE status = 'pending'),
    'overdue_count', (SELECT count(*) FROM seo_tasks WHERE status = 'pending' AND auto_apply_at <= now())
  );
END;
$$;

-- ============================================================
-- RPC: reject_seo_task(p_task_id)
-- Marks task as rejected, prevents auto-apply
-- ============================================================
CREATE OR REPLACE FUNCTION reject_seo_task(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_row RECORD;
BEGIN
  SELECT * INTO task_row FROM seo_tasks WHERE id = p_task_id;

  IF task_row IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task not found');
  END IF;

  IF task_row.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task is not pending (status: ' || task_row.status || ')');
  END IF;

  UPDATE seo_tasks
  SET status = 'rejected',
      rejected_at = now(),
      updated_at = now()
  WHERE id = p_task_id;

  RETURN jsonb_build_object(
    'success', true,
    'task_id', p_task_id,
    'title', task_row.title,
    'rejected_at', now()
  );
END;
$$;

-- ============================================================
-- Trigger: auto-update updated_at on seo_tasks
-- ============================================================
CREATE OR REPLACE FUNCTION update_seo_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_seo_tasks_updated_at
  BEFORE UPDATE ON seo_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_tasks_updated_at();

CREATE OR REPLACE FUNCTION update_ab_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_ab_tests_updated_at
  BEFORE UPDATE ON content_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_ab_tests_updated_at();

-- ============================================================
-- Grant access for anon/service role
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON seo_tasks TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON gbp_optimization_scores TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_ab_tests TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_ab_results TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON seo_intelligence_log TO anon, authenticated, service_role;

GRANT SELECT ON seo_dashboard_overview TO anon, authenticated, service_role;
GRANT SELECT ON seo_task_summary TO anon, authenticated, service_role;
GRANT SELECT ON content_ab_test_results TO anon, authenticated, service_role;
GRANT SELECT ON keyword_heatmap_data TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION get_gbp_optimization_score() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_seo_task_queue(TEXT, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION reject_seo_task(UUID) TO anon, authenticated, service_role;
