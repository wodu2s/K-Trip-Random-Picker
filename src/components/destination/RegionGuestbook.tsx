import { useEffect, useRef, useState } from "react";
import { Compass, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "../../lib/supabase";
import {
  addEntry,
  deleteEntry,
  formatDate,
  listEntries,
  sidoOf,
  updateEntry,
  MAX_CONTENT,
  type GuestbookEntry,
} from "../../lib/guestbook";
import type { Destination } from "../../types/travel";

/** 접힘 상태에서 보여줄 글 수 — 결과 페이지 흐름을 밀어내지 않을 만큼만 */
const PREVIEW = 3;

/** 목적지가 속한 시·도의 방명록. 조회는 누구나, 작성·수정·삭제는 로그인 사용자(본인 글)만. */
export function RegionGuestbook({ destination }: { destination: Pick<Destination, "id" | "name" | "region"> }) {
  const { user, loginOpen, openLogin } = useAuth();
  const sido = sidoOf(destination.region);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [content, setContent] = useState("");
  const [writing, setWriting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [formError, setFormError] = useState("");
  /** 로그인 유도 후 돌아왔을 때 작성폼을 바로 열기 위한 표식 */
  const pendingWrite = useRef(false);

  const load = useRef(async (region: string) => {
    setStatus("loading");
    try {
      setEntries(await listEntries(region));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  });

  useEffect(() => {
    if (!sido || !isSupabaseConfigured) return;
    let alive = true;
    setContent("");
    setWriting(false);
    setExpanded(false);
    setEditingId(null);
    void load.current(sido).then(() => {
      if (!alive) return;
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
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !sido || !content.trim() || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      await addEntry({
        region: sido,
        destinationId: destination.id,
        destinationName: destination.name,
        userId: user.id,
        nickname: user.nickname,
        content,
      });
      await load.current(sido);
      setContent("");
      setWriting(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "후기 등록에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(entry: GuestbookEntry) {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setFormError("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editContent.trim() || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      await updateEntry(editingId, editContent);
      await load.current(sido!);
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await deleteEntry(entryId);
      await load.current(sido!);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "삭제에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
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
          {isSupabaseConfigured ? (
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
          ) : null}
        </div>
        <div className="dsn-gb__rule" aria-hidden="true" />

        {!isSupabaseConfigured ? (
          <p className="dsn-gb__empty">
            <Compass className="h-[16px] w-[16px]" strokeWidth={1.8} aria-hidden="true" />
            {SUPABASE_SETUP_MESSAGE}
          </p>
        ) : (
          <>
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
                  <button type="submit" className="dsn-gb__submit" disabled={!content.trim() || submitting}>
                    {submitting ? "등록 중…" : "남기기"}
                  </button>
                </div>
                {formError ? <p className="dsn-gb__error">{formError}</p> : null}
              </form>
            ) : null}

            <div className="dsn-gb__panel">
              {status === "loading" ? (
                <p className="dsn-gb__empty">
                  <Compass className="h-[16px] w-[16px] animate-spin" strokeWidth={1.8} aria-hidden="true" />
                  방명록을 불러오는 중이에요…
                </p>
              ) : status === "error" ? (
                <p className="dsn-gb__empty">
                  <Compass className="h-[16px] w-[16px]" strokeWidth={1.8} aria-hidden="true" />
                  방명록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
              ) : entries.length === 0 ? (
                <p className="dsn-gb__empty">
                  <Compass className="h-[16px] w-[16px]" strokeWidth={1.8} aria-hidden="true" />
                  아직 {sido} 방명록이 비어 있어요. 첫 이야기를 남겨보세요.
                </p>
              ) : (
                <ul className="dsn-gb__list">
                  {shown.map((entry) => {
                    const mine = user?.id === entry.userId;
                    return (
                      <li key={entry.id} className="dsn-gb__item">
                        <span className="dsn-gb__avatar" aria-hidden="true">
                          {entry.nickname.slice(0, 1)}
                        </span>
                        <div className="dsn-gb__body">
                          <p className="dsn-gb__meta">
                            <span className="dsn-gb__nick">{entry.nickname}</span>
                            <span className="dsn-gb__date">
                              {formatDate(entry.createdAt)}
                              {entry.updatedAt !== entry.createdAt ? " (수정됨)" : ""}
                            </span>
                          </p>
                          {entry.destinationName ? (
                            <p className="dsn-gb__place">
                              <MapPin className="h-3 w-3" strokeWidth={2.2} aria-hidden="true" />
                              {entry.destinationName}
                            </p>
                          ) : null}

                          {editingId === entry.id ? (
                            <form className="dsn-gb__form" onSubmit={handleUpdate}>
                              <textarea
                                className="dsn-gb__input"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                maxLength={MAX_CONTENT}
                                rows={2}
                                required
                              />
                              <div className="dsn-gb__formfoot">
                                <button
                                  type="button"
                                  className="dsn-gb__write"
                                  onClick={() => setEditingId(null)}
                                >
                                  취소
                                </button>
                                <button
                                  type="submit"
                                  className="dsn-gb__submit"
                                  disabled={!editContent.trim() || submitting}
                                >
                                  저장
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="dsn-gb__text">{entry.content}</p>
                          )}

                          {mine && editingId !== entry.id ? (
                            <div className="dsn-gb__owner-actions">
                              <button
                                type="button"
                                className="dsn-gb__icon-btn"
                                onClick={() => startEdit(entry)}
                                aria-label="후기 수정"
                              >
                                <Pencil className="h-[13px] w-[13px]" strokeWidth={2.2} aria-hidden="true" />
                                수정
                              </button>
                              <button
                                type="button"
                                className="dsn-gb__icon-btn"
                                onClick={() => handleDelete(entry.id)}
                                aria-label="후기 삭제"
                                disabled={submitting}
                              >
                                <Trash2 className="h-[13px] w-[13px]" strokeWidth={2.2} aria-hidden="true" />
                                삭제
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
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
          </>
        )}
      </div>
    </section>
  );
}
