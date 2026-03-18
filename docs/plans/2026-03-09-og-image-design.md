# TotalGuard OG Image Redesign — Design Doc

**Date**: 2026-03-09
**Status**: Approved

## Problem
Current OG image is a generic stock lawn photo with dark green banners. Looks like a $5 Canva template. Zero brand differentiation. Not converting when shared on social/messaging.

## Direction
Premium & Trustworthy — dark, sophisticated, luxury service brand energy. No photos. Symbols + dark gradient background.

## Spec

### Dimensions
- 1200x630px (standard OG)
- Format: PNG (sharper for text-heavy images)
- Target: under 300KB

### Background
- Deep dark gradient: `#0a0a0f` → `#111118`
- Subtle radial glow in emerald `#10b981` at ~8% opacity from center
- Premium, not "lawn care green"

### Lawn Care Symbols
- Subtle line-art icons at ~15% opacity
- Leaf, grass blades, water droplet, rake, pruning shears
- Architectural blueprint style, not clipart
- Create texture without competing with text

### Layout (centered, top to bottom)
1. **Brand name**: "TOTALGUARD" — geometric sans, tracked wide, white `#f0f0f5`, bold
   - "YARD CARE" underneath — lighter weight, slightly smaller
2. **Thin horizontal divider** — emerald accent `#10b981`
3. **Tagline**: "Premium Lawn Care & Landscaping" — light weight, `#8888a0`
4. **Proof badge**: "★ 4.9 · 127+ Reviews · Madison, WI" — small, crisp, star in emerald/gold

### Typography
- Clean geometric sans (e.g., Inter/Geist family for rendering)
- Wide letter-spacing on brand name
- Weight contrast: bold brand name vs light tagline

### Feel
- "If Aesop did lawn care"
- Dark, confident, minimal
- Pattern interrupt vs every other lawn company's stock photo + green banners

## Files
- Replace: `tgyardcare/public/og-image.jpg` → `og-image.png`
- Update: `tgyardcare/src/app/layout.tsx` metadata references
