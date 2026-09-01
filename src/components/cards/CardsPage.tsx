import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Shuffle } from "lucide-react";
import { CardDrawStage, type CardDrawControls } from "./CardDrawStage";
import { useTravel } from "../../state/TravelContext";
import type { CardPhase } from "../../types/travel";
import { isComplete, isSelectable, isShuffling, isSelecting } from "../../lib/cardPhaseUtils";
import "./cards-page.css";

/** 메인 제목은 단계와 무관하게 고정한다 */
const ASIDE_LEAD = "운명의 방향,\n당신의 다음 여정은?";

const ASIDE_SUB: Partial<Record<CardPhase, string>> = {
  ready: "5장의 탐험 카드 중\n끌리는 카드를 선택해 보세요.",
  gathering: "여행 후보를\n섞는 중…",
  crossing: "여행 후보를\n섞는 중…",
  selectable: "마음이 가는 카드\n한 장을 선택하세요",
  selected: "선택한 카드를 확인합니다.\n당신의 여정이 시작됩니다.",
  revealing: "목적지 공개 중…\n별자리가 길을 비춥니다.",
  complete: "목적지를 찾았어요.\n탐험 결과를 확인해 보세요.",
};

/**
 * 배경 해도 위 가독성 레이어 — 카드·좌측 카피·CTA 대비만 만든다.
 * 지형·나침반·항로는 배경 이미지가 담당한다.
 */
function CardsAtmosphere() {
  return (
    <div className="cards-page__atmosphere" aria-hidden="true">
      <div className="cards-page__spotlight" />
      <div className="cards-page__grain" />
      <div className="cards-page__vignette" />
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
    () => ({
      lead: ASIDE_LEAD,
      sub: ASIDE_SUB[phase] ?? ASIDE_SUB.ready!,
    }),
    [phase],
  );

  useEffect(() => {
    setPhase("ready");
  }, [deckGeneration]);

  useEffect(() => {
    if (!complete) return;
    const id = window.setTimeout(() => goToDestination(), 900);
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
