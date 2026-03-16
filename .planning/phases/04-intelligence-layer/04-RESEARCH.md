# Phase 4: Intelligence Layer - Research Findings

**Researched:** 2026-03-16
**Status:** Ready for planning

---

## 1. Supabase Tables Needed

### 1A. Tables That Already Exist (Reuse/Extend)

These tables are already deployed and contain the foundation for intelligence:

| Table | Migration | What It Has | What Phase 4 Needs |
|-------|-----------|-------------|---------------------|
| `revenue_attribution` | 031 | lead_id, invoice_id, revenue, lead_source, service_type | Already complete for last-touch attribution |
| `revenue_by_source` (view) | 031 | Aggregated revenue by lead source | Good as-is for weekly reports |
| `monthly_revenue` (view) | 031 | Monthly revenue trends | Good for month-over-month comparison |
| `revenue_by_service` (view) | 031 | Revenue by service type | Good for weekly report |
| `ab_tests` | 016 | id (TEXT), post_path, test_type, status | Currently website CTA only -- needs extending for SMS/email |
| `ab_test_variants` | 002 | id, test_id, title, weight | Works for SMS/email variants too |
| `ab_test_impressions` | 002 | test_id, variant_id, visitor_id, page_path | Website only -- SMS/email use "sends" not impressions |
| `ab_test_conversions` | 009 | test_id, variant_id, event_type, visitor_id | event_type CHECK constraint too narrow (cta_click, form_submit, phone_click) |
| `ab_test_performance` (view) | 023 | Joins tests + variants + impressions + conversions | Uses website impressions model -- won't work for SMS/email |
| `ad_campaigns` | 054 | Full campaign tracking (platform, budget, spend, ROAS) | Has google_ads in platform CHECK -- reusable |
| `ad_creatives` | 054 | A/B variant tracking per campaign | Has spend, clicks, conversions, CTR, CPC, ROAS |
| `ad_performance_daily` | 054 | Time-series daily metrics per creative | Perfect for Google Ads sync |
| `jobber_invoices` | 049 | Invoice data with attribution columns | Already has lead_source + `update_lead_revenue_from_jobber()` RPC |
| `revenue_sync_log` | 049 | Sync audit trail | Track when revenue data was last pulled |
| `leads` | 001 + many | source, utm_*, total_revenue, lead_score | Has source for attribution, total_revenue for LTV |
| `email_sends` | 006 | Per-send tracking with opened_at, clicked_at | Needs variant_id column for A/B |
| `sms_sends` | 027 | Per-send tracking | Needs variant_id column for A/B |
| `source_attribution` (view) | 023 | Lead counts + booking rate by source | Good for reports |
| `seo_weekly_reports` | 057 | Stores weekly SEO report snapshots | Pattern to follow for intelligence reports |

### 1B. New Tables Required (Migration 072+)

**Table: `intelligence_reports`** -- Weekly/monthly intelligence report storage
```
id UUID PK
report_type TEXT ('weekly_intelligence', 'monthly_trend', 'ad_performance', 'ab_test_results', 'revenue_attribution')
report_period_start DATE
report_period_end DATE
report_data JSONB  -- full report payload
highlights JSONB   -- key takeaways (top 3-5 bullet points)
anomalies JSONB    -- any metrics that deviated >25% from 4-week avg
sent_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(report_type, report_period_start)
```

**Table: `intelligence_metrics`** -- Time-series KPI snapshots for anomaly detection
```
id UUID PK
metric_date DATE
metric_name TEXT ('leads_total', 'leads_by_source_{source}', 'revenue_total', 'revenue_by_source_{source}', 'avg_job_value', 'conversion_rate', 'cost_per_lead', 'ad_spend', 'ad_roas', 'sms_response_rate', 'email_open_rate', 'quote_conversion_rate')
metric_value DECIMAL(12,2)
created_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(metric_date, metric_name)
```

