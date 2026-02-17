import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '../constants/paths';
import { supabase } from '../services/supabase';

interface PricingPlan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

interface UserPlan {
  planTier: 'free' | 'basic' | 'pro' | 'agency' | null;
  billingPeriod: 'monthly' | 'annual' | null;
  planStatus: 'inactive' | 'active' | 'past_due' | 'canceled';
  subscriptionId: string | null;
  customerId: string | null;
}

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
<<<<<<< HEAD
  const [managingSubscription, setManagingSubscription] = useState(false);
=======
>>>>>>> 5d5485e7a21aa905e7ec40865cfa3cdc0b3d0abe
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get current user email and plan info
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      // Fetch user's current plan
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_tier, billing_period, plan_status, lemonsqueezy_subscription_id, lemonsqueezy_customer_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserPlan({
            planTier: profile.plan_tier || null,
            billingPeriod: profile.billing_period || null,
            planStatus: profile.plan_status || 'inactive',
            subscriptionId: profile.lemonsqueezy_subscription_id || null,
            customerId: profile.lemonsqueezy_customer_id || null,
          });
        }
      }
    };
    getCurrentUser();
  }, []);

  const plans: PricingPlan[] = [
    {
      name: 'Basic',
      tagline: 'Perfect for getting started',
      monthlyPrice: 49,
      annualPrice: 490,
      annualSavings: 98,
      credits: 175,
      features: [
        '175 Credits / month',
        'Real-Time Generation',
        'Commercial License',
        'Remove Watermark',
        'Standard Support'
      ]
    },
    {
      name: 'Pro',
      tagline: 'Accelerate growth & consistency',
      monthlyPrice: 99,
      annualPrice: 990,
      annualSavings: 198,
      credits: 360,
      features: [
        '360 Credits / month',
        'Access to All Tools',
        'Commercial License',
        'Remove Watermark',
        'High Pixel Quality',
        'Standard Support'
      ],
      popular: true
    },
    {
      name: 'Agency',
      tagline: 'Maximum power & scale',
      monthlyPrice: 149,
      annualPrice: 1490,
      annualSavings: 298,
      credits: 550,
      features: [
        '550 Credits / month',
        'API Access',
        'Commercial License',
        'Priority Support',
        'Early Access to New Models',
        'Remove Watermark',
        '4K Ultra-High Resolution'
      ]
    }
  ];

  // Check if plan card matches user's active plan
  const isActivePlan = (planName: string, billingPeriod: 'monthly' | 'annual'): boolean => {
    if (!userPlan || userPlan.planStatus !== 'active') return false;
    
    const planTierMap: Record<string, 'basic' | 'pro' | 'agency'> = {
      'Basic': 'basic',
      'Pro': 'pro',
      'Agency': 'agency',
    };

    const cardPlanTier = planTierMap[planName];
    const cardBillingPeriod = billingPeriod;

    return (
      userPlan.planTier === cardPlanTier &&
      userPlan.billingPeriod === cardBillingPeriod
    );
  };

