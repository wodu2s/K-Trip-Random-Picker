/**
 * Dark Expedition Luxury — landing tokens (SVG / inline).
 * Other pages keep parchment Classic Expedition theme.
 */

export const LANDING_ASSET_PATHS = {
  classicTarget: "/assets/adventure/landing-classic-target.png",
  /**
   * 카드 뒷면 — 원본 1024×1536은 표시 크기(140~300px)의 4~7배라 브라우저 축소 과정에서
   * 뭉개진다. 같은 디자인의 Lanczos 축소본을 기본값으로 쓰고 고DPR만 큰 소스로 올린다.
   */
  cardBack: "/assets/adventure/expedition-card-back-512.png",
  cardBackSrcSet:
    "/assets/adventure/expedition-card-back-384.png 384w," +
    "/assets/adventure/expedition-card-back-512.png 512w," +
    "/assets/adventure/expedition-card-back-768.png 768w," +
    "/assets/adventure/expedition-card-back.png 1024w",
  compass: "/assets/adventure/prop-brass-compass.png?v=4",
  ticket: "/assets/adventure/prop-expedition-ticket.png?v=2",
  koreaNightMap: "/assets/adventure/night-korea-map.webp?v=3",
  koreaNightMapPng: "/assets/adventure/night-korea-map.png?v=3",
  koreaHeroMap: "/assets/adventure/korea-expedition-map-hero@2x.webp",
  koreaHeroMapPng: "/assets/adventure/korea-expedition-map-hero@2x.png",
  koreaHeroGlow: "/assets/adventure/korea-expedition-map-glow@2x.webp",
  parchmentNoise: "/assets/adventure/parchment-noise.webp",
  darkTarget: "/assets/adventure/landing-dark-expedition-target.png",
} as const;

export type LandingAssetKey =
  | "cardBack"
  | "compass"
  | "ticket"
  | "koreaNightMap"
  | "koreaNightMapPng"
  | "parchmentNoise";

export const LANDING_ASSET_CONFIG: Record<
  LandingAssetKey,
  { src: string; kind: "prop" | "texture" | "card" | "map" }
> = {
  cardBack: { src: LANDING_ASSET_PATHS.cardBack, kind: "card" },
  compass: { src: LANDING_ASSET_PATHS.compass, kind: "prop" },
  ticket: { src: LANDING_ASSET_PATHS.ticket, kind: "prop" },
  koreaNightMap: { src: LANDING_ASSET_PATHS.koreaNightMap, kind: "map" },
  koreaNightMapPng: { src: LANDING_ASSET_PATHS.koreaNightMapPng, kind: "map" },
  parchmentNoise: { src: LANDING_ASSET_PATHS.parchmentNoise, kind: "texture" },
};

export const LANDING = {
  navyBase: "#050D18",
  navyMid: "#071626",
  navyEdge: "#020812",
  navyCard: "#0B2130",
  forest900: "#16281F",
  forest800: "#1F3D2E",
  forest700: "#2A4A38",
  brass500: "#C9A227",
  brass400: "#D8B84A",
  brass300: "#E8CE7C",
  brassLine: "#B8952E",
  goldMuted: "#D0A54D",
  goldPoint: "#C99A3E",
  ivory: "#FDFBF7",
  beige: "#B9AD98",
  beigeMuted: "#8F846F",
  parchment100: "#F5F0E1",
  parchment200: "#EDE4CE",
  parchment300: "#E4D6B0",
  parchmentLine: "rgba(90, 74, 46, 0.18)",
  textHeadline: "#FDFBF7",
  textMuted: "#B9AD98",
  textOnForest: "#F0E6C8",
  textOnBtn: "#FDFBF7",
  goldAccent: "#C5A059",
  navyDeep: "#020817",
  forestAccent: "#2F5340",
} as const;

export type DeckCardToken = {
  id: string;
  x: number;
  y: number;
  r: number;
  s: number;
  z: number;
  /** Subtle lighting overlay (not opacity fade of whole card) */
  dim: number;
};

/**
 * Target B — right-leaning fan.
 * Desktop uses absolute pixel layout in LandingCardDeck (s stays 1).
 * Tokens here are fallbacks for mid/mobile fan math only.
 */
export const DECK_CARDS: readonly DeckCardToken[] = [
  { id: "Card01", x: -78, y: 48, r: -10, s: 1, z: 2, dim: 0 },
  { id: "Card02", x: -39, y: 28, r: -5, s: 1, z: 3, dim: 0 },
  { id: "Card03", x: 0, y: 0, r: 0, s: 1, z: 6, dim: 0 },
  { id: "Card04", x: 139, y: 40, r: 8, s: 1, z: 4, dim: 0 },
  { id: "Card05", x: 234, y: 90, r: 14, s: 1, z: 3, dim: 0 },
] as const;

export const DECK_OPACITY = [0.88, 0.94, 1, 0.94, 0.86] as const;
