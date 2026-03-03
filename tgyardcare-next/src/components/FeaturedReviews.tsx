'use client';

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFeaturedReviews, formatReviewDate, getSourceLabel } from '@/hooks/useReviews';

interface FeaturedReviewsProps {
  limit?: number;
  className?: string;
}

export function FeaturedReviews({ limit = 3, className = '' }: FeaturedReviewsProps) {
  const { data: reviews, isLoading } = useFeaturedReviews(limit);

  if (isLoading) {
    return (
      <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="h-4 w-4 bg-white/[0.1] rounded" />
                ))}
              </div>
              <div className="h-20 bg-white/[0.1] rounded" />
              <div className="h-4 bg-white/[0.1] rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 md:grid-cols-${Math.min(reviews.length, 3)} ${className}`}>
      {reviews.map((review) => (
        <Card key={review.id} className="bg-white/[0.06] border border-white/10">
          <CardContent className="pt-6 space-y-4">
            {/* Stars */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Review text */}
            <p className="text-white/70 italic">&ldquo;{review.text}&rdquo;</p>

            {/* Author */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{review.author_name}</span>
              <span className="text-white/40">
                {getSourceLabel(review.source)}
                {review.review_date && ` • ${formatReviewDate(review.review_date)}`}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default FeaturedReviews;
