import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, MessageSquareText, Trash2 } from "lucide-react";
import { PageContainer } from "../layout/PageContainer";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

/**
 * 방명록 지역 구분 — 관광 API(TourAPI) areaCode 17개 시·도 기준.
 * key(label)는 api/mappers.ts의 SIDO_SHORT 축약 표기와 동일해서
 * 여행지 데이터의 `region`(예: "강원 속초시")과 그대로 매칭된다.
 */
type RegionKey =
  | "서울"
  | "인천"
  | "대전"
  | "대구"
  | "광주"
  | "부산"
  | "울산"
  | "세종"
  | "경기"
  | "강원"
  | "충북"
  | "충남"
  | "경북"
  | "경남"
  | "전북"
  | "전남"
  | "제주";

const REGIONS: { key: RegionKey; areaCode: number; label: string; emoji: string }[] = [
  { key: "서울", areaCode: 1, label: "서울", emoji: "🏙️" },
  { key: "인천", areaCode: 2, label: "인천", emoji: "⚓" },
  { key: "대전", areaCode: 3, label: "대전", emoji: "🔬" },
  { key: "대구", areaCode: 4, label: "대구", emoji: "🍎" },
  { key: "광주", areaCode: 5, label: "광주", emoji: "🎨" },
  { key: "부산", areaCode: 6, label: "부산", emoji: "🌊" },
  { key: "울산", areaCode: 7, label: "울산", emoji: "🏭" },
  { key: "세종", areaCode: 8, label: "세종", emoji: "🏛️" },
  { key: "경기", areaCode: 31, label: "경기", emoji: "🏞️" },
  { key: "강원", areaCode: 32, label: "강원", emoji: "⛰️" },
  { key: "충북", areaCode: 33, label: "충북", emoji: "🌾" },
  { key: "충남", areaCode: 34, label: "충남", emoji: "🌅" },
  { key: "경북", areaCode: 35, label: "경북", emoji: "🏯" },
  { key: "경남", areaCode: 36, label: "경남", emoji: "🚢" },
  { key: "전북", areaCode: 37, label: "전북", emoji: "🍚" },
  { key: "전남", areaCode: 38, label: "전남", emoji: "🍃" },
  { key: "제주", areaCode: 39, label: "제주", emoji: "🍊" },
];

/** 방명록 한 건 */
type GuestbookEntry = {
  id: string;
  region: RegionKey;
  nickname: string;
  message: string;
  createdAt: number;
};

const STORAGE_KEY = "pickgo:guestbook";
const MAX_NAME = 12;
const MAX_MESSAGE = 200;

function loadEntries(): GuestbookEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is GuestbookEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as GuestbookEntry).id === "string" &&
        typeof (e as GuestbookEntry).region === "string" &&
        typeof (e as GuestbookEntry).nickname === "string" &&
        typeof (e as GuestbookEntry).message === "string",
    );
  } catch {
    return [];
  }
}

