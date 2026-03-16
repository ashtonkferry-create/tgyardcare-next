-- Migration 073: Add content column to ab_test_variants
-- Gap closure: S4 from M2-MILESTONE-AUDIT.md
-- A/B test router (TG-105) needs to deliver variant-specific message content

ALTER TABLE ab_test_variants ADD COLUMN IF NOT EXISTS content TEXT;

COMMENT ON COLUMN ab_test_variants.content IS 'The message content for this variant (SMS body or email subject)';
