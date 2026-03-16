# Feature Landscape

**Domain:** Premium lawn care / yard care website transformation features
**Project:** TotalGuard Yard Care (Madison, WI)
**Researched:** 2026-03-15
**Competitors analyzed:** TruGreen, Sunday Lawn Care, LawnStarter, Lawn Love, Scotts

---

## Table Stakes

Features users expect when they encounter these feature categories. Missing = feature feels half-baked or untrustworthy.

### 1. Instant Quote Calculator

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Address autocomplete (Google Places) | LawnStarter, Sunday, Lawn Love all do this. Users expect to type address, not navigate a map | Low | Google Places API (already have key) |
| Satellite imagery lot measurement | Sunday and LawnStarter measure lawn via satellite. Users expect to SEE their property | High | Google Maps JavaScript API or Deep Lawn API |
| Price display within 30 seconds | "Instant" means instant. Any delay over 30s and users bounce | Med | Supabase pricing tables (already have QuoteFlow) |
| Service selection (checkboxes) | Let user pick which services they want quoted | Low | Existing service catalog |
| Mobile-responsive quote form | 60%+ of local service traffic is mobile | Low | Responsive design |
| Clear price breakdown | Show line items, not just a total. Builds trust | Low | Pricing engine |
| CTA to book/schedule after quote | Quote without next step = dead end | Low | Existing booking flow |

**What "good" looks like:** LawnStarter's flow is the gold standard. Enter address, see satellite image of your property, select services, get price in under 10 seconds. Less than 2% of their quotes need repricing. Sunday uses satellite + soil data + climate data for product recommendations.

**Critical decision:** Do you measure the lot yourself (build measurement tool with Google Maps drawing API) or use a third-party like Deep Lawn ($$$)? For a local company serving 12 cities, manual lot-size lookup via county GIS data or a simple square-footage input with satellite image confirmation is far more practical than building AI measurement. **Recommendation:** Show satellite image for visual confirmation, but let users input/adjust lot size manually. Much simpler, nearly as effective.

### 2. Customer Dashboard Portal

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Secure login (email/password) | Basic expectation for any portal | Low | Supabase Auth (already have) |
| View upcoming scheduled services | TruGreen, RealGreen, GorillaDesk all show this | Med | Jobber API or Supabase scheduling data |
| View past service history | "What did you do last visit?" is the #1 customer question | Med | Service records in DB |
| View and pay invoices online | TruGreen portal's top feature. Customers expect self-service billing | Med | Stripe integration (already have) |
| Account summary (plan, balance, next service) | Dashboard landing page must show status at a glance | Med | Aggregation of multiple data sources |
| Mobile-friendly responsive layout | Customers check on their phones between mowings | Low | Responsive design |

**What "good" looks like:** TruGreen's portal lets customers make payments, set up AutoPay, purchase additional services, request estimates and service calls, view payment and service history, and get maintenance tips. GorillaDesk and RealGreen offer similar feature sets with branded portals embedded in the company website.

**Critical decision:** Build custom vs embed Jobber/RealGreen portal? **Recommendation:** If TotalGuard uses Jobber (mentioned in commit history), embed Jobber's client hub with custom styling to match the brand. Building a full custom portal is 100+ hours of work for feature parity with what Jobber already provides. Only build custom if Jobber's portal can't be styled to match the premium brand.

### 3. Before/After Gallery

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Side-by-side or slider comparison | The slider interaction (drag to reveal) is the expected UX pattern | Med | Image comparison component |
| Organized by service type | Users want to see "aeration" results, not scroll through everything | Low | Tagging/categorization system |
| High-quality, consistent photos | Same angle, same lighting, same framing. Inconsistent photos destroy credibility | N/A (ops) | Photo SOP for crews |
| 20+ comparisons minimum | Fewer than 10 looks thin. 20+ builds confidence | N/A (content) | Photo backlog |
| Mobile touch-friendly slider | Drag-to-compare must work on touch devices | Med | Touch event handling |
| Location/context labels | "Fitchburg, WI - Fall Aeration & Overseeding" tells a story | Low | Metadata per image pair |

**What "good" looks like:** Medical/dental industries lead here with galleries organized by procedure type, diverse representation, consistent lighting, and 50+ comparisons. Landscaping companies lag behind -- this is a real differentiator opportunity. CompanyCam (popular with contractors) provides before/after tooling but most lawn companies just dump photos on Facebook.

### 4. Interactive Service Area Map

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Visual boundary of service area | Users need to know "do you serve MY area?" at a glance | Med | Map API + boundary data |
| City/neighborhood labels | Show the 12 cities served with clear markers | Low | Existing location data |
| Click city to see local page | Connect map to existing location pages | Low | 12 location pages already built |
| Mobile pinch-zoom friendly | Map must work on mobile without fighting the page scroll | Med | Map library touch handling |

