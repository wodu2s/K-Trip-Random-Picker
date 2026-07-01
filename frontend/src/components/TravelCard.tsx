import { motion } from 'motion/react';
import { CardPresentation } from '../utils/cardPresentation';
import { Destination } from '../types/destination';
import { MapPin, Clock, Image as ImageIcon, Navigation } from 'lucide-react';

export interface TravelCardProps {
  presentation: CardPresentation;
  destination: Destination;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export default function TravelCard({ presentation, destination, isSelected, onSelect, index }: TravelCardProps) {
  const { recommendationType } = presentation;
  
  const region = destination.address?.split(' ').slice(0, 2).join(' ') || '지역 정보 없음';
  
  let distanceHint = '';
  if (destination.travelInfo?.carDurationText) {
    distanceHint = `차량 ${destination.travelInfo.carDurationText}`;
  } else if (destination.distanceKm) {
    distanceHint = `약 ${Math.round(destination.distanceKm)}km`;
  }

  const useTime = destination.detail?.useTime?.includes('상시') ? '상시 개방' : (destination.detail?.useTime ? '시간 확인 필요' : '');

  return (
    <motion.div
      initial={{ y: 30, opacity: 0, rotateY: 90 }}
      animate={{ y: 0, opacity: 1, rotateY: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', damping: 15 }}
      className="w-full max-w-[240px] mx-auto perspective-1000"
    >
      <button
        type="button"
        onClick={onSelect}
        className={`w-full bg-white rounded-3xl p-4 flex flex-col gap-3 text-left transition-all duration-300 border-[4px] relative overflow-hidden group ${
          isSelected 
            ? 'border-yellow-400 shadow-[0_8px_0_0_#facc15] -translate-y-2' 
            : 'border-slate-200 shadow-[0_8px_0_0_#e2e8f0] hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_8px_0_0_#cbd5e1]'
        }`}
      >
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[0.6rem] font-black px-3 py-1 rounded-bl-xl z-20">
          획득 카드
        </div>

        {/* 메인 이미지 */}
        <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-100">
          {destination.imageUrl ? (
            <img src={destination.imageUrl} alt={destination.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon size={32} />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[0.6rem] font-black text-sky-600 shadow-sm">
            {recommendationType || '추천 명소'}
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <h3 className="text-base font-black text-slate-800 truncate">{destination.title}</h3>
          <p className="text-[0.7rem] font-bold text-slate-500 flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" />
            {region}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {distanceHint && (
            <p className="text-[0.65rem] font-bold text-slate-600 flex items-center gap-1.5">
              <Navigation size={12} className="text-sky-500" />
              <span>거리: <span className="text-slate-800">{distanceHint}</span></span>
            </p>
          )}
          {useTime && (
            <p className="text-[0.65rem] font-bold text-slate-600 flex items-center gap-1.5">
              <Clock size={12} className="text-emerald-500" />
              <span>운영: <span className="text-slate-800">{useTime}</span></span>
            </p>
          )}
          {(destination.detail?.nearbyStays?.length ?? 0) > 0 && (
            <p className="text-[0.65rem] font-bold text-slate-600 flex items-center gap-1.5">
              <MapPin size={12} className="text-purple-500" />
              <span>주변 숙소/장소: <span className="text-slate-800">{(destination.detail?.nearbyStays?.length ?? 0)}개</span></span>
            </p>
          )}
        </div>

        <div className="mt-2 flex justify-end">
          <span className="text-[0.55rem] font-black px-2 py-1 bg-slate-100 text-slate-400 rounded-md">
            {destination.dataSource === 'KTO_OPEN_API' ? 'KTO Data' : 'Mock Data'}
          </span>
        </div>
      </button>
    </motion.div>
  );
}
