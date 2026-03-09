-- Migration 054: Media Asset Pipeline, Auto-Campaign Creation, Auto-Ad Management
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Full end-to-end automation from technician photos to marketing output

-- ============================================================
-- TABLE 1: media_assets — Central photo repository
-- ============================================================
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT,
    lead_id UUID REFERENCES leads(id),
    uploaded_by TEXT,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT,
    service_type TEXT,
    property_type TEXT DEFAULT 'residential',
    location_address TEXT,
    city TEXT,
    zip TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    ai_tags TEXT[] DEFAULT '{}',
    ai_description TEXT,
    ai_quality_score INT CHECK (ai_quality_score BETWEEN 1 AND 5),
    is_before_after BOOLEAN DEFAULT false,
    before_after_pair_id UUID,
    photo_type TEXT DEFAULT 'after' CHECK (photo_type IN ('before', 'after', 'during', 'team', 'equipment', 'promotional')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    distributed_to_email BOOLEAN DEFAULT false,
    distributed_to_ads BOOLEAN DEFAULT false,
    distributed_to_social BOOLEAN DEFAULT false,
    distributed_to_print BOOLEAN DEFAULT false,
    performance_score DECIMAL(5,2) DEFAULT 0,
    total_impressions INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    total_conversions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_service_type ON media_assets(service_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_approval ON media_assets(approval_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_quality ON media_assets(ai_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_job ON media_assets(job_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_pair ON media_assets(before_after_pair_id);

-- ============================================================
-- TABLE 2: media_usage_log — Track where each photo was used
-- ============================================================
CREATE TABLE IF NOT EXISTS media_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'facebook_ad', 'google_ad', 'instagram', 'gbp', 'nextdoor', 'linkedin', 'print', 'website', 'blog')),
    campaign_id TEXT,
    external_post_id TEXT,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    revenue_attributed DECIMAL(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_media_usage_asset ON media_usage_log(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_channel ON media_usage_log(channel);

-- ============================================================
-- TABLE 3: campaign_templates — Reusable campaign blueprints
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('seasonal', 'weather', 'lifecycle', 'competitor', 'performance', 'photo_driven')),
    trigger_conditions JSONB DEFAULT '{}',
    service_types TEXT[] DEFAULT '{}',
    subject_template TEXT NOT NULL,
    preheader_template TEXT,
    html_template TEXT NOT NULL,
    list_ids INT[] DEFAULT '{}',
    list_selection_criteria JSONB DEFAULT '{}',
    auto_approve BOOLEAN DEFAULT false,
    min_days_between_sends INT DEFAULT 14,
    priority INT DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,
    performance_score DECIMAL(5,2) DEFAULT 0,
    total_sends INT DEFAULT 0,
    avg_open_rate DECIMAL(5,2) DEFAULT 0,
    avg_click_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_templates_trigger ON campaign_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_active ON campaign_templates(is_active);

-- ============================================================
-- TABLE 4: campaign_generation_log — Auto-created campaigns audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES campaign_templates(id),
    trigger_event TEXT NOT NULL,
    trigger_data JSONB DEFAULT '{}',
    brevo_campaign_id INT,
    subject TEXT,
    recipient_count INT DEFAULT 0,
    photos_used UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'approved', 'sent', 'failed', 'cancelled')),
    failure_reason TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    opens INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    revenue_attributed DECIMAL(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_campaign_gen_status ON campaign_generation_log(status);
CREATE INDEX IF NOT EXISTS idx_campaign_gen_template ON campaign_generation_log(template_id);
CREATE INDEX IF NOT EXISTS idx_campaign_gen_date ON campaign_generation_log(generated_at DESC);

-- ============================================================
-- TABLE 5: ad_campaigns — Paid ad campaigns across platforms
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('google_ads', 'facebook_ads', 'instagram_ads', 'nextdoor_ads')),
    campaign_name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'social' CHECK (campaign_type IN ('search', 'display', 'social', 'video', 'shopping', 'local')),
    service_type TEXT,
    objective TEXT DEFAULT 'conversions' CHECK (objective IN ('awareness', 'traffic', 'conversions', 'leads')),
    budget DECIMAL(10,2),
    daily_budget DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    target_zip_codes TEXT[] DEFAULT '{}',
    target_audience JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'failed')),
    external_campaign_id TEXT,
    auto_generated BOOLEAN DEFAULT true,
    template_id UUID REFERENCES campaign_templates(id),
    total_spend DECIMAL(10,2) DEFAULT 0,
    total_impressions INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    total_conversions INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    roas DECIMAL(6,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_service ON ad_campaigns(service_type);

-- ============================================================
-- TABLE 6: ad_creatives — Individual ad variations for A/B testing
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
    media_asset_id UUID REFERENCES media_assets(id),
    headline TEXT NOT NULL,
    description TEXT,
    cta_text TEXT DEFAULT 'Get Free Estimate',
    final_url TEXT DEFAULT 'https://tgyardcare.com',
    display_url TEXT,
    external_ad_id TEXT,
    variant_label TEXT DEFAULT 'A' CHECK (variant_label IN ('A', 'B', 'C', 'D')),
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    spend DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(6,4) DEFAULT 0,
    cpc DECIMAL(8,2) DEFAULT 0,
    roas DECIMAL(6,2) DEFAULT 0,
    quality_score INT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'winner', 'loser', 'testing')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign ON ad_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_media ON ad_creatives(media_asset_id);

