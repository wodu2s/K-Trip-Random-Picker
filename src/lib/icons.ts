import {
  Activity,
  Camera,
  Landmark,
  MapPin,
  Mountain,
  Sparkles,
  UtensilsCrossed,
  Waves,
  Moon,
  Sun,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { CardHint, Destination, MoodKey, SceneVariant, ThemeKey } from "../types/travel";

/** 테마별 lucide 아이콘 + 카드 뒷면 테두리/포인트 색상 (이모지 대체) */
export const THEME_ICON: Record<ThemeKey, LucideIcon> = {
  sea: Waves,
  nature: Mountain,
  food: UtensilsCrossed,
  vibe: Camera,
  history: Landmark,
  local: MapPin,
  activity: Activity,
  etc: Sparkles,
};

export const THEME_ACCENT: Record<ThemeKey, string> = {
  sea: "#2F78F6",
  nature: "#22C55E",
  food: "#F97066",
  vibe: "#B98CE0",
  history: "#C9A227",
  activity: "#14B8A6",
  local: "#F59E0B",
  etc: "#94A3B8",
};

/** 여행지 대표 테마(첫 번째)에 매핑되는 포인트 색상 — 카드 뒷면 테두리에 사용 */
export function getAccentColor(destination: Pick<Destination, "themes">): string {
  const first = destination.themes[0];
  return first ? THEME_ACCENT[first] : "#FFC857";
}

/** 카드 뒷면 힌트 아이콘 (최대 2개, lucide) — 레거시 호환 */
export function getHintIcons(destination: Pick<Destination, "themes">): LucideIcon[] {
  return destination.themes.slice(0, 2).map((t) => THEME_ICON[t]);
}

/** 테마별 분위기 이모지 (특정 도시를 바로 맞히지 않는 추상적 힌트) */
const THEME_EMOJI: Record<ThemeKey, string> = {
  sea: "🌊",
  nature: "🌲",
  food: "🍜",
  vibe: "🌙",
  history: "🏯",
  local: "🏮",
  activity: "🚲",
  etc: "🌿",
};

const THEME_EMOJI_PAIR: Record<ThemeKey, [string, string]> = {
  sea: ["🌊", "🌙"],
  nature: ["🌲", "🚶"],
  food: ["🍜", "🏮"],
  vibe: ["📷", "✨"],
  history: ["🏯", "🍁"],
  local: ["🏮", "🌿"],
  activity: ["🚲", "🌿"],
  etc: ["✨", "🗺️"],
};

/**
 * 카드 상단 캡슐용 이모지 힌트 정확히 2개.
 * 목적지명·지역명은 노출하지 않고 분위기만 암시한다.
 */
export function getHintEmojis(destination: Pick<Destination, "themes" | "id">): [string, string] {
  const primary = destination.themes[0] ?? "etc";
  const secondary = destination.themes[1];
  if (secondary && secondary !== primary) {
    return [THEME_EMOJI[primary], THEME_EMOJI[secondary]];
  }
  return THEME_EMOJI_PAIR[primary];
}

/** Adventure Compass 힌트 — 데이터 테마 기반 최대 5개 */
export function getEmojiHints(destination: Pick<Destination, "themes" | "id">): string[] {
  const hints: string[] = [];
  for (const theme of destination.themes) {
    if (hints.length >= 5) break;
    const emoji = THEME_EMOJI[theme];
    if (!hints.includes(emoji)) hints.push(emoji);
  }
  const fallback = THEME_EMOJI_PAIR[destination.themes[0] ?? "etc"];
  for (const emoji of [...fallback, "✨", "🗺️", "🚶"]) {
    if (hints.length >= 5) break;
    if (!hints.includes(emoji)) hints.push(emoji);
  }
  return hints.slice(0, 5);
}

/* ── 조건 설정 테마 기반 카드 이모지 힌트 ──
   목적지·지역을 짐작할 수 없는 분위기 이모지만 담는다. 실제 장소를 가리키는
   이모지는 넣지 않는다. */

const THEME_EMOJI_POOL: Record<ThemeKey, readonly string[]> = {
  sea: ["🌊", "🐚", "🏖️", "⚓", "🐟", "🌅", "🪸", "⛵"],
  nature: ["🌿", "🌲", "⛰️", "🍃", "🌳", "🌼", "🪨", "🏞️"],
  food: ["🍜", "🍚", "🍲", "🥘", "🍽️", "☕", "🥢", "🍴"],
  vibe: ["📷", "🌅", "✨", "🕯️", "🌙", "💫", "🪟", "🎞️"],
  history: ["🏛️", "🏯", "🪷", "📜", "🏺", "🎎", "🖼️", "🏮"],
  local: ["🏘️", "🛤️", "🧺", "🏪", "🚲", "🪧", "🛖", "🌾"],
  activity: ["🥾", "🚣", "🧗", "🚲", "🏄", "🎒", "🛶", "⛺"],
  etc: ["🧭", "🎲", "✨", "🗺️", "🎒", "🚩", "🔎", "🌟"],
};

function shuffled(pool: readonly string[]): string[] {
  const out = [...pool];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 테마 pool이 모자랄 때 채우는 공통 여행 이모지 — 목적지를 드러내지 않는 것만.
 * 어떤 테마를 하나만 골라도 (테마 8 + 공통) 15개를 중복 없이 채울 수 있는 크기로 둔다.
 */
const COMMON_EMOJI_POOL: readonly string[] = [
  "🧭",
  "🗺️",
  "🎒",
  "🚩",
  "🔎",
  "🌟",
  "🛤️",
  "🧳",
  "📍",
  "🥾",
  "🚏",
  "🎫",
  "📔",
  "🌤️",
  "🧢",
];

/** 큐 앞에서부터 아직 쓰지 않은 이모지 하나. 없으면 null (큐는 그만큼 줄어든다) */
function pullUnused(queue: string[], used: Set<string>): string | null {
  while (queue.length > 0) {
    const emoji = queue.shift() as string;
    if (!used.has(emoji)) return emoji;
  }
  return null;
}

/**
 * 조건 설정에서 고른 테마로 카드별 이모지 힌트를 한 번에 만든다.
 *
 * 카드 한 장씩이 아니라 "칸(slot) 단위로 5장을 가로질러" 채운다.
 *   1칸째 — 5장 모두 테마 이모지 (모든 카드가 선택 테마를 최소 1개 갖는다)
 *   2칸째 — 남은 테마 이모지를 서로 다른 카드에, 떨어지면 공통 pool
 *   3칸째 — 남은 것을 같은 방식으로
 * 테마가 2개면 칸마다 테마를 번갈아 잡아 한 카드에 두 테마가 함께 들어간다.
 * deck 전체 usedEmoji Set으로 5장 × 3개 = 15개가 값 기준으로 모두 달라진다.
 * 카드 생성 시 한 번만 호출해서 결과를 고정한다 — 매 렌더 호출 금지.
 */
export function buildCardEmojiHints(
  selectedThemes: ThemeKey[],
  cardCount = 5,
  hintsPerCard = 3,
): string[][] {
  const themes = selectedThemes.length > 0 ? selectedThemes : (["etc"] as ThemeKey[]);
  const queues = themes.map((t) => shuffled(THEME_EMOJI_POOL[t]));
  const common = shuffled(COMMON_EMOJI_POOL);
  /* 테마 pool끼리 겹치는 이모지(🌅·🚲·✨·🎒 등)도 값으로 걸러진다 */
  const used = new Set<string>();

  const cards: string[][] = Array.from({ length: cardCount }, () => []);
  for (let slot = 0; slot < hintsPerCard; slot += 1) {
    for (let c = 0; c < cardCount; c += 1) {
      const card = cards[c];
      /* 카드마다 시작 테마를 한 칸씩 밀어 2개 선택 시 양쪽이 같은 카드에 섞이게 한다 */
      const queue = queues[(c + slot) % queues.length];
      let emoji = pullUnused(queue, used) ?? pullUnused(common, used);
      if (!emoji) {
        /* 테마 + 공통 pool이 전부 마른 극단적인 경우에만 재사용 — 카드 안 중복은 여전히 없다 */
        const all = [...themes.flatMap((t) => THEME_EMOJI_POOL[t]), ...COMMON_EMOJI_POOL];
        emoji = shuffled(all).find((e) => !card.includes(e)) ?? all[0];
      }
      used.add(emoji);
      card.push(emoji);
    }
  }
  return cards;
}

/* ── mock fallback 카드 힌트 ──
   백엔드가 KTO 분류코드로 만드는 hints와 같은 {type,key,emoji} 3개 구조를 유지한다.
   mock 데이터에는 분류코드가 없어 scene·theme로만 파생한다. */

const FALLBACK_ATMOSPHERE: Record<MoodKey, Record<SceneVariant, CardHint>> = {
  calm: {
    sea: { type: "atmosphere", key: "quiet-shore", emoji: "🌅" },
    mountain: { type: "atmosphere", key: "still-forest", emoji: "🌫️" },
    town: { type: "atmosphere", key: "slow-alley", emoji: "🍵" },
  },
  lively: {
    sea: { type: "atmosphere", key: "splashing-sea", emoji: "🏄" },
    mountain: { type: "atmosphere", key: "fresh-ridge", emoji: "🌤️" },
    town: { type: "atmosphere", key: "buzzing-street", emoji: "🎪" },
  },
  emotional: {
    sea: { type: "atmosphere", key: "sunset-sea", emoji: "🌇" },
    mountain: { type: "atmosphere", key: "misty-ridge", emoji: "🌙" },
    town: { type: "atmosphere", key: "retro-mood", emoji: "🎞️" },
  },
};

const FALLBACK_ATMOSPHERE_DEFAULT: Record<SceneVariant, CardHint> = {
  sea: { type: "atmosphere", key: "sea-breeze", emoji: "🌊" },
  mountain: { type: "atmosphere", key: "green-calm", emoji: "🌿" },
  town: { type: "atmosphere", key: "city-mood", emoji: "✨" },
};

const FALLBACK_PLACE: Record<ThemeKey, CardHint> = {
  sea: { type: "place", key: "beach", emoji: "🏖️" },
  nature: { type: "place", key: "nature-site", emoji: "🌄" },
  food: { type: "place", key: "eatery", emoji: "🍜" },
  vibe: { type: "place", key: "culture-house", emoji: "🏛️" },
  history: { type: "place", key: "heritage-site", emoji: "🏯" },
  local: { type: "place", key: "market", emoji: "🧺" },
  activity: { type: "place", key: "leisure-site", emoji: "🚵" },
  etc: { type: "place", key: "scenic-spot", emoji: "🌄" },
};

const FALLBACK_EXPERIENCE: Record<ThemeKey, CardHint> = {
  sea: { type: "experience", key: "coastal-walk", emoji: "🚶" },
  nature: { type: "experience", key: "trail", emoji: "🥾" },
  food: { type: "experience", key: "tasting", emoji: "🍽️" },
  vibe: { type: "experience", key: "photo-spot", emoji: "📷" },
  history: { type: "experience", key: "heritage-tour", emoji: "📜" },
  local: { type: "experience", key: "market-stroll", emoji: "🛍️" },
  activity: { type: "experience", key: "activity", emoji: "🧗" },
  etc: { type: "experience", key: "discovery", emoji: "🧭" },
};

/**
 * API hints가 없을 때만 쓰는 폴백 — 항상 atmosphere · place · experience 3개.
 * place와 experience는 서로 다른 테마에서 뽑아 같은 이모지가 겹치지 않게 한다.
 */
export function buildFallbackHints(
  destination: Pick<Destination, "themes" | "scene">,
  options: { mood?: MoodKey | null } = {},
): CardHint[] {
  const scene = destination.scene ?? "town";
  const primary = destination.themes[0] ?? "etc";
  const secondary = destination.themes[1] ?? primary;

  return [
    (options.mood ? FALLBACK_ATMOSPHERE[options.mood][scene] : undefined) ??
      FALLBACK_ATMOSPHERE_DEFAULT[scene],
    FALLBACK_PLACE[primary],
    FALLBACK_EXPERIENCE[secondary],
  ];
}

export const PERIOD_ICON = {
  오전: Sunrise,
  점심: UtensilsCrossed,
  오후: Sun,
  저녁: Moon,
} as const;
