# Phase 1: GitHub + Lovable Setup - Research

**Researched:** 2026-02-02
**Domain:** GitHub repository setup + Lovable platform integration
**Confidence:** HIGH

## Summary

This phase involves setting up a GitHub repository and connecting a Lovable.dev project to it for version control and collaboration. Lovable is an AI-powered no-code platform for building full-stack web applications using natural language, valued at $6.6B as of 2026. The platform provides native GitHub integration with two-way synchronization where code changes flow automatically between Lovable and GitHub.

The standard approach is Lovable-first: create the Lovable project, then connect it to GitHub through Lovable's built-in integration (not gh CLI). Lovable automatically creates the repository and establishes the sync connection. This ensures proper webhook configuration and avoids path mismatch issues. The connection is brittle and depends on exact repository name, location, and organization structure.

GitHub CLI (gh) should be used for verification tasks (checking repository status, testing clone/push access) but not for initial repository creation, as Lovable must create and own the repository connection.

**Primary recommendation:** Let Lovable create the GitHub repository automatically during connection setup. Use GitHub CLI only for post-setup verification and access testing.

## Standard Stack

The established tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lovable Platform | Current (2026) | AI-powered app builder with GitHub sync | Official integration, automatic webhook setup, two-way sync |
| GitHub CLI (gh) | Latest | Repository verification and access testing | Official GitHub tool, command-line repo management |
| Git | 2.x+ | Local version control | Required for clone/push operations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GitHub web interface | N/A | Manual repository inspection | Verify repository exists, check sync commits |
| Lovable Cloud | N/A | Automatic backend/hosting | Comes with Lovable projects by default |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lovable-created repo | Manually created repo | Manual repos break Lovable sync; webhook configuration complex |
| GitHub CLI verification | Web UI only | CLI enables automation and script verification |
| Personal account | Organization account | Organizations offer better access control but require admin permissions |

**Installation:**
```bash
# Install GitHub CLI (Windows)
winget install --id GitHub.cli

# Verify installation
gh --version

# Authenticate with GitHub
gh auth login
```

## Architecture Patterns

### Recommended Connection Flow
```
1. Create Lovable project (done via Lovable web UI)
2. Connect GitHub account to Lovable workspace
3. Install Lovable GitHub App to personal account/organization
4. Let Lovable create repository automatically
5. Verify connection with gh CLI locally
```

### Pattern 1: Lovable-First Repository Creation
**What:** Lovable creates and owns the GitHub repository through its integration UI
**When to use:** Always for new Lovable projects requiring GitHub sync
**Why:** Ensures proper webhook configuration and avoids path mismatches

**Process:**
```
Settings → Connectors → GitHub → Connect GitHub (authorize account)
Settings → Connectors → GitHub → Connect project (install app)
Settings → Connectors → GitHub → Connect project (create repo)
Result: Lovable auto-creates repository with correct webhooks
```

### Pattern 2: Post-Setup Verification with GitHub CLI
**What:** Use gh CLI to verify repository accessibility after Lovable creates it
**When to use:** After Lovable connection completes, before considering phase done

**Example verification script:**
```bash
# Verify repository exists
gh repo view totalguardllc/tgyardcare

# Clone repository locally
gh repo clone totalguardllc/tgyardcare

# Test write access
cd tgyardcare
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify write access"
git push origin main
```

### Pattern 3: Two-Way Sync Workflow
**What:** Understanding how Lovable and GitHub stay synchronized
**When to use:** Ongoing development after initial setup

**Sync behavior:**
- Lovable edits → Auto-commit to GitHub main branch
- GitHub commits to main → Auto-sync back to Lovable
- Only default branch (main) syncs bidirectionally
- Feature branches require manual merge to main for sync

### Anti-Patterns to Avoid

- **Creating repository manually first:** Lovable cannot connect to pre-existing external repositories reliably. The connection depends on exact paths that Lovable controls.

- **Renaming/moving repository after connection:** Breaks sync permanently. The webhook configuration points to specific organization/repo path.

- **Using gh repo create for Lovable projects:** Repository won't have proper Lovable webhook configuration. Sync will fail.

