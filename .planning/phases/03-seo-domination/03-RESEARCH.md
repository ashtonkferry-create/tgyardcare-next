# Phase 3: SEO Domination - Research

**Researched:** 2026-03-16
**Domain:** Google Search Console API, n8n workflow automation, AI content generation, SEO monitoring
**Confidence:** HIGH

## Summary

Phase 3 builds 14 n8n workflows that close the SEO monitoring gap (currently TTW 10, TG 5). The core technical challenge is integrating the Google Search Console API for daily data syncing, building alert logic for rank drops and deindexing events, generating quality city-specific content via Claude AI, and creating gap/opportunity detection from GSC data.

The existing infrastructure is extremely mature for this phase. Migration 057 already defines `gsc_search_queries` and `gsc_pages` tables with the exact schema needed. Migration 037 already has `seo_target_cities` (all 12 Dane County cities pre-seeded) and `seo_location_pages`. Migration 065 provides `seo_weekly_reports` with JSONB fields for top gaining/losing keywords. Migration 064 has `keyword_rankings`. The existing TG-45 workflow already calls the GSC searchAnalytics API. TG-50 already uses the Anthropic Claude API for content refresh. The `$vars` pattern (`TG_GOOGLE_SEARCH_CONSOLE_TOKEN`, `TG_ANTHROPIC_API_KEY`, `TG_SUPABASE_URL`) is established.

The main new work is: (1) replacing TG-45's simple weekly pull with a comprehensive daily sync, (2) building alert detection logic on top of stored GSC data, (3) creating city content generation prompts, (4) building the URL Inspection API integration for index coverage monitoring, and (5) wiring alerts through TG-94/TG-95 unified senders.

**Primary recommendation:** Leverage existing tables (migration 057, 037, 064, 065) rather than creating new ones. Add a few columns where needed (e.g., `index_status` tracking table). Build focused workflows (one per concern) rather than monolithic SEO monitors. Use the established `$vars` pattern for all credentials. Pipe all alerts through TG-94 (SMS) and TG-95 (email) from Phase 2.

## Standard Stack

### Core (Already in Place)
| Tool | Instance | Purpose | Status |
|------|----------|---------|--------|
| n8n Cloud | tgyardcare.app.n8n.cloud | Workflow orchestration | Live, 90+ workflows |
| Supabase | lwtmvzhwekgdxkaisfra.supabase.co | Database + REST API | Live, GSC tables exist |
| Google Search Console API | searchconsole.googleapis.com | Search performance + index data | Token in $vars (TG-45 uses it) |
| Anthropic Claude API | api.anthropic.com | Content generation | Key in $vars (TG-50 uses it) |
| TG-94 Unified SMS | AprqI2DgQA8lehij | All customer/owner SMS alerts | Active from Phase 2 |
| TG-95 Unified Email | IUDLrQrAkcLFLsIC | All email reports/digests | Active from Phase 2 |
| Twilio | cwxndVw60DCxqeNg | Direct owner SMS for urgent alerts | Active |

### API Endpoints
| Service | Endpoint | Method | Auth | Rate Limits |
|---------|----------|--------|------|-------------|
| GSC Search Analytics | `https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query` | POST | Bearer token (OAuth2) | 1,200 QPM per site |
| GSC URL Inspection | `https://searchconsole.googleapis.com/v1/urlInspection/index:inspect` | POST | Bearer token (OAuth2) | 2,000 QPD per site, 600 QPM |
| Anthropic Messages | `https://api.anthropic.com/v1/messages` | POST | x-api-key header | Standard tier limits |
| Supabase REST | `https://lwtmvzhwekgdxkaisfra.supabase.co/rest/v1/{table}` | GET/POST/PATCH | apikey + Bearer service_key | No hard limits |

### n8n Node Types
| Node | Purpose | Existing Pattern |
|------|---------|-----------------|
| `scheduleTrigger` | Cron-based daily/weekly runs | TG-45 (Monday 6am CT), TG-50 (Thursday 8am CT) |
| `httpRequest` | GSC API, Anthropic API, Supabase REST | TG-45 (GSC), TG-50 (Claude), all workflows (Supabase) |
| `code` | Data transformation, alert logic, content parsing | Every workflow |
| `executeWorkflow` | Call TG-94/TG-95 for alerts | Phase 2 pattern |
| `if` | Threshold checks (rank drop, CTR anomaly) | Standard pattern |
| `splitInBatches` | Pagination through GSC results | New for this phase |

