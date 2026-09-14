import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../state/AuthContext";

/** 닉네임만 받는 로그인 모달. Esc·포커스 처리는 네이티브 <dialog>에 맡긴다. */
export function LoginModal() {
  const { loginOpen, loginReason, login, closeLogin } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (loginOpen && !el.open) el.showModal();
    if (!loginOpen && el.open) el.close();
    if (loginOpen) setNickname("");
  }, [loginOpen]);

  return (
    <dialog
      ref={ref}
      className="pickgo-dialog"
      aria-label="로그인"
      onClose={closeLogin}
      onCancel={closeLogin}
    >
      <form
        method="dialog"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          login(nickname);
        }}
      >
        <h2 className="text-[19px] font-bold text-[#F7F3E9]">로그인</h2>
        <p className="text-[13.5px] leading-relaxed text-[#F7F3E9]/65">
          {loginReason || "닉네임으로 간편하게 시작하세요. 랜덤 여행은 로그인 없이도 모두 이용할 수 있어요."}
        </p>
        <label className="mt-1 text-[13px] font-semibold text-[#C9A227]" htmlFor="pickgo-nickname">
          닉네임
        </label>
        <input
          id="pickgo-nickname"
          className="h-11 rounded-[10px] border border-[rgba(201,162,39,0.4)] bg-[rgba(255,255,255,0.06)] px-3 text-[15px] text-[#F7F3E9] outline-none focus:border-[#C9A227]"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="예: 바다보는사람"
          autoComplete="nickname"
          required
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="h-11 flex-1 rounded-[10px] border border-[rgba(255,255,255,0.28)] text-[15px] font-semibold text-[#F7F3E9]/85"
            onClick={closeLogin}
          >
            취소
          </button>
          <button
            type="submit"
            className="h-11 flex-1 rounded-[10px] bg-[#C9A227] text-[15px] font-bold text-[#1A1204] disabled:opacity-50"
            disabled={!nickname.trim()}
          >
            시작하기
          </button>
        </div>
      </form>
    </dialog>
  );
}
