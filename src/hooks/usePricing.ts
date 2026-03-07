import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Pricing {
  id: string;
  service_id: string;
  location_id: string | null;
  tier: 'good' | 'better' | 'best' | 'standard';
  price_min: number;
  price_max: number;
  unit: 'per_visit' | 'per_sqft' | 'per_linear_ft' | 'per_project';
  lot_size_min: number | null;
  lot_size_max: number | null;
  includes: string[];
  is_active: boolean;
  created_at: string;
}

export interface SeasonalModifier {
  id: string;
  service_id: string;
  month_start: number;
  month_end: number;
  multiplier: number;
  label: string;
  reason: string | null;
}

export interface PriceRange {
  tier: string;
  min: number;
  max: number;
  unit: string;
  includes: string[];
  seasonalMultiplier: number;
  seasonalLabel: string | null;
}

// Get pricing for a service (optionally by location)
export function usePricingByService(serviceId: string, locationId?: string) {
  return useQuery({
    queryKey: ['pricing', serviceId, locationId],
    queryFn: async () => {
      let query = supabase
        .from('pricing')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('tier')
        .order('lot_size_min', { ascending: true, nullsFirst: true });

      if (locationId) {
        query = query.or(`location_id.eq.${locationId},location_id.is.null`);
      } else {
        query = query.is('location_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Pricing[];
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!serviceId,
  });
}

// Get seasonal modifier for a service
export function useSeasonalModifier(serviceId: string) {
  const currentMonth = new Date().getMonth() + 1;

  return useQuery({
    queryKey: ['seasonal-modifiers', serviceId, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_modifiers')
        .select('*')
        .eq('service_id', serviceId)
        .lte('month_start', currentMonth)
        .gte('month_end', currentMonth)
        .limit(1);

      if (error) throw error;
      return data?.[0] as SeasonalModifier | null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!serviceId,
  });
}

// Get starting price for a service (for cards)
export function useStartingPrice(serviceId: string) {
  return useQuery({
    queryKey: ['pricing', serviceId, 'starting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('price_min')
        .eq('service_id', serviceId)
        .is('location_id', null)
        .eq('is_active', true)
        .order('price_min')
        .limit(1);

      if (error) throw error;
      return data?.[0]?.price_min ?? null;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!serviceId,
  });
}

// Helper to calculate price with seasonal modifier
export function calculateSeasonalPrice(basePrice: number, modifier: SeasonalModifier | null): number {
  if (!modifier) return basePrice;
  return Math.round(basePrice * modifier.multiplier);
}

// Helper to format price range
export function formatPriceRange(pricing: Pricing[], modifier: SeasonalModifier | null): PriceRange[] {
  const tiers = ['good', 'better', 'best', 'standard'] as const;
  const ranges: PriceRange[] = [];

  for (const tier of tiers) {
    const tierPricing = pricing.filter(p => p.tier === tier);
    if (tierPricing.length === 0) continue;

    const minPrice = Math.min(...tierPricing.map(p => p.price_min));
    const maxPrice = Math.max(...tierPricing.map(p => p.price_max));
    const multiplier = modifier?.multiplier ?? 1;

    ranges.push({
      tier,
      min: Math.round(minPrice * multiplier),
      max: Math.round(maxPrice * multiplier),
      unit: tierPricing[0].unit,
      includes: tierPricing[0].includes || [],
      seasonalMultiplier: multiplier,
      seasonalLabel: modifier?.label ?? null,
    });
  }

  return ranges;
}

// Format price for display
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format unit for display
export function formatUnit(unit: string): string {
  const labels: Record<string, string> = {
    per_visit: '/visit',
    per_sqft: '/sq ft',
    per_linear_ft: '/linear ft',
    per_project: '/project',
  };
  return labels[unit] ?? '';
}
