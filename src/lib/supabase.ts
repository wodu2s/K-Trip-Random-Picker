import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/**
 * 키가 없으면 null — 지도(VITE_KAKAO_MAP_JS_KEY)와 같은 방식으로 조용히 비활성화한다.
 * 랜덤여행 흐름은 Supabase 없이도 그대로 동작해야 하므로 여기서 throw 하지 않는다.
 */
export const supabase: SupabaseClient | null =
  URL && ANON_KEY ? createClient(URL, ANON_KEY) : null;

export const isAuthEnabled = supabase !== null;
