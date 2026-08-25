/** 프런트 조건값 → TourAPI 파라미터 매핑. 프런트의 THEME/MOOD 키를 그대로 받는다. */

/** 테마 → TourAPI 분류. contentTypeId 12 관광지 / 28 레포츠 / 38 쇼핑 / 39 음식점 */
export const THEME_QUERY = {
  sea: { contentTypeId: "12", cat1: "A01", cat2: "A0101", cat3: "A01011200", scene: "sea" },
  nature: { contentTypeId: "12", cat1: "A01", cat2: "A0101", scene: "mountain" },
  vibe: { contentTypeId: "14", cat1: "A02", cat2: "A0206", scene: "town" },
  history: { contentTypeId: "12", cat1: "A02", cat2: "A0201", scene: "town" },
  activity: { contentTypeId: "28", cat1: "A03", scene: "mountain" },
};

/** THEME_QUERY에 없는 값이 들어왔을 때 쓰는 기본 조회 조건 */
export const DEFAULT_THEME = "nature";

export const THEME_LABEL = {
  sea: "바다",
  nature: "자연",
  vibe: "감성",
  history: "역사/문화",
  activity: "액티비티",
};

/** 동행·분위기 → 테마 힌트 (프런트 recommend.ts와 같은 성향) */
export const COMPANION_THEME_HINTS = {
  alone: ["nature", "vibe"],
  couple: ["vibe", "sea"],
  friends: ["activity", "sea"],
  family: ["nature", "history", "activity"],
};

export const MOOD_THEME_HINTS = {
  calm: ["nature", "history"],
  lively: ["activity", "sea"],
  emotional: ["vibe", "history"],
};

/** 지역코드 → 서울 출발 대략 이동 시간 (표시용) */
export const AREA_CODES = {
  1: { name: "서울", time: "약 40분" },
  2: { name: "인천", time: "약 1시간 10분" },
  3: { name: "대전", time: "약 2시간" },
  4: { name: "대구", time: "약 2시간 30분" },
  5: { name: "광주", time: "약 3시간" },
  6: { name: "부산", time: "약 3시간" },
  7: { name: "울산", time: "약 3시간" },
  8: { name: "세종", time: "약 2시간" },
  31: { name: "경기", time: "약 1시간" },
  32: { name: "강원", time: "약 2시간 30분" },
  33: { name: "충북", time: "약 2시간" },
  34: { name: "충남", time: "약 2시간" },
  35: { name: "경북", time: "약 3시간" },
  36: { name: "경남", time: "약 3시간 30분" },
  37: { name: "전북", time: "약 2시간 40분" },
  38: { name: "전남", time: "약 3시간 30분" },
  39: { name: "제주", time: "약 1시간 20분 (항공)" },
};

/** 당일치기는 수도권·근교 위주, 1박 이상은 전국 */
const DAY_TRIP_AREAS = [1, 2, 31, 32, 33, 34];
const ALL_AREAS = Object.keys(AREA_CODES).map(Number);

export function areaPool(duration) {
  return duration === "day-trip" ? DAY_TRIP_AREAS : ALL_AREAS;
}

/**
 * 발견 성향 → 목록 정렬·페이지.
 * TourAPI에 인기도 지표가 없어, 대표 이미지 정렬(앞 페이지=대표 명소)과
 * 뒤 페이지 샘플링(=덜 알려진 곳)으로 근사한다.
 */
export function discoveryQuery(discovery) {
  if (discovery === "popular") return { arrange: "Q", pageNo: 1 };
  if (discovery === "hidden") return { arrange: "R", pageNo: 2 + Math.floor(Math.random() * 4) };
  return { arrange: "Q", pageNo: 1 + Math.floor(Math.random() * 2) };
}

/** 선택 조건에서 실제로 조회할 테마 목록 (최대 3개, 동행·분위기 힌트로 보강) */
export function themePool(themes = [], companion, mood) {
  const picked = themes.filter((t) => THEME_QUERY[t]);
  const hints = [...(COMPANION_THEME_HINTS[companion] ?? []), ...(MOOD_THEME_HINTS[mood] ?? [])];
  const preferred = picked.filter((t) => hints.includes(t));
  const ordered = [...new Set([...preferred, ...picked, ...hints.filter((t) => THEME_QUERY[t])])];
  return ordered.length ? ordered.slice(0, 3) : [DEFAULT_THEME];
}

export function pickRandom(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return n == null ? a : a.slice(0, n);
}
