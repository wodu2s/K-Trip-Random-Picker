import { cn } from "../../utils/cn";

const STEPS = [
  { num: "01", label: "탐험 시작" },
  { num: "02", label: "조건 설정" },
  { num: "03", label: "카드 뽑기" },
  { num: "04", label: "목적지" },
] as const;

export function JourneySteps({ activeIndex }: { activeIndex: number }) {
  return (
    <ol
      className="flex items-center gap-0"
      aria-label="탐험 진행 단계"
    >
      {STEPS.map((step, idx) => {
        const active = idx === activeIndex;
        const done = idx < activeIndex;
        return (
          <li key={step.num} className="flex items-center">
            {idx > 0 ? (
              <span
                className="mx-2 hidden h-px w-6 sm:mx-3 sm:block sm:w-10 md:w-14"
                style={{
                  background: done
                    ? "linear-gradient(90deg, rgba(201,162,39,0.55), rgba(201,162,39,0.25))"
                    : "rgba(201,162,39,0.18)",
                }}
                aria-hidden="true"
              />
            ) : null}
            <div
              className={cn(
                "flex flex-col items-center gap-0.5",
                active ? "opacity-100" : done ? "opacity-80" : "opacity-45",
              )}
            >
              <span
                className={cn(
                  "font-landing-display text-[11px] font-bold tracking-[0.18em] sm:text-xs",
                  active ? "text-[#E8C86A]" : "text-[#C9A227]",
                )}
              >
                {step.num}
              </span>
              <span
                className={cn(
                  "hidden whitespace-nowrap text-[10px] font-medium tracking-[0.06em] sm:block sm:text-[11px]",
                  active ? "text-[#F0E9DA]" : "text-[#F0E9DA]/65",
                )}
              >
                {step.label}
              </span>
              {active ? (
                <span
                  className="mt-0.5 h-[2px] w-full max-w-[4.5rem] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, #C9A227, transparent)",
                    boxShadow: "0 0 8px rgba(201,162,39,0.45)",
                  }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
