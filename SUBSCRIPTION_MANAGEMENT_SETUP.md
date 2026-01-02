# 💳 Subscription Management Setup Guide

## 🎯 **Overview**

This guide shows you how to set up subscription management for your customers, including:
- Viewing subscription details
- Cancelling subscriptions
- Updating payment methods
- Viewing billing history

---

## 🚀 **Option 1: Lemon Squeezy Customer Portal (Recommended - Easiest)**

### **What is it?**
Lemon Squeezy provides a built-in customer portal where customers can manage their subscriptions without you building a custom UI.

### **Setup Steps:**

1. **Get Customer Portal URL:**
   - Format: `https://app.lemonsqueezy.com/my-orders`
   - Or use customer-specific portal links via API

2. **Add "Manage Subscription" Button:**

   **In `pages/ProfilePage.tsx`:**

   ```typescript
   // Add this button in the subscription section
   <button
     onClick={() => {
       // Option 1: Direct link to Lemon Squeezy portal
       window.open('https://app.lemonsqueezy.com/my-orders', '_blank');
     }}
     className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
   >
     Manage Subscription
   </button>
   ```

3. **Or Use Customer-Specific Portal Link:**

   ```typescript
   // Get customer-specific portal link from Lemon Squeezy API
   const getCustomerPortalUrl = async (customerId: string) => {
     const response = await fetch('/api/lemonsqueezy/customer-portal', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ customerId }),
     });
     const { url } = await response.json();
     return url;
   };
   ```

---

## 🛠️ **Option 2: Custom Subscription Management (Advanced)**

### **Create API Endpoint for Subscription Management**

**Create `api/lemonsqueezy/subscription-management.ts`:**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
  
  if (!LEMONSQUEEZY_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { action, subscriptionId } = req.body;

  try {
    switch (action) {
      case 'cancel':
        // Cancel subscription
        const cancelResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/vnd.api+json',
              Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
            },
            body: JSON.stringify({
              data: {
                type: 'subscriptions',
                id: subscriptionId,
                attributes: {
                  cancelled: true,
                },
              },
            }),
          }
        );
        
        if (!cancelResponse.ok) {
          throw new Error('Failed to cancel subscription');
        }
        
        return res.json({ success: true, message: 'Subscription cancelled' });

      case 'get_details':
        // Get subscription details
        const detailsResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
            },
          }
        );
        
        const details = await detailsResponse.json();
        return res.json(details);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Subscription management error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
```

---

## 📊 **Display Subscription Details in Profile Page**

### **Update `pages/ProfilePage.tsx`:**

Add subscription information display:

```typescript
// Add subscription details section
{user.plan_status === 'active' && (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <h3 className="text-lg font-bold mb-4">Subscription Details</h3>
    
    <div className="space-y-3">
      <div>
        <span className="text-gray-600 dark:text-gray-400">Plan:</span>
        <span className="ml-2 font-semibold capitalize">{user.plan_tier}</span>
      </div>
      
      <div>
        <span className="text-gray-600 dark:text-gray-400">Status:</span>
        <span className="ml-2 font-semibold text-green-600 capitalize">
          {user.plan_status}
        </span>
      </div>
      
      {user.lemonsqueezy_renews_at && (
        <div>
          <span className="text-gray-600 dark:text-gray-400">Renews:</span>
          <span className="ml-2 font-semibold">
            {new Date(user.lemonsqueezy_renews_at).toLocaleDateString()}
          </span>
        </div>
      )}
      
      <div>
        <span className="text-gray-600 dark:text-gray-400">Credits:</span>
        <span className="ml-2 font-semibold">{user.credits}</span>
      </div>
    </div>
    
    <button
      onClick={() => {
        window.open('https://app.lemonsqueezy.com/my-orders', '_blank');
      }}
      className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
    >
      Manage Subscription
    </button>
  </div>
)}
```

---

## 🔔 **Payment Failure Notifications**

### **Set Up Email Notifications:**

Lemon Squeezy can send email notifications for:
- Payment failures
- Subscription cancellations
- Payment successes

**Setup:**
1. Go to Lemon Squeezy Dashboard
2. **Settings** → **Notifications**
3. Enable email notifications
4. Add your email address

---

## 📈 **Monitor Subscriptions**

### **In Lemon Squeezy Dashboard:**

1. **View All Subscriptions:**
   - **Customers** → Click on customer → **Subscriptions** tab
   - See all active, cancelled, and expired subscriptions

2. **View Payment History:**
   - **Orders** → View all transactions
   - Filter by date, status, customer

3. **Analytics:**
   - **Analytics** → View revenue, MRR, churn rate
   - Track subscription metrics

---

## ✅ **Quick Implementation Checklist**

- [ ] Add "Manage Subscription" button to Profile page
- [ ] Link to Lemon Squeezy customer portal
- [ ] Display subscription details (plan, status, renews date)
- [ ] Test subscription cancellation flow
- [ ] Set up payment failure email notifications
- [ ] Monitor subscriptions in Lemon Squeezy dashboard

---

## 🎯 **Recommended Approach**

**For MVP/Quick Launch:**
- ✅ Use Lemon Squeezy Customer Portal (Option 1)
- ✅ Add simple "Manage Subscription" button
- ✅ Display subscription details in Profile page

**For Advanced Features:**
- ✅ Build custom subscription management UI
- ✅ Add cancel/pause/resume functionality
- ✅ Show billing history
- ✅ Allow plan upgrades/downgrades

---

**You're all set! Your customers can now manage their subscriptions! 🎉**



