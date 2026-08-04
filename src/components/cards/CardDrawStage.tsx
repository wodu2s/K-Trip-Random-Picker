import { useCallback, useEffect, useRef, useState } from "react";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useShuffleChoreography } from "../../hooks/useShuffleChoreography";
import { getDestinationById } from "../../data/destinations";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import { isSelectable } from "../../lib/cardPhaseUtils";
import { CARD_MOTION, phaseWaitMs, wait } from "../../lib/cardMotion";
import type { CardPhase } from "../../types/travel";
import { CardDeck } from "./CardDeck";
import { ShuffleFx } from "./ShuffleFx";

function useStageSize() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 640;
  const isTablet = width < 1024;
  const cardW = isMobile
    ? Math.round(Math.min(width * 0.62, 200))
    : isTablet
      ? 236
      : 256;
  const cardH = Math.round((cardW * 3) / 2);
  const stageW = Math.min(isMobile ? width - 12 : isTablet ? 920 : 1160, width - 20);

  return { stageW, cardW, cardH, isMobile, isTablet };
}

function StageDecor() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: `1px solid ${ADVENTURE.forest}`, opacity: 0.07 }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ border: `1px dashed ${ADVENTURE.brass}`, opacity: 0.08 }}
      />
    </div>
  );
}

/** 카드 드로우 스테이지 — 셔플·선택·공개 오케스트레이션 */
export function CardDrawStage({
  onPhaseChange,
}: {
  onPhaseChange?: (phase: CardPhase) => void;
}) {
  const reduce = useReducedMotion();
  const { cards, selectCard, deckGeneration } = useTravel();
  const { stageW, cardW, cardH, isMobile } = useStageSize();

  const { phase, mixStep, setPhase } = useShuffleChoreography(deckGeneration, reduce);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(true);
  const lockRef = useRef(false);
  const selectAbortRef = useRef<AbortController | null>(null);

  const reportPhase = useCallback(
    (next: CardPhase) => {
      onPhaseChange?.(next);
    },
    [onPhaseChange],
  );

  useEffect(() => {
    reportPhase(phase);
  }, [phase, reportPhase]);

  useEffect(() => {
    selectAbortRef.current?.abort();
    selectAbortRef.current = null;
    lockRef.current = true;
    setInteractionLocked(true);
    setLocalSelected(null);
    setStamped(false);
    setFlipped(false);
    setHoveredId(null);
  }, [deckGeneration]);

  useEffect(() => () => selectAbortRef.current?.abort(), []);

  useEffect(() => {
    if (phase === "selectable") {
      lockRef.current = false;
      setInteractionLocked(false);
    }
  }, [phase]);

  const handleSelect = useCallback(
    async (cardId: string, destinationId: string) => {
      if (!isSelectable(phase) || lockRef.current || localSelected) return;
      const dest = getDestinationById(destinationId);
      if (!dest) {
        setPhase("error");
        return;
      }

      selectAbortRef.current?.abort();
      const ac = new AbortController();
      selectAbortRef.current = ac;

      lockRef.current = true;
      setInteractionLocked(true);
      setLocalSelected(cardId);
      setHoveredId(null);
      selectCard(cardId, destinationId);
      setPhase("selected");

      try {
        await wait(phaseWaitMs(CARD_MOTION.select, reduce), ac.signal);
        setPhase("revealing");
        setStamped(true);
        await wait(phaseWaitMs(0.5, reduce), ac.signal);
        setFlipped(true);
        await wait(phaseWaitMs(CARD_MOTION.flip, reduce), ac.signal);
        await wait(phaseWaitMs(0.7, reduce), ac.signal);
        setPhase("complete");
      } catch {
        /* aborted — deck remount or unmount */
      }
    },
    [phase, localSelected, reduce, selectCard, setPhase],
  );

  const stageH = Math.max(cardH + (isMobile ? 160 : 200), isMobile ? 480 : 580);

  return (
    <div
      className="adventure-card-stage relative mx-auto w-full overflow-hidden rounded-[16px]"
      style={{
        maxWidth: stageW,
        height: stageH,
        background:
          "radial-gradient(circle at center, rgba(245,240,225,0.98) 0%, rgba(228,214,176,0.94) 100%)",
        border: `1px solid ${ADVENTURE.line}`,
        boxShadow: "inset 0 1px 0 rgba(255,253,248,0.55), 0 12px 32px rgba(22,40,31,0.1)",
      }}
    >
      <StageDecor />
      <ShuffleFx phase={phase} reduce={reduce} isMobile={isMobile} />

      {cards.length === 5 ? (
        <CardDeck
          cards={cards}
          phase={phase}
          mixStep={mixStep}
          reduce={reduce}
          isMobile={isMobile}
          stageW={stageW}
          cardW={cardW}
          cardH={cardH}
          selectedId={localSelected}
          stamped={stamped}
          flipped={flipped}
          hoveredId={hoveredId}
          locked={interactionLocked}
          onHoverChange={setHoveredId}
          onSelect={handleSelect}
        />
      ) : null}

      {phase === "error" && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[16px]"
          style={{ background: "rgba(245,240,225,0.9)" }}
        >
          <p className="text-sm font-bold" style={{ color: ADVENTURE.ink }}>
            여행지 정보를 불러오지 못했어요. 다시 뽑아주세요.
          </p>
        </div>
      )}
    </div>
  );
}

/** @deprecated CardDrawStage 사용 */
export { CardDrawStage as TravelCardDeck };
