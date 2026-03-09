# TotalGuard Marketing Automation System

This directory contains the full marketing automation stack for TotalGuard Yard Care.

## Structure
```
automation/
├── migrations/        ← 70+ Supabase SQL migrations (apply via Supabase MCP)
├── n8n-workflows/     ← 88 n8n workflow JSONs (import via scripts/import-tg-workflows.py)
├── scripts/           ← Import scripts, route table, utilities
├── email-templates/   ← Brevo HTML email templates
└── docs/              ← Setup guides (Brevo, Twilio, n8n variables)
```

## n8n Setup
- Instance: workelyai.app.n8n.cloud
- Tag: TotalGuard Yard Care (ID: fPXl9eiMhJc3ISQQ)
- All workflows prefixed: TG-
- Variables prefix: TG_ (set in n8n Settings → Variables)

## Supabase
- Project: lwtmvzhwekgdxkaisfra
- Migrations apply on top of existing tables

## Execution Order
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10

