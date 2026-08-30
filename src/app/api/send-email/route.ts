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
    
    // Personal subject line (avoids marketing keywords)
    const subject = `${cleanSender} sent you flowers`;
    const textBody = `Hi ${cleanRecipient},\n\n${cleanSender} just sent you a personal bouquet gift.\n\nOpen your flowers here:\n${shareUrl}\n\nFrom,\n${cleanSender}`;

    // Clean personal letter template (Gmail classifies marketing tables with large hero buttons as Promotions)
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1a1a1a;">
  <div style="max-width: 480px; margin: 0 auto;">
    <p style="margin: 0 0 16px;">Hi <strong>${cleanRecipient}</strong>,</p>
    <p style="margin: 0 0 20px; color: #2d3748;">
      <strong>${cleanSender}</strong> created a personal flower bouquet and left a gift card for you on Bloomly.
    </p>
    
    <div style="margin: 28px 0; text-align: center;">
      <a href="${shareUrl}" style="background-color: #4a6c57; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block;">
        Open Your Bouquet & Card &rarr;
      </a>
    </div>

    <p style="margin: 24px 0 6px; font-size: 13px; color: #718096;">
      Direct link: <a href="${shareUrl}" style="color: #4a6c57; text-decoration: underline;">${shareUrl}</a>
    </p>
    
    <p style="margin: 28px 0 0; color: #718096; font-size: 14px;">
      Warmly,<br>
      <strong>${cleanSender}</strong>
    </p>
  </div>
</body>
</html>`;

    // 1. Primary Option: SMTP Relay (Brevo SMTP or Gmail SMTP - bypasses REST API IP Whitelisting)
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
          from: `"${brevoSenderName}" <${brevoSenderEmail}>`,
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

    // 2. Secondary Option: Brevo REST API v3
    if (brevoApiKey) {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: brevoSenderName, email: brevoSenderEmail },
          to: [{ email }],
          subject,
          htmlContent: htmlBody,
          textContent: textBody,
          headers: {
            'List-Unsubscribe': `<${shareUrl}>`,
          }
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        console.error('[Brevo API Error]:', responseData);
        
        // Try candidate senders on Brevo
        const fallbackSenders = ['bloomlylove21@gmail.com', 'abclulu.student@ua.edu.ph'].filter(e => e !== brevoSenderEmail);
        for (const candidateEmail of fallbackSenders) {
          console.warn(`Retrying Brevo with candidate sender: ${candidateEmail}...`);
          const retryRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': brevoApiKey,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: brevoSenderName, email: candidateEmail },
              to: [{ email }],
              subject,
              htmlContent: htmlBody,
              textContent: textBody,
            }),
          });
          const retryData = await retryRes.json();
          if (retryRes.ok) {
            return NextResponse.json({ success: true, provider: 'brevo-fallback', data: retryData });
          }
        }
        
        // If Brevo REST API fails, fall through to Resend
        if (resend) {
          const { data, error } = await resend.emails.send({
            from: 'Bloomly Gifts <onboarding@resend.dev>',
            to: [email],
            subject,
            html: htmlBody,
            text: textBody,
          });
          if (!error) return NextResponse.json({ success: true, provider: 'resend-fallback', data });
        }
        
        let customErrMsg = responseData.message || 'Brevo API dispatch failed';
        if (responseData.code === 'unauthorized' && responseData.message?.includes('unrecognised IP address')) {
          customErrMsg = 'Brevo IP restriction: Disable IP whitelist in https://app.brevo.com/security/authorised_ips or add SMTP_USER & SMTP_PASS in Vercel.';
        } else if (responseData.code === 'unauthorized') {
          customErrMsg = 'Brevo Unauthorized: Check BREVO_API_KEY / SMTP_PASS in Vercel Environment Variables.';
        }
        return NextResponse.json({ success: false, error: customErrMsg }, { status: 200 });
      }
      return NextResponse.json({ success: true, provider: 'brevo', data: responseData });
    }

    // 2. Secondary Option: SMTP / Nodemailer
    if (transporter && smtpUser) {
      const info = await transporter.sendMail({
        from: `"${brevoSenderName}" <${smtpUser}>`,
        to: email,
        subject,
        text: textBody,
        html: htmlBody,
      });
      return NextResponse.json({ success: true, provider: 'smtp', messageId: info.messageId });
    }

    // 3. Fallback: Resend API
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: 'Bloomly Gifts <onboarding@resend.dev>',
        to: [email],
        subject,
        html: htmlBody,
        text: textBody,
        replyTo: 'support@resend.dev',
        headers: {
          'List-Unsubscribe': `<${shareUrl}>`,
          'X-Entity-Ref-ID': slug || 'bloomly-bouquet',
        },
      });

      if (error) {
        console.error('[Resend API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, provider: 'resend', data });
    }

    return NextResponse.json({ error: 'No email service provider configured' }, { status: 500 });

  } catch (err: any) {
    console.error('[Email Dispatcher] Internal Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
