import { useCallback, useEffect, useRef, useState } from "react";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useShuffleChoreography } from "../../hooks/useShuffleChoreography";
import { getDestinationById } from "../../data/destinations";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import { isSelectable } from "../../lib/cardPhaseUtils";
import { fanAnchorsX, getLayoutScale } from "../../lib/cardLayout";
import { CARD_MOTION, phaseWaitMs, wait } from "../../lib/cardMotion";
import type { CardPhase } from "../../types/travel";
import { CardDeck } from "./CardDeck";
import "./compass-stage.css";

/** rail 높이(px) — waypoint 점과 카드 하단을 잇는 tether가 들어갈 만큼만 */
const RAIL_H = 56;
/** 카드 하단 y를 따라가는 waypoint 높이 — 바깥 카드가 더 아래로 내려온다 */
const RAIL_NODE_Y = [26, 16, 10, 16, 26];

/**
 * fan 아래 waypoint·route — 5개 지점이 카드 하단과 이어진다.
 * 셔플이 시작될 때 route light sweep을 한 번만 흘린다.
 */
function CardRouteRail({
  width,
  anchors,
  phase,
  selectedAnchor,
}: {
  width: number;
  anchors: number[];
  phase: CardPhase;
  selectedAnchor: number | null;
}) {
  /* 셔플 내내 마운트를 유지해 sweep이 단계마다 재시작하지 않게 한다 */
  const shuffling = phase === "gathering" || phase === "crossing";
  /* fan-out이 끝나는 시점에 waypoint를 순서대로 점등한다 */
  const fanned = phase === "selectable";
  const route = anchors
    .map((x, i) => `${i === 0 ? "M" : "L"}${x} ${RAIL_NODE_Y[i] ?? 16}`)
    .join(" ");

  return (
    <div className="card-rail" aria-hidden="true">
      <svg
        className="card-rail__chart"
        viewBox={`${-width / 2} 0 ${width} ${RAIL_H}`}
        preserveAspectRatio="none"
        height={RAIL_H}
      >
        <path className="card-rail__route" d={route} />
        {shuffling ? <path className="card-rail__sweep" d={route} /> : null}
        {anchors.map((x, i) => {
          const y = RAIL_NODE_Y[i] ?? 16;
          const on = selectedAnchor === x;
          return (
            <g
              key={x}
              className={`card-rail__node${on ? " card-rail__node--on" : ""}${
                selectedAnchor != null && !on ? " card-rail__node--dim" : ""
              }${fanned ? " card-rail__node--lit" : ""}`}
              /* waypoint는 왼쪽부터 60ms 간격으로 점등된다 */
              style={fanned ? { animationDelay: `${i * 60}ms` } : undefined}
            >
              <line x1={x} y1={y - 14} x2={x} y2={y - 3} />
              <circle cx={x} cy={y} r="4" />
            </g>
          );
        })}
      </svg>

      {selectedAnchor != null ? (
        <div
          className="card-rail__converge"
          style={{ transformOrigin: `calc(50% + ${selectedAnchor}px) 50%` }}
        />
      ) : null}
    </div>
  );
}

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
        await wait(phaseWaitMs(0.26, reduce), ac.signal);
        setFlipped(true);
        await wait(phaseWaitMs(CARD_MOTION.flip, reduce), ac.signal);
        await wait(phaseWaitMs(0.4, reduce), ac.signal);
        setPhase("complete");
      } catch {
        /* aborted */
      }
    },
    [phase, localSelected, reduce, selectCard, setPhase],
  );

  /* waypoint는 fan 카드와 같은 x를 쓴다 — fan 간격 자체는 건드리지 않는다 */
  const anchors = fanAnchorsX(getLayoutScale(stageW, cardW));
  const selectedIndex = localSelected
    ? cards.findIndex((c) => c.id === localSelected)
    : -1;
  const selectedAnchor = selectedIndex >= 0 ? (anchors[selectedIndex] ?? 0) : null;

  /* 회전한 fan 카드가 잘리지 않을 만큼의 높이 + 선택·hover 리프트 여유 */
  const stageH = Math.round(cardH * 1.24 + (isMobile ? 96 : 120));

  /* 데스크톱에서 헤더 아래 첫 화면에 무대 전체가 들어오도록 균일 축소 */
  const fitScale = isMobile
    ? 1
    : Math.min(1, (viewportH - HEADER_H - STAGE_GUTTER) / stageH);

  return (
    <div
      ref={stageRef}
      className="adventure-card-stage compass-stage relative mx-auto w-full overflow-visible"
      style={{
        maxWidth: stageW,
        height: Math.round(stageH * fitScale),
        transform: fitScale < 1 ? `scale(${fitScale})` : undefined,
        transformOrigin: "center center",
        background: "transparent",
      }}
    >
      {cards.length === 5 ? (
        <>
          <CardRouteRail
            width={stageW}
            anchors={anchors}
            phase={phase}
            selectedAnchor={selectedAnchor}
          />
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
        </>
      ) : null}

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
