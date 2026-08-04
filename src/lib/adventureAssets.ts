/** Adventure Expedition — 조건 설정 화면 에셋 경로 */
export const ADVENTURE_IMAGES = {
  heroWindow: "/assets/adventure/hero-expedition-window.png",
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
  void preloadAdventureImage(ADVENTURE_IMAGES.heroWindow);
}
