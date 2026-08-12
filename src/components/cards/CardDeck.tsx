import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { getDestinationById } from "../../data/destinations";
import { getEmojiHints } from "../../lib/icons";
import { getLayoutScale, poseForCard } from "../../lib/cardLayout";
import {
  CARD_MOTION,
  cardStaggerDelay,
  durationForShufflePhase,
  SHUFFLE_EASE,
  transitionEaseForPhase,
} from "../../lib/cardMotion";
import {
  isSelectable,
} from "../../lib/cardPhaseUtils";
import type { CardPhase, MysteryCardData } from "../../types/travel";
import { AdventureTravelCard } from "./AdventureTravelCard";
import { CardFx } from "./CardFx";
import { TravelCardBack } from "./TravelCardBack";
import "./shuffleDeck.css";

const SCALE_LOCKED_PHASES = new Set<CardPhase>([
  "gathering",
  "crossing",
  "mixing",
  "restacking",
  "fanOut",
]);

/** fan 상태 카드별 translateZ — 중앙이 가장 앞 */
const FAN_DEPTH_Z = [20, 60, 100, 60, 20];

const LIVE_PHASES = new Set<CardPhase>([
  "gathering",
  "fanOut",
  "crossing",
  "mixing",
  "restacking",
  "selectable",
  "selected",
  "revealing",
]);

/**
 * 카드 5장의 위치·z-index·transform 애니메이션.
 */
