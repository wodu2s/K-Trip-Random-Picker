import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import DataSourceBadge from './DataSourceBadge';

interface RecommendationSummaryBoxProps {
  destination: Destination;
  prefs: TripFormState;
  explanationLines: string[];
}

export default function RecommendationSummaryBox({ destination }: RecommendationSummaryBoxProps) {
  const nearbyCount =
    (destination.detail?.nearbyAttractions?.length || 0) +
    (destination.detail?.nearbyCafes?.length || 0) +
    (destination.detail?.nearbyRestaurants?.length || 0);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceBadge source={destination.dataSource} />
        {nearbyCount > 0 && (
          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[0.65rem] font-bold px-2 py-1 rounded-md">
            주변 장소 {nearbyCount}곳
          </span>
        )}
        {destination.detail?.nearbyAttractions && (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[0.65rem] font-bold px-2 py-1 rounded-md">
            Kakao 주변정보
          </span>
        )}
        <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[0.65rem] font-bold px-2 py-1 rounded-md">
          위치 기반 거리 계산
        </span>
      </div>
    </div>
  );
}
