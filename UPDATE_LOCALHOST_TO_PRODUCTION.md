# 🌐 Update Localhost to Production Domain - Complete Guide

## 🎯 **What Needs to Be Updated**

You need to replace `localhost` URLs with your production domain `https://zolstudio.com` in:

1. ✅ **Lemon Squeezy** - Success/Cancel URLs
2. ✅ **Supabase** - Auth redirect URLs (Google OAuth, Password Reset)
3. ✅ **Lemon Squeezy** - Webhook URL
4. ✅ **Environment Variables** - Vercel and `.env.local`

---

## 📋 **Step-by-Step Updates**

### **1. Update Environment Variables**

#### **A. In Vercel Dashboard:**

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. Find `LEMONSQUEEZY_SUCCESS_URL`
3. **Update to:**
   ```
   https://zolstudio.com/?payment=success
   ```
   Or:
   ```
   https://zolstudio.com/pricing
   ```
4. Click **Save**

#### **B. In Your `.env.local` (For Local Development):**

Keep localhost for local dev, but you can add production too:
```bash
# For production (Vercel uses this)
LEMONSQUEEZY_SUCCESS_URL=https://zolstudio.com/?payment=success

# For local development, you can still use:
# LEMONSQUEEZY_SUCCESS_URL=http://localhost:5173/pricing
```

---

### **2. Update Supabase Auth Redirect URLs**

#### **A. Google OAuth Redirect URI:**

1. **Go to Supabase Dashboard:**
   - [https://app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to **Authentication** → **Providers** → **Google**

2. **Update Authorized Redirect URIs:**
   - Find **"Authorized redirect URIs"** section
   - **Add your production domain:**
     ```
     https://zolstudio.com/auth/callback
     ```
   - **Keep localhost for development:**
     ```
     http://localhost:5173/auth/callback
     ```
   - Click **Save**

#### **B. Supabase Site URL:**

1. **Go to Supabase Dashboard:**
   - **Authentication** → **URL Configuration**

2. **Update Site URL:**
   - **Site URL:** `https://zolstudio.com`
   - **Redirect URLs:** Add:
     ```
     https://zolstudio.com/**
     https://zolstudio.com/auth/callback
     https://zolstudio.com/reset-password
     ```
   - Click **Save**

---

### **3. Update Google OAuth Console**

1. **Go to Google Cloud Console:**
   - [https://console.cloud.google.com](https://console.cloud.google.com)
   - Select your project
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Update Authorized Redirect URIs:**
   - Find **"Authorized redirect URIs"**
   - **Add:**
     ```
     https://zolstudio.com/auth/callback
     ```
   - **Keep localhost for development:**
     ```
     http://localhost:5173/auth/callback
     ```
   - Click **Save**

---

### **4. Update Lemon Squeezy Webhook URL**

1. **Go to Lemon Squeezy Dashboard:**
   - [https://app.lemonsqueezy.com](https://app.lemonsqueezy.com)
   - Go to **Settings** → **Webhooks**

2. **Update Webhook URL:**
   - Find your webhook
   - **Update URL to:**
     ```
     https://zolstudio.com/api/lemonsqueezy/webhook
     ```
   - Click **Save**

---

### **5. Update Lemon Squeezy Product Redirect URLs (Optional)**

This is optional since your API sets redirect URLs, but you can add as fallback:

1. **Go to Lemon Squeezy Dashboard:**
   - **Products** → Select each product (Basic, Pro, Agency)

2. **For each product:**
   - Go to **"Confirmation Modal"** or **"Share"** settings
   - Set **"Button Link"** or **"Redirect URL"** to:
     ```
     https://zolstudio.com/?payment=success
     ```
   - Click **Save**

---

## 📝 **Code Changes (If Needed)**

### **Check Your Code:**

Your code already uses `window.location.origin` for redirects, which is good! It automatically uses the current domain.

**In `AuthPage.tsx`:**
```typescript
// Line 207 - Already uses window.location.origin ✅
setRedirectUrl(window.location.origin);

// Line 357 - Already uses window.location.origin ✅
redirectTo: `${window.location.origin}${PATHS.RESET_PASSWORD}`,

// Line 371 - Already uses redirectUrl ✅
options: { redirectTo: redirectUrl },
```

**This is perfect!** Your code automatically uses the correct domain (localhost in dev, production in prod).

---

## ✅ **Complete Checklist**

### **Environment Variables:**
- [ ] Update `LEMONSQUEEZY_SUCCESS_URL` in Vercel to `https://zolstudio.com/?payment=success`
- [ ] Update `.env.local` (optional - for local dev)

### **Supabase:**
- [ ] Update Site URL to `https://zolstudio.com`
- [ ] Add redirect URLs:
  - `https://zolstudio.com/**`
  - `https://zolstudio.com/auth/callback`
  - `https://zolstudio.com/reset-password`
- [ ] Update Google OAuth redirect URI to `https://zolstudio.com/auth/callback`

### **Google OAuth:**
- [ ] Add `https://zolstudio.com/auth/callback` to Authorized Redirect URIs

### **Lemon Squeezy:**
- [ ] Update webhook URL to `https://zolstudio.com/api/lemonsqueezy/webhook`
- [ ] (Optional) Update product redirect URLs

---

## 🎯 **Quick Summary**

**What to Update:**

1. **Vercel Environment Variable:**
   - `LEMONSQUEEZY_SUCCESS_URL` = `https://zolstudio.com/?payment=success`

2. **Supabase Dashboard:**
   - Site URL: `https://zolstudio.com`
   - Redirect URLs: `https://zolstudio.com/**`

3. **Google OAuth Console:**
   - Redirect URI: `https://zolstudio.com/auth/callback`

4. **Lemon Squeezy:**
   - Webhook URL: `https://zolstudio.com/api/lemonsqueezy/webhook`

**Your code is already smart** - it uses `window.location.origin`, so it works automatically! ✅

---

## 🧪 **Test After Updates**

### **Test 1: Google OAuth**
1. Go to `https://zolstudio.com/auth`
2. Click "Sign in with Google"
3. Should redirect back to `https://zolstudio.com` after login ✅

### **Test 2: Password Reset**
1. Click "Forgot Password"
2. Enter email
3. Check email for reset link
4. Link should point to `https://zolstudio.com/reset-password` ✅

### **Test 3: Payment Flow**
1. Subscribe to a plan
2. Complete payment
3. Should redirect to `https://zolstudio.com/?payment=success` ✅

---

## ✅ **Summary**

**Update These:**
1. ✅ Vercel: `LEMONSQUEEZY_SUCCESS_URL`
2. ✅ Supabase: Site URL & Redirect URLs
3. ✅ Google OAuth: Redirect URI
4. ✅ Lemon Squeezy: Webhook URL

**Your Code:**
- ✅ Already uses `window.location.origin` (smart!)
- ✅ Automatically works in production
- ✅ No code changes needed!

**After updates, everything will use your production domain!** 🎉






