# Environment Variables & Setup Validation Checklist

## ✅ Quick Validation Command

Run this to automatically check all environment variables:

```bash
cd ZOLA-2.0
node validate-env.js
```

---

## 📋 Manual Checklist

### 1. Environment Variables (`.env.local` file)

Check that your `.env.local` file in `ZOLA-2.0/` contains ALL of these:

#### ✅ Lemon Squeezy Variables
- [ ] `LEMONSQUEEZY_API_KEY=ls_test_...` (must start with `ls_test_` or `ls_live_`)
- [ ] `LEMONSQUEEZY_STORE_ID=251116` (your actual store ID)
- [ ] `LEMONSQUEEZY_BASIC_VARIANT_ID=1124106` (your actual variant ID)
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET=my-zola-fashion` (your webhook secret)

#### ✅ Supabase Variables
- [ ] `SUPABASE_URL=https://wtxwgkiiwibgfnpfkckx.supabase.co` (your Supabase URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...` (must start with `eyJ` - JWT token)

#### ✅ Optional Variables
- [ ] `GEMINI_API_KEY=...` (your Gemini API key)
- [ ] `LEMONSQUEEZY_SUCCESS_URL=http://localhost:5173/pricing` (optional)
- [ ] `LEMONSQUEEZY_CANCEL_URL=http://localhost:5173/pricing` (optional)

---

### 2. Code Validation

#### ✅ Server.ts Checks
- [x] `dotenv.config()` loads `.env.local` correctly
- [x] All required env vars are checked before use
- [x] Webhook handler checks for `SUPABASE_SERVICE_ROLE_KEY`
- [x] Checkout endpoint checks for Lemon Squeezy vars
- [x] Error handling is in place
- [x] User lookup uses Admin API correctly

#### ✅ PricingPage.tsx Checks
- [x] Basic plan button calls `/api/lemonsqueezy/create-basic-checkout`
- [x] Loading state shows "Redirecting..." during checkout
- [x] Error fallback navigates to auth page

---

### 3. Supabase Database Validation

Run this SQL in Supabase SQL Editor to verify columns exist:

```sql
-- Check if billing columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN (
    'plan_tier',
    'plan_status',
    'lemonsqueezy_customer_id',
    'lemonsqueezy_subscription_id',
    'lemonsqueezy_renews_at'
  );
```

**Expected Result:** Should return 5 rows (one for each column)

If any are missing, run the SQL from `PAYMENT_INTEGRATION_CHECKLIST.md`

---

### 4. Lemon Squeezy Dashboard Validation

#### ✅ Webhook Configuration
- [ ] Go to Lemon Squeezy Dashboard → Settings → Webhooks
- [ ] Webhook URL is set to: `https://your-ngrok-url.ngrok-free.dev/api/lemonsqueezy/webhook`
- [ ] Signing Secret matches: `my-zola-fashion` (or whatever you set)
- [ ] Events subscribed:
  - [x] `subscription_created`
  - [x] `subscription_updated`
  - [x] `subscription_cancelled`
  - [x] `subscription_expired`

#### ✅ Product Configuration
- [ ] Basic plan product exists
- [ ] Variant ID matches `LEMONSQUEEZY_BASIC_VARIANT_ID` in `.env.local`
- [ ] Store ID matches `LEMONSQUEEZY_STORE_ID` in `.env.local`
- [ ] Product is set to "Subscription" type
- [ ] Price is $19/month

---

### 5. Runtime Validation

#### ✅ Server Startup Checks
When you run `npm run dev`, check console output:

- [ ] No errors about missing environment variables
- [ ] Server starts on `http://localhost:5173`
- [ ] No TypeScript/import errors

#### ✅ API Endpoint Checks

**Test Checkout Endpoint:**
```bash
curl -X POST http://localhost:5173/api/lemonsqueezy/create-basic-checkout \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Expected:** Should return JSON with `{ "url": "https://..." }` (Lemon Squeezy checkout URL)

**If Error:** Check server logs for missing env vars

**Test Webhook Endpoint:**
```bash
curl -X POST http://localhost:5173/api/lemonsqueezy/webhook \
  -H "Content-Type: application/json" \
  -H "x-event-name: subscription_created" \
  -d '{"data":{"type":"subscriptions","id":"test","attributes":{"user_email":"test@example.com","status":"active"}}}'
```

**Expected:** Should return `404 User not found` (because test@example.com doesn't exist)
**If Error 500:** Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly

---

### 6. Common Issues & Fixes

#### ❌ Issue: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Fix:** 
1. Check `.env.local` file exists in `ZOLA-2.0/` folder
2. Verify key is on one line (no line breaks)
3. Restart dev server after adding

#### ❌ Issue: "Missing Lemon Squeezy environment variables"
**Fix:**
1. Check all 4 Lemon Squeezy vars are in `.env.local`
2. Verify no typos in variable names
3. Restart dev server

#### ❌ Issue: "User not found" in webhook
**Fix:**
- This is normal if email doesn't exist in Supabase
- Make sure user signs up with same email they use in checkout

#### ❌ Issue: "Failed to update profile"
**Fix:**
1. Run SQL to add billing columns (see `PAYMENT_INTEGRATION_CHECKLIST.md`)
2. Verify `SUPABASE_SERVICE_ROLE_KEY` has service_role permissions
3. Check Supabase RLS policies allow service role updates

---

### 7. Final Verification Steps

1. ✅ All environment variables are set
2. ✅ Supabase database columns exist
3. ✅ Lemon Squeezy webhook is configured
4. ✅ Server starts without errors
5. ✅ Checkout endpoint returns URL
6. ✅ Webhook endpoint responds (even if 404 for test)

---

## 🎯 Ready to Test?

If all checks pass:

1. **Start dev server:** `npm run dev`
2. **Start ngrok:** `ngrok http 5173`
3. **Update webhook URL** in Lemon Squeezy if ngrok URL changed
4. **Test payment:** Go to `/pricing` → Click Basic → Complete test payment
5. **Verify:** Check Supabase `profiles` table for plan update

---

## 📝 Notes

- `.env.local` is gitignored (correct - never commit secrets!)
- Service role key bypasses RLS (required for webhook updates)
- Webhook signature verification is logged but not strictly enforced (can add crypto verification later)
- All env vars are loaded at server startup



