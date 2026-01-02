# Vercel Deployment Checklist - Quick Reference

## ✅ Step-by-Step Checklist

### **Phase 1: Prepare Your Code**

- [ ] **Push code to GitHub**
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/YOUR_USERNAME/zola-ai.git
  git push -u origin main
  ```

---

### **Phase 2: Create Vercel Account & Import**

- [ ] Go to [vercel.com](https://vercel.com) and sign up with GitHub
- [ ] Click **Add New...** → **Project**
- [ ] Import your **ZOLA-2.0** repository
- [ ] Click **Import**

---

### **Phase 3: Add Environment Variables**

**Before deploying, add ALL these in Vercel:**

#### **Supabase (Required):**
- [ ] `SUPABASE_URL` = `https://wtxwgkiiwibgfnpfkckx.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

#### **Lemon Squeezy (Required if using payments):**
- [ ] `LEMONSQUEEZY_API_KEY` = `ls_test_...` or `ls_live_...`
- [ ] `LEMONSQUEEZY_STORE_ID` = `your-store-id`
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` = `your-webhook-secret`
- [ ] `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID` = `your-variant-id`
- [ ] `LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID` = `your-variant-id`
- [ ] `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` = `your-variant-id`
- [ ] `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` = `your-variant-id`
- [ ] `LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID` = `your-variant-id`
- [ ] `LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID` = `your-variant-id`
- [ ] `LEMONSQUEEZY_SUCCESS_URL` = `https://yourdomain.com`

#### **Credit Reset (Required for cron):**
- [ ] `CREDIT_RESET_SECRET` = `zola-credit-reset-2024-secret-key`

#### **Other (If using):**
- [ ] `GEMINI_API_KEY` = `your-gemini-key` (if using Google AI)
- [ ] Any other API keys you use

**Important:** Select **all environments** (Production, Preview, Development) for each variable!

---

### **Phase 4: Deploy**

- [ ] Verify project settings (auto-detected should be fine)
- [ ] Click **Deploy**
- [ ] Wait 2-5 minutes for build
- [ ] Get your Vercel URL: `zola-ai.vercel.app` ✅

---

### **Phase 5: Verify Cron Job**

- [ ] Go to Vercel Dashboard → Your Project → **Crons** tab
- [ ] Verify cron job appears: `/api/credits/monthly-reset`
- [ ] Status should be **Active** ✅

---

### **Phase 6: Connect Domain (Hostinger)**

- [ ] Vercel Dashboard → Your Project → **Settings** → **Domains**
- [ ] Click **Add Domain**
- [ ] Enter your domain: `yourdomain.com`
- [ ] Copy DNS records from Vercel

**In Hostinger:**
- [ ] Log in to Hostinger
- [ ] Go to **Domains** → Your Domain → **DNS / Nameservers**
- [ ] Add DNS records (A and CNAME) from Vercel
- [ ] Wait 5-30 minutes for DNS propagation
- [ ] Verify status shows **Valid Configuration** in Vercel ✅

---

### **Phase 7: Test Everything**

- [ ] Visit your domain: `https://yourdomain.com` (should load app)
- [ ] Test cron endpoint manually:
  ```bash
  curl -X POST https://yourdomain.com/api/credits/monthly-reset \
    -H "x-reset-secret: your-secret-key"
  ```
- [ ] Check Vercel → **Crons** tab for execution history
- [ ] Test your app features (login, payments, etc.)

---

## 🎯 Summary

**Total Steps:**
1. ✅ Push to GitHub
2. ✅ Create Vercel account
3. ✅ Import project
4. ✅ Add environment variables
5. ✅ Deploy
6. ✅ Verify cron
7. ✅ Connect domain
8. ✅ Test

**Time Required:** ~30-45 minutes

**Result:** Your app is live with automatic credit resets! 🚀

---

## 📝 Environment Variables Quick Copy

Copy this list and fill in your values:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=
LEMONSQUEEZY_SUCCESS_URL=
CREDIT_RESET_SECRET=
```

---

## 🆘 Quick Troubleshooting

**Build fails?** → Check environment variables are all set

**Cron not showing?** → Make sure `vercel.json` is committed to GitHub

**Domain not connecting?** → Wait longer, check DNS records match exactly

**App not loading?** → Check Vercel deployment logs for errors







