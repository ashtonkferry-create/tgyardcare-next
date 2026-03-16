# Cron Job Audit

**Audited:** 2026-03-16
**Total cron jobs:** 41
**Source:** vercel.json

## Cron Schedule

| # | Route | Schedule | Human-Readable | Purpose | Status |
|---|-------|----------|----------------|---------|--------|
| 1 | /api/cron/season-switcher | `0 6 * * *` | Daily 6 AM UTC (1 AM CT) | Checks current season and updates site_config if season has changed; sends Slack alert on switch | Active |
| 2 | /api/cron/review-schema-updater | `0 7 * * *` | Daily 7 AM UTC (2 AM CT) | Aggregates review ratings from reviews table and updates structured data (AggregateRating schema) | Active |
| 3 | /api/cron/indexnow | `0 7 * * *` | Daily 7 AM UTC (2 AM CT) | Submits key pages to IndexNow API (Bing/Yandex) for faster indexing; tracks 35+ URLs | Active |
| 4 | /api/cron/robots-guard | `0 6 * * *` | Daily 6 AM UTC (1 AM CT) | Fetches robots.txt and validates it contains Disallow:/admin and Sitemap directive | Active |
| 5 | /api/cron/lead-response-timer | `0 9 * * *` | Daily 9 AM UTC (4 AM CT) | Alerts via Slack if any contact submissions are >2 hours old without a response | Active |
| 6 | /api/cron/review-request | `0 10 * * *` | Daily 10 AM UTC (5 AM CT) | Finds completed jobs from last 7 days without review requests and queues review solicitation emails | Active |
| 7 | /api/cron/seo-audit | `0 12 * * 1` | Monday 12 PM UTC (7 AM CT) | Proxy route that forwards to /api/admin/seo-audit with CRON_SECRET auth | Active |
| 8 | /api/cron/sitemap-check | `0 14 * * 1` | Monday 2 PM UTC (9 AM CT) | Fetches sitemap.xml, extracts all URLs, HEAD-checks each for broken links | Active |
| 9 | /api/cron/gbp-post | `0 14 * * 1` | Monday 2 PM UTC (9 AM CT) | Generates a seasonal Google Business Profile post via Claude AI and stores in gbp_posts table | Active |
| 10 | /api/cron/schema-validator | `0 15 * * 1` | Monday 3 PM UTC (10 AM CT) | Fetches 13 key pages, parses JSON-LD structured data, validates required schema types exist | Active |
| 11 | /api/cron/weekly-digest | `0 13 * * 1` | Monday 1 PM UTC (8 AM CT) | Compiles weekly summary: lead count, avg SEO score, critical pages, active automations; emails to owner | Active |
| 12 | /api/cron/image-alt-checker | `0 8 * * 2` | Tuesday 8 AM UTC (3 AM CT) | Crawls 14 pages for images missing alt text; logs issues to page_seo table | Active |
| 13 | /api/cron/heading-auditor | `0 9 * * 2` | Tuesday 9 AM UTC (4 AM CT) | Checks 21 pages for H1 count issues (missing, duplicates, multiple H1s) | Active |
| 14 | /api/cron/nap-checker | `0 9 * * 2` | Tuesday 9 AM UTC (4 AM CT) | Validates Name/Address/Phone consistency across 12+ pages against canonical NAP values | Active |
| 15 | /api/cron/meta-gen | `0 10 * * 2` | Tuesday 10 AM UTC (5 AM CT) | Uses Claude AI to generate meta descriptions for pages in page_seo that lack them | Active |
| 16 | /api/cron/geo-signal-auditor | `0 10 * * 2` | Tuesday 10 AM UTC (5 AM CT) | Audits 11 pages for geo signals (city names, state, zip) and NAP presence in content | Active |
| 17 | /api/cron/faq-builder | `0 11 * * 2` | Tuesday 11 AM UTC (6 AM CT) | Uses Claude AI to generate FAQ content for 6 service pages; stores FAQSchema-ready data | Active |
| 18 | /api/cron/page-speed-monitor | `0 8 * * 3` | Wednesday 8 AM UTC (3 AM CT) | Runs PageSpeed Insights API on 5 key pages; stores performance/accessibility/SEO scores | Active |
| 19 | /api/cron/review-response-drafter | `0 9 * * 3` | Wednesday 9 AM UTC (4 AM CT) | Fetches unresponded reviews and drafts professional responses (stored, not auto-posted) | Active |
| 20 | /api/cron/rank-tracker | `0 10 * * 3` | Wednesday 10 AM UTC (5 AM CT) | Tracks Google SERP positions for 16 target keywords via scraping; stores rank history | Active |
| 21 | /api/cron/aeo-optimizer | `0 11 * * 3` | Wednesday 11 AM UTC (6 AM CT) | Audits 9 FAQ pages for Answer Engine Optimization: checks FAQ schema, answer length, question format | Active |
| 22 | /api/cron/social-auto-post | `0 9 * * 4` | Thursday 9 AM UTC (4 AM CT) | Generates seasonal social media post content via Claude AI; stores drafts for manual posting | Active |
| 23 | /api/cron/content-freshness | `0 8 1 * *` | 1st of month 8 AM UTC (3 AM CT) | Flags pages in page_seo as needs_refresh if audited_at > 90 days ago; pings IndexNow for stale pages | Active |
| 24 | /api/cron/content-refresher | `0 9 1 * *` | 1st of month 9 AM UTC (4 AM CT) | Uses Claude AI to rewrite content for pages flagged as needs_refresh; updates page content | Active |
| 25 | /api/cron/local-gap-finder | `0 8 1 * *` | 1st of month 8 AM UTC (3 AM CT) | Identifies expansion opportunities: cities and services without dedicated pages | Active |
| 26 | /api/cron/internal-link-optimizer | `0 10 1 * *` | 1st of month 10 AM UTC (5 AM CT) | Crawls 30+ pages to build internal link graph; identifies orphaned pages and linking opportunities | Active |
| 27 | /api/cron/competitor-monitor | `0 9 5 * *` | 5th of month 9 AM UTC (4 AM CT) | Checks 4 competitor websites for availability, meta tags, schema presence; compares to own site | Active |
| 28 | /api/cron/citation-sync | `0 9 10 * *` | 10th of month 9 AM UTC (4 AM CT) | Verifies business listings on directories (Yelp, Facebook, BBB, etc.) for NAP consistency | Active |
| 29 | /api/cron/backlink-monitor | `0 9 15 * *` | 15th of month 9 AM UTC (4 AM CT) | Checks known backlinks (Facebook, Instagram, Nextdoor, etc.) are still live and pointing correctly | Active |
| 30 | /api/cron/schema-generator | `0 8 * * 5` | Friday 8 AM UTC (3 AM CT) | Generates JSON-LD structured data schemas for all known routes (LocalBusiness, Service, FAQ, etc.) | Active |
| 31 | /api/cron/review-responder | `0 8 * * *` | Daily 8 AM UTC (3 AM CT) | Fetches unresponded Google reviews via GBP API, generates AI replies, posts responses automatically | Active |
| 32 | /api/cron/gbp-post-publisher | `0 14 * * 2` | Tuesday 2 PM UTC (9 AM CT) | Generates and publishes Google Business Profile posts via GBP API with seasonal content and images | Active |
| 33 | /api/cron/review-faq-miner | `0 10 * * 0` | Sunday 10 AM UTC (5 AM CT) | Mines Google reviews for FAQ-worthy questions/topics using Claude AI; creates FAQ entries | Active |
| 34 | /api/cron/gbp-audit | `0 8 * * 1` | Monday 8 AM UTC (3 AM CT) | Audits GBP posts via API: checks posting frequency, content quality, engagement metrics | Active |
| 35 | /api/cron/blog-generator | `0 10 * * 5` | Friday 10 AM UTC (5 AM CT) | Generates seasonal blog posts using Claude AI with topic bank; publishes to blog_posts table | Active |
| 36 | /api/cron/seo-crawl | `0 3 * * *` | Daily 3 AM UTC (10 PM CT) | Full SEO crawler: checks all sitemap URLs for title/meta/canonical/OG/schema issues; stores in seo_issues | Active |
| 37 | /api/cron/seo-heal | `0 3:30 * * *` | Daily 3:30 AM UTC (10:30 PM CT) | Auto-fixes SEO issues found by seo-crawl: generates missing meta, fixes titles, adds canonical tags | Active |
| 38 | /api/cron/seo-ping | `0 6 * * *` | Daily 6 AM UTC (1 AM CT) | Pings all sitemap URLs to search engines (Google, Bing) to request re-crawling | Active |
| 39 | /api/cron/seo-score | `0 7 * * *` | Daily 7 AM UTC (2 AM CT) | Calculates composite SEO health score from sitemap coverage, issue counts, schema presence | Active |
| 40 | /api/cron/seo-report | `0 8 * * 1` | Monday 8 AM UTC (3 AM CT) | Weekly SEO report: aggregates crawl results, issue trends, top/bottom pages; emails to owner | Active |
| 41 | /api/cron/blog-seed | N/A (not in vercel.json) | Manual trigger only | Seeds initial blog posts with 675 lines of pre-written content across multiple categories | Active (manual) |

