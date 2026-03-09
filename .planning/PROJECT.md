# TotalGuard Yard Care — Project

## What This Is
Full-stack marketing automation system for TotalGuard Yard Care (Madison, WI), a landscaping company. Combines a Next.js website with a complete backend automation stack: 88 n8n workflows, 70+ Supabase tables, AI voice agent, email marketing, field marketing, SEO automation, and owner reporting.

## Core Value
Turn TotalGuard into a fully automated marketing machine that captures every lead, follows up automatically, generates reviews, manages field marketing, dominates local SEO, and gives the owner a daily intelligence briefing — all without manual effort.

## Stack
- **Website**: Next.js 16 + React 19 + Tailwind CSS 3.4 + shadcn/ui (Vercel)
- **Database**: Supabase (project: lwtmvzhwekgdxkaisfra)
- **Automation**: n8n Cloud (workelyai.app.n8n.cloud) — TG- prefixed workflows, tag: fPXl9eiMhJc3ISQQ
- **Email**: Brevo (free tier, 300/day)
- **SMS**: Twilio (608 area code)
- **AI**: Claude API (Haiku for workflows, Sonnet for complex)
- **Voice**: Vapi
- **Postcards**: Lob
- **CRM**: Jobber (email parsing only — no direct API)

## Business Details
- **Name**: TotalGuard Yard Care (TotalGuard LLC)
- **Phone**: (608) 535-6057
- **Email**: totalguardllc@gmail.com
- **Address**: 7610 Welton Dr, Madison, WI 53711
- **Services**: Lawn Mowing, Fertilization, Aeration, Herbicide, Weeding, Mulching, Garden Bed Care, Bush Trimming, Hardscaping, Spring Cleanup, Fall Cleanup, Leaf Removal, Gutter Cleaning, Gutter Guard Installation, Snow Removal
- **Service Areas**: Madison, Middleton, Waunakee, Monona, Sun Prairie, Fitchburg, Verona, McFarland, Cottage Grove, DeForest, Oregon, Stoughton

## Requirements
1. Complete Supabase schema: 70+ tables, views, RPCs, RLS policies
2. 88 n8n workflows across 10 categories, all prefixed TG-
3. Jobber email bridge (no direct API access)
4. Brevo email marketing: welcome series, nurture, cross-sell, seasonal, reengagement
5. Review management: auto-request, AI responses, Google sync
6. Field marketing: yard signs, door hangers, compliance tracking
7. Social media: scheduling, AI captions, competitor monitoring
8. SEO: keyword tracking, GBP automation, IndexNow, content refresh
9. Owner reporting: daily KPI digest, weekly report, revenue forecast
10. AI tools: Telegram bot, quoting engine, two-way SMS, voice agent sync
