-- =====================================================
-- Asset Generator Storage Policies (Fixed - Drops existing first)
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Policy 1: Allow Users to Upload Their Own Images
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'asset_generator' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow Users to Read Their Own Images
CREATE POLICY "Users can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'asset_generator' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow Users to Delete Their Own Images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'asset_generator' AND
  (storage.foldername(name))[1] = auth.uid()::text
);






