import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { getDestinationById } from "../../data/destinations";
import { buildFallbackHints } from "../../lib/icons";
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
import type { MixStep } from "../../lib/cardLayout";
import type { CardPhase, MysteryCardData } from "../../types/travel";
import { AdventureTravelCard } from "./AdventureTravelCard";
import { CardFx } from "./CardFx";
import { PickedStamp } from "./PickedStamp";
import { TravelCardBack } from "./TravelCardBack";
import "./shuffleDeck.css";

/** fan 상태 translateZ — 5장을 같은 깊이에 두어 크기·겹침을 고르게 한다 */
const FAN_DEPTH_Z = 60;

const LIVE_PHASES = new Set<CardPhase>([
  "gathering",
  "crossing",
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
  mixStep: MixStep;
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
          /* 힌트는 백엔드가 조건 + KTO 분류로 만든 3개를 그대로 쓴다 */
          const hints = destination.hints ?? buildFallbackHints(destination);
          return { card, i, destination, hints: hints.map((h) => h.emoji) };
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
      <CardFx phase={phase} />

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
          const ease = transitionEaseForPhase(phase, mixStep);
          const disabled = !isSelectable(phase) || locked || Boolean(selectedId);

          const isFocusSelected =
            isSelected &&
            (phase === "selected" || phase === "revealing" || phase === "complete");

          /* Expedition 뒷면 그대로 있다가 공개 순간 한 번만 뒤집는다.
             중간에 밝은 양피지 면을 끼우면 별도 카드가 뜬 것처럼 보인다 */
          const showReveal = isSelected && flipped;
          const rotateY = showReveal ? 180 : 0;

          const faceTurnDuration = showReveal ? (reduce ? 0.18 : CARD_MOTION.flip) : 0;

          /* stack·컷 구간의 scale은 pose가 정한다 — 여기서 덮어쓰면 덱 두께가 사라진다 */
          const scaleAnim =
            phase === "ready" && i === 2 && !reduce ? [1, 1.025, 1] : scale;

          const liveMotion = LIVE_PHASES.has(phase) || phase === "ready";
          const fanFloating =
            phase === "ready" || phase === "selectable" || isFocusSelected;
          const depthZ = fanFloating ? (isFocusSelected ? 120 : FAN_DEPTH_Z) : 0;
          const tiltX = fanFloating && !isFocusSelected && !isHover ? -5 : isHover ? -8 : 0;

          const transition =
            phase === "ready" && i === 2 && !reduce
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
                  ? "drop-shadow(0 32px 26px rgba(0,0,0,0.6))"
                  : isHover
                    ? "drop-shadow(0 28px 22px rgba(0,0,0,0.55))"
                    : undefined,
              }}
              disabled={disabled}
              aria-disabled={disabled}
              aria-pressed={isSelected}
              aria-label={
                showReveal
                  ? `선택된 여행지 ${destination.name}`
                  : `${hints.join(", ")} 힌트가 포함된 여행 카드 선택`
              }
              initial={false}
              animate={{
                x: reduce && selectedId && !isSelected ? x * 0.4 : x,
                y,
                rotate,
                rotateX: tiltX,
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
                    <TravelCardBack expedition serial={i + 1} hintEmojis={hints} />
                    <PickedStamp active={isSelected && stamped && !showReveal} reduce={reduce} />
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
                    ) : null}
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