### Existing $vars References
| Variable | Used By | Purpose |
|----------|---------|---------|
| `$vars.TG_GOOGLE_SEARCH_CONSOLE_TOKEN` | TG-45 | GSC API Bearer token |
| `$vars.TG_ANTHROPIC_API_KEY` | TG-50 | Claude API key |
| `$vars.TG_SUPABASE_URL` | All workflows | Supabase base URL |
| `$vars.TG_SUPABASE_ANON_KEY` | All workflows | Supabase anon key |
| `$vars.TG_SUPABASE_SERVICE_KEY` | All workflows | Supabase service role key |

**Important:** Phase 2 decisions established that local JSON uses PLACEHOLDER strings, NOT $vars, because $vars may not be populated. Check at build time: if $vars work on n8n cloud, use them. If not, use hardcoded placeholders (same Phase 2 pattern).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GSC API directly | Third-party SEO tool API (Ahrefs, SEMrush) | GSC is free, authoritative, already integrated -- no reason to pay |
| Claude for content | GPT-4 via OpenAI | Claude already integrated via TG-50, Anthropic key in $vars |
| Custom alert logic | Third-party monitoring (Ranktracker, etc.) | GSC data is the source of truth; custom gives full control |
| Separate index tracking table | JSONB column on existing pages | Dedicated table is cleaner for daily snapshots |

## Architecture Patterns

### Recommended Workflow Structure
```
DAILY WORKFLOWS (6 AM CT):
  TG-96  GSC Daily Sync (pages + queries)
    --> Writes to gsc_pages, gsc_search_queries
    --> On completion, triggers TG-97

  TG-97  Rank Drop Detector
    --> Reads gsc_search_queries (today vs 7 days ago)
    --> Fires SMS alert via TG-94 for drops >10 positions
    --> Fires weekly email summary via TG-95 for drops 5-10

WEEKLY WORKFLOWS:
  TG-98  Content Gap Detector (Monday 7 AM CT)
    --> Reads gsc_search_queries for queries with impressions but no matching page
    --> Stores gaps in seo_content_gaps table
    --> Sends weekly email report via TG-95

  TG-99  Ranking Opportunity Detector (Monday 7 AM CT)
    --> Reads gsc_search_queries for position 4-20 queries
    --> Prioritizes by impressions * (1 - position/100)
    --> Sends weekly email report via TG-95

  TG-100 Index Coverage Monitor (Tuesday)
    --> Calls URL Inspection API for key pages
    --> Compares against last known status
    --> Fires SMS alert via TG-94 for deindex events

  TG-101 Content Staleness Checker (Sunday midnight)
    --> Reads blog_posts + seo_location_pages where updated_at > 6 months
    --> Lists stale content in weekly report

  TG-102 Weekly SEO Summary (Monday 8 AM CT)
    --> Aggregates: top movers, new keywords, lost keywords
    --> Writes to seo_weekly_reports
    --> Sends comprehensive email via TG-95

CONTENT GENERATION (On-demand / Weekly):
  TG-103 City Content Generator
    --> Reads seo_target_cities + existing seo_location_pages
    --> For missing cities: calls Claude to generate draft content
    --> Saves to blog_posts as draft (never auto-publishes)

  TG-104 City Content Quality Checker
    --> Reads recently generated drafts
    --> Validates: local details present, not generic, word count adequate
    --> Flags low-quality for manual review

SUPPORTING:
  TG-105 GSC Token Refresher (if needed)
    --> Handles OAuth token refresh for GSC API
```

### Pattern 1: Daily GSC Sync with Pagination
**What:** Pull all searchAnalytics data with pagination (25K rows per request).
**When to use:** TG-96 daily sync.

```
Schedule Trigger (daily 6 AM CT = cron: 0 11 * * *)
  --> Code: Calculate date range (2 days ago, GSC 2-day lag)
  --> SplitInBatches: Loop with startRow increment
      --> HTTP Request: POST searchAnalytics/query
         Body: {
           startDate: "YYYY-MM-DD",
           endDate: "YYYY-MM-DD",
           dimensions: ["page"],
           rowLimit: 25000,
           startRow: {{batch_offset}}
         }
      --> Code: Transform rows to Supabase format
      --> HTTP Request: UPSERT to gsc_pages (Prefer: resolution=merge-duplicates)
  --> Repeat with dimensions: ["query"] for gsc_search_queries
  --> Execute Workflow: TG-97 (rank drop detection)
```

**Critical detail:** GSC data has a 2-day lag. A sync at 6 AM on March 16 pulls data for March 14. The `dataState: "final"` parameter ensures only finalized data is synced.

