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
  isSelecting,
  showsCardBack,
} from "../../lib/cardPhaseUtils";
import type { CardPhase, MysteryCardData } from "../../types/travel";
import { AdventureTravelCard } from "./AdventureTravelCard";
import { CardFx } from "./CardFx";
import { TravelCardBack } from "./TravelCardBack";
import "./shuffleDeck.css";

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

  const showBack = showsCardBack(phase) && !isSelecting(phase) && phase !== "complete";

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
      <CardFx
        phase={phase}
        reduce={reduce}
        isMobile={isMobile}
        centerGlow={isSelectable(phase) && !selectedId}
      />

      <motion.div
        className="shuffle-deck__stage"
        aria-live="polite"
        animate={
          phase === "ready" && !reduce ? { y: [0, -4, 0] } : { y: 0 }
        }
        transition={
          phase === "ready" && !reduce
            ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
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

          let { x, y, rotate, scale, opacity, z, rotateX = 0 } = pose;

          if (isHover) {
            y -= 14;
            scale = Math.min(scale + 0.04, 1.04);
            rotate *= 0.35;
            z = 18;
          } else if (
            isSelectable(phase) &&
            hoveredId &&
            hoveredId !== card.id &&
            !selectedId &&
            !isMobile
          ) {
            scale *= 0.99;
          }

          const duration = durationForShufflePhase(phase, reduce);
          const delay = cardStaggerDelay(phase, i, reduce);
          const ease = transitionEaseForPhase(phase);
          const disabled = !isSelectable(phase) || locked || Boolean(selectedId);

          const isFocusSelected =
            isSelected &&
            (phase === "selected" || phase === "revealing" || phase === "complete");

          const showHintFace =
            (isSelectable(phase) || isSelecting(phase) || phase === "complete") && !showBack;
          const showReveal = isSelected && flipped;
          const rotateY = showReveal ? 180 : showHintFace ? 0 : showBack ? 180 : 0;

          const faceTurnDuration =
            showReveal && flipped
              ? reduce
                ? 0.18
                : CARD_MOTION.flip
              : showHintFace && isSelectable(phase)
                ? reduce
                  ? 0.14
                  : CARD_MOTION.selectable
                : 0;

          const scaleAnim =
            phase === "gathering"
              ? 1
              : phase === "ready" && i === 2 && !reduce
                ? [1, 1.025, 1]
                : scale;

          const showTrail = !reduce && (phase === "fanOut" || phase === "crossing");
          const liveMotion = LIVE_PHASES.has(phase) || phase === "ready";

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
                  ? "drop-shadow(0 16px 32px rgba(22,40,31,0.28))"
                  : "drop-shadow(0 12px 24px rgba(22,40,31,0.16))",
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
                rotateX,
                scale: scaleAnim,
                opacity,
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

              {i === 2 && isSelectable(phase) && !selectedId ? (
                <div
                  className="shuffle-deck__center-glow shuffle-deck__center-glow--pulse"
                  aria-hidden="true"
                />
              ) : null}

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
