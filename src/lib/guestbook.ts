import { SIDO_SHORT } from "../api/mappers";

/**
 * 지역별 방명록.
 * 분류 키는 TourAPI 주소(addr1)로 만든 destination.region의 시·도 부분을 그대로 쓴다.
 * (예: "강원 속초시" → "강원") — 시군구는 이번 단계에서 나누지 않는다.
 */
export type GuestbookEntry = {
  id: string;
  /** 시·도 축약 표기 (서울 · 부산 · 제주 · 강원 · 경기 …) */
  region: string;
  nickname: string;
  content: string;
  /** ISO 문자열 */
  createdAt: string;
};

/** mappers.ts가 쓰는 축약 표기 집합 — 별도 지역 목록을 만들지 않는다 */
const SIDO = new Set(Object.values(SIDO_SHORT));

/**
 * "강원 속초시" → "강원", "강원특별자치도 속초시 ..." → "강원".
 * 백엔드(/api/recommend)는 addr1 원문을, 프런트 프록시 경로는 축약형을 주므로 둘 다 받는다.
 * 알 수 없는 주소면 null.
 */
export function sidoOf(region?: string | null): string | null {
  const head = (region ?? "").trim().split(/\s+/)[0] ?? "";
  if (SIDO_SHORT[head]) return SIDO_SHORT[head];
  return SIDO.has(head) ? head : null;
}

/* ── 공개 인터페이스 ──────────────────────────────────
   호출부(RegionGuestbook)는 아래 두 함수만 쓴다. 둘 다 Promise를 돌려주므로
   서버 전환 시 본문만 fetch로 바꾸면 컴포넌트는 그대로 둘 수 있다.

   서버 전환 후:
     listEntries → GET  /api/guestbook?region=강원&limit=10
     addEntry    → POST /api/guestbook  { region, content }   (닉네임은 세션에서)
   ────────────────────────────────────────────────── */

/** 해당 시·도 글을 최신순으로 */
export async function listEntries(region: string, limit = 20): Promise<GuestbookEntry[]> {
  return readAll()
    .filter((e) => e.region === region)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function addEntry(input: {
  region: string;
  nickname: string;
  content: string;
}): Promise<GuestbookEntry> {
  const content = input.content.trim();
  const nickname = input.nickname.trim();
  if (!content || !nickname) throw new Error("닉네임과 내용을 모두 입력해 주세요.");

  const entry: GuestbookEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    region: input.region,
    nickname,
    content: content.slice(0, MAX_CONTENT),
    createdAt: new Date().toISOString(),
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

/** 입력 제한 — 서버 전환 시 같은 값으로 서버측 검증을 건다 */
export const MAX_CONTENT = 200;

/* ── 임시 저장소 (localStorage) ───────────────────────
   ponytail: 브라우저 1대 안에서만 공유된다. 위 두 함수 본문 외에는
   readAll/writeAll을 쓰는 곳이 없으므로 교체 범위가 이 블록으로 한정된다.
   ────────────────────────────────────────────────── */
const KEY = "pickgo.guestbook.v1";

function readAll(): GuestbookEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: GuestbookEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* 용량 초과 등은 무시하고 화면 상태만 유지 */
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
