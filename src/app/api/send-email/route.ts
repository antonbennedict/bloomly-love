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
    
    const subject = `A special bouquet from ${cleanSender}`;
    const textBody = `Hello ${cleanRecipient},\n\n${cleanSender} has sent you a virtual floral bouquet on Bloomly.\n\nYou can view your bouquet and read your personal message here:\n${shareUrl}\n\nWarmly,\nBloomly Flowers`;

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #faf6f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2d3748;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e8e2d9; overflow: hidden; padding: 32px 28px;">
          
          <tr>
            <td style="text-align: center; pb-4;">
              <h1 style="margin: 0 0 8px; color: #4a6c57; font-size: 24px; font-weight: 700;">Bloomly Bouquet</h1>
              <p style="margin: 0; font-size: 14px; color: #718096;">Digital Floral Gift</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 0 16px;">
              <p style="margin: 0 0 14px; font-size: 16px; color: #2d3748;">Hi ${cleanRecipient},</p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5; color: #4a5568;">
                <strong>${cleanSender}</strong> created a custom bouquet of flowers for you on Bloomly.
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${shareUrl}" style="display: inline-block; background-color: #4a6c57; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px;">
                      View Bouquet & Card
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 6px; font-size: 12px; color: #a0aec0;">Direct Link:</p>
              <p style="margin: 0; font-size: 13px; color: #4a6c57; word-break: break-all;">
                <a href="${shareUrl}" style="color: #4a6c57; text-decoration: underline;">${shareUrl}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                Sent with love from Bloomly
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 1. Primary Option: Brevo REST API v3
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
        // If unverified sender error on Brevo, retry with verified account email
        if (responseData.code === 'unauthorized' || responseData.message?.includes('sender') || responseData.code === 'invalid_parameter') {
          console.warn('Retrying Brevo with verified account email...');
          const retryRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': brevoApiKey,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: brevoSenderName, email: 'abclulu.student@ua.edu.ph' },
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
        
        // If Brevo fails, fall through to Resend
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
        return NextResponse.json({ error: responseData.message || 'Brevo API dispatch failed' }, { status: res.status });
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
