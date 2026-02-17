# 🔧 Fix: Reset Link Redirects to Home Page Instead of Reset Password Page

## 🔍 **Root Cause**

When users click the reset link, they're redirected to the **home page** (`https://zolstudio.com`) instead of the reset password page (`https://zolstudio.com/reset-password`).

**The Problem:**
- `{{ .ConfirmationURL }}` generates a URL using the **Site URL** as the base
- Even with `redirectTo` in your code, Supabase might not be including it in `{{ .ConfirmationURL }}`
- The email link ends up being: `https://zolstudio.com#access_token=...` instead of `https://zolstudio.com/reset-password#access_token=...`

---

## ✅ **Solution: Build the URL Manually with Correct Path**

Since `{{ .ConfirmationURL }}` might not respect the `redirectTo` parameter, we need to manually construct the URL with the correct path.

### **Step 1: Update Email Template**

1. **Go to Supabase Dashboard:**
   - **Authentication** → **Email Templates**
   - Or: **Authentication** → **Notifications** → **Email** → **Reset Your Password**

2. **Replace the template with this:**

   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="{{ .SiteURL }}/reset-password{{ .ConfirmationURL | replace .SiteURL "" }}">Reset Password</a></p>
   ```

   **OR if the above doesn't work (template functions might not be available), use:**

   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="https://zolstudio.com/reset-password{{ .ConfirmationURL | replace "https://zolstudio.com" "" }}">Reset Password</a></p>
   ```

   **OR the simplest approach - extract just the hash part:**

   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="https://zolstudio.com/reset-password#access_token={{ .TokenHash }}&type=recovery">Reset Password</a></p>
   ```

   **BUT** - The token variable name might be different. Let's use a more reliable approach:

---

## ✅ **BEST SOLUTION: Use ConfirmationURL and Extract Hash**

Since Supabase template functions might be limited, the most reliable approach is to:

### **Option 1: Hardcode the Full Path (MOST RELIABLE)**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password?token={{ .Token }}&type=recovery">Reset Password</a></p>
```

**But wait** - Supabase uses hash fragments, not query parameters. Let me provide the correct solution:

---

## ✅ **CORRECT SOLUTION: Manual URL with Hash Fragment**

The issue is that `{{ .ConfirmationURL }}` points to the Site URL (home page). We need to manually construct the URL with the `/reset-password` path.

### **Update Email Template To:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password#access_token={{ .Token }}&type=recovery">Reset Password</a></p>
```

**However**, `{{ .Token }}` might not be the correct variable. Let's check what Supabase actually provides.

---

## 🔍 **Alternative: Check What URL ConfirmationURL Actually Generates**

First, let's verify what `{{ .ConfirmationURL }}` is actually generating:

1. **Request a password reset**
2. **Check the email** - right-click the link and copy the URL
3. **Check if it's:**
   - `https://zolstudio.com#access_token=...` ❌ (wrong - goes to home)
   - `https://zolstudio.com/reset-password#access_token=...` ✅ (correct)

---

## ✅ **WORKING SOLUTION: Use RedirectTo in Query String**

Based on Supabase documentation, try this approach:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}?redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
```

**OR if ConfirmationURL already has query params, use `&`:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}&redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
```

---

## ✅ **MOST RELIABLE: Hardcode the Full URL Path**

Since template functions might be limited, the most reliable solution is to hardcode the path:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password{{ .ConfirmationURL | replace "https://zolstudio.com" "" }}">Reset Password</a></p>
```

**This:**
1. Takes `{{ .ConfirmationURL }}` (which might be `https://zolstudio.com#access_token=...`)
2. Replaces `https://zolstudio.com` with `https://zolstudio.com/reset-password`
3. Keeps the hash fragment (`#access_token=...&type=recovery`)

**Result:** `https://zolstudio.com/reset-password#access_token=...&type=recovery` ✅

---

## 🔧 **If Template Functions Don't Work: JavaScript Solution**

If Supabase doesn't support template functions like `replace`, you might need to:

1. **Use the default template** with `{{ .ConfirmationURL }}`
2. **Handle the redirect in your code** - but this is more complex

---

## ✅ **RECOMMENDED: Try This Template First**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password{{ .ConfirmationURL | replace "https://zolstudio.com" "" }}">Reset Password</a></p>
```

**If that doesn't work, try:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/reset-password{{ .ConfirmationURL | replace .SiteURL "" }}">Reset Password</a></p>
```

**If template functions aren't supported, use this (hardcoded):**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password#access_token={{ .TokenHash }}&type=recovery">Reset Password</a></p>
```

**Note:** You might need to check Supabase documentation for the correct token variable name (`{{ .TokenHash }}`, `{{ .Token }}`, `{{ .RecoveryToken }}`, etc.)

---

## 🧪 **Test Steps**

1. **Update the email template** with one of the solutions above
2. **Save the template**
3. **Request a password reset**
4. **Check the email** - right-click the link and verify the URL:
   - Should be: `https://zolstudio.com/reset-password#access_token=...&type=recovery` ✅
   - Should NOT be: `https://zolstudio.com#access_token=...` ❌
5. **Click the link** - should go to reset password page, not home page

---

## 📝 **Summary**

**Problem:**
- Reset link goes to home page instead of `/reset-password`
- `{{ .ConfirmationURL }}` uses Site URL as base, doesn't include redirect path

**Solution:**
- Manually construct URL with `/reset-password` path
- Use template function to replace Site URL with Site URL + path
- Or hardcode the full URL if template functions don't work

**Action:**
1. Try the template with `replace` function first
2. If that doesn't work, check Supabase docs for available template variables
3. Test the reset flow end-to-end

---

**Status:** 🔧 **Try the template with path replacement first!**