function saveEntries(entries: GuestbookEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* 저장 실패는 조용히 무시 (용량 초과 등) */
  }
}

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `gb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => loadEntries());
  const [region, setRegion] = useState<RegionKey>("서울");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const activeRegion = REGIONS.find((r) => r.key === region) ?? REGIONS[0];

  /** 지역별 방명록 개수 (탭 배지) */
  const countByRegion = useMemo(() => {
    const map = {} as Record<RegionKey, number>;
    for (const r of REGIONS) map[r.key] = 0;
    for (const e of entries) if (e.region in map) map[e.region] += 1;
    return map;
  }, [entries]);

  const regionEntries = useMemo(
    () => entries.filter((e) => e.region === region).sort((a, b) => b.createdAt - a.createdAt),
    [entries, region],
  );

  const canSubmit = nickname.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const name = nickname.trim();
      const body = message.trim();
      if (!name || !body) return;
      const entry: GuestbookEntry = {
        id: createId(),
        region,
        nickname: name.slice(0, MAX_NAME),
        message: body.slice(0, MAX_MESSAGE),
        createdAt: Date.now(),
      };
      setEntries((prev) => [entry, ...prev]);
      setMessage("");
    },
    [nickname, message, region],
  );

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <PageContainer>
      {/* 헤더 */}
      <header className="mb-8 text-center sm:mb-10">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
          style={{
            background: "rgba(201,162,39,0.12)",
            color: "var(--color-forest-800)",
            border: "1px solid rgba(201,162,39,0.35)",
          }}
        >
          <MessageSquareText size={16} aria-hidden="true" /> 여행자 방명록
        </span>
        <h1
          className="mt-4 text-3xl font-bold sm:text-4xl font-expedition"
          style={{ color: "var(--color-text-headline)" }}
        >
          지역별 여행 방명록
        </h1>
        <p className="mt-3 text-[15px] sm:text-base" style={{ color: "var(--color-text-body-muted)" }}>
          다녀온 여행지의 추억과 팁을 지역별로 남겨보세요. 다른 여행자들과 이야기를 나눌 수 있어요.
        </p>
      </header>

      {/* 지역 탭 */}
      <nav
        className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-2.5"
        aria-label="지역 선택"
      >
        {REGIONS.map((r) => {
          const active = r.key === region;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setRegion(r.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[15px] font-semibold transition-all",
                active ? "shadow-[0_8px_20px_rgba(22,40,31,0.18)]" : "hover:-translate-y-0.5",
              )}
              style={
                active
                  ? {
                      background: "var(--color-forest-800)",
                      borderColor: "var(--color-forest-800)",
                      color: "var(--color-text-on-forest)",
                    }
                  : {
                      background: "var(--color-parchment-100)",
                      borderColor: "var(--color-parchment-line)",
                      color: "var(--color-text-headline)",
                    }
              }
            >
              <span aria-hidden="true">{r.emoji}</span>
              {r.label}
              <span
                className="ml-0.5 rounded-full px-1.5 text-[12px] font-bold"
                style={{
                  background: active ? "rgba(240,230,200,0.22)" : "rgba(201,162,39,0.16)",
                  color: active ? "var(--color-text-on-forest)" : "var(--color-brass-line)",
                }}
              >
                {countByRegion[r.key]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* 작성 폼 */}
        <form
          onSubmit={handleSubmit}
          className="expedition-panel p-6 sm:p-7 lg:sticky lg:top-24"
          aria-label={`${activeRegion.label} 방명록 작성`}
        >
          <h2
            className="flex items-center gap-2 text-lg font-bold"
            style={{ color: "var(--color-text-headline)" }}
          >
            <MapPin size={18} aria-hidden="true" style={{ color: "var(--color-brass-line)" }} />
            {activeRegion.emoji} {activeRegion.label}에 글 남기기
          </h2>

          <label
            className="mt-5 block text-sm font-semibold"
            style={{ color: "var(--color-text-body-muted)" }}
            htmlFor="gb-nickname"
          >
            닉네임
          </label>
          <input
            id="gb-nickname"
            type="text"
            value={nickname}
            maxLength={MAX_NAME}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="여행자 이름"
            className="mt-1.5 w-full rounded-[8px] border px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[var(--color-brass-500)]"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-parchment-line)",
              color: "var(--color-text-headline)",
            }}
          />

          <div className="mt-4 flex items-center justify-between">
            <label
              className="block text-sm font-semibold"
              style={{ color: "var(--color-text-body-muted)" }}
              htmlFor="gb-message"
            >
              메시지
            </label>
            <span className="text-xs" style={{ color: "var(--color-text-body-muted)" }}>
              {message.length}/{MAX_MESSAGE}
            </span>
          </div>
          <textarea
            id="gb-message"
            value={message}
            maxLength={MAX_MESSAGE}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`${activeRegion.label} 여행은 어땠나요? 추천 장소나 팁을 남겨주세요.`}
            rows={4}
            className="mt-1.5 w-full resize-none rounded-[8px] border px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition-colors focus:border-[var(--color-brass-500)]"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-parchment-line)",
              color: "var(--color-text-headline)",
            }}
          />

          <Button type="submit" variant="primary" size="md" disabled={!canSubmit} className="mt-5 w-full">
            방명록 남기기
          </Button>
        </form>

        {/* 방명록 목록 */}
        <section aria-label={`${activeRegion.label} 방명록 목록`}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text-headline)" }}>
              {activeRegion.label} 방명록
            </h2>
            <span className="text-sm" style={{ color: "var(--color-text-body-muted)" }}>
              총 {regionEntries.length}개
            </span>
          </div>

          {regionEntries.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[12px] border border-dashed px-6 py-16 text-center"
              style={{ borderColor: "var(--color-parchment-line)", background: "rgba(245,240,225,0.5)" }}
            >
              <MessageSquareText
                size={36}
                strokeWidth={1.4}
                aria-hidden="true"
                style={{ color: "var(--color-brass-line)", opacity: 0.7 }}
              />
              <p className="mt-3 font-semibold" style={{ color: "var(--color-text-headline)" }}>
                아직 {activeRegion.label} 방명록이 없어요
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-body-muted)" }}>
                첫 번째 이야기를 남겨보세요!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {regionEntries.map((entry) => (
                <li key={entry.id} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                          background: "var(--color-forest-800)",
                          color: "var(--color-text-on-forest)",
                        }}
                        aria-hidden="true"
                      >
                        {entry.nickname.slice(0, 1)}
                      </span>
                      <div>
                        <p className="font-bold leading-tight" style={{ color: "var(--color-text-headline)" }}>
                          {entry.nickname}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-body-muted)" }}>
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[rgba(169,91,54,0.12)]"
                      style={{ color: "var(--color-text-body-muted)" }}
                      aria-label="방명록 삭제"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <p
                    className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed"
                    style={{ color: "var(--color-text-headline)" }}
                  >
                    {entry.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
