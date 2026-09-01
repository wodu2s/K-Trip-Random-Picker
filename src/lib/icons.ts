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
