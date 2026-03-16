# Chatbot Funneling & Formatting Overhaul

**Date**: 2026-03-16
**Status**: Approved
**Scope**: 2 files — `ChatBot.tsx` + `chat` edge function

## Problem

The TotalGuard chatbot has critical funneling failures:

1. **Raw `**` showing** — `renderMessageWithLinks()` only parses `[text](url)`. Bold, bullets, and other markdown render as raw text, making the bot look broken.
2. **No in-chat quoting awareness** — The system prompt never tells the AI about the built-in quote flow. Every response dead-ends at "call us / email us."
3. **No service-specific links** — The prompt only lists generic pages. When someone says "mowing", the AI can't link to `/services/lawn-care`.
4. **Dead-end funneling** — Even explicit quote requests get the same contact-info dump. Zero conversion path inside the chat.

## Solution

### 1. Edge Function — System Prompt Rewrite

- Declare the in-chat quote capability — AI tells users to type "get a quote" or click the button
- Map services to specific pages: `/services/lawn-care`, `/services/hardscaping`, `/services/gutter-services`, `/services/seasonal-cleanup`
- Enforce dual-path response pattern: brief value prop + service page link + offer in-chat quote
- Ban `**` markdown — tell AI to never use asterisks for emphasis
- Billionaire-brand tone: confident, concise, zero desperation, max 1 emoji per message

### 2. Frontend — Message Renderer Upgrade

Replace current link-only parser with a multi-pass renderer:

- `**text**` → `<strong>` styled with slight emerald tint
- `- item` or `• item` → styled bullet list with emerald dot markers
- `\n\n` → paragraph breaks with proper spacing
- `[text](url)` → clickable links (existing, preserved)
- Strip any remaining raw markdown artifacts

### 3. Frontend — Smart Quick Reply Injection

After any AI response that's outside the quote flow (idle state), auto-show a "Get a Free Quote" quick reply button. This ensures there's always a one-tap conversion path visible regardless of what the AI says.

### 4. Out of Scope

- Quote flow steps (working correctly)
- Chat UI layout/styling (already premium)
- Feedback system (working correctly)
- Database schema changes (none needed)
