'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import InlineScript from './InlineScript';
import BloomMark from './BloomMark';

// Must match the timeline in globals.css (exit starts at 2.0s and lasts 0.6s).
const INTRO_MS = 2600;
const SKIP_MS = 320;
const WORDMARK = 'Bloomly'.split('');

// Decides before first paint whether the splash plays: on every full page load (including reloads),
// never with reduced motion. Writes the decision to the wrapper so CSS can show the splash and delay the hero.
const DECIDE = `(function(){var r=document.currentScript&&document.currentScript.parentElement;if(!r)return;var d='play';try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)d='skip'}catch(e){}r.setAttribute('data-intro',d)})()`;

type Phase = 'playing' | 'leaving' | 'done';

export default function IntroGate({ children, className = '' }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('playing');

  // Full loads: the inline script already decided. In-app navigations back to home (script doesn't run)
  // skip the splash so clicking the logo doesn't replay it — decided here, still before paint.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root && !root.dataset.intro) root.dataset.intro = 'skip';
  }, []);

  useEffect(() => {
    if (rootRef.current?.dataset.intro !== 'play') return;
    const timer = window.setTimeout(() => setPhase('done'), INTRO_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const skip = useCallback(() => {
    const root = rootRef.current;
    if (!root || root.dataset.intro !== 'play') return;
    // Collapses the hero's entrance delay so the page doesn't sit empty after skipping.
    root.dataset.intro = 'skipped';
    setPhase('leaving');
    window.setTimeout(() => setPhase('done'), SKIP_MS);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, skip]);

  return (
    <div ref={rootRef} className={`landing ${className}`} suppressHydrationWarning>
      <InlineScript html={DECIDE} />

      {phase !== 'done' && (
        <div className="bloomly-intro" data-leaving={phase === 'leaving' ? '' : undefined} onClick={skip}>
          <div className="bloomly-intro__stage" aria-hidden="true">
            <BloomMark className="bloomly-intro__flower" />
            <p className="bloomly-intro__word font-serif">
              {WORDMARK.map((ch, i) => (
                <span key={i} style={{ '--i': i } as CSSProperties}>
                  {ch}
                </span>
              ))}
            </p>
            <p className="bloomly-intro__tag">Flowers that never wilt</p>
          </div>
          <button type="button" onClick={skip} className="bloomly-intro__skip">
            Skip intro
          </button>
        </div>
      )}

      {children}
    </div>
  );
}
