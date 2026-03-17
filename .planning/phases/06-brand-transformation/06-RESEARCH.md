# Phase 6: Brand Transformation & Visual Impact - Research

**Researched:** 2026-03-16
**Domain:** Next.js Server Component conversion, before/after gallery, hero redesign, image optimization
**Confidence:** HIGH

## Summary

Phase 6 involves three major work streams: (1) converting the 546-line `HomeContent.tsx` client component into a server-rendered page with client islands, (2) building a new before/after transformation gallery page at `/gallery` or `/transformations` with interactive comparison sliders, and (3) redesigning the homepage hero to be a high-impact static image with parallax/motion effects.

The codebase currently uses Next.js 16.1.6 + React 19.2.3 + Framer Motion 12.34.3. The homepage is entirely client-rendered via a single `'use client'` component that includes all sections inline. Every sub-component used in HomeContent (Navigation, Footer, CTASection, GoogleReviewsSection, etc.) also carries `'use client'` directives, meaning the server component conversion must work top-down while leaving these existing client components as islands.

**Primary recommendation:** Convert `page.tsx` into a Server Component that imports client islands directly. Use `react-compare-slider` for the before/after comparison widget (or build a lightweight custom slider to avoid dependency risk with React 19). Use `next/dynamic` with `ssr: false` for heavy client-only components like the seasonal carousel and chatbot.

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 16.1.6 | Framework, SSR, Image optimization | Installed |
| React | 19.2.3 | UI framework | Installed |
| Framer Motion | 12.34.3 | Animations, scroll reveals | Installed |
| next/image | built-in | Image optimization, WebP/AVIF, srcSet | Installed |
| embla-carousel-react | 8.6.0 | Carousel (services section) | Installed |
| Clash Display + General Sans | local fonts | Typography via next/font/local | Installed (Phase 5) |

### New (to add)
| Library | Purpose | When to Use | Recommendation |
|---------|---------|-------------|----------------|
| react-compare-slider | Before/after image comparison | Gallery slider widget | MEDIUM confidence -- last published 2 years ago, React 19 compat unverified. **Recommendation: build a custom slider** (see Code Examples below). The interaction is simple enough (pointer/touch drag on a divider) that a custom ~80-line component avoids dependency risk. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-compare-slider | img-comparison-slider (web component) | Framework-agnostic, <4KB gzipped, but web component interop adds complexity in Next.js SSR |
| react-compare-slider | Custom slider (~80 lines) | Zero dependency risk, full control, trivially SSR-safe as a client island |
| Framer Motion scroll | CSS scroll-driven animations | Better perf but limited browser support; stick with Framer Motion for consistency |

## Architecture Patterns

### Current Homepage Structure (HomeContent.tsx, 546 lines)
```
page.tsx (Server Component with metadata)
  -> HomeContent.tsx ('use client', single monolith)
       -> ScrollProgress
       -> WebPageSchema
       -> Navigation (showPromoBanner)
       -> sr-only Business Summary
       -> Season-aware Hero (WinterHero | SummerHero | FallHero)
       -> Stats Strip (trust stats with motion.div)
       -> Priority Services (seasonal conditional)
       -> WhyMadisonTrust
       -> Services Section (carousel, badges, links)
       -> FullSeasonContract
       -> Before/After Preview Section
       -> SectionDivider
       -> GoogleReviewsSection
       -> ComparisonTable
       -> Service Standard Section
       -> How It Works (ProcessTimeline)
       -> Latest Blog Posts
       -> CTASection
       -> Footer
```

### Target Architecture (Server Component with Client Islands)
```
page.tsx (Server Component - NO 'use client')
  -> WebPageSchema (already works as Server Component - no 'use client')
  -> Navigation (client island - has interactive menu)
  -> sr-only Business Summary (pure HTML - server)
  -> <HeroSection /> (client island - needs SeasonalTheme + animations)
  -> <StatsStrip /> (client island - uses motion.div scroll reveal)
  -> <SeasonalServicesSection /> (client island - needs SeasonalTheme)
  -> <WhyMadisonTrust /> (client island - has animations)
  -> <ServicesCarousel /> (client island - carousel state + drag)
  -> <FullSeasonContract /> (client island)
  -> <BeforeAfterPreview /> (server or client - depends on animation needs)
  -> <GoogleReviewsSection /> (client island - fetches reviews)
  -> <ComparisonTable /> (client island - has interactions)
  -> <ServiceStandard /> (client island - motion animations)
  -> <HowItWorks /> (client island)
  -> <LatestBlogPosts /> (client island - data fetch)
  -> <CTASection /> (client island)
  -> <Footer /> (client island)
```

