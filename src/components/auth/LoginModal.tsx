import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../state/AuthContext";
import { SUPABASE_SETUP_MESSAGE } from "../../lib/supabase";

type Mode = "signin" | "signup";

const FIELD_CLASS =
  "h-11 rounded-[10px] border border-[rgba(201,162,39,0.4)] bg-[rgba(255,255,255,0.06)] px-3 " +
  "text-[15px] text-[#F7F3E9] outline-none focus:border-[#C9A227]";

/** 아이디 · 비밀번호 로그인 / 회원가입 모달. 랜덤 여행은 로그인 없이도 모두 이용할 수 있다. */
export function LoginModal() {
  const { loginOpen, loginReason, signIn, signUp, closeLogin, configured } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (loginOpen && !el.open) el.showModal();
    if (!loginOpen && el.open) el.close();
    if (loginOpen) {
      setUserId("");
      setPassword("");
      setNickname("");
      setError("");
      setSubmitting(false);
      setMode("signin");
    }
  }, [loginOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!userId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    if (mode === "signup" && !/^[a-zA-Z0-9_]{4,20}$/.test(userId.trim())) {
      setError("아이디는 영문/숫자/밑줄 4~20자로 입력해 주세요.");
      return;
    }
    if (mode === "signup" && !nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "signin"
        ? await signIn(userId.trim(), password)
        : await signUp(userId.trim(), password, nickname.trim());
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? "요청에 실패했습니다.");
      return;
    }
    // 로그인/가입 성공 시 signIn·signUp 내부에서 모달을 닫는다.
  }

  return (
    <dialog
      ref={ref}
      className="pickgo-dialog"
      aria-label={mode === "signin" ? "로그인" : "회원가입"}
      onClose={closeLogin}
      onCancel={closeLogin}
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <h2 className="text-[19px] font-bold text-[#F7F3E9]">
          {mode === "signin" ? "로그인" : "회원가입"}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-[#F7F3E9]/65">
          {loginReason || "방명록 작성과 장소 저장에 필요해요. 랜덤 여행은 로그인 없이도 모두 이용할 수 있어요."}
        </p>

        {!configured ? (
          <p className="rounded-[10px] border border-[rgba(232,150,80,0.4)] bg-[rgba(232,150,80,0.1)] p-3 text-[13.5px] leading-relaxed text-[#F7F3E9]">
            {SUPABASE_SETUP_MESSAGE}
          </p>
        ) : (
          <>
            {mode === "signup" ? (
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-[#C9A227]" htmlFor="pickgo-nickname">
                  닉네임
                </label>
                <input
                  id="pickgo-nickname"
                  className={FIELD_CLASS}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  autoComplete="nickname"
                  placeholder="예: 바다보는사람"
                  required
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#C9A227]" htmlFor="pickgo-userid">
                아이디
              </label>
              <input
                id="pickgo-userid"
                className={FIELD_CLASS}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                maxLength={20}
                autoComplete="username"
                placeholder="영문/숫자 4~20자"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-[#C9A227]" htmlFor="pickgo-password">
                비밀번호
              </label>
              <input
                id="pickgo-password"
                type="password"
                className={FIELD_CLASS}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="6자 이상"
                required
              />
            </div>

            {error ? (
              <p role="alert" className="text-[13px] font-medium text-[#F09A6C]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-1 h-11 rounded-[10px] bg-[#C9A227] text-[15px] font-bold text-[#1A1204] disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "처리 중…" : mode === "signin" ? "로그인" : "회원가입"}
            </button>
            <button
              type="button"
              className="text-[13px] font-semibold text-[#F7F3E9]/70 underline-offset-2 hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
              }}
            >
              {mode === "signin" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
            </button>
          </>
        )}

        <button
          type="button"
          className="h-11 rounded-[10px] border border-[rgba(255,255,255,0.28)] text-[15px] font-semibold text-[#F7F3E9]/85"
          onClick={closeLogin}
        >
          닫기
        </button>
      </form>
    </dialog>
  );
}
