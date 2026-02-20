import { supabase } from './supabase';

export interface CreditInfo {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  creditsExpireAt: string | null;
  lastCreditsAllocatedAt: string | null;
}

export interface CreditAllocation {
  credits: number;
  expiresAt: string;
  planTier: 'free' | 'basic' | 'pro' | 'agency';
  billingPeriod: 'monthly' | 'annual';
}

/**
 * Get credit information for a user
 */
export async function getCreditInfo(userId: string): Promise<CreditInfo | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_credits, used_credits, credits_expire_at, last_credits_allocated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching credit info:', error);
      return null;
    }

    if (!data) return null;

    const totalCredits = data.total_credits || 0;
    const usedCredits = data.used_credits || 0;
    const availableCredits = Math.max(0, totalCredits - usedCredits);

    return {
      totalCredits,
      usedCredits,
      availableCredits,
      creditsExpireAt: data.credits_expire_at || null,
      lastCreditsAllocatedAt: data.last_credits_allocated_at || null,
    };
  } catch (error) {
    console.error('Exception fetching credit info:', error);
    return null;
  }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, requiredCredits: number = 1): Promise<boolean> {
  const creditInfo = await getCreditInfo(userId);
  if (!creditInfo) return false;

  // Check if credits have expired
  if (creditInfo.creditsExpireAt) {
    const expireDate = new Date(creditInfo.creditsExpireAt);
    const now = new Date();
    if (now > expireDate) {
      // Credits expired, check if user has active subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_status, plan_tier')
        .eq('id', userId)
        .single();

      // If user has active subscription, credits should be renewed
      // For now, expired credits mean no credits available
      if (profile?.plan_status !== 'active') {
        return false;
      }
    }
  }

  return creditInfo.availableCredits >= requiredCredits;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  creditsToDeduct: number = 1,
  operation: string = 'image_generation'
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  try {
    // First check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId, creditsToDeduct);
    if (!hasCredits) {
      return {
        success: false,
        remainingCredits: 0,
        error: 'Insufficient credits. Please upgrade your plan.',
      };
    }

    // Check if credits are expired
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_expire_at, plan_status, total_credits, used_credits')
      .eq('id', userId)
      .single();

    if (!profile) {
      return {
        success: false,
        remainingCredits: 0,
        error: 'User profile not found',
      };
    }

    // Check expiration
    if (profile.credits_expire_at) {
      const expireDate = new Date(profile.credits_expire_at);
      const now = new Date();
      if (now > expireDate && profile.plan_status !== 'active') {
        return {
          success: false,
          remainingCredits: 0,
          error: 'Credits have expired. Please renew your subscription.',
        };
      }
    }

    // Deduct credits
    const currentUsed = profile.used_credits || 0;
    const previousRemaining = Math.max(0, (profile.total_credits || 0) - currentUsed);
    const newUsedCredits = currentUsed + creditsToDeduct;
    const remainingCredits = Math.max(0, (profile.total_credits || 0) - newUsedCredits);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ used_credits: newUsedCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('Error deducting credits:', updateError);
      return {
        success: false,
        remainingCredits: 0,
        error: 'Failed to deduct credits',
      };
    }

    // Log credit usage (optional - for analytics)
    console.log(`✅ Deducted ${creditsToDeduct} credit(s) from user ${userId}. Remaining: ${remainingCredits}`);

    // Send low-credits alert when crossing below 20 (only once per threshold cross)
    const LOW_CREDITS_THRESHOLD = 20;
    if (previousRemaining >= LOW_CREDITS_THRESHOLD && remainingCredits < LOW_CREDITS_THRESHOLD) {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();
        if (authUser?.email) {
          const username = profileData?.username || authUser.email.split('@')[0];
          fetch('/api/emails/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'low_credits', email: authUser.email, username, remainingCredits }),
          }).catch((emailErr) => console.warn('Low credits email send failed:', emailErr));
        }
      } catch (emailErr) {
        console.warn('Low credits email lookup failed:', emailErr);
      }
    }

    return {
      success: true,
      remainingCredits,
    };
  } catch (error) {
    console.error('Exception deducting credits:', error);
    return {
      success: false,
      remainingCredits: 0,
      error: 'An error occurred while deducting credits',
    };
  }
}

/**
 * Allocate credits to user based on plan
 * NOTE: This function is used for renewals (same plan). For plan changes, use resetCredits() instead.
 */
