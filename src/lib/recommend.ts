import { DESTINATIONS, COMPANION_THEME_HINTS, MOOD_THEME_HINTS } from "../data/destinations";
import type { CompanionKey, DiscoveryKey, Destination, MoodKey, MysteryCardData, ThemeKey } from "../types/travel";

/** Fisher-Yates 셔플 (원본 배열은 변경하지 않는다) */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 후보가 비지 않을 때만 적용되는 소프트 필터 — 비어버리면 이전 후보군 유지 */
function narrow(pool: Destination[], predicate: (d: Destination) => boolean): Destination[] {
  const next = pool.filter(predicate);
  return next.length ? next : pool;
}

export type RecommendOptions = {
  companion?: CompanionKey | null;
  mood?: MoodKey | null;
  discovery?: DiscoveryKey | null;
};

/**
 * 선택한 조건을 기준으로 후보 여행지를 필터링한 뒤
 * 랜덤으로 5개를 중복 없이 뽑아 미스터리 카드 데이터로 변환한다.
 *
 * - 테마: 하나라도 포함하면 후보 (기존 로직 유지).
 * - 동행/분위기: 테마 힌트와 겹치는 곳으로 소프트 좁히기 (후보가 비면 건너뜀).
 * - 발견 성향: 기존 isHiddenGem 필드를 재사용 (popular=false, hidden=true, balanced=필터 없음).
 * - 후보가 5개 미만이면 나머지 전체 목록에서 중복 없이 보충한다.
 */
export function recommendCards(themes: ThemeKey[], options: RecommendOptions = {}): MysteryCardData[] {
  const { companion, mood, discovery } = options;

  let matched = themes.length
    ? DESTINATIONS.filter((d) => d.themes.some((t) => themes.includes(t)))
    : [...DESTINATIONS];

  if (companion) {
    const hints = COMPANION_THEME_HINTS[companion];
    matched = narrow(matched, (d) => d.themes.some((t) => hints.includes(t)));
  }
  if (mood) {
    const hints = MOOD_THEME_HINTS[mood];
    matched = narrow(matched, (d) => d.themes.some((t) => hints.includes(t)));
  }
  if (discovery === "hidden") {
    matched = narrow(matched, (d) => d.isHiddenGem);
  } else if (discovery === "popular") {
    matched = narrow(matched, (d) => !d.isHiddenGem);
  }

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
