import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendMonthlyResetEmail } from '../_utils/emailService';

// Helper function to get credits for a plan tier (planTier normalized to lowercase)
function getCreditsForPlan(planTier: string | null, _billingPeriod: 'monthly' | 'annual'): number {
  const creditsMap: Record<string, number> = {
    'basic_monthly': 175,
    'basic_annual': 175,
    'pro_monthly': 360,
    'pro_annual': 360,
    'agency_monthly': 550,
    'agency_annual': 550,
  };
  const tier = (planTier || '').toString().toLowerCase().trim();
  const key = `${tier}_monthly`;
  return creditsMap[key] ?? 0;
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
    // Use UTC so cron (midnight UTC) and server timezone match
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    const endOfTodayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    // Find all users whose next_credit_reset_at is on or before end of today (UTC)
    // This includes any time on "today" (e.g. 14:30 same day), not just midnight
    const { data: usersToReset, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, plan_tier, billing_period, plan_status, total_credits, used_credits, next_credit_reset_at, username')
      .eq('plan_status', 'active')
      .not('next_credit_reset_at', 'is', null)
      .lte('next_credit_reset_at', endOfTodayUTC.toISOString());

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
        // Get monthly credits for the plan (same for monthly and annual); normalize tier to lowercase
        const monthlyCredits = getCreditsForPlan(user.plan_tier, 'monthly');
        if (monthlyCredits <= 0) {
          console.warn(`Skipping user ${user.id}: invalid or missing plan_tier "${user.plan_tier}"`);
          continue;
        }

        // Calculate rollover (unused credits from previous month)
        const remainingCredits = Math.max(0, (user.total_credits || 0) - (user.used_credits || 0));

        // New total = monthly credits + rollover
        const newTotalCredits = monthlyCredits + remainingCredits;
        
        // Next reset = current reset date + 1 month (keeps subscription day, e.g. 24th each month)
        const currentReset = new Date(user.next_credit_reset_at!);
        const nextResetDate = new Date(currentReset);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setHours(0, 0, 0, 0);
        
        // Expiry = same as next reset (credits expire when next cycle starts)
        const expireDate = new Date(nextResetDate);

        // Update user's credits
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            total_credits: newTotalCredits,
            used_credits: 0,
            credits_expire_at: expireDate.toISOString(),
            next_credit_reset_at: nextResetDate.toISOString(),
            last_credits_allocated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Error resetting credits for user ${user.id}:`, updateError);
          resetErrors.push(`User ${user.id}: ${updateError.message}`);
        } else {
          resetCount++;
          console.log(`✅ Reset credits for user ${user.id}: ${newTotalCredits} credits (${monthlyCredits} new + ${remainingCredits} rollover)`);

          // Send monthly reset notification email (fire-and-forget)
          try {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
            const userEmail = authUser?.user?.email;
            if (userEmail) {
              const username = (user as any).username || userEmail.split('@')[0];
              sendMonthlyResetEmail(userEmail, username, monthlyCredits, remainingCredits, user.plan_tier || 'basic')
                .catch((emailErr) => console.error(`Monthly reset email failed for ${userEmail}:`, emailErr));
            }
          } catch (emailLookupErr) {
            console.error(`Failed to look up email for user ${user.id}:`, emailLookupErr);
          }
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






