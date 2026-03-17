-- Migration 073: Add selected_services column to leads table
-- Purpose: Store multi-service annual plan selections from the configurator widget
-- Format: JSONB array of service objects with pricing, frequency, etc.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS selected_services jsonb;

COMMENT ON COLUMN leads.selected_services IS 'Multi-service annual plan selections from configurator widget (JSONB array)';
