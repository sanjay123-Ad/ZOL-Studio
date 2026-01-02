# Final Setup Steps - Vercel Cron (Recommended)

## ✅ You're Using: **Option 1 - Vercel Cron** (Best Choice!)

Since you're hosting on Vercel, this is the perfect solution. It's already configured in your `vercel.json`!

---

## 🚀 Complete Setup (3 Simple Steps)

### **Step 1: Add Environment Variable in Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **ZOLA-2.0** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key:** `CREDIT_RESET_SECRET`
   - **Value:** `zola-credit-reset-2024-secret-key` (or generate a random one)
   - **Environment:** ✅ Production ✅ Preview ✅ Development (select all three)
6. Click **Save**

**💡 Tip:** Generate a secure random key:
```bash
# In terminal, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### **Step 2: Connect Your Hostinger Domain to Vercel**

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your Hostinger domain (e.g., `yourdomain.com`)
4. Follow Vercel's instructions to update DNS records in Hostinger
5. Wait for DNS propagation (usually 5-30 minutes)

**DNS Records to Add in Hostinger:**
- Add the CNAME/A records that Vercel provides
- Vercel will show you exactly what to add

---

### **Step 3: Deploy Your Code**

```bash
# Make sure you're in your project directory
git add vercel.json
git commit -m "Add monthly credit reset cron job"
git push
```

**Or if using Vercel CLI:**
```bash
vercel --prod
```

---

## ✅ Verification Checklist

After deploying:

- [ ] Environment variable `CREDIT_RESET_SECRET` added in Vercel
- [ ] Domain connected to Vercel
- [ ] Code deployed successfully
- [ ] Go to Vercel Dashboard → Your Project → **Crons** tab
- [ ] You should see: `monthly-reset` cron job listed
- [ ] Test endpoint manually to ensure it works

---

## 🧪 Test Your Setup

### **Test 1: Manual Endpoint Test**

After deployment, test your endpoint:

```bash
curl -X POST https://yourdomain.com/api/credits/monthly-reset \
  -H "x-reset-secret: your-secret-key-here"
```

**Expected response:**
```json
{
  "message": "No users need credit reset",
  "reset": 0
}
```

### **Test 2: Check Cron in Vercel**

1. Go to Vercel Dashboard
2. Your Project → **Crons** tab
3. You should see:
   - **Path:** `/api/credits/monthly-reset`
   - **Schedule:** `0 0 * * *` (daily at midnight UTC)
   - **Status:** Active

---

## 📊 How It Works After Launch

### **Daily Automatic Process:**

1. **Every day at midnight UTC:**
   - Vercel Cron automatically calls your endpoint
   - No manual action needed

2. **Endpoint checks:**
   - Finds users with `next_credit_reset_at` = today
   - Resets their credits (monthly amount + unused rollover)

3. **For annual plan users:**
   - Credits reset monthly automatically
   - Unused credits rollover
   - Next reset date updated

---

## 🎯 Summary

**What's Already Done:**
- ✅ Cron job configured in `vercel.json`
- ✅ Endpoint created in `server.ts`
- ✅ Database migration run

**What You Need to Do:**
1. ✅ Add `CREDIT_RESET_SECRET` in Vercel (2 minutes)
2. ✅ Connect Hostinger domain to Vercel (5-10 minutes)
3. ✅ Deploy code (automatic on git push)

**Total Time:** ~15 minutes

**Result:** Your monthly credit reset will run automatically every day! 🚀

---

## 🆘 Troubleshooting

### **Cron not showing in Vercel?**
- Make sure you've deployed after adding `vercel.json`
- Check that `vercel.json` is in your project root
- Verify the cron path matches your endpoint

### **Endpoint returning 401?**
- Check `CREDIT_RESET_SECRET` matches in:
  - Vercel environment variables
  - Your test request header

### **Domain not connecting?**
- Check DNS records in Hostinger match Vercel's requirements
- Wait for DNS propagation (can take up to 48 hours, usually 5-30 min)
- Verify domain is added in Vercel dashboard

---

## 🎉 You're All Set!

Once you complete these 3 steps, your scheduled job will:
- ✅ Run automatically every day
- ✅ Reset credits monthly for annual plan users
- ✅ Handle rollover of unused credits
- ✅ Work seamlessly with your Vercel deployment

**No ongoing maintenance needed!** The system will run itself. 🚀







