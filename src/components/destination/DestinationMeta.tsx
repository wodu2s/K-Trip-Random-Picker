import { Clock, MapPin, Star, Backpack } from "lucide-react";
import type { Destination } from "../../types/travel";
import { cn } from "../../utils/cn";

/**
 * 탐험 도구 카드 — 핵심 메타 정보 최대 4개.
 */
export function DestinationMeta({ destination }: { destination: Destination }) {
  const { rating, reviewCount, travelTimeText, region, isHiddenGem, hiddenPlaces } = destination;

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
    {
      title: "여행자 평점",
      value: rating.toFixed(1),
      note: `리뷰 ${reviewCount.toLocaleString()}개`,
      Icon: Star,
    },
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
