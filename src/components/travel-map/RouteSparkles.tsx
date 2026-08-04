import { motion } from "motion/react";
import { ROUTE_SPARKLES } from "./mapGeometry";
import { MAP_COLORS } from "./mapTokens";

type Props = {
  reduce: boolean;
  compact: boolean;
  revealOpacity: number;
};

/** Small glints where routes intersect */
export function RouteSparkles({ reduce, compact, revealOpacity }: Props) {
  if (compact) return null;

  return (
    <g aria-hidden="true" opacity={revealOpacity * 0.85}>
      {ROUTE_SPARKLES.map((s, i) => (
        <motion.g key={i}>
          <circle cx={s.x} cy={s.y} r={1.2} fill={MAP_COLORS.sparkle} opacity={0.7} />
          <motion.circle
            cx={s.x}
            cy={s.y}
            r={3.5}
            fill="none"
            stroke={MAP_COLORS.bronze}
            strokeWidth="0.4"
            animate={reduce ? { opacity: 0.25 } : { opacity: [0.15, 0.45, 0.15] }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 4 + i, ease: "easeInOut", repeat: Infinity, delay: i * 0.8 }
            }
          />
        </motion.g>
      ))}
    </g>
  );
}
