# Phase 18 Plan 01: GBP Post Generator + Publisher Summary

**One-liner:** AI-generated GBP posts 3x/week with Telegram approve/reject/edit flow and copy-paste manual posting until GBP API arrives

## Results

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | TG-145 GBP Post Generator | 6d02e7d | Deployed, active |
| 2 | TG-146 GBP Post Publisher | 372ada2 | Deployed, needs manual activation |
| 3 | Cleanup old TG-133/TG-134 GBP files | fc7a655 | Done |

## What Was Built

### TG-145 GBP Post Generator (n8n ID: X9byozM8gU9V2Zn8)
- **Schedule:** Mon/Wed/Fri 8 AM CT (cron: `0 13 * * 1,3,5`)
- **6 nodes:** Schedule Trigger -> Determine Season & Topic -> AI Generate Post -> Parse AI Response -> Store in Supabase -> Send Telegram Approval
- **AI:** Claude Haiku generates 150-300 char GBP posts with seasonal Madison WI lawn care topics
- **Topics:** 10 per season (40 total), rotated by day-of-year to avoid repeats
- **Storage:** Posts saved to `gbp_posts` table with `pending_approval` status
- **Approval:** Telegram message with approve/reject/edit commands + post ID
- **Status:** ACTIVE

### TG-146 GBP Post Publisher (n8n ID: hkMHYs7WMtvLzI5C)
- **Trigger:** Telegram Trigger (listens for all messages)
- **11 nodes:** Telegram Trigger -> Parse Command -> Route by Command -> 3 branches (approve/reject/edit + invalid)
- **Approve branch:** PATCH gbp_posts status -> Check GBP API (always false) -> Format Copy-Paste Ready -> Send Confirmation
- **Reject branch:** PATCH gbp_posts status -> Send Rejection Confirmation
- **Edit branch:** PATCH gbp_posts content + reset status -> Send Edit Confirmation
- **GBP API flag:** `gbpApiAvailable = false` in Check GBP API node -- flip to true when API arrives
- **Status:** INACTIVE (needs manual activation in n8n UI -- Telegram trigger limitation)

## Supabase Table: gbp_posts

Must be created manually in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS gbp_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_content text NOT NULL,
  image_prompt text,
  season text,
  topic text,
  topic_hash text,
  char_count integer,
  status text NOT NULL DEFAULT 'pending_approval',
  generated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  published_at timestamptz,
  published_via text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_gbp_posts_status ON gbp_posts(status);
CREATE INDEX idx_gbp_posts_topic ON gbp_posts(topic);
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed wrong phone number in AI prompt**
- **Found during:** Task 1 file review
- **Issue:** AI system prompt had (608) 995-3554 instead of correct NAP number (608) 535-6057
- **Fix:** Updated phone number in Claude system prompt
- **Files modified:** TG-145-gbp-post-generator.json
- **Commit:** 6d02e7d

**2. [Rule 3 - Blocking] Renamed TG-133/TG-134 to TG-145/TG-146 to avoid n8n ID collisions**
- **Found during:** Pre-execution analysis
- **Issue:** Phase 17 already deployed TG-133 (Weekly Content Batch) and TG-134 (Review-to-Social) to n8n. Using same TG numbers would cause confusion.
- **Fix:** Renamed workflow names and files to TG-145/TG-146 (next available after TG-144)
- **Files modified:** TG-145-gbp-post-generator.json, TG-146-gbp-post-publisher.json
- **Commit:** 6d02e7d, 372ada2

**3. [Rule 3 - Blocking] Stripped read-only fields for n8n API deployment**
- **Found during:** Deployment
- **Issue:** n8n API rejects `tags`, `active`, `versionId`, `meta` fields on POST
- **Fix:** Stripped before deployment (documented pattern from Phase 15/16)

## Pending Manual Steps

- Create `gbp_posts` table in Supabase SQL Editor (SQL above)
- Activate TG-146 in n8n UI (Telegram trigger can't be activated via API)
- Set `ANTHROPIC_API_KEY` in TG-145 AI Generate Post node (currently placeholder `ANTHROPIC_API_KEY`)
- Replace `OWNER_TELEGRAM_CHAT_ID` in TG-145 Send Telegram Approval node with Vance's actual Telegram chat ID
- GBP API: when verified, flip `gbpApiAvailable` to `true` in TG-146 Check GBP API node

## Key References

- **GBP API flag location:** TG-146 node "Check GBP API" (node-4b-check-gbp-api), line `const gbpApiAvailable = false;`
- **Phone number:** (608) 535-6057 (corrected from 995-3554)
- **Telegram credential:** V404qLIDXjmyzNeS
- **Supabase endpoint:** https://lwtmvzhwekgdxkaisfra.supabase.co
- **Anon key:** sb_publishable_DeX21ldoDKl3NyJeFZzR1w_eWBUkx-v

## Metrics

- **Duration:** ~4 minutes
- **Completed:** 2026-03-19
- **Workflows deployed:** 2
- **Total n8n active workflows:** 37 (36 prior + TG-145; TG-146 pending manual activation)
