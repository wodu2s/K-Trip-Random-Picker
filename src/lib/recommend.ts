import { fetchTourCandidates, type UserCoords } from "../api/travelApi";
import {
  COMPANION_THEME_HINTS,
  DESTINATIONS,
  MOOD_THEME_HINTS,
  registerRecommendedDestinations,
} from "../data/destinations";
import { candidateToDestination, normalizeTourDestination } from "./normalizeTourDestination";
import type {
  CompanionKey,
  Destination,
  DiscoveryKey,
  MoodKey,
  MysteryCardData,
  ThemeKey,
} from "../types/travel";

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

export type RecommendResult = {
  cards: MysteryCardData[];
  /** TourAPI 성공 시 true. 실패 시 샘플 DESTINATIONS fallback */
  fromApi: boolean;
  errorMessage?: string;
};

type CandidateCache = {
  destinations: Destination[];
  fromApi: boolean;
};

/** 한 추천 세션의 TourAPI 후보. 다시 뽑기는 이 목록을 재사용한다. */
let candidateCache: CandidateCache | null = null;

export function clearRecommendCache(): void {
  candidateCache = null;
}

export function hasApiCandidateCache(): boolean {
  return candidateCache?.fromApi === true;
}

/** 이미 받아 둔 후보 풀에서만 다시 뽑는다. API를 재호출하지 않는다. */
export function reshuffleCachedCards(
  themes: ThemeKey[],
  options: RecommendOptions,
  prevDestinationKey: string,
): RecommendResult | null {
  if (!candidateCache) return null;
  let cards = recommendFromPool(candidateCache.destinations, DESTINATIONS, themes, options);
  for (let i = 0; i < 6 && cards.map((c) => c.destinationId).join(",") === prevDestinationKey; i++) {
    cards = recommendFromPool(candidateCache.destinations, DESTINATIONS, themes, options);
  }
  return { cards, fromApi: candidateCache.fromApi };
}

function toMysteryCards(pool: Destination[]): MysteryCardData[] {
  return pool.slice(0, 5).map((d, i) => ({
    id: `card-${i + 1}-${d.id}`,
    destinationId: d.id,
  }));
}

function applyConditionFilters(pool: Destination[], themes: ThemeKey[], options: RecommendOptions): Destination[] {
  const { companion, mood, discovery } = options;

  let matched = themes.length
    ? pool.filter((d) => d.themes.some((t) => themes.includes(t)))
    : [...pool];

  if (companion) {
    const hints = COMPANION_THEME_HINTS[companion];
    matched = narrow(matched, (d) => d.themes.some((t) => hints.includes(t)));
  }
  if (mood) {
    const hints = MOOD_THEME_HINTS[mood];
    matched = narrow(matched, (d) => d.themes.some((t) => hints.includes(t)));
  }

  // TODO: LocgoHubTarService1 연동 후 hidden/popular 판단. 지금은 TourAPI 목록만으로 인기도를 알 수 없어 중립 처리.
  const canFilterDiscovery = matched.some((d) => d.source !== "tourapi");
  if (canFilterDiscovery && discovery === "hidden") {
    matched = narrow(matched, (d) => d.source === "tourapi" || d.isHiddenGem);
  } else if (canFilterDiscovery && discovery === "popular") {
    matched = narrow(matched, (d) => d.source === "tourapi" || !d.isHiddenGem);
  }

  return matched;
}

/**
 * 조건 필터 → contentid 중복 제거 → shuffle → 최대 5개.
 * 부족하면 테마 완화 → 전체 풀 → 샘플 데이터 순으로 보충한다.
 */
export function recommendFromPool(
  primaryPool: Destination[],
  fallbackPool: Destination[],
  themes: ThemeKey[],
  options: RecommendOptions = {},
): MysteryCardData[] {
  const seen = new Set<string>();
  const picked: Destination[] = [];

  const take = (list: Destination[]) => {
    for (const dest of list) {
      if (picked.length >= 5) return;
      if (seen.has(dest.id)) continue;
      seen.add(dest.id);
      picked.push(dest);
    }
  };

  const themed = applyConditionFilters(primaryPool, themes, options);
  take(shuffle(themed));

  // 2) 테마만 일치 (동행/분위기/발견 완화)
  if (picked.length < 5) {
    const relaxed = themes.length
      ? primaryPool.filter((d) => d.themes.some((t) => themes.includes(t)))
      : [...primaryPool];
    take(shuffle(relaxed));
  }

  // 3) 전체 API 후보
  if (picked.length < 5) {
    take(shuffle(primaryPool));
  }

  // 4) 샘플 DESTINATIONS fallback (존재하지 않는 데이터는 만들지 않음)
  if (picked.length < 5) {
    take(shuffle(fallbackPool));
  }

  registerRecommendedDestinations(picked);
  return toMysteryCards(picked);
}

/** 로컬 샘플만 사용하는 동기 경로 (테스트·fallback). */
export function recommendCards(themes: ThemeKey[], options: RecommendOptions = {}): MysteryCardData[] {
  return recommendFromPool(DESTINATIONS, DESTINATIONS, themes, options);
}

function destinationsFromApi(
  items: Awaited<ReturnType<typeof fetchTourCandidates>>,
  coords?: UserCoords | null,
): Destination[] {
  const out: Destination[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const candidate = normalizeTourDestination(item, coords);
    if (!candidate) continue;
    if (seen.has(candidate.contentId)) continue;
    seen.add(candidate.contentId);
    out.push(candidateToDestination(candidate));
  }
  return out;
}

/**
 * TourAPI 후보를 받아 기존 필터/셔플 로직으로 카드 5장을 만든다.
 * API 실패 시 샘플 DESTINATIONS 로 fallback 한다.
 */
export async function recommendCardsAsync(
  themes: ThemeKey[],
  options: RecommendOptions = {},
  coords?: UserCoords | null,
  optionsExtra?: { reuseCache?: boolean },
): Promise<RecommendResult> {
  const reuseCache = optionsExtra?.reuseCache ?? false;

  if (reuseCache && candidateCache) {
    const cards = recommendFromPool(candidateCache.destinations, DESTINATIONS, themes, options);
    return { cards, fromApi: candidateCache.fromApi };
  }

  try {
    const items = await fetchTourCandidates(coords);
    const destinations = destinationsFromApi(items, coords);
    if (destinations.length === 0) {
      candidateCache = { destinations: DESTINATIONS, fromApi: false };
      const cards = recommendFromPool(DESTINATIONS, DESTINATIONS, themes, options);
      return { cards, fromApi: false, errorMessage: "TourAPI 응답을 정규화할 수 없어 샘플 데이터를 사용합니다." };
    }
    candidateCache = { destinations, fromApi: true };
    const cards = recommendFromPool(destinations, DESTINATIONS, themes, options);
    return { cards, fromApi: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "TourAPI 조회에 실패했습니다.";
    // fallback: 기존 로컬 샘플. 앱이 멈추지 않도록 한다.
    candidateCache = { destinations: DESTINATIONS, fromApi: false };
    const cards = recommendFromPool(DESTINATIONS, DESTINATIONS, themes, options);
    return { cards, fromApi: false, errorMessage: message };
  }
}
