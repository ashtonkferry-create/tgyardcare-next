# TotalGuard Yard Care - Website Integration Platform

## What This Is

A full integration setup connecting the tgyardcare.com website (built on Lovable.dev) with GitHub for version control, Supabase for backend data, n8n for workflow automations, and Jobber for business operations. This enables the owner to manage website changes locally via Claude Code while automating lead capture, customer communication, and business workflows.

## Core Value

**Automate the lead-to-customer pipeline** - when someone submits a contact form on tgyardcare.com, the system automatically stores the data, notifies the owner, creates a lead in Jobber, and sends a thank-you email - all without manual intervention.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] GitHub repository created and connected to Lovable project
- [ ] Claude Code authenticated with GitHub (totalguardllc@gmail.com)
- [ ] Supabase project created and connected to website
- [ ] Contact form submissions stored in Supabase
- [ ] Admin authentication for dashboard access
- [ ] Admin dashboard to view leads and manage content
- [ ] Website content manageable without code changes
- [ ] n8n workflows configured for automations
- [ ] Lead notification automation (email/SMS to owner)
- [ ] Jobber integration (auto-create leads from website)
- [ ] Thank-you email automation to customers
- [ ] Review request automation after job completion
- [ ] Analytics tracking (website traffic, conversions)

### Out of Scope

- Replacing Jobber — Jobber remains the primary job management system
- Customer portal/login — customers don't need accounts
- Online payments — handled through Jobber
- Mobile app — web-based admin only
- Multi-user roles — single admin (owner only)

## Context

**Business:** TotalGuard Yard Care is a landscaping business with 2-5 employees serving local customers. Customers contact via phone and website contact form.

**Current State:**
- Website fully built on Lovable.dev at tgyardcare.com
- No GitHub repository connected yet
- Using Jobber for job scheduling, invoicing, and CRM
- Manual process for handling website inquiries

**Integration Points:**
- Lovable ↔ GitHub: Code sync for version control
- Website → Supabase: Form submissions, analytics events
- Supabase → n8n: Trigger automations on new data
- n8n → Jobber: Create leads via Jobber API
- n8n → Email: Send notifications and customer emails

**Account:** GitHub account is totalguardllc@gmail.com

## Constraints

- **Platform**: Must work with existing Lovable.dev setup — cannot migrate to different hosting
- **Operations**: Jobber is the source of truth for jobs and customers — Supabase stores website data only
- **Access**: Single admin user (owner) — no multi-tenant requirements
- **Budget**: Using free tiers where possible (Supabase free tier, n8n self-hosted or cloud free tier)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Jobber for job management | Already selected by owner, handles scheduling/invoicing | — Pending |
| Supabase for website backend | Free tier sufficient, integrates well with Lovable | — Pending |
| n8n for automations | Flexible, can connect all services, visual workflow builder | — Pending |
| Single admin (no roles) | Only owner needs access, reduces complexity | — Pending |

---
*Last updated: 2026-02-02 after initialization*
