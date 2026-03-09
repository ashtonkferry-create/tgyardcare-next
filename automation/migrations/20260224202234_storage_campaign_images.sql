-- Migration: Storage Bucket for Campaign Images
-- Adapted for: TotalGuard Yard Care (TotalGuard LLC)
-- Creates the campaign-images storage bucket for social media posts,
-- door hanger images, and marketing campaign assets.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('campaign-images', 'campaign-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'campaign-images');

-- Allow authenticated upload
CREATE POLICY "Allow uploads to campaign-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'campaign-images');
