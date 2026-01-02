# 🌐 Production Domain Setup - Complete Guide

## ✅ **Good News!**

Your code already uses `window.location.origin`, which means:
- ✅ **In development:** Uses `http://localhost:5173`
- ✅ **In production:** Uses `https://zolstudio.com` automatically
- ✅ **No code changes needed!** 🎉

**But you still need to update external service settings.**

---

## 📋 **What to Update**

### **1. Vercel Environment Variable** ⚠️ **IMPORTANT**

**Update `LEMONSQUEEZY_SUCCESS_URL`:**

1. Go to **Vercel Dashboard:**
   - Your Project → **Settings** → **Environment Variables**
   - Find `LEMONSQUEEZY_SUCCESS_URL`

2. **Update to:**
   ```
   https://zolstudio.com/?payment=success
   ```
   Or:
   ```
   https://zolstudio.com/pricing
   ```

3. **Select all environments:** ✅ Production ✅ Preview ✅ Development
4. Click **Save**
5. **Redeploy** (or wait for next deployment)

---

### **2. Supabase Dashboard** ⚠️ **IMPORTANT**

#### **A. Site URL:**

1. Go to **Supabase Dashboard:**
   - [https://app.supabase.com](https://app.supabase.com)
   - Your Project → **Authentication** → **URL Configuration**

2. **Update Site URL:**
   - **Site URL:** `https://zolstudio.com`

3. **Add Redirect URLs:**
   - Click **"Add URL"** or **"+"**
   - Add each of these:
     ```
     https://zolstudio.com/**
     https://zolstudio.com/auth/callback
     https://zolstudio.com/reset-password
     ```
   - **Keep localhost for development:**
     ```
     http://localhost:5173/**
     http://localhost:5173/auth/callback
     http://localhost:5173/reset-password
     ```

4. Click **Save**

#### **B. Google OAuth Provider:**

1. **Authentication** → **Providers** → **Google**

2. **Update Authorized Redirect URIs:**
   - Find **"Authorized redirect URIs"** section
   - **Add:**
     ```
     https://zolstudio.com/auth/callback
     ```
   - **Keep localhost:**
     ```
     http://localhost:5173/auth/callback
     ```

3. Click **Save**

---

### **3. Google Cloud Console** ⚠️ **IMPORTANT**

1. **Go to Google Cloud Console:**
   - [https://console.cloud.google.com](https://console.cloud.google.com)
   - Select your project
   - **APIs & Services** → **Credentials**
   - Click on your **OAuth 2.0 Client ID**

2. **Update Authorized Redirect URIs:**
   - Find **"Authorized redirect URIs"**
   - Click **"+ ADD URI"**
   - **Add:**
     ```
     https://zolstudio.com/auth/callback
     ```
   - **Keep localhost:**
     ```
     http://localhost:5173/auth/callback
     ```

3. Click **Save**

---

### **4. Lemon Squeezy Webhook** ⚠️ **IMPORTANT**

1. **Go to Lemon Squeezy Dashboard:**
   - [https://app.lemonsqueezy.com](https://app.lemonsqueezy.com)
   - **Settings** → **Webhooks**

2. **Update Webhook URL:**
   - Find your webhook (or create new one)
   - **Update URL to:**
     ```
     https://zolstudio.com/api/lemonsqueezy/webhook
     ```
   - **Events:** Make sure these are selected:
     - ✅ `subscription_created`
     - ✅ `subscription_updated`
     - ✅ `subscription_payment_success`

3. Click **Save** or **Update**

---

### **5. Lemon Squeezy Product Redirects (Optional)**

This is optional since your API sets redirect URLs dynamically.

1. **Lemon Squeezy Dashboard:**
   - **Products** → Select each product

2. **For each product:**
   - **Confirmation Modal** → **Button Link**
   - Set to: `https://zolstudio.com/?payment=success`
   - Click **Save**

**Note:** This is just a fallback. Your API already sets redirect URLs correctly.

---

## ✅ **Complete Checklist**

### **Environment Variables:**
- [ ] Update `LEMONSQUEEZY_SUCCESS_URL` in Vercel
- [ ] Value: `https://zolstudio.com/?payment=success`
- [ ] Redeploy after updating

### **Supabase:**
- [ ] Update Site URL: `https://zolstudio.com`
- [ ] Add Redirect URLs:
  - `https://zolstudio.com/**`
  - `https://zolstudio.com/auth/callback`
  - `https://zolstudio.com/reset-password`
- [ ] Update Google OAuth redirect URI

### **Google OAuth:**
- [ ] Add `https://zolstudio.com/auth/callback` to Authorized Redirect URIs

### **Lemon Squeezy:**
- [ ] Update webhook URL: `https://zolstudio.com/api/lemonsqueezy/webhook`
- [ ] (Optional) Update product redirect URLs

---

## 🧪 **Test After Updates**

### **Test 1: Google OAuth**
1. Visit: `https://zolstudio.com/auth`
2. Click "Sign in with Google"
3. Complete Google login
4. **Expected:** Redirects back to `https://zolstudio.com` ✅

### **Test 2: Password Reset**
1. Click "Forgot Password"
2. Enter your email
3. Check email for reset link
4. **Expected:** Link points to `https://zolstudio.com/reset-password` ✅

### **Test 3: Payment Flow**
1. Subscribe to a plan
2. Complete payment on Lemon Squeezy
3. **Expected:** Redirects to `https://zolstudio.com/?payment=success` ✅

### **Test 4: Webhook**
1. Complete a test subscription
2. Check Vercel logs
3. **Expected:** Webhook received and processed ✅

---

## 📝 **Summary**

**What Your Code Does (Already Smart!):**
- ✅ Uses `window.location.origin` automatically
- ✅ Works in both dev and production
- ✅ No code changes needed

**What You Need to Update:**
1. ✅ Vercel: `LEMONSQUEEZY_SUCCESS_URL`
2. ✅ Supabase: Site URL & Redirect URLs
3. ✅ Google OAuth: Redirect URI
4. ✅ Lemon Squeezy: Webhook URL

**After Updates:**
- ✅ All redirects use production domain
- ✅ OAuth works in production
- ✅ Payments redirect correctly
- ✅ Webhooks work correctly

**Everything will use your production domain!** 🎉






