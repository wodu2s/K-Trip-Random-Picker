import { useState } from "react";
import { ArrowUpRight, Coffee, Landmark, MapPin, UtensilsCrossed, type LucideIcon } from "lucide-react";
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

/** 카카오 로컬 카테고리 코드 → 사진이 없을 때 쓰는 아이콘 */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  AT4: Landmark,
  CT1: Landmark,
  FD6: UtensilsCrossed,
  CE7: Coffee,
};

/** 원본 → 썸네일 순으로 시도하고, 둘 다 실패하면 사진 자리에 compact fallback을 넣는다 */
function srcOf(p: NearbyPlace, fails: number): string {
  const candidates = [p.image, p.thumbnailUrl, p.thumbnail].map((s) => (s ?? "").trim()).filter(Boolean);
  return candidates[fails] ?? "";
}

/**
 * 사진을 못 찾은 장소 — 사진인 척하는 placeholder 대신 카테고리 아이콘과 지도핀만 둔다.
 * 사진 카드와 같은 칸을 차지해서 목록이 들쭉날쭉해지지 않는다.
 */
function PlaceThumbBlank({ category }: { category: string }) {
  const Icon = CATEGORY_ICON[category] ?? MapPin;
  return (
    <span className="place-thumb__blank" aria-hidden="true">
      <Icon className="place-thumb__blank-icon h-[22px] w-[22px]" strokeWidth={1.6} />
      <MapPin className="place-thumb__blank-pin h-[13px] w-[13px]" strokeWidth={2} />
    </span>
  );
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

  return (
    <ul className="place-thumbs">
      {shown.map((p) => {
        const src = srcOf(p, fails[keyOf(p)] ?? 0);
        return (
          <li key={keyOf(p)}>
            <a className="place-thumb" href={p.url} target="_blank" rel="noreferrer">
              {src ? (
                <img
                  className="place-thumb__img"
                  src={src}
                  alt=""
                  loading="lazy"
                  onError={() =>
                    setFails((prev) => ({ ...prev, [keyOf(p)]: (prev[keyOf(p)] ?? 0) + 1 }))
                  }
                />
              ) : (
                <PlaceThumbBlank category={p.category} />
              )}
              <p className="place-thumb__name">{p.name}</p>
              {distanceText(p.distance) ? (
                <p className="place-thumb__meta">{distanceText(p.distance)}</p>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
