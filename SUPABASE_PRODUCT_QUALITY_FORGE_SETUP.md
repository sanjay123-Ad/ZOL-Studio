# Product Quality Forge - Supabase Storage Setup Guide

## Overview
The Product Quality Forge feature now uses Supabase Storage instead of localStorage to prevent quota exceeded errors. Generated images are stored in Supabase and only file paths are saved in localStorage.

## Setup Instructions

### Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name:** `product_quality_forge`
   - **Public:** `No` (Private bucket)
   - **File size limit:** `50 MB`
   - **Allowed MIME types:** `image/png`, `image/jpeg`, `image/jpg`, `image/webp`

### Step 2: Add Storage Policies

**Option A: Using SQL Editor (Recommended)**

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase_product_quality_forge_storage_policy.sql`
4. Click **"Run"** to execute

**Option B: Using Dashboard**

1. Go to **Storage** → **Policies** tab
2. Select the `product_quality_forge` bucket
3. Add the following policies:

#### Policy 1: Upload (INSERT)
- **Policy name:** `Users can upload to their own folder`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **USING expression:** 
  ```sql
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **WITH CHECK expression:** Same as USING

#### Policy 2: Read (SELECT)
- **Policy name:** `Users can read their own files`
- **Allowed operation:** `SELECT`
- **Target roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```

#### Policy 3: Update (UPDATE)
- **Policy name:** `Users can update their own files`
- **Allowed operation:** `UPDATE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **WITH CHECK expression:** Same as USING

#### Policy 4: Delete (DELETE)
- **Policy name:** `Users can delete their own files`
- **Allowed operation:** `DELETE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'product_quality_forge' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  ```

### Step 3: Verify Setup

1. Check that the bucket `product_quality_forge` exists
2. Verify all 4 policies are created
3. Test by generating an image in the Product Quality Forge page

## How It Works

### Storage Structure
```
product_quality_forge/
  └── {userId}/
      ├── forge-{fileId}-{timestamp}.png
      ├── forge-{fileId}-{timestamp}.png
      └── ...
```

### Data Flow

1. **Image Generation:**
   - User generates an image
   - Image is uploaded to Supabase Storage
   - File path is stored in localStorage (not the image data)
   - Signed URL is generated for immediate display

2. **State Persistence:**
   - Only file paths, statuses, and metadata are saved to localStorage
   - Actual image data stays in Supabase
   - On page reload, images are loaded from Supabase using stored paths

3. **Cleanup:**
   - When user clicks "Reset Workspace", Supabase folder is deleted
   - localStorage state is cleared

## Benefits

✅ **No localStorage quota errors** - Images stored in Supabase  
✅ **Scalable** - No size limitations like localStorage  
✅ **Secure** - Users can only access their own files  
✅ **Persistent** - Images survive browser cache clears  
✅ **Efficient** - Only metadata stored locally  

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket with exact name: `product_quality_forge`

### Error: "Policy violation"
- Verify all 4 policies are created correctly
- Check that user is authenticated

### Error: "Upload failed"
- Check file size (must be < 50MB)
- Verify MIME type is allowed
- Check Supabase storage quota

## File Size Limits

- **Per file:** 50 MB
- **Total storage:** Depends on your Supabase plan
- **Recommended:** Monitor storage usage in Supabase Dashboard











