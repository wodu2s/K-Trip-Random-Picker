import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { fetchNearbyPlaces, type NearbyPlace } from "../../lib/api";
import type { Destination } from "../../types/travel";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao?: any;
  }
}

const SDK_ID = "kakao-maps-sdk";

/** Kakao Maps JS SDK 1회 로드 (JS 키는 도메인 제한이 있는 공개 키) */
function loadKakaoSdk(appKey: string): Promise<any> {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    const onLoad = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Kakao SDK 로드 실패")), { once: true });

    if (!existing) {
      script.id = SDK_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      document.head.appendChild(script);
    }
  });
}

/** 목적지 위치 지도 + 주변 장소 마커. 좌표·키가 없으면 렌더하지 않는다. */
export function DestinationMap({ destination }: { destination: Destination }) {
  const appKey = import.meta.env.VITE_KAKAO_MAP_JS_KEY ?? "";
  const { lat, lng, name } = destination;
  const containerRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    let alive = true;
    fetchNearbyPlaces(lat, lng)
      .then((data) => {
        if (alive) setPlaces([...data.spots, ...data.foods, ...data.cafes].slice(0, 8));
      })
      .catch(() => {
        /* 주변 장소는 실패해도 지도는 그대로 노출 */
      });
    return () => {
      alive = false;
    };
  }, [lat, lng]);

  useEffect(() => {
    if (!appKey || !lat || !lng || !containerRef.current) return;
    let alive = true;

    loadKakaoSdk(appKey)
      .then((kakao) => {
        if (!alive || !containerRef.current) return;
        const center = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(containerRef.current, { center, level: 6 });

        const marker = new kakao.maps.Marker({ position: center, map });
        new kakao.maps.InfoWindow({
          content: `<div style="padding:5px 8px;font-size:12px;font-weight:700;">${name}</div>`,
        }).open(map, marker);

        places.forEach((p) => {
          const position = new kakao.maps.LatLng(p.lat, p.lng);
          const nearbyMarker = new kakao.maps.Marker({ position, map });
          const info = new kakao.maps.InfoWindow({
            content: `<div style="padding:4px 8px;font-size:12px;">${p.name}</div>`,
          });
          kakao.maps.event.addListener(nearbyMarker, "click", () => info.open(map, nearbyMarker));
        });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
    };
  }, [appKey, lat, lng, name, places]);

  if (!lat || !lng) return null;

  return (
    <section>
      <p className="font-expedition mb-1 text-[11px] font-bold tracking-[0.16em] text-brass">
        FIELD MAP
      </p>
      <h2 className="font-expedition mb-1 text-lg font-bold text-ink">목적지 지도</h2>
      <p className="mb-4 text-sm text-muted">주변 명소·식당·카페를 함께 표시했어요.</p>

      {appKey && !failed ? (
        <div
          ref={containerRef}
          className="h-[320px] w-full overflow-hidden rounded-[12px] border border-brass/35 shadow-[0_10px_26px_rgba(22,40,31,0.12)] sm:h-[380px]"
        />
      ) : (
        <div className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-brass/30 bg-[var(--color-parchment-100)] text-muted">
          <MapPin className="h-6 w-6 text-brass" strokeWidth={1.8} aria-hidden="true" />
          <p className="text-sm">지도 키가 없어 위치만 안내합니다 — {destination.region}</p>
        </div>
      )}

      {places.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {places.map((p) => (
            <li key={`${p.name}-${p.lat}`}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-brass/30 bg-[var(--color-parchment-100)] px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brass/60"
              >
                <MapPin className="h-3.5 w-3.5 text-brass" strokeWidth={2.2} aria-hidden="true" />
                {p.name}
                {p.distance != null && (
                  <span className="text-muted">{Math.round(p.distance / 100) / 10}km</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
