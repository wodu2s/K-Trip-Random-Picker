import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { RecommendationType } from '../utils/recommendationType';
import { Clock, MapPin, Sparkles, Image as ImageIcon, Map, Navigation, Tag, Car, Ticket, CalendarOff } from 'lucide-react';

interface CompactSummaryCardProps {
  destination: Destination;
  prefs: TripFormState;
  recType: RecommendationType;
  validImageCount?: number;
}

export default function CompactSummaryCard({ destination, prefs, recType, validImageCount = 0 }: CompactSummaryCardProps) {
  const detail = destination.detail || {};
  const t = destination.travelInfo;
  
  // 1. 이동
  let distanceValue = '';
  if (t?.carDurationText) {
    distanceValue = `자동차 ${t.carDurationText}`;
  } else if (destination.distanceKm) {
    distanceValue = `약 ${Math.round(destination.distanceKm)}km`;
  }

  // 2. 방문
  const shorten = (text: string | undefined, type: string) => {
    if (!text) return '';
    const clean = text.trim();
    if (['정보 없음', 'null', 'undefined', '-'].includes(clean)) return '';
    
    if (type === 'time') {
      if (clean.includes('상시') || clean.includes('24시간')) return '상시 개방';
      const match = clean.match(/([0-9]{1,2}:[0-9]{2}(?:~|-)[0-9]{1,2}:[0-9]{2})/);
      if (match) {
        return clean.length > match[0].length + 2 ? `${match[0]} 외` : match[0];
      }
      if (clean.length > 10) return clean.substring(0, 8) + '...';
      return clean;
    }
    if (type === 'rest') {
      if (clean.includes('연중무휴') || clean === '없음') return '연중무휴';
      return clean.split(' ')[0].substring(0, 6) + '...';
    }
    if (type === 'park') {
      if (clean.includes('불가') || clean.includes('없음')) return '주차 불가';
      return '주차 가능';
    }
    if (type === 'fee') {
      if (clean.includes('무료')) return '무료';
      if (clean.length <= 10 && !clean.includes(' ')) return clean;
      const match = clean.match(/([가-힣]+)?\s?([0-9,]+원)/);
      if (match) {
        const matchedStr = match[0].trim();
        if (clean.length > matchedStr.length + 2) return `${matchedStr} 외`;
        return matchedStr;
      }
      if (clean.length > 10) return clean.substring(0, 8) + '...';
      return clean;
    }
    return '';
  };

  const useTime = shorten(detail.useTime, 'time');
  const restDate = shorten(detail.restDate, 'rest');
  const parking = shorten(detail.parking, 'park');
  const useFee = shorten(detail.useFee, 'fee');

  // 3. 유형
  let typeValue: string = recType || '여행지';
  if (typeValue.length > 8) typeValue = typeValue.substring(0, 8);

  // 4. 주변
  const attractionsCount = detail.nearbyAttractions?.length || 0;
  const cafesCount = detail.nearbyCafes?.length || 0;
  const restaurantsCount = detail.nearbyRestaurants?.length || 0;
  const totalNearby = attractionsCount + cafesCount + restaurantsCount;
  let nearbyValue = '';
  if (totalNearby > 0) {
    if (attractionsCount === 0 && cafesCount > 0 && restaurantsCount === 0) {
      nearbyValue = `카페 ${cafesCount}곳`;
    } else if (attractionsCount > 0 && cafesCount === 0 && restaurantsCount === 0) {
      nearbyValue = `주변 ${attractionsCount}곳`;
    } else {
      nearbyValue = `근처 ${totalNearby}곳`;
    }
  }

  // 5. 사진
  const photoValue = validImageCount >= 2 ? `사진 ${validImageCount}장` : '';

  // 6. 지도
  const hasMap = destination.latitude && destination.longitude;
  const mapValue = hasMap ? '위치 확인' : '';

  const allCandidates = [
    { icon: Navigation, label: '이동', value: distanceValue, priority: 1 },
    { icon: Clock, label: '운영', value: useTime, priority: 2 },
    { icon: CalendarOff, label: '휴무', value: restDate, priority: 2 },
    { icon: Car, label: '주차', value: parking, priority: 2 },
    { icon: Ticket, label: '입장료', value: useFee, priority: 2 },
    { icon: Tag, label: '유형', value: typeValue, priority: 3 },
    { icon: MapPin, label: '주변', value: nearbyValue, priority: 4 },
    { icon: ImageIcon, label: '사진', value: photoValue, priority: 5 },
    { icon: Map, label: '지도', value: mapValue, priority: 6 }
  ];

  const validItems = allCandidates.filter(item => item.value);

  // 안정적인 정렬을 위해 priority 오름차순으로 정렬
  validItems.sort((a, b) => a.priority - b.priority);

  // 최소 3개, 최대 4개 (이동, 유형, 지도는 항상 존재하므로 최소 3개 보장됨)
  const displayItems = validItems.slice(0, 4);

  if (displayItems.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-sky-100 py-3 px-4 shadow-sm">
      <h3 className="sr-only">한눈에 보기</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
              <item.icon size={14} className="text-sky-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[0.65rem] font-bold text-sky-600/70 block mb-0.5">{item.label}</span>
              <p className="text-xs font-bold text-slate-700 truncate" title={item.value}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
