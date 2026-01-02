# Next Steps After Billing Period Setup

## ✅ Step 1: Verify Column Was Added

Run this query in Supabase SQL Editor to confirm:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'billing_period';
```

**Expected Result:**
- `column_name`: billing_period
- `data_type`: text
- `is_nullable`: YES

---

## ✅ Step 2: Check Existing Users (Optional)

If you have existing users with active subscriptions, you may want to update their billing_period:

```sql
-- Check users with active subscriptions but no billing_period
SELECT id, plan_tier, plan_status, billing_period, lemonsqueezy_renews_at
FROM profiles
WHERE plan_status = 'active'
  AND (plan_tier = 'basic' OR plan_tier = 'pro' OR plan_tier = 'agency')
  AND billing_period IS NULL;
```

**If you find users:**
- They will be updated automatically on next webhook event
- OR you can manually update based on their renewal date:
  ```sql
  -- Update monthly subscriptions (renews within 30 days)
  UPDATE profiles
  SET billing_period = 'monthly'
  WHERE plan_status = 'active'
    AND billing_period IS NULL
    AND lemonsqueezy_renews_at IS NOT NULL
    AND lemonsqueezy_renews_at::date - CURRENT_DATE <= 30;
  
  -- Update annual subscriptions (renews after 30 days)
  UPDATE profiles
  SET billing_period = 'annual'
  WHERE plan_status = 'active'
    AND billing_period IS NULL
    AND lemonsqueezy_renews_at IS NOT NULL
    AND lemonsqueezy_renews_at::date - CURRENT_DATE > 30;
  ```

---

## ✅ Step 3: Test the Implementation

### Test 1: Check Pricing Page

1. **Log in** to your ZOLA AI app
2. **Navigate** to `/pricing` page
3. **Check button text:**
   - If you have an active subscription → Should see "Manage Subscription" on your current plan
   - Other plans → Should see "Get Started"

### Test 2: Test Webhook (If You Have Test Subscriptions)

1. **Create a test subscription** through Lemon Squeezy
2. **Check webhook logs** in your server console
3. **Verify** that `billing_period` is being stored:
   ```sql
   SELECT plan_tier, billing_period, plan_status
   FROM profiles
   WHERE id = 'your-test-user-id';
   ```

### Test 3: Toggle Billing Period

1. On pricing page, **toggle between Monthly/Annual**
2. **Verify** button text changes correctly:
   - If you're on Basic Monthly and toggle to Annual → Basic Annual should show "Get Started"
   - If you're on Pro Annual and toggle to Monthly → Pro Monthly should show "Get Started"

---

## ✅ Step 4: Verify Everything Works

### Checklist:

- [ ] Column `billing_period` exists in `profiles` table
- [ ] Pricing page loads without errors
- [ ] Button shows "Manage Subscription" for active plan (if you have one)
- [ ] Button shows "Get Started" for other plans
- [ ] Toggle between Monthly/Annual works correctly
- [ ] Microcopy text appears ("You're currently on this plan")
- [ ] Webhook handler stores `billing_period` (check server logs)

---

## 🚧 Optional: Update Existing Active Users

If you have users with active subscriptions, you can update them now:

```sql
-- Safe update: Only update active subscriptions without billing_period
UPDATE profiles
SET billing_period = CASE
  WHEN lemonsqueezy_renews_at IS NOT NULL 
    AND lemonsqueezy_renews_at::date - CURRENT_DATE > 30 
  THEN 'annual'
  WHEN lemonsqueezy_renews_at IS NOT NULL 
    AND lemonsqueezy_renews_at::date - CURRENT_DATE <= 30 
  THEN 'monthly'
  ELSE NULL
END
WHERE plan_status = 'active'
  AND (plan_tier = 'basic' OR plan_tier = 'pro' OR plan_tier = 'agency')
  AND billing_period IS NULL;
```

**Note:** This is optional. New webhook events will automatically set billing_period.

---

## 🎯 What Happens Next

1. **New Subscriptions:** Webhook will automatically store `billing_period`
2. **Existing Users:** Will be updated on next webhook event OR you can run the update query above
3. **Pricing Page:** Will now show correct buttons based on user's plan

---

## 🐛 Troubleshooting

### Issue: Button still shows "Get Started" for my active plan

**Solution:**
1. Check if `billing_period` is set in your profile:
   ```sql
   SELECT plan_tier, billing_period, plan_status 
   FROM profiles 
   WHERE id = 'your-user-id';
   ```
2. If `billing_period` is NULL, run the update query from Step 4
3. Refresh the pricing page

### Issue: Column doesn't exist

**Solution:**
1. Re-run the SQL script: `supabase_billing_period_setup.sql`
2. Check for any errors in Supabase SQL Editor
3. Verify you're running it in the correct database

### Issue: Webhook not storing billing_period

**Solution:**
1. Check server logs for webhook events
2. Verify webhook handler code is deployed
3. Test with a new subscription to trigger webhook

---

## ✅ You're Done!

Once you've verified:
- ✅ Column exists
- ✅ Pricing page shows correct buttons
- ✅ Toggle works

**Everything is set up correctly!** 🎉

The system will now:
- Store billing period for all new subscriptions
- Show "Manage Subscription" for active plans
- Show "Get Started" for everything else







