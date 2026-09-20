import { SIDO_SHORT } from "../api/mappers";
import { supabase } from "./supabase";

/**
 * 지역별 방명록.
 * 분류 키는 TourAPI 주소(addr1)로 만든 destination.region의 시·도 부분을 그대로 쓴다.
 * (예: "강원 속초시" → "강원") — 시군구는 이번 단계에서 나누지 않는다.
 */
export type GuestbookEntry = {
  id: string;
  /** 작성자 (auth.users.id). 수정·삭제 권한 판단 기준 */
  userId: string;
  /** 시·도 축약 표기 (서울 · 부산 · 제주 · 강원 · 경기 …) */
  region: string;
  /** 이 후기가 남겨진 구체적인 추천 여행지 */
  destinationId: string;
  destinationName: string;
  nickname: string;
  content: string;
  /** ISO 문자열 */
  createdAt: string;
  updatedAt: string;
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

/** 입력 제한 — 서버 검증도 같은 값을 쓴다 (supabase/schema.sql 참고) */
export const MAX_CONTENT = 200;

function requireClient() {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  return supabase;
}

type ReviewRow = {
  id: string;
  user_id: string;
  destination_id: string;
  destination_name: string;
  region: string;
  nickname: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function toEntry(row: ReviewRow): GuestbookEntry {
  return {
    id: row.id,
    userId: row.user_id,
    region: row.region,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    nickname: row.nickname,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 해당 시·도 글을 최신순으로. 비로그인 사용자도 조회할 수 있다. */
export async function listEntries(region: string, limit = 50): Promise<GuestbookEntry[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("reviews")
    .select("*")
    .eq("region", region)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as ReviewRow[]).map(toEntry);
}

/** 후기 작성. user_id 는 RLS(auth.uid() = user_id)로 검증되므로 다른 사람 이름으로는 쓸 수 없다. */
export async function addEntry(input: {
  region: string;
  destinationId: string;
  destinationName: string;
  userId: string;
  nickname: string;
  content: string;
}): Promise<GuestbookEntry> {
  const content = input.content.trim();
  const nickname = input.nickname.trim();
  if (!content || !nickname) throw new Error("닉네임과 내용을 모두 입력해 주세요.");

  const client = requireClient();
  const { data, error } = await client
    .from("reviews")
    .insert({
      user_id: input.userId,
      destination_id: input.destinationId,
      destination_name: input.destinationName,
      region: input.region,
      nickname,
      content: content.slice(0, MAX_CONTENT),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toEntry(data as ReviewRow);
}

/** 후기 수정. RLS가 작성자 본인만 허용한다. */
export async function updateEntry(entryId: string, content: string): Promise<GuestbookEntry> {
  const client = requireClient();
  const trimmed = content.trim();
  if (!trimmed) throw new Error("내용을 입력해 주세요.");

  const { data, error } = await client
    .from("reviews")
    .update({ content: trimmed.slice(0, MAX_CONTENT) })
    .eq("id", entryId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  // RLS 로 막히면 error 없이 0행이 돌아온다.
  if (!data) throw new Error("수정 권한이 없거나 후기를 찾을 수 없습니다.");
  return toEntry(data as ReviewRow);
}

/** 후기 삭제. RLS가 작성자 본인만 허용한다. */
export async function deleteEntry(entryId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("reviews").delete().eq("id", entryId);
  if (error) throw new Error(error.message);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