**What "good" looks like:** A clean map with a shaded polygon showing the service boundary, markers for each city served, and click-through to location-specific pages. Nothing fancy needed -- clarity beats interactivity here.

**Critical decision:** Google Maps JS API vs Leaflet+OpenStreetMap vs static SVG map. **Recommendation:** Use Leaflet + OpenStreetMap (free, no API key needed, lightweight). For 12 cities in a defined metro area, you don't need Google's features. A custom SVG map is even simpler but less interactive. Leaflet is the sweet spot -- free, performant, professional-looking.

### 5. Hero Video Background

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Autoplay, muted, looped | Standard behavior -- video plays silently on loop | Low | Video hosting (Vercel or CDN) |
| Poster/fallback image | Show image while video loads, or on slow connections | Low | Optimized still frame |
| Mobile fallback to static image | Video on mobile kills performance and burns data | Med | Responsive media queries |
| Under 10 seconds, under 5MB | Performance is non-negotiable. Compress aggressively | N/A (asset) | Video compression pipeline |
| Overlay with readable text | Text over video needs semi-transparent overlay or text shadow | Low | CSS overlay |
| No impact on LCP | Video must not be the LCP element -- use poster image | Med | Lazy video load pattern |

**What "good" looks like:** Video loads after the poster image (which serves as LCP), autoplays muted, loops seamlessly, and is replaced by a static image on mobile. Total page weight increase should be under 3MB with modern compression (H.265/WebM).

### 6. Premium Typography System

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Display font for headlines (Clash Display or Satoshi) | Inter is generic. Premium brands use distinctive display type | Low | next/font + Fontshare |
| Body font for readability (General Sans or Plus Jakarta Sans) | Body text must be highly readable, not just stylish | Low | next/font |
| Mono font for data/numbers (JetBrains Mono or Geist Mono) | Pricing, stats, and data look better in monospace | Low | next/font |
| Consistent type scale | Size ratios should follow a system (1.25 or 1.333 scale) | Low | CSS custom properties |
| Weight variety (300-800) | Thin for elegance, bold for impact, medium for body | Low | Variable font files |
| Dark-on-dark readability fix | Current site has readability issues -- this is the #1 fix | Low | Contrast audit + color tokens |

**What "good" looks like:** Clash Display for headlines (bold, geometric, modern), General Sans or Satoshi for body (clean, readable), with a clear hierarchy. Satoshi is free via Fontshare, works for both display and body. Clash Display is more dramatic for headlines. Both are free for commercial use.

### 7. Server-Side Rendering Conversion

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|-------------|
| Homepage SSR (not client-rendered) | Currently client-rendered -- slow FCP, bad for SEO, bad for Core Web Vitals | High | Refactor to Server Components |
| Dynamic metadata per page | Each page needs unique title, description, OG tags | Med | Next.js generateMetadata |
| Fix 14 Supabase console errors | Production errors destroy credibility with technical users and hurt performance | Med | Error audit + fixes |
| Fix broken animated counters | Currently broken -- shows "0" or doesn't animate | Med | Intersection Observer + SSR-safe animation |
| Streaming SSR for dashboard pages | Dashboard data can stream in progressively | Med | React Suspense boundaries |

**What "good" looks like:** Homepage loads with content visible in under 1.5s (FCP), no layout shift, no console errors, all counters animate on scroll into view. This is foundational -- every other feature looks worse on a slow, error-ridden base.

---

## Differentiators

Features that would set TotalGuard apart from TruGreen, Sunday, and local competitors. Not expected, but create "wow" moments.

### 1. Annual Plan Configurator (Build Your Year-Round Package)

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Interactive timeline showing 12-month plan | No local competitor offers this. Sunday does for DIY products, not services | High | UI component + pricing engine |
| Drag-and-drop or toggle services by season | Visual package building is more engaging than a dropdown | High | Complex UI state management |
| Real-time price update as you add/remove | Instant feedback on cost changes | Med | Client-side pricing calculation |
| Save and share plan | "Send this to my spouse" -- removes friction from household decisions | Med | Shareable link or PDF export |
| Seasonal recommendations based on grass type | Wisconsin-specific: cool-season grass needs specific timing | Med | Existing fertilizer schedule data |
| Discount visualization for annual commitment | Show savings vs a-la-carte pricing prominently | Low | Pricing tier comparison |

**Why this differentiates:** TruGreen offers fixed tiers. Sunday offers custom product plans for DIY. Nobody in the professional lawn care space lets you BUILD your own annual service plan visually. This is TotalGuard's "Sunday meets Spotify Wrapped" moment -- personalized, visual, interactive.

