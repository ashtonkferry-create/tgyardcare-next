# Nebula Design System — Workely.AI

Use this skill when building any UI component, page, or visual element for workely.ai. The Nebula theme is a space-inspired HUD aesthetic.

## Fonts
- **Display**: Orbitron (headings, titles, stat labels)
- **Body**: Exo 2 (paragraphs, descriptions, form labels)
- Load via `next/font/google` — already configured in the app layout

## CSS Variables (defined in globals.css)
```css
--nebula-cyan: #00f0ff
--nebula-purple: #a855f7
--star-white: #f0f0ff
--text-dim: #6b7280
--space-void: #0a0a1a
--status-green: #22c55e
--alert-red: #ef4444
```

## Core Components (at `src/components/space/`)
- **SpaceFrame**: Main page wrapper with animated star field background
- **GlowButton**: Primary action button with cyan/purple glow pulse
- **HUDPanel**: Card/panel with HUD-style border lines and corner accents
- **OrbitalLoader**: Animated loading spinner with orbiting particles
- **AnimatedText**: Text reveal with typewriter or fade-in effects

## Animation Patterns
- **Glow effects**: `box-shadow: 0 0 20px rgba(0, 240, 255, 0.3)` on hover
- **Gradient borders**: `border-image: linear-gradient(135deg, var(--nebula-cyan), var(--nebula-purple)) 1`
- **Framer Motion**: Use `motion.div` with `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- **Stagger children**: 50-100ms delay between sibling elements
- **Hover lifts**: `translateY(-4px)` + increased glow on cards

## Page Template
Every dashboard page follows this structure:
```tsx
<SpaceFrame>
  <header>
    <AnimatedText>{PAGE_TITLE}</AnimatedText>
    <p className="text-dim">{SUBTITLE}</p>
    <GlowButton>{PRIMARY_ACTION}</GlowButton>
  </header>
  <main>
    <HUDPanel>{CONTENT_SECTION}</HUDPanel>
    {/* Repeat HUDPanel for each section */}
  </main>
</SpaceFrame>
```

## Color Usage
- Backgrounds: `--space-void` (#0a0a1a) base, slight purple tint for elevated surfaces
- Primary text: `--star-white` (#f0f0ff)
- Secondary text: `--text-dim` (#6b7280)
- Accent/interactive: `--nebula-cyan` (#00f0ff)
- Highlights/badges: `--nebula-purple` (#a855f7)
- Success states: `--status-green` (#22c55e)
- Error/danger: `--alert-red` (#ef4444)

## Do NOT
- Use flat white or light gray backgrounds
- Use system fonts or non-Nebula font families
- Create components without glow/gradient effects
- Skip Framer Motion animations on interactive elements
