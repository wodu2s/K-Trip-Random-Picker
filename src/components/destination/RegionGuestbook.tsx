import { useEffect, useRef, useState } from "react";
import { Compass, MapPin, Plus, X } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import {
  addEntry,
  formatDate,
  listEntries,
  sidoOf,
  MAX_CONTENT,
  type GuestbookEntry,
} from "../../lib/guestbook";

/** 접힘 상태에서 보여줄 글 수 — 결과 페이지 흐름을 밀어내지 않을 만큼만 */
const PREVIEW = 3;

/** 목적지가 속한 시·도의 방명록. 조회는 누구나, 작성은 로그인 사용자만. */
export function RegionGuestbook({ region }: { region: string }) {
  const { user, loginOpen, openLogin } = useAuth();
  const sido = sidoOf(region);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [content, setContent] = useState("");
  const [writing, setWriting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  /** 로그인 유도 후 돌아왔을 때 작성폼을 바로 열기 위한 표식 */
  const pendingWrite = useRef(false);

  useEffect(() => {
    if (!sido) return;
    let alive = true;
    setContent("");
    setWriting(false);
    setExpanded(false);
    void listEntries(sido).then((list) => {
      if (alive) setEntries(list);
    });
    return () => {
      alive = false;
    };
  }, [sido]);

  /* 로그인을 마치면 누르려던 작성폼을 이어서 열고, 그냥 닫았으면 표식을 지운다 */
  useEffect(() => {
    if (!pendingWrite.current) return;
    if (user) {
      pendingWrite.current = false;
      setWriting(true);
    } else if (!loginOpen) {
      pendingWrite.current = false;
    }
  }, [user, loginOpen]);

  if (!sido) return null;

  function handleWriteClick() {
    if (!user) {
      pendingWrite.current = true;
      openLogin(`${sido} 여행 방명록에 글을 남기려면 로그인이 필요해요.`);
      return;
    }
    setWriting((v) => !v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !sido || !content.trim()) return;
    await addEntry({ region: sido, nickname: user.nickname, content });
    setEntries(await listEntries(sido));
    setContent("");
    setWriting(false);
  }

  const shown = expanded ? entries : entries.slice(0, PREVIEW);

  return (
    <section className="dsn-gb" aria-labelledby="guestbook-title">
      <div className="dossier-wrap dsn-gb__inner">
        <div className="dsn-gb__head">
          <div className="dsn-gb__heading">
            <p className="dsn-gb__eyebrow">
              <MapPin className="h-[13px] w-[13px]" strokeWidth={2.2} aria-hidden="true" />
              REGION LOG
            </p>
            <h2 className="dsn-gb__title" id="guestbook-title">
              {sido} 여행 방명록
            </h2>
            <p className="dsn-gb__desc">이곳을 다녀간 여행자들의 이야기를 남겨보세요.</p>
          </div>
          <div className="dsn-gb__actions">
            <p className="dsn-gb__count">글 {entries.length}개</p>
            <button
              type="button"
              className={writing ? "dsn-gb__write is-active" : "dsn-gb__write"}
              onClick={handleWriteClick}
            >
              {writing ? (
                <X className="h-[15px] w-[15px]" strokeWidth={2.4} aria-hidden="true" />
              ) : (
                <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} aria-hidden="true" />
              )}
              {writing ? "닫기" : "여행 기록 남기기"}
            </button>
          </div>
        </div>
        <div className="dsn-gb__rule" aria-hidden="true" />

        {writing && user ? (
          <form className="dsn-gb__form" onSubmit={handleSubmit}>
            <textarea
              className="dsn-gb__input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CONTENT}
              rows={2}
              placeholder={`${sido} 여행에서 좋았던 순간을 남겨주세요.`}
              aria-label="방명록 내용"
              required
            />
            <div className="dsn-gb__formfoot">
              <span className="dsn-gb__who">
                {user.nickname} · {content.length}/{MAX_CONTENT}
              </span>
              <button type="submit" className="dsn-gb__submit" disabled={!content.trim()}>
                남기기
              </button>
            </div>
          </form>
        ) : null}

        <div className="dsn-gb__panel">
          {entries.length === 0 ? (
            <p className="dsn-gb__empty">
              <Compass className="h-[16px] w-[16px]" strokeWidth={1.8} aria-hidden="true" />
              아직 {sido} 방명록이 비어 있어요. 첫 이야기를 남겨보세요.
            </p>
          ) : (
            <ul className="dsn-gb__list">
              {shown.map((e) => (
                <li key={e.id} className="dsn-gb__item">
                  <span className="dsn-gb__avatar" aria-hidden="true">
                    {e.nickname.slice(0, 1)}
                  </span>
                  <div className="dsn-gb__body">
                    <p className="dsn-gb__meta">
                      <span className="dsn-gb__nick">{e.nickname}</span>
                      <span className="dsn-gb__date">{formatDate(e.createdAt)}</span>
                    </p>
                    <p className="dsn-gb__text">{e.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > PREVIEW ? (
          <button
            type="button"
            className="dsn-gb__more"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "접기" : `방명록 더 보기 (${entries.length - PREVIEW})`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