<<<<<<< HEAD
  // Handle "Manage Subscription" - redirect to Lemon Squeezy customer portal (same as Profile page)
  const handleManageSubscription = async () => {
    if (!userPlan?.customerId && !userPlan?.subscriptionId) {
      window.open('https://app.lemonsqueezy.com/my-orders', '_blank');
      return;
    }

    setManagingSubscription(true);
    try {
      const response = await fetch('/api/lemonsqueezy/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userPlan.customerId,
          subscriptionId: userPlan.subscriptionId,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        window.open('https://app.lemonsqueezy.com/my-orders', '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      window.open('https://app.lemonsqueezy.com/my-orders', '_blank');
    } finally {
      setManagingSubscription(false);
=======
  // Handle "Manage Subscription" - redirect to Lemon Squeezy customer portal
  const handleManageSubscription = () => {
    if (userPlan?.customerId) {
      // Lemon Squeezy customer portal URL format
      // Note: You'll need to get the actual portal URL from Lemon Squeezy API
      // For now, we'll redirect to a manage subscription page or show a message
      alert('Manage Subscription feature coming soon! You can manage your subscription through your Lemon Squeezy account.');
      // TODO: Implement Lemon Squeezy customer portal link
      // window.open(`https://app.lemonsqueezy.com/my-orders/${userPlan.customerId}`, '_blank');
>>>>>>> 5d5485e7a21aa905e7ec40865cfa3cdc0b3d0abe
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Prevent multiple clicks while we create a checkout session
    if (isCheckingOut) return;

    // Define variant IDs from Environment Variables
    const variantIds: Record<string, { monthly: string; annual: string }> = {
      'Basic': {
        monthly: import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID || '1124106',
        annual: import.meta.env.VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID || ''
      },
      'Pro': {
        monthly: import.meta.env.VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || '',
        annual: import.meta.env.VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || ''
      },
      'Agency': {
        monthly: import.meta.env.VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID || '',
        annual: import.meta.env.VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID || ''
      }
    };

    const selectedVariantId = isAnnual ? variantIds[plan.name]?.annual : variantIds[plan.name]?.monthly;

    // Validate variant ID - check for undefined, null, or empty string
    if (!selectedVariantId || selectedVariantId.trim() === '') {
        const billingPeriod = isAnnual ? 'Annual' : 'Monthly';
        console.error(`❌ Variant ID not configured for: ${plan.name} (${billingPeriod})`);
        console.error('Environment variable missing:', `VITE_LEMONSQUEEZY_${plan.name.toUpperCase()}_${billingPeriod.toUpperCase()}_VARIANT_ID`);
        alert(`⚠️ Configuration Error\n\nThe ${plan.name} ${billingPeriod} plan is not configured.\n\nPlease add the variant ID to your environment variables:\nVITE_LEMONSQUEEZY_${plan.name.toUpperCase()}_${billingPeriod.toUpperCase()}_VARIANT_ID`);
        return;
    }

    try {
      setIsCheckingOut(true);

      const response = await fetch('/api/lemonsqueezy/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            variantId: selectedVariantId,
            customerEmail: userEmail || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to create checkout session:', response.status, errorData);
        
        // Show user-friendly error message
        const errorMessage = errorData?.error || errorData?.details || 'Failed to create checkout session. Please try again.';
        alert(`⚠️ Payment Error\n\n${errorMessage}\n\nIf this problem persists, please contact support.`);
        return;
      }

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('❌ Checkout URL missing from response', data);
        alert('⚠️ Payment Error\n\nThe checkout URL was not returned. Please try again or contact support.');
      }
    } catch (error) {
      console.error('❌ Error starting checkout:', error);
      alert('⚠️ Network Error\n\nFailed to connect to payment service. Please check your internet connection and try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Choose the plan that fits your workflow. All plans include commercial license and core features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !isAnnual
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards - Uniform medium height */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, index) => {
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const period = isAnnual ? '/year' : '/month';
              const savings = isAnnual ? `Save $${plan.annualSavings}` : null;
              const currentBillingPeriod = isAnnual ? 'annual' : 'monthly';
              const isActive = isActivePlan(plan.name, currentBillingPeriod);

              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-xl border bg-white dark:bg-gray-900 transition-all duration-300 ${
                    plan.popular
                      ? 'border-sky-500 dark:border-sky-500 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/20 md:scale-[1.02] z-10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${hoveredCard === index && !plan.popular ? 'shadow-md' : ''}`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ minHeight: '420px' }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-full">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        ${price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-base ml-1">
                        {period}
                      </span>
                      {savings && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                          {savings}
                        </p>
                      )}
                    </div>

                    <ul className="flex-1 space-y-3 mb-6 min-h-0">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                          <svg
                            className="flex-shrink-0 w-4 h-4 mt-0.5 text-sky-600 dark:text-sky-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <button
                        onClick={() => isActive ? handleManageSubscription() : handleSelectPlan(plan)}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                          plan.popular
                            ? 'bg-sky-600 hover:bg-sky-700 text-white'
                            : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                        }`}
<<<<<<< HEAD
                        disabled={isCheckingOut || (isActive && managingSubscription)}
                      >
                        {isCheckingOut || (isActive && managingSubscription)
=======
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut
>>>>>>> 5d5485e7a21aa905e7ec40865cfa3cdc0b3d0abe
                          ? 'Redirecting…'
                          : isActive
                          ? 'Manage Subscription'
                          : 'Get Started'}
                      </button>
                      {isActive && (
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Current plan
                        </p>
                      )}
                      {!isActive && userPlan?.planTier && plan.name.toLowerCase() === userPlan.planTier && currentBillingPeriod !== userPlan.billingPeriod && (
                        <p className="text-center text-xs text-sky-600 dark:text-sky-400 mt-2 font-medium">
                          {isAnnual ? 'Switch to annual & save' : 'Switch to monthly'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Plans Include */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
            All plans include
          </h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              All 5 core tools
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Commercial license
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Cloud storage
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;

