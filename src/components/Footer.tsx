'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, Heart, Sparkles, History } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const isRecipientPage = pathname?.startsWith('/b/');

  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-850 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-850">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sage-600 flex items-center justify-center text-white shadow-lg shadow-sage-600/20">
              <Flower className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-wide text-white">Bloomly</span>
              <p className="text-[10px] text-stone-500 font-medium">Digital Floral Keepsakes</p>
            </div>
          </div>

          {/* Quick Links (Hidden for Recipient view) */}
          {!isRecipientPage && (
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-xs font-semibold">
              <Link href="/create" className="hover:text-sage-400 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage-500" /> Create Bouquet
              </Link>
              <Link href="/history" className="hover:text-sage-400 transition-colors flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sage-500" /> My History
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-500 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} Bloomly. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-stone-400 bg-stone-900/80 px-4 py-2 rounded-full border border-stone-800 shadow-inner text-xs font-semibold">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by <strong className="text-white">ton</strong></span>
          </div>
        </div>

      </div>
    </footer>
  );
}