**Pagination:** Use `startRow` in multiples of 25,000. Stop when response has 0 rows. For a small local business site (~65 pages), pagination is unlikely to be needed for page-level data but IS needed for query-level data.

### Pattern 2: Week-over-Week Comparison for Alert Detection
**What:** Compare this week's GSC data against last week's to detect rank drops.
**When to use:** TG-97 rank drop detector.

```
Execute Sub-workflow Trigger (called by TG-96 after sync)
  --> HTTP Request: SELECT from gsc_search_queries
      WHERE date = (today - 2 days)
      AND impressions > 10
  --> HTTP Request: SELECT from gsc_search_queries
      WHERE date = (today - 9 days)
      AND query IN (same queries)
  --> Code: Compare positions
      - Drop 5+ positions: add to alert list
      - Drop 10+ positions: mark as urgent
  --> IF (urgent alerts exist):
      --> Execute Workflow: TG-94 (SMS to owner)
  --> HTTP Request: Store alert data in seo_weekly_reports JSONB
```

**Key insight:** Use the existing `gsc_keyword_trends` VIEW (migration 057) for week-over-week comparison instead of manual SQL. The view already computes `position_change` per query per week.

### Pattern 3: Content Generation with Local Context
**What:** Generate city-specific content using Claude with real local details.
**When to use:** TG-103 city content generator.

The prompt must include:
1. City name, county, population (from `seo_target_cities`)
2. Services available in that area
3. Real neighborhood names, parks, soil type facts for each city
4. Seasonal lawn care relevance for Wisconsin climate

```
Schedule Trigger (or manual trigger)
  --> HTTP Request: GET seo_target_cities WHERE active = true
  --> HTTP Request: GET seo_location_pages to find gaps
  --> Code: Identify cities without content or with stale content
  --> For each city (SplitInBatches):
      --> HTTP Request: POST Anthropic Messages API
         {
           model: "claude-sonnet-4-6",
           max_tokens: 4000,
           messages: [{ role: "user", content: CITY_PROMPT }]
         }
      --> Code: Extract content, create blog_posts record
      --> HTTP Request: INSERT blog_posts (status: 'draft')
```

### Pattern 4: URL Inspection for Index Coverage
**What:** Check if key pages are still indexed using the URL Inspection API.
**When to use:** TG-100 weekly index coverage monitor.

```
Schedule Trigger (Tuesday = cron: 0 5 * * 2)
  --> HTTP Request: GET list of key pages (from sitemap or gsc_pages)
  --> SplitInBatches (respect 2,000 QPD limit):
      --> HTTP Request: POST urlInspection/index:inspect
         {
           inspectionUrl: "https://tgyardcare.com/page",
           siteUrl: "https://tgyardcare.com/"
         }
      --> Code: Extract verdict, coverageState, indexingState
      --> HTTP Request: UPSERT index_coverage_log
  --> Code: Compare against previous check
  --> IF (any FAIL or NEUTRAL that was previously PASS):
      --> Execute Workflow: TG-94 (SMS alert: page deindexed)
```

**Rate limit:** 2,000 URLs per day per site. TG has ~65 pages -- well within limits. Check all pages weekly.

### Pattern 5: CTR Anomaly Detection
**What:** Detect pages where CTR drops >30% with stable impressions.
**When to use:** Part of TG-97 or separate daily check.

```
Code Node logic:
  const thisWeek = gsc_pages for current period
  const lastWeek = gsc_pages for previous period

  for each page:
    if (lastWeek.impressions > 50 && thisWeek.impressions > 50):
      ctrDrop = (lastWeek.ctr - thisWeek.ctr) / lastWeek.ctr
      if (ctrDrop > 0.30):
        alert("CTR drop on {page}: {old}% -> {new}% (title/description issue?)")
```

