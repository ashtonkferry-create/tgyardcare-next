-- Phase 9: Blog category enrichment + tags column
-- Add tags column if not exists (category already exists from prior work)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Seed categories on existing posts based on slug patterns
UPDATE blog_posts SET category = 'seasonal-tips'
  WHERE (slug LIKE '%spring%' OR slug LIKE '%fall%' OR slug LIKE '%winter%' OR slug LIKE '%summer%')
  AND (category IS NULL OR category = '' OR category = 'lawn-care');

UPDATE blog_posts SET category = 'service-guides'
  WHERE (slug LIKE '%gutter%' OR slug LIKE '%mowing%' OR slug LIKE '%mulch%' OR slug LIKE '%fertiliz%')
  AND (category IS NULL OR category = '' OR category = 'lawn-care');

UPDATE blog_posts SET category = 'how-to'
  WHERE (slug LIKE '%how-to%' OR slug LIKE '%checklist%')
  AND (category IS NULL OR category = '' OR category = 'lawn-care');

UPDATE blog_posts SET category = 'local-guides'
  WHERE (slug LIKE '%madison%' OR slug LIKE '%dane%' OR slug LIKE '%wisconsin%')
  AND (category IS NULL OR category = '' OR category = 'lawn-care');

-- Default remaining uncategorized posts
UPDATE blog_posts SET category = 'lawn-care' WHERE category IS NULL OR category = '';
