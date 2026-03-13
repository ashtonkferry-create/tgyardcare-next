# Brevo Setup Guide — TotalGuard Email Marketing

## 1. Domain Authentication (Do This First)

Go to: Brevo Dashboard → Settings → Senders, Domains & Dedicated IPs → Domains

**Add domain**: `tgyardcare.com`

Brevo will give you DNS records to add at your domain registrar:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `mail._domainkey.tgyardcare.com` | (Brevo provides) | DKIM signing |
| TXT | `tgyardcare.com` | `v=spf1 include:sendinblue.com ~all` | SPF authorization |
| CNAME | (Brevo provides) | (Brevo provides) | Return-path verification |

After adding, click "Verify" in Brevo. Takes up to 48 hours but usually 15-30 minutes.

**Why this matters**: Without domain auth, emails land in spam. With it, they show as "sent from tgyardcare.com" — not "via sendinblue.com".

---

## 2. Sender Configuration

Go to: Settings → Senders, Domains & Dedicated IPs → Senders

Create two senders:

| Sender Name | Email | Use Case |
|-------------|-------|----------|
| Vance from TotalGuard | totalguardllc@gmail.com | Welcome, re-engagement, personal emails |
| TotalGuard Yard Care | totalguardllc@gmail.com | Campaigns, newsletters, promotions |

---

## 3. Contact Lists

Go to: Contacts → Lists

Create these lists:

| List Name | Sync Source | Description |
|-----------|------------|-------------|
| All Customers | Supabase `customers` table | Everyone who's ever been a customer |
| Active Leads | Website forms + n8n TG-01 | People who requested quotes but haven't booked |
| VIP Customers | Supabase (3+ services) | High-value multi-service customers |
| Dormant 90+ | Supabase (no service 90+ days) | Win-back targets |
| Newsletter | Website opt-in | "The Yard Report" subscribers |

### Contact Attributes (create these custom fields):

| Attribute | Type | Purpose |
|-----------|------|---------|
| FIRST_NAME | Text | Personalization |
| LAST_NAME | Text | Personalization |
| CITY | Text | Local references in emails |
| SERVICES | Text | Comma-separated service list |
| LAST_SERVICE | Text | Most recent service name |
| LAST_SERVICE_DATE | Date | For re-engagement triggers |
| LEAD_SCORE | Number | Hot/warm/cold tier routing |
| CUSTOMER_SINCE | Date | Tenure for VIP qualification |
| REFERRAL_COUNT | Number | Referral tracking |
| HAS_SNOW_CONTRACT | Boolean | Weather email routing |

---

## 4. API Key Setup

The Brevo API key is already in the project environment. The n8n workflows use it via the Brevo node's HTTP Request with header:

```
api-key: {{BREVO_API_KEY}}
```

**API endpoint**: `https://api.brevo.com/v3/smtp/email`

**Payload format** (what our n8n workflows send):

```json
{
  "sender": {
    "name": "Vance from TotalGuard",
    "email": "totalguardllc@gmail.com"
  },
  "to": [
    {
      "email": "{{customer_email}}",
      "name": "{{first_name}} {{last_name}}"
    }
  ],
  "subject": "{{subject_line}}",
  "htmlContent": "{{html_body}}",
  "textContent": "{{plain_text_fallback}}",
  "headers": {
    "X-Mailin-Tag": "{{campaign_id}}"
  },
  "params": {
    "first_name": "{{first_name}}",
    "city": "{{city}}",
    "last_service": "{{last_service}}"
  }
}
```

---

## 5. Brevo Free Tier Limits

| Limit | Amount |
|-------|--------|
| Emails per day | 300 |
| Contacts | Unlimited |
| Templates | Unlimited |
| Automation workflows | Limited to 2,000 contacts |

**With ~100-200 active contacts, 300/day is plenty.** As the list grows past 500, consider upgrading to Starter ($9/month for 5,000 emails/month).

---

## 6. n8n Workflow → Brevo Integration

Each n8n workflow builds the HTML email in a Code node, then sends via Brevo's transactional API.

**Flow**:
1. n8n trigger (cron, webhook, or Supabase query)
2. Code node: selects email content from campaign JSON, injects personalization tokens, builds full HTML
3. HTTP Request node: POST to `https://api.brevo.com/v3/smtp/email`
4. Supabase node: logs send to `email_sends` table

**Frequency capping** is handled in the Code node — before sending, it checks `email_sends` for recent sends to that contact and skips if over the cap (3/week, 1/day promotional).

---

## 7. Testing Before Going Live

1. **Send test emails** to totalguardllc@gmail.com first
2. **Check rendering** in:
   - Gmail (web + mobile)
   - Apple Mail (iPhone + Mac)
   - Outlook (web + desktop)
3. **Verify links** — every CTA, phone link, review link, unsubscribe
4. **Check spam score** — Brevo provides this in the template editor
5. **Test personalization** — make sure {{first_name}}, {{city}} etc. render correctly
6. **Mobile test** — preview at 375px width

---

## 8. Unsubscribe & Compliance

Brevo handles CAN-SPAM compliance automatically:
- Unsubscribe link in every email footer (already in our templates)
- Physical address in footer (7610 Welton Dr, Madison, WI 53711)
- Brevo auto-suppresses unsubscribed contacts

**Our templates include**:
- `{{unsubscribe_url}}` — Brevo's managed unsubscribe
- `{{preferences_url}}` — manage frequency preferences
- Physical address in every footer

---

## 9. Monitoring & Optimization

**Key metrics to watch** (available in Brevo dashboard):

| Metric | Target | Action if Below |
|--------|--------|----------------|
| Open rate | 25%+ | Test subject lines, check deliverability |
| Click rate | 3%+ | Improve CTA copy/placement |
| Bounce rate | <2% | Clean list, verify emails |
| Unsubscribe rate | <0.5% | Reduce frequency, improve relevance |
| Spam complaints | <0.1% | Check content, review sending patterns |

**A/B Testing**: Every email has two subject lines. Send variant A to 25% of list, variant B to 25%, winner to remaining 50%. Brevo's automation handles this.
