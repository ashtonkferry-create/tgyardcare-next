---
status: resolved
trigger: "TG-91 and TG-87 n8n workflows fail on 2nd node (Supabase fetch) with JWT auth error"
created: 2026-03-15T00:00:00Z
updated: 2026-03-15T20:30:00Z
---

## Current Focus

hypothesis: RESOLVED
test: n/a
expecting: n/a
next_action: Archive session

## Symptoms

expected: TG-91 executes fully (fetches estimates from Supabase, sends abandoned quote SMS). TG-87 executes fully (fetches subscriptions, sends renewal reminder email).
actual: Both fail on 2nd node with "Authorization failed - please check your credentials" / "Expected 3 parts in JWT; got 1"
errors: |
  n8n execution error: "Authorization failed - please check your credentials"
  Internal: "Expected 3 parts in JWT; got 1"
reproduction: Execute TG-91 or TG-87 in n8n UI
started: Never worked - workflows newly created with wrong key

## Eliminated

- hypothesis: "The apikey header has the wrong key (sb_publishable instead of JWT)"
  evidence: Previous fix already corrected apikey to JWT, but that JWT was also invalid for this project (new sb_ key format)
  timestamp: 2026-03-15T20:05:00Z

- hypothesis: "Replace keys with legacy JWT service_role key (eyJhbGci...)"
  evidence: The legacy JWT is not registered with this Supabase project. Returns "Invalid API key" / "No suitable key or wrong key type". Project uses new sb_ format keys.
  timestamp: 2026-03-15T20:15:00Z

- hypothesis: "Use sb_secret service_role key as apikey header"
  evidence: sb_secret_QlNjUO key returns "Unregistered API key" when used as apikey header. Only sb_publishable is registered as an API key in the gateway.
  timestamp: 2026-03-15T20:18:00Z

## Evidence

- timestamp: 2026-03-15T20:01:00Z
  checked: All 6 live workflows via n8n API GET
  found: |
    - apikey header: had wrong JWT (legacy format, not registered with project)
    - Authorization header: had Bearer sb_secret_mWHIW (wrong key, not even a JWT)
    - PLACEHOLDER_TWILIO_ID: present in TG-91 and TG-84
  implication: Both headers were wrong. Previous fix was partial and used wrong key format.

- timestamp: 2026-03-15T20:10:00Z
  checked: .env.local and .env.prod-check for actual Supabase keys
  found: |
    - NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DeX21ldoDKl3NyJeFZzR1w_eWBUkx-v
    - SUPABASE_SERVICE_ROLE_KEY=sb_secret_QlNjUO_5qHPcZRbdoCqZ3w_w72F3OQ3
    - Project uses new Supabase sb_ key format, NOT legacy JWTs
  implication: The JWT provided in known_facts is not valid for this project.

- timestamp: 2026-03-15T20:15:00Z
  checked: Supabase REST API with various key combinations
  found: |
    - sb_publishable as apikey alone: HTTP 200 (works)
    - sb_publishable apikey + Authorization header with any non-JWT: HTTP 401 "Expected 3 parts in JWT"
    - sb_secret as apikey: HTTP 401 "Unregistered API key"
    - No Authorization header needed: Supabase gateway auto-translates sb_ keys to JWTs
  implication: The Authorization header must be REMOVED entirely. Supabase gateway handles JWT translation from sb_ keys automatically.

- timestamp: 2026-03-15T20:20:00Z
  checked: Supabase docs and GitHub discussions on new key format
  found: "It is no longer possible to use a publishable or secret key inside the Authorization header because they are not a JWT. Instead, you should pass in the user's JWT, or leave the header empty."
  implication: Confirmed - Authorization header must be removed for sb_ key projects.

- timestamp: 2026-03-15T20:22:00Z
  checked: RLS access with anon key only
  found: |
    - estimates: read/write works with anon key (HTTP 200/204)
    - customer_subscriptions: read works (HTTP 200)
    - sms_sends: accessible (HTTP 200)
    - RPC can_send_sms: works (returns false, HTTP 200)
  implication: No RLS restrictions block anon access. service_role not needed for these workflows.

- timestamp: 2026-03-15T20:25:00Z
  checked: TG-91 query column references
  found: Query selects "service,amount" but estimates table has no "service" or "amount" columns. Has "total" instead.
  implication: Secondary bug - fixed by replacing "service,amount" with "total" in select.

## Resolution

root_cause: |
  Two issues caused the auth failure:
  1. PRIMARY: The Authorization header contained non-JWT values (sb_secret_ format or wrong keys). Supabase's PostgREST layer requires JWTs in the Authorization header, but this project uses new sb_ format keys where the API gateway handles JWT translation automatically. Sending ANY Authorization header bypasses the gateway's auto-translation and fails.
  2. SECONDARY: The apikey header was also wrong (had legacy JWT not registered with this project). Needed the sb_publishable_ key.

  Fix: Set apikey to sb_publishable key, REMOVE Authorization header entirely.

  Additional: TG-91 had wrong column references (service,amount -> total) and PLACEHOLDER_TWILIO_ID in TG-91/TG-84.

fix: |
  1. Set apikey header to sb_publishable_DeX21ldoDKl3NyJeFZzR1w_eWBUkx-v in all Supabase HTTP nodes
  2. Removed Authorization header entirely from all Supabase HTTP nodes (Supabase gateway handles auth)
  3. Fixed PLACEHOLDER_TWILIO_ID -> Qd6M2hA9hDWRKGPR in TG-91 and TG-84
  4. Fixed TG-91 query columns: service,amount -> total
  5. Updated local JSON files to match

verification: |
  - All 6 live workflows verified via n8n API GET: no Authorization headers, apikey = sb_publishable
  - Supabase queries return HTTP 200 for estimates, customer_subscriptions, and RPC functions
  - Local JSON files updated to match live workflows

files_changed:
  - tgyardcare/automation/n8n-workflows/TG-84-invoice-collections-sequence.json
  - tgyardcare/automation/n8n-workflows/TG-86-plan-enrollment.json
  - tgyardcare/automation/n8n-workflows/TG-87-plan-renewal-reminder.json
  - tgyardcare/automation/n8n-workflows/TG-89-invoice-delivery.json
  - tgyardcare/automation/n8n-workflows/TG-90-fertilizer-schedule-engine.json
  - tgyardcare/automation/n8n-workflows/TG-91-abandoned-quote-sms.json
  - (plus 6 live n8n workflows updated via API)
