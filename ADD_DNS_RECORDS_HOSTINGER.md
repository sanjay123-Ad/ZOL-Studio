# 🌐 Add DNS Records in Hostinger - Step by Step

## 🎯 **What You Need to Do**

Your domains `zolstudio.com` and `www.zolstudio.com` show "Invalid Configuration" because the DNS records aren't added in Hostinger yet.

**You need to add these 2 DNS records in Hostinger:**

---

## 📋 **DNS Records to Add**

### **Record 1: For `zolstudio.com` (Root Domain)**

From Vercel, you need to add:
- **Type:** A
- **Name:** `@`
- **Value:** `216.198.79.1`

### **Record 2: For `www.zolstudio.com` (www Subdomain)**

From Vercel, you need to add:
- **Type:** CNAME
- **Name:** `www`
- **Value:** `1a17048618b8cd0b.vercel-dns-017.com.`

---

## 🚀 **Step-by-Step Instructions**

### **Step 1: Go to Hostinger DNS Settings**

1. **Log in to Hostinger:**
   - Go to [https://www.hostinger.com](https://www.hostinger.com)
   - Log in to your account

2. **Navigate to DNS:**
   - Click **Domains** (in top menu)
   - Find and click on **`zolstudio.com`**
   - Click **DNS / Nameservers** or **Manage DNS Records**
   - Or look for **"DNS Zone Editor"** or **"DNS Management"**

---

### **Step 2: Add A Record (for zolstudio.com)**

1. **Click "Add Record" or "+" button**

2. **Fill in the A Record:**
   - **Type:** Select **A** (or **A Record**)
   - **Name:** Enter `@` (or leave empty, or enter `zolstudio.com`)
   - **Value/Points to:** Enter `216.198.79.1`
   - **TTL:** Leave default (usually 3600 or Auto)
   - **Priority:** Leave empty (not needed for A records)

3. **Click "Save" or "Add Record"**

---

### **Step 3: Add CNAME Record (for www.zolstudio.com)**

1. **Click "Add Record" or "+" button again**

2. **Fill in the CNAME Record:**
   - **Type:** Select **CNAME** (or **CNAME Record**)
   - **Name:** Enter `www`
   - **Value/Points to:** Enter `1a17048618b8cd0b.vercel-dns-017.com.`
     - **Important:** Include the trailing dot (`.`) at the end
   - **TTL:** Leave default (usually 3600 or Auto)

3. **Click "Save" or "Add Record"**

---

### **Step 4: Verify Records Added**

In Hostinger, you should now see:
- ✅ A Record: `@` → `216.198.79.1`
- ✅ CNAME Record: `www` → `1a17048618b8cd0b.vercel-dns-017.com.`

---

### **Step 5: Wait for DNS Propagation**

- **Usually takes:** 5-30 minutes
- **Can take up to:** 48 hours (rare)
- **Check Status:** Go back to Vercel → Domains tab
- **Status will change to:** "Valid Configuration" ✅ when ready

---

### **Step 6: Refresh in Vercel**

After waiting 5-10 minutes:

1. Go back to Vercel → **Settings** → **Domains**
2. Click **"Refresh"** button next to each domain
3. Status should update to **"Valid Configuration"** ✅

---

## 🔍 **Visual Guide - What to Enter in Hostinger**

### **A Record:**
```
Type:     A
Name:     @
Value:    216.198.79.1
TTL:     3600 (or Auto)
```

### **CNAME Record:**
```
Type:     CNAME
Name:     www
Value:    1a17048618b8cd0b.vercel-dns-017.com.
TTL:      3600 (or Auto)
```

**Note:** The trailing dot (`.`) in the CNAME value is important!

---

## ⚠️ **Important Notes**

### **If You See Existing Records:**
- You might have existing A or CNAME records
- **Delete or update them** to match Vercel's records
- Don't have duplicate records

### **Name Field:**
- For A record: Use `@` or leave empty (means root domain)
- For CNAME: Use `www` (means www subdomain)

### **Value Field:**
- Copy exactly as shown in Vercel
- Include the trailing dot (`.`) in CNAME if present
- No spaces before or after

---

## 🧪 **Test After Adding Records**

### **Test 1: Check DNS Propagation**

Use online tools to check:
- [https://dnschecker.org](https://dnschecker.org)
- Enter: `zolstudio.com`
- Should show: `216.198.79.1`

### **Test 2: Visit Your Domain**

After 5-30 minutes:
- Visit: `https://zolstudio.com`
- Should load your ZOLA AI app ✅

### **Test 3: Check Vercel Status**

- Go to Vercel → Domains
- Status should show: **"Valid Configuration"** ✅

---

## 📋 **Quick Checklist**

- [ ] Log in to Hostinger
- [ ] Go to DNS settings for `zolstudio.com`
- [ ] Add A Record: `@` → `216.198.79.1`
- [ ] Add CNAME Record: `www` → `1a17048618b8cd0b.vercel-dns-017.com.`
- [ ] Wait 5-30 minutes
- [ ] Refresh in Vercel
- [ ] Verify status shows "Valid Configuration"
- [ ] Test domain loads correctly

---

## ✅ **After DNS Records Are Added**

Once status shows "Valid Configuration":

1. **Update GitHub Secret:**
   - Go to GitHub → Settings → Secrets
   - Update `VERCEL_CREDIT_RESET_URL` to: `https://zolstudio.com/api/credits/monthly-reset`

2. **Test Your Domain:**
   - Visit: `https://zolstudio.com`
   - Should load your app ✅

3. **Test Endpoint:**
   ```bash
   curl -X POST https://zolstudio.com/api/credits/monthly-reset \
     -H "x-reset-secret: zola-credit-reset-2024-secret-key"
   ```

---

## 🎯 **Summary**

**What to Do:**
1. ✅ Go to Hostinger DNS settings
2. ✅ Add A Record: `@` → `216.198.79.1`
3. ✅ Add CNAME Record: `www` → `1a17048618b8cd0b.vercel-dns-017.com.`
4. ✅ Wait 5-30 minutes
5. ✅ Refresh in Vercel
6. ✅ Status will change to "Valid Configuration" ✅

**That's it!** After adding DNS records, your domains will work! 🎉






