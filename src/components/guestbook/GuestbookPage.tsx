import { useCallback, useEffect, useState } from "react";
import { Loader2, LogIn, MapPin, Trash2 } from "lucide-react";
import { SIDO_LIST } from "../../api/mappers";
import { useAuth } from "../../state/AuthContext";
import {
  addEntry,
  deleteEntry,
  fetchEntries,
  type GuestbookEntry,
} from "../../lib/guestbook";
import "./guestbook.css";

const MAX_LEN = 200;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function GuestbookPage() {
  const { user, enabled, displayName, signInWithKakao } = useAuth();
  const [sido, setSido] = useState(SIDO_LIST[0] ?? "서울");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async (target: string) => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      setEntries(await fetchEntries(target));
    } catch (e) {
      setError(e instanceof Error ? e.message : "방명록을 불러오지 못했습니다.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load(sido);
  }, [sido, load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message || posting) return;
    setPosting(true);
    setError("");
    try {
      const created = await addEntry(sido, message, displayName);
      setEntries((prev) => [created, ...prev]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <div className="guestbook">
      <div className="guestbook__inner">
        <header className="guestbook__head">
          <p className="guestbook__eyebrow">PICK &amp; GO · GUESTBOOK</p>
          <h1 className="guestbook__title">지역 방명록</h1>
          <p className="guestbook__sub">
            다녀온 지역에 한 줄 남겨주세요. 읽는 건 누구나, 남기는 건 로그인한 여행자만.
          </p>
        </header>

        <nav className="guestbook__regions" aria-label="시·도 선택">
          {SIDO_LIST.map((name) => (
            <button
              key={name}
              type="button"
              className="guestbook__region"
              aria-pressed={name === sido}
              onClick={() => setSido(name)}
            >
              {name}
            </button>
          ))}
        </nav>

        <section className="guestbook__panel" aria-live="polite">
          <h2 className="guestbook__panel-title">
            <MapPin size={16} strokeWidth={2} aria-hidden="true" />
            {sido}
          </h2>

          {!enabled ? (
            <p className="guestbook__notice">
              방명록 서버가 아직 연결되지 않았습니다. Supabase 환경변수를 설정하면 켜집니다.
            </p>
          ) : (
            <>
              {user ? (
                <form className="guestbook__form" onSubmit={handleSubmit}>
                  <textarea
                    className="guestbook__input"
                    value={draft}
                    maxLength={MAX_LEN}
                    rows={3}
                    placeholder={`${sido}에서의 여행은 어땠나요?`}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="guestbook__form-foot">
                    <span className="guestbook__count">
                      {draft.length} / {MAX_LEN}
                    </span>
                    <button
                      type="submit"
                      className="guestbook__submit"
                      disabled={!draft.trim() || posting}
                    >
                      {posting ? "등록 중…" : "남기기"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="guestbook__gate">
                  <p>글을 남기려면 로그인이 필요합니다.</p>
                  <button
                    type="button"
                    className="guestbook__login"
                    onClick={() => void signInWithKakao()}
                  >
                    <LogIn size={16} strokeWidth={2} aria-hidden="true" />
                    카카오로 로그인
                  </button>
                </div>
              )}

              {error ? <p className="guestbook__error">{error}</p> : null}

              {loading ? (
                <p className="guestbook__notice">
                  <Loader2 size={16} className="guestbook__spin" aria-hidden="true" />
                  불러오는 중…
                </p>
              ) : entries.length === 0 ? (
                <p className="guestbook__notice">
                  아직 {sido} 방명록이 비어 있습니다. 첫 글을 남겨보세요.
                </p>
              ) : (
                <ul className="guestbook__list">
                  {entries.map((entry) => (
                    <li key={entry.id} className="guestbook__item">
                      <div className="guestbook__item-head">
                        <span className="guestbook__author">{entry.author_name}</span>
                        <span className="guestbook__date">{formatDate(entry.created_at)}</span>
                        {user?.id === entry.user_id ? (
                          <button
                            type="button"
                            className="guestbook__delete"
                            aria-label="내 글 삭제"
                            onClick={() => void handleDelete(entry.id)}
                          >
                            <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                      <p className="guestbook__message">{entry.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
