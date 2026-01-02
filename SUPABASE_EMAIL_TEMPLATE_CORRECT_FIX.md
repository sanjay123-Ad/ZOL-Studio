# ✅ Supabase Password Reset Email Template - CORRECT FIX

## 🔍 **Problem Identified**

The error "Auth session missing!" occurs because:
- ❌ The token in the URL (`960443`) is **not a valid JWT token**
- ❌ Using `{{ .Token }}` in the template doesn't work correctly
- ❌ Supabase needs the **full confirmation URL** with proper token format

---

## ✅ **Solution: Use `{{ .ConfirmationURL }}`**

**DO NOT manually construct the URL!** Supabase provides `{{ .ConfirmationURL }}` which includes:
- ✅ The correct JWT token format
- ✅ The redirect path (from your `redirectTo` parameter)
- ✅ All required parameters (`access_token`, `type`, etc.)

---

## 🔧 **Correct Email Template**

### **Step 1: Update Email Template in Supabase**

1. **Go to Supabase Dashboard:**
   - **Authentication** → **Email Templates**
   - Or: **Authentication** → **Notifications** → **Email** → **Reset Your Password**

2. **Replace the template with:**

   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   ```

3. **Click "Save"**

---

## ✅ **Why This Works**

### **How `{{ .ConfirmationURL }}` Works:**

1. **Your code passes `redirectTo`:**
   ```typescript
   await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${window.location.origin}${PATHS.RESET_PASSWORD}`,
   });
   ```
   This generates: `https://zolstudio.com/reset-password`

2. **Supabase automatically builds `{{ .ConfirmationURL }}` with:**
   - Base URL: Your Site URL (`https://zolstudio.com`)
   - Redirect path: From your `redirectTo` parameter (`/reset-password`)
   - Token: Proper JWT format (not just a number)
   - Parameters: `access_token`, `type=recovery`, etc.

3. **The final URL will be:**
   ```
   https://zolstudio.com/reset-password#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=recovery
   ```
   (Proper JWT token, not just `960443`)

---

## ❌ **What NOT to Do**

**DO NOT use:**
```html
<!-- ❌ WRONG - Token is not a valid JWT -->
<a href="{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery">Reset Password</a>
```

**Why it fails:**
- `{{ .Token }}` might not be available or might be in wrong format
- Results in invalid token like `960443` instead of proper JWT
- Supabase can't establish a session with invalid token

---

## ✅ **What TO Do**

**USE:**
```html
<!-- ✅ CORRECT - Supabase generates everything automatically -->
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

**Why it works:**
- Supabase generates the complete URL with proper token
- Includes all required parameters automatically
- Matches the `redirectTo` from your code

---

## 🔍 **Verify Configuration**

Make sure these are set correctly:

### **1. Site URL:**
- **Authentication** → **URL Configuration**
- **Site URL:** `https://zolstudio.com` ✅

### **2. Redirect URLs:**
- Should include: `https://zolstudio.com/reset-password` ✅

### **3. Code (Already Correct):**
```typescript
// In pages/AuthPage.tsx
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}${PATHS.RESET_PASSWORD}`,
});
```

---

## 🧪 **Test After Update**

1. **Request Password Reset:**
   - Go to `https://zolstudio.com/auth`
   - Click "Forgot Password"
   - Enter email
   - Click "Send Reset Link"

2. **Check the Email:**
   - Open the reset email
   - The link should look like:
     ```
     https://zolstudio.com/reset-password#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM1MjE2ODAwLCJzdWIiOiIxMjM0NTY3OCIsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJleGFtcGxlQGV4YW1wbGUuY29tIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MzUyMTI4MDB9XSwic2Vzc2lvbl9pZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTAxMiJ9.signature&type=recovery
     ```
   - Notice the token is a **long JWT string**, not just a number ✅

3. **Click the Link:**
   - Should redirect to `/reset-password` page ✅
   - Should **NOT** show "Auth session missing!" error ✅
   - Should show the password reset form ✅

---

## 📝 **Available Supabase Template Variables**

For reference, here are the available variables:

- `{{ .SiteURL }}` - Your Site URL (`https://zolstudio.com`)
- `{{ .ConfirmationURL }}` - **Full confirmation URL with token** ✅ **USE THIS**
- `{{ .Token }}` - Token (but format may vary, not recommended)
- `{{ .Email }}` - User's email address
- `{{ .RedirectTo }}` - Redirect URL (from your code)

---

## 🎯 **Summary**

**Problem:**
- Using `{{ .Token }}` results in invalid token format
- Auth session can't be established
- Error: "Auth session missing!"

**Solution:**
- Use `{{ .ConfirmationURL }}` instead
- Supabase generates the complete URL automatically
- Includes proper JWT token and redirect path

**Action:**
1. Update email template to use `{{ .ConfirmationURL }}`
2. Remove manual URL construction
3. Save and test

**After Fix:**
- ✅ Reset links will have proper JWT tokens
- ✅ Auth session will be established correctly
- ✅ Users can reset passwords without errors

---

**Status:** ✅ **Use `{{ .ConfirmationURL }}` - This is the correct solution!**




