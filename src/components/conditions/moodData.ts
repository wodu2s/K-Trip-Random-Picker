import type { ThemeKey } from "../../types/travel";

/** 조건 설정 화면 전용 이미지 — 시안에서 받은 배경/기록지 */
export const CONDITIONS_IMAGES = {
  backdrop: "/images/conditions/backdrop.webp",
  /* 모바일 전용 배경이 준비되면 이 경로만 바꾸면 된다 (desktop 자산은 건드리지 않는다) */
  backdropMobile: "/images/conditions/backdrop.webp",
  dossierFrame: "/images/conditions/dossier-frame.webp",
} as const;

const DIR = "/images/conditions";

/**
 * 테마별 분위기 사진과 한 줄 카피.
 * 조건 선택 단계에서는 실제 목적지를 밝히지 않으므로, 여기 있는 건 전부 분위기 컷이고
 * 카피에도 장소명·지역명을 쓰지 않는다.
 */
export type ThemePreview = {
  theme: ThemeKey;
  /** 우측 패널에 뜨는 라벨 — 분위기만 말하고 장소는 밝히지 않는다 */
  label: string;
  /** Hero에 크게 들어가는 한 줄 */
  tagline: string;
  image: string;
};

export const THEME_PREVIEWS: Record<ThemeKey, ThemePreview> = {
  sea: {
    theme: "sea",
    label: "바다",
    tagline: "파도 소리가 하루를 바꾸는 순간",
    image: `${DIR}/mood-activity.webp`,
  },
  nature: {
    theme: "nature",
    label: "자연",
    tagline: "자연이 주는 가장 편안한 쉼",
    image: `${DIR}/mood-nature.webp`,
  },
  food: {
    theme: "food",
    label: "맛집",
    tagline: "지역의 맛을 만나는 여행",
    image: `${DIR}/mood-food.webp`,
  },
  vibe: {
    theme: "vibe",
    label: "감성",
    tagline: "낯선 풍경에 머무는 시간",
    image: `${DIR}/mood-vibe.webp`,
  },
  history: {
    theme: "history",
    label: "역사·문화",
    tagline: "시간을 걷는 여행",
    image: `${DIR}/mood-history.webp`,
  },
  local: {
    theme: "local",
    label: "로컬",
    tagline: "그곳의 일상에 스며드는 여행",
    image: `${DIR}/mood-local.webp`,
  },
  activity: {
    theme: "activity",
    label: "액티비티",
    tagline: "조금 더 움직이는 하루",
    image: `${DIR}/mood-activity.webp`,
  },
  /* `기타`는 전용 사진을 만들지 않고 NEUTRAL 풀에서 돌려 쓴다 */
  etc: {
    theme: "etc",
    label: "기타",
    tagline: "어디로 갈지는 카드가 정합니다",
    image: `${DIR}/mood-nature.webp`,
  },
};

/** 아무것도 고르지 않았거나 `기타`일 때 돌려 쓰는 중립 풀 */
export const NEUTRAL_ORDER: ThemeKey[] = ["nature", "sea", "vibe", "food", "activity"];

export type PreviewSet = {
  /** 크게 보여 줄 한 장 — 마지막으로 고른 테마 */
  hero: ThemePreview;
  /** 아래 보조 카드 (최대 4장). 함께 고른 테마가 맨 앞에 온다 */
  supporting: ThemePreview[];
  /** 보조 카드 중 "함께 고른 테마"라서 강조할 대상 */
  highlighted: ThemeKey | null;
};

const MAX_SUPPORTING = 4;

/**
 * 선택 상태 → 화면에 뿌릴 미리보기 묶음.
 * 테마를 2개 고르면 마지막 것이 hero, 나머지 하나는 보조 카드 첫 장에서 강조된다.
 */
export function buildPreviewSet(themes: ThemeKey[], rotation = 0): PreviewSet {
  if (themes.length === 0) {
    /* 선택 전 — 중립 풀을 순환시켜 특정 테마를 미리 정해 두지 않는다 */
    const order = NEUTRAL_ORDER.map(
      (_, i) => NEUTRAL_ORDER[(i + rotation) % NEUTRAL_ORDER.length],
    );
    return {
      hero: THEME_PREVIEWS[order[0]],
      supporting: order.slice(1, 1 + MAX_SUPPORTING).map((t) => THEME_PREVIEWS[t]),
      highlighted: null,
    };
  }

  const heroKey = themes[themes.length - 1];
  const partner = themes.find((t) => t !== heroKey) ?? null;

  const seen = new Set<ThemeKey>([heroKey]);
  const supporting: ThemePreview[] = [];

  if (partner) {
    seen.add(partner);
    supporting.push(THEME_PREVIEWS[partner]);
  }
  for (const key of NEUTRAL_ORDER) {
    if (supporting.length >= MAX_SUPPORTING) break;
    if (seen.has(key)) continue;
    seen.add(key);
    supporting.push(THEME_PREVIEWS[key]);
  }

  return { hero: THEME_PREVIEWS[heroKey], supporting, highlighted: partner };
}

/** 미리 받아 두면 테마를 눌렀을 때 사진이 곧바로 바뀐다 */
export function preloadMoodImages(): void {
  if (typeof window === "undefined") return;
  const seen = new Set<string>();
  for (const preview of Object.values(THEME_PREVIEWS)) {
    if (seen.has(preview.image)) continue;
    seen.add(preview.image);
    const img = new Image();
    img.src = preview.image;
  }
}
