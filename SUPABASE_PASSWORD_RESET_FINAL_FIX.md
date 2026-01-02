# 🔧 Supabase Password Reset - FINAL FIX (Redirect Path Issue)

## 🔍 **Problem Identified**

When users click the reset link:
- ❌ They're redirected to **home page** (`https://zolstudio.com`)
- ✅ They should be redirected to **reset password page** (`https://zolstudio.com/reset-password`)

**Root Cause:**
- `{{ .ConfirmationURL }}` might not be including the redirect path properly
- When Site URL is just the base domain (`https://zolstudio.com`), Supabase might default to redirecting there
- The `redirectTo` parameter from your code might not be reflected in `{{ .ConfirmationURL }}`

---

## ✅ **Solution: Explicitly Include Redirect Path**

### **Option 1: Use ConfirmationURL with Explicit Redirect (RECOMMENDED)**

Update the email template to explicitly append the redirect path:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}&redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
```

**Why this works:**
- Uses `{{ .ConfirmationURL }}` for the proper JWT token
- Explicitly adds `redirect_to` parameter to ensure correct redirect
- Supabase will process both the token and the redirect path

---

### **Option 2: Use RedirectTo Template Variable (If Available)**

Some Supabase versions support `{{ .RedirectTo }}`:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}{{ .RedirectTo }}#access_token={{ .Token }}&type=recovery">Reset Password</a></p>
```

**Note:** This might not work if `{{ .RedirectTo }}` is not available in your Supabase version.

---

### **Option 3: Hardcode the Path (MOST RELIABLE)**

Since your redirect path is always `/reset-password`, you can hardcode it:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/reset-password{{ .ConfirmationURL | replace .SiteURL "" }}">Reset Password</a></p>
```

**Or simpler approach - extract just the hash part:**

Actually, the best approach is to use `{{ .ConfirmationURL }}` but ensure the redirect is included. Let me provide the correct solution:

---

## ✅ **BEST SOLUTION: Use ConfirmationURL with Redirect Parameter**

### **Step 1: Update Email Template**

1. **Go to Supabase Dashboard:**
   - **Authentication** → **Email Templates**
   - Or: **Authentication** → **Notifications** → **Email** → **Reset Your Password**

2. **Update the template to:**

   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="{{ .ConfirmationURL }}&redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
   ```

3. **Click "Save"**

---

## 🔍 **Why This Works**

### **How the URL is Constructed:**

1. **`{{ .ConfirmationURL }}` generates:**
   ```
   https://zolstudio.com#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=recovery
   ```
   (Uses Site URL as base, includes token)

2. **Adding `&redirect_to=https://zolstudio.com/reset-password` makes it:**
   ```
   https://zolstudio.com#access_token=...&type=recovery&redirect_to=https://zolstudio.com/reset-password
   ```

3. **Supabase processes this and redirects to:**
   ```
   https://zolstudio.com/reset-password#access_token=...&type=recovery
   ```

---

## 🔧 **Alternative: Check Supabase Redirect URL Configuration**

If the above doesn't work, verify your Supabase configuration:

### **1. Site URL:**
- **Authentication** → **URL Configuration**
- **Site URL:** `https://zolstudio.com` ✅ (base domain)

### **2. Redirect URLs:**
- Must include: `https://zolstudio.com/reset-password` ✅
- Must include: `https://zolstudio.com/**` ✅ (wildcard)

### **3. Code (Verify it's correct):**
```typescript
// In pages/AuthPage.tsx - Line 356-358
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}${PATHS.RESET_PASSWORD}`,
});
```

This generates: `https://zolstudio.com/reset-password`

---

## 🧪 **Test After Update**

1. **Request Password Reset:**
   - Go to `https://zolstudio.com/auth`
   - Click "Forgot Password"
   - Enter email
   - Click "Send Reset Link"

2. **Check the Email:**
   - Open the reset email
   - **Right-click the link** → **Copy link address**
   - The URL should include:
     - `access_token=...` (long JWT token)
     - `type=recovery`
     - `redirect_to=https://zolstudio.com/reset-password`

3. **Click the Link:**
   - Should redirect to `https://zolstudio.com/reset-password` ✅
   - Should show the password reset form ✅
   - Should **NOT** redirect to home page ❌

---

## 📝 **If Still Not Working: Manual URL Construction**

If `{{ .ConfirmationURL }}` still doesn't work, you can manually construct it, but you'll need to get the token properly:

**Note:** This is a fallback option. The token format might vary.

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password#access_token={{ .TokenHash }}&type=recovery">Reset Password</a></p>
```

**But this might not work** because `{{ .TokenHash }}` might not be the correct variable name.

---

## 🎯 **Recommended Solution Summary**

**Use this email template:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}&redirect_to=https://zolstudio.com/reset-password">Reset Password</a></p>
```

**Configuration:**
- ✅ Site URL: `https://zolstudio.com` (base domain)
- ✅ Redirect URLs: Include `https://zolstudio.com/reset-password`
- ✅ Code: Already passes `redirectTo: https://zolstudio.com/reset-password`

**Why this works:**
- `{{ .ConfirmationURL }}` provides the proper JWT token
- Explicit `redirect_to` parameter ensures correct redirect
- Supabase processes both and redirects to the right page

---

## ✅ **Final Checklist**

- [ ] Site URL is: `https://zolstudio.com` (base domain only)
- [ ] Redirect URLs include: `https://zolstudio.com/reset-password`
- [ ] Email template uses: `{{ .ConfirmationURL }}&redirect_to=https://zolstudio.com/reset-password`
- [ ] Code passes: `redirectTo: https://zolstudio.com/reset-password`
- [ ] Test the reset flow end-to-end

---

**Status:** 🔧 **Use the template with explicit redirect_to parameter!**





