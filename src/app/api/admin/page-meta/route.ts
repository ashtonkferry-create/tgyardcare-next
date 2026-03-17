import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface PageMeta {
  path: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  internalLinkCount: number;
  hasCanonical: boolean;
  canonicalUrl: string | null;
  hasGeoRegion: boolean;
  hasGeoPlacename: boolean;
  schemaTypes: string[];
  schemaRaw: string[];
}

function extractMeta(html: string, path: string): PageMeta {
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const metaDescription = descMatch ? descMatch[1].trim() : null;

  // H1 tags
  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) ?? [];
  const h1Count = h1Matches.length;
  const h1TextMatch = h1Matches[0]?.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1TextMatch ? h1TextMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  // Images missing alt
  const imgTags = (html.match(/<img[^>]+>/gi) ?? []) as string[];
  const imagesMissingAlt = imgTags.filter(tag => {
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    return !altMatch || altMatch[1].trim() === "";
  }).length;

  // Internal links
  const linkMatches = html.match(/href=["'](\/[^"'#?][^"']*?)["']/gi) ?? [];
  const internalLinkCount = linkMatches.length;

  // Canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const hasCanonical = !!canonicalMatch;
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;

  // GEO signals
  const hasGeoRegion = /<meta[^>]+name=["']geo\.region["']/i.test(html);
  const hasGeoPlacename = /<meta[^>]+name=["']geo\.placename["']/i.test(html);

  // JSON-LD schemas
  const schemaMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const schemaRaw = schemaMatches.map(s => {
    const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    return m ? m[1].trim() : "";
  }).filter(Boolean);

  const schemaTypes = schemaRaw.map(raw => {
    try {
      const parsed = JSON.parse(raw);
      return parsed["@type"] ?? "Unknown";
    } catch {
      return "Invalid";
    }
  });

  return {
    path,
    title,
    metaDescription,
    h1,
    h1Count,
    imagesMissingAlt,
    internalLinkCount,
    hasCanonical,
    canonicalUrl,
    hasGeoRegion,
    hasGeoPlacename,
    schemaTypes,
    schemaRaw,
  };
}

export async function GET(req: NextRequest) {
  // Auth check — allow if CRON_SECRET not set (dev mode)
  const token = req.headers.get("x-admin-token");
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path param required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgyardcare.com";
  const url = `${baseUrl}${path}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TGAdmin-SEO-Audit/1.0" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Page returned ${res.status}`, path, statusCode: res.status },
        { status: 200 }
      );
    }

    const html = await res.text();
    const meta = extractMeta(html, path);
    return NextResponse.json({ ...meta, statusCode: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err), path, statusCode: 0 },
      { status: 200 }
    );
  }
}
