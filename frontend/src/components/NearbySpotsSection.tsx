import { MapPin, Coffee } from 'lucide-react';
import { useState } from 'react';
import { Destination } from '../types/destination';

interface NearbySpotsSectionProps {
  destination: Destination;
}

export default function NearbySpotsSection({ destination }: NearbySpotsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const detail = destination.detail;
  const attractions = detail?.nearbyAttractions || [];
  const cafes = detail?.nearbyCafes || [];

  // 우선 관광지 위주로, 모자라면 카페 추가 혹은 전체 합치기
  // 기존 로직: 관광지가 있으면 관광지만 3개, 없으면 카페 3개
  // 변경: 관광지 + 카페 전체 합쳐서 표시. 단, 관광지가 위로 오게.
  const allSpots = [
    ...attractions.map((s: any) => ({ ...s, type: 'attraction' })),
    ...cafes.map((s: any) => ({ ...s, type: 'cafe' }))
  ];

  if (allSpots.length === 0) {
    return null;
  }

  const displaySpots = expanded ? allSpots : allSpots.slice(0, 3);
  const hasMore = allSpots.length > 3;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <MapPin className="text-sky-500" size={16} />
          함께 들르면 좋은 주변 장소
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          지도 데이터 기준 가까운 장소를 보여드려요.
        </p>
      </div>

      <div className="space-y-2">
        {displaySpots.map((spot, i) => {
          const isCafe = spot.type === 'cafe';
          return (
            <div key={`${spot.placeName}-${i}`} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCafe ? 'bg-yellow-50 text-yellow-500' : 'bg-sky-50 text-sky-400'}`}>
                {isCafe ? <Coffee size={14} /> : <MapPin size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-800 truncate">
                  {spot.placeName}
                </h4>
                <p className="text-[0.65rem] text-slate-500 truncate mt-0.5">
                  {spot.distance ? `${spot.distance} · ` : ''}{spot.address || '주소 정보 없음'}
                </p>
              </div>
              <a
                href={spot.mapUrl || (spot.latitude != null && spot.longitude != null ? `https://map.kakao.com/link/map/${encodeURIComponent(spot.placeName)},${spot.latitude},${spot.longitude}` : `https://map.kakao.com/link/search/${encodeURIComponent(spot.placeName)}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-sky-50 hover:text-sky-500 transition-colors"
                title="지도에서 보기"
              >
                <MapPin size={14} />
              </a>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-colors"
        >
          {expanded ? '접기' : `더 알아보기 (+${allSpots.length - 3}개)`}
        </button>
      )}
    </div>
  );
}
