import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GONE_PATTERNS = [
  /^\/service-page(\/|$)/,
  /^\/post(\/|$)/,
  /^\/product-page(\/|$)/,
  /^\/events(\/|$)/,
  /^\/portfolio(\/|$)/,
  /^\/members(\/|$)/,
  /^\/_api(\/|$)/,
  /^\/_partials(\/|$)/,
  /^\/_functions(\/|$)/,
  /^\/wix-code-dev-tools(\/|$)/,
  /^\/_serverless(\/|$)/,
  /^\/window-cleaning$/,
  /^\/blog\/tags(\/|$)/,
  /^\/wix-/,
];

// In-memory redirect cache (per edge instance, 5-min TTL)
let redirectCache: Map<string, { destination: string; statusCode: number }> = new Map();
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getRedirect(pathname: string): Promise<{ destination: string; statusCode: number } | null> {
  const now = Date.now();

  // Refresh cache if expired
  if (now - cacheTimestamp > CACHE_TTL) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await supabase
        .from('seo_redirects')
        .select('source_path, destination_path, status_code');

      redirectCache = new Map();
      if (data) {
        for (const row of data) {
          redirectCache.set(row.source_path, {
            destination: row.destination_path,
            statusCode: row.status_code || 301,
          });
        }
      }
      cacheTimestamp = now;
    } catch {
      // On error, keep stale cache rather than failing
    }
  }

  return redirectCache.get(pathname) || null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 410 Gone for old Wix URLs (highest priority)
  for (const pattern of GONE_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><title>410 Gone</title></head><body>
        <div style="max-width:600px;margin:80px auto;text-align:center;font-family:system-ui,sans-serif">
          <h1 style="font-size:48px;color:#222">410</h1>
          <p style="font-size:18px;color:#666">This page has been permanently removed.</p>
          <p style="margin-top:24px">
            <a href="/" style="color:#16a34a;text-decoration:underline">Go to Homepage</a> ·
            <a href="/contact" style="color:#16a34a;text-decoration:underline">Contact Us</a> ·
            <a href="/service-areas" style="color:#16a34a;text-decoration:underline">Service Areas</a>
          </p>
        </div></body></html>`,
        {
          status: 410,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  }

  // www -> non-www redirect
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = host.replace('www.', '');
    return NextResponse.redirect(url, 301);
  }

  // Dynamic redirect lookup from seo_redirects table
  const redirect = await getRedirect(pathname);
  if (redirect) {
    const destinationUrl = request.nextUrl.clone();
    destinationUrl.pathname = redirect.destination;

    // Increment hit_count in background (fire and forget)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      supabase.rpc('increment_redirect_hit', { p_source: pathname }).then(() => {});
    } catch {
      // Non-critical — don't block the redirect
    }

    return NextResponse.redirect(destinationUrl, redirect.statusCode);
  }

  // Admin routes → admin login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('-auth-token'))
    if (!hasAuthCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Portal routes → portal login (but NOT login/auth pages themselves)
  if (
    pathname.startsWith('/portal') &&
    !pathname.startsWith('/portal/login') &&
    !pathname.startsWith('/portal/auth')
  ) {
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('-auth-token'))
    if (!hasAuthCookie) {
      const loginUrl = new URL('/portal/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Legacy Wix patterns
    '/service-page/:path*',
    '/post/:path*',
    '/product-page/:path*',
    '/events/:path*',
    '/portfolio/:path*',
    '/members/:path*',
    '/_api/:path*',
    '/_partials/:path*',
    '/_functions/:path*',
    '/wix-code-dev-tools/:path*',
    '/_serverless/:path*',
    '/window-cleaning',
    '/blog/tags/:path*',
    '/wix-:path*',
    // Catch all public paths for dynamic redirects (excludes _next, api, admin)
    '/((?!_next|api|admin).*)',
    // Protected routes
    '/admin/:path*',
    '/portal/:path*',
  ],
};
