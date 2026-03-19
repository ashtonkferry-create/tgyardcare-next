---
phase: 15-retention-lifetime-value
plan: 03
subsystem: automation
tags: [n8n, weather, winback, openweathermap, retention, sms, email]
requires: [Phase 11 infrastructure, TG-94 SMS sender, TG-95 email sender]
provides: [weather-reactive campaigns, dormant customer re-engagement]
affects: [Phase 16 analytics, Phase 17 reporting]
tech-stack:
  added: [OpenWeatherMap API]
  patterns: [weather-triggered campaigns, dormancy detection, dual-channel outreach]
key-files:
  created: []
  modified:
    - automation/n8n-workflows/TG-56-weather-campaign-trigger.json
    - automation/n8n-workflows/TG-63-winback-engine.json
decisions:
  - id: weather-api-key
    decision: "Use $vars.TG_OPENWEATHER_API_KEY variable for OpenWeatherMap API key"
    reason: "httpHeaderAuth credential type injects header, but OWM expects query param. Variable approach matches existing pattern."
  - id: tg56-email-only
    decision: "TG-56 sends email campaigns only (not SMS) for weather events"
    reason: "Weather campaigns go to all active customers -- bulk SMS risky with unknown A2P status"
  - id: tg63-dual-channel
    decision: "TG-63 sends both SMS and email to dormant customers"
    reason: "Win-back is targeted (small batch), dual-channel maximizes re-engagement rate"
  - id: winback-discount
    decision: "Flat 10% discount for all win-back targets"
    reason: "Simple, clear offer. Easy to honor operationally."
metrics:
  duration: ~5 minutes
  completed: 2026-03-19
---

# Phase 15 Plan 03: Weather Campaigns + Win-Back Engine Summary

**One-liner:** OpenWeatherMap-driven weather campaigns (snow/heat/storm/freeze) every 2h + weekly Monday dormant customer win-back with 10% discount via SMS+email.

## What Was Built

### TG-56 Weather Campaign Trigger (rebuilt)
- **n8n ID:** ghoTVdCTc6zwq6UQ (active)
- **Schedule:** Every 2 hours (cron `0 */2 * * *`)
- **10 nodes:** Schedule -> Fetch Weather -> Analyze -> Dedup Check -> IF Not Sent -> Telegram Alert -> Fetch Customers -> Build Email -> Send via TG-95 -> Log Campaign
- **Weather detection:** Snow (active snow + temp < 35F), heatwave (> 90F), severe storm (wind > 30mph or rain+wind combo), freeze (< 28F in shoulder seasons Mar-May/Sep-Nov)
- **48h dedup:** Checks weather_campaigns table to prevent same campaign type within 48 hours
- **Branded HTML emails:** Green/gold/dark template with weather-specific copy, CTA buttons, and current conditions display
- **Sends via TG-95** (FSRv5y8YzMjpyBtc) for unified email tracking
- **Telegram alert** when campaign triggers

### TG-63 Win-Back Engine (rebuilt)
- **n8n ID:** dvjImP2y2xvIsvXp (active)
- **Schedule:** Weekly Monday 10am CT (cron `0 15 * * 1`)
- **10 nodes:** Schedule -> Fetch Customers -> Identify Dormant -> Build Messages -> Route Channel -> SMS/Email paths -> Mark Sent -> Telegram Summary
- **Dormancy detection:** Customers with updated_at > 90 days ago
- **30-day dedup:** Skips customers who received win-back in last 30 days (winback_sent_at column)
- **Dual-channel outreach:**
  - SMS via TG-94 (AprqI2DgQA8lehij): Personalized text with 10% discount, phone number, website
  - Email via TG-95 (FSRv5y8YzMjpyBtc): Branded HTML with social proof testimonial, 10% discount CTA
- **Marks winback_sent_at** on leads table after send
- **Telegram summary** with count of dormant customers contacted

## Deviations from Plan

None -- plan executed exactly as written.

## Schema Requirements (Manual)

Vance needs to create these in Supabase SQL Editor:

### weather_campaigns table (for TG-56 dedup)
```sql
CREATE TABLE IF NOT EXISTS weather_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  customer_count integer,
  conditions text
);
```

### winback_sent_at column on leads (for TG-63 dedup)
```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS winback_sent_at timestamptz;
```

## Pending Manual Steps

- Replace OWNER_TELEGRAM_CHAT_ID in TG-56 Telegram Alert node with Vance's actual Telegram chat ID
- Replace OWNER_TELEGRAM_CHAT_ID in TG-63 Telegram Summary node with Vance's actual Telegram chat ID
- Ensure `TG_OPENWEATHER_API_KEY` n8n variable is set (or verify OpenWeatherMap credential works)
- Create weather_campaigns table (SQL above)
- Add winback_sent_at column to leads table (SQL above)

## Commits

| Commit | Description |
|--------|-------------|
| 6f5f8fd | feat(15-03): rebuild TG-56 weather campaign trigger |
| d90f16f | feat(15-03): rebuild TG-63 win-back engine for dormant customers |

## Active Workflow Count

20 workflows now active (added TG-56, TG-63 to the 18 from Phase 14).
