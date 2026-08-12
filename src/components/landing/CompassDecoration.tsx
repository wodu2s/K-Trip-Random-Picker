import { motion } from "motion/react";

/** 황금 나침반 엠블럼 — 카드 더미 아래 장식 프롭 */
export function CompassDecoration({
  size = 140,
  parallax = { x: 0, y: 0 },
  roseDeg = 0,
  reduce = false,
}: {
  size?: number;
  parallax?: { x: number; y: number };
  roseDeg?: number;
  reduce?: boolean;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[1%] left-[-2%] z-[12] hidden sm:block"
      aria-hidden="true"
      animate={{ x: parallax.x, y: parallax.y }}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}
      style={{
        width: size,
        height: size,
        filter:
          "drop-shadow(0 0 0 1.5px rgba(208,165,77,0.35)) drop-shadow(0 10px 22px rgba(0,0,0,0.5))",
      }}
    >
      <motion.img
        src="/assets/adventure/compass-gold-radiant.png"
        alt=""
        className="h-full w-full"
        animate={{ rotate: roseDeg }}
        transition={{ duration: reduce ? 0.2 : 0.85, ease: [0.22, 0.7, 0.2, 1] }}
      />
    </motion.div>
  );
}
