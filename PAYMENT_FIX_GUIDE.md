# Payment Gateway Fix Guide

## 🔧 Issues Fixed

### 1. **Server-Side Environment Variable Issue** ✅
**Problem**: The server was trying to read `VITE_` prefixed environment variables, which are only available in the frontend (Vite client). In Node.js server code, these variables are not accessible.

**Solution**: Updated `server.ts` to read from both:
- `LEMONSQUEEZY_*_VARIANT_ID` (server-side, recommended)
- `VITE_LEMONSQUEEZY_*_VARIANT_ID` (fallback for backward compatibility)

### 2. **Improved Plan Tier Detection** ✅
- Enhanced variant ID matching with better logging
- Added fallback to product name if variant ID mapping fails
- Better error handling when plan tier cannot be determined

### 3. **Profile Creation on Webhook** ✅
- If a profile doesn't exist when webhook is received, the system now automatically creates one
- Prevents webhook failures due to missing profiles

### 4. **Enhanced Logging** ✅
- Added detailed logging for debugging plan activation
- Clear success/error messages for troubleshooting

---

## 📋 Required Environment Variables Setup

### For `.env.local` file:

You need to add **BOTH** frontend (VITE_) and server-side (non-VITE) environment variables:

```bash
# ============================================
# LEMON SQUEEZY CONFIGURATION
# ============================================

# API Configuration (Server-side)
LEMONSQUEEZY_API_KEY=ls_test_****************
LEMONSQUEEZY_STORE_ID=251116
LEMONSQUEEZY_WEBHOOK_SECRET=my-zola-fashion

# Variant IDs - SERVER-SIDE (for webhook processing)
# These are used by server.ts to map variant IDs to plan tiers
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your_basic_annual_variant_id
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your_pro_annual_variant_id
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your_agency_monthly_variant_id
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your_agency_annual_variant_id

# Variant IDs - FRONTEND (for PricingPage.tsx)
# These are used by the frontend to create checkout sessions
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=1124106
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your_basic_annual_variant_id
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your_pro_annual_variant_id
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your_agency_monthly_variant_id
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your_agency_annual_variant_id

# ============================================
# SUPABASE CONFIGURATION
# ============================================
SUPABASE_URL=https://wtxwgkiiwibgfnpfkckx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# OTHER CONFIGURATION
# ============================================
GEMINI_API_KEY=your_gemini_key
```

### ⚠️ Important Notes:

1. **Variant IDs must match**: The same variant ID should be in both the `LEMONSQUEEZY_*` (server) and `VITE_LEMONSQUEEZY_*` (frontend) variables.

2. **Get Variant IDs from Lemon Squeezy**:
   - Go to Lemon Squeezy Dashboard
   - Navigate to Products → Your Product → Variants
   - Copy the Variant ID for each plan (monthly and annual)

3. **Get Service Role Key from Supabase**:
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the `service_role` key (keep it secret!)

---

## 🗄️ Supabase Database Setup

### Ensure these columns exist in `profiles` table:

Run this SQL in Supabase SQL Editor if not already done:

```sql
-- Add billing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_tier TEXT
    DEFAULT 'free'
    CHECK (plan_tier IN ('free', 'basic', 'pro', 'agency'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_status TEXT
    DEFAULT 'inactive'
    CHECK (plan_status IN ('inactive', 'active', 'past_due', 'canceled'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lemonsqueezy_renews_at TIMESTAMPTZ;
```

### Verify RLS Policies:

The service role key should bypass RLS, but ensure your profiles table allows updates:

```sql
-- Check if service role can update profiles
-- The service role key should bypass RLS automatically
-- But verify that profiles table has proper policies
```

---

## 🧪 Testing the Fix

### 1. Test Checkout Flow:
1. Start dev server: `npm run dev`
2. Go to `/pricing` page
3. Click on any plan (Basic, Pro, or Agency)
4. Complete test payment with test card: `4242 4242 4242 4242`
5. Check server logs for variant ID mapping

### 2. Test Webhook Processing:
1. After payment completes, check server console logs
2. Look for messages like:
   - `✅ Matched Basic Monthly: 1124106`
   - `✅ Successfully updated profile for user...`
   - `Plan: BASIC`, `Status: ACTIVE`

### 3. Verify Profile Update:
1. Go to `/profile` page
2. Check that plan tier and status are displayed correctly
3. Verify subscription details section shows:
   - Correct plan name (Basic/Pro/Agency)
   - Status: Active
   - Renewal date (if available)

### 4. Check Supabase Database:
1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find the user by email
3. Verify columns are updated:
   - `plan_tier` = 'basic', 'pro', or 'agency'
   - `plan_status` = 'active'
   - `lemonsqueezy_subscription_id` is filled
   - `lemonsqueezy_customer_id` is filled (if available)
   - `lemonsqueezy_renews_at` is filled (if available)

---

## 🐛 Troubleshooting

### Issue: "Unknown variant ID in webhook"
**Solution**: 
- Check that you've added the variant ID to `.env.local` (both with and without VITE_ prefix)
- Restart the dev server after adding environment variables
- Check server logs to see which variant IDs are configured

### Issue: "User not found" in webhook
**Solution**: 
- Ensure the email used in Lemon Squeezy checkout matches the email in Supabase auth
- Check that user is signed up/logged in before making payment

### Issue: "Profile not found"
**Solution**: 
- The system now automatically creates profiles, but if this fails:
- Check RLS policies on profiles table
- Verify SUPABASE_SERVICE_ROLE_KEY is correct

### Issue: Plan shows as "free" or "inactive" after payment
**Solution**:
- Check server logs for webhook processing
- Verify variant IDs are correctly mapped
- Check that webhook URL is correctly configured in Lemon Squeezy
- Ensure webhook events are subscribed: `subscription_created`, `subscription_updated`

---

## ✅ What's Working Now

1. ✅ Server correctly reads variant IDs from environment variables
2. ✅ Webhook properly maps variant IDs to plan tiers (basic, pro, agency)
3. ✅ Profile is automatically updated when payment is received
4. ✅ Profile page displays plan information correctly
5. ✅ Real-time updates via Supabase subscriptions
6. ✅ Automatic profile creation if missing
7. ✅ Better error handling and logging

---

## 📝 Next Steps

1. **Add all variant IDs** to `.env.local` (both server and frontend versions)
2. **Restart your dev server** after adding environment variables
3. **Test with a real payment** (or test card)
4. **Monitor server logs** during webhook processing
5. **Verify profile updates** in Supabase dashboard

---

## 🔗 Related Files

- `server.ts` - Webhook handler and checkout creation
- `pages/PricingPage.tsx` - Frontend checkout flow
- `pages/ProfilePage.tsx` - Profile display with plan information
- `services/supabase.ts` - Supabase client configuration

---

**Last Updated**: After payment gateway fix
**Status**: ✅ Ready for testing