**Table: `ab_test_sends`** -- SMS/email A/B test send tracking (supplements website impressions)
```
id UUID PK
test_id TEXT REFERENCES ab_tests(id)
variant_id TEXT REFERENCES ab_test_variants(id)
channel TEXT CHECK ('sms', 'email')
recipient_phone TEXT
recipient_email TEXT
sent_at TIMESTAMPTZ DEFAULT NOW()
delivered BOOLEAN DEFAULT FALSE
opened BOOLEAN DEFAULT FALSE  -- email only
clicked BOOLEAN DEFAULT FALSE
converted BOOLEAN DEFAULT FALSE
conversion_event TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

**Table: `google_ads_daily`** -- Daily Google Ads account-level metrics
```
id UUID PK
metric_date DATE NOT NULL
campaign_id TEXT
campaign_name TEXT
ad_group_id TEXT
ad_group_name TEXT
impressions INTEGER DEFAULT 0
clicks INTEGER DEFAULT 0
conversions DECIMAL(8,2) DEFAULT 0
cost_micros BIGINT DEFAULT 0  -- Google Ads reports in micros (1/1,000,000 of currency)
cost DECIMAL(10,2) DEFAULT 0
conversion_value DECIMAL(10,2) DEFAULT 0
ctr DECIMAL(6,4) DEFAULT 0
avg_cpc DECIMAL(8,2) DEFAULT 0
roas DECIMAL(6,2) DEFAULT 0
search_impression_share DECIMAL(5,2)
created_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(metric_date, campaign_id, COALESCE(ad_group_id, ''))
```

**Table: `google_ads_alerts`** -- Budget guardrails and anomaly alerts
```
id UUID PK
alert_type TEXT CHECK ('budget_exceeded', 'no_conversions_48h', 'cpc_spike', 'roas_drop', 'spend_anomaly')
campaign_id TEXT
campaign_name TEXT
alert_data JSONB
action_taken TEXT  -- 'alerted', 'auto_paused', 'none'
resolved BOOLEAN DEFAULT FALSE
resolved_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT NOW()
```

### 1C. Column Extensions to Existing Tables

**`ab_tests`** -- extend for SMS/email testing:
```sql
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'website' CHECK (channel IN ('website', 'sms', 'email'));
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS min_sends_per_variant INTEGER DEFAULT 30;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS auto_winner BOOLEAN DEFAULT TRUE;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS winner_variant_id TEXT;
ALTER TABLE ab_tests ADD COLUMN IF NOT EXISTS winner_declared_at TIMESTAMPTZ;
ALTER TABLE ab_tests DROP CONSTRAINT IF EXISTS ab_tests_status_check;
ALTER TABLE ab_tests ADD CONSTRAINT ab_tests_status_check CHECK (status IN ('active', 'paused', 'completed', 'winner_declared'));
```

**`ab_test_conversions`** -- extend event_type for SMS/email:
```sql
ALTER TABLE ab_test_conversions DROP CONSTRAINT IF EXISTS ab_test_conversions_event_type_check;
ALTER TABLE ab_test_conversions ADD CONSTRAINT ab_test_conversions_event_type_check
  CHECK (event_type IN ('cta_click', 'form_submit', 'phone_click', 'sms_reply', 'email_open', 'email_click', 'quote_accepted', 'job_booked'));
```

**`email_sends`** -- add variant tracking:
```sql
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS ab_test_id TEXT;
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS ab_variant_id TEXT;
```

**`sms_sends`** -- add variant tracking:
```sql
ALTER TABLE sms_sends ADD COLUMN IF NOT EXISTS ab_test_id TEXT;
ALTER TABLE sms_sends ADD COLUMN IF NOT EXISTS ab_variant_id TEXT;
```

---

## 2. Jobber API Integration for Revenue Data

### Current State
- TG-05 (Jobber email parser) reads Jobber notification emails via Gmail IMAP every 15 minutes
- `jobber_email_events` stores parsed events: new_request, job_scheduled, job_completed, invoice_sent, payment_received
- `jobber_invoices` table exists (migration 049) with full invoice schema + attribution columns
- `revenue_attribution` table exists (migration 031) with `attribute_invoice_revenue()` RPC
- `update_lead_revenue_from_jobber()` RPC exists for batch attribution

### Jobber API Options

**Option A: Continue Email Parsing (Recommended)**
- TG-05 already captures payment_received events with amounts
- Revenue data flows: Jobber email -> TG-05 -> `jobber_email_events` -> attribution workflow
- Pros: Already working, no API key management, no rate limits
- Cons: Amount parsing from email text is approximate, no line-item detail

**Option B: Jobber GraphQL API**
- Jobber offers a GraphQL API at `https://api.getjobber.com/api/graphql`
- Auth: OAuth 2.0 (requires a Jobber Developer App, client_id + client_secret + refresh_token)
- Key queries: `invoices`, `jobs`, `clients`, `payments`
- Rate limit: 10 requests per second (generous for n8n cron)
- Pros: Exact dollar amounts, line-item detail, service type, customer linkage
- Cons: Requires creating a Jobber Developer App, OAuth token refresh management in n8n

