/**
 * Static city boundary polygons for the 12 Dane County service cities.
 * Used by the interactive service area map (Leaflet).
 *
 * Coordinates are simplified approximations in Leaflet format: [lat, lng].
 * Colors are green shades from the TotalGuard palette.
 */

export interface CityBoundary {
  name: string;
  slug: string;
  coordinates: [number, number][][]; // Leaflet format: [lat, lng][][] (outer ring)
  center: [number, number]; // [lat, lng] for label placement
  color: string; // hex color for polygon fill
}

export const CITY_BOUNDARIES: CityBoundary[] = [
  {
    name: "Madison",
    slug: "madison",
    center: [43.073, -89.401],
    color: "#2d6a4f",
    coordinates: [
      [
        [43.133, -89.501],
        [43.133, -89.301],
        [43.013, -89.301],
        [43.013, -89.501],
        [43.133, -89.501],
      ],
    ],
  },
  {
    name: "Middleton",
    slug: "middleton",
    center: [43.097, -89.504],
    color: "#40916c",
    coordinates: [
      [
        [43.127, -89.554],
        [43.127, -89.454],
        [43.067, -89.454],
        [43.067, -89.554],
        [43.127, -89.554],
      ],
    ],
  },
  {
    name: "Monona",
    slug: "monona",
    center: [43.062, -89.334],
    color: "#52b788",
    coordinates: [
      [
        [43.082, -89.364],
        [43.082, -89.304],
        [43.042, -89.304],
        [43.042, -89.364],
        [43.082, -89.364],
      ],
    ],
  },
  {
    name: "Sun Prairie",
    slug: "sun-prairie",
    center: [43.184, -89.214],
    color: "#74c69d",
    coordinates: [
      [
        [43.224, -89.264],
        [43.224, -89.164],
        [43.144, -89.164],
        [43.144, -89.264],
        [43.224, -89.264],
      ],
    ],
  },
  {
    name: "Fitchburg",
    slug: "fitchburg",
    center: [43.013, -89.441],
    color: "#1b4332",
    coordinates: [
      [
        [43.043, -89.491],
        [43.043, -89.391],
        [42.983, -89.391],
        [42.983, -89.491],
        [43.043, -89.491],
      ],
    ],
  },
  {
    name: "Verona",
    slug: "verona",
    center: [42.991, -89.533],
    color: "#95d5b2",
    coordinates: [
      [
        [43.021, -89.573],
        [43.021, -89.493],
        [42.961, -89.493],
        [42.961, -89.573],
        [43.021, -89.573],
      ],
    ],
  },
  {
    name: "McFarland",
    slug: "mcfarland",
    center: [43.012, -89.289],
    color: "#b7e4c7",
    coordinates: [
      [
        [43.037, -89.319],
        [43.037, -89.259],
        [42.987, -89.259],
        [42.987, -89.319],
        [43.037, -89.319],
      ],
    ],
  },
  {
    name: "Cottage Grove",
    slug: "cottage-grove",
    center: [43.076, -89.199],
    color: "#d8f3dc",
    coordinates: [
      [
        [43.106, -89.239],
        [43.106, -89.159],
        [43.046, -89.159],
        [43.046, -89.239],
        [43.106, -89.239],
      ],
    ],
  },
  {
    name: "Waunakee",
    slug: "waunakee",
    center: [43.192, -89.455],
    color: "#386641",
    coordinates: [
      [
        [43.222, -89.495],
        [43.222, -89.415],
        [43.162, -89.415],
        [43.162, -89.495],
        [43.222, -89.495],
      ],
    ],
  },
  {
    name: "DeForest",
    slug: "deforest",
    center: [43.248, -89.343],
    color: "#6c9e5a",
    coordinates: [
      [
        [43.278, -89.383],
        [43.278, -89.303],
        [43.218, -89.303],
        [43.218, -89.383],
        [43.278, -89.383],
      ],
    ],
  },
  {
    name: "Oregon",
    slug: "oregon",
    center: [42.926, -89.385],
    color: "#a3c49f",
    coordinates: [
      [
        [42.956, -89.425],
        [42.956, -89.345],
        [42.896, -89.345],
        [42.896, -89.425],
        [42.956, -89.425],
      ],
    ],
  },
  {
    name: "Stoughton",
    slug: "stoughton",
    center: [42.917, -89.218],
    color: "#4a7c59",
    coordinates: [
      [
        [42.952, -89.258],
        [42.952, -89.178],
        [42.882, -89.178],
        [42.882, -89.258],
        [42.952, -89.258],
      ],
    ],
  },
];
