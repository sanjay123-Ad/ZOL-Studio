# 🧪 Complete Testing Guide - Payment Integration

## Overview
This guide will help you test the entire payment flow across:
1. **Your Webpage** (React app)
2. **Lemon Squeezy** (Payment gateway)
3. **Supabase** (Database)

---

## 📋 Pre-Testing Checklist

Before starting, ensure:

- [ ] `.env.local` file exists with all required variables
- [ ] Dev server can start: `npm run dev`
- [ ] ngrok is running: `ngrok http 5173`
- [ ] Lemon Squeezy webhook URL is updated with current ngrok URL
- [ ] You have a test user account in Supabase (or can create one)

---

## 🧪 Test 1: Checkout Flow (Webpage → Lemon Squeezy)

### Step 1: Start Your Dev Server
```bash
cd ZOLA-2.0
npm run dev
```

**Expected:** Server starts on `http://localhost:5173` without errors

### Step 2: Start ngrok
```bash
ngrok http 5173
```

**Expected:** ngrok shows a forwarding URL like:
```
Forwarding: https://xxxx-xxxx-xxxx.ngrok-free.dev -> http://localhost:5173
```

### Step 3: Update Lemon Squeezy Webhook URL
1. Go to **Lemon Squeezy Dashboard** → **Settings** → **Webhooks**
2. Edit your webhook
3. Update **Endpoint URL** to: `https://your-ngrok-url.ngrok-free.dev/api/lemonsqueezy/webhook`
4. **Save**

### Step 4: Test Checkout Button
1. Open browser: `http://localhost:5173/pricing`
2. Click **Basic** plan → **Get Started** button
3. **Watch browser console** (F12 → Console tab)

**Expected Results:**
- ✅ Button shows "Redirecting..." briefly
- ✅ Browser redirects to Lemon Squeezy checkout page
- ✅ Checkout page shows "ZOL Studio AI Basic" product
- ✅ Price shows $19.00/month
- ✅ Test mode banner is visible (orange banner at top)

**If Error:**
- Check server terminal for error messages
- Verify `.env.local` has `LEMONSQUEEZY_API_KEY`, `STORE_ID`, `VARIANT_ID`
- Check browser console for fetch errors

---

## 🧪 Test 2: Complete Test Payment (Lemon Squeezy)

### Step 1: Fill Checkout Form
On the Lemon Squeezy checkout page:

1. **Email:** Use an email that exists in your Supabase `auth.users` table
   - Example: If you have a test user with email `test@example.com`, use that
   - **Important:** Email must match a user in Supabase!

2. **Card Number:** `4242 4242 4242 4242` (Lemon Squeezy test card)

3. **Expiration:** Any future date (e.g., `12/25`)

4. **CVC:** Any 3 digits (e.g., `123`)

5. **Cardholder Name:** Any name (e.g., `Test User`)

### Step 2: Complete Payment
1. Click **Subscribe** or **Pay $19.00**
2. Wait for payment processing

**Expected Results:**
- ✅ Payment processes successfully
- ✅ Redirects to order confirmation page
- ✅ Shows "Order Complete" or similar success message

**If Error:**
- Check Lemon Squeezy dashboard → Orders for error details
- Verify you're in **Test Mode** (orange banner visible)
- Try a different test card if needed

---

## 🧪 Test 3: Verify Webhook Processing (Lemon Squeezy → Your Server)

### Step 1: Check Server Logs
After payment completes, check your **dev server terminal**:

**Expected Log Output:**
```
Lemon Squeezy webhook received: subscription_created
Successfully updated profile for user abc123... (test@example.com) - Plan: basic, Status: active
```

**If You See:**
- ❌ `Missing SUPABASE_SERVICE_ROLE_KEY` → Check `.env.local`
- ❌ `User not found with email: ...` → Email doesn't exist in Supabase
- ❌ `Error updating profile` → Check Supabase database columns

### Step 2: Check Lemon Squeezy Webhook Logs
1. Go to **Lemon Squeezy Dashboard** → **Settings** → **Webhooks**
2. Click on your webhook
3. Check **Recent Deliveries** or **Webhook Logs**

**Expected:**
- ✅ Status: `200 OK` or `Success`
- ✅ Event: `subscription_created`
- ✅ Delivery time shows recent timestamp

**If Error:**
- ❌ `404 Not Found` → Webhook URL is wrong (check ngrok URL)
- ❌ `500 Internal Server Error` → Check server logs for details
- ❌ `Timeout` → Server might be down or ngrok not running

---

## 🧪 Test 4: Verify Database Update (Supabase)

### Step 1: Open Supabase Dashboard
1. Go to **Supabase Dashboard** → **Table Editor**
2. Select **`profiles`** table

### Step 2: Find Your Test User
1. Use the **Filter** or **Search** to find the user by email
2. Or scroll to find the user you used in checkout

### Step 3: Verify Updated Columns

**Expected Values:**
- ✅ `plan_tier` = `basic`
- ✅ `plan_status` = `active`
- ✅ `lemonsqueezy_subscription_id` = (should have a value like `12345`)
- ✅ `lemonsqueezy_customer_id` = (may have a value or be null)
- ✅ `lemonsqueezy_renews_at` = (should have a future date/timestamp)

