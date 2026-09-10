import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isAuthEnabled, supabase } from "../lib/supabase";

type AuthContextValue = {
  user: User | null;
  /** 최초 세션 복원이 끝나기 전 true — 버튼 깜빡임을 막는다 */
  loading: boolean;
  /** Supabase 키가 없으면 false — 이때 로그인 UI는 숨긴다 */
  enabled: boolean;
  displayName: string;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** 카카오 프로필에서 표시 이름을 고른다 — 없으면 이메일 앞부분으로 폴백 */
function pickDisplayName(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const name =
    (meta.name as string) ||
    (meta.full_name as string) ||
    (meta.preferred_username as string) ||
    "";
  if (name) return name;
  return user.email ? user.email.split("@")[0]! : "여행자";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isAuthEnabled);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithKakao = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin,
        /*
         * Supabase 기본 scope에는 account_email·profile_image가 붙는다.
         * 이메일 동의항목은 비즈 앱 전환을 해야 설정할 수 있어 개인 개발자 앱에서는
         * KOE205로 막힌다. 방명록은 닉네임만 쓰므로 요청 범위를 그것만으로 줄인다.
         */
        scopes: "profile_nickname",
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      enabled: isAuthEnabled,
      displayName: pickDisplayName(user),
      signInWithKakao,
      signOut,
    }),
    [user, loading, signInWithKakao, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
