export const TRAVEL_STEPS = [
  "조건 설정",
  "카드 섞는 중",
  "카드 선택",
  "여행지 공개",
] as const;

/**
 * 진행 단계 표시 (1 → 4).
 * current(1-based)에 해당하는 원만 파란색으로 채워지고,
 * 이전 단계는 완료 상태, 이후 단계는 흐린 상태로 표시된다.
 */
export function StepProgress({
  current,
  className = "",
}: {
  current: 1 | 2 | 3 | 4;
  className?: string;
}) {
  return (
    <nav
      aria-label="진행 단계"
      className={`w-full ${className}`}
    >
      <ol className="flex items-start justify-between gap-1 sm:gap-2">
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
              {/* 단계 사이 연결선 */}
              {!isLast && (
                <span
                  className={`absolute left-1/2 top-4 -z-0 h-0.5 w-full ${
                    isDone ? "bg-primary" : "bg-line"
                  }`}
                  aria-hidden="true"
                />
              )}

              <span
                className={[
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  isCurrent
                    ? "bg-primary text-white shadow-[0_6px_16px_rgba(47,115,246,0.4)]"
                    : isDone
                      ? "bg-primary/90 text-white"
                      : "bg-surface text-muted ring-1 ring-line",
                ].join(" ")}
              >
                {isDone ? "✓" : step}
              </span>

              <span
                className={`mt-2 truncate text-center text-[11px] font-semibold sm:text-[13px] ${
                  isCurrent ? "text-primary" : "text-muted"
                }`}
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
