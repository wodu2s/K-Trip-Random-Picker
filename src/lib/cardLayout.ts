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

/** 초기·선택 fan — desktop 기준 px, 회전 [-14,-7,0,7,14].
    카드 하단 힌트 3개가 가려지지 않도록 좌우 간격을 넓게 잡는다 */
export const SELECTABLE_LAYOUT: LayoutPoint[] = [
  { x: -377, y: 24, rotate: -14 },
  { x: -188, y: 6, rotate: -7 },
  { x: 0, y: -12, rotate: 0 },
  { x: 188, y: 6, rotate: 7 },
  { x: 377, y: 24, rotate: 14 },
];

/** 중앙 stack에서 카드 한 장씩 어긋나는 폭(px) — 5장이 겹쳐도 장수가 읽힌다 */
const STACK_OFFSET_X = 6;
const STACK_OFFSET_Y = 4;

/** 중앙 stack 축소 비율 */
const STACK_SCALE = 0.97;

/** double-cut에서 두 패킷이 좌우로 갈리는 거리(px, layoutScale 적용 전) */
const CUT_SHIFT = 70;

/** double-cut 단계별 카드 index → stack 위치(아래에서 n번째).
    상단 2장이 통째로 아래로 내려가는 컷을 두 번 적용한 결과 */
const CUT_ORDERS = [
  [0, 1, 2, 3, 4],
  [2, 3, 4, 0, 1],
  [4, 0, 1, 2, 3],
] as const;

/** step 0·2는 갈라진 상태, 1·3은 재결합한 stack — 각 step이 쓰는 순서표 */
const CUT_ORDER_AT_STEP = [0, 1, 1, 2] as const;

/** 공개 시 카드 확대 비율 — 기존 카드보다 10% 크게 */
const PICK_SCALE = 1.1;

/** double-cut 진행 단계 */
export type MixStep = 0 | 1 | 2 | 3;

/**
 * 스테이지 너비·카드 너비 기준 fan 스케일.
 * fan이 스테이지 가로의 약 45~55%를 쓰도록 조정.
 */
export function getLayoutScale(stageW: number, cardW: number): number {
  const targetHalfSpan = stageW * 0.36;
  const baseOuterX = 377;
  const maxFromStage = (stageW / 2 - cardW * 0.25) / baseOuterX;
  const maxFromTarget = targetHalfSpan / baseOuterX;
  const fit = Math.min(1, Math.max(0.36, Math.min(maxFromStage, maxFromTarget)));
  /* 좁은 화면에서만 간격을 12% 더 좁힌다 — desktop 간격은 그대로 */
  return stageW < 1024 ? fit * 0.88 : fit;
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

/** 중앙 stack — rotation 0, scale .97. dx로 컷 패킷 전체를 좌우로 민다 */
function stackedPose(pos: number, dx = 0): CardPose {
  return {
    x: dx + (pos - 2) * STACK_OFFSET_X,
    y: (pos - 2) * STACK_OFFSET_Y,
    rotate: 0,
    scale: STACK_SCALE,
    opacity: 1,
    z: 5 + pos,
  };
}

/**
 * double-cut — 상단 2장과 하단 3장이 좌우로 갈렸다가 순서를 바꿔 재결합한다.
 * 두 번째 컷은 방향을 뒤집는다. translate와 z만 쓰고 회전·투명도는 건드리지 않는다.
 */
function cutPose(step: MixStep, i: number, layoutScale: number): CardPose {
  const pos = CUT_ORDERS[CUT_ORDER_AT_STEP[step]]![i] ?? i;
  if (step === 1 || step === 3) return stackedPose(pos);

  const topPacket = pos >= 3;
  const dir = step === 0 ? -1 : 1;
  const dx = (topPacket ? dir : -dir) * CUT_SHIFT * layoutScale;
  /* 갈라진 동안에는 상단 패킷이 앞을 지난다 */
  return { ...stackedPose(pos, dx), z: (topPacket ? 12 : 5) + pos };
}

/** waypoint rail이 카드 하단과 맞물리도록 fan 카드의 x 좌표를 그대로 노출한다 */
export function fanAnchorsX(layoutScale: number): number[] {
  return scaledFanLayout(SELECTABLE_LAYOUT, layoutScale).map((p) => p.x);
}

export function poseForCard(
  phase: CardPhase,
  mixStep: MixStep,
  i: number,
  total: number,
  layoutScale: number,
  selectedId: string | null,
  cardId: string,
): CardPose {
  const selectable = scaledFanLayout(SELECTABLE_LAYOUT, layoutScale);

  if (
    (phase === "selected" || phase === "revealing" || phase === "complete") &&
    selectedId
  ) {
    const base = layoutPose(selectable, i);
    if (cardId === selectedId) {
      /* 클릭 직후 — 제자리에서 살짝 들어올리기만 한다 */
      if (phase === "selected") {
        return { ...base, y: base.y - 14, rotate: base.rotate * 0.3, scale: 1.06, z: 30 };
      }
      /* 무대 중앙으로 이동하며 확대. 공개 후에도 크기를 유지한다 */
      return { x: 0, y: -20, rotate: 0, scale: PICK_SCALE, opacity: 1, z: 30 };
    }
    /* 나머지 4장은 바깥으로 밀지 않고 선택 카드 뒤로 모인다 */
    return {
      x: base.x * 0.42,
      y: base.y + 12,
      rotate: base.rotate * 0.3,
      scale: 0.94,
      opacity: 0.18,
      z: 1 + i,
    };
  }

  switch (phase) {
    case "ready":
      return layoutPose(selectable, i, 4 + i);
    case "gathering":
      return stackedPose(i);
    case "crossing":
      return cutPose(mixStep, i, layoutScale);
    case "selectable":
      /* 왼쪽부터 순서대로 쌓아야 각 카드 하단 힌트가 오른쪽 이웃에 가리지 않는다 */
      return layoutPose(selectable, i, 5 + i);
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