## Summary

### By Status
- **Active:** 41 (all route handlers have code)
- **Stub:** 0
- **Missing:** 0

### By Frequency
- **Daily:** 12 jobs (season-switcher, review-schema-updater, indexnow, robots-guard, lead-response-timer, review-request, review-responder, seo-crawl, seo-heal, seo-ping, seo-score)
- **Weekly (specific day):** 18 jobs
  - Monday (7): seo-audit, sitemap-check, gbp-post, schema-validator, weekly-digest, gbp-audit, seo-report
  - Tuesday (6): image-alt-checker, heading-auditor, nap-checker, meta-gen, geo-signal-auditor, faq-builder, gbp-post-publisher
  - Wednesday (4): page-speed-monitor, review-response-drafter, rank-tracker, aeo-optimizer
  - Thursday (1): social-auto-post
  - Friday (2): schema-generator, blog-generator
  - Sunday (1): review-faq-miner
- **Monthly:** 6 jobs (content-freshness, content-refresher, local-gap-finder, internal-link-optimizer, competitor-monitor, citation-sync, backlink-monitor)
- **Manual only:** 1 (blog-seed)

### Schedule Conflicts (Same Time Slot)
- `0 6 * * *` — season-switcher AND robots-guard AND seo-ping (3 jobs)
- `0 7 * * *` — review-schema-updater AND indexnow AND seo-score (3 jobs)
- `0 9 * * 2` — heading-auditor AND nap-checker (2 jobs)
- `0 10 * * 2` — meta-gen AND geo-signal-auditor (2 jobs)
- `0 8 * * 1` — gbp-audit AND seo-report (2 jobs)
- `0 14 * * 1` — sitemap-check AND gbp-post (2 jobs)
- `0 8 1 * *` — content-freshness AND local-gap-finder (2 jobs)

### Potential Overlap/Redundancy
- **gbp-post** (#9) and **gbp-post-publisher** (#32): Both generate GBP posts. gbp-post is the older/simpler version (Claude AI only), gbp-post-publisher is the newer version with GBP API integration, images, and validation. Consider deactivating gbp-post.
- **review-response-drafter** (#19) and **review-responder** (#31): Drafter creates draft responses (manual review), responder auto-posts via GBP API. Both are useful but handle different workflows.
- **seo-audit** (#7) is just a proxy to /api/admin/seo-audit -- may be redundant with seo-crawl + seo-score pipeline.

### Notes
- All routes use CRON_SECRET bearer token authentication
- Most routes log results to automation_runs or specialized tables in Supabase
- AI-powered routes (meta-gen, faq-builder, content-refresher, gbp-post, social-auto-post, blog-generator, review-faq-miner, review-responder, gbp-post-publisher) require ANTHROPIC_API_KEY
- GBP routes (review-responder, gbp-post-publisher, gbp-audit, review-faq-miner) require GBP_LOCATION_NAME and Google OAuth credentials
- blog-seed exists as a route handler but is not scheduled in vercel.json (manual trigger only, included for completeness)
