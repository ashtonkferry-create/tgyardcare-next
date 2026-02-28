'use client';

const CANONICAL_DOMAIN = 'https://tgyardcare.com';

/**
 * GlobalSchema provides sitewide Organization, LocalBusiness, and WebSite schema
 * This should be included once in the app (typically in App.tsx or the homepage)
 * All page-specific schemas should reference these @id values
 */
export function GlobalSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${CANONICAL_DOMAIN}/#organization`,
    "name": "TotalGuard Yard Care",
    "alternateName": "TG Yard Care",
    "url": CANONICAL_DOMAIN,
    "logo": `${CANONICAL_DOMAIN}/lovable-uploads/785f87d1-0deb-4f52-bb55-562cc863177a.webp`,
    "image": `${CANONICAL_DOMAIN}/og-image.jpg`,
    "description": "Madison's reliability-first lawn care company. Professional mowing, mulching, gutter cleaning, seasonal cleanups, and snow removal for Dane County homeowners.",
    "telephone": "+1-608-535-6057",
    "email": "totalguardllc@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Madison",
      "addressRegion": "WI",
      "postalCode": "53711",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.0731,
      "longitude": -89.4012
    },
    "areaServed": [
      { "@type": "City", "name": "Madison", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Middleton", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Waunakee", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Sun Prairie", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Verona", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Fitchburg", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Monona", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "McFarland", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "DeForest", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Cottage Grove", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Oregon", "address": { "@type": "PostalAddress", "addressRegion": "WI" } },
      { "@type": "City", "name": "Stoughton", "address": { "@type": "PostalAddress", "addressRegion": "WI" } }
    ],
    "sameAs": [
      "https://facebook.com/totalguardyardcare",
      "https://instagram.com/tgyardcare"
    ],
    "foundingDate": "2020",
    "priceRange": "$$"
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LandscapingBusiness",
    "@id": `${CANONICAL_DOMAIN}/#localbusiness`,
    "name": "TotalGuard Yard Care",
    "image": `${CANONICAL_DOMAIN}/og-image.jpg`,
    "url": CANONICAL_DOMAIN,
    "telephone": "+1-608-535-6057",
    "email": "totalguardllc@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Madison",
      "addressRegion": "WI",
      "postalCode": "53711",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.0731,
      "longitude": -89.4012
    },
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
      "reviewCount": "60",
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "Credit Card", "Check"],
    "currenciesAccepted": "USD",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Lawn Care & Property Maintenance Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Lawn Mowing",
            "description": "Weekly lawn mowing with edging, trimming, and cleanup"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Gutter Cleaning",
            "description": "Complete gutter cleanout with downspout flushing"
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
            "name": "Mulching",
            "description": "Premium mulch installation for garden beds"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Snow Removal",
            "description": "Residential snow plowing and shoveling"
          }
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL_DOMAIN}/#website`,
    "name": "TotalGuard Yard Care",
    "url": CANONICAL_DOMAIN,
    "description": "Madison's reliability-first lawn care company. Professional landscaping services for Dane County homeowners.",
    "publisher": {
      "@id": `${CANONICAL_DOMAIN}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${CANONICAL_DOMAIN}/faq?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  );
}
