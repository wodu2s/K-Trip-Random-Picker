import type { StayPlace } from "../../lib/api";

function distanceText(distance: number | null): string {
  if (distance == null) return "";
  return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
}

/**
 * 추천 숙소 — KTO 숙박(contentTypeId=32) 최대 3곳.
 * firstimage가 있으면 thumbnail, 없으면 텍스트만. 가격·별점 없음.
 */
export function NearbyStays({ stays }: { stays: StayPlace[] }) {
  if (stays.length === 0) return null;

  return (
    <ul className="stay-list">
      {stays.slice(0, 3).map((s) => (
        <li key={s.contentId} className={s.image ? "stay-item" : "stay-item stay-item--text"}>
          {s.image ? (
            <a href={s.url} target="_blank" rel="noreferrer">
              <img className="stay-item__thumb" src={s.image} alt="" loading="lazy" />
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
      ))}
    </ul>
  );
}
