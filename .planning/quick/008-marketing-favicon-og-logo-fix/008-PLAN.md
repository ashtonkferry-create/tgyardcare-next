---
phase: quick
plan: 008
type: execute
wave: 1
depends_on: []
files_modified:
  - workely.ai/apps/marketing/src/app/icon.tsx
  - workely.ai/apps/marketing/src/app/apple-icon.tsx
  - workely.ai/apps/marketing/src/app/opengraph-image.tsx
  - workely.ai/apps/marketing/src/app/twitter-image.tsx
  - workely.ai/apps/marketing/src/app/layout.tsx
  - workely.ai/apps/marketing/src/components/layout/navbar.tsx
  - workely.ai/apps/marketing/src/components/layout/footer.tsx
autonomous: true

must_haves:
  truths:
    - "Browser tab shows Workely logo as favicon at all sizes"
    - "Social sharing on Twitter/LinkedIn/Discord shows premium branded OG image (1200x630)"
    - "Navbar logo matches Lovable original sizing (~44px icon, ~22-24px brand text)"
    - "Footer logo is proportionally correct"
  artifacts:
    - path: "workely.ai/apps/marketing/src/app/icon.tsx"
      provides: "Dynamic favicon generation (32x32)"
    - path: "workely.ai/apps/marketing/src/app/apple-icon.tsx"
      provides: "Apple touch icon (180x180)"
    - path: "workely.ai/apps/marketing/src/app/opengraph-image.tsx"
      provides: "OG image (1200x630) for social sharing"
  key_links:
    - from: "layout.tsx metadata"
      to: "opengraph-image.tsx"
      via: "Next.js file-based metadata convention"
      pattern: "opengraph-image"
---

<objective>
Fix three marketing site essentials: favicon (all sizes), premium OG image for social sharing, and logo sizing to match Lovable original.

Purpose: Professional brand presence across browser tabs, social shares, and the site itself.
Output: Working favicon set, 1200x630 OG image, correctly sized logos in navbar/footer.
</objective>

<execution_context>
@C:\Users\vance\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\vance\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@workely.ai/apps/marketing/src/app/layout.tsx
@workely.ai/apps/marketing/src/components/layout/navbar.tsx
@workely.ai/apps/marketing/src/components/layout/footer.tsx
@workely.ai/apps/marketing/public/logo.png
</context>

<tasks>

