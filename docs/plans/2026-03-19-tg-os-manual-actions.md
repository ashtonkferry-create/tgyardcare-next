# TG-OS: Manual Actions for Vance
## Things only YOU can do (requires logging into platforms)
**Created:** 2026-03-19

---

## CRITICAL: FACEBOOK IS HACKED
- Facebook business page (`/totalguardyard/`) is compromised
- Do NOT post to or interact with Facebook until resolved
- Options: (1) Recover the page via Facebook support, (2) Create a new page
- Once resolved, update all codebase references if the URL changes
- Upload-Post: connect all platforms EXCEPT Facebook

---

## PRIORITY 1: IMMEDIATE (Do First)

### 1. Verify Twilio A2P 10DLC Campaign
- **Where:** Twilio Console → Messaging → Regulatory Compliance → Campaign Registry
- **What:** Check if the A2P campaign for +16089953554 is APPROVED
- **Why:** If not approved, ALL outbound SMS from our automations is silently failing (carrier-filtered)
- **If pending:** Nothing you can do but wait. Twilio reviews in 3-5 business days.
- **If rejected:** You'll need to resubmit with corrected info

### 2. Fix Twilio Inbound Webhook
- **Where:** Twilio Console → Phone Numbers → +16089953554 → Configure
- **What:** Change the incoming message webhook URL from `demo.twilio.com` to the n8n TG-76 webhook URL
- **Why:** Two-way SMS can't receive replies without this
- **Action:** Get the webhook URL from n8n (TG-76 workflow → trigger node → copy webhook URL), paste into Twilio

### 3. Configure Quo Missed Call Webhook
- **Where:** Quo/OpenPhone dashboard or API
- **What:** Set up `call.completed` webhook pointing to n8n TG-85 webhook URL
- **Why:** Enables auto-SMS when you miss a call on (608) 535-6057

---

## PRIORITY 2: SOCIAL PROFILE FIXES (This Week)

### 4. Facebook Business Page
- [ ] Log into Facebook → go to your business page at facebook.com/totalguardyard/
- [ ] Change vanity URL to `/totalguardyardcare` to match the website (Page Settings → Username)
  - OR: We already updated the website to link to `/totalguardyard/` — verify which is correct
- [ ] Complete all fields: hours (Mon-Sat 7a-7p), services, price range, all service areas
- [ ] Upload professional cover photo (seasonal)
- [ ] Set CTA button to "Get Quote" linking to tgyardcare.com/quote
- [ ] Pin a post with current seasonal promo

### 5. Instagram
- [ ] Log into @totalguardyardcare
- [ ] Update bio: "Madison's Premium Lawn Care | 4.9 on Google | Free Estimates"
- [ ] Link in bio: tgyardcare.com/quote
- [ ] Create Story Highlights: Before/Afters, Reviews, Services, Team
- [ ] Post at least 3 before/after photos to start the grid

### 6. Nextdoor
- [ ] Log into Nextdoor business page
- [ ] Change name from "TotalGuard Home Care" → "TotalGuard Yard Care"
- [ ] Verify phone and address match: (608) 535-6057, 7610 Welton Dr

### 7. BBB
- [ ] Go to bbb.org → your listing → update phone numbers
- [ ] Remove (920) 629-6934 and (608) 573-1429
- [ ] Set primary phone to (608) 535-6057
- [ ] Consider BBB accreditation ($400-500/year) for trust signals

### 8. Yelp
- [ ] Go to biz.yelp.com → claim listing if not claimed
- [ ] Add photos, service list, hours
- [ ] Respond to any existing reviews

### 9. LinkedIn Company Page
- [ ] Create at linkedin.com/company/setup/new
- [ ] Name: TotalGuard Yard Care
- [ ] Industry: Landscaping
- [ ] Size: 2-10 employees
- [ ] Description targeting commercial accounts and property managers
- [ ] Add logo and cover image

---

## PRIORITY 3: NEW SOCIAL ACCOUNTS (This Week)

### 10. Create YouTube Channel
- [ ] Go to youtube.com → Create Channel → "TotalGuard Yard Care"
- [ ] Add channel art, logo, description with Madison lawn care keywords
- [ ] Create playlists: Before & After, Lawn Tips, Seasonal Guides
- [ ] Upload first video (even a simple before/after phone video)

### 11. Create TikTok Account
- [ ] Download TikTok → create @totalguardyardcare
- [ ] Bio: "Madison's #1 Lawn Care | Oddly satisfying mows"
- [ ] Post first video: satisfying mowing clip or quick before/after

### 12. Create Pinterest Account
- [ ] Go to pinterest.com → create business account
- [ ] Name: TotalGuard Yard Care
- [ ] Create boards: Lawn Transformations, Landscaping Ideas, Seasonal Tips, Madison Homes
- [ ] Pin before/after photos

---

## PRIORITY 4: PAID ADS SETUP (Week 2-3)

### 13. Google Local Service Ads
- [ ] Go to ads.google.com/local-services-ads
- [ ] Apply for Google Verified badge
- [ ] Submit: background check, proof of insurance, business license
- [ ] Set service areas (Madison + surrounding cities)
- [ ] Set weekly budget ($500-1000/month to start)
- [ ] CRITICAL: Respond to every lead within 5 minutes

### 14. Upload-Post Account
- [ ] Go to upload-post.com → create account
- [ ] Connect: Facebook page, Instagram, YouTube, TikTok, LinkedIn, Pinterest
- [ ] Copy API key for n8n integration
- [ ] Test with a manual post to all platforms

---

## PRIORITY 5: GBP OPTIMIZATION (Once API Approved)

### 15. Google Business Profile Manual Optimization
- [ ] Update business description to the SEO-optimized version in the design doc
- [ ] Add ALL services with the titles and descriptions from the design doc
- [ ] Add Products (Annual Plan, Fertilizer Program, Spring Package, Fall Package)
- [ ] Upload 50+ photos organized by category
- [ ] Add all service areas
- [ ] Post the first GBP post following the Monday/Wednesday/Friday schedule
- [ ] Add the core FAQs from the design doc
- [ ] Verify hours: Mon-Sat 7:00 AM - 7:00 PM

### 16. Jobber Email Notifications
- [ ] Go to Jobber → Settings → Notifications
- [ ] Enable email notifications for ALL events: job created, scheduled, completed, quote sent/accepted, invoice sent/paid
- [ ] Verify emails go to totalguardllc@gmail.com (where TG-05 parses them)

---

## ONGOING ACTIONS

### Weekly
- [ ] Upload 5+ new photos to GBP (before/afters from that week's jobs)
- [ ] Review and approve AI-generated GBP post drafts on Telegram
- [ ] Review and approve AI-generated review responses on Telegram
- [ ] Post 1-2 times on Nextdoor (manual — no API available)

### Monthly
- [ ] Review monthly marketing report (sent to Telegram)
- [ ] Check LSA lead quality and dispute invalid leads
- [ ] Review competitor intelligence report

### Quarterly
- [ ] Swap seasonal FAQs on GBP (prompted by Telegram)
- [ ] Update GBP cover photo for new season
- [ ] Review and refresh social media bios for seasonal relevance
