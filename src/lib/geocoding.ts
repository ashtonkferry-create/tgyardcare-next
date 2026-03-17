"use server";

export interface AddressSuggestion {
  place_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: [number, number]; // [lng, lat] from Mapbox
}

interface MapboxFeatureContext {
  place?: { name: string };
  postcode?: { name: string };
  region?: { region_code: string };
}

interface MapboxFeature {
  properties: {
    full_address: string;
    name: string;
    context: MapboxFeatureContext;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface MapboxResponse {
  features: MapboxFeature[];
}

/**
 * Search for address suggestions using Mapbox Geocoding v6 API.
 * This is a server action — the API key never reaches the client.
 */
export async function searchAddresses(
  query: string
): Promise<AddressSuggestion[]> {
  if (query.length < 3) {
    return [];
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    access_token: token,
    country: "US",
    types: "address",
    proximity: "-89.401,43.073",
    autocomplete: "true",
    limit: "5",
  });

  const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data: MapboxResponse = (await response.json()) as MapboxResponse;

    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.map(
      (feature: MapboxFeature): AddressSuggestion => ({
        place_name: feature.properties.full_address ?? "",
        address: feature.properties.name ?? "",
        city: feature.properties.context?.place?.name ?? "",
        state: feature.properties.context?.region?.region_code ?? "",
        zip: feature.properties.context?.postcode?.name ?? "",
        coordinates: feature.geometry.coordinates,
      })
    );
  } catch {
    return [];
  }
}
