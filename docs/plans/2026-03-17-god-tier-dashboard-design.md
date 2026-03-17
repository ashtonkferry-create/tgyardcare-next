# Design: God-Tier Dashboard — Workely AI
**Date:** 2026-03-17
**Scope:** Transform dashboard from functional to unforgettable — motion, spatial intelligence, living data
**Constraint:** No backend changes. No new pages. Elevate existing pages only.

---

## Executive Summary

The dashboard has correct aesthetic DNA (space theme, violet/cyan, Bricolage Grotesque, glass morphism) but flat visual hierarchy, static agent cards, and passive navigation. This design elevates it to a billionaire-tier command interface: a living organism where every metric breathes, every active agent pulses, and the sidebar tells you the health of your business at a glance.

Inspiration: SpaceX mission control × Bloomberg terminal × Linear's motion refinement.

---

## Design Pillars

### 1. The Living Sidebar
Navigation becomes a real-time status board:
- **Agents item**: `3 LIVE` badge with emerald pulse dot
- **Intelligence item**: `↑ 12%` trend chip when revenue trending up
- **Deploy item**: amber glow when setup incomplete (pulls attention without disrupting)
- **Profile card**: plan tier badge (GROWTH / SCALE) as a glowing chip
- Badges use `var(--accent-emerald)` for live, `var(--accent-amber)` for warnings

### 2. Mission Control Command Center
The home page hero strip becomes three enormous breathing vitals:
- `AGENTS LIVE: 7` — emerald, with animated orbital ring
- `REVENUE SIGNAL: HIGH` — violet, with pulsing waveform indicator
- `SYSTEM HEALTH: 94%` — cyan, with circular progress ring
Each vital has a label in mono font (10px uppercase), value in display font (56px bold), and a slow 3s breathing animation (`scale(1) → scale(1.01) → scale(1)`).

Right-rail activity feed: live events slide in from the right with 200ms spring, each entry has a colored left border matching event type (green=success, amber=warning, violet=AI action).

### 3. Agent Cards: From Static to Alive
Active agents get a visual life force:
- **Orbital ring** — SVG circle that traces 0→percentage of activity fill, pulses when task fires
- **Status glow aura** — CSS box-shadow: `active` = emerald glow, `paused` = no glow, `needs_attention` = amber pulse
- **Heartbeat sparkline** — 20×20px SVG path inside the card, breathing slow sine wave when active, flat when paused
- **Last action timestamp** — mono font, `2m ago` at card bottom
- **Hover panel** — reveals top 3 recent actions with colored dot + text

### 4. Cinematic Page Transitions
`template.tsx` wraps every page in a Framer Motion layout that slides out up+fades on exit, slides in from below on enter. 300ms, ease `[0.16, 1, 0.3, 1]`. No jarring cuts.

### 5. Intelligence Page: Bloomberg Terminal Energy
- **Performance ticker tape** — scrolling strip at top showing key metrics (like a stock ticker)
- **2×2 chart grid** with gradient-fill area charts, each with a live trend label
- **Anomaly detector panel** — appears when any metric spikes >200% or drops >50%, amber bordered card

---

## What We Are NOT Changing
- No new routes or pages
- No backend/API changes
- No changes to auth, billing, or deploy flow
- No structural layout changes (sidebar stays left, header stays top)
- No new external libraries beyond what's already installed (Framer Motion, Recharts/chart lib already present)
