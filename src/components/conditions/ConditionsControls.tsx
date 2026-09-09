import { motion } from "motion/react";
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

/** 탐험 경로의 waypoint 한 칸 — brass 마커 → 조건명 → 선택 chip */
function Field({
  no,
  title,
  note,
  active,
  children,
}: {
  no: string;
  title: string;
  note: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="dossier-row" data-active={active}>
      <span className="dossier-waypoint" aria-hidden="true">
        <span className="dossier-waypoint__mark">{no}</span>
      </span>
      <div className="dossier-row__label">
        <h3
          className="whitespace-nowrap text-[15px] font-bold tracking-tight"
          style={{
            color: "var(--ivory)",
            fontFamily: "'Noto Serif KR Variable', serif",
          }}
        >
          {title}
        </h3>
        <span className="dossier-row__note">{note}</span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

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
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="dossier-choice"
    >
      {label}
    </motion.button>
  );
}

/** 탐험 기록지 — header + I~V 기록란. 셔플 CTA는 ShuffleLaunch */
export function ConditionsControls({ className = "" }: { className?: string }) {
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
  } = useTravel();
  const reduce = useReducedMotion();

  return (
    <>
      <header className={cn("dossier-header", className)}>
        <div>
          <p className="dossier-header__eyebrow font-expedition">EXPEDITION DOSSIER</p>
          <h1 className="dossier-header__title">탐험 기록지</h1>
        </div>
        <p className="dossier-header__aside">다섯 칸을 채우면 오늘의 여행 후보를 뽑습니다.</p>
      </header>

      <div className="dossier-fields">
        <Field no="I" title="여행 기간" note="Duration" active={!!duration}>
          {DURATION_OPTIONS.map((opt) => (
            <ChoiceButton
              key={opt.value}
              label={opt.label}
              active={duration === opt.value}
              onClick={() => setDuration(opt.value)}
              reduce={reduce}
            />
          ))}
        </Field>

        <Field no="II" title="여행 테마" note="Themes" active={themes.length > 0}>
          {THEME_ORDER.map((key) => (
            <ChoiceButton
              key={key}
              label={THEME_META[key].label}
              active={themes.includes(key)}
              onClick={() => toggleTheme(key)}
              reduce={reduce}
            />
          ))}
        </Field>

        <Field no="III" title="동행" note="Company" active={!!companion}>
          {COMPANION_ORDER.map((key) => (
            <ChoiceButton
              key={key}
              label={COMPANION_META[key].label}
              active={companion === key}
              onClick={() => setCompanion(key)}
              reduce={reduce}
            />
          ))}
        </Field>

        <Field no="IV" title="분위기" note="Mood" active={!!mood}>
          {MOOD_ORDER.map((key) => (
            <ChoiceButton
              key={key}
              label={MOOD_META[key].label}
              active={mood === key}
              onClick={() => setMood(key)}
              reduce={reduce}
            />
          ))}
        </Field>

        <Field no="V" title="발견 성향" note="Discovery" active={!!discovery}>
          {DISCOVERY_ORDER.map((key) => (
            <ChoiceButton
              key={key}
              label={DISCOVERY_META[key].label}
              active={discovery === key}
              onClick={() => setDiscovery(key)}
              reduce={reduce}
            />
          ))}
        </Field>
      </div>
    </>
  );
}
