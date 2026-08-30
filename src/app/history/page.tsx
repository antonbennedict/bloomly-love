'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getUserHistory, getAnonymousSession, BouquetData } from '@/lib/supabase';
import { SEEDED_ASSETS } from '@/lib/assets-seed';
import { History, Eye, ArrowRight, Calendar, Heart, Flower } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [bouquets, setBouquets] = useState<BouquetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const userId = await getAnonymousSession();
      const data = await getUserHistory(userId);
      setBouquets(data);
      setLoading(false);
    }
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-stone-950">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200/50 pb-8 mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-sage-100/60 dark:bg-stone-900/60 px-3 py-1.5 rounded-full text-sage-700 dark:text-sage-300 font-bold text-xs">
              <History className="w-3.5 h-3.5" /> Creation History
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-850 dark:text-stone-100">
              My Bouquet Ledger
            </h1>
            <p className="text-xs text-stone-400 max-w-md">
              For guest creators, history is tracked automatically in your browser's local cache. If you clean cache, these will vanish unless they are public.
            </p>
          </div>
          <Link
            href="/create"
            className="self-start md:self-center px-4 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            Create New Bouquet
          </Link>
        </div>

        {/* HISTORY LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <svg className="animate-spin h-8 w-8 text-sage-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs font-semibold text-stone-500">Retrieving history...</p>
          </div>
        ) : bouquets.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-stone-900 border border-stone-150 rounded-3xl p-8 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-sage-50 mx-auto flex items-center justify-center text-sage-600">
              <Flower className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">No creations saved</h3>
            <p className="text-xs text-stone-450">
              You haven't wrapped any bouquets yet. Design a digital bouquet, add a card and share it!
            </p>
            <Link 
              href="/create"
              className="inline-flex px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Start Designing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bouquets.map((b) => {
              const elements = (b.composition as any[]) || [];
              const dateStr = b.created_at ? new Date(b.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Recently';

              return (
                <div 
                  key={b.slug}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 hover:border-sage-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    
                    {/* Tiny composition icon bundle */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sage-50/50 dark:bg-stone-950/30 rounded-xl overflow-hidden relative shrink-0 border border-stone-100 flex items-center justify-center">
                      <div className="absolute inset-0 scale-[0.45] origin-center flex items-center justify-center">
                        {elements.slice(0, 5).map((el) => {
                          const asset = SEEDED_ASSETS.find(a => a.id === el.assetId);
                          return (
                            <div 
                              key={el.id}
                              style={{
                                left: `${(el.x / 500) * 100}%`,
                                top: `${(el.y / 600) * 100}%`,
                                transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scale})`,
                                zIndex: el.z,
                                position: 'absolute',
                              }}
                              className="w-16 h-16 pointer-events-none"
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
                    </div>

                    {/* Metadata details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-stone-850 dark:text-stone-200 text-sm truncate group-hover:text-sage-600 transition-colors">
                        For: {b.recipient_name}
                      </h3>
                      <p className="text-xs text-stone-500 italic truncate max-w-[180px] sm:max-w-[200px] mt-0.5">
                        "{b.message}"
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {dateStr}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          b.is_public ? 'bg-sage-50 text-sage-600 dark:bg-stone-850' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {b.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Open details actions */}
                  <Link
                    href={`/b/${b.slug}`}
                    className="self-end sm:self-center px-4 py-2 bg-sage-50 hover:bg-sage-100 text-sage-700 rounded-xl transition-all group-hover:bg-sage-600 group-hover:text-white flex items-center gap-1.5 text-xs font-bold shrink-0"
                  >
                    <span>View</span>
                    <Eye className="w-4 h-4" />
                  </Link>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
