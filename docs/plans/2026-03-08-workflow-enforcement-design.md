# Workflow Enforcement System — Design Document

**Date**: 2026-03-08
**Status**: Implemented

## Problem

Claude skips the THINK > PLAN > BUILD > VERIFY workflow. This wastes credits, time, and produces hacky solutions. The user should NEVER have to remind Claude.

## Solution: 2-Layer Mechanical Enforcement

### Layer 1: PreToolUse Gate (enforce-workflow.js)

**Location**: `C:\Users\vance\.claude\hooks\enforce-workflow.js`
**Registered in**: `.claude/settings.json` (project-level) — PreToolUse on Write + Edit

**What it does**:
- Extracts a topic keyword from the file path being written
  - `claude-telegram/agent.js` → `telegram`
  - `tgyardcare/src/app/page.tsx` → `tgyardcare`
  - `workely.ai/apps/web/src/lib/copilot.ts` → `workely`
- Searches `docs/plans/` for files from the last 7 days containing that topic
- Requires BOTH a `-design.md` AND a `-plan.md` (or `-implementation.md`)
- If either missing → **BLOCKS the write** with exact instructions

**Exempt paths** (always allowed without design doc):
- `docs/plans/`, `tasks/`, `memory/`, `.claude/`, `node_modules/`, `.git/`, `.vercel/`, `.next/`
- All `.md`, `.json`, `.log`, `.bat`, `.sh`, `.env` files
- Config files: `package.json`, `tsconfig.json`, `vercel.json`, `next.config.*`, `tailwind.config.*`, etc.

**Edge cases**:
- Topic too short (<3 chars) → falls back to "any doc for today"
- Multi-day tasks → 7-day lookback window
- Multiple tasks/day → each needs its own topic slug in the filename

### Layer 2: SessionStart Loader (session-init.js)

**Location**: `C:\Users\vance\.claude\hooks\session-init.js`
**Registered in**: `~/.claude/settings.json` (user-level) — SessionStart

**What it does**:
- Reads `tasks/lessons.md` and prints it — past mistakes Claude must not repeat
- Reads `tasks/todo.md` if it exists — resume in-progress work
- Prints the 8-rule Working Philosophy reminder
- Runs every session, no exceptions

## File Map

```
~/.claude/hooks/
  enforce-workflow.js  ← PreToolUse gate (blocks code without design+plan)
  session-init.js      ← SessionStart context loader (lessons + todos + rules)
  cleanup-md.js        ← (existing) memory file cleanup
  gsd-check-update.js  ← (existing) GSD update check
  gsd-statusline.js    ← (existing) status line

workspace/.claude/settings.json  ← Project hooks (PreToolUse, PostToolUse)
~/.claude/settings.json          ← User hooks (SessionStart)

workspace/tasks/
  lessons.md           ← Persistent lessons (read every session)
  todo.md              ← Task tracking (read every session)

workspace/docs/plans/
  YYYY-MM-DD-<topic>-design.md   ← Required before coding
  YYYY-MM-DD-<topic>-plan.md     ← Required before coding
```

## What This Enforces Mechanically

| Rule | Enforcement |
|------|-------------|
| Plan before code | Hook blocks Write/Edit without design+plan docs |
| Learn from mistakes | session-init.js loads lessons.md every session |
| Resume work | session-init.js loads todo.md every session |
| Workflow reminder | session-init.js prints the 8 rules every session |

## What Stays as CLAUDE.md Instructions

| Rule | Why not mechanical |
|------|-------------------|
| Use subagents | Judgment call — depends on task complexity |
| Demand elegance | Judgment call — can't quantify |
| Verification (screenshots) | Could add PostToolUse check, but too many false positives |
| Update lessons after corrections | Would need to detect "user correction" — unreliable |
