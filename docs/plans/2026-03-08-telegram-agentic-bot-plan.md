# Telegram Agentic Bot — Implementation Plan

**Date**: 2026-03-08
**Design Doc**: `2026-03-08-telegram-agentic-bot-design.md`

## Implementation Order

### Phase 1: Config + Tool Definitions (config.js + tools.js)

**Task 1.1**: Create `config.js`
- Extract tokens (BOT_TOKEN, API_KEY, ALLOWED_USER_ID) from agent.js
- Project paths map
- Safety patterns (destructive command regex)
- Max tool calls constant (15)
- Default timeout (30s)

**Task 1.2**: Create `tools.js` — Tool schema definitions
- Define all tools as Anthropic tool_use schema objects
- Each tool: `name`, `description`, `input_schema` (JSON Schema)
- Group by category but export as flat array

**Task 1.3**: Create `tools.js` — Tool executors
- `executeTool(name, input, context)` dispatcher
- File system tools: `read_file`, `write_file`, `edit_file`, `list_directory`, `search_files`
  - Use Node.js `fs` for file ops
  - Use `child_process.execSync` for grep/ripgrep
- Shell tool: `run_command`
  - `child_process.exec` with timeout
  - Capture stdout + stderr
  - Destructive command detection → return "CONFIRMATION_REQUIRED" flag
- Git tools: thin wrappers around `git` CLI via `run_command`
- GitHub tools: thin wrappers around `gh` CLI
- Supabase tool: `npx supabase` CLI or direct REST API to Supabase
- Web tools: `fetch` for web_fetch, shell out for web search
- Image generation: shell out to Gemini CLI (`gemini` command)
- Screenshot: shell out to Playwright CLI or `npx playwright screenshot`
- Vercel tools: `vercel` CLI wrappers
- Slack tools: Slack webhook or API with existing token
- Telegram media: `send_photo`, `send_document` via Telegram Bot API

**Verify**: Run `node -e "require('./tools.js')"` — no crashes, tools array has 25+ entries.

### Phase 2: Agentic Loop (agent.js rewrite)

**Task 2.1**: Rewrite `askClaude` → `agenticLoop`
- Accept messages array + tool definitions
- Loop: call Anthropic API → check for tool_use → execute → feed back
- Handle mixed content blocks (text + tool_use in same response)
- Max iterations: 15
- Send typing indicator during tool execution

**Task 2.2**: Update system prompt
- Add tool awareness section
- Include current project path
- Include workflow reminder
- Instruct Claude to USE tools, not describe what it would do

**Task 2.3**: Handle tool results
- Text results: truncate to 10,000 chars (Anthropic limit considerations)
- Image results: store path, send as Telegram photo after loop completes
- Error results: return error message as tool_result, let Claude retry or explain

**Task 2.4**: Confirmation flow for destructive commands
- When a tool returns `CONFIRMATION_REQUIRED`, send confirmation prompt to user
- Store pending action in memory
- On next message, if "yes"/"y" → execute, otherwise cancel

**Verify**: Send "read the file claude-telegram/config.js" → bot reads and returns content.

### Phase 3: Vision Support

**Task 3.1**: Handle photo messages from Telegram
- Detect `message.photo` in update
- Download highest-res photo via `getFile` API
- Convert to base64
- Send to Anthropic as `image` content block alongside any caption text

**Verify**: Send a screenshot to the bot → Claude describes what it sees.

### Phase 4: Telegram Media Sending

**Task 4.1**: Implement `sendPhoto` helper
- Use Telegram `sendPhoto` API with `multipart/form-data`
- Accept local file path, read as buffer, upload

**Task 4.2**: Wire image generation + screenshot tools
- After `generate_image` tool completes → auto-send photo to chat
- After `take_screenshot` tool completes → auto-send photo to chat

**Verify**: "Generate an image of a sunset" → bot creates image and sends it as a Telegram photo.

### Phase 5: Polish + Testing

**Task 5.1**: Logging
- Log every tool call to `agent.log` with timestamp, tool name, truncated input
- Log errors with full stack traces

**Task 5.2**: Update `/status` command
- Show: current project, git branch, tool call count this session, uptime

**Task 5.3**: Add `/tools` command
- List all available tools with one-line descriptions

**Task 5.4**: End-to-end testing
- Test each tool category with a real message
- Test multi-tool sequences (e.g., "read this file and fix the typo")
- Test vision (send a photo)
- Test image generation
- Test destructive command confirmation
- Test project switching + tool context

**Task 5.5**: Update `start.bat`
- Ensure CLAUDE env vars still cleared
- Add restart logic (auto-restart on crash)

**Verify**: All tool categories work from Telegram. Bot recovers from errors gracefully.

## Success Criteria

1. All 25+ tools execute correctly from Telegram
2. Agentic loop handles multi-step tasks (read file → edit → commit)
3. Vision works (send photo → Claude analyzes)
4. Image gen works (prompt → photo sent back)
5. Destructive commands blocked without confirmation
6. Bot stays running reliably via start.bat
7. Zero npm dependencies — pure Node.js
