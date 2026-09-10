import { supabase } from "./supabase";

export type GuestbookEntry = {
  id: string;
  sido: string;
  user_id: string;
  author_name: string;
  message: string;
  created_at: string;
};

const TABLE = "guestbook_entries";

/** 해당 시·도 방명록을 최신순으로 읽는다 — 로그인 없이도 읽기는 열려 있다 */
export async function fetchEntries(sido: string): Promise<GuestbookEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, sido, user_id, author_name, message, created_at")
    .eq("sido", sido)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as GuestbookEntry[];
}

/** 글쓰기는 로그인 필요 — RLS가 authenticated 역할만 통과시킨다 */
export async function addEntry(
  sido: string,
  message: string,
  authorName: string,
): Promise<GuestbookEntry> {
  if (!supabase) throw new Error("방명록이 아직 연결되지 않았습니다.");
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("로그인이 필요합니다.");

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ sido, message, author_name: authorName, user_id: uid })
    .select("id, sido, user_id, author_name, message, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data as GuestbookEntry;
}

/** 자기 글만 지울 수 있다 — 실제 권한 판정은 RLS가 한다 */
export async function deleteEntry(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
