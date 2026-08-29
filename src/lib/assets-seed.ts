export interface Asset {
  id: string;
  category: 'flower' | 'wrapper' | 'filler' | 'accessory' | 'seasonal' | 'other';
  name: string;
  svgMarkup: string; // The raw SVG markup (usually inner elements or full SVG code)
  viewBox: string;
  defaultColor: string;
  isPremium?: boolean;
}

export const SEEDED_ASSETS: Asset[] = [
  // FLOWERS
  {
    id: 'flower-rose',
    category: 'flower',
    name: 'Elegant Rose',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48', // rose-600
    svgMarkup: `
      <!-- Stem -->
      <path d="M50,55 L50,90" stroke="#166534" stroke-width="4" stroke-linecap="round" />
      <path d="M50,70 Q40,65 35,70" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M35,70 Q42,75 50,70" stroke="#166534" stroke-width="3" fill="#166534" />
      <path d="M50,78 Q60,82 65,75" stroke="#166534" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M65,75 Q58,72 50,78" stroke="#166534" stroke-width="3" fill="#166534" />
      <!-- Calyx -->
      <path d="M40,52 Q50,60 60,52 L55,45 L45,45 Z" fill="#15803d" />
      <!-- Petals (Tintable) -->
      <path d="M50,20 Q30,15 30,35 Q30,55 50,55 Q70,55 70,35 Q70,15 50,20 Z" fill="currentColor" opacity="0.9" />
      <path d="M50,25 Q38,20 38,35 Q38,48 50,48 Q62,48 62,35 Q62,20 50,25 Z" fill="currentColor" filter="brightness(0.9)" />
      <path d="M50,30 Q44,26 44,35 Q44,42 50,42 Q56,42 56,35 Q56,26 50,30 Z" fill="currentColor" filter="brightness(0.8)" />
      <circle cx="50" cy="35" r="3" fill="#fda4af" />
    `
  },
  {
    id: 'flower-tulip',
    category: 'flower',
    name: 'Spring Tulip',
    viewBox: '0 0 100 100',
    defaultColor: '#EC4899', // pink-500
    svgMarkup: `
      <!-- Stem -->
      <path d="M50,60 L50,95" stroke="#15803d" stroke-width="4" stroke-linecap="round" />
      <path d="M50,80 Q32,70 35,55 C37,45 45,55 50,75" fill="#166534" />
      <!-- Tulip Bulb (Tintable) -->
      <path d="M50,60 C30,60 30,30 45,20 C48,25 52,25 55,20 C70,30 70,60 50,60 Z" fill="currentColor" />
      <path d="M50,60 C38,60 35,35 48,22 C49,30 51,30 52,22 C65,35 62,60 50,60 Z" fill="currentColor" filter="brightness(0.9)" />
      <path d="M50,60 C42,60 42,40 50,25 C58,40 58,60 50,60 Z" fill="currentColor" filter="brightness(0.8)" />
    `
  },
  {
    id: 'flower-sunflower',
    category: 'flower',
    name: 'Golden Sunflower',
    viewBox: '0 0 100 100',
    defaultColor: '#EAB308', // yellow-500
    svgMarkup: `
      <!-- Stem -->
      <path d="M50,55 L50,95" stroke="#166534" stroke-width="4.5" stroke-linecap="round" />
      <!-- Petals (Tintable / Yellow-gold) -->
      <g fill="currentColor">
        <!-- 12 Petals around the center -->
        <path d="M50,50 L50,15 L53,30 L47,30 Z" />
        <path d="M50,50 L50,85 L53,70 L47,70 Z" />
        <path d="M50,50 L15,50 L30,53 L30,47 Z" />
        <path d="M50,50 L85,50 L70,53 L70,47 Z" />
        <path d="M50,50 L25,25 L38,32 L32,38 Z" />
        <path d="M50,50 L75,75 L62,68 L68,62 Z" />
        <path d="M50,50 L75,25 L68,38 L62,32 Z" />
        <path d="M50,50 L25,75 L32,62 L38,68 Z" />
      </g>
      <!-- Center Core (Brown) -->
      <circle cx="50" cy="50" r="18" fill="#451a03" stroke="#78350f" stroke-width="2" />
      <!-- Seeds pattern -->
      <circle cx="46" cy="46" r="1.5" fill="#facc15" />
      <circle cx="54" cy="48" r="1.5" fill="#facc15" />
      <circle cx="48" cy="54" r="1.5" fill="#facc15" />
      <circle cx="52" cy="52" r="1" fill="#facc15" />
    `
  },
  {
    id: 'flower-daisy',
    category: 'flower',
    name: 'Cheerful Daisy',
    viewBox: '0 0 100 100',
    defaultColor: '#F8FAFC', // slate-50 (White daisy)
    svgMarkup: `
      <!-- Stem -->
      <path d="M50,50 L50,95" stroke="#22c55e" stroke-width="3" stroke-linecap="round" />
      <!-- Petals (Tintable) -->
      <g fill="currentColor" stroke="#e2e8f0" stroke-width="1">
        <circle cx="50" cy="25" r="7" />
        <circle cx="50" cy="75" r="7" />
        <circle cx="25" cy="50" r="7" />
        <circle cx="75" cy="50" r="7" />
        <circle cx="32" cy="32" r="7" />
        <circle cx="68" cy="68" r="7" />
        <circle cx="68" cy="32" r="7" />
        <circle cx="32" cy="68" r="7" />
      </g>
      <!-- Center disc -->
      <circle cx="50" cy="50" r="12" fill="#eab308" stroke="#ca8a04" stroke-width="1" />
    `
  },
  {
    id: 'flower-lavender',
    category: 'flower',
    name: 'Sweet Lavender',
    viewBox: '0 0 100 100',
    defaultColor: '#A855F7', // purple-500
    svgMarkup: `
      <!-- Stem -->
      <path d="M50,30 L50,95" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" />
      <!-- Blooms (Purple spikes) -->
      <g fill="currentColor">
        <ellipse cx="50" cy="25" rx="4" ry="6" />
        <ellipse cx="46" cy="33" rx="5" ry="4" transform="rotate(-15 46 33)" />
        <ellipse cx="54" cy="33" rx="5" ry="4" transform="rotate(15 54 33)" />
        <ellipse cx="45" cy="42" rx="6" ry="4.5" transform="rotate(-20 45 42)" />
        <ellipse cx="55" cy="42" rx="6" ry="4.5" transform="rotate(20 55 42)" />
        <ellipse cx="44" cy="52" rx="6" ry="4.5" transform="rotate(-25 44 52)" />
        <ellipse cx="56" cy="52" rx="6" ry="4.5" transform="rotate(25 56 52)" />
        <ellipse cx="45" cy="62" rx="5" ry="4" transform="rotate(-15 45 62)" />
        <ellipse cx="55" cy="62" rx="5" ry="4" transform="rotate(15 55 62)" />
        <ellipse cx="50" cy="70" rx="4" ry="3" />
      </g>
    `
  },
  {
    id: 'flower-orchid',
    category: 'flower',
    name: 'Exotic Orchid',
    viewBox: '0 0 100 100',
    defaultColor: '#D946EF', // fuchsia-500
    svgMarkup: `
      <!-- Stem -->
      <path d="M50,50 Q45,75 40,95" fill="none" stroke="#166534" stroke-width="3" stroke-linecap="round" />
      <!-- Back Petals (Tintable) -->
      <g fill="currentColor" opacity="0.85">
        <path d="M50,50 L25,30 Q38,20 50,50 Z" />
        <path d="M50,50 L75,30 Q62,20 50,50 Z" />
        <path d="M50,50 L50,12 Q60,25 50,50 Z" />
      </g>
      <!-- Front Wings (Tintable) -->
      <g fill="currentColor">
        <path d="M50,50 C20,40 22,65 50,55 Z" />
        <path d="M50,50 C80,40 78,65 50,55 Z" />
      </g>
      <!-- Center Lip / Labellum -->
      <path d="M50,45 C42,45 42,65 50,68 C58,65 58,45 50,45 Z" fill="#e11d48" />
      <circle cx="50" cy="52" r="3" fill="#facc15" />
    `
  },

  {
    id: 'flower-lily',
    category: 'flower',
    name: 'Stargazer Lily',
    viewBox: '0 0 100 100',
    defaultColor: '#F43F5E',
    svgMarkup: `
      <path d="M50,55 L50,95" stroke="#166534" stroke-width="4" stroke-linecap="round" />
      <g fill="currentColor">
        <path d="M50,50 L50,10 C58,25 58,40 50,50 Z" />
        <path d="M50,50 L85,60 C70,62 58,58 50,50 Z" />
        <path d="M50,50 L15,60 C30,62 42,58 50,50 Z" />
        <path d="M50,50 L75,20 C65,30 55,42 50,50 Z" opacity="0.9" />
        <path d="M50,50 L25,20 C35,30 45,42 50,50 Z" opacity="0.9" />
        <path d="M50,50 L50,80 C58,72 58,60 50,50 Z" opacity="0.9" />
      </g>
      <circle cx="50" cy="50" r="4" fill="#facc15" />
    `
  },
  {
    id: 'flower-carnation',
    category: 'flower',
    name: 'Sweet Carnation',
    viewBox: '0 0 100 100',
    defaultColor: '#FB7185',
    svgMarkup: `
      <path d="M50,55 L50,95" stroke="#166534" stroke-width="3.5" stroke-linecap="round" />
      <path d="M42,55 Q50,65 58,55 L55,45 L45,45 Z" fill="#15803d" />
      <g fill="currentColor">
        <circle cx="50" cy="35" r="18" />
        <circle cx="40" cy="30" r="14" />
        <circle cx="60" cy="30" r="14" />
        <circle cx="44" cy="42" r="12" />
        <circle cx="56" cy="42" r="12" />
        <circle cx="50" cy="24" r="12" fill="#fff1f2" opacity="0.6" />
      </g>
    `
  },
  {
    id: 'flower-hydrangea',
    category: 'flower',
    name: 'Blue Hydrangea',
    viewBox: '0 0 100 100',
    defaultColor: '#38BDF8',
    svgMarkup: `
      <path d="M50,65 L50,95" stroke="#15803d" stroke-width="4" stroke-linecap="round" />
      <g fill="currentColor">
        <circle cx="50" cy="40" r="24" />
        <circle cx="32" cy="32" r="15" opacity="0.9" />
        <circle cx="68" cy="32" r="15" opacity="0.9" />
        <circle cx="36" cy="52" r="14" opacity="0.9" />
        <circle cx="64" cy="52" r="14" opacity="0.9" />
        <circle cx="50" cy="22" r="14" opacity="0.95" />
      </g>
      <circle cx="50" cy="40" r="4" fill="#ffffff" />
      <circle cx="35" cy="35" r="3" fill="#ffffff" />
      <circle cx="65" cy="35" r="3" fill="#ffffff" />
    `
  },
  // FILLERS
  {
    id: 'filler-eucalyptus',
    category: 'filler',
    name: 'Eucalyptus Spray',
    viewBox: '0 0 100 100',
    defaultColor: '#475569', // slate-600
    svgMarkup: `
      <!-- Main stalk -->
      <path d="M50,95 C48,70 52,40 50,10" fill="none" stroke="#1e3a1e" stroke-width="3.5" stroke-linecap="round" />
      <!-- Leaves (Sage color or Tintable) -->
      <g fill="currentColor" opacity="0.9">
        <circle cx="38" cy="25" r="9" />
        <circle cx="62" cy="28" r="9.5" />
        <circle cx="35" cy="45" r="11" />
        <circle cx="65" cy="48" r="11" />
        <circle cx="33" cy="68" r="12" />
        <circle cx="67" cy="70" r="12" />
        <circle cx="50" cy="15" r="6" />
      </g>
      <!-- leaf veins -->
      <path d="M50,25 L38,25 M50,28 L62,28 M50,45 L35,45 M50,48 L65,48 M50,68 L33,68 M50,70 L67,70" stroke="#0f172a" stroke-width="1.5" opacity="0.3" />
    `
  },
  {
    id: 'filler-babysbreath',
    category: 'filler',
    name: "Baby's Breath",
    viewBox: '0 0 100 100',
    defaultColor: '#F1F5F9', // slate-100
    svgMarkup: `
      <!-- Green delicate branching -->
      <path d="M50,95 L50,70" stroke="#166534" stroke-width="2.5" />
      <path d="M50,70 Q35,55 30,40" fill="none" stroke="#166534" stroke-width="2" />
      <path d="M50,70 Q65,55 70,40" fill="none" stroke="#166534" stroke-width="2" />
      <path d="M30,40 L20,25 M30,40 L40,25" stroke="#15803d" stroke-width="1.5" />
      <path d="M70,40 L60,25 M70,40 L80,25" stroke="#15803d" stroke-width="1.5" />
      
      <!-- Tintable mini clusters -->
      <g fill="currentColor" stroke="#cbd5e1" stroke-width="0.5">
        <circle cx="20" cy="25" r="3.5" />
        <circle cx="17" cy="22" r="2.5" />
        <circle cx="23" cy="23" r="2.5" />
        
        <circle cx="40" cy="25" r="3.5" />
        <circle cx="37" cy="23" r="2.5" />
        <circle cx="43" cy="22" r="2.5" />
        
        <circle cx="60" cy="25" r="3.5" />
        <circle cx="57" cy="22" r="2.5" />
        <circle cx="63" cy="24" r="2.5" />
        
        <circle cx="80" cy="25" r="3.5" />
        <circle cx="77" cy="24" r="2.5" />
        <circle cx="83" cy="21" r="2.5" />
      </g>
    `
  },

  // WRAPPERS
  {
    id: 'wrapper-paper',
    category: 'wrapper',
    name: 'Kraft Wrap',
    viewBox: '0 0 100 100',
    defaultColor: '#D97706', // amber-600
    svgMarkup: `
      <!-- Behind wrapping paper folds -->
      <path d="M15,40 L50,95 L85,40 C80,35 65,30 50,30 C35,30 20,35 15,40 Z" fill="currentColor" opacity="0.8" />
      <!-- Outer wings of wrapping paper -->
      <path d="M10,35 L40,95 L50,95 L25,30 Z" fill="currentColor" />
      <path d="M90,35 L60,95 L50,95 L75,30 Z" fill="currentColor" filter="brightness(0.95)" />
      <!-- Folds detailing -->
      <path d="M30,50 L45,95 L50,95 L35,45 Z" fill="currentColor" filter="brightness(0.85)" />
      <!-- Ribbon bow tied around -->
      <rect x="42" y="70" width="16" height="5" rx="2" fill="#be123c" />
      <circle cx="50" cy="72.5" r="3.5" fill="#be123c" />
      <path d="M44,72 C35,68 40,78 44,73" fill="none" stroke="#be123c" stroke-width="2" />
      <path d="M56,72 C65,68 60,78 56,73" fill="none" stroke="#be123c" stroke-width="2" />
    `
  },
  {
    id: 'wrapper-vase',
    category: 'wrapper',
    name: 'Glass Vase',
    viewBox: '0 0 100 100',
    defaultColor: '#38BDF8', // sky-400
    svgMarkup: `
      <!-- Water level inside -->
      <ellipse cx="50" cy="60" rx="24" ry="6" fill="#0284c7" opacity="0.6" />
      <rect x="26" y="60" width="48" height="30" fill="#0284c7" opacity="0.5" rx="5" />
      <!-- Glass Outline (Tintable) -->
      <path d="M30,30 L25,60 C23,80 30,95 50,95 C70,95 77,80 75,60 L70,30 Z" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="3" />
      <ellipse cx="50" cy="30" rx="20" ry="4" fill="none" stroke="currentColor" stroke-width="2" />
      <!-- Highlights / reflection -->
      <path d="M32,45 L30,70" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.5" />
    `
  },

  // ACCESSORIES
  {
    id: 'accessory-bow',
    category: 'accessory',
    name: 'Satin Bow',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48', // rose-600
    svgMarkup: `
      <!-- Ribbon Tails -->
      <path d="M50,50 L30,90 L45,90 Z" fill="currentColor" opacity="0.9" />
      <path d="M50,50 L70,90 L55,90 Z" fill="currentColor" opacity="0.9" />
      <!-- Bow loops -->
      <path d="M50,50 C20,30 25,10 45,35 Z" fill="currentColor" />
      <path d="M50,50 C80,30 75,10 55,35 Z" fill="currentColor" filter="brightness(0.9)" />
      <!-- Center Knot -->
      <circle cx="50" cy="45" r="7" fill="currentColor" filter="brightness(0.8)" stroke="#fda4af" stroke-width="1" />
    `
  },
  {
    id: 'accessory-sparkles',
    category: 'accessory',
    name: 'Magic Sparkles',
    viewBox: '0 0 100 100',
    defaultColor: '#FACC15', // yellow-400
    svgMarkup: `
      <!-- Sparkle 1 (Large Center) -->
      <path d="M50,15 Q50,40 25,40 Q50,40 50,65 Q50,40 75,40 Q50,40 50,15 Z" fill="currentColor" />
      <!-- Sparkle 2 (Top Left) -->
      <path d="M25,5 Q25,18 12,18 Q25,18 25,30 Q25,18 38,18 Q25,18 25,5 Z" fill="currentColor" opacity="0.8" />
      <!-- Sparkle 3 (Bottom Right) -->
      <path d="M78,50 Q78,60 68,60 Q78,60 78,70 Q78,60 88,60 Q78,60 78,50 Z" fill="currentColor" opacity="0.8" />
      <!-- Small stars -->
      <circle cx="20" cy="55" r="2.5" fill="currentColor" />
      <circle cx="65" cy="20" r="3" fill="currentColor" />
    `
  },
  {
    id: 'accessory-tag',
    category: 'accessory',
    name: 'Love Tag',
    viewBox: '0 0 100 100',
    defaultColor: '#F59E0B', // amber-500
    svgMarkup: `
      <g transform="rotate(-15 50 50)">
        <!-- Tag base -->
        <polygon points="20,40 70,40 85,55 70,70 20,70" fill="currentColor" stroke="#451a03" stroke-width="2" />
        <!-- Tag hole and string -->
        <circle cx="75" cy="55" r="3" fill="#ffffff" stroke="#451a03" stroke-width="1.5" />
        <path d="M78,55 Q95,45 85,25" fill="none" stroke="#78350f" stroke-width="2" />
        <!-- Heart stamp inside tag -->
        <path d="M45,50 C40,42 30,45 35,55 L45,65 L55,55 C60,45 50,42 45,50 Z" fill="#be123c" />
      </g>
    `
  },
  {
    id: 'wrapper-ribbon-only',
    category: 'wrapper',
    name: 'Satin Ribbon Wrap',
    viewBox: '0 0 100 100',
    defaultColor: '#E11D48',
    svgMarkup: `
      <path d="M48,50 L48,95 L52,95 L52,50 Z" stroke="#166534" stroke-width="4.5" />
      <rect x="42" y="65" width="16" height="6" rx="2" fill="currentColor" />
      <circle cx="50" cy="68" r="3.5" fill="currentColor" filter="brightness(0.9)" />
      <path d="M44,68 C35,60 38,78 44,70" fill="none" stroke="currentColor" stroke-width="2.5" />
      <path d="M56,68 C65,60 62,78 56,70" fill="none" stroke="currentColor" stroke-width="2.5" />
    `
  },
  {
    id: 'wrapper-basket',
    category: 'wrapper',
    name: 'Woven Basket',
    viewBox: '0 0 100 100',
    defaultColor: '#B45309',
    svgMarkup: `
      <path d="M20,40 L30,90 L70,90 L80,40 Z" fill="currentColor" stroke="#78350f" stroke-width="2.5" />
      <path d="M25,50 L75,50 M27,65 L73,65 M29,80 L71,80" stroke="#78350f" stroke-width="1.5" opacity="0.4" />
      <path d="M35,40 L40,90 M50,40 L50,90 M65,40 L60,90" stroke="#78350f" stroke-width="1.5" opacity="0.4" />
      <path d="M20,40 Q50,5 80,40" fill="none" stroke="currentColor" stroke-width="4" filter="brightness(0.85)" />
    `
  },
  {
    id: 'filler-fern',
    category: 'filler',
    name: 'Forest Fern',
    viewBox: '0 0 100 100',
    defaultColor: '#15803d',
    svgMarkup: `
      <path d="M50,95 L50,15" stroke="#166534" stroke-width="3" stroke-linecap="round" />
      <g fill="currentColor">
        <path d="M50,80 Q25,75 20,70 Q35,82 50,83 Z" />
        <path d="M50,80 Q75,75 80,70 Q65,82 50,83 Z" />
        <path d="M50,65 Q22,60 18,55 Q35,67 50,68 Z" />
        <path d="M50,65 Q78,60 82,55 Q65,67 50,68 Z" />
        <path d="M50,50 Q24,45 20,40 Q35,52 50,53 Z" />
        <path d="M50,50 Q76,45 80,40 Q65,52 50,53 Z" />
      </g>
    `
  },
  // CUTIE PETS & DECOR
  {
    id: 'accessory-teddy',
    category: 'accessory',
    name: 'Teddy Bear',
    viewBox: '0 0 100 100',
    defaultColor: '#A16207',
    svgMarkup: `
      <!-- Ears -->
      <circle cx="32" cy="25" r="11" fill="currentColor" />
      <circle cx="32" cy="25" r="6" fill="#fef08a" />
      <circle cx="68" cy="25" r="11" fill="currentColor" />
      <circle cx="68" cy="25" r="6" fill="#fef08a" />
      <!-- Head -->
      <circle cx="50" cy="35" r="22" fill="currentColor" />
      <!-- Muzzle -->
      <ellipse cx="50" cy="40" rx="9" ry="7" fill="#fef08a" />
      <!-- Eyes & Nose -->
      <circle cx="43" cy="32" r="2.5" fill="#1c1917" />
      <circle cx="57" cy="32" r="2.5" fill="#1c1917" />
      <ellipse cx="50" cy="37" rx="3.5" ry="2.5" fill="#1c1917" />
      <!-- Body & Arms -->
      <ellipse cx="50" cy="70" rx="24" ry="22" fill="currentColor" />
      <ellipse cx="50" cy="72" rx="14" ry="13" fill="#fef08a" />
      <ellipse cx="24" cy="65" rx="8" ry="14" transform="rotate(20 24 65)" fill="currentColor" />
      <ellipse cx="76" cy="65" rx="8" ry="14" transform="rotate(-20 76 65)" fill="currentColor" />
      <!-- Bowtie -->
      <path d="M42,50 L58,50 L55,56 L58,62 L42,62 L45,56 Z" fill="#e11d48" />
      <circle cx="50" cy="56" r="3" fill="#9f1239" />
    `
  },
  {
    id: 'accessory-cat',
    category: 'accessory',
    name: 'Sweet Kitty',
    viewBox: '0 0 100 100',
    defaultColor: '#F97316',
    svgMarkup: `
      <!-- Tail -->
      <path d="M72,75 Q90,65 82,45 C80,40 75,45 76,55" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
      <!-- Ears -->
      <polygon points="28,25 20,5 40,18" fill="currentColor" />
      <polygon points="27,22 22,9 36,17" fill="#fecdd3" />
      <polygon points="72,25 80,5 60,18" fill="currentColor" />
      <polygon points="73,22 78,9 64,17" fill="#fecdd3" />
      <!-- Head -->
      <circle cx="50" cy="35" r="21" fill="currentColor" />
      <!-- Eyes & Cheeks -->
      <ellipse cx="40" cy="32" rx="3" ry="4" fill="#1c1917" />
      <ellipse cx="60" cy="32" rx="3" ry="4" fill="#1c1917" />
      <circle cx="36" cy="38" r="4" fill="#f43f5e" opacity="0.5" />
      <circle cx="64" cy="38" r="4" fill="#f43f5e" opacity="0.5" />
      <!-- Nose & Mouth -->
      <polygon points="48,37 52,37 50,40" fill="#f43f5e" />
      <!-- Body & Paws -->
      <ellipse cx="50" cy="72" rx="22" ry="20" fill="currentColor" />
      <ellipse cx="42" cy="85" rx="6" ry="4" fill="#fef08a" />
      <ellipse cx="58" cy="85" rx="6" ry="4" fill="#fef08a" />
    `
  },
  {
    id: 'accessory-sun-cloud',
    category: 'accessory',
    name: 'Sun & Clouds',
    viewBox: '0 0 100 100',
    defaultColor: '#EAB308',
    svgMarkup: `
      <!-- Sun rays -->
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round">
        <line x1="50" y1="5" x2="50" y2="15" />
        <line x1="50" y1="65" x2="50" y2="75" />
        <line x1="15" y1="40" x2="25" y2="40" />
        <line x1="75" y1="40" x2="85" y2="40" />
        <line x1="25" y1="15" x2="32" y2="22" />
        <line x1="68" y1="58" x2="75" y2="65" />
        <line x1="25" y1="65" x2="32" y2="58" />
        <line x1="68" y1="22" x2="75" y2="15" />
      </g>
      <!-- Sun Core -->
      <circle cx="50" cy="40" r="18" fill="currentColor" />
      <!-- Clouds overlay -->
      <path d="M10,75 C10,65 25,60 35,68 C40,58 60,58 65,68 C75,65 88,72 85,82 C85,88 75,90 10,90 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
    `
  },
  {
    id: 'filler-dustymiller',
    category: 'filler',
    name: 'Silver Dusty Miller',
    viewBox: '0 0 100 100',
    defaultColor: '#94A3B8',
    svgMarkup: `
      <path d="M50,95 C48,70 52,40 50,15" fill="none" stroke="#64748B" stroke-width="3.5" />
      <g fill="currentColor" stroke="#cbd5e1" stroke-width="0.5">
        <path d="M50,75 C25,70 20,55 35,55 C45,55 48,70 50,75 Z" />
        <path d="M50,75 C75,70 80,55 65,55 C55,55 52,70 50,75 Z" />
        <path d="M50,50 C22,45 18,30 32,30 C42,30 46,45 50,50 Z" />
        <path d="M50,50 C78,45 82,30 68,30 C58,30 54,45 50,50 Z" />
        <path d="M50,28 C30,25 28,15 38,15 C44,15 48,25 50,28 Z" />
        <path d="M50,28 C70,25 72,15 62,15 C56,15 52,25 50,28 Z" />
      </g>
    `
  },
  {
    id: 'accessory-butterfly',
    category: 'accessory',
    name: 'Golden Butterfly',
    viewBox: '0 0 100 100',
    defaultColor: '#F97316',
    svgMarkup: `
      <g transform="rotate(-10 50 50)">
        <path d="M50,50 C30,30 20,45 35,60 C42,65 48,55 50,50 Z" fill="currentColor" />
        <path d="M50,50 C70,30 80,45 65,60 C58,65 52,55 50,50 Z" fill="currentColor" />
        <path d="M50,50 C35,50 30,70 42,75 C48,78 50,60 50,50 Z" fill="currentColor" filter="brightness(0.9)" />
        <path d="M50,50 C65,50 70,70 58,75 C52,78 50,60 50,50 Z" fill="currentColor" filter="brightness(0.9)" />
        <ellipse cx="50" cy="58" rx="2" ry="12" fill="#1c1917" />
        <path d="M49,46 Q45,35 40,36" fill="none" stroke="#1c1917" stroke-width="1.5" />
        <path d="M51,46 Q55,35 60,36" fill="none" stroke="#1c1917" stroke-width="1.5" />
      </g>
    `
  },
  {
    id: 'accessory-heart-balloon',
    category: 'accessory',
    name: 'Love Balloon Pick',
    viewBox: '0 0 100 100',
    defaultColor: '#DC2626',
    svgMarkup: `
      <path d="M50,50 L50,95" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" />
      <path d="M50,45 C50,45 30,22 30,12 C30,2 45,2 50,10 C55,2 70,2 70,12 C70,22 50,45 50,45 Z" fill="currentColor" />
      <path d="M38,10 Q34,14 36,20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
    `
  }
];