<task type="auto">
  <name>Task 1: Generate favicon set using Next.js file-based metadata</name>
  <files>
    workely.ai/apps/marketing/src/app/icon.tsx
    workely.ai/apps/marketing/src/app/apple-icon.tsx
  </files>
  <action>
    Use Next.js file-based metadata API (ImageResponse from next/og) to generate favicons dynamically from the existing logo.png.

    **icon.tsx** — generates favicon (32x32):
    - Import ImageResponse from 'next/og'
    - Export size = { width: 32, height: 32 }, contentType = 'image/png'
    - Read logo.png from public/ using fs at build time (use fetch with new URL approach for Edge runtime):
      `const logo = await fetch(new URL('/logo.png', 'https://workely.ai')).then(r => r.arrayBuffer())`
    - ACTUALLY: Since we want this to work in dev too, use the simpler approach: render the logo as a centered image in ImageResponse. Use a base64-encoded version of logo.png read at build time, OR use the `@vercel/og` pattern with a data URL.
    - SIMPLEST approach: Create a static favicon. Use a script to convert logo.png to favicon sizes, then place them in app/ directory as static files.

    REVISED APPROACH (most reliable):
    1. Create `workely.ai/apps/marketing/src/app/icon.tsx` that uses ImageResponse to render the Workely "W" mark at 32x32. Since loading external images in ImageResponse is fragile, draw the icon programmatically:
       - Dark background (#07080d), rounded corners
       - Render a stylized "W" in the brand blue (#3C83F6) using SVG path within ImageResponse
       - Export: size = { width: 32, height: 32 }, contentType = 'image/png'

    2. Create `workely.ai/apps/marketing/src/app/apple-icon.tsx` same approach but 180x180:
       - Same design, scaled up
       - Export: size = { width: 180, height: 180 }, contentType = 'image/png'

    The "W" mark design: Use a clean geometric W shape. SVG path for a modern W:
    - Use two overlapping V shapes to form a W
    - Fill with linear gradient from #3C83F6 (blue) to #8236EC (purple)
    - On dark rounded-rect background

    Alternative if ImageResponse SVG is tricky: Use simple text-based approach with ImageResponse — render "W" in a bold font at the right size on dark bg. This is proven to work reliably.
  </action>
  <verify>
    Run `cd workely.ai && pnpm dev --filter @workely/marketing` and check http://localhost:3001/icon (should return 32x32 PNG) and http://localhost:3001/apple-icon (should return 180x180 PNG). Browser tab should show the icon.
  </verify>
  <done>
    Browser tab at localhost:3001 shows a branded "W" favicon. /icon and /apple-icon routes return correctly sized PNGs.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create premium OG image using Next.js ImageResponse</name>
  <files>
    workely.ai/apps/marketing/src/app/opengraph-image.tsx
    workely.ai/apps/marketing/src/app/twitter-image.tsx
    workely.ai/apps/marketing/src/app/layout.tsx
  </files>
  <action>
    Create `opengraph-image.tsx` using Next.js file-based OG image generation (ImageResponse from next/og). This generates a 1200x630 image at build/request time.

    **Design spec — billionaire tier:**
    - Size: 1200x630
    - Background: Dark gradient from #07080d to #0d1117 (match site bg)
    - Subtle grid pattern overlay (use CSS background-image with repeating-linear-gradient for grid lines at ~5% opacity)
    - Top-left: "W" mark (same as favicon) at ~60px, with "Workely.AI" text next to it in Space Grotesk bold, white, ~36px
    - Center: Main headline "The AI Workforce Platform" in Space Grotesk, bold, white, ~56px, with slight letter-spacing
    - Below headline: Tagline "Deploy 30+ AI agents in 5 minutes" in Inter, regular, #8888a0, ~24px
    - Bottom accent: A thin gradient line (blue #3C83F6 to purple #8236EC) spanning ~60% width, centered, 3px tall
    - Bottom-right: "workely.ai" in small text, #555, ~16px
    - Subtle blue glow effect behind the headline (radial gradient at ~8% opacity)

    Export: size = { width: 1200, height: 630 }, contentType = 'image/png', alt = 'Workely.AI — The AI Workforce Platform'

    **Font loading:** Use fetch to load Space Grotesk and Inter from Google Fonts CDN as ArrayBuffer, pass to ImageResponse fonts option. Pattern:
    ```
    const spaceGrotesk = await fetch(
      new URL('https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPb54C_k3HqUtEw.woff2')
    ).then(res => res.arrayBuffer())
    ```

    **twitter-image.tsx:** Export the same component but with Twitter-specific alt text. Can literally re-export: create a wrapper that calls the same generation function. Or just duplicate with `card: 'summary_large_image'` already set in layout.tsx metadata.

    **layout.tsx updates:**
    - Remove the manual openGraph image config if any exists (Next.js auto-detects opengraph-image.tsx)
    - Keep the existing openGraph metadata (title, description, siteName) — those are still needed
    - Ensure twitter.card is 'summary_large_image' (already set)
  </action>
  <verify>
    Visit http://localhost:3001/opengraph-image in browser — should render a 1200x630 premium dark image with Workely branding. Visit http://localhost:3001/twitter-image for the Twitter variant. Use `curl -I http://localhost:3001/opengraph-image` to confirm content-type is image/png.
  </verify>
  <done>
    /opengraph-image returns a premium 1200x630 branded image. /twitter-image returns equivalent. Social sharing preview tools (e.g., opengraph.xyz) show the image when pointed at workely.ai.
  </done>
</task>

<task type="auto">
  <name>Task 3: Fix logo sizing in navbar and footer to match Lovable original</name>
  <files>
    workely.ai/apps/marketing/src/components/layout/navbar.tsx
    workely.ai/apps/marketing/src/components/layout/footer.tsx
  </files>
  <action>
    **Navbar (navbar.tsx):**
    - Change logo Image from width={38} height={38} to width={44} height={44} (Lovable original is ~40-44px)
    - Change brand text fontSize from '20px' to '22px' (Lovable original is ~22-24px)
    - Keep fontWeight 700 for "Workely" and 400 for "AI"
    - Ensure gap between logo and text is proportional (gap-2.5 is fine, could bump to gap-3)

    **Footer (footer.tsx):**
    - Change footer logo Image from width={28} height={28} to width={32} height={32} (proportional increase to match navbar bump)
    - Keep the rest of the footer bottom bar styling the same
  </action>
  <verify>
    Visual check at localhost:3001 — navbar logo should be noticeably larger and match the Lovable original proportions. Footer logo should be slightly larger. Run `cd workely.ai && pnpm build --filter @workely/marketing` to confirm no build errors.
  </verify>
  <done>
    Navbar logo is 44x44px with 22px brand text. Footer logo is 32x32px. Both match Lovable original proportions. Build passes clean.
  </done>
</task>

</tasks>

<verification>
1. `cd workely.ai && pnpm build --filter @workely/marketing` — build succeeds with no errors
2. Browser tab shows favicon at localhost:3001
3. /opengraph-image route returns 1200x630 PNG
4. /apple-icon route returns 180x180 PNG
5. Navbar logo visually matches Lovable original sizing
6. Footer logo is proportionally correct
</verification>

<success_criteria>
- All favicon sizes generated (32x32 icon, 180x180 apple-icon)
- OG image renders as premium dark branded 1200x630 image
- Twitter image renders correctly
- Navbar: 44px logo, 22px brand text
- Footer: 32px logo
- Marketing site builds without errors
</success_criteria>

<output>
After completion, create `.planning/quick/008-marketing-favicon-og-logo-fix/008-SUMMARY.md`
</output>
