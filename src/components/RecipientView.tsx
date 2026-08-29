'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower, Gift, Sparkles, Mail, Heart, RefreshCw, Home, MessageSquare, Send, Check } from 'lucide-react';
import { BouquetData, getBouquetBySlug } from '@/lib/supabase';
import { SEEDED_ASSETS } from '@/lib/assets-seed';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface RecipientViewProps {
  initialBouquet: BouquetData | null;
  slug: string;
}

const CARD_THEME_MAP: Record<string, { bg: string, text: string, border: string }> = {
  classic: { bg: 'bg-[#FDFBF7]', text: 'text-stone-800', border: 'border-amber-900/10' },
  rose: { bg: 'bg-rose-50/90', text: 'text-rose-950', border: 'border-rose-200' },
  emerald: { bg: 'bg-[#1e2d24]', text: 'text-[#e2ebe5]', border: 'border-emerald-800' },
  royal: { bg: 'bg-[#1c1917]', text: 'text-amber-100', border: 'border-amber-500/30' },
  velvet: { bg: 'bg-purple-950/95', text: 'text-purple-100', border: 'border-purple-800/40' }
};

export default function RecipientView({ initialBouquet, slug }: RecipientViewProps) {
  const [bouquet, setBouquet] = useState<BouquetData | null>(initialBouquet);
  const [loading, setLoading] = useState(!initialBouquet);
  const [step, setStep] = useState<'closed' | 'opening' | 'open'>('closed');
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replySent, setReplySent] = useState(false);

  // Client-side fallback lookup if server fetch returned null
  useEffect(() => {
    if (!bouquet && slug) {
      // 1. Try local storage lookup directly in browser
      const localStored = localStorage.getItem('bloomly_saved_bouquets');
      if (localStored) {
        try {
          const list = JSON.parse(localStored);
          const match = list.find((b: any) => b.slug === slug);
          if (match) {
            setBouquet(match);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      // 2. Try async API endpoint lookup
      fetch(`/api/bouquets/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bouquet) {
            setBouquet(data.bouquet);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug, bouquet]);

  // Run celebration confetti on reveal
  useEffect(() => {
    if (step === 'open') {
      // Primary burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#4a6c57', '#f43f5e', '#ec4899', '#eab308', '#a855f7']
      });

      // Secondary staggered bursts
      const t1 = setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.65 }
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.65 }
        });
      }, 400);

      const t2 = setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 100,
          origin: { y: 0.4 },
          scalar: 1.2
        });
      }, 900);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [step]);

  const handleOpenBox = () => {
    setStep('opening');
    setTimeout(() => {
      setStep('open');
    }, 1400); // Animation reveal duration
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsReplying(true);
    setTimeout(() => {
      setIsReplying(false);
      setReplySent(true);
      setTimeout(() => setReplySent(false), 4000);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[calc(100vh-4rem)]">
        <div className="w-12 h-12 border-4 border-[#4a6c57] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest animate-pulse">Unwrapping Gift Link...</p>
      </div>
    );
  }

  if (!bouquet) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[calc(100vh-4rem)]">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-stone-900 border border-rose-100 dark:border-stone-800 flex items-center justify-center shadow-lg">
          <Gift className="w-10 h-10 text-rose-400 animate-bounce" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">Bouquet Not Found</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
          We couldn't find a bouquet for this link. It may have been created on another device, expired, or the link might contain a typo.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#4a6c57] hover:bg-[#3d5e48] text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#4a6c57]/20 cursor-pointer"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
      </div>
    );
  }

  const { composition, sender_name, recipient_name, message, card_style, title } = bouquet;
  const elements = composition as any[] || [];
  const [cardTheme, canvasBg] = (card_style || 'classic').split('|');
  const currentTheme = CARD_THEME_MAP[cardTheme] || CARD_THEME_MAP.classic;
  const activeCanvasBg = canvasBg || 'default';

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-tr from-sage-100/50 via-white to-pink-50/50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl filter animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-rose-200/40 blur-3xl filter animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: ELEGANT FORMAL GIFT ENVELOPE / BOX */}
        {step === 'closed' && (
          <motion.button
            key="closed-box"
            onClick={handleOpenBox}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="flex flex-col items-center justify-center cursor-pointer group select-none relative focus:outline-none max-w-sm w-full px-4"
          >
            {/* Top Notification Badge */}
            <div className="mb-6 animate-bounce">
              <span className="bg-[#4a6c57] text-white font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-200" /> You Received a Bouquet
              </span>
            </div>

            {/* Formal Gift Box Container */}
            <div className="w-full aspect-square max-w-[320px] bg-gradient-to-b from-[#fffdfa] to-[#f9f5f0] rounded-3xl shadow-2xl relative flex flex-col items-center justify-between p-8 border-2 border-[#4a6c57]/20 group-hover:border-[#4a6c57]/40 group-hover:shadow-3xl transition-all duration-300">
              
              {/* Top Accent Ribbon Bar */}
              <div className="w-full border-b border-[#4a6c57]/15 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4a6c57]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a6c57]">Special Delivery</span>
                </div>
                <span className="text-[10px] font-serif italic text-stone-400">Bloomly Gift</span>
              </div>

              {/* Central Formal Gift Icon & Card Name */}
              <div className="my-auto py-6 flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#4a6c57]/10 flex items-center justify-center border border-[#4a6c57]/20 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-10 h-10 text-[#4a6c57] drop-shadow-sm" />
                </div>
                
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Prepared For</p>
                  <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 group-hover:text-[#4a6c57] transition-colors">
                    {recipient_name || 'Someone Special'}
                  </h3>
                </div>
              </div>

              {/* Bottom Interactive CTA Strip */}
              <div className="w-full bg-[#4a6c57] text-white py-3 px-4 rounded-2xl flex items-center justify-center gap-2 group-hover:bg-[#3d5e48] transition-colors shadow-md">
                <span className="text-xs font-bold tracking-wider uppercase">Tap to Open Gift Box</span>
              </div>
            </div>
          </motion.button>
        )}


        {/* STEP 2: OPENING ANIMATION STAGE */}
        {step === 'opening' && (
          <motion.div
            key="opening-stage"
            className="flex flex-col items-center justify-center space-y-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Lid explodes upward */}
              <motion.div
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{ y: -220, opacity: 0, rotate: 25, scale: 1.2 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute top-0 w-64 h-16 bg-rose-400 rounded-t-3xl border-b-4 border-rose-600 z-20 flex justify-center shadow-2xl"
              >
                <div className="absolute -top-4 w-12 h-10 bg-amber-400 rounded-full rotate-45" />
              </motion.div>

              {/* Glowing Burst Rays */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 2.5, opacity: 1 }}
                transition={{ duration: 0.9 }}
                className="absolute inset-0 bg-gradient-to-r from-amber-300/60 via-pink-400/60 to-emerald-300/60 rounded-full blur-2xl z-0"
              />

              {/* Base box dissolves */}
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="w-60 h-60 bg-rose-500 rounded-b-3xl relative z-10 shadow-xl"
              />
            </div>
            <p className="text-sm font-serif italic text-[#3d5e48] dark:text-sage-300 animate-pulse font-bold">Unwrapping your custom flowers...</p>
          </motion.div>
        )}

        {/* STEP 3: FULL HERO BOUQUET STAGE WITH POP-UP CARD MODAL */}
        {step === 'open' && (
          <motion.div
            key="open-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl flex flex-col items-center justify-center relative min-h-[80vh] py-6"
          >
            {/* Ambient Floating Sun & Cloud background graphics */}
            <div className="absolute top-2 inset-x-0 flex items-center justify-between pointer-events-none opacity-80 px-8">
              <div className="flex items-center gap-2 bg-amber-100/60 dark:bg-stone-800/60 px-4 py-2 rounded-full border border-amber-200/50 backdrop-blur">
                <span className="text-amber-500 text-lg">☀️</span>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Warm Wishes</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 dark:bg-stone-800/70 px-4 py-2 rounded-full border border-stone-200/50 backdrop-blur">
                <span className="text-stone-400 text-sm">☁️</span>
                <span className="text-xs font-semibold text-stone-500">Bloomly Gift</span>
              </div>
            </div>

            {/* Central Bouquet Showcase */}
            <div className="flex flex-col items-center relative my-auto w-full px-4 sm:px-0">
              <div 
                className={`w-full max-w-[420px] aspect-[5/6] rounded-3xl shadow-2xl border-2 relative overflow-hidden transition-all duration-300 ${
                  activeCanvasBg === 'default' ? 'bg-white dark:bg-[#141211] border-stone-200/80 canvas-grid dark:border-stone-800' :
                  activeCanvasBg === 'pink' ? 'bg-rose-50 border-rose-200/80 dark:bg-rose-950/20 dark:border-rose-900/40' :
                  activeCanvasBg === 'sage' ? 'bg-emerald-50/70 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40' :
                  activeCanvasBg === 'wood' ? 'bg-amber-50/80 border-amber-200/50 dark:bg-[#2c1d11] dark:border-amber-900/30' :
                  'bg-stone-900 border-stone-700 dark:bg-stone-950 dark:border-stone-800 text-white'
                }`}
              >
                {elements
                  .sort((a, b) => a.z - b.z)
                  .map((el) => {
                    const asset = SEEDED_ASSETS.find(a => a.id === el.assetId);
                    return (
                      <div
                        key={el.id}
                        style={{
                          left: `${(el.x / 500) * 100}%`,
                          top: `${(el.y / 600) * 100}%`,
                          transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${el.flipX ? -(el.scale || 1) : (el.scale || 1)}, ${el.flipY ? -(el.scale || 1) : (el.scale || 1)})`,
                          zIndex: el.z || 1,
                          position: 'absolute',
                          width: '19.2%', // (96px / 500px) * 100% = 19.2% exact proportional match to Builder
                          height: '16.0%', // (96px / 600px) * 100% = 16.0% exact proportional match to Builder
                        }}
                        className="pointer-events-none select-none drop-shadow-xl flex items-center justify-center"
                      >
                        {el.assetId === 'custom-upload' ? (
                          <img src={el.customImageUrl} alt="" className="w-full h-full object-contain" />
                        ) : asset ? (
                          <svg viewBox={asset.viewBox} className="w-full h-full" style={{ color: el.tint }}>
                            <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
                          </svg>
                        ) : null}
                      </div>
                    );
                  })}
              </div>

              {/* Title & Pop-up Card Trigger Button */}
              <div className="mt-6 text-center space-y-3">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">
                    {title || 'A Custom Bouquet'}
                  </h2>
                  <p className="text-sm text-stone-500 font-medium mt-1">
                    Crafted with love for <strong className="text-[#4a6c57]">{recipient_name || 'Someone Special'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setIsCardOpen(true)}
                  className="bg-[#4a6c57] hover:bg-[#3d5e48] text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-[#4a6c57]/25 flex items-center gap-2.5 mx-auto text-sm transition-all hover:scale-105 cursor-pointer"
                >
                  <Mail className="w-5 h-5" /> Open Personal Keepsake Card
                </button>
              </div>
            </div>

            {/* POP-UP CARD MODAL */}
            {isCardOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 30 }}
                  className="bg-[#FAF6F0] text-stone-850 rounded-3xl max-w-xl w-full p-8 border-2 border-amber-900/20 shadow-2xl relative space-y-6"
                >
                  {/* Close button */}
                  <button 
                    onClick={() => setIsCardOpen(false)}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-amber-900/10 hover:bg-amber-900/20 flex items-center justify-center text-amber-950 font-bold text-xs transition-colors cursor-pointer z-10"
                  >
                    ✕
                  </button>

                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-amber-900/10 pb-3 pr-10">
                    <Mail className="w-4 h-4 text-amber-800" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/70">Personal Card</span>
                    <span className="ml-auto text-[9px] font-mono tracking-widest text-amber-800/60 uppercase border border-amber-900/20 px-2 py-0.5 rounded">AIR MAIL</span>
                  </div>

                  {/* Recipient */}
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-900/60">Dearest</span>
                    <h3 className="text-2xl font-serif font-bold text-amber-950">
                      {recipient_name || 'Someone Special'}
                    </h3>
                  </div>

                  {/* Cursive Message */}
                  <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-amber-900/10 shadow-inner">
                    <p className="font-cursive text-3xl leading-relaxed text-amber-950 whitespace-pre-line">
                      "{message || 'Thinking of you and sending custom floral wishes!'}"
                    </p>
                  </div>

                  {/* Sender */}
                  <div className="flex items-center justify-between border-t border-amber-900/10 pt-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-900/60">With All My Love,</span>
                      <p className="font-cursive text-3xl text-amber-950 leading-none mt-1">{sender_name || 'A Secret Admirer'}</p>
                    </div>
                    <Heart className="w-6 h-6 text-rose-600 fill-rose-600 animate-pulse" />
                  </div>

                  {/* Reply Section inside Modal */}
                  <div className="bg-white/80 p-4 rounded-2xl border border-amber-900/10 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Reply to {sender_name || 'Sender'}</span>
                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Say thank you..."
                        className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#4a6c57]/40"
                      />
                      <button
                        type="submit"
                        disabled={isReplying || !replyText.trim()}
                        className="bg-[#4a6c57] hover:bg-[#3d5e48] text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shrink-0 disabled:opacity-40"
                      >
                        {isReplying ? '...' : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </form>
                    {replySent && (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Reply Sent!
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex gap-3 max-w-sm w-full mt-4">
              <Link
                href="/create"
                className="flex-1 bg-[#4a6c57] hover:bg-[#3d5e48] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#4a6c57]/20 text-xs transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Flower className="w-4 h-4" /> Create Bouquet
              </Link>
              <Link
                href={`/create?replyTo=${encodeURIComponent(sender_name || 'Guest')}`}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all hover:scale-[1.01] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reply Bouquet
              </Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