**Simplified version that still differentiates:** Instead of full drag-and-drop, a step-by-step wizard: (1) Select your property size, (2) Pick your priorities (green lawn, weed-free, pest control, full program), (3) See a visual 12-month calendar with services plotted, (4) See total annual price with monthly payment option. This is 60% of the wow factor with 30% of the complexity.

### 2. Crew Rating / Service Feedback

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Rate your crew after each visit (1-5 stars) | No lawn care company exposes this level of transparency | Med | Customer portal + notification system |
| Optional comment/feedback | Captures specific praise or concerns | Low | Text input + DB storage |
| Photo upload of results | Customer can photo their lawn post-service | Med | Image upload to Supabase storage |
| Crew leaderboard (internal) | Gamifies quality for crews | Med | Admin dashboard addition |

**Why this differentiates:** TruGreen has terrible customer service reviews. Showing that TotalGuard actively solicits and acts on feedback is a massive trust signal. This also feeds into the 80+ Google reviews strategy.

### 3. Referral Engine (Give $50, Get $50)

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Unique referral link per customer | Trackable, shareable, personal | Med | Referral code system + DB |
| Dashboard showing referral status | "You've referred 3 friends, earned $150" | Med | Customer portal integration |
| Automatic credit application | Credit applied to next invoice automatically | Med | Stripe/billing integration |
| Social sharing buttons | One-click share to Facebook, text message, email | Low | Share API |
| Tiered rewards for power referrers | 5+ referrals = VIP status or bonus | Low | Tier logic |
| Prominent visibility (not buried) | Best practice: referral program in nav, dashboard, post-service email | Low | UI placement |

**Why this differentiates:** Most lawn care companies have informal "tell a friend" programs. A structured, visible, trackable referral engine with real-time status is rare. Double-sided ($50/$50) programs consistently outperform single-sided ones.

### 4. Smart Content Hub / Education Center

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|-------------|
| Organized by topic (not just blog chronology) | "Weed Control" hub page with all related content | Med | Content taxonomy + hub pages |
| Seasonal content calendar | "What to do in March in Wisconsin" auto-surfaces | Med | Date-based content filtering |
| Local expertise angle | Madison-specific soil, climate, grass type info | Low | Content creation |
| Lead magnets per topic | "Download our Wisconsin Lawn Care Calendar" for email capture | Med | PDF generation + email capture |
| Internal linking to services | Content naturally flows to "hire us to do this for you" | Low | CTA placement strategy |

**Why this differentiates:** TruGreen has generic national content. Sunday has DIY-focused content. A locally-expert education center (Madison soil types, Wisconsin frost dates, Dane County water restrictions) positions TotalGuard as THE local authority. Also massive for SEO -- existing 38 cron jobs suggest SEO is already a priority.

---

## Anti-Features

Things to deliberately NOT build. Common over-engineering mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **AI-powered lawn analysis from photos** | Massive ML infrastructure for marginal value. Sunday raised $78M to do this. You can't compete on AI lawn analysis | Use the satellite imagery for lot measurement only. Let the expertise come from human crews and the 5-step program |
| **Real-time crew GPS tracking** | Creepy for customers, expensive to build, liability issues if crew is at wrong house. Uber-for-lawns companies tried this and customers hated it | Send a "your crew is on the way" notification 30 min before. Simple, effective, no GPS infrastructure |
| **In-app chat with crew** | Crews are mowing, not texting. Creates expectation of real-time response that can't be met | Use the existing AI chatbot for customer questions. Route urgent issues to office phone |
| **Custom CRM/scheduling system** | Jobber/ServiceTitan exist for this reason. Building your own is 6-12 months of work for worse results | Integrate with Jobber. Embed their portal. Use their API for data |
| **Automated satellite lawn health scoring** | Requires multispectral imagery, ML models, ongoing satellite data subscriptions. Deep Lawn charges enterprises for this | Show before/after photos of YOUR work. Real results beat algorithmic scores |
| **Complex gamification (badges, streaks, levels)** | Lawn care is not Duolingo. Customers want a nice lawn, not an achievement system | Simple referral program with clear dollar incentives. Maybe a "loyal customer" badge after 2 years |
| **Multi-language support** | Madison, WI market. English is sufficient for the target demographic. Translation overhead is not justified for the ROI | Focus on clear, jargon-free English. Possibly Spanish for crew-facing tools later |
| **Price comparison with competitors** | Looks desperate. Also, competitor pricing changes constantly | Focus on value proposition and transparent pricing for YOUR services |
| **Video testimonials platform** | Complex to collect, edit, host, and display. Written reviews with photos are nearly as effective | Embed Google Reviews (already have 80+ at 4.9 stars). Add photo testimonials to gallery |
| **Full e-commerce store** | Selling lawn products competes with your service business and adds inventory/shipping complexity | Stick to services. If anything, offer add-on products bundled with service visits |

