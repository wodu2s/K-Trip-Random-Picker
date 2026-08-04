import type { CardPhase } from "../types/travel";

export type CardPose = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  z: number;
  rotateX?: number;
};

export type LayoutPoint = Pick<CardPose, "x" | "y" | "rotate">;

/** 선택·공개 부채꼴 — 데스크톱 기준 px */
export const SELECTABLE_LAYOUT: LayoutPoint[] = [
  { x: -250, y: 30, rotate: -12 },
  { x: -125, y: 5, rotate: -6 },
  { x: 0, y: -12, rotate: 0 },
  { x: 125, y: 5, rotate: 6 },
  { x: 250, y: 30, rotate: 12 },
];

/** fanOut: 좌2·우3 분리 펼침 */
export const FAN_LAYOUT: LayoutPoint[] = [
  { x: -210, y: 48, rotate: -15 },
  { x: -105, y: 18, rotate: -7 },
  { x: 0, y: 4, rotate: 0 },
  { x: 105, y: 18, rotate: 7 },
  { x: 210, y: 48, rotate: 15 },
];

/** crossing: 좌우 교차 후 위치 */
export const CROSS_LAYOUT: LayoutPoint[] = [
  { x: 210, y: 44, rotate: 15 },
  { x: 105, y: 16, rotate: 7 },
  { x: 0, y: -2, rotate: 0 },
  { x: -105, y: 16, rotate: -7 },
  { x: -210, y: 44, rotate: -15 },
];

/** @deprecated 레거시 fan 슬롯 */
export const FAN_X = [-220, -110, 0, 110, 220] as const;
export const FAN_SPACING = 110;

/**
 * 스테이지 너비·카드 너비 기준 fan 스케일.
 * 좌우 끝 카드 최소 70%가 보이도록 max |x| 계산.
 */
export function getLayoutScale(stageW: number, cardW: number): number {
  const half = stageW / 2;
  const margin = 10;
  const maxCenterX = half - cardW * 0.2 - margin;
  const desktopMax = 250;
  return Math.min(1, Math.max(0.34, maxCenterX / desktopMax));
}

export function scaleLayout(layout: LayoutPoint[], factor: number): LayoutPoint[] {
  return layout.map((p) => ({
    x: p.x * factor,
    y: p.y * factor,
    rotate: p.rotate,
  }));
}

function mixEllipsePoint(i: number, total: number, rx: number, ry: number): LayoutPoint {
  const start = -Math.PI * 0.78;
  const sweep = Math.PI * 1.45;
  const angle = start + (i / Math.max(total - 1, 1)) * sweep;
  return {
    x: Math.cos(angle) * rx,
    y: Math.sin(angle) * ry,
    rotate: Math.max(-9, Math.min(9, (angle * 180) / Math.PI * 0.06)),
  };
}

function mixCenterPassPoint(i: number, total: number): LayoutPoint {
  const mid = (total - 1) / 2;
  const offset = i - mid;
  const rush = [
    { x: -28, y: -8, rotate: -4 },
    { x: -12, y: 22, rotate: -2 },
    { x: 0, y: -18, rotate: 0 },
    { x: 14, y: 20, rotate: 2 },
    { x: 32, y: -6, rotate: 5 },
  ];
  return rush[i] ?? { x: offset * 14, y: offset * 6, rotate: offset * 2 };
}

export function stackPose(i: number, total: number, gap = 2.8): CardPose {
  const mid = (total - 1) / 2;
  return {
    x: (i - mid) * gap,
    y: (i - mid) * (gap * 0.72),
    rotate: (i - mid) * 1.1,
    scale: 1,
    opacity: 1,
    z: i + 1,
  };
}

function layoutPose(layout: LayoutPoint[], i: number, z = 5 + i): CardPose {
  const p = layout[i] ?? layout[0]!;
  return { ...p, scale: 1, opacity: 1, z };
}

function crossingPose(i: number, layout: LayoutPoint[]): CardPose {
  const base = layoutPose(layout, i);
  if (i === 2) {
    return { ...base, y: base.y - 8, scale: 0.94, z: 2, rotateX: -5 };
  }
  const z = i < 2 ? 9 + i : 8 + (4 - i);
  const scale = i === 0 || i === 4 ? 1.02 : 0.98;
  const rotateX = i < 2 ? 4 : -4;
  return { ...base, scale, z, rotateX };
}

export function poseForCard(
  phase: CardPhase,
  mixStep: 0 | 1,
  i: number,
  total: number,
  layoutScale: number,
  selectedId: string | null,
  cardId: string,
): CardPose {
  const selectable = scaleLayout(SELECTABLE_LAYOUT, layoutScale);
  const fan = scaleLayout(FAN_LAYOUT, layoutScale);
  const cross = scaleLayout(CROSS_LAYOUT, layoutScale);
  const ellipseRx = 165 * layoutScale;
  const ellipseRy = 78 * layoutScale;

  if (
    (phase === "selected" || phase === "revealing" || phase === "complete") &&
    selectedId
  ) {
    const base = layoutPose(selectable, i);
    if (cardId === selectedId) {
      if (phase === "complete") {
        return { x: 0, y: -48, rotate: 0, scale: 1.6, opacity: 1, z: 30 };
      }
      return { x: 0, y: -48, rotate: 0, scale: 1.12, opacity: 1, z: 30 };
    }
    const dir = base.x >= 0 ? 1 : -1;
    const push = 36 + Math.abs(base.x) * 0.08;
    const fadeOpacity = phase === "complete" ? 0 : 0.38;
    return {
      x: base.x + dir * push,
      y: base.y + 12,
      rotate: base.rotate * 0.35,
      scale: 0.92,
      opacity: fadeOpacity,
      z: 2 + i,
    };
  }

  switch (phase) {
    case "ready":
      return { ...stackPose(i, total, 3.2), scale: i === 2 ? 1.02 : 1 };
    case "gathering":
      return { ...stackPose(i, total, 2.6), scale: 0.96 };
    case "fanOut":
      return layoutPose(fan, i);
    case "crossing":
      return crossingPose(i, cross);
    case "mixing": {
      const pt =
        mixStep === 0
          ? mixEllipsePoint(i, total, ellipseRx, ellipseRy)
          : mixCenterPassPoint(i, total);
      const scaled = scaleLayout([pt], 1)[0]!;
      const z = mixStep === 0 ? 6 + i : 12 - Math.abs(i - 2);
      return { ...scaled, scale: mixStep === 0 ? 0.98 : 1.01, opacity: 1, z };
    }
    case "restacking":
      return stackPose(i, total, 3.6);
    case "selectable":
      return layoutPose(selectable, i, i === 2 ? 12 : 5 + i);
    default:
      return stackPose(i, total);
  }
}

/** @deprecated */
export type SlotStyle = CardPose & { zIndex: number; rotateY?: number };

/** @deprecated */
export function getSlotStyle(): SlotStyle {
  return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, z: 1, zIndex: 1 };
}

/** @deprecated */
export function swapSlots(prev: Record<string, number>, slotA: number, slotB: number) {
  const next = { ...prev };
  const idA = Object.keys(prev).find((k) => prev[k] === slotA);
  const idB = Object.keys(prev).find((k) => prev[k] === slotB);
  if (idA !== undefined) next[idA] = slotB;
  if (idB !== undefined) next[idB] = slotA;
  return next;
}
