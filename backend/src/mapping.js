/** 프런트 조건값 → TourAPI 파라미터 매핑. 프런트의 THEME/MOOD 키를 그대로 받는다. */

/** 테마 → TourAPI 분류. contentTypeId 12 관광지 / 28 레포츠 / 38 쇼핑 / 39 음식점 */
export const THEME_QUERY = {
  sea: { contentTypeId: "12", cat1: "A01", cat2: "A0101", cat3: "A01011200", scene: "sea" },
  nature: { contentTypeId: "12", cat1: "A01", cat2: "A0101", scene: "mountain" },
  food: { contentTypeId: "39", cat1: "A05", scene: "town" },
  vibe: { contentTypeId: "14", cat1: "A02", cat2: "A0206", scene: "town" },
  history: { contentTypeId: "12", cat1: "A02", cat2: "A0201", scene: "town" },
  local: { contentTypeId: "38", cat1: "A04", cat2: "A0401", scene: "town" },
  activity: { contentTypeId: "28", cat1: "A03", scene: "mountain" },
  etc: { contentTypeId: "12", scene: "town" },
};

export const THEME_LABEL = {
  sea: "바다",
  nature: "자연",
  food: "맛집",
  vibe: "감성",
  history: "역사/문화",
  local: "로컬",
  activity: "액티비티",
  etc: "기타",
};

/** 동행·분위기 → 테마 힌트 (프런트 recommend.ts와 같은 성향) */
export const COMPANION_THEME_HINTS = {
  alone: ["nature", "vibe", "local"],
  couple: ["vibe", "sea", "food"],
  friends: ["activity", "food", "sea"],
  family: ["nature", "history", "activity"],
};

export const MOOD_THEME_HINTS = {
  calm: ["nature", "local"],
  lively: ["activity", "food"],
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
  return ordered.length ? ordered.slice(0, 3) : ["nature"];
}

export function pickRandom(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return n == null ? a : a.slice(0, n);
}

/* ── 카드 힌트 ── 목적지명을 감춘 채 분위기·장소·경험 3개만 노출한다.
   모든 값은 조건값과 KTO 분류코드에서 결정되며 랜덤 요소가 없다. */

/** mood × scene → atmosphere. mood 미선택이면 scene 기본값 */
const ATMOSPHERE = {
  calm: {
    sea: ["quiet-shore", "🌅"],
    mountain: ["still-forest", "🌫️"],
    town: ["slow-alley", "🍵"],
  },
  lively: {
    sea: ["splashing-sea", "🏄"],
    mountain: ["fresh-ridge", "🌤️"],
    town: ["buzzing-street", "🎪"],
  },
  emotional: {
    sea: ["sunset-sea", "🌇"],
    mountain: ["misty-ridge", "🌙"],
    town: ["retro-mood", "🎞️"],
  },
};

const ATMOSPHERE_DEFAULT = {
  sea: ["sea-breeze", "🌊"],
  mountain: ["green-calm", "🌿"],
  town: ["city-mood", "✨"],
};

/** cat3 → place. 가장 구체적인 분류부터 본다 */
const PLACE_BY_CAT3 = {
  A01010100: ["national-park", "🏞️"],
  A01010200: ["provincial-park", "🏞️"],
  A01010400: ["mountain", "⛰️"],
  A01010500: ["eco-site", "🦋"],
  A01010600: ["forest-retreat", "🌲"],
  A01010700: ["arboretum", "🌳"],
  A01010800: ["waterfall", "💦"],
  A01010900: ["valley", "🏕️"],
  A01011000: ["spring", "💧"],
  A01011100: ["coastal-cliff", "🪨"],
  A01011200: ["beach", "🏖️"],
  A01011300: ["island", "🏝️"],
  A01011400: ["harbor", "⚓"],
  A01011600: ["lighthouse", "🗼"],
  A01011700: ["lake", "🛶"],
  A01011800: ["river", "🏞️"],
  A01011900: ["cave", "🕳️"],
  A02010100: ["palace", "🏯"],
  A02010200: ["fortress", "🏰"],
  A02010400: ["hanok", "🏘️"],
  A02010600: ["folk-village", "🏘️"],
  A02010700: ["historic-site", "🗿"],
  A02010800: ["temple", "🛕"],
  A02020300: ["hot-spring", "♨️"],
  A02020600: ["theme-park", "🎡"],
  A02020700: ["park", "🌷"],
  A02020800: ["cruise", "🚢"],
  A02050200: ["observatory", "🔭"],
  A02050600: ["landmark-building", "🏛️"],
  A02060100: ["museum", "🏛️"],
  A02060500: ["gallery", "🖼️"],
  A02060600: ["theater", "🎭"],
  A03020500: ["campsite", "⛺"],
  A03020700: ["golf", "⛳"],
  A03021100: ["horse-riding", "🐴"],
  A03021200: ["ski-slope", "🎿"],
  A03021700: ["auto-camping", "🏕️"],
  A03022500: ["trail", "🥾"],
  A03030300: ["yacht", "⛵"],
  A03030400: ["diving-spot", "🤿"],
  A03030600: ["fishing-point", "🎣"],
  A03030800: ["rafting", "🛶"],
  A03040300: ["paragliding", "🪂"],
  A04010100: ["open-market", "🧺"],
  A04010200: ["traditional-market", "🏮"],
  A04010700: ["craft-workshop", "🪡"],
  A04010900: ["local-goods", "🎁"],
  A05020100: ["korean-table", "🍚"],
  A05020300: ["sushi-bar", "🍣"],
  A05020700: ["signature-dish", "🍲"],
  A05020900: ["teahouse", "☕"],
};

