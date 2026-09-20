import { useEffect, useState } from "react";
import { Compass, MapPin, Trash2 } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import { useTravel } from "../../state/TravelContext";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "../../lib/supabase";
import { fetchSavedPlaces, removeSavedPlace } from "../../lib/savedPlacesApi";
import type { SavedPlace } from "../../types/community";

/** 로그인한 사용자가 저장한 장소 목록. 조회·삭제 모두 본인 것만 가능(RLS). */
export function SavedPlacesPage() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const { goToLanding } = useTravel();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    let alive = true;
    setStatus("loading");
    fetchSavedPlaces()
      .then((list) => {
        if (alive) {
          setPlaces(list);
          setStatus("idle");
        }
      })
      .catch(() => {
        if (alive) setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [user]);

  async function handleRemove(place: SavedPlace) {
    if (!user || removingId) return;
    setRemovingId(place.id);
    try {
      await removeSavedPlace(user.id, place.destinationId);
      setPlaces((prev) => prev.filter((p) => p.id !== place.id));
    } catch {
      /* 실패하면 목록은 그대로 두고 다음 시도를 기다린다 */
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div
      className="mx-auto min-h-[70vh] w-full max-w-[640px] px-5 py-10 sm:px-8"
      style={{ color: "var(--color-text-headline)" }}
    >
      <p
        className="text-[11px] font-bold tracking-[0.16em]"
        style={{ color: "var(--color-brass-500)" }}
      >
        MY PICK&amp;GO
      </p>
      <h1 className="mt-1 text-[26px] font-bold">저장한 장소</h1>

      {!isSupabaseConfigured ? (
        <p className="mt-6 rounded-[10px] border border-[rgba(43,35,24,0.2)] p-4 text-[14px] leading-relaxed">
          {SUPABASE_SETUP_MESSAGE}
        </p>
      ) : authLoading ? (
        <p className="mt-8 text-[14px] opacity-70">불러오는 중…</p>
      ) : !user ? (
        <div className="mt-8 rounded-[12px] border p-6 text-center" style={{ borderColor: "var(--color-parchment-line)" }}>
          <Compass className="mx-auto h-8 w-8 opacity-60" strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-3 text-[15px] font-semibold">로그인이 필요해요</p>
          <p className="mt-1 text-[13.5px] opacity-70">저장한 장소는 로그인한 사용자만 볼 수 있어요.</p>
          <button
            type="button"
            className="mt-4 h-11 rounded-[8px] px-6 text-[14px] font-bold"
            style={{ background: "var(--color-forest-800)", color: "var(--color-text-on-forest)" }}
            onClick={() => openLogin("저장한 장소를 보려면 로그인이 필요해요.")}
          >
            로그인 / 회원가입
          </button>
        </div>
      ) : status === "loading" ? (
        <p className="mt-8 text-[14px] opacity-70">불러오는 중…</p>
      ) : status === "error" ? (
        <p className="mt-8 text-[14px] opacity-70">목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      ) : places.length === 0 ? (
        <div className="mt-8 rounded-[12px] border p-6 text-center" style={{ borderColor: "var(--color-parchment-line)" }}>
          <Compass className="mx-auto h-8 w-8 opacity-60" strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-3 text-[15px] font-semibold">아직 저장한 장소가 없어요</p>
          <p className="mt-1 text-[13.5px] opacity-70">마음에 드는 여행지에서 '장소 저장'을 눌러보세요.</p>
          <button
            type="button"
            className="mt-4 h-11 rounded-[8px] px-6 text-[14px] font-bold"
            style={{ background: "var(--color-forest-800)", color: "var(--color-text-on-forest)" }}
            onClick={goToLanding}
          >
            여행 카드 뽑으러 가기
          </button>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {places.map((place) => (
            <li
              key={place.id}
              className="flex items-center gap-3 rounded-[12px] border p-3"
              style={{ borderColor: "var(--color-parchment-line)" }}
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-black/10">
                {place.image ? (
                  <img src={place.image} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[12px] font-semibold opacity-70">
                  <MapPin className="h-3 w-3 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                  <span className="truncate">{place.region}</span>
                </p>
                <p className="mt-0.5 truncate text-[15px] font-bold">{place.destinationName}</p>
              </div>
              <button
                type="button"
                aria-label="저장 해제"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
                onClick={() => handleRemove(place)}
                disabled={removingId === place.id}
              >
                <Trash2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
