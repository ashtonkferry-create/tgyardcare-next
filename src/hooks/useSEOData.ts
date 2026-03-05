import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface PageSEO {
  id: string;
  page_name: string;
  page_path: string;
  page_type: 'page' | 'service' | 'location' | 'blog' | 'commercial';
  seo_title: string | null;
  meta_description: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  is_indexable: boolean;
  canonical_url: string | null;
  schema_type: 'WebPage' | 'LocalBusiness' | 'Service' | 'FAQPage' | 'Article' | 'Organization';
  schema_data: Json;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string;
  twitter_card: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  priority: number;
  change_frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  created_at: string;
  updated_at: string;
  last_modified_by: string | null;
}

export type PageSEOUpdate = Partial<Omit<PageSEO, 'id' | 'created_at' | 'updated_at'>>;

// Fetch all SEO data
export function useAllSEOData() {
  return useQuery({
    queryKey: ['page-seo', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_seo')
        .select('*')
        .order('page_type')
        .order('page_name');
      
      if (error) throw error;
      return data as PageSEO[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch SEO data for a specific page path
export function useSEOByPath(path: string) {
  return useQuery({
    queryKey: ['page-seo', path],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_seo')
        .select('*')
        .eq('page_path', path)
        .maybeSingle();
      
      if (error) throw error;
      return data as PageSEO | null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!path,
  });
}

// Update SEO data
export function useUpdateSEO() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PageSEOUpdate }) => {
      const { data, error } = await supabase
        .from('page_seo')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as PageSEO;
    },
    onSuccess: (data) => {
      // Update both the full list and the specific path cache
      queryClient.invalidateQueries({ queryKey: ['page-seo', 'all'] });
      queryClient.setQueryData(['page-seo', data.page_path], data);
    },
  });
}

// Create new SEO entry
export function useCreateSEO() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPage: Omit<PageSEO, 'id' | 'created_at' | 'updated_at' | 'last_modified_by'>) => {
      const { data, error } = await supabase
        .from('page_seo')
        .insert([newPage as any])
        .select()
        .single();
      
      if (error) throw error;
      return data as PageSEO;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-seo', 'all'] });
    },
  });
}

// Delete SEO entry
export function useDeleteSEO() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_seo')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-seo', 'all'] });
    },
  });
}

// SEO Validation helpers
export const SEO_LIMITS = {
  title: { min: 30, max: 60, recommended: 55 },
  description: { min: 70, max: 160, recommended: 155 },
  keyword: { max: 50 },
};

export function validateSEOTitle(title: string | null): { valid: boolean; warning?: string; error?: string } {
  if (!title) return { valid: false, error: 'Title is required' };
  const len = title.length;
  if (len < SEO_LIMITS.title.min) return { valid: false, warning: `Too short (${len}/${SEO_LIMITS.title.min} min)` };
  if (len > SEO_LIMITS.title.max) return { valid: false, error: `Too long (${len}/${SEO_LIMITS.title.max} max)` };
  return { valid: true };
}

export function validateMetaDescription(desc: string | null): { valid: boolean; warning?: string; error?: string } {
  if (!desc) return { valid: false, warning: 'Description recommended' };
  const len = desc.length;
  if (len < SEO_LIMITS.description.min) return { valid: false, warning: `Too short (${len}/${SEO_LIMITS.description.min} min)` };
  if (len > SEO_LIMITS.description.max) return { valid: false, error: `Too long (${len}/${SEO_LIMITS.description.max} max)` };
  return { valid: true };
}
