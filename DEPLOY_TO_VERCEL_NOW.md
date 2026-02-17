# 🚀 Deploy to Vercel - Step by Step Guide

## 🎯 **Current Situation**

- ✅ GitHub Actions workflow is set up
- ✅ Secrets are configured
- ✅ API endpoint file created (`api/credits/monthly-reset.ts`)
- ❌ **Not deployed to Vercel yet** → That's why you get 404

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Commit All Changes**

Make sure all files are committed:

```bash
# Check what files need to be committed
git status

# Add all new/modified files
git add .

# Commit
git commit -m "Add Vercel serverless function for credit reset and fix deployment config"

# Push to GitHub
git push
```

**Files to commit:**
- ✅ `api/credits/monthly-reset.ts` (NEW - Credit reset endpoint)
- ✅ `vercel.json` (Updated - Removed cron, fixed routing)
- ✅ `api/server.ts` (Updated - Skip static files)
- ✅ `.github/workflows/monthly-credit-reset.yml` (NEW - GitHub Actions cron)

---

### **Step 2: Go to Vercel Dashboard**

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in (if not already)
3. You should see your project or need to import it

---

### **Step 3: Import/Deploy Your Project**

#### **If Project Already Exists:**
1. Click on your project: **zol-studio** (or your project name)
2. Go to **Deployments** tab
3. Click **...** (three dots) → **Redeploy**
4. Or it will auto-deploy when you push to GitHub

#### **If Project Doesn't Exist:**
1. Click **Add New...** → **Project**
2. Import from GitHub: **sanjay123-Ad/ZOL-Studio**
3. Click **Import**

---

### **Step 4: Configure Build Settings**

Vercel should auto-detect, but verify:

**Build & Development Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `./` (or leave empty)
- **Build Command:** `npm run build`
- **Output Directory:** `dist/client`
- **Install Command:** `npm install`

---

### **Step 5: Add Environment Variables**

**CRITICAL:** Add all environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add each variable (select all environments: Production, Preview, Development):

#### **Required Variables:**

**Supabase:**
```
SUPABASE_URL=https://wtxwgkiiwibgfnpfkckx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Lemon Squeezy Backend:**
```
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your-variant-id
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your-variant-id
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your-variant-id
```

**Lemon Squeezy Frontend (VITE_ prefix):**
```
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=your-variant-id
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your-variant-id
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your-variant-id
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your-variant-id
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your-variant-id
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your-variant-id
```

**Credit Reset:**
```
CREDIT_RESET_SECRET=zola-credit-reset-2024-secret-key
```

**Success URL:**
```
LEMONSQUEEZY_SUCCESS_URL=https://your-domain.vercel.app
```

**Optional:**
```
GEMINI_API_KEY=your-gemini-key (if using)
```

---

### **Step 6: Deploy**

1. After adding all environment variables
2. Click **Deploy** (or it will auto-deploy from GitHub)
3. Wait 2-5 minutes for build
4. Check deployment logs for errors

---

### **Step 7: Verify Deployment**

1. **Check Deployment Status:**
   - Should show "Ready" ✅
   - Get your deployment URL: `https://zol-studio.vercel.app` (or your domain)

2. **Test the Endpoint:**
   ```bash
   curl -X POST https://zol-studio.vercel.app/api/credits/monthly-reset \
     -H "x-reset-secret: zola-credit-reset-2024-secret-key" \
     -H "Content-Type: application/json"
   ```

   **Expected Response:**
   ```json
   {
     "message": "No users need credit reset",
     "reset": 0
   }
   ```

   **If you get 200 OK** → Endpoint is working! ✅

---

### **Step 8: Test GitHub Actions Workflow**

After Vercel deployment succeeds:

1. Go to GitHub → **Actions** tab
2. Click **Monthly Credit Reset**
3. Click **Run workflow** → **Run workflow**
4. Check logs

**Expected:**
- ✅ HTTP Status: 200 (not 404)
- ✅ JSON response
- ✅ No errors

---

## 🔍 **Troubleshooting**

### **Build Fails?**
- Check build logs in Vercel
- Verify all dependencies in `package.json`
- Check for TypeScript errors

### **Endpoint Still 404?**
- Make sure `api/credits/monthly-reset.ts` is committed
- Check Vercel Functions tab - should see the endpoint
- Verify deployment completed successfully

### **401 Unauthorized?**
- Check `CREDIT_RESET_SECRET` matches in:
  - Vercel environment variables
  - GitHub secrets
- Must be exactly the same value

### **Environment Variables Not Working?**
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

---

## ✅ **Quick Checklist**

Before deploying:
- [ ] All code committed and pushed to GitHub
- [ ] `api/credits/monthly-reset.ts` exists
- [ ] `vercel.json` is correct
- [ ] All environment variables ready to add

During deployment:
- [ ] Project imported/selected in Vercel
- [ ] Build settings configured
- [ ] All environment variables added
- [ ] Deployment started

After deployment:
- [ ] Deployment shows "Ready" ✅
- [ ] Test endpoint manually (should return 200)
- [ ] Test GitHub Actions workflow (should return 200)
- [ ] Check Vercel function logs

---

## 🎯 **Summary**

**What to Do:**
1. ✅ Commit all files (especially `api/credits/monthly-reset.ts`)
2. ✅ Push to GitHub
3. ✅ Deploy to Vercel (or auto-deploy)
4. ✅ Add all environment variables
5. ✅ Wait for deployment to complete
6. ✅ Test endpoint manually
7. ✅ Test GitHub Actions workflow

**After deployment, your cron job will work!** 🎉

---

## 📝 **Quick Command Summary**

```bash
# 1. Commit and push
git add .
git commit -m "Add Vercel serverless function and fix deployment"
git push

# 2. Go to Vercel and deploy (or wait for auto-deploy)

# 3. After deployment, test endpoint
curl -X POST https://your-domain.vercel.app/api/credits/monthly-reset \
  -H "x-reset-secret: zola-credit-reset-2024-secret-key"

# 4. Test GitHub Actions workflow
# (Go to GitHub → Actions → Run workflow)
```

**You're ready to deploy!** 🚀