- **Working on non-main branches expecting sync:** Only main branch syncs. Feature branches must be merged to main.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Repository creation for Lovable | gh repo create or manual GitHub UI | Lovable's built-in "Connect project" flow | Lovable auto-configures webhooks and sync; manual creation breaks integration |
| GitHub authentication | Custom OAuth flow | gh auth login | Official CLI handles device flow, token storage, org access correctly |
| Repository verification | Custom curl/API scripts | gh repo view, gh repo clone | CLI handles auth, formatting, error cases comprehensively |
| Webhook configuration | Manual GitHub webhook setup | Lovable's automatic setup | Complex webhook signatures, event filtering, retry logic |

**Key insight:** Lovable's GitHub integration is opinionated and requires control over repository creation. The webhook configuration is non-trivial and includes repository-specific secrets that cannot be easily replicated manually.

## Common Pitfalls

### Pitfall 1: Repository Rename/Move After Connection
**What goes wrong:** After renaming GitHub repository or organization, Lovable displays "We can't access your repository" error. Sync stops permanently.
**Why it happens:** Lovable's webhook configuration hardcodes the exact organization name and repository name. GitHub redirects don't propagate to webhook configurations.
**How to avoid:** Never rename the repository or move it between accounts/organizations after connecting. Treat the path as immutable.
**Warning signs:**
- Planning to rename organization for branding
- Considering moving from personal to org account
- Repository name contains typos discovered post-connection

### Pitfall 2: Incorrect Permission Scope
**What goes wrong:** User connects GitHub account but cannot see their organization's repositories or install the app to organization.
**Why it happens:** GitHub account not authorized for organization, or organization requires app approval by admins.
**How to avoid:** Use "totalguardllc@gmail.com" account that owns the organization. Verify organization membership before starting connection.
**Warning signs:**
- Organizations don't appear in dropdown during app installation
- "You don't have permission" errors
- App installation pending admin approval

### Pitfall 3: Mismatched Dependencies on Import
**What goes wrong:** If importing existing code (not this phase, but worth noting), Lovable project fails to build due to package.json version conflicts.
**Why it happens:** Lovable expects specific React/Vite/Tailwind versions. Existing projects may use incompatible versions.
**How to avoid:** For this phase (new project), not applicable. For future imports, check Lovable's expected stack versions first.
**Warning signs:**
- Build errors in Lovable console after import
- "Could not resolve dependency" errors
- Version mismatch warnings

### Pitfall 4: Feature Branch Sync Expectation
**What goes wrong:** Developer creates feature branch, makes commits, but changes never appear in Lovable.
**Why it happens:** Lovable only syncs the default branch (main). Feature branches are ignored by sync.
**How to avoid:** Understand that Lovable sync is main-only. Feature branches must be merged to main to sync. Use Lovable's experimental "Labs" branch switching for advanced workflows.
**Warning signs:**
- GitHub shows commits on feature branch
- Lovable project unchanged
- Confusion about "two-way sync" meaning

### Pitfall 5: Pulling Without Stashing Local Changes
**What goes wrong:** Local changes lost when pulling remote updates without committing/stashing first.
**Why it happens:** Standard Git behavior, but Lovable's auto-commit pattern makes this easy to forget when working locally.
**How to avoid:** Always use `git status` before pulling. Use `git stash` to save uncommitted work before pulling.
**Warning signs:**
- Working directory not clean before pull
- Merge conflicts on pull
- "Your local changes would be overwritten" error

## Code Examples

Verified patterns from official sources:

### Connecting Lovable to GitHub (Official Process)
```
Source: https://docs.lovable.dev/integrations/github

Step 1: Authorize GitHub Account
- Navigate to Settings → Connectors → GitHub
- Click "Connect GitHub"
- Sign in to totalguardllc@gmail.com GitHub account
- Authorize lovable.dev application

Step 2: Install Lovable GitHub App
- Return to Settings → Connectors → GitHub
- Click "Connect project"
- Select "Add organizations"
- Choose personal account or "totalguardllc" organization
- Select "All repositories" or specific repositories
- Click "Install & Authorize"

Step 3: Create Repository Connection
- In project, go to Settings → Connectors → GitHub
- Click "Connect project"
- Select GitHub organization/account location
- Click "Transfer anyway" to confirm
- Lovable auto-creates repository: github.com/totalguardllc/tgyardcare
- Two-way sync begins automatically
```

