-- =====================================================
-- PRODUCT QUALITY FORGE STORAGE BUCKET SETUP
-- =====================================================
-- This SQL script creates the storage bucket and policies
-- for the Product Quality Forge feature.
-- Run this in your Supabase SQL Editor.
-- =====================================================

-- Step 1: Create the storage bucket (if it doesn't exist)
-- Note: If the bucket already exists, this will be ignored
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product_quality_forge',
  'product_quality_forge',
  false, -- Private bucket (users can only access their own files)
  52428800, -- 50MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - USER-BASED ISOLATION
-- =====================================================
-- IMPORTANT: All policies enforce user separation by checking
-- that the first folder level matches the authenticated user's ID.
-- File structure: product_quality_forge/{userId}/filename.png
-- This ensures complete isolation between users.
-- =====================================================

-- Policy 1: Users can ONLY upload files to their own folder
-- The folder name must match their user ID (auth.uid())
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can ONLY read files from their own folder
-- Prevents users from accessing other users' files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can ONLY update files in their own folder
-- Ensures users cannot modify other users' files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can ONLY delete files from their own folder
-- Prevents users from deleting other users' files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE STRUCTURE
-- =====================================================
-- Files are organized by user ID in separate folders:
-- 
-- product_quality_forge/
--   ├── {user-id-1}/
--   │   ├── forge-file1-1234567890.png
--   │   ├── forge-file2-1234567891.png
--   │   └── ...
--   ├── {user-id-2}/
--   │   ├── forge-file1-1234567892.png
--   │   └── ...
--   └── ...
--
-- Each user can ONLY access files in their own folder.
-- The policies enforce this by checking the first folder level.
-- =====================================================

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this script, verify the setup:
-- 1. Go to Storage in Supabase Dashboard
-- 2. You should see 'product_quality_forge' bucket
-- 3. Check that all 4 policies are created under "Policies" tab
-- 4. Test by uploading a file - it should be in {userId}/ folder
-- 5. Try accessing another user's folder - it should be blocked
-- =====================================================

