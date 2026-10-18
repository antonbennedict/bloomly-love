/**
 * "You received a bouquet" email.
 *
 * Built for inbox placement first, delight second:
 * - No images or external assets. The flower mark and the gift box are drawn with
 *   table cells and background colors, which every major client renders.
 * - One destination (the bouquet link), a plain-text part, and a personal tone —
 *   the signals that keep it in Gmail's Primary tab rather than Promotions.
 * - Motion is progressive enhancement: Apple Mail / iOS Mail run the CSS keyframes
 *   (blooming flower, wiggling gift, glowing button); clients that strip <style>
 *   (or don't support animation) show the same design at rest.
 */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const C = {
  page: '#FBF6EF',
  card: '#FFFFFF',
  border: '#EFE6DA',
  ink: '#2D2A26',
  muted: '#6B645C',
  sage: '#4A6C57',
  sageDark: '#3B5645',
  sageLight: '#E2EBE5',
  petal: '#F4A7B9',
  petalDeep: '#E8728F',
  gold: '#F6C453',
  box: '#6E9B7C',
  boxShade: '#5E8A6C',
  ribbon: '#E8728F',
};

/** A small flower drawn as a 3×3 grid of rounded cells (petals around a golden center). */
function flowerMark(size = 14) {
  const cell = (bg: string, radius: string, cls = '') =>
    `<td class="${cls}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;background:${bg};border-radius:${radius};font-size:0;line-height:0;">&nbsp;</td>`;
  const empty = `<td width="${size}" height="${size}" style="width:${size}px;height:${size}px;font-size:0;line-height:0;">&nbsp;</td>`;
  const full = '50%';
  return `
  <table role="presentation" class="bloom" cellpadding="0" cellspacing="2" border="0" style="margin:0 auto;border-collapse:separate;">
    <tr>${empty}${cell(C.petal, full, 'petal p1')}${empty}</tr>
    <tr>${cell(C.petal, full, 'petal p4')}${cell(C.gold, full, 'core')}${cell(C.petal, full, 'petal p2')}</tr>
    <tr>${empty}${cell(C.petal, full, 'petal p3')}${empty}</tr>
  </table>`;
}

/** A wrapped gift box: lid and box in sage with a pink ribbon down the middle and a bow on top. */
function giftBox() {
  const td = (w: number, h: number, bg: string, extra = '') =>
    `<td width="${w}" height="${h}" style="width:${w}px;height:${h}px;background:${bg};font-size:0;line-height:0;${extra}">&nbsp;</td>`;
  return `
  <table role="presentation" class="gift" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr><td align="center" style="padding-bottom:2px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${td(22, 16, C.ribbon, 'border-radius:16px 4px 16px 16px;')}
        ${td(10, 10, C.petalDeep, 'border-radius:50%;')}
        ${td(22, 16, C.ribbon, 'border-radius:4px 16px 16px 16px;')}
      </tr></table>
    </td></tr>
    <tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${td(53, 22, C.box, 'border-radius:8px 0 0 8px;')}
        ${td(18, 22, C.ribbon)}
        ${td(53, 22, C.box, 'border-radius:0 8px 8px 0;')}
      </tr></table>
    </td></tr>
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${td(45, 72, C.boxShade, 'border-radius:0 0 0 10px;')}
        ${td(18, 72, C.ribbon)}
        ${td(45, 72, C.boxShade, 'border-radius:0 0 10px 0;')}
      </tr></table>
    </td></tr>
  </table>`;
}

