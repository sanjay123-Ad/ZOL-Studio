# Supabase Storage Setup for Asset Generator

This document explains how to set up Supabase Storage for the Asset Generator feature, including bucket creation and security policies.

## Overview

The Asset Generator stores all generated images (both single image and batch processing) in Supabase Storage. When users clear or reset their work, the images are automatically deleted from Supabase Storage.

## Storage Bucket Setup

### 1. Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `asset_generator`
   - **Public bucket**: ❌ **Unchecked** (Private bucket)
   - **File size limit**: 10 MB (or as needed)
   - **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg` (optional, for validation)

5. Click **Create bucket**

### 2. Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage** → **Policies** → Select `asset_generator` bucket.

#### Policy 1: Allow Users to Upload Their Own Images

**Policy Name**: `Users can upload their own images`

```sql
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'asset_generator' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation**: 
- Users can only upload files to folders named with their user ID
- Path format: `{userId}/filename.png`

#### Policy 2: Allow Users to Read Their Own Images

**Policy Name**: `Users can read their own images`

```sql
CREATE POLICY "Users can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'asset_generator' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation**: 
- Users can only read files from their own folder
- Prevents users from accessing other users' images

#### Policy 3: Allow Users to Delete Their Own Images

**Policy Name**: `Users can delete their own images`

```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'asset_generator' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Explanation**: 
- Users can only delete files from their own folder
- Allows cleanup when users clear/reset their work

## File Structure

Images are stored with the following structure:

```
asset_generator/
  └── {userId}/
      ├── asset-{timestamp}-{assetId}.png
      ├── asset-{timestamp}-{assetId}.png
      └── ...
```

**Example paths:**
- `abc123/asset-1703123456789-Upper_Body-T_Shirt.png`
- `abc123/asset-1703123457890-composed-outfit.png`
- `abc123/asset-1703123458901-file1-Upper_Body-Jacket.png`

## Implementation Details

### Upload Function
- **Function**: `uploadAssetGeneratorImage(userId, imageBase64, assetId, metadata)`
- **Location**: `services/db.ts`
- **Behavior**: 
  - Converts base64 to File
  - Uploads to `{userId}/{filename}`
  - Returns the file path for tracking

### Delete Functions
- **Single Image**: `deleteAssetGeneratorImage(filePath)`
- **All User Images**: `deleteAllAssetGeneratorImages(userId)`
- **Location**: `services/db.ts`
- **Behavior**: 
  - Deletes specific file or all files in user's folder
  - Called automatically when user clears/resets

### Automatic Cleanup
Images are automatically deleted when:
1. User clicks "Start Over" (single image mode)
2. User clicks "Clear All" (batch processing mode)
3. User navigates away and state is cleared

## Security Considerations

1. **Private Bucket**: The bucket is private, so users cannot access images via public URLs
2. **User Isolation**: Each user's files are in a separate folder based on their user ID
3. **RLS Policies**: All operations are restricted to the user's own folder
4. **Authentication Required**: All policies require `authenticated` role

## Testing

After setup, test the following:

1. **Upload Test**: Generate an asset and verify it appears in Supabase Storage
2. **Read Test**: Verify the image can be retrieved (if needed)
3. **Delete Test**: Clear/reset and verify images are deleted from Storage
4. **Security Test**: Try accessing another user's folder (should fail)

## Troubleshooting

### Issue: "new row violates row-level security policy"
- **Solution**: Ensure RLS policies are correctly set up and user is authenticated

### Issue: "Bucket not found"
- **Solution**: Verify bucket name is exactly `asset_generator` (case-sensitive)

### Issue: "Permission denied"
- **Solution**: Check that policies allow the operation (INSERT/SELECT/DELETE)

### Issue: Images not deleting
- **Solution**: Verify DELETE policy is set up correctly and file paths match user ID

## Maintenance

### Cleanup Orphaned Files
If needed, you can manually clean up orphaned files:

```sql
-- List all files in a user's folder
SELECT name FROM storage.objects 
WHERE bucket_id = 'asset_generator' 
AND (storage.foldername(name))[1] = 'USER_ID_HERE';
```

### Monitor Storage Usage
Check storage usage in Supabase Dashboard → Storage → `asset_generator` bucket

## Notes

- Images are stored permanently until explicitly deleted
- No automatic expiration is set (can be added if needed)
- File paths include timestamps to prevent collisions
- Each generated asset gets its own file in Supabase Storage






