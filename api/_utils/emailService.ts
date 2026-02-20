import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Zol Studio AI <noreply@zolstudio.com>';
const APP_URL = 'https://zolstudio.com';

function getPlanDisplayName(planTier: string): string {
  const names: Record<string, string> = { basic: 'Basic', pro: 'Pro', agency: 'Agency' };
  return names[(planTier || '').toLowerCase()] || planTier;
}

// ─── 1. Welcome Email ───────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, username: string): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Welcome to Zol Studio AI! 🎨',
      html: welcomeEmailHtml(username),
    });
    if (error) console.error('Failed to send welcome email:', error);
    else console.log(`✅ Welcome email sent to ${to}`);
  } catch (err) {
    console.error('Exception sending welcome email:', err);
  }
}

// ─── 2. Payment Confirmation Email ──────────────────────────────────────────

export async function sendPaymentConfirmationEmail(
  to: string,
  username: string,
  planTier: string,
  billingPeriod: string,
  credits: number
): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Payment Confirmed – ${getPlanDisplayName(planTier)} Plan Activated`,
      html: paymentConfirmationEmailHtml(username, planTier, billingPeriod, credits),
    });
    if (error) console.error('Failed to send payment confirmation email:', error);
    else console.log(`✅ Payment confirmation email sent to ${to}`);
  } catch (err) {
    console.error('Exception sending payment confirmation email:', err);
  }
}

// ─── 3. Monthly Reset Email ──────────────────────────────────────────────────

export async function sendMonthlyResetEmail(
  to: string,
  username: string,
  newCredits: number,
  rolloverCredits: number,
  planTier: string
): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Your Monthly Credits Have Been Refreshed – Zol Studio AI',
      html: monthlyResetEmailHtml(username, newCredits, rolloverCredits, planTier),
    });
    if (error) console.error('Failed to send monthly reset email:', error);
    else console.log(`✅ Monthly reset email sent to ${to}`);
  } catch (err) {
    console.error('Exception sending monthly reset email:', err);
  }
}

// ─── 4. Low Credits Alert Email ──────────────────────────────────────────────

export async function sendLowCreditsEmail(
  to: string,
  username: string,
  remainingCredits: number
): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: '⚠️ Low Credits Alert – Zol Studio AI',
      html: lowCreditsEmailHtml(username, remainingCredits),
    });
    if (error) console.error('Failed to send low credits email:', error);
    else console.log(`✅ Low credits alert email sent to ${to}`);
  } catch (err) {
    console.error('Exception sending low credits email:', err);
  }
}

// ─── HTML Templates ───────────────────────────────────────────────────────────

function baseLayout(headerHtml: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    ${headerHtml}
    <div style="padding:40px 32px">${bodyHtml}</div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">
        © 2026 Zol Studio AI &nbsp;·&nbsp;
        <a href="${APP_URL}/privacy-policy" style="color:#94a3b8;text-decoration:none">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="${APP_URL}/terms-and-conditions" style="color:#94a3b8;text-decoration:none">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function primaryHeader(emoji: string, title: string, subtitle: string): string {
  return `<div style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:40px 32px;text-align:center">
    ${emoji ? `<div style="font-size:40px;margin-bottom:12px">${emoji}</div>` : ''}
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">${title}</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">${subtitle}</p>
  </div>`;
}

function ctaButton(text: string, href: string): string {
  return `<div style="text-align:center;margin:32px 0">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px">
      ${text}
    </a>
  </div>`;
}

function welcomeEmailHtml(username: string): string {
  const header = primaryHeader('', 'Zol Studio AI', 'AI-Powered Fashion Technology');
  const body = `
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px">Welcome, ${username}! 🎉</h2>
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
    ${ctaButton('Start Creating →', APP_URL)}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0">
      Need help? Visit <a href="${APP_URL}" style="color:#0ea5e9;text-decoration:none">zolstudio.com</a>
    </p>`;
  return baseLayout(header, body);
}

function paymentConfirmationEmailHtml(
  username: string,
  planTier: string,
  billingPeriod: string,
  credits: number
): string {
  const planName = getPlanDisplayName(planTier);
  const periodDisplay = billingPeriod === 'annual' ? 'Annual' : 'Monthly';
  const header = primaryHeader('✅', 'Payment Confirmed!', `Your ${planName} plan is now active`);
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px">
      Hi <strong>${username}</strong>, thank you for your payment. Your subscription has been activated successfully.
    </p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 16px;color:#0369a1;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">PLAN DETAILS</p>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e0f2fe">Plan</td>
          <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #e0f2fe">${planName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e0f2fe">Billing</td>
          <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #e0f2fe">${periodDisplay}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e0f2fe">Credits Added</td>
          <td style="padding:10px 0;color:#0ea5e9;font-size:20px;font-weight:800;text-align:right;border-bottom:1px solid #e0f2fe">${credits}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px">Reset Cycle</td>
          <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right">Every Month</td>
        </tr>
      </table>
    </div>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px">
      💡 <strong>Tip:</strong> Your credits reset every month. Unused credits roll over automatically.
    </p>
    ${ctaButton('Go to Dashboard →', APP_URL)}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0">
      Manage your subscription from <a href="${APP_URL}/settings" style="color:#0ea5e9;text-decoration:none">account settings</a>
    </p>`;
  return baseLayout(header, body);
}

