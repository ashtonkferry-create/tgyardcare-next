'use client';

import { Star, Shield, Clock, Users } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useReviewStats } from '@/hooks/useReviews';

interface TrustBarProps {
  className?: string;
}

export function TrustBar({ className = '' }: TrustBarProps) {
  const { data: config } = useSiteConfig();
  const { data: reviewStats } = useReviewStats();

  const rating = config?.google_rating ?? reviewStats?.average?.toString() ?? '4.9';
  const reviewCount = config?.google_review_count ?? reviewStats?.count?.toString() ?? '47';
  const yearsActive = config?.years_active ?? '4';
  const propertiesServed = config?.properties_served ?? '500+';

  return (
    <div className={`bg-muted/50 py-4 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{rating}</span>
            <span className="text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          {/* Years Active */}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span><span className="font-semibold">{yearsActive}</span> years serving Madison</span>
          </div>

          {/* Properties Served */}
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span><span className="font-semibold">{propertiesServed}</span> properties served</span>
          </div>

          {/* Licensed & Insured */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Licensed & Insured</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrustBar;