### Anti-Patterns to Avoid
- **Querying GSC with multiple dimensions simultaneously:** The API returns aggregated results when using `["page", "query"]` together. Query page and query dimensions SEPARATELY.
- **Syncing GSC data for "today":** GSC data has a 2-day lag. Always query `endDate = today - 2`.
- **Auto-publishing AI content:** Context explicitly says drafts only. Never set `status: 'published'`.
- **Sending every alert as SMS:** Batch non-urgent items into weekly digest. Only rank drops >10 and deindex events get SMS.
- **Building a monolithic SEO workflow:** Split into focused workflows (sync, detect, alert, generate). Easier to debug and schedule independently.
- **Ignoring existing tables:** Migration 057 already has gsc_search_queries and gsc_pages. Do NOT create new tables for GSC data.
- **Hardcoding credentials in workflow JSON:** Use `$vars` pattern or PLACEHOLDER strings per Phase 2 convention.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GSC data storage schema | New tables | Existing `gsc_search_queries` + `gsc_pages` (migration 057) | Already has UNIQUE indexes, proper columns, RLS |
| Week-over-week keyword trends | Custom comparison SQL | `gsc_keyword_trends` VIEW (migration 057) | Already computes click_change, impression_change, position_change |
| City list for content generation | Hardcoded array | `seo_target_cities` table (migration 037) | All 12 cities pre-seeded with population, distance, priority |
| Location page tracking | New content table | `seo_location_pages` table (migration 037) | Already has city + service_type + status + AI tracking fields |
| Weekly SEO report storage | New report table | `seo_weekly_reports` table (migration 057) | Already has top_gaining_keywords, top_losing_keywords, new_keywords JSONB |
| Keyword ranking history | New ranking table | `keyword_rankings` table (migration 064) | Already has rank_position, previous_position, local_pack tracking |
| Content calendar for blog posts | Manual scheduling | `content_calendar` table (migration 032) | Already seeded with 12 months of topics |
| SMS alerts | Direct Twilio calls | TG-94 unified SMS sender | Consent + rate limiting enforced |
| Email reports | Direct Resend calls | TG-95 unified email sender | Logging + consistent formatting |
| GSC API authentication | Custom OAuth flow | `$vars.TG_GOOGLE_SEARCH_CONSOLE_TOKEN` | Already configured for TG-45 |

**Key insight:** The database schema is already 80% built for this phase. The work is in building the n8n workflows that populate and analyze the data, not in creating new tables.

## Existing Tables Summary

### Already Exist (Migration 057 - Google Data Pipeline)
```sql
-- gsc_search_queries: query, page, country, device, date, clicks, impressions, ctr, position
--   UNIQUE INDEX: (query, page, date, device)
-- gsc_pages: page, date, clicks, impressions, ctr, avg_position
--   UNIQUE INDEX: (page, date)
-- seo_weekly_reports: week_start, week_end, report_data JSONB, top_gaining/losing/new keywords
-- gsc_keyword_trends VIEW: query, week_start, clicks, position, click_change, position_change
-- seo_page_performance VIEW: page, week_start, gsc_clicks, gsc_impressions, avg_gsc_position
```

### Already Exist (Migration 037 - Location SEO)
```sql
-- seo_target_cities: city, state, county, population, distance, priority, active
--   12 Dane County cities pre-seeded
-- seo_location_pages: city, service_type, slug, content, target_keyword, status, ai_generated
```

### Already Exist (Migration 064 - Keyword Rankings)
```sql
-- keyword_rankings: keyword, search_engine, rank_position, previous_position, page_url, device
```

### Already Exist (Migration 032 - Blog Pipeline)
```sql
-- blog_posts: title, content, slug, status, target_keyword, category, ai_generated, updated_at
-- content_calendar: scheduled_date, topic, target_keyword, category, priority, status
```

### New Tables Needed
```sql
-- index_coverage_log: Track URL Inspection API results over time
CREATE TABLE IF NOT EXISTS index_coverage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_url TEXT NOT NULL,
    check_date DATE NOT NULL,
    verdict TEXT,              -- 'PASS', 'FAIL', 'NEUTRAL', 'VERDICT_UNSPECIFIED'
    coverage_state TEXT,       -- e.g., 'Submitted and indexed'
    indexing_state TEXT,       -- from IndexingState enum
    last_crawl_time TIMESTAMPTZ,
    page_fetch_state TEXT,
    robots_txt_state TEXT,
    google_canonical TEXT,
    previous_verdict TEXT,     -- for change detection
    alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_index_coverage_unique ON index_coverage_log (page_url, check_date);
CREATE INDEX idx_index_coverage_page ON index_coverage_log (page_url);
CREATE INDEX idx_index_coverage_verdict ON index_coverage_log (verdict);

-- seo_content_gaps: Store detected content gaps from GSC data
CREATE TABLE IF NOT EXISTS seo_content_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2),
    priority_score DECIMAL(10,2),   -- impressions * (1 - position/100)
    has_dedicated_page BOOLEAN DEFAULT FALSE,
    suggested_page_type TEXT,       -- 'blog_post', 'service_page', 'location_page'
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'planned', 'created', 'dismissed')),
    detected_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_content_gaps_query ON seo_content_gaps (query, detected_at);
CREATE INDEX idx_content_gaps_priority ON seo_content_gaps (priority_score DESC);
```

## Common Pitfalls

