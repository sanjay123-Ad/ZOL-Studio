# Next Steps After Running SQL Script

## ✅ Step 1: Verify Database Setup (DONE)

You've already run the SQL script in Supabase. Great! 

### Quick Verification:
Run this in Supabase SQL Editor to confirm:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('total_credits', 'used_credits', 'credits_expire_at', 'last_credits_allocated_at', 'signup_bonus_given');
```

You should see all 5 columns listed.

---

## 🧪 Step 2: Test the System

### Test 1: Sign-Up Bonus (Most Important!)
1. **Create a new test account:**
   - Go to your app's sign-up page
   - Register with a new email
   - Complete the sign-up process

2. **Verify in Supabase:**
   - Go to Supabase Dashboard → Table Editor → `profiles`
   - Find the new user by email
   - Check these values:
     - ✅ `total_credits` = 10
     - ✅ `used_credits` = 0
     - ✅ `signup_bonus_given` = true
     - ✅ `credits_expire_at` = 1 month from now

3. **If sign-up bonus didn't work:**
   - The trigger should have run automatically
   - If not, manually update:
   ```sql
   UPDATE profiles 
   SET total_credits = 10, 
       used_credits = 0,
       signup_bonus_given = true,
       credits_expire_at = NOW() + INTERVAL '1 month',
       last_credits_allocated_at = NOW()
   WHERE id = 'USER_ID_HERE';
   ```

### Test 2: Credit Deduction
1. **Log in as a user with credits** (the test user from Test 1)
2. **Generate an image:**
   - Go to any feature (Virtual Try-On, Asset Generator, etc.)
   - Upload images and generate
3. **Check credits deducted:**
   - Go to Profile page - you should see credits displayed
   - Or check Supabase: `used_credits` should increase by 1

### Test 3: Insufficient Credits
1. **Use all credits** (or manually set in Supabase):
   ```sql
   UPDATE profiles 
   SET used_credits = total_credits 
   WHERE id = 'USER_ID_HERE';
   ```
2. **Try to generate an image**
3. **Should see error:** "Insufficient credits. Please upgrade your plan."

### Test 4: Payment & Credit Allocation
1. **Complete a test payment** for any plan (Basic/Pro/Agency)
2. **Check server logs** for webhook processing
3. **Verify in Supabase:**
   - `total_credits` = plan amount (250/750/1450)
   - `used_credits` = 0 (reset)
   - `credits_expire_at` = 1 month/1 year from now
   - `last_credits_allocated_at` = current timestamp

---

## 🎨 Step 3: View Credits in Profile Page

I've already added credit display to your Profile page! 

**What you'll see:**
- Available credits (e.g., "8/10")
- Total credits
- Expiration date (if applicable)

**To see it:**
1. Log in to your app
2. Go to Profile page
3. You should see a credit balance card below the subscription status

---

## 🔍 Step 4: Monitor Credits in Supabase

### View All Users' Credits:
```sql
SELECT 
  id,
  username,
  email,
  plan_tier,
  plan_status,
  total_credits,
  used_credits,
  (total_credits - used_credits) as available_credits,
  credits_expire_at,
  signup_bonus_given
FROM profiles
ORDER BY total_credits DESC;
```

### Find Users with Low Credits:
```sql
SELECT 
  username,
  email,
  plan_tier,
  (total_credits - used_credits) as remaining_credits
FROM profiles
WHERE (total_credits - used_credits) < 10
AND plan_status = 'active'
ORDER BY remaining_credits ASC;
```

---

## 🐛 Troubleshooting

### Issue: Sign-up bonus not given
**Solution:**
- Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_give_signup_bonus';`
- If missing, re-run the trigger creation part of the SQL script
- Or manually set credits as shown in Test 1

### Issue: Credits not deducting
**Solution:**
- Check browser console for errors
- Verify `creditService.ts` is imported correctly
- Check Supabase RLS policies allow updates to `used_credits`

### Issue: Credits not showing in Profile page
**Solution:**
- Refresh the page
- Check browser console for errors
- Verify credit columns exist in database

### Issue: Payment webhook not allocating credits
**Solution:**
- Check server logs for webhook processing
- Verify plan tier is correctly identified
- Check that `plan_status` is 'active'
- Verify billing period detection

---

## ✅ Checklist

- [x] SQL script run in Supabase
- [ ] Test sign-up bonus works
- [ ] Test credit deduction works
- [ ] Test insufficient credits error
- [ ] Test payment webhook allocates credits
- [ ] Verify credits display in Profile page
- [ ] Monitor credits in Supabase dashboard

---

## 🎉 You're All Set!

Once you've completed the tests above, your credit system is fully operational! 

**Next optional steps:**
1. Add credit display to Home page or header (optional)
2. Add credit usage analytics (optional)
3. Add credit purchase/add-on system (optional)

**Status:** ✅ **READY TO TEST**