**Recommendation: Hybrid approach**
1. Keep TG-05 email parser for real-time event triggers (new request, job scheduled, etc.)
2. Add a daily Jobber API sync workflow for accurate revenue data (invoices + payments)
3. The daily sync corrects any email-parsed amounts and fills in service_type, line items

### Jobber API Key Endpoints
- `query { invoices(first: 50, filter: { createdAt: { after: "..." } }) { nodes { id total status ... } } }`
- `query { payments(first: 50, filter: { createdAt: { after: "..." } }) { nodes { id amount invoice { id } ... } } }`
- `query { jobs(first: 50, filter: { completedAt: { after: "..." } }) { nodes { id title lineItems { ... } client { ... } } } }`

### OAuth Setup Required
1. Create a Jobber Developer App at app.getjobber.com/developer
2. Get client_id and client_secret
3. Authorize the app against the TotalGuard Jobber account
4. Store refresh_token as n8n variable (TG_JOBBER_REFRESH_TOKEN)
5. Build a token-refresh Code node at the start of any Jobber API workflow

**BLOCKER CHECK:** Jobber Developer App creation may require a Jobber Connect plan ($) or a free developer app registration. Needs verification before Phase 4 planning proceeds. If blocked, email parsing alone is sufficient for Phase 4 intelligence (amounts are approximate but directionally correct).

---

## 3. Google Ads API Integration

### Google Ads API Overview
- Base URL: `https://googleads.googleapis.com/v17/`
- Auth: OAuth 2.0 (same Google Cloud project that has GSC access, but needs Google Ads API enabled)
- Required: `developer-token` header (apply at ads.google.com/aw/apicenter)
- Rate limits: 15,000 requests per day (more than enough)

### Key API Calls

**Daily metrics pull (for google_ads_daily table):**
```
POST /v17/customers/{customer_id}/googleAds:searchStream
Body: {
  "query": "SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros, metrics.conversions_value, metrics.ctr, metrics.average_cpc, metrics.search_impression_share FROM ad_group WHERE segments.date = '2026-03-15'"
}
```

**Campaign status check (for budget guardrails):**
```
"SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros, metrics.cost_micros, metrics.conversions FROM campaign WHERE campaign.status = 'ENABLED'"
```

**Pause a campaign (auto-pause on no conversions):**
```
POST /v17/customers/{customer_id}/campaigns:mutate
Body: { "operations": [{ "update": { "resourceName": "customers/{id}/campaigns/{id}", "status": "PAUSED" }, "updateMask": "status" }] }
```

### OAuth Setup Required
1. Google Cloud Console: enable Google Ads API
2. Create OAuth credentials (or reuse existing GSC ones)
3. Apply for developer token at ads.google.com (this can take 1-3 days for basic access)
4. Store in n8n variables: TG_GOOGLE_ADS_CUSTOMER_ID, TG_GOOGLE_ADS_DEV_TOKEN, TG_GOOGLE_ADS_REFRESH_TOKEN

### n8n Implementation Pattern
- Use HTTP Request nodes (Google Ads has no native n8n node)
- Token refresh via Code node at workflow start (same pattern as GSC)
- GAQL (Google Ads Query Language) is SQL-like -- all queries go through searchStream endpoint
- cost_micros / 1,000,000 = actual cost in dollars

