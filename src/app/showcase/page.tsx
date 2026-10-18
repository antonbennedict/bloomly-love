'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getPublicBouquets, BouquetData } from '@/lib/supabase';
import { getAsset } from '@/lib/assets-seed';
import { Heart, Compass, Gift, ChevronRight, MessageCircle, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ShowcasePage() {
  const [bouquets, setBouquets] = useState<BouquetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'love' | 'thanks' | 'birthday'>('all');
  const [isClearing, setIsClearing] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    const data = await getPublicBouquets();
    setBouquets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleClearGallery = async () => {
    if (!window.confirm("Are you sure you want to clear all gallery items? This will remove public bouquets from the showcase.")) return;
    setIsClearing(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bloomly_saved_bouquets');
      }
      await fetch('/api/bouquets', { method: 'DELETE' });
      setBouquets([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  // Filter public items based on keywords inside messages or titles
  const filteredBouquets = bouquets.filter(b => {
    if (filter === 'all') return true;
    const searchStr = `${b.title} ${b.message}`.toLowerCase();
    if (filter === 'love') {
      return searchStr.includes('love') || searchStr.includes('heart') || searchStr.includes('valentine') || searchStr.includes('admirer');
    }
    if (filter === 'thanks') {
      return searchStr.includes('thank') || searchStr.includes('appreciate') || searchStr.includes('grateful');
    }
    if (filter === 'birthday') {
      return searchStr.includes('birthday') || searchStr.includes('year') || searchStr.includes('happy');
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 dark:bg-stone-950">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title Header */}
        <div className="text-center space-y-3 mb-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-sage-100/60 dark:bg-stone-900/60 px-3 py-1.5 rounded-full text-sage-700 dark:text-sage-300 font-bold text-xs">
            <Compass className="w-3.5 h-3.5" /> Community Gallery
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-850 dark:text-stone-100">
            Showcase of affection
          </h1>
          <p className="text-sm text-stone-500">
            Browse through custom bouquets designed by other creators around the world. Get inspired and create your own!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={fetchGallery}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleClearGallery}
              disabled={isClearing}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Gallery
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center justify-start sm:justify-center gap-2 mb-8 border-b border-stone-200/40 pb-4 overflow-x-auto no-scrollbar py-1 px-1">
          {[
            { id: 'all', label: 'All Creations' },
            { id: 'love', label: 'Love & Romance' },
            { id: 'thanks', label: 'Thank You' },
            { id: 'birthday', label: 'Birthday Wishes' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shrink-0 whitespace-nowrap ${
                filter === btn.id
                  ? 'bg-sage-600 text-white shadow-md shadow-sage-600/15'
                  : 'bg-white hover:bg-stone-50 text-stone-600 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <svg className="animate-spin h-8 w-8 text-sage-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs font-semibold text-stone-500">Loading public showcase...</p>
          </div>
        ) : filteredBouquets.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-150 p-8 max-w-md mx-auto space-y-4">
            <Gift className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">No public bouquets found</h3>
            <p className="text-xs text-stone-400">
              Be the first to share your creation here! Make a bouquet and tick the "Opt-in to Community Showcase Gallery" box.
            </p>
            <Link 
              href="/create"
              className="inline-flex px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Create a Bouquet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBouquets.map((b) => {
              const elements = (b.composition as any[]) || [];
              const wrapperAsset = elements.find(el => {
                return getAsset(el.assetId).category === 'wrapper';
              });
              const wrapperColor = wrapperAsset ? wrapperAsset.tint : '#e2e8f0';

              return (
                <div 
                  key={b.slug}
                  className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 hover:border-sage-200 shadow-md shadow-stone-100/30 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
                >
                  
                  {/* Miniature Visual representation preview */}
                  <div className="aspect-[4/3] bg-sage-50/30 dark:bg-stone-950/40 relative overflow-hidden border-b border-stone-100/50">
                    {/* Same 5:6 coordinate box and proportional sizing as the builder, so previews match */}
                    <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 aspect-[5/6]">
                      {elements.map((el) => {
                        const asset = getAsset(el.assetId);
                        return (
                          <div 
                            key={el.id}
                            style={{
                              left: `${(el.x / 500) * 100}%`,
                              top: `${(el.y / 600) * 100}%`,
                              width: '19.2%',
                              height: '16%',
                              transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${el.flipX ? -(el.scale || 1) : (el.scale || 1)}, ${el.flipY ? -(el.scale || 1) : (el.scale || 1)})`,
                              zIndex: el.z,
                              position: 'absolute',
                            }}
                            className="pointer-events-none"
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

                  {/* Card Content info */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-sage-600 font-bold uppercase tracking-wider bg-sage-50 px-2 py-0.5 rounded-full dark:bg-stone-850">
                          {b.card_style} Theme
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Occasion
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-stone-850 dark:text-stone-200 mt-2 truncate group-hover:text-sage-600 transition-colors">
                        For: {b.recipient_name}
                      </h3>
                      <p className="text-xs text-stone-500 italic line-clamp-2 mt-1">
                        "{b.message}"
                      </p>
                    </div>

                    <div className="border-t border-stone-100 pt-3 flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-stone-450 font-bold">
                        By: <span className="text-stone-600 dark:text-stone-450 font-semibold">{b.sender_name}</span>
                      </span>
                      <Link 
                        href={`/b/${b.slug}`}
                        className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-0.5"
                      >
                        Reveal Gift <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
