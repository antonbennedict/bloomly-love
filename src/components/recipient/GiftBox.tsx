'use client';

import { motion } from 'framer-motion';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Illustrated gift box. While closed it breathes and the lid bobs; when `opening`
 * the bow pops off, the lid flies away and light spills out of the box.
 */
export default function GiftBox({ opening, reduced }: { opening: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 220 230" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="gift-glow">
          <stop offset="0%" stopColor="#FFF8DC" stopOpacity="1" />
          <stop offset="45%" stopColor="#FDE2EA" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FDE2EA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gift-body" x1="0" x2="1">
          <stop offset="0%" stopColor="#77A585" />
          <stop offset="100%" stopColor="#5E8A6C" />
        </linearGradient>
        <linearGradient id="gift-lid" x1="0" x2="1">
          <stop offset="0%" stopColor="#86B394" />
          <stop offset="100%" stopColor="#6E9B7C" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <motion.ellipse
        cx="110" cy="216" rx="72" ry="8" fill="#000" opacity="0.12"
        animate={opening ? { opacity: 0 } : reduced ? undefined : { rx: [72, 66, 72] }}
        transition={opening ? { delay: 0.9, duration: 0.4 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Light spilling out */}
      {opening && (
        <motion.circle
          cx="110" cy="100" r="80" fill="url(#gift-glow)"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1.4, 2.2], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{ originX: '50%', originY: '50%' }}
        />
      )}

      {/* Box body */}
      <motion.g
        animate={opening ? { y: 24, opacity: 0, scale: 0.92 } : undefined}
        transition={{ delay: 0.95, duration: 0.55, ease: EASE_OUT }}
        style={{ originX: '50%', originY: '100%' }}
      >
        <rect x="44" y="102" width="132" height="110" rx="14" fill="url(#gift-body)" />
        <rect x="44" y="102" width="132" height="12" fill="#000" opacity="0.12" />
        <rect x="99" y="102" width="22" height="110" fill="#E8728F" />
        <rect x="99" y="102" width="6" height="110" fill="#fff" opacity="0.18" />
        <path d="M54 124 C56 150 56 176 60 200" stroke="#fff" strokeOpacity="0.22" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Gift tag */}
        <g transform="rotate(-10 150 150)">
          <path d="M136 140 L164 140 L164 168 L150 176 L136 168Z" fill="#FBF6EC" />
          <circle cx="150" cy="147" r="2.6" fill="#E8728F" />
          <path d="M150 168 C144 163 143 158 146.5 157 C148 156.6 149.4 157.6 150 158.8 C150.6 157.6 152 156.6 153.5 157 C157 158 156 163 150 168Z" fill="#E8728F" />
        </g>
      </motion.g>

      {/* Lid + bow */}
      <motion.g
        style={{ originX: '50%', originY: '100%' }}
        animate={
          opening
            ? { y: -170, x: 50, rotate: 32, opacity: 0 }
            : reduced ? undefined : { y: [0, -5, 0] }
        }
        transition={
          opening
            ? { duration: 0.95, delay: 0.3, ease: [0.3, 0, 0.2, 1] }
            : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <rect x="34" y="76" width="152" height="32" rx="10" fill="url(#gift-lid)" />
        <rect x="99" y="76" width="22" height="32" fill="#F08BA5" />
        <rect x="40" y="80" width="140" height="5" rx="2.5" fill="#fff" opacity="0.22" />

        <motion.g
          style={{ originX: '50%', originY: '100%' }}
          animate={opening ? { scale: [1, 1.25, 0], rotate: [0, -8, -40] } : undefined}
          transition={{ duration: 0.45 }}
        >
          <path d="M110 76 C92 50 62 48 64 64 C66 80 96 82 110 76Z" fill="#E8728F" />
          <path d="M110 76 C128 50 158 48 156 64 C154 80 124 82 110 76Z" fill="#E8728F" />
          <path d="M110 76 C96 66 78 62 72 66 C80 56 98 60 110 76Z" fill="#000" opacity="0.14" />
          <path d="M110 76 C124 66 142 62 148 66 C140 56 122 60 110 76Z" fill="#000" opacity="0.18" />
          <path d="M70 60 C74 55 80 54 86 56" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="110" cy="75" rx="9" ry="8" fill="#D9587A" />
          <ellipse cx="108" cy="73" rx="3" ry="2.4" fill="#fff" opacity="0.35" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
