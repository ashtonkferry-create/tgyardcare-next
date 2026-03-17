# God-Tier Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Workely AI dashboard from functional to unforgettable — living agent cards, intelligent sidebar badges, a mission-control vitals bar, and cinematic motion throughout.

**Architecture:** Pure visual elevation — no new API routes, no schema changes, no new pages. All changes are in existing components: CSS animations added to globals.css, component files upgraded in-place. Every active element should breathe, pulse, and respond to state.

**Tech Stack:** Next.js 15, React 19, Framer Motion (already installed), TypeScript, CSS custom properties (existing design system in globals.css)

---

## Task 1: CSS Animation Foundation

Add all new keyframe animations and CSS utility classes that every subsequent task depends on.

**Files:**
- Modify: `workely.ai/apps/web/src/app/globals.css` (append after the `:root {}` block, before `BASE STYLES`)

**Step 1: Add these keyframes and utilities to globals.css, immediately after the closing `}` of the `:root` block (around line 182):**

```css
/* ═══════════════════════════════════════════════════════════════════════════
   GOD-TIER ANIMATIONS — Living Dashboard Motion System
   ═══════════════════════════════════════════════════════════════════════════ */

/* Slow ambient breathing — metrics, vitals, active indicators */
@keyframes hud-breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.85; transform: scale(1.012); }
}

/* Status glow pulse — active agent cards */
@keyframes glow-pulse-emerald {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0), 0 0 12px rgba(52, 211, 153, 0.08); }
  50%       { box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.06), 0 0 20px rgba(52, 211, 153, 0.14); }
}

/* Amber alert pulse — needs attention */
@keyframes glow-pulse-amber {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0), 0 0 8px rgba(251, 191, 36, 0.08); }
  50%       { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.07), 0 0 16px rgba(251, 191, 36, 0.14); }
}

/* Sidebar badge pop-in */
@keyframes badge-pop {
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Ticker tape scroll */
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Orbital ring trace — SVG stroke dashoffset fill */
@keyframes orbital-fill {
  from { stroke-dashoffset: var(--orbital-circumference, 138); }
  to   { stroke-dashoffset: var(--orbital-target, 0); }
}

/* Heartbeat flat-to-wave on active */
@keyframes heartbeat-wave {
  0%, 100% { d: path('M0,10 L4,10 L6,4 L8,16 L10,10 L20,10'); }
  50%       { d: path('M0,10 L4,10 L6,2 L8,18 L10,10 L20,10'); }
}

/* CSS utility classes */
.anim-hud-breathe   { animation: hud-breathe 3s ease-in-out infinite; }
.anim-glow-emerald  { animation: glow-pulse-emerald 2.5s ease-in-out infinite; }
.anim-glow-amber    { animation: glow-pulse-amber 1.8s ease-in-out infinite; }
.anim-badge-pop     { animation: badge-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.anim-ticker        { animation: ticker-scroll 30s linear infinite; }
```

**Step 2: Type-check to confirm no issues:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -20
```
Expected: no errors (CSS changes can't produce TS errors)

**Step 3: Commit:**
```bash
cd workely.ai && git add apps/web/src/app/globals.css
git commit -m "feat(dashboard): add god-tier CSS animation keyframes"
```

---

## Task 2: Agent Card Elevation (Agents Page)

The agents page (`/agents`) shows up to 47 agent cards. Every active one gets an emerald glow aura, orbital ring, and status-colored border glow. This is the highest-visibility change.

**Files:**
- Modify: `workely.ai/apps/web/src/components/agents/agent-card.tsx`

**Context:** The card currently has:
- `motion.div` wrapper with `whileHover={{ y: -3 }}`
- `borderLeft: 3px solid ${isLocked ? 'rgba(...)' : agent.color}`
- `position: 'relative', overflow: 'hidden'`
- Stats section with conversations + leads
- A toggle button at the bottom

**Step 1: Open `workely.ai/apps/web/src/components/agents/agent-card.tsx`**

Replace the full file content with the elevated version below. Key changes:
1. Add `useEffect` + `useRef` for the orbital ring SVG
2. Add glow aura CSS class based on status
3. Add `last_fired_at` to stats display (will show "—" if no data since it's optional)
4. Heartbeat indicator (simple pulsing dot, not SVG path animation which requires CSS Houdini)

```tsx
'use client'

