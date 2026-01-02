# 🚀 Lemon Squeezy Live Mode Setup - Complete Guide

## ✅ **Congratulations!**

Your Lemon Squeezy store has been activated! Now it's time to switch from **Test Mode** to **Live Mode** and start accepting real payments.

---

## 📋 **Step-by-Step Setup**

### **Step 1: Get Your Live API Keys** 🔑

1. **Go to Lemon Squeezy Dashboard:**
   - Visit: [https://app.lemonsqueezy.com](https://app.lemonsqueezy.com)
   - Log in to your account

2. **Navigate to API Settings:**
   - Click **Settings** (bottom left)
   - Click **API** in the sidebar
   - You'll see two sections:
     - **Test Mode API Key** (starts with `ls_test_...`)
     - **Live Mode API Key** (starts with `ls_live_...`)

3. **Copy Your Live API Key:**
   - Click **"Reveal"** or **"Copy"** next to **Live Mode API Key**
   - Save it securely (you'll need it in Step 2)

4. **Get Your Store ID:**
   - Go to **Settings** → **Stores**
   - Click on your store
   - Copy the **Store ID** (it's a number, e.g., `251116`)

---

### **Step 2: Update Vercel Environment Variables** ⚙️

1. **Go to Vercel Dashboard:**
   - Visit: [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Environment Variables:**
   - Click **Settings** → **Environment Variables**

3. **Update These Variables:**

   **A. Update API Key:**
   - Find: `LEMONSQUEEZY_API_KEY`
   - **Old value:** `ls_test_...` (test mode)
   - **New value:** `ls_live_...` (live mode - from Step 1)
   - Click **Save**

   **B. Verify Store ID:**
   - Find: `LEMONSQUEEZY_STORE_ID`
   - Make sure it matches your store ID from Step 1
   - If different, update it

   **C. Verify Webhook Secret:**
   - Find: `LEMONSQUEEZY_WEBHOOK_SECRET`
   - Keep the same value (don't change this)

   **D. Update Success URL (if needed):**
   - Find: `LEMONSQUEEZY_SUCCESS_URL`
   - Should be: `https://zolstudio.com/?payment=success`
   - Update if different

4. **Select Environments:**
   - Make sure all variables are set for:
     - ✅ **Production**
     - ✅ **Preview** (optional)
     - ✅ **Development** (optional, can keep test mode for local dev)

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger deployment

---

### **Step 3: Update Webhook URL** 🔗

1. **Go to Lemon Squeezy Dashboard:**
   - **Settings** → **Webhooks**

2. **Edit Your Webhook:**
   - Click on your existing webhook (or create new one)

3. **Update Webhook URL:**
   - **Old URL (Test):** `https://your-ngrok-url.ngrok-free.dev/api/lemonsqueezy/webhook`
   - **New URL (Live):** `https://zolstudio.com/api/lemonsqueezy/webhook`
   - **Important:** Use your production domain!

4. **Verify Webhook Secret:**
   - Make sure it matches `LEMONSQUEEZY_WEBHOOK_SECRET` in Vercel
   - If different, update one to match the other

5. **Select Events:**
   - Make sure these events are selected:
     - ✅ `subscription_created`
     - ✅ `subscription_updated`
     - ✅ `subscription_cancelled`
     - ✅ `subscription_expired`
     - ✅ `subscription_payment_success`
     - ✅ `subscription_payment_failed`

6. **Save the Webhook**

---

### **Step 4: Switch to Live Mode in Dashboard** 🎯

1. **Go to Lemon Squeezy Dashboard:**
   - Look for a **"Test Mode"** toggle or banner at the top
   - Or go to **Settings** → **Store Settings**

2. **Switch to Live Mode:**
   - Toggle **"Test Mode"** to **OFF**
   - Or click **"Switch to Live Mode"**
   - Confirm the switch

3. **Verify:**
   - The banner should change from "Test Mode" to "Live Mode"
   - Your store is now accepting real payments!

---

### **Step 5: Test a Real Payment** 💳

**⚠️ IMPORTANT:** Test with a small amount first!

1. **Go to Your Pricing Page:**
   - Visit: `https://zolstudio.com/pricing`

2. **Start a Checkout:**
   - Click **"Get Started"** on Basic plan (or any plan)
   - You should be redirected to Lemon Squeezy checkout

3. **Verify Live Mode:**
   - Checkout page should **NOT** show "Test Mode" banner
   - Should show real payment options

4. **Complete Payment:**
   - Use a **real credit card** (or test with a small amount)
   - Fill in payment details
   - Complete the checkout

5. **Verify Success:**
   - Should redirect to: `https://zolstudio.com/?payment=success`
   - Check Supabase to verify subscription was created
   - Check Lemon Squeezy dashboard for the transaction

---

### **Step 6: Verify Webhook is Working** ✅

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → **Functions** → **api/lemonsqueezy/webhook**
   - Check **Logs** tab
   - Look for webhook events after payment

2. **Check Supabase:**
   - Go to Supabase Dashboard → **Table Editor** → `profiles`
   - Find the user who made the payment
   - Verify:
     - ✅ `plan_tier` = `'basic'` (or the plan they purchased)
     - ✅ `plan_status` = `'active'`
     - ✅ `lemonsqueezy_subscription_id` is filled
     - ✅ `credits` = correct amount (e.g., 250 for Basic)

3. **Check Lemon Squeezy Dashboard:**
   - Go to **Customers** → Find the customer
   - Verify subscription is active
   - Check **Orders** tab for the transaction

---

## 📊 **Monitoring & Management**

### **1. View Transactions in Lemon Squeezy**

1. **Go to Dashboard:**
   - **Orders** → View all transactions
   - **Customers** → View all customers
   - **Subscriptions** → View active subscriptions

2. **Filter by:**
   - Date range
   - Status (active, cancelled, expired)
   - Plan type

---

### **2. Manage Subscriptions**

**For You (Admin):**
- Go to **Customers** → Click on a customer
- View their subscription details
- Cancel, pause, or modify subscriptions
- View payment history

**For Customers:**
- They can manage subscriptions via:
  - **Lemon Squeezy Customer Portal** (recommended)
  - Or you can build a custom subscription management page

---

### **3. Set Up Customer Portal** 🎨

**Option 1: Use Lemon Squeezy's Built-in Portal (Easiest)**

1. **Get Customer Portal URL:**
   - Lemon Squeezy provides a customer portal URL
   - Format: `https://app.lemonsqueezy.com/my-orders`

2. **Add to Your App:**
   - Add a "Manage Subscription" button in Profile page
   - Link to: `https://app.lemonsqueezy.com/my-orders`
   - Or use Lemon Squeezy API to generate customer-specific portal links

**Option 2: Build Custom Subscription Management**

- Use Lemon Squeezy API to:
  - Get subscription details
  - Cancel subscriptions
  - Update payment methods
  - View billing history

---

### **4. Monitor Webhook Events** 📡

**Check Vercel Logs:**
- Go to Vercel → Your Project → **Functions** → **api/lemonsqueezy/webhook** → **Logs**
- Monitor for:
  - `subscription_created` - New subscription
  - `subscription_updated` - Subscription changed
  - `subscription_cancelled` - Subscription cancelled
  - `subscription_payment_success` - Payment successful
  - `subscription_payment_failed` - Payment failed

**Set Up Alerts (Optional):**
- Use Vercel's monitoring
- Or set up external monitoring (e.g., Sentry, LogRocket)

---

## 🧪 **Testing Checklist**

After switching to live mode, test:

- [ ] **Checkout Flow:**
  - [ ] Click "Get Started" on pricing page
  - [ ] Redirects to Lemon Squeezy checkout
  - [ ] No "Test Mode" banner visible
  - [ ] Can complete real payment

- [ ] **Payment Processing:**
  - [ ] Payment completes successfully
  - [ ] Redirects to success page
  - [ ] Transaction appears in Lemon Squeezy dashboard

- [ ] **Webhook Processing:**
  - [ ] Webhook receives events
  - [ ] Supabase profile updated correctly
  - [ ] Credits allocated correctly
  - [ ] Subscription status = 'active'

- [ ] **User Experience:**
  - [ ] User sees subscription in profile page
  - [ ] Credits are available
  - [ ] Can use premium features

---

## 🔒 **Security Checklist**

- [ ] **API Keys:**
  - [ ] Live API key is in Vercel (not in code)
  - [ ] Never commit API keys to Git
  - [ ] Use different keys for test/live

- [ ] **Webhook Security:**
  - [ ] Webhook secret is set and matches
  - [ ] Webhook URL uses HTTPS
  - [ ] Webhook signature verification is working

- [ ] **Environment Variables:**
  - [ ] All sensitive data in Vercel env vars
  - [ ] Not exposed in client-side code
  - [ ] Different values for production/preview/dev

---

## 📝 **Important Notes**

### **Test Mode vs Live Mode:**

- **Test Mode:**
  - API Key: `ls_test_...`
  - Test cards work (4242 4242 4242 4242)
  - No real charges
  - Good for development

- **Live Mode:**
  - API Key: `ls_live_...`
  - Real credit cards only
  - Real charges
  - Production ready

### **Keep Test Mode for Development:**

- You can keep test mode API keys in your local `.env.local`
- Use live mode only in Vercel production environment
- This way you can test locally without real charges

---

## 🐛 **Troubleshooting**

### **Issue: Payment not processing**

**Check:**
1. API key is `ls_live_...` (not `ls_test_...`)
2. Store ID is correct
3. Variant IDs are correct
4. Webhook URL is production domain
5. Check Vercel logs for errors

### **Issue: Webhook not receiving events**

**Check:**
1. Webhook URL is correct: `https://zolstudio.com/api/lemonsqueezy/webhook`
2. Webhook secret matches in both places
3. Webhook is enabled in Lemon Squeezy
4. Check Vercel function logs
5. Verify HTTPS is working (not HTTP)

### **Issue: Subscription not updating in Supabase**

**Check:**
1. Webhook is receiving events (check Vercel logs)
2. Webhook handler is processing correctly
3. User email matches in Supabase
4. Check Supabase logs for errors
5. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

---

## 🎉 **You're Live!**

Once you complete these steps:
- ✅ Your store is accepting real payments
- ✅ Subscriptions are being processed
- ✅ Webhooks are updating your database
- ✅ Customers can subscribe and use your service

**Congratulations on going live! 🚀**

---

## 📞 **Need Help?**

- **Lemon Squeezy Support:** [support@lemonsqueezy.com](mailto:support@lemonsqueezy.com)
- **Lemon Squeezy Docs:** [https://docs.lemonsqueezy.com](https://docs.lemonsqueezy.com)
- **Check Vercel Logs:** For webhook debugging
- **Check Supabase Logs:** For database issues

---

**Next Steps:**
1. Monitor first few transactions closely
2. Set up customer support email
3. Consider adding subscription management UI
4. Set up payment failure notifications



