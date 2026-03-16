# Phase 3: SEO Domination - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build 14 n8n workflows/crons that close remaining SEO monitoring and content gaps. This is automation-only — no website UI changes. Workflows handle GSC data sync, city/neighborhood content generation, content gap detection, ranking opportunity detection, index coverage monitoring, and rank drop alerts. The goal is to fill the one SEO category where TTW beats TG (monitoring: 10-5).

</domain>

<decisions>
## Implementation Decisions

### GSC Data & Alerting
- Daily GSC sync workflow pulls: clicks, impressions, CTR, average position per page and per query
- Store in Supabase tables (gsc_pages, gsc_queries) with date partitioning for trend analysis
- Rank drop alert triggers when any page drops 5+ positions week-over-week for a tracked keyword
- Deindex alert triggers when a previously-indexed page disappears from GSC coverage report
- CTR anomaly alert when CTR drops >30% for a page with stable impressions (indicates title/description issue)
- All alerts go to owner via SMS (through TG-94 unified sender for non-owner alerts, direct Twilio for owner alerts)
- Weekly summary email via TG-95 with top movers (up and down), new keywords, lost keywords

### Content Generation Scope
- Generate city/neighborhood landing page content for all 12 Dane County service cities already on the site
- Content is generated as drafts in Supabase blog_posts table — never auto-published
- Each city page gets: local lawn care tips, seasonal relevance, service availability, neighborhood-specific details
- Quality bar: content must reference real local details (neighborhoods, parks, soil conditions) — not generic filler
- One workflow generates content, a separate workflow checks for staleness (>6 months since last update)
- Neighborhood-level content (e.g., Waunakee subdivisions) is stretch goal — start with city-level only

### Gap Detection Strategy
- Content gap detector compares GSC query data against existing page targets — find queries with impressions but no dedicated page
- Ranking opportunity detector finds queries where TG ranks 4-20 (page 1-2 but not top 3) — these are quick wins
- No competitor scraping — use GSC data only (free, reliable, no legal risk)
- Gap reports stored in Supabase and delivered weekly via email
- Prioritize gaps by: impressions * (1 - current_position/100) — high-impression, low-rank queries first

### Monitoring Cadence & Channels
- GSC sync: daily at 6 AM CT (GSC data has 2-day lag, so this captures yesterday-minus-one)
- Content staleness check: weekly (Sunday midnight)
- Gap/opportunity analysis: weekly (Monday 7 AM CT, after fresh GSC data)
- Rank drop alerts: daily (immediately after GSC sync completes)
- Index coverage check: weekly (Tuesday)
- Alert channels: SMS for urgent (rank drops >10 positions, deindex events), email for weekly summaries
- All workflows use n8n Cron trigger — no external scheduler needed

### Claude's Discretion
- Exact Supabase table schemas for GSC data storage
- GSC API authentication approach (OAuth vs service account)
- Content generation prompt engineering for city pages
- Specific n8n node patterns for GSC API calls
- How to handle GSC API rate limits and pagination
- Whether to use a single "SEO monitor" workflow or split into focused workflows

</decisions>

<specifics>
## Specific Ideas

- TG already has GSC connected (verified in M2 research) — leverage existing Google OAuth if available in n8n
- The 12 service cities are: Madison, Middleton, Fitchburg, Sun Prairie, Waunakee, DeForest, Verona, Oregon, Stoughton, McFarland, Monona, Cottage Grove
- Existing blog_posts table in Supabase should be used for content storage (confirmed in M3 research — MDX rejected)
- Owner is sole operator — alerts must be actionable, not noisy. Batch non-urgent items into weekly digest
- TTW's monitoring advantage is 10-5 — this phase needs to flip that to TG advantage

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-seo-domination*
*Context gathered: 2026-03-16*
