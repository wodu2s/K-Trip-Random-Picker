import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { NearbyPlace } from "../../lib/api";
import type { HiddenPlace } from "../../types/travel";

function distanceText(distance: number | null): string {
  if (distance == null) return "";
  return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
}

function rank(i: number): string {
  return String(i + 1).padStart(2, "0");
}

function keyOf(p: NearbyPlace): string {
  return `${p.name}-${p.lat}`;
}

/** 원본 → 썸네일 순으로 시도하고, 둘 다 실패하면 사진 없이 텍스트로 보여준다 */
function srcOf(p: NearbyPlace, fails: number): string {
  const candidates = [p.image, p.thumbnailUrl, p.thumbnail].map((s) => (s ?? "").trim()).filter(Boolean);
  return candidates[fails] ?? "";
}

function PlaceTextRow({
  name,
  meta,
  href,
  index,
}: {
  name: string;
  meta: string;
  href?: string;
  index: number;
}) {
  const inner = (
    <>
      <span className="nearby-item__rank">{rank(index)}</span>
      <span className="nearby-item__name">{name}</span>
      {href ? (
        <ArrowUpRight className="nearby-item__arrow h-[15px] w-[15px]" strokeWidth={2} aria-hidden="true" />
      ) : null}
      <span className="nearby-item__dist">{meta}</span>
    </>
  );

  return (
    <li>
      {href ? (
        <a className="nearby-item__link" href={href} target="_blank" rel="noreferrer">
          {inner}
        </a>
      ) : (
        <span className="nearby-item__link">{inner}</span>
      )}
    </li>
  );
}

/**
 * 주변 장소 — 최대 limit개. 사진이 있는 곳을 앞에 썸네일로, 나머지는 텍스트 한 줄로.
 * placeholder 없음.
 */
export function PlaceList({
  places,
  fallback = [],
  limit = 3,
}: {
  places: NearbyPlace[];
  fallback?: HiddenPlace[];
  limit?: number;
}) {
  /* 이미지가 깨지면 다음 후보로, 후보가 떨어지면 텍스트로 내린다 */
  const [fails, setFails] = useState<Record<string, number>>({});

  if (places.length === 0) {
    if (fallback.length === 0) return null;
    return (
      <ul className="nearby-list">
        {fallback.slice(0, limit).map((p, i) => (
          <PlaceTextRow key={p.name} name={p.name} meta={p.tag} index={i} />
        ))}
      </ul>
    );
  }

  const ranked = [...places].sort((a, b) => {
    const ia = srcOf(a, fails[keyOf(a)] ?? 0) ? 0 : 1;
    const ib = srcOf(b, fails[keyOf(b)] ?? 0) ? 0 : 1;
    return ia - ib;
  });
  const shown = ranked.slice(0, limit);
  const photos = shown.filter((p) => srcOf(p, fails[keyOf(p)] ?? 0));
  const texts = shown.filter((p) => !srcOf(p, fails[keyOf(p)] ?? 0));

  return (
    <>
      {photos.length > 0 ? (
        <ul className="place-thumbs">
          {photos.map((p) => (
            <li key={keyOf(p)}>
              <a className="place-thumb" href={p.url} target="_blank" rel="noreferrer">
                <img
                  className="place-thumb__img"
                  src={srcOf(p, fails[keyOf(p)] ?? 0)}
                  alt=""
                  loading="lazy"
                  onError={() =>
                    setFails((prev) => ({ ...prev, [keyOf(p)]: (prev[keyOf(p)] ?? 0) + 1 }))
                  }
                />
                <p className="place-thumb__name">{p.name}</p>
                {distanceText(p.distance) ? (
                  <p className="place-thumb__meta">{distanceText(p.distance)}</p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {texts.length > 0 ? (
        <ul className="nearby-list">
          {texts.map((p, i) => (
            <PlaceTextRow
              key={keyOf(p)}
              name={p.name}
              meta={distanceText(p.distance)}
              href={p.url}
              index={i}
            />
          ))}
        </ul>
      ) : null}
    </>
  );
}
