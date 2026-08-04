import { motion } from "motion/react";
import type { KeyboardEvent } from "react";
import { MAP_COLORS } from "./mapTokens";
import type { TravelMapNode } from "./types";

const RADAR_RINGS = {
  primary: [14, 22, 30],
  secondary: [9],
  minor: [] as number[],
} as const;

type Props = {
  node: TravelMapNode;
  reduce: boolean;
  interactive: boolean;
  showLabel: boolean;
  isActive: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  revealOpacity: number;
  compact: boolean;
  onSelect?: (id: string) => void;
  onHover: (id: string | null) => void;
};

export function MapNode({
  node,
  reduce,
  interactive,
  showLabel,
  isActive,
  isHovered,
  isDimmed,
  revealOpacity,
  compact,
  onSelect,
  onHover,
}: Props) {
  const isPrimary = node.importance === "primary";
  const highlight = isActive || isHovered;
  const nodeOpacity = (isDimmed ? 0.68 : 1) * revealOpacity;
  const rings = RADAR_RINGS[node.importance];
  const coreR = isPrimary ? 4.5 : node.importance === "secondary" ? 3 : 2;

  const labelVisible = showLabel && node.label && (isPrimary || highlight);

  const labelOffset = node.labelAnchor === "left" ? -16 : 16;
  const labelAnchor = node.labelAnchor === "left" ? "end" : "start";
  const labelY = node.y - (isPrimary ? 18 : 12);
  const labelSize = compact ? 9 : isPrimary ? 11.5 : 9.5;

  const handleKey = (e: KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(node.id);
    }
  };

  return (
    <g style={{ opacity: nodeOpacity, transformOrigin: `${node.x}px ${node.y}px` }}>
      {interactive ? (
        <circle
          cx={node.x}
          cy={node.y}
          r={isPrimary ? 24 : 16}
          fill="transparent"
          className="cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B89156]"
          tabIndex={0}
          role="button"
          aria-label={node.label ?? node.id}
          aria-pressed={isActive}
          onClick={() => onSelect?.(node.id)}
          onKeyDown={handleKey}
          onMouseEnter={() => onHover(node.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(node.id)}
          onBlur={() => onHover(null)}
        />
      ) : null}

      {rings.map((r, i) => (
        <motion.circle
          key={r}
          cx={node.x}
          cy={node.y}
          r={r}
          fill="none"
          stroke={MAP_COLORS.bronze}
          strokeWidth={0.55 - i * 0.08}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          animate={
            reduce
              ? { opacity: 0.22 - i * 0.05, scale: 1 }
              : isPrimary
                ? {
                    opacity: [0.42 - i * 0.1, 0.08, 0.42 - i * 0.1],
                    scale: [1, 1.12 + i * 0.02, 1],
                  }
                : { opacity: [0.28, 0.55, 0.28], scale: 1 }
          }
          transition={
            reduce
              ? { duration: 0 }
              : isPrimary
                ? {
                    duration: 3.4 + i * 0.3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: node.delay + i * 0.15,
                  }
                : {
                    duration: 4.8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: node.delay,
                  }
          }
        />
      ))}

      <circle
        cx={node.x}
        cy={node.y}
        r={isPrimary ? 8 : 5}
        fill={MAP_COLORS.halo}
        opacity={highlight ? 0.45 : 0.28}
      />
      <circle
        cx={node.x}
        cy={node.y}
        r={coreR}
        fill={highlight ? MAP_COLORS.ivoryCore : MAP_COLORS.ivory}
        opacity={isPrimary ? 0.95 : 0.75}
      />
      <circle
        cx={node.x}
        cy={node.y}
        r={coreR * 0.35}
        fill="#FFFFFF"
        opacity={isPrimary ? 0.65 : 0.4}
      />

      {labelVisible ? (
        <text
          x={node.x + labelOffset}
          y={labelY}
          textAnchor={labelAnchor}
          fill={MAP_COLORS.bronzeLabel}
          fontSize={labelSize}
          fontFamily="var(--font-family-base, ui-sans-serif, system-ui, sans-serif)"
          fontWeight={600}
          letterSpacing="0.16em"
          opacity={highlight ? 0.95 : 0.82}
          style={{ textShadow: "0 1px 8px rgba(4,8,16,0.65)" }}
        >
          {node.label}
        </text>
      ) : null}
    </g>
  );
}
