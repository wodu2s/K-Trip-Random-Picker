import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { PageContainer } from "../layout/PageContainer";
import { StepProgress } from "../layout/StepProgress";
import { AdventurePageShell, ExpeditionSectionHeader } from "../layout/AdventurePageShell";
import { CardDrawStage } from "./CardDrawStage";
import { CardActionBar } from "./CardActionBar";
import { Button } from "../ui/Button";
import { useTravel } from "../../state/TravelContext";
import type { CardPhase } from "../../types/travel";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import { expeditionFromPhase } from "../../lib/expeditionPhase";
import {
  isComplete,
  isSelectable,
  isSelecting,
  isShuffling,
} from "../../lib/cardPhaseUtils";

const STATUS: Partial<Record<CardPhase, string>> = {
  ready: "여행 신호를 깨우는 중",
  gathering: "탐험 신호를 점화하는 중",
  fanOut: "후보 경로가 펼쳐지는 중",
  crossing: "경로를 교차하는 중",
  mixing: "신호를 섞는 중",
  restacking: "경로를 하나의 덱으로 모으는 중",
  selectable: "마음이 끌리는 카드를 선택하세요.",
  selected: "선택한 신호를 확인하는 중",
  revealing: "목적지를 공개하는 중",
  complete: "목적지가 공개되었습니다",
};

/** Adventure Compass Card 드로우 — phase와 StepProgress 동기화 */
export function CardsPage() {
  const { cards, redraw, selectedCardId, deckGeneration, goToDestination } = useTravel();
  const [phase, setPhase] = useState<CardPhase>("ready");
  const meta = expeditionFromPhase(phase);

  const shuffling = isShuffling(phase);
  const selecting = isSelecting(phase);
  const complete = isComplete(phase);
  const busy = Boolean(selectedCardId) || shuffling || selecting || complete;

  useEffect(() => {
    setPhase("ready");
  }, [deckGeneration]);

  useEffect(() => {
    if (!complete) return;
    const id = window.setTimeout(() => goToDestination(), 1400);
    return () => window.clearTimeout(id);
  }, [complete, goToDestination, deckGeneration]);

  return (
    <AdventurePageShell>
      <PageContainer className="flex min-h-[calc(100vh-4rem)] flex-col justify-center text-center">
        <div className="relative mb-4">
          <StepProgress current={meta.step} className="mx-auto max-w-4xl" />
        </div>

        <ExpeditionSectionHeader
          label={meta.expedition}
          title="오늘의 여행 신호"
          description={STATUS[phase] ?? "마음이 끌리는 카드를 선택하세요."}
        />

        <div className="mt-3">
          {cards.length === 5 ? (
            <CardDrawStage key={deckGeneration} onPhaseChange={setPhase} />
          ) : (
            <div className="min-h-[360px]" aria-hidden="true" />
          )}
        </div>

        {isSelectable(phase) && (
          <>
            <div className="expedition-panel mx-auto mt-5 flex max-w-xl items-start gap-3 px-5 py-4 text-left">
              <Compass
                className="mt-0.5 h-5 w-5 shrink-0 text-brass"
                strokeWidth={2.1}
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed" style={{ color: ADVENTURE.ink }}>
                <span className="font-expedition font-bold" style={{ color: ADVENTURE.forest }}>
                  HINT
                </span>
                <span className="mx-2" style={{ color: ADVENTURE.muted }}>
                  |
                </span>
                나침반 주변 신호는 여행지의 분위기만 알려줘요. 목적지는 카드를 고른 뒤에 공개됩니다.
              </p>
            </div>
            <CardActionBar onRedraw={redraw} disabled={busy} />
          </>
        )}

        {selecting && (
          <p className="mt-5 text-sm font-semibold text-muted" role="status">
            {STATUS[phase]}
          </p>
        )}

        {complete && (
          <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3">
            <Button variant="primary" size="lg" className="w-full" onClick={goToDestination}>
              탐험 결과 보기
            </Button>
            <button
              type="button"
              onClick={redraw}
              className="text-sm font-semibold text-muted underline-offset-2 hover:text-primary hover:underline"
            >
              카드 다시 뽑기
            </button>
            <p className="text-xs text-muted" role="status">
              탐험 결과를 여는 중…
            </p>
          </div>
        )}
      </PageContainer>
    </AdventurePageShell>
  );
}