### Pitfall 1: GSC 2-Day Data Lag
**What goes wrong:** Syncing "today's" data returns empty results or incomplete data.
**Why it happens:** Google Search Console data is finalized 2 days after the fact. Querying for March 16 on March 16 returns nothing.
**How to avoid:** Always set `endDate` to `today - 2` and `startDate` to `today - 2` for daily sync. For weekly data, use `today - 9` to `today - 2`.
**Warning signs:** Empty API responses, "no data" results despite site having traffic.

### Pitfall 2: Multi-Dimension GSC Queries Return Aggregated Data
**What goes wrong:** Querying with `dimensions: ["page", "query"]` returns fewer rows and aggregated results.
**Why it happens:** The GSC API drops data when multiple dimensions are combined to maintain computational efficiency.
**How to avoid:** Run SEPARATE queries: one with `dimensions: ["page"]` for gsc_pages, another with `dimensions: ["query"]` for gsc_search_queries. If you need per-page per-query data, accept some data loss.
**Warning signs:** Row counts much lower than expected, n8n community post confirms this behavior.

### Pitfall 3: URL Inspection API Daily Limit (2,000 QPD)
**What goes wrong:** Hitting the 2,000 URL per day per site limit, causing 429 errors.
**Why it happens:** Trying to inspect too many URLs in a single run.
**How to avoid:** TG has ~65 pages -- well within limits. But if expanding to check all location pages (12 cities x 15 services = 180), still fine. Add a 100ms delay between requests to be safe. Batch by priority: homepage + service pages first, then location pages.
**Warning signs:** HTTP 429 responses from the URL Inspection API.

### Pitfall 4: n8n $vars May Not Be Populated
**What goes wrong:** Workflows fail with undefined variable errors.
**Why it happens:** Phase 2 discovered that `$vars` may not be configured on the n8n cloud instance. TG-45 references `$vars.TG_GOOGLE_SEARCH_CONSOLE_TOKEN` but if that var isn't set, the workflow silently fails.
**How to avoid:** At build time, check if $vars are populated. If not, use hardcoded placeholder pattern (same as Phase 2). Include verification step in every plan.
**Warning signs:** API calls returning 401/403 errors, empty responses.

### Pitfall 5: GSC Token Expiry (OAuth2)
**What goes wrong:** The GSC Bearer token expires and daily sync stops working silently.
**Why it happens:** Google OAuth2 access tokens expire after 1 hour. A refresh token is needed to get new access tokens.
**How to avoid:** Use n8n's Google OAuth2 credential type (not raw Bearer token in $vars). If using raw tokens, build a TG-105 token refresh workflow that runs before the daily sync. Alternatively, use a Google Service Account (no token refresh needed, but requires different setup).
**Warning signs:** GSC API returning 401 Unauthorized after working for a while.

### Pitfall 6: Content Generation Producing Generic Filler
**What goes wrong:** Claude generates "lawn care in [City]" content that could apply to any city anywhere.
**Why it happens:** Prompt is too generic, doesn't provide city-specific facts.
**How to avoid:** Include in the prompt: specific neighborhood names, local parks, soil type (Dane County has silt loam), local climate details (Zone 5a, average frost dates), and real TotalGuard service details. Pre-research each city's unique features.
**Warning signs:** Generated content that mentions no specific local details, reads like template-filled boilerplate.

### Pitfall 7: Supabase HTTP GET Returning Empty Array vs Error
**What goes wrong:** An empty `[]` response is treated as an error, or a real error is treated as "no data."
**Why it happens:** Phase 2 discovered that `fullResponse: true` is required on n8n HTTP Request nodes that query Supabase and may return empty arrays.
**How to avoid:** Set `fullResponse: true` on all Supabase GET requests. Check HTTP status code (200 = success even if empty) before processing.
**Warning signs:** Workflows branching incorrectly when a table has no matching rows.

### Pitfall 8: Alert Fatigue
**What goes wrong:** Owner receives 10+ SMS alerts per day and starts ignoring them.
**Why it happens:** Alert thresholds too sensitive, every minor fluctuation triggers an alert.
**How to avoid:** Strict thresholds: SMS only for rank drops >10 positions AND the query has >50 impressions/week. Deindex alerts only. Everything else goes in weekly email digest. Context says "actionable, not noisy."
**Warning signs:** Owner complaining about too many alerts, or worse, not reading them.

## Code Examples

### GSC Search Analytics Query (n8n HTTP Request Body)
```javascript
// Source: Google Search Console API docs + TG-45 existing pattern
// For daily page-level sync
{
  "startDate": "{{ new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0] }}",
  "endDate": "{{ new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0] }}",
  "dimensions": ["page"],
  "rowLimit": 25000,
  "startRow": 0,
  "dataState": "final"
}
```

