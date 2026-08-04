import { useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  Camera,
  Check,
  Compass,
  Landmark,
  MapPin,
  Mountain,
  Sparkles,
  Tags,
  Utensils,
  Waves,
} from "lucide-react";
import { THEME_META, THEME_ORDER } from "../../data/destinations";
import type { Duration, ThemeKey } from "../../types/travel";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { StampBadge } from "../layout/AdventurePageShell";
import { cn } from "../../utils/cn";

const THEME_ICONS: Record<
  ThemeKey,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  sea: Waves,
  nature: Mountain,
  food: Utensils,
  vibe: Camera,
  history: Landmark,
  local: MapPin,
  activity: Bike,
  etc: Sparkles,
};

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "day-trip", label: "당일치기" },
  { value: "overnight", label: "1박 2일 이상" },
];

function SectionLabel({
  icon: Icon,
  code,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
      <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="font-expedition text-[11px] font-bold tracking-[0.14em] text-brass">{code}</span>
      <span>{children}</span>
    </h3>
  );
}

type Props = {
  /** 헤더 문구를 패널 밖에서 보여줄 때 숨김 */
  hideHeader?: boolean;
  className?: string;
};

/** 탐험 계획서 — 조건 선택 + CTA (추천 로직/이벤트 유지) */
export function ConditionsControls({ hideHeader = false, className = "" }: Props) {
  const { duration, themes, setDuration, toggleTheme, startShuffle } = useTravel();
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
    <div className={cn("flex h-full flex-col", className)}>
      {!hideHeader && (
        <header className="mb-6">
          <p className="font-expedition text-[11px] font-bold tracking-[0.16em] text-brass">
            EXPEDITION 01
          </p>
          <h1 className="font-expedition mt-1.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
            <Compass className="h-6 w-6 shrink-0 text-brass" strokeWidth={2.1} aria-hidden="true" />
            탐험 조건 설정
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">
            이번 여행에 필요한 조건을 골라보세요.
          </p>
        </header>
      )}

      <div className="flex-1 space-y-6">
        <section>
          <SectionLabel icon={CalendarDays} code="01">
            여행 기간
          </SectionLabel>
          <div className="grid grid-cols-2 gap-2.5 overflow-visible">
            {DURATION_OPTIONS.map((opt) => {
              const active = duration === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  aria-pressed={active}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  animate={active && !reduce ? { scale: [0.97, 1] } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "relative min-h-[56px] overflow-visible rounded-[8px] border-2 px-3 py-3 text-[15px] font-semibold transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brass",
                    active
                      ? "border-primary bg-primary text-[var(--color-text-on-brass-btn)] shadow-[0_10px_22px_rgba(22,40,31,0.22)]"
                      : "border-[var(--adventure-line)] bg-[var(--color-parchment-100)] text-ink hover:-translate-y-0.5 hover:border-brass/55 hover:shadow-[0_8px_18px_rgba(22,40,31,0.08)]",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {opt.label}
                    {active && <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />}
                  </span>
                  {active && (
                    <StampBadge className="absolute right-1.5 top-1.5 scale-90 opacity-80">OK</StampBadge>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section>
          <SectionLabel icon={Tags} code="02">
            여행 테마
          </SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {THEME_ORDER.map((key) => {
              const meta = THEME_META[key];
              const Icon = THEME_ICONS[key];
              const active = themes.includes(key);
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => toggleTheme(key)}
                  aria-pressed={active}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  animate={active && !reduce ? { scale: [0.97, 1] } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    "relative flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-[8px] border-2 px-1 py-2 transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brass",
                    active
                      ? "border-brass bg-primary/[0.1] text-primary shadow-[0_8px_18px_rgba(22,40,31,0.12)]"
                      : "border-[var(--adventure-line)] bg-[var(--color-parchment-100)] text-ink hover:-translate-y-0.5 hover:border-brass/45",
                  )}
                >
                  {active && (
                    <span
                      className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[var(--color-text-on-brass-btn)]"
                      aria-hidden="true"
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                  <Icon className="h-5 w-5" strokeWidth={2.1} aria-hidden="true" />
                  <span className="text-[11px] font-bold leading-tight sm:text-xs">{meta.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-7 space-y-2">
        <motion.button
          type="button"
          onClick={handleStart}
          disabled={!ready || starting}
          aria-disabled={!ready || starting}
          whileHover={
            ready && !starting && !reduce
              ? { y: -2, transition: { duration: 0.15 } }
              : undefined
          }
          whileTap={ready && !starting && !reduce ? { scale: 0.98 } : undefined}
          className={cn(
            "group flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[8px] bg-primary px-5 text-[17px] font-semibold text-[var(--color-text-on-brass-btn)]",
            "shadow-[0_12px_28px_rgba(22,40,31,0.28)] transition-shadow duration-150",
            "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brass",
            "disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:shadow-none",
            ready && !starting && "hover:shadow-[0_16px_32px_rgba(22,40,31,0.34)]",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Compass className="h-5 w-5 text-brass" strokeWidth={2.2} aria-hidden="true" />
            {starting ? "신호를 준비하는 중…" : "신호 탐색 시작"}
          </span>
          <ArrowRight
            className="h-5 w-5 text-brass transition-transform duration-150 group-hover:translate-x-1 group-disabled:translate-x-0"
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </motion.button>

        {!ready && (
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted" role="status">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
            여행 기간과 테마를 하나 이상 선택해주세요.
          </p>
        )}
      </div>
    </div>
  );
}