export function CardDeck({
  cards,
  phase,
  mixStep,
  reduce,
  isMobile,
  stageW,
  cardW,
  cardH,
  selectedId,
  stamped,
  flipped,
  hoveredId,
  locked,
  onHoverChange,
  onSelect,
}: {
  cards: MysteryCardData[];
  phase: CardPhase;
  mixStep: 0 | 1;
  reduce: boolean;
  isMobile: boolean;
  stageW: number;
  cardW: number;
  cardH: number;
  selectedId: string | null;
  stamped: boolean;
  flipped: boolean;
  hoveredId: string | null;
  locked: boolean;
  onHoverChange: (id: string | null) => void;
  onSelect: (cardId: string, destinationId: string) => void;
}) {
  const layoutScale = getLayoutScale(stageW, cardW);
  const [hintOnce, setHintOnce] = useState(false);

  useEffect(() => {
    setHintOnce(false);
  }, [phase, selectedId]);

  useEffect(() => {
    if (phase !== "selectable" || selectedId || locked || reduce) return;
    const t = window.setTimeout(() => setHintOnce(true), 3000);
    return () => window.clearTimeout(t);
  }, [phase, selectedId, locked, reduce]);

  const cardEntries = useMemo(
    () =>
      cards
        .map((card, i) => {
          const destination = getDestinationById(card.destinationId);
          if (!destination) return null;
          return { card, i, destination, hints: getEmojiHints(destination) };
        })
        .filter(Boolean) as {
        card: MysteryCardData;
        i: number;
        destination: NonNullable<ReturnType<typeof getDestinationById>>;
        hints: string[];
      }[],
    [cards],
  );

  /* 나침반 위에 떠 있는 느낌 — 카드가 멈춰 있는 구간에서만 미세하게 부유한다 */
  const idleFloat = !reduce && (phase === "ready" || phase === "selectable");

  const deckClass = [
    "shuffle-deck",
    isMobile ? "shuffle-deck--mobile" : "",
    hintOnce ? "shuffle-deck--hint-once" : "",
    phase === "complete" ? "shuffle-deck--complete-fade" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={deckClass} data-shuffle-phase={phase}>
      <CardFx phase={phase} reduce={reduce} isMobile={isMobile} />

      <motion.div
        className="shuffle-deck__stage"
        aria-live="polite"
        animate={idleFloat ? { y: [0, -5, 0] } : { y: 0 }}
        transition={
          idleFloat
            ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        {cardEntries.map(({ card, i, destination, hints }) => {
          const isSelected = selectedId === card.id;
          const pose = poseForCard(
            phase,
            mixStep,
            i,
            cardEntries.length,
            layoutScale,
            selectedId,
            card.id,
          );

          const isHover =
            isSelectable(phase) &&
            !locked &&
            !selectedId &&
            hoveredId === card.id &&
            !isMobile;

          let { x, y, rotate, scale, opacity, z } = pose;

          if (isHover) {
            y -= 12;
            scale = 1.05;
            rotate *= 0.35;
            z = 18;
          }

          const duration = durationForShufflePhase(phase, reduce);
          const delay = cardStaggerDelay(phase, i, reduce);
          const ease = transitionEaseForPhase(phase);
          const disabled = !isSelectable(phase) || locked || Boolean(selectedId);

          const isFocusSelected =
            isSelected &&
            (phase === "selected" || phase === "revealing" || phase === "complete");

          const showReveal = isSelected && flipped;
          const showHintFace = isFocusSelected && !showReveal;
          const rotateY = showReveal ? 180 : showHintFace ? 0 : 180;

          const faceTurnDuration =
            showReveal && flipped
              ? reduce
                ? 0.18
                : CARD_MOTION.flip
              : 0;

          const scaleAnim =
            SCALE_LOCKED_PHASES.has(phase)
              ? 1
              : phase === "ready" && i === 2 && !reduce
                ? [1, 1.025, 1]
                : scale;

          const showTrail = !reduce && (phase === "fanOut" || phase === "crossing");
          const liveMotion = LIVE_PHASES.has(phase) || phase === "ready";
          const fanFloating =
            phase === "ready" ||
            phase === "fanOut" ||
            phase === "selectable" ||
            isFocusSelected;
          const depthZ = fanFloating
            ? isFocusSelected
              ? 120
              : (FAN_DEPTH_Z[i] ?? 20)
            : 0;
          const tiltX = fanFloating && !isFocusSelected && !isHover ? -5 : isHover ? -8 : 0;
          /* 끝 카드만 안쪽으로 살짝 돌려 중앙 카드가 가장 앞에 있는 깊이감을 준다 */
          const tiltY =
            fanFloating && !isFocusSelected && !isHover
              ? i === 0
                ? 8
                : i === 4
                  ? -8
                  : 0
              : 0;

          const transition =
            phase === "selectable" && !reduce
              ? { type: "spring" as const, stiffness: 420, damping: 28, delay }
              : phase === "ready" && i === 2 && !reduce
                ? {
                    scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
                    default: { duration: 0.2 },
                  }
                : {
                    duration: reduce ? 0.14 : duration,
                    ease,
                    delay,
                  };

          return (
            <motion.button
              key={card.id}
              type="button"
              className={[
                "shuffle-deck__card",
                liveMotion ? "shuffle-deck__card--live" : "",
                isHover ? "shuffle-deck__card--hover" : "",
                showTrail ? "shuffle-deck__card--trail" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                width: cardW,
                height: cardH,
                zIndex: z,
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                filter: isFocusSelected
                  ? "drop-shadow(0 56px 40px rgba(0,0,0,0.62)) drop-shadow(0 28px 22px rgba(0,0,0,0.4)) drop-shadow(0 0 18px rgba(201,162,39,0.24))"
                  : isHover
                    ? "drop-shadow(0 48px 34px rgba(0,0,0,0.58)) drop-shadow(0 24px 18px rgba(0,0,0,0.38)) drop-shadow(0 0 12px rgba(201,162,39,0.16))"
                    : fanFloating
                      ? "drop-shadow(0 44px 30px rgba(0,0,0,0.52)) drop-shadow(0 18px 14px rgba(0,0,0,0.34))"
                      : undefined,
              }}
              disabled={disabled}
              aria-disabled={disabled}
              aria-pressed={isSelected}
              aria-label={
                showReveal
                  ? `선택된 여행지 ${destination.name}`
                  : `${hints.slice(0, 5).join(", ")} 힌트가 포함된 여행 카드 선택`
              }
              initial={false}
              animate={{
                x: reduce && selectedId && !isSelected ? x * 0.4 : x,
                y,
                rotate,
                rotateX: tiltX,
                rotateY: tiltY,
                scale: scaleAnim,
                opacity,
                z: depthZ,
              }}
              transition={transition}
              onClick={() => {
                if (disabled) return;
                setHintOnce(false);
                onSelect(card.id, card.destinationId);
              }}
              onPointerEnter={() => {
                if (!disabled && !isMobile) onHoverChange(card.id);
              }}
              onPointerLeave={() => onHoverChange(null)}
              onFocus={() => {
                if (!disabled && !isMobile) onHoverChange(card.id);
              }}
              onBlur={() => onHoverChange(null)}
            >
              <div className="shuffle-deck__trail" aria-hidden="true" />
              <div className="shuffle-deck__shine" aria-hidden="true" />

              <div className="shuffle-deck__flip perspective-1000 relative h-full w-full">
                <motion.div
                  className="preserve-3d relative h-full w-full"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={false}
                  animate={{ rotateY }}
                  transition={{
                    rotateY: { duration: faceTurnDuration, ease: SHUFFLE_EASE },
                  }}
                >
                  <div className="backface-hidden absolute inset-0">
                    {showHintFace ? (
                      <AdventureTravelCard
                        embedded
                        hints={hints}
                        index={i + 1}
                        face="hint"
                        selected={isFocusSelected}
                        stamped={isSelected && stamped}
                        needleBoost={isHover ? 10 : 0}
                      />
                    ) : (
                      <TravelCardBack expedition serial={i + 1} />
                    )}
                  </div>

                  <div
                    className="backface-hidden absolute inset-0"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    {showReveal ? (
                      <AdventureTravelCard
                        embedded
                        hints={hints}
                        index={i + 1}
                        face="hint"
                        flipped
                        reveal={{
                          name: destination.name,
                          region: destination.region,
                          image: destination.image,
                          shortDescription: destination.shortDescription,
                          tags: destination.tags,
                        }}
                      />
                    ) : (
                      <TravelCardBack expedition serial={i + 1} />
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
