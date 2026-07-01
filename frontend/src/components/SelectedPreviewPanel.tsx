import { motion, AnimatePresence } from 'motion/react';
import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { MapPin, ChevronRight, Check, RotateCcw, Clock, Ticket, Car, ChevronDown, ChevronUp, CheckCircle2, Tag, BookOpen } from 'lucide-react';
import { getRecommendationType, RecommendationType } from '../utils/recommendationType';
import DataSourceBadge from './DataSourceBadge';
import { isTripSaved, toggleSavedTrip } from '../utils/savedTrips';
import { useEffect, useState } from 'react';
import { getCardShortTag } from '../utils/cardPresentation';
import { buildPreVisitTips } from '../utils/tripInsights';

interface SelectedPreviewPanelProps {
  destination: Destination;
  prefs: TripFormState;
  onViewDetail?: () => void;
  onTripSaved?: () => void;
  recommendationType?: RecommendationType;
}

export default function SelectedPreviewPanel({
  destination,
  prefs,
  onTripSaved,
  recommendationType,
}: SelectedPreviewPanelProps) {
  const [isSaved, setIsSaved] = useState(() => isTripSaved(destination.id));
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCollectToast, setShowCollectToast] = useState(false);
  const [showDataInfo, setShowDataInfo] = useState(false);

  const recType = recommendationType ?? getRecommendationType(destination);
  const shortTag = getCardShortTag(recType);
  const preVisitTips = buildPreVisitTips(destination).slice(0, 3);
  
  const nearbyCount =
    (destination.detail?.nearbyAttractions?.length || 0) +
    (destination.detail?.nearbyCafes?.length || 0) +
    (destination.detail?.nearbyRestaurants?.length || 0);

  useEffect(() => {
    setIsSaved(isTripSaved(destination.id));
    setIsFlipped(false);
    setShowDataInfo(false);
  }, [destination.id]);

  const handleSave = () => {
    toggleSavedTrip(destination, prefs);
    const saved = isTripSaved(destination.id);
    setIsSaved(saved);
    onTripSaved?.();

    if (saved) {
      setShowCollectToast(true);
      setTimeout(() => setShowCollectToast(false), 1500);
    }
  };

  const mapQuery = destination.title;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 perspective-1000">
      <AnimatePresence>
        {showCollectToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white font-black px-6 py-3 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-2"
          >
            <span className="text-xl">✨</span>
            여행 앨범에 카드가 저장되었습니다
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative w-full aspect-[3/4] sm:aspect-[4/5] preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* 앞면 */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-[2rem] border-4 border-yellow-200 shadow-xl overflow-hidden flex flex-col">
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-5 pointer-events-none">🎴</div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black text-xs px-4 py-1.5 rounded-b-xl shadow-sm z-20">
            획득한 여행 카드
          </div>
          
          <div className="p-2 pb-0 flex-1 flex flex-col">
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-100 group flex-1">
              {destination.imageUrl ? (
                <img 
                  src={destination.imageUrl} 
                  alt={destination.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <MapPin size={48} className="mb-2 opacity-50" />
                  <span className="text-sm font-bold">이미지 준비 중</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-sky-500 text-white text-[0.65rem] font-black px-2 py-1 rounded-md shadow-sm">
                    {recType}
                  </span>
                  <span className="bg-white/20 backdrop-blur text-white text-[0.65rem] font-bold px-2 py-1 rounded-md border border-white/20">
                    {shortTag}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">
                  {destination.title}
                </h3>
                <div className="flex items-center gap-2 text-white/90 text-sm mt-2 font-bold drop-shadow">
                  <MapPin size={14} />
                  <span>{destination.region}</span>
                  <span className="opacity-50">·</span>
                  <span>{destination.distanceKm ? `약 ${Math.round(destination.distanceKm)}km` : '가까운 거리'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white relative z-10 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsFlipped(true)}
                className="col-span-2 h-[56px] bg-gradient-to-r from-sky-500 to-sky-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-[0_4px_0_0_#0284c7] active:shadow-none active:translate-y-[4px] transition-all"
              >
                이 카드 펼쳐보기
                <ChevronRight size={20} />
              </button>
              
              <button
                onClick={handleSave}
                className={`col-span-2 h-[50px] rounded-xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-inner'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm'
                }`}
              >
                {isSaved ? <Check size={18} className="text-yellow-500" /> : <span className="text-lg grayscale opacity-50">🎴</span>}
                {isSaved ? '앨범에 보관됨' : '카드 수집하기'}
              </button>
            </div>
          </div>
        </div>

        {/* 뒷면 */}
        <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-[2rem] border-4 border-slate-700 shadow-xl overflow-y-auto scrollbar-hide flex flex-col p-6 [transform:rotateY(180deg)] text-slate-200">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Card Details</span>
            <button onClick={() => setIsFlipped(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <RotateCcw size={18} />
            </button>
          </div>

          <h3 className="text-2xl font-black text-white mb-2">{destination.title}</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold px-2.5 py-1 rounded-md">{recType}</span>
            <span className="bg-white/10 text-slate-300 border border-white/20 text-xs font-bold px-2.5 py-1 rounded-md">{destination.region}</span>
            {destination.distanceKm && <span className="bg-white/10 text-slate-300 border border-white/20 text-xs font-bold px-2.5 py-1 rounded-md">거리 {Math.round(destination.distanceKm)}km</span>}
          </div>

          <div className="space-y-6 flex-1">
            {preVisitTips.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-yellow-400 tracking-wider">방문 전 팁</h4>
                <div className="flex flex-col gap-2">
                  {preVisitTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-bold text-slate-300">
                      <CheckCircle2 size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                      <span>{tip.replace(/합니다|입니다|해요/g, '함')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-sky-400 tracking-wider">주변 정보</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">주변 추천 장소</span>
                <span className="text-sm font-black text-white bg-white/10 px-3 py-1 rounded-lg">{nearbyCount}곳</span>
              </div>
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <MapPin size={16} />
                카카오맵으로 보기
              </a>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <h4 className="text-xs font-black text-slate-400 tracking-wider mb-3">활용 데이터 출처</h4>
              <div className="flex flex-wrap gap-2">
                <DataSourceBadge source={destination.dataSource} />
                {nearbyCount > 0 && <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[0.65rem] font-bold px-2 py-1 rounded-md">Kakao 주변 장소</span>}
                <span className="bg-white/10 text-slate-400 border border-white/20 text-[0.65rem] font-bold px-2 py-1 rounded-md">위치 기반 거리</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full mt-6 h-[56px] rounded-2xl font-black text-base border-2 transition-all flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-yellow-400 border-yellow-300 text-yellow-900 shadow-[0_4px_0_0_#ca8a04]'
                : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700 shadow-[0_4px_0_0_#475569]'
            } active:shadow-none active:translate-y-[4px]`}
          >
            {isSaved ? <Check size={20} /> : <span className="text-xl grayscale opacity-70">🎴</span>}
            {isSaved ? '앨범에 보관됨' : '카드 수집하기'}
          </button>
        </div>
      </motion.div>

      {/* 데이터 정보 어코디언 (접힌 패널) */}
      <div className="pt-4">
        <button 
          onClick={() => setShowDataInfo(!showDataInfo)}
          className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-slate-500 font-bold text-sm transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-slate-400" />
            공공데이터 정보 보기
          </div>
          {showDataInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showDataInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 mt-2 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.detail?.useTime && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] font-bold text-slate-400 uppercase">이용시간</span>
                      <span className="text-xs font-black text-slate-700">{destination.detail.useTime}</span>
                    </div>
                  )}
                  {destination.detail?.useFee && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] font-bold text-slate-400 uppercase">이용요금</span>
                      <span className="text-xs font-black text-slate-700">{destination.detail.useFee}</span>
                    </div>
                  )}
                  {destination.detail?.parking && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] font-bold text-slate-400 uppercase">주차</span>
                      <span className="text-xs font-black text-slate-700">{destination.detail.parking}</span>
                    </div>
                  )}
                  {destination.address && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.65rem] font-bold text-slate-400 uppercase">주소</span>
                      <span className="text-xs font-black text-slate-700">{destination.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t border-slate-200 flex flex-col gap-1.5">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase">데이터 출처</span>
                  <div className="text-xs font-bold text-slate-500">
                    <p>• 한국관광공사 TourAPI (관광지/음식점/숙박 정보)</p>
                    {nearbyCount > 0 && <p>• Kakao Local API (주변 편의시설 및 카카오맵 연동)</p>}
                    <p>• 추천된 여행 유형: {recType}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
