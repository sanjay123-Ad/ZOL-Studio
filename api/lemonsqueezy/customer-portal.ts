import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Direct Customer Portal Link Generator
 * This allows users to jump directly into their billing management
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId } = req.body;
  const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Lemon Squeezy API key not configured' });
  }

  try {
    // Call Lemon Squeezy API to get the customer's portal link
    // Note: The API requires the Customer ID (starts with 'cus_')
    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const data = await response.json();
    const portalUrl = data?.data?.attributes?.urls?.customer_portal;

    if (!portalUrl) {
      // Fallback if specific portal URL is not found
      return res.json({ url: 'https://app.lemonsqueezy.com/my-orders' });
    }

    return res.json({ url: portalUrl });
  } catch (error) {
    console.error('Error fetching portal URL:', error);
    return res.json({ url: 'https://app.lemonsqueezy.com/my-orders' });
  }
}



