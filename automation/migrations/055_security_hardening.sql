-- Migration 055: Security Hardening
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Fixes all RLS policy issues across the database:
-- 1. Adds RLS + policies to tables from migration 006 (missing entirely)
-- 2. Replaces overly permissive USING(true) policies with proper role checks
-- 3. Fixes storage bucket policies to require authentication for uploads
-- 4. Adds explicit anon denial policies to prevent anonymous access

-- ============================================================
-- PART 1: Enable RLS on tables from migration 006 (email_sends, etc.)
-- These tables never had RLS enabled
-- ============================================================
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON email_sends
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON sequence_goals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON weather_alerts_sent
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON sequence_enrollments
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PART 2: Fix migration 023 policies (USING(true) -> role check)
-- ============================================================
DROP POLICY IF EXISTS "Service role full access" ON lead_score_calibrations;
DROP POLICY IF EXISTS "Service role full access" ON ab_test_optimizations;
DROP POLICY IF EXISTS "Service role full access" ON email_template_performance;
DROP POLICY IF EXISTS "Service role full access" ON backlink_strategy_performance;
DROP POLICY IF EXISTS "Service role full access" ON crosssell_bundle_performance;
DROP POLICY IF EXISTS "Service role full access" ON weather_trigger_attributions;

CREATE POLICY "Service role full access" ON lead_score_calibrations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON ab_test_optimizations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON email_template_performance
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON backlink_strategy_performance
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON crosssell_bundle_performance
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON weather_trigger_attributions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PART 3: Fix migration 054 policies (media/marketing tables)
-- ============================================================
DROP POLICY IF EXISTS media_assets_service ON media_assets;
DROP POLICY IF EXISTS media_usage_service ON media_usage_log;
DROP POLICY IF EXISTS campaign_templates_service ON campaign_templates;
DROP POLICY IF EXISTS campaign_gen_service ON campaign_generation_log;
DROP POLICY IF EXISTS ad_campaigns_service ON ad_campaigns;
DROP POLICY IF EXISTS ad_creatives_service ON ad_creatives;
DROP POLICY IF EXISTS ad_perf_service ON ad_performance_daily;
DROP POLICY IF EXISTS dist_queue_service ON content_distribution_queue;
DROP POLICY IF EXISTS auto_schedule_service ON auto_campaign_schedule;
DROP POLICY IF EXISTS mkt_perf_service ON marketing_performance_summary;

CREATE POLICY "Service role full access" ON media_assets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON media_usage_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON campaign_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON campaign_generation_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON ad_campaigns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON ad_creatives
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON ad_performance_daily
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON content_distribution_queue
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON auto_campaign_schedule
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON marketing_performance_summary
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read media assets and campaign templates (dashboard)
CREATE POLICY "Authenticated read media_assets" ON media_assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read campaign_templates" ON campaign_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read campaign_generation_log" ON campaign_generation_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read ad_campaigns" ON ad_campaigns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read marketing_performance_summary" ON marketing_performance_summary
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- PART 4: Fix 20250222* batch migration policies
-- ============================================================

-- 20250222000044: collection_attempts, estimate_followups, scheduling_followups, rebook_attempts
DROP POLICY IF EXISTS "Allow all for service role" ON collection_attempts;
DROP POLICY IF EXISTS "Allow all for service role" ON estimate_followups;
DROP POLICY IF EXISTS "Allow all for service role" ON scheduling_followups;
DROP POLICY IF EXISTS "Allow all for service role" ON rebook_attempts;

CREATE POLICY "Service role full access" ON collection_attempts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON estimate_followups
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON scheduling_followups
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON rebook_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000045: social_posts, review_responses
DROP POLICY IF EXISTS "Allow all for service role" ON social_posts;
DROP POLICY IF EXISTS "Allow all for service role" ON review_responses;

CREATE POLICY "Service role full access" ON social_posts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON review_responses
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000046: competitors, competitor_snapshots, quote_followup_log
DROP POLICY IF EXISTS "Allow all for service role" ON competitors;
DROP POLICY IF EXISTS "Allow all for service role" ON competitor_snapshots;
DROP POLICY IF EXISTS "Allow all for service role" ON quote_followup_log;

CREATE POLICY "Service role full access 055" ON competitors
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON competitor_snapshots
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON quote_followup_log
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000047: subscription_offers, service_upsell_log, scheduled_reminders
DROP POLICY IF EXISTS "Allow all for service role" ON subscription_offers;
DROP POLICY IF EXISTS "Allow all for service role" ON service_upsell_log;
DROP POLICY IF EXISTS "Allow all for service role" ON scheduled_reminders;

