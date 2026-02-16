#!/usr/bin/env node

/**
 * validate-skills.js
 *
 * Validates Claude Code skills for schema compliance, safety, and policy adherence.
 * Standalone Node script — no external dependencies.
 *
 * Usage:
 *   node .claude/scripts/validate-skills.js              # validate all skills
 *   node .claude/scripts/validate-skills.js --skill foo   # validate one skill
 *   node .claude/scripts/validate-skills.js --generated   # validate only generated skills
 *
 * Exit codes: 0 = all pass, 1 = failures found
 */

const fs = require('fs');
const path = require('path');

// ── Constants ──────────────────────────────────────────────────────────────────

const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');
const GENERATED_DIR = path.join(SKILLS_DIR, 'generated');
const FAILED_DIR = path.join(GENERATED_DIR, '_failed');
const POLICY_PATH = path.resolve(__dirname, '..', 'skill-policy.md');

const POLICY_VERSION = '1.0';
const MAX_SKILL_LINES = 500;

const HIGH_RISK_CATEGORIES = [
  'payments', 'billing', 'subscriptions',
  'database-mutation', 'data-deletion',
  'authentication', 'authorization', 'security',
  'deployment', 'infrastructure',
  'secrets', 'credentials', 'tokens',
  'external-api-write', 'email-sending',
  'webhook-handlers', 'notifications',
];

const MEDIUM_RISK_CATEGORIES = [
  'file-system-write', 'config-modification',
  'external-api-read', 'data-transformation',
];

const SECRET_PATTERNS = [
  /sk[-_][a-zA-Z0-9]{20,}/,           // Stripe/OpenAI keys
  /Bearer\s+[a-zA-Z0-9._\-]{20,}/,    // Bearer tokens
  /ghp_[a-zA-Z0-9]{36}/,              // GitHub personal tokens
  /ghs_[a-zA-Z0-9]{36}/,              // GitHub server tokens
  /xoxb-[a-zA-Z0-9\-]{24,}/,          // Slack bot tokens
  /xoxp-[a-zA-Z0-9\-]{24,}/,          // Slack user tokens
  /AKIA[A-Z0-9]{16}/,                 // AWS access keys
  /-----BEGIN (RSA |EC )?PRIVATE KEY/, // Private keys
  /sbp_[a-zA-Z0-9]{40}/,              // Supabase tokens
  /vcp_[a-zA-Z0-9]{40,}/,             // Vercel tokens
];

const HIGH_RISK_KEYWORDS = [
  'deleteDatabase', 'dropTable', 'DROP TABLE', 'DELETE FROM',
  'rmSync', 'rm -rf', 'unlink',
  'sendEmail', 'smtp', 'nodemailer',
  'stripe.charges', 'stripe.subscriptions', 'stripe.paymentIntents',
  'supabase.auth.admin', 'service_role',
  'exec(', 'execSync(', 'child_process',
  'webhook', 'POST.*external',
  'resetPasswordForEmail', 'updateUser.*password',
  'force-push', 'push --force', 'git push -f',
];

const VALID_RISK_LEVELS = ['low', 'medium', 'high'];
const VALID_STATUSES = ['active', 'deprecated', 'superseded'];

const META_REQUIRED_FIELDS = [
  'id', 'version', 'name', 'riskLevel', 'status', 'createdAt', 'createdBy',
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const result = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function getSkillDirs(onlyGenerated) {
  const dirs = [];

  if (onlyGenerated) {
    if (!fs.existsSync(GENERATED_DIR)) return dirs;
    const entries = fs.readdirSync(GENERATED_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '_failed') {
        dirs.push(path.join(GENERATED_DIR, entry.name));
      }
    }
  } else {
    if (!fs.existsSync(SKILLS_DIR)) return dirs;
    const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'generated') {
        // Add generated sub-skills
        if (fs.existsSync(GENERATED_DIR)) {
          const genEntries = fs.readdirSync(GENERATED_DIR, { withFileTypes: true });
          for (const genEntry of genEntries) {
            if (genEntry.isDirectory() && genEntry.name !== '_failed') {
              dirs.push(path.join(GENERATED_DIR, genEntry.name));
            }
          }
        }
      } else {
        dirs.push(path.join(SKILLS_DIR, entry.name));
      }
    }
  }

  return dirs;
}

// ── Validators ─────────────────────────────────────────────────────────────────

