# Scheduled Job Quick Start Guide

## 🤔 What is a Scheduled Job?

Think of it like a **robot assistant** that:
- Wakes up every day at midnight
- Automatically calls your credit reset endpoint
- Resets credits for users whose monthly reset date has arrived
- Goes back to sleep until tomorrow

**Without it:** Users would keep the same credits forever (no monthly reset)
**With it:** Credits automatically reset every month for annual plan users ✅

---

## ✅ What I Just Did

I've updated your `vercel.json` file to add a **Vercel Cron** job that will:
- Run daily at midnight UTC
- Call `/api/credits/monthly-reset` automatically
- Reset credits for users who need it

---

## 🚀 Next Steps (2 Simple Steps)

### **Step 1: Add Environment Variable in Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **ZOLA-2.0** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key:** `CREDIT_RESET_SECRET`
   - **Value:** `zola-credit-reset-2024-secret` (or any random string you want)
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

**Why?** This protects your endpoint from unauthorized access.

---

### **Step 2: Deploy to Vercel**

1. Commit your changes:
   ```bash
   git add vercel.json
   git commit -m "Add monthly credit reset cron job"
   git push
   ```

2. Vercel will automatically deploy
3. The cron job will start running daily! ✅

---

## 🧪 Test It (Optional)

### **Test 1: Manual Test (Before Deploying)**

Test locally first:
```bash
# In your terminal
curl -X POST http://localhost:5173/api/credits/monthly-reset \
  -H "x-reset-secret: zola-credit-reset-2024-secret"
```

**Expected response:**
```json
{
  "message": "No users need credit reset",
  "reset": 0
}
```

### **Test 2: After Deploying**

1. Go to Vercel Dashboard → Your Project
2. Click **Crons** tab (should appear after first deployment)
3. You'll see the cron job and its execution history

---

## 📊 How It Works

### **Daily Flow:**

1. **Midnight UTC:** Vercel Cron wakes up
2. **Calls endpoint:** `POST /api/credits/monthly-reset`
3. **Endpoint checks:** Which users have `next_credit_reset_at` = today?
4. **Resets credits:** For those users (monthly credits + rollover)
5. **Updates date:** Sets `next_credit_reset_at` to next month
6. **Done:** Goes back to sleep until tomorrow

### **Example:**

**User on Basic Annual:**
- Month 1: Gets 250 credits, reset date = Feb 1
- Feb 1: Cron runs → Resets to 250 credits (or 250 + unused credits)
- Month 2: Reset date = Mar 1
- Mar 1: Cron runs → Resets again
- And so on...

---

## ✅ Verification Checklist

After deploying, verify:

- [ ] Environment variable `CREDIT_RESET_SECRET` added in Vercel
- [ ] Code pushed to GitHub/Vercel
- [ ] Deployment successful
- [ ] Cron job appears in Vercel dashboard (Crons tab)
- [ ] Test endpoint manually to ensure it works

---

## 🎯 That's It!

Once you:
1. ✅ Add the environment variable in Vercel
2. ✅ Deploy your code

The scheduled job will run automatically every day! 🚀

**No more manual work needed** - your credits will reset monthly for all annual plan users automatically.

---

## ❓ Troubleshooting

### **Cron not running?**
- Check Vercel dashboard → Crons tab
- Verify environment variable is set
- Check deployment logs

### **Endpoint returning 401?**
- Make sure `CREDIT_RESET_SECRET` matches in:
  - Vercel environment variables
  - The secret you're testing with

### **Credits not resetting?**
- Check if `next_credit_reset_at` is set correctly for users
- Verify the date has arrived (cron only resets when date matches)
- Check server logs for errors

---

## 📝 Summary

**What changed:**
- ✅ Added cron job to `vercel.json`
- ✅ Will run daily at midnight UTC
- ✅ Automatically resets credits monthly

**What you need to do:**
1. Add `CREDIT_RESET_SECRET` in Vercel dashboard
2. Deploy your code
3. Done! 🎉







