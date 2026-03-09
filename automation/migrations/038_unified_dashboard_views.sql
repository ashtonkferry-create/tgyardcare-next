-- Migration 038: Unified Dashboard Views
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Aggregated views across ALL subsystems for a single-pane-of-glass admin dashboard
-- Covers: leads, revenue, customer health, reviews, field marketing, SEO, partners, LinkedIn, subscriptions, gift certs

-- ============================================================================
-- HELPER: safe_count / safe_sum
-- Exception-catching wrappers so views don't blow up if a source table
-- was dropped or hasn't been created yet in a given environment.
-- ============================================================================

CREATE OR REPLACE FUNCTION _dashboard_safe_count(p_sql TEXT)
RETURNS BIGINT AS $$
DECLARE
    v_result BIGINT;
BEGIN
    EXECUTE p_sql INTO v_result;
    RETURN COALESCE(v_result, 0);
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION _dashboard_safe_numeric(p_sql TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_result NUMERIC;
BEGIN
    EXECUTE p_sql INTO v_result;
    RETURN COALESCE(v_result, 0);
EXCEPTION WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ============================================================================
-- 1. unified_business_health
-- One-row snapshot of overall business health across every subsystem
-- ============================================================================
CREATE OR REPLACE VIEW unified_business_health AS
SELECT
    -- Lead pipeline
    (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '7 days') AS leads_7d,
    (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days') AS leads_30d,
    (SELECT COUNT(*) FROM leads WHERE status = 'booked' AND created_at >= NOW() - INTERVAL '30 days') AS bookings_30d,

    -- Customer health
    (SELECT ROUND(AVG(health_score)::numeric, 1) FROM leads WHERE health_score IS NOT NULL) AS avg_health_score,
    (SELECT COUNT(*) FROM leads WHERE health_tier = 'churning') AS churning_customers,
    (SELECT COUNT(*) FROM leads WHERE health_tier = 'at_risk') AS at_risk_customers,
    (SELECT COUNT(*) FROM leads WHERE health_tier = 'champion') AS champion_customers,
    (SELECT COALESCE(SUM(lifetime_value), 0) FROM leads WHERE lifetime_value IS NOT NULL) AS total_lifetime_value,

    -- Reviews (table: reviews, migration 018)
    (SELECT COUNT(*) FROM reviews) AS total_reviews,
    (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews) AS avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE created_at >= NOW() - INTERVAL '30 days') AS reviews_30d,

    -- Referral conversions (referral_links -> total_conversions, migration 020)
    (SELECT COALESCE(SUM(total_conversions), 0) FROM referral_links WHERE is_active = TRUE) AS referral_conversions,

    -- LinkedIn outreach (migration 029)
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status NOT IN ('not_interested', 'do_not_contact', 'bounced')) AS linkedin_prospects_active,
    (SELECT COUNT(*) FROM outreach_messages WHERE sent_at >= NOW() - INTERVAL '7 days') AS outreach_messages_7d,

    -- Subscriptions (migration 033)
    (SELECT COUNT(*) FROM customer_subscriptions WHERE status = 'active') AS active_subscriptions,

    -- SEO location pages (migration 037)
    (SELECT COUNT(*) FROM seo_location_pages WHERE status = 'published') AS seo_pages_published,

    -- Gift certificates (migration 034)
    (SELECT COUNT(*) FROM gift_certificates WHERE status = 'active') AS active_gift_certs
;

COMMENT ON VIEW unified_business_health IS 'One-row snapshot: leads, health, reviews, referrals, LinkedIn, subscriptions, SEO, gift certs — TotalGuard Yard Care';


-- ============================================================================
-- 2. field_marketing_summary
-- Field operations compliance overview (migration 024 tables)
-- ============================================================================
CREATE OR REPLACE VIEW field_marketing_summary AS
SELECT
    -- Task completion
    (SELECT COUNT(*) FROM field_marketing_tasks WHERE status = 'completed' AND completed_at >= NOW() - INTERVAL '7 days') AS tasks_completed_7d,
    (SELECT COUNT(*) FROM field_marketing_tasks WHERE status = 'pending') AS tasks_pending,
    (SELECT COUNT(*) FROM field_marketing_tasks WHERE status = 'escalated') AS tasks_escalated,

    -- Yard signs (yard_sign_deployments / yard_sign_inventory)
    (SELECT COUNT(*) FROM yard_sign_inventory WHERE status = 'deployed') AS signs_deployed,

    -- Door hangers (door_hanger_deployments aggregated as batches)
    (SELECT COUNT(*) FROM door_hanger_deployments WHERE created_at >= NOW() - INTERVAL '30 days') AS hanger_batches_30d,
    (SELECT COALESCE(SUM(quantity), 0) FROM door_hanger_deployments WHERE created_at >= NOW() - INTERVAL '30 days') AS hangers_distributed_30d,

    -- Redemption approximation: door_hanger_inventory.redemptions for recent batches
    (SELECT COALESCE(SUM(redemptions), 0) FROM door_hanger_inventory WHERE created_at >= NOW() - INTERVAL '30 days') AS hangers_redeemed_30d
;