-- ============================================================
-- TABLE 7: ad_performance_daily — Time-series ad metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_performance_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_creative_id UUID NOT NULL REFERENCES ad_creatives(id),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
    metric_date DATE NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    spend DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(6,4) DEFAULT 0,
    cpc DECIMAL(8,2) DEFAULT 0,
    UNIQUE(ad_creative_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_ad_perf_date ON ad_performance_daily(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_perf_creative ON ad_performance_daily(ad_creative_id);

-- ============================================================
-- TABLE 8: content_distribution_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS content_distribution_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'facebook_ad', 'google_ad', 'instagram', 'gbp', 'nextdoor', 'linkedin', 'print', 'website', 'blog')),
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'distributed', 'failed', 'skipped')),
    priority INT DEFAULT 5,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    distributed_at TIMESTAMPTZ,
    external_id TEXT,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dist_queue_status ON content_distribution_queue(status);
CREATE INDEX IF NOT EXISTS idx_dist_queue_scheduled ON content_distribution_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_dist_queue_media ON content_distribution_queue(media_asset_id);

-- ============================================================
-- TABLE 9: auto_campaign_schedule — Pre-planned monthly triggers
-- ============================================================
CREATE TABLE IF NOT EXISTS auto_campaign_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    trigger_name TEXT NOT NULL,
    template_id UUID REFERENCES campaign_templates(id),
    target_service_types TEXT[] DEFAULT '{}',
    fire_day INT DEFAULT 1 CHECK (fire_day BETWEEN 1 AND 28),
    auto_fire BOOLEAN DEFAULT true,
    last_fired_at TIMESTAMPTZ,
    next_fire_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_schedule_month ON auto_campaign_schedule(month);
CREATE INDEX IF NOT EXISTS idx_auto_schedule_active ON auto_campaign_schedule(is_active);

-- ============================================================
-- TABLE 10: marketing_performance_summary — Weekly channel rollup
-- ============================================================
CREATE TABLE IF NOT EXISTS marketing_performance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'facebook_ads', 'google_ads', 'instagram', 'gbp', 'nextdoor', 'linkedin', 'seo', 'field_marketing', 'print', 'referrals')),
    campaigns_sent INT DEFAULT 0,
    total_spend DECIMAL(10,2) DEFAULT 0,
    total_impressions INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    total_conversions INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(8,2) DEFAULT 0,
    best_performing_creative_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_start, channel)
);

CREATE INDEX IF NOT EXISTS idx_mkt_perf_week ON marketing_performance_summary(week_start DESC);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION approve_media_asset(p_asset_id UUID)
RETURNS VOID AS $$
DECLARE
    v_service_type TEXT;
    v_channels TEXT[] := ARRAY['email', 'facebook_ad', 'instagram', 'gbp', 'website'];
    v_channel TEXT;
