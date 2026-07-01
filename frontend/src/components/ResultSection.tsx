import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { generateStructuredCourse } from '../utils/generateCourse';
import { MapPin, Clock, Car, Ticket, Map as MapIcon, ArrowLeft, CheckCircle2, Tag, Star, Share2 } from 'lucide-react';
import KakaoMapSection from './KakaoMapSection';
import NearbySpotsSection from './NearbySpotsSection';
import ReviewSection from './ReviewSection';
import DestinationHero, { DestinationHeroMeta } from './DestinationHero';
import { getRecommendationType, RecommendationType } from '../utils/recommendationType';
import { getMapSearchQuery } from '../utils/image';
import { buildPreVisitTips } from '../utils/tripInsights';
import { isTripSaved, toggleSavedTrip } from '../utils/savedTrips';

interface ResultSectionProps {
  destination: Destination;
  duration: 'day' | 'overnight';
  prefs: TripFormState;
  onBack: () => void;
  onRetry?: () => void;
  onTripSaved?: () => void;
  initialTab?: 'info' | 'course' | 'reviews';
  recommendationType?: RecommendationType;
}

export default function ResultSection({
  destination,
  duration,
  prefs,
  onBack,
  onRetry,
  onTripSaved,
  initialTab = 'info',
  recommendationType,
}: ResultSectionProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'course' | 'reviews'>(initialTab);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const detail = destination.detail;
  const mapQuery = getMapSearchQuery(destination);
  const recType = recommendationType ?? getRecommendationType(destination);
  const preVisitTips = buildPreVisitTips(destination).slice(0, 3);
  const shortStory = destination.summary ? destination.summary.split('.')[0] + '.' : '색다른 즐거움이 있는 여행지';
  
  const courseSteps = duration === 'day' ? detail?.dayTripCourse : detail?.overnightCourse;
  const structuredCourse = generateStructuredCourse(destination, duration, prefs.theme);
  const useStructuredTimeline = !(courseSteps && courseSteps.length > 0);

  useEffect(() => {
    setIsFavorite(isTripSaved(destination.id));
    setMapLoadFailed(false);
    window.scrollTo(0, 0);
  }, [destination.id, initialTab]);

  const toggleFavorite = () => {
    toggleSavedTrip(destination, prefs);
    setIsFavorite(isTripSaved(destination.id));
    onTripSaved?.();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `K-Trip: ${destination.title}`,
          text: `오늘의 여행지는 ${destination.title}으로 결정!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <div className="page-container py-6 pb-24">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-sky-500 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        카드 목록으로
      </motion.button>

      <div className="space-y-8">
        <DestinationHero destination={destination}>
          <DestinationHeroMeta
            destination={destination}
            selectedTheme={prefs.theme}
            actions={
              <>
                <button
                  onClick={handleShare}
                  className="w-11 h-11 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/30 hover:bg-white hover:text-sky-500 transition-all"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isFavorite
                      ? 'bg-yellow-400 text-white shadow-lg'
                      : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-yellow-500'
                  }`}
                >
                  <Star fill={isFavorite ? 'currentColor' : 'none'} size={18} />
                </button>
              </>
            }
          />
        </DestinationHero>

        <div className="flex justify-center relative">
          <div className="bg-slate-100 p-2 rounded-2xl flex gap-2 overflow-x-auto shadow-inner border border-slate-200 w-full max-w-md justify-between">
            {(['info', 'course', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${
                  activeTab === tab
                    ? 'bg-white text-yellow-600 shadow-[0_4px_0_0_#fde047] border-2 border-yellow-300 -translate-y-1'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-2 border-transparent'
                }`}
              >
                {tab === 'info' ? '📖 여행 정보' : tab === 'course' ? '🗺️ 추천 코스' : '💬 방문 후기'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              {/* Left Column: Quick Info */}
              <div className="space-y-6">
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="text-sm font-black text-sky-700 mb-1">{shortStory}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="bg-white text-sky-600 text-[0.65rem] font-bold px-2 py-1 rounded-md shadow-sm border border-sky-100">#{recType}</span>
                      <span className="bg-white text-sky-600 text-[0.65rem] font-bold px-2 py-1 rounded-md shadow-sm border border-sky-100">#{destination.region}</span>
                      {destination.distanceKm && <span className="bg-white text-sky-600 text-[0.65rem] font-bold px-2 py-1 rounded-md shadow-sm border border-sky-100">#거리{Math.round(destination.distanceKm)}km</span>}
                    </div>
                  </div>
                </div>

                {preVisitTips.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h4 className="text-xs font-black text-slate-400 tracking-wider uppercase">방문 전 팁</h4>
                    <div className="flex flex-wrap gap-2">
                      {preVisitTips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                          <CheckCircle2 size={14} className="text-yellow-500" />
                          <span className="text-xs font-bold text-slate-700">{tip.replace(/합니다|입니다|해요/g, '함').substring(0, 18)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <Clock size={16} className="text-sky-500" />
                    <span className="text-[0.65rem] font-bold text-slate-400">이용시간</span>
                    <span className="text-xs font-black text-slate-700 line-clamp-1">{detail?.useTime || '정보 없음'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <Ticket size={16} className="text-sky-500" />
                    <span className="text-[0.65rem] font-bold text-slate-400">이용요금</span>
                    <span className="text-xs font-black text-slate-700 line-clamp-1">{detail?.useFee || '무료 또는 미등록'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <Car size={16} className="text-sky-500" />
                    <span className="text-[0.65rem] font-bold text-slate-400">주차</span>
                    <span className="text-xs font-black text-slate-700 line-clamp-1">{detail?.parking || '주변 공영주차장 확인'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <Tag size={16} className="text-sky-500" />
                    <span className="text-[0.65rem] font-bold text-slate-400">유형</span>
                    <span className="text-xs font-black text-slate-700 line-clamp-1">{recType}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Map & Nearby */}
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                      <MapIcon size={16} className="text-sky-500" />
                      위치 확인
                    </h4>
                    <a
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.65rem] font-bold text-white bg-sky-500 px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      카카오맵 열기
                    </a>
                  </div>
                  <KakaoMapSection destination={destination} height="150px" onError={() => setMapLoadFailed(true)} />
                </div>

                <NearbySpotsSection destination={destination} />
              </div>
            </motion.div>
          )}

          {activeTab === 'course' && (
            <motion.div
              key="course"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-xl border-2 border-slate-50"
            >
              <div className="max-w-xl mx-auto space-y-10">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">추천 여행 코스</h3>
                  <p className="text-slate-400 font-medium">
                    {duration === 'day' ? '가볍고 알찬 당일치기 코스입니다.' : '여유롭게 즐기는 1박 2일 코스입니다.'}
                  </p>
                </div>

                {useStructuredTimeline ? (
                  duration === 'day' ? (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-sky-300 before:to-sky-400 before:rounded-full pt-4">
                      {structuredCourse.map((step, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-sky-500 text-white font-black shadow-lg absolute left-4 md:left-1/2 -translate-x-1/2 z-10 shrink-0">
                            {i + 1}
                          </div>
                          <div className="w-full md:w-[calc(50%-3rem)] ml-16 md:ml-0 p-5 rounded-2xl bg-white border-4 border-sky-100 shadow-[0_4px_0_0_#e0f2fe] hover:-translate-y-1 transition-transform text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-black">{step.time}</span>
                            </div>
                            <h4 className="font-black text-slate-800 text-lg">{step.title}</h4>
                            {step.description && (
                              <p className="text-sm text-slate-600 leading-relaxed mt-2">{step.description}</p>
                            )}
                            {(step.placeName || step.mapUrl) && (
                              <a
                                href={step.mapUrl || `https://map.kakao.com/link/search/${encodeURIComponent(step.placeName || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-2 rounded-lg transition-colors mt-3"
                              >
                                <MapPin size={14} />
                                지도에서 보기
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">1박 2일 코스 준비 중</div>
                  )
                ) : (
                  <div className="text-center text-slate-400">코스 정보 준비 중</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ReviewSection destinationId={destination.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
