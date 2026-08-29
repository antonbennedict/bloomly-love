import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, slug, senderName, recipientName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const shareUrl = `${origin}/b/${slug}`;
    const cleanSender = senderName ? senderName.trim() : 'Someone special';
    const cleanRecipient = recipientName ? recipientName.trim() : 'Friend';
    
    // Clean, natural subject line (avoiding spam-trigger words/excess emojis)
    const subject = `${cleanSender} sent you a bouquet`;

    // Plain text version (RFC 2822 standard formatting)
    const textBody = `Hello ${cleanRecipient},\n\n${cleanSender} has sent you a digital bouquet on Bloomly.\n\nYou can view your bouquet and read your personal card by opening this link:\n${shareUrl}\n\nBest regards,\nBloomly Team\n${origin}`;

    // Clean, responsive email layout optimized for Gmail Inbox placement
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f5f2; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #4a6c57; padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.2px;">Bloomly Bouquet Gift</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a202c;">
                Hello ${cleanRecipient},
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                <strong>${cleanSender}</strong> created a personalized virtual flower bouquet for you on Bloomly.
              </p>

              <!-- CTA Container -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${shareUrl}" style="display: inline-block; background-color: #4a6c57; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; border: 1px solid #3d5e48;">
                      Open Your Bouquet
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 8px; font-size: 12px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">
                Or paste this link in your browser:
              </p>
              <p style="margin: 0; background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-family: monospace; font-size: 13px; color: #2d3748; word-break: break-all;">
                ${shareUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 32px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #4a6c57;">Bloomly Digital Flowers</p>
              <p style="margin: 0; font-size: 11px; color: #a0aec0;">
                Sent via Bloomly &middot; <a href="${origin}" style="color: #4a6c57; text-decoration: underline;">Create a bouquet</a>
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
      from: 'Bloomly <onboarding@resend.dev>',
      to: [email],
      subject,
      html: htmlBody,
      text: textBody,
      headers: {
        'List-Unsubscribe': `<${origin}>`,
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
