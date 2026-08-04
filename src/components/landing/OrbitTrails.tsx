import { motion } from "motion/react";

const ORBITS = [
  {
    id: "a",
    rx: 210,
    ry: 150,
    rotate: -18,
    duration: 22,
    reverse: false,
    dash: "10 14",
    opacity: 0.35,
  },
  {
    id: "b",
    rx: 170,
    ry: 120,
    rotate: 14,
    duration: 16,
    reverse: true,
    dash: "5 10",
    opacity: 0.28,
  },
  {
    id: "c",
    rx: 130,
    ry: 95,
    rotate: -6,
    duration: 12,
    reverse: false,
    dash: "3 8",
    opacity: 0.22,
  },
] as const;

export function OrbitTrails({
  reduce = false,
  bright = false,
  parallax = { x: 0, y: 0 },
}: {
  reduce?: boolean;
  bright?: boolean;
  parallax?: { x: number; y: number };
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
      aria-hidden="true"
      animate={{
        x: parallax.x,
        y: parallax.y,
        opacity: bright ? 0.95 : 0.75,
      }}
      transition={{ type: "spring", stiffness: 70, damping: 20 }}
    >
      <svg viewBox="0 0 480 420" className="h-[110%] w-[110%] max-w-none overflow-visible">
        <defs>
          <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
        {ORBITS.map((o) => {
          const path = `M ${240 - o.rx} 210 A ${o.rx} ${o.ry} 0 1 1 ${240 + o.rx} 210 A ${o.rx} ${o.ry} 0 1 1 ${240 - o.rx} 210`;
          return (
            <g key={o.id} transform={`rotate(${o.rotate} 240 210)`}>
              <ellipse
                cx="240"
                cy="210"
                rx={o.rx}
                ry={o.ry}
                fill="none"
                stroke="rgba(212,166,74,0.55)"
                strokeWidth="1.15"
                strokeDasharray={o.dash}
                opacity={o.opacity}
              />
              {!reduce ? (
                <motion.circle
                  r="2.6"
                  fill="#F1D087"
                  filter="url(#orbitGlow)"
                  style={{
                    offsetPath: `path('${path}')`,
                    offsetRotate: "0deg",
                  }}
                  animate={{ offsetDistance: o.reverse ? ["100%", "0%"] : ["0%", "100%"] }}
                  transition={{
                    duration: o.duration,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}
