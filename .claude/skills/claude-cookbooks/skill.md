---
name: claude-cookbooks
description: Production patterns, prompting techniques, and architecture recipes from Anthropic's official Claude Cookbooks. Use alongside frontend-design for UI work, or standalone for agent architecture, tool use, prompt engineering, and multi-agent coordination. Reference when building with Claude APIs, designing agent systems, or generating high-quality frontend code.
---

# Claude Cookbooks — Production Patterns & Recipes

Reference skill derived from [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks). Use this when building with Claude — frontend generation, agent systems, tool use, prompt engineering, or multi-agent coordination.

## Frontend Aesthetics Prompting

**Source:** `coding/prompting_for_frontend_aesthetics.ipynb`

Three strategies to avoid "AI slop" in generated UI:

1. **Guide specific design dimensions** — Direct attention to typography, color, motion, backgrounds individually
2. **Reference design inspirations** — Suggest IDE themes, cultural aesthetics without over-prescribing
3. **Call out common defaults** — Explicitly tell Claude to avoid its convergence tendencies

### The Distilled Aesthetics Prompt

Use this as a system-level injection when generating any frontend code:

```
<frontend_aesthetics>
You tend to converge toward generic outputs. In frontend design, this creates "AI slop." Avoid this: make creative, distinctive frontends. Focus on:

Typography: Beautiful, unique fonts. Never Inter, Roboto, Arial, system fonts. Distinctive choices that elevate aesthetics.

Color & Theme: Commit to a cohesive aesthetic. CSS variables for consistency. Dominant colors with sharp accents outperform timid palettes. Draw from IDE themes and cultural aesthetics.

Motion: Animations for effects and micro-interactions. CSS-only for HTML, Motion library for React. One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

Backgrounds: Atmosphere and depth, not solid colors. Layer gradients, geometric patterns, contextual effects matching the aesthetic.

NEVER: Inter/Roboto/Arial, purple-on-white cliches, predictable layouts, cookie-cutter design.

Vary themes, fonts, aesthetics across generations. Think outside the box.
</frontend_aesthetics>
```

### Typography Quick Reference

**Never use:** Inter, Roboto, Open Sans, Lato, default system fonts

**Impact choices by context:**
- Code aesthetic: JetBrains Mono, Fira Code, Space Grotesk
- Editorial: Playfair Display, Crimson Pro, Fraunces
- Startup/SaaS: Clash Display, Satoshi, Cabinet Grotesk
- Technical: IBM Plex family, Source Sans 3
- Distinctive: Bricolage Grotesque, Obviously, Newsreader

**Pairing principle:** High contrast = interesting. Display + monospace, serif + geometric sans, variable font across weights.

**Weight extremes:** 100/200 vs 800/900, not 400 vs 600. Size jumps of 3x+, not 1.5x.

### Color & Theme Rules

- CSS variables for all tokens — never inline hex values
- Dominant color + sharp accent > evenly distributed palette
- Draw inspiration from IDE themes (Dracula, Catppuccin, Tokyo Night) or cultural aesthetics
- Dark mode: luminous accents on deep backgrounds, not inverted light mode
- Commit to ONE cohesive direction, don't hedge between styles

### Motion Hierarchy

Priority order for animation investment:
1. **Page load** — Staggered blur-fade reveals (animation-delay 50-100ms between items)
2. **Scroll triggers** — Progressive reveals as sections enter viewport
3. **Hover states** — Every interactive element needs a response (scale, glow, color shift)
4. **Transitions** — Smooth state changes (200-300ms, ease-out curves)
5. **Micro-interactions** — Subtle feedback on clicks, toggles, form inputs

**CSS-only for HTML.** Framer Motion for React. Focus on high-impact moments over scattered effects.

### Background Techniques

Never use flat solid colors. Instead:
- Gradient meshes (multi-stop radial/linear)
- Noise/grain textures (CSS filter or SVG)
- Geometric patterns (dot grids, line patterns, animated grids)
- Layered transparencies (glass-morphism, backdrop-blur)
- Contextual atmospheric effects (particles, subtle animation)

---

## Agent Architecture Patterns

**Source:** `patterns/agents/`

### Prompt Chaining
Sequential subtasks where each step builds on previous results.

**When:** Complex tasks requiring progressive transformation (extract → normalize → format).
**How:** Pass output of step N as input to step N+1. Each prompt is focused and narrow.

### Routing
Dynamically select specialized paths based on input classification.

**When:** Content needs different handling by type (support tickets, query types, intents).
**How:** First call classifies with chain-of-thought reasoning → extract route → specialized prompt.

### Parallelization
Distribute independent subtasks across concurrent workers.

**When:** Multiple independent analyses needed simultaneously (stakeholder impacts, multi-perspective review).
**How:** ThreadPoolExecutor / Promise.all for concurrent execution. Same or different prompts.

