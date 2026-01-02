# 🔗 Lemon Squeezy Webhook URL Update Guide

## ✅ **What to Do Right Now**

### **Step 1: Update Webhook URL in Lemon Squeezy**

1. **In the "Edit Webhook" modal you're seeing:**
   - Find the **"Callback URL"** field
   - **Remove:** `nonrustically-escapeless-emerson.ngrok-free.dev/api/lemonsqueezy/webhoc`
   - **Replace with:** `zolstudio.com/api/lemonsqueezy/webhook`
   - **Full URL should be:** `https://zolstudio.com/api/lemonsqueezy/webhook`

2. **Keep the Signing Secret:**
   - Value: `my-zola-fashion` ✅ (already correct)

3. **Verify Events Selected:**
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_payment_success`

4. **Click "Save Webhook"** ✅

---

## 🎯 **About Localhost Testing**

### **After You Update to Production URL:**

**✅ You're RIGHT - You won't need ngrok for production webhooks!**

**Here's why:**
- **Production webhooks** → Go directly to `https://zolstudio.com/api/lemonsqueezy/webhook`
- **No ngrok needed** → Your Vercel deployment handles it
- **Works automatically** → Lemon Squeezy sends webhooks to your production domain

---

## 🧪 **What About Local Testing?**

### **Option 1: Test on Production (Recommended)** ✅

**Best for:**
- Real-world testing
- Verifying production setup
- Testing with actual payments

**How:**
1. Keep webhook URL as: `https://zolstudio.com/api/lemonsqueezy/webhook`
2. Make test purchases on your production site
3. Check Vercel logs to see webhook events
4. **No ngrok needed!** 🎉

---

### **Option 2: Test Locally with ngrok (Optional)**

**Only if you need to:**
- Debug webhook processing code locally
- Test webhook logic before deploying

**How:**
1. **Temporarily change webhook URL back to ngrok:**
   - Start ngrok: `ngrok http 5173`
   - Copy new ngrok URL
   - Update Lemon Squeezy webhook to: `https://your-ngrok-url.ngrok-free.dev/api/lemonsqueezy/webhook`
   - Run local server: `npm run dev`

2. **After testing:**
   - **Change webhook URL back to:** `https://zolstudio.com/api/lemonsqueezy/webhook`
   - **Important:** Always switch back to production URL!

---

## 📋 **Summary**

### **For Production (What You Should Do Now):**
- ✅ Update webhook URL to: `https://zolstudio.com/api/lemonsqueezy/webhook`
- ✅ Keep signing secret: `my-zola-fashion`
- ✅ Save webhook
- ✅ **No ngrok needed!** 🎉

### **For Local Testing (Optional):**
- ⚠️ Only use ngrok if you need to debug locally
- ⚠️ Always switch back to production URL after testing
- ✅ **Recommended:** Test directly on production instead

---

## ✅ **Quick Checklist**

- [ ] Update Callback URL to: `https://zolstudio.com/api/lemonsqueezy/webhook`
- [ ] Verify Signing Secret: `my-zola-fashion`
- [ ] Verify Events: `subscription_created`, `subscription_updated`, `subscription_payment_success`
- [ ] Click "Save Webhook"
- [ ] **Done!** No more ngrok needed for production! 🎉

---

## 🎉 **You're All Set!**

After updating:
- ✅ Production webhooks work automatically
- ✅ No ngrok needed for production
- ✅ All webhooks go to your Vercel deployment
- ✅ You can test directly on `https://zolstudio.com`

**Your webhook is now production-ready!** 🚀






