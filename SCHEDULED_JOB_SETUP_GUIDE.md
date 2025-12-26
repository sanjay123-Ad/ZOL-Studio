# Scheduled Job Setup Guide - Monthly Credit Reset

## 🤔 What is a Scheduled Job?

A **scheduled job** (also called a "cron job") is an automated task that runs at specific times without you having to do anything manually.

**Think of it like:**
- A robot that wakes up every day at midnight
- Checks if any users need their credits reset
- Automatically resets their credits
- Goes back to sleep until tomorrow

**Why you need it:**
- Your credit reset endpoint (`/api/credits/monthly-reset`) needs to be called automatically
- Without it, credits won't reset monthly - users would keep the same credits forever
- It ensures annual plan users get their monthly credit refresh

---

## 🎯 Your Options (Choose ONE)

Since you have `vercel.json`, you're likely using **Vercel**. Here are your best options:

### **Option 1: Vercel Cron (Easiest - Recommended if on Vercel)** ⭐

**Best for:** Projects deployed on Vercel

**Pros:**
- ✅ Built into Vercel (no external service needed)
- ✅ Free for hobby plan
- ✅ Very easy to set up
- ✅ Automatic and reliable

**Cons:**
- ❌ Only works if you're on Vercel

---

### **Option 2: GitHub Actions (Free & Works Everywhere)** ⭐⭐

**Best for:** Any deployment platform (Vercel, Netlify, Railway, etc.)

**Pros:**
- ✅ Completely free
- ✅ Works with any hosting
- ✅ Very reliable
- ✅ Easy to monitor

**Cons:**
- ❌ Requires GitHub repository

---

### **Option 3: External Cron Service (Simple Alternative)**

**Best for:** Quick setup without code changes

**Pros:**
- ✅ No code changes needed
- ✅ Works with any hosting
- ✅ Easy to set up

**Cons:**
- ❌ Requires external service account
- ❌ Some services have limits on free tier

---

## 🚀 Setup Instructions

### **Option 1: Vercel Cron (Recommended if on Vercel)**

#### **Step 1: Update `vercel.json`**

Add the cron configuration to your existing `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/credits/monthly-reset",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**What this means:**
- `"path"`: The endpoint to call
- `"schedule"`: `"0 0 * * *"` = Every day at midnight UTC

#### **Step 2: Add Environment Variable**

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `CREDIT_RESET_SECRET`
   - **Value:** `your-secret-key-here` (use a random string like `my-secret-123`)
   - **Environment:** Production, Preview, Development (select all)

#### **Step 3: Update Your Code**

The endpoint already checks for this secret. Make sure your `server.ts` has:

```typescript
const resetSecret = process.env.CREDIT_RESET_SECRET;
if (resetSecret && req.headers['x-reset-secret'] !== resetSecret) {
  return res.status(401).send('Unauthorized');
}
```

#### **Step 4: Deploy**

1. Commit and push your changes
2. Vercel will automatically deploy
3. The cron job will start running daily

**That's it!** ✅

---

### **Option 2: GitHub Actions (Works with Any Hosting)**

#### **Step 1: Create GitHub Actions Workflow**

Create this file: `.github/workflows/monthly-credit-reset.yml`

```yaml
name: Monthly Credit Reset

on:
  schedule:
    # Run daily at midnight UTC
    - cron: '0 0 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  reset-credits:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Credit Reset
        run: |
          curl -X POST https://your-domain.com/api/credits/monthly-reset \
            -H "Content-Type: application/json" \
            -H "x-reset-secret: ${{ secrets.CREDIT_RESET_SECRET }}"
```

**Important:** Replace `https://your-domain.com` with your actual domain!

#### **Step 2: Add GitHub Secret**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name:** `CREDIT_RESET_SECRET`
   - **Value:** `your-secret-key-here` (use a random string)

#### **Step 3: Commit and Push**

```bash
git add .github/workflows/monthly-credit-reset.yml
git commit -m "Add monthly credit reset scheduled job"
git push
```