### Key Insight: Most Components Are Already Client Islands

Every sub-component already has `'use client'` at the top. The conversion is primarily about:
1. Removing `'use client'` from the top-level HomeContent (or replacing it with a new server page.tsx)
2. Extracting the **inline sections** (stats strip, services carousel, before/after preview, service standard) into their own client component files
3. Moving the `useSeasonalTheme()` call out of the page level

### Pattern 1: Server Component Page with Imported Client Islands
**What:** page.tsx becomes a Server Component that imports client components
**When to use:** This exact conversion

```typescript
// src/app/page.tsx (Server Component - NO 'use client')
import { Metadata } from 'next';
import { Suspense } from 'react';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsStrip } from '@/components/home/StatsStrip';
// ... more imports

export const metadata: Metadata = { /* ... */ };

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <WebPageSchema name="TotalGuard Yard Care" description="..." url="/" />
      <Navigation showPromoBanner />

      {/* sr-only section is pure HTML - renders on server */}
      <section className="sr-only" aria-label="Business Summary">
        <p>TotalGuard Yard Care provides...</p>
      </section>

      <HeroSection />
      <StatsStrip />
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <SeasonalServicesSection />
      </Suspense>
      {/* ... */}
    </div>
  );
}
```

### Pattern 2: SeasonalTheme in Client Islands (Not Page Level)
**What:** Each client component that needs seasonal data calls `useSeasonalTheme()` internally
**Why:** The `SeasonalThemeProvider` wraps children in `Providers.tsx` (layout level). Client islands inside a server page can still consume it because they're rendered inside the provider tree.

```typescript
// src/components/home/HeroSection.tsx
'use client';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { WinterHero } from '@/components/WinterHero';
import { SummerHero } from '@/components/SummerHero';
import { FallHero } from '@/components/FallHero';

export function HeroSection() {
  const { activeSeason } = useSeasonalTheme();
  return (
    <>
      {activeSeason === 'winter' && <WinterHero />}
      {activeSeason === 'summer' && <SummerHero />}
      {activeSeason === 'fall' && <FallHero />}
    </>
  );
}
```

### Pattern 3: Suspense + dynamic() for Heavy Client Islands
**What:** Use `next/dynamic` for components that are heavy and not needed immediately
**When to use:** Chatbot, seasonal carousel with lots of data

```typescript
import dynamic from 'next/dynamic';

const SeasonalCarousel = dynamic(
  () => import('@/components/home/SeasonalServicesSection'),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-muted rounded-xl" />
  }
);
```

### Recommended File Structure for Extracted Components
```
src/components/home/
  HeroSection.tsx          # Seasonal hero switcher (client)
  StatsStrip.tsx           # Trust stats with counters (client)
  SeasonalServicesSection.tsx  # Priority services conditional (client)
  ServicesCarousel.tsx     # Services grid with carousel (client)
  BeforeAfterPreview.tsx   # Homepage BA teaser (could be server)
  ServiceStandard.tsx      # TotalGuard standard section (client)
  HowItWorks.tsx           # Process timeline wrapper (client)
src/app/transformations/
  page.tsx                 # Gallery page (server metadata + client content)
  TransformationsContent.tsx  # Gallery with sliders (client)
src/components/gallery/
  ComparisonSlider.tsx     # Before/after draggable slider (client)
```

### Anti-Patterns to Avoid
- **Wrapping the entire page in a single client boundary:** This is the current state. The goal is to push `'use client'` down to leaf components.
- **Passing functions as props from server to client:** Server Components cannot pass event handlers. Each client island must be self-contained.
- **Using `useSeasonalTheme()` at the page level:** Move it into individual client islands that need it.
- **Importing Framer Motion in Server Components:** `motion.div` requires `'use client'`. Any component using Framer Motion must be a client component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom srcSet logic | `next/image` with `sizes` prop | Handles WebP/AVIF, responsive, lazy loading, blur placeholder |
| Scroll animations | Custom IntersectionObserver | Existing `useScrollReveal` hook (uses Framer Motion `useInView`) | Already built, tested, consistent |
| Lightbox | Custom modal with image viewer | Existing `ImageLightbox` component | Already handles keyboard nav, swipe, overlay |
| JSON-LD schemas | Manual JSON construction | Existing `schema-factory.ts` + schema components | 15 schema components already built |
| Carousel | Custom scroll snapping | Existing embla-carousel setup | Already configured with touch/drag |

