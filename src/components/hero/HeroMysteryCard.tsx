import { TravelCardBack } from "../cards/TravelCardBack";

export type HeroTicketCardData = {
  id: string;
  index: number;
  emojis: readonly [string, string];
};

/** @deprecated 호환용 별칭 */
export type HeroMysteryCardData = HeroTicketCardData;

/**
 * Hero 전용 블루 여행 티켓 티저.
 * 실제 셔플 TravelCardBack과 동일한 디자인을 사용한다.
 */
export function HeroMysteryCard({
  card,
  width,
  isCenter,
  hintPulse,
  total = 5,
}: {
  card: HeroTicketCardData;
  width: number;
  isCenter: boolean;
  hintPulse: boolean;
  total?: number;
  drawProgress?: number;
  edgeSweep?: boolean;
  reduce?: boolean;
}) {
  return (
    <div className="relative" style={{ width, aspectRatio: "3 / 4" }}>
      <TravelCardBack
        index={card.index}
        total={total}
        hintEmojis={card.emojis}
        elevated={isCenter}
        pulseHint={isCenter && hintPulse}
      />
    </div>
  );
}
