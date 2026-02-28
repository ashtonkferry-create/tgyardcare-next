import { NextResponse, type NextRequest } from 'next/server';

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
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 410 Gone for old Wix URLs
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

  return NextResponse.next();
}

export const config = {
  matcher: [
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
  ],
};
