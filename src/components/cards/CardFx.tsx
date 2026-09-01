import type { CardPhase } from "../../types/travel";
import { isComplete, showsSpotlight } from "../../lib/cardPhaseUtils";
import "./shuffleDeck.css";

/**
 * 무대 조명 — 선택 이후에만 켜지는 정적 스포트라이트.
 * 지속되는 파티클·별빛·궤도 glow는 두지 않는다.
 */
export function CardFx({ phase }: { phase: CardPhase }) {
  const on = showsSpotlight(phase);
  const fade = isComplete(phase);

  return (
    <div
      className={`shuffle-deck__spotlight${on ? " shuffle-deck__spotlight--on" : ""}${fade ? " shuffle-deck__spotlight--fade" : ""}`}
      aria-hidden="true"
    />
  );
}
