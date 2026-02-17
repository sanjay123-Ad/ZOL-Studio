import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper function to map variant ID to plan tier (for reference, not used in checkout)
function getPlanTierFromVariantId(variantId: string): 'basic' | 'pro' | 'agency' | null {
  const basicMonthly = process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID;
  const basicAnnual = process.env.LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID;
  const proMonthly = process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID;
  const proAnnual = process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID;
  const agencyMonthly = process.env.LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID;
  const agencyAnnual = process.env.LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID || process.env.VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID;

  const variantIdStr = String(variantId).trim();
  if (basicMonthly && variantIdStr === String(basicMonthly).trim()) return 'basic';
  if (basicAnnual && variantIdStr === String(basicAnnual).trim()) return 'basic';
  if (proMonthly && variantIdStr === String(proMonthly).trim()) return 'pro';
  if (proAnnual && variantIdStr === String(proAnnual).trim()) return 'pro';
  if (agencyMonthly && variantIdStr === String(agencyMonthly).trim()) return 'agency';
  if (agencyAnnual && variantIdStr === String(agencyAnnual).trim()) return 'agency';
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
    const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

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

    // Get redirect URL from env or use production domain
    const baseUrl = process.env.LEMONSQUEEZY_SUCCESS_URL || process.env.VITE_APP_URL || 'https://zolstudio.com';
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
}





