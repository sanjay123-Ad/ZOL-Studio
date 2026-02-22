import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '../_utils/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body as { userId?: string };
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const supabaseAdmin = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Get email from auth user record first (fail fast if not available)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      console.error('Could not get user email:', userError);
      return res.status(500).json({ error: 'Failed to get user email' });
    }
    const email = userData.user.email;

    // Fetch profile (use maybeSingle to avoid error if row doesn't exist)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('welcome_sent, username')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile for welcome:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (profile?.welcome_sent) {
      return res.status(200).json({ success: false, message: 'Welcome already sent' });
    }

    const username = (profile && profile.username) || email.split('@')[0] || 'user';

    // Send welcome email and capture provider response
    const sendResp = await sendWelcomeEmail(email, username).catch((e) => {
      console.error('Failed to send welcome email:', e);
      throw e;
    });

    // Upsert profile to mark welcome_sent = true (creates row if missing)
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, username, welcome_sent: true }, { onConflict: 'id' });

    if (upsertError) {
      console.error('Failed to upsert welcome_sent:', upsertError);
      return res.status(500).json({ error: 'Email sent but failed to update profile' });
    }

    return res.status(200).json({ success: true, resend: sendResp });
  } catch (err) {
    console.error('Unhandled error in send-welcome:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

