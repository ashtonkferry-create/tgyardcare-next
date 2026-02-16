# Skill-First Policy v1.0

## Decision Flow

Before implementing any repeatable task, check for existing skills:

1. Search `.claude/skills/` by keyword + description match
2. **Match >= 0.70** → USE existing skill (stop)
3. **Match 0.45–0.69** → EXTEND existing skill — add capability to its SKILL.md (stop)
4. **Match < 0.45** → Evaluate 2-of-5 criteria for new skill creation

## 2-of-5 Criteria (need >= 2 to create a new skill)

1. Task will be reused 3+ times
2. Task touches multiple files/systems (auth, billing, email, analytics, CRM, etc.)
3. Task has non-trivial edge cases or failure modes
4. Task benefits from test coverage to prevent regressions
5. Task is a standard capability useful across future projects

If fewer than 2 criteria match, implement normally without a skill.

## Dedup Thresholds

| Match Score | Action |
|-------------|--------|
| >= 0.70 | USE existing skill as-is |
| 0.45–0.69 | EXTEND existing skill (modify its SKILL.md) |
| < 0.45 | CREATE new skill (if 2-of-5 met) |

## Risk Classification

Three levels. `requiresApproval` only escalates — never downgrades.

| Level | Approval | Categories |
|-------|----------|------------|
| **high** | Required | payments, billing, subscriptions, database-mutation, data-deletion, authentication, authorization, security, deployment, infrastructure, secrets, credentials, tokens, external-api-write, email-sending, webhook-handlers, notifications |
| **medium** | Recommended | file-system-write, config-modification, external-api-read, data-transformation |
| **low** | Auto-create + notify | documentation, formatting, conventions, templates, code-generation, testing-utilities |

## Session Caps

- Max **2** auto-created skills per session
- Max **1** pending high-risk proposal at a time
- These caps reset each new conversation

## Composition Rule

Only create a "composer" skill if the composition itself meets 2-of-5 criteria. Otherwise compose existing skills ad-hoc without creating a new skill.

## Validation Failure Handling

- If `validate-skills.js` fails on a generated skill → move the skill folder to `.claude/skills/generated/_failed/`
- Report all validation errors to the user
- Never leave an invalid skill in the discoverable path

## Generated Skill Lifecycle

| Status | Meaning |
|--------|---------|
| `active` | Live and discoverable |
| `deprecated` | Still works but superseded — set `deprecatedAt` |
| `superseded` | Replaced by another skill — set `supersededBy` |

## File Convention

Generated skills live in `.claude/skills/generated/<name>/` with:
- `SKILL.md` — required, < 500 lines
- `skill.meta.json` — required, structured metadata
- `tests/golden.md` — required, 2+ test examples
- `versions/` — optional, version history
