# God-Tier Menu System — Design Document

**Date:** 2026-03-18
**Scope:** Desktop mega menus, Company dropdown, Mobile menu
**Approach:** Cinematic + Strategic (spring physics, glassmorphism, conversion intelligence)

---

## 1. Animation Engine & Physics

### Spring System (replaces all linear/ease transitions)
- Menu open: `spring({ stiffness: 400, damping: 28 })` — snappy but not jarring
- Menu close: `spring({ stiffness: 500, damping: 35 })` — faster exit
- Item stagger: 30ms cascade delay per service item (waterfall reveal)
- Chevron rotation: spring-based flip (bouncy, alive)

### Hover Intent Detection
- 120ms delay before mega menu opens (prevents accidental hover-throughs)
- 250ms grace period before close (cursor can briefly leave without snap-shut)
- Uses `useRef` timers — not state-driven (zero re-renders during hover)

### Staggered Cascade Reveal
- Column headers appear first (0ms), items waterfall at 30ms intervals
- Sidebar slides in from right with 80ms delay after columns start
- Each item: `opacity: 0, y: 8px, filter: blur(4px)` → `opacity: 1, y: 0, blur: 0`

### Glassmorphism
- Mega menu bg: `backdrop-blur-xl` (24px) + semi-transparent seasonal tint
  - Summer: `rgba(10, 42, 26, 0.85)` (dark green glass)
  - Winter: `rgba(15, 23, 42, 0.85)` (slate-blue glass)
  - Fall: `rgba(28, 25, 23, 0.85)` (warm stone glass)
- Inner border: `border border-white/[0.08]`
- Top highlight: `inset 0 1px 0 rgba(255,255,255,0.05)`

### Magnetic CTA Effect
- "Get a Free Quote" button pulls toward cursor within 80px radius
- Max displacement: 3px
- Spring return when cursor leaves
- GPU-accelerated via `transform: translate()`

---

## 2. Desktop Mega Menu Redesign

### Layout (920px → 960px)
- 3 service columns + upgraded sidebar (wider, richer)
- Top bar: seasonal gradient + animated shimmer sweep on open
- Bottom bar: subtle gradient fade with "Licensed & Insured · Dane County" micro-text

### Service Item Hover Micro-interactions
- Background: smooth gradient slide-in from left
- Icon: spring scale `1.0 → 1.15` + color shift to seasonal accent
- Text: `white/70 → white` with 0.5px letter-spacing expansion
- Arrow indicator: fades in from right (`opacity: 0, x: -4` → `opacity: 1, x: 0`)
- Related services: sibling items get soft pulse glow on icons

### Inline Social Proof
- Below column headers: `★ 4.9 · 500+ properties` in `text-white/30`
- Seasonal services: urgency badge `"Booking Now"` with animated pulse dot
- Static text, zero performance cost

### Sidebar Upgrade
- Before/after thumbnail (120x80px) on service hover
- Falls back to trust badges when no service hovered
- CTA: shimmer sweep on hover + spring scale
- CTA href: `/contact?service=[slug]` (pre-fills form)
- Phone number: `"Or call (608) 535-6057"` with tap-to-call
- Micro-copy: `"Same-day quotes available"`

### Company Dropdown Upgrade
- 400px panel, 2 columns
- Left: page links with icons + descriptions
- Right: mini "About TotalGuard" card with rating badge + "Call Us" CTA
- Same glassmorphism + stagger animation

---

## 3. Mobile Menu Overhaul

### Opening Animation
- Backdrop: 200ms fade + `backdrop-blur-sm` (frosted, not flat black)
- Menu: bottom sheet with spring physics
- Snap points: 85% (default), 100% (full), 0% (closed)
- Drag handle: 40px pill, `bg-white/20`, grabbable
- Swipe down to close with velocity detection

### Header
- Logo (small) + phone icon + close X
- Seasonal accent line below

### Quick Actions Grid (replaces "Quick Picks")
- 2x2 large tap targets
- Icon + service name + micro-description
- Seasonal "Booking Now" pulse badges
- Glassmorphism cards: `backdrop-blur-md bg-white/[0.06] border border-white/[0.08]`

### Animated Sections (replaces instant accordion)
- Framer Motion `layout` prop for smooth height animation
- Items stagger at 25ms intervals
- Active category: accent-colored left border
- Auto-collapse siblings (one open at a time)

### Persistent Bottom Bar
- 2 buttons: "Get My Free Quote" (60%, shimmer) + "Call Now" (40%, tap-to-call)
- Trust signal: `"⚡ Average response: 12 min"`
- Gradient fade background (seamless)

### Swipe Gestures
- Horizontal swipe on service item → reveals "Get Quote for [Service]"
- Vertical swipe on panel → close menu
- Uses `onPan` from Framer Motion

---

## 4. Conversion Intelligence & Trust Signals

### Contextual CTA Pre-fill
- All service CTAs → `/contact?service=[slug]`
- Contact page reads `searchParams.service`, pre-selects service
- Mobile quick-action swipe → same pattern

### Urgency Signals (seasonal services only)
- Pulse dot + "Booking Now" badge on seasonal services
- Sidebar: "Limited spring availability — book this week" on hover
- Hard-coded seasonal strings via `activeSeason` — not fake scarcity

### Inline Social Proof
- Column headers: `★ 4.9 · 500+ served`
- Mobile quick-action cards: `"Most requested"` tag
- Company dropdown: star rating + review count
- Sidebar: animated border-beam on "Licensed & Insured" badge

### Phone Number Strategy
- Desktop: nav bar (current) + mega menu sidebar
- Mobile: header tap-to-call + bottom bar "Call Now"
- Both: `tel:` link with click tracking data attribute

### Smart Seasonal Awareness
- Summer: mowing/fertilization get "Popular" tags, snow hidden
- Winter: snow gets "Booking Now", mowing shows "Pre-book for spring"
- Fall: cleanup services get urgency badges
- Driven by `activeSeason` context — zero new API calls

---

## 5. Accessibility & Keyboard Navigation

### ARIA Attributes
- Triggers: `aria-expanded` + `aria-controls`
- Panels: `role="region"` + `aria-labelledby`
- Service links: `role="menuitem"`
- Mobile menu: `role="dialog"` + `aria-modal="true"`

### Keyboard Navigation
- `Tab` focuses triggers in sequence
- `Enter/Space/ArrowDown` opens menu, focuses first item
- `ArrowDown/Up` navigates within column
- `ArrowRight/Left` moves between columns
- `Escape` closes, returns focus to trigger
- `Home/End` jumps to first/last item
- Single `onKeyDown` handler on menu container

### Focus Management
- Focus trap in open mega menu + mobile menu
- Visible focus ring: `ring-2 ring-white/30 ring-offset-2`
- On close: focus returns to trigger button

### Reduced Motion
- `prefers-reduced-motion: reduce` disables springs, particles, shimmer
- Menus: instant opacity toggle, no transforms
- Stagger disabled — all items appear simultaneously
- Magnetic CTA disabled

### Screen Reader
- `aria-live="polite"` announces menu open + item count

---

## Files Affected

- `src/components/Navigation.tsx` — mega menu + company dropdown + animation engine
- `src/components/MobileNavMenu.tsx` — full rewrite with bottom sheet + gestures
- `src/components/ui/MagneticButton.tsx` — new, reusable magnetic cursor component
- `src/hooks/useHoverIntent.ts` — new, hover delay + forgiveness zone logic
- `src/hooks/useMagneticCursor.ts` — new, cursor attraction physics
- `tailwind.config.ts` — new animation keyframes if needed
