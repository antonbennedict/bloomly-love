export interface Asset {
  id: string;
  category: 'flower' | 'wrapper' | 'filler' | 'accessory' | 'seasonal' | 'other';
  name: string;
  svgMarkup: string; // The raw SVG markup (usually inner elements or full SVG code)
  viewBox: string;
  defaultColor: string;
  isPremium?: boolean;
}

/*
 * Illustration conventions (keep new assets consistent):
 * - 100×100 viewBox. Flower heads sit in the upper half; stems end near (50, 94) so
 *   arrangements converge naturally into a wrap.
 * - The tintable part uses `currentColor`. Shading is a black or white overlay at low
 *   opacity, so it reads correctly whatever color the user picks.
 * - Light-colored parts get a faint dark outline so they stay visible on white canvases.
 * - Asset ids are persisted in saved bouquets — never rename or remove one.
 */

const STEM = '#4F7D4E';
const LEAF = '#6E9B5C';
const LEAF_LIGHT = '#8DB57A';
const VEIN = '#3F6640';
const OUTLINE = 'stroke="#000" stroke-opacity=".14" stroke-width=".8"';

const r2 = (n: number) => Math.round(n * 100) / 100;

const stem = (d: string, width = 3.2, color = STEM) =>
  `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round"/>`;

const leaf = (x: number, y: number, rotate: number, scale = 1, color = LEAF) =>
  `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">` +
  `<path d="M0 0 C6 -9 20 -11 29 -4 C20 3 8 5 0 0Z" fill="${color}"/>` +
  `<path d="M1.5 -0.6 C9 -4 18 -5 27 -4" stroke="${VEIN}" stroke-width=".9" fill="none" opacity=".55"/></g>`;

/** Repeat a petal path around a center point. */
const radial = (n: number, cx: number, cy: number, d: string, attrs: string, offset = 0) =>
  Array.from({ length: n }, (_, i) =>
    `<path d="${d}" transform="translate(${cx} ${cy}) rotate(${r2(offset + (i * 360) / n)})" ${attrs}/>`
  ).join('');

/** A scalloped (ruffled) disc, used for carnations and peonies. */
const scallop = (cx: number, cy: number, rOuter: number, rInner: number, n: number, ry = 1) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const am = ((i - 0.5) / n) * Math.PI * 2;
    const x = r2(cx + Math.cos(a) * rInner);
    const y = r2(cy + Math.sin(a) * rInner * ry);
    const qx = r2(cx + Math.cos(am) * rOuter);
    const qy = r2(cy + Math.sin(am) * rOuter * ry);
    d += i === 0 ? `M${x} ${y}` : ` Q${qx} ${qy} ${x} ${y}`;
  }
  return d + 'Z';
};

/** Small five-petal blossom (cherry blossom, forget-me-not, baby's breath). */
const blossom = (x: number, y: number, s: number, center = '#F6C453', notch = false) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  radial(
    5, 0, 0,
    notch ? 'M0 -1 C-3.2 -3 -3.6 -7.5 -1.2 -8.6 L0 -7.4 L1.2 -8.6 C3.6 -7.5 3.2 -3 0 -1Z' : 'M0 -1 C-3.4 -3 -3.6 -7.5 0 -8.6 C3.6 -7.5 3.4 -3 0 -1Z',
    `fill="currentColor" ${OUTLINE}`
  ) +
  `<circle r="2" fill="${center}"/></g>`;

