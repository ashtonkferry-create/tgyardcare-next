-- Migration 025: Marketing Calendar & Reminder System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Central source of truth for ALL scheduled marketing activities

CREATE TABLE IF NOT EXISTS marketing_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'email_campaign', 'paper_marketing', 'seasonal_transition',
    'inventory_check', 'planning_milestone'
  )),
  event_subtype TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  brevo_campaign_id INTEGER,
  brevo_list_ids INTEGER[],
  requires_owner_action BOOLEAN DEFAULT FALSE,
  action_required TEXT,
  action_deadline_days INTEGER,
  remind_7_days BOOLEAN DEFAULT FALSE,
  remind_3_days BOOLEAN DEFAULT FALSE,
  remind_1_day BOOLEAN DEFAULT FALSE,
  remind_day_of BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN (
    'upcoming', 'needs_prep', 'ready', 'sent', 'completed', 'cancelled'
  )),
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  service_type TEXT,
  estimated_revenue_impact NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_calendar_date ON marketing_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_type ON marketing_calendar(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_status ON marketing_calendar(status);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_season ON marketing_calendar(season);

-- Function: get_upcoming_reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(p_days_ahead INTEGER DEFAULT 7)
RETURNS TABLE(
  event_id UUID,
  title TEXT,
  event_type TEXT,
  scheduled_date DATE,
  days_until INTEGER,
  action_required TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.id,
    mc.title,
    mc.event_type,
    mc.scheduled_date,
    (mc.scheduled_date - CURRENT_DATE)::INTEGER AS days_until,
    mc.action_required,
    mc.status
  FROM marketing_calendar mc
  WHERE mc.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days_ahead
    AND mc.status NOT IN ('completed', 'cancelled')
  ORDER BY mc.scheduled_date, mc.event_type;
END;
$$ LANGUAGE plpgsql;

-- Seed: TotalGuard annual marketing calendar (key events)
INSERT INTO marketing_calendar (title, event_type, event_subtype, scheduled_date, season, service_type, requires_owner_action, action_required, remind_7_days, remind_3_days, remind_day_of) VALUES
-- Spring season
('Spring Lawn Care Campaign Launch', 'email_campaign', 'seasonal', '2026-03-15', 'spring', 'lawn_mowing', true, 'Approve email copy and send to Brevo list', true, true, true),
('Spring Cleanup Promotion', 'email_campaign', 'promotion', '2026-03-20', 'spring', 'spring_cleanup', true, 'Schedule Brevo campaign', true, false, true),
('Aeration & Overseeding Season Start', 'email_campaign', 'seasonal', '2026-04-01', 'spring', 'aeration', true, 'Launch aeration campaign to existing customers', true, true, true),
('Fertilization Program Enrollment', 'email_campaign', 'upsell', '2026-04-15', 'spring', 'fertilization', false, NULL, false, false, true),
-- Summer season
('Summer Lawn Maintenance Reminder', 'email_campaign', 'seasonal', '2026-06-01', 'summer', 'lawn_mowing', false, NULL, false, false, true),
('Mulching & Garden Bed Care Promo', 'email_campaign', 'promotion', '2026-06-15', 'summer', 'mulching', true, 'Send mulching offer to spring cleanup customers', false, false, true),
-- Fall season
('Fall Cleanup Campaign Launch', 'email_campaign', 'seasonal', '2026-09-15', 'fall', 'fall_cleanup', true, 'Approve fall cleanup campaign', true, true, true),
('Aeration Fall Season', 'email_campaign', 'seasonal', '2026-09-01', 'fall', 'aeration', true, 'Launch fall aeration campaign', true, true, true),
('Leaf Removal Season Start', 'email_campaign', 'seasonal', '2026-10-01', 'fall', 'leaf_removal', false, NULL, false, false, true),
('Gutter Cleaning Fall Promo', 'email_campaign', 'promotion', '2026-10-15', 'fall', 'gutter_cleaning', true, 'Schedule gutter cleaning campaign', true, false, true),
-- Winter season
('Snow Removal Signup Campaign', 'email_campaign', 'seasonal', '2026-11-01', 'winter', 'snow_removal', true, 'Finalize snow removal pricing and send campaign', true, true, true),
('Holiday Season Check-In', 'email_campaign', 'relationship', '2026-12-15', 'winter', NULL, false, NULL, false, false, true),
-- Inventory checks
('Yard Sign Inventory Check', 'inventory_check', 'signs', '2026-03-01', 'spring', NULL, true, 'Count yard signs, reorder if below 50', true, false, true),
('Door Hanger Reorder Check', 'inventory_check', 'hangers', '2026-04-01', 'spring', NULL, true, 'Check door hanger stock, reorder 2,000 if needed', false, false, true),
-- Planning milestones
('Summer Season Planning', 'planning_milestone', 'quarterly', '2026-05-01', 'spring', NULL, true, 'Review spring performance, plan summer campaigns', true, false, true),
('Fall Season Planning', 'planning_milestone', 'quarterly', '2026-08-01', 'summer', NULL, true, 'Review summer performance, plan fall campaigns', true, false, true)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE marketing_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY marketing_calendar_service ON marketing_calendar FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY marketing_calendar_read ON marketing_calendar FOR SELECT USING (auth.role() = 'authenticated');