---

## Feature Dependencies

```
FOUNDATION (must fix first):
  Server-Side Rendering Conversion
  Premium Typography System
  Fix 14 Supabase Console Errors
  Fix Broken Animated Counters
  Dark-on-Dark Readability Fix
       |
       v
VISUAL IMPACT (builds on fixed foundation):
  Hero Video Background
  Before/After Gallery
  Interactive Service Area Map
       |
       v
REVENUE FEATURES (need stable platform):
  Instant Quote Calculator -----> Annual Plan Configurator
       |                              (extends quote flow)
       v
  Customer Dashboard Portal ----> Crew Rating System
       |                              (extends portal)
       v
  Referral Engine (needs portal for tracking)
       |
       v
CONTENT & GROWTH:
  Content Hub / Education Center (independent but benefits from SEO foundation)
```

**Key dependency insight:** The SSR conversion and typography/readability fixes MUST come first. Every subsequent feature looks worse on a slow, error-ridden, hard-to-read site. The foundation work is the highest-leverage investment.

---

## MVP Recommendation

**For MVP (Phase 1-2), prioritize:**

1. **SSR conversion + error fixes + typography** -- Foundation. Everything else depends on this. No customer-facing features until the base is solid.
2. **Hero video background** -- Highest visual impact per hour of work. Single video file + poster image transforms the homepage feel.
3. **Before/after gallery** -- 20 well-shot comparisons with a slider component. Massive trust builder. Low-medium complexity.
4. **Interactive service area map** -- Leaflet + OpenStreetMap, 12 city markers, service boundary polygon. Half-day of work for significant utility.
5. **Instant quote calculator** -- Revenue driver. Build on existing QuoteFlow with satellite image display and lot-size input.

**Defer to post-MVP:**

- **Customer dashboard portal** -- High value but high complexity. Depends on Jobber integration decisions. Phase 3-4.
- **Annual plan configurator** -- Compelling differentiator but complex UI. Build after quote calculator proves the pricing engine. Phase 3-4.
- **Referral engine** -- Needs portal infrastructure. Can run manually via promo codes until portal exists. Phase 4-5.
- **Content hub** -- Already have blog infrastructure. Reorganizing into topic hubs is a content strategy project, not a dev project. Can happen anytime.
- **Crew rating** -- Nice-to-have. Needs portal first. Phase 5+.

---

## Sources

- [LawnStarter](https://www.lawnstarter.com/) -- Instant quote flow, satellite measurement, <2% repricing rate
- [Sunday Lawn Care](https://www.getsunday.com/custom-lawn-plan) -- Custom plan configurator, satellite + soil + climate analysis
- [TruGreen Customer Portal](https://www.trugreen.com/my-account/login) -- Portal features: payments, AutoPay, service history, referrals
- [Lawn Love Pricing](https://lawnlove.com/pricing) -- Instant quotes from $29, satellite imagery
- [RealGreen Customer Portal](https://www.realgreen.com/features/lawn-care-customer-portal) -- Industry-standard lawn care portal features
- [GorillaDesk](https://gorilladesk.com/features/customer-portal-software/) -- Portal for pest/lawn/pool businesses
- [Deep Lawn](https://deeplawn.com/measurements) -- AI-powered property measurement from satellite imagery
- [Scotts Lawn Care Plan](https://program.scotts.com/) -- Seasonal plan builder, annual savings model
- [Referral Program Best Practices 2025](https://viral-loops.com/blog/referral-program-best-practices-in-2025/) -- Double-sided programs, tiered rewards, visibility
- [Jobber Referral Programs](https://www.getjobber.com/academy/how-to-create-referral-program/) -- Service business referral implementation
- [Hero Video Best Practices](https://designtlc.com/how-to-optimize-a-silent-background-video-for-your-websites-hero-area/) -- Compression, fallback images, LCP impact
- [Hero Section Design 2026](https://www.perfectafternoon.com/2025/hero-section-design/) -- Large typography + video trends
- [Before/After Gallery Conversion](https://business.shapescale.com/content/posts/before-after-pictures-marketing) -- 83% conversion rate improvement with visual marketing
- [CompanyCam Before/After Tool](https://companycam.com/resources/blog/best-before-after-photo-tool-for-contractors) -- Contractor photo documentation
- [Leaflet](https://github.com/Leaflet/Leaflet) -- Free, open-source mapping library
- [Google Maps API Pricing 2025](https://radar.com/blog/mapbox-vs-google-maps-api) -- $200/month credit, per-SKU pricing restructure
- [Clash Display Font](https://lucky.graphics/asset/clash-display-font/) -- Free geometric display font for modern UI
- [Satoshi Font](https://shakuro.com/blog/best-fonts-for-web-design) -- Free geometric sans-serif, trending in 2025
