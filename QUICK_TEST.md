# ⚡ Quick Test Guide - 5 Minutes

## Fast Testing Steps

### 1️⃣ Start Everything (2 min)
```bash
# Terminal 1: Start dev server
cd ZOLA-2.0
npm run dev

# Terminal 2: Start ngrok
ngrok http 5173

# Copy the ngrok URL (e.g., https://xxxx.ngrok-free.dev)
```

### 2️⃣ Update Webhook URL (1 min)
- Go to Lemon Squeezy → Settings → Webhooks
- Update URL to: `https://your-ngrok-url.ngrok-free.dev/api/lemonsqueezy/webhook`
- Save

### 3️⃣ Test Payment (2 min)
1. Open: `http://localhost:5173/pricing`
2. Click **Basic** → **Get Started**
3. On Lemon Squeezy checkout:
   - Email: Use email that exists in Supabase
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
4. Click **Subscribe**

### 4️⃣ Verify (30 sec)
**Check Server Logs:**
```
✅ Should see: "Lemon Squeezy webhook received: subscription_created"
✅ Should see: "Successfully updated profile for user..."
```

**Check Supabase:**
- Go to Table Editor → `profiles`
- Find your user by email
- Check: `plan_tier = 'basic'` and `plan_status = 'active'`

---

## ✅ Success = All Green!

If you see:
- ✅ Redirect to Lemon Squeezy ✓
- ✅ Payment completes ✓
- ✅ Server logs show webhook ✓
- ✅ Database updated ✓

**Then it's working! 🎉**

---

## ❌ If Something Fails

**Checkout doesn't redirect?**
→ Check server logs for missing env vars

**Webhook fails?**
→ Check ngrok URL matches Lemon Squeezy webhook URL

**Database not updating?**
→ Check server logs for "User not found" or "Error updating profile"

**User not found?**
→ Make sure email in checkout matches Supabase user email exactly



