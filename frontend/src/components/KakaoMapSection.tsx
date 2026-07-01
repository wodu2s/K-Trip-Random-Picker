import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Destination } from '../types/destination';
import { getMapSearchQuery } from '../utils/image';

interface KakaoMapSectionProps {
  destination: Destination;
  height?: string;
  onError?: () => void;
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown;
        Marker: new (options: { position: unknown }) => { setMap: (map: unknown) => void };
      };
    };
  }
}

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_JS_KEY?.trim();

function MapPlaceholder({
  destination,
  mapQuery,
}: {
  destination: Destination;
  mapQuery: string;
}) {
  const locationLabel = destination.address?.trim() || destination.region;

  return (
    <div className="ui-card flex flex-col p-4 gap-3">
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">위치 안내</p>
        <p className="text-sm font-bold text-slate-700 truncate">{locationLabel}</p>
      </div>

      <div className="flex flex-row items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
          <MapPin size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-700">정확한 위치는 카카오맵에서 확인할 수 있어요</p>
          <p className="text-[0.65rem] text-slate-500 mt-0.5">아래 버튼을 눌러 바로 확인해보세요.</p>
        </div>
      </div>

      <a
        href={(typeof destination.latitude === 'number' && typeof destination.longitude === 'number') ? `https://map.kakao.com/link/map/${encodeURIComponent(destination.title)},${destination.latitude},${destination.longitude}` : `https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary btn-full h-[40px] rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
      >
        <ExternalLink size={14} className="mr-1" />
        외부 지도에서 위치 확인
      </a>
    </div>
  );
}

export default function KakaoMapSection({ destination, height = '200px', onError }: KakaoMapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  
  const mapQuery = getMapSearchQuery(destination);
  const hasCoords = typeof destination.latitude === 'number' && typeof destination.longitude === 'number';
  const canShowMap = Boolean(KAKAO_MAP_KEY && hasCoords && !mapError);

  useEffect(() => {
    setMapError(false);
    setMapReady(false);
    setIsSlowLoading(false);
  }, [destination.id]);

  useEffect(() => {
    if (!canShowMap) return;

    let timeoutId: number;
    if (!mapReady) {
      timeoutId = window.setTimeout(() => {
        setIsSlowLoading(true);
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [mapReady, canShowMap]);

  useEffect(() => {
    if (!KAKAO_MAP_KEY || !hasCoords) return;
    if (!mapRef.current) return;

    const scriptId = 'kakao-map-sdk';
    const initMap = () => {
      if (!window.kakao?.maps) {
        console.warn('Kakao map script loaded but window.kakao.maps is undefined');
        setMapError(true);
        onError?.();
        return;
      }
      
      window.kakao.maps.load(() => {
        try {
          if (!mapRef.current) return;
          // Check container dimensions
          if (mapRef.current.clientWidth === 0 || mapRef.current.clientHeight === 0) {
            console.warn('Kakao map container width or height is 0');
            setMapError(true);
            onError?.();
            return;
          }

          const center = new window.kakao!.maps.LatLng(
            destination.latitude!,
            destination.longitude!,
          );
          const map = new window.kakao!.maps.Map(mapRef.current, { center, level: 8 });
          const marker = new window.kakao!.maps.Marker({ position: center });
          marker.setMap(map);
          setMapReady(true);
        } catch (e) {
          console.warn('Error creating Kakao map:', e);
          setMapError(true);
          onError?.();
        }
      });
    };

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      if (window.kakao?.maps) {
        initMap();
      } else {
        existing.addEventListener('load', initMap);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
    script.onload = initMap;
    script.onerror = () => {
      console.warn('Failed to load Kakao map script');
      setMapError(true);
      onError?.();
    };
    document.head.appendChild(script);
  }, [destination.id, destination.latitude, destination.longitude, hasCoords]);

  if (!canShowMap) {
    return <MapPlaceholder destination={destination} mapQuery={mapQuery} />;
  }

  return (
    <div className="ui-card p-4 flex flex-col gap-3">
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">상세 위치</p>
        <p className="text-sm font-bold text-slate-700 truncate">
          {destination.address?.trim() || destination.region}
        </p>
      </div>

      <div className="relative" style={{ height }}>
        <div
          ref={mapRef}
          className="w-full h-full rounded-[14px] overflow-hidden shadow-inner bg-slate-50 border border-slate-100"
        />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 rounded-[14px] backdrop-blur-sm z-10">
            <p className="text-xs text-slate-400 font-medium">
              {isSlowLoading ? '지도를 불러오는 중입니다...' : '지도를 준비하는 중...'}
            </p>
          </div>
        )}
      </div>

      <a
        href={hasCoords ? `https://map.kakao.com/link/map/${encodeURIComponent(destination.title)},${destination.latitude},${destination.longitude}` : `https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-kakao btn-full h-[48px] rounded-[12px] text-sm"
      >
        <ExternalLink size={16} />
        카카오맵에서 여행지 위치 보기
      </a>
    </div>
  );
}
