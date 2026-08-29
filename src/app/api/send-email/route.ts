import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, slug, senderName, recipientName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    // Fallback to Vercel production URL if running locally or unconfigured
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   (request.url.includes('localhost') ? 'https://bloomly.vercel.app' : new URL(request.url).origin));

    const shareUrl = `${origin}/b/${slug}`;
    const cleanSender = senderName ? senderName.trim() : 'Someone special';
    const cleanRecipient = recipientName ? recipientName.trim() : 'Friend';
    
    // Warm human subject line without spam words
    const subject = `A special bouquet from ${cleanSender}`;

    // Plain text version
    const textBody = `Hello ${cleanRecipient},\n\n${cleanSender} has sent you a virtual floral bouquet on Bloomly.\n\nYou can view your bouquet and read your personal message here:\n${shareUrl}\n\nWarmly,\nBloomly Flowers`;

    // High deliverability email HTML
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
      console.error('[Resend] API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error('[Resend] Internal Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
