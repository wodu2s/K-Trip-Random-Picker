/** 카드 무대 — 단일 나침반 장면 이미지 + 카드 fan 정렬 앵커 */
export const COMPASS_STAGE_LAYOUT = {
  desktop: {
    stageWidth: 1010,
    /** 원판 상단면 중심에서 카드 fan 아랫변까지 띄우는 공간 */
    cardGapPx: 105,
    pivotBottomPx: 8,
    stageOffsetPx: 32,
    imageOpacity: 0.96,
  },
  mobile: {
    stageWidth: 408,
    cardGapPx: 58,
    pivotBottomPx: 4,
    stageOffsetPx: 12,
    imageOpacity: 0.94,
  },
} as const;

/** compass-astral-stage.webp(1:1) — 원판 상단면 중심은 이미지 아래에서 37.75% 지점 */
export const DISC_CENTER_RATIO = 0.3775;

/** 같은 이미지에서 황동 원판이 차지하는 가로 비율 */
export const DISC_WIDTH_RATIO = 0.71;

export type CompassStageMetrics = {
  stageWidth: number;
  cardGapPx: number;
  pivotBottomPx: number;
  stageOffsetPx: number;
  imageOpacity: number;
  /** 이미지 아래 기준 원판 중심 높이 — 카드 fan·그림자가 공유하는 기준선 */
  discCenterPx: number;
  discWidthPx: number;
};

export function getCompassStageMetrics(isMobile: boolean, stageW: number): CompassStageMetrics {
  const base = isMobile ? COMPASS_STAGE_LAYOUT.mobile : COMPASS_STAGE_LAYOUT.desktop;
  const vw = typeof window !== "undefined" ? window.innerWidth : stageW;

  const stageWidth = isMobile
    ? Math.min(base.stageWidth, vw * 1.08)
    : Math.min(base.stageWidth, Math.max(815, Math.min(stageW, vw) * 0.84));

  return {
    ...base,
    stageWidth,
    discCenterPx: Math.round(stageWidth * DISC_CENTER_RATIO),
    discWidthPx: Math.round(stageWidth * DISC_WIDTH_RATIO),
  };
}
