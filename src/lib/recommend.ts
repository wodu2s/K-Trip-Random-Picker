import { DESTINATIONS } from "@/data/destinations";
import type { MysteryCardData, ThemeKey } from "@/types/travel";

/** Fisher-Yates 셔플 (원본 불변) */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 선택한 조건(테마)을 기준으로 후보 여행지를 필터링한 뒤
 * 랜덤으로 5개를 뽑아 미스터리 카드 데이터로 변환한다.
 *
 * - 테마가 선택되면 해당 테마를 하나라도 포함하는 여행지만 후보로.
 * - 후보가 5개 미만이면 전체 목록으로 보충(부족분 채우기).
 * - 실제 네트워크 호출 없이 로컬 샘플 데이터만 사용.
 */
export function recommendCards(themes: ThemeKey[]): MysteryCardData[] {
  const matched = themes.length
    ? DESTINATIONS.filter((d) => d.themes.some((t) => themes.includes(t)))
    : [...DESTINATIONS];

  // 후보 풀 구성 (부족하면 나머지 여행지로 보충)
  let pool = shuffle(matched);
  if (pool.length < 5) {
    const rest = shuffle(DESTINATIONS.filter((d) => !matched.includes(d)));
    pool = [...pool, ...rest];
  }

  return pool.slice(0, 5).map((d, i) => ({
    id: `card-${i + 1}`,
    destinationId: d.id,
    emojiHints: d.emojiHints,
  }));
}
