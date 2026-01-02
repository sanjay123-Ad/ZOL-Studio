# 🔍 Why Frontend Variables (VITE_ prefix) Are Needed

## 📋 Simple Explanation

Your frontend code **runs in the browser**, and your backend code **runs on the server**. They need **different** environment variables because:

1. **Vite Security Rule:** Only variables with `VITE_` prefix are exposed to the browser
2. **Your Frontend Code Uses:** `import.meta.env.VITE_LEMONSQUEEZY_*_VARIANT_ID`
3. **Without VITE_ prefix:** The frontend can't access the variable (it will be `undefined`)

---

## 🔍 Code Evidence

### **Frontend Code (PricingPage.tsx, LandingPage.tsx):**

```typescript
// Line 158-167: This code runs in the BROWSER
const variantIds = {
  'Basic': {
    monthly: import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID || '1124106',
    annual: import.meta.env.VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID || ''
  },
  // ... etc
};
```

**This code is in the browser!** It needs `VITE_` prefix to work.

### **Backend Code (server.ts):**

```typescript
// Line 31-36: This code runs on the SERVER
const basicMonthly = process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID 
  || process.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID;
```

**This code is on the server!** It can use either, but prefers without `VITE_`.

---

## 🎯 Why Both Are Needed

### **Scenario: User Clicks "Get Started" Button**

1. **Frontend (Browser):**
   - User clicks button on Pricing Page
   - Code reads: `import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
   - **If missing:** Returns `undefined` → Error! ❌
   - **If present:** Gets variant ID → Works! ✅

2. **Backend (Server):**
   - Webhook from Lemon Squeezy arrives
   - Code reads: `process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
   - **If missing:** Falls back to VITE_ version → Works (but not ideal)
   - **If present:** Uses it directly → Works! ✅

---

## 🔐 Vite Security Feature

**Vite's Rule:**
- ✅ Variables with `VITE_` prefix → **Exposed to browser** (safe for public use)
- ❌ Variables without `VITE_` prefix → **Server-only** (kept secret)

**Why?**
- Prevents exposing secrets (API keys, tokens) to the browser
- Only safe, public config should have `VITE_` prefix
- Variant IDs are safe to expose (they're just product IDs)

---

## 📝 What Your .env.local Should Have

### **Option 1: Both Sets (Recommended)**

```bash
# Backend (server.ts uses these)
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=...

# Frontend (PricingPage.tsx, LandingPage.tsx use these)
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=...
```

**Why both?**
- Backend prefers non-VITE_ (cleaner, more secure)
- Frontend REQUIRES VITE_ (can't access without it)

### **Option 2: Only VITE_ (Works, but not ideal)**

```bash
# Only VITE_ versions
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
```

**What happens:**
- ✅ Frontend works (has VITE_ prefix)
- ⚠️ Backend works (uses fallback to VITE_ version)
- ❌ Not best practice (mixing frontend/backend vars)

---

## ✅ **Final Answer**

**Frontend variables ARE needed because:**

1. **Your frontend code uses them:**
   - `PricingPage.tsx` line 158: `import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
   - `LandingPage.tsx` line 462: `import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`

2. **Vite security rule:**
   - Only `VITE_` prefixed variables are available in the browser
   - Without `VITE_`, the variable will be `undefined` in the browser

3. **What happens without VITE_ variables:**
   - Frontend code tries to read variant ID
   - Gets `undefined`
   - Payment buttons won't work
   - Users see error: "Configuration Error"

---

## 🧪 Test It Yourself

**Try removing VITE_ variables from .env.local:**

1. Remove: `VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
2. Keep: `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`
3. Run your app
4. Click "Get Started" button
5. **Result:** Error! ❌ (variant ID is undefined)

**Why?** Because the frontend code can't access variables without `VITE_` prefix!

---

## 📊 Summary Table

| Variable Type | Where Used | Prefix Needed | Why |
|--------------|------------|---------------|-----|
| `LEMONSQUEEZY_*_VARIANT_ID` | Backend (server.ts) | ❌ No VITE_ | Server can access all env vars |
| `VITE_LEMONSQUEEZY_*_VARIANT_ID` | Frontend (PricingPage.tsx) | ✅ Yes VITE_ | Browser can ONLY access VITE_ vars |

---

## 🎯 **Conclusion**

**You MUST have both:**
- ✅ Backend variables (without VITE_) → For server-side webhook processing
- ✅ Frontend variables (with VITE_) → For browser-side payment button clicks

**Without frontend variables, your payment buttons won't work!**