### BLOCKER CHECK
- Developer token application may take 1-3 business days
- TotalGuard needs an active Google Ads account (confirm with Vance)
- If no active Google Ads account, the ad optimization workflows become report-only stubs

---

## 4. A/B Testing in n8n Architecture

### Design Pattern: A/B Test Router Sub-Workflow

Create a reusable `TG-105 (A/B Test Router)` sub-workflow that any sending workflow can call:

**Input:** `{ test_id, channel, recipient_phone?, recipient_email? }`
**Output:** `{ variant_id, variant_title, variant_content }`

**Logic:**
1. Query `ab_tests` for active test matching test_id
2. If no active test or test completed, return default (variant A)
3. Check if winner already declared -- if so, always return winner
4. Query `ab_test_variants` for the test
5. Weighted random selection based on variant weights (50/50 default)
6. Log the selection to `ab_test_sends`
7. Return selected variant

### A/B Test Auto-Winner Workflow (TG-106)

Runs daily. For each active SMS/email A/B test:
1. Count sends per variant from `ab_test_sends`
2. If both variants have >= min_sends_per_variant (default 30):
   - Calculate conversion rate per variant
   - If one variant's conversion rate is statistically significantly higher (simple: >20% relative improvement with 30+ samples each), declare winner
   - Update `ab_tests.status = 'winner_declared'`, `winner_variant_id`, `winner_declared_at`
   - Log to `intelligence_reports`

### Which Workflows Get A/B Testing

| Workflow | Test Type | What Varies | Conversion Event |
|----------|-----------|-------------|-----------------|
| TG-83 (Quote Follow-up) | SMS copy | Day-2 SMS message text | quote_accepted (estimate status change) |
| TG-84 (Invoice Collections) | SMS copy | Day-3 reminder text | invoice paid (invoice status change) |
| TG-85 (Missed Call Capture) | SMS copy | Auto-reply message text | job_booked (lead status change) |
| TG-91 (Abandoned Quote SMS) | SMS copy | Re-engagement message | quote_accepted |
| TG-83 (Quote Follow-up) | Email subject | Day-7 email subject line | quote_accepted |
| TG-84 (Invoice Collections) | Email subject | Day-10 email subject line | invoice paid |

### Modification to Existing Workflows

Each sending workflow (TG-83, TG-84, TG-85, TG-91) needs a small change:
1. Before building the message, call TG-105 (A/B Test Router) via executeWorkflow
2. Use the returned variant_content as the message body (or subject line)
3. Pass the ab_test_id and ab_variant_id to TG-94/TG-95 so they log it on email_sends/sms_sends

This is a 3-node insertion per workflow (executeWorkflow -> merge variant -> continue to send).

---

## 5. Workflow Numbering and Naming

### Complete Workflow List (TG-105 through TG-125)

#### Wave 1: Data Pipeline Foundation (6 workflows)
| # | Name | Type | Trigger | Description |
|---|------|------|---------|-------------|
| TG-105 | ab-test-router | Sub-workflow | executeWorkflowTrigger | Reusable A/B variant selector |
| TG-106 | ab-test-auto-winner | Cron (daily) | 0 2 * * * (9PM CT) | Check A/B tests for winners, declare + log |
| TG-107 | revenue-sync-daily | Cron (daily) | 0 10 * * * (5AM CT) | Pull Jobber data, run attribution, snapshot metrics |
| TG-108 | kpi-daily-snapshot | Cron (daily) | 0 11 * * * (6AM CT) | Snapshot all KPIs to intelligence_metrics |
| TG-109 | google-ads-daily-sync | Cron (daily) | 0 12 * * * (7AM CT) | Pull Google Ads metrics into google_ads_daily |
| TG-110 | anomaly-detector | Cron (daily) | 0 14 * * * (9AM CT) | Compare today's metrics to 4-week avg, alert if >25% deviation |

