-- AlterTable
ALTER TABLE "escrow" ADD COLUMN IF NOT EXISTS "image_url" TEXT;

-- Create public storage bucket for escrow cover images (off-chain only).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'escrow-images',
  'escrow-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for escrow cover images
DROP POLICY IF EXISTS "Public read escrow images" ON storage.objects;
CREATE POLICY "Public read escrow images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'escrow-images');
