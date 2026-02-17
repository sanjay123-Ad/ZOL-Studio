-- ============================================
-- MONTHLY CREDIT RESET SETUP FOR ANNUAL PLANS
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This adds monthly credit reset tracking for annual plans

-- Step 1: Add next_credit_reset_at column
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS next_credit_reset_at TIMESTAMPTZ;

-- Step 2: Add comment for documentation
-- ============================================
COMMENT ON COLUMN public.profiles.next_credit_reset_at IS 'Next monthly credit reset date. For annual plans, credits reset monthly. For monthly plans, this equals credits_expire_at.';

-- Step 3: Create index for scheduled credit resets
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_next_credit_reset_at 
ON public.profiles(next_credit_reset_at) 
WHERE next_credit_reset_at IS NOT NULL;

-- Step 4: Update existing annual plan users (if any)
-- ============================================
-- This sets next_credit_reset_at for existing annual plan users
UPDATE public.profiles
SET next_credit_reset_at = 
  CASE 
    WHEN billing_period = 'annual' AND credits_expire_at IS NOT NULL THEN
      -- Set to next month from last_credits_allocated_at or now
      COALESCE(
        (last_credits_allocated_at::date + INTERVAL '1 month')::timestamptz,
        (NOW()::date + INTERVAL '1 month')::timestamptz
      )
    WHEN billing_period = 'monthly' AND credits_expire_at IS NOT NULL THEN
      -- For monthly plans, reset date = expiration date
      credits_expire_at
    ELSE NULL
  END
WHERE (billing_period = 'annual' OR billing_period = 'monthly')
  AND plan_status = 'active'
  AND next_credit_reset_at IS NULL;

-- ============================================
-- NOTES
-- ============================================
-- 1. Annual plans: Credits reset monthly (250/750/1450 per month)
-- 2. Monthly plans: Credits reset monthly (same behavior)
-- 3. next_credit_reset_at tracks when credits should reset
-- 4. A scheduled job should check this column daily and reset credits when date arrives







