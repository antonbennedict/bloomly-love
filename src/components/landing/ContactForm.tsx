'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitFeedback } from '@/lib/supabase';

const fieldClass =
  'w-full text-base sm:text-sm px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 transition-shadow';
const labelClass = 'block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    const ok = await submitFeedback(name, email, message);
    if (!ok) {
      setStatus('error');
      return;
    }
    setStatus('sent');
    setName('');
    setEmail('');
    setMessage('');
  };

  if (status === 'sent') {
    return (
      <div role="status" className="bg-sage-50 dark:bg-stone-900 border border-sage-200 dark:border-stone-800 p-8 rounded-3xl text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-sage-600 mx-auto" aria-hidden="true" />
        <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">Thank you — we got your note</h3>
        <p className="text-[15px] text-stone-600 dark:text-stone-400">We read every message, and the best ideas end up in the garden.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-sm font-semibold text-sage-700 dark:text-sage-200 underline underline-offset-4 hover:no-underline cursor-pointer"
        >
          Send another note
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-5 shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>Name</label>
          <input id="contact-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>Email</label>
          <input id="contact-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>Message</label>
        <textarea
          id="contact-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A flower you'd love to see, a bug you spotted, or just hello…"
          rows={4}
          className={`${fieldClass} resize-y min-h-28`}
        />
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-400">
          Your note didn&apos;t send. Please check your connection and try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full min-h-12 bg-sage-600 hover:bg-sage-700 text-white font-semibold text-[15px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-sage-600/15 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
      >
        {status === 'sending' ? (
          <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…</>
        ) : (
          <><Send className="w-4 h-4" aria-hidden="true" /> Send note</>
        )}
      </button>
    </form>
  );
}
