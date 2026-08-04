import { motion, AnimatePresence } from "motion/react";

const SPARKLES = [
  { top: "16%", left: "20%", size: 3.5, color: "#76A8F8" },
  { top: "12%", left: "74%", size: 4, color: "#FFC857" },
  { top: "56%", left: "10%", size: 3, color: "#FFFFFF" },
  { top: "64%", left: "86%", size: 3.5, color: "#76A8F8" },
  { top: "78%", left: "42%", size: 3, color: "#FFC857" },
] as const;

/**
 * 카드 뒤 얇은 여행 경로 1개 + 별빛 최대 5개.
 */
export function HeroCardOrbit({
  flash = false,
  reduce = false,
  mobile = false,
}: {
  flash?: boolean;
  reduce?: boolean;
  mobile?: boolean;
}) {
  const stars = SPARKLES.slice(0, mobile ? 3 : 5);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 320" fill="none">
        <path
          d="M40,230 C120,150 190,120 260,150 C320,174 360,210 400,140"
          stroke="rgba(50,119,246,0.28)"
          strokeWidth="1.3"
          strokeDasharray="5 7"
          className={reduce ? undefined : "flight-dash"}
          opacity={0.7}
        />
      </svg>

      {stars.map((s, i) => (
        <motion.span
          key={`star-${i}`}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: s.color,
          }}
          animate={
            reduce
              ? { opacity: 0.35 }
              : { opacity: [0.22, 0.55, 0.22] }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 3.2 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }
          }
        />
      ))}

      <AnimatePresence>
        {flash &&
          !reduce &&
          stars.slice(0, mobile ? 3 : 4).map((s, i) => (
            <motion.span
              key={`flash-${i}`}
              className="absolute rounded-full"
              style={{
                top: s.top,
                left: s.left,
                width: s.size + 1,
                height: s.size + 1,
                background: s.color,
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.85, 0], scale: [0.7, 1.2, 0.9] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
