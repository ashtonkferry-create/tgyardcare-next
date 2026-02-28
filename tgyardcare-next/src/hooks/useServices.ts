import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  short_description: string;
  long_description: string | null;
  is_active: boolean;
  display_order: number;
  icon: string | null;
  image_url: string | null;
  created_at: string;
}

export interface ServiceDetail {
  id: string;
  service_id: string;
  tier: 'good' | 'better' | 'best' | 'standard';
  deliverables: string[];
  created_at: string;
}

export interface ServiceWithDetails extends Service {
  details: ServiceDetail[];
}

// Fetch all active services
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as Service[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch a single service by slug
export function useServiceBySlug(slug: string) {
  return useQuery({
    queryKey: ['services', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Service | null;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!slug,
  });
}

// Fetch service with tier details
export function useServiceWithDetails(slug: string) {
  return useQuery({
    queryKey: ['services', slug, 'details'],
    queryFn: async () => {
      // Get service
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (serviceError) throw serviceError;
      if (!service) return null;

      // Get details
      const { data: details, error: detailsError } = await supabase
        .from('service_details')
        .select('*')
        .eq('service_id', service.id)
        .order('tier');

      if (detailsError) throw detailsError;

      return {
        ...service,
        details: details || [],
      } as ServiceWithDetails;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!slug,
  });
}
