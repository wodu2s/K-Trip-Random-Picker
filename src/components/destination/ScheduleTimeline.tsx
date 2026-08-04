import { motion } from "motion/react";
import type { ScheduleItem } from "../../types/travel";
import { PERIOD_ICON } from "../../lib/icons";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** 탐험 경로 타임라인 — brass 점선 + compact 카드 */
export function ScheduleTimeline({ schedule }: { schedule: ScheduleItem[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="relative space-y-0">
      <span
        className="absolute bottom-5 left-[21px] top-5 w-px border-l-2 border-dashed border-brass/50"
        aria-hidden="true"
      />
      {schedule.map((item, i) => {
        const Icon = PERIOD_ICON[item.period];
        const first = i === 0;
        return (
          <motion.li
            key={item.period}
            className="relative flex gap-3 py-1.5 text-left"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
          >
            <span
              className={
                first
                  ? "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-[var(--color-text-on-brass-btn)] shadow-sm"
                  : "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brass bg-[var(--color-parchment-100)] text-primary shadow-sm"
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 rounded-[10px] border border-brass/25 bg-[var(--color-parchment-100)] px-4 py-3 shadow-[0_6px_16px_rgba(22,40,31,0.08)]">
              <p className="font-expedition text-[11px] font-bold uppercase tracking-[0.1em] text-brass">
                {item.period}
              </p>
              <p className="font-expedition mt-0.5 text-[17px] font-bold leading-snug text-ink">
                {item.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
