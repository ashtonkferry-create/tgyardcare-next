import type { GBPReview } from './types';

// ---------------------------------------------------------------------------
// Auth — Google Service Account OAuth2
// ---------------------------------------------------------------------------

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var not set');

  const sa = JSON.parse(Buffer.from(saJson, 'base64').toString('utf-8'));

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/business.manage',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, 'base64url');

  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

// ---------------------------------------------------------------------------
// API Helpers
// ---------------------------------------------------------------------------

const API_BASE = 'https://mybusiness.googleapis.com/v4';

async function gbpFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GBP API error: ${res.status} ${path} — ${errBody}`);
  }

  return res;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function listReviews(locationName: string, since?: Date): Promise<GBPReview[]> {
  const allReviews: GBPReview[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: '50' });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await gbpFetch(`/${locationName}/reviews?${params}`);
    const data = (await res.json()) as {
      reviews?: GBPReview[];
      nextPageToken?: string;
      totalReviewCount?: number;
    };

    if (data.reviews) {
      if (since) {
        const sinceMs = since.getTime();
        const filtered = data.reviews.filter(
          (r) => new Date(r.updateTime).getTime() > sinceMs
        );
        allReviews.push(...filtered);
        if (filtered.length < (data.reviews?.length || 0)) break;
      } else {
        allReviews.push(...data.reviews);
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return allReviews;
}

export async function replyToReview(
  reviewName: string,
  comment: string
): Promise<void> {
  await gbpFetch(`/${reviewName}/reply`, {
    method: 'PUT',
    body: JSON.stringify({ comment }),
  });
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

interface CreatePostOptions {
  locationName: string;
  summary: string;
  callToAction?: {
    actionType: 'LEARN_MORE' | 'BOOK' | 'ORDER' | 'SHOP' | 'SIGN_UP' | 'CALL';
    url?: string;
  };
  mediaItems?: Array<{
    mediaFormat: 'PHOTO';
    sourceUrl: string;
  }>;
}

export async function createPost(opts: CreatePostOptions): Promise<{ name: string }> {
  const body: Record<string, unknown> = {
    languageCode: 'en',
    summary: opts.summary,
    topicType: 'STANDARD',
  };

  if (opts.callToAction) {
    body.callToAction = opts.callToAction;
  }

  if (opts.mediaItems && opts.mediaItems.length > 0) {
    body.media = opts.mediaItems;
  }

  const res = await gbpFetch(`/${opts.locationName}/localPosts`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return (await res.json()) as { name: string };
}

export async function listPosts(
  locationName: string,
  pageSize = 20
): Promise<Array<{ name: string; summary: string; state: string; createTime: string }>> {
  const res = await gbpFetch(
    `/${locationName}/localPosts?pageSize=${pageSize}`
  );
  const data = (await res.json()) as { localPosts?: Array<Record<string, unknown>> };
  return (data.localPosts || []) as Array<{
    name: string;
    summary: string;
    state: string;
    createTime: string;
  }>;
}

export async function deletePost(postName: string): Promise<void> {
  await gbpFetch(`/${postName}`, { method: 'DELETE' });
}
