# Credit Reset & Rollover – How It Works & How to Validate

## Pro Annual (e.g. 360 credits) – Intended Behavior

- **Subscription start:** e.g. Jan 24, 2026  
- **Billing:** Annual (next charge Jan 24, 2027)  
- **Credits:** 360 per month, reset on the **same calendar day** each month (e.g. 24th).  
- **Rollover:** Unused credits from the previous cycle are added to the new 360.

### Example (Pro Annual)

| Cycle            | New credits | Remaining from previous | Total after reset |
|------------------|------------|--------------------------|-------------------|
| Jan 24 – Feb 24  | 360        | 0 (first cycle)          | 360               |
| Feb 24 – Mar 24  | 360        | 100                      | **460**           |
| Mar 24 – Apr 24  | 360        | 50                       | **410**           |

---

## What the Code Does

### 1. When the user subscribes (webhook)

- `total_credits` = 360 (Pro)  
- `used_credits` = 0  
- `credits_expire_at` = subscription date + 1 month (e.g. Feb 24)  
- `next_credit_reset_at` = same as `credits_expire_at` (e.g. Feb 24)

### 2. Monthly reset cron (`POST /api/credits/monthly-reset`)

- Runs daily (e.g. via Vercel Cron).
- Finds users where `plan_status = 'active'` and `next_credit_reset_at <= today`.
- For each such user:
  - **Rollover** = `total_credits - used_credits` (capped at 0).
  - **New total** = plan’s monthly credits (e.g. 360) + rollover.
  - **Updates:**  
    - `total_credits` = new total  
    - `used_credits` = 0  
    - `credits_expire_at` = next reset date (same calendar day, next month)  
    - `next_credit_reset_at` = current reset date + 1 month (keeps the “24th” anchor)

So: **360 (new) + remaining (rollover)** and **reset on the same day each month** are implemented as above.

---

## Fix Applied: Reset on Subscription Day

Previously, after a reset the code set `next_credit_reset_at` to the **1st of the next month**, so the reset day drifted (e.g. 24th → 1st → 1st …).

It now sets **next reset = current reset date + 1 month** (same calendar day). So if the subscription started on the 24th, resets stay on the 24th (Jan 24 → Feb 24 → Mar 24 …).

---

## How to Validate

### 1. Confirm cron is running

- **Vercel:** Project → Settings → Crons (or `vercel.json`) that call `/api/credits/monthly-reset` daily.
- **Local:** Call the endpoint manually when testing (see below).

### 2. Check in Supabase (before/after a reset)

For a Pro Annual user whose reset day is today (e.g. 24th):

**Before reset (e.g. morning of the 24th):**

- `next_credit_reset_at` = today’s date (e.g. 2026-02-24).  
- `total_credits` = e.g. 360.  
- `used_credits` = e.g. 260 (so 100 remaining).

**After the cron runs:**

- `total_credits` = 360 + 100 = **460**.  
- `used_credits` = **0**.  
- `credits_expire_at` = next month same day (e.g. 2026-03-24).  
- `next_credit_reset_at` = same (e.g. 2026-03-24).

So: **new allocation (360) + rollover (100)**, and **same day next month** for expiry and next reset.

### 3. Manual test (local or staging)

1. In Supabase, set a test user’s `next_credit_reset_at` to **today** (or yesterday) and `plan_status` = `'active'`, `plan_tier` = `'pro'`.  
2. Set `total_credits` = 360, `used_credits` = 260 (100 remaining).  
3. Call the reset endpoint (with your secret if configured):

   ```bash
   curl -X POST http://localhost:5173/api/credits/monthly-reset \
     -H "Content-Type: application/json" \
     -H "x-reset-secret: YOUR_CREDIT_RESET_SECRET"
   ```

4. In Supabase, for that user check:
   - `total_credits` = 460  
   - `used_credits` = 0  
   - `next_credit_reset_at` = same day next month  
   - `credits_expire_at` = same as `next_credit_reset_at`

### 4. In the app

- Profile / usage page should show the updated balance and expiry.  
- Expiry should match `credits_expire_at` (shown in local time if you use `toLocaleDateString`).

---

## Quick checklist

- [ ] Cron runs daily and hits `/api/credits/monthly-reset`.  
- [ ] Pro Annual gets 360 new credits each reset.  
- [ ] Rollover = previous `total_credits - used_credits` added to 360.  
- [ ] Reset day stays the same each month (e.g. 24th → 24th → 24th).  
- [ ] After reset, `used_credits` = 0 and `credits_expire_at` = next reset date.

If all of the above hold, credit reset and allocation (including rollover) are working as intended.
