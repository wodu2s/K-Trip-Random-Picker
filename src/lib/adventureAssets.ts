/** Adventure Expedition — 조건 설정 화면 에셋 경로 */
export const ADVENTURE_IMAGES = {
  heroWindow: "/assets/adventure/hero-expedition-window.png",
  /** 카드 무대 — 황금 천문 나침반 + 우주 고리 단일 장면 */
  compassStage: "/assets/adventure/compass-astral-stage.webp",
  /** @deprecated cards 페이지는 compassStage 단일 이미지 사용 */
  celestialRing: "/assets/adventure/celestial-ring.png",
  /** @deprecated cards 페이지는 compassStage 단일 이미지 사용 */
  compassBase: "/assets/adventure/compass-base.png",
  /** @deprecated cards 페이지는 compassStage 단일 이미지 사용 */
  compassRose: "/assets/adventure/compass-rose.png",
  /** @deprecated cards 페이지는 compassStage 단일 이미지 사용 */
  compassCelestial: "/assets/adventure/compass-celestial-gold.png",
  /** @deprecated cards 페이지는 compassStage 단일 이미지 사용 */
  compassGold: "/assets/adventure/compass-gold-radiant.png",
  /** 조건 설정 전용 장면 — 아치 창+책상 소품이 이미 담긴 실제 자산 */
  conditionsScene: encodeURI(
    "/assets/backgrounds/ChatGPT Image 2026년 8월 5일 오후 02_17_19.png",
  ),
} as const;

/** 브라우저에서 안전하게 이미지 preload (중복 호출 안전) */
const preloaded = new Set<string>();

export function preloadAdventureImage(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (preloaded.has(src)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloaded.add(src);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function preloadConditionsAssets(): void {
  void preloadAdventureImage(ADVENTURE_IMAGES.conditionsScene);
}
