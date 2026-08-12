import { ADVENTURE_CARD_MOTION, ADVENTURE_CARD_SPRING } from "./adventureCardTokens";
import type { CardPhase } from "../types/travel";

/** 셔플 단계별 duration (ms) — 단일 설정 원천 */
export const SHUFFLE_TIMING_MS = {
  ready: 80,
  gathering: 400,
  fanOut: 450,
  crossing: 340,
  mixing: 560,
  mixingHalf: 280,
  restacking: 300,
  selectable: 460,
} as const;

/** reduced-motion 셔플 단축 duration (ms) */
export const SHUFFLE_TIMING_REDUCED_MS = {
  gathering: 120,
  crossing: 220,
  restacking: 100,
} as const;

/** Adventure Expedition 카드 드로우 모션 (초 단위) */
export const CARD_MOTION = {
  ready: SHUFFLE_TIMING_MS.ready / 1000,
  gathering: SHUFFLE_TIMING_MS.gathering / 1000,
  fanOut: SHUFFLE_TIMING_MS.fanOut / 1000,
  crossing: SHUFFLE_TIMING_MS.crossing / 1000,
  mixing: SHUFFLE_TIMING_MS.mixing / 1000,
  mixingHalf: SHUFFLE_TIMING_MS.mixingHalf / 1000,
  restacking: SHUFFLE_TIMING_MS.restacking / 1000,
  selectable: SHUFFLE_TIMING_MS.selectable / 1000,
  select: ADVENTURE_CARD_MOTION.select,
  stamp: ADVENTURE_CARD_MOTION.stamp,
  focusPause: ADVENTURE_CARD_MOTION.pause,
  flip: 0.6,
  revealHold: ADVENTURE_CARD_MOTION.revealHold,
  revealStagger: ADVENTURE_CARD_MOTION.revealStagger,
  pageExit: 0.2,
  pageEnter: 0.3,
} as const;

export const CARD_SPRING = ADVENTURE_CARD_SPRING;

export const CARD_EASE: [number, number, number, number] = [0.22, 0.8, 0.2, 1];
export const SHUFFLE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const SHUFFLE_EASE_OVERSHOOT: [number, number, number, number] = [0.34, 1.25, 0.36, 1];
export const SHUFFLE_EASE_SETTLE: [number, number, number, number] = [0.22, 0.9, 0.25, 1];
export const CARD_EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const CARD_EASE_INOUT: [number, number, number, number] = [0.45, 0.05, 0.2, 1];
export const CARD_EASE_ORBIT: [number, number, number, number] = [0.33, 0, 0.2, 1];
export const CARD_EASE_IN: [number, number, number, number] = [0.55, 0.05, 0.8, 0.2];

export function phaseWaitMs(seconds: number, reduce: boolean): number {
  if (reduce) return Math.min(120, Math.round(seconds * 1000 * 0.25));
  return Math.round(seconds * 1000);
}

export function shuffleWaitMs(ms: number, reduce: boolean): number {
  if (reduce) return Math.min(120, Math.round(ms * 0.25));
  return ms;
}

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function durationForShufflePhase(phase: string, reduce: boolean): number {
  if (reduce) return 0.14;
  switch (phase) {
    case "gathering":
      return CARD_MOTION.gathering;
    case "fanOut":
      return CARD_MOTION.fanOut;
    case "crossing":
      return CARD_MOTION.crossing;
    case "mixing":
      return CARD_MOTION.mixingHalf;
    case "restacking":
      return CARD_MOTION.restacking;
    case "selectable":
      return CARD_MOTION.selectable;
    case "complete":
      return 0.5;
    default:
      return 0.2;
  }
}

/** fanOut: 중앙 → 좌우 안쪽 → 좌우 바깥 */
export const FAN_STAGGER_ORDER = [2, 1, 3, 0, 4] as const;

/** restacking: 바깥 카드부터 */
export const RESTACK_STAGGER_ORDER = [0, 4, 1, 3, 2] as const;

function orderIndex(order: readonly number[], cardIndex: number): number {
  const idx = order.indexOf(cardIndex);
  return idx >= 0 ? idx : cardIndex;
}

/** phase별 카드 stagger delay (초) */
export function cardStaggerDelay(
  phase: CardPhase,
  cardIndex: number,
  reduce: boolean,
): number {
  if (reduce) return 0;
  switch (phase) {
    case "gathering":
      return cardIndex * 0.028;
    case "fanOut":
      return orderIndex(FAN_STAGGER_ORDER, cardIndex) * 0.045;
    case "crossing":
      return cardIndex * 0.022;
    case "mixing":
      return cardIndex * 0.02;
    case "restacking":
      return orderIndex(RESTACK_STAGGER_ORDER, cardIndex) * 0.028;
    case "selectable":
      return orderIndex(FAN_STAGGER_ORDER, cardIndex) * 0.04;
    default:
      return 0;
  }
}

export function transitionEaseForPhase(phase: CardPhase): [number, number, number, number] {
  if (phase === "selectable") return SHUFFLE_EASE_SETTLE;
  return SHUFFLE_EASE;
}
