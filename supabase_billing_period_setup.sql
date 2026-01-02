-- ============================================
-- BILLING PERIOD SETUP FOR ZOLA AI
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This adds billing_period column to track user's current billing cycle

-- Step 1: Add billing_period column to profiles table
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS billing_period TEXT
    CHECK (billing_period IN ('monthly', 'annual', NULL));

-- Step 2: Add comment for documentation
-- ============================================
COMMENT ON COLUMN public.profiles.billing_period IS 'User current billing period: monthly or annual. NULL for free tier or inactive subscriptions.';

-- Step 3: Create index for queries (optional but recommended)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_billing_period 
ON public.profiles(billing_period) 
WHERE billing_period IS NOT NULL;

-- Step 4: Verify the setup
-- ============================================
-- Run this query to check if column exists:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'profiles' 
--   AND column_name = 'billing_period';

-- ============================================
-- NOTES
-- ============================================
-- 1. billing_period is set by webhook handler when subscription is activated
-- 2. NULL means free tier or inactive subscription
-- 3. Used by PricingPage to determine "Manage Subscription" vs "Get Started" buttons
-- 4. Must match the billing cycle from Lemon Squeezy subscription







