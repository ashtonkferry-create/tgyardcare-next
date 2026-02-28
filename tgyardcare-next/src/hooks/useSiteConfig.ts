import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessInfo {
  id: string;
  legal_name: string;
  brand_name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  founding_date: string | null;
  founders: string[];
  service_area: string | null;
  same_as: string[];
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteConfig {
  [key: string]: string;
}

// Fetch business info
export function useBusinessInfo() {
  return useQuery({
    queryKey: ['business-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_info')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as BusinessInfo;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Fetch all site config as key-value map
export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('key, value');

      if (error) throw error;

      const config: SiteConfig = {};
      for (const row of data ?? []) {
        config[row.key] = row.value;
      }
      return config;
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Fetch a single config value
export function useSiteConfigValue(key: string) {
  return useQuery({
    queryKey: ['site-config', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', key)
        .single();

      if (error) return null;
      return data?.value ?? null;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!key,
  });
}

// Format phone number for display
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Format full address
export function formatAddress(info: BusinessInfo): string {
  return `${info.address}, ${info.city}, ${info.state} ${info.zip}`;
}