function validateSkill(skillDir) {
  const skillName = path.basename(skillDir);
  const isGenerated = skillDir.startsWith(GENERATED_DIR);
  const errors = [];
  const warnings = [];

  // 1. Check SKILL.md exists
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    errors.push('Missing SKILL.md');
    return { skillName, isGenerated, errors, warnings };
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');
  const lines = content.split('\n');

  // 2. Frontmatter check
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) {
    errors.push('Missing or malformed YAML frontmatter (must start with --- and end with ---)');
  } else {
    if (!frontmatter.name) errors.push('Frontmatter missing required field: name');
    if (!frontmatter.description) errors.push('Frontmatter missing required field: description');
  }

  // 3. Body size check
  if (lines.length > MAX_SKILL_LINES) {
    warnings.push(`SKILL.md is ${lines.length} lines (recommended max: ${MAX_SKILL_LINES})`);
  }

  // 4. Secret scan
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(lines[i])) {
        errors.push(`Potential secret detected on line ${i + 1}: matches pattern ${pattern.source.slice(0, 30)}...`);
      }
    }
  }

  // 5. High-risk content scan (for generated skills with low risk label)
  if (isGenerated) {
    const metaPath = path.join(skillDir, 'skill.meta.json');

    // Check required generated-skill files
    if (!fs.existsSync(metaPath)) {
      errors.push('Generated skill missing skill.meta.json');
    } else {
      let meta;
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {
        errors.push(`skill.meta.json is not valid JSON: ${e.message}`);
        meta = null;
      }

      if (meta) {
        // Meta schema validation
        for (const field of META_REQUIRED_FIELDS) {
          if (meta[field] === undefined || meta[field] === null) {
            errors.push(`skill.meta.json missing required field: ${field}`);
          }
        }

        // Risk level enum check
        if (meta.riskLevel && !VALID_RISK_LEVELS.includes(meta.riskLevel)) {
          errors.push(`Invalid riskLevel: "${meta.riskLevel}" (must be: ${VALID_RISK_LEVELS.join(', ')})`);
        }

        // Status enum check
        if (meta.status && !VALID_STATUSES.includes(meta.status)) {
          errors.push(`Invalid status: "${meta.status}" (must be: ${VALID_STATUSES.join(', ')})`);
        }

        // Version type check
        if (meta.version !== undefined && typeof meta.version !== 'number') {
          errors.push(`version must be a number, got: ${typeof meta.version}`);
        }

        // High-risk content vs low label check
        if (meta.riskLevel === 'low') {
          const bodyLower = content.toLowerCase();
          const matchedKeywords = [];
          for (const keyword of HIGH_RISK_KEYWORDS) {
            if (bodyLower.includes(keyword.toLowerCase())) {
              matchedKeywords.push(keyword);
            }
          }
          if (matchedKeywords.length > 0) {
            errors.push(
              `Risk mismatch: skill labeled "low" but SKILL.md contains high-risk keywords: ${matchedKeywords.join(', ')}. ` +
              'Either change riskLevel to "medium" or "high", or remove these actions.'
            );
          }
        }

        // Category denylist check
        if (meta.category && HIGH_RISK_CATEGORIES.includes(meta.category)) {
          if (!meta.safety || !meta.safety.requiresApproval) {
            errors.push(
              `Category "${meta.category}" is high-risk but safety.requiresApproval is not true`
            );
          }
        }

        // Policy version reference
        if (meta.validation && meta.validation.policyVersion !== POLICY_VERSION) {
          warnings.push(
            `skill.meta.json references policyVersion "${meta.validation?.policyVersion}" ` +
            `but current policy is "${POLICY_VERSION}"`
          );
        }

        // Approval escalation check (never downgrade)
        if (meta.riskLevel === 'high' && meta.safety && meta.safety.requiresApproval === false) {
          errors.push('High-risk skill must have safety.requiresApproval = true');
        }
      }
    }

    // Check golden tests exist
    const goldenPath = path.join(skillDir, 'tests', 'golden.md');
    if (!fs.existsSync(goldenPath)) {
      errors.push('Generated skill missing tests/golden.md');
    } else {
      const goldenContent = fs.readFileSync(goldenPath, 'utf-8');
      const testCount = (goldenContent.match(/^## Test \d+/gm) || []).length;
      if (testCount < 2) {
        errors.push(`tests/golden.md has ${testCount} test(s) (minimum: 2)`);
      }
    }
  }

  return { skillName, isGenerated, errors, warnings };
}

// ── Policy check ───────────────────────────────────────────────────────────────

function checkPolicy() {
  if (!fs.existsSync(POLICY_PATH)) {
    return { error: 'skill-policy.md not found at ' + POLICY_PATH };
  }
  const content = fs.readFileSync(POLICY_PATH, 'utf-8');
  const versionMatch = content.match(/# Skill-First Policy v([\d.]+)/);
  if (!versionMatch) {
    return { error: 'Could not parse policy version from skill-policy.md' };
  }
  return { version: versionMatch[1] };
}

// ── Main ───────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const specificSkill = args.includes('--skill') ? args[args.indexOf('--skill') + 1] : null;
  const onlyGenerated = args.includes('--generated');

  console.log('=== Skill Validator ===');
  console.log();

  // Check policy
  const policy = checkPolicy();
  if (policy.error) {
    console.log(`POLICY: WARN — ${policy.error}`);
  } else {
    console.log(`POLICY: v${policy.version}`);
  }
  console.log();

  // Get skill directories
  let skillDirs;
  if (specificSkill) {
    // Try both handcrafted and generated paths
    const handcrafted = path.join(SKILLS_DIR, specificSkill);
    const generated = path.join(GENERATED_DIR, specificSkill);
    if (fs.existsSync(generated)) {
      skillDirs = [generated];
    } else if (fs.existsSync(handcrafted)) {
      skillDirs = [handcrafted];
    } else {
      console.log(`ERROR: Skill "${specificSkill}" not found`);
      process.exit(1);
    }
  } else {
    skillDirs = getSkillDirs(onlyGenerated);
  }

  if (skillDirs.length === 0) {
    console.log('No skills found to validate.');
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const dir of skillDirs) {
    const result = validateSkill(dir);
    const tag = result.isGenerated ? ' [generated]' : '';
    const status = result.errors.length === 0 ? 'PASS' : 'FAIL';

    console.log(`${status} ${result.skillName}${tag}`);

    for (const error of result.errors) {
      console.log(`  ERROR: ${error}`);
      totalErrors++;
    }
    for (const warning of result.warnings) {
      console.log(`  WARN:  ${warning}`);
      totalWarnings++;
    }
  }

  console.log();
  console.log(`Results: ${skillDirs.length} skills checked, ${totalErrors} error(s), ${totalWarnings} warning(s)`);

  if (totalErrors > 0) {
    console.log();
    console.log('Validation FAILED. Fix errors above before deployment.');
    process.exit(1);
  } else {
    console.log();
    console.log('All validations PASSED.');
    process.exit(0);
  }
}

main();