function monthlyResetEmailHtml(
  username: string,
  newCredits: number,
  rolloverCredits: number,
  planTier: string
): string {
  const planName = getPlanDisplayName(planTier);
  const totalCredits = newCredits + rolloverCredits;
  const header = primaryHeader('🔄', 'Credits Refreshed!', 'Your monthly credits have been reset');
  const rolloverBox = rolloverCredits > 0
    ? `<div style="flex:1;background:#fff;border:1px solid #e0f2fe;border-radius:10px;padding:16px;text-align:center;margin:0 8px">
         <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600">ROLLED OVER</p>
         <p style="margin:0;color:#0ea5e9;font-size:28px;font-weight:800">+${rolloverCredits}</p>
       </div>`
    : '';
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px">
      Hi <strong>${username}</strong>! Good news – your credits have been refreshed for this month. ✨
    </p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 16px;color:#0369a1;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">THIS MONTH'S CREDITS</p>
      <div style="display:flex;gap:0">
        <div style="flex:1;background:#fff;border:1px solid #e0f2fe;border-radius:10px;padding:16px;text-align:center;margin-right:8px">
          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600">NEW CREDITS</p>
          <p style="margin:0;color:#0ea5e9;font-size:28px;font-weight:800">${newCredits}</p>
        </div>
        ${rolloverBox}
        <div style="flex:1;background:linear-gradient(135deg,#0ea5e9,#2563eb);border-radius:10px;padding:16px;text-align:center">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.85);font-size:12px;font-weight:600">TOTAL AVAILABLE</p>
          <p style="margin:0;color:#fff;font-size:28px;font-weight:800">${totalCredits}</p>
        </div>
      </div>
    </div>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px">
      You're on the <strong>${planName}</strong> plan. Keep creating amazing fashion content!
    </p>
    ${ctaButton('Start Creating →', APP_URL)}`;
  return baseLayout(header, body);
}

function lowCreditsEmailHtml(username: string, remainingCredits: number): string {
  const header = `<div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:40px 32px;text-align:center">
    <div style="font-size:40px;margin-bottom:12px">⚠️</div>
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">Low Credits Alert</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px">You're running low on generations</p>
  </div>`;
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px">
      Hi <strong>${username}</strong>, you only have
      <strong style="color:#ef4444">${remainingCredits} credit${remainingCredits === 1 ? '' : 's'}</strong> left.
      Don't let your creative flow stop!
    </p>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin:0 0 24px;text-align:center">
      <p style="margin:0 0 4px;color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">REMAINING CREDITS</p>
      <p style="margin:0;color:#b45309;font-size:52px;font-weight:800;line-height:1">${remainingCredits}</p>
    </div>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px">Upgrade your plan to get more credits:</p>
    <table style="width:100%;border-collapse:separate;border-spacing:8px;margin:0 0 24px">
      <tr>
        <td style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;text-align:center;background:#fff">
          <strong style="color:#0f172a;font-size:14px;display:block;margin-bottom:4px">Basic</strong>
          <span style="color:#0ea5e9;font-size:22px;font-weight:800">175</span>
          <span style="color:#64748b;font-size:11px">/mo</span>
        </td>
        <td style="padding:12px;border:2px solid #0ea5e9;border-radius:10px;text-align:center;background:#f0f9ff">
          <strong style="color:#0f172a;font-size:14px;display:block;margin-bottom:4px">Pro ⭐</strong>
          <span style="color:#0ea5e9;font-size:22px;font-weight:800">360</span>
          <span style="color:#64748b;font-size:11px">/mo</span>
        </td>
        <td style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;text-align:center;background:#fff">
          <strong style="color:#0f172a;font-size:14px;display:block;margin-bottom:4px">Agency</strong>
          <span style="color:#0ea5e9;font-size:22px;font-weight:800">550</span>
          <span style="color:#64748b;font-size:11px">/mo</span>
        </td>
      </tr>
    </table>
    ${ctaButton('Upgrade Now →', `${APP_URL}/pricing`)}`;
  return baseLayout(header, body);
}
