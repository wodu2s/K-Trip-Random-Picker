import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Shuffle } from "lucide-react";
import { CardDrawStage, type CardDrawControls } from "./CardDrawStage";
import { useTravel } from "../../state/TravelContext";
import type { CardPhase } from "../../types/travel";
import { isComplete, isSelectable, isShuffling, isSelecting } from "../../lib/cardPhaseUtils";
import "./cards-page.css";

const ASIDE_COPY: Partial<
  Record<CardPhase, { lead: string; sub: string }>
> = {
  ready: {
    lead: "운명의 방향,\n당신의 다음 여정은?",
    sub: "5장의 탐험 카드 중\n끌리는 카드를 선택해 보세요.",
  },
  selectable: {
    lead: "운명의 방향,\n당신의 다음 여정은?",
    sub: "5장의 탐험 카드 중\n끌리는 카드를 선택해 보세요.",
  },
  gathering: { lead: "카드가\n운명의 중심으로", sub: "모이고 있습니다…" },
  fanOut: { lead: "카드가\n운명의 중심으로", sub: "모이고 있습니다…" },
  crossing: { lead: "항로가\n교차합니다", sub: "운명의 카드를 섞는 중…" },
  mixing: { lead: "항로가\n교차합니다", sub: "운명의 카드를 섞는 중…" },
  restacking: { lead: "다시\n한 덱으로", sub: "카드가 정렬됩니다…" },
  selected: { lead: "선택한\n카드를 확인", sub: "당신의 여정이 시작됩니다." },
  revealing: { lead: "목적지\n공개 중", sub: "별자리가 길을 비춥니다…" },
  complete: { lead: "목적지를\n찾았어요", sub: "탐험 결과를 확인해 보세요." },
};

const STAR_SEEDS = Array.from({ length: 56 }, (_, i) => ({
  left: `${(i * 19.7 + 3) % 98}%`,
  top: `${(i * 13.3 + 5) % 82}%`,
  delay: `${(i * 0.37) % 5.2}s`,
  dur: `${2.8 + (i % 6) * 0.55}s`,
  size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  bright: i % 11 === 0,
}));

const DUST_SEEDS = Array.from({ length: 18 }, (_, i) => ({
  left: `${12 + (i * 23.1) % 76}%`,
  top: `${18 + (i * 17.9) % 64}%`,
  delay: `${(i * 0.62) % 6}s`,
  dur: `${8 + (i % 4) * 2.5}s`,
}));

function CardsAtmosphere() {
  return (
    <div className="cards-page__atmosphere" aria-hidden="true">
      <div className="cards-page__nebula" />
      <div className="cards-page__vignette" />
      <div className="cards-page__mist" />

      <svg className="cards-page__chart" viewBox="0 0 800 800" fill="none">
        <circle cx="400" cy="400" r="360" stroke="#c9a227" strokeOpacity="0.14" strokeWidth="0.7" />
        <circle cx="400" cy="400" r="300" stroke="#c9a227" strokeOpacity="0.1" strokeWidth="0.6" strokeDasharray="4 8" />
        <circle cx="400" cy="400" r="240" stroke="#d8b84a" strokeOpacity="0.08" strokeWidth="0.5" />
        <circle cx="400" cy="400" r="180" stroke="#c9a227" strokeOpacity="0.12" strokeWidth="0.55" strokeDasharray="2 6" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x1 = 400 + Math.cos(a) * 180;
          const y1 = 400 + Math.sin(a) * 180;
          const x2 = 400 + Math.cos(a) * 360;
          const y2 = 400 + Math.sin(a) * 360;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#c9a227"
              strokeOpacity="0.07"
              strokeWidth="0.45"
            />
          );
        })}
        {[
          [400, 52, "N"],
          [748, 400, "E"],
          [400, 748, "S"],
          [52, 400, "W"],
        ].map(([x, y, label]) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#c9a227"
            fillOpacity="0.35"
            fontSize="14"
            fontFamily="serif"
            letterSpacing="0.2em"
          >
            {label}
          </text>
        ))}
        <circle cx="400" cy="400" r="3" fill="#e8c86a" fillOpacity="0.5" />
      </svg>

      <div className="cards-page__stars">
        {STAR_SEEDS.map((s, i) => (
          <span
            key={i}
            className={`cards-page__star${s.bright ? " cards-page__star--bright" : ""}`}
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.dur,
            }}
          />
        ))}
      </div>

      <div className="cards-page__dust">
        {DUST_SEEDS.map((d, i) => (
          <span
            key={i}
            className="cards-page__dust-particle"
            style={{
              left: d.left,
              top: d.top,
              animationDelay: d.delay,
              animationDuration: d.dur,
            }}
          />
        ))}
      </div>

      <div className="cards-page__orbit cards-page__orbit--a" />
      <div className="cards-page__orbit cards-page__orbit--b" />
    </div>
  );
}

