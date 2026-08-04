import { useId } from "react";
import { motion } from "motion/react";

/**
 * Classic Expedition brass compass — knurled rim, parchment dial, multi-point rose.
 * Direction is shown by the rose itself (no separate green needle).
 */
export function CompassGraphic({
  size = 96,
  needleDeg = 0,
  animateNeedle = false,
  variant = "light",
  pulse = false,
  showLoop = false,
  emphasizeRim = false,
  /** 한 번에 큰 회전 후 needleDeg로 정착 (예: 320 → 0) — rose 회전에 사용 */
  spinFrom = null,
  /** rose 추적 전환 시간(초). idle 탐색용으로 늘릴 수 있음 */
  needleDuration,
}: {
  size?: number;
  needleDeg?: number;
  animateNeedle?: boolean;
  /** kept for call-site compat; visual is always brass/parchment */
  variant?: "dark" | "light";
  pulse?: boolean;
  showLoop?: boolean;
  /** 셔플 스테이지 전용 — 외곽 brass 테두리를 조금 더 또렷하게 */
  emphasizeRim?: boolean;
  spinFrom?: number | null;
  needleDuration?: number;
}) {
  void variant;
  const uid = useId().replace(/:/g, "");
  const rimId = `cmpRim-${uid}`;
  const dialId = `cmpDial-${uid}`;
  const pinId = `cmpPin-${uid}`;

  const brassHi = "#D4B06A";
  const brass = "#B58E4F";
  const brassMid = "#9A7640";
  const brassDeep = "#6E5328";
  const parchment = "#F2EBD4";
  const parchmentDeep = "#E6DCC0";
  const brown = "#33261D";
  const brownSoft = "#4A3A2C";
  const forest = "#1B3022";
  const forestHi = "#2A4A38";

  const cy = showLoop ? 64 : 60;
  const vb = showLoop ? "0 0 120 128" : "0 0 120 120";

  const roseRotate =
    spinFrom != null
      ? [spinFrom, needleDeg]
      : animateNeedle
        ? [needleDeg + (needleDeg >= 0 ? 8 : -8), needleDeg - (needleDeg >= 0 ? 5 : -5), needleDeg]
        : needleDeg;

  const roseTransition =
    spinFrom != null
      ? { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const }
      : animateNeedle
        ? {
            duration: needleDuration ?? 0.48,
            ease: [0.22, 0.7, 0.2, 1] as const,
            times: [0, 0.45, 1],
          }
        : {
            duration: needleDuration ?? 0.32,
            ease: [0.33, 0.1, 0.25, 1] as const,
          };

  return (
    <motion.svg
      width={size}
      height={showLoop ? size * 1.06 : size}
      viewBox={vb}
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 8px 14px rgba(22,40,31,0.28))" }}
      animate={pulse ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={pulse ? { duration: 0.45, ease: "easeOut" } : { duration: 0.2 }}
    >
      <defs>
        <radialGradient id={rimId} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor={brassHi} />
          <stop offset="42%" stopColor={brass} />
          <stop offset="78%" stopColor={brassMid} />
          <stop offset="100%" stopColor={brassDeep} />
        </radialGradient>
        <radialGradient id={dialId} cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#FBF7EC" />
          <stop offset="55%" stopColor={parchment} />
          <stop offset="100%" stopColor={parchmentDeep} />
        </radialGradient>
        <radialGradient id={pinId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={brassHi} />
          <stop offset="55%" stopColor={brass} />
          <stop offset="100%" stopColor={brassDeep} />
        </radialGradient>
      </defs>

      {showLoop ? (
        <g>
          <circle cx="60" cy="9" r="6.5" fill="none" stroke={`url(#${rimId})`} strokeWidth="2.8" />
          <rect x="57" y="14.5" width="6" height="7" rx="1" fill={`url(#${rimId})`} />
        </g>
      ) : null}

      {/* Knurled outer rim */}
      <circle cx="60" cy={cy} r="54" fill={`url(#${rimId})`} />
      {Array.from({ length: emphasizeRim ? 84 : 72 }, (_, i) => {
        const n = emphasizeRim ? 84 : 72;
        const deg = (i * 360) / n;
        const rad = ((deg - 90) * Math.PI) / 180;
        const outer = emphasizeRim ? 55.2 : 54;
        const inner = emphasizeRim ? 50.4 : 51.2;
        const x1 = 60 + Math.cos(rad) * inner;
        const y1 = cy + Math.sin(rad) * inner;
        const x2 = 60 + Math.cos(rad) * outer;
        const y2 = cy + Math.sin(rad) * outer;
        return (
          <line
            key={`k-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 2 === 0 ? brassDeep : brassHi}
            strokeWidth={emphasizeRim ? 1.45 : 1.15}
            opacity={emphasizeRim ? 0.8 : 0.55}
          />
        );
      })}
      <circle cx="60" cy={cy} r="50.2" fill={`url(#${rimId})`} />
      <circle
        cx="60"
        cy={cy}
        r="50.2"
        fill="none"
        stroke={brassDeep}
        strokeWidth={emphasizeRim ? 1.35 : 0.9}
        opacity={emphasizeRim ? 0.65 : 0.4}
      />
      <circle
        cx="60"
        cy={cy}
        r="47.6"
        fill="none"
        stroke={brassHi}
        strokeWidth={emphasizeRim ? 1.5 : 1.1}
        opacity={emphasizeRim ? 0.55 : 0.35}
      />
      {emphasizeRim ? (
        <>
          <circle
            cx="60"
            cy={cy}
            r="55.6"
            fill="none"
            stroke={brassHi}
            strokeWidth="1.8"
            opacity="0.55"
          />
          <circle
            cx="60"
            cy={cy}
            r="56.8"
            fill="none"
            stroke={brassDeep}
            strokeWidth="1.1"
            opacity="0.4"
          />
        </>
      ) : null}

      {/* Parchment dial */}
      <circle cx="60" cy={cy} r="45.5" fill={`url(#${dialId})`} />
      <circle cx="60" cy={cy} r="45.5" fill="none" stroke={brown} strokeWidth="0.55" opacity="0.28" />

      {/* Fine degree ticks */}
      {Array.from({ length: 120 }, (_, i) => {
        const deg = i * 3;
        const major = deg % 15 === 0;
        const rad = ((deg - 90) * Math.PI) / 180;
        const outer = 44.2;
        const inner = major ? 40.2 : 42.2;
        return (
          <line
            key={`t-${deg}`}
            x1={60 + Math.cos(rad) * inner}
            y1={cy + Math.sin(rad) * inner}
            x2={60 + Math.cos(rad) * outer}
            y2={cy + Math.sin(rad) * outer}
            stroke={brown}
            strokeWidth={major ? 1.05 : 0.5}
            opacity={major ? 0.55 : 0.28}
          />
        );
      })}

      {/* Dotted ring */}
      {Array.from({ length: 48 }, (_, i) => {
        const rad = ((i * 7.5 - 90) * Math.PI) / 180;
        const r = 37.5;
        return (
          <circle
            key={`dot-${i}`}
            cx={60 + Math.cos(rad) * r}
            cy={cy + Math.sin(rad) * r}
            r="0.7"
            fill={brown}
            opacity="0.45"
          />
        );
      })}

      <circle cx="60" cy={cy} r="34.5" fill="none" stroke={brown} strokeWidth="0.55" opacity="0.28" />
      <circle cx="60" cy={cy} r="31.5" fill="none" stroke={brown} strokeWidth="0.45" opacity="0.2" />

      {/* Compass rose — rays meet at exact center (60, cy) under brass cap */}
      <motion.g
        style={{ transformOrigin: `60px ${cy}px` }}
        initial={false}
        animate={{ rotate: roseRotate }}
        transition={roseTransition}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const deg = i * 22.5;
          const isCardinal = deg % 90 === 0;
          const isInter = deg % 45 === 0 && !isCardinal;
          const len = isCardinal ? 28 : isInter ? 22 : 14;
          const halfW = isCardinal ? 3.2 : isInter ? 2.4 : 1.6;
          const fill = isCardinal || isInter ? brown : forest;
          const fill2 = isCardinal || isInter ? brownSoft : forestHi;
          return (
            <g key={`ray-${i}`} transform={`rotate(${deg} 60 ${cy})`}>
              <polygon
                points={`60,${cy - len} ${60 + halfW},${cy} 60,${cy} ${60 - halfW},${cy}`}
                fill={fill}
                opacity={isCardinal ? 0.92 : isInter ? 0.78 : 0.7}
              />
              <polygon
                points={`60,${cy - len} ${60 + halfW * 0.42},${cy} 60,${cy}`}
                fill={fill2}
                opacity="0.55"
              />
            </g>
          );
        })}
      </motion.g>

      {/* Central brass cap only — no green pointer / shaft */}
      <circle cx="60" cy={cy} r="5" fill={`url(#${pinId})`} />
      <circle cx="60" cy={cy} r="2.6" fill={brassHi} />
      <circle cx="60" cy={cy} r="1.15" fill={brassDeep} />
    </motion.svg>
  );
}
