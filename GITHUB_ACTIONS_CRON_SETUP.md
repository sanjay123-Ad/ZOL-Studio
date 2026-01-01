# ✅ GitHub Actions Cron Job Setup Guide

## 🎯 **Is GitHub Actions Cron Job Okay?**

**YES!** ✅ GitHub Actions is a **perfect free alternative** to Vercel Cron Jobs.

### **Advantages:**
- ✅ **100% Free** (unlimited for public repos, 2000 minutes/month for private)
- ✅ **Reliable** - GitHub's infrastructure
- ✅ **Easy to set up** - Just add a YAML file
- ✅ **Manual trigger** - Can run manually from GitHub UI
- ✅ **Logs** - See execution history and logs
- ✅ **No limits** - Unlike Vercel Hobby (2 cron limit)

---

## 📋 **Setup Steps**

### **Step 1: Create GitHub Secrets**

1. Go to your GitHub repository: `https://github.com/sanjay123-Ad/ZOL-Studio`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

#### **Secret 1: `VERCEL_CREDIT_RESET_URL`**
- **Name:** `VERCEL_CREDIT_RESET_URL`
- **Value:** `https://your-domain.vercel.app/api/credits/monthly-reset`
  - Replace `your-domain` with your actual Vercel domain (e.g., `zol-studio.vercel.app`)

#### **Secret 2: `CREDIT_RESET_SECRET`**
- **Name:** `CREDIT_RESET_SECRET`
- **Value:** Your secret key (same as in `.env.local`)
  - Example: `zola-credit-reset-2024-secret-key`

---

### **Step 2: Workflow File Created**

I've already created the workflow file for you:
- **Location:** `.github/workflows/monthly-credit-reset.yml`

**The file is ready!** Just commit and push it.

---

### **Step 3: Commit and Push**

```bash
git add .github/workflows/monthly-credit-reset.yml
git commit -m "Add GitHub Actions cron job for monthly credit reset"
git push
```

---

### **Step 4: Verify Setup**

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see **"Monthly Credit Reset"** workflow
4. Wait for the first run (or trigger manually)

---

## 🔍 **How It Works**

### **Schedule:**
- **Runs:** Daily at midnight UTC (`0 0 * * *`)
- **What it does:** Calls your Vercel endpoint `/api/credits/monthly-reset`
- **Security:** Uses secrets to authenticate

### **Manual Trigger:**
- Go to **Actions** → **Monthly Credit Reset** → **Run workflow**
- Click **Run workflow** button
- Useful for testing!

---

## 📊 **Workflow Details**

```yaml
name: Monthly Credit Reset

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Manual trigger

jobs:
  reset-credits:
    runs-on: ubuntu-latest
    steps:
      - name: Call Credit Reset Endpoint
        run: |
          curl -X POST ${{ secrets.VERCEL_CREDIT_RESET_URL }} \
            -H "x-reset-secret: ${{ secrets.CREDIT_RESET_SECRET }}"
```

---

## ✅ **Testing**

### **Test 1: Manual Trigger**
1. Go to GitHub → **Actions** tab
2. Click **Monthly Credit Reset**
3. Click **Run workflow** → **Run workflow**
4. Watch it execute
5. Check logs for success

### **Test 2: Check Vercel Logs**
1. Go to Vercel Dashboard
2. Check function logs for `/api/credits/monthly-reset`
3. Should see reset activity

---

## 🔐 **Security**

✅ **Secure because:**
- Secrets are encrypted
- Only accessible in GitHub Actions
- Not visible in logs
- Uses HTTPS

---

## 📅 **Schedule Options**

If you want to change the schedule, edit `.github/workflows/monthly-credit-reset.yml`:

```yaml
# Daily at midnight UTC (current)
- cron: '0 0 * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Every day at 2 AM UTC
- cron: '0 2 * * *'

# Every Monday at midnight UTC
- cron: '0 0 * * 1'
```

**Note:** GitHub Actions uses UTC timezone.

---

## 🐛 **Troubleshooting**

### **Workflow Not Running?**
1. Check if workflow file is in `.github/workflows/` folder
2. Verify YAML syntax is correct
3. Check GitHub Actions tab for errors

### **401 Unauthorized?**
1. Verify `CREDIT_RESET_SECRET` matches your Vercel env variable
2. Check secret name is exactly `CREDIT_RESET_SECRET`

### **404 Not Found?**
1. Verify `VERCEL_CREDIT_RESET_URL` is correct
2. Check your Vercel domain is correct
3. Make sure endpoint exists: `/api/credits/monthly-reset`

### **Check Logs:**
1. GitHub → **Actions** → Click on workflow run
2. Click on **reset-credits** job
3. See detailed logs

---

## 📊 **Monitoring**

### **View Execution History:**
- GitHub → **Actions** → **Monthly Credit Reset**
- See all runs (successful/failed)
- Click any run to see logs

### **View Vercel Logs:**
- Vercel Dashboard → Your Project → **Functions**
- Check `/api/credits/monthly-reset` logs

---

## ✅ **Summary**

**GitHub Actions Cron Job:**
- ✅ **Free** - No cost
- ✅ **Reliable** - GitHub infrastructure
- ✅ **Easy** - Just YAML file
- ✅ **Flexible** - Can change schedule easily
- ✅ **Secure** - Uses secrets
- ✅ **Visible** - See logs and history

**Perfect alternative to Vercel Cron!** 🎉

---

## 🚀 **Next Steps**

1. ✅ Workflow file created (`.github/workflows/monthly-credit-reset.yml`)
2. ⚠️ **Add GitHub Secrets:**
   - `VERCEL_CREDIT_RESET_URL`
   - `CREDIT_RESET_SECRET`
3. ✅ Commit and push
4. ✅ Test with manual trigger
5. ✅ Monitor execution

**You're all set!** 🎉




