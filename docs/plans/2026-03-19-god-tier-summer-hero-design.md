# God-Tier Summer Hero Redesign

**Date**: 2026-03-19
**Scope**: SummerHero.tsx — complete animation overhaul + living mower character
**Goal**: Make the hero section genuinely undevelopable by competitors — unique, alive, and conversion-optimized

---

## 1. Living Mower Character

### Visual Style
- **Art direction**: Duolingo/Headspace quality — rounded, warm, dimensional SVG
- **NOT a sketch** — gradient fills, drop shadows, highlight/shading layers, 3D volume
- **Character**: Friendly lawn care guy with hard hat, green TotalGuard shirt, chunky boots
- **Push mower**: Detailed with spinning blade disc, rotating wheels, engine vibration

### Micro-Animations (all simultaneous — 12 principles of animation applied)
- **Breathing**: Torso scale pulse 1.0→1.015→1.0 (3s loop)
- **Head bob**: Tiny Y oscillation synced to walk cycle
- **Blinking**: Eyes close 150ms every 4-5 seconds
- **Weight shift**: Body tilts forward on each step (pushing effort)
- **Walk cycle**: 4-frame arm/leg alternation via CSS keyframes
- **Mower vibration**: Rapid 0.5px shake on mower body
- **Wheel rotation**: Continuous spin synced to movement speed
- **Grass clippings**: Small particles spray up behind blade in an arc

### Wave Action
- Every ~8 seconds: shoulder rotation, hand opens palm-forward, fingers spread
- Head turns toward viewer during wave
- Mouth curves into bigger smile
- Returns to mowing with a satisfied nod

### Movement
- Traverses full viewport width L→R over ~20 seconds
- Loops infinitely (resets to left edge after exiting right)
- Positioned at very bottom of hero section
- z-index: above grass blades, below main content
- Behind character: clip-path reveal of "freshly cut" darker grass trail

---

## 2. Animated Grass Edge

- 30-40 individual SVG grass blades at hero's bottom edge
- Varying heights (20-45px), slight width variation
- Gradient fill: lighter green tip, darker base
- **Wind sway**: Sine-wave oscillation with randomized phase offsets (no sync)
- **Cut interaction**: When mower passes, blades shrink to ~8px with spring animation
- Small clipping particles fly up at the cut moment
- **Regrowth**: After character loops back, cut blades spring back up over ~3s

---

## 3. Mouse-Reactive Parallax

### Depth Layers (react to cursor, 5-15px shift range)
| Layer | Content | Movement |
|-------|---------|----------|
| 1 (deepest) | Background gradient/image | 3-5px opposite cursor |
| 2 | Ambient orbs | 8-10px opposite cursor |
| 3 | Particles/sparkles | 12-15px opposite cursor |
| 4 (content) | Text, CTAs | Static (readable) |

- Disabled on mobile (static fallback)
- Uses `requestAnimationFrame` with lerp smoothing for buttery 60fps

### Hero Image 3D Tilt
- `perspective(1000px)` container
- `rotateX/rotateY` follows cursor relative to card center (max +/-8deg)
- Glare/shine SVG overlay shifts with tilt angle
- Springs back to flat on mouse leave (600ms spring)

---

## 4. Text Choreography

### Headline ("Tired of Lawn Guys Who Don't Show Up?")
- Word-by-word reveal: `opacity 0→1`, `blur(8px)→0`, `y: 12→0`
- 120ms stagger between words
- Accent phrase ("Don't Show Up?") lands last with scale pop 1.05→1.0
- After reveal: accent words get persistent shimmer animation

### Subheadline
- Single smooth blur-fade, 400ms after headline completes

### Value Props List
- Each item slides in from left with stagger
- CheckCircle2 icon pops with scale bounce (0.5→1.0 with overshoot spring)

---

## 5. Magnetic CTA Buttons

- Within 120px radius: button shifts toward cursor (max 8px displacement)
- Calculated via `atan2` for natural directional pull
- **Hover**: glow intensifies, scale 1.03, shadow expands
- **Click**: scale 0.97→1.0 (tactile press feel)
- **Primary CTA**: persistent shimmer sweep (4s loop) + pulse glow
- Springs back to center on mouse leave

---

## 6. Scroll-Driven Exit

As user scrolls past hero (0-300px scroll range):
- Content: opacity 1→0, scale 1→0.95, translateY 0→-30px
- Background parallax accelerates slightly
- Mower character + grass stay visible 50px longer (fun "last thing you see")
- Uses `useScroll` + `useTransform` from framer-motion (no scroll event listeners)

---

## Architecture

### New Files
- `src/components/home/MowerCharacter.tsx` — SVG character + all animations
- `src/components/home/GrassEdge.tsx` — animated grass blade strip
- `src/components/home/MagneticButton.tsx` — cursor-attracted button wrapper
- `src/hooks/useMouseParallax.ts` — mouse position tracking + lerped transforms

### Modified Files
- `src/components/SummerHero.tsx` — integrate all new systems, text choreography, scroll exit
- `src/app/globals.css` — new keyframes (walk-cycle, grass-sway, mower-vibrate, blink)

### Performance Guardrails
- All character animations: CSS keyframes (GPU-composited, no JS per-frame)
- Mouse parallax: `requestAnimationFrame` with lerp, NOT raw mousemove
- Grass blades: `will-change: transform` on animated elements
- Mobile: character still walks but no mouse parallax, no 3D tilt
- `prefers-reduced-motion`: character static, no parallax, simple fade-in only

---

## What Makes This Undevelopable By Others

| Element | Why unique |
|---------|-----------|
| Living mower character | Hand-crafted SVG with 12-principle animation — no library, no template |
| Grass blade interaction | Blades cut as character passes, regrow on loop — pure custom physics |
| Mouse-reactive parallax | 4-layer depth system with 3D tilt card + glare overlay |
| Word-by-word blur reveal | Cinematic text choreography, not basic fade-in |
| Magnetic CTAs | Physics-based cursor attraction with tactile press feedback |
| Scroll exit choreography | Cinematic fade with character lingering — delightful detail |
| All combined | No lawn care site on earth has anything remotely close to this |
