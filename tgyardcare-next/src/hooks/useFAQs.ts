import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  service_id: string | null;
  location_id: string | null;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

// Fetch FAQs for a service
export function useFAQsByService(serviceId: string) {
  return useQuery({
    queryKey: ['faqs', 'service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('service_id', serviceId)
        .is('location_id', null)
        .order('display_order');

      if (error) throw error;
      return data as FAQ[];
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!serviceId,
  });
}

// Fetch FAQs for a location
export function useFAQsByLocation(locationId: string) {
  return useQuery({
    queryKey: ['faqs', 'location', locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('location_id', locationId)
        .order('display_order');

      if (error) throw error;
      return data as FAQ[];
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!locationId,
  });
}

// Fetch FAQs for a service in a specific location (combines service + location FAQs)
export function useFAQsByServiceAndLocation(serviceId: string, locationId: string) {
  return useQuery({
    queryKey: ['faqs', 'combined', serviceId, locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .or(
          `and(service_id.eq.${serviceId},location_id.is.null),` +
          `and(service_id.eq.${serviceId},location_id.eq.${locationId}),` +
          `and(service_id.is.null,location_id.eq.${locationId})`
        )
        .order('display_order');

      if (error) throw error;
      return data as FAQ[];
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!serviceId && !!locationId,
  });
}
