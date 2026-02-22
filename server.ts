import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import dotenv from 'dotenv';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Load environment variables from .env.local (in development)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

// Basic helpers to read Lemon Squeezy config from env
const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

// Supabase admin client (service role) for server-side updates
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper function to map variant ID to plan tier
// This reads from environment variables to create a reverse mapping
// NOTE: Server-side env vars don't use VITE_ prefix (that's only for frontend)
function getPlanTierFromVariantId(variantId: string): 'basic' | 'pro' | 'agency' | null {
  // Read all variant IDs from environment variables (server-side, no VITE_ prefix)
  // Try both with and without VITE_ prefix for backward compatibility
  const basicMonthly = process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID;
  const basicAnnual = process.env.LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID;
  const proMonthly = process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID;
  const proAnnual = process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID;
  const agencyMonthly = process.env.LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID;
  const agencyAnnual = process.env.LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID;

  // Log all variant IDs for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 Environment variant IDs mapping check:');
    console.log('  Basic Monthly:', basicMonthly || '❌ NOT SET');
    console.log('  Basic Annual:', basicAnnual || '❌ NOT SET');
    console.log('  Pro Monthly:', proMonthly || '❌ NOT SET');
    console.log('  Pro Annual:', proAnnual || '❌ NOT SET');
    console.log('  Agency Monthly:', agencyMonthly || '❌ NOT SET');
    console.log('  Agency Annual:', agencyAnnual || '❌ NOT SET');
    console.log('  Received Variant ID:', variantId);
    console.log('  Trying to match:', variantId, 'against the above values...');
  }

  // Map variant ID to plan tier (convert all to strings for comparison)
  const variantIdStr = String(variantId).trim();
  if (basicMonthly && variantIdStr === String(basicMonthly).trim()) {
    console.log(`✅ Matched Basic Monthly: ${variantId}`);
    return 'basic';
  }
  if (basicAnnual && variantIdStr === String(basicAnnual).trim()) {
    console.log(`✅ Matched Basic Annual: ${variantId}`);
    return 'basic';
  }
  if (proMonthly && variantIdStr === String(proMonthly).trim()) {
    console.log(`✅ Matched Pro Monthly: ${variantId}`);
    return 'pro';
  }
  if (proAnnual && variantIdStr === String(proAnnual).trim()) {
    console.log(`✅ Matched Pro Annual: ${variantId}`);
    return 'pro';
  }
  if (agencyMonthly && variantIdStr === String(agencyMonthly).trim()) {
    console.log(`✅ Matched Agency Monthly: ${variantId}`);
    return 'agency';
  }
  if (agencyAnnual && variantIdStr === String(agencyAnnual).trim()) {
    console.log(`✅ Matched Agency Annual: ${variantId}`);
    return 'agency';
  }

  // If variant ID doesn't match, log detailed warning
  console.warn(`❌ Unknown variant ID in webhook: ${variantId}`);
  console.warn(`   Expected one of:`, {
    basicMonthly: basicMonthly || 'NOT SET',
    basicAnnual: basicAnnual || 'NOT SET',
    proMonthly: proMonthly || 'NOT SET',
    proAnnual: proAnnual || 'NOT SET',
    agencyMonthly: agencyMonthly || 'NOT SET',
    agencyAnnual: agencyAnnual || 'NOT SET'
  });
  console.warn(`   💡 Solution: Add LEMONSQUEEZY_*_VARIANT_ID=${variantId} to your .env.local file (without VITE_ prefix for server-side)`);
  return null;
}

// Function to determine billing period from variant ID
function getBillingPeriodFromVariantId(variantId: string): 'monthly' | 'annual' | null {
  const basicMonthly = process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID;
  const basicAnnual = process.env.LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID;
  const proMonthly = process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID;
  const proAnnual = process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID;
  const agencyMonthly = process.env.LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID;
  const agencyAnnual = process.env.LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID;

  const variantIdStr = String(variantId).trim();

  // Check if it's an annual variant
  if (
    (basicAnnual && variantIdStr === String(basicAnnual).trim()) ||
    (proAnnual && variantIdStr === String(proAnnual).trim()) ||
    (agencyAnnual && variantIdStr === String(agencyAnnual).trim())
  ) {
    return 'annual';
  }

  // Check if it's a monthly variant
  if (
    (basicMonthly && variantIdStr === String(basicMonthly).trim()) ||
    (proMonthly && variantIdStr === String(proMonthly).trim()) ||
    (agencyMonthly && variantIdStr === String(agencyMonthly).trim())
  ) {
    return 'monthly';
  }

  return null;
}

