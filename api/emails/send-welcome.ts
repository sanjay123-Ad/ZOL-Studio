import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '../_utils/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body as { userId?: string };
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const supabaseAdmin = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Fetch profile and welcome flag
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('welcome_sent, username')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile for welcome:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (profile?.welcome_sent) {
      return res.status(200).json({ success: false, message: 'Welcome already sent' });
    }

    // Get email from auth user record
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      console.error('Could not get user email:', userError);
      return res.status(500).json({ error: 'Failed to get user email' });
    }
    const email = userData.user.email;
    const username = (profile && profile.username) || email.split('@')[0] || 'user';

    // Send welcome email
    await sendWelcomeEmail(email, username).catch((e) => {
      console.error('Failed to send welcome email:', e);
      throw e;
    });

    // Mark welcome_sent = true
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ welcome_sent: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update welcome_sent:', updateError);
      return res.status(500).json({ error: 'Email sent but failed to update profile' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unhandled error in send-welcome:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