export const SEEDED_ASSETS: Asset[] = [
  // ───────────────────────── FLOWERS ─────────────────────────
  {
    id: 'flower-rose',
    category: 'flower',
    name: 'Garden Rose',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48',
    svgMarkup: `
      ${stem('M50 50 C50 64 49 80 50 94')}
      ${leaf(50, 70, -155, 0.95)}
      ${leaf(50, 79, -25, 0.85, LEAF_LIGHT)}
      <path d="M41 49 L50 45 L59 49 L55 54 L45 54Z" fill="${STEM}"/>
      <path d="M27 33 C25 17 40 11 50 15 C60 11 75 17 73 33 C71 47 61 53 50 53 C39 53 29 47 27 33Z" fill="currentColor"/>
      <path d="M29 37 C33 49 43 53 50 53 C57 53 67 49 71 37 C65 46 57 48 50 48 C43 48 35 46 29 37Z" fill="#000" opacity=".16"/>
      <path d="M35 30 C35 20 45 17 50 21 C55 17 65 20 65 30 C65 40 57 44 50 44 C43 44 35 40 35 30Z" fill="currentColor"/>
      <path d="M35 30 C35 20 45 17 50 21 C55 17 65 20 65 30 C65 40 57 44 50 44 C43 44 35 40 35 30Z" fill="#000" opacity=".1"/>
      <path d="M44 31 C43 25 49 22 53 25 C56 28 54 33 50 33" stroke="#000" stroke-opacity=".22" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M39 33 C41 39 48 41 55 38 C59 36 61 31 59 27" stroke="#000" stroke-opacity=".16" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M27 33 C29 45 38 51 45 52 C39 46 35 38 37 29Z" fill="currentColor"/>
      <path d="M73 33 C71 45 62 51 55 52 C61 46 65 38 63 29Z" fill="#000" opacity=".12"/>
      <path d="M32 25 C34 19 39 16 44 16" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-tulip',
    category: 'flower',
    name: 'Spring Tulip',
    viewBox: '0 0 100 100',
    defaultColor: '#EC4899',
    svgMarkup: `
      ${stem('M50 46 C50 62 50 80 50 94')}
      <path d="M50 92 C39 82 33 67 35 51 C42 61 48 74 50 92Z" fill="${LEAF}"/>
      <path d="M50 93 C60 84 66 73 64 60 C58 70 53 80 50 93Z" fill="${LEAF_LIGHT}"/>
      <path d="M41 22 C44 14 50 9 50 9 C50 9 56 14 59 22 C61 34 57 45 50 47 C43 45 39 34 41 22Z" fill="currentColor"/>
      <path d="M41 22 C44 14 50 9 50 9 C50 9 56 14 59 22 C61 34 57 45 50 47 C43 45 39 34 41 22Z" fill="#000" opacity=".2"/>
      <path d="M50 47 C39 47 32 39 32 27 C32 20 35 15 37.5 13 C42 21 48 30 50 47Z" fill="currentColor"/>
      <path d="M50 47 C61 47 68 39 68 27 C68 20 65 15 62.5 13 C58 21 52 30 50 47Z" fill="currentColor"/>
      <path d="M50 47 C61 47 68 39 68 27 C68 20 65 15 62.5 13 C58 21 52 30 50 47Z" fill="#000" opacity=".1"/>
      <path d="M36 22 C36 18 37 16 38 15" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-sunflower',
    category: 'flower',
    name: 'Golden Sunflower',
    viewBox: '0 0 100 100',
    defaultColor: '#EAB308',
    svgMarkup: `
      ${stem('M50 50 C50 66 51 80 50 94', 4)}
      ${leaf(50, 66, -160, 1.15)}
      ${leaf(51, 76, -15, 1.05, LEAF_LIGHT)}
      ${radial(16, 50, 32, 'M0 -9 C-4.5 -13 -4.5 -21 0 -25 C4.5 -21 4.5 -13 0 -9Z', 'fill="currentColor"', 11.25)}
      ${radial(16, 50, 32, 'M0 -9 C-4.5 -13 -4.5 -21 0 -25 C4.5 -21 4.5 -13 0 -9Z', 'fill="currentColor"')}
      ${radial(16, 50, 32, 'M0 -9 C-4.5 -13 -4.5 -21 0 -25 C4.5 -21 4.5 -13 0 -9Z', 'fill="#000" opacity=".1"', 11.25)}
      <circle cx="50" cy="32" r="11" fill="#5B3A1E"/>
      <circle cx="50" cy="32" r="7.5" fill="#3F2714"/>
      ${radial(10, 50, 32, 'M0 -9 m-.9 0 a.9 .9 0 1 0 1.8 0 a.9 .9 0 1 0 -1.8 0', 'fill="#8A5A2E"')}
      ${radial(7, 50, 32, 'M0 -4.5 m-.8 0 a.8 .8 0 1 0 1.6 0 a.8 .8 0 1 0 -1.6 0', 'fill="#6B4423"', 20)}
      <path d="M44 27 C46 25 48 24 50 24" stroke="#fff" stroke-opacity=".25" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-daisy',
    category: 'flower',
    name: 'Cheerful Daisy',
    viewBox: '0 0 100 100',
    defaultColor: '#FFFFFF',
    svgMarkup: `
      ${stem('M50 44 C51 60 49 78 50 94', 2.6)}
      ${leaf(50, 74, -150, 0.8)}
      ${radial(16, 50, 30, 'M0 -5 C-3.4 -8 -3.6 -19 0 -21 C3.6 -19 3.4 -8 0 -5Z', `fill="currentColor" ${OUTLINE}`, 11.25)}
      ${radial(16, 50, 30, 'M0 -5 C-3.4 -8 -3.6 -19 0 -21 C3.6 -19 3.4 -8 0 -5Z', `fill="currentColor" ${OUTLINE}`)}
      <circle cx="50" cy="30" r="6.5" fill="#F2B632"/>
      <circle cx="50" cy="30" r="6.5" fill="#000" opacity=".06"/>
      <circle cx="48" cy="28" r="2.4" fill="#FFD66B"/>
    `
  },
  {
    id: 'flower-lavender',
    category: 'flower',
    name: 'Sweet Lavender',
    viewBox: '0 0 100 100',
    defaultColor: '#A855F7',
    svgMarkup: `
      ${stem('M50 10 C50 40 49 70 50 94', 2.4)}
      ${leaf(50, 80, -165, 0.75, LEAF_LIGHT)}
      ${leaf(50, 86, -15, 0.7)}
      ${Array.from({ length: 11 }, (_, i) => {
        const y = 12 + i * 4.3;
        const s = 0.7 + i * 0.035;
        const side = i % 2 === 0 ? -1 : 1;
        return `<ellipse cx="${r2(50 + side * 3.4 * s)}" cy="${r2(y)}" rx="${r2(3 * s)}" ry="${r2(4.4 * s)}" transform="rotate(${side * 28} ${r2(50 + side * 3.4 * s)} ${r2(y)})" fill="currentColor"/>` +
          `<ellipse cx="${r2(50 - side * 2.6 * s)}" cy="${r2(y + 2)}" rx="${r2(2.6 * s)}" ry="${r2(3.8 * s)}" transform="rotate(${-side * 28} ${r2(50 - side * 2.6 * s)} ${r2(y + 2)})" fill="currentColor"/>` +
          `<ellipse cx="${r2(50 - side * 2.6 * s)}" cy="${r2(y + 2)}" rx="${r2(2.6 * s)}" ry="${r2(3.8 * s)}" transform="rotate(${-side * 28} ${r2(50 - side * 2.6 * s)} ${r2(y + 2)})" fill="#000" opacity=".16"/>`;
      }).join('')}
      <ellipse cx="50" cy="9" rx="2" ry="3" fill="currentColor"/>
    `
  },
  {
    id: 'flower-orchid',
    category: 'flower',
    name: 'Exotic Orchid',
    viewBox: '0 0 100 100',
    defaultColor: '#D946EF',
    svgMarkup: `
      ${stem('M50 94 C50 80 57 64 52 50', 2.6)}
      ${leaf(50, 88, -170, 1.1)}
      ${leaf(50, 90, -8, 1, LEAF_LIGHT)}
      <path d="M50 36 C46 26 46 14 50 9 C54 14 54 26 50 36Z" fill="currentColor"/>
      <path d="M50 36 C42 40 30 46 26 54 C34 54 44 46 50 36Z" fill="currentColor"/>
      <path d="M50 36 C58 40 70 46 74 54 C66 54 56 46 50 36Z" fill="currentColor"/>
      <path d="M50 36 C58 40 70 46 74 54 C66 54 56 46 50 36Z" fill="#000" opacity=".1"/>
      <path d="M50 36 C40 34 26 26 24 18 C32 14 46 22 50 36Z" fill="currentColor"/>
      <path d="M50 36 C60 34 74 26 76 18 C68 14 54 22 50 36Z" fill="currentColor"/>
      <path d="M50 36 C60 34 74 26 76 18 C68 14 54 22 50 36Z" fill="#000" opacity=".08"/>
      <path d="M50 33 C44 36 42 44 46 49 C48 51 52 51 54 49 C58 44 56 36 50 33Z" fill="currentColor"/>
      <path d="M50 33 C44 36 42 44 46 49 C48 51 52 51 54 49 C58 44 56 36 50 33Z" fill="#000" opacity=".28"/>
      <path d="M47 42 C48 45 52 45 53 42" stroke="#fff" stroke-opacity=".55" stroke-width="1" fill="none"/>
      <circle cx="50" cy="36.5" r="2.4" fill="#F6C453"/>
      <path d="M29 19 C33 18 38 20 41 23" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-lily',
    category: 'flower',
    name: 'Stargazer Lily',
    viewBox: '0 0 100 100',
    defaultColor: '#F43F5E',
    svgMarkup: `
      ${stem('M50 44 C49 60 51 78 50 94')}
      ${leaf(50, 64, -150, 1.05)}
      ${leaf(50, 78, -30, 0.95, LEAF_LIGHT)}
      ${radial(3, 50, 30, 'M0 -3 C-7 -11 -6 -24 0 -30 C6 -24 7 -11 0 -3Z', 'fill="currentColor"', 60)}
      ${radial(3, 50, 30, 'M0 -3 C-7 -11 -6 -24 0 -30 C6 -24 7 -11 0 -3Z', 'fill="#000" opacity=".14"', 60)}
      ${radial(3, 50, 30, 'M0 -3 C-7 -11 -6 -24 0 -30 C6 -24 7 -11 0 -3Z', 'fill="currentColor"')}
      ${radial(6, 50, 30, 'M0 -5 L0 -22', 'stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"', 0)}
      ${radial(6, 50, 30, 'M-2 -11 m-.7 0 a.7 .7 0 1 0 1.4 0 a.7 .7 0 1 0 -1.4 0 M2.4 -15 m-.6 0 a.6 .6 0 1 0 1.2 0 a.6 .6 0 1 0 -1.2 0', 'fill="#7F1D1D" opacity=".55"')}
      ${radial(6, 50, 30, 'M0 0 L0 -13', 'stroke="#C9D98C" stroke-width="1" stroke-linecap="round"', 30)}
      ${radial(6, 50, 30, 'M-1.4 -13.5 a1.4 2.2 0 1 0 2.8 0 a1.4 2.2 0 1 0 -2.8 0', 'fill="#9A3412"', 30)}
    `
  },
  {
    id: 'flower-carnation',
    category: 'flower',
    name: 'Sweet Carnation',
    viewBox: '0 0 100 100',
    defaultColor: '#FB7185',
    svgMarkup: `
      ${stem('M50 50 C50 64 50 80 50 94', 2.6)}
      ${leaf(50, 72, -160, 0.85, LEAF_LIGHT)}
      ${leaf(50, 82, -20, 0.8)}
      <path d="M44 42 L56 42 L54 55 L46 55Z" fill="${STEM}"/>
      <path d="M44 42 L48 49 L50 42 L52 49 L56 42" fill="${LEAF}"/>
      <path d="${scallop(50, 30, 21, 17, 20, 0.82)}" fill="currentColor"/>
      <path d="${scallop(50, 33, 21, 17, 20, 0.6)}" fill="#000" opacity=".12"/>
      <path d="${scallop(50, 27, 15, 12, 16, 0.85)}" fill="currentColor"/>
      <path d="${scallop(50, 27, 15, 12, 16, 0.85)}" fill="#fff" opacity=".14"/>
      <path d="${scallop(50, 25, 9, 7, 12, 0.9)}" fill="currentColor"/>
      <path d="${scallop(50, 25, 9, 7, 12, 0.9)}" fill="#000" opacity=".08"/>
    `
  },
  {
    id: 'flower-hydrangea',
    category: 'flower',
    name: 'Blue Hydrangea',
    viewBox: '0 0 100 100',
    defaultColor: '#60A5FA',
    svgMarkup: `
      ${stem('M50 52 C50 66 49 80 50 94', 3.6)}
      ${leaf(50, 62, -150, 1.3)}
      ${leaf(50, 66, -30, 1.2, LEAF_LIGHT)}
      <ellipse cx="50" cy="33" rx="23" ry="20" fill="currentColor"/>
      <ellipse cx="50" cy="37" rx="22" ry="16" fill="#000" opacity=".12"/>
      ${[
        [38, 22], [50, 18], [62, 22], [32, 33], [44, 30], [56, 30], [68, 33],
        [38, 42], [50, 40], [62, 42], [44, 49], [56, 49], [50, 28.5],
      ].map(([x, y], i) =>
        `<g transform="translate(${x} ${y}) rotate(${(i * 23) % 90})">` +
        radial(4, 0, 0, 'M0 -.8 C-3.2 -2.6 -3.4 -6.2 0 -7 C3.4 -6.2 3.2 -2.6 0 -.8Z', `fill="currentColor" ${OUTLINE}`) +
        (i % 3 === 0 ? radial(4, 0, 0, 'M0 -.8 C-3.2 -2.6 -3.4 -6.2 0 -7 C3.4 -6.2 3.2 -2.6 0 -.8Z', 'fill="#fff" opacity=".18"') : '') +
        `<circle r="1" fill="#fff" opacity=".8"/></g>`
      ).join('')}
    `
  },
  {
    id: 'flower-peony',
    category: 'flower',
    name: 'Blush Peony',
    viewBox: '0 0 100 100',
    defaultColor: '#F9A8D4',
    svgMarkup: `
      ${stem('M50 52 C50 66 50 80 50 94', 3.2)}
      ${leaf(50, 64, -150, 1.15)}
      ${leaf(50, 72, -28, 1.05, LEAF_LIGHT)}
      ${radial(9, 50, 32, 'M0 -6 C-9 -9 -11 -20 0 -24 C11 -20 9 -9 0 -6Z', 'fill="currentColor"', 20)}
      ${radial(9, 50, 32, 'M0 -6 C-9 -9 -11 -20 0 -24 C11 -20 9 -9 0 -6Z', 'fill="#000" opacity=".1"', 20)}
      ${radial(8, 50, 31, 'M0 -3 C-7 -6 -8 -14 0 -17 C8 -14 7 -6 0 -3Z', 'fill="currentColor"')}
      ${radial(8, 50, 31, 'M0 -3 C-7 -6 -8 -14 0 -17 C8 -14 7 -6 0 -3Z', 'fill="#fff" opacity=".12"')}
      <path d="${scallop(50, 29, 11, 8.5, 12, 0.9)}" fill="currentColor"/>
      <path d="${scallop(50, 29, 11, 8.5, 12, 0.9)}" fill="#000" opacity=".1"/>
      <path d="${scallop(50, 28, 6, 4.5, 9, 0.9)}" fill="currentColor"/>
      <path d="${scallop(50, 28, 6, 4.5, 9, 0.9)}" fill="#fff" opacity=".2"/>
      <path d="M33 22 C36 16 42 13 47 13" stroke="#fff" stroke-opacity=".45" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-ranunculus',
    category: 'flower',
    name: 'Ranunculus',
    viewBox: '0 0 100 100',
    defaultColor: '#FB923C',
    svgMarkup: `
      ${stem('M50 50 C49 64 51 80 50 94', 2.8)}
      ${leaf(50, 74, -158, 0.9)}
      <circle cx="50" cy="31" r="19" fill="currentColor"/>
      <circle cx="50" cy="31" r="19" fill="#000" opacity=".14"/>
      ${[[17, 40], [14, 36], [11, 32], [8, 28.5], [5, 25.5]].map(([r, cy], i) =>
        `<path d="M${50 - r} ${cy - r * 0.35} C${50 - r} ${cy + r * 0.55} ${50 + r} ${cy + r * 0.55} ${50 + r} ${cy - r * 0.35} C${r2(50 + r * 0.5)} ${r2(cy + r * 0.05)} ${r2(50 - r * 0.5)} ${r2(cy + r * 0.05)} ${50 - r} ${cy - r * 0.35}Z" fill="currentColor"/>` +
        `<path d="M${50 - r} ${cy - r * 0.35} C${50 - r} ${cy + r * 0.55} ${50 + r} ${cy + r * 0.55} ${50 + r} ${cy - r * 0.35}" stroke="#000" stroke-opacity=".16" stroke-width=".9" fill="none"/>` +
        (i % 2 ? `<path d="M${50 - r} ${cy - r * 0.35} C${50 - r} ${cy + r * 0.55} ${50 + r} ${cy + r * 0.55} ${50 + r} ${cy - r * 0.35} C${r2(50 + r * 0.5)} ${r2(cy + r * 0.05)} ${r2(50 - r * 0.5)} ${r2(cy + r * 0.05)} ${50 - r} ${cy - r * 0.35}Z" fill="#fff" opacity=".1"/>` : '')
      ).join('')}
      <circle cx="50" cy="22" r="2.6" fill="#000" opacity=".2"/>
      <path d="M36 22 C39 17 44 15 49 15" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-poppy',
    category: 'flower',
    name: 'Red Poppy',
    viewBox: '0 0 100 100',
    defaultColor: '#EF4444',
    svgMarkup: `
      ${stem('M50 46 C52 60 47 76 50 94', 2.2)}
      ${leaf(49, 80, -160, 0.75, LEAF_LIGHT)}
      ${radial(4, 50, 30, 'M0 -2 C-14 -4 -17 -20 -6 -24 C-2 -26 2 -26 6 -24 C17 -20 14 -4 0 -2Z', 'fill="currentColor"', 45)}
      ${radial(4, 50, 30, 'M0 -2 C-14 -4 -17 -20 -6 -24 C-2 -26 2 -26 6 -24 C17 -20 14 -4 0 -2Z', 'fill="#000" opacity=".12"', 45)}
      ${radial(4, 50, 30, 'M0 -2 C-12 -4 -14 -18 -5 -21 C-2 -22 2 -22 5 -21 C14 -18 12 -4 0 -2Z', 'fill="currentColor"')}
      ${radial(4, 50, 30, 'M-3 -8 C-5 -12 -5 -15 -4 -17 M3 -9 C5 -12 5 -15 4 -17', 'stroke="#000" stroke-opacity=".14" stroke-width=".9" fill="none"')}
      <circle cx="50" cy="30" r="7" fill="#1F1B16"/>
      ${radial(14, 50, 30, 'M0 -7 L0 -9.5', 'stroke="#1F1B16" stroke-width="1" stroke-linecap="round"')}
      <circle cx="50" cy="30" r="3.4" fill="#4D5A3A"/>
      ${radial(6, 50, 30, 'M0 0 L0 -3.4', 'stroke="#1F1B16" stroke-width=".6"')}
    `
  },
  {
    id: 'flower-cosmos',
    category: 'flower',
    name: 'Pink Cosmos',
    viewBox: '0 0 100 100',
    defaultColor: '#F472B6',
    svgMarkup: `
      ${stem('M50 44 C48 60 52 78 50 94', 2)}
      <path d="M50 78 C44 74 40 70 38 64 M50 78 C42 78 37 76 33 72 M50 82 C56 78 60 74 62 68 M50 82 C58 82 63 80 67 76" stroke="${LEAF}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${radial(8, 50, 30, 'M0 -4 C-6 -7 -7 -18 -4 -21 L-2 -19 L0 -21.5 L2 -19 L4 -21 C7 -18 6 -7 0 -4Z', 'fill="currentColor"', 22.5)}
      ${radial(8, 50, 30, 'M0 -5 L0 -18', 'stroke="#000" stroke-opacity=".12" stroke-width=".9"', 22.5)}
      ${radial(8, 50, 30, 'M0 -4 C-6 -7 -7 -18 -4 -21 L-2 -19 L0 -21.5 L2 -19 L4 -21 C7 -18 6 -7 0 -4Z', 'fill="#fff" opacity=".1"', 22.5)}
      <circle cx="50" cy="30" r="5.5" fill="#E9A92A"/>
      ${radial(10, 50, 30, 'M0 -2.5 m-.6 0 a.6 .6 0 1 0 1.2 0 a.6 .6 0 1 0 -1.2 0', 'fill="#B7791F"')}
    `
  },
  {
    id: 'flower-gerbera',
    category: 'flower',
    name: 'Gerbera Daisy',
    viewBox: '0 0 100 100',
    defaultColor: '#F97316',
    svgMarkup: `
      ${stem('M50 46 C50 62 50 78 50 94', 2.8)}
      ${leaf(50, 84, -170, 1)}
      ${leaf(50, 86, -10, 0.95, LEAF_LIGHT)}
      ${radial(22, 50, 30, 'M0 -7 C-2.6 -10 -2.8 -21 0 -23 C2.8 -21 2.6 -10 0 -7Z', 'fill="currentColor"', 8)}
      ${radial(22, 50, 30, 'M0 -7 C-2.6 -10 -2.8 -21 0 -23 C2.8 -21 2.6 -10 0 -7Z', 'fill="#000" opacity=".12"', 8)}
      ${radial(22, 50, 30, 'M0 -6 C-2.2 -9 -2.4 -18 0 -20 C2.4 -18 2.2 -9 0 -6Z', 'fill="currentColor"')}
      ${radial(22, 50, 30, 'M0 -8 L0 -16', 'stroke="#fff" stroke-opacity=".3" stroke-width=".7"')}
      <circle cx="50" cy="30" r="8" fill="#000" opacity=".25"/>
      <circle cx="50" cy="30" r="6.5" fill="#3F3A1E"/>
      <circle cx="50" cy="30" r="3.6" fill="#7A8C3C"/>
    `
  },
  {
    id: 'flower-calla',
    category: 'flower',
    name: 'Calla Lily',
    viewBox: '0 0 100 100',
    defaultColor: '#FCE7F3',
    svgMarkup: `
      ${stem('M50 50 C50 66 50 80 50 94', 3)}
      <path d="M50 94 C42 86 38 74 40 62 C45 70 49 80 50 94Z" fill="${LEAF}"/>
      <path d="M50 52 C40 44 34 30 36 16 C46 18 58 22 64 30 C66 40 60 48 50 52Z" fill="currentColor" ${OUTLINE}/>
      <path d="M50 52 C56 46 62 38 64 30 C60 36 54 40 48 42 C50 46 50 49 50 52Z" fill="#000" opacity=".1"/>
      <path d="M36 16 C46 18 58 22 64 30 C58 26 50 25 44 27 C40 24 37 20 36 16Z" fill="#000" opacity=".12"/>
      <path d="M48 44 C47 38 47 32 50 26" stroke="#F2B632" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M39 22 C40 30 43 38 48 46" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'flower-cherry-blossom',
    category: 'flower',
    name: 'Cherry Blossom',
    viewBox: '0 0 100 100',
    defaultColor: '#FBCFE8',
    svgMarkup: `
      <path d="M50 94 C48 76 44 60 34 44 M44 60 C52 50 60 40 62 26 M38 50 C30 44 24 36 22 26" stroke="#6B4A3A" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M62 26 C63 22 64 18 66 15" stroke="#6B4A3A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${leaf(57, 36, -40, 0.45, LEAF_LIGHT)}
      ${blossom(34, 42, 1.25, '#E879A0', true)}
      ${blossom(62, 26, 1.35, '#E879A0', true)}
      ${blossom(22, 26, 1.1, '#E879A0', true)}
      ${blossom(48, 30, 0.9, '#E879A0', true)}
      ${blossom(52, 54, 1, '#E879A0', true)}
      <ellipse cx="66" cy="14" rx="2.2" ry="3" fill="currentColor" ${OUTLINE}/>
      <ellipse cx="28" cy="52" rx="2" ry="2.8" transform="rotate(-30 28 52)" fill="currentColor" ${OUTLINE}/>
    `
  },
  {
    id: 'flower-forget-me-not',
    category: 'flower',
    name: 'Forget-me-not',
    viewBox: '0 0 100 100',
    defaultColor: '#60A5FA',
    svgMarkup: `
      <path d="M50 94 C50 74 50 56 50 40 M50 56 C42 48 38 40 36 30 M50 50 C58 44 62 36 64 26 M50 40 C48 32 50 24 52 18" stroke="${STEM}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${leaf(50, 76, -160, 0.75)}
      ${leaf(50, 84, -20, 0.7, LEAF_LIGHT)}
      ${[[36, 28, 1], [44, 34, 0.85], [64, 24, 1], [57, 32, 0.8], [52, 16, 0.95], [44, 20, 0.8], [60, 14, 0.7], [30, 38, 0.75], [68, 34, 0.7]]
        .map(([x, y, s]) => blossom(x, y, s * 0.85, '#FACC15')).join('')}
    `
  },

  // ───────────────────────── GREENERY ─────────────────────────
  {
    id: 'filler-eucalyptus',
    category: 'filler',
    name: 'Eucalyptus',
    viewBox: '0 0 100 100',
    defaultColor: '#7C9A92',
    svgMarkup: `
      <path d="M50 94 C50 70 47 40 52 8" stroke="#6B5B4E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${[[12, 7, 1], [22, 8, 0.95], [33, 9, 0.9], [44, 10, 0.85], [56, 10.5, 0.8], [68, 10.5, 0.72]].map(([y, r, s], i) => {
        const cx = 50 + (i % 2 === 0 ? -1 : 1) * 1 * (i * 0.2);
        return `<g transform="translate(${r2(cx)} ${y})">` +
          `<circle cx="${r2(-r * s)}" cy="0" r="${r2(r * s)}" fill="currentColor"/>` +
          `<circle cx="${r2(r * s)}" cy="1.5" r="${r2(r * s)}" fill="currentColor"/>` +
          `<circle cx="${r2(r * s)}" cy="1.5" r="${r2(r * s)}" fill="#000" opacity=".1"/>` +
          `<path d="M${r2(-r * s * 1.7)} -1 Q${r2(-r * s)} -${r2(r * s * 0.7)} ${r2(-r * s * 0.3)} -1" stroke="#fff" stroke-opacity=".35" stroke-width="1" fill="none"/></g>`;
      }).join('')}
      <circle cx="52" cy="6" r="3.2" fill="currentColor"/>
    `
  },
  {
    id: 'filler-babysbreath',
    category: 'filler',
    name: "Baby's Breath",
    viewBox: '0 0 100 100',
    defaultColor: '#FFFFFF',
    svgMarkup: `
      <path d="M50 94 C50 74 50 60 50 50 M50 60 C42 50 34 42 26 30 M50 56 C58 46 66 38 74 28 M50 50 C48 40 46 30 44 18 M50 50 C54 40 58 28 60 16 M38 44 C34 40 30 38 24 40 M62 42 C68 40 72 40 78 44 M44 32 C40 28 36 26 32 22 M58 30 C62 26 66 24 70 20" stroke="${STEM}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${[[26, 30], [74, 28], [44, 18], [60, 16], [24, 40], [78, 44], [32, 22], [70, 20], [38, 26], [52, 24], [66, 34], [34, 34], [50, 12], [56, 36], [42, 38]]
        .map(([x, y], i) => `<g transform="translate(${x} ${y}) scale(${0.62 + (i % 3) * 0.1})">` +
          radial(5, 0, 0, 'M0 0 m-2 -2.5 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0', `fill="currentColor" ${OUTLINE}`) +
          `<circle r="1.1" fill="#E9E3C9"/></g>`).join('')}
    `
  },
  {
    id: 'filler-fern',
    category: 'filler',
    name: 'Forest Fern',
    viewBox: '0 0 100 100',
    defaultColor: '#4D8B55',
    svgMarkup: `
      <path d="M50 94 C50 70 49 40 52 8" stroke="${VEIN}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${Array.from({ length: 13 }, (_, i) => {
        const y = 84 - i * 5.8;
        const len = 18 - i * 1.1;
        const x = 50 + i * 0.15;
        return [-1, 1].map(side =>
          `<path d="M${r2(x)} ${r2(y)} C${r2(x + side * len * 0.4)} ${r2(y - 5)} ${r2(x + side * len * 0.85)} ${r2(y - 5)} ${r2(x + side * len)} ${r2(y - 3)} C${r2(x + side * len * 0.7)} ${r2(y + 0.5)} ${r2(x + side * len * 0.3)} ${r2(y + 1)} ${r2(x)} ${r2(y)}Z" fill="currentColor"${side > 0 ? '' : ''}/>` +
          (side > 0 ? `<path d="M${r2(x)} ${r2(y)} C${r2(x + len * 0.4)} ${r2(y - 5)} ${r2(x + len * 0.85)} ${r2(y - 5)} ${r2(x + len)} ${r2(y - 3)} C${r2(x + len * 0.7)} ${r2(y + 0.5)} ${r2(x + len * 0.3)} ${r2(y + 1)} ${r2(x)} ${r2(y)}Z" fill="#000" opacity=".12"/>` : '')
        ).join('');
      }).join('')}
    `
  },
  {
    id: 'filler-dustymiller',
    category: 'filler',
    name: 'Dusty Miller',
    viewBox: '0 0 100 100',
    defaultColor: '#A8B5B2',
    svgMarkup: `
      <path d="M50 94 C50 72 50 50 50 14" stroke="#8A9693" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${[[76, -150, 1.15], [70, -30, 1.1], [56, -145, 1], [50, -35, 0.95], [36, -140, 0.85], [30, -40, 0.8], [18, -120, 0.65], [16, -60, 0.6]].map(([y, rot, s]) =>
        `<g transform="translate(50 ${y}) rotate(${rot}) scale(${s})">` +
        `<path d="M0 0 C3 -6 7 -9 10 -7 C12 -11 17 -11 19 -7 C22 -9 27 -7 28 -3 C30 0 26 3 22 2 C20 5 15 6 13 3 C10 6 5 5 4 2 C2 2 1 1 0 0Z" fill="currentColor"/>` +
        `<path d="M1 -.5 L26 -3" stroke="#fff" stroke-opacity=".5" stroke-width=".9" fill="none"/></g>`
      ).join('')}
      <path d="M44 14 C46 8 54 8 56 14 C54 18 46 18 44 14Z" fill="currentColor"/>
    `
  },
  {
    id: 'filler-olive',
    category: 'filler',
    name: 'Olive Branch',
    viewBox: '0 0 100 100',
    defaultColor: '#7D8F69',
    svgMarkup: `
      <path d="M50 94 C48 70 52 40 46 10" stroke="#6B5B4E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${[[82, -165], [76, -15], [68, -160], [62, -20], [54, -155], [48, -25], [40, -150], [34, -30], [26, -140], [20, -40], [13, -110]].map(([y, rot], i) =>
        `<g transform="translate(${r2(49 - i * 0.2)} ${y}) rotate(${rot}) scale(${r2(1 - i * 0.04)})">` +
        `<path d="M0 0 C6 -3.5 16 -4 24 -1 C16 2.5 6 2.5 0 0Z" fill="currentColor"/>` +
        (i % 2 ? `<path d="M0 0 C6 -3.5 16 -4 24 -1 C16 2.5 6 2.5 0 0Z" fill="#000" opacity=".12"/>` : '') +
        `<path d="M1 0 L22 -1" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/></g>`
      ).join('')}
      <ellipse cx="56" cy="58" rx="2.8" ry="3.6" fill="#3F3F46"/>
      <ellipse cx="42" cy="44" rx="2.6" ry="3.4" fill="#4B5320"/>
      <ellipse cx="55" cy="30" rx="2.4" ry="3.2" fill="#3F3F46"/>
      <circle cx="55" cy="57" r=".8" fill="#fff" opacity=".5"/>
    `
  },
  {
    id: 'filler-monstera',
    category: 'filler',
    name: 'Monstera Leaf',
    viewBox: '0 0 100 100',
    defaultColor: '#2F855A',
    svgMarkup: `
      ${stem('M50 94 C50 82 50 70 50 60', 2.6, VEIN)}
      ${[
        'M50 58 C44 58 36 56 30 52 C34 50 40 50 49 54Z',
        'M50 50 C42 50 28 46 22 40 C28 36 40 38 49 46Z',
        'M50 40 C42 38 28 32 24 24 C32 22 42 26 49 36Z',
        'M50 30 C44 26 34 18 34 10 C42 10 48 18 50 26Z',
      ].map(d => `<path d="${d}" fill="currentColor"/><path d="${d}" fill="currentColor" transform="translate(100 0) scale(-1 1)"/><path d="${d}" fill="#000" opacity=".12" transform="translate(100 0) scale(-1 1)"/>`).join('')}
      <path d="M50 30 C47 22 48 14 50 8 C52 14 53 22 50 30Z" fill="currentColor"/>
      <path d="M50 60 C50 44 50 28 50 9" stroke="${VEIN}" stroke-width="1.4" fill="none" opacity=".7"/>
      <path d="M30 46 C30 44 31 42 33 41" stroke="#fff" stroke-opacity=".3" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'filler-wheat',
    category: 'filler',
    name: 'Golden Wheat',
    viewBox: '0 0 100 100',
    defaultColor: '#D4A24C',
    svgMarkup: `
      <path d="M50 94 C50 74 50 52 50 40 M46 94 C44 76 40 60 36 46 M54 94 C56 76 60 60 64 46" stroke="#B88A3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      ${[[50, 40, 0], [36, 46, -14], [64, 46, 14]].map(([x, y, rot]) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        Array.from({ length: 7 }, (_, i) => {
          const gy = -i * 4.2;
          return `<ellipse cx="-2.3" cy="${r2(gy - 2)}" rx="2.2" ry="3.6" transform="rotate(-22 -2.3 ${r2(gy - 2)})" fill="currentColor"/>` +
            `<ellipse cx="2.3" cy="${r2(gy - 3.5)}" rx="2.2" ry="3.6" transform="rotate(22 2.3 ${r2(gy - 3.5)})" fill="currentColor"/>` +
            `<ellipse cx="2.3" cy="${r2(gy - 3.5)}" rx="2.2" ry="3.6" transform="rotate(22 2.3 ${r2(gy - 3.5)})" fill="#000" opacity=".1"/>` +
            `<path d="M-3 ${r2(gy - 4.5)} L-7 ${r2(gy - 12)} M3 ${r2(gy - 6)} L7 ${r2(gy - 13)}" stroke="currentColor" stroke-width=".6"/>`;
        }).join('') +
        `<ellipse cx="0" cy="-31" rx="1.8" ry="3" fill="currentColor"/></g>`
      ).join('')}
    `
  },

  // ───────────────────────── WRAPS & VASES ─────────────────────────
  {
    id: 'wrapper-paper',
    category: 'wrapper',
    name: 'Kraft Paper Wrap',
    viewBox: '0 0 100 100',
    defaultColor: '#C8955C',
    svgMarkup: `
      <path d="M16 20 Q50 12 84 20 L58 96 L42 96Z" fill="currentColor"/>
      <path d="M16 20 Q50 12 84 20 L58 96 L42 96Z" fill="#000" opacity=".22"/>
      <path d="M16 20 Q50 12 84 20 Q50 27 16 20Z" fill="#000" opacity=".14"/>
      <path d="M6 26 Q28 35 53 30 L46 96 L42 96Z" fill="currentColor"/>
      <path d="M94 26 Q72 35 47 30 L54 96 L58 96Z" fill="currentColor"/>
      <path d="M94 26 Q72 35 47 30 L54 96 L58 96Z" fill="#000" opacity=".1"/>
      <path d="M6 26 Q28 35 53 30" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/>
      <path d="M94 26 Q72 35 47 30" stroke="#fff" stroke-opacity=".25" stroke-width="1.2" fill="none"/>
      <path d="M24 44 L40 92 M76 44 L60 92" stroke="#000" stroke-opacity=".08" stroke-width="1"/>
      <path d="M38 70 Q50 74 62 70" stroke="#7A5230" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M50 72 C44 66 40 68 42 72 C44 76 48 74 50 72 C52 74 56 76 58 72 C60 68 56 66 50 72Z" fill="none" stroke="#7A5230" stroke-width="1.8"/>
      <path d="M49 73 L46 82 M51 73 L54 82" stroke="#7A5230" stroke-width="1.6" stroke-linecap="round"/>
    `
  },
  {
    id: 'wrapper-pleated',
    category: 'wrapper',
    name: 'Pleated Paper',
    viewBox: '0 0 100 100',
    defaultColor: '#F5D0C5',
    svgMarkup: `
      ${[
        ['M10 14 L22 10 L46 96 L42 96Z', 0.16], ['M22 10 L36 8 L47 96 L46 96Z', 0],
        ['M36 8 L50 6 L50 96 L47 96Z', 0.1], ['M50 6 L64 8 L53 96 L50 96Z', 0],
        ['M64 8 L78 10 L54 96 L53 96Z', 0.12], ['M78 10 L90 14 L58 96 L54 96Z', 0.2],
      ].map(([d, o]) => `<path d="${d}" fill="currentColor" ${OUTLINE}/>${o ? `<path d="${d}" fill="#000" opacity="${o}"/>` : ''}`).join('')}
      <path d="M10 14 Q16 8 22 10 Q29 4 36 8 Q43 2 50 6 Q57 2 64 8 Q71 4 78 10 Q84 8 90 14" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" fill="none"/>
      <path d="M38 66 Q50 71 62 66 L60 74 Q50 78 40 74Z" fill="#FFFFFF" ${OUTLINE}/>
      <path d="M50 70 C42 62 36 64 38 70 C40 76 46 74 50 70 C54 74 60 76 62 70 C64 64 58 62 50 70Z" fill="#FFFFFF" ${OUTLINE}/>
      <circle cx="50" cy="70" r="2.6" fill="#F3F0EA" ${OUTLINE}/>
    `
  },
  {
    id: 'wrapper-vase',
    category: 'wrapper',
    name: 'Glass Vase',
    viewBox: '0 0 100 100',
    defaultColor: '#7DD3FC',
    svgMarkup: `
      <path d="M44 10 L44 60 M50 8 L50 60 M56 10 L56 60" stroke="${STEM}" stroke-width="1.6" opacity=".55"/>
      <path d="M30 22 C30 16 70 16 70 22 C70 30 64 34 66 46 C68 60 76 70 74 82 C72 92 62 96 50 96 C38 96 28 92 26 82 C24 70 32 60 34 46 C36 34 30 30 30 22Z" fill="currentColor" opacity=".28"/>
      <path d="M33 50 C40 52 60 52 67 50 C69 62 76 70 74 82 C72 92 62 96 50 96 C38 96 28 92 26 82 C24 70 31 62 33 50Z" fill="currentColor" opacity=".38"/>
      <path d="M30 22 C30 16 70 16 70 22 C70 30 64 34 66 46 C68 60 76 70 74 82 C72 92 62 96 50 96 C38 96 28 92 26 82 C24 70 32 60 34 46 C36 34 30 30 30 22Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <path d="M30 22 C30 16 70 16 70 22 C70 27 30 27 30 22Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <path d="M33 50 C40 52 60 52 67 50" stroke="#fff" stroke-opacity=".7" stroke-width="1" fill="none"/>
      <path d="M36 30 C38 40 34 50 31 62 C29 70 30 80 34 88" stroke="#fff" stroke-opacity=".75" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M64 64 C66 70 67 76 66 82" stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    `
  },
  {
    id: 'wrapper-ribbon-only',
    category: 'wrapper',
    name: 'Ribbon-Tied Stems',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48',
    svgMarkup: `
      <path d="M50 4 L48 96 M44 6 L44 95 M56 6 L53 95 M38 8 L42 94 M62 8 L57 94" stroke="${STEM}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M41 58 L59 58 L58 66 L42 66Z" fill="currentColor"/>
      <path d="M41 62 L59 62 L58 66 L42 66Z" fill="#000" opacity=".15"/>
      <path d="M50 62 C40 52 28 52 30 60 C32 68 44 66 50 62Z" fill="currentColor"/>
      <path d="M50 62 C60 52 72 52 70 60 C68 68 56 66 50 62Z" fill="currentColor"/>
      <path d="M50 62 C60 52 72 52 70 60 C66 58 58 60 50 62Z" fill="#000" opacity=".15"/>
      <path d="M50 62 C40 52 28 52 30 60 C34 58 42 60 50 62Z" fill="#fff" opacity=".18"/>
      <path d="M48 64 L40 84 L44 82 L46 86 L51 66Z M52 64 L60 84 L56 82 L54 86 L49 66Z" fill="currentColor"/>
      <path d="M52 64 L60 84 L56 82 L54 86 L49 66Z" fill="#000" opacity=".12"/>
      <ellipse cx="50" cy="62" rx="4" ry="3.4" fill="currentColor"/>
      <ellipse cx="50" cy="62" rx="4" ry="3.4" fill="#000" opacity=".2"/>
    `
  },
  {
    id: 'wrapper-basket',
    category: 'wrapper',
    name: 'Woven Basket',
    viewBox: '0 0 100 100',
    defaultColor: '#B7834A',
    svgMarkup: `
      <path d="M22 50 C22 14 78 14 78 50" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M22 50 C22 14 78 14 78 50" stroke="#000" stroke-opacity=".2" stroke-width="5" stroke-dasharray="3 3" fill="none"/>
      <path d="M14 48 L86 48 L78 94 L22 94Z" fill="currentColor"/>
      ${[58, 68, 78, 88].map((y, i) => `<path d="M${r2(15 + i * 2)} ${y} L${r2(85 - i * 2)} ${y}" stroke="#000" stroke-opacity=".18" stroke-width="1.2"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => {
        const x = 20 + i * 7.5;
        return `<path d="M${x} 48 L${r2(x + (50 - x) * 0.08)} 94" stroke="#000" stroke-opacity=".14" stroke-width="1"/>` +
          [0, 1, 2, 3, 4].map(j => (i + j) % 2 ? `<rect x="${r2(x - 3.2)}" y="${49 + j * 9.4}" width="6.4" height="8" rx="1.6" fill="#fff" opacity=".1"/>` : '').join('');
      }).join('')}
      <rect x="11" y="44" width="78" height="8" rx="4" fill="currentColor"/>
      <rect x="11" y="44" width="78" height="8" rx="4" fill="#000" opacity=".18"/>
      <path d="M15 46 L85 46" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>
    `
  },
  {
    id: 'wrapper-pot',
    category: 'wrapper',
    name: 'Ceramic Pot',
    viewBox: '0 0 100 100',
    defaultColor: '#C2683F',
    svgMarkup: `
      <path d="M24 52 L76 52 L68 94 L32 94Z" fill="currentColor"/>
      <path d="M58 52 L76 52 L68 94 L56 94Z" fill="#000" opacity=".14"/>
      <rect x="18" y="42" width="64" height="13" rx="3" fill="currentColor"/>
      <rect x="18" y="49" width="64" height="6" rx="2" fill="#000" opacity=".14"/>
      <ellipse cx="50" cy="43" rx="30" ry="3" fill="#3B2A20"/>
      <path d="M32 60 C31 70 33 80 35 88" stroke="#fff" stroke-opacity=".3" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M38 72 Q50 66 62 72" stroke="#fff" stroke-opacity=".35" stroke-width="1.4" fill="none"/>
      <circle cx="50" cy="74" r="2" fill="#fff" opacity=".35"/>
    `
  },

  // ───────────────────────── EXTRAS ─────────────────────────
  {
    id: 'accessory-bow',
    category: 'accessory',
    name: 'Satin Bow',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48',
    svgMarkup: `
      <path d="M47 52 L32 86 L39 83 L42 90 L53 56Z" fill="currentColor"/>
      <path d="M53 52 L68 86 L61 83 L58 90 L47 56Z" fill="currentColor"/>
      <path d="M53 52 L68 86 L61 83 L58 90 L47 56Z" fill="#000" opacity=".15"/>
      <path d="M50 48 C38 30 16 26 14 40 C12 54 34 58 50 48Z" fill="currentColor"/>
      <path d="M50 48 C62 30 84 26 86 40 C88 54 66 58 50 48Z" fill="currentColor"/>
      <path d="M50 48 C38 40 24 38 20 42 C24 32 40 36 50 48Z" fill="#000" opacity=".18"/>
      <path d="M50 48 C62 40 76 38 80 42 C76 32 60 36 50 48Z" fill="#000" opacity=".22"/>
      <path d="M50 48 C62 30 84 26 86 40 C88 54 66 58 50 48Z" fill="#000" opacity=".08"/>
      <path d="M18 36 C22 32 28 32 34 35" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <rect x="44" y="41" width="12" height="14" rx="4" fill="currentColor"/>
      <rect x="44" y="41" width="12" height="14" rx="4" fill="#000" opacity=".2"/>
      <path d="M47 44 L47 52" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>
    `
  },
  {
    id: 'accessory-sparkles',
    category: 'accessory',
    name: 'Sparkles',
    viewBox: '0 0 100 100',
    defaultColor: '#FACC15',
    svgMarkup: `
      <path d="M50 18 C52 38 56 44 74 48 C56 52 52 58 50 78 C48 58 44 52 26 48 C44 44 48 38 50 18Z" fill="currentColor"/>
      <path d="M50 18 C52 38 56 44 74 48 L50 48Z" fill="#fff" opacity=".35"/>
      <path d="M24 16 C25 24 27 26 34 27 C27 28 25 30 24 38 C23 30 21 28 14 27 C21 26 23 24 24 16Z" fill="currentColor"/>
      <path d="M78 66 C79 73 81 75 87 76 C81 77 79 79 78 86 C77 79 75 77 69 76 C75 75 77 73 78 66Z" fill="currentColor"/>
      <circle cx="80" cy="22" r="2.6" fill="currentColor"/>
      <circle cx="22" cy="74" r="2" fill="currentColor"/>
      <circle cx="66" cy="88" r="1.6" fill="currentColor"/>
    `
  },
  {
    id: 'accessory-tag',
    category: 'accessory',
    name: 'Gift Tag',
    viewBox: '0 0 100 100',
    defaultColor: '#E8C99A',
    svgMarkup: `
      <path d="M28 30 C34 16 54 12 62 24" stroke="#8B5A2B" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <g transform="rotate(-14 50 55)">
        <path d="M30 36 L70 36 L70 80 L50 92 L30 80Z" fill="currentColor" ${OUTLINE}/>
        <path d="M30 36 L70 36 L70 42 L30 42Z" fill="#000" opacity=".08"/>
        <circle cx="50" cy="44" r="3.6" fill="#fff" ${OUTLINE}/>
        <path d="M50 74 C40 66 38 58 44 56 C47 55 49 57 50 59 C51 57 53 55 56 56 C62 58 60 66 50 74Z" fill="#E11D48"/>
        <path d="M44 59 C45 58 46 58 47 58.5" stroke="#fff" stroke-opacity=".6" stroke-width="1" fill="none" stroke-linecap="round"/>
      </g>
    `
  },
  {
    id: 'accessory-envelope',
    category: 'accessory',
    name: 'Love Letter',
    viewBox: '0 0 100 100',
    defaultColor: '#FDF6E3',
    svgMarkup: `
      <g transform="rotate(-8 50 50)">
        <rect x="18" y="30" width="64" height="44" rx="4" fill="currentColor" ${OUTLINE}/>
        <path d="M18 72 L44 52 M82 72 L56 52" stroke="#000" stroke-opacity=".12" stroke-width="1"/>
        <path d="M18 32 L50 56 L82 32" fill="currentColor" ${OUTLINE}/>
        <path d="M18 32 L50 56 L82 32 Z" fill="#000" opacity=".06"/>
        <circle cx="50" cy="55" r="7" fill="#B91C1C"/>
        <path d="M50 59 C46 56 45 53 47.5 52 C48.6 51.6 49.5 52.3 50 53.2 C50.5 52.3 51.4 51.6 52.5 52 C55 53 54 56 50 59Z" fill="#FCA5A5"/>
      </g>
    `
  },
  {
    id: 'accessory-heart-balloon',
    category: 'accessory',
    name: 'Heart Balloon',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48',
    svgMarkup: `
      <path d="M50 58 C46 68 54 76 48 86 C44 92 50 96 52 98" stroke="#94A3B8" stroke-width="1.2" fill="none"/>
      <path d="M50 58 C30 44 20 32 24 20 C28 8 44 8 50 20 C56 8 72 8 76 20 C80 32 70 44 50 58Z" fill="currentColor"/>
      <path d="M50 58 C62 50 72 40 75 30 C68 40 60 46 50 50Z" fill="#000" opacity=".14"/>
      <path d="M48 58 L52 58 L51 62 L49 62Z" fill="currentColor"/>
      <path d="M30 20 C32 14 38 12 42 15" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="27" r="1.6" fill="#fff" opacity=".55"/>
    `
  },
  {
    id: 'accessory-hearts',
    category: 'accessory',
    name: 'Floating Hearts',
    viewBox: '0 0 100 100',
    defaultColor: '#F472B6',
    svgMarkup: `
      ${[[50, 52, 1.5, 0], [24, 30, 0.9, -14], [76, 26, 1, 12], [30, 76, 0.7, -8], [74, 74, 0.75, 10]].map(([x, y, s, rot], i) =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity="${i === 0 ? 1 : 0.85}">` +
        `<path d="M0 10 C-14 1 -16 -9 -9 -12 C-5 -13.5 -1.5 -11 0 -8 C1.5 -11 5 -13.5 9 -12 C16 -9 14 1 0 10Z" fill="currentColor"/>` +
        `<path d="M0 10 C8 5 12 0 13 -5 C9 0 5 3 0 5Z" fill="#000" opacity=".14"/>` +
        `<path d="M-9 -7 C-8 -9 -6 -10 -4 -9.5" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`
      ).join('')}
    `
  },
  {
    id: 'accessory-butterfly',
    category: 'accessory',
    name: 'Butterfly',
    viewBox: '0 0 100 100',
    defaultColor: '#F97316',
    svgMarkup: `
      <g transform="rotate(-10 50 50)">
        <path d="M49 46 C40 26 18 20 16 34 C14 46 32 52 49 50Z" fill="currentColor"/>
        <path d="M51 46 C60 26 82 20 84 34 C86 46 68 52 51 50Z" fill="currentColor"/>
        <path d="M51 46 C60 26 82 20 84 34 C86 46 68 52 51 50Z" fill="#000" opacity=".1"/>
        <path d="M49 52 C38 54 26 62 30 72 C34 80 46 70 49 56Z" fill="currentColor"/>
        <path d="M51 52 C62 54 74 62 70 72 C66 80 54 70 51 56Z" fill="currentColor"/>
        <path d="M49 52 C38 54 26 62 30 72 C34 80 46 70 49 56Z" fill="#000" opacity=".18"/>
        <path d="M51 52 C62 54 74 62 70 72 C66 80 54 70 51 56Z" fill="#000" opacity=".24"/>
        <path d="M16 34 C18 26 26 24 32 28 C24 30 20 34 20 40Z M84 34 C82 26 74 24 68 28 C76 30 80 34 80 40Z" fill="#1F1B16" opacity=".75"/>
        <circle cx="26" cy="36" r="2.6" fill="#fff" opacity=".85"/>
        <circle cx="74" cy="36" r="2.6" fill="#fff" opacity=".85"/>
        <circle cx="36" cy="66" r="1.8" fill="#fff" opacity=".7"/>
        <circle cx="64" cy="66" r="1.8" fill="#fff" opacity=".7"/>
        <ellipse cx="50" cy="52" rx="2.4" ry="14" fill="#2B2420"/>
        <path d="M49 39 C46 32 42 28 38 26 M51 39 C54 32 58 28 62 26" stroke="#2B2420" stroke-width="1" fill="none" stroke-linecap="round"/>
        <circle cx="38" cy="26" r="1.3" fill="#2B2420"/>
        <circle cx="62" cy="26" r="1.3" fill="#2B2420"/>
      </g>
    `
  },
  {
    id: 'accessory-ladybug',
    category: 'accessory',
    name: 'Ladybug',
    viewBox: '0 0 100 100',
    defaultColor: '#DC2626',
    svgMarkup: `
      <g transform="rotate(20 50 50)">
        <path d="M36 70 L28 78 M36 56 L24 56 M38 42 L28 34 M64 70 L72 78 M64 56 L76 56 M62 42 L72 34" stroke="#1F1B16" stroke-width="2" stroke-linecap="round"/>
        <circle cx="50" cy="30" r="10" fill="#1F1B16"/>
        <circle cx="45" cy="27" r="2.2" fill="#fff"/>
        <circle cx="55" cy="27" r="2.2" fill="#fff"/>
        <path d="M46 21 C44 15 40 13 37 14 M54 21 C56 15 60 13 63 14" stroke="#1F1B16" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="58" rx="20" ry="24" fill="currentColor"/>
        <path d="M50 34 L50 82" stroke="#1F1B16" stroke-width="1.6"/>
        <path d="M50 34 C62 36 70 46 70 58 C70 70 62 80 50 82Z" fill="#000" opacity=".12"/>
        <circle cx="41" cy="48" r="4" fill="#1F1B16"/>
        <circle cx="60" cy="50" r="4.4" fill="#1F1B16"/>
        <circle cx="39" cy="66" r="3.6" fill="#1F1B16"/>
        <circle cx="61" cy="68" r="3.4" fill="#1F1B16"/>
        <path d="M36 42 C38 38 42 36 46 36" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </g>
    `
  },
  {
    id: 'accessory-bee',
    category: 'accessory',
    name: 'Honey Bee',
    viewBox: '0 0 100 100',
    defaultColor: '#FBBF24',
    svgMarkup: `
      <g transform="rotate(-12 50 50)">
        <ellipse cx="42" cy="34" rx="12" ry="16" transform="rotate(-30 42 34)" fill="#E0F2FE" opacity=".85" ${OUTLINE}/>
        <ellipse cx="58" cy="32" rx="11" ry="15" transform="rotate(25 58 32)" fill="#E0F2FE" opacity=".85" ${OUTLINE}/>
        <ellipse cx="50" cy="56" rx="22" ry="17" fill="currentColor"/>
        <path d="M40 41 C36 48 36 64 40 71 L46 72 C42 64 42 48 46 40Z M54 40 C58 48 58 64 54 72 L60 71 C64 64 64 48 60 41Z" fill="#1F1B16"/>
        <path d="M50 73 C62 72 72 66 72 56 C66 64 58 68 50 68Z" fill="#000" opacity=".12"/>
        <circle cx="26" cy="56" r="9" fill="#1F1B16"/>
        <circle cx="23" cy="53" r="2" fill="#fff"/>
        <path d="M22 48 C18 40 14 38 10 40 M27 47 C26 40 24 36 20 34" stroke="#1F1B16" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M72 56 L80 57" stroke="#1F1B16" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M36 48 C40 44 46 42 52 42" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </g>
    `
  },
  {
    id: 'accessory-teddy',
    category: 'accessory',
    name: 'Teddy Bear',
    viewBox: '0 0 100 100',
    defaultColor: '#B07A45',
    svgMarkup: `
      <ellipse cx="50" cy="70" rx="22" ry="20" fill="currentColor"/>
      <ellipse cx="50" cy="73" rx="12" ry="12" fill="#fff" opacity=".3"/>
      <ellipse cx="28" cy="64" rx="7" ry="10" transform="rotate(25 28 64)" fill="currentColor"/>
      <ellipse cx="72" cy="64" rx="7" ry="10" transform="rotate(-25 72 64)" fill="currentColor"/>
      <ellipse cx="72" cy="64" rx="7" ry="10" transform="rotate(-25 72 64)" fill="#000" opacity=".1"/>
      <ellipse cx="36" cy="88" rx="9" ry="7" fill="currentColor"/>
      <ellipse cx="64" cy="88" rx="9" ry="7" fill="currentColor"/>
      <ellipse cx="36" cy="89" rx="5" ry="3.6" fill="#fff" opacity=".35"/>
      <ellipse cx="64" cy="89" rx="5" ry="3.6" fill="#fff" opacity=".35"/>
      <circle cx="31" cy="18" r="8" fill="currentColor"/>
      <circle cx="69" cy="18" r="8" fill="currentColor"/>
      <circle cx="31" cy="18" r="4.4" fill="#fff" opacity=".3"/>
      <circle cx="69" cy="18" r="4.4" fill="#fff" opacity=".3"/>
      <circle cx="50" cy="32" r="20" fill="currentColor"/>
      <path d="M50 52 C60 52 68 46 70 36 C64 44 58 48 50 48Z" fill="#000" opacity=".1"/>
      <ellipse cx="50" cy="39" rx="9" ry="7" fill="#F5E6D3"/>
      <ellipse cx="50" cy="36" rx="3.2" ry="2.4" fill="#2B2420"/>
      <path d="M50 38.5 L50 42 M46.5 43 Q50 45 53.5 43" stroke="#2B2420" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="28" r="2.4" fill="#2B2420"/>
      <circle cx="58" cy="28" r="2.4" fill="#2B2420"/>
      <circle cx="42.8" cy="27.2" r=".8" fill="#fff"/>
      <circle cx="58.8" cy="27.2" r=".8" fill="#fff"/>
      <circle cx="37" cy="36" r="2.6" fill="#F472B6" opacity=".45"/>
      <circle cx="63" cy="36" r="2.6" fill="#F472B6" opacity=".45"/>
      <path d="M50 53 C42 47 36 49 38 54 C40 59 46 57 50 53 C54 57 60 59 62 54 C64 49 58 47 50 53Z" fill="#E11D48"/>
      <circle cx="50" cy="53" r="2.6" fill="#BE123C"/>
    `
  },
  {
    id: 'accessory-cat',
    category: 'accessory',
    name: 'Sweet Kitty',
    viewBox: '0 0 100 100',
    defaultColor: '#F59E0B',
    svgMarkup: `
      <path d="M68 84 C82 84 88 72 82 62 C80 58 76 60 78 64 C82 70 78 78 68 78Z" fill="currentColor"/>
      <path d="M68 84 C82 84 88 72 82 62 C80 58 76 60 78 64 C82 70 78 78 68 78Z" fill="#000" opacity=".12"/>
      <path d="M30 90 C26 72 34 56 50 56 C66 56 74 72 70 90Z" fill="currentColor"/>
      <path d="M42 90 C40 80 44 70 50 70 C56 70 60 80 58 90Z" fill="#fff" opacity=".45"/>
      <ellipse cx="40" cy="90" rx="7" ry="4" fill="currentColor"/>
      <ellipse cx="60" cy="90" rx="7" ry="4" fill="currentColor"/>
      <path d="M28 26 L30 6 L44 18Z M72 26 L70 6 L56 18Z" fill="currentColor"/>
      <path d="M31 22 L32 12 L40 18Z M69 22 L68 12 L60 18Z" fill="#F9A8D4"/>
      <ellipse cx="50" cy="36" rx="23" ry="20" fill="currentColor"/>
      <path d="M44 18 L46 26 M50 17 L50 25 M56 18 L54 26" stroke="#000" stroke-opacity=".15" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="50" cy="44" rx="9" ry="6" fill="#fff" opacity=".55"/>
      <ellipse cx="41" cy="35" rx="2.6" ry="3.4" fill="#2B2420"/>
      <ellipse cx="59" cy="35" rx="2.6" ry="3.4" fill="#2B2420"/>
      <circle cx="42" cy="34" r=".9" fill="#fff"/>
      <circle cx="60" cy="34" r=".9" fill="#fff"/>
      <path d="M48 41 L52 41 L50 43.5Z" fill="#F472B6"/>
      <path d="M50 43.5 Q47.5 47 45 45.5 M50 43.5 Q52.5 47 55 45.5" stroke="#2B2420" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M30 40 L20 38 M30 44 L20 46 M70 40 L80 38 M70 44 L80 46" stroke="#2B2420" stroke-opacity=".5" stroke-width=".8" stroke-linecap="round"/>
      <circle cx="35" cy="43" r="3" fill="#F472B6" opacity=".4"/>
      <circle cx="65" cy="43" r="3" fill="#F472B6" opacity=".4"/>
    `
  },
  {
    id: 'accessory-sun-cloud',
    category: 'accessory',
    name: 'Sun & Cloud',
    viewBox: '0 0 100 100',
    defaultColor: '#FBBF24',
    svgMarkup: `
      ${radial(10, 58, 40, 'M0 -21 L0 -27', 'stroke="currentColor" stroke-width="3" stroke-linecap="round"')}
      <circle cx="58" cy="40" r="16" fill="currentColor"/>
      <path d="M58 56 C67 56 74 49 74 40 C70 48 64 52 58 52Z" fill="#000" opacity=".1"/>
      <path d="M48 32 C50 28 54 26 58 26" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M22 78 C14 78 12 68 20 66 C20 56 32 54 36 60 C40 52 54 54 54 64 C62 62 66 72 60 78Z" fill="#FFFFFF" ${OUTLINE}/>
      <path d="M22 78 C16 78 14 74 16 71 C24 74 46 74 60 72 C62 76 60 78 60 78Z" fill="#CBD5E1" opacity=".5"/>
    `
  },
];