### GSC URL Inspection Request
```javascript
// Source: Google Search Console API docs
// POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
{
  "inspectionUrl": "https://tgyardcare.com/services/lawn-mowing",
  "siteUrl": "https://tgyardcare.com/",
  "languageCode": "en-US"
}
// Response verdict values: PASS (indexed), FAIL (error), NEUTRAL (excluded)
```

### Rank Drop Detection Logic (n8n Code Node)
```javascript
// Compare current week vs previous week from gsc_search_queries
const currentData = $('Fetch Current Week').first().json;
const previousData = $('Fetch Previous Week').first().json;

const alerts = [];
const summaryItems = [];

for (const current of currentData) {
  const prev = previousData.find(p => p.query === current.query);
  if (!prev) continue;

  const positionDrop = current.position - prev.position; // positive = worse

  if (positionDrop >= 10 && prev.impressions >= 50) {
    alerts.push({
      type: 'urgent',
      query: current.query,
      oldPosition: Math.round(prev.position),
      newPosition: Math.round(current.position),
      drop: Math.round(positionDrop),
      impressions: current.impressions
    });
  } else if (positionDrop >= 5 && prev.impressions >= 20) {
    summaryItems.push({
      type: 'warning',
      query: current.query,
      oldPosition: Math.round(prev.position),
      newPosition: Math.round(current.position),
      drop: Math.round(positionDrop)
    });
  }
}

return [{ json: { alerts, summaryItems, hasUrgent: alerts.length > 0 } }];
```

### Content Gap Priority Score (n8n Code Node)
```javascript
// Prioritize gaps by: impressions * (1 - current_position/100)
const queries = $input.all().map(item => item.json);

const gaps = queries
  .filter(q => q.impressions > 10 && !q.has_dedicated_page)
  .map(q => ({
    query: q.query,
    impressions: q.impressions,
    clicks: q.clicks,
    avg_position: q.position,
    priority_score: q.impressions * (1 - q.position / 100),
    suggested_page_type: q.position < 20 ? 'blog_post' : 'location_page'
  }))
  .sort((a, b) => b.priority_score - a.priority_score)
  .slice(0, 20); // Top 20 gaps

return gaps.map(g => ({ json: g }));
```

### City Content Generation Prompt Template
```javascript
// Source: Adapted from TG-50 Claude pattern + local SEO best practices
const city = $json.city;
const population = $json.population;
const services = ['lawn mowing', 'fertilization', 'aeration', 'spring cleanup',
                  'fall cleanup', 'gutter cleaning', 'snow removal'];

const prompt = `Write a comprehensive, locally-focused lawn care guide for ${city}, Wisconsin (population: ${population.toLocaleString()}, Dane County).

REQUIREMENTS:
- 800-1200 words
- Target keyword: "lawn care ${city} WI"
- Include H2 sections: Local Climate & Soil, Seasonal Lawn Care Calendar, Services Available, Why Choose TotalGuard
- Reference REAL details about ${city}: specific neighborhoods, nearby parks, local soil conditions (Dane County silt loam), USDA Zone 5a climate
- Mention Wisconsin-specific lawn challenges: spring thaw damage, crabgrass pressure, grub activity, fall leaf volume
- Include a call-to-action for TotalGuard Yard Care (phone: (608) 535-6057, website: tgyardcare.com)
- Write in a friendly, authoritative tone -- not salesy or generic
- Do NOT use placeholder text like "[neighborhood name]" -- if you don't know a specific neighborhood, write about the general area

Return the content as HTML with proper H2/H3 headings. Include a meta_description (under 160 chars) on the first line, separated by "---".`;

return [{ json: { prompt, city, model: 'claude-sonnet-4-6', max_tokens: 4000 } }];
```

### Supabase Upsert for GSC Data (HTTP Request Config)
```
Method: POST
URL: https://lwtmvzhwekgdxkaisfra.supabase.co/rest/v1/gsc_pages
Headers:
  apikey: {{$vars.TG_SUPABASE_ANON_KEY}}
  Authorization: Bearer {{$vars.TG_SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: resolution=merge-duplicates,return=minimal
Body: [array of {page, date, clicks, impressions, ctr, avg_position}]
```

The `resolution=merge-duplicates` header works because `gsc_pages` has a UNIQUE index on `(page, date)`. Duplicate rows are updated rather than erroring.

## Workflow-to-Table Mapping

