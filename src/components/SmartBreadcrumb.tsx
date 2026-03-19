// src/components/SmartBreadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BREADCRUMB_LABELS, resolveCityService, titleCase } from '@/data/breadcrumbConfig';

interface CrumbItem {
  label: string;
  href?: string;
}

// Paths where breadcrumb should NOT render
const HIDDEN_EXACT = new Set(['/', '/privacy', '/terms', '/botfeedback']);
const HIDDEN_PREFIXES = ['/admin', '/portal', '/r/'];

function buildTrail(pathname: string): CrumbItem[] {
  const items: CrumbItem[] = [{ label: 'Home', href: '/' }];

  // Strip leading slash, get raw slug
  const rawSlug = pathname.replace(/^\//, '');

  // ── City-service dynamic route (e.g. "fall-cleanup-oregon-wi") ──
  const resolved = resolveCityService(rawSlug);
  if (resolved) {
    items.push({ label: 'Service Areas', href: '/service-areas' });
    items.push({ label: resolved.cityName, href: `/locations/${resolved.citySlug}` });
    items.push({ label: resolved.serviceName }); // current page — no href
    return items;
  }

  // ── All other routes: split by "/" ──
  const segments = pathname.split('/').filter(Boolean);
  let builtPath = '';

  segments.forEach((seg, i) => {
    builtPath += `/${seg}`;
    const isLast = i === segments.length - 1;
    const label = BREADCRUMB_LABELS[seg] ?? titleCase(seg);
    items.push({
      label,
      href: isLast ? undefined : builtPath,
    });
  });

  return items;
}

export function SmartBreadcrumb() {
  const pathname = usePathname();

  // Hide on excluded paths
  if (HIDDEN_EXACT.has(pathname)) return null;
  if (HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) return null;

  const trail = buildTrail(pathname);

  // Only show if there's more than just "Home"
  if (trail.length <= 1) return null;

  return (
    <div className="bg-[#052e16] border-b border-white/[0.04] relative z-30">
      <div className="container mx-auto px-4 sm:px-6 py-2.5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-y-0.5 text-xs"
        >
          {trail.map((item, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && (
                <span className="mx-1.5 text-white/20 select-none">›</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-white/40 hover:text-white transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/70">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
