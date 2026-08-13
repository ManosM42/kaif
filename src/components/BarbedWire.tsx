import { motion } from "framer-motion";

type Props = {
  className?: string;
  animated?: boolean;
  color?: string;
};

/** Stylized barbed-wire strand — thin SVG line art, not literal. */
export function BarbedWire({ className, animated = true, color = "currentColor" }: Props) {
  return (
    <svg
      viewBox="0 0 800 60"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="bw-grad" x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* twisted strands */}
      <motion.path
        d="M0 30 Q 50 5, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 600 30 T 700 30 T 800 30"
        fill="none"
        stroke="url(#bw-grad)"
        strokeWidth="1"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      <motion.path
        d="M0 30 Q 50 55, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 600 30 T 700 30 T 800 30"
        fill="none"
        stroke="url(#bw-grad)"
        strokeWidth="1"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
      />

      {/* barbs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 40 + i * 65;
        return (
          <g key={i} stroke={color} strokeWidth="1" opacity="0.85">
            <line x1={x} y1={30} x2={x - 10} y2={15} />
            <line x1={x} y1={30} x2={x + 10} y2={45} />
            <line x1={x} y1={30} x2={x - 8} y2={45} />
            <line x1={x} y1={30} x2={x + 8} y2={15} />
          </g>
        );
      })}
    </svg>
  );
}

/** Circular barbed-wire ring — for looping around hero logo. */
export function BarbedRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <radialGradient id="ring-grad">
          <stop offset="0.85" stopColor="#E8EAE6" stopOpacity="0" />
          <stop offset="0.95" stopColor="#E8EAE6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#E8EAE6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="none" stroke="url(#ring-grad)" strokeWidth="1" />
      <circle cx="200" cy="200" r="182" fill="none" stroke="#39FF6A" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 8" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = (v: number) => Math.round(v * 100) / 100;
        const x = r(200 + Math.cos(angle) * 180);
        const y = r(200 + Math.sin(angle) * 180);
        const bx = r(200 + Math.cos(angle) * 195);
        const by = r(200 + Math.sin(angle) * 195);
        const bx2 = r(200 + Math.cos(angle) * 165);
        const by2 = r(200 + Math.sin(angle) * 165);
        return (
          <g key={i} stroke="#E8EAE6" strokeOpacity="0.6" strokeWidth="0.75">
            <line x1={x} y1={y} x2={bx} y2={by} />
            <line x1={x} y1={y} x2={bx2} y2={by2} />
          </g>
        );
      })}
    </svg>
  );
}
