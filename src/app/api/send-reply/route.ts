import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const brevoApiKey = process.env.BREVO_API_KEY;
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'bloomlylove21@gmail.com';
const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Bloomly Gifts';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465');

export async function POST(request: Request) {
  try {
    const { slug, replyText, recipientName, senderName } = await request.json();

    if (!replyText || !replyText.trim()) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    const cleanSender = senderName ? senderName.trim() : 'Bouquet Creator';
    const cleanRecipient = recipientName ? recipientName.trim() : 'Recipient';
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
    const targetEmail = brevoSenderEmail || smtpUser || 'bloomlylove21@gmail.com';

    const subject = `💌 ${cleanRecipient} sent you a thank-you note on Bloomly!`;
    const textBody = `Hi ${cleanSender},\n\n${cleanRecipient} opened your bouquet and left a reply for you:\n\n"${replyText.trim()}"\n\nView your bouquet here:\n${shareUrl}\n\nWarmly,\nBloomly`;

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
  <div style="max-width: 480px; margin: 0 auto; border: 1px solid #e2ebe5; border-radius: 16px; padding: 28px; background-color: #fafbfb;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; width: 44px; height: 44px; background-color: #e11d48; border-radius: 50%; text-align: center; line-height: 44px; color: #ffffff; font-size: 20px; font-weight: bold;">
        💌
      </div>
      <div style="font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #2d4235; margin-top: 8px;">
        New Thank-You Note Received!
      </div>
    </div>

    <p style="margin-bottom: 16px;">Hi <strong>${cleanSender}</strong>,</p>
    <p style="margin-bottom: 20px; color: #2d3748;">
      <strong>${cleanRecipient}</strong> just opened your bouquet gift on Bloomly and left a reply:
    </p>

    <div style="background-color: #ffffff; border-left: 4px solid #e11d48; padding: 16px; border-radius: 8px; margin: 20px 0; font-style: italic; color: #334155; font-size: 16px;">
      &ldquo;${replyText.trim()}&rdquo;
    </div>
    
    <div style="margin: 24px 0; text-align: center;">
      <a href="${shareUrl}" style="background-color: #4a6c57; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block;">
        View Bouquet & Card &rarr;
      </a>
    </div>

    <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
      Warmly,<br>
      <strong>Bloomly</strong>
    </p>
  </div>
</body>
</html>`;

    // 1. Send via Brevo API if available
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
            to: [{ email: targetEmail }],
            subject,
            htmlContent: htmlBody,
            textContent: textBody,
          }),
        });

        const responseData = await res.json();
        if (res.ok) {
          return NextResponse.json({ success: true, provider: 'brevo', data: responseData });
        }
      } catch (e) {
        console.error('[Send Reply Brevo Error]:', e);
      }
    }

    // 2. Fallback via SMTP (Gmail)
    if (smtpUser && smtpPass) {
      try {
        const smtpTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const info = await smtpTransporter.sendMail({
          from: `"Bloomly" <${smtpUser}>`,
          to: targetEmail,
          subject,
          text: textBody,
          html: htmlBody,
        });
        return NextResponse.json({ success: true, provider: 'smtp', messageId: info.messageId });
      } catch (smtpErr) {
        console.error('[Send Reply SMTP Error]:', smtpErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Reply saved locally' });
  } catch (err: any) {
    console.error('[Send Reply Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to send reply' }, { status: 500 });
  }
}
