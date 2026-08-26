import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Compass, Smile, Sparkles, Tags, Users } from "lucide-react";
import {
  COMPANION_META,
  COMPANION_ORDER,
  DISCOVERY_META,
  DISCOVERY_ORDER,
  MOOD_META,
  MOOD_ORDER,
  THEME_META,
  THEME_ORDER,
} from "../../data/destinations";
import type { Duration } from "../../types/travel";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "day-trip", label: "당일치기" },
  { value: "overnight", label: "1박 2일 이상" },
];

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--ivory)" }}>
      <Icon className="h-4 w-4 text-[var(--gold)]" strokeWidth={2.2} aria-hidden="true" />
      <span>{children}</span>
    </h3>
  );
}

/** 얇고 긴 pill — 활성 시 금색 외곽선 + 약한 내부 조명 */
function ChoiceButton({
  label,
  active,
  onClick,
  reduce,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  reduce: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      animate={active && !reduce ? { scale: [0.97, 1] } : { scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13.5px] font-semibold transition-all duration-200",
        "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2",
        active ? "border-[1.5px]" : "border hover:brightness-110",
      )}
      style={{
        color: "var(--ivory)",
        fontFamily: "'Noto Sans KR Variable', sans-serif",
        background: active ? "rgba(212,175,55,0.07)" : "transparent",
        borderColor: active ? "var(--gold)" : "rgba(212,175,55,0.2)",
        boxShadow: active
          ? "0 0 10px rgba(212,175,55,0.4), inset 0 0 10px rgba(212,175,55,0.18)"
          : "none",
        outlineColor: "var(--gold)",
      }}
    >
      {label}
    </motion.button>
  );
}

type Props = {
  /** 헤더 문구를 패널 밖에서 보여줄 때 숨김 */
  hideHeader?: boolean;
  className?: string;
};

/** 탐험 계획서 — 조건 선택 + CTA (추천 로직/이벤트 유지) */
export function ConditionsControls({ hideHeader = false, className = "" }: Props) {
  const {
    duration,
    themes,
    companion,
    mood,
    discovery,
    setDuration,
    toggleTheme,
    setCompanion,
    setMood,
    setDiscovery,
    startShuffle,
    recommendationLoading,
    recommendationError,
  } = useTravel();
  const reduce = useReducedMotion();
  const ready = !!duration && themes.length > 0;
  const starting = recommendationLoading;

  function handleStart() {
    if (!ready || starting) return;
    startShuffle();
  }

  const sectionStyle = {
    background: "var(--panel-deep)",
    border: "1px solid rgba(212,175,55,0.14)",
    boxShadow: "inset 0 1px 6px rgba(0,0,0,0.4)",
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {!hideHeader && (
        <header className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 shrink-0" style={{ color: "var(--gold)" }} strokeWidth={2.1} aria-hidden="true" />
          <div>
            <h1
              className="text-xl font-bold tracking-tight sm:text-[22px]"
              style={{ color: "var(--ivory)", fontFamily: "'Noto Serif KR Variable', serif" }}
            >
              탐험 조건 설정
            </h1>
            <p
              className="mt-0.5 text-[13px] leading-relaxed"
              style={{ color: "var(--ivory-muted)", fontFamily: "'Noto Sans KR Variable', sans-serif" }}
            >
              원하는 조건을 선택해 주세요.
            </p>
          </div>
        </header>
      )}

      <div className="flex-1 space-y-1.5">
        <section className="rounded-[10px] p-3" style={sectionStyle}>
          <SectionLabel icon={CalendarDays}>여행 기간</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                label={opt.label}
                active={duration === opt.value}
                onClick={() => setDuration(opt.value)}
                reduce={reduce}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[10px] p-3" style={sectionStyle}>
          <SectionLabel icon={Tags}>여행 테마</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {THEME_ORDER.map((key) => (
              <ChoiceButton
                key={key}
                label={THEME_META[key].label}
                active={themes.includes(key)}
                onClick={() => toggleTheme(key)}
                reduce={reduce}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[10px] p-3" style={sectionStyle}>
          <SectionLabel icon={Users}>동행</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {COMPANION_ORDER.map((key) => (
              <ChoiceButton
                key={key}
                label={COMPANION_META[key].label}
                active={companion === key}
                onClick={() => setCompanion(key)}
                reduce={reduce}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[10px] p-3" style={sectionStyle}>
          <SectionLabel icon={Smile}>분위기</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {MOOD_ORDER.map((key) => (
              <ChoiceButton
                key={key}
                label={MOOD_META[key].label}
                active={mood === key}
                onClick={() => setMood(key)}
                reduce={reduce}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[10px] p-3" style={sectionStyle}>
          <SectionLabel icon={Compass}>발견 성향</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_ORDER.map((key) => (
              <ChoiceButton
                key={key}
                label={DISCOVERY_META[key].label}
                active={discovery === key}
                onClick={() => setDiscovery(key)}
                reduce={reduce}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 space-y-2">
        <motion.button
          type="button"
          onClick={handleStart}
          disabled={!ready || starting}
          aria-disabled={!ready || starting}
          whileHover={
            ready && !starting && !reduce
              ? { y: -2, transition: { duration: 0.18 } }
              : undefined
          }
          whileTap={ready && !starting && !reduce ? { scale: 0.98 } : undefined}
          className={cn(
            "group flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[8px] border px-5 text-[17px] font-semibold transition-shadow duration-200",
            "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:shadow-none",
          )}
          style={{
            background: ready
              ? "linear-gradient(180deg, #f0d585 0%, #d4af37 45%, #a9841f 100%)"
              : "transparent",
            borderColor: ready ? "transparent" : "rgba(212,175,55,0.35)",
            color: ready ? "#1a1208" : "var(--ivory-muted)",
            fontFamily: "'Noto Sans KR Variable', sans-serif",
            boxShadow: ready && !starting ? "0 8px 18px rgba(212,175,55,0.16)" : "none",
            outlineColor: "var(--gold)",
          }}
          onMouseEnter={(e) => {
            if (ready && !starting) {
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(212,175,55,0.36)";
            }
          }}
          onMouseLeave={(e) => {
            if (ready && !starting) {
              e.currentTarget.style.boxShadow = "0 8px 18px rgba(212,175,55,0.16)";
            }
          }}
        >
          <span className="inline-flex items-center gap-2">
            {starting ? "신호를 준비하는 중…" : "신호 탐색 시작"}
          </span>
          <ArrowRight
            className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-1 group-disabled:translate-x-0"
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </motion.button>

        {recommendationError && (
          <p
            className="flex items-center justify-center gap-1.5 text-center text-xs"
            style={{ color: "var(--ivory-muted)" }}
            role="alert"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} aria-hidden="true" />
            {recommendationError}
          </p>
        )}
        {!ready && (
          <p
            className="flex items-center justify-center gap-1.5 text-center text-xs"
            style={{ color: "var(--ivory-muted)" }}
            role="status"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} aria-hidden="true" />
            여행 기간과 테마를 하나 이상 선택해주세요.
          </p>
        )}
      </div>
    </div>
  );
}
