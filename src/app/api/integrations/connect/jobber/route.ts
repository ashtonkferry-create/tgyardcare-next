import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAuthorizationUrl } from '@/lib/jobber/client';

/**
 * GET /api/integrations/connect/jobber
 * Redirects admin to Jobber OAuth authorization page.
 */
export async function GET() {
  const state = randomBytes(16).toString('hex');
  const url = getAuthorizationUrl(state);
  return NextResponse.redirect(url);
}
