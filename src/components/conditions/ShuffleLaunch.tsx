import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";

/** 하단 CTA — 조건 확정 후 카드 뽑기 단계로 넘어간다. 버튼 하나만 둔다. */
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
    <div className={cn("launch", className)}>
      <motion.button
        type="button"
        onClick={handleStart}
        disabled={!ready || starting}
        aria-disabled={!ready || starting}
        whileHover={ready && !starting && !reduce ? { y: -1, transition: { duration: 0.18 } } : undefined}
        whileTap={ready && !starting && !reduce ? { scale: 0.99 } : undefined}
        className={cn("launch__cta group", ready && "launch__cta--ready")}
      >
        <span>{starting ? "카드를 섞는 중…" : "카드 뽑기 시작하기"}</span>
        <ArrowRight
          className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </motion.button>

      {!ready && (
        <p className="launch__hint" role="status">
          여행 기간과 테마를 하나 이상 선택해주세요.
        </p>
      )}
    </div>
  );
}
