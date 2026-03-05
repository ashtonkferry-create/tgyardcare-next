import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadInsert {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
  service_id: string | null;
  location_id: string | null;
  tier?: 'good' | 'better' | 'best';
  frequency?: string;
  lot_size?: string;
  notes?: string | null;
  referral_source?: string | null;
  quoted_price?: number | null;
  lead_score?: number;
}

export interface Lead extends LeadInsert {
  id: string;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'completed' | 'lost';
  created_at: string;
  updated_at: string;
}

// Calculate quality score for a lead (0-100)
export function calculateLeadScore(lead: LeadInsert): number {
  let score = 0;

  // Contact info completeness
  if (lead.email) score += 15;
  if (lead.phone) score += 15;
  if (lead.address) score += 10;
  if (lead.city && lead.zip) score += 5;

  // Service selection
  if (lead.service_id) score += 10;

  // Tier preference (higher tier = higher intent)
  if (lead.tier === 'best') {
    score += 20;
  } else if (lead.tier === 'better') {
    score += 15;
  } else if (lead.tier === 'good') {
    score += 10;
  }

  // Recurring frequency (+15 for recurring)
  if (lead.frequency && ['weekly', 'biweekly', 'monthly'].includes(lead.frequency)) {
    score += 15;
  }

  // Location specified
  if (lead.location_id) score += 5;

  // Notes provided (shows engagement)
  if (lead.notes && lead.notes.length > 10) score += 5;

  return Math.min(score, 100);
}

// Submit a new lead
export function useSubmitLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: LeadInsert) => {
      // Calculate score if not provided
      const lead_score = submission.lead_score ?? calculateLeadScore(submission);

      const { data, error } = await supabase
        .from('leads')
        .insert({
          first_name: submission.first_name,
          last_name: submission.last_name,
          email: submission.email,
          phone: submission.phone,
          address: submission.address || null,
          city: submission.city || null,
          zip: submission.zip || null,
          service_id: submission.service_id,
          location_id: submission.location_id,
          tier: submission.tier || null,
          frequency: submission.frequency || null,
          lot_size: submission.lot_size || null,
          notes: submission.notes || null,
          referral_source: submission.referral_source || null,
          quoted_price: submission.quoted_price || null,
          lead_score,
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Lot size options for the quote form
export const LOT_SIZE_OPTIONS = [
  { value: 'small', label: 'Under 1/4 acre', sqft: 5000 },
  { value: 'medium', label: '1/4 - 1/2 acre', sqft: 15000 },
  { value: 'large', label: '1/2 - 1 acre', sqft: 30000 },
  { value: 'xlarge', label: 'Over 1 acre', sqft: 50000 },
];

// Frequency options for the quote form
export const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-time service' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every two weeks' },
  { value: 'monthly', label: 'Monthly' },
];
