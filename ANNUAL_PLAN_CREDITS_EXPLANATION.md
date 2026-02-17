# Annual Plan Credits - How It Works

## 🎯 Current Implementation (Recommended)

### **How Annual Plans Work Now:**

**Annual plans allocate credits ONCE per year, not monthly.**

| Plan | Monthly Plan | Annual Plan |
|------|-------------|-------------|
| **Basic** | 250 credits/month | 250 credits/year |
| **Pro** | 750 credits/month | 750 credits/year |
| **Agency** | 1,450 credits/month | 1,450 credits/year |

### **Key Points:**

1. **One-time allocation:** Annual plans get all credits upfront when subscription starts
2. **Credits expire after 1 year:** All credits expire on the renewal date
3. **No monthly additions:** Credits are NOT added monthly for annual plans
4. **Renewal:** When annual plan renews, new credits are allocated (with rollover of unused credits)

---

## 📊 How It Works in Detail

### **Scenario 1: User Buys Basic Annual**

**Day 1 (Subscription Created):**
```
- User pays for Basic Annual ($190/year)
- Webhook allocates: 250 credits
- Credits expire: 1 year from now
- User can use all 250 credits anytime during the year
```

**Month 6:**
```
- User has used 100 credits
- Remaining: 150 credits
- No new credits added (annual plan)
```

**Month 12 (Renewal):**
```
- Annual subscription renews
- Webhook allocates: 250 new credits
- Rollover: 150 unused credits (if not expired)
- Total: 400 credits (150 rollover + 250 new)
```

---

### **Scenario 2: User Buys Pro Annual**

**Day 1:**
```
- User pays for Pro Annual ($490/year)
- Webhook allocates: 750 credits
- Credits expire: 1 year from now
```

**Throughout the year:**
```
- User can use all 750 credits anytime
- No monthly additions
- Credits don't expire until renewal date
```

---

## 🤔 Alternative Approach (Monthly Credits for Annual Plans)

### **Option 2: Monthly Credit Allocation for Annual Plans**

If you want annual plans to get credits monthly (like a monthly plan but paid annually):

**Example:**
- Basic Annual: 250 credits/month × 12 = 3,000 credits/year
- Pro Annual: 750 credits/month × 12 = 9,000 credits/year
- Agency Annual: 1,450 credits/month × 12 = 17,400 credits/year

**How it would work:**
1. User pays annual fee upfront
2. Credits added monthly via scheduled job or webhook
3. More complex to implement
4. More value for users (but higher cost for you)

---

## ✅ Recommended Approach (Current Implementation)

### **Why One-Time Allocation is Better:**

✅ **Simpler:** No need for monthly scheduled jobs
✅ **Industry Standard:** Most SaaS (Cursor, Notion, Canva) do this
✅ **Predictable:** User knows exactly what they get
✅ **Cost Control:** Prevents credit hoarding
✅ **Easier Support:** Less confusion about credit timing

### **Current Behavior (Recommended):**

```
Annual Basic: 250 credits for the entire year
- User pays once
- Gets all credits upfront
- Can use anytime during the year
- Credits expire on renewal date
```

---

## 🔄 What Happens on Annual Renewal?

### **Renewal Process:**

1. **Lemon Squeezy sends webhook** (`subscription_payment_success`)
2. **System checks:** Is this a renewal? (same plan tier)
3. **Rollover logic:**
   - Calculate unused credits from previous year
   - If credits haven't expired → rollover
   - Add new annual credits on top
4. **Result:** Unused credits + new credits

**Example:**
```
Year 1: 250 credits allocated
User used: 100 credits
Remaining: 150 credits

Year 2 Renewal:
- Rollover: 150 credits (if not expired)
- New credits: 250 credits
- Total: 400 credits
```

---

## 📝 Current Code Behavior

### **Credit Allocation Function:**

```typescript
function getCreditsForPlan(planTier, billingPeriod) {
  // Returns same credits for monthly and annual
  'basic_monthly': 250,
  'basic_annual': 250,    // Same as monthly
  'pro_monthly': 750,
  'pro_annual': 750,      // Same as monthly
  // ...
}
```

### **Expiration Date:**

```typescript
function calculateExpirationDate(billingPeriod) {
  if (billingPeriod === 'annual') {
    expireDate.setFullYear(expireDate.getFullYear() + 1); // 1 year
  } else {
    expireDate.setMonth(expireDate.getMonth() + 1); // 1 month
  }
}
```

---

## 🎯 Summary

### **Current System (Recommended):**

✅ **Annual plans get credits once per year**
- Basic Annual: 250 credits/year
- Pro Annual: 750 credits/year
- Agency Annual: 1,450 credits/year

✅ **Credits expire after 1 year**
✅ **On renewal: Unused credits rollover + new credits added**
✅ **No monthly additions for annual plans**

### **This is the industry standard approach** used by:
- Cursor
- Notion
- Canva
- Vercel
- Most SaaS platforms

---

## 💡 If You Want Monthly Credits for Annual Plans

If you want annual plans to get monthly credits (e.g., 250/month × 12 = 3,000/year), you would need to:

1. **Change credit allocation:**
   ```typescript
   'basic_annual': 3000,  // 250 × 12
   'pro_annual': 9000,    // 750 × 12
   'agency_annual': 17400 // 1450 × 12
   ```

2. **OR implement monthly allocation:**
   - Set up a scheduled job (cron)
   - Add 250/750/1450 credits each month
   - More complex, requires background jobs

**Recommendation:** Keep current approach (one-time allocation) - it's simpler and industry standard.

---

## ❓ Questions?

**Q: Do annual plans get credits monthly?**
A: No, they get all credits once per year (250/750/1450 depending on plan).

**Q: Can users use all credits at once?**
A: Yes, they can use all credits anytime during the year.

**Q: What happens to unused credits?**
A: They rollover to next year if not expired.

**Q: Should I change it to monthly allocation?**
A: Not recommended - current approach is simpler and industry standard.







