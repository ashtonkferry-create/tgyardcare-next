import { NextRequest, NextResponse } from 'next/server';

// Dane County GIS REST API — public parcel data, no API key required
// Covers all of TotalGuard's service area (Dane County, WI)
const DANE_COUNTY_GIS_URL =
  'https://gis.countyofdane.com/arcgis/rest/services/Parcel/MapServer/0/query';

interface ParcelFeature {
  attributes: Record<string, unknown>;
}

interface GisResponse {
  features?: ParcelFeature[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body as { lat: number; lng: number };

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      geometry: JSON.stringify({ x: lng, y: lat }),
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      outFields: 'CALC_ACRES',
      returnGeometry: 'false',
      f: 'json',
    });

    const res = await fetch(`${DANE_COUNTY_GIS_URL}?${params}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // cache 1 hour — lot sizes don't change
    });

    if (!res.ok) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    const data = (await res.json()) as GisResponse;

    if (!data.features || data.features.length === 0) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    const attrs = data.features[0].attributes;

    // CALC_ACRES is the Dane County GIS field for calculated lot acreage
    const acresRaw = attrs['CALC_ACRES'];

    if (acresRaw === null || acresRaw === undefined || acresRaw === 0) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    // Convert: 1 acre = 43,560 sq ft
    const lotSizeSqft = Math.round(Number(acresRaw) * 43560);

    // Sanity check — reject implausible residential lot sizes
    if (lotSizeSqft < 1000 || lotSizeSqft > 5_000_000) {
      return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
    }

    return NextResponse.json({ lotSizeSqft }, { status: 200 });
  } catch {
    // Never throw — UI falls back to manual sqft input
    return NextResponse.json({ lotSizeSqft: null }, { status: 200 });
  }
}
