import type { CardPhase } from "../types/travel";
import { isComplete, isSelecting, isShuffling, isSelectable } from "./cardPhaseUtils";

/** CardsPage phase → StepProgress / Expedition 라벨 동기화 */
export function expeditionFromPhase(phase: CardPhase): {
  step: 1 | 2 | 3 | 4;
  label: string;
  expedition: string;
} {
  if (isShuffling(phase)) {
    return { step: 2, label: "신호 탐색", expedition: "EXPEDITION 02" };
  }

  if (isSelectable(phase) || isSelecting(phase)) {
    return { step: 3, label: "카드 선택", expedition: "EXPEDITION 03" };
  }

  if (isComplete(phase)) {
    return { step: 4, label: "목적지 공개", expedition: "EXPEDITION 04" };
  }

  return { step: 2, label: "신호 탐색", expedition: "EXPEDITION 02" };
}
