# ZOLA AI Subscription & Credit System - Analysis Summary

## 🎯 Core Message from the Content

The content is telling you to **separate three concepts** and follow the **Cursor model** (treat credits as capacity, not stored value).

---

## 📋 Key Principles Explained

### 1. **Three Separate Concepts (Never Mix)**

```
Subscription PLAN  ≠  BILLING CYCLE  ≠  CREDITS
```

**What this means:**
- **Plan** = What tier user has (Basic/Pro/Agency)
- **Billing** = When they pay (Monthly/Annual) - handled by Lemon Squeezy
- **Credits** = AI compute allowance - handled by YOUR system

**Why separate?**
- Clean upgrades
- No confusion
- Easy to manage
- Prevents abuse

---

### 2. **The Cursor Model (Recommended Approach)**

**Core Mindset:**
> "We don't sell usage. We sell access to higher capacity."

**What this means:**
- Credits = AI compute capacity (like GPU time)
- Credits ≠ Money (never convert credits to money)
- Credits ≠ Stored value (don't treat like a wallet)

---

## 🔄 Upgrade Rules (Critical)

### ✅ **Rule 1: Monthly → Higher Monthly (Basic → Pro)**

**What happens:**
1. User upgrades Basic ($29) → Pro ($79) mid-cycle
2. Lemon Squeezy handles proration (charges difference)
3. **YOUR SYSTEM:**
   - ❌ **DON'T** carry old credits forward
   - ✅ **DO** reset credits immediately
   - ✅ **DO** activate new plan credits (750) immediately
   - ✅ **DO** discard old credits (even if unused)

**Example:**
```
Before: Basic Monthly, 120 credits remaining
After:  Pro Monthly, 750 credits (old 120 discarded)
```

**Why?**
- Fair to all users
- Prevents credit hoarding
- Simple accounting
- Industry standard (Cursor, Canva, Notion all do this)

---

### ✅ **Rule 2: Monthly → Annual**

**What happens:**
1. User switches from Monthly to Annual
2. Monthly subscription → **ends**
3. Annual subscription → **starts fresh**
4. **YOUR SYSTEM:**
   - ❌ **DON'T** mix monthly + annual credits
   - ✅ **DO** reset credits to annual pool
   - ✅ **DO** reset billing cycle to 1 year

**Example:**
```
Before: Basic Monthly, 50 credits remaining
After:  Basic Annual, 250 credits (old 50 discarded, fresh start)
```

---

### ✅ **Rule 3: Downgrade (Pro → Basic)**

**What happens:**
1. User downgrades mid-cycle
2. **YOUR SYSTEM:**
   - ✅ **DO** keep current plan active until cycle ends
   - ✅ **DO** allow user to use current credits until renewal
   - ✅ **DO** apply downgrade at next billing cycle
   - ✅ **DO** reset credits on renewal

**Example:**
```
Today: User requests downgrade from Pro → Basic
Current: Pro stays active, 500 credits still usable
Next Renewal: Basic activates, 250 credits reset
```

**Why?**
- No punishment
- Fair to user
- Clean transition

---

## ⚡ Credit Rules (Non-Negotiable)

### ✅ **DO These:**
- ✅ Reset credits on **every** plan change
- ✅ Discard unused credits on upgrade
- ✅ Never refund used credits
- ✅ Never convert credits to money
- ✅ Credits expire at cycle end

### ❌ **DON'T Do These:**
- ❌ Carry unused credits across plans
- ❌ Convert credits to money
- ❌ Stack monthly + annual credits
- ❌ Refund used credits
- ❌ Add old + new credits together

---

## 💰 Money Handling (Lemon Squeezy's Job)

**What Lemon Squeezy Does:**
- Handles proration automatically
- Calculates unused value
- Charges only the difference
- Sends webhooks to your system

**What YOU Do:**
- React to webhooks
- Update plan in database
- Reset credits
- Update renewal date

**You don't calculate money logic yourself!**

---

## 🧱 What Happens Internally (Simple Flow)

### When Lemon Squeezy Webhook Arrives:

```
1. Verify payment ✅
2. Update user plan ✅
3. Reset credits ✅ (IMPORTANT: Don't add, RESET)
4. Update renewal date ✅
```

**That's it. Simple.**

---

## 🚨 Current Implementation vs. Recommended

### ❌ **Your Current Code (server.ts lines 357-371):**

```typescript
// Current: Adding rollover credits
const rolloverCredits = remainingCredits;
const newTotalCredits = credits + rolloverCredits; // ❌ WRONG
```

**Problem:** This carries credits forward on upgrades, which the content says NOT to do.

### ✅ **Recommended Approach:**

```typescript
// Recommended: Reset credits on plan change
const newTotalCredits = credits; // ✅ Just new plan credits
// Discard old credits completely
```

---

## 🗣️ How to Explain to Users (Cursor Style)

**Don't explain math. Use simple language:**

✅ **Good:**
- "Your new plan is active immediately."
- "Credits reset when you change plans."
- "Downgrades take effect next billing cycle."

❌ **Bad:**
- "We'll convert your unused credits..."
- "We'll add leftover usage..."
- "We'll refund unused capacity..."

---

## 🎯 Final Summary

### **The Content is Telling You:**

1. **Separate** Plan, Billing, and Credits (3 different things)
2. **Reset** credits on every plan change (don't carry forward)
3. **Treat credits as capacity**, not stored value
4. **Follow Cursor model** - industry standard
5. **Let Lemon Squeezy** handle money/proration
6. **You handle** credits and logic only

### **Why This Model is Safe:**

✅ Protects margins
✅ Prevents abuse
✅ Simplifies support
✅ Scales cleanly
✅ No edge cases
✅ No refund disasters

---

## 🔥 Next Steps

1. **Update webhook handler** to reset credits (not add)
2. **Remove credit rollover** on plan changes
3. **Keep rollover** only for renewals (same plan)
4. **Test upgrade scenarios** thoroughly
5. **Update user messaging** to be simple and clear

---

## 📝 Key Takeaway

> **"Plan change = capacity reset. Credits ≠ money. Credits = AI compute allowance."**

This is the mindset you need. If you follow this, your SaaS will scale cleanly with no edge cases, no refund disasters, and no credit abuse.



