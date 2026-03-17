# Telegram Agentic Bot — Design Document

**Date**: 2026-03-08
**Status**: Approved

## Problem

The current Telegram bot (`claude-telegram/agent.js`) is a basic Claude API chatbot — it can only send/receive text. It cannot read files, run commands, create PRs, query databases, generate images, or do anything that Claude Code can do. The user wants full agentic capabilities from his phone.

## Solution: Anthropic Tool Use Agentic Loop

Transform the bot from a simple chat relay into a full agentic system using Anthropic Messages API `tool_use`. Claude sees all available tools, decides when to call them, the bot executes locally, and feeds results back in a loop.

### Architecture

```
Telegram Message
  → Anthropic Messages API (with tools[] array)
    → Claude returns tool_use block
      → Bot executes tool locally
      → Feeds tool_result back to API
      → Loop until Claude returns text
    → Claude returns text block
  → Send text to Telegram
  → Send any photos to Telegram
```

### Why Not claude -p

Per lessons learned (2026-03-07): `claude -p` cannot be spawned inside a Claude Code session due to env var contamination. Even from `start.bat`, it's unreliable. The Anthropic API with tool definitions gives us the same capabilities without the nesting issue.

## Tool Definitions

### Category 1: File System

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `read_file` | `path` | Read file contents, return text |
| `write_file` | `path`, `content` | Create or overwrite a file |
| `edit_file` | `path`, `old_string`, `new_string` | Find-and-replace in a file |
| `list_directory` | `path`, `pattern` (optional glob) | List files, supports glob |
| `search_files` | `path`, `pattern` (regex), `glob` (optional) | Grep/ripgrep search |

### Category 2: Shell

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `run_command` | `command`, `cwd` (optional), `timeout` (optional, default 30s) | Execute any shell command |

### Category 3: Git

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `git_status` | `cwd` | git status output |
| `git_diff` | `cwd`, `args` (optional) | git diff output |
| `git_log` | `cwd`, `count` (default 10) | Recent commits |
| `git_commit` | `cwd`, `message`, `files` (array) | Stage files + commit |
| `git_push` | `cwd`, `branch` (optional) | Push to remote (requires confirmation) |

### Category 4: GitHub (via gh CLI)

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `github_create_pr` | `cwd`, `title`, `body`, `base` | Create a pull request |
| `github_list_prs` | `repo` | List open PRs |
| `github_create_issue` | `repo`, `title`, `body` | Create an issue |

### Category 5: Supabase (via CLI or direct API)

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `supabase_query` | `project_ref`, `sql` | Execute SQL query |
| `supabase_list_tables` | `project_ref` | List all tables |

### Category 6: Web

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `web_search` | `query` | Search the web, return results |
| `web_fetch` | `url` | Fetch URL content |

### Category 7: Image Generation

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `generate_image` | `prompt`, `filename` (optional) | Generate image via Gemini CLI (nano-banana), return file path |

### Category 8: Screenshot

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `take_screenshot` | `url`, `viewport` (width x height) | Screenshot a URL using Playwright CLI |

### Category 9: Vercel

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `vercel_deployments` | `project` | List recent deployments |
| `vercel_logs` | `deployment_url` | Get deployment/runtime logs |

### Category 10: Slack

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `slack_post` | `channel`, `message` | Post a message to Slack |
| `slack_read` | `channel`, `count` | Read recent messages |

### Category 11: Telegram Media

| Tool | Parameters | What It Does |
|------|-----------|-------------|
| `send_photo` | `file_path`, `caption` (optional) | Send an image to the Telegram chat |
| `send_document` | `file_path`, `caption` (optional) | Send a file to the Telegram chat |

## Agentic Loop

```javascript
async function agenticLoop(chatId, userMessage) {
  // Build messages with history
  let messages = [...history, { role: "user", content: userMessage }];

  for (let i = 0; i < MAX_TOOL_CALLS; i++) {
    const response = await callAnthropic(messages);

    // Collect all content blocks
    const textBlocks = [];
    const toolBlocks = [];

    for (const block of response.content) {
      if (block.type === "text") textBlocks.push(block);
      if (block.type === "tool_use") toolBlocks.push(block);
    }

    // If no tool calls, we're done
    if (toolBlocks.length === 0) {
      return textBlocks.map(b => b.text).join("\n");
    }

    // Execute all tool calls
    const toolResults = [];
    for (const tool of toolBlocks) {
      const result = await executeTool(tool.name, tool.input, chatId);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tool.id,
        content: result,
      });
    }

    // Add assistant response + tool results to messages
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  return "Reached max tool calls (15). Stopping.";
}
```

## Safety

1. **User lock**: Only responds to Telegram user ID `6963156782`
2. **Destructive command confirmation**: Commands matching `rm -rf`, `git push --force`, `drop table`, `truncate`, `delete from` require the user to reply "yes" before execution
3. **Max tool calls**: 15 per message to prevent runaway loops
4. **Timeout**: Shell commands timeout after 30s by default
5. **Logging**: Every tool call logged to `claude-telegram/agent.log` with timestamp

## Project Context

The `/switch` command sets the working directory for all tools:
- `/switch workely` → `C:\Users\vance\OneDrive\Desktop\claude-workspace\workely.ai`
- `/switch totalguard` → `C:\Users\vance\OneDrive\Desktop\claude-workspace\tgyardcare`
- `/switch workspace` → `C:\Users\vance\OneDrive\Desktop\claude-workspace`

All file paths and shell commands use the current project's directory as `cwd`.

## Vision Support

When the user sends a photo to the Telegram bot:
1. Download the photo via Telegram API (`getFile` + file URL)
2. Convert to base64
3. Send to Anthropic API as an `image` content block
4. Claude analyzes the image and responds

## System Prompt

Updated to include tool awareness:
- Lists all available tools with brief descriptions
- Instructs Claude to use tools proactively (not just describe what it would do)
- Includes current project context and path
- Includes the THINK > PLAN > BUILD > VERIFY workflow

## File Structure

```
claude-telegram/
  agent.js          → Main bot (rewritten with agentic loop)
  tools.js          → Tool definitions + executors (all categories)
  config.js         → Tokens, project paths, safety rules
  start.bat         → Windows launcher (clears CLAUDE env vars)
  agent.log         → Tool call log
  package.json      → Dependencies (none — pure Node.js fetch)
```

## Dependencies

None. Pure Node.js with built-in `fetch`, `fs`, `child_process`. No npm packages needed.

## What This Enables

From Telegram on your phone, you can:
- "Read the pricing page component" → reads the file, shows code
- "Fix the typo on line 42 of page.tsx" → edits the file
- "Generate an image of a futuristic dashboard" → creates image, sends photo
- "What's the git status of totalguard?" → runs git status
- "Create a PR for the latest changes" → creates GitHub PR
- "Run the tests" → executes test suite
- "Screenshot tgyardcare.com at 375px" → takes screenshot, sends photo
- "Query how many users signed up this week" → runs Supabase SQL
- "Post in #general that the deploy is done" → sends Slack message
- "Check the latest Vercel deployment logs" → fetches logs
- "Search the codebase for handleSubmit" → greps across files
