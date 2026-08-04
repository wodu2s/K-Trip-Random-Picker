import { DESTINATIONS } from "../data/destinations";
import type { MysteryCardData, ThemeKey } from "../types/travel";

/** Fisher-Yates 셔플 (원본 배열은 변경하지 않는다) */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 선택한 조건(테마)을 기준으로 후보 여행지를 필터링한 뒤
 * 랜덤으로 5개를 중복 없이 뽑아 미스터리 카드 데이터로 변환한다.
 *
 * - 테마가 선택되면 해당 테마를 하나라도 포함하는 여행지만 후보로.
 * - 후보가 5개 미만이면 나머지 전체 목록에서 중복 없이 보충한다.
 */
export function recommendCards(themes: ThemeKey[]): MysteryCardData[] {
  const matched = themes.length
    ? DESTINATIONS.filter((d) => d.themes.some((t) => themes.includes(t)))
    : [...DESTINATIONS];

  let pool = shuffle(matched);
  if (pool.length < 5) {
    const matchedIds = new Set(matched.map((d) => d.id));
    const rest = shuffle(DESTINATIONS.filter((d) => !matchedIds.has(d.id)));
    pool = [...pool, ...rest];
  }

  return pool.slice(0, 5).map((d, i) => ({
    id: `card-${i + 1}-${d.id}`,
    destinationId: d.id,
  }));
}
