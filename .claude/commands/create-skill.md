---
description: Manually create a new skill using the Auto Skill Factory pipeline
argument-hint: --name "skill-name" --from "what this skill does"
---

Parse arguments from `$ARGUMENTS`:
- `--name <name>`: skill name (kebab-case, required)
- `--from <description>`: what the skill does (required)
- `--force-new`: bypass dedup check (optional, still runs risk classification)
- `--portable`: generate project-agnostic skill (optional)

If `--name` or `--from` is missing, ask the user for the missing values.

## Process

1. **Read policy**: Read `.claude/skill-policy.md` for current thresholds and rules.

2. **Dedup check** (unless `--force-new`):
   - Use Glob to find all `.claude/skills/*/SKILL.md`
   - Read each skill's frontmatter (name + description)
   - Score each against the `--from` description (0.0–1.0)
   - If match >= 0.70: report `USE existing skill '<name>'` and stop
   - If match 0.45–0.69: report `EXTEND skill '<name>'` — offer to add capability to that skill. Stop unless user insists.
   - If match < 0.45 or `--force-new`: continue

3. **Activate auto-skill-factory skill**: Invoke the Skill tool with `skill: "auto-skill-factory"`. The factory skill handles Steps 2-6 of the pipeline:
   - Risk classification
   - Spec generation (with MVP scope + non-goals)
   - File scaffolding to `.claude/skills/generated/<name>/`
   - Validation via `node .claude/scripts/validate-skills.js --skill <name>`
   - Registration report

4. **If high-risk**: The factory will present the spec and ask for approval before scaffolding.

5. **If validation fails**: The factory will quarantine the skill to `_failed/` and report errors.

6. **On success**: Report the skill ID, how to trigger it, and any limitations.

## Examples

```
/create-skill --name "seo-meta-generator" --from "Generate SEO meta tags, Open Graph data, and structured data for Next.js pages"
```

```
/create-skill --name "api-error-handler" --from "Standardized error handling for API routes with logging and user-friendly messages" --portable
```

```
/create-skill --name "stripe-webhook-handler" --from "Process Stripe webhook events for subscription lifecycle" --force-new
```
