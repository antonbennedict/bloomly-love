import type { CSSProperties } from 'react';

const OUTER = Array.from({ length: 8 }, (_, i) => i * 45);
const INNER = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);

// The Bloomly blossom: two rings of petals around a golden center.
// Petals carry the `.bloom-petal` class and a `--i` index so CSS can stagger them open.
export default function BloomMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-60 -60 120 120" className={className} aria-hidden="true" focusable="false">
      <g className="bloom-spin">
        {OUTER.map((deg, i) => (
          <g key={`o${deg}`} transform={`rotate(${deg})`}>
            <path
              className="bloom-petal"
              style={{ '--i': i } as CSSProperties}
              d="M0 -6 C-15 -16 -17 -40 0 -55 C17 -40 15 -16 0 -6Z"
              fill="#F4A7B9"
            />
          </g>
        ))}
        {INNER.map((deg, i) => (
          <g key={`i${deg}`} transform={`rotate(${deg})`}>
            <path
              className="bloom-petal"
              style={{ '--i': i + 4 } as CSSProperties}
              d="M0 -4 C-10 -12 -11 -29 0 -39 C11 -29 10 -12 0 -4Z"
              fill="#E8728F"
            />
          </g>
        ))}
        <circle className="bloom-center" r="11" fill="#F6C453" />
        <circle className="bloom-center" r="5" fill="#E0A526" />
      </g>
    </svg>
  );
}
