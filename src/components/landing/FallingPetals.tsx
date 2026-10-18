import type { CSSProperties } from 'react';

// Fixed values (not Math.random) so server and client markup match.
const PETALS = [
  { left: 6, size: 14, dur: 15, delay: -2, drift: 60, color: '#F4A7B9' },
  { left: 18, size: 10, dur: 19, delay: -9, drift: -40, color: '#F7C59F' },
  { left: 31, size: 12, dur: 17, delay: -5, drift: 50, color: '#E8728F' },
  { left: 44, size: 9, dur: 21, delay: -14, drift: -30, color: '#F4A7B9' },
  { left: 57, size: 13, dur: 16, delay: -11, drift: 70, color: '#F7C59F' },
  { left: 69, size: 11, dur: 20, delay: -3, drift: -55, color: '#F4A7B9' },
  { left: 81, size: 15, dur: 18, delay: -7, drift: 40, color: '#E8728F' },
  { left: 93, size: 10, dur: 22, delay: -16, drift: -45, color: '#F7C59F' },
];

export default function FallingPetals() {
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
          } as CSSProperties}
        >
          <svg viewBox="0 0 20 26" width="100%" height="100%">
            <path d="M10 26 C2 18 0 8 10 0 C20 8 18 18 10 26Z" fill={p.color} />
          </svg>
        </span>
      ))}
    </div>
  );
}
