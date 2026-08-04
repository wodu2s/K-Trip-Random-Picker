import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import type { CardPhase } from "../../types/travel";
import { CompassGraphic } from "./CompassGraphic";

/** 스테이지 정중앙 */
export const COMPASS_ANCHOR = {
  desktop: { x: 0, y: 0, size: 172 },
  mobile: { x: 0, y: 0, size: 126 },
} as const;

/** 나침반 z: 뒤 카드 위 · 앞 중앙 카드 아래 · 셔플 중 상승 */
export const COMPASS_Z = {
  idle: 18,
  shuffle: 40,
} as const;

const SHUFFLE_ACTIVE: CardPhase[] = [
  "ready",
  "gathering",
  "fanOut",
  "crossing",
  "mixing",
  "restacking",
];

const SHUFFLE_LIVE: CardPhase[] = [
  "gathering",
  "fanOut",
  "crossing",
  "mixing",
  "restacking",
];

/** 카드보다 느린 본체 복귀 — bounce 없음 */
const BODY_EASE: [number, number, number, number] = [0.22, 0.75, 0.2, 1];

type LeadSignal = {
  /** 주도 카드 방향: -1 좌 · 0 정착 · 1 우 */
  dir: -1 | 0 | 1;
  /** 0–1, 카드 속도감 → 바늘 반응 크기 */
  intensity: number;
  bodyX: number;
  bodyY: number;
  bodyRot: number;
  needle: number;
  /** 바늘 추적 지연(ms). 좌측 교차는 더 김 */
  delayMs: number;
};

function clampNeedle(deg: number): number {
  if (deg === 0) return 0;
  const sign = deg < 0 ? -1 : 1;
  const mag = Math.min(70, Math.max(20, Math.abs(deg)));
  return sign * mag;
}

/**
 * 가장 앞/가장 빠른 카드 한 축만 반영.
 * 본체는 6–10px · ±3–5° 관성, 바늘은 20–70°.
 */
export function leadForPhase(phase: CardPhase, crossNarrow = false): LeadSignal {
  switch (phase) {
    case "gathering":
      return {
        dir: 0,
        intensity: 0.25,
        bodyX: 2,
        bodyY: -2,
        bodyRot: 1,
        needle: -22,
        delayMs: 0,
      };
    case "fanOut":
      return {
        dir: -1,
        intensity: 0.55,
        bodyX: -5,
        bodyY: -3,
        bodyRot: -2.5,
        needle: -36,
        delayMs: 90,
      };
    case "crossing":
      return {
        dir: 1,
        intensity: 0.92,
        bodyX: 8,
        bodyY: -2,
        bodyRot: 3,
        needle: 58,
        delayMs: 28,
      };
    case "mixing":
      return crossNarrow
        ? {
            dir: 1,
            intensity: 0.78,
            bodyX: 7,
            bodyY: -2,
            bodyRot: 2.5,
            needle: 44,
            delayMs: 36,
          }
        : {
            dir: -1,
            intensity: 0.86,
            bodyX: -6,
            bodyY: -3,
            bodyRot: -2,
            needle: -48,
            delayMs: 110,
          };
    case "restacking":
      return {
        dir: 0,
        intensity: 0.2,
        bodyX: 2,
        bodyY: -1,
        bodyRot: 0.8,
        needle: 16,
        delayMs: 50,
      };
    case "selectable":
    case "ready":
    default:
      return {
        dir: 0,
        intensity: 0,
        bodyX: 0,
        bodyY: 0,
        bodyRot: 0,
        needle: 0,
        delayMs: 0,
      };
  }
}

/** @deprecated use leadForPhase */
export function needleForPhase(phase: CardPhase, crossNarrow = false): number {
  return clampNeedle(leadForPhase(phase, crossNarrow).needle);
}

/**
 * 셔플 중심축 나침반 — 카드에 끌리는 약한 관성만.
 * 카드와 같은 속도로 따라다니지 않는다.
 */
