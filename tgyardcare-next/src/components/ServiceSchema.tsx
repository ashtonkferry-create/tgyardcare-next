'use client';

const CANONICAL_DOMAIN = 'https://tgyardcare.com';

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  serviceType: string;
  areaServed?: string[];
}

export const ServiceSchema = ({
  serviceName,
  description,
  serviceType,
  areaServed = ['Madison', 'Middleton', 'Waunakee']
}: ServiceSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceType,
    "name": serviceName,
    "description": description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "TG Yard Care",
      "telephone": "608-535-6057",
      "email": "totalguardllc@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Madison",
        "addressRegion": "WI",
        "addressCountry": "US"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "50"
      },
      "url": CANONICAL_DOMAIN
    },
    "areaServed": areaServed.map((area) => ({
      "@type": "City",
      "name": area
    })),
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${CANONICAL_DOMAIN}/contact`,
      "servicePhone": "608-535-6057"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
