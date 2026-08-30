import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const brevoApiKey = process.env.BREVO_API_KEY;
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'abclulu.student@ua.edu.ph';
const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Bloomly Gifts';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configure SMTP transport if custom SMTP credentials (e.g., Gmail App Password, Brevo SMTP) are provided in .env
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');

const transporter = (smtpUser && smtpPass) ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
}) : null;

export async function POST(request: Request) {
  try {
    const { email, slug, senderName, recipientName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    // Dynamically resolve actual origin URL or fallback to bloomly-love.vercel.app
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    
    let origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) {
      if (host && !host.includes('localhost')) {
        origin = `${proto}://${host}`;
      } else {
        origin = 'https://bloomly-love.vercel.app';
      }
    }

    const shareUrl = `${origin}/b/${slug}`;
    const cleanSender = senderName ? senderName.trim() : 'Someone special';
    const cleanRecipient = recipientName ? recipientName.trim() : 'Friend';
    
    // Primary-Inbox optimized subject line & body
    const subject = `${cleanSender} sent you a bouquet of flowers`;
    const textBody = `Hi ${cleanRecipient},\n\n${cleanSender} created a personal flower bouquet and card for you on Bloomly.\n\nOpen your bouquet here:\n${shareUrl}\n\nWarmly,\n${cleanSender}`;

    // Clean personal note format (passes Gmail Primary Inbox AI checks)
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #222222; line-height: 1.6;">
  <div style="max-width: 480px; margin: 0 auto;">
    <p style="margin-bottom: 16px;">Hi ${cleanRecipient},</p>
    <p style="margin-bottom: 20px;">
      <strong>${cleanSender}</strong> created a personal flower bouquet and left a card for you on Bloomly.
    </p>
    
    <p style="margin: 24px 0;">
      <a href="${shareUrl}" style="background-color: #4a6c57; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
        Open Your Bouquet & Card &rarr;
      </a>
    </p>

    <p style="margin-top: 20px; font-size: 13px; color: #666666;">
      Direct link: <a href="${shareUrl}" style="color: #4a6c57;">${shareUrl}</a>
    </p>
    
    <p style="margin-top: 28px; color: #555555;">
      Warmly,<br>
      <strong>${cleanSender}</strong>
    </p>
  </div>
</body>
</html>`;

    // 1. Primary Option: Brevo REST API v3 (High Deliverability Transactional Email - Deactivated IP Restrictions)
    if (brevoApiKey) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Bloomly', email: brevoSenderEmail },
            to: [{ email }],
            subject,
            htmlContent: htmlBody,
            textContent: textBody,
          }),
        });

        const responseData = await res.json();
        if (res.ok) {
          return NextResponse.json({ success: true, provider: 'brevo', data: responseData });
        }
        console.error('[Brevo API Error]:', responseData);
      } catch (brevoErr) {
        console.error('[Brevo API Fetch Error]:', brevoErr);
      }
    }

    // 2. Secondary Option: SMTP Relay (Gmail SMTP / Brevo SMTP)
    if (smtpUser && smtpPass) {
      try {
        const smtpTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const info = await smtpTransporter.sendMail({
          from: `"Bloomly" <${smtpUser}>`,
          to: email,
          subject,
          text: textBody,
          html: htmlBody,
        });
        return NextResponse.json({ success: true, provider: 'smtp', messageId: info.messageId });
      } catch (smtpErr: any) {
        console.error('[SMTP Transport Error]:', smtpErr);
      }
    }

    // 3. Tertiary Fallback: Resend API
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: 'Bloomly Gifts <onboarding@resend.dev>',
        to: [email],
        subject,
        html: htmlBody,
        text: textBody,
      });

      if (!error) {
        return NextResponse.json({ success: true, provider: 'resend', data });
      }
      console.error('[Resend API Error]:', error);
    }

    return NextResponse.json({ error: 'No email service provider configured' }, { status: 500 });

  } catch (err: any) {
    console.error('[Email Dispatcher] Internal Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
