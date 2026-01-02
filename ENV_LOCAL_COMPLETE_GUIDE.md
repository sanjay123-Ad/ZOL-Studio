# 📋 Complete .env.local File Guide

## ✅ **What to Add to Your .env.local File**

Here's the **complete list** of all environment variables you need:

---

## 🔴 **REQUIRED Variables (Must Have)**

### **1. Supabase (2 variables):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### **2. Lemon Squeezy Backend (3 variables):**
```bash
LEMONSQUEEZY_API_KEY=ls_test_your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

### **3. Lemon Squeezy Variant IDs - Backend (6 variables, NO VITE_ prefix):**
```bash
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your_basic_annual_variant_id
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your_pro_annual_variant_id
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your_agency_monthly_variant_id
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your_agency_annual_variant_id
```

### **4. Lemon Squeezy Variant IDs - Frontend (6 variables, WITH VITE_ prefix):**
```bash
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your_basic_annual_variant_id
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your_pro_annual_variant_id
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your_agency_monthly_variant_id
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your_agency_annual_variant_id
```

**⚠️ IMPORTANT:** Use the **SAME values** for both backend and frontend variant IDs!
- Backend: `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106`
- Frontend: `VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106` (same value!)

### **5. Credit Reset Secret (1 variable):**
```bash
CREDIT_RESET_SECRET=zola-credit-reset-2024-secret-key
```
*(Generate any random secure string)*

### **6. Lemon Squeezy Success URL (1 variable):**
```bash
LEMONSQUEEZY_SUCCESS_URL=http://localhost:5173/pricing
```
*(For production, change to: `https://yourdomain.com/pricing`)*

---

## 🟢 **OPTIONAL Variables (Only if Using)**

### **Google Gemini AI (If using):**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📊 **Total Count**

- **Required:** 19 variables
  - Supabase: 2
  - Lemon Squeezy Backend: 3
  - Variant IDs Backend: 6
  - Variant IDs Frontend: 6
  - Credit Reset: 1
  - Success URL: 1
- **Optional:** 1 (Gemini)

---

## 🎯 **Quick Copy-Paste Template**

Copy this into your `.env.local` file and fill in your values:

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Lemon Squeezy Backend
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# Variant IDs - Backend (No VITE_)
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=

# Variant IDs - Frontend (With VITE_)
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=

# Credit Reset
CREDIT_RESET_SECRET=zola-credit-reset-2024-secret-key

# Success URL
LEMONSQUEEZY_SUCCESS_URL=http://localhost:5173/pricing
```

---

## ⚠️ **Important Notes**

### **1. Same Values for Backend and Frontend Variant IDs:**
```bash
# These should have the SAME value:
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
```

### **2. Missing Variables:**
Based on your current setup, you're probably **missing**:
- `CREDIT_RESET_SECRET` ⚠️ **ADD THIS**
- `LEMONSQUEEZY_SUCCESS_URL` ⚠️ **ADD THIS** (or update if it's localhost)
- Frontend `VITE_` variables for Pro/Agency/Annual plans ⚠️ **ADD THESE**

### **3. For Production (Vercel):**
- Update `LEMONSQUEEZY_SUCCESS_URL` to your production domain
- Add ALL variables to Vercel (same as .env.local)

---

## ✅ **Checklist**

After adding to `.env.local`, verify you have:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `LEMONSQUEEZY_API_KEY`
- [ ] `LEMONSQUEEZY_STORE_ID`
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET`
- [ ] `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID` (no VITE_)
- [ ] `LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID` (no VITE_)
- [ ] `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` (no VITE_)
- [ ] `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` (no VITE_)
- [ ] `LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID` (no VITE_)
- [ ] `LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID` (no VITE_)
- [ ] `VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID` (with VITE_)
- [ ] `VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID` (with VITE_)
- [ ] `VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` (with VITE_)
- [ ] `VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` (with VITE_)
- [ ] `VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID` (with VITE_)
- [ ] `VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID` (with VITE_)
- [ ] `CREDIT_RESET_SECRET` ⚠️
- [ ] `LEMONSQUEEZY_SUCCESS_URL` ⚠️

**Total: 19 required variables**

---

## 📝 **Example .env.local File**

Here's a complete example (replace with your actual values):

```bash
# Supabase
SUPABASE_URL=https://wtxwgkiiwibgfnpfkckx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lemon Squeezy Backend
LEMONSQUEEZY_API_KEY=ls_test_abc123...
LEMONSQUEEZY_STORE_ID=251116
LEMONSQUEEZY_WEBHOOK_SECRET=my-zola-fashion

# Variant IDs - Backend
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=1124107
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=1124108
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=1124109
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=1124110
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=1124111

# Variant IDs - Frontend (SAME VALUES!)
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=1124107
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=1124108
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=1124109
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=1124110
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=1124111

# Credit Reset
CREDIT_RESET_SECRET=zola-credit-reset-2024-secret-key

# Success URL
LEMONSQUEEZY_SUCCESS_URL=http://localhost:5173/pricing
```

---

## 🎯 **Summary**

**Add to your `.env.local`:**

1. ✅ All your existing variables (keep them)
2. ✅ `CREDIT_RESET_SECRET` (new - required)
3. ✅ `LEMONSQUEEZY_SUCCESS_URL` (new or update if localhost)
4. ✅ Frontend `VITE_` variables for ALL plans (if missing)

**Total: 19 required variables minimum!**






