import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Helper function to get credits for a plan tier
function getCreditsForPlan(planTier: 'basic' | 'pro' | 'agency', billingPeriod: 'monthly' | 'annual'): number {
  const creditsMap: Record<string, number> = {
    'basic_monthly': 175,
    'basic_annual': 175,
    'pro_monthly': 360,
    'pro_annual': 360,
    'agency_monthly': 550,
    'agency_annual': 550,
  };
  const key = `${planTier}_monthly`; // Always use monthly key
  return creditsMap[key] || 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wtxwgkiiwibgfnpfkckx.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const CREDIT_RESET_SECRET = process.env.CREDIT_RESET_SECRET;

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY for credit reset');
      return res.status(500).json({ error: 'Server not configured for credit resets' });
    }

    // Check secret if configured
    if (CREDIT_RESET_SECRET && req.headers['x-reset-secret'] !== CREDIT_RESET_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create Supabase admin client
    const supabaseAdmin = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find all users whose credits should reset today
    const { data: usersToReset, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, plan_tier, billing_period, plan_status, total_credits, used_credits, next_credit_reset_at')
      .eq('plan_status', 'active')
      .not('next_credit_reset_at', 'is', null)
      .lte('next_credit_reset_at', today.toISOString());

    if (fetchError) {
      console.error('Error fetching users for credit reset:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch users', details: fetchError.message });
    }

    if (!usersToReset || usersToReset.length === 0) {
      console.log('✅ No users need credit reset today');
      return res.status(200).json({ message: 'No users need credit reset', reset: 0 });
    }

    let resetCount = 0;
    const resetErrors: string[] = [];

    for (const user of usersToReset) {
      try {
        // Get monthly credits for the plan (same for monthly and annual)
        const monthlyCredits = getCreditsForPlan(user.plan_tier as 'basic' | 'pro' | 'agency', 'monthly');
        
        // Calculate rollover (unused credits from previous month)
        const remainingCredits = Math.max(0, (user.total_credits || 0) - (user.used_credits || 0));
        
        // New total = monthly credits + rollover
        const newTotalCredits = monthlyCredits + remainingCredits;
        
        // Calculate next reset date (1 month from now)
        const nextResetDate = new Date();
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setDate(1); // Set to start of month
        nextResetDate.setHours(0, 0, 0, 0);
        
        // Calculate expiration date (1 month from now)
        const expireDate = new Date();
        expireDate.setMonth(expireDate.getMonth() + 1);

        // Update user's credits
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            total_credits: newTotalCredits,
            used_credits: 0,
            credits_expire_at: expireDate.toISOString(),
            next_credit_reset_at: nextResetDate.toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Error resetting credits for user ${user.id}:`, updateError);
          resetErrors.push(`User ${user.id}: ${updateError.message}`);
        } else {
          resetCount++;
          console.log(`✅ Reset credits for user ${user.id}: ${newTotalCredits} credits (${monthlyCredits} new + ${remainingCredits} rollover)`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        resetErrors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return res.status(200).json({
      message: 'Credit reset completed',
      reset: resetCount,
      total: usersToReset.length,
      errors: resetErrors.length > 0 ? resetErrors : undefined,
    });
  } catch (error) {
    console.error('Credit reset error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}






