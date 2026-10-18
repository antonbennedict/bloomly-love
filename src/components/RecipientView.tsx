'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Flower2, Gift, Home, Loader2, RotateCcw, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { BouquetData } from '@/lib/supabase';
import { getAsset, type Asset } from '@/lib/assets-seed';
import FallingPetals from '@/components/landing/FallingPetals';
import GiftBox from '@/components/recipient/GiftBox';
import KeepsakeCard from '@/components/recipient/KeepsakeCard';

interface RecipientViewProps {
  initialBouquet: BouquetData | null;
  slug: string;
}

interface StoredElement {
  id: string;
  assetId: string;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  z?: number;
  tint?: string;
  customImageUrl?: string;
  flipX?: boolean;
  flipY?: boolean;
}

type Stage = 'closed' | 'opening' | 'open';

const CANVAS_BG: Record<string, string> = {
  default: 'bg-gradient-to-b from-white to-[#F6F0E8] border-stone-200/80 dark:from-stone-900 dark:to-stone-950 dark:border-stone-800',
  pink: 'bg-gradient-to-b from-rose-50 to-pink-100/70 border-rose-200/80 dark:from-rose-950/30 dark:to-stone-950 dark:border-rose-900/40',
  sage: 'bg-gradient-to-b from-emerald-50/80 to-[#E2EBE5] border-emerald-200/60 dark:from-emerald-950/30 dark:to-stone-950 dark:border-emerald-900/40',
  wood: 'bg-gradient-to-b from-amber-50 to-[#F3E3C3] border-amber-200/60 dark:from-[#2c1d11] dark:to-stone-950 dark:border-amber-900/30',
  dark: 'bg-gradient-to-b from-stone-800 to-stone-950 border-stone-700',
};

// Build order for the reveal: the wrap first, then greenery, flowers, and finishing touches.
const REVEAL_RANK: Record<Asset['category'], number> = { wrapper: 0, filler: 1, flower: 2, seasonal: 2, other: 2, accessory: 3 };

const PETAL_BURST = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.2;
  const dist = 140 + (i % 5) * 34;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist * 0.8 - 60,
    rotate: (i % 2 ? 1 : -1) * (160 + i * 12),
    color: ['#F4A7B9', '#E8728F', '#F7C59F', '#FBCFE8', '#F6C453'][i % 5],
    size: 10 + (i % 4) * 3,
  };
});

function celebrate() {
  const colors = ['#F4A7B9', '#E8728F', '#F7C59F', '#F6C453', '#86B394', '#FFFFFF'];
  const base = { colors, disableForReducedMotion: true, ticks: 220, gravity: 0.9, scalar: 0.95 };
  confetti({ ...base, particleCount: 70, spread: 80, startVelocity: 38, origin: { y: 0.55 } });
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
    confetti({ ...base, particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
  }, 450);
}

