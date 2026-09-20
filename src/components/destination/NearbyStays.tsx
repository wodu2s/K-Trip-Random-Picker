import { useState } from "react";
import type { StayPlace } from "../../lib/api";

function distanceText(distance: number | null): string {
  if (distance == null) return "";
  return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
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
        return (
          <li key={s.contentId} className={hasImage ? "stay-item" : "stay-item stay-item--text"}>
            {hasImage ? (
              <a href={s.url} target="_blank" rel="noreferrer">
                <img
                  className="stay-item__thumb"
                  src={s.image}
                  alt=""
                  loading="lazy"
                  onError={() => setFailed((prev) => ({ ...prev, [s.contentId]: true }))}
                />
              </a>
            ) : null}
            <div className="stay-item__body">
              <p className="stay-item__type">
                {s.tag}
                {s.distance != null ? ` · ${distanceText(s.distance)}` : ""}
              </p>
              <a className="stay-item__name" href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
