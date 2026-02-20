import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendWelcomeEmail, sendLowCreditsEmail } from '../_utils/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, email, username, remainingCredits } = req.body as {
    type: string;
    email: string;
    username: string;
    remainingCredits?: number;
  };

  if (!type || !email || !username) {
    return res.status(400).json({ error: 'Missing required fields: type, email, username' });
  }

  try {
    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(email, username);
        break;
      case 'low_credits':
        if (typeof remainingCredits !== 'number') {
          return res.status(400).json({ error: 'Missing remainingCredits for low_credits type' });
        }
        await sendLowCreditsEmail(email, username, remainingCredits);
        break;
      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in /api/emails/send:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
