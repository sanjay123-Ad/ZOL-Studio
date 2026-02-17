# Next Steps: Monthly Credit Reset Implementation

## ✅ What's Been Implemented

### 1. **Database Schema**
- ✅ SQL script created: `supabase_monthly_credit_reset_setup.sql`
- ⚠️ **ACTION REQUIRED:** Run this SQL in Supabase SQL Editor

### 2. **Credit Allocation Logic**
- ✅ Updated to use monthly credits for both monthly and annual plans
- ✅ Annual plans now get 250/750/1450 credits per month (not per year)
- ✅ Credits expire after 1 month (not 1 year for annual)

### 3. **Monthly Reset Endpoint**
- ✅ Created: `POST /api/credits/monthly-reset`
- ✅ Handles monthly credit resets for all active users
- ✅ Allows rollover of unused credits
- ✅ Updates `next_credit_reset_at` for next month

### 4. **Webhook Updates**
- ✅ Webhook now sets `next_credit_reset_at` when allocating credits
- ✅ Both monthly and annual plans use monthly credit allocation

---

## 🚀 Required Actions

### **Step 1: Run Database Migration**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the SQL script: `supabase_monthly_credit_reset_setup.sql`
4. Verify the `next_credit_reset_at` column was added

**SQL File:** `supabase_monthly_credit_reset_setup.sql`

---

### **Step 2: Set Up Scheduled Job**

Choose ONE of these options:

#### **Option A: Vercel Cron (Recommended if on Vercel)**

1. Create `vercel.json` in project root:
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

2. Add environment variable:
```bash
CREDIT_RESET_SECRET=your-secret-key-here
```

3. Deploy to Vercel

#### **Option B: GitHub Actions (Free)**

1. Create `.github/workflows/monthly-credit-reset.yml`:
```yaml
name: Monthly Credit Reset
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight UTC
  workflow_dispatch: # Manual trigger

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Credit Reset
        run: |
          curl -X POST https://your-domain.com/api/credits/monthly-reset \
            -H "x-reset-secret: ${{ secrets.CREDIT_RESET_SECRET }}"
```

2. Add secret to GitHub: `CREDIT_RESET_SECRET`

#### **Option C: External Cron Service**

Use services like:
- cron-job.org
- EasyCron
- Zapier
- Make.com

Call: `POST https://your-domain.com/api/credits/monthly-reset`
Header: `x-reset-secret: your-secret-key`

#### **Option D: Supabase Edge Function (Advanced)**

Create a Supabase Edge Function that runs daily via Supabase Cron.

---

### **Step 3: Add Environment Variable**

Add to `.env.local`:
```bash
CREDIT_RESET_SECRET=your-secret-key-here
```

This protects the reset endpoint from unauthorized access.

---

## 🧪 Testing

### **Test 1: Manual Reset (Development)**

```bash
# Test locally
curl -X POST http://localhost:5173/api/credits/monthly-reset \
  -H "x-reset-secret: your-secret-key"
```

### **Test 2: Verify Annual Plan Behavior**

1. Create a test user
2. Subscribe to Basic Annual plan
3. Verify:
   - Initial credits: 250 (monthly amount)
   - `next_credit_reset_at` is set to 1 month from now
   - `credits_expire_at` is 1 month from now

### **Test 3: Test Monthly Reset**

1. Set `next_credit_reset_at` to today for a test user
2. Call the reset endpoint
3. Verify:
   - Credits reset to monthly amount
   - Unused credits rollover
   - `next_credit_reset_at` updated to next month

---

## 📊 How It Works Now

### **Annual Plan Example:**

**Month 1:**
- User subscribes to Basic Annual
- Gets: 250 credits
- Expires: 1 month
- Next reset: 1 month

**Month 2 (Auto Reset):**
- Scheduled job runs
- User had: 100 credits remaining
- New credits: 250
- Rollover: 100
- Total: 350 credits
- Next reset: 1 month

**Month 3-12:**
- Same process repeats monthly
- User gets 250 credits per month
- Unused credits rollover

---

## ✅ Verification Checklist

- [ ] Database migration run (`next_credit_reset_at` column exists)
- [ ] Scheduled job configured (cron, GitHub Actions, etc.)
- [ ] Environment variable set (`CREDIT_RESET_SECRET`)
- [ ] Tested manual reset endpoint
- [ ] Verified annual plan gets monthly credits
- [ ] Verified monthly reset works correctly

---

## 🎯 Summary

**What Changed:**
- ✅ Annual plans now use monthly credit resets (not yearly)
- ✅ Both monthly and annual plans reset credits every month
- ✅ Annual = discounted billing, not bigger credit pool

**What You Need to Do:**
1. Run SQL migration
2. Set up scheduled job
3. Add environment variable
4. Test the system

**Ready to go!** 🚀







