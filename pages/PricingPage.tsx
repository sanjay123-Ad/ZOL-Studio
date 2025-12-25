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
  color: 'blue' | 'sky' | 'purple';
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
      monthlyPrice: 19,
      annualPrice: 190,
      annualSavings: 38,
      credits: 250,
      features: [
        '250 Credits / month',
        'Real-Time Generation',
        'Commercial License',
        'Remove Watermark',
        'Standard Support'
      ],
      color: 'blue'
    },
    {
      name: 'Pro',
      tagline: 'Accelerate growth & consistency',
      monthlyPrice: 49,
      annualPrice: 490,
      annualSavings: 98,
      credits: 750,
      features: [
        '750 Credits / month',
        'Access to All Tools',
        'Commercial License',
        'Remove Watermark',
        'High Pixel Quality',
        'Standard Support'
      ],
      popular: true,
      color: 'sky'
    },
    {
      name: 'Agency',
      tagline: 'Maximum power & scale',
      monthlyPrice: 99,
      annualPrice: 990,
      annualSavings: 198,
      credits: 1450,
      features: [
        '1,450 Credits / month',
        'API Access',
        'Commercial License',
        'Priority Support',
        'Early Access to New Models',
        'Remove Watermark',
        '4K Ultra-High Resolution'
      ],
      color: 'purple'
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

  // Handle "Manage Subscription" - redirect to Lemon Squeezy customer portal
  const handleManageSubscription = () => {
    if (userPlan?.customerId) {
      // Lemon Squeezy customer portal URL format
      // Note: You'll need to get the actual portal URL from Lemon Squeezy API
      // For now, we'll redirect to a manage subscription page or show a message
      alert('Manage Subscription feature coming soon! You can manage your subscription through your Lemon Squeezy account.');
      // TODO: Implement Lemon Squeezy customer portal link
      // window.open(`https://app.lemonsqueezy.com/my-orders/${userPlan.customerId}`, '_blank');
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

  const getColorClasses = (color: string, isPopular: boolean = false) => {
    const baseClasses = isPopular 
      ? 'border-2 border-sky-500 shadow-xl shadow-sky-200/50' 
      : 'border border-gray-200 dark:border-gray-700';
    
    switch (color) {
      case 'blue':
        return {
          card: `${baseClasses} bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20`,
          badge: 'bg-blue-500 text-white',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          checkmark: 'text-blue-600 dark:text-blue-400',
          price: 'text-blue-600 dark:text-blue-400'
        };
      case 'sky':
        return {
          card: `${baseClasses} bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20`,
          badge: 'bg-sky-500 text-white',
          button: 'bg-sky-600 hover:bg-sky-700 text-white',
          checkmark: 'text-sky-600 dark:text-sky-400',
          price: 'text-sky-600 dark:text-sky-400'
        };
      case 'purple':
        return {
          card: `${baseClasses} bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20`,
          badge: 'bg-purple-500 text-white',
          button: 'bg-purple-600 hover:bg-purple-700 text-white',
          checkmark: 'text-purple-600 dark:text-purple-400',
          price: 'text-purple-600 dark:text-purple-400'
        };
      default:
        return {
          card: baseClasses,
          badge: 'bg-gray-500 text-white',
          button: 'bg-gray-600 hover:bg-gray-700 text-white',
          checkmark: 'text-gray-600 dark:text-gray-400',
          price: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
      {/* Hero Section - Ready to Revolutionize */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm font-semibold animate-fade-in">
              🚀 Transform Your Workflow
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Ready to Revolutionize
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto animate-fade-in delay-200">
            Your Fashion E-commerce Workflow?
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 animate-fade-in delay-300">
            Choose the perfect plan for your business. Start creating professional AI-generated assets in minutes, not weeks.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-fade-in delay-400">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-sky-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
                <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Annual <span className={`text-sky-600 dark:text-sky-400 font-bold transition-all duration-300 ${isAnnual ? 'glow-effect' : ''}`}>(2 months free)</span>
                </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {plans.map((plan, index) => {
              const colors = getColorClasses(plan.color, plan.popular);
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const period = isAnnual ? '/year' : '/month';
              const savings = isAnnual ? `Save $${plan.annualSavings} / year` : null;

              return (
                <div
                  key={plan.name}
                  className={`relative ${colors.card} rounded-2xl p-8 transition-all duration-500 ${
                    hoveredCard === index ? 'scale-105 -translate-y-2' : 'scale-100'
                  } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''} animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className={`${colors.badge} px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce`}>
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {plan.tagline}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-2">
                      <span className={`text-4xl font-extrabold ${colors.price}`}>
                        ${price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-lg">
                        {period}
                      </span>
                    </div>
                    
                    {savings && (
                      <p className="text-sm text-sky-600 dark:text-sky-400 font-semibold">
                        {savings}
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8 min-h-[400px]">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${(index * 100) + (featureIndex * 50)}ms` }}
                      >
                        <svg
                          className={`flex-shrink-0 w-5 h-5 mt-0.5 ${colors.checkmark}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {(() => {
                    const currentBillingPeriod = isAnnual ? 'annual' : 'monthly';
                    const isActive = isActivePlan(plan.name, currentBillingPeriod);
                    
                    return (
                      <>
                        <button
                          onClick={() => isActive ? handleManageSubscription() : handleSelectPlan(plan)}
                          className={`w-full ${colors.button} py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
                          disabled={isCheckingOut}
                        >
                          {isCheckingOut 
                            ? 'Redirecting…' 
                            : isActive 
                            ? 'Manage Subscription' 
                            : 'Get Started'}
                        </button>
                        {isActive && (
                          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                            You're currently on this plan
                          </p>
                        )}
                        {!isActive && userPlan?.planTier && 
                         plan.name.toLowerCase() === userPlan.planTier && 
                         currentBillingPeriod !== userPlan.billingPeriod && (
                          <p className="text-center text-xs text-sky-600 dark:text-sky-400 mt-2 font-medium">
                            {isAnnual ? 'Switch to annual & save 20%' : 'Switch to monthly billing'}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">All 5 Core Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Virtual Photoshoot, Asset Generator, Catalog Forged, Style|Scene, AI Stylist</p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Commercial License</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Use all generated assets for commercial purposes</p>
            </div>
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cloud Storage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secure cloud storage for all your generated assets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .glow-effect {
          animation: glow-pulse 2s ease-in-out infinite;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
                       0 0 20px rgba(14, 165, 233, 0.4),
                       0 0 30px rgba(14, 165, 233, 0.3),
                       0 0 40px rgba(14, 165, 233, 0.2);
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
                         0 0 20px rgba(14, 165, 233, 0.4),
                         0 0 30px rgba(14, 165, 233, 0.3),
                         0 0 40px rgba(14, 165, 233, 0.2);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 20px rgba(14, 165, 233, 0.8),
                         0 0 30px rgba(14, 165, 233, 0.6),
                         0 0 40px rgba(14, 165, 233, 0.5),
                         0 0 50px rgba(14, 165, 233, 0.4),
                         0 0 60px rgba(14, 165, 233, 0.3);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;

