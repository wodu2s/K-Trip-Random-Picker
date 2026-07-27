import type { Destination } from "@/types/travel";

/** ★ 5개를 평점만큼 채워서 표시 (이모지 대신 심볼 → 깔끔한 별점 UI) */
function Stars({ score }: { score: number }) {
  return (
    <span aria-hidden="true" className="text-[15px] leading-none tracking-tight">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < Math.round(score) ? "text-accent" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * 여행지 메타 정보 카드.
 * 임의의 "지수" 대신 여행자 리뷰 평점(별점)·리뷰 수로 신뢰감을 준다.
 * (rating/reviewCount는 프로토타입 샘플이며, 실제로는 리뷰 API에서 받아온다.)
 */
export function DestinationMeta({ destination }: { destination: Destination }) {
  const { rating, reviewCount, travelTimeText, hiddenPlaces } = destination;
  const satisfaction = Math.round((rating / 5) * 100);

  const cards: {
    title: string;
    value: string;
    stars?: number;
    note: string;
  }[] = [
    {
      title: "예상 이동 시간",
      value: travelTimeText,
      note: "대중교통 기준",
    },
    {
      title: "여행자 평점",
      value: rating.toFixed(1),
      stars: rating,
      note: `리뷰 ${reviewCount.toLocaleString()}개`,
    },
    {
      title: "추천 만족도",
      value: `${satisfaction}%`,
      note: "다시 가고 싶어요",
    },
    {
      title: "숨은 명소",
      value: `${hiddenPlaces.length}곳`,
      note: "로컬 추천",
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <li
          key={c.title}
          className="surface-card flex flex-col gap-1 rounded-2xl p-4 text-left"
        >
          <span className="text-xs font-semibold text-muted">{c.title}</span>
          <span className="text-lg font-extrabold text-primary-dark">
            {c.value}
          </span>
          {c.stars !== undefined && <Stars score={c.stars} />}
          <span className="text-xs text-muted">{c.note}</span>
        </li>
      ))}
    </ul>
  );
}