**That's it!** ✅ GitHub Actions will run it daily.

---

### **Option 3: External Cron Service (EasyCron Example)**

#### **Step 1: Sign Up**

1. Go to [EasyCron.com](https://www.easycron.com) (or similar service)
2. Sign up for free account

#### **Step 2: Create Cron Job**

1. Click **Add Cron Job**
2. Fill in:
   - **URL:** `https://your-domain.com/api/credits/monthly-reset`
   - **Schedule:** Daily at 00:00 UTC
   - **HTTP Header:** 
     - Name: `x-reset-secret`
     - Value: `your-secret-key-here`
   - **HTTP Method:** POST

#### **Step 3: Save**

Click **Save** and the cron job will start running.

**That's it!** ✅

---

## 🔐 Security: Setting the Secret

**Generate a random secret:**

You can use any of these methods:

1. **Online generator:** https://randomkeygen.com/
2. **Command line:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Just make one up:** `zola-credit-reset-2024-secret-key-xyz123`

**Important:** 
- Use the SAME secret in both:
  - Your environment variable (`CREDIT_RESET_SECRET`)
  - Your cron job configuration (header value)

---

## 🧪 Testing Your Scheduled Job

### **Test 1: Manual Trigger (Before Setting Up Cron)**

```bash
curl -X POST http://localhost:5173/api/credits/monthly-reset \
  -H "x-reset-secret: your-secret-key"
```

**Expected response:**
```json
{
  "message": "Credit reset completed",
  "reset": 0,
  "total": 0
}
```

### **Test 2: Test with Real User**

1. Create a test user with annual plan
2. Set `next_credit_reset_at` to today in Supabase
3. Call the endpoint manually
4. Check if credits reset correctly

### **Test 3: Verify Cron is Running**

**For Vercel:**
- Go to Vercel dashboard → Your project → **Crons** tab
- You should see execution logs

**For GitHub Actions:**
- Go to GitHub → Your repo → **Actions** tab
- You should see workflow runs

---

## 📊 How to Monitor

### **Vercel Cron:**
1. Go to Vercel dashboard
2. Click your project
3. Go to **Crons** tab
4. See execution history and logs

### **GitHub Actions:**
1. Go to GitHub repository
2. Click **Actions** tab
3. See workflow runs and logs

### **Check Logs in Your App:**
- The endpoint logs to console:
  - `✅ Reset credits for user...`
  - `✅ No users need credit reset today`

---

## ⚠️ Important Notes

1. **Time Zone:** Cron jobs run in UTC. `0 0 * * *` = midnight UTC
   - Adjust if you want a different time

2. **First Run:** The cron will run daily, but credits only reset when `next_credit_reset_at` date arrives
   - Users won't get reset until their specific reset date

3. **Multiple Calls:** It's safe to call multiple times - the endpoint only resets users whose date has arrived

4. **Error Handling:** The endpoint logs errors but continues processing other users

---

## ✅ Quick Start (Choose Your Path)

### **If on Vercel:**
1. ✅ Update `vercel.json` (add cron config)
2. ✅ Add `CREDIT_RESET_SECRET` in Vercel dashboard
3. ✅ Deploy
4. ✅ Done!

### **If on Other Platform:**
1. ✅ Create `.github/workflows/monthly-credit-reset.yml`
2. ✅ Add `CREDIT_RESET_SECRET` in GitHub Secrets
3. ✅ Push to GitHub
4. ✅ Done!

### **If Want External Service:**
1. ✅ Sign up for EasyCron (or similar)
2. ✅ Create cron job pointing to your endpoint
3. ✅ Add secret in headers
4. ✅ Done!

---

## 🎯 Recommended: Vercel Cron (If on Vercel)

Since you have `vercel.json`, I recommend **Option 1: Vercel Cron** - it's the easiest and most integrated.

**Next step:** I'll help you update your `vercel.json` file if you want! Just let me know.