BEGIN
    UPDATE media_assets
    SET approval_status = 'approved', approved_at = NOW(), updated_at = NOW()
    WHERE id = p_asset_id AND approval_status IN ('pending', 'rejected');

    SELECT service_type INTO v_service_type FROM media_assets WHERE id = p_asset_id;

    FOREACH v_channel IN ARRAY v_channels
    LOOP
        INSERT INTO content_distribution_queue (media_asset_id, channel, priority)
        VALUES (p_asset_id, v_channel, CASE WHEN v_channel = 'email' THEN 1 WHEN v_channel IN ('facebook_ad', 'instagram') THEN 2 ELSE 3 END)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_best_performing_photos(p_service_type TEXT, p_limit INT DEFAULT 5)
RETURNS TABLE (
    id UUID, photo_url TEXT, thumbnail_url TEXT, ai_description TEXT,
    ai_quality_score INT, performance_score DECIMAL, total_impressions INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT ma.id, ma.photo_url, ma.thumbnail_url, ma.ai_description,
           ma.ai_quality_score, ma.performance_score, ma.total_impressions
    FROM media_assets ma
    WHERE ma.approval_status IN ('approved', 'auto_approved')
      AND (p_service_type IS NULL OR ma.service_type = p_service_type)
    ORDER BY ma.performance_score DESC, ma.ai_quality_score DESC, ma.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_ad_roas(p_campaign_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_spend DECIMAL;
    v_revenue DECIMAL;
BEGIN
    SELECT COALESCE(SUM(spend), 0), COALESCE(SUM(revenue), 0)
    INTO v_spend, v_revenue
    FROM ad_creatives WHERE campaign_id = p_campaign_id;

    UPDATE ad_campaigns
    SET total_spend = v_spend, total_revenue = v_revenue,
        roas = CASE WHEN v_spend > 0 THEN v_revenue / v_spend ELSE 0 END,
        updated_at = NOW()
    WHERE id = p_campaign_id;

    RETURN CASE WHEN v_spend > 0 THEN v_revenue / v_spend ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_campaign_from_template(
    p_template_id UUID,
    p_trigger_event TEXT,
    p_trigger_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_template RECORD;
BEGIN
    SELECT * INTO v_template FROM campaign_templates WHERE id = p_template_id AND is_active = true;
    IF NOT FOUND THEN RETURN NULL; END IF;

    INSERT INTO campaign_generation_log (template_id, trigger_event, trigger_data, subject, status)
    VALUES (p_template_id, p_trigger_event, p_trigger_data, v_template.subject_template, 'generated')
    RETURNING id INTO v_log_id;

    UPDATE campaign_templates SET total_sends = total_sends + 1, updated_at = NOW()
    WHERE id = p_template_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_marketing_weekly_summary(p_week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE)
RETURNS TABLE (
    channel TEXT, campaigns_sent BIGINT, total_spend DECIMAL,
    total_impressions BIGINT, total_clicks BIGINT, total_conversions BIGINT,
    total_revenue DECIMAL, roi DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT mps.channel, SUM(mps.campaigns_sent)::BIGINT, SUM(mps.total_spend),
           SUM(mps.total_impressions)::BIGINT, SUM(mps.total_clicks)::BIGINT,
           SUM(mps.total_conversions)::BIGINT, SUM(mps.total_revenue),
           CASE WHEN SUM(mps.total_spend) > 0 THEN SUM(mps.total_revenue) / SUM(mps.total_spend) ELSE 0 END
    FROM marketing_performance_summary mps
    WHERE mps.week_start = p_week_start
    GROUP BY mps.channel
    ORDER BY SUM(mps.total_revenue) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW media_pending_approval AS
SELECT ma.*, COUNT(mul.id) AS times_used
FROM media_assets ma
LEFT JOIN media_usage_log mul ON mul.media_asset_id = ma.id
WHERE ma.approval_status = 'pending'
GROUP BY ma.id
ORDER BY ma.ai_quality_score DESC NULLS LAST, ma.created_at ASC;

CREATE OR REPLACE VIEW active_ad_campaigns AS
SELECT ac.*,
    (SELECT COUNT(*) FROM ad_creatives cr WHERE cr.campaign_id = ac.id AND cr.status = 'active') AS active_creatives,
    (SELECT COUNT(*) FROM ad_creatives cr WHERE cr.campaign_id = ac.id AND cr.status = 'winner') AS winning_creatives
FROM ad_campaigns ac
WHERE ac.status = 'active'
ORDER BY ac.roas DESC;

CREATE OR REPLACE VIEW campaign_performance_dashboard AS
SELECT cgl.*,
    ct.name AS template_name, ct.trigger_type, ct.service_types,
    CASE WHEN cgl.recipient_count > 0 THEN (cgl.opens::DECIMAL / cgl.recipient_count * 100) ELSE 0 END AS open_rate,
    CASE WHEN cgl.opens > 0 THEN (cgl.clicks::DECIMAL / cgl.opens * 100) ELSE 0 END AS click_rate,
    CASE WHEN cgl.clicks > 0 THEN (cgl.conversions::DECIMAL / cgl.clicks * 100) ELSE 0 END AS conversion_rate
FROM campaign_generation_log cgl
LEFT JOIN campaign_templates ct ON ct.id = cgl.template_id
ORDER BY cgl.generated_at DESC;

CREATE OR REPLACE VIEW content_distribution_status AS
SELECT cdq.*,
    ma.service_type, ma.photo_url, ma.ai_quality_score, ma.ai_description
FROM content_distribution_queue cdq
JOIN media_assets ma ON ma.id = cdq.media_asset_id
ORDER BY cdq.priority ASC, cdq.scheduled_for ASC;

CREATE OR REPLACE VIEW marketing_roi_by_channel AS
SELECT channel,
    SUM(campaigns_sent) AS total_campaigns,
    SUM(total_spend) AS total_spend,
    SUM(total_impressions) AS total_impressions,
    SUM(total_clicks) AS total_clicks,
    SUM(total_conversions) AS total_conversions,
    SUM(total_revenue) AS total_revenue,
    CASE WHEN SUM(total_spend) > 0 THEN SUM(total_revenue) / SUM(total_spend) ELSE 0 END AS overall_roi
FROM marketing_performance_summary
WHERE week_start >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY channel
ORDER BY overall_roi DESC;

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_distribution_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_campaign_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_performance_summary ENABLE ROW LEVEL SECURITY;

-- Service role has full access (n8n workflows use service role key)
-- Note: Permissive policies here will be replaced by migration 055 (security hardening)
CREATE POLICY media_assets_service ON media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY media_usage_service ON media_usage_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY campaign_templates_service ON campaign_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY campaign_gen_service ON campaign_generation_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY ad_campaigns_service ON ad_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY ad_creatives_service ON ad_creatives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY ad_perf_service ON ad_performance_daily FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY dist_queue_service ON content_distribution_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY auto_schedule_service ON auto_campaign_schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY mkt_perf_service ON marketing_performance_summary FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA: Campaign Templates (TotalGuard Yard Care)
-- ============================================================

INSERT INTO campaign_templates (name, trigger_type, trigger_conditions, service_types, subject_template, preheader_template, html_template, auto_approve, min_days_between_sends) VALUES
('Spring Lawn Care Launch', 'seasonal', '{"month": 3, "day_range": [1, 15]}', '{lawn_mowing,fertilization}',
 'Spring is Here - Your Lawn Needs Attention! {{params.FIRSTNAME}}',
 'Book your spring lawn care before slots fill up',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>Spring Lawn Season is Here!</h2><p>Hi {{params.FIRSTNAME}},</p><p>Winter has left your lawn ready for a fresh start. Our spring fertilization and mowing program will have it looking great fast.</p><div style="text-align:center;margin:20px 0;">{{params.HERO_IMAGE}}</div><p><strong>Spring Special:</strong> Book before April 1st and save 15%!</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/get-quote?utm_source=brevo&utm_campaign=spring_lawn" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Get Your Free Estimate</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057 | totalguardllc@gmail.com</p></div></body></html>',
 false, 30),

('Fall Aeration & Overseeding', 'seasonal', '{"month": 9, "day_range": [1, 15]}', '{aeration}',
 'Fall Aeration Time - Give Your Lawn the Best Winter Head Start!',
 'September is the #1 month for lawn aeration — book now',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>Fall Aeration Season!</h2><p>Hi {{params.FIRSTNAME}},</p><p>September is the best time to aerate your lawn. Pair it with overseeding for a thick, lush lawn next spring.</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/get-quote?service=aeration&utm_source=brevo&utm_campaign=fall_aeration" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Schedule Aeration</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057</p></div></body></html>',
 false, 30),

('Fall Cleanup Alert', 'seasonal', '{"month": 10, "day_range": [15, 31]}', '{fall_cleanup,leaf_removal}',
 'Leaves Are Falling - Book Your Fall Cleanup, {{params.FIRSTNAME}}',
 'Don''t wait for the first freeze — schedule fall cleanup now',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>Fall Cleanup Time!</h2><p>Hi {{params.FIRSTNAME}},</p><p>Leaves left on your lawn over winter can cause significant damage. Our fall cleanup team is ready.</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/get-quote?service=fall_cleanup&utm_source=brevo&utm_campaign=fall_cleanup" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Schedule Fall Cleanup</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057</p></div></body></html>',
 false, 30),

('Gutter Cleaning Alert', 'seasonal', '{"month": 10, "day_range": [1, 15]}', '{gutter_cleaning}',
 'Leaves Are Filling Your Gutters - Protect Your Home, {{params.FIRSTNAME}}',
 'Don''t wait for the first freeze - schedule gutter cleaning now',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>Fall Gutter Cleaning Time!</h2><p>Hi {{params.FIRSTNAME}},</p><p>Clogged gutters cause thousands in water damage. Get ahead of the leaves this fall.</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/get-quote?service=gutter_cleaning&utm_source=brevo&utm_campaign=fall_gutters" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Schedule Gutter Cleaning</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057</p></div></body></html>',
 false, 30),

('Winter Snow Removal Prep', 'seasonal', '{"month": 11, "day_range": [1, 15]}', '{snow_removal}',
 'Winter is Coming - Lock in Your Snow Removal Plan!',
 'Guaranteed response times when you sign up for seasonal snow removal',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2c3e50;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>Seasonal Snow Removal Plans</h2><p>Hi {{params.FIRSTNAME}},</p><p>Don''t get caught in the first snowstorm without a plan. Our seasonal contracts guarantee priority service.</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/snow-removal?utm_source=brevo&utm_campaign=winter_snow" style="background:#3498db;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">View Snow Removal Plans</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057</p></div></body></html>',
 false, 30)

ON CONFLICT DO NOTHING;

-- Weather templates
INSERT INTO campaign_templates (name, trigger_type, trigger_conditions, service_types, subject_template, preheader_template, html_template, auto_approve, min_days_between_sends) VALUES
('Snow Storm Alert', 'weather', '{"condition": "snow", "threshold_inches": 2}', '{snow_removal}',
 'Snow Alert: {{params.SNOW_INCHES}}" Expected - We''ve Got You Covered!',
 'Storm moving in - our crews are ready for your property',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2c3e50;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">Snow Alert!</h1></div><div style="padding:30px;"><h2>{{params.SNOW_INCHES}}" of Snow Expected</h2><p>A winter storm is heading to Madison. Our snow removal crews are standing by.</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/snow-removal?utm_source=brevo&utm_campaign=snow_alert" style="background:#e74c3c;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Get Snow Removal</a></div></div></body></html>',
 true, 3),

('Spring Mowing Alert', 'weather', '{"condition": "warm_streak", "threshold_temp_f": 55, "consecutive_days": 5}', '{lawn_mowing}',
 'Spring Temps Are Here - Time for Your First Mow!',
 'Warm weather means growing grass - let us handle the first cut',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>Spring Mowing Season Is Here!</h2><p>Consistent warm temps mean your lawn is growing fast. Let us handle the first — and every — mow of the season.</p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/get-quote?service=lawn_mowing&utm_source=brevo&utm_campaign=spring_mow_weather" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Book Your First Mow</a></div></div></body></html>',
 true, 10)

ON CONFLICT DO NOTHING;

-- Lifecycle templates
INSERT INTO campaign_templates (name, trigger_type, trigger_conditions, service_types, subject_template, preheader_template, html_template, auto_approve, min_days_between_sends) VALUES
('Welcome + Service Menu', 'lifecycle', '{"event": "first_job_completed"}', '{}',
 'Welcome to the TotalGuard Family, {{params.FIRSTNAME}}!',
 'Here''s everything we can do for your yard',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">Welcome to TotalGuard!</h1></div><div style="padding:30px;"><h2>Thanks for Choosing Us!</h2><p>Hi {{params.FIRSTNAME}},</p><p>We loved working on your {{params.SERVICE_TYPE}}! Did you know we offer a full range of yard care services?</p><ul><li>Lawn Mowing</li><li>Fertilization & Weed Control</li><li>Aeration</li><li>Spring & Fall Cleanup</li><li>Leaf Removal</li><li>Gutter Cleaning</li><li>Snow Removal</li><li>Hardscaping</li></ul><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/services?utm_source=brevo&utm_campaign=welcome" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">View All Services</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057</p></div></body></html>',
 true, 365),

('90-Day Winback', 'lifecycle', '{"event": "inactive_90_days"}', '{}',
 'We Miss You, {{params.FIRSTNAME}}! Here''s a Special Offer',
 'It''s been a while - come back with 20% off any service',
 '<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#2d5a27;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">TotalGuard Yard Care</h1></div><div style="padding:30px;"><h2>We Miss You!</h2><p>Hi {{params.FIRSTNAME}},</p><p>It''s been a few months since your last service with us. We''d love to have you back.</p><p><strong>Come back with 20% off any service!</strong> Use code: <strong>WELCOME20</strong></p><div style="text-align:center;margin:30px 0;"><a href="https://tgyardcare.com/get-quote?promo=WELCOME20&utm_source=brevo&utm_campaign=winback_90" style="background:#4a9e3f;color:#fff;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:18px;">Claim Your 20% Discount</a></div></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#666;"><p>TotalGuard Yard Care | Madison, WI | (608) 535-6057</p></div></body></html>',
 true, 90)

ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Auto Campaign Schedule (12 months)
-- ============================================================
INSERT INTO auto_campaign_schedule (month, trigger_name, target_service_types, fire_day, auto_fire, notes) VALUES
(1, 'New Year Spring Early Bird', '{lawn_mowing,fertilization,aeration}', 5, true, 'Early bird pricing for spring services'),
(2, 'Pre-Spring Fertilization Push', '{fertilization}', 10, true, 'Get on the fertilization schedule before spring'),
(3, 'Spring Lawn Care Launch', '{lawn_mowing,fertilization}', 1, true, 'Main spring lawn mowing and fertilization push'),
(4, 'Spring Cleanup & Mulching', '{spring_cleanup,mulching,garden_bed_care}', 1, true, 'Spring cleanup and garden bed services'),
(5, 'Herbicide & Weed Control Season', '{herbicide_services,weeding}', 1, true, 'Pre-emergent and weed control season opener'),
(6, 'Summer Lawn Maintenance', '{lawn_mowing,fertilization}', 15, true, 'Mid-summer lawn health check-in'),
(7, 'Hardscaping & Curb Appeal', '{hardscaping,mulching,bush_trimming_pruning}', 15, true, 'Summer curb appeal enhancements'),
(8, 'Pre-Fall Aeration Booking', '{aeration}', 15, true, 'Secure fall aeration slot before they fill up'),
(9, 'Fall Aeration & Overseeding', '{aeration}', 1, true, 'Main fall aeration push'),
(10, 'Fall Cleanup & Gutter Alert', '{fall_cleanup,leaf_removal,gutter_cleaning}', 15, true, 'Fall cleanup and gutter cleaning combo push'),
(11, 'Winter Snow Prep', '{snow_removal}', 1, true, 'Seasonal snow removal contracts'),
(12, 'Year-End Thank You', '{}', 15, true, 'Customer appreciation + gift certificates for referrals')
ON CONFLICT DO NOTHING;

-- Create Supabase Storage bucket for media assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('tg-media-assets', 'tg-media-assets', true)
ON CONFLICT (id) DO NOTHING;