export function renderBouquetEmail({
  senderName,
  recipientName,
  shareUrl,
}: {
  senderName: string;
  recipientName: string;
  shareUrl: string;
}) {
  const sender = senderName.trim() || 'Someone special';
  const recipient = recipientName.trim() || 'Friend';
  const s = escapeHtml(sender);
  const r = escapeHtml(recipient);
  const url = escapeHtml(shareUrl);

  const subject = `${sender} sent you a bouquet of flowers`;
  const preheader = `It's wrapped in a gift box with a card from ${sender}. Tap to unwrap it.`;

  const text = [
    `Hi ${recipient},`,
    '',
    `${sender} arranged a bouquet of flowers for you and tucked a card inside.`,
    `It's wrapped and waiting — open the gift box to watch it bloom.`,
    '',
    `Unwrap your bouquet: ${shareUrl}`,
    '',
    `With love,`,
    sender,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
    a { text-decoration:none; }
    @media (max-width: 520px) {
      .card { border-radius:0 !important; }
      .pad { padding-left:24px !important; padding-right:24px !important; }
      .headline { font-size:26px !important; }
    }
    /* Motion — only where supported and wanted. Every keyframe starts and rests at the
       normal, fully visible design, so a client that freezes or half-supports animation
       (preview panes, some webmail) still shows everything. Never hide content to animate it in. */
    @media (prefers-reduced-motion: no-preference) {
      .petal { animation: breathe 3.2s ease-in-out infinite; }
      .p2 { animation-delay:.2s; } .p3 { animation-delay:.4s; } .p4 { animation-delay:.6s; }
      .gift { animation: wiggle 3.2s ease-in-out .8s infinite; transform-origin:50% 100%; }
      .cta { animation: glow 2.6s ease-in-out infinite; }
      @keyframes breathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.18); } }
      @keyframes wiggle { 0%,72%,100% { transform:rotate(0); } 77% { transform:rotate(-5deg); } 82% { transform:rotate(5deg); } 87% { transform:rotate(-3deg); } 92% { transform:rotate(2deg); } }
      @keyframes glow { 0%,100% { box-shadow:0 6px 18px rgba(74,108,87,.25); } 50% { box-shadow:0 6px 30px rgba(232,114,143,.5); } }
    }
    @media (prefers-color-scheme: dark) {
      .page { background:#141210 !important; }
      .card { background:#1E1B18 !important; border-color:#2E2A26 !important; }
      .ink { color:#F5F1EB !important; }
      .muted { color:#B8AFA4 !important; }
      .eyebrow, .sage-text { color:#A9C7B3 !important; }
      .stage { background:#24302A !important; }
      .divider { border-color:#2E2A26 !important; }
    }
  </style>
</head>
<body class="page" style="margin:0;padding:0;background:${C.page};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>

  <table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:${C.card};border:1px solid ${C.border};border-radius:24px;">

          <tr>
            <td class="pad" align="center" style="padding:36px 40px 0;">
              ${flowerMark(12)}
              <p class="sage-text" style="margin:10px 0 0;font-family:${SERIF};font-size:15px;font-weight:bold;letter-spacing:.5px;color:${C.sage};">Bloomly</p>
            </td>
          </tr>

          <tr>
            <td class="pad" align="center" style="padding:28px 40px 0;">
              <p class="eyebrow" style="margin:0;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${C.sage};">A gift for ${r}</p>
              <h1 class="ink headline" style="margin:12px 0 0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:normal;color:${C.ink};">
                <strong>${s}</strong> sent you<br><em style="color:${C.petalDeep};">a bouquet of flowers</em>
              </h1>
            </td>
          </tr>

          <tr>
            <td class="pad" align="center" style="padding:28px 40px 0;">
              <table role="presentation" class="stage" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.sageLight};border-radius:18px;">
                <tr><td align="center" style="padding:28px 16px 26px;">${giftBox()}</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="pad" align="center" style="padding:24px 40px 0;">
              <p class="muted" style="margin:0;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.muted};">
                Hi ${r}, ${s} picked out flowers, arranged them by hand and tucked a card inside for you. It&rsquo;s wrapped and waiting &mdash; open the box and watch it bloom.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="cta" align="center" bgcolor="${C.sage}" style="border-radius:14px;background:${C.sage};box-shadow:0 6px 18px rgba(74,108,87,.25);">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:16px 34px;font-family:${SANS};font-size:16px;font-weight:600;color:#FFFFFF;border-radius:14px;">Unwrap your bouquet &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="pad" align="center" style="padding:28px 40px 0;">
              <p class="muted" style="margin:0;font-family:${SERIF};font-size:17px;font-style:italic;color:${C.muted};">With love,</p>
              <p class="ink" style="margin:4px 0 0;font-family:${SERIF};font-size:20px;color:${C.ink};">${s}</p>
            </td>
          </tr>

          <tr>
            <td class="pad" style="padding:32px 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td class="divider" style="border-top:1px solid ${C.border};font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <p class="muted" style="margin:18px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};text-align:center;">
                Button not working? Paste this link into your browser:<br>
                <span class="sage-text" style="color:${C.sage};word-break:break-all;">${url}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
