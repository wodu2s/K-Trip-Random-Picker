/** Fine gold dust — sparse, soft; no runtime random / hydration drift */
const PARTICLES = [
  { left: 10, top: 20, size: 1.4, delay: 0, duration: 14, opacity: 0.38 },
  { left: 18, top: 46, size: 1.1, delay: 1.4, duration: 16, opacity: 0.28 },
  { left: 26, top: 68, size: 1.6, delay: 0.5, duration: 13, opacity: 0.34 },
  { left: 34, top: 30, size: 1, delay: 2.2, duration: 17, opacity: 0.24 },
  { left: 42, top: 58, size: 1.3, delay: 0.9, duration: 15, opacity: 0.3 },
  { left: 50, top: 24, size: 1.1, delay: 3.1, duration: 12, opacity: 0.28 },
  { left: 58, top: 64, size: 1.5, delay: 1.7, duration: 18, opacity: 0.36 },
  { left: 66, top: 40, size: 1, delay: 0.3, duration: 14, opacity: 0.26 },
  { left: 74, top: 50, size: 1.7, delay: 2.5, duration: 16, opacity: 0.4 },
  { left: 80, top: 18, size: 1.2, delay: 1.1, duration: 13, opacity: 0.3 },
  { left: 86, top: 62, size: 1, delay: 3.6, duration: 15, opacity: 0.24 },
  { left: 92, top: 34, size: 1.4, delay: 0.7, duration: 17, opacity: 0.32 },
  { left: 14, top: 78, size: 1.1, delay: 2.9, duration: 14, opacity: 0.28 },
  { left: 30, top: 14, size: 1.3, delay: 1.9, duration: 16, opacity: 0.3 },
  { left: 54, top: 76, size: 1, delay: 1.0, duration: 12, opacity: 0.26 },
  { left: 70, top: 72, size: 1.5, delay: 2.3, duration: 15, opacity: 0.34 },
] as const;

export function FloatingParticles({
  reduce = false,
  mobile = false,
}: {
  reduce?: boolean;
  mobile?: boolean;
}) {
  void mobile;
  const list = PARTICLES.slice(0, 4);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {list.map((p, i) => (
        <span
          key={i}
          className="landing-particle absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: "rgba(197, 160, 89, 0.75)",
            boxShadow: "0 0 5px rgba(197, 160, 89, 0.35)",
            opacity: reduce ? p.opacity * 0.4 : undefined,
            animation: reduce
              ? "none"
              : `landing-particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes landing-particle-float {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          15% { opacity: 0.55; }
          50% { transform: translate(4px, -22px); opacity: 0.4; }
          85% { opacity: 0.18; }
        }
      `}</style>
    </div>
  );
}
