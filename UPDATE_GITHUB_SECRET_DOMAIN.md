# 🔧 Update GitHub Secret - Vercel Domain

## 🎯 **What to Update**

Your Vercel deployment is at: **`https://zol-studio-p5v9.vercel.app`**

You need to update the GitHub secret `VERCEL_CREDIT_RESET_URL` to use this domain.

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Go to GitHub Secrets**

1. Go to your repository: `https://github.com/sanjay123-Ad/ZOL-Studio`
2. Click **Settings** (top navigation)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. You'll see your secrets list

---

### **Step 2: Update the Secret**

1. Find **`VERCEL_CREDIT_RESET_URL`** in the list
2. Click the **pencil icon** (✏️) next to it (or click on the secret name)
3. **Update the value to:**
   ```
   https://zol-studio-p5v9.vercel.app/api/credits/monthly-reset
   ```
4. Click **Update secret**

---

## ✅ **Correct URL Format**

**Current (Wrong):**
```
https://zol-studio.vercel.app/api/credits/monthly-reset
```

**New (Correct):**
```
https://zol-studio-p5v9.vercel.app/api/credits/monthly-reset
```

**Important:** 
- ✅ Use your actual Vercel domain: `zol-studio-p5v9.vercel.app`
- ✅ Include the full path: `/api/credits/monthly-reset`
- ✅ Use `https://` (not `http://`)

---

## 🧪 **Test After Updating**

### **Test 1: Test Endpoint Directly**

After updating the secret, test the endpoint:

```bash
curl -X POST https://zol-studio-p5v9.vercel.app/api/credits/monthly-reset \
  -H "x-reset-secret: zola-credit-reset-2024-secret-key" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "message": "No users need credit reset",
  "reset": 0
}
```

If you get this → Endpoint is working! ✅

---

### **Test 2: Test GitHub Actions Workflow**

1. Go to GitHub → **Actions** tab
2. Click **Monthly Credit Reset**
3. Click **Run workflow** → **Run workflow**
4. Check the logs

**Expected:**
- ✅ HTTP Status: **200** (not 404)
- ✅ JSON response
- ✅ No errors

---

## 🔍 **Verify Secret is Updated**

1. Go to GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Find **`VERCEL_CREDIT_RESET_URL`**
3. Click the **eye icon** 👁️ to view (it will show the value)
4. Verify it shows: `https://zol-studio-p5v9.vercel.app/api/credits/monthly-reset`

---

## 📝 **Quick Summary**

**What to Change:**
- Secret Name: `VERCEL_CREDIT_RESET_URL`
- Old Value: `https://zol-studio.vercel.app/api/credits/monthly-reset`
- New Value: `https://zol-studio-p5v9.vercel.app/api/credits/monthly-reset`

**Where:**
- GitHub → Settings → Secrets and variables → Actions

**After:**
- ✅ Update the secret
- ✅ Test endpoint manually
- ✅ Test GitHub Actions workflow

---

## 🎯 **Alternative: Use Custom Domain**

If you have a custom domain (like `yourdomain.com`), you can use that instead:

```
https://yourdomain.com/api/credits/monthly-reset
```

But for now, use your Vercel domain: `zol-studio-p5v9.vercel.app`

---

## ✅ **After Updating**

1. ✅ Secret updated with correct domain
2. ✅ Test endpoint manually (should work)
3. ✅ Test GitHub Actions workflow (should get 200, not 404)
4. ✅ Cron job will work automatically daily

**That's it! Just update the secret and test!** 🎉






