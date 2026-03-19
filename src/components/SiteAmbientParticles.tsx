'use client';

import { AmbientParticles } from '@/components/AmbientParticles';

/**
 * SiteAmbientParticles — Fixed viewport-level particle overlay.
 *
 * Renders a sparse AmbientParticles layer that covers the entire viewport,
 * providing a consistent animated atmosphere across all pages.
 * z-[1] keeps it behind all page content.
 */
export function SiteAmbientParticles() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true">
      <AmbientParticles density="sparse" />
    </div>
  );
}