COMMENT ON VIEW field_marketing_summary IS 'Field marketing: task completion, yard signs deployed, door hangers distributed & redeemed (30d)';


-- ============================================================================
-- 3. seo_performance_summary
-- SEO bot health across citations, backlinks, media, guest posts, and location pages
-- ============================================================================
CREATE OR REPLACE VIEW seo_performance_summary AS
SELECT
    -- Citations (local_citations, migration 011)
    (SELECT COUNT(*) FROM local_citations WHERE submission_status = 'verified') AS citations_verified,
    (SELECT COUNT(*) FROM local_citations WHERE submission_status = 'submitted') AS citations_pending,

    -- Backlinks (backlinks, migration 015)
    (SELECT COUNT(*) FROM backlinks WHERE is_live = TRUE) AS active_backlinks,
    (SELECT COUNT(*) FROM backlinks WHERE first_seen_at >= NOW() - INTERVAL '30 days') AS new_backlinks_30d,

    -- HARO / media opportunities (media_opportunities, migration 012)
    (SELECT COUNT(*) FROM media_opportunities WHERE response_status = 'sent') AS haro_pitches,

    -- Guest posts (guest_post_opportunities, migration 014)
    (SELECT COUNT(*) FROM guest_post_opportunities WHERE outreach_status = 'published') AS guest_posts_published,

    -- Location pages (seo_location_pages, migration 037)
    (SELECT COUNT(*) FROM seo_location_pages WHERE status = 'published') AS location_pages_published,
    (SELECT COUNT(*) FROM seo_location_pages WHERE status = 'draft') AS location_pages_draft,
    (SELECT COALESCE(SUM(page_views), 0) FROM seo_location_pages) AS total_seo_page_views,
    (SELECT COALESCE(SUM(leads_generated), 0) FROM seo_location_pages) AS total_seo_leads
;

COMMENT ON VIEW seo_performance_summary IS 'SEO: citations, backlinks, HARO pitches, guest posts, location pages + traffic';


-- ============================================================================
-- 4. partner_program_summary
-- Realtor / partner overview (migration 021 tables)
-- ============================================================================
CREATE OR REPLACE VIEW partner_program_summary AS
SELECT
    (SELECT COUNT(*) FROM partners WHERE status = 'active') AS active_partners,
    (SELECT COUNT(*) FROM partner_referrals WHERE created_at >= NOW() - INTERVAL '30 days') AS referrals_30d,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM partner_referrals WHERE commission_status = 'approved') AS total_commissions_approved,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM partner_referrals WHERE commission_status = 'paid') AS total_commissions_paid,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM partner_referrals WHERE commission_status = 'approved' AND created_at >= NOW() - INTERVAL '30 days') AS commissions_30d
;

COMMENT ON VIEW partner_program_summary IS 'Partner program: active partners, referrals, commissions approved/paid (30d)';


-- ============================================================================
-- 5. revenue_overview
-- Revenue snapshot (migration 031 — revenue_attribution table)
-- ============================================================================
CREATE OR REPLACE VIEW revenue_overview AS
SELECT
    (SELECT COALESCE(SUM(revenue), 0) FROM revenue_attribution WHERE attributed_at >= NOW() - INTERVAL '7 days') AS revenue_7d,
    (SELECT COALESCE(SUM(revenue), 0) FROM revenue_attribution WHERE attributed_at >= NOW() - INTERVAL '30 days') AS revenue_30d,
    (SELECT COALESCE(SUM(revenue), 0) FROM revenue_attribution WHERE attributed_at >= DATE_TRUNC('year', NOW())) AS revenue_ytd,
    (SELECT COUNT(*) FROM revenue_attribution WHERE attributed_at >= NOW() - INTERVAL '30 days') AS paid_invoices_30d,
    (SELECT COALESCE(ROUND(AVG(revenue)::numeric, 2), 0) FROM revenue_attribution WHERE attributed_at >= NOW() - INTERVAL '30 days') AS avg_invoice_30d
;

COMMENT ON VIEW revenue_overview IS 'Revenue: 7d, 30d, YTD totals plus invoice count and avg value';


-- ============================================================================
-- 6. linkedin_pipeline_summary
-- LinkedIn outreach funnel (migration 029 tables)
-- ============================================================================
CREATE OR REPLACE VIEW linkedin_pipeline_summary AS
SELECT
    (SELECT COUNT(*) FROM linkedin_prospects) AS total_prospects,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status = 'new') AS new_prospects,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status = 'connection_sent') AS connection_sent,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status = 'connected') AS connected,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status = 'messaged') AS messaged,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status = 'responded') AS responded,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE outreach_status = 'meeting_booked') AS meetings_booked,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE became_partner = TRUE) AS partners_converted,
    (SELECT COUNT(*) FROM linkedin_prospects WHERE became_customer = TRUE) AS customers_converted
;

COMMENT ON VIEW linkedin_pipeline_summary IS 'LinkedIn funnel: prospects by status, meetings booked, conversions';


-- ============================================================================
-- 7. RLS NOTE
-- Views inherit RLS from the tables they query. All source tables already have
-- service_role full-access and authenticated read policies (set in their
-- respective migrations). No additional RLS changes are needed.
-- ============================================================================
