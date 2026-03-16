# Brevo Setup & Configuration Guide

**TotalGuard Yard Care Email Marketing System**
Last updated: March 2026

---

## Table of Contents

1. [Account Setup](#1-account-setup)
2. [Domain Authentication](#2-domain-authentication)
3. [Contact Management](#3-contact-management)
4. [Email Templates](#4-email-templates)
5. [Campaign Calendar](#5-campaign-calendar)
6. [Frequency Capping](#6-frequency-capping)
7. [Tracking & Analytics](#7-tracking--analytics)
8. [Testing Emails](#8-testing-emails)
9. [Going Live Checklist](#9-going-live-checklist)
10. [Scaling Beyond Free Tier](#10-scaling-beyond-free-tier)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Account Setup

**Status: Complete**

The Brevo account is created and operational. Here is where credentials live:

| Item | Location | Value |
|------|----------|-------|
| Brevo API Key | `.env.local` | `BREVO_API_KEY=<key>` |
| n8n Variable | n8n Settings > Variables | `TG_BREVO_API_KEY` |
| API Endpoint | n8n HTTP nodes | `https://api.brevo.com/v3/smtp/email` |
| Sender Name | All emails | `TotalGuard Yard Care` |
| Sender Email | All emails | `totalguardllc@gmail.com` |

### How emails are sent

All emails are sent through **n8n workflows** that call the Brevo SMTP API directly. The flow is:

1. n8n workflow triggers (schedule, webhook, or event)
2. Workflow builds the email HTML (from Code nodes using campaign config data)
3. Workflow calls `POST https://api.brevo.com/v3/smtp/email` with:
   - `sender`: `{ "name": "TotalGuard Yard Care", "email": "totalguardllc@gmail.com" }`
   - `to`: recipient array
   - `subject`: personalized subject line
   - `htmlContent`: fully rendered HTML
   - Headers include `api-key: {{$vars.TG_BREVO_API_KEY}}`
4. Response logged to Supabase `email_sends` table

### If you ever need to rotate the API key

1. Log into Brevo > Settings > API Keys
2. Generate a new key
3. Update in **both** locations:
   - `.env.local` file: `BREVO_API_KEY=<new_key>`
   - n8n: Settings > Variables > `TG_BREVO_API_KEY` = `<new_key>`
4. Test by sending a test email (see [Section 8](#8-testing-emails))

---

## 2. Domain Authentication (CRITICAL for Deliverability)

Domain authentication is the single most important factor for email deliverability. Without it, emails land in spam.

### 2.1 Verify Your Sender Email

Since we send from a Gmail address (`totalguardllc@gmail.com`), Brevo must verify it:

1. Log into **Brevo** > Settings > Senders, Domains & Dedicated IPs
2. Click **Senders** tab
3. Click **Add a Sender**
4. Enter:
   - Name: `TotalGuard Yard Care`
   - Email: `totalguardllc@gmail.com`
5. Click **Save**
6. Brevo sends a verification email to `totalguardllc@gmail.com`
7. Open that email and click the verification link
8. Status should change to **Verified** in Brevo

### 2.2 Gmail-Specific Considerations

Since we're sending from a Gmail address via Brevo's API (not through Gmail's servers), there are important things to know:

**What happens:** When a recipient's email provider checks the email, it sees:
- **From:** totalguardllc@gmail.com (your address)
- **Sent via:** Brevo's mail servers (not Gmail's servers)

This mismatch can trigger spam filters. To minimize this:

1. **Keep your sending volume low initially** -- Start with 20-50 emails/day for the first week, then gradually increase to the 300/day limit. This is called "warming up" the sender.

2. **Use consistent sending patterns** -- Send at the same times, roughly the same volume. Irregular spikes look suspicious.

3. **Monitor bounce rates** -- If bounces exceed 3%, stop and clean your list. Hard bounces (invalid addresses) hurt your sender reputation fast.

**Future improvement:** If you ever register a custom domain (e.g., `mail.tgyardcare.com`), you can set up full SPF/DKIM/DMARC authentication, which dramatically improves deliverability. See section 2.3 below.

### 2.3 SPF, DKIM, and DMARC (Custom Domain Setup)

This section applies **only if you set up a custom sending domain**. With just a Gmail address, you rely on Brevo's shared infrastructure.

#### If/when you add a custom domain:

**Step 1: Add your domain in Brevo**
1. Brevo > Settings > Senders, Domains & Dedicated IPs > **Domains** tab
2. Click **Add a Domain**
3. Enter your domain (e.g., `tgyardcare.com`)

**Step 2: Set up SPF Record**
SPF (Sender Policy Framework) tells email providers which servers are allowed to send email for your domain.

1. Brevo will show you a TXT record to add
2. Go to your domain registrar's DNS settings
3. Add a TXT record:
   - **Host/Name:** `@`
   - **Type:** `TXT`
   - **Value:** `v=spf1 include:sendinblue.com ~all`
   - **TTL:** `3600` (or default)

If you already have an SPF record, add `include:sendinblue.com` before the `~all` or `-all` at the end.

**Step 3: Set up DKIM Authentication**
DKIM (DomainKeys Identified Mail) adds a cryptographic signature to your emails proving they came from you.

1. Brevo generates a DKIM key pair when you add your domain
2. Brevo will show you a TXT record to add
3. In your DNS settings, add a TXT record:
   - **Host/Name:** `mail._domainkey` (Brevo will specify the exact subdomain)
   - **Type:** `TXT`
   - **Value:** The long string Brevo provides (starts with `v=DKIM1;`)
   - **TTL:** `3600`

**Step 4: Set up DMARC Policy**
DMARC tells email providers what to do when SPF/DKIM checks fail.

1. Add a TXT record to your DNS:
   - **Host/Name:** `_dmarc`
   - **Type:** `TXT`
   - **Value:** `v=DMARC1; p=none; rua=mailto:totalguardllc@gmail.com; pct=100`
   - **TTL:** `3600`

Start with `p=none` (monitoring only). After 2-4 weeks of clean data, upgrade to:
- `p=quarantine` (send failures to spam)
- Eventually `p=reject` (block failures entirely)

**Step 5: Verify in Brevo**
1. Go back to Brevo > Settings > Domains
2. Click **Verify** next to your domain
3. Brevo checks DNS records. All three (SPF, DKIM, DMARC) should show green checkmarks.
4. DNS changes can take up to 48 hours to propagate, but usually take 15-60 minutes.

### 2.4 How to Verify Authentication is Working

**Check from Brevo dashboard:**
- Brevo > Settings > Senders, Domains & Dedicated IPs > Domains
- All records should show green checkmarks

**Check from a real email:**
1. Send a test email to yourself (see [Section 8](#8-testing-emails))
2. Open the email in Gmail
3. Click the three dots (...) > **Show original**
4. Look for:
   - `SPF: PASS`
   - `DKIM: PASS`
   - `DMARC: PASS`
5. If any show `FAIL`, revisit the DNS records above

**Use an external tool:**
- [mail-tester.com](https://www.mail-tester.com/) -- Send a test email to their address and get a 1-10 score
- Target score: 8+ out of 10
- Anything below 6 means deliverability problems

---

## 3. Contact Management

### 3.1 How Contacts Get Synced

Contacts are synced from Supabase to Brevo via the **TG-17 daily sync workflow** in n8n:

1. TG-17 runs daily (early morning)
2. Queries Supabase `customers` table for all contacts
3. Pushes to Brevo via `POST https://api.brevo.com/v3/contacts` (upsert)
4. Applies segment tags based on customer attributes

### 3.2 Contact Attributes Synced

These fields are synced from Supabase to Brevo for every contact:

| Attribute | Brevo Field | Source | Example |
|-----------|-------------|--------|---------|
| First name | `FIRSTNAME` | `customers.first_name` | `Sarah` |
| Last name | `LASTNAME` | `customers.last_name` | `Johnson` |
| Email | `EMAIL` | `customers.email` | `sarah@example.com` |
| City | `CITY` | `customers.city` | `Madison` |
| Tier | `TIER` | `customers.tier` | `vip` or `standard` |
| Last service | `LAST_SERVICE` | `customers.last_service` | `Lawn Mowing` |
| Last service date | `LAST_SERVICE_DATE` | `customers.last_service_date` | `2026-03-01` |

### 3.3 Dynamic Segments

TG-17 automatically creates and maintains 30+ segments in Brevo. These segments determine who receives which campaigns.

**By Recency:**

| Segment | Criteria | Use Case |
|---------|----------|----------|
| Active (last 90 days) | Service within 90 days | Core audience for all campaigns |
| Cooling (90-180 days) | No service in 90-180 days | Re-engagement sequence targets |
| Dormant (180+ days) | No service in 180+ days | Win-back campaigns, breakup email |
| Lapsed (365+ days) | No service in 1+ year | Final breakup, then suppress |

**By Service:**

| Segment | Criteria |
|---------|----------|
| Lawn Mowing customers | Has active mowing service |
| Fertilization customers | Has fertilization service |
| Aeration customers | Has had aeration service |
| Gutter Cleaning customers | Has had gutter service |
| Snow Removal customers | Has active snow contract |
| Mulching customers | Has had mulching service |
| Spring Cleanup customers | Has had spring cleanup |
| Fall Cleanup customers | Has had fall cleanup |
| Leaf Removal customers | Has had leaf removal |
| Herbicide customers | Has herbicide treatment |
| Hardscaping customers | Has had hardscaping service |

**By Geography (Dane County service areas):**

| Segment | City |
|---------|------|
| Madison | Madison, WI |
| Middleton | Middleton, WI |
| Sun Prairie | Sun Prairie, WI |
| Fitchburg | Fitchburg, WI |
| Verona | Verona, WI |
| Waunakee | Waunakee, WI |
| DeForest | DeForest, WI |
| Cottage Grove | Cottage Grove, WI |
| McFarland | McFarland, WI |
| Monona | Monona, WI |
| Stoughton | Stoughton, WI |
| Oregon | Oregon, WI |

**By Tier:**

| Segment | Criteria |
|---------|----------|
| VIP customers | 3+ services, or $500+ lifetime, or 6+ months tenure |
| Standard customers | Everyone else |

**By Lead Status:**

| Segment | Criteria |
|---------|----------|
| New leads (< 30 days) | Created within last 30 days, no service yet |
| Hot leads | Lead score >= 70, quote requested in last 48 hours |
| Warm leads | Lead score 40-69 |
| Cold leads | Lead score < 40 |

### 3.4 How to View Segments in Brevo UI

1. Log into Brevo > **Contacts** (left sidebar)
2. Click **Lists & Segments** (or **Segments** tab depending on your UI version)
3. All TG-17 synced segments appear with prefix `TG_` (e.g., `TG_active_90d`, `TG_city_madison`, `TG_service_mowing`)
4. Click any segment to see the contacts in it
5. Segment counts update after each TG-17 sync run

---

## 4. Email Templates

### 4.1 Template Overview

Six master HTML templates live in `automation/email-templates/`:

| Template | File | Purpose | Used By |
|----------|------|---------|---------|
| Hero | `tg-hero.html` | Seasonal campaigns, promotions, feature showcases | Seasonal, cross-sell, flash sales, newsletter, VIP, lead follow-up |
| Welcome | `tg-welcome.html` | New customer welcome series (5 emails) | TG-08 welcome series |
| Review | `tg-review.html` | Google review requests | TG-13, TG-18 review requests |
| Referral | `tg-referral.html` | $25/$25 referral program promotions | Welcome email #4, referral blitz |
| Urgency | `tg-urgency.html` | Weather alerts, flash sale last calls, deadlines | Weather-triggered (TG-56), seasonal last-call, rate lock deadlines |
| Educational | `tg-educational.html` | Monthly newsletter, tips, nurture content | TG-10 The Yard Report newsletter |

### 4.2 How Templates Work with n8n

Templates are **design references**, not directly loaded by n8n. Here's the actual flow:

1. Campaign config files (`automation/email-templates/campaigns/*.json`) contain the full email content -- subject lines, body HTML, CTAs, reviews, personalization tokens
2. n8n workflow Code nodes read the relevant campaign data and merge it with the HTML template structure
3. Personalization tokens (e.g., `{{first_name}}`) are replaced with actual contact data from Supabase
4. The fully rendered HTML is sent via the Brevo SMTP API

### 4.3 Template Variable Reference

**Universal tokens (available in all templates):**

| Token | Source | Example |
|-------|--------|---------|
| `{{first_name}}` | Supabase `customers.first_name` | `Sarah` |
| `{{last_name}}` | Supabase `customers.last_name` | `Johnson` |
| `{{city}}` | Supabase `customers.city` | `Madison` |
| `{{email}}` | Supabase `customers.email` | `sarah@example.com` |

**Service-specific tokens:**

| Token | Source | Example |
|-------|--------|---------|
| `{{last_service}}` | Supabase `customers.last_service` | `Lawn Mowing` |
| `{{seasonal_service}}` | Mapped from current season | `Fertilization & Spring Cleanup` |
| `{{end_of_month}}` | Calculated at send time | `March 31` |

**Weather-specific tokens (TG-56 only):**

| Token | Source | Example |
|-------|--------|---------|
| `{{weather_date}}` | OpenWeather API forecast | `October 8` |
| `{{weather_end_date}}` | OpenWeather API forecast | `October 13` |
| `{{has_snow_contract}}` | Supabase customer record | `true` / `false` |
| `{{has_mowing_service}}` | Supabase customer record | `true` / `false` |

**Seasonal service mapping (used by `{{seasonal_service}}`):**

| Season | Value |
|--------|-------|
| Spring (Mar-May) | Fertilization & Spring Cleanup |
| Summer (Jun-Aug) | Mulching & Garden Bed Maintenance |
| Fall (Sep-Nov) | Leaf Removal & Gutter Cleaning |
| Winter (Dec-Feb) | Snow Removal & Winter Prep |

### 4.4 Campaign Config Files

Nine campaign config files live in `automation/email-templates/campaigns/`:

| File | Campaign | Workflow | Emails |
|------|----------|----------|--------|
| `welcome-series.json` | 5-email welcome series | TG-08 | 5 |
| `lead-followup.json` | Lead nurture (hot/warm/cold tiers) | TG-09 | 12 (3 hot + 3 warm + 4 cold + 2 shared) |
| `newsletter-yard-report.json` | Monthly "Yard Report" newsletter | TG-10 | 12 (one per month) |
| `cross-sell.json` | Service upsell engine | TG-10 | 6 |
| `reengagement.json` | Dormant customer re-engagement | TG-11 | 4 |
| `flash-sales.json` | 4 flash sale campaigns x 3 emails | TG-11 | 12 |
| `vip-upgrade.json` | VIP status notification + perks | TG-12 | 2 |
| `review-request.json` | Post-service review request | TG-13, TG-18 | 2 |
| `seasonal-campaigns.json` | Spring (4) + Fall (4) + Snow (3) | TG-14, TG-15, TG-16 | 11 |
| `weather-triggered.json` | Weather-based automated emails | TG-56 | 5 |

---

## 5. Campaign Calendar

### 5.1 Always-Running Automated Sequences

These sequences trigger based on events, not dates. They run continuously:

| Sequence | Trigger | Emails | Timing |
|----------|---------|--------|--------|
| **Welcome Series** (TG-08) | New customer created | 5 | Day 0, 7, 14, 21, 30 |
| **Lead Follow-up** (TG-09) | New lead captured | 3-4 per tier | Hot: Day 1/3/5, Warm: Day 2/5/10, Cold: Day 3/7/14/30 |
| **Review Request** (TG-13/18) | Service completed | 2 | 24-48hrs post-service, then +7 days if no review |
| **Cross-Sell** (TG-10) | Customer has single service | 1 per trigger | Based on service mix analysis |
| **Re-engagement** (TG-11) | 90+ days inactive | 4 | 90 days, 150 days, 270 days, 365 days |
| **VIP Upgrade** (TG-12) | Customer qualifies for VIP | 2 | On qualification, then seasonal deal early access |
| **Weather-Triggered** (TG-56) | Weather event detected | 1 per event | Automatic via OpenWeather API |

### 5.2 Scheduled Campaigns -- Month by Month

| Month | Campaign | Type | Emails | Template |
|-------|----------|------|--------|----------|
| **January** | The Yard Report: Winter Survival | Newsletter | 1 | tg-educational |
| **Jan 15** | Spring Early Bird Flash Sale | Flash (Announcement) | 1 | tg-hero |
| **February** | The Yard Report: Thaw Prep | Newsletter | 1 | tg-educational |
| **Feb 1** | Spring Campaign: Your Yard Survived Winter | Seasonal | 1 | tg-hero |
| **Feb 10** | Spring Early Bird Flash Sale | Flash (Reminder) | 1 | tg-hero |
| **Feb 15** | Spring Campaign: Neighbors Booked | Seasonal | 1 | tg-hero |
| **Feb 28** | Spring Early Bird Flash Sale | Flash (Last Call) | 1 | tg-urgency |
| **March** | The Yard Report: Spring Kickoff | Newsletter | 1 | tg-educational |
| **Mar 1** | Spring Campaign: Last Call Early Bird | Seasonal | 1 | tg-urgency |
| **Mar 15** | Spring Campaign: Full Spring Package | Seasonal | 1 | tg-hero |
| **April** | The Yard Report: Peak Growth | Newsletter | 1 | tg-educational |
| **May** | The Yard Report: Summer Prep | Newsletter | 1 | tg-educational |
| **June** | The Yard Report: Heat & Drought | Newsletter | 1 | tg-educational |
| **July** | The Yard Report: Midsummer | Newsletter | 1 | tg-educational |
| **Jul 1** | Referral Blitz Flash Sale | Flash (Announcement) | 1 | tg-hero |
| **Jul 15** | Referral Blitz Flash Sale | Flash (Reminder) | 1 | tg-hero |
| **Jul 28** | Referral Blitz Flash Sale | Flash (Last Call) | 1 | tg-urgency |
| **August** | The Yard Report: Fall Prep | Newsletter | 1 | tg-educational |
| **Aug 15** | Fall Campaign: 3 Things Before Frost | Seasonal | 1 | tg-hero |
| **September** | The Yard Report: Aeration Season | Newsletter | 1 | tg-educational |
| **Sep 1** | Fall Campaign: Gutter Problem | Seasonal | 1 | tg-hero |
| **Sep 1** | Fall Bundle Flash Sale | Flash (Announcement) | 1 | tg-hero |
| **Sep 20** | Fall Campaign: Fall Bundle $150 Off | Seasonal | 1 | tg-hero |
| **Sep 20** | Fall Bundle Flash Sale | Flash (Reminder) | 1 | tg-hero |
| **Sep 28** | Fall Bundle Flash Sale | Flash (Last Call) | 1 | tg-urgency |
| **October** | The Yard Report: Winter Prep | Newsletter | 1 | tg-educational |
| **Oct 1** | Snow Campaign: Never Shovel Again | Seasonal | 1 | tg-hero |
| **Oct 15** | Fall Campaign: Snow Is Coming | Seasonal | 1 | tg-urgency |
| **Oct 15** | Snow Rate Lock Flash Sale | Flash (Announcement) | 1 | tg-hero |
| **Oct 20** | Snow Campaign: Route Scarcity | Seasonal | 1 | tg-urgency |
| **Oct 25** | Snow Rate Lock Flash Sale | Flash (Reminder) | 1 | tg-hero |
| **Oct 30** | Snow Rate Lock Flash Sale | Flash (Last Call) | 1 | tg-urgency |
| **November** | The Yard Report: Season Wrap | Newsletter | 1 | tg-educational |
| **Nov 5** | Snow Campaign: Final Call | Seasonal | 1 | tg-urgency |
| **December** | The Yard Report: Year in Review | Newsletter | 1 | tg-educational |

### 5.3 Weather-Triggered Campaigns (Automatic)

These fire automatically based on OpenWeather API data via TG-56. You do not schedule these -- they send when conditions are met:

| Trigger | Conditions | Typical Timing | Template |
|---------|-----------|----------------|----------|
| Freeze Warning | Forecast min temp <=32F, 3 days ahead | ~October 8 | tg-urgency |
| First Snow Forecast | 2"+ snowfall, 3 days ahead | ~November 7 | tg-urgency |
| Spring Thaw | 5 consecutive days >40F, snow melting | ~March | tg-urgency |
| Heat Wave | 5 consecutive days >90F | June-August | tg-urgency |
| Major Storm | 50mph+ wind, 2"+ rain, hail, or tornado | Any season | tg-urgency |

### 5.4 Newsletter Schedule

The monthly newsletter ("The Yard Report") sends on the **1st Tuesday of every month**:

- Workflow: TG-10
- Template: `tg-educational.html`
- Config: `newsletter-yard-report.json`
- Contains: seasonal tips, local Madison context, customer spotlight, relevant offer
- Segment: All active contacts (service within last 12 months)

---

## 6. Frequency Capping

### 6.1 Global Frequency Cap

**Rule: Maximum 2 marketing emails per 7-day rolling window per contact.**

This prevents email fatigue and keeps unsubscribe rates low.

### 6.2 How It Works

1. Before sending any marketing email, n8n calls the Supabase function `check_global_frequency(contact_email, email_type)`
2. The function checks the `email_sends` table for sends to that contact in the last 7 days
3. If count >= 2, the email is **suppressed** (skipped, not queued for later)
4. If count < 2, the email proceeds

### 6.3 Bypass Rules

These email types **bypass** the frequency cap because they are time-critical:

| Email Type | Bypass Reason |
|------------|---------------|
| `first_snow` | Safety/urgency -- customer needs to know about snow removal |
| `major_storm` | Safety -- storm damage assessment offer |
| `severe_weather` | Safety -- weather alerts are time-sensitive |
| Transactional emails | Service confirmations, invoices, etc. are not marketing |

All other campaign types (seasonal, flash sales, newsletter, cross-sell, re-engagement, welcome, review request) **respect** the frequency cap.

### 6.4 Deduplication

The `email_sends` table prevents duplicate sends using a composite check:

- `contact_email` + `email_type` + `workflow_name`
- If the same email type from the same workflow was already sent to that contact, it won't send again
- This prevents issues like a customer receiving the same welcome email twice if a workflow retries

---

## 7. Tracking & Analytics

### 7.1 Supabase Email Sends Table

Every email sent through Brevo is logged to the `email_sends` table:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | uuid | Primary key | auto-generated |
| `contact_email` | text | Recipient email | `sarah@example.com` |
| `workflow_name` | text | n8n workflow ID | `TG-08` |
| `email_type` | text | Campaign/email identifier | `welcome_1` |
| `sent_at` | timestamptz | When the email was sent | `2026-03-12T09:00:00Z` |
| `brevo_message_id` | text | Brevo's message tracking ID | `<abc123@smtp-relay.brevo.com>` |
| `sequence_step` | int | Which email in a sequence (1, 2, 3...) | `1` |

### 7.2 Brevo Dashboard Metrics

Log into Brevo > **Campaigns** or **Transactional** to see:

| Metric | What It Means | Target |
|--------|---------------|--------|
| **Open Rate** | % of recipients who opened | 25-40% is good for local service |
| **Click Rate** | % of recipients who clicked a link | 3-8% is good |
| **Bounce Rate** | % of emails that failed to deliver | Keep below 2% |
| **Unsubscribe Rate** | % who unsubscribed | Keep below 0.5% per send |
| **Spam Complaint Rate** | % who marked as spam | Keep below 0.1% |

### 7.3 Weekly Owner Report

The **TG-67 weekly report** workflow generates an email performance summary for Vance every Monday morning. It includes:

- Total emails sent (past 7 days)
- Open and click rates by campaign
- Bounce/unsubscribe counts
- Top-performing subject lines
- Any delivery issues flagged

---

## 8. Testing Emails

Before launching any campaign, test it thoroughly. Here's the process:

### 8.1 Send a Test Email via Brevo API

You can send a test email directly from n8n or via curl:

**From n8n:**
1. Open the relevant workflow (e.g., TG-08 for welcome series)
2. Use the workflow's test mode to send to your own email
3. Check that all personalization tokens render correctly

**Via curl (from terminal):**
```bash
curl -X POST 'https://api.brevo.com/v3/smtp/email' \
  -H 'accept: application/json' \
  -H 'api-key: YOUR_BREVO_API_KEY' \
  -H 'content-type: application/json' \
  -d '{
    "sender": {
      "name": "TotalGuard Yard Care",
      "email": "totalguardllc@gmail.com"
    },
    "to": [
      {
        "email": "your-test-email@gmail.com",
        "name": "Test User"
      }
    ],
    "subject": "Test Email — {{first_name}} Welcome",
    "htmlContent": "<html><body><h1>Test</h1><p>If you see this, Brevo is working.</p></body></html>"
  }'
```

**From Brevo UI:**
1. Brevo > Transactional > Templates (if you've uploaded templates)
2. Click **Send a Test**
3. Enter your email address
4. Send and verify receipt

### 8.2 Check Rendering Across Email Clients

Test every template in:

| Client | How to Test |
|--------|-------------|
| **Gmail (web)** | Send test to your Gmail account, check on desktop |
| **Gmail (mobile)** | Check the same email on your phone's Gmail app |
| **Apple Mail** | Send to an iCloud email or check on an iPhone |
| **Outlook** | Send to an Outlook.com address -- Outlook renders HTML differently |

Key things to check:
- Images load correctly
- Buttons are clickable and go to the right URL
- Text is readable on mobile (not too small)
- Colors and spacing look correct
- Dark mode doesn't break the layout

### 8.3 Verify Links and UTM Parameters

Every CTA link should include UTM parameters for Google Analytics tracking:

```
https://tgyardcare.com/services/spring-cleanup?utm_source=brevo&utm_medium=email&utm_campaign=spring-2026-kickoff
```

Click every link in the test email and verify:
- Link goes to the correct page
- Page loads correctly
- UTM parameters appear in the URL

### 8.4 Check Mobile Rendering

1. Send test email to your phone
2. Open in Gmail app
3. Verify:
   - Text is readable without zooming
   - Buttons are large enough to tap (minimum 44px height)
   - Images scale properly
   - No horizontal scrolling required

### 8.5 Verify Unsubscribe Link

Every marketing email **must** have an unsubscribe link. This is a legal requirement (CAN-SPAM Act).

1. Send a test email
2. Scroll to the footer
3. Click the unsubscribe link
4. Verify it takes you to a Brevo unsubscribe page (or your custom page)
5. Verify the contact is actually removed from the list after unsubscribing

### 8.6 Test Frequency Capping

1. Send yourself 2 test emails within a 7-day window
2. Trigger a 3rd email send
3. Verify the 3rd email is suppressed (check n8n execution logs)
4. Verify the suppression is logged

---

## 9. Going Live Checklist

Complete every item before activating production email sends:

### Account & Authentication
- [ ] Brevo account created and verified
- [ ] `totalguardllc@gmail.com` verified as sender in Brevo
- [ ] SPF/DKIM/DMARC configured (if using custom domain)
- [ ] Sender reputation warm-up plan in place (start low, ramp up)

### API & Integration
- [ ] `.env.local` contains `BREVO_API_KEY`
- [ ] n8n variable `TG_BREVO_API_KEY` is set (Settings > Variables)
- [ ] Test API call succeeds (`POST /v3/smtp/email` returns 201)
- [ ] Test email received in inbox (not spam)

### Templates & Content
- [ ] All 6 HTML templates render correctly in Gmail, Apple Mail, Outlook
- [ ] All personalization tokens (`{{first_name}}`, `{{city}}`, etc.) populate correctly
- [ ] All CTA links point to correct URLs
- [ ] All UTM parameters are present on links
- [ ] Unsubscribe link is present and functional in every template
- [ ] Mobile rendering verified (375px width)

### Automation Workflows
- [ ] TG-08 welcome series tested with a test customer
- [ ] TG-13/18 review request tested after a service completion
- [ ] TG-17 contact sync runs successfully (contacts appear in Brevo)
- [ ] TG-10 newsletter can build and send
- [ ] TG-56 weather triggers configured with OpenWeather API key

### Safety & Compliance
- [ ] Frequency cap (`check_global_frequency()`) tested and working
- [ ] Dedup logic in `email_sends` table verified
- [ ] `email_sends` table logging confirmed (check after test send)
- [ ] Unsubscribe mechanism works end-to-end
- [ ] Physical mailing address included in email footer (CAN-SPAM)

### Monitoring
- [ ] TG-67 weekly report workflow configured
- [ ] Bounce alert threshold set (notify if > 3%)
- [ ] Brevo dashboard bookmarked for quick access

---

## 10. Scaling Beyond Free Tier

### 10.1 Current Plan: Free Tier

| Metric | Limit |
|--------|-------|
| Emails per day | 300 |
| Emails per month | ~9,000 (300 x 30) |
| Contacts | Unlimited |
| API access | Full |
| Templates | Unlimited |

### 10.2 When to Upgrade

**Rule of thumb:** Upgrade when your contact list exceeds **150 active contacts**.

Here's the math:
- 150 contacts x 2 emails/week (frequency cap) = 300 emails/week = ~43/day
- But during campaign-heavy months (Feb-Mar, Sep-Oct), you might send daily campaigns + automated sequences simultaneously
- At 150+ contacts, you risk hitting the 300/day cap during peak periods

**Warning signs you need to upgrade:**
- n8n workflows failing with Brevo API rate limit errors
- Emails queuing instead of sending immediately
- Campaign sends stretching across multiple days to stay under the cap

### 10.3 Brevo Pricing Tiers

| Plan | Price | Monthly Emails | Key Features |
|------|-------|---------------|--------------|
| **Free** | $0 | 300/day (~9,000/mo) | Full API, unlimited contacts |
| **Starter** | $9/month | 5,000/month | No daily limit, basic reporting |
| **Starter** | $18/month | 10,000/month | No daily limit, basic reporting |
| **Starter** | $29/month | 20,000/month | No daily limit, basic reporting |
| **Business** | $18/month+ | 5,000+/month | Marketing automation, A/B testing, advanced stats |

*Prices are approximate and may change. Check [brevo.com/pricing](https://www.brevo.com/pricing/) for current rates.*

### 10.4 How to Upgrade

1. Log into Brevo
2. Click your account name (top right) > **Billing**
3. Choose the Starter plan at the volume level you need
4. Enter payment info
5. Changes take effect immediately -- no downtime, no API key changes

---

## 11. Troubleshooting

### Problem: Emails going to spam

**Symptoms:** Recipients report not getting emails, or finding them in spam/junk folder.

**Fixes (in order of impact):**

1. **Check authentication**
   - Go to Brevo > Settings > Domains
   - Verify SPF, DKIM, DMARC all show green (if using custom domain)
   - If using Gmail address only, this is expected to some degree -- consider adding a custom domain

2. **Warm up the sender**
   - If you just started sending, start with 20-30 emails/day
   - Increase by 20-30% per week until you reach your target volume
   - Sudden volume spikes trigger spam filters

3. **Check content quality**
   - Avoid ALL CAPS in subject lines
   - Don't use excessive exclamation marks (!!!)
   - Minimize image-to-text ratio (emails with mostly images get flagged)
   - Include a plain text version (Brevo does this automatically)
   - Make sure there's a visible unsubscribe link

4. **Clean your list**
   - Remove hard bounces immediately (Brevo does this automatically)
   - Remove contacts who haven't opened an email in 6+ months
   - Never import purchased email lists

5. **Test your score**
   - Send a test to [mail-tester.com](https://www.mail-tester.com/)
   - Fix any issues flagged in the report

### Problem: Low open rates (below 20%)

**Fixes:**

1. **Subject line optimization**
   - Keep under 50 characters
   - Use personalization (`{{first_name}}`)
   - A/B test subject lines (all campaign configs include `subject_a` and `subject_b`)
   - Avoid spam trigger words: "free", "act now", "limited time" (ironic for marketing, but true)

2. **Optimize send times**
   - Best time for Madison market: **Tuesday or Wednesday, 9:00 AM CT**
   - Avoid Monday mornings (inbox overload) and Friday afternoons (mentally checked out)
   - Test different days and compare open rates

3. **Check deliverability first**
   - Low opens might actually be a deliverability problem disguised as an engagement problem
   - Check Brevo's deliverability report for your sends

### Problem: Brevo API errors

**Common error codes and fixes:**

| Error | Meaning | Fix |
|-------|---------|-----|
| `401 Unauthorized` | Invalid API key | Check `TG_BREVO_API_KEY` in n8n Variables matches Brevo |
| `400 Bad Request` | Malformed request body | Check email HTML for unclosed tags, invalid JSON |
| `429 Too Many Requests` | Rate limited | You're sending too fast. Add delays between sends in n8n |
| `403 Forbidden` | Account suspended or sender not verified | Check Brevo account status, re-verify sender |
| `201 Created` | Success | This is the expected response -- email sent |

**API rate limits (free tier):**
- 300 emails per day
- No per-minute limit documented, but recommended: max 10 emails per second

### Problem: Duplicate sends

**Symptoms:** A customer receives the same email twice.

**Fixes:**

1. **Check the dedup logic**
   - The `email_sends` table should have a record for every send
   - Before sending, n8n should query: "Has this `contact_email` + `email_type` + `workflow_name` combination been sent in the current sequence?"
   - If the query returns a result, skip the send

2. **Check n8n workflow retries**
   - If a workflow execution fails partway through, n8n may retry the entire execution
   - The dedup check in step 1 should catch this, but verify the check runs before (not after) the API call

3. **Check TG-17 sync timing**
   - If TG-17 runs mid-campaign, it might re-trigger sequence starts
   - Ensure sequence triggers check for existing active sequences before starting new ones

### Problem: Unsubscribe not working

**Symptoms:** Customer clicks unsubscribe but continues receiving emails.

**Fixes:**

1. **Check Brevo unsubscribe handling**
   - By default, Brevo manages unsubscribes automatically when using their unsubscribe link
   - Go to Brevo > Contacts > find the contact > check their subscription status

2. **Check n8n workflow filters**
   - Every n8n workflow should filter out unsubscribed contacts before sending
   - The TG-17 sync should mark unsubscribed contacts in Supabase
   - Verify the Brevo webhook for unsubscribe events is configured and reaching n8n

3. **Set up Brevo webhook (if not done)**
   - Brevo > Settings > Webhooks
   - Add a webhook URL pointing to your n8n webhook endpoint
   - Subscribe to the `unsubscribe` event
   - When triggered, n8n should update the customer's `unsubscribed` flag in Supabase

### Problem: n8n workflow not sending

**Symptoms:** Workflow runs but no email arrives.

**Debug steps:**

1. Check n8n execution log for the specific workflow run
2. Look for the HTTP Request node that calls Brevo
3. Check the response:
   - `201` = email sent successfully (check spam folder)
   - `400/401/403` = see API errors section above
   - No response = network/timeout issue
4. Verify the `TG_BREVO_API_KEY` variable is accessible in the workflow
5. Check that the frequency cap didn't suppress the send (look for conditional logic before the HTTP node)

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Brevo Login** | [app.brevo.com](https://app.brevo.com) |
| **API Endpoint** | `https://api.brevo.com/v3/smtp/email` |
| **Sender** | TotalGuard Yard Care `<totalguardllc@gmail.com>` |
| **Free Tier Limit** | 300 emails/day |
| **Frequency Cap** | 2 marketing emails per 7 days per contact |
| **Newsletter Day** | 1st Tuesday of every month |
| **Optimal Send Time** | Tuesday/Wednesday, 9:00 AM CT |
| **Google Review Link** | `https://g.page/r/CRW5Dsg2JgwBEBM/review` |
| **Phone** | (608) 535-6057 |
| **n8n Variable** | `TG_BREVO_API_KEY` |
| **Reviews Data** | `automation/email-templates/reviews-data.json` (72 reviews) |
| **Templates Dir** | `automation/email-templates/` (6 templates) |
| **Campaigns Dir** | `automation/email-templates/campaigns/` (9 configs) |
