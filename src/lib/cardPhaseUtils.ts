import type { CardPhase } from "../types/travel";

/** 셔플 진행 중 phase */
export const SHUFFLE_PHASES: readonly CardPhase[] = [
  "ready",
  "gathering",
  "fanOut",
  "crossing",
  "mixing",
  "restacking",
] as const;

export const SELECTABLE_PHASES: readonly CardPhase[] = ["selectable"] as const;

export const SELECTION_PHASES: readonly CardPhase[] = [
  "selected",
  "revealing",
] as const;

export function isShuffling(phase: CardPhase): boolean {
  return (SHUFFLE_PHASES as readonly string[]).includes(phase);
}

export function isSelectable(phase: CardPhase): boolean {
  return phase === "selectable";
}

export function isSelecting(phase: CardPhase): boolean {
  return (SELECTION_PHASES as readonly string[]).includes(phase);
}

export function isComplete(phase: CardPhase): boolean {
  return phase === "complete";
}

export function showsCardBack(phase: CardPhase): boolean {
  return isShuffling(phase);
}

/** mixing·revealing(뒤집기 직전) orbit */
export function showsDeckOrbit(phase: CardPhase): boolean {
  return phase === "mixing" || phase === "revealing";
}

export function showsSpotlight(phase: CardPhase): boolean {
  return phase === "selected" || isSelecting(phase) || isComplete(phase);
}

export function showsReadyAmbience(phase: CardPhase): boolean {
  return phase === "ready";
}

export function showsRestackFlash(phase: CardPhase): boolean {
  return phase === "restacking";
}

export function showsSelectBurst(phase: CardPhase): boolean {
  return phase === "selected";
}