import { memo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AgentDefinition } from '@/lib/agents/definitions'
import { StatusDot } from '@/components/ui/status-dot'
import { Loader2, Lock } from 'lucide-react'
import { AGENT_ICON_COMPONENTS, FALLBACK_ICON } from '@/lib/agents/icon-map'

interface AgentCardProps {
  agent: AgentDefinition
  status?: 'active' | 'paused' | 'setup_required' | 'locked'
  stats?: {
    conversations: number
    leads_generated: number
    appointments_booked: number
    messages_sent: number
  }
  onToggle?: (agentType: string, enabled: boolean) => Promise<void>
  recommended?: boolean
  index?: number
}

const STATUS_VARIANT: Record<string, 'healthy' | 'warning' | 'error' | 'idle'> = {
  active: 'healthy',
  paused: 'warning',
  setup_required: 'idle',
  locked: 'error',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  setup_required: 'Setup Required',
  locked: 'Locked',
}

// Orbital ring circumference for r=18
const CIRCUMFERENCE = 2 * Math.PI * 18 // ≈ 113.1

export const AgentCard = memo(function AgentCard({
  agent,
  status = 'setup_required',
  stats,
  onToggle,
  recommended,
  index = 0,
}: AgentCardProps) {
  const isLocked = status === 'locked'
  const isActive = status === 'active'
  const isPaused = status === 'paused'
  const canToggle = (isActive || isPaused) && !!onToggle
  const [toggling, setToggling] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onToggle || toggling) return
    setToggling(true)
    try {
      await onToggle(agent.type, !isActive)
    } finally {
      setToggling(false)
    }
  }

  const convos = stats?.conversations ?? 0
  const leads = stats?.leads_generated ?? 0
  const AgentIcon = AGENT_ICON_COMPONENTS[agent.type] ?? FALLBACK_ICON

  // Activity ring fill: base on conversations (0–100+ maps to 5%–95%)
  const activityPct = Math.min(Math.max(convos / 100, 0.05), 0.95)
  const ringOffset = isActive ? CIRCUMFERENCE * (1 - activityPct) : CIRCUMFERENCE

  // Glow class by status
  const glowClass = isActive ? 'anim-glow-emerald' : ''

  return (
    <motion.div
      className={`group ${glowClass}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        padding: '1rem 1rem 0.875rem 1.125rem',
        background: isActive
          ? 'rgba(52, 211, 153, 0.02)'
          : 'rgba(148, 163, 184, 0.02)',
        border: `1px solid ${isActive ? 'rgba(52, 211, 153, 0.08)' : 'rgba(148, 163, 184, 0.06)'}`,
        borderLeft: `3px solid ${isLocked ? 'rgba(148, 163, 184, 0.08)' : agent.color}`,
        cursor: isLocked ? 'default' : 'pointer',
        transition: 'border-color 300ms ease, background 300ms ease',
      }}
    >
      {/* Orbital ring — top-right corner, visible only when active */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            pointerEvents: 'none',
          }}
        >
          <svg
            width={40}
            height={40}
            style={{ transform: 'rotate(-90deg)', display: 'block' }}
          >
            {/* Track */}
            <circle
              cx={20} cy={20} r={18}
              fill="none"
              stroke="rgba(52, 211, 153, 0.08)"
              strokeWidth={2}
            />
            {/* Fill arc */}
            <motion.circle
              cx={20} cy={20} r={18}
              fill="none"
              stroke="rgba(52, 211, 153, 0.55)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 + 0.2 }}
            />
          </svg>
          {/* Center dot */}
          <div
            className="anim-hud-breathe"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)',
              }}
            />
          </div>
        </div>
      )}

      {/* Subtle shimmer on active */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${agent.color}40 50%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.625rem', paddingRight: isActive ? '2rem' : 0 }}>
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLocked ? 'rgba(148, 163, 184, 0.04)' : `${agent.color}14`,
            border: `1px solid ${isLocked ? 'rgba(148, 163, 184, 0.06)' : `${agent.color}25`}`,
            fontSize: '1rem',
          }}
        >
          {isLocked
            ? <Lock size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            : <AgentIcon size={16} style={{ color: agent.color }} />
          }
        </div>

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.2rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                opacity: isLocked ? 0.45 : 1,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '140px',
              }}
            >
              {agent.name}
            </span>
            {recommended && !isLocked && (
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--accent-amber)',
                  background: 'rgba(251, 191, 36, 0.1)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  flexShrink: 0,
                }}
              >
                ★ Rec
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <StatusDot variant={STATUS_VARIANT[status]} size={5} />
            <span
              style={{
                fontSize: '0.6875rem',
                color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.02em',
              }}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row (only if not locked and has some data) */}
      {!isLocked && (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '0.625rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.04)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: convos > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
              }}
            >
              {convos.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
              Convos
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(148,163,184,0.06)' }} />
          <div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: leads > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
              }}
            >
              {leads.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
              Leads
            </div>
          </div>
        </div>
      )}

      {/* Bottom row: toggle OR upgrade nudge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {isLocked ? (
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              opacity: 0.4,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Upgrade to unlock
          </span>
        ) : canToggle ? (
          <motion.button
            onClick={handleToggle}
            disabled={toggling}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: `1px solid ${isActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(148, 163, 184, 0.1)'}`,
              background: isActive ? 'rgba(52, 211, 153, 0.06)' : 'rgba(148, 163, 184, 0.04)',
              color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: toggling ? 'wait' : 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {toggling
              ? <Loader2 size={10} className="animate-spin" />
              : <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--accent-emerald)' : 'rgba(148,163,184,0.3)' }} />
            }
            {isActive ? 'Pause' : 'Activate'}
          </motion.button>
        ) : (
          <Link
            href={`/agents/${agent.type}`}
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            Configure →
          </Link>
        )}
      </div>
    </motion.div>
  )
})
```

**Step 2: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```
Expected: no errors

