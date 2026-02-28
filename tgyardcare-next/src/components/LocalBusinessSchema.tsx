'use client';

import Script from "next/script";

interface LocalBusinessSchemaProps {
  cityName: string;
  cityState?: string;
}

export function LocalBusinessSchema({
  cityName,
  cityState = "Wisconsin"
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://totalguardyardcare.com/locations/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
    "name": `TotalGuard Yard Care - ${cityName}`,
    "image": "https://totalguardyardcare.com/lovable-uploads/785f87d1-0deb-4f52-bb55-562cc863177a.webp",
    "url": `https://totalguardyardcare.com/locations/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
    "telephone": "+1-608-535-6057",
    "email": "totalguardllc@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressRegion": "WI",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": getLatitude(cityName),
      "longitude": getLongitude(cityName)
    },
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "WI",
        "addressCountry": "US"
      }
    },
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://facebook.com/totalguardyardcare",
      "https://instagram.com/tgyardcare"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Lawn Care Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Lawn Mowing & Maintenance",
            "description": "Professional weekly lawn mowing and maintenance services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Gutter Cleaning",
            "description": "Complete gutter cleaning and maintenance services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Seasonal Cleanup",
            "description": "Spring and fall yard cleanup services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Mulching Services",
            "description": "Premium mulching for garden beds and landscaping"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Snow Removal",
            "description": "Winter snow removal and ice management"
          }
        }
      ]
    }
  };

  return (
    <Script
      id={`local-business-schema-${cityName.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Approximate coordinates for Wisconsin cities (for schema.org purposes)
function getLatitude(city: string): number {
  const coordinates: Record<string, number> = {
    "Madison": 43.0731,
    "Middleton": 43.0972,
    "Waunakee": 43.1884,
    "Monona": 43.0597,
    "Sun Prairie": 43.1836,
    "Fitchburg": 42.9608,
    "Verona": 42.9908,
    "McFarland": 43.0172,
    "Cottage Grove": 43.0767,
    "DeForest": 43.2486,
    "Oregon": 42.9267,
    "Stoughton": 42.9172
  };
  return coordinates[city] || 43.0731; // Default to Madison
}

function getLongitude(city: string): number {
  const coordinates: Record<string, number> = {
    "Madison": -89.4012,
    "Middleton": -89.5043,
    "Waunakee": -89.4562,
    "Monona": -89.3362,
    "Sun Prairie": -89.2165,
    "Fitchburg": -89.4696,
    "Verona": -89.5332,
    "McFarland": -89.2979,
    "Cottage Grove": -89.2001,
    "DeForest": -89.3443,
    "Oregon": -89.3862,
    "Stoughton": -89.2179
  };
  return coordinates[city] || -89.4012; // Default to Madison
}