#### Wave 2: Budget Guardrails & Real-Time Alerts (3 workflows)
| # | Name | Type | Trigger | Description |
|---|------|------|---------|-------------|
| TG-111 | ad-budget-guardian | Cron (every 4h) | 0 */4 * * * | Check Google Ads spend vs budget, alert on 2x overspend |
| TG-112 | ad-conversion-watchdog | Cron (every 12h) | 0 0,12 * * * | Check for 48h no-conversion campaigns, auto-pause + alert |
| TG-113 | critical-alert-router | Sub-workflow | executeWorkflowTrigger | Unified alert sender (email + optional SMS to owner) |

#### Wave 3: Weekly Intelligence Reports (5 workflows)
| # | Name | Type | Trigger | Description |
|---|------|------|---------|-------------|
| TG-114 | weekly-revenue-attribution | Cron (Monday) | 0 13 * * 1 (8AM CT) | Revenue by source, by service, cost per lead by channel |
| TG-115 | weekly-ab-test-report | Cron (Monday) | 0 13 * * 1 (8AM CT) | A/B test results, winners declared, ongoing tests |
| TG-116 | weekly-ad-performance | Cron (Monday) | 0 13 * * 1 (8AM CT) | Google Ads: cost/lead, cost/job, ROAS by campaign |
| TG-117 | weekly-what-got-smarter | Cron (Monday) | 0 14 * * 1 (9AM CT) | Aggregates all weekly reports into single "What Got Smarter" digest |
| TG-118 | weekly-intelligence-assembler | Sub-workflow | executeWorkflowTrigger | Builds HTML email template from report data |

#### Wave 4: Monthly Trend Analysis (3 workflows)
| # | Name | Type | Trigger | Description |
|---|------|------|---------|-------------|
| TG-119 | monthly-trend-analysis | Cron (1st of month) | 0 13 1 * * (8AM CT) | This month vs last month across all KPIs |
| TG-120 | monthly-channel-roi | Cron (1st of month) | 0 13 1 * * (8AM CT) | ROI by marketing channel (ad spend + organic + referral) |
| TG-121 | monthly-learning-report | Cron (1st of month) | 0 14 1 * * (9AM CT) | Aggregated monthly intelligence digest |

#### Wave 5: A/B Test Integration + Self-Improvement (4 workflows)
| # | Name | Type | Trigger | Description |
|---|------|------|---------|-------------|
| TG-122 | ab-test-seed-manager | Manual/Cron | On-demand | Create/update A/B test configurations in Supabase |
| TG-123 | workflow-performance-tracker | Cron (weekly) | 0 12 * * 1 (7AM CT Mon) | Track execution counts, success rates, error rates per workflow |
| TG-124 | lead-score-recalibrator | Cron (monthly) | 0 13 1 * * | Adjust lead scoring weights based on actual booking rates by score tier |
| TG-125 | intelligence-dashboard-updater | Cron (daily) | 0 15 * * * (10AM CT) | Refresh materialized views / update dashboard-ready summary tables |

**Total: 21 workflows** (TG-105 through TG-125)

---

## 6. Existing Workflows Requiring Modification

### Direct Modifications (A/B Test Integration)

| Workflow | Change | Complexity |
|----------|--------|-----------|
| TG-83 (Quote Follow-up) | Add executeWorkflow call to TG-105 before Day-2 SMS and Day-7 email | Medium -- 3 nodes inserted per send point (2 send points = 6 nodes) |
| TG-84 (Invoice Collections) | Add executeWorkflow call to TG-105 before Day-3 SMS and Day-10 email | Medium -- same pattern as TG-83 |
| TG-85 (Missed Call Capture) | Add executeWorkflow call to TG-105 before auto-reply SMS | Low -- 3 nodes at one send point |
| TG-91 (Abandoned Quote SMS) | Add executeWorkflow call to TG-105 before re-engagement SMS | Low -- 3 nodes at one send point |
| TG-94 (Unified SMS Sender) | Add ab_test_id + ab_variant_id to sms_sends insert | Low -- 2 columns in existing insert JSON |
| TG-95 (Unified Email Sender) | Add ab_test_id + ab_variant_id to email_sends insert | Low -- 2 columns in existing insert JSON |

