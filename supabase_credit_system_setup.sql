-- ============================================
-- CREDIT SYSTEM SETUP FOR ZOLA AI
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This sets up the credit-based system for all plans

-- Step 1: Add credit columns to profiles table
-- ============================================

-- Total credits allocated to user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_credits INTEGER DEFAULT 0
    CHECK (total_credits >= 0);

-- Credits used by user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS used_credits INTEGER DEFAULT 0
    CHECK (used_credits >= 0);

-- When credits expire (for monthly/annual plans)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS credits_expire_at TIMESTAMPTZ;

-- When credits were last allocated
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_credits_allocated_at TIMESTAMPTZ;

-- Track if sign-up bonus was given
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS signup_bonus_given BOOLEAN DEFAULT FALSE;

-- Step 2: Create function to give sign-up bonus
-- ============================================
CREATE OR REPLACE FUNCTION give_signup_bonus_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Give 10 free credits to new users (free tier sign-up bonus)
  IF NEW.signup_bonus_given IS NULL OR NEW.signup_bonus_given = FALSE THEN
    NEW.total_credits := 10;
    NEW.used_credits := 0;
    NEW.credits_expire_at := (NOW() + INTERVAL '1 month');
    NEW.signup_bonus_given := TRUE;
    NEW.last_credits_allocated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to automatically give sign-up bonus
-- ============================================
DROP TRIGGER IF EXISTS trigger_give_signup_bonus ON public.profiles;
CREATE TRIGGER trigger_give_signup_bonus
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION give_signup_bonus_credits();

-- Step 4: Create index for credit queries (optional but recommended)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_credits_expire_at 
ON public.profiles(credits_expire_at) 
WHERE credits_expire_at IS NOT NULL;

-- Step 5: Add comments for documentation
-- ============================================
COMMENT ON COLUMN public.profiles.total_credits IS 'Total credits allocated to user (includes rollover)';
COMMENT ON COLUMN public.profiles.used_credits IS 'Credits used by user (resets on new allocation)';
COMMENT ON COLUMN public.profiles.credits_expire_at IS 'When current credits expire (null for free tier)';
COMMENT ON COLUMN public.profiles.last_credits_allocated_at IS 'Timestamp of last credit allocation';
COMMENT ON COLUMN public.profiles.signup_bonus_given IS 'Whether user received 10 free sign-up bonus credits';

-- Step 6: Verify the setup
-- ============================================
-- Run this query to check if columns exist:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- AND column_name IN ('total_credits', 'used_credits', 'credits_expire_at', 'last_credits_allocated_at', 'signup_bonus_given');

-- ============================================
-- CREDIT ALLOCATION BY PLAN:
-- ============================================
-- Basic Plan: 175 credits/month (monthly or annual)
-- Pro Plan: 360 credits/month (monthly or annual)
-- Agency Plan: 550 credits/month (monthly or annual)
-- Free Tier: 10 credits (sign-up bonus, expires in 1 month)
-- ============================================