**Key insight:** The codebase already has most UI primitives built. This phase is primarily about restructuring (server/client split) and adding the comparison slider + new hero.

## Common Pitfalls

### Pitfall 1: Breaking JSON-LD Schema Output During Conversion
**What goes wrong:** Moving components around changes which schemas render on the homepage, breaking SEO.
**Why it happens:** Schema components are scattered across the tree. Some are in `layout.tsx` (GlobalSchema, NavigationSchema, AutoSchema), some in page content (WebPageSchema).
**How to avoid:** Capture the complete JSON-LD output BEFORE conversion (curl the page, extract all `<script type="application/ld+json">` tags). After conversion, compare byte-for-byte.
**Warning signs:** Missing or duplicated schema scripts in the HTML source.

**Current schema inventory for homepage:**
1. `GlobalSchema` in layout.tsx -> Organization, LocalBusiness, WebSite (3 scripts)
2. `NavigationSchema` in layout.tsx -> SiteNavigationElement (1 script)
3. `AutoSchema` in layout.tsx body -> WebPage + BreadcrumbList for current path (2 scripts, CLIENT)
4. `WebPageSchema` in HomeContent -> WebPage for homepage (1 script)
Total: 7 JSON-LD script tags on homepage. Note: The "16 schema components" in requirements refers to 15 schema *files* in `/components/schemas/` + GlobalSchema -- most are used on OTHER pages, not the homepage.

### Pitfall 2: SeasonalThemeProvider Hydration Mismatch
**What goes wrong:** Server renders default season, client renders different season after Supabase fetch, causing hydration error.
**Why it happens:** SeasonalThemeProvider fetches from Supabase on mount, which means initial render uses fallback data.
**How to avoid:** This already works because SeasonalThemeProvider is inside `Providers.tsx` which is `'use client'`. The entire provider tree is client-rendered. The server component page will SSR the static HTML shell, and client islands hydrate with seasonal data. No change needed.
**Warning signs:** Flash of wrong season content on load.

### Pitfall 3: TypeScript Error Budget Exceeded
**What goes wrong:** New components or refactored imports push TS errors above 85.
**Why it happens:** Current count is 84. Only 1 error of headroom.
**How to avoid:** Run `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l` after every file change. Type all new components strictly. Don't introduce `any`.
**Warning signs:** Build warnings in Vercel deployment.

### Pitfall 4: Inline Sections Losing State When Extracted
**What goes wrong:** The services carousel loses its current slide position or scroll state during extraction.
**Why it happens:** Carousel state (carouselApi, current slide) is managed inline in HomeContent. When extracting to a new component, the state must move with it.
**How to avoid:** Each extracted component must be fully self-contained with its own state. The carousel section should contain its own `useState` for the API and current index.

### Pitfall 5: Static Image Imports in Server Components
**What goes wrong:** `import heroImage from '@/assets/hero.jpg'` works differently in server vs client components.
**Why it happens:** Next.js handles static imports in both contexts, but the resolved object shape may differ.
**How to avoid:** Static image imports work fine in both server and client components in Next.js. The `next/image` component accepts them in either context. No special handling needed.

### Pitfall 6: Lighthouse Score Regression from Large Images
**What goes wrong:** Hero image or gallery images tank LCP and overall performance score.
**Why it happens:** Large unoptimized images without proper `sizes`, `priority`, or format hints.
**How to avoid:** Hero image: use `priority` prop, explicit `sizes="100vw"`, ensure WebP source. Gallery images: use responsive `sizes`, lazy loading (default), blur placeholders via `placeholder="blur"` for static imports.

## Code Examples

