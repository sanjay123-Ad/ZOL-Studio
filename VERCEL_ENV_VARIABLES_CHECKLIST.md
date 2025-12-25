# ✅ Vercel Environment Variables Checklist

## 📋 Complete List of Required Environment Variables

Based on your codebase analysis, here's **everything** you need to add to Vercel:

---

## 🔴 **CRITICAL - Must Have (Backend/Server)**

### **Supabase:**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

### **Lemon Squeezy (Backend):**
```
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_WEBHOOK_SECRET
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID
```

**📝 Code Reference:** `server.ts` lines 31-36, 94-99
- **Primary:** Uses `LEMONSQUEEZY_*_VARIANT_ID` (WITHOUT `VITE_` prefix)
- **Fallback:** Has backward compatibility with `VITE_LEMONSQUEEZY_*_VARIANT_ID`
- **Best Practice:** Use WITHOUT `VITE_` prefix for backend

### **Credit Reset (For Cron Job):**
```
CREDIT_RESET_SECRET
```

### **Lemon Squeezy Success URL:**
```
LEMONSQUEEZY_SUCCESS_URL
```
*(Set this to your production domain, e.g., `https://yourdomain.com`)*

---

## 🟡 **CRITICAL - Must Have (Frontend)**

### **Lemon Squeezy Variant IDs (Frontend - VITE_ prefix):**
```
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID
```

**📝 Code Reference:** `PricingPage.tsx` lines 158-167, `LandingPage.tsx` lines 462-471
- **Required:** Uses `VITE_LEMONSQUEEZY_*_VARIANT_ID` (WITH `VITE_` prefix)
- **Access:** `import.meta.env.VITE_LEMONSQUEEZY_*_VARIANT_ID`

**⚠️ IMPORTANT:** 
- **Frontend:** MUST use `VITE_` prefix (required by Vite)
- **Backend:** Should use WITHOUT `VITE_` prefix (has fallback, but best practice is non-VITE_)

---

## 🟢 **Optional (If Using)**

```
GEMINI_API_KEY
```
*(Only if you're using Google Gemini AI)*

---

## ✅ **Quick Checklist**

Copy this and check off each one:

### **Backend Variables (No VITE_ prefix):**
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `LEMONSQUEEZY_API_KEY`
- [ ] `LEMONSQUEEZY_STORE_ID`
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET`
- [ ] `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
- [ ] `LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID`
- [ ] `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID`
- [ ] `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID`
- [ ] `LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID`
- [ ] `LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID`
- [ ] `CREDIT_RESET_SECRET` ⚠️ **MISSING IF NOT IN YOUR .env.local**
- [ ] `LEMONSQUEEZY_SUCCESS_URL` ⚠️ **MISSING IF NOT IN YOUR .env.local**

### **Frontend Variables (VITE_ prefix):**
- [ ] `VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
- [ ] `VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID`
- [ ] `VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID`
- [ ] `VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID`
- [ ] `VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID`
- [ ] `VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID`

---

## 🚨 **Most Likely Missing Variables**

Based on your `.env.local` (lines 1-22), you're probably **MISSING**:

1. **`CREDIT_RESET_SECRET`** ⚠️ **REQUIRED for cron job**
   - This is needed for the monthly credit reset endpoint
   - Generate a random secret: `zola-credit-reset-2024-secret-key` (or any secure string)

2. **`LEMONSQUEEZY_SUCCESS_URL`** ⚠️ **RECOMMENDED**
   - Set to your production domain: `https://yourdomain.com`
   - Or use Vercel URL: `https://your-app.vercel.app`

---

## 📝 **How to Add in Vercel**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. For each variable:
   - Click **Add**
   - Enter **Name** (exactly as shown above)
   - Enter **Value** (from your `.env.local`)
   - Select **all environments**: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

---

## 🔍 **How to Verify Your .env.local Has Everything**

Count your variables:

**Minimum Required:**
- **Backend:** 13 variables (Supabase: 2, Lemon Squeezy: 9, Credit Reset: 1, Success URL: 1)
- **Frontend:** 6 variables (all VITE_ prefixed)
- **Total:** 19 variables minimum

**If you have less than 19, you're missing something!**

---

## ✅ **Final Answer**

**If your `.env.local` has lines 1-22, you likely have:**
- ✅ Most backend variables
- ✅ Most frontend variables
- ❌ **Probably missing:** `CREDIT_RESET_SECRET`
- ❌ **Probably missing:** `LEMONSQUEEZY_SUCCESS_URL` (or it's set to localhost)

**Add these 2 missing ones to Vercel!**

---

## 🔍 **Code-Based Verification**

Based on actual code analysis:

### **Backend (`server.ts`):**
```typescript
// Lines 31-36: PRIMARY (without VITE_)
const basicMonthly = process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID 
  || process.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID; // Fallback
```
✅ **Use:** `LEMONSQUEEZY_*_VARIANT_ID` (without `VITE_` prefix)

### **Frontend (`PricingPage.tsx`, `LandingPage.tsx`):**
```typescript
// Lines 158-167: REQUIRED (with VITE_)
monthly: import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID
```
✅ **Use:** `VITE_LEMONSQUEEZY_*_VARIANT_ID` (with `VITE_` prefix)

**Conclusion:** You need BOTH sets in Vercel:
- Backend: `LEMONSQUEEZY_*_VARIANT_ID` (without VITE_)
- Frontend: `VITE_LEMONSQUEEZY_*_VARIANT_ID` (with VITE_)

---

## 🎯 **Quick Copy-Paste for Vercel**

Add these to Vercel (if missing):

```
CREDIT_RESET_SECRET=zola-credit-reset-2024-secret-key
LEMONSQUEEZY_SUCCESS_URL=https://yourdomain.com
```

*(Replace `yourdomain.com` with your actual domain)*

---

## 📞 **Still Not Sure?**

Share your `.env.local` variable **names only** (not values) and I'll tell you exactly what's missing!

Example:
```
I have:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- LEMONSQUEEZY_API_KEY
... etc
```