### Orchestrator-Workers
Central coordinator analyzes task, dynamically generates subtasks, delegates to specialized workers.

**When:** Optimal subtasks depend on specific input. Strategy comparisons needed. Complex multi-faceted tasks.
**Avoid when:** Simple tasks, latency-critical, or subtasks are predictable.

**Implementation:**
1. Orchestrator receives task → generates structured subtask descriptions (XML format)
2. Each worker receives: original context + specific subtask type + guidelines
3. Results aggregated by orchestrator

**Cost optimization:** Claude Opus for orchestrator, Claude Haiku for workers.

### Evaluator-Optimizer
Iterative improvement loop where one model generates, another evaluates, feedback drives refinement.

**When:** Quality must exceed single-pass generation. Code review, writing refinement, design iteration.
**How:** Generator → Evaluator (scores + feedback) → Generator (incorporates feedback) → repeat until threshold.

---

## Tool Use Patterns

**Source:** `tool_use/`

### Parallel Tool Calls
Claude can request multiple tool calls simultaneously when tools are independent.

### Structured JSON Extraction
Use tools to enforce output schema — define a tool whose parameters match desired JSON structure.

### Tool Search with Embeddings
For large tool sets, embed tool descriptions and use semantic search to surface relevant tools dynamically.

### Programmatic Tool Calling (PTC)
Low-level control: intercept tool calls, modify parameters, route to different implementations.

### Memory Patterns
Persistent memory across conversations via tool-based read/write to external storage.

### Automatic Context Compaction
Compress tool-use history to stay within context limits while preserving essential information.

---

## Extended Thinking

**Source:** `extended_thinking/`

Use extended thinking for complex reasoning tasks. Key patterns:
- Enable with `thinking` parameter in API calls
- Thinking tokens are separate from output tokens
- Combine with tool use: thinking → plan tool calls → execute → think about results
- Streaming: thinking blocks arrive before response text
- Budget tokens: set `budget_tokens` to control thinking depth

**Best for:** Financial analysis, multi-step reasoning, code architecture decisions, strategic planning.

---

## Skills Development

**Source:** `skills/`

### Creating Custom Skills
1. Define clear input/output contract
2. Include reference materials (REFERENCE.md) for domain knowledge
3. Use structured templates for consistent output
4. Validate against domain-specific rules
5. Cross-format workflows: chain skills (CSV → Excel → PowerPoint → PDF)

### Built-in Document Skills
- **xlsx** — Excel with formulas, charts, conditional formatting
- **pptx** — PowerPoint with slides, charts, transitions
- **pdf** — PDF with text, tables, images, headers/footers
- **docx** — Word with rich formatting, sections, TOC

---

## Claude Agent SDK Patterns

**Source:** `claude_agent_sdk/`

### One-Liner Research Agent
Minimal agent: WebSearch + Read tools. Core loop: query → search → read → synthesize.

### Chief of Staff Agent
Full-featured executive assistant pattern:
- Persistent memory via CLAUDE.md instructions
- Output styles (executive brief vs technical deep-dive)
- Plan mode (strategic thinking without execution)
- Custom slash commands for common workflows
- Hooks for compliance tracking and audit trails
- Multi-agent orchestration with role delegation

### Observability Agent
DevOps monitoring: Git + GitHub MCP integration, CI/CD monitoring, automated root cause analysis.

### Site Reliability Agent
Infrastructure monitoring: health checks, performance analysis, automated remediation.

---

## Cost Optimization Strategies

1. **Sub-agents:** Use Haiku for quick classification/extraction, Opus for complex reasoning
2. **Prompt caching:** Cache large system prompts and reference documents
3. **Batch processing:** Bulk API calls for non-time-sensitive work
4. **Context compaction:** Compress history to extend conversations
5. **Speculative caching:** Pre-cache likely follow-up contexts

---

## Multimodal Patterns

**Source:** `multimodal/`

- **Vision feedback loops:** Screenshot → Claude analyzes → suggests fixes → iterate
- **Chart/graph reading:** Extract data from visual charts and tables
- **Document transcription:** OCR-quality text extraction from images
- **Sub-agent cost optimization:** Haiku processes images, Opus makes decisions

---

## When to Reference This Skill

| Task | Relevant Section |
|------|-----------------|
| Building any UI component/page | Frontend Aesthetics Prompting |
| Designing agent architecture | Agent Architecture Patterns |
| Implementing tool use | Tool Use Patterns |
| Complex reasoning tasks | Extended Thinking |
| Multi-agent coordination | Orchestrator-Workers + Agent SDK |
| Cost optimization | Cost Optimization Strategies |
| Visual QA / screenshot analysis | Multimodal Patterns |
| Document generation | Skills Development |
| Prompt engineering | Frontend Aesthetics + Agent Patterns |
