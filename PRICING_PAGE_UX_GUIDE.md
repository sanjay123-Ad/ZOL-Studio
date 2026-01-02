# ZOLA AI Pricing Page UX Implementation Guide

## 🎯 Goal

**The user should always know what plan they're on and never accidentally re-buy the same plan.**

---

## 🧠 First Principle (IMPORTANT)

**"Manage Subscription" is shown ONLY for the plan the user is CURRENTLY ACTIVE ON — for the CURRENT billing cycle.**

**Everything else → "Get Started"**

---

## 🧱 Two Dimensions

1. **User's Active Plan**
   - Basic / Pro / Agency
   - Monthly / Annual (billing cycle)

2. **Pricing Toggle**
   - Monthly / Annual (just a view toggle, not their plan yet)

---

## ✅ RULES TO IMPLEMENT

### ✅ **Rule 1: Active Plan Match**

If the card matches the user's current plan + current billing cycle →
- 👉 Show: **"Manage Subscription"**

### ✅ **Rule 2: Different Plan or Cycle**

If the card is:
- A higher plan
- A lower plan
- OR the same plan but different billing cycle
- 👉 Show: **"Get Started"**

**Because that action = change plan**

---

## 🔍 All Scenarios

### 🧪 **Scenario 1: User is on Basic – Monthly**

**Pricing toggle: Monthly**

| Plan Card | Button |
|-----------|--------|
| Basic (Monthly) | ✅ **Manage Subscription** |
| Pro (Monthly) | **Get Started** |
| Agency (Monthly) | **Get Started** |

**Pricing toggle: Annual**

| Plan Card | Button |
|-----------|--------|
| Basic (Annual) | **Get Started** ✅ |
| Pro (Annual) | **Get Started** |
| Agency (Annual) | **Get Started** |

**Why?** Because user is NOT on annual. Clicking = upgrade Monthly → Annual.

---

### 🧪 **Scenario 2: User is on Pro – Monthly**

**Pricing toggle: Monthly**

| Plan Card | Button |
|-----------|--------|
| Basic (Monthly) | **Get Started** |
| Pro (Monthly) | ✅ **Manage Subscription** |
| Agency (Monthly) | **Get Started** |

**Pricing toggle: Annual**

| Plan Card | Button |
|-----------|--------|
| Pro (Annual) | **Get Started** ✅ |
| Others | **Get Started** |

**Why?** Clicking Pro Annual = upgrade to annual. So NOT Manage Subscription.

---

### 🧪 **Scenario 3: User is on Pro – Annual**

**Pricing toggle: Annual**

| Plan Card | Button |
|-----------|--------|
| Pro (Annual) | ✅ **Manage Subscription** |
| Basic (Annual) | **Get Started** |
| Agency (Annual) | **Get Started** |

**Pricing toggle: Monthly**

| Plan Card | Button |
|-----------|--------|
| Pro (Monthly) | **Get Started** ✅ |
| Others | **Get Started** |

**Why?** Monthly ≠ current billing cycle. Clicking = downgrade (scheduled).

---

## 🔥 FINAL GOLDEN RULE

**"Manage Subscription" is ONLY for the exact active plan + billing cycle combo**

**Everything else → "Get Started"**

This is exactly how Cursor, Notion, Canva, Vercel do it.

---

## 🧠 Why This UX Is CORRECT

✅ **Prevents mistakes** - User can't "buy" what they already have
✅ **Makes upgrades obvious** - Annual always looks like an upgrade
✅ **Supports downgrade logic** - Monthly shows as Get Started when user is on Annual
✅ **Simple mental model** - Button = action, not status

---

## 🧩 Backend Logic (Simple Boolean)

```typescript
const isActivePlan = 
  user.planTier === card.planTier &&
  user.billingPeriod === selectedToggle;

if (isActivePlan) {
  // Show "Manage Subscription"
} else {
  // Show "Get Started"
}
```

---

## 📋 Implementation Steps

### Step 1: Add Billing Period Column (If Not Exists)

We need to store the billing period in the profiles table.

**SQL to Run in Supabase:**
```sql
-- Add billing_period column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS billing_period TEXT
    CHECK (billing_period IN ('monthly', 'annual', NULL));

-- Add comment
COMMENT ON COLUMN public.profiles.billing_period IS 'User current billing period: monthly or annual';
```

### Step 2: Update Webhook Handler

The webhook handler should store the billing period when subscription is activated.

**Already done in `server.ts`** - The webhook determines billing period and should store it.

### Step 3: Update PricingPage Component

1. Fetch user's current plan and billing period
2. Compare with each card
3. Show appropriate button

### Step 4: Add "Manage Subscription" Functionality

- Link to Lemon Squeezy customer portal
- Or create a manage subscription page

---

## 🗣️ Optional Microcopy (Recommended)

**Under "Manage Subscription" button:**
- "You're currently on this plan"

**Under "Get Started" (if same plan but other cycle):**
- "Switch to annual & save 20%"

---

## ✅ Supabase Policies

### **No Changes Required**

**Why:**
- Pricing page only READS user profile (SELECT)
- Existing RLS policy allows: "Users can view their own profile"
- No new policies needed

**Current Policy (Already Correct):**
```sql
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);
```

---

## 🧪 Testing Checklist

### Test 1: User on Basic Monthly
- [ ] Basic Monthly card shows "Manage Subscription"
- [ ] Basic Annual card shows "Get Started"
- [ ] Pro Monthly shows "Get Started"
- [ ] Pro Annual shows "Get Started"

### Test 2: User on Pro Annual
- [ ] Pro Annual card shows "Manage Subscription"
- [ ] Pro Monthly card shows "Get Started"
- [ ] Basic Annual shows "Get Started"
- [ ] Agency Annual shows "Get Started"

### Test 3: User Not Logged In
- [ ] All cards show "Get Started"
- [ ] No "Manage Subscription" buttons

### Test 4: User on Free Tier
- [ ] All cards show "Get Started"
- [ ] No "Manage Subscription" buttons

---

## 🚀 Next Steps

1. ✅ Add `billing_period` column to profiles table
2. ✅ Update webhook to store billing period
3. ✅ Update PricingPage to fetch user plan
4. ✅ Implement button logic
5. ✅ Add "Manage Subscription" link/functionality
6. ✅ Test all scenarios

---

## 📝 Key Takeaways

- **Manage Subscription** = Exact match (plan + billing cycle)
- **Get Started** = Everything else
- **Simple boolean logic** - No complex conditions
- **Industry standard** - Matches Cursor, Notion, Canva, Vercel
- **No Supabase policy changes** - Existing policies are correct






