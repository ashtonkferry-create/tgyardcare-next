# Phase 4: Intelligence Layer - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build 20+ n8n workflows that give TG a self-improvement loop: revenue attribution, A/B testing of messaging, ad optimization, and weekly AI learning reports. This is TTW's only 12-0 category — TG currently has zero intelligence workflows. All workflows follow the established pattern (n8n JSON, Supabase storage, TG-94/TG-95 for comms).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion (All Areas)

User granted full discretion on all implementation decisions. The following are Claude's recommended defaults:

### Report delivery & audience
- Owner-only delivery (Vance) — no crew leads or multi-user reports
- Primary channel: email via TG-95 (unified email sender), with Telegram as stretch goal if time permits
- Weekly cadence for summary reports (Monday morning, aligned with TG-102 SEO summary)
- Real-time alerts only for critical events (revenue milestone hit, ad budget exhausted, significant metric drop)
- Reports should be HTML email with clean formatting, key metrics up top, actionable insights below

### Revenue attribution model
- Attribution by source: track where leads originate (Google organic, Google Ads, referral, yard sign, Nextdoor, Facebook, direct)
- Attribution by workflow: which automation touched the lead before conversion (quote follow-up, missed call capture, abandoned quote recovery)
- Simple last-touch attribution initially — multi-touch attribution is over-engineering for a local lawn care business
- Revenue data sourced from Jobber API (invoices/payments) cross-referenced with Supabase lead records
- Weekly revenue attribution report showing: revenue by source, revenue by service type, cost per lead by channel

### A/B testing scope
- Test SMS copy variants (follow-up messages, reminder texts) — highest ROI for a service business
- Test email subject lines for quote follow-ups and invoice reminders
- Auto-winner selection: after N sends per variant (minimum 30), switch to winner automatically
- Simple A/B (2 variants), not multivariate — keep it practical
- Test results stored in Supabase, surfaced in weekly intelligence report
- No pricing A/B tests — too risky for a local business with word-of-mouth reputation

### Ad optimization depth
- Google Ads only initially (primary paid channel for local services)
- Track: cost per lead, cost per booked job, ROAS by campaign
- Budget guardrails: alert if daily spend exceeds 2x normal, auto-pause if no conversions in 48 hours
- Weekly ad performance report with recommendations (pause underperforming keywords, increase budget on winners)
- Facebook/LSA integration deferred — can be added as individual workflows later

### Self-improvement loop
- Weekly "What Got Smarter" report: which A/B tests completed, which winners deployed, what attribution data reveals
- Monthly trend analysis: comparing this month vs last month across all intelligence metrics
- Anomaly detection: flag when any key metric deviates >25% from 4-week average
- All intelligence data stored in Supabase for historical tracking

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Build practical, actionable intelligence that helps a solo lawn care operator make better business decisions without information overload.

Key constraint: Vance runs TotalGuard as a one-person operation. Intelligence reports should be concise, actionable, and not require a data analyst to interpret. Think "here's what happened, here's what to do about it" not "here's a dashboard with 50 charts."

</specifics>

<deferred>
## Deferred Ideas

- Multi-user report distribution (crew leads, partners) — future phase if business scales
- Facebook Ads / Local Services Ads optimization — add as individual workflows when those channels are active
- Telegram bot integration for real-time alerts — could be added to any phase
- Customer satisfaction scoring / NPS automation — could be Phase 4 extension or separate phase
- Predictive analytics (weather-based demand forecasting, seasonal staffing) — future milestone

</deferred>

---

*Phase: 04-intelligence-layer*
*Context gathered: 2026-03-16*
