import type { CSSProperties } from "react";
import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import { ADVENTURE_IMAGES } from "../../lib/adventureAssets";
import { getCompassStageMetrics } from "../../lib/compassStageLayout";
import type { CardPhase } from "../../types/travel";
import "./compass-stage.css";

/** 나침반 레이어 z — 카드 덱(z:10) 아래 */
export const COMPASS_Z = 1;

const SHUFFLE_ACTIVE: CardPhase[] = [
  "ready",
  "gathering",
  "fanOut",
  "crossing",
  "mixing",
  "restacking",
];

const SHUFFLING_PHASES: CardPhase[] = [
  "gathering",
  "crossing",
  "mixing",
  "restacking",
];

const SCENE_EASE: [number, number, number, number] = [0.22, 0.75, 0.2, 1];

/** 원판 중심에서 카드 밑면으로 떠오르는 미세 금빛 입자 — 4개면 충분하다 */
const MOTES = [
  { "--mote-x": "-46px", "--mote-delay": "0s", "--mote-dur": "7.4s" },
  { "--mote-x": "-14px", "--mote-delay": "2.1s", "--mote-dur": "8.6s" },
  { "--mote-x": "18px", "--mote-delay": "4.3s", "--mote-dur": "7.9s" },
  { "--mote-x": "52px", "--mote-delay": "5.8s", "--mote-dur": "9.2s" },
] as unknown as CSSProperties[];

/**
 * 카드 무대의 황금 천문 나침반 장면 — 단일 이미지 1장을 무대 오브젝트로 쓴다.
 * 이미지는 거의 고정이고 중심 광점만 맥동한다.
 */
export function ShuffleFx({
  phase,
  reduce,
  isMobile,
  stageW = 1160,
}: {
  phase: CardPhase;
  reduce: boolean;
  isMobile: boolean;
  stageW?: number;
}) {
  const shuffleOn = SHUFFLE_ACTIVE.includes(phase);
  const readyIdle = phase === "ready";
  const settled = phase === "selectable";
  const fanning = phase === "fanOut";
  const shuffling = SHUFFLING_PHASES.includes(phase);
  const locked = phase === "selected" || phase === "revealing" || phase === "complete";

  const metrics = useMemo(
    () => getCompassStageMetrics(isMobile, stageW),
    [isMobile, stageW],
  );

  const layerStyle = {
    "--compass-stage-width": `${metrics.stageWidth}px`,
    "--compass-disc-center": `${metrics.discCenterPx}px`,
    "--compass-disc-width": `${metrics.discWidthPx}px`,
    "--compass-image-opacity": String(metrics.imageOpacity),
  } as CSSProperties;

  if (!shuffleOn && !settled && !readyIdle && !locked) return null;

  /* 카드보다 한 단계 약하게 — 죽이지 않고 밝기만 눌러 둔다 */
  const sceneBrightness = shuffling ? 1.08 : locked ? 1.04 : 1;

  return (
    <>
      <div className="compass-stage__apparatus" style={layerStyle} aria-hidden="true">
        <img
          src={ADVENTURE_IMAGES.compassStage}
          alt=""
          draggable={false}
          className="compass-stage__scene compass-stage__scene--aura"
        />

        <motion.img
          src={ADVENTURE_IMAGES.compassStage}
          alt=""
          draggable={false}
          className="compass-stage__scene compass-stage__scene--disc"
          initial={false}
          animate={{ filter: `brightness(${sceneBrightness})` }}
          transition={{ duration: 0.5, ease: SCENE_EASE }}
        />

        <div
          className={`compass-stage__core${shuffling && !reduce ? " compass-stage__core--active" : ""}`}
        />

        <div className="compass-stage__lift" />

        {MOTES.map((m, i) => (
          <span key={i} className="compass-stage__mote" style={m} />
        ))}

        {!reduce && settled ? (
          <motion.div
            className="compass-stage__burst compass-stage__burst--soft"
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: [0, 0.7, 0], scale: [0.55, 0.98, 1.08] }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          />
        ) : null}

        <AnimatePresence>
          {!reduce && fanning ? (
            <motion.div
              key="compass-burst"
              className="compass-stage__burst"
              initial={{ opacity: 0.92, scale: 0.32 }}
              animate={{ opacity: 0, scale: 1.12 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.15, 0.95, 0.25, 1] }}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <div className="compass-stage__cast" aria-hidden="true" />
    </>
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