/**
 * 프리미엄 카드 선택/셔플 — 천문 나침반 중심의 운명 선택 의식.
 */
export function CardsPage() {
  const { cards, redraw, selectedCardId, deckGeneration, goToDestination } = useTravel();
  const [phase, setPhase] = useState<CardPhase>("ready");
  const controlsRef = useRef<CardDrawControls | null>(null);

  const shuffling = isShuffling(phase) && phase !== "ready";
  const selecting = isSelecting(phase);
  const complete = isComplete(phase);
  const selectable = isSelectable(phase);
  const busy = Boolean(selectedCardId) || shuffling || selecting;

  const copy = useMemo(
    () =>
      ASIDE_COPY[phase] ?? {
        lead: "운명의 방향,\n당신의 다음 여정은?",
        sub: "5장의 탐험 카드 중\n끌리는 카드를 선택해 보세요.",
      },
    [phase],
  );

  useEffect(() => {
    setPhase("ready");
  }, [deckGeneration]);

  useEffect(() => {
    if (!complete) return;
    const id = window.setTimeout(() => goToDestination(), 1400);
    return () => window.clearTimeout(id);
  }, [complete, goToDestination, deckGeneration]);

  const handleControls = useCallback((controls: CardDrawControls) => {
    controlsRef.current = controls;
  }, []);

  const handleCta = () => {
    if (complete) {
      goToDestination();
      return;
    }
    if (selectable) {
      redraw();
      return;
    }
    if (phase === "ready") {
      controlsRef.current?.startShuffle();
    }
  };

  const ctaLabel = complete
    ? "탐험 결과 보기"
    : selectable
      ? "다시 섞기"
      : shuffling
        ? "카드를 섞는 중…"
        : "카드를 섞어보기";

  const ctaDisabled = busy && !complete && !selectable;

  return (
    <div className="cards-page">
      <CardsAtmosphere />

      <div className="cards-page__layout">
        <aside className="cards-page__aside">
          <p className="cards-page__eyebrow">PICK &amp; GO · EXPEDITION</p>
          <h1 className="cards-page__lead">
            {copy.lead.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h1>
          <p className="cards-page__sub">
            {copy.sub.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
          <div className="cards-page__aside-rule" aria-hidden="true" />
        </aside>

        <main className="cards-page__main">
          <div className="cards-page__stage-wrap">
            {cards.length === 5 ? (
              <CardDrawStage
                key={deckGeneration}
                onPhaseChange={setPhase}
                onControls={handleControls}
              />
            ) : null}
          </div>

          <div className="cards-page__cta-bar">
            <p className="cards-page__cta-guide">
              {selectable
                ? "지금 이 순간, 가장 끌리는 카드를 선택하세요."
                : complete
                  ? "당신의 다음 여정이 준비되었습니다."
                  : shuffling
                    ? "운명의 카드가 섞이고 있습니다…"
                    : "카드를 섞으면 5장의 탐험 카드가 펼쳐집니다."}
            </p>
            <div className="cards-page__cta-wrap">
              <button
                type="button"
                className="cards-page__cta"
                onClick={handleCta}
                disabled={ctaDisabled}
                aria-busy={shuffling}
              >
                {complete ? (
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                ) : selectable ? (
                  <RotateCcw className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                ) : (
                  <Shuffle className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                )}
                {ctaLabel}
              </button>
              {selectable && !complete ? (
                <p className="cards-page__cta-hint">카드를 탭하거나 클릭해 선택하세요</p>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