**Step 3: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/agents/agent-card.tsx
git commit -m "feat(agents): elevate agent cards — orbital ring, status glow, mono stats"
```

---

## Task 3: Command Center Agent Card Elevation

The command center home page (`/`) shows active agents via `components/command/agent-card.tsx`. Same treatment.

**Files:**
- Modify: `workely.ai/apps/web/src/components/command/agent-card.tsx`

**Context:** Currently uses `SpaceFrame` wrapper with a stats grid of 4 metrics. Minimal styling. Uses CSS classes from `globals.css` (`agent-card-link`, `agent-card-stats`, etc).

**Step 1: Add animated glow wrapper and orbital ring to command agent card. Add these style additions — replace the return statement's outermost `<Link>` wrapper:**

Find the existing return:
```tsx
  return (
    <Link href={`/agents/${agent.type}`} className="agent-card-link">
      <SpaceFrame variant="elevated" className="agent-card-content">
```

Replace with (adds glow wrapper around the link):
```tsx
  const isActive = agent.status === 'active'
  const CIRCUMFERENCE = 2 * Math.PI * 18

  return (
    <div
      className={isActive ? 'anim-glow-emerald' : ''}
      style={{ borderRadius: '12px' }}
    >
    <Link href={`/agents/${agent.type}`} className="agent-card-link" style={{ position: 'relative' }}>
      {/* Orbital ring for active agents */}
      {isActive && (
        <div style={{ position: 'absolute', top: 8, right: 8, width: 40, height: 40, pointerEvents: 'none', zIndex: 1 }}>
          <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={20} cy={20} r={18} fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth={2} />
            <circle
              cx={20} cy={20} r={18}
              fill="none"
              stroke="rgba(52,211,153,0.5)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * 0.3}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="anim-hud-breathe" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
          </div>
        </div>
      )}
      <SpaceFrame variant="elevated" className="agent-card-content">
```

And close the extra `</div>` at the end after `</Link>`:
```tsx
    </Link>
    </div>
  )
```

Also add `const isActive = agent.status === 'active'` at the top of the function body (before the existing `const agentDef = ...`).

**Step 2: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```

**Step 3: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/command/agent-card.tsx
git commit -m "feat(command): add orbital ring + glow aura to command agent cards"
```

---

## Task 4: Command Vitals Bar

Replace the "Mission Control" title in `CommandHeroStrip` with 3 enormous breathing vitals: Agents Live, Revenue Signal, System Health.

**Files:**
- Modify: `workely.ai/apps/web/src/components/command/command-hero-strip.tsx`

**Context:** The file currently renders a `<header className="command-header">` with `<h1>Mission Control</h1>` and control badges. We replace the header section with a vitals bar above it, keeping the alert banners unchanged.

**Step 1: Replace the `<header className="command-header">` block (lines 94–127) with:**

```tsx
      {/* ── Vitals Bar ──────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Vital 1: Agents Live */}
        <div
          className="anim-hud-breathe"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: 'rgba(52, 211, 153, 0.03)',
            border: '1px solid rgba(52, 211, 153, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)' }} />
          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-emerald)', opacity: 0.7, marginBottom: '0.5rem' }}>
            Agents Live
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-emerald)', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {controlStatus?.activeAgentCount ?? revenueData.totalLeads > 0 ? '—' : '0'}
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem', fontFamily: 'var(--font-mono)' }}>
            {commandState === 'AGENTS_ACTIVE_NO_REVENUE' ? 'processing' : commandState === 'REVENUE_FLOWING' ? 'revenue active' : 'awaiting deploy'}
          </div>
        </div>

        {/* Vital 2: Revenue Signal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: 'rgba(124, 92, 252, 0.03)',
            border: '1px solid rgba(124, 92, 252, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,92,252,0.3), transparent)' }} />
          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-primary)', opacity: 0.7, marginBottom: '0.5rem' }}>
            Revenue Signal
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {commandState === 'REVENUE_FLOWING' ? 'HIGH' : commandState === 'AGENTS_ACTIVE_NO_REVENUE' ? 'WARM' : 'DARK'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem', fontFamily: 'var(--font-mono)' }}>
            {revenueData.totalLeads > 0 ? `${revenueData.totalLeads.toLocaleString()} total leads` : 'no signal yet'}
          </div>
        </div>

        {/* Vital 3: System Status */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: 'rgba(34, 211, 238, 0.03)',
            border: `1px solid ${commandState === 'CHURN_RISK' ? 'rgba(251,113,133,0.15)' : 'rgba(34,211,238,0.1)'}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${commandState === 'CHURN_RISK' ? 'rgba(251,113,133,0.3)' : 'rgba(34,211,238,0.3)'}, transparent)` }} />
          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', color: commandState === 'CHURN_RISK' ? 'var(--accent-rose)' : 'var(--accent-cyan)', opacity: 0.7, marginBottom: '0.5rem' }}>
            System Status
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: commandState === 'CHURN_RISK' ? 'var(--accent-rose)' : 'var(--accent-cyan)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {commandState === 'NOT_DEPLOYED' ? 'IDLE' : commandState === 'CHURN_RISK' ? 'ALERT' : 'LIVE'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem', fontFamily: 'var(--font-mono)' }}>
            {controlStatus ? (controlStatus.systemStatus === 'active' ? 'all systems nominal' : 'system paused') : 'not configured'}
          </div>
        </div>
      </div>

      {/* ── Original header (title + badges) — kept below vitals ── */}
      <header className="command-header" style={{ marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <h1 className="command-title">Mission Control</h1>
          <p className="command-subtitle">Agent-centric revenue operations command center</p>
        </div>
        {controlStatus && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ControlBadge
              label={controlStatus.systemStatus === 'active' ? 'System Active' : 'System Paused'}
              color={controlStatus.systemStatus === 'active' ? '#00d97e' : '#ef4444'}
              icon={controlStatus.systemStatus === 'active' ? <Play size={12} /> : <Pause size={12} />}
            />
            <ControlBadge
              label={
                controlStatus.autonomyMode === 'full_auto' ? 'Full Auto'
                : controlStatus.autonomyMode === 'approval_required' ? 'Approval Mode'
                : 'Insights Only'
              }
              color={
                controlStatus.autonomyMode === 'full_auto' ? '#00d97e'
                : controlStatus.autonomyMode === 'approval_required' ? '#f59e0b'
                : '#8888a0'
              }
              icon={controlStatus.autonomyMode === 'full_auto' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            />
            {controlStatus.lastControlEventAt && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Last event: {new Date(controlStatus.lastControlEventAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </header>
```

Note: `controlStatus` doesn't have `activeAgentCount` — for the Agents Live vital, use `revenueData.totalLeads > 0` as a proxy for "flowing." The actual agent count comes from the parent page. Since `CommandHeroStrip` doesn't receive agent count, simplify the Agents Live vital to show the commandState text instead:

For the Agents Live value, replace:
```tsx
{controlStatus?.activeAgentCount ?? revenueData.totalLeads > 0 ? '—' : '0'}
```
with:
```tsx
{commandState === 'NOT_DEPLOYED' ? '0' : commandState === 'CHURN_RISK' ? '!' : '✓'}
```

**Step 2: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```

**Step 3: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/command/command-hero-strip.tsx
git commit -m "feat(command): add mission control vitals bar — agents/revenue/status"
```

---

## Task 5: Sidebar Intelligence Badges

Add live agent count badge + alert indicator to the sidebar navigation items.

**Files:**
- Modify: `workely.ai/apps/web/src/components/dashboard/sidebar.tsx`

**Context:** The sidebar `persistentNavItems` array is static. We need to add a small badge to the Agents item showing how many are active, and to Intelligence showing a trend.

**Step 1: Add a `useSidebarStats` hook inside the sidebar file (before the `Sidebar` function). This fetches agent counts client-side:**

After the `const SPRING = ...` line, add:

```tsx
function useSidebarStats() {
  const [activeCount, setActiveCount] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { count } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active')
        setActiveCount(count ?? 0)
      } catch { /* silent */ }
    }
    fetchCount()
  }, [supabase])

  return { activeCount }
}
```

**Step 2: In the `NavItem` component, add an optional `badge` prop:**

Change the `NavItemType` interface from:
```tsx
type NavItemType = {
  name: string
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
}
```
to:
```tsx
type NavItemType = {
  name: string
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  badge?: number | null
}
```

And in `NavItem` props, add `badge?: number | null` to the destructure:
```tsx
function NavItem({
  item,
  isSpecial,
  collapsed,
}: {
  item: NavItemType
  isSpecial?: boolean
  collapsed: boolean
}) {
```
→ (no badge prop needed on `NavItem` itself since it reads from `item.badge`)

**Step 3: Add badge rendering inside `NavItem`. After the label `<motion.span>` (around line 283), still inside `!collapsed` condition, add:**

```tsx
          {/* Badge */}
          {!collapsed && item.badge != null && item.badge > 0 && (
            <motion.span
              className="anim-badge-pop"
              style={{
                marginLeft: 'auto',
                minWidth: 18,
                height: 18,
                borderRadius: '9px',
                padding: '0 5px',
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                color: 'var(--accent-emerald)',
                fontSize: '0.625rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </motion.span>
          )}
```

**Step 4: In the `Sidebar` function, use `useSidebarStats` and pass badge to Agents nav item:**

After `const { collapsed, toggle } = useSidebar()`, add:
```tsx
  const { activeCount } = useSidebarStats()
```

Then in the `persistentNavItems.map()` call, pass badge when rendering the Agents item:
```tsx
          {persistentNavItems.map((item) => (
            <motion.div key={item.href} ...>
              <NavItem
                item={item.href === '/agents' ? { ...item, badge: activeCount } : item}
                collapsed={collapsed}
              />
            </motion.div>
          ))}
```

**Step 5: Add plan tier chip to the profile card. After the "Your Company" company name div, add the plan display (already has `plan` state in the sidebar? No — sidebar doesn't fetch plan. Add it.**

After `const [avatarUrl, setAvatarUrl] = useState<string | null>(null)`, add:
```tsx
  const [plan, setPlan] = useState<string>('')
```

In the `fetchUser` function, after fetching profile, add:
```tsx
          if (profile?.plan) setPlan(profile.plan as string)
```

Then in the profile card, after the company name, add:
```tsx
                {plan && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '2px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: plan === 'ultimate' ? 'rgba(251,191,36,0.12)' : plan === 'scale' ? 'rgba(34,211,238,0.1)' : plan === 'growth' ? 'rgba(124,92,252,0.1)' : 'rgba(148,163,184,0.06)',
                      color: plan === 'ultimate' ? 'var(--accent-amber)' : plan === 'scale' ? 'var(--accent-cyan)' : plan === 'growth' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      border: `1px solid ${plan === 'ultimate' ? 'rgba(251,191,36,0.2)' : plan === 'scale' ? 'rgba(34,211,238,0.15)' : plan === 'growth' ? 'rgba(124,92,252,0.15)' : 'rgba(148,163,184,0.08)'}`,
                    }}
                  >
                    {plan}
                  </span>
                )}
```

**Step 6: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```

**Step 7: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/dashboard/sidebar.tsx
git commit -m "feat(sidebar): live agent count badge + plan tier chip"
```

---

## Task 6: Intelligence Page Ticker Tape

Add a Bloomberg-style scrolling metric ticker at the top of the Intelligence page.

**Files:**
- Create: `workely.ai/apps/web/src/components/intelligence/metric-ticker.tsx`
- Modify: `workely.ai/apps/web/src/app/(dashboard)/insights/page.tsx`

**Step 1: Create `metric-ticker.tsx`:**

```tsx
'use client'

import { motion } from 'framer-motion'

interface TickerItem {
  label: string
  value: string
  trend?: 'up' | 'down' | 'flat'
  color?: string
}

interface MetricTickerProps {
  items: TickerItem[]
}

function TickerSegment({ items }: { items: TickerItem[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0 2rem',
            borderRight: '1px solid rgba(148,163,184,0.06)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontSize: '0.625rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: item.color ?? (item.trend === 'up' ? 'var(--accent-emerald)' : item.trend === 'down' ? 'var(--accent-rose)' : 'var(--text-primary)'),
              letterSpacing: '-0.01em',
            }}
          >
            {item.trend === 'up' ? '▲ ' : item.trend === 'down' ? '▼ ' : ''}{item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MetricTicker({ items }: MetricTickerProps) {
  if (items.length === 0) return null

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        background: 'rgba(148,163,184,0.02)',
        border: '1px solid rgba(148,163,184,0.06)',
        borderTop: '1px solid rgba(124,92,252,0.12)',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '1.5rem',
      }}
    >
      {/* Left fade */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(90deg, var(--space-void), transparent)', zIndex: 1, pointerEvents: 'none' }} />
      {/* Right fade */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(-90deg, var(--space-void), transparent)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Scrolling content — duplicate for seamless loop */}
      <div className="anim-ticker" style={{ display: 'flex', alignItems: 'center' }}>
        <TickerSegment items={items} />
        <TickerSegment items={items} />
      </div>
    </div>
  )
}
```

**Step 2: In `insights/page.tsx`, import and add the ticker above the tab navigation.**

Find the imports section and add:
```tsx
import { MetricTicker } from '@/components/intelligence/metric-ticker'
```

Then in the JSX, find the tab navigation section (around the `SIGNAL_TABS` rendering). Above the tabs, add:

```tsx
        {/* Bloomberg Ticker */}
        <MetricTicker
          items={[
            { label: 'Revenue Signal', value: revenueInfluence?.totalInfluence != null ? `$${revenueInfluence.totalInfluence.toLocaleString()}` : '—', trend: 'up', color: 'var(--accent-emerald)' },
            { label: 'Leads', value: revenueInfluence?.leadsAttributed?.toString() ?? '0', trend: 'up' },
            { label: 'Agent Health', value: healthData?.overallScore != null ? `${Math.round(healthData.overallScore)}%` : '—' },
            { label: 'Active Agents', value: revenueInfluence?.agentsContributing?.toString() ?? '—', color: 'var(--accent-primary)' },
            { label: 'Experiments', value: experiments?.length?.toString() ?? '0' },
            { label: 'Benchmarks', value: benchmarks ? 'Available' : '—' },
          ]}
        />
```

Note: the exact variable names (`revenueInfluence`, `healthData`, etc.) must match what's in `insights/page.tsx`. Read the page's state variables first and adapt if needed.

**Step 3: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```

**Step 4: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/intelligence/metric-ticker.tsx apps/web/src/app/(dashboard)/insights/page.tsx
git commit -m "feat(intelligence): Bloomberg-style metric ticker tape"
```

---

## Task 7: Dashboard Background Reactive Enhancement

Upgrade the dashboard background to have a subtle positional glow that moves toward the active nav section.

**Files:**
- Modify: `workely.ai/apps/web/src/components/dashboard/dashboard-background.tsx`

**Step 1: Read the current file first:**
```bash
cat workely.ai/apps/web/src/components/dashboard/dashboard-background.tsx
```

**Step 2: Add a second radial gradient layer that shifts based on pathname. The background should have a purple ambient at top-left for Command, cyan ambient at top-right for Intelligence, emerald accent for Agents:**

Add `'use client'` if not already present, import `usePathname`, then wrap the background in a component that uses the path to select a color position:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const PATH_GLOW: Record<string, { x: string; y: string; color: string }> = {
  '/': { x: '30%', y: '25%', color: 'rgba(124, 92, 252, 0.04)' },
  '/agents': { x: '70%', y: '20%', color: 'rgba(52, 211, 153, 0.035)' },
  '/insights': { x: '60%', y: '30%', color: 'rgba(34, 211, 238, 0.04)' },
  '/integrations': { x: '50%', y: '40%', color: 'rgba(91, 141, 239, 0.035)' },
  '/settings': { x: '40%', y: '50%', color: 'rgba(148, 163, 184, 0.02)' },
}

export function DashboardBackground() {
  const pathname = usePathname()
  const key = Object.keys(PATH_GLOW).find(k => pathname === k || pathname.startsWith(k + '/')) ?? '/'
  const glow = PATH_GLOW[key]

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0, overflow: 'hidden' }}
    >
      {/* Static star field base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 10%, rgba(124,92,252,0.03) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(34,211,238,0.02) 0%, transparent 60%)
          `,
        }}
      />
      {/* Dynamic path-reactive glow */}
      <motion.div
        animate={{ left: glow.x, top: glow.y }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          width: '60vw',
          height: '60vh',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${glow.color} 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}
```

**Step 3: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```

**Step 4: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/dashboard/dashboard-background.tsx
git commit -m "feat(dashboard): reactive background glow shifts with active nav section"
```

---

## Task 8: Final Polish — Header Elevation

Upgrade the dashboard header with a live "system pulse" indicator and tighter visual design.

**Files:**
- Read then modify: `workely.ai/apps/web/src/components/dashboard/header.tsx`

**Step 1: Read the file:**
```bash
cat workely.ai/apps/web/src/components/dashboard/header.tsx
```

**Step 2: Add a pulsing "LIVE" indicator to the right side of the header. In the header's right section, add:**

```tsx
{/* Live indicator */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    background: 'rgba(52, 211, 153, 0.04)',
    border: '1px solid rgba(52, 211, 153, 0.1)',
  }}