// Fallback function to extract plan tier from product name
function getPlanTierFromProductName(productName: string): 'basic' | 'pro' | 'agency' | null {
  if (!productName) return null;

  const nameLower = productName.toLowerCase();

  // Check for plan names in product name (case-insensitive)
  if (nameLower.includes('agency')) {
    return 'agency';
  } else if (nameLower.includes('pro')) {
    return 'pro';
  } else if (nameLower.includes('basic')) {
    return 'basic';
  }

  return null;
}

// Credit allocation helper functions (inline for server.ts)
function getCreditsForPlan(planTier: 'basic' | 'pro' | 'agency', billingPeriod: 'monthly' | 'annual'): number {
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
 * Calculate expiration date for credits
 * IMPORTANT: Annual plans use MONTHLY resets (not yearly)
 * Both monthly and annual plans reset credits every month
 */
function calculateExpirationDate(billingPeriod: 'monthly' | 'annual'): string {
  const expireDate = new Date();
  // Both monthly and annual plans reset credits monthly
  // Annual = discounted billing, but same monthly credit limits
  expireDate.setMonth(expireDate.getMonth() + 1);
  return expireDate.toISOString();
}

/**
 * Calculate next credit reset date (monthly anchor)
 * For annual plans, credits reset monthly, not yearly
 */
function calculateNextCreditResetDate(billingPeriod: 'monthly' | 'annual', subscriptionStartDate?: Date): string {
  const resetDate = subscriptionStartDate ? new Date(subscriptionStartDate) : new Date();
  // Both monthly and annual plans reset credits every month
  resetDate.setMonth(resetDate.getMonth() + 1);
  // Set to start of month for consistency (optional - can use exact date)
  resetDate.setDate(1);
  resetDate.setHours(0, 0, 0, 0);
  return resetDate.toISOString();
}

async function createServer() {
  const app = express();
  let vite: ViteDevServer;

  // Allow JSON bodies for most API routes (webhook will override as needed)
  app.use(express.json());

  if (!isProd) {
    // Development server logic
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    // Use Vite's connect instance as middleware for HMR and asset serving
    app.use(vite.middlewares);
  } else {
    // Production server logic
    app.use((await import('compression')).default());
    // Serve static files from the client build directory.
    // The wildcard handler below will handle all non-asset requests.
    app.use(
      express.static(path.resolve(__dirname, 'dist/client'), {
        index: false,
      })
    );
  }

  // --- Lemon Squeezy: webhook to update Supabase profiles ---
  app.post('/api/lemonsqueezy/webhook', async (req, res) => {
    try {
      if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY for webhook handling');
        return res.status(500).send('Server not configured for webhooks');
      }

      // Verify webhook signature if secret is provided (optional but recommended)
      if (LEMONSQUEEZY_WEBHOOK_SECRET) {
        const signature = req.headers['x-signature'] as string;
        if (!signature) {
          console.warn('Webhook request missing signature header');
          // Continue anyway for now, but log it
        }
        // Note: Full signature verification would require crypto comparison
        // For now, we'll process the webhook if signature exists
      }

      const eventName = (req.headers['x-event-name'] as string) || '';
      const payload = req.body as any;

      console.log(`Lemon Squeezy webhook received: ${eventName}`);
      // Log full payload structure for debugging (first time only, then can be removed)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Webhook payload structure:', JSON.stringify(payload, null, 2));
      }

      // Only handle subscription events for now
      if (
        !eventName.startsWith('subscription_') ||
        !payload?.data ||
        payload.data.type !== 'subscriptions'
      ) {
        return res.status(200).send('Ignored event');
      }

      // IMPORTANT: Only allocate credits on subscription_created or subscription_payment_success
      // subscription_updated should only update metadata, not allocate credits again
      const shouldAllocateCredits = eventName === 'subscription_created' || eventName === 'subscription_payment_success';

      const data = payload.data;
      const attributes = data.attributes || {};
      const relationships = data.relationships || {};

      const customerEmail: string =
        attributes.user_email || attributes.customer_email || '';
      const subscriptionId: string = data.id;
      const customerId: string =
        relationships.customer?.data?.id || attributes.customer_id || '';
      const status: string = attributes.status || 'inactive';
      const renewsAt: string | null = attributes.renews_at || null;

      // Extract variant ID from webhook payload to determine plan tier
      // Check multiple possible locations in the payload
      // Convert to string to ensure proper comparison with env variables
      let variantId: string | null =
        String(relationships.variant?.data?.id || '') ||
        String(attributes.variant_id || '') ||
        null;

      // Clean up: remove empty strings
      if (variantId === '') variantId = null;

      // If not found in relationships, check included resources
      if (!variantId && payload.included) {
        const variantResource = payload.included.find(
          (item: any) => item.type === 'variants' && item.id
        );
        if (variantResource) {
          variantId = variantResource.id;
        }
      }

      // Also check if subscription has order_line_items relationship that might contain variant
      if (!variantId && relationships.order_line_items?.data) {
        const orderLineItems = Array.isArray(relationships.order_line_items.data)
          ? relationships.order_line_items.data
          : [relationships.order_line_items.data];

        // Try to find variant in included order_line_items
        if (payload.included) {
          const orderLineItem = payload.included.find(
            (item: any) => item.type === 'order-line-items' && orderLineItems.some((oli: any) => oli.id === item.id)
          );
          if (orderLineItem?.relationships?.variant?.data?.id) {
            variantId = orderLineItem.relationships.variant.data.id;
          }
        }
      }

      if (!customerEmail) {
        console.error('Webhook subscription event missing customer email');
        return res.status(400).send('Missing customer email');
      }

      // Determine plan tier from variant ID, with fallback to product name
      let planTier: 'basic' | 'pro' | 'agency' | null = null;
      const productName: string = attributes.product_name || '';

      console.log(`🔍 Determining plan tier for subscription ${subscriptionId}`);
      console.log(`   Variant ID: ${variantId || 'NOT PROVIDED'}`);
      console.log(`   Product Name: ${productName || 'NOT PROVIDED'}`);

      if (variantId) {
        const mappedPlanTier = getPlanTierFromVariantId(variantId);
        if (mappedPlanTier) {
          planTier = mappedPlanTier;
          console.log(`✅ Successfully mapped variant ID ${variantId} to plan tier: ${planTier}`);
        } else {
          // Fallback: Try to extract plan tier from product name
          console.warn(`⚠️ Could not map variant ID ${variantId} to plan tier, trying product name fallback...`);
          const productNamePlanTier = getPlanTierFromProductName(productName);
          if (productNamePlanTier) {
            planTier = productNamePlanTier;
            console.log(`✅ Extracted plan tier from product name "${productName}": ${planTier}`);
          } else {
            console.error(`❌ Could not determine plan tier from variant ID (${variantId}) or product name ("${productName}")`);
            console.error(`   This subscription will NOT be activated. Please check your environment variables.`);
            return res.status(400).send(`Could not determine plan tier for variant ID: ${variantId}`);
          }
        }
      } else {
        // No variant ID, try product name
        console.warn('⚠️ Webhook subscription event missing variant ID, trying product name fallback...');
        const productNamePlanTier = getPlanTierFromProductName(productName);
        if (productNamePlanTier) {
          planTier = productNamePlanTier;
          console.log(`✅ Extracted plan tier from product name "${productName}": ${planTier}`);
        } else {
          console.error(`❌ Could not determine plan tier from product name ("${productName}")`);
          console.error(`   This subscription will NOT be activated. Variant ID is required.`);
          return res.status(400).send('Missing variant ID and could not determine plan tier from product name');
        }
      }

      // Ensure we have a valid plan tier before proceeding
      if (!planTier) {
        console.error(`❌ Failed to determine plan tier for subscription ${subscriptionId}`);
        return res.status(400).send('Could not determine plan tier');
      }

      const supabaseAdmin = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Find the user ID from auth.users using email (Admin API)
      // Note: getUserByEmail doesn't exist, so we paginate listUsers to find user by email
      const emailLower = customerEmail.toLowerCase();
      let user: { id: string } | undefined;
      let page = 1;
      const perPage = 1000;

      while (true) {
        const { data: authUsersData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (authError) {
          console.error(`Error fetching users for ${customerEmail}:`, authError);
          return res.status(500).send('Failed to fetch users');
        }

        const found = authUsersData?.users?.find(
          (u: any) => u.email?.toLowerCase() === emailLower
        );
        if (found) {
          user = found;
          break;
        }
        if (!authUsersData?.users?.length || authUsersData.users.length < perPage) {
          break;
        }
        page++;
      }

      if (!user) {
        console.error(`User not found with email: ${customerEmail}`);
        return res.status(404).send('User not found');
      }

      const userId = user.id;

      const planStatus =
        status === 'active' || status === 'on_trial' || status === 'paused'
          ? 'active'
          : status === 'past_due'
            ? 'past_due'
            : 'canceled';

      // Determine billing period from variant ID (most accurate)
      let billingPeriod: 'monthly' | 'annual' | null = null;
      if (variantId) {
        billingPeriod = getBillingPeriodFromVariantId(variantId);
      }

      // Fallback: If variant ID doesn't match, use product name or renewal date
      if (!billingPeriod) {
        if (productName.toLowerCase().includes('annual')) {
          billingPeriod = 'annual';
        } else if (renewsAt && new Date(renewsAt).getTime() - new Date().getTime() > 30 * 24 * 60 * 60 * 1000) {
          billingPeriod = 'annual';
        } else {
          billingPeriod = 'monthly';
        }
      }

      // Allocate credits based on plan (only for active subscriptions and paid plans)
      // IMPORTANT: Only allocate on subscription_created or subscription_payment_success
      // subscription_updated should only update metadata
      // IMPORTANT: Annual plans use MONTHLY credit resets (not yearly)
      let creditsAllocated = false;
      if (shouldAllocateCredits && planStatus === 'active' && (planTier === 'basic' || planTier === 'pro' || planTier === 'agency')) {
        // Annual plans get monthly credits (250/750/1450 per month, reset monthly)
        // Monthly plans get monthly credits (250/750/1450 per month, reset monthly)
        // Both use the same monthly credit allocation
        const credits = getCreditsForPlan(planTier, 'monthly'); // Always use monthly credits
        const expiresAt = calculateExpirationDate(billingPeriod); // Monthly expiration for both
        // Use expiresAt for next reset so cron runs when credits expire (no gap)
        const nextResetAt = expiresAt;

        // Get current profile to check if this is a plan change or renewal
        const { data: currentProfile } = await supabaseAdmin
          .from('profiles')
          .select('plan_tier, total_credits, used_credits, credits_expire_at, signup_bonus_given')
          .eq('id', userId)
          .single();

        if (currentProfile) {
          // CURSOR MODEL: Detect if this is a plan change or renewal
          const previousPlanTier = currentProfile.plan_tier;
          const isPlanChange = previousPlanTier && previousPlanTier !== planTier && previousPlanTier !== 'free';
          const isRenewal = previousPlanTier === planTier && previousPlanTier !== 'free';
          const isFirstTimePaid = !previousPlanTier || previousPlanTier === 'free';

          let newTotalCredits: number;
          let rolloverCredits = 0;
          let signupCreditsPreserved = 0;

          if (isPlanChange) {
            // PLAN CHANGE: Reset plan credits but preserve signup credits (10 credits)
            // Only preserve signup credits if they haven't been used and haven't expired
            const currentTotal = currentProfile.total_credits || 0;
            const currentUsed = currentProfile.used_credits || 0;
            const signupBonus = 10; // Signup bonus amount

            // Check if signup credits are still valid (not expired, not fully used)
            if (currentProfile.signup_bonus_given) {
              const remainingCredits = Math.max(0, currentTotal - currentUsed);
              // Preserve signup credits only if they're still valid (not expired)
              if (currentProfile.credits_expire_at) {
                const expireDate = new Date(currentProfile.credits_expire_at);
                const now = new Date();
                if (now <= expireDate && remainingCredits > 0) {
                  // Preserve up to 10 signup credits (the signup bonus amount)
                  signupCreditsPreserved = Math.min(remainingCredits, signupBonus);
                }
              }
            }

            newTotalCredits = credits + signupCreditsPreserved;
            console.log(`🔄 Plan change detected: ${previousPlanTier} → ${planTier}`);
            console.log(`   Plan credits: ${credits}, Signup credits preserved: ${signupCreditsPreserved}, Total: ${newTotalCredits}`);
          } else if (isRenewal) {
            // RENEWAL (same plan): Allow rollover of unused credits (including signup credits)
            const currentTotal = currentProfile.total_credits || 0;
            const currentUsed = currentProfile.used_credits || 0;
            const remainingCredits = Math.max(0, currentTotal - currentUsed);

            // Only rollover if credits haven't expired
            if (currentProfile.credits_expire_at) {
              const expireDate = new Date(currentProfile.credits_expire_at);
              const now = new Date();
              if (now <= expireDate) {
                rolloverCredits = remainingCredits;
              }
            }

            newTotalCredits = credits + rolloverCredits;
            console.log(`🔄 Renewal detected: ${planTier} plan`);
            if (rolloverCredits > 0) {
              console.log(`   Rollover credits: ${rolloverCredits}, New credits: ${credits}, Total: ${newTotalCredits}`);
            } else {
              console.log(`   No rollover (expired or none remaining), New credits: ${credits}`);
            }
          } else {
            // First-time paid subscription (from free tier)
            // Preserve signup credits if they exist and are valid
            const currentTotal = currentProfile.total_credits || 0;
            const currentUsed = currentProfile.used_credits || 0;
            const remainingCredits = Math.max(0, currentTotal - currentUsed);

            if (currentProfile.signup_bonus_given && remainingCredits > 0) {
              // Check if signup credits haven't expired
              if (currentProfile.credits_expire_at) {
                const expireDate = new Date(currentProfile.credits_expire_at);
                const now = new Date();
                if (now <= expireDate) {
                  signupCreditsPreserved = Math.min(remainingCredits, 10); // Preserve up to 10 signup credits
                }
              }
            }

            newTotalCredits = credits + signupCreditsPreserved;
            console.log(`🆕 First-time paid subscription: ${planTier} plan`);
            console.log(`   Plan credits: ${credits}, Signup credits preserved: ${signupCreditsPreserved}, Total: ${newTotalCredits}`);
          }

          // Update profiles table with plan info and credits
          const { data: updateData, error } = await supabaseAdmin
            .from('profiles')
            .update({
              plan_tier: planTier,
              plan_status: planStatus,
              billing_period: billingPeriod, // Store billing period for pricing page UX
              lemonsqueezy_customer_id: customerId || null,
              lemonsqueezy_subscription_id: subscriptionId,
              lemonsqueezy_renews_at: renewsAt,
              total_credits: newTotalCredits,
              used_credits: 0, // Reset used credits for new period
              credits_expire_at: expiresAt, // Monthly expiration (for both monthly and annual)
              next_credit_reset_at: nextResetAt, // Track next monthly reset date
              last_credits_allocated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select();

          if (error) {
            console.error('Error updating profile from webhook:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return res.status(500).send('Failed to update profile');
          }

          creditsAllocated = true;
          console.log(`✅ Credits allocated: ${newTotalCredits} total (${planTier} ${billingPeriod}) to user ${userId}`);

          // Check if any rows were updated
          if (!updateData || updateData.length === 0) {
            console.warn(`⚠️ No profile found to update for user ${userId} (${customerEmail})`);
            // Try to check if profile exists
            const { data: profileCheck } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('id', userId)
              .limit(1);

            if (!profileCheck || profileCheck.length === 0) {
              console.error(`❌ Profile does not exist for user ${userId}. Creating profile...`);
              // Try to create profile if it doesn't exist
              const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert({
                  id: userId,
                  plan_tier: planTier,
                  plan_status: planStatus,
                  billing_period: billingPeriod, // Store billing period for pricing page UX
                  lemonsqueezy_customer_id: customerId || null,
                  lemonsqueezy_subscription_id: subscriptionId,
                  lemonsqueezy_renews_at: renewsAt,
                  total_credits: credits,
                  used_credits: 0,
                  credits_expire_at: expiresAt,
                  next_credit_reset_at: nextResetAt, // Track next monthly reset date
                  last_credits_allocated_at: new Date().toISOString(),
                })
                .select();

              if (createError) {
                console.error(`❌ Failed to create profile:`, createError);
                return res.status(500).send('Profile not found and failed to create');
              } else {
                console.log(`✅ Created new profile for user ${userId} with plan ${planTier} and ${credits} credits`);
                return res.status(200).send('Webhook processed - profile created');
              }
            } else {
              // Profile exists but update didn't work - might be RLS issue
              console.error(`❌ Profile exists but update failed. Check RLS policies.`);
              return res.status(500).send('Profile exists but update failed');
            }
          }

          console.log(`✅ Successfully updated profile for user ${userId} (${customerEmail})`);
          console.log(`   Plan: ${planTier.toUpperCase()}`);
          console.log(`   Status: ${planStatus.toUpperCase()}`);
          console.log(`   Billing Period: ${billingPeriod.toUpperCase()}`);
          console.log(`   Credits Allocated: ${newTotalCredits}`);
          console.log(`   Credits Expire At: ${expiresAt}`);
          console.log(`   Variant ID: ${variantId || 'unknown'}`);
          console.log(`   Subscription ID: ${subscriptionId}`);
          console.log(`   Renews At: ${renewsAt || 'N/A'}`);
          console.log(`Updated profile data:`, JSON.stringify(updateData[0], null, 2));
          return res.status(200).send('Webhook processed successfully');
        }
      }

      // If not allocating credits (inactive plan or subscription_updated event), just update plan info
      if (!creditsAllocated) {
        const { data: updateData, error } = await supabaseAdmin
          .from('profiles')
          .update({
            plan_tier: planTier,
            plan_status: planStatus,
            billing_period: billingPeriod, // Store billing period for pricing page UX
            lemonsqueezy_customer_id: customerId || null,
            lemonsqueezy_subscription_id: subscriptionId,
            lemonsqueezy_renews_at: renewsAt,
          })
          .eq('id', userId)
          .select();

        if (error) {
          console.error('Error updating profile from webhook:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          return res.status(500).send('Failed to update profile');
        }

        console.log(`✅ Updated profile metadata (no credit allocation) for user ${userId}`);
        console.log(`   Event: ${eventName}, Plan: ${planTier}, Status: ${planStatus}`);
        return res.status(200).send('Webhook processed successfully');
      }

      // If we reach here, credits were allocated successfully
      console.log(`✅ Webhook processed successfully for user ${userId}`);
      return res.status(200).send('Webhook processed successfully');
    } catch (err) {
      console.error('Error handling Lemon Squeezy webhook:', err);
      return res.status(500).send('Webhook error');
    }
  });

  // --- Monthly Credit Reset Endpoint (for annual plans) ---
  // This should be called daily via cron job or scheduled task
  // Resets credits monthly for both monthly and annual plans
  app.post('/api/credits/monthly-reset', async (req, res) => {
    try {
      if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY for credit reset');
        return res.status(500).send('Server not configured for credit resets');
      }

      // Optional: Add API key or secret for security
      const resetSecret = process.env.CREDIT_RESET_SECRET;
      if (resetSecret && req.headers['x-reset-secret'] !== resetSecret) {
        return res.status(401).send('Unauthorized');
      }

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
        return res.status(500).send('Failed to fetch users');
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

          // Next reset = current reset date + 1 month (keeps subscription day, e.g. 24th each month)
          const currentReset = new Date(user.next_credit_reset_at!);
          const nextResetDate = new Date(currentReset);
          nextResetDate.setMonth(nextResetDate.getMonth() + 1);
          nextResetDate.setHours(0, 0, 0, 0);

          // Expiry = same as next reset (credits expire when next cycle starts)
          const expireDate = new Date(nextResetDate);

          // New total = monthly credits + rollover (unused credits)
          const newTotalCredits = monthlyCredits + remainingCredits;

          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              total_credits: newTotalCredits,
              used_credits: 0, // Reset used credits
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
          }
        } catch (err) {
          console.error(`Exception resetting credits for user ${user.id}:`, err);
          resetErrors.push(`User ${user.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return res.status(200).json({
        message: `Credit reset completed`,
        reset: resetCount,
        total: usersToReset.length,
        errors: resetErrors.length > 0 ? resetErrors : undefined,
      });
    } catch (err) {
      console.error('Error in monthly credit reset:', err);
      return res.status(500).send('Credit reset error');
    }
  });

  // --- Lemon Squeezy: create checkout for all plans ---
  app.post('/api/lemonsqueezy/create-checkout', async (req, res) => {
    try {
      if (!LEMONSQUEEZY_API_KEY || !LEMONSQUEEZY_STORE_ID) {
        console.error('Missing Lemon Squeezy environment variables');
        return res.status(500).json({ error: 'Payment configuration is not set up.' });
      }

      const { customerEmail, variantId } = req.body ?? {};

      // Validate variant ID - check for undefined, null, or empty string
      if (!variantId || (typeof variantId === 'string' && variantId.trim() === '')) {
        console.error('❌ Checkout request missing or empty variant ID');
        return res.status(400).json({
          error: 'Missing or invalid variant ID',
          details: 'The variant ID is required to create a checkout session. Please ensure the plan is properly configured.'
        });
      }

      // Get redirect URL from env or use defaults
      // Lemon Squeezy uses a single redirect_url that handles both success and cancel
      // Users will be redirected here after payment (success or cancel)
      const baseUrl = process.env.LEMONSQUEEZY_SUCCESS_URL || 'http://localhost:5173';
      const redirectUrl = `${baseUrl}/?payment=success`;

      // Ensure all IDs are strings (Lemon Squeezy JSON:API requires string IDs)
      const storeIdString = String(LEMONSQUEEZY_STORE_ID);
      const variantIdString = String(variantId);

      // Use global fetch (Node 20+) to call Lemon Squeezy API
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: customerEmail ? { email: customerEmail } : {},
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: storeIdString,
                },
              },
              variant: {
                data: {
                  type: 'variants',
                  id: variantIdString,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lemon Squeezy API error:', response.status, errorText);
        return res
          .status(500)
          .json({ error: 'Failed to create checkout session with payment provider.' });
      }

      const json = (await response.json()) as any;
      const checkoutUrl = json?.data?.attributes?.url || json?.data?.attributes?.checkout_url;

      if (!checkoutUrl) {
        console.error('Lemon Squeezy response missing checkout URL:', json);
        return res
          .status(500)
          .json({ error: 'Payment provider did not return a checkout URL.' });
      }

      return res.json({ url: checkoutUrl });
    } catch (err) {
      console.error('Error creating Lemon Squeezy checkout:', err);
      return res.status(500).json({ error: 'Unexpected error creating checkout.' });
    }
  });

  // --- Lemon Squeezy: customer portal (Manage Subscription) ---
  app.post('/api/lemonsqueezy/customer-portal', async (req, res) => {
    try {
      if (!LEMONSQUEEZY_API_KEY) {
        return res.status(500).json({ error: 'Lemon Squeezy API key not configured' });
      }
      const { customerId } = req.body ?? {};
      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }
      const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        },
      });
      const data = (await response.json()) as any;
      const portalUrl = data?.data?.attributes?.urls?.customer_portal;
      if (!portalUrl) {
        return res.json({ url: 'https://app.lemonsqueezy.com/my-orders' });
      }
      return res.json({ url: portalUrl });
    } catch (err) {
      console.error('Error fetching customer portal URL:', err);
      return res.json({ url: 'https://app.lemonsqueezy.com/my-orders' });
    }
  });

  // Universal SSR handler for all other requests
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    // Ignore API requests/static files that fell through (prevents Vite from trying to render them as HTML)
    if (url.startsWith('/api/') || url.startsWith('/.well-known/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    let template, render;

    try {
      if (!isProd) {
        // In development, read and transform index.html on the fly
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        // Load the server entry module using Vite's SSR loader
        render = (await vite.ssrLoadModule('/entry-server.tsx')).render;
      } else {
        // In production, read the pre-built index.html
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        // Dynamically import the built server entry module
        const serverEntryPath = path.resolve(__dirname, 'dist/server/entry-server.js');
        render = (await import(serverEntryPath)).render;
      }

      // Render the application's HTML
      const appHtml = await render(url);
      // Inject the rendered HTML into the template
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // Send the final HTML response
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error occurs, let Vite fix the stack trace in dev
      if (vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
