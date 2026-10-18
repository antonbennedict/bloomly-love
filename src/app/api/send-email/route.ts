import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { renderBouquetEmail } from '@/lib/email/bouquetEmail';

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
    const { subject, html: htmlBody, text: textBody } = renderBouquetEmail({
      senderName: typeof senderName === 'string' ? senderName : '',
      recipientName: typeof recipientName === 'string' ? recipientName : '',
      shareUrl,
    });

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
