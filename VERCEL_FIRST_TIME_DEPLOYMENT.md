# First-Time Vercel Deployment Guide - ZOLA AI

## 🎯 Complete Step-by-Step Guide

This guide will walk you through deploying your ZOLA AI project to Vercel for the first time, then setting up the cron job and connecting your domain.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account (free)
- [ ] Your code pushed to GitHub repository
- [ ] Vercel account (free - we'll create it)
- [ ] Hostinger domain ready
- [ ] Supabase project set up
- [ ] Environment variables list ready

---

## 🚀 Part 1: Deploy to Vercel (First Time)

### **Step 1: Push Your Code to GitHub**

If your code isn't on GitHub yet:

1. **Create a GitHub repository:**
   - Go to [GitHub.com](https://github.com)
   - Click **New Repository**
   - Name it: `zola-ai` (or any name)
   - Make it **Private** (recommended) or Public
   - Don't initialize with README (you already have code)
   - Click **Create repository**

2. **Push your code:**
   ```bash
   # In your project folder (ZOLA-2.0)
   git init  # If not already a git repo
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/zola-ai.git
   git push -u origin main
   ```

   **Replace `YOUR_USERNAME`** with your GitHub username.

---

### **Step 2: Create Vercel Account**

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (recommended - easiest)
4. Authorize Vercel to access your GitHub
5. You're in! ✅

---

### **Step 3: Import Your Project to Vercel**

1. In Vercel Dashboard, click **Add New...** → **Project**
2. You'll see your GitHub repositories
3. Find your **ZOLA-2.0** (or `zola-ai`) repository
4. Click **Import**

---

### **Step 4: Configure Project Settings**

Vercel will auto-detect your settings, but verify:

**Framework Preset:**
- Should auto-detect as **Vite** or **Other**
- If not, select **Other**

**Root Directory:**
- Leave as `.` (root)

**Build Command:**
- Should be: `npm run build` (auto-detected)
- If not, enter: `npm run build`

**Output Directory:**
- Leave empty or set to `dist` (Vercel will handle it)

**Install Command:**
- Should be: `npm install` (auto-detected)

**Click "Deploy"** (but wait - we need to add environment variables first!)

---

### **Step 5: Add Environment Variables (IMPORTANT!)**

**Before clicking Deploy**, add your environment variables:

1. In the project configuration page, scroll down to **Environment Variables**
2. Click **Add** for each variable:

#### **Required Environment Variables:**

**1. Supabase:**
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**2. Lemon Squeezy (if using):**
```
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your-variant-id
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your-variant-id
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your-variant-id
LEMONSQUEEZY_SUCCESS_URL=https://yourdomain.com
```

**3. Credit Reset Secret:**
```
CREDIT_RESET_SECRET=zola-credit-reset-2024-secret-key
```

**4. Any other API keys you use:**
- Google AI keys
- Other service keys

**Important:**
- For each variable, select **all environments**: ✅ Production ✅ Preview ✅ Development
- Click **Add** after each one

---

### **Step 6: Deploy!**

1. After adding all environment variables
2. Click **Deploy** button
3. Wait 2-5 minutes for deployment
4. You'll see build logs in real-time
5. When done, you'll get a URL like: `zola-ai.vercel.app`

**🎉 Your app is live!**

---

## 🔧 Part 2: Configure Cron Job

### **Step 1: Verify `vercel.json` is in Your Repo**

Your `vercel.json` should already have:
```json
{
  "rewrites": [...],
  "crons": [
    {
      "path": "/api/credits/monthly-reset",
      "schedule": "0 0 * * *"
    }
  ]
}
```

If it's already there, you're good! ✅

### **Step 2: Verify Cron After Deployment**

1. Go to Vercel Dashboard → Your Project
2. Click **Crons** tab (should appear after first deployment)
3. You should see your cron job listed
4. Status should be **Active**

**If cron doesn't appear:**
- Make sure `vercel.json` is in your project root
- Redeploy: Go to **Deployments** → Click **...** → **Redeploy**

---

## 🌐 Part 3: Connect Your Hostinger Domain

### **Step 1: Add Domain in Vercel**

1. In Vercel Dashboard → Your Project
2. Go to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
5. Click **Add**

### **Step 2: Get DNS Records from Vercel**

Vercel will show you DNS records to add. You'll see something like:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Copy these values!**

### **Step 3: Add DNS Records in Hostinger**

1. Log in to [Hostinger](https://www.hostinger.com)
2. Go to **Domains** → Your Domain → **DNS / Nameservers**
3. Click **Manage DNS Records** or **DNS Zone Editor**

4. **Add the records Vercel provided:**
   - Click **Add Record**
   - Select **Type** (A or CNAME)
   - Enter **Name** (usually `@` for root or `www`)
   - Enter **Value** (from Vercel)
   - Click **Save**

5. **Repeat for all records** Vercel provided

### **Step 4: Wait for DNS Propagation**

- Usually takes **5-30 minutes**
- Can take up to **48 hours** (rare)
- Vercel will show status: **Valid Configuration** when ready

### **Step 5: Verify Domain**

1. In Vercel → **Domains** tab
2. Wait for status to show **Valid Configuration** ✅
3. Visit your domain in browser
4. Your app should load! 🎉

---

## ✅ Part 4: Final Verification

### **Checklist:**

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] Cron job visible in Vercel dashboard
- [ ] Domain added in Vercel
- [ ] DNS records added in Hostinger
- [ ] Domain shows "Valid Configuration"
- [ ] App loads on your domain

---

## 🧪 Test Your Setup

### **Test 1: Test Your App**

Visit your domain:
```
https://yourdomain.com
```

Should load your ZOLA AI app! ✅

### **Test 2: Test Cron Endpoint**

```bash
curl -X POST https://yourdomain.com/api/credits/monthly-reset \
  -H "x-reset-secret: your-secret-key"
```

**Expected response:**
```json
{
  "message": "No users need credit reset",
  "reset": 0
}
```

### **Test 3: Check Cron Status**

1. Vercel Dashboard → Your Project → **Crons**
2. You should see execution history
3. First run will be at midnight UTC

---

## 🎯 Summary

**What We Did:**
1. ✅ Pushed code to GitHub
2. ✅ Created Vercel account
3. ✅ Imported project to Vercel
4. ✅ Added environment variables
5. ✅ Deployed to Vercel
6. ✅ Verified cron job
7. ✅ Connected Hostinger domain
8. ✅ Configured DNS records

**Result:**
- ✅ Your app is live on your domain
- ✅ Cron job runs daily automatically
- ✅ Credits reset monthly for annual users
- ✅ Everything is automated! 🚀

---

## 🆘 Troubleshooting

### **Build Fails?**

**Common issues:**
- Missing environment variables → Add them in Vercel
- Build command wrong → Check `package.json` scripts
- TypeScript errors → Fix errors locally first

**Solution:**
- Check build logs in Vercel
- Fix errors
- Redeploy

### **Cron Not Appearing?**

- Make sure `vercel.json` is in project root
- Check it's committed to GitHub
- Redeploy the project

### **Domain Not Connecting?**

- Verify DNS records match exactly
- Wait longer (up to 48 hours)
- Check Hostinger DNS settings
- Contact Hostinger support if needed

### **App Not Loading?**

- Check environment variables are set
- Verify Supabase connection
- Check Vercel deployment logs
- Test with Vercel's default URL first

---

## 📞 Need Help?

If you get stuck:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test with Vercel's default URL first

**You're all set!** 🎉 Your ZOLA AI app will be live and running with automatic credit resets!







