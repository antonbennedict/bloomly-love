'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getPublicBouquets, submitFeedback, BouquetData } from '@/lib/supabase';
import { SEEDED_ASSETS } from '@/lib/assets-seed';
import { 
  Flower, 
  Sparkles, 
  Mail, 
  ChevronRight, 
  ChevronDown, 
  Send, 
  Gift, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [gallery, setGallery] = useState<BouquetData[]>([]);
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPublicBouquets().then(data => setGallery(data.slice(0, 3)));
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    
    setIsSubmitting(true);
    const ok = await submitFeedback(name, email, message);
    setIsSubmitting(false);
    
    if (ok) {
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  const faqs = [
    {
      q: "Do I need to sign up for an account to create a bouquet?",
      a: "No! Bloomly is designed for instant expression. You can design, write letters, and share complete bouquets with zero sign-up friction. An anonymous user ID will keep your creations linked to your browser session."
    },
    {
      q: "How does the recipient open my bouquet?",
      a: "When they click your share link, they'll see an unboxing animation of a closed gift box. Clicking the box unfolds the wrappers, blooms the flowers in a staggered sequence, and reveals your handwritten letter."
    },
    {
      q: "Can I edit my bouquet after sharing it?",
      a: "Yes! If you open the link from the same browser you created it on, you'll be able to re-edit or modify it, or save the updated card."
    },
    {
      q: "Is it possible to download my bouquet as an image?",
      a: "Yes! Once you finish building, we generate a unique share link and a scanable QR code which you can download as a high-resolution PNG for letters, prints, or physical gifts."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-tr from-sage-50/50 via-white to-pink-50/40 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Column 1: Hero Copy & CTA */}
            <div className="lg:col-span-7 text-left space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                Design & Share Virtual <span className="text-sage-600 italic">Flower Bouquets</span>
              </h1>
              
              <p className="text-sm sm:text-lg text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
                Hand-select flowers, write a heartfelt message, and wrap it beautifully. Share your customized gift box via link, direct email, or scanable QR code in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link
                  href="/create"
                  className="bg-sage-600 hover:bg-sage-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sage-600/15 transition-all hover:scale-[1.01] cursor-pointer text-sm w-full sm:w-auto"
                >
                  Create a Bouquet <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Column 2: visual bouquet mockup preview */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[320px] h-80 sm:h-96 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-850 p-5 sm:p-6 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                {/* Visual bouquet mockup with absolute items */}
                <div className="absolute inset-0 scale-[0.8] origin-center -translate-y-8 flex items-center justify-center pointer-events-none">
                  {/* Eucalyptus filler behind */}
                  <div className="absolute w-24 h-24 text-stone-400 left-[60px] top-[80px] rotate-[-25deg]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <g dangerouslySetInnerHTML={{ __html: SEEDED_ASSETS[6].svgMarkup }} />
                    </svg>
                  </div>
                  {/* Wrapping paper base */}
                  <div className="absolute w-36 h-36 text-[#D97706] left-[90px] top-[180px] scale-[1.3] z-[1]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <g dangerouslySetInnerHTML={{ __html: SEEDED_ASSETS[8].svgMarkup }} />
                    </svg>
                  </div>
                  {/* Rose flower */}
                  <div className="absolute w-24 h-24 text-[#E11D48] left-[130px] top-[85px] rotate-[5deg] z-[2]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <g dangerouslySetInnerHTML={{ __html: SEEDED_ASSETS[0].svgMarkup }} />
                    </svg>
                  </div>
                  {/* Tulip flower */}
                  <div className="absolute w-24 h-24 text-[#EC4899] left-[85px] top-[110px] rotate-[-20deg] z-[3]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <g dangerouslySetInnerHTML={{ __html: SEEDED_ASSETS[1].svgMarkup }} />
                    </svg>
                  </div>
                  {/* Sunflower flower */}
                  <div className="absolute w-24 h-24 text-[#EAB308] left-[180px] top-[125px] rotate-[20deg] z-[4]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <g dangerouslySetInnerHTML={{ __html: SEEDED_ASSETS[2].svgMarkup }} />
                    </svg>
                  </div>
                </div>

                {/* Floating card indicator */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#FDFBF7] dark:bg-stone-950 p-4 rounded-2xl border border-amber-900/10 dark:border-stone-800 shadow-lg text-left mt-auto">
                  <span className="text-[9px] font-bold text-sage-600 dark:text-sage-400 uppercase tracking-widest">Unbox digital love</span>
                  <p className="font-serif italic text-xs text-stone-750 dark:text-stone-300 mt-1">"Reveal your flower arrangement and read the custom card letter..."</p>
                </div>
              </div>

              {/* Ambient sparkles */}
              <div className="absolute -top-6 -right-6 w-12 h-12 text-yellow-400 animate-pulse">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <g dangerouslySetInnerHTML={{ __html: SEEDED_ASSETS[10].svgMarkup }} />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-1/2 w-48 h-48 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-sage-600 fill-current">
            <path d="M50,15 C55,40 25,40 50,65 C50,40 75,40 50,15 Z" />
          </svg>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-serif font-bold text-stone-850 dark:text-stone-100">How it works</h2>
            <p className="text-sm text-stone-500">Creating and sharing digital affection has never been this simple.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Design the Bouquet",
                desc: "Choose from original hand-drawn flowers, wrappers, and fillers. Drag, rotate, scale and arrange them on the canvas.",
                icon: Flower,
                color: "bg-sage-50 text-sage-600 dark:bg-stone-850"
              },
              {
                num: "02",
                title: "Write a Letter",
                desc: "Type a heartfelt note, name the sender/recipient, and select a card visual theme palette to express the occasion.",
                icon: Mail,
                color: "bg-pink-50 text-pink-600 dark:bg-stone-850"
              },
              {
                num: "03",
                title: "Deliver the Joy",
                desc: "Instantly generate a private link and downloadable QR code. Send it via email or messaging clients.",
                icon: Gift,
                color: "bg-amber-50 text-amber-600 dark:bg-stone-850"
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-stone-50/50 dark:bg-stone-950/20 p-8 rounded-3xl border border-stone-100/80 dark:border-stone-850/80 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-bold text-stone-300 dark:text-stone-700">{step.num}</span>
                    <div className={`p-3 rounded-2xl ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">{step.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* FAQ ACCORDION SECTION */}
      <section className="py-20 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-850">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-serif font-bold text-stone-850 dark:text-stone-100">Got questions?</h2>
            <p className="text-sm text-stone-500">Everything you need to know about Bloomly.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-serif font-bold text-sm text-stone-850 dark:text-stone-200 hover:bg-stone-50/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-stone-500 leading-relaxed border-t border-stone-50 bg-stone-50/10 dark:border-stone-850">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT / FEEDBACK FORM */}
      <section className="py-20 bg-slate-50/20 dark:bg-stone-950/20 border-t border-stone-100 dark:border-stone-850">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl font-serif font-bold text-stone-850 dark:text-stone-100">Send a note to the florist</h2>
            <p className="text-sm text-stone-500">Have suggestions, feedback, or custom requests? Drop us a line.</p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-3xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold">Feedback Sent!</h3>
              <p className="text-xs">Thank you for sharing your thoughts. We will review it shortly!</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent dark:border-stone-800 dark:bg-stone-950/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent dark:border-stone-800 dark:bg-stone-950/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent resize-none dark:border-stone-800 dark:bg-stone-950/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-sage-600/10 active:scale-[0.99] transition-all cursor-pointer disabled:bg-stone-300"
              >
                {isSubmitting ? 'Sending...' : <><Send className="w-3.5 h-3.5" /> Submit Feedback</>}
              </button>
            </form>
          )}
        </div>
      </section>


    </div>
  );
}
