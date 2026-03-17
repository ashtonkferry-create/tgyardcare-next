import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CuratedReview {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  source: string;
  location_id: string | null;
  service_id: string | null;
  review_date: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ReviewStats {
  average: number;
  count: number;
}

// Fetch featured reviews
export function useFeaturedReviews(limit = 3) {
  return useQuery({
    queryKey: ['reviews', 'featured', limit],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('curated_reviews')
        .select('*')
        .eq('is_featured', true)
        .order('review_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as unknown as CuratedReview[]);
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch all reviews
export function useAllReviews() {
  return useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('curated_reviews')
        .select('*')
        .order('review_date', { ascending: false });

      if (error) throw error;
      return (data as unknown as CuratedReview[]);
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch reviews by location
export function useReviewsByLocation(locationId: string) {
  return useQuery({
    queryKey: ['reviews', 'location', locationId],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('curated_reviews')
        .select('*')
        .eq('location_id', locationId)
        .order('review_date', { ascending: false });

      if (error) throw error;
      return (data as unknown as CuratedReview[]);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!locationId,
  });
}

// Get review statistics
export function useReviewStats() {
  return useQuery({
    queryKey: ['reviews', 'stats'],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('curated_reviews')
        .select('rating');

      if (error) throw error;
      const rows = data as unknown as { rating: number }[];
      if (!rows || rows.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = rows.reduce((acc, r) => acc + r.rating, 0);
      return {
        average: Math.round((sum / rows.length) * 10) / 10,
        count: rows.length,
      } as ReviewStats;
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Format review date
export function formatReviewDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// Get source icon/label
export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    google: 'Google',
    yelp: 'Yelp',
    nextdoor: 'Nextdoor',
    facebook: 'Facebook',
  };
  return labels[source] ?? source;
}
