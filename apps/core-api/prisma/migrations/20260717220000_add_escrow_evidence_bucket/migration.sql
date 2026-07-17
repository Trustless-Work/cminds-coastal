-- Create public storage bucket for milestone evidence files (off-chain only).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'escrow-evidence',
  'escrow-evidence',
  true,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for evidence files (URLs are shared on transparency viewer)
DROP POLICY IF EXISTS "Public read escrow evidence" ON storage.objects;
CREATE POLICY "Public read escrow evidence"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'escrow-evidence');
