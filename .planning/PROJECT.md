# TG Yard Care

## What This Is

A scalable property care platform for TotalGuard Yard Care LLC, serving Madison/Dane County, WI. Next.js App Router on Vercel with Supabase-driven dynamic pricing, instant quote generation, lead scoring, and 50+ indexable pages. Designed to look like a company managing 10,000 properties — even while managing 100.

## Core Value

**Convert property owners into qualified, high-AOV leads through instant pricing transparency and zero-friction quote flows** — eliminating the phone-call bottleneck that caps revenue at owner-operator income.

## Current Milestone: v2.0 Billion-Dollar Transformation

**Goal:** Complete rebuild of tgyardcare.com from Lovable brochure site to enterprise-grade lead generation system.

**Target features:**
- Supabase-driven dynamic pricing (Good/Better/Best tiers, seasonal modifiers, lot-size pricing)
- Multi-step quote flow with instant price calculation and lead quality scoring
- 15-25 location pages for Dane County municipalities (auto-generated from database)
- Full schema markup (LocalBusiness, Service, FAQPage) for AI/LLM discoverability
- Blog system with topic clusters and semantic internal linking
- Premium design system (fintech-level, not landscaping brochure)

## Requirements

### Validated

- ✓ GitHub repository created (TotalGuardYardCare/tgyardcarecom) — v1.0
- ✓ Supabase project created and configured — v1.0
- ✓ Contact form submissions stored in Supabase — v1.0
- ✓ Admin authentication via Supabase Auth — v1.0
- ✓ Admin dashboard with leads panel — v1.0
- ✓ Website content management without code changes — v1.0

### Active

- [ ] Next.js App Router site deployed on Vercel replacing Lovable SPA
- [ ] 18+ Supabase tables for services, pricing, locations, leads, content
- [ ] Dynamic pricing with Good/Better/Best tiers from Supabase
- [ ] Seasonal pricing modifiers applied automatically
- [ ] Multi-step quote flow with instant price calculation
- [ ] Lead quality scoring and founder notification
- [ ] 15-25 auto-generated location pages
- [ ] Full JSON-LD schema markup on all page types
- [ ] Blog system with markdown + Supabase metadata
- [ ] Internal link graph computed from junction tables
- [ ] Dynamic sitemap from Supabase slugs
- [ ] Premium design system with consistent NAP
- [ ] 301 redirects from old site structure
- [ ] Professional email (hello@tgyardcare.com)

### Out of Scope

- Replacing Jobber — remains primary job management system
- Customer portal/login — customers don't need accounts
- Online payments — handled through Jobber
- Mobile app — web-first only
- Real-time chat/chatbot — existing chatbot not carried forward in v2.0
- Commercial/property management landing page — post-launch
- Automated email sequences — post-launch
- CRM integration — post-launch when volume justifies

## Context

**Business:** TotalGuard Yard Care LLC, founded 2022 by Alex O'Donnell and Vance Ferry. Services: lawn mowing, landscaping, mulching, gutter cleaning/guards, seasonal cleanup, window washing. Madison metro area.

**Current State (v1.0):**
- Website built on Lovable.dev (React SPA, client-side rendered)
- GitHub repo: TotalGuardYardCare/tgyardcarecom
- Supabase: mxhalirruvyxdkppjsqf.supabase.co (16 tables)
- Admin dashboard at /admin with leads, SEO, content management
- Gmail notifications for form submissions
- Two domains: tgyardcare.com (primary), totalguardyardcare.com (needs 301)

**Key Problems Solved by v2.0:**
- Client-side rendering invisible to search engines → SSR/SSG
- No pricing transparency → instant pricing from Supabase
- Manual quote process → multi-step quote flow
- No location pages → 15-25 auto-generated municipality pages
- No structured data → full schema markup
- No content strategy → blog with topic clusters
- Gmail as business email → professional domain email
- Fragmented brand (TG/TotalGuard/TotalGuard Home Care) → unified entity

**Existing Supabase Data:**
- contact_submissions table (leads)
- Admin auth with role-based access
- Website content tables
- SEO configuration tables

## Constraints

- **Platform**: Next.js App Router on Vercel (replacing Lovable/Vite)
- **Backend**: Existing Supabase project (extend schema, don't replace)
- **Domains**: tgyardcare.com primary, 301 from totalguardyardcare.com
- **Design**: Premium/institutional — NOT typical landscaping aesthetic
- **Performance**: Lighthouse 90+ on all metrics
- **SEO**: Server-side rendered, full schema markup, AI-citation optimized
- **Budget**: Vercel free/pro tier, Supabase free tier

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lovable → Next.js rewrite | CSR invisible to search engines; need SSR/SSG, App Router, API routes | — Pending |
| Supabase for all dynamic content | Prices, services, locations, FAQs, reviews update without deploys | — Pending |
| Good/Better/Best pricing tiers | Shifts buyer question from "should I buy?" to "which level?" | — Pending |
| Seasonal price modifiers | Captures peak-demand margin automatically | — Pending |
| Dynamic location pages from DB | Adding a city = adding a row, no code changes | — Pending |
| Blog as markdown + Supabase metadata | Content in Git, relationships in DB for internal linking | — Pending |
| No discounts/coupons ever | Urgency through availability scarcity, not price reduction | — Pending |

---
*Last updated: 2026-02-04 after milestone v2.0 initialization*
