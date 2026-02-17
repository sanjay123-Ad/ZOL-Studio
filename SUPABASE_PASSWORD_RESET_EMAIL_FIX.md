# 🔧 Supabase Password Reset Email Fix

## 🔍 **Problem Identified**

When users click the password reset link in the email:
- ❌ They're redirected to the **home page** (`https://zolstudio.com`)
- ✅ They should be redirected to **reset password page** (`https://zolstudio.com/reset-password`)

**Root Cause:**
- The email template uses `{{ .ConfirmationURL }}` which is built from the **Site URL**
- Even though your code passes `redirectTo` in `resetPasswordForEmail()`, the email template needs to be updated to include the redirect path

---

## ✅ **Solution: Update Email Template**

### **Step 1: Update the Email Template in Supabase**

1. **Go to Supabase Dashboard:**
   - [https://app.supabase.com](https://app.supabase.com)
   - Your Project → **Authentication** → **Email Templates**
   - Or: **Authentication** → **Notifications** → **Email** → **Reset Your Password**

2. **Find the Email Template:**
   - You should see the "Reset Your Password" template
   - It currently shows:
     ```html
     <h2>Reset Password</h2>
     <p>Follow this link to reset the password for your user:</p>
     <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
     ```

3. **Update the Email Template:**
   
   **Option A: Use ConfirmationURL with redirect parameter (Recommended)**
   
   The `{{ .ConfirmationURL }}` should automatically include the redirect path if you've set it in your code. But to be safe, you can explicitly add it:
   
   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="{{ .ConfirmationURL }}&redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
   ```
   
   **Option B: Build the URL manually (More Control)**
   
   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery">Reset Password</a></p>
   ```
   
   **Option C: Use ConfirmationURL (Simplest - if it works)**
   
   Keep it as is, but make sure your code is passing the redirectTo correctly:
   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   ```

4. **Click "Save"** to save the template

---

## 🔍 **Verify Your Code Configuration**

Your code in `pages/AuthPage.tsx` already passes the redirect URL correctly:

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}${PATHS.RESET_PASSWORD}`,
});
```

This should generate: `https://zolstudio.com/reset-password`

---

## ✅ **Recommended Solution (Best Practice)**

### **Update Email Template to:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

**But also verify:**

1. **Site URL is correct:**
   - Go to **Authentication** → **URL Configuration**
   - **Site URL:** `https://zolstudio.com` ✅ (base domain only)

2. **Redirect URLs include reset-password:**
   - **Redirect URLs** should include: `https://zolstudio.com/reset-password` ✅

3. **The `{{ .ConfirmationURL }}` should automatically include:**
   - The Site URL as base
   - The token
   - The redirectTo parameter from your code

---

## 🧪 **Test After Update**

1. **Request Password Reset:**
   - Go to `https://zolstudio.com/auth`
   - Click "Forgot Password"
   - Enter your email
   - Click "Send Reset Link"

2. **Check the Email:**
   - Open the email from Supabase
   - Check the reset link URL
   - It should look like:
     ```
     https://zolstudio.com/reset-password#access_token=...&type=recovery
     ```

3. **Click the Link:**
   - Should redirect to `https://zolstudio.com/reset-password` ✅
   - Should show the password reset form ✅
   - Should NOT redirect to home page ❌

---

## 📝 **Alternative: Manual URL Construction**

If `{{ .ConfirmationURL }}` doesn't work, use this template:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery&redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
```

**Available Template Variables:**
- `{{ .SiteURL }}` - Your Site URL (`https://zolstudio.com`)
- `{{ .Token }}` - The recovery token
- `{{ .ConfirmationURL }}` - Full confirmation URL (should include redirect)

---

## 🎯 **Summary**

**Current Issue:**
- Email link goes to home page instead of `/reset-password`

**Solution:**
1. ✅ Keep Site URL as: `https://zolstudio.com` (base domain)
2. ✅ Update email template to use proper redirect path
3. ✅ Verify `redirectTo` is passed in code (already done ✅)
4. ✅ Test the reset flow

**After Fix:**
- ✅ Reset links will go to `/reset-password` page
- ✅ Users can reset their password correctly
- ✅ No more redirects to home page

---

**Status:** 🔧 **Needs Email Template Update**