| Workflow | Reads From | Writes To | Alerts Via |
|----------|-----------|-----------|------------|
| TG-96 GSC Daily Sync | GSC API | gsc_pages, gsc_search_queries | None |
| TG-97 Rank Drop Detector | gsc_search_queries, gsc_keyword_trends view | seo_weekly_reports | TG-94 (urgent SMS), TG-95 (weekly) |
| TG-98 Content Gap Detector | gsc_search_queries, blog_posts, seo_location_pages | seo_content_gaps | TG-95 (weekly email) |
| TG-99 Ranking Opportunity Detector | gsc_search_queries | seo_content_gaps | TG-95 (weekly email) |
| TG-100 Index Coverage Monitor | gsc_pages (page list) + URL Inspection API | index_coverage_log | TG-94 (deindex SMS) |
| TG-101 Content Staleness Checker | blog_posts, seo_location_pages | None (report only) | TG-95 (weekly email) |
| TG-102 Weekly SEO Summary | gsc_keyword_trends view, seo_weekly_reports | seo_weekly_reports | TG-95 (email) |
| TG-103 City Content Generator | seo_target_cities, seo_location_pages + Claude API | blog_posts (draft) | None |
| TG-104 Content Quality Checker | blog_posts (recent drafts) | blog_posts (flag low quality) | TG-95 (email) |

## Schedule Map (All times CT, cron is UTC)

| Workflow | Cadence | Cron (UTC) | CT Time | Depends On |
|----------|---------|------------|---------|------------|
| TG-96 | Daily | `0 11 * * *` | 6 AM CT | None |
| TG-97 | Daily | Triggered by TG-96 | After TG-96 | TG-96 completion |
| TG-98 | Weekly Mon | `0 12 * * 1` | 7 AM CT Mon | Fresh GSC data |
| TG-99 | Weekly Mon | `0 12 * * 1` | 7 AM CT Mon | Fresh GSC data |
| TG-100 | Weekly Tue | `0 11 * * 2` | 6 AM CT Tue | None |
| TG-101 | Weekly Sun | `0 5 * * 0` | Midnight CT Sun | None |
| TG-102 | Weekly Mon | `0 13 * * 1` | 8 AM CT Mon | TG-97/98/99 |
| TG-103 | Weekly or manual | `0 14 * * 3` | 9 AM CT Wed | None |
| TG-104 | After TG-103 | Triggered by TG-103 | After TG-103 | TG-103 completion |

**Note:** CT = UTC-5 (CDT) or UTC-6 (CST). Currently CDT (March = daylight saving), so CT = UTC-5. Cron `0 11 * * *` = 6 AM CDT.

## GSC API Authentication Strategy (Claude's Discretion)

**Recommendation: Use n8n's built-in Google OAuth2 Generic credential.**

Rationale:
1. n8n Cloud supports Google OAuth2 credentials natively
2. This handles token refresh automatically -- no TG-105 refresh workflow needed
3. TG-45 currently uses a raw Bearer token in `$vars.TG_GOOGLE_SEARCH_CONSOLE_TOKEN` which WILL expire
4. Migrating to proper OAuth2 credential eliminates Pitfall 5 entirely

Setup steps:
1. In Google Cloud Console: create OAuth2 client (Web Application type)
2. Enable "Google Search Console API" in the APIs & Services library
3. In n8n: create "Google OAuth2 API" credential with scope `https://www.googleapis.com/auth/webmasters.readonly`
4. Complete OAuth flow (one-time browser authorization)
5. Use this credential on all HTTP Request nodes that call GSC API (set Authentication: Predefined Credential Type -> Google OAuth2 API)

**If OAuth2 credential setup is blocked:** Fall back to the existing `$vars.TG_GOOGLE_SEARCH_CONSOLE_TOKEN` pattern (same as TG-45) and build TG-105 token refresh as a workaround.

## Workflow Count Reconciliation

