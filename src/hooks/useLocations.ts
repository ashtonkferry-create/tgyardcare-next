import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: string;
  name: string;
  slug: string;
  county: string;
  state: string;
  description: string | null;
  content: string | null;
  population: number | null;
  geo_lat: number | null;
  geo_lng: number | null;
  is_active: boolean;
  created_at: string;
}

export interface LocationService {
  id: string;
  location_id: string;
  service_id: string;
}

// Fetch all active locations
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('population', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data as unknown as Location[]);
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch a single location by slug
export function useLocationBySlug(slug: string) {
  return useQuery({
    queryKey: ['locations', slug],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('locations')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as Location | null);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!slug,
  });
}

// Fetch services available in a location
export function useLocationServices(locationId: string) {
  return useQuery({
    queryKey: ['location-services', locationId],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('location_services')
        .select(`
          id,
          location_id,
          service_id,
          services (*)
        `)
        .eq('location_id', locationId);

      if (error) throw error;
      return data as unknown as Array<LocationService & { services: Record<string, unknown> }>;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!locationId,
  });
}

// Get location-specific content for a service
export function useLocationServiceContent(locationId: string, serviceId: string) {
  return useQuery({
    queryKey: ['location-service-content', locationId, serviceId],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('location_service_content')
        .select('*')
        .eq('location_id', locationId)
        .eq('service_id', serviceId)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as { content: string | null } | null)?.content ?? null;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!locationId && !!serviceId,
  });
}