### No Modification Needed

| Workflow | Reason |
|----------|--------|
| TG-05 (Jobber Email Parser) | Already captures payment events; no change needed |
| TG-92 (Webhook Router) | Routing logic unchanged |
| TG-93 (Auto-Dispatch) | Owner notifications, not customer-facing |
| TG-96-TG-104 (SEO workflows) | Independent from intelligence layer |
| TG-66 (Daily KPI Digest) | Will be SUPERSEDED by TG-108 + TG-110 (richer daily pipeline) |
| TG-67 (Weekly Owner Report) | Will be SUPERSEDED by TG-117 (What Got Smarter) |

### Workflows to Retire/Replace

| Workflow | Replacement | Reason |
|----------|-------------|--------|
| TG-66 (Daily KPI Digest) | TG-108 + TG-110 + TG-125 | New pipeline stores metrics in DB + detects anomalies (TG-66 was fire-and-forget email) |
| TG-67 (Weekly Owner Report) | TG-117 (What Got Smarter) | TG-117 is a superset with attribution, A/B results, ad performance, anomalies |

---

## 7. Dependencies and Wave Ordering

```
Wave 1 (Foundation)           Wave 2 (Guardrails)         Wave 3 (Weekly Reports)
TG-105 A/B Router ------+     TG-111 Budget Guardian       TG-114 Revenue Attrib
TG-106 Auto-Winner      |     TG-112 Conversion Watchdog   TG-115 A/B Report
TG-107 Revenue Sync     |     TG-113 Alert Router ----+    TG-116 Ad Performance
TG-108 KPI Snapshot     |                             |    TG-117 What Got Smarter
TG-109 Ads Sync         |                             |    TG-118 Email Assembler
TG-110 Anomaly Detect --+                             |
         |                                             |
         +-- depends on TG-108 -----------------------+

Wave 4 (Monthly)              Wave 5 (Integration)
TG-119 Monthly Trends         TG-122 A/B Seed Manager
TG-120 Channel ROI            TG-123 Workflow Perf Tracker
TG-121 Monthly Report         TG-124 Lead Score Recalibrator
                              TG-125 Dashboard Updater
                              + Modify TG-83/84/85/91/94/95
```

### Hard Dependencies

1. **Migration 072 MUST run before any workflow** -- all new tables + column extensions
2. **TG-105 (A/B Router) must deploy before TG-83/84/85/91 modifications** -- sub-workflow dependency
3. **TG-108 (KPI Snapshot) must deploy before TG-110 (Anomaly Detector)** -- anomaly detection reads intelligence_metrics
4. **TG-109 (Ads Sync) must deploy before TG-111/112 (Guardrails)** -- guardrails read google_ads_daily
5. **TG-113 (Alert Router) must deploy before TG-110/111/112** -- they all call TG-113 for alert delivery
6. **TG-118 (Email Assembler) must deploy before TG-114/115/116/117** -- they all call TG-118 for email formatting
7. **Wave 1 must complete before Wave 2** (data must flow before guardrails can check it)
8. **Wave 1+2 must complete before Wave 3** (weekly reports aggregate daily data)
9. **Wave 3 must complete before Wave 4** (monthly reports aggregate weekly data)
10. **Wave 5 can partially parallelize with Wave 3** (A/B seed manager + workflow modifications are independent of weekly reports)

### Parallelization Within Waves

- **Wave 1:** TG-105 and TG-106 are A/B pair (deploy together). TG-107/108/109 are independent data pipelines (deploy in parallel). TG-110 depends on TG-108.
- **Wave 2:** TG-113 first, then TG-111 and TG-112 in parallel.
- **Wave 3:** TG-118 first, then TG-114/115/116 in parallel, then TG-117 last (aggregates all three).
- **Wave 4:** TG-119 and TG-120 in parallel, then TG-121.
- **Wave 5:** All 4 workflows + modifications can be done in parallel.

---

