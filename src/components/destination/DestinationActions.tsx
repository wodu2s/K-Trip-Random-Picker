import { RouteIcon, Shuffle } from "lucide-react";
import type { Destination } from "../../types/travel";
import { useTravel } from "../../state/TravelContext";

/** 좌표가 있으면 카카오맵 장소, 없으면 이름으로 검색한다 */
export function kakaoMapUrl(destination: Destination): string {
  const { name, lat, lng } = destination;
  if (lat && lng) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
  }
  return `https://map.kakao.com/?q=${encodeURIComponent(name)}`;
}

function scrollToSchedule() {
  document.getElementById("schedule-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Hero 액션 — 코스 스크롤 1개. 다시 뽑기는 하단 바에서만.
 */
export function DestinationActions({
  variant = "hero",
}: {
  destination: Destination;
  variant?: "hero" | "bar";
}) {
  const { startShuffle } = useTravel();

  if (variant === "bar") {
    return (
      <div className="dossier-cta-row">
        <button type="button" className="dossier-btn dossier-btn--ghost" onClick={startShuffle}>
          <Shuffle className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          다시 뽑기
        </button>
        <button type="button" className="dossier-btn dossier-btn--primary" onClick={scrollToSchedule}>
          <RouteIcon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
          코스 추천받기
        </button>
      </div>
    );
  }

  return (
    <div className="dossier-cta-row">
      <button type="button" className="dossier-btn dossier-btn--primary" onClick={scrollToSchedule}>
        <RouteIcon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
        코스 추천받기
      </button>
    </div>
  );
}
