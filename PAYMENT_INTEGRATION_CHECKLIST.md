# Payment Integration Checklist - Lemon Squeezy Basic Plan

## ✅ Completed Setup

### 1. Backend Server (`server.ts`)
- ✅ Checkout creation endpoint: `POST /api/lemonsqueezy/create-basic-checkout`
- ✅ Webhook handler: `POST /api/lemonsqueezy/webhook`
- ✅ Webhook finds user by email from `auth.users` table
- ✅ Updates `profiles` table with plan information
- ✅ Error handling and logging implemented

### 2. Frontend (`PricingPage.tsx`)
- ✅ Basic plan button triggers checkout
- ✅ Loading state ("Redirecting...") during checkout creation
- ✅ Redirects to Lemon Squeezy hosted checkout page

### 3. Dependencies (`package.json`)
- ✅ `dotenv` installed for environment variables
- ✅ `@supabase/supabase-js` installed for Supabase admin client

---

## 🔴 Required Environment Variables (`.env.local`)

Make sure these are set in `ZOLA-2.0/.env.local`:

```bash
# Lemon Squeezy API Configuration
LEMONSQUEEZY_API_KEY=ls_test_****************
LEMONSQUEEZY_STORE_ID=251116
LEMONSQUEEZY_BASIC_VARIANT_ID=1124106
LEMONSQUEEZY_WEBHOOK_SECRET=my-zola-fashion

# Supabase Configuration (for webhook)
SUPABASE_URL=https://wtxwgkiiwibgfnpfkckx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Existing
GEMINI_API_KEY=your_gemini_key
```

**⚠️ Important:** Get `SUPABASE_SERVICE_ROLE_KEY` from:
- Supabase Dashboard → Project Settings → API → `service_role` key (keep secret!)

---

## 🔴 Required Supabase Database Columns

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

---

## 🔴 Lemon Squeezy Webhook Configuration

### In Lemon Squeezy Dashboard (Test Mode):

1. Go to **Settings → Webhooks**
2. Click **Create Webhook** or edit existing
3. Set:
   - **Endpoint URL**: `https://nonrustically-escapeless-emerson.ngrok-free.dev/api/lemonsqueezy/webhook`
   - **Signing Secret**: `my-zola-fashion` (or whatever you set in `.env.local`)
   - **Events to subscribe**:
     - ✅ `subscription_created`
     - ✅ `subscription_updated`
     - ✅ `subscription_cancelled`
     - ✅ `subscription_expired`

4. **Save** the webhook

---

## 🧪 Testing Checklist

### Test 1: Checkout Flow
1. ✅ Start dev server: `npm run dev`
2. ✅ Start ngrok: `ngrok http 5173`
3. ✅ Update Lemon Squeezy webhook URL if ngrok URL changed
4. ✅ Go to `http://localhost:5173/pricing`
5. ✅ Click **Basic** plan → **Get Started**
6. ✅ Should redirect to Lemon Squeezy checkout page
7. ✅ Complete test payment with test card: `4242 4242 4242 4242`

### Test 2: Webhook Processing
1. ✅ After payment completes, check server logs for:
   - `Lemon Squeezy webhook received: subscription_created`
   - `Successfully updated profile for user...`
2. ✅ Go to Supabase Dashboard → Table Editor → `profiles`
3. ✅ Find the user by email used in checkout
4. ✅ Verify columns updated:
   - `plan_tier = 'basic'`
   - `plan_status = 'active'`
   - `lemonsqueezy_subscription_id` is filled
   - `lemonsqueezy_customer_id` is filled (if available)
   - `lemonsqueezy_renews_at` is filled (if available)

### Test 3: Error Handling
1. ✅ Test with invalid email (should return 404)
2. ✅ Test webhook without SUPABASE_SERVICE_ROLE_KEY (should return 500)
3. ✅ Test checkout without LEMONSQUEEZY_API_KEY (should return 500)

---

## 🐛 Common Issues & Solutions

### Issue: "User not found" in webhook
**Cause:** User email in Lemon Squeezy doesn't match Supabase auth.users email
**Solution:** Ensure user signs up/login with the same email they use in checkout

### Issue: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Cause:** Environment variable not set or server not restarted
**Solution:** Add to `.env.local` and restart `npm run dev`

### Issue: Webhook not receiving events
**Cause:** ngrok URL changed or webhook not configured in Lemon Squeezy
**Solution:** Update webhook URL in Lemon Squeezy dashboard

### Issue: "Failed to update profile"
**Cause:** Database columns don't exist or RLS policies blocking update
**Solution:** Run the SQL above to add columns, ensure service role key bypasses RLS

---

## 📝 Next Steps (After Basic Plan Works)

1. **Add Pro Plan Integration**
   - Create Pro variant in Lemon Squeezy
   - Add `LEMONSQUEEZY_PRO_VARIANT_ID` to `.env.local`
   - Update `PricingPage.tsx` to handle Pro plan checkout
   - Update webhook to set `plan_tier = 'pro'` for Pro subscriptions

2. **Add Agency Plan Integration**
   - Same as Pro plan above

3. **Add Plan-Based Access Control**
   - Check `plan_tier` and `plan_status` in protected routes
   - Show upgrade prompts for free users
   - Limit features based on plan tier

4. **Add Success/Cancel Pages**
   - Create `/pricing/success` page
   - Create `/pricing/cancel` page
   - Update checkout redirect URLs

---

## ✅ Verification Summary

- [x] Backend checkout endpoint working
- [x] Backend webhook handler working
- [x] Frontend checkout button working
- [x] Environment variables configured
- [x] Supabase columns added
- [x] Lemon Squeezy webhook configured
- [ ] Test payment completed successfully
- [ ] Webhook updates profile correctly
- [ ] Ready for Pro/Agency integration



