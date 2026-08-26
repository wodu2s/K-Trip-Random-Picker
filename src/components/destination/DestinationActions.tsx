import { useState } from "react";
import { Bookmark, Check, RouteIcon, Shuffle } from "lucide-react";
import type { Destination } from "../../types/travel";
import { Button } from "../ui/Button";
import { useTravel } from "../../state/TravelContext";
import { StampBadge } from "../layout/AdventurePageShell";

/**
 * 결과 화면 액션 — 코스 / 저장 / 새 카드
 */
export function DestinationActions({ destination }: { destination: Destination }) {
  const [saved, setSaved] = useState(false);
  const { startShuffle, restart, recommendationLoading } = useTravel();

  function scrollToSchedule() {
    document.getElementById("schedule-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-3">
      <Button variant="primary" size="lg" className="w-full" onClick={scrollToSchedule}>
        <RouteIcon className="h-5 w-5 text-accent" strokeWidth={2.2} aria-hidden="true" />
        상세 코스 보기
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
      >
        {saved ? (
          <Check className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <Bookmark className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
        )}
        {saved ? "저장됨" : "저장하기"}
        {saved && (
          <StampBadge className="ml-1" tone="orange">
            LOG
          </StampBadge>
        )}
      </Button>

      {saved && (
        <p className="text-center text-sm text-success" role="status">
          탐험 기록에 저장했어요! (프로토타입 · 로컬 저장)
        </p>
      )}

      <Button variant="accent" size="lg" className="w-full" onClick={startShuffle} disabled={recommendationLoading}>
        <Shuffle className="h-5 w-5 text-primary" strokeWidth={2.2} aria-hidden="true" />새 여행 카드 받기
      </Button>

      <button
        type="button"
        onClick={restart}
        className="w-full py-2 text-sm font-semibold text-muted underline-offset-2 hover:text-primary hover:underline"
      >
        조건부터 다시 설정
      </button>

      <span className="sr-only">{destination.name}</span>
    </div>
  );
}
