// GBP automation type definitions

/** Google Business Profile review from API */
export interface GBPReview {
  name: string;
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/** Star rating string to number */
export const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

/** Review stored in Supabase */
export interface ReviewRow {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  source: string;
  response_draft: string | null;
  responded_at: string | null;
  google_review_id: string | null;
  auto_responded: boolean;
  response_status: 'pending' | 'auto_published' | 'needs_review' | 'manually_published' | 'rejected';
  response_published_at: string | null;
  service_slug: string | null;
  review_url: string | null;
  created_at: string;
}

/** GBP post stored in Supabase */
export interface GBPPostRow {
  id: string;
  content: string;
  post_type: 'seasonal_tip' | 'service_spotlight' | 'community' | 'offer';
  service_slug: string | null;
  image_path: string | null;
  cta_url: string | null;
  google_post_id: string | null;
  status: 'draft' | 'published' | 'removed' | 'rejected';
  published_at: string | null;
  removed_at: string | null;
  removal_reason: string | null;
  created_at: string;
}

/** Content rule from Supabase */
export interface ContentRule {
  id: string;
  rule_type: 'blocked_word' | 'blocked_pattern' | 'required_keyword' | 'cta_url';
  value: string;
  reason: string | null;
  active: boolean;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  violations: string[];
}

/** Post type rotation */
export const POST_TYPES = ['seasonal_tip', 'service_spotlight', 'community', 'offer'] as const;

/** Service slug to image mapping */
export const SERVICE_IMAGES: Record<string, string[]> = {
  mowing: ['/gallery/mulching-combined.png'],
  mulching: ['/gallery/mulching-combined.png', '/gallery/mulching-combined-2.png'],
  'garden-beds': ['/gallery/garden-beds-combined.png'],
  weeding: ['/gallery/weeding-combined.png', '/gallery/weeding-cleanup-combined.png'],
  pruning: ['/gallery/pruning-combined.png', '/gallery/pruning-combined-2.png'],
  fertilization: ['/gallery/fertilization-combined.png'],
  herbicide: ['/gallery/herbicide-combined.png'],
  aeration: ['/gallery/fertilization-combined.png'],
  'gutter-cleaning': ['/gallery/gutter-cleaning-combined.png', '/gallery/gutter-cleaning-combined-1.png'],
  'gutter-guards': ['/gallery/gutter-guards-combined.png'],
  'leaf-removal': ['/gallery/leaf-removal-combined.png', '/gallery/leaf-removal-combined-1.png'],
  'spring-cleanup': ['/gallery/weeding-cleanup-combined.png'],
  'fall-cleanup': ['/gallery/leaf-removal-combined.png'],
  'snow-removal': ['/gallery/gutter-cleaning-combined.png'],
};

/** 12 service area cities for community posts */
export const SERVICE_CITIES = [
  'Madison', 'Middleton', 'Waunakee', 'Sun Prairie', 'Fitchburg',
  'Verona', 'Monona', 'McFarland', 'DeForest', 'Cottage Grove',
  'Oregon', 'Stoughton',
] as const;
