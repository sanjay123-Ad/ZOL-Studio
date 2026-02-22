import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const APP_URL = 'https://zolstudio.com';

function baseLayout(headerHtml: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    ${headerHtml}
    <div style="padding:40px 32px">${bodyHtml}</div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">© 2026 Zol Studio AI · <a href="${APP_URL}/privacy-policy" style="color:#94a3b8;text-decoration:none">Privacy</a> · <a href="${APP_URL}/terms-and-conditions" style="color:#94a3b8;text-decoration:none">Terms</a></p>
    </div>
  </div>
</body></html>`;
}

function welcomeEmailHtml(username: string): string {
  const header = `<div style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:40px 32px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">Zol Studio AI</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">AI-Powered Fashion Technology</p>
  </div>`;
  const body = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px">Welcome, ${username}!</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px">
      We're thrilled to have you on board. Your account is all set up and ready to go.
      We've added <strong style="color:#0ea5e9">10 free credits</strong> to get you started.
    </p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 8px;color:#0369a1;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">YOUR FREE CREDITS</p>
      <p style="margin:0;color:#0f172a;font-size:36px;font-weight:800">10 Credits</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:13px">Valid for 30 days</p>
    </div>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px"><strong>What can you create?</strong></p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#475569;font-size:14px;line-height:2.2">
      <li>Virtual Try-On – Dress models in any garment instantly</li>
      <li>Style Scene – Create professional AI fashion shoots</li>
      <li>Asset Generator – Generate clean product images</li>
      <li>Digital Ironing – Remove fabric wrinkles with AI</li>
    </ul>
    <div style="text-align:center;margin:32px 0">
      <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:700">Start Creating</a>
    </div>`;
  return baseLayout(header, body);
}

function lowCreditsEmailHtml(username: string, remaining: number): string {
  const header = `<div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:40px 32px;text-align:center">
    <div style="font-size:40px;margin-bottom:12px">⚠️</div>
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">Low Credits Alert</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px">You're running low on generations</p>
  </div>`;
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px">
      Hi <strong>${username}</strong>, you only have <strong style="color:#ef4444">${remaining} credit${remaining === 1 ? '' : 's'}</strong> left.
    </p>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center">
      <p style="margin:0 0 4px;color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase">REMAINING CREDITS</p>
      <p style="margin:0;color:#b45309;font-size:52px;font-weight:800;line-height:1">${remaining}</p>
    </div>
    <div style="text-align:center;margin:32px 0">
      <a href="${APP_URL}/pricing" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:700">Upgrade Now</a>
    </div>`;
  return baseLayout(header, body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set in environment variables');
      return res.status(500).json({ error: 'Email service not configured: missing RESEND_API_KEY' });
    }

    const resend = new Resend(apiKey);

    // Supabase admin client (optional but required for idempotent welcome emails)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;

    const { type, email, username, remainingCredits } = req.body || {};

    if (!type || !email || !username) {
      return res.status(400).json({ error: 'Missing required fields: type, email, username' });
    }

    let html = '';
    let subject = '';

    if (type === 'welcome') {
      subject = 'Welcome to Zol Studio AI!';
      html = welcomeEmailHtml(username);

      // Idempotency: if Supabase admin client is available, find the auth user by email
      // then check profiles.welcome_sent and skip sending if already true.
      let foundUser: any = null;
      let profileRow: any = null;
      const emailLower = String(email).toLowerCase();

      if (supabaseAdmin) {
        try {
          // Try to find a user via the Admin API (paginated listing)
          let page = 1;
          const perPage = 100;
          while (!foundUser) {
            // listUsers returns { users: [...] }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
            if (listErr) {
              console.warn('supabase admin.listUsers error:', listErr);
              break;
            }
            const users = listData?.users || [];
            const u = users.find((u: any) => (u.email || '').toLowerCase() === emailLower);
            if (u) {
              foundUser = u;
              break;
            }
            if (!users.length || users.length < perPage) break;
            page++;
          }

          // If we found the auth user, fetch profile by id
          if (foundUser) {
            const userId = foundUser.id;
            const { data, error: profileErr } = await supabaseAdmin
              .from('profiles')
              .select('id,welcome_sent')
              .eq('id', userId)
              .single();
            if (!profileErr) profileRow = data;
            else console.warn('Could not read profile for idempotency check:', profileErr);
          } else {
            // Fallback: if profiles table includes an email column, try selecting by email
            try {
              const { data, error: pErr } = await supabaseAdmin
                .from('profiles')
                .select('id,welcome_sent')
                .ilike('email', email)
                .limit(1)
                .single();
              if (!pErr && data) profileRow = data;
            } catch (e) {
              // ignore fallback errors
            }
          }
        } catch (err) {
          console.warn('Error during idempotency check:', err);
        }

        if (profileRow?.welcome_sent) {
          console.log(`Welcome already sent to ${email} (profile id: ${profileRow.id}) — skipping send.`);
          return res.status(200).json({ success: true, skipped: true });
        }
      }

    } else if (type === 'low_credits') {
      if (typeof remainingCredits !== 'number') {
        return res.status(400).json({ error: 'Missing remainingCredits' });
      }
      subject = 'Low Credits Alert - Zol Studio AI';
      html = lowCreditsEmailHtml(username, remainingCredits);
    } else {
      return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    console.log(`Sending ${type} email to ${email}...`);

    const { data, error } = await resend.emails.send({
      from: 'Zol Studio AI <noreply@zolstudio.com>',
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error));
      return res.status(500).json({ error: 'Resend API error', details: error });
    }

    console.log(`Email sent successfully! ID: ${data?.id}`);

    // After successful welcome send, mark welcome_sent = true (best-effort)
    if (type === 'welcome' && supabaseAdmin) {
      try {
        if (profileRow && profileRow.id) {
          await supabaseAdmin.from('profiles').update({ welcome_sent: true }).eq('id', profileRow.id);
          console.log('Marked profile.welcome_sent = true for', profileRow.id);
        } else if (foundUser && foundUser.id) {
          await supabaseAdmin.from('profiles').update({ welcome_sent: true }).eq('id', foundUser.id);
          console.log('Marked profile.welcome_sent = true for', foundUser.id);
        }
      } catch (err) {
        console.warn('Failed to update welcome_sent flag (non-fatal):', err);
      }
    }

    return res.status(200).json({ success: true, emailId: data?.id });
  } catch (err: any) {
    console.error('Unhandled error in /api/emails/send:', err?.message || err);
    return res.status(500).json({ error: 'Failed to send email', details: err?.message || 'Unknown error' });
  }
}
