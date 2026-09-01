import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { NearbyPlace } from "../../lib/api";
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
export function DestinationMap({
  destination,
  places,
}: {
  destination: Destination;
  places: NearbyPlace[];
}) {
  const appKey = import.meta.env.VITE_KAKAO_MAP_JS_KEY ?? "";
  const { lat, lng, name } = destination;
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

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

  if (!appKey || failed) {
    return (
      <div className="dossier-map dossier-map--empty">
        <MapPin className="h-6 w-6 text-brass" strokeWidth={1.8} aria-hidden="true" />
        <p className="text-sm">지도 키가 없어 위치만 안내합니다 — {destination.region}</p>
      </div>
    );
  }

  return <div ref={containerRef} className="dossier-map" />;
}
