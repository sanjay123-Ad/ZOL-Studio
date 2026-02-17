# Pricing & Credits Update Guide

## 📋 New Pricing Structure

### Updated Plans (Effective Immediately)

| Plan | Monthly Price | Annual Price | Annual Savings | Credits/Month |
|------|--------------|--------------|----------------|--------------|
| **Basic** | $49 | $490 | $98 (2 months free) | 175 |
| **Pro** | $99 | $990 | $198 (2 months free) | 360 |
| **Agency** | $149 | $1,490 | $298 (2 months free) | 550 |

---

## ✅ Code Updates Completed

All code files have been updated with the new pricing and credits:

1. ✅ **`pages/PricingPage.tsx`** - UI pricing display
2. ✅ **`services/creditService.ts`** - Credit allocation function
3. ✅ **`server.ts`** - Credit allocation function
4. ✅ **`api/lemonsqueezy/webhook.ts`** - Webhook credit allocation
5. ✅ **`api/credits/monthly-reset.ts`** - Monthly credit reset function

---

## 🔧 Required Updates in External Services

### 1. **LemonSqueezy Dashboard Updates**

You need to update the product prices in your LemonSqueezy dashboard:

#### **Basic Plan:**
- **Monthly Variant:** Update price to **$49/month**
- **Annual Variant:** Update price to **$490/year**
- **Variant IDs:** Keep existing variant IDs (they're referenced in environment variables)

#### **Pro Plan:**
- **Monthly Variant:** Update price to **$99/month**
- **Annual Variant:** Update price to **$990/year**
- **Variant IDs:** Keep existing variant IDs

#### **Agency Plan:**
- **Monthly Variant:** Update price to **$149/month**
- **Annual Variant:** Update price to **$1,490/year**
- **Variant IDs:** Keep existing variant IDs

#### **Steps to Update in LemonSqueezy:**
1. Log in to [LemonSqueezy Dashboard](https://app.lemonsqueezy.com)
2. Go to **Products** → Select each product
3. For each variant (Monthly/Annual):
   - Click **Edit Variant**
   - Update the **Price** field
   - Save changes
4. **Important:** Do NOT change variant IDs - they're used in webhooks

---

### 2. **Supabase Database Updates**

**No database schema changes required!** The pricing is stored in code, not in the database.

However, you may want to update existing users' credits if they're on old plans:

#### **Option A: Let Credits Reset Naturally (Recommended)**
- Existing users keep their current credits
- New credits will be allocated based on new plan when:
  - Subscription renews
  - User upgrades/downgrades
  - Monthly credit reset runs

#### **Option B: Manually Update Existing Users (If Needed)**
If you want to immediately update existing users' credits:

```sql
-- Update Basic plan users to 175 credits
UPDATE profiles 
SET total_credits = 175 
WHERE plan_tier = 'basic' 
  AND plan_status = 'active';

-- Update Pro plan users to 360 credits
UPDATE profiles 
SET total_credits = 360 
WHERE plan_tier = 'pro' 
  AND plan_status = 'active';

-- Update Agency plan users to 550 credits
UPDATE profiles 
SET total_credits = 550 
WHERE plan_tier = 'agency' 
  AND plan_status = 'active';
```

**⚠️ Warning:** Only run these SQL commands if you want to immediately change existing users' credits. Otherwise, let the system handle it naturally through renewals and resets.

---

## 📝 Environment Variables

**No changes needed!** The variant IDs remain the same. Just ensure these are set:

### Frontend (`.env` or Vercel):
```
VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=...
VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=...
VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=...
VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=...
VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=...
VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=...
```

### Backend (Vercel Environment Variables):
```
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=...
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=...
LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=...
```

---

## 🧪 Testing Checklist

After updating LemonSqueezy prices, test the following:

### 1. **Pricing Page Display**
- [ ] Visit `/pricing` page
- [ ] Verify Basic plan shows $49/month, $490/year
- [ ] Verify Pro plan shows $99/month, $990/year
- [ ] Verify Agency plan shows $149/month, $1,490/year
- [ ] Verify credit amounts: 175, 360, 550
- [ ] Toggle between Monthly/Annual and verify prices

### 2. **Checkout Flow**
- [ ] Click "Get Started" on Basic plan (Monthly)
- [ ] Verify LemonSqueezy checkout shows $49
- [ ] Click "Get Started" on Pro plan (Monthly)
- [ ] Verify LemonSqueezy checkout shows $99
- [ ] Click "Get Started" on Agency plan (Monthly)
- [ ] Verify LemonSqueezy checkout shows $149
- [ ] Test Annual plans and verify annual prices

### 3. **Webhook & Credit Allocation**
- [ ] Complete a test purchase (use test mode)
- [ ] Verify webhook receives subscription_created event
- [ ] Check Supabase `profiles` table:
  - [ ] `plan_tier` is correct
  - [ ] `total_credits` matches new plan (175/360/550)
  - [ ] `billing_period` is correct
  - [ ] `plan_status` is 'active'

### 4. **Monthly Credit Reset**
- [ ] Wait for monthly reset or trigger manually
- [ ] Verify users get correct credits (175/360/550)
- [ ] Verify rollover credits are calculated correctly

---

## 🔄 Migration Notes

### For Existing Subscribers:

1. **Current Active Subscriptions:**
   - Will continue with their current plan pricing until renewal
   - On renewal, they'll be charged the NEW price
   - Credits will be updated to new amounts on renewal

2. **Plan Upgrades/Downgrades:**
   - Users can upgrade/downgrade anytime
   - New credits will be allocated based on NEW plan amounts
   - Old credits will be reset (per plan change logic)

3. **New Subscriptions:**
   - All new subscriptions will use the new pricing
   - Credits will be allocated based on new amounts (175/360/550)

---

## 📊 Credit Allocation Summary

| Plan | Monthly Credits | Annual Credits | Notes |
|------|----------------|----------------|-------|
| Basic | 175 | 175 | Same credits for monthly/annual |
| Pro | 360 | 360 | Same credits for monthly/annual |
| Agency | 550 | 550 | Same credits for monthly/annual |

**Important:** Annual plans get the same monthly credits as monthly plans. The benefit of annual plans is the price discount (2 months free), not additional credits.

---

## 🚨 Important Reminders

1. **LemonSqueezy Prices:** Must be updated manually in the dashboard
2. **Variant IDs:** Do NOT change - they're used in webhooks
3. **Existing Users:** Will get new credits on renewal (or can be manually updated)
4. **Testing:** Always test in LemonSqueezy test mode first
5. **Webhooks:** Ensure webhook URL is correct and receiving events

---

## 📞 Support

If you encounter any issues:

1. Check LemonSqueezy webhook logs in Vercel
2. Verify variant IDs match environment variables
3. Check Supabase `profiles` table for credit allocation
4. Review webhook payloads in LemonSqueezy dashboard

---

## ✅ Completion Checklist

- [x] Code files updated
- [ ] LemonSqueezy prices updated
- [ ] Test checkout flow
- [ ] Test webhook credit allocation
- [ ] Verify pricing page displays correctly
- [ ] (Optional) Update existing users' credits in Supabase

---

**Last Updated:** [Current Date]
**Status:** Code updates complete, awaiting LemonSqueezy price updates

