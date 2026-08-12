import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useShuffleChoreography } from "../../hooks/useShuffleChoreography";
import { getDestinationById } from "../../data/destinations";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import { getCompassStageMetrics } from "../../lib/compassStageLayout";
import { isSelectable } from "../../lib/cardPhaseUtils";
import { CARD_MOTION, phaseWaitMs, wait } from "../../lib/cardMotion";
import type { CardPhase } from "../../types/travel";
import { CardDeck } from "./CardDeck";
import { ShuffleFx } from "./ShuffleFx";
import "./compass-stage.css";

function useStageSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? Math.min(window.innerWidth - 32, 1160) : 1160,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const isMobile = width < 640;
  const isTablet = width < 1024;
  const cardW = isMobile
    ? Math.round(Math.min(width * 0.54, 168))
    : isTablet
      ? Math.round(Math.min(width * 0.30, 228))
      : Math.round(Math.min(width * 0.24, 268));
  const cardH = Math.round((cardW * 3) / 2);

  return { stageW: width, cardW, cardH, isMobile, isTablet };
}

/** sticky 헤더 높이 */
const HEADER_H = 86;
/** 무대 위 여백 + 원판이 무대 박스 아래로 걸치는 만큼의 하단 여백 */
const STAGE_GUTTER = 56;

function useViewportHeight() {
  const [height, setHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900,
  );

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return height;
}

export type CardDrawControls = {
  startShuffle: () => void;
};

/** 카드 드로우 스테이지 — 셔플·선택·공개 오케스트레이션 */
export function CardDrawStage({
  onPhaseChange,
  onControls,
}: {
  onPhaseChange?: (phase: CardPhase) => void;
  onControls?: (controls: CardDrawControls) => void;
}) {
  const reduce = useReducedMotion();
  const { cards, selectCard, deckGeneration } = useTravel();
  const stageRef = useRef<HTMLDivElement>(null);
  const { stageW, cardW, cardH, isMobile } = useStageSize(stageRef);
  const viewportH = useViewportHeight();

  const { phase, mixStep, setPhase, startShuffle } = useShuffleChoreography(
    deckGeneration,
    reduce,
    false,
  );

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const [stamped, setStamped] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(true);
  const lockRef = useRef(false);
  const selectAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onControls?.({ startShuffle });
  }, [onControls, startShuffle]);

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
    } else if (phase === "ready") {
      lockRef.current = true;
      setInteractionLocked(true);
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
        /* aborted */
      }
    },
    [phase, localSelected, reduce, selectCard, setPhase],
  );

  const compassMetrics = useMemo(
    () => getCompassStageMetrics(isMobile, stageW),
    [isMobile, stageW],
  );

  /* fan 아랫변이 원판 중심보다 cardGap 만큼 위에 오도록 카드 중심 높이를 잡는다 */
  const cardLiftPx = Math.round(cardH * 0.5 + compassMetrics.cardGapPx);

  /* 카드를 나침반 위로 띄운 만큼 무대 상단에 빈 공간이 생기므로,
     높이를 실제 구성(원판 중심 + lift + 카드 절반)에 맞춰 잡는다 */
  const stageH = Math.round(
    Math.max(
      compassMetrics.discCenterPx +
        compassMetrics.pivotBottomPx +
        cardLiftPx -
        compassMetrics.stageOffsetPx +
        cardH * 0.56 +
        (isMobile ? 28 : 22),
      isMobile ? 620 : 640,
    ),
  );

  /* 데스크톱에서 헤더 아래 첫 화면에 무대 전체가 들어오도록 균일 축소.
     비율(입체 배치)은 그대로 두고 장면 전체만 맞춘다 */
  const fitScale = isMobile
    ? 1
    : Math.min(1, (viewportH - HEADER_H - STAGE_GUTTER) / stageH);

  const anchorStyle = {
    "--compass-pivot-bottom": `${compassMetrics.pivotBottomPx}px`,
    "--compass-stage-offset": `${compassMetrics.stageOffsetPx}px`,
    "--compass-card-lift": `${cardLiftPx}px`,
    "--compass-disc-center": `${compassMetrics.discCenterPx}px`,
    "--compass-disc-width": `${compassMetrics.discWidthPx}px`,
  } as CSSProperties;

  return (
    <div
      ref={stageRef}
      className="adventure-card-stage compass-stage relative mx-auto w-full overflow-visible"
      style={{
        maxWidth: stageW,
        height: Math.round(stageH * fitScale),
        transform: fitScale < 1 ? `scale(${fitScale})` : undefined,
        transformOrigin: "bottom center",
        background: "transparent",
      }}
    >
      <div className="compass-stage__anchor" style={anchorStyle}>
        <ShuffleFx
          phase={phase}
          reduce={reduce}
          isMobile={isMobile}
          stageW={stageW}
        />

        {cards.length === 5 ? (
          <div className="compass-stage__deck">
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
          </div>
        ) : null}
      </div>

      {phase === "error" && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[16px]"
          style={{ background: "rgba(5,16,27,0.92)" }}
        >
          <p className="text-sm font-bold" style={{ color: ADVENTURE.parchmentLight }}>
            여행지 정보를 불러오지 못했어요. 다시 뽑아주세요.
          </p>
        </div>
      )}
    </div>
  );
}

/** @deprecated CardDrawStage 사용 */
export { CardDrawStage as TravelCardDeck };