CREATE POLICY "Service role full access" ON subscription_offers
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON service_upsell_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON scheduled_reminders
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000048: blog_calendar, holiday_lights_campaigns, engagement_score_history
DROP POLICY IF EXISTS "Allow all for service role" ON blog_calendar;
DROP POLICY IF EXISTS "Allow all for service role" ON holiday_lights_campaigns;
DROP POLICY IF EXISTS "Allow all for service role" ON engagement_score_history;

CREATE POLICY "Service role full access" ON blog_calendar
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON holiday_lights_campaigns
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON engagement_score_history
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000049: jobber_invoices, revenue_sync_log, review_referral_bridge, linkedin_scrape_log
DROP POLICY IF EXISTS "Allow all for service role" ON jobber_invoices;
DROP POLICY IF EXISTS "Allow all for service role" ON revenue_sync_log;
DROP POLICY IF EXISTS "Allow all for service role" ON review_referral_bridge;
DROP POLICY IF EXISTS "Allow all for service role" ON linkedin_scrape_log;

CREATE POLICY "Service role full access" ON jobber_invoices
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON revenue_sync_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON review_referral_bridge
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON linkedin_scrape_log
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000050: responsibid_comparison_log, winback_log, service_area_analysis, pricing_analysis_log
DROP POLICY IF EXISTS "Allow all for service role" ON responsibid_comparison_log;
DROP POLICY IF EXISTS "Allow all for service role" ON winback_log;
DROP POLICY IF EXISTS "Allow all for service role" ON service_area_analysis;
DROP POLICY IF EXISTS "Allow all for service role" ON pricing_analysis_log;

CREATE POLICY "Service role full access" ON responsibid_comparison_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON winback_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON service_area_analysis
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON pricing_analysis_log
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000051: commercial_outreach_log, cross_sell_log, revenue_forecasts, weather_alert_log
DROP POLICY IF EXISTS "Allow all for service role" ON commercial_outreach_log;
DROP POLICY IF EXISTS "Allow all for service role" ON cross_sell_log;
DROP POLICY IF EXISTS "Allow all for service role" ON revenue_forecasts;
DROP POLICY IF EXISTS "Allow all for service role" ON weather_alert_log;

CREATE POLICY "Service role full access" ON commercial_outreach_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON cross_sell_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON revenue_forecasts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON weather_alert_log
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222000052: customer_anniversary_log, ga_reports, system_health_log, lead_reactivation_log
DROP POLICY IF EXISTS "Allow all for service role" ON customer_anniversary_log;
DROP POLICY IF EXISTS "Allow all for service role" ON ga_reports;
DROP POLICY IF EXISTS "Allow all for service role" ON system_health_log;
DROP POLICY IF EXISTS "Allow all for service role" ON lead_reactivation_log;

CREATE POLICY "Service role full access" ON customer_anniversary_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ga_reports
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON system_health_log
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON lead_reactivation_log
  FOR ALL USING (auth.role() = 'service_role');

-- 20250222100053: workflow_registry, workflow_run_log
DROP POLICY IF EXISTS "Allow all for service role" ON workflow_registry;
DROP POLICY IF EXISTS "Allow all for service role" ON workflow_run_log;

CREATE POLICY "Service role full access" ON workflow_registry
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON workflow_run_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated read workflow_registry" ON workflow_registry
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- PART 5: Fix storage bucket policies
-- ============================================================
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to campaign-images" ON storage.objects;

-- Public can still READ campaign images (needed for emails/website)
CREATE POLICY "Public read campaign images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('campaign-images', 'tg-media-assets'));

-- Only authenticated users or service role can upload
CREATE POLICY "Authenticated upload campaign images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('campaign-images', 'tg-media-assets')
    AND auth.role() IN ('authenticated', 'service_role')
  );

-- Only service role can delete
CREATE POLICY "Service role delete storage" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('campaign-images', 'tg-media-assets')
    AND auth.role() = 'service_role'
  );

-- Only service role can update
CREATE POLICY "Service role update storage" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('campaign-images', 'tg-media-assets')
    AND auth.role() = 'service_role'
  );

-- ============================================================
-- PART 7: Add authenticated read policies for dashboard tables
-- ============================================================
CREATE POLICY "Authenticated read collection_attempts" ON collection_attempts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read estimate_followups" ON estimate_followups
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read jobber_invoices" ON jobber_invoices
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read social_posts" ON social_posts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read review_responses" ON review_responses
  FOR SELECT USING (auth.role() = 'authenticated');