### Custom Before/After Comparison Slider (Recommended)
```typescript
// src/components/gallery/ComparisonSlider.tsx
'use client';

import Image from 'next/image';
import { useRef, useState, useCallback } from 'react';

interface ComparisonSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  neighborhood?: string;
}

export function ComparisonSlider({
  beforeSrc, afterSrc, beforeAlt, afterAlt, neighborhood
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-white/10
                 cursor-col-resize select-none touch-none aspect-[4/3]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After image (full width, below) */}
      <Image src={afterSrc} alt={afterAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />

      {/* Before image (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeSrc} alt={beforeAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-10 h-10 rounded-full bg-white shadow-xl flex items-center
                        justify-center text-gray-700">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L3 10L7 16M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">Before</div>
      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">After</div>

      {/* Neighborhood label */}
      {neighborhood && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
          {neighborhood}
        </div>
      )}
    </div>
  );
}
```

### Server Component Page Structure
```typescript
// src/app/page.tsx (after conversion)
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsStrip } from '@/components/home/StatsStrip';
// ... etc

export const metadata: Metadata = { /* existing metadata */ };

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <WebPageSchema name="TotalGuard Yard Care" description="..." url="/" />
      <Navigation showPromoBanner />

      <section className="sr-only" aria-label="Business Summary">
        <p>TotalGuard Yard Care provides...</p>
      </section>

      <HeroSection />
      <StatsStrip />
      {/* Each imported component is already 'use client' */}
      <SeasonalPrioritySection />
      <WhyMadisonTrust />
      <ServicesSection />
      <FullSeasonContract />
      <BeforeAfterPreview />
      <GoogleReviewsSection />
      <ComparisonTable />
      <ServiceStandard />
      <HowItWorksSection />
      <LatestBlogPostsSection />
      <CTASection />
      <Footer showCloser={false} />
    </div>
  );
}
```

### Hero with Parallax (Static Image, Video-Ready Structure)
```typescript
// src/components/home/HeroSection.tsx
'use client';

import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { WinterHero } from '@/components/WinterHero';
import { SummerHero } from '@/components/SummerHero';
import { FallHero } from '@/components/FallHero';

export function HeroSection() {
  const { activeSeason } = useSeasonalTheme();

  if (activeSeason === 'winter') return <WinterHero />;
  if (activeSeason === 'fall') return <FallHero />;
  return <SummerHero />;
}
```

Note: The existing hero components (SummerHero, FallHero, WinterHero) already have rich animations. The Phase 6 hero work is about enhancing SummerHero (the primary/default hero) with parallax effects and ensuring the image slot is structured for future video replacement.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `'use client'` page component | Server Component page + client islands | Next.js 13+ App Router (stable) | 50-70% less First Load JS |
| `react-compare-slider` library | Custom slider with Pointer Events API | 2024+ | Zero dependencies, full React 19 compat |
| `framer-motion` package name | `motion` (rebranded) | 2024 (v11+) | Both `framer-motion` and `motion/react` work; project uses `framer-motion` v12, keep it |
| CSS-based lazy loading | `next/image` with automatic AVIF/WebP | Next.js 13+ | Automatic format negotiation, blur placeholders |

**Note on Framer Motion:** The project uses `framer-motion@12.34.3`. The package was rebranded to `motion` but the `framer-motion` npm package still works and is actively updated. No migration needed.

## Image Optimization Strategy (Claude's Discretion)

**Recommendation: Static JSON for before/after photo data, with next/image optimization.**

### Why Static JSON (not Supabase table)
- Before/after photos are content that changes rarely (monthly at most)
- Static imports enable blur placeholders automatically
- No loading state needed -- data is available at build time
- Supabase table adds unnecessary complexity for < 50 image pairs
- Can always migrate to Supabase later if the gallery grows significantly

### Image Format Strategy
- **Hero image:** Use existing `.jpg` static imports. `next/image` automatically serves WebP/AVIF based on browser support. Use `priority` prop for LCP.
- **Gallery images:** Use static imports for blur placeholders. Set `sizes="(max-width: 768px) 100vw, 50vw"` for 2-column layout.
- **Before/after pairs:** Store as separate before/after images (not combined). The comparison slider needs two distinct image sources.

### Recommended Data Structure
```typescript
// src/lib/transformationData.ts
export interface TransformationPair {
  id: string;
  beforeSrc: StaticImageData | string;
  afterSrc: StaticImageData | string;
  service: 'mowing' | 'leaf-cleanup' | 'snow-removal' | 'hardscaping' | 'gutter-cleaning';
  neighborhood: string;  // "Middleton" | "Waunakee" | "West Side Madison"
  description?: string;
}

export const transformations: TransformationPair[] = [
  // Placeholder pairs -- swap with real photos as available
];
```

