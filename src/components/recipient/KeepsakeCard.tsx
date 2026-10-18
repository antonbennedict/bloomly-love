'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAsset } from '@/lib/assets-seed';

interface CardTheme {
  paper: string;
  paperEdge: string;
  ink: string;
  muted: string;
  accent: string;
  seal: string;
  envelope: string;
  envelopeShade: string;
}

// Matches the card styles offered in the builder (card_style "<theme>|<canvas>").
export const CARD_THEMES: Record<string, CardTheme> = {
  classic: { paper: '#FBF6EC', paperEdge: '#E9DCC4', ink: '#3A2F28', muted: '#7A6A5C', accent: '#A16207', seal: '#B4232F', envelope: '#F1E6D2', envelopeShade: '#E3D3B8' },
  rose:    { paper: '#FFF3F5', paperEdge: '#F6CCD5', ink: '#4C1D2A', muted: '#8A5563', accent: '#BE185D', seal: '#BE123C', envelope: '#FBE1E7', envelopeShade: '#F3C9D3' },
  emerald: { paper: '#1E2D24', paperEdge: '#34503F', ink: '#EEF4EF', muted: '#A9C2B1', accent: '#C6D9A8', seal: '#C9A227', envelope: '#26392D', envelopeShade: '#1B2A21' },
  royal:   { paper: '#1C1917', paperEdge: '#4A3B27', ink: '#F7EBD0', muted: '#C8B48C', accent: '#D4AF37', seal: '#9F1D2C', envelope: '#2A2420', envelopeShade: '#1F1A17' },
  velvet:  { paper: '#2A1533', paperEdge: '#55306A', ink: '#F5EBFF', muted: '#CDB3E0', accent: '#E9B6F5', seal: '#C2185B', envelope: '#38204A', envelopeShade: '#2B1839' },
};

function Sprig({ assetId, tint, className, style }: { assetId: string; tint: string; className?: string; style?: CSSProperties }) {
  const asset = getAsset(assetId);
  return (
    <svg viewBox={asset.viewBox} className={className} style={{ color: tint, ...style }} aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
    </svg>
  );
}

function WaxSeal({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M32 3 C38 3 41 7 46 8 C51 9 55 12 57 17 C59 22 61 26 61 32 C61 38 58 42 56 47 C54 52 50 55 45 57 C40 59 37 61 32 61 C27 61 23 58 18 56 C13 54 10 50 8 45 C6 40 3 37 3 32 C3 26 6 22 8 17 C10 12 14 9 19 7 C24 5 27 3 32 3Z" fill={color} />
      <circle cx="32" cy="32" r="21" fill="#000" opacity="0.14" />
      <circle cx="32" cy="32" r="19" fill={color} />
      <path d="M32 43 C22 36 20 29 25 26 C28 24.5 30.8 26 32 28.4 C33.2 26 36 24.5 39 26 C44 29 42 36 32 43Z" fill="#fff" opacity="0.32" />
      <path d="M17 22 C19 17 23 14 28 13" stroke="#fff" strokeOpacity="0.4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Reveals the message word by word; the full text is in the DOM from the start for screen readers. */
function UnfurlingText({ text, reduced, delay = 0 }: { text: string; reduced: boolean; delay?: number }) {
  const words = text.split(/(\s+)/);
  const step = Math.min(0.06, 2.4 / Math.max(words.length, 1));
  if (reduced) return <>{text}</>;
  return (
    <>
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          w.includes('\n') ? <br key={i} /> : ' '
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: delay + i * step, duration: 0.45, ease: 'easeOut' }}
          >
            {w}
          </motion.span>
        )
      )}
    </>
  );
}

