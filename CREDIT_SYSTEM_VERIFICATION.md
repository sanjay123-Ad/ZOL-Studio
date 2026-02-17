# Credit System Verification Guide

This document helps you verify that credits are correctly allocated when customers pay for each plan (Basic, Pro, Agency) and billing period (Monthly, Annual).

---

## ✅ Expected Credit Allocation (Current Logic)

| Plan   | Monthly | Annual | Credits Allocated |
|--------|---------|--------|-------------------|
| Basic  | ✓       | ✓      | **175** / month   |
| Pro    | ✓       | ✓      | **360** / month   |
| Agency | ✓       | ✓      | **550** / month   |

**Note:** Both monthly and annual plans get the **same credits per month** and credits reset every month (not yearly for annual).

---

## 🔄 Flow Overview

1. **Customer selects plan** on Pricing page → Checkout via Lemon Squeezy
2. **Lemon Squeezy** sends webhook to your app when payment succeeds
3. **Webhook** (`/api/lemonsqueezy/webhook`) receives `subscription_created` or `subscription_payment_success`
4. **Credit allocation** happens: plan tier + billing period → correct credits → Supabase `profiles` updated

---

## 📋 Pre-Flight Checklist (Must-Have)

### 1. Vercel Environment Variables

All of these must be set in **Vercel → Project → Settings → Environment Variables**:

| Variable | Purpose |
|----------|---------|
| `LEMONSQUEEZY_API_KEY` | Create checkouts |
| `LEMONSQUEEZY_STORE_ID` | Your Lemon Squeezy store |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Verify webhook (optional but recommended) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Update user profiles (required for webhook) |
| **Variant IDs (6 total):** | |
| `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID` | |
| `LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID` | |
| `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` | |
| `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` | |
| `LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID` | |
| `LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID` | |
| `VITE_LEMONSQUEEZY_*_VARIANT_ID` | Same 6, with `VITE_` prefix (for frontend pricing page) |

**Important:** Variant IDs must match exactly what you created in Lemon Squeezy. Get them from:
- Lemon Squeezy Dashboard → Products → [Your Product] → Variants → copy the numeric ID

### 2. Lemon Squeezy Webhook URL

- **Webhook URL:** `https://your-domain.com/api/lemonsqueezy/webhook`
- **Events to send:** `subscription_created`, `subscription_payment_success`, `subscription_updated`, `subscription_canceled`
- **Signing secret:** Copy to `LEMONSQUEEZY_WEBHOOK_SECRET` in Vercel

### 3. User Must Exist Before Payment

The webhook looks up the user by **email** (from Lemon Squeezy) in Supabase Auth. The customer must have signed up on your app **before** or **with the same email** they use at checkout. Otherwise: "User not found" and webhook fails.

---

## 🧪 How to Test

### Test 1: Verify Variant ID Mapping

1. In Lemon Squeezy, create a test order (or use their test mode).
2. Check Vercel **Logs** after the webhook fires.
3. Look for: `✅ Successfully mapped variant ID X to plan tier: basic` (or pro/agency).
4. If you see `❌ Unknown variant ID`, add that variant ID to your Vercel env and redeploy.

### Test 2: Check Credit Allocation

1. Sign up on your app (free tier).
2. Upgrade to a paid plan (use Lemon Squeezy test card if in test mode).
3. After payment, check:
   - **Profile page** or **Supabase** `profiles` table for `total_credits`, `plan_tier`, `plan_status`, `billing_period`.
   - Credits should match the table above (175 / 360 / 550).

### Test 3: Monthly vs Annual

- **Monthly:** Choose "Monthly" on pricing → complete checkout → `billing_period` = `monthly`, credits = 175/360/550.
- **Annual:** Choose "Annual" → complete checkout → `billing_period` = `annual`, credits = same 175/360/550 (reset monthly).

---

## 🐛 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "User not found" | Customer email not in Supabase Auth | User must sign up on your app first with same email |
| "Could not determine plan tier" | Variant ID not in env | Add `LEMONSQUEEZY_*_VARIANT_ID` for that variant |
| Checkout fails / no variant | `VITE_LEMONSQUEEZY_*_VARIANT_ID` not set | Add variant IDs with `VITE_` prefix for frontend |
| Credits not allocated | Webhook not firing or 404 | Check webhook URL and Vercel rewrites |
| Wrong plan tier | Product name fallback used | Ensure variant IDs are set; product names should include "basic", "pro", or "agency" |

---

## 📊 Logic Verification (Code)

| Scenario | Credits Allocated | Notes |
|----------|-------------------|-------|
| First-time paid (from free) | Plan credits + signup bonus (up to 10) if valid | Preserves unused signup credits |
| Renewal (same plan) | Plan credits + rollover (unused from previous month) | Only if previous credits not expired |
| Plan change (e.g. Basic → Pro) | New plan credits + signup bonus (up to 10) if valid | Old plan credits discarded |
| `subscription_updated` (no payment) | No new credits | Only updates plan metadata |
| `subscription_canceled` | No credits | Plan status set to canceled |

---

## 🔗 Relevant Files

- Webhook (Vercel): `api/lemonsqueezy/webhook.ts`
- Create checkout: `api/lemonsqueezy/create-checkout.ts`
- Credit deduction: `services/creditService.ts`
- Monthly reset endpoint: `server.ts` → `POST /api/credits/monthly-reset`
- Cron (Vercel): Configure in `vercel.json` or Vercel Dashboard to call `/api/credits/monthly-reset` daily
