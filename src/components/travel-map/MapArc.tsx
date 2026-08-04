import { motion } from "motion/react";
import { MAP_COLORS } from "./mapTokens";
import type { TravelMapArc } from "./types";

type Props = {
  arc: TravelMapArc;
  reduce: boolean;
  compact: boolean;
  revealOpacity: number;
};

export function MapArc({ arc, reduce, compact, revealOpacity }: Props) {
  const opacity = arc.opacity * revealOpacity * (compact ? 0.6 : 1);

  return (
    <g aria-hidden="true">
      <motion.path
        d={arc.path}
        stroke={arc.dashed ? MAP_COLORS.arc : MAP_COLORS.arcBronze}
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeDasharray={arc.dashed ? "2 12" : undefined}
        fill="none"
        opacity={opacity}
        animate={reduce || !arc.dashed ? undefined : { strokeDashoffset: [0, -40] }}
        transition={
          reduce || !arc.dashed
            ? undefined
            : { duration: 20, ease: "linear", repeat: Infinity }
        }
      />

      {arc.lightPoint && !reduce && !compact ? (
        <circle r="1.8" fill={MAP_COLORS.bronzeLight} opacity="0.6">
          <animateMotion
            dur="18s"
            repeatCount="indefinite"
            path={arc.path}
            keyPoints="0;1;0"
            keyTimes="0;0.5;1"
            calcMode="linear"
          />
        </circle>
      ) : null}
    </g>
  );
}
