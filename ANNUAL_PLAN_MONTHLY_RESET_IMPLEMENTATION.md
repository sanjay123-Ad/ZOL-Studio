# Annual Plan Monthly Credit Reset - Implementation Guide

## ✅ Implementation Complete

### **Key Change: Annual Plans Now Use Monthly Credit Resets**

**Before (OLD):**
- Annual plans: 250/750/1450 credits per year (one-time allocation)
- Credits expire after 1 year

**After (NEW - Cursor Model):**
- Annual plans: 250/750/1450 credits per month (monthly reset)
- Credits reset every month (same as monthly plans)
- Annual = discounted billing, not bigger credit pool

---

## 🎯 How It Works Now

### **Credit Allocation:**

| Plan | Monthly Credits | Reset Frequency |
|------|----------------|-----------------|
| **Basic Monthly** | 250/month | Every month |
| **Basic Annual** | 250/month | Every month ✅ |
| **Pro Monthly** | 750/month | Every month |
| **Pro Annual** | 750/month | Every month ✅ |
| **Agency Monthly** | 1,450/month | Every month |
| **Agency Annual** | 1,450/month | Every month ✅ |

**Key Point:** Annual plans get the SAME monthly credits as monthly plans. The only difference is billing (paid yearly at discount).

---

## 📋 Changes Made

### 1. **Database Schema** (`supabase_monthly_credit_reset_setup.sql`)

**New Column Added:**
- `next_credit_reset_at` - Tracks when credits should reset monthly

**Action Required:**
```sql
-- Run this SQL in Supabase SQL Editor
-- File: supabase_monthly_credit_reset_setup.sql
```

---

### 2. **Credit Allocation Logic** (`server.ts`)

**Updated Functions:**
- ✅ `calculateExpirationDate()` - Now always returns 1 month (for both monthly and annual)
- ✅ `calculateNextCreditResetDate()` - New function to track monthly reset dates
- ✅ `getCreditsForPlan()` - Always uses monthly credits (same for monthly and annual)

**Key Change:**
```typescript
// OLD: Annual plans got yearly credits
const credits = getCreditsForPlan(planTier, billingPeriod); // Could be 250/year

// NEW: Annual plans get monthly credits (reset monthly)
const credits = getCreditsForPlan(planTier, 'monthly'); // Always 250/month
```

---

### 3. **Monthly Credit Reset Endpoint** (`server.ts`)

**New Endpoint:** `POST /api/credits/monthly-reset`

**What It Does:**
- Finds all users whose credits should reset today
- Resets credits to monthly allocation
- Allows rollover of unused credits
- Updates `next_credit_reset_at` to next month

**How to Use:**
- Set up a cron job to call this endpoint daily
- Or use a scheduled task service (Vercel Cron, GitHub Actions, etc.)

---

## 🔄 How It Works in Practice

### **Scenario 1: User Buys Basic Annual**

**Day 1 (Subscription Created):**
```
- User pays for Basic Annual ($190/year)
- Webhook allocates: 250 credits (monthly amount)
- Credits expire: 1 month from now
- Next reset: 1 month from now
- User can use 250 credits this month
```

**Month 2 (Automatic Reset):**
```
- Scheduled job runs monthly credit reset
- User had: 100 credits remaining
- New allocation: 250 credits
- Rollover: 100 credits
- Total: 350 credits (250 new + 100 rollover)
- Next reset: 1 month from now
```

**Month 3-12:**
```
- Same process repeats every month
- Credits reset monthly
- Unused credits rollover
- User gets 250 credits per month
```

**Year 2 (Renewal):**
```
- Annual subscription renews
- Monthly reset continues
- Same 250 credits per month
```

---

### **Scenario 2: User Upgrades Mid-Year (Basic Annual → Pro Annual)**

**Month 4:**
```
- User upgrades from Basic Annual to Pro Annual
- Webhook detects plan change
- Old credits: Discarded (except signup credits)
- New credits: 750 (Pro monthly amount)
- Next reset: 1 month from now
- Monthly reset continues with Pro credits
```

---

## 🗄️ Database Changes

### **New Column: `next_credit_reset_at`**

**Purpose:**
- Tracks when credits should reset next
- Used by scheduled job to find users who need reset
- Set to 1 month from last allocation

**SQL Setup:**
```sql
-- Run: supabase_monthly_credit_reset_setup.sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS next_credit_reset_at TIMESTAMPTZ;
```

---

## ⚙️ Scheduled Job Setup

### **Option 1: Vercel Cron (If Deployed on Vercel)**

Add to `vercel.json`:
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

### **Option 2: GitHub Actions (Free)**

Create `.github/workflows/monthly-credit-reset.yml`:
```yaml
name: Monthly Credit Reset
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
  workflow_dispatch: # Manual trigger

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Credit Reset
        run: |
          curl -X POST https://your-domain.com/api/credits/monthly-reset \
            -H "x-reset-secret: YOUR_SECRET_KEY"
```

### **Option 3: External Cron Service**

- Use services like cron-job.org, EasyCron, etc.
- Call `POST /api/credits/monthly-reset` daily

### **Option 4: Supabase Edge Function (Recommended)**

Create a Supabase Edge Function that runs daily:
```typescript
// supabase/functions/monthly-credit-reset/index.ts
// This can be scheduled via Supabase Cron
```

---

## 🔐 Security

### **Protect the Reset Endpoint:**

Add to `.env.local`:
```bash
CREDIT_RESET_SECRET=your-secret-key-here
```

The endpoint checks for this secret in the `x-reset-secret` header.

---

## 🧪 Testing

### **Test 1: Manual Reset**

```bash
curl -X POST http://localhost:5173/api/credits/monthly-reset \
  -H "x-reset-secret: your-secret-key"
```

### **Test 2: Verify Reset Logic**

1. Create a test user with annual plan
2. Set `next_credit_reset_at` to today
3. Call reset endpoint
4. Verify credits reset correctly

### **Test 3: Rollover Logic**

1. User has 100 credits remaining
2. Monthly reset runs
3. Verify: New credits (250) + rollover (100) = 350 total

---

## 📝 Key Points

✅ **Annual plans = Monthly credits, yearly billing**
✅ **Credits reset every month (not yearly)**
✅ **Unused credits rollover monthly**
✅ **Same credit limits for monthly and annual plans**
✅ **Annual = Discounted price, not more credits**

---

## 🎯 Summary

**What Changed:**
1. ✅ Annual plans now get monthly credits (250/750/1450 per month)
2. ✅ Credits reset every month (not yearly)
3. ✅ Added `next_credit_reset_at` column to track reset dates
4. ✅ Created monthly reset endpoint for scheduled jobs
5. ✅ Updated expiration logic (always 1 month)

**What Stays the Same:**
- Monthly plans: Still reset monthly (no change)
- Credit amounts: Same for monthly and annual
- Rollover logic: Still works (unused credits carry over)

**Next Steps:**
1. Run SQL script (`supabase_monthly_credit_reset_setup.sql`)
2. Set up scheduled job to call reset endpoint daily
3. Test with a new annual subscription

---

## ✅ Implementation Status

- ✅ Database schema updated
- ✅ Credit allocation logic updated
- ✅ Monthly reset endpoint created
- ✅ Expiration logic updated
- ⚠️ Scheduled job setup (TODO - choose your preferred method)

**Ready for testing!** 🚀






