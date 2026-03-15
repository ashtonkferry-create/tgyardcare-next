# Summary: 01-09 Brevo Email Marketing System

**Status**: COMPLETE
**Completed**: 2026-03-15
**Commits**: affc8ed, aac00bb, 0ce1d8a

## What Was Accomplished

Built TotalGuard's full Brevo email marketing infrastructure from scratch.

### Delivered
1. **6 HTML email templates** — mobile-responsive, Outlook-safe, brand-consistent (green/gold TotalGuard colors, real Google review quotes, CTA buttons, trust bar)
2. **10 campaign strategy JSON files** — full copy/subject/CTA specs for every nurture sequence (welcome, lead followup, cross-sell, re-engagement, VIP, review, seasonal x3, newsletter, flash sales, weather-triggered)
3. **Twilio → Brevo SMS migration** — 27 workflows (TG-18 to TG-80) converted from Twilio credential nodes to Brevo transactional SMS HTTP calls (single vendor, no Twilio account needed)
4. **TG-08 inline HTML builder** — full JS builder in the Code node generates 5 distinct welcome emails with dynamic content, review blocks, seasonal copy
5. **Brevo setup guide** — domain auth steps, sender config, contact lists, frequency capping, going-live checklist
6. **Migration utility** — `convert-twilio-to-brevo.js` for future workflow conversions
7. **Contact API fix** — `notes→message`, `referral_source→source` to match Supabase schema

### Email Marketing Architecture
- **Sender**: TotalGuard Yard Care / totalguardllc@gmail.com via Brevo SMTP API
- **Frequency cap**: 2 emails per 7-day rolling window (DB-enforced via `check_global_frequency()`)
- **Segmentation**: 30+ dynamic Brevo lists synced daily by TG-17
- **Tracking**: Every send logged to `email_sends` table with dedup
- **Active sequences**: 11 nurture flows covering full customer lifecycle

## Key Decisions
- Consolidated SMS + email under Brevo (eliminates Twilio dependency for SMS)
- HTML templates built inline in n8n Code nodes (no external template hosting needed)
- Campaign strategy stored as JSON in repo (version-controlled, not locked in Brevo UI)

## Remaining Work
- Vance: Add Cloudflare DNS records for tgyardcare.com Brevo domain auth (see `automation/docs/brevo-setup-guide.md` § Domain Authentication)
- Vance: Set `TG_BREVO_API_KEY` variable in n8n instance (tgyardcare.app.n8n.cloud → Settings → Variables)
- Future: Add full inline HTML builders to TG-09 through TG-16 (currently have htmlContent field but basic templates)
- Future: Deploy updated workflows to n8n cloud via import script
