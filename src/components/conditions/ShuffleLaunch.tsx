import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ExpeditionCardArt } from "../cards/ExpeditionCardArt";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";

/** 랜딩 Expedition 카드 5장 — 오프셋은 카드 크기 기준 %라 확대해도 비율이 유지된다 */
const FAN = [
  { x: -88, y: 4, r: -9 },
  { x: -44, y: 1.5, r: -4.5 },
  { x: 0, y: 0, r: 0 },
  { x: 44, y: 1.5, r: 4.5 },
  { x: 88, y: 4, r: 9 },
] as const;

function CardFan() {
  return (
    <div className="shuffle-launch__fan" aria-hidden="true">
      {FAN.map((c, i) => (
        <div
          key={i}
          className="shuffle-launch__fan-card"
          style={{
            zIndex: i === 2 ? 6 : 3 - Math.abs(i - 2),
            transform: `translate(-50%, -50%) translate(${c.x}%, ${c.y}%) rotate(${c.r}deg)`,
          }}
        >
          <ExpeditionCardArt featured={false} />
        </div>
      ))}
    </div>
  );
}

/** 운명의 카드 셔플 — 조건 확정 후 카드 뽑기 단계로 넘어가는 영역 */
export function ShuffleLaunch({ className = "" }: { className?: string }) {
  const { duration, themes, startShuffle } = useTravel();
  const reduce = useReducedMotion();
  const ready = !!duration && themes.length > 0;
  const [starting, setStarting] = useState(false);
  const startLock = useRef(false);

  function handleStart() {
    if (!ready || startLock.current) return;
    startLock.current = true;
    setStarting(true);
    startShuffle();
  }

  return (
    <section className={cn("shuffle-launch", className)}>
      <div className="shuffle-launch__scene">
        <div className="shuffle-launch__copy">
          <p className="shuffle-launch__eyebrow font-expedition">PREPARE THE DECK</p>
          <h2 className="shuffle-launch__heading">운명의 카드 셔플</h2>
          <p className="shuffle-launch__lead">
            선택한 조건을 섞어
            <br />
            오늘의 여행 후보 다섯 장을 만듭니다.
          </p>
        </div>
        <CardFan />
      </div>

      <motion.button
        type="button"
        onClick={handleStart}
        disabled={!ready || starting}
        aria-disabled={!ready || starting}
        whileHover={ready && !starting && !reduce ? { y: -1, transition: { duration: 0.18 } } : undefined}
        whileTap={ready && !starting && !reduce ? { scale: 0.99 } : undefined}
        className={cn(
          "shuffle-launch__cta group",
          ready && "shuffle-launch__cta--ready",
          "disabled:cursor-not-allowed",
        )}
      >
        <span>{starting ? "카드를 섞는 중…" : "조건을 확정하고 카드 셔플하기"}</span>
        <ArrowRight
          className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </motion.button>

      {!ready && (
        <p className="shuffle-launch__hint" role="status">
          <span className="shuffle-launch__hint-dot" aria-hidden="true" />
          여행 기간과 테마를 하나 이상 선택해주세요.
        </p>
      )}
    </section>
  );
}
