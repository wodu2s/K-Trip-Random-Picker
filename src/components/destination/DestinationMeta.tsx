import { Clock, MapPin, Star, Backpack, Clock3 } from "lucide-react";
import type { Destination, DestinationInfo } from "../../types/travel";
import { cn } from "../../utils/cn";

/**
 * 탐험 도구 카드 — 핵심 메타 정보 최대 4개.
 */
export function DestinationMeta({
  destination,
  info,
}: {
  destination: Destination;
  info?: DestinationInfo;
}) {
  const { rating, reviewCount, travelTimeText, region, isHiddenGem, hiddenPlaces } = destination;

  /**
   * KTO에는 평점·리뷰가 없다. 목데이터(reviewCount > 0)일 때만 평점을 보여주고,
   * 실제 API 여행지는 detailIntro2의 운영 시간으로 대체한다.
   * 둘 다 없을 때만 "정보 없음"을 남긴다.
   */
  const ratingCard =
    reviewCount > 0
      ? { title: "여행자 평점", value: rating.toFixed(1), note: `리뷰 ${reviewCount.toLocaleString()}개`, Icon: Star }
      : info?.usetime
        ? { title: "운영 시간", value: info.usetime, note: "관광공사 제공", Icon: Clock3 }
        : { title: "여행자 평점", value: "정보 없음", note: "관광공사 데이터 기준", Icon: Star };

  const cards = [
    {
      title: "이동 시간",
      value: travelTimeText,
      note: "대중교통 기준",
      Icon: Clock,
    },
    {
      title: "위치",
      value: region.split(" ").slice(0, 2).join(" "),
      note: "탐험 좌표",
      Icon: MapPin,
    },
    ratingCard,
    {
      title: "여행 유형",
      value: isHiddenGem ? "숨은 명소" : "추천 코스",
      note: `주변 ${hiddenPlaces.length}곳`,
      Icon: Backpack,
    },
  ] as const;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <li
          key={c.title}
          className={cn(
            "flex flex-col gap-1 rounded-[10px] border border-brass/25 bg-[var(--color-parchment-100)] p-4 text-left shadow-[0_8px_20px_rgba(22,40,31,0.08)]",
          )}
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <c.Icon className="h-3.5 w-3.5 text-brass" strokeWidth={2.2} aria-hidden="true" />
            {c.title}
          </span>
          <span className="font-expedition text-lg font-bold text-primary">{c.value}</span>
          <span className="text-xs text-muted">{c.note}</span>
        </li>
      ))}
    </ul>
  );
}