export function ShuffleFx({
  phase,
  reduce,
  isMobile,
  crossNarrow = false,
}: {
  phase: CardPhase;
  reduce: boolean;
  isMobile: boolean;
  crossNarrow?: boolean;
}) {
  const shuffleOn = SHUFFLE_ACTIVE.includes(phase);
  const live = SHUFFLE_LIVE.includes(phase);
  const readyIdle = phase === "ready";
  const ignite = phase === "gathering";
  const impact = phase === "restacking";
  const settled = phase === "selectable";

  const anchor = isMobile ? COMPASS_ANCHOR.mobile : COMPASS_ANCHOR.desktop;
  const compassSize = anchor.size;
  const compassZ = live ? COMPASS_Z.shuffle : COMPASS_Z.idle;

  const lead = useMemo(
    () => leadForPhase(phase, crossNarrow),
    [phase, crossNarrow],
  );

  const [spinFrom, setSpinFrom] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [needleDeg, setNeedleDeg] = useState(0);
  const [needleWobble, setNeedleWobble] = useState(false);
  const needleTimer = useRef<number | null>(null);
  const wobbleTimer = useRef<number | null>(null);

  // 시작 시 짧은 강한 회전 준비
  useEffect(() => {
    if (phase !== "gathering" || reduce) return;
    setSpinFrom(-300);
    setSpinning(true);
    setNeedleDeg(-22);
    const t = window.setTimeout(() => {
      setSpinFrom(null);
      setSpinning(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, [phase, reduce]);

  // 바늘: 주도 카드 1축만, 좌측은 지연 · 교차 순간 빠른 전환 + 약한 관성 흔들림
  useEffect(() => {
    if (reduce) {
      setNeedleDeg(0);
      setNeedleWobble(false);
      return;
    }
    if (spinning) return;

    if (needleTimer.current) window.clearTimeout(needleTimer.current);
    if (wobbleTimer.current) window.clearTimeout(wobbleTimer.current);

    const target = clampNeedle(lead.needle);
    const delay = lead.delayMs;

    needleTimer.current = window.setTimeout(() => {
      setNeedleDeg(target);
      if (lead.intensity >= 0.45 && target !== 0) {
        setNeedleWobble(true);
        wobbleTimer.current = window.setTimeout(() => setNeedleWobble(false), 520);
      } else {
        setNeedleWobble(false);
      }
    }, delay);

    return () => {
      if (needleTimer.current) window.clearTimeout(needleTimer.current);
      if (wobbleTimer.current) window.clearTimeout(wobbleTimer.current);
    };
  }, [lead, spinning, reduce, phase, crossNarrow]);

  if (!shuffleOn && !settled && !readyIdle) return null;

  // 섞는 중: 선명 · 종료(impact~선택): 흐리게 내려 카드가 보이게
  const fading = phase === "restacking" || phase === "selectable";
  const vivid = !fading && !readyIdle;

  const driftOn = vivid && !impact && !reduce;
  const bodyX = driftOn ? lead.bodyX : 0;
  const bodyY = driftOn ? lead.bodyY : 0;
  const bodyRot = readyIdle && !reduce ? undefined : driftOn ? lead.bodyRot : 0;
  const bodyScale = readyIdle ? 1 : driftOn ? 1.06 : 1;

  const bodyDuration = 0.62 + (1 - lead.intensity) * 0.12;
  const compassOpacity = fading ? (phase === "restacking" ? 0.45 : 0.22) : 1;
  const compassBlur = fading ? (phase === "restacking" ? 1.2 : 2.5) : 0;
  // 섞인 뒤에는 카드 아래로
  const layerZ = fading ? 2 : compassZ;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          zIndex: layerZ,
          width: compassSize,
          height: compassSize,
          marginLeft: -compassSize / 2,
          marginTop: -compassSize / 2,
        }}
        initial={{ opacity: 0, scale: 0.94, x: anchor.x, y: anchor.y, rotate: 0 }}
        animate={{
          opacity: readyIdle ? 0.55 : compassOpacity,
          scale: bodyScale,
          x: anchor.x + bodyX,
          y: anchor.y + bodyY,
          rotate: readyIdle && !reduce ? [-4, 4, -4] : bodyRot,
          filter: compassBlur > 0 ? `blur(${compassBlur}px)` : "blur(0px)",
        }}
        transition={{
          x: { duration: bodyDuration, ease: BODY_EASE },
          y: { duration: bodyDuration + 0.06, ease: BODY_EASE },
          rotate: readyIdle
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: bodyDuration - 0.04, ease: BODY_EASE },
          scale: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: fading ? 0.45 : 0.28, ease: BODY_EASE },
          filter: { duration: 0.4, ease: BODY_EASE },
        }}
      >
        {vivid ? (
          <div
            className="absolute left-[8%] top-[12%] -z-[1] h-[88%] w-[88%] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, transparent 38%, rgba(22,40,31,0.24) 72%)",
              transform: "translate(5px, 9px)",
            }}
          />
        ) : null}

        <CompassGraphic
          size={compassSize}
          needleDeg={needleDeg}
          spinFrom={spinFrom}
          animateNeedle={needleWobble && !spinning && vivid}
          showLoop={false}
          emphasizeRim={vivid}
          pulse={false}
        />

        <AnimatePresence>
          {!reduce && ignite ? (
            <motion.div
              key={`rim-${phase}`}
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 2px ${ADVENTURE.brass}` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.92, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {!reduce && impact ? (
            <motion.div
              key="wave"
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: compassSize,
                height: compassSize,
                marginLeft: -compassSize / 2,
                marginTop: -compassSize / 2,
                border: `1.5px solid ${ADVENTURE.brass}`,
              }}
              initial={{ opacity: 0.65, scale: 0.92 }}
              animate={{ opacity: 0, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Edge brass trail while cards cross behind the compass */
export function CardEdgeFlash({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
      style={{ boxShadow: `inset 0 0 0 1.5px ${ADVENTURE.brass}` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
