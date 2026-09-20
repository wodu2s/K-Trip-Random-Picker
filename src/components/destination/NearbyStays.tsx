import { useState } from "react";
import { Hotel } from "lucide-react";
import type { StayPlace } from "../../lib/api";

function distanceText(distance: number | null): string {
  if (distance == null) return "";
  return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
}

/** http(s) 주소만 링크로 쓴다 — 빈 값·javascript: 같은 건 링크를 아예 걸지 않는다 */
function safeHref(url?: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

/**
 * 추천 숙소 — KTO 숙박(contentTypeId=32) 최대 3곳.
 * firstimage가 있으면 thumbnail, 없거나 로드에 실패하면 텍스트만. 가격·별점 없음.
 */
export function NearbyStays({ stays }: { stays: StayPlace[] }) {
  /* 이미지가 403/404로 막히면 빈 사진 영역을 남기지 않고 텍스트 카드로 내린다 */
  const [failed, setFailed] = useState<Record<string, true>>({});

  if (stays.length === 0) return null;

  /* 사진이 있는 숙소를 앞에 — 목록에서 빼지는 않는다 */
  const ordered = [...stays].sort(
    (a, b) => Number(Boolean(b.image) && !failed[b.contentId]) - Number(Boolean(a.image) && !failed[a.contentId]),
  );

  return (
    <ul className="stay-list">
      {ordered.slice(0, 3).map((s) => {
        const hasImage = Boolean(s.image) && !failed[s.contentId];
        /* 공식 홈페이지 → 카카오 place_url 순으로 서버가 채워 준다. 없으면 링크 없는 카드 */
        const href = safeHref(s.url);
        const thumb = (
          <img
            className="stay-item__thumb"
            src={s.image}
            alt=""
            loading="lazy"
            onError={() => setFailed((prev) => ({ ...prev, [s.contentId]: true }))}
          />
        );
        /* 사진이 없으면 같은 크기의 숙소 아이콘 카드로 — 빈칸도 broken image도 남기지 않는다 */
        const visual = hasImage ? (
          thumb
        ) : (
          <span className="stay-item__thumb stay-item__thumb--blank" aria-hidden="true">
            <Hotel className="h-[20px] w-[20px]" strokeWidth={1.7} />
          </span>
        );
        return (
          <li key={s.contentId} className="stay-item">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {visual}
              </a>
            ) : (
              visual
            )}
            <div className="stay-item__body">
              <p className="stay-item__type">
                {s.tag}
                {s.distance != null ? ` · ${distanceText(s.distance)}` : ""}
              </p>
              {href ? (
                <a className="stay-item__name" href={href} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ) : (
                <span className="stay-item__name stay-item__name--plain">{s.name}</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