## 8. Technical Risks and Blockers

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **n8n API rate limit (~10 calls/session)** | Cannot deploy 21 workflows + 6 modifications in one session | Batch deployments across multiple sessions. Wave 1 = 1 session (6 workflows). Wave 2 = 1 session (3 workflows). Etc. Plan for 5 deployment sessions minimum. |
| **Google Ads developer token approval** | 1-3 business day wait; blocks TG-109/111/112/116 | Start token application BEFORE Phase 4 build begins. Build Ads workflows last. If delayed, deploy everything else first with Ads workflows as stubs. |
| **Jobber API access (OAuth app registration)** | Unknown cost/approval time; blocks accurate revenue data | Start with email-parsed revenue (already working). Upgrade to API later as enhancement. TG-107 can initially just run `update_lead_revenue_from_jobber()` RPC against existing email-parsed data. |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Twilio A2P 10DLC still pending** | SMS A/B tests cannot actually deliver until carrier approval | Build A/B infrastructure anyway. Tests will be "ready to go" once SMS works. Email A/B tests work immediately. |
| **executeWorkflowTrigger typeVersion** | Must use v1 (not v1.1) per Phase 3 lessons | Already documented in STATE.md. Apply consistently. |
| **Weekly report timing conflicts** | TG-102 (SEO), TG-67 (owner report), and new TG-114-117 all fire Monday AM | Stagger: SEO at 7AM CT, Intelligence at 8-9AM CT. Replace TG-67 with TG-117. |
| **A/B test sample size** | Solo operator may take weeks to reach 30 sends per variant | Acceptable -- A/B system is designed to work patiently. Report "insufficient data" until threshold met. |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Migration 072 complexity** | Single large migration with many ALTER + CREATE | Test locally. Apply via Supabase MCP `apply_migration`. |
| **HTML email rendering** | Weekly intelligence emails need clean formatting | Use TG-118 (Email Assembler) as single source of truth for email templates. Test with TG-95. |
| **Dashboard view refresh** | Materialized views may lag | Use regular views (not materialized) for simplicity. Performance is fine at TG's data volume. |

### Pre-Phase Actions Required

1. **VERIFY:** Does TotalGuard have an active Google Ads account? (If not, Waves 2 + 3 ad workflows become stubs)
2. **APPLY:** Start Google Ads developer token application (ads.google.com/aw/apicenter)
3. **INVESTIGATE:** Jobber Developer App registration -- is it free for single-account use?
4. **CONFIRM:** TG-66 and TG-67 can be retired (replaced by intelligence layer workflows)

---

## 9. Summary Table: Supabase Changes

| Type | Count | Details |
|------|-------|---------|
| New tables | 4 | intelligence_reports, intelligence_metrics, ab_test_sends, google_ads_daily, google_ads_alerts |
| Column extensions | 4 tables | ab_tests (+6 cols), ab_test_conversions (extend CHECK), email_sends (+2 cols), sms_sends (+2 cols) |
| New views | 3-5 | Weekly intelligence summary, A/B test SMS/email performance, Google Ads summary, channel ROI |
| New RPCs | 2-3 | select_ab_variant(), get_metric_average(), snapshot_daily_kpis() |
| Migration number | 072 | Single migration for all schema changes |

## 10. n8n Deployment Budget

Given the ~10 calls per session rate limit:

| Session | Workflows | Calls Needed |
|---------|-----------|-------------|
| 1 | TG-105, TG-106, TG-107, TG-108, TG-113 | ~10 (5 create + 5 activate) |
| 2 | TG-109, TG-110, TG-111, TG-112 | ~8 (4 create + 4 activate) |
| 3 | TG-118, TG-114, TG-115, TG-116, TG-117 | ~10 (5 create + 5 activate) |
| 4 | TG-119, TG-120, TG-121, TG-122, TG-123 | ~10 (5 create + 5 activate) |
| 5 | TG-124, TG-125 + modify TG-83, TG-84, TG-85, TG-91 | ~10 (2 create + 2 activate + 6 update) |
| 6 | Modify TG-94, TG-95 + verification | ~6 (2 update + testing) |

**Minimum 6 deployment sessions** needed to stay within rate limits.
