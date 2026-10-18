import type { CSSProperties } from 'react';

// Animation delays (seconds) are passed via `--d`; globals.css adds the intro offset on top.
const d = (seconds: number, extra?: Record<string, number>) => ({ '--d': `${seconds}s`, ...extra }) as CSSProperties;

function Blossom({ x, y, scale, petals, petal, inner, center, delay }: {
  x: number; y: number; scale: number; petals: number;
  petal: string; inner: string; center: string; delay: number;
}) {
  const step = 360 / petals;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {Array.from({ length: petals }, (_, i) => (
        <g key={`o${i}`} transform={`rotate(${i * step})`}>
          <path className="bq-petal" style={d(delay, { '--i': i })} d="M0 -5 C-15 -15 -17 -40 0 -54 C17 -40 15 -15 0 -5Z" fill={petal} />
        </g>
      ))}
      {Array.from({ length: petals }, (_, i) => (
        <g key={`i${i}`} transform={`rotate(${i * step + step / 2})`}>
          <path className="bq-petal" style={d(delay + 0.15, { '--i': i })} d="M0 -4 C-9 -11 -11 -27 0 -36 C11 -27 9 -11 0 -4Z" fill={inner} />
        </g>
      ))}
      <circle className="bq-pop" style={d(delay + 0.45)} r="11" fill={center} />
    </g>
  );
}

function Daisy({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 30})`}>
          <path className="bq-petal" style={d(delay, { '--i': i * 0.6 })} d="M0 -6 C-6 -14 -6 -34 0 -40 C6 -34 6 -14 0 -6Z" fill="#FFFDF8" stroke="#EADFCB" strokeWidth="1" />
        </g>
      ))}
      <circle className="bq-pop" style={d(delay + 0.4)} r="10" fill="#F2B632" />
    </g>
  );
}

function Leaf({ x, y, rotate, delay }: { x: number; y: number; rotate: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path className="bq-leaf" style={d(delay)} d="M0 0 C8 -14 30 -17 42 -6 C30 3 13 6 0 0Z" fill="#7FA88A" />
      <path className="bq-leaf" style={d(delay + 0.05)} d="M2 -1 C14 -6 26 -7 38 -6" stroke="#5E8A6C" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        className="bq-sparkle"
        style={d(delay)}
        d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10Z"
        fill="#E9B949"
      />
    </g>
  );
}

export default function BloomBouquet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 440" className={className} role="img" aria-labelledby="bq-title">
      <title id="bq-title">A hand-drawn bouquet of pink, peach and white flowers blooming in kraft wrapping paper</title>

      {/* Soft halo */}
      <circle cx="180" cy="170" r="150" fill="url(#bq-halo)" className="bq-fade" style={d(0)} />

      {/* Back wrap */}
      <path className="bq-rise" style={d(0.05)} d="M78 236 L282 236 L198 424 L162 424 Z" fill="#E9D8BE" />

      {/* Stems, leaves and blooms sway together from the base */}
      <g className="bq-sway" style={d(2.2)}>
        <g fill="none" stroke="#5F8A6C" strokeWidth="4" strokeLinecap="round">
          <path className="bq-stem" style={d(0.25)} pathLength={1} d="M180 350 C180 290 178 210 180 140" />
          <path className="bq-stem" style={d(0.35)} pathLength={1} d="M176 350 C160 296 126 236 108 186" />
          <path className="bq-stem" style={d(0.4)} pathLength={1} d="M184 350 C202 296 236 236 254 180" />
          <path className="bq-stem" style={d(0.5)} pathLength={1} d="M178 350 C170 300 150 270 136 250" />
          <path className="bq-stem" style={d(0.55)} pathLength={1} d="M182 350 C192 300 214 268 230 250" />
        </g>

        <Leaf x={172} y={262} rotate={-150} delay={0.85} />
        <Leaf x={186} y={240} rotate={-30} delay={0.9} />
        <Leaf x={140} y={232} rotate={-120} delay={0.95} />
        <Leaf x={222} y={226} rotate={-55} delay={1.0} />

        {/* Buds */}
        <g transform="translate(136 246)">
          <ellipse className="bq-pop" style={d(1.05)} rx="8" ry="11" fill="#F4A7B9" />
        </g>
        <g transform="translate(230 246)">
          <ellipse className="bq-pop" style={d(1.1)} rx="7" ry="10" fill="#F7C59F" />
        </g>

        <Daisy x={108} y={180} scale={0.78} delay={1.15} />
        <Blossom x={254} y={176} scale={0.72} petals={6} petal="#F7C59F" inner="#F09A6B" center="#C8663C" delay={1.25} />
        <Blossom x={180} y={130} scale={1} petals={8} petal="#F4A7B9" inner="#E8728F" center="#F6C453" delay={1.0} />
      </g>

      {/* Front wrap + ribbon */}
      <path className="bq-rise" style={d(0.1)} d="M96 262 Q180 296 264 262 L196 424 L164 424 Z" fill="#DCC3A1" />
      <path className="bq-rise" style={d(0.1)} d="M96 262 Q180 296 264 262" stroke="#C9AD86" strokeWidth="2" fill="none" />
      <g className="bq-pop" style={d(1.6)}>
        <path d="M180 350 C160 334 140 338 144 352 C148 366 168 360 180 350Z" fill="#4A6C57" />
        <path d="M180 350 C200 334 220 338 216 352 C212 366 192 360 180 350Z" fill="#4A6C57" />
        <path d="M178 352 L166 384 L174 382 L180 356 L186 382 L194 384 L182 352Z" fill="#3B5645" />
        <circle cx="180" cy="351" r="6" fill="#5F8A6C" />
      </g>

      <Sparkle x={60} y={90} size={1} delay={2.0} />
      <Sparkle x={306} y={92} size={0.8} delay={2.3} />
      <Sparkle x={300} y={300} size={0.6} delay={2.6} />
      <Sparkle x={52} y={260} size={0.7} delay={2.15} />

      <defs>
        <radialGradient id="bq-halo">
          <stop offset="0%" stopColor="#F4A7B9" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#F7C59F" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#F7C59F" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
