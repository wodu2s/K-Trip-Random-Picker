import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type User = { nickname: string };

type AuthContextValue = {
  user: User | null;
  /** 로그인 모달 열림 여부 */
  loginOpen: boolean;
  /** 모달 상단에 띄울 안내 문구 (방명록 작성 등에서 전달) */
  loginReason: string;
  login: (nickname: string) => void;
  logout: () => void;
  openLogin: (reason?: string) => void;
  closeLogin: () => void;
};

// ponytail: 닉네임만 localStorage에 두는 임시 로그인.
// 실제 인증(소셜 로그인·세션·비밀번호)은 백엔드가 생기면 login/logout 내부만 교체한다.
const KEY = "pickgo.user.v1";

function readUser(): User | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.nickname ? { nickname: String(parsed.nickname) } : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("");

  const login = useCallback((nickname: string) => {
    const next = { nickname: nickname.trim() };
    if (!next.nickname) return;
    setUser(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 저장 실패해도 현재 세션은 로그인 상태로 둔다 */
    }
    setLoginOpen(false);
    setLoginReason("");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* 무시 */
    }
  }, []);

  const openLogin = useCallback((reason = "") => {
    setLoginReason(reason);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setLoginReason("");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loginOpen, loginReason, login, logout, openLogin, closeLogin }),
    [user, loginOpen, loginReason, login, logout, openLogin, closeLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