CONTEXT.md says "14 workflows." The architecture above shows 9 named workflows (TG-96 through TG-104). The remaining could be:
- TG-105: GSC token refresher (only if OAuth2 credential isn't used)
- CTR anomaly detection (could be part of TG-97 or standalone)
- Ranking opportunity sub-categories (quick wins vs long-term targets)
- Content gap sub-workflows for different page types
- Alert routing/formatting sub-workflow

**Recommendation:** Build 9-10 focused workflows. Quality > quantity. The "14" target can be met by counting sub-workflows, but the architecture should not be padded to hit a number.

## State of the Art

| Old Approach (TG-45) | New Approach (Phase 3) | Impact |
|----------------------|----------------------|--------|
| Weekly GSC pull, queries only | Daily GSC pull, pages + queries + pagination | Catches rank drops within 24 hours |
| No alerting | SMS for urgent, email for weekly digest | Owner knows about issues immediately |
| No index monitoring | URL Inspection API weekly checks | Deindex events detected within a week |
| No content gap detection | Automated gap analysis from GSC data | Discovers ranking opportunities automatically |
| No city content generation | Claude-powered draft generation | Scales local SEO content creation |
| Raw token in $vars | OAuth2 credential (recommended) | No token expiry issues |

## Open Questions

1. **Are $vars actually populated on n8n cloud?**
   - What we know: TG-45 references them, but Phase 2 used placeholder strings
   - What's unclear: Whether TG-45 has ever run successfully with these vars
   - Recommendation: Check n8n Settings > Variables at build time. Adopt whichever pattern is working.

2. **GSC site URL format**
   - What we know: TG-45 uses `https%3A%2F%2Ftgyardcare.com` (URL-encoded)
   - What's unclear: Whether this is a URL-prefix property or domain property
   - Recommendation: Verify in GSC UI. Use exact property URL in API calls.

3. **Existing blog_posts table column set**
   - What we know: TypeScript types show: author, content, excerpt, id, image_url, meta_description, published_at, seo_keywords, slug, title. Migration 032 adds: target_keyword, secondary_keywords, word_count, reading_time_minutes, ai_generated, ai_model, category, tags.
   - What's unclear: Which columns actually exist in production (migrations may not all be applied)
   - Recommendation: Query the table schema at build time. Use only confirmed columns.

4. **How many pages does tgyardcare.com currently have indexed?**
   - What we know: State says 65+ pages
   - What's unclear: Exact count for URL Inspection API planning
   - Recommendation: First TG-96 run will reveal this. URL Inspection can handle up to 2,000/day.

## Sources

### Primary (HIGH confidence)
- [Google Search Console API - searchAnalytics/query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) -- endpoint, parameters, response format verified
- [Google Search Console API - Usage Limits](https://developers.google.com/webmaster-tools/limits) -- QPM/QPD limits verified: 1,200 QPM/site for analytics, 2,000 QPD/site for URL Inspection
- [Google Search Console API - Getting All Data](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data) -- pagination strategy (25K row limit, startRow increment) verified
- [Google URL Inspection API - inspect method](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect) -- endpoint, request/response format verified
- [Google URL Inspection API - UrlInspectionResult](https://developers.google.com/webmaster-tools/v1/urlInspection.index/UrlInspectionResult) -- verdict values (PASS/FAIL/NEUTRAL) verified
- Existing migration 057 (`automation/migrations/057_google_data_pipeline.sql`) -- gsc_search_queries, gsc_pages, seo_weekly_reports, views
- Existing migration 037 (`automation/migrations/037_location_seo_pages.sql`) -- seo_target_cities, seo_location_pages
- Existing migration 064 (`automation/migrations/064_social_media_management_system.sql`) -- keyword_rankings
- Existing migration 032 (`automation/migrations/032_blog_content_pipeline.sql`) -- blog_posts extensions, content_calendar
- Existing TG-45 workflow JSON -- GSC API call pattern, $vars usage
- Existing TG-50 workflow JSON -- Anthropic Claude API call pattern

### Secondary (MEDIUM confidence)
- [n8n Google OAuth2 Generic credential docs](https://docs.n8n.io/integrations/builtin/credentials/google/oauth-generic/) -- OAuth2 setup for HTTP Request nodes
- [n8n community - GSC API integration](https://community.n8n.io/t/i-built-a-google-search-console-api/56877) -- confirms one-dimension-per-query best practice
- [n8n Anthropic integration](https://n8n.io/integrations/anthropic/) -- Claude API node availability
- Phase 2 RESEARCH.md -- established patterns for $vars vs placeholders, fullResponse:true requirement

### Tertiary (LOW confidence)
- GSC `dataState: "final"` behavior -- documented but not tested with this specific site
- Exact column availability in production blog_posts table -- migrations may not all be applied

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools already deployed and verified in codebase
- Database schema: HIGH -- existing migrations provide 80% of needed tables
- GSC API integration: HIGH -- verified from official docs + existing TG-45 pattern
- URL Inspection API: MEDIUM -- verified from docs but not yet used in any workflow
- Content generation: HIGH -- existing TG-50 provides proven Claude API pattern
- Alert routing: HIGH -- TG-94/TG-95 established in Phase 2
- Pitfalls: HIGH -- derived from Phase 2 lessons + official API documentation

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack, GSC API doesn't change rapidly)
