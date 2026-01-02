# ✅ Simple Fix: Reset Link Goes to Home Page

## 🔍 **The Problem**

When users click the reset link, it goes to `https://zolstudio.com` (home page) instead of `https://zolstudio.com/reset-password`.

**Why:**
- `{{ .ConfirmationURL }}` uses the Site URL as the base
- It doesn't automatically include the `redirectTo` path from your code
- The link becomes: `https://zolstudio.com#access_token=...` instead of `https://zolstudio.com/reset-password#access_token=...`

---

## ✅ **Simple Solution: Hardcode the Path**

Since Supabase email templates have limited functions, the simplest solution is to manually include the path:

### **Update Email Template:**

1. **Go to Supabase Dashboard:**
   - **Authentication** → **Email Templates**
   - Or: **Authentication** → **Notifications** → **Email** → **Reset Your Password**

2. **Replace the template with:**

   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p><a href="https://zolstudio.com/reset-password#access_token={{ .Token }}&type=recovery">Reset Password</a></p>
   ```

3. **Click "Save"**

---

## ⚠️ **If `{{ .Token }}` Doesn't Work**

Supabase might use a different variable name. Try these alternatives:

### **Option 1: Try `{{ .TokenHash }}`**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password#access_token={{ .TokenHash }}&type=recovery">Reset Password</a></p>
```

### **Option 2: Extract from ConfirmationURL (If Template Functions Work)**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password{{ .ConfirmationURL | replace "https://zolstudio.com" "" }}">Reset Password</a></p>
```

This takes `{{ .ConfirmationURL }}` (which is `https://zolstudio.com#access_token=...`) and replaces `https://zolstudio.com` with `https://zolstudio.com/reset-password`, keeping the hash part.

### **Option 3: Use SiteURL Variable**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery">Reset Password</a></p>
```

---

## 🔍 **How to Find the Correct Token Variable**

1. **Use the default template temporarily:**
   ```html
   <a href="{{ .ConfirmationURL }}">Reset Password</a>
   ```

2. **Request a password reset**

3. **Check the email** - right-click the link and copy the URL

4. **The URL will be something like:**
   ```
   https://zolstudio.com#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...&type=recovery
   ```

5. **The token is the part after `access_token=` and before `&type=recovery`**

6. **Now try to extract it in the template** - but since Supabase templates are limited, you might need to use `{{ .ConfirmationURL }}` and replace the base URL.

---

## ✅ **RECOMMENDED: Use ConfirmationURL with Path Replacement**

Try this template (if Supabase supports the `replace` function):

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="https://zolstudio.com/reset-password{{ .ConfirmationURL | replace "https://zolstudio.com" "" }}">Reset Password</a></p>
```

**What this does:**
- Takes: `https://zolstudio.com#access_token=...&type=recovery`
- Replaces: `https://zolstudio.com` → (empty)
- Result: `#access_token=...&type=recovery`
- Adds: `https://zolstudio.com/reset-password` in front
- Final: `https://zolstudio.com/reset-password#access_token=...&type=recovery` ✅

---

## 🧪 **Test After Update**

1. **Update the email template** with one of the solutions above
2. **Save the template**
3. **Request a password reset**
4. **Check the email** - the link should be:
   ```
   https://zolstudio.com/reset-password#access_token=...&type=recovery
   ```
5. **Click the link** - should go to reset password page ✅

---

## 📝 **If Nothing Works: Check Supabase Documentation**

If none of the template variables work, check:
- Supabase Dashboard → **Documentation** → **Email Templates**
- Look for available template variables
- Common ones: `{{ .SiteURL }}`, `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .RedirectTo }}`

---

## 🎯 **Quick Summary**

**Problem:** Reset link goes to home page (`https://zolstudio.com`) instead of reset password page (`https://zolstudio.com/reset-password`)

**Solution:** Manually include `/reset-password` path in the email template URL

**Try This First:**
```html
<a href="https://zolstudio.com/reset-password{{ .ConfirmationURL | replace "https://zolstudio.com" "" }}">Reset Password</a>
```

**If that doesn't work, try:**
```html
<a href="https://zolstudio.com/reset-password#access_token={{ .Token }}&type=recovery">Reset Password</a>
```

---

**Status:** 🔧 **Update template to include `/reset-password` path!**





