'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, BookOpen, Compass, History, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/create', label: 'Create Bouquet', icon: Sparkles },
    { href: '/history', label: 'My History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sage-100 bg-white/80 backdrop-blur-md dark:bg-stone-900/80 dark:border-stone-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-sage-600 flex items-center justify-center text-white shadow-md shadow-sage-600/20 group-hover:scale-105 transition-transform">
            <Flower className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-serif font-bold text-lg tracking-wide text-sage-800 dark:text-sage-200">
            Bloomly
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="flex items-center gap-1 sm:gap-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-md shadow-sage-600/10'
                    : 'text-stone-600 hover:text-sage-700 hover:bg-sage-50/50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
