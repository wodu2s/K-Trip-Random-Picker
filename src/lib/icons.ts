import {
  Activity,
  Camera,
  Landmark,
  Mountain,
  UtensilsCrossed,
  Waves,
  Moon,
  Sun,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { Destination, ThemeKey } from "../types/travel";

/** 테마별 lucide 아이콘 + 카드 뒷면 테두리/포인트 색상 (이모지 대체) */
export const THEME_ICON: Record<ThemeKey, LucideIcon> = {
  sea: Waves,
  nature: Mountain,
  vibe: Camera,
  history: Landmark,
  activity: Activity,
};

export const THEME_ACCENT: Record<ThemeKey, string> = {
  sea: "#2F78F6",
  nature: "#22C55E",
  vibe: "#B98CE0",
  history: "#C9A227",
  activity: "#14B8A6",
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
  vibe: "🌙",
  history: "🏯",
  activity: "🚲",
};

const THEME_EMOJI_PAIR: Record<ThemeKey, [string, string]> = {
  sea: ["🌊", "🌙"],
  nature: ["🌲", "🚶"],
  vibe: ["📷", "✨"],
  history: ["🏯", "🍁"],
  activity: ["🚲", "🌿"],
};

/**
 * 카드 상단 캡슐용 이모지 힌트 정확히 2개.
 * 목적지명·지역명은 노출하지 않고 분위기만 암시한다.
 */
export function getHintEmojis(destination: Pick<Destination, "themes" | "id">): [string, string] {
  const primary = destination.themes[0] ?? "nature";
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
  const fallback = THEME_EMOJI_PAIR[destination.themes[0] ?? "nature"];
  for (const emoji of [...fallback, "✨", "🗺️", "🚶"]) {
    if (hints.length >= 5) break;
    if (!hints.includes(emoji)) hints.push(emoji);
  }
  return hints.slice(0, 5);
}

export const PERIOD_ICON = {
  오전: Sunrise,
  점심: UtensilsCrossed,
  오후: Sun,
  저녁: Moon,
} as const;
