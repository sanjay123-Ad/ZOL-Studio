# AI Pose Mimic - User-Based Storage Structure

## ✅ User Isolation Guarantee

The AI Pose Mimic storage is **completely separated by user**. Each user's files are stored in their own dedicated folder, and policies ensure users can **ONLY** access their own files.

## 📁 Storage Structure

```
pose_mimic/
  ├── {user-id-1}/                    ← User 1's dedicated folder
  │   ├── pose-file1-1234567890.png
  │   ├── pose-file2-1234567891.png
  │   └── pose-file3-1234567892.png
  │
  ├── {user-id-2}/                    ← User 2's dedicated folder
  │   ├── pose-file1-1234567893.png
  │   └── pose-file2-1234567894.png
  │
  └── {user-id-3}/                    ← User 3's dedicated folder
      └── pose-file1-1234567895.png
```

## 🔒 Security & Isolation

### How User Separation Works:

1. **File Path Structure:**
   - Format: `{userId}/pose-{fileId}-{timestamp}.png`
   - The first folder level is **always** the user's ID
   - Example: `bf02cc68-ba0e-4dc4-932a-094795f73aa9/pose-abc123-1699123456789.png`

2. **Policy Enforcement:**
   - All policies check: `(storage.foldername(name))[1] = auth.uid()::text`
   - This ensures the first folder matches the authenticated user's ID
   - Users **cannot** access files outside their own folder

3. **Operations Per User:**
   - ✅ **Upload:** Only to `{userId}/` folder
   - ✅ **Read:** Only from `{userId}/` folder
   - ✅ **Update:** Only files in `{userId}/` folder
   - ✅ **Delete:** Only files in `{userId}/` folder

## 🛡️ Policy Protection

The storage policies ensure:

| Operation | Policy Check | Result |
|-----------|-------------|--------|
| Upload | Folder must be `{auth.uid()}/` | ✅ User can only upload to own folder |
| Read | Folder must be `{auth.uid()}/` | ✅ User can only read own files |
| Update | Folder must be `{auth.uid()}/` | ✅ User can only update own files |
| Delete | Folder must be `{auth.uid()}/` | ✅ User can only delete own files |

## 💻 Code Implementation

### Upload Function
```typescript
// File path includes userId as first folder
const filePath = `${userId}/${fileName}`;
// Example: "bf02cc68-ba0e-4dc4-932a-094795f73aa9/pose-abc123-1699123456789.png"
```

### Delete Function
```typescript
// Lists only files in user's folder
const { data: files } = await supabase.storage
    .from(POSE_MIMIC_BUCKET)
    .list(userId); // Only lists {userId}/ folder
```

### Policy Check
```sql
-- All policies use this check:
(storage.foldername(name))[1] = auth.uid()::text
-- This extracts the first folder and compares with user ID
```

## ✅ Verification Checklist

After setup, verify user isolation:

1. **Upload Test:**
   - User A uploads a file
   - Check Supabase Storage → Should be in `{userA-id}/` folder
   - User B cannot see or access this file

2. **Access Test:**
   - User A can read their own files ✅
   - User A cannot read User B's files ❌ (blocked by policy)

3. **Delete Test:**
   - User A deletes their folder
   - Only User A's files are deleted
   - User B's files remain untouched ✅

## 🔍 How to Verify in Supabase Dashboard

1. Go to **Storage** → `pose_mimic` bucket
2. You'll see folders named with user IDs:
   ```
   bf02cc68-ba0e-4dc4-932a-094795f73aa9/
   another-user-id/
   yet-another-user-id/
   ```
3. Each folder contains only that user's files
4. Users cannot access folders that don't match their ID

## 📊 Benefits

✅ **Complete Isolation** - Each user's files are in separate folders  
✅ **Security** - Policies prevent cross-user access  
✅ **Scalability** - Easy to manage per-user storage quotas  
✅ **Cleanup** - Easy to delete all files for a specific user  
✅ **Organization** - Clear folder structure for admin management  

## 🚨 Important Notes

- **Never** store files outside the `{userId}/` folder structure
- **Always** use the userId as the first folder level
- The policies will **automatically block** any attempts to access other users' folders
- Each user's folder is **completely independent** and isolated

## 📝 Setup Instructions

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase_pose_mimic_storage_policy.sql`
3. Run the SQL script
4. Verify the bucket and policies are created:
   - Go to Storage → You should see `pose_mimic` bucket
   - Click on the bucket → Go to "Policies" tab
   - You should see 4 policies:
     - "Users can upload to their own folder"
     - "Users can read their own files"
     - "Users can update their own files"
     - "Users can delete their own files"
5. Test the setup by uploading a file through the app










