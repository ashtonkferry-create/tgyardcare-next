'use client';

import { Check, Star, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePricingByService, useSeasonalModifier, formatPriceRange, formatPrice, formatUnit } from '@/hooks/usePricing';
import { useServiceBySlug } from '@/hooks/useServices';
import Link from "next/link";

interface PricingTiersProps {
  serviceSlug: string;
  locationId?: string;
  showCTA?: boolean;
}

const tierConfig = {
  good: {
    name: 'Good',
    icon: Check,
    description: 'Essential service',
    color: 'bg-slate-100 border-slate-200',
    badge: null,
  },
  better: {
    name: 'Better',
    icon: Star,
    description: 'Most popular',
    color: 'bg-primary/5 border-primary/20',
    badge: 'Popular',
  },
  best: {
    name: 'Best',
    icon: Sparkles,
    description: 'Premium experience',
    color: 'bg-amber-50 border-amber-200',
    badge: 'Premium',
  },
  standard: {
    name: 'Standard',
    icon: Check,
    description: 'Project-based',
    color: 'bg-slate-100 border-slate-200',
    badge: null,
  },
};

export function PricingTiers({ serviceSlug, locationId, showCTA = true }: PricingTiersProps) {
  const { data: service } = useServiceBySlug(serviceSlug);
  const { data: pricing, isLoading: pricingLoading } = usePricingByService(service?.id ?? '', locationId);
  const { data: seasonalModifier } = useSeasonalModifier(service?.id ?? '');

  if (!service || pricingLoading || !pricing) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-6 bg-muted rounded w-20" />
              <div className="h-8 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const priceRanges = formatPriceRange(pricing, seasonalModifier);

  if (priceRanges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {seasonalModifier && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="text-sm">
            {seasonalModifier.label} Pricing ({seasonalModifier.reason})
          </Badge>
        </div>
      )}

      <div className={`grid gap-6 ${priceRanges.length === 1 ? 'max-w-md mx-auto' : priceRanges.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
        {priceRanges.map((range) => {
          const config = tierConfig[range.tier as keyof typeof tierConfig] || tierConfig.standard;
          const Icon = config.icon;

          return (
            <Card key={range.tier} className={`relative ${config.color} border-2`}>
              {config.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  {config.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 p-2 rounded-full bg-background">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{config.name}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-3xl font-bold">
                    {range.min === range.max
                      ? formatPrice(range.min)
                      : `${formatPrice(range.min)}–${formatPrice(range.max)}`}
                  </span>
                  <span className="text-muted-foreground">{formatUnit(range.unit)}</span>
                </div>

                {range.includes.length > 0 && (
                  <ul className="text-sm text-left space-y-2">
                    {range.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {showCTA && (
                  <Button asChild className="w-full" variant={range.tier === 'better' ? 'default' : 'outline'}>
                    <Link href={`/get-quote?service=${serviceSlug}&tier=${range.tier}`}>
                      Get Your Price
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default PricingTiers;
