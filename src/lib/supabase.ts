import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * 환경변수가 없으면 client 를 만들지 않는다.
 * 랜덤 추천·여행지 조회는 Supabase 없이도 동작해야 하므로 여기서 throw 하지 않고,
 * null 을 돌려준 뒤 각 화면에서 설정 안내 문구를 띄운다.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

/** 로그인·방명록·저장 기능을 쓸 수 있는 상태인지 */
export const isSupabaseConfigured = supabase !== null;

/** Supabase 미설정 시 공통 안내 문구 */
export const SUPABASE_SETUP_MESSAGE =
  ".env 파일에 VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 를 설정하면 로그인과 방명록을 사용할 수 있어요.";
