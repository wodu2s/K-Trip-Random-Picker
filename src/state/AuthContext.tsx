import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { AuthUser } from "../types/community";

/** 로그인/회원가입 결과. 성공 여부와 화면에 띄울 메시지를 함께 넘긴다. */
export type AuthResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  /** 저장된 세션 복구가 끝나기 전 true */
  loading: boolean;
  /** Supabase 환경변수가 설정되어 로그인·방명록을 쓸 수 있는지 */
  configured: boolean;
  /** 로그인 모달 열림 여부 */
  loginOpen: boolean;
  /** 모달 상단에 띄울 안내 문구 (방명록 작성 등에서 전달) */
  loginReason: string;
  openLogin: (reason?: string) => void;
  closeLogin: () => void;
  signIn: (userId: string, password: string) => Promise<AuthResult>;
  signUp: (userId: string, password: string, nickname: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 아이디만으로 가입·로그인하기 위해 Supabase Auth(이메일 기반) 뒤에서 쓰는 가짜 이메일 도메인.
 * 실제로 메일을 보내지 않으므로 Supabase 프로젝트의 Authentication > Providers > Email에서
 * "Confirm email"을 꺼둬야 가입 즉시 로그인된다.
 */
const ID_EMAIL_DOMAIN = "users.pickandgo.app";

/** 아이디(4~20자, 영문/숫자/밑줄)를 내부용 이메일로 바꾼다 */
function idToEmail(userId: string): string {
  return `${userId.trim().toLowerCase()}@${ID_EMAIL_DOMAIN}`;
}

export const USER_ID_PATTERN = /^[a-zA-Z0-9_]{4,20}$/;

/** Supabase 영문 에러를 한국어 안내로 바꾼다. */
function toKoreanAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "아이디 또는 비밀번호가 올바르지 않습니다.";
  if (m.includes("user already registered")) return "이미 사용 중인 아이디입니다.";
  if (m.includes("password should be at least")) return "비밀번호는 6자 이상이어야 합니다.";
  if (
    m.includes("invalid email") ||
    m.includes("unable to validate email") ||
    (m.includes("email") && m.includes("invalid"))
  ) {
    return "아이디 형식이 올바르지 않아요. 영문/숫자 4~20자로 다시 시도해 주세요.";
  }
  if (m.includes("email not confirmed")) {
    return "아직 로그인할 수 없는 계정이에요. 관리자에게 문의해 주세요.";
  }
  if (m.includes("rate limit")) {
    return "요청이 너무 많아요. 몇 분 후 다시 시도해 주세요.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "네트워크 오류로 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
  return message;
}

/** 세션에서 화면에 필요한 값만 추린다. */
function toAuthUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const { id, email, user_metadata: meta } = session.user;
  const nickname =
    (typeof meta?.nickname === "string" && meta.nickname) || email?.split("@")[0] || "여행자";
  return { id, email: email ?? "", nickname };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("");

  // 새로고침 후에도 로그인이 유지되도록 저장된 세션을 복구하고 이후 변경을 구독한다.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toAuthUser(data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const openLogin = useCallback((reason = "") => {
    setLoginReason(reason);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setLoginReason("");
  }, []);

  const signIn = useCallback(async (userId: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Supabase가 설정되지 않았습니다." };
    const { error } = await supabase.auth.signInWithPassword({
      email: idToEmail(userId),
      password,
    });
    if (error) return { ok: false, message: toKoreanAuthError(error.message) };
    setLoginOpen(false);
    setLoginReason("");
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (userId: string, password: string, nickname: string): Promise<AuthResult> => {
      if (!supabase) return { ok: false, message: "Supabase가 설정되지 않았습니다." };
      if (!USER_ID_PATTERN.test(userId)) {
        return { ok: false, message: "아이디는 영문/숫자 4~20자로 입력해 주세요." };
      }

      // 비밀번호는 Supabase Auth 가 서버에서 해시해 저장한다. 앱은 보관하지 않는다.
      // 아이디만으로 가입받기 위해 내부적으로만 가짜 이메일을 만들어 Supabase Auth에 넘긴다.
      const { data, error } = await supabase.auth.signUp({
        email: idToEmail(userId),
        password,
        options: { data: { nickname, userId } },
      });

      if (error) return { ok: false, message: toKoreanAuthError(error.message) };

      // 가짜 이메일은 확인 메일을 받을 수 없으므로, Supabase 프로젝트의
      // Authentication > Providers > Email에서 "Confirm email"이 꺼져 있어야
      // 가입 즉시 session이 생겨 바로 로그인된다.
      if (!data.session) {
        return {
          ok: false,
          message:
            "가입은 됐지만 바로 로그인이 안 돼요. Supabase 프로젝트의 이메일 확인(Confirm email) 설정을 꺼주세요.",
        };
      }
      setLoginOpen(false);
      setLoginReason("");
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured,
      loginOpen,
      loginReason,
      openLogin,
      closeLogin,
      signIn,
      signUp,
      logout,
    }),
    [user, loading, loginOpen, loginReason, openLogin, closeLogin, signIn, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