/**
 * Drawn when a saved bouquet references an asset id this build doesn't know
 * (e.g. a bouquet made on a newer deploy). Better a tinted blossom than a hole.
 */
export const FALLBACK_ASSET: Asset = {
  id: 'fallback-blossom',
  category: 'flower',
  name: 'Flower',
  viewBox: '0 0 100 100',
  defaultColor: '#F4A7B9',
  svgMarkup: `
    ${stem('M50 46 C50 62 50 78 50 94')}
    ${leaf(50, 72, -155, 0.9)}
    ${radial(8, 50, 30, 'M0 -5 C-8 -9 -9 -20 0 -24 C9 -20 8 -9 0 -5Z', 'fill="currentColor"', 22.5)}
    ${radial(8, 50, 30, 'M0 -5 C-8 -9 -9 -20 0 -24 C9 -20 8 -9 0 -5Z', 'fill="#000" opacity=".1"', 22.5)}
    ${radial(8, 50, 30, 'M0 -4 C-6 -7 -7 -16 0 -19 C7 -16 6 -7 0 -4Z', 'fill="currentColor"')}
    <circle cx="50" cy="30" r="6" fill="#F6C453"/>
  `,
};

const ASSET_INDEX = new Map(SEEDED_ASSETS.map(a => [a.id, a]));

/** Look up an asset by id, falling back to a generic blossom for unknown ids. */
export const getAsset = (id: string): Asset => ASSET_INDEX.get(id) ?? FALLBACK_ASSET;
