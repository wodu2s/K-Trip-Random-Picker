import type { CardPhase } from "../types/travel";

export type CardPose = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  z: number;
};

export type LayoutPoint = Pick<CardPose, "x" | "y" | "rotate">;

/** 초기·선택 fan — desktop 기준 px, 회전 [-16,-8,0,8,16] */
export const SELECTABLE_LAYOUT: LayoutPoint[] = [
  { x: -290, y: 26, rotate: -16 },
  { x: -145, y: 7, rotate: -8 },
  { x: 0, y: -12, rotate: 0 },
  { x: 145, y: 7, rotate: 8 },
  { x: 290, y: 26, rotate: 16 },
];

/** fanOut: 셔플 후 fan 펼침 */
export const FAN_LAYOUT: LayoutPoint[] = [
  { x: -270, y: 22, rotate: -16 },
  { x: -135, y: 5, rotate: -8 },
  { x: 0, y: -10, rotate: 0 },
  { x: 135, y: 5, rotate: 8 },
  { x: 270, y: 22, rotate: 16 },
];

/** crossing pass 1 — 좌우 교차 */
export const CROSS_LAYOUT: LayoutPoint[] = [
  { x: 100, y: -3, rotate: 8 },
  { x: 60, y: 1, rotate: 5 },
  { x: 0, y: -4, rotate: 0 },
  { x: -60, y: 1, rotate: -5 },
  { x: -100, y: -3, rotate: -8 },
];

/** mixing pass 2 — 반대 교차 */
const MIX_PASS_B: LayoutPoint[] = [
  { x: -95, y: 2, rotate: -7 },
  { x: -55, y: -1, rotate: -4 },
  { x: 0, y: -3, rotate: 0 },
  { x: 55, y: -1, rotate: 4 },
  { x: 95, y: 2, rotate: 7 },
];

/** mixing pass 3 — 마지막 교차 후 restack */
const MIX_PASS_C: LayoutPoint[] = [
  { x: 82, y: -2, rotate: 6 },
  { x: 48, y: 2, rotate: 3 },
  { x: 0, y: -3, rotate: 0 },
  { x: -48, y: 2, rotate: -3 },
  { x: -82, y: -2, rotate: -6 },
];

/** @deprecated 레거시 fan 슬롯 */
export const FAN_X = [-220, -110, 0, 110, 220] as const;
export const FAN_SPACING = 110;

/**
 * 스테이지 너비·카드 너비 기준 fan 스케일.
 * fan이 스테이지 가로의 약 45~55%를 쓰도록 조정.
 */
export function getLayoutScale(stageW: number, cardW: number): number {
  const targetHalfSpan = stageW * 0.26;
  const baseOuterX = 290;
  const maxFromStage = (stageW / 2 - cardW * 0.25) / baseOuterX;
  const maxFromTarget = targetHalfSpan / baseOuterX;
  return Math.min(1, Math.max(0.42, Math.min(maxFromStage, maxFromTarget)));
}

/** fan 펼침 시 가로 간격만 확대 (카드 scale/비율 유지) */
const FAN_X_SPREAD = 1.12;

export function scaleLayout(layout: LayoutPoint[], factor: number): LayoutPoint[] {
  return layout.map((p) => ({
    x: p.x * factor,
    y: p.y * factor,
    rotate: p.rotate,
  }));
}

function scaledFanLayout(layout: LayoutPoint[], layoutScale: number): LayoutPoint[] {
  return scaleLayout(layout, layoutScale).map((p) => ({
    ...p,
    x: p.x * FAN_X_SPREAD,
  }));
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
  const zByCard = [9, 8, 11, 7, 8];
  return { ...base, scale: 1, z: zByCard[i] ?? 8 };
}

function mixingPose(
  mixStep: 0 | 1,
  i: number,
  layoutScale: number,
): CardPose {
  const layout = mixStep === 0 ? MIX_PASS_B : MIX_PASS_C;
  const scaled = scaleLayout(layout, layoutScale);
  const pt = scaled[i] ?? scaled[0]!;
  const zByStep =
    mixStep === 0
      ? [7, 10, 11, 10, 7]
      : [9, 8, 11, 8, 9];
  return { ...pt, scale: 1, opacity: 1, z: zByStep[i] ?? 8 };
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
  const selectable = scaledFanLayout(SELECTABLE_LAYOUT, layoutScale);
  const fan = scaledFanLayout(FAN_LAYOUT, layoutScale);
  const cross = scaleLayout(CROSS_LAYOUT, layoutScale);

  if (
    (phase === "selected" || phase === "revealing" || phase === "complete") &&
    selectedId
  ) {
    const base = layoutPose(selectable, i);
    if (cardId === selectedId) {
      const pickScale = phase === "complete" ? 1.05 : 1.1;
      return { x: 0, y: -20, rotate: 0, scale: pickScale, opacity: 1, z: 30 };
    }
    const dir = base.x >= 0 ? 1 : -1;
    return {
      x: base.x + dir * 100,
      y: base.y + 10,
      rotate: base.rotate * 0.25,
      scale: 1,
      opacity: 0.2,
      z: 1 + i,
    };
  }

  switch (phase) {
    case "ready":
      return layoutPose(selectable, i, i === 2 ? 10 : 4 + i);
    case "gathering":
      return stackPose(i, total, 4);
    case "fanOut":
      return layoutPose(fan, i);
    case "crossing":
      return crossingPose(i, cross);
    case "mixing":
      return mixingPose(mixStep, i, layoutScale);
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
