"use client";

import { useRouter } from "next/navigation";
import { useTravelStore } from "@/stores/travelStore";
import { THEME_META } from "@/data/destinations";
import type { Duration, ThemeKey } from "@/types/travel";

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "day-trip", label: "당일치기" },
  { value: "overnight", label: "1박 2일 이상" },
];

const THEME_ORDER: ThemeKey[] = [
  "sea",
  "nature",
  "food",
  "vibe",
  "history",
  "local",
  "activity",
  "etc",
];

function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink">
      <span aria-hidden="true">{icon}</span>
      {children}
    </h3>
  );
}

/**
 * 여행 조건 컨트롤 (여행 기간 · 여행 테마 + 카드 뽑기 CTA).
 * 출발지(현재 위치)·이동 가능 시간은 프로젝트에서 제외.
 * 배경 없이 컨트롤만 렌더 → p2.png의 하얀 박스 위 오버레이,
 * 모바일에서는 실제 흰 카드로 감싸서 재사용한다.
 */
export function ConditionsControls() {
  const router = useRouter();
  const duration = useTravelStore((s) => s.duration);
  const themes = useTravelStore((s) => s.themes);
  const setDuration = useTravelStore((s) => s.setDuration);
  const toggleTheme = useTravelStore((s) => s.toggleTheme);

  const ready = !!duration && themes.length > 0;

  return (
    <div className="space-y-7">
      {/* 제목 (박스 상단) */}
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
          <span aria-hidden="true">📍</span>
          어떤 여행을 떠나볼까요?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          간단한 설정만으로 지금 떠날 수 있는 여행지를 추천해드릴게요!
        </p>
      </header>

      {/* 여행 기간 */}
      <section>
        <SectionLabel icon="📅">여행 기간</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {DURATION_OPTIONS.map((opt) => {
            const active = duration === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                aria-pressed={active}
                className={`min-h-[58px] rounded-2xl border px-3 py-3 text-base font-bold transition-all ${
                  active
                    ? "border-accent bg-accent text-ink shadow-[0_10px_22px_rgba(255,209,102,0.45)]"
                    : "border-line bg-white text-ink hover:border-accent"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 여행 테마 */}
      <section>
        <SectionLabel icon="🏷️">여행 테마</SectionLabel>
        <div className="grid grid-cols-4 gap-2.5">
          {THEME_ORDER.map((key) => {
            const meta = THEME_META[key];
            const active = themes.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleTheme(key)}
                aria-pressed={active}
                className={`relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 transition-all ${
                  active
                    ? "border-primary bg-primary/[0.08] text-primary"
                    : "border-line bg-white text-ink hover:border-primary/40"
                }`}
              >
                {active && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white" aria-hidden="true">
                    ✓
                  </span>
                )}
                <span className="text-lg" aria-hidden="true">{meta.emoji}</span>
                <span className="text-xs font-bold">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <button
        type="button"
        onClick={() => router.push("/shuffle")}
        disabled={!ready}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-lg font-extrabold text-ink shadow-[0_6px_0_#e0a92e,0_14px_24px_rgba(224,169,46,0.42)] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-1 active:shadow-[0_2px_0_#e0a92e] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
      >
        🎲 카드 뽑기 시작 ✨
      </button>
      {!ready && (
        <p className="text-center text-xs text-muted">
          여행 기간과 테마를 하나 이상 선택해주세요.
        </p>
      )}
    </div>
  );
}