**If Values Are Wrong:**
- ❌ `plan_tier` still `free` → Webhook didn't process
- ❌ `plan_status` still `inactive` → Check webhook logs
- ❌ All columns NULL → Webhook failed or user not found

### Step 4: Verify User Exists in auth.users
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Search for the email you used in checkout

**Expected:**
- ✅ User exists with matching email
- ✅ User ID matches the `id` in `profiles` table

**If User Doesn't Exist:**
- ❌ Webhook will fail with "User not found"
- ✅ **Solution:** Create user account first, then test payment

---

## 🧪 Test 5: End-to-End Flow Test

### Complete Flow Test:

1. **Create Test User** (if needed):
   - Go to your app: `http://localhost:5173/auth`
   - Sign up with email: `test-payment@example.com`
   - Verify user appears in Supabase → Authentication → Users

2. **Start Payment Flow**:
   - Go to `/pricing`
   - Click Basic → Get Started
   - Should redirect to Lemon Squeezy

3. **Complete Payment**:
   - Use email: `test-payment@example.com` (same as signup)
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

4. **Verify Webhook**:
   - Check server logs for webhook message
   - Check Lemon Squeezy webhook logs

5. **Verify Database**:
   - Check Supabase `profiles` table
   - Verify `plan_tier = 'basic'` and `plan_status = 'active'`

---

## 🔍 Troubleshooting Guide

### Issue: Checkout button doesn't redirect

**Check:**
1. Browser console (F12) for errors
2. Server terminal for API errors
3. Network tab → Check `/api/lemonsqueezy/create-basic-checkout` request
   - Status should be `200`
   - Response should have `{"url": "https://..."}`

**Fix:**
- Verify `.env.local` has all Lemon Squeezy vars
- Restart dev server after changing `.env.local`
- Check Lemon Squeezy API key is valid

---

### Issue: Webhook not receiving events

**Check:**
1. Lemon Squeezy webhook URL is correct (current ngrok URL)
2. ngrok is still running
3. Server is running and accessible

**Fix:**
- Update webhook URL in Lemon Squeezy dashboard
- Restart ngrok if URL changed
- Test webhook manually (see Test 6 below)

---

### Issue: "User not found" in webhook logs

**Check:**
1. Email used in checkout matches Supabase user email exactly
2. User exists in Supabase → Authentication → Users

**Fix:**
- Use exact same email for checkout as signup
- Create user account first, then test payment
- Check for typos in email

---

### Issue: Database not updating

**Check:**
1. Supabase database columns exist (run SQL from checklist)
2. Server logs show webhook processed successfully
3. Service role key is correct

**Fix:**
- Run SQL to add billing columns
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Verify service role key has correct permissions

---

## 🧪 Test 6: Manual Webhook Test

You can manually test the webhook endpoint:

```bash
curl -X POST http://localhost:5173/api/lemonsqueezy/webhook \
  -H "Content-Type: application/json" \
  -H "x-event-name: subscription_created" \
  -d '{
    "data": {
      "type": "subscriptions",
      "id": "test-sub-123",
      "attributes": {
        "user_email": "your-test-email@example.com",
        "status": "active",
        "renews_at": "2024-12-31T00:00:00Z"
      },
      "relationships": {
        "customer": {
          "data": {
            "id": "test-customer-123"
          }
        }
      }
    }
  }'
```

**Expected:**
- If email exists: `200 Webhook processed`
- If email doesn't exist: `404 User not found`
- If service key missing: `500 Server not configured`

---

## ✅ Success Criteria

Your integration is working correctly if:

1. ✅ Checkout button redirects to Lemon Squeezy
2. ✅ Test payment completes successfully
3. ✅ Server logs show webhook received and processed
4. ✅ Lemon Squeezy webhook logs show `200 OK`
5. ✅ Supabase `profiles` table shows:
   - `plan_tier = 'basic'`
   - `plan_status = 'active'`
   - `lemonsqueezy_subscription_id` has value

---

## 📝 Testing Checklist

Use this checklist while testing:

- [ ] Dev server starts without errors
- [ ] ngrok is running and URL is accessible
- [ ] Lemon Squeezy webhook URL is updated
- [ ] Checkout button redirects to Lemon Squeezy
- [ ] Test payment completes successfully
- [ ] Server logs show webhook received
- [ ] Lemon Squeezy webhook logs show success
- [ ] Supabase `profiles` table updated correctly
- [ ] All billing columns have correct values

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Test cancellation flow** (cancel subscription in Lemon Squeezy)
2. **Test renewal flow** (wait for renewal or manually trigger)
3. **Add Pro/Agency plans** (same pattern as Basic)
4. **Add plan-based access control** (check `plan_tier` in protected routes)

---

## 📞 Need Help?

If something doesn't work:
1. Check server logs first
2. Check browser console
3. Check Lemon Squeezy webhook logs
4. Check Supabase database
5. Review error messages in this guide