export async function allocateCredits(
  userId: string,
  allocation: CreditAllocation
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('total_credits, used_credits, credits_expire_at, plan_tier')
      .eq('id', userId)
      .single();

    if (!currentProfile) {
      return {
        success: false,
        error: 'User profile not found',
      };
    }

    // Check if this is a renewal (same plan) or plan change
    const isRenewal = currentProfile.plan_tier === allocation.planTier;

    if (!isRenewal) {
      // This is a plan change - should use resetCredits() instead
      console.warn(`⚠️ allocateCredits called for plan change. Use resetCredits() instead.`);
      return await resetCredits(userId, allocation);
    }

    // RENEWAL: Calculate rollover credits (remaining credits from previous period)
    const currentTotal = currentProfile.total_credits || 0;
    const currentUsed = currentProfile.used_credits || 0;
    const remainingCredits = Math.max(0, currentTotal - currentUsed);

    // Check if previous credits are expired
    let rolloverCredits = 0;
    if (currentProfile.credits_expire_at) {
      const expireDate = new Date(currentProfile.credits_expire_at);
      const now = new Date();
      // Only rollover if credits haven't expired yet
      if (now <= expireDate) {
        rolloverCredits = remainingCredits;
      }
    }

    // Calculate new total credits (new allocation + rollover)
    const newTotalCredits = allocation.credits + rolloverCredits;

    // Update profile with new credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_credits: newTotalCredits,
        used_credits: 0, // Reset used credits for new period
        credits_expire_at: allocation.expiresAt,
        last_credits_allocated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error allocating credits:', updateError);
      return {
        success: false,
        error: 'Failed to allocate credits',
      };
    }

    console.log(
      `✅ Renewal: Allocated ${allocation.credits} credits to user ${userId} (${allocation.planTier} ${allocation.billingPeriod}). ` +
      `Rollover: ${rolloverCredits} credits. Total: ${newTotalCredits} credits. Expires: ${allocation.expiresAt}`
    );

    return { success: true };
  } catch (error) {
    console.error('Exception allocating credits:', error);
    return {
      success: false,
      error: 'An error occurred while allocating credits',
    };
  }
}

/**
 * Reset credits for plan changes (Cursor Model)
 * Discards old credits and activates new plan credits immediately
 */
export async function resetCredits(
  userId: string,
  allocation: CreditAllocation
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', userId)
      .single();

    if (!currentProfile) {
      return {
        success: false,
        error: 'User profile not found',
      };
    }

    // PLAN CHANGE: Reset credits (no rollover) - Cursor Model
    // Discard old credits completely, activate new plan credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_credits: allocation.credits, // New plan credits only
        used_credits: 0, // Reset used credits
        credits_expire_at: allocation.expiresAt,
        last_credits_allocated_at: new Date().toISOString(),
        plan_tier: allocation.planTier, // Update plan tier
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error resetting credits:', updateError);
      return {
        success: false,
        error: 'Failed to reset credits',
      };
    }

    console.log(
      `✅ Plan change: Reset credits for user ${userId}. ` +
      `Old plan: ${currentProfile.plan_tier || 'none'} → New plan: ${allocation.planTier}. ` +
      `New credits: ${allocation.credits} (old credits discarded). Expires: ${allocation.expiresAt}`
    );

    return { success: true };
  } catch (error) {
    console.error('Exception resetting credits:', error);
    return {
      success: false,
      error: 'An error occurred while resetting credits',
    };
  }
}

/**
 * Give sign-up bonus credits (10 credits for free tier)
 */
export async function giveSignUpBonus(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already received sign-up bonus
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_credits, signup_bonus_given')
      .eq('id', userId)
      .single();

    if (profile?.signup_bonus_given) {
      // Already received bonus
      return { success: true };
    }

    const signUpBonus = 10;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Expires in 1 month

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_credits: signUpBonus,
        used_credits: 0,
        credits_expire_at: expiresAt.toISOString(),
        signup_bonus_given: true,
        last_credits_allocated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error giving sign-up bonus:', updateError);
      return {
        success: false,
        error: 'Failed to allocate sign-up bonus',
      };
    }

    console.log(`✅ Gave ${signUpBonus} sign-up bonus credits to user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Exception giving sign-up bonus:', error);
    return {
      success: false,
      error: 'An error occurred while giving sign-up bonus',
    };
  }
}

/**
 * Get credits allocation based on plan tier and billing period
 */
export function getCreditsForPlan(
  planTier: 'basic' | 'pro' | 'agency',
  billingPeriod: 'monthly' | 'annual'
): number {
  const creditsMap: Record<string, number> = {
    'basic_monthly': 175,
    'basic_annual': 175,
    'pro_monthly': 360,
    'pro_annual': 360,
    'agency_monthly': 550,
    'agency_annual': 550,
  };

  const key = `${planTier}_${billingPeriod}`;
  return creditsMap[key] || 0;
}

/**
 * Calculate expiration date based on billing period
 */
export function calculateExpirationDate(billingPeriod: 'monthly' | 'annual'): string {
  const expireDate = new Date();
  if (billingPeriod === 'annual') {
    expireDate.setFullYear(expireDate.getFullYear() + 1);
  } else {
    expireDate.setMonth(expireDate.getMonth() + 1);
  }
  return expireDate.toISOString();
}