>
  <motion.div
    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: 'var(--accent-emerald)',
      boxShadow: '0 0 6px rgba(52,211,153,0.5)',
    }}
  />
  <span
    style={{
      fontSize: '0.625rem',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--accent-emerald)',
    }}
  >
    Live
  </span>
</div>
```

**Step 3: Type-check:**
```bash
cd workely.ai && pnpm --filter web tsc --noEmit 2>&1 | head -30
```

**Step 4: Commit:**
```bash
cd workely.ai && git add apps/web/src/components/dashboard/header.tsx
git commit -m "feat(header): add live system pulse indicator"
```

---

## Verification Checklist

After all tasks complete:

```bash
# Full type-check
cd workely.ai && pnpm --filter web tsc --noEmit

# Build check (catches import errors)
cd workely.ai && pnpm --filter web build 2>&1 | tail -20
```

Visual verify in browser:
- [ ] `/agents` — active agents have emerald orbital ring + glow aura
- [ ] `/` (Command) — vitals bar shows 3 large metrics at top
- [ ] Sidebar — active agent count badge next to "Agents" nav item
- [ ] Sidebar — plan tier chip on profile card
- [ ] `/insights` — ticker tape scrolls at top
- [ ] Background glow shifts when navigating between pages
- [ ] Header has "LIVE" pulsing indicator
