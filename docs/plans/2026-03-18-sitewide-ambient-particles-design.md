# Sitewide Ambient Particles — Design

**Date**: 2026-03-18
**Status**: Approved

## Problem

AmbientParticles exist only in hero sections of individual pages. The rest of each page is a flat `#052e16` void, creating visual inconsistency with the footer/header which have animated dot patterns.

## Solution

One `fixed` particle layer at the root layout covering the entire viewport. Remove all per-page sparse instances to avoid double-layering.

## Architecture

### Approach C: Layout-level particles (selected)

1. **Create** `SiteAmbientParticles.tsx` — thin client wrapper rendering `<AmbientParticles density="sparse" />` inside a `fixed inset-0 z-[1]` container
2. **Add to** root `layout.tsx` — renders after `<Providers>`, every page gets particles automatically
3. **Remove** ~30 per-page `<AmbientParticles density="sparse" />` from individual content files
4. **Keep** Footer `dense` particles (localized density boost)
5. **Keep** CTASection `dense` particles (attention-drawing at decision points)
6. **Keep** BeforeAfterGallery + ComparisonTable `sparse` (overflow-hidden containers, no conflict)

### Why `fixed` positioning

- Particles float as an ambient atmospheric layer behind content
- Content scrolls over the particle field naturally
- No need for per-page `position: relative` wrappers
- Dots are subtle enough that fixed vs scrolling is imperceptible

### Performance

- Sparse density: 2 orbs + 12 dots + 8 sparkles = 22 DOM elements total
- Pure CSS animations (no JS loop)
- `motion-reduce` respected
- Orbs hidden on mobile, dots hidden on small screens

## Files to modify

- **Create**: `src/components/SiteAmbientParticles.tsx`
- **Edit**: `src/app/layout.tsx` (add import + render)
- **Edit ~30 files**: Remove per-page `<AmbientParticles density="sparse" />` imports and usages
- **Do NOT touch**: Footer.tsx, CTASection.tsx, BeforeAfterGallery.tsx, ComparisonTable.tsx