export default function KeepsakeCard({
  themeKey,
  recipient,
  sender,
  message,
  createdAt,
  reduced,
  onOpened,
}: {
  themeKey: string;
  recipient: string;
  sender: string;
  message: string;
  createdAt?: string;
  reduced: boolean;
  onOpened?: () => void;
}) {
  const theme = CARD_THEMES[themeKey] ?? CARD_THEMES.classic;
  const [stage, setStage] = useState<'sealed' | 'opening' | 'read'>('sealed');
  const cardRef = useRef<HTMLDivElement>(null);
  const dark = ['emerald', 'royal', 'velvet'].includes(themeKey);

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const open = () => {
    if (stage !== 'sealed') return;
    if (reduced) {
      setStage('read');
      onOpened?.();
      return;
    }
    setStage('opening');
    window.setTimeout(() => {
      setStage('read');
      onOpened?.();
    }, 950);
  };

  useEffect(() => {
    if (stage === 'read') cardRef.current?.focus({ preventScroll: true });
  }, [stage]);

  // Subtle paper grain: two layered radial gradients — no image requests.
  const paperStyle: CSSProperties = {
    backgroundColor: theme.paper,
    backgroundImage: `radial-gradient(circle at 20% 15%, rgba(255,255,255,${dark ? 0.04 : 0.6}) 0, transparent 45%),
      radial-gradient(circle at 85% 90%, rgba(0,0,0,${dark ? 0.18 : 0.04}) 0, transparent 50%),
      radial-gradient(rgba(0,0,0,${dark ? 0.12 : 0.035}) 0.6px, transparent 0.6px)`,
    backgroundSize: '100% 100%, 100% 100%, 5px 5px',
    color: theme.ink,
  };

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ perspective: 1200 }}>
      <AnimatePresence mode="wait">
        {stage !== 'read' ? (
          <motion.button
            key="envelope"
            type="button"
            onClick={open}
            aria-label={`Open the card from ${sender}`}
            initial={reduced ? false : { opacity: 0, y: 24, rotate: -3 }}
            animate={stage === 'opening' ? { y: 40, opacity: 0, transition: { delay: 0.55, duration: 0.4 } } : { opacity: 1, y: 0, rotate: -2 }}
            exit={{ opacity: 0 }}
            whileHover={stage === 'sealed' && !reduced ? { rotate: 0, y: -4 } : undefined}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="group relative block w-full aspect-[7/5] cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-600"
          >
            {/* Envelope back + pocket */}
            <div className="absolute inset-0 rounded-2xl shadow-[0_24px_50px_-20px_rgba(41,37,36,0.45)]" style={{ background: theme.envelope }} />
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ background: theme.envelopeShade, clipPath: 'polygon(0 100%, 0 30%, 50% 68%, 100% 30%, 100% 100%)' }}
            />
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ background: theme.envelope, clipPath: 'polygon(0 100%, 50% 58%, 100% 100%)', filter: 'brightness(1.03)' }}
            />
            {/* Flap */}
            <motion.div
              className="absolute inset-x-0 top-0 h-[62%] origin-top"
              style={{ background: theme.envelopeShade, clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformStyle: 'preserve-3d' }}
              animate={stage === 'opening' ? { rotateX: 180 } : { rotateX: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* Seal */}
            <motion.div
              className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2"
              animate={stage === 'opening' ? { scale: 0, rotate: -40, opacity: 0 } : reduced ? undefined : { scale: [1, 1.06, 1] }}
              transition={stage === 'opening' ? { duration: 0.25 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <WaxSeal color={theme.seal} />
            </motion.div>
            {/* Address */}
            <div className="absolute inset-x-0 bottom-[9%] text-center px-6" style={{ color: theme.ink }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">A card from</p>
              <p className="font-cursive text-3xl leading-tight">{sender}</p>
            </div>
            <span className="absolute -bottom-9 inset-x-0 text-center text-sm font-semibold text-stone-600 dark:text-stone-300 group-hover:text-sage-700">
              Tap to open the card
            </span>
          </motion.button>
        ) : (
          <motion.article
            key="card"
            ref={cardRef}
            tabIndex={-1}
            aria-label={`Card from ${sender}`}
            initial={reduced ? false : { opacity: 0, y: 60, rotateX: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
            className="relative rounded-[22px] p-2 shadow-[0_30px_60px_-24px_rgba(41,37,36,0.5)] outline-none"
            style={paperStyle}
          >
            {/* Inner deckled frame */}
            <div className="relative rounded-[16px] px-6 sm:px-8 pt-8 pb-7 overflow-hidden" style={{ border: `1px solid ${theme.paperEdge}` }}>
              <div className="absolute inset-[6px] rounded-[12px] pointer-events-none" style={{ border: `1px dashed ${theme.paperEdge}` }} aria-hidden="true" />

              {/* Pressed-flower corners */}
              <Sprig assetId="flower-cherry-blossom" tint={dark ? '#F9A8D4' : '#F4A7B9'} className="absolute -top-3 -right-4 w-28 h-28 rotate-[200deg] opacity-80 pointer-events-none" />
              <Sprig assetId="filler-eucalyptus" tint={dark ? '#7C9A92' : '#9DB5AE'} className="absolute -bottom-6 -left-6 w-28 h-28 rotate-[35deg] opacity-60 pointer-events-none" />

              {/* Stamp */}
              <div
                className="absolute top-5 left-5 w-12 h-14 rotate-[-6deg] grid place-items-center"
                style={{
                  background: theme.paper,
                  border: `2px dotted ${theme.paperEdge}`,
                  boxShadow: `inset 0 0 0 3px ${theme.paper}, inset 0 0 0 4px ${theme.accent}33`,
                }}
                aria-hidden="true"
              >
                <Sprig assetId="flower-tulip" tint={theme.seal} className="w-8 h-8" />
              </div>

              <div className="relative text-center pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.muted }}>Dear</p>
                <h3 className="font-cursive text-[2.6rem] sm:text-5xl leading-tight mt-1" style={{ color: theme.ink }}>{recipient}</h3>

                <div className="flex items-center justify-center gap-3 my-4" aria-hidden="true">
                  <span className="h-px w-12" style={{ background: theme.paperEdge }} />
                  <svg viewBox="0 0 20 20" className="w-4 h-4" style={{ color: theme.accent }}>
                    <path d="M10 2 C11 7 13 9 18 10 C13 11 11 13 10 18 C9 13 7 11 2 10 C7 9 9 7 10 2Z" fill="currentColor" />
                  </svg>
                  <span className="h-px w-12" style={{ background: theme.paperEdge }} />
                </div>

                <p className="font-serif italic text-lg sm:text-xl leading-relaxed whitespace-pre-line break-words text-pretty" style={{ color: theme.ink }}>
                  <UnfurlingText text={message} reduced={reduced} delay={0.35} />
                </p>

                <div className="mt-7 text-right pr-1">
                  <p className="font-serif italic text-base" style={{ color: theme.muted }}>With love,</p>
                  <motion.p
                    className="font-cursive text-4xl leading-none mt-1"
                    style={{ color: theme.ink }}
                    initial={reduced ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduced ? 0 : 0.6 + Math.min(2.4, message.split(/\s+/).length * 0.06), duration: 0.6 }}
                  >
                    {sender}
                  </motion.p>
                  {date && <p className="mt-2 text-xs tracking-wide" style={{ color: theme.muted }}>{date}</p>}
                </div>
              </div>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
