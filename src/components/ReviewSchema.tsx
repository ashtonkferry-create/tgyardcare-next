interface Review {
  name: string;
  rating: number;
  text: string;
  date?: string;
}

interface ReviewSchemaProps {
  reviews: Review[];
}

export function ReviewSchema({ reviews }: ReviewSchemaProps) {
  const aggregateRating = {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": reviews.length.toString(),
    "bestRating": "5",
    "worstRating": "1"
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "TotalGuard Yard Care",
    "aggregateRating": aggregateRating,
    "review": reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5"
      },
      "reviewBody": review.text
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
