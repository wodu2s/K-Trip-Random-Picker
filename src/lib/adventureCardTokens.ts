/** Classic Expedition — 전역·카드 공통 디자인 토큰 (landingAssets / CSS vars와 동기화) */
export const ADVENTURE = {
  forest: "#1F3D2E",
  forestDark: "#16281F",
  forestMid: "#2A4A38",
  /** @deprecated use forestDark — kept for call sites that still name navy */
  navy: "#16281F",
  navyDeep: "#122018",
  parchment: "#EDE4CE",
  parchmentLight: "#F5F0E1",
  parchmentDeep: "#E4D6B0",
  paper: "#F5F0E1",
  brass: "#C9A227",
  brassHi: "#D8B84A",
  brassLine: "#B8952E",
  yellow: "#D8B84A",
  orange: "#A95B36",
  red: "#98483A",
  ink: "#2B2318",
  muted: "#6B5F49",
  line: "rgba(90, 74, 46, 0.18)",
} as const;

export const ADVENTURE_RADIUS = {
  card: 10,
  button: 8,
  panel: 16,
} as const;

export const ADVENTURE_SHADOW = {
  card: "0 12px 32px rgba(22, 40, 31, 0.12)",
  selected: "0 18px 44px rgba(22, 40, 31, 0.22)",
} as const;

/** Adventure Expedition Shuffle — total ~2.7s desktop */
export const ADVENTURE_CARD_MOTION = {
  idle: 0.1,
  gather: 0.35, // ignite
  split: 0.3, // burst
  riffle: 0.4, // cross A
  riffleStagger: 0.056,
  scan: 0.55, // orbit
  orbitStagger: 0.06,
  crossB: 0.38,
  compress: 0.26,
  impact: 0.2,
  deal: 0.58,
  dealStagger: 0.075,
  select: 0.34,
  stamp: 0.3,
  pause: 0.18,
  flip: 0.74,
  revealHold: 0.55,
  revealStagger: 0.09,
} as const;

export const ADVENTURE_CARD_SPRING = {
  type: "spring" as const,
  stiffness: 250,
  damping: 24,
  mass: 0.9,
};

export const CARD_VARIANTS = [
  { needle: -18, expedition: "NO. 001", path: 0, parchmentShift: 0, symbol: "N" },
  { needle: 32, expedition: "NO. 002", path: 1, parchmentShift: 1, symbol: "E" },
  { needle: -8, expedition: "NO. 003", path: 2, parchmentShift: 0, symbol: "S" },
  { needle: 48, expedition: "NO. 004", path: 0, parchmentShift: 2, symbol: "W" },
  { needle: 12, expedition: "NO. 005", path: 1, parchmentShift: 1, symbol: "N" },
] as const;

export type CardVariant = (typeof CARD_VARIANTS)[number];

export function getCardVariant(index: number): CardVariant {
  return CARD_VARIANTS[index % CARD_VARIANTS.length]!;
}
