import { Car, Map as MapIcon } from 'lucide-react';
import { Destination } from '../types/destination';

interface Props {
  destination: Destination;
}

export default function TravelInfoSection({ destination }: Props) {
  const { travelInfo } = destination;

  // travelInfo가 없으면 아무것도 렌더링하지 않음 (이전 백엔드 응답과의 호환성)
  if (!travelInfo) return null;

  const hasRealData = travelInfo.provider !== 'none' && travelInfo.carDurationText;

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-sky-50 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
        <Car size={16} className="text-sky-500" />
        이동 정보
      </h3>
      
      {hasRealData ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
              <Car size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">자동차</p>
              <p className="text-sm font-black text-slate-700">약 {travelInfo.carDurationText}</p>
            </div>
          </div>
          {travelInfo.distanceText && (
            <p className="text-xs text-slate-400 font-medium pl-[3.25rem]">
              이동거리 약 {travelInfo.distanceText}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          정확한 이동 시간은 카카오맵에서 확인해보세요.
        </p>
      )}

      {travelInfo.routeMapUrl && (
        <a
          href={travelInfo.routeMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary w-full h-[40px] rounded-xl text-sm font-bold gap-2 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-100 transition-colors mt-2"
        >
          <MapIcon size={16} />
          카카오맵에서 경로 보기
        </a>
      )}
    </div>
  );
}