### Verifying Repository with GitHub CLI
```bash
# Source: https://cli.github.com/manual/gh_repo_create

# Check repository exists
gh repo view totalguardllc/tgyardcare

# Clone repository
gh repo clone totalguardllc/tgyardcare

# Navigate into cloned repo
cd tgyardcare

# Verify branch
git branch

# Test push access (create test commit)
echo "# TotalGuard Yard Care" > README.md
git add README.md
git commit -m "docs: initialize README"
git push origin main

# Verify commit appears in GitHub
gh repo view totalguardllc/tgyardcare --web
```

### Checking Connection Status
```bash
# Source: Official GitHub CLI documentation

# List repositories for account
gh repo list totalguardllc

# Check if specific repo exists
gh repo view totalguardllc/tgyardcare --json name,owner,isPrivate

# View recent commits
gh repo view totalguardllc/tgyardcare --json defaultBranchRef --jq '.defaultBranchRef.target.history.edges[].node.message'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual GitHub repo → Connect | Lovable auto-creates repo | 2024-2025 (Lovable evolution) | Eliminated webhook misconfiguration issues |
| One-way export to GitHub | Two-way sync with main | Current Lovable feature | Enables local development alongside Lovable UI |
| Single branch only | Main + experimental branch switching | 2025-2026 (Labs feature) | Advanced users can work on features before main merge |
| Fork-based collaboration | Direct branch collaboration | GitHub recommendation (2026) | Better for team workflows, simpler permission model |

**Deprecated/outdated:**
- Manual webhook configuration: Lovable automates this completely now
- Repository import from external GitHub repos: Officially not supported; workarounds exist but fragile
- GitHub personal access tokens for connection: OAuth device flow via gh auth login is standard

## Open Questions

Things that couldn't be fully resolved:

1. **Lovable's exact repository naming logic**
   - What we know: Lovable creates repository with project name, but specific slug generation unclear
   - What's unclear: How Lovable handles special characters, naming conflicts, or very long project names
   - Recommendation: Verify actual repository name immediately after connection, document it in phase completion

2. **Recovery procedure if connection breaks**
   - What we know: Renaming breaks sync permanently; disconnecting and reconnecting creates NEW repository
   - What's unclear: Any supported way to repoint Lovable to existing repository with history intact
   - Recommendation: Treat connection as immutable; document backup procedures in future phases

3. **Lovable commit message format**
   - What we know: Lovable auto-commits changes to GitHub with some commit message
   - What's unclear: Exact format, customization options, ability to add conventional commit prefixes
   - Recommendation: Observe commit messages after first save, document for future reference

## Sources

### Primary (HIGH confidence)
- https://docs.lovable.dev/integrations/github - Official Lovable GitHub connection documentation
- https://docs.lovable.dev/integrations/git-integration - Official two-way sync behavior documentation
- https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories - Official GitHub repository best practices
- https://cli.github.com/manual/gh_repo_create - Official GitHub CLI repository creation documentation

### Secondary (MEDIUM confidence)
- https://hackceleration.com/lovable-review/ - Comprehensive 2026 review of Lovable platform with GitHub integration testing
- https://www.arsturn.com/blog/common-pitfalls-merging-lovable-projects-github - Common merge pitfalls (verified against official docs)
- https://github.com/orgs/community/discussions/154720 - Real-world issue about organization rename breaking Lovable connection

### Tertiary (LOW confidence)
- https://dev.to/danielbetterdevelopers/the-lovabledev-migration-guide-moving-from-personal-github-to-an-organization-without-breaking-100n - Community migration guide (workaround-based, not officially supported)
- https://medium.com/@XAndroid/how-to-import-your-existing-code-into-lovable-using-github-119d0d79d483 - Import techniques (experimental, not for this phase)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Lovable and GitHub documentation verified
- Architecture: HIGH - Connection flow documented in official sources, verified with multiple examples
- Pitfalls: HIGH - Documented in official docs and verified by GitHub community discussions

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable platform, established integration)
