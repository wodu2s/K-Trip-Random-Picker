"use client";

import { useRouter } from "next/navigation";
import { useTravelStore } from "@/stores/travelStore";
import { THEME_META } from "@/data/destinations";
import type { Duration, ThemeKey, TravelTime } from "@/types/travel";
import { Button } from "@/components/ui/Button";
import { ConditionsScene } from "./ConditionsScene";

const TIME_OPTIONS: { value: TravelTime; label: string; hint?: string }[] = [
  { value: "30m", label: "30분 이내" },
  { value: "1h", label: "1시간 이내" },
  { value: "half-day", label: "반나절 이내", hint: "3~6시간" },
];

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

export function ConditionsForm() {
  const router = useRouter();
  const location = useTravelStore((s) => s.location);
  const travelTime = useTravelStore((s) => s.travelTime);
  const duration = useTravelStore((s) => s.duration);
  const themes = useTravelStore((s) => s.themes);
  const setLocation = useTravelStore((s) => s.setLocation);
  const setTravelTime = useTravelStore((s) => s.setTravelTime);
  const setDuration = useTravelStore((s) => s.setDuration);
  const toggleTheme = useTravelStore((s) => s.toggleTheme);

  // 필수 조건: 출발지 + 이동 시간 + 여행 기간 + 테마 1개 이상
  const ready =
    !!location && !!travelTime && !!duration && themes.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[42fr_58fr] lg:gap-8">
      {/* 제목 — order-1 / 데스크톱 좌측 상단 */}
      <div className="order-1 lg:col-start-1 lg:row-start-1">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-ink sm:text-4xl">
          <span className="text-primary" aria-hidden="true">
            📍
          </span>
          어떤 여행을 떠나볼까요?
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          간단한 설정만으로 지금 떠날 수 있는
          <br className="hidden sm:block" /> 여행지를 추천해드릴게요!
        </p>
      </div>

      {/* 조건 패널 — order-2 / 데스크톱 좌측 중단 */}
      <div className="surface-card order-2 space-y-7 rounded-card p-5 sm:p-7 lg:col-start-1 lg:row-start-2">
        {/* 출발지 */}
        <section>
          <SectionLabel icon="📍">출발지</SectionLabel>
          <button
            type="button"
            onClick={() => setLocation("서울특별시 강남구")}
            aria-pressed={!!location}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
              location
                ? "border-primary/40 bg-primary/[0.06]"
                : "border-line bg-white hover:border-primary/30"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-hidden="true"
              >
                ✈️
              </span>
              <span>
                <span className="block text-[15px] font-bold text-ink">
                  현재 위치 사용하기
                </span>
                <span className="block text-sm text-muted">
                  {location ?? "위치를 선택해주세요"}
                </span>
              </span>
            </span>
            <span
              className={`text-lg ${location ? "text-primary" : "text-muted"}`}
              aria-hidden="true"
            >
              ◎
            </span>
          </button>
        </section>

        {/* 이동 가능 시간 (단일 선택) */}
        <section>
          <SectionLabel icon="🕐">이동 가능 시간</SectionLabel>
          <div className="grid grid-cols-3 gap-2.5">
            {TIME_OPTIONS.map((opt) => {
              const active = travelTime === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTravelTime(opt.value)}
                  aria-pressed={active}
                  className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition-all ${
                    active
                      ? "border-primary bg-primary text-white shadow-[0_10px_22px_rgba(47,115,246,0.32)]"
                      : "border-line bg-white text-ink hover:border-primary/40"
                  }`}
                >
                  <span className="text-[15px] font-bold leading-tight">
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span
                      className={`text-[11px] ${active ? "text-white/80" : "text-muted"}`}
                    >
                      {opt.hint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 여행 기간 (단일 선택) */}
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
                  className={`min-h-[52px] rounded-2xl border px-3 py-3 text-[15px] font-bold transition-all ${
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

        {/* 여행 테마 (다중 선택) */}
        <section>
          <SectionLabel icon="🏷️">
            여행 테마{" "}
            <span className="text-xs font-semibold text-muted">
              (여러 개 선택 가능)
            </span>
          </SectionLabel>
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
                  className={`relative flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-3 transition-all ${
                    active
                      ? "border-primary bg-primary/[0.08] text-primary"
                      : "border-line bg-white text-ink hover:border-primary/40"
                  }`}
                >
                  {active && (
                    <span
                      className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                  <span className="text-xl" aria-hidden="true">
                    {meta.emoji}
                  </span>
                  <span className="text-[13px] font-bold">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 오른쪽 비주얼 + TIP — order-3 / 데스크톱 우측 전체 높이 */}
      <div className="order-3 flex flex-col gap-4 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
        <ConditionsScene className="aspect-[4/3] w-full lg:aspect-[4/5]" />
        <div className="surface-card flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="text-lg" aria-hidden="true">
            💡
          </span>
          <p className="text-sm font-semibold text-ink">
            <span className="text-primary">TIP</span>
            <span className="mx-2 text-line">|</span>
            설정할수록 더 잘 맞는 여행지를 추천받을 수 있어요!
          </p>
        </div>
      </div>

      {/* CTA — order-4 / 데스크톱 좌측 하단 */}
      <div className="order-4 lg:col-start-1 lg:row-start-3">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          disabled={!ready}
          onClick={() => router.push("/shuffle")}
        >
          🎲 카드 뽑기 시작 ✨
        </Button>
        {!ready && (
          <p className="mt-2 text-center text-sm text-muted">
            이동 시간 · 여행 기간 · 테마를 하나 이상 선택해주세요.
          </p>
        )}
      </div>
    </div>
  );
}