function BloomingBouquet({ elements, canvasBg, reduced }: { elements: StoredElement[]; canvasBg: string; reduced: boolean }) {
  const ordered = [...elements].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  const revealOrder = [...ordered]
    .sort((a, b) => {
      const ra = a.assetId === 'custom-upload' ? 2 : REVEAL_RANK[getAsset(a.assetId).category] ?? 2;
      const rb = b.assetId === 'custom-upload' ? 2 : REVEAL_RANK[getAsset(b.assetId).category] ?? 2;
      return ra - rb || (a.z ?? 0) - (b.z ?? 0);
    })
    .map(el => el.id);
  const step = Math.min(0.14, 2.2 / Math.max(elements.length, 1));

  return (
    <div className={`relative w-full aspect-[5/6] rounded-[2rem] border shadow-[0_40px_80px_-30px_rgba(41,37,36,0.35)] overflow-hidden ${CANVAS_BG[canvasBg] ?? CANVAS_BG.default}`}>
      <div className={`absolute inset-0 ${reduced ? '' : 'bouquet-sway'}`}>
        {ordered.map((el) => {
          const asset = getAsset(el.assetId);
          const isWrap = asset.category === 'wrapper' && el.assetId !== 'custom-upload';
          const order = revealOrder.indexOf(el.id);
          const scale = el.scale ?? 1;
          return (
            <div
              key={el.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${(el.x / 500) * 100}%`,
                top: `${(el.y / 600) * 100}%`,
                width: '19.2%',
                height: '16%',
                zIndex: el.z ?? 1,
                transform: `translate(-50%, -50%) rotate(${el.rotation ?? 0}deg) scale(${el.flipX ? -scale : scale}, ${el.flipY ? -scale : scale})`,
              }}
            >
              <motion.div
                className="w-full h-full"
                style={{ originX: 0.5, originY: isWrap ? 0.5 : 0.9 }}
                initial={reduced ? false : isWrap ? { opacity: 0, y: 30 } : { opacity: 0, scale: 0.2, rotate: -14 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={
                  isWrap
                    ? { delay: 0.15 + order * step, duration: 0.7, ease: [0.16, 1, 0.3, 1] }
                    : { delay: 0.15 + order * step, type: 'spring', stiffness: 150, damping: 12 }
                }
              >
                {el.assetId === 'custom-upload' ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL
                  <img src={el.customImageUrl} alt="" className="w-full h-full object-contain" draggable={false} />
                ) : (
                  <svg viewBox={asset.viewBox} className="w-full h-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.08)]" style={{ color: el.tint || asset.defaultColor }} aria-hidden="true">
                    <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
                  </svg>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RecipientView({ initialBouquet, slug }: RecipientViewProps) {
  const prefersReduced = useReducedMotion();
  const reduced = !!prefersReduced;
  const [bouquet, setBouquet] = useState<BouquetData | null>(initialBouquet);
  const [loading, setLoading] = useState(!initialBouquet);
  const [stage, setStage] = useState<Stage>('closed');
  const [cardOpened, setCardOpened] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const revealHeadingRef = useRef<HTMLHeadingElement>(null);

  // Client-side fallback lookup if the server fetch returned null
  useEffect(() => {
    if (bouquet || !slug) return;
    let cancelled = false;
    const lookup = async () => {
      let match: BouquetData | null = null;
      try {
        const list = JSON.parse(localStorage.getItem('bloomly_saved_bouquets') || '[]') as BouquetData[];
        match = list.find(b => b.slug === slug) ?? null;
      } catch (e) {
        console.error(e);
      }
      if (!match) {
        try {
          const data = await (await fetch(`/api/bouquets/${slug}`)).json();
          if (data.success && data.bouquet) match = data.bouquet;
        } catch (e) {
          console.error(e);
        }
      }
      if (cancelled) return;
      if (match) setBouquet(match);
      setLoading(false);
    };
    lookup();
    return () => { cancelled = true; };
  }, [slug, bouquet]);

  useEffect(() => {
    if (stage !== 'open') return;
    revealHeadingRef.current?.focus({ preventScroll: true });
    if (reduced) return;
    const t = window.setTimeout(celebrate, 900);
    return () => window.clearTimeout(t);
  }, [stage, reduced]);

  const openGift = () => {
    if (stage !== 'closed') return;
    if (reduced) {
      setStage('open');
      return;
    }
    setStage('opening');
    window.setTimeout(() => setStage('open'), 1500);
  };

  const replay = () => {
    setCardOpened(false);
    setStage('closed');
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || replyStatus === 'sending') return;
    setReplyStatus('sending');
    try {
      const res = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          replyText: replyText.trim(),
          recipientName: bouquet?.recipient_name || 'Recipient',
          senderName: bouquet?.sender_name || 'Creator',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReplyStatus('sent');
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply:', err);
      setReplyStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 p-6 text-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-10 h-10 text-sage-600 animate-spin" aria-hidden="true" />
        <p className="text-sm font-semibold text-stone-500" role="status">Finding your bouquet…</p>
      </div>
    );
  }

  if (!bouquet) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 p-6 text-center min-h-[calc(100vh-4rem)]">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-stone-900 border border-rose-100 dark:border-stone-800 grid place-items-center shadow-lg">
          <Gift className="w-10 h-10 text-rose-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">We couldn&apos;t find this bouquet</h1>
        <p className="text-[15px] text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
          The link may be incomplete — try copying it again from the message you received.
        </p>
        <Link href="/" className="min-h-12 px-6 bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm rounded-2xl inline-flex items-center gap-2 shadow-lg shadow-sage-600/20">
          <Home className="w-4 h-4" aria-hidden="true" /> Go to Bloomly
        </Link>
      </div>
    );
  }

  const elements = (Array.isArray(bouquet.composition) ? bouquet.composition : []) as StoredElement[];
  const [cardTheme = 'classic', canvasBg = 'default'] = (bouquet.card_style || 'classic').split('|');
  const recipient = bouquet.recipient_name || 'Someone special';
  const sender = bouquet.sender_name || 'A secret admirer';
  const message = bouquet.message || 'Thinking of you!';
  const hasTitle = bouquet.title && bouquet.title !== 'Custom Bouquet';

  return (
    <div className="flex-grow relative min-h-[calc(100vh-4rem)] overflow-clip bg-gradient-to-b from-[#FBF6EF] via-[#FDFBF8] to-[#F4EEE6] dark:from-stone-950 dark:via-stone-950 dark:to-stone-900">
      {/* Ambient light */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="ambient-blob absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/20" />
        <div className="ambient-blob ambient-blob--slow absolute -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20" />
      </div>
      <FallingPetals />

      <div className="relative z-10 flex flex-col items-center px-4 py-10 sm:py-14 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {stage !== 'open' ? (
            <motion.section
              key="gift"
              aria-labelledby="gift-title"
              className="my-auto w-full max-w-md flex flex-col items-center text-center"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={stage === 'opening' ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-stone-900/80 border border-sage-200 dark:border-stone-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sage-700 dark:text-sage-200 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> Special delivery
              </motion.p>
              <motion.h1
                id="gift-title"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={stage === 'opening' ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: stage === 'opening' ? 0 : 0.1 }}
                className="mt-5 font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-50 text-balance"
              >
                {recipient}, <span className="italic text-sage-600 dark:text-sage-200">this is for you</span>
              </motion.h1>
              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                animate={stage === 'opening' ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.6, delay: stage === 'opening' ? 0 : 0.25 }}
                className="mt-3 text-base sm:text-lg text-stone-600 dark:text-stone-400"
              >
                <strong className="font-semibold text-stone-800 dark:text-stone-200">{sender}</strong> wrapped up something special.
              </motion.p>

              <motion.button
                type="button"
                onClick={openGift}
                disabled={stage === 'opening'}
                aria-label={`Unwrap your gift from ${sender}`}
                initial={reduced ? false : { opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={stage === 'closed' && !reduced ? { scale: 1.04, rotate: -1.5 } : undefined}
                whileTap={stage === 'closed' && !reduced ? { scale: 0.97 } : undefined}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: reduced ? 0 : 0.2 }}
                className="relative mt-8 w-64 h-64 sm:w-72 sm:h-72 cursor-pointer rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-sage-600 disabled:cursor-default"
              >
                <div className={stage === 'closed' && !reduced ? 'gift-wiggle w-full h-full' : 'w-full h-full'}>
                  <GiftBox opening={stage === 'opening'} reduced={reduced} />
                </div>

                {/* Petal burst */}
                {stage === 'opening' && (
                  <div className="absolute left-1/2 top-[40%] pointer-events-none" aria-hidden="true">
                    {PETAL_BURST.map((p, i) => (
                      <motion.span
                        key={i}
                        className="absolute block rounded-[60%_0_60%_0]"
                        style={{ width: p.size, height: p.size * 1.3, background: p.color, marginLeft: -p.size / 2 }}
                        initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
                        animate={{ x: p.x, y: [0, p.y, p.y + 120], opacity: [0, 1, 0], rotate: p.rotate, scale: 1 }}
                        transition={{ duration: 1.3, delay: 0.45 + (i % 6) * 0.03, ease: 'easeOut' }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>

              <motion.p
                animate={stage === 'opening' ? { opacity: 0 } : { opacity: 1 }}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sage-700 dark:text-sage-200"
                aria-hidden="true"
              >
                <Gift className="w-4 h-4" /> Tap the gift to unwrap it
              </motion.p>
            </motion.section>
          ) : (
            <motion.section
              key="reveal"
              aria-labelledby="reveal-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="my-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] gap-12 lg:gap-16 items-start"
            >
              {/* Bouquet */}
              <div className="flex flex-col items-center text-center">
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-700 dark:text-sage-200"
                >
                  A bouquet from {sender}
                </motion.p>
                <motion.h1
                  id="reveal-title"
                  ref={revealHeadingRef}
                  tabIndex={-1}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 outline-none text-balance"
                >
                  {hasTitle ? bouquet.title : <>Freshly picked, <span className="italic text-sage-600 dark:text-sage-200">just for you</span></>}
                </motion.h1>

                <div className="mt-6 w-full max-w-[460px]">
                  <BloomingBouquet elements={elements} canvasBg={canvasBg} reduced={reduced} />
                </div>
                <p className="sr-only" role="status">Your bouquet has bloomed.</p>
              </div>

              {/* Card + reply */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduced ? 0 : 1.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center gap-14 pb-4 lg:pt-28"
              >
                <KeepsakeCard
                  themeKey={cardTheme}
                  recipient={recipient}
                  sender={sender}
                  message={message}
                  createdAt={bouquet.created_at}
                  reduced={reduced}
                  onOpened={() => setCardOpened(true)}
                />

                <AnimatePresence>
                  {cardOpened && (
                    <motion.div
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduced ? 0 : 1.2 }}
                      className="w-full max-w-md space-y-4"
                    >
                      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/85 dark:bg-stone-900/85 backdrop-blur p-5 shadow-sm">
                        {replyStatus === 'sent' ? (
                          <div role="status" className="flex items-start gap-3">
                            <span className="grid place-items-center w-9 h-9 rounded-full bg-sage-50 dark:bg-stone-800 shrink-0">
                              <Check className="w-5 h-5 text-sage-600" aria-hidden="true" />
                            </span>
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-stone-100">Your thank-you is on its way</p>
                              <p className="text-sm text-stone-500 dark:text-stone-400">{sender} will love hearing from you.</p>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSendReply}>
                            <label htmlFor="reply" className="block font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
                              Say thank you to {sender}
                            </label>
                            <div className="mt-3 flex gap-2">
                              <input
                                id="reply"
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="These made my day…"
                                maxLength={500}
                                className="flex-1 min-w-0 min-h-11 px-4 rounded-xl border border-stone-300 bg-white text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                              />
                              <button
                                type="submit"
                                disabled={replyStatus === 'sending' || !replyText.trim()}
                                className="min-h-11 shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {replyStatus === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                                Send
                              </button>
                            </div>
                            {replyStatus === 'error' && (
                              <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-300">That didn&apos;t send. Please try again in a moment.</p>
                            )}
                          </form>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={replay}
                          className="min-h-11 inline-flex items-center gap-2 px-4 rounded-xl text-sm font-semibold text-stone-700 hover:bg-white/70 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Unwrap it again
                        </button>
                        <Link
                          href="/create"
                          className="min-h-11 inline-flex items-center gap-2 px-4 rounded-xl border border-sage-600/30 bg-white/70 dark:bg-stone-900/70 text-sm font-semibold text-sage-700 dark:text-sage-200 hover:border-sage-600"
                        >
                          <Flower2 className="w-4 h-4" aria-hidden="true" /> Send a bouquet back
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
