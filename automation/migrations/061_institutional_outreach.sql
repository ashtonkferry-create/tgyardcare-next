-- ============================================================================
-- Migration 061: Institutional Outreach System
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Purpose: Vendor list tracking, procurement contacts, RFP monitoring,
--          and long-cycle relationship management for government/institutional
--          targets in Dane County.
-- Date: 2026-02-26
-- ============================================================================

-- ============================================================================
-- 1. INSTITUTIONAL ORGANIZATIONS
-- Master record for each target institution.
-- One row per org (e.g., City of Madison, MMSD, UW-Madison Facilities).
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    org_name TEXT NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN (
        'city', 'village', 'township', 'county_dept',
        'university', 'school_district', 'state_agency',
        'parks_dept', 'library_system', 'hospital_campus',
        'hoa_mgmt_company', 'general_contractor',
        'property_mgmt_company', 'transit_authority', 'other'
    )),

    -- Classification for targeting
    sector TEXT NOT NULL CHECK (sector IN (
        'government', 'education', 'healthcare', 'private_institutional'
    )),

    -- Contact info at org level
    main_phone TEXT,
    main_email TEXT,
    website_url TEXT,
    physical_address TEXT,
    city TEXT DEFAULT 'Madison',
    state TEXT DEFAULT 'WI',
    zip_code TEXT,

    -- Vendor list intelligence
    has_vendor_list BOOLEAN DEFAULT NULL,
    vendor_list_url TEXT,
    vendor_list_name TEXT,
    vendor_list_requirements TEXT[],
    application_status TEXT DEFAULT 'not_started' CHECK (application_status IN (
        'not_started', 'researching', 'application_in_progress',
        'submitted', 'under_review', 'approved', 'rejected', 'expired'
    )),
    application_submitted_at TIMESTAMPTZ,
    application_approved_at TIMESTAMPTZ,
    application_expiry_date DATE,
    application_renewal_date DATE,
    application_notes TEXT,

    -- Procurement intelligence
    procurement_portal_url TEXT,
    procurement_contact_name TEXT,
    procurement_contact_email TEXT,
    procurement_contact_phone TEXT,
    rfp_monitoring_active BOOLEAN DEFAULT FALSE,

    -- Relationship scoring
    relationship_score INTEGER DEFAULT 0 CHECK (relationship_score BETWEEN 0 AND 100),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),

    -- Services needed / opportunity
    services_needed TEXT[],
    estimated_annual_value NUMERIC(10,2),
    total_locations_to_serve INTEGER DEFAULT 1,

    -- Pipeline stage
    pipeline_stage TEXT DEFAULT 'discovery' CHECK (pipeline_stage IN (
        'discovery', 'research', 'first_contact', 'relationship_building',
        'application', 'proposal', 'negotiation', 'active_vendor',
        'lost', 'on_hold'
    )),

    -- Outreach tracking
    first_contacted_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ,
    last_reply_at TIMESTAMPTZ,
    next_followup_at TIMESTAMPTZ,
    total_contacts_sent INTEGER DEFAULT 0,
    total_replies_received INTEGER DEFAULT 0,

    -- Attribution
    source TEXT DEFAULT 'manual' CHECK (source IN (
        'manual', 'apollo_scrape', 'rfp_monitor', 'referral', 'self_inquiry'
    )),
    discovered_at TIMESTAMPTZ DEFAULT NOW(),

    -- Integration links
    brevo_contact_id TEXT,
    commercial_account_id UUID,

    notes TEXT,
    tags TEXT[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_orgs_type ON institutional_orgs(org_type);
CREATE INDEX IF NOT EXISTS idx_inst_orgs_sector ON institutional_orgs(sector);
CREATE INDEX IF NOT EXISTS idx_inst_orgs_pipeline ON institutional_orgs(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_inst_orgs_app_status ON institutional_orgs(application_status);
CREATE INDEX IF NOT EXISTS idx_inst_orgs_next_followup ON institutional_orgs(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inst_orgs_priority ON institutional_orgs(priority);
CREATE INDEX IF NOT EXISTS idx_inst_orgs_renewal ON institutional_orgs(application_renewal_date) WHERE application_renewal_date IS NOT NULL;


-- ============================================================================
-- 2. INSTITUTIONAL CONTACTS
-- Individual procurement/facilities contacts within each org.
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES institutional_orgs(id) ON DELETE CASCADE,

    -- Identity
    first_name TEXT,
    last_name TEXT,
    title TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,

    -- Contact role classification
    contact_role TEXT CHECK (contact_role IN (
        'procurement_officer', 'facilities_director', 'operations_manager',
        'dept_head', 'budget_authority', 'maintenance_supervisor',
        'hoa_board_member', 'property_manager', 'admin_contact', 'other'
    )),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    is_decision_maker BOOLEAN DEFAULT FALSE,

    -- Outreach status (per-contact)
    outreach_status TEXT DEFAULT 'new' CHECK (outreach_status IN (
        'new', 'enriched', 'sequence_enrolled', 'contacted', 'replied',
        'meeting_scheduled', 'meeting_held', 'converted',
        'not_interested', 'do_not_contact', 'bounced'
    )),
    current_sequence_step INTEGER DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    last_reply_at TIMESTAMPTZ,
    reply_sentiment TEXT CHECK (reply_sentiment IN ('positive', 'neutral', 'negative', 'out_of_office')),

    -- Enrichment
    enrichment_source TEXT CHECK (enrichment_source IN ('apollo', 'manual', 'linkedin', 'website', 'referral')),
    enriched_at TIMESTAMPTZ,
    apollo_id TEXT,

    -- Notes
    notes TEXT,
    do_not_contact BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_contacts_org ON institutional_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_inst_contacts_email ON institutional_contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inst_contacts_status ON institutional_contacts(outreach_status);
CREATE INDEX IF NOT EXISTS idx_inst_contacts_primary ON institutional_contacts(is_primary_contact) WHERE is_primary_contact = TRUE;


-- ============================================================================
-- 3. VENDOR LIST APPLICATIONS
-- Tracks formal vendor list applications, renewals, and revenue from each.
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendor_list_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES institutional_orgs(id) ON DELETE CASCADE,

    -- Application details
    list_name TEXT NOT NULL,
    application_round INTEGER DEFAULT 1,
    portal_name TEXT,
    portal_url TEXT,

    -- Requirements checklist
    requirements_checklist JSONB DEFAULT '{
        "general_liability_insurance": false,
        "workers_comp_insurance": false,
        "business_license": false,
        "bonded": false,
        "references_submitted": false,
        "w9_submitted": false,
        "sam_gov_registered": false,
        "local_business_preference": false
    }',
    all_requirements_met BOOLEAN DEFAULT FALSE,

    -- Documents
    documents_submitted TEXT[],
    documents_notes TEXT,

    -- Timeline
    application_opened_date DATE,
    deadline_date DATE,
    submitted_at TIMESTAMPTZ,
    decision_expected_date DATE,
    decision_received_at TIMESTAMPTZ,
    decision TEXT DEFAULT 'pending' CHECK (decision IN ('pending', 'approved', 'rejected', 'waitlisted', 'withdrawn')),
    rejection_reason TEXT,

    -- If approved
    vendor_number TEXT,
    approved_services TEXT[],
    contract_start_date DATE,
    contract_expiry_date DATE,
    renewal_reminder_sent BOOLEAN DEFAULT FALSE,
    renewal_reminder_sent_at TIMESTAMPTZ,

    -- Value tracking
    jobs_won_from_list INTEGER DEFAULT 0,
    revenue_from_list NUMERIC(10,2) DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vla_org ON vendor_list_applications(org_id);
CREATE INDEX IF NOT EXISTS idx_vla_decision ON vendor_list_applications(decision);
CREATE INDEX IF NOT EXISTS idx_vla_deadline ON vendor_list_applications(deadline_date) WHERE deadline_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vla_expiry ON vendor_list_applications(contract_expiry_date) WHERE contract_expiry_date IS NOT NULL;


-- ============================================================================
-- 4. RFP OPPORTUNITIES
-- Individual bid/RFP postings from government procurement portals.
-- ============================================================================
CREATE TABLE IF NOT EXISTS rfp_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES institutional_orgs(id),

    -- RFP identity
    rfp_number TEXT,
    rfp_title TEXT NOT NULL,
    source_portal TEXT,
    source_url TEXT,
    raw_text TEXT,

    -- Classification (AI-assigned)
    services_requested TEXT[],
    estimated_value NUMERIC(10,2),
    relevance_score INTEGER DEFAULT 0 CHECK (relevance_score BETWEEN 0 AND 100),
    is_relevant BOOLEAN DEFAULT NULL,

    -- Timeline
    posted_date DATE,
    questions_deadline DATE,
    submission_deadline DATE NOT NULL,
    award_date DATE,

    -- Our response
    bid_status TEXT DEFAULT 'identified' CHECK (bid_status IN (
        'identified', 'reviewing', 'preparing_bid', 'submitted',
        'awarded', 'not_awarded', 'withdrawn', 'passed'
    )),
    bid_submitted_at TIMESTAMPTZ,
    bid_amount NUMERIC(10,2),
    award_amount NUMERIC(10,2),
    pass_reason TEXT,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rfp_number_portal ON rfp_opportunities(rfp_number, source_portal) WHERE rfp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rfp_org ON rfp_opportunities(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rfp_status ON rfp_opportunities(bid_status);
CREATE INDEX IF NOT EXISTS idx_rfp_deadline ON rfp_opportunities(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_rfp_relevance ON rfp_opportunities(relevance_score DESC) WHERE is_relevant = TRUE;


-- ============================================================================
-- 5. INSTITUTIONAL OUTREACH LOG
-- Every communication attempt with institutional contacts.
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutional_outreach_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES institutional_orgs(id),
    contact_id UUID REFERENCES institutional_contacts(id),

    -- Message details
    channel TEXT NOT NULL CHECK (channel IN ('email', 'phone', 'linkedin', 'in_person', 'mail', 'portal_message')),
    subject TEXT,
    message_preview TEXT,
    template_name TEXT,
    sequence_step INTEGER,

    -- Tracking
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    reply_text TEXT,
    reply_sentiment TEXT CHECK (reply_sentiment IN ('positive', 'neutral', 'negative', 'out_of_office')),
    bounced BOOLEAN DEFAULT FALSE,

    -- Outcome flags
    meeting_scheduled BOOLEAN DEFAULT FALSE,
    meeting_date TIMESTAMPTZ,
    application_triggered BOOLEAN DEFAULT FALSE,
    rfp_triggered BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_log_org ON institutional_outreach_log(org_id);
CREATE INDEX IF NOT EXISTS idx_inst_log_contact ON institutional_outreach_log(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inst_log_sent ON institutional_outreach_log(sent_at);


-- ============================================================================
-- 6. SEED DATA: High-Value Dane County Institutional Targets
-- Adapted for TotalGuard Yard Care lawn/landscape services
-- ============================================================================
INSERT INTO institutional_orgs (org_name, org_type, sector, city, state, zip_code, website_url, services_needed, estimated_annual_value, priority, pipeline_stage, has_vendor_list, vendor_list_url, procurement_portal_url)
VALUES
    ('City of Madison - Facilities Management', 'city', 'government', 'Madison', 'WI', '53703',
     'https://www.cityofmadison.com/engineering/facilities',
     '{lawn_mowing,spring_cleanup,fall_cleanup,leaf_removal,snow_removal}', 25000, 'critical', 'research', TRUE,
     'https://www.cityofmadison.com/finance/purchasing',
     'https://www.cityofmadison.com/finance/purchasing/bids'),

    ('Dane County Facilities Management', 'county_dept', 'government', 'Madison', 'WI', '53703',
     'https://facilities.countyofdane.com',
     '{lawn_mowing,fertilization,spring_cleanup,fall_cleanup,snow_removal}', 40000, 'critical', 'research', TRUE,
     'https://danecounty.prod.acquia-sites.com/purchasing',
     'https://danecounty.prod.acquia-sites.com/purchasing'),

    ('UW-Madison Facilities Planning & Management', 'university', 'education', 'Madison', 'WI', '53706',
     'https://fpm.wisc.edu',
     '{lawn_mowing,fertilization,aeration,spring_cleanup,fall_cleanup,snow_removal}', 75000, 'critical', 'research', TRUE,
     'https://www.bussvc.wisc.edu/purch/',
     'https://www.bussvc.wisc.edu/purch/'),

    ('Madison Metropolitan School District', 'school_district', 'education', 'Madison', 'WI', '53703',
     'https://www.madison.k12.wi.us',
     '{lawn_mowing,fertilization,spring_cleanup,fall_cleanup,snow_removal}', 30000, 'high', 'discovery', NULL, NULL, NULL),

    ('Madison Area Technical College', 'university', 'education', 'Madison', 'WI', '53704',
     'https://www.madisoncollege.edu',
     '{lawn_mowing,fertilization,aeration,snow_removal}', 20000, 'high', 'discovery', NULL, NULL, NULL),

    ('Madison Public Library - All Branches', 'library_system', 'government', 'Madison', 'WI', '53703',
     'https://www.madisonpubliclibrary.org',
     '{lawn_mowing,spring_cleanup,fall_cleanup,snow_removal}', 8000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Madison Parks Division', 'parks_dept', 'government', 'Madison', 'WI', '53711',
     'https://www.cityofmadison.com/parks',
     '{lawn_mowing,fertilization,aeration,spring_cleanup,fall_cleanup,leaf_removal}', 15000, 'high', 'discovery', NULL, NULL, NULL),

    ('Wisconsin State Capitol - DOA', 'state_agency', 'government', 'Madison', 'WI', '53702',
     'https://doa.wi.gov',
     '{lawn_mowing,fertilization,spring_cleanup,snow_removal}', 20000, 'medium', 'research', TRUE,
     'https://vendornet.wi.gov',
     'https://vendornet.wi.gov'),

    ('UnityPoint Health - Meriter Hospital', 'hospital_campus', 'healthcare', 'Madison', 'WI', '53715',
     'https://www.unitypoint.org/meriter',
     '{lawn_mowing,fertilization,spring_cleanup,fall_cleanup,snow_removal}', 35000, 'high', 'discovery', NULL, NULL, NULL),

    ('SSM Health St. Mary''s Hospital', 'hospital_campus', 'healthcare', 'Madison', 'WI', '53715',
     'https://www.ssmhealth.com',
     '{lawn_mowing,fertilization,spring_cleanup,snow_removal}', 20000, 'high', 'discovery', NULL, NULL, NULL),

    ('UW Health - University Hospital', 'hospital_campus', 'healthcare', 'Madison', 'WI', '53792',
     'https://www.uwhealth.org',
     '{lawn_mowing,fertilization,aeration,spring_cleanup,fall_cleanup,snow_removal}', 45000, 'critical', 'discovery', NULL, NULL, NULL),

    ('Madison Metro Transit', 'transit_authority', 'government', 'Madison', 'WI', '53714',
     'https://www.cityofmadison.com/metro',
     '{lawn_mowing,spring_cleanup,fall_cleanup,snow_removal}', 12000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Veridian Homes - HOA Portfolio', 'hoa_mgmt_company', 'private_institutional', 'Madison', 'WI', '53711',
     'https://www.veridianhomes.com',
     '{lawn_mowing,fertilization,aeration,mulching,spring_cleanup,fall_cleanup}', 18000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Findorff Construction', 'general_contractor', 'private_institutional', 'Madison', 'WI', '53703',
     'https://www.findorff.com',
     '{lawn_mowing,hardscaping,spring_cleanup,fall_cleanup}', 25000, 'high', 'discovery', NULL, NULL, NULL),

    ('McGrath General Contracting', 'general_contractor', 'private_institutional', 'Madison', 'WI', '53713',
     'https://www.mcgrathgc.com',
     '{lawn_mowing,hardscaping,spring_cleanup}', 15000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Sun Prairie Area School District', 'school_district', 'education', 'Sun Prairie', 'WI', '53590',
     'https://www.sunprairieschools.org',
     '{lawn_mowing,fertilization,spring_cleanup,fall_cleanup,snow_removal}', 12000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Verona Area School District', 'school_district', 'education', 'Verona', 'WI', '53593',
     'https://www.verona.k12.wi.us',
     '{lawn_mowing,fertilization,spring_cleanup,snow_removal}', 10000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Village of Middleton', 'village', 'government', 'Middleton', 'WI', '53562',
     'https://www.ci.middleton.wi.us',
     '{lawn_mowing,spring_cleanup,fall_cleanup,snow_removal}', 8000, 'medium', 'discovery', NULL, NULL, NULL),

    ('City of Fitchburg', 'city', 'government', 'Fitchburg', 'WI', '53711',
     'https://www.cityoffitchburg.com',
     '{lawn_mowing,spring_cleanup,fall_cleanup,snow_removal}', 8000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Edgewood College', 'university', 'education', 'Madison', 'WI', '53711',
     'https://www.edgewood.edu',
     '{lawn_mowing,fertilization,aeration,spring_cleanup,fall_cleanup,snow_removal}', 12000, 'medium', 'discovery', NULL, NULL, NULL),

    ('Waunakee Community School District', 'school_district', 'education', 'Waunakee', 'WI', '53597',
     'https://www.waunakee.k12.wi.us',
     '{lawn_mowing,fertilization,spring_cleanup,snow_removal}', 8000, 'low', 'discovery', NULL, NULL, NULL),

    ('City of Sun Prairie', 'city', 'government', 'Sun Prairie', 'WI', '53590',
     'https://www.cityofsunprairie.com',
     '{lawn_mowing,spring_cleanup,fall_cleanup,snow_removal}', 10000, 'medium', 'discovery', NULL, NULL, NULL),

    ('JP Cullen Construction', 'general_contractor', 'private_institutional', 'Madison', 'WI', '53718',
     'https://www.jpcullen.com',
     '{lawn_mowing,hardscaping,spring_cleanup,fall_cleanup}', 20000, 'high', 'discovery', NULL, NULL, NULL),

    ('Stark Company Realtors - Property Mgmt', 'property_mgmt_company', 'private_institutional', 'Madison', 'WI', '53703',
     'https://www.starkcompany.com',
     '{lawn_mowing,fertilization,aeration,spring_cleanup,fall_cleanup,gutter_cleaning}', 15000, 'high', 'discovery', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 7. VIEWS
-- ============================================================================

-- Pipeline dashboard
CREATE OR REPLACE VIEW institutional_pipeline_dashboard AS
SELECT
    org_type,
    sector,
    COUNT(*) AS total_orgs,
    COUNT(*) FILTER (WHERE pipeline_stage = 'discovery') AS in_discovery,
    COUNT(*) FILTER (WHERE pipeline_stage = 'research') AS in_research,
    COUNT(*) FILTER (WHERE pipeline_stage = 'first_contact') AS in_first_contact,
    COUNT(*) FILTER (WHERE pipeline_stage = 'relationship_building') AS in_relationship,
    COUNT(*) FILTER (WHERE pipeline_stage = 'application') AS in_application,
    COUNT(*) FILTER (WHERE pipeline_stage = 'active_vendor') AS active_vendors,
    COALESCE(SUM(estimated_annual_value) FILTER (WHERE pipeline_stage = 'active_vendor'), 0) AS active_vendor_value,
    COALESCE(SUM(estimated_annual_value), 0) AS total_pipeline_value,
    COUNT(*) FILTER (WHERE application_status = 'approved') AS approved_applications,
    COUNT(*) FILTER (WHERE application_renewal_date <= CURRENT_DATE + INTERVAL '60 days') AS renewals_due_60d
FROM institutional_orgs
GROUP BY org_type, sector
ORDER BY total_pipeline_value DESC;

-- Follow-up queue (used by WF 172 outreach sender)
CREATE OR REPLACE VIEW institutional_followup_queue AS
SELECT
    o.id AS org_id,
    o.org_name,
    o.org_type,
    o.sector,
    o.priority,
    o.pipeline_stage,
    o.next_followup_at,
    o.total_contacts_sent,
    o.estimated_annual_value,
    o.services_needed,
    c.id AS contact_id,
    c.first_name AS contact_first_name,
    c.last_name AS contact_last_name,
    c.email AS contact_email,
    c.title AS contact_title,
    c.contact_role,
    c.outreach_status AS contact_outreach_status,
    c.current_sequence_step
FROM institutional_orgs o
LEFT JOIN institutional_contacts c ON c.org_id = o.id AND c.is_primary_contact = TRUE AND c.do_not_contact = FALSE
WHERE o.next_followup_at <= NOW()
  AND o.pipeline_stage NOT IN ('active_vendor', 'lost', 'on_hold')
ORDER BY
    CASE o.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END,
    o.next_followup_at ASC;

-- Vendor list renewal alerts (used by WF 175)
CREATE OR REPLACE VIEW vendor_list_renewal_alerts AS
SELECT
    o.id AS org_id,
    o.org_name,
    o.org_type,
    o.priority,
    v.id AS application_id,
    v.list_name,
    v.contract_expiry_date,
    v.renewal_reminder_sent,
    v.vendor_number,
    v.jobs_won_from_list,
    v.revenue_from_list,
    (v.contract_expiry_date - CURRENT_DATE) AS days_until_expiry,
    o.procurement_contact_email
FROM institutional_orgs o
JOIN vendor_list_applications v ON v.org_id = o.id
WHERE v.decision = 'approved'
  AND v.contract_expiry_date IS NOT NULL
  AND v.contract_expiry_date >= CURRENT_DATE
  AND v.contract_expiry_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY v.contract_expiry_date ASC;

-- Active RFP opportunities (used by WF 170, 174)
CREATE OR REPLACE VIEW rfp_active_opportunities AS
SELECT
    r.id,
    r.org_id,
    o.org_name,
    r.rfp_number,
    r.rfp_title,
    r.source_portal,
    r.source_url,
    r.services_requested,
    r.relevance_score,
    r.estimated_value,
    r.submission_deadline,
    r.bid_status,
    (r.submission_deadline - CURRENT_DATE) AS days_to_deadline
FROM rfp_opportunities r
LEFT JOIN institutional_orgs o ON o.id = r.org_id
WHERE r.bid_status IN ('identified', 'reviewing', 'preparing_bid')
  AND r.submission_deadline >= CURRENT_DATE
ORDER BY r.relevance_score DESC, r.submission_deadline ASC;

-- Revenue summary (feeds WF 126 weekly report)
CREATE OR REPLACE VIEW institutional_revenue_summary AS
SELECT
    COUNT(DISTINCT o.id) AS total_orgs_tracked,
    COUNT(DISTINCT o.id) FILTER (WHERE o.pipeline_stage = 'active_vendor') AS active_vendors,
    COALESCE(SUM(v.revenue_from_list), 0) AS total_revenue_from_vendor_lists,
    COALESCE(SUM(o.estimated_annual_value) FILTER (WHERE o.pipeline_stage = 'active_vendor'), 0) AS active_annual_value,
    COALESCE(SUM(o.estimated_annual_value), 0) AS total_pipeline_value,
    COUNT(DISTINCT r.id) FILTER (WHERE r.bid_status IN ('identified','reviewing','preparing_bid')) AS open_rfps,
    COUNT(DISTINCT v.id) FILTER (WHERE v.decision = 'approved') AS approved_vendor_lists
FROM institutional_orgs o
LEFT JOIN vendor_list_applications v ON v.org_id = o.id
LEFT JOIN rfp_opportunities r ON r.org_id = o.id;


-- ============================================================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_institutional_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_inst_orgs_updated BEFORE UPDATE ON institutional_orgs
    FOR EACH ROW EXECUTE FUNCTION update_institutional_updated_at();
CREATE OR REPLACE TRIGGER trg_inst_contacts_updated BEFORE UPDATE ON institutional_contacts
    FOR EACH ROW EXECUTE FUNCTION update_institutional_updated_at();
CREATE OR REPLACE TRIGGER trg_vla_updated BEFORE UPDATE ON vendor_list_applications
    FOR EACH ROW EXECUTE FUNCTION update_institutional_updated_at();
CREATE OR REPLACE TRIGGER trg_rfp_updated BEFORE UPDATE ON rfp_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_institutional_updated_at();


-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE institutional_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_list_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_outreach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON institutional_orgs
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON institutional_contacts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON vendor_list_applications
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON rfp_opportunities
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON institutional_outreach_log
  FOR ALL USING (auth.role() = 'service_role');
