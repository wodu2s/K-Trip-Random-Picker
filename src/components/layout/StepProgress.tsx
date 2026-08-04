import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

export const TRAVEL_STEPS = ["조건 설정", "신호 탐색", "카드 선택", "목적지 공개"] as const;

/**
 * Expedition 진행 표시 — 넓은 점선 경로 + 큰 노드.
 * 현재: 황동 + 1회 pulse / 완료: 포레스트 + 체크 / 모바일 축약.
 */
export function StepProgress({ current, className = "" }: { current: 1 | 2 | 3 | 4; className?: string }) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(id);
  }, [current]);

  return (
    <nav aria-label="탐험 진행 단계" className={cn("w-full", className)}>
      <p className="font-expedition mb-3 text-center text-[12px] font-bold tracking-[0.14em] text-brass sm:hidden">
        {current} / 4 · {TRAVEL_STEPS[current - 1]}
      </p>

      <ol className="flex items-start justify-between">
        {TRAVEL_STEPS.map((label, i) => {
          const step = i + 1;
          const isCurrent = step === current;
          const isDone = step < current;
          const isLast = step === TRAVEL_STEPS.length;

          return (
            <li
              key={label}
              className="relative flex min-w-0 flex-1 flex-col items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[18px] -z-0 border-t-2",
                    isDone ? "border-solid border-primary" : "border-dashed border-line",
                  )}
                  aria-hidden="true"
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full font-bold",
                  isCurrent
                    ? "h-10 w-10 text-base bg-brass text-[var(--color-forest-900)] ring-[3px] ring-brass/40 shadow-[0_8px_18px_rgba(201,162,39,0.4)]"
                      : isDone
                      ? "h-9 w-9 text-sm bg-primary text-[var(--color-text-on-brass-btn)]"
                      : "h-9 w-9 text-sm bg-surface text-muted ring-1 ring-line",
                  isCurrent && pulse && "animate-[expedition-pulse_0.65s_ease-out_1]",
                )}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={2.8} aria-hidden="true" /> : step}
              </span>

              <span
                className={cn(
                  "mt-2.5 hidden truncate text-center text-[12px] sm:block sm:text-[13px]",
                  isCurrent ? "font-bold text-primary" : "font-semibold text-muted",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
