# 🌐 Connect Hostinger Domain to Vercel - Step by Step

## 📋 **Step-by-Step Instructions**

### **Step 1: Enter Your Domain**

In the "Add Domain" modal:

1. **Domain Input Field:**
   - Enter your domain from Hostinger
   - Example: `yourdomain.com` or `www.yourdomain.com`
   - **Important:** Enter just the domain name (no `https://`)

2. **Select "Connect to an environment":**
   - ✅ Make sure this radio button is selected (it should be by default)
   - ✅ Dropdown should show "Production" (this is correct)

3. **Click "Save"**

---

### **Step 2: Get DNS Records from Vercel**

After clicking "Save", Vercel will show you DNS records to add:

**You'll see something like:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Copy these values!** You'll need them for Hostinger.

---

### **Step 3: Add DNS Records in Hostinger**

1. **Log in to Hostinger:**
   - Go to [https://www.hostinger.com](https://www.hostinger.com)
   - Log in to your account

2. **Navigate to DNS Settings:**
   - Go to **Domains** → Your Domain
   - Click **DNS / Nameservers** or **Manage DNS Records**

3. **Add the DNS Records:**
   - Click **Add Record** or **+ Add**
   - For each record Vercel provided:

   **Record 1 (A Record):**
   - **Type:** A
   - **Name:** `@` (or leave empty, or enter your root domain)
   - **Value:** The IP address from Vercel (e.g., `76.76.21.21`)
   - **TTL:** 3600 (or default)
   - Click **Save**

   **Record 2 (CNAME Record):**
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** The CNAME value from Vercel (e.g., `cname.vercel-dns.com`)
   - **TTL:** 3600 (or default)
   - Click **Save**

4. **Save All Records**

---

### **Step 4: Wait for DNS Propagation**

- **Usually takes:** 5-30 minutes
- **Can take up to:** 48 hours (rare)
- **Check Status:** Go back to Vercel → Domains tab
- **Status will show:** "Valid Configuration" when ready ✅

---

### **Step 5: Update GitHub Secret (Important!)**

After your domain is connected and working:

1. **Go to GitHub:**
   - Repository: `sanjay123-Ad/ZOL-Studio`
   - **Settings** → **Secrets and variables** → **Actions**

2. **Update `VERCEL_CREDIT_RESET_URL`:**
   - Click the pencil icon (✏️) next to `VERCEL_CREDIT_RESET_URL`
   - Update value to: `https://yourdomain.com/api/credits/monthly-reset`
   - (Replace `yourdomain.com` with your actual domain)
   - Click **Update secret**

---

## ✅ **What to Enter in the Modal**

**In the "Add Domain" modal:**

1. **Domain field:** Enter `yourdomain.com` (your Hostinger domain)
2. **"Connect to an environment":** ✅ Selected (default)
3. **Dropdown:** Should show "Production" ✅
4. **Click:** "Save"

**That's it for the modal!** Then follow steps 2-5 above.

---

## 🔍 **Example**

If your domain is `zolastudio.com`:

**In Vercel Modal:**
- Domain: `zolastudio.com`
- Connect to: Production
- Click: Save

**DNS Records to Add in Hostinger:**
- A Record: `@` → `76.76.21.21`
- CNAME Record: `www` → `cname.vercel-dns.com`

**Update GitHub Secret:**
- `VERCEL_CREDIT_RESET_URL` = `https://zolastudio.com/api/credits/monthly-reset`

---

## ⚠️ **Important Notes**

### **Domain Options:**

**Option 1: Root Domain Only**
- Enter: `yourdomain.com`
- Add A record for `@`

**Option 2: www Subdomain**
- Enter: `www.yourdomain.com`
- Add CNAME record for `www`

**Option 3: Both (Recommended)**
- Add both `yourdomain.com` and `www.yourdomain.com` in Vercel
- Add both A and CNAME records in Hostinger

---

## 🧪 **Verify It's Working**

After DNS propagates:

1. **Check Vercel:**
   - Go to **Domains** tab
   - Status should show: **"Valid Configuration"** ✅

2. **Test Your Domain:**
   - Visit: `https://yourdomain.com`
   - Should load your ZOLA AI app

3. **Test Endpoint:**
   ```bash
   curl -X POST https://yourdomain.com/api/credits/monthly-reset \
     -H "x-reset-secret: zola-credit-reset-2024-secret-key"
   ```
   - Should return JSON response (not 404)

---

## 📋 **Quick Checklist**

- [ ] Enter domain in Vercel modal
- [ ] Click "Save"
- [ ] Copy DNS records from Vercel
- [ ] Add DNS records in Hostinger
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Verify status shows "Valid Configuration"
- [ ] Update GitHub secret `VERCEL_CREDIT_RESET_URL`
- [ ] Test domain loads correctly
- [ ] Test endpoint works

---

## ✅ **Summary**

**In the Modal:**
1. Enter your domain: `yourdomain.com`
2. Keep "Connect to an environment" selected
3. Keep "Production" selected
4. Click **"Save"**

**Then:**
1. Copy DNS records from Vercel
2. Add them in Hostinger
3. Wait for propagation
4. Update GitHub secret
5. Test!

**That's it!** 🎉