const PLACE_BY_CAT2 = {
  A0101: ["nature-site", "🌄"],
  A0102: ["rock-scenery", "🪨"],
  A0201: ["heritage-site", "🏯"],
  A0202: ["resort", "♨️"],
  A0203: ["hands-on-site", "🧶"],
  A0205: ["landmark", "🏛️"],
  A0206: ["culture-house", "🏛️"],
  A0207: ["festival-ground", "🎪"],
  A0208: ["stage", "🎭"],
  A0301: ["leisure-site", "🚵"],
  A0302: ["field", "🚵"],
  A0303: ["waterfront", "🌊"],
  A0304: ["sky-site", "🪂"],
  A0401: ["market", "🧺"],
  A0502: ["eatery", "🍜"],
};

const PLACE_BY_CAT1 = {
  A01: ["nature-site", "🌄"],
  A02: ["culture-site", "🏛️"],
  A03: ["leisure-site", "🚵"],
  A04: ["market", "🧺"],
  A05: ["eatery", "🍜"],
};

/** contentTypeId 폴백 — 12 관광지 / 14 문화시설 / 15 축제 / 28 레포츠 / 38 쇼핑 / 39 음식 */
const PLACE_BY_CONTENT_TYPE = {
  12: ["scenic-spot", "🌄"],
  14: ["culture-house", "🏛️"],
  15: ["festival-ground", "🎪"],
  28: ["leisure-site", "🚵"],
  38: ["market", "🧺"],
  39: ["eatery", "🍜"],
};

const PLACE_DEFAULT = {
  sea: ["seaside", "🏖️"],
  mountain: ["highland", "⛰️"],
  town: ["scenic-spot", "🌄"],
};

const EXPERIENCE_BY_CONTENT_TYPE = {
  14: ["exhibition", "🖼️"],
  15: ["festival", "🎉"],
  28: ["activity", "🧗"],
  38: ["market-stroll", "🛍️"],
  39: ["tasting", "🍽️"],
};

const EXPERIENCE_BY_THEME = {
  sea: ["coastal-walk", "🚶"],
  nature: ["trail", "🥾"],
  food: ["tasting", "🍽️"],
  vibe: ["photo-spot", "📷"],
  history: ["heritage-tour", "📜"],
  local: ["market-stroll", "🛍️"],
  activity: ["activity", "🧗"],
  etc: ["discovery", "🧭"],
};

function hint(type, pair) {
  return { type, key: pair[0], emoji: pair[1] };
}

/**
 * 카드 힌트 정확히 3개 — atmosphere / place / experience 순서 고정.
 * atmosphere는 선택한 mood, place는 KTO 분류코드, experience는 contentTypeId·테마에서 나온다.
 */
export function buildHints(destination, { mood } = {}) {
  const scene = destination.scene ?? "town";
  const type = String(destination.contentTypeId ?? "");

  const atmosphere =
    ATMOSPHERE[mood]?.[scene] ?? ATMOSPHERE_DEFAULT[scene] ?? ATMOSPHERE_DEFAULT.town;
  const place =
    PLACE_BY_CAT3[destination.cat3] ??
    PLACE_BY_CAT2[destination.cat2] ??
    PLACE_BY_CAT1[destination.cat1] ??
    PLACE_BY_CONTENT_TYPE[type] ??
    PLACE_DEFAULT[scene] ??
    PLACE_DEFAULT.town;
  const experience =
    EXPERIENCE_BY_CONTENT_TYPE[type] ??
    EXPERIENCE_BY_THEME[destination.themes?.[0]] ??
    EXPERIENCE_BY_THEME.etc;

  return [hint("atmosphere", atmosphere), hint("place", place), hint("experience", experience)];
}

/**
 * 후보 우선순위 점수.
 * companion·mood는 테마 적합도, duration은 이동 거리, discovery는 인지도(대표 이미지 유무)에 반영한다.
 */
export function scoreDestination(destination, { duration, companion, mood, discovery } = {}) {
  const theme = destination.themes?.[0];
  const near = DAY_TRIP_AREAS.includes(Number(destination.areaCode));
  let score = 0;

  if ((COMPANION_THEME_HINTS[companion] ?? []).includes(theme)) score += 3;
  if ((MOOD_THEME_HINTS[mood] ?? []).includes(theme)) score += 3;

  if (duration === "day-trip") score += near ? 3 : -2;
  else if (duration === "overnight") score += near ? 0 : 2;

  if (discovery === "popular") score += destination.image ? 2 : -1;
  else if (discovery === "hidden") score += destination.image ? -1 : 2;

  return score;
}
