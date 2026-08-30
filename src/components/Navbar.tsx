'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, BookOpen, Compass, History, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/create', label: 'Create', icon: Sparkles },
    { href: '/showcase', label: 'Gallery', icon: Compass },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sage-100 bg-white/90 backdrop-blur-md dark:bg-stone-900/90 dark:border-stone-850">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        {pathname.startsWith('/b/') ? (
          <div className="flex items-center gap-2 select-none shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sage-600 flex items-center justify-center text-white shadow-md shadow-sage-600/20">
              <Flower className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-sage-800 dark:text-sage-200">
              Bloomly
            </span>
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sage-600 flex items-center justify-center text-white shadow-md shadow-sage-600/20 group-hover:scale-105 transition-transform">
              <Flower className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-sage-800 dark:text-sage-200">
              Bloomly
            </span>
          </Link>
        )}

        {/* NAVIGATION LINKS */}
        {!pathname.startsWith('/b/') && (
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-sage-600 text-white shadow-md shadow-sage-600/10'
                      : 'text-stone-600 hover:text-sage-700 hover:bg-sage-50/50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
