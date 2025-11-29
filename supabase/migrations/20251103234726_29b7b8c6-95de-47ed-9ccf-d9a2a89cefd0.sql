-- Drop the existing incomplete policy
DROP POLICY IF EXISTS "Ambassadors can upload own content" ON storage.objects;

-- Create improved INSERT policy with role check
CREATE POLICY "Ambassadors can upload own content"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ambassador-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND has_role(auth.uid(), 'ambassador'::app_role)
);

-- Add missing UPDATE policy
CREATE POLICY "Ambassadors can update own content"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ambassador-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND has_role(auth.uid(), 'ambassador'::app_role)
);