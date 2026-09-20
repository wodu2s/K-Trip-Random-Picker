import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, RouteIcon, Shuffle } from "lucide-react";
import type { Destination } from "../../types/travel";
import { useTravel } from "../../state/TravelContext";
import { useAuth } from "../../state/AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import { addSavedPlace, isPlaceSaved, removeSavedPlace } from "../../lib/savedPlacesApi";

/** 좌표가 있으면 카카오맵 장소, 없으면 이름으로 검색한다 */
export function kakaoMapUrl(destination: Destination): string {
  const { name, lat, lng } = destination;
  if (lat && lng) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
  }
  return `https://map.kakao.com/?q=${encodeURIComponent(name)}`;
}

function scrollToSchedule() {
  document.getElementById("schedule-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** 로그인한 사용자만 쓸 수 있는 장소 저장 토글. 로그인하지 않았으면 안내 후 로그인 모달을 띄운다. */
function SaveToggle({ destination }: { destination: Destination }) {
  const { user, openLogin } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setSaved(false);
      return;
    }
    let alive = true;
    void isPlaceSaved(user.id, destination.id).then((v) => {
      if (alive) setSaved(v);
    });
    return () => {
      alive = false;
    };
  }, [user, destination.id]);

  if (!isSupabaseConfigured) return null;

  async function handleClick() {
    if (!user) {
      openLogin("장소를 저장하려면 로그인이 필요해요.");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await removeSavedPlace(user.id, destination.id);
        setSaved(false);
      } else {
        await addSavedPlace(user.id, destination);
        setSaved(true);
      }
    } catch {
      /* 저장 실패 시 상태를 되돌리고 다음 클릭에서 다시 시도하게 둔다 */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={saved ? "dossier-btn dossier-btn--ghost is-active" : "dossier-btn dossier-btn--ghost"}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
    >
      {saved ? (
        <BookmarkCheck className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Bookmark className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
      )}
      {saved ? "저장됨" : "장소 저장"}
    </button>
  );
}

/**
 * Hero 액션 — 코스 스크롤 + 장소 저장. 다시 뽑기는 하단 바에서만.
 */
export function DestinationActions({
  destination,
  variant = "hero",
}: {
  destination: Destination;
  variant?: "hero" | "bar";
}) {
  const { startShuffle } = useTravel();

  if (variant === "bar") {
    return (
      <div className="dossier-cta-row">
        <button type="button" className="dossier-btn dossier-btn--ghost" onClick={startShuffle}>
          <Shuffle className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          다시 뽑기
        </button>
        <button type="button" className="dossier-btn dossier-btn--primary" onClick={scrollToSchedule}>
          <RouteIcon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
          코스 추천받기
        </button>
      </div>
    );
  }

  return (
    <div className="dossier-cta-row">
      <button type="button" className="dossier-btn dossier-btn--primary" onClick={scrollToSchedule}>
        <RouteIcon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
        코스 추천받기
      </button>
      <SaveToggle destination={destination} />
    </div>
  );
}