## Seasonal Carousel Handling (Claude's Discretion)

**Recommendation: Keep as regular client import, not dynamic/lazy.**

The seasonal carousel (services carousel in the services section) is above the fold on most viewports and critical for user engagement. Using `next/dynamic` with `ssr: false` would cause a visible layout shift. Instead:

- Import it normally as a client component
- Wrap with `<Suspense>` only if it fetches data asynchronously
- The carousel already works as a client island -- no special handling needed

For the chatbot widget, `next/dynamic` with `ssr: false` IS appropriate since it's non-critical and heavy.

## Loading Skeleton Designs (Claude's Discretion)

For Suspense fallbacks on client islands:

```typescript
// Minimal pulse skeletons matching section dimensions
<div className="h-[500px] animate-pulse bg-muted/20 rounded-xl" />  // Hero
<div className="h-24 animate-pulse bg-muted/10" />                    // Stats strip
<div className="h-96 animate-pulse bg-muted/20 rounded-xl" />        // Services
```

Keep skeletons simple -- just height + pulse animation matching the section's approximate height. Over-designed skeletons create more maintenance burden than value.

## Open Questions

1. **Exact number of before/after photo pairs available**
   - What we know: `public/lovable-uploads/` has `mowing-ba-1.png`, `mowing-ba-2.png`, `mowing-ba-3.png` (before/after combined images)
   - What's unclear: Whether separate before/after images exist, or if all are combined into single images
   - Recommendation: Start with the 3 existing BA images using combined display (no slider needed for combined). Build the slider infrastructure for when separate image pairs are provided.

2. **Spring hero variant**
   - What we know: Current code has SummerHero, FallHero, WinterHero -- no explicit SpringHero (spring maps to summer)
   - What's unclear: Whether a separate spring hero design is desired
   - Recommendation: Keep spring->summer mapping as-is. Phase 6 focuses on enhancing SummerHero.

3. **Gallery page URL: `/gallery` vs `/transformations`**
   - What we know: Context says "Dedicated /gallery or /transformations page". Existing gallery is at `/gallery`.
   - Recommendation: Keep `/gallery` since it already exists with content. Add comparison sliders to the existing gallery page rather than creating a new route.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/app/HomeContent.tsx` (546 lines, full structure mapped)
- Codebase analysis: `src/app/layout.tsx` (font setup, schema components, Providers wrapper)
- Codebase analysis: `src/contexts/SeasonalThemeContext.tsx` (full provider + fallback system)
- Codebase analysis: `src/components/Providers.tsx` (client wrapper tree)
- Codebase analysis: `src/components/schemas/*` (15 schema files catalogued)
- Codebase analysis: `src/app/gallery/GalleryContent.tsx` (existing gallery with lightbox)
- Codebase analysis: All hero components (SummerHero, FallHero, WinterHero -- all 'use client')
- `package.json`: Next.js 16.1.6, React 19.2.3, Framer Motion 12.34.3

### Secondary (MEDIUM confidence)
- [Next.js Server/Client Components docs](https://nextjs.org/docs/app/getting-started/server-and-client-components) -- official patterns
- [Framer Motion + Next.js Server Components](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) -- wrapper pattern
- [react-compare-slider](https://github.com/nerdyman/react-compare-slider) -- assessed but NOT recommended due to stale maintenance

### Tertiary (LOW confidence)
- [React before/after slider comparison (Croct Blog)](https://blog.croct.com/post/best-react-before-after-image-comparison-slider-libraries) -- library comparison roundup
- [Next.js 16 Performance guide](https://www.digitalapplied.com/blog/nextjs-16-performance-server-components-guide) -- claims 50-70% JS reduction

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified from package.json, versions confirmed
- Architecture (SC conversion): HIGH -- full codebase analysis, every component's client/server status verified
- Architecture (gallery slider): MEDIUM -- custom approach recommended over libraries with uncertain React 19 compat
- Pitfalls: HIGH -- identified from direct codebase analysis (TS error budget, schema inventory, hydration)
- Image optimization: HIGH -- next/image capabilities well-documented, static imports verified in codebase

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable domain, unlikely to change)
