'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        const buttonId = `${baseId}-q${idx}`;
        const panelId = `${baseId}-a${idx}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full min-h-14 py-5 flex items-center justify-between gap-6 text-left font-serif font-semibold text-base sm:text-lg text-stone-900 dark:text-stone-100 hover:text-sage-700 dark:hover:text-sage-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-600 rounded-sm"
              >
                <span>{item.q}</span>
                <span
                  className={`shrink-0 grid place-items-center w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-sage-600 border-sage-600 text-white' : 'text-stone-500'}`}
                  aria-hidden="true"
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-12 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
