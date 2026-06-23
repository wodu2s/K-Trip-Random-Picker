/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Destination, TravelTime } from '../types';
import { 
  MapPin, Star, Share2, ArrowLeft, ExternalLink, 
  ChevronRight, Clock, Train, Footprints, 
  Bed, Tent, Map, Info, StarHalf, Navigation
} from 'lucide-react';
import ReviewSection from './ReviewSection';

interface ResultSectionProps {
  destination: Destination;
  travelTime: TravelTime;
  onBack: () => void;
  onRetry: () => void;
}

export default function ResultSection({ destination, travelTime, onBack, onRetry }: ResultSectionProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'course' | 'reviews'>('info');

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(destination.id));
    window.scrollTo(0, 0);
  }, [destination.id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    if (favorites.includes(destination.id)) {
      newFavorites = favorites.filter((id: string) => id !== destination.id);
    } else {
      newFavorites = [...favorites, destination.id];
    }
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `K-Trip: ${destination.name}`,
          text: `오늘의 여행지는 ${destination.name}으로 결정!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-6 pb-24">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-sky-500 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        다른 카드 뽑기
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Side (7/12) */}
        <div className="lg:col-span-12 space-y-12">
          {/* Hero Section */}
          <section className="relative h-[50vh] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src={destination.image} 
              alt={destination.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
               <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-white text-sm font-black uppercase tracking-widest">{destination.region}</span>
               </div>
               <div className="flex gap-3">
                  <button 
                    onClick={handleShare}
                    className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/30 hover:bg-white hover:text-sky-500 transition-all"
                  >
                    <Share2 size={20} />
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isFavorite ? 'bg-yellow-400 text-white shadow-lg' : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-yellow-500'
                    }`}
                  >
                    <Star fill={isFavorite ? "currentColor" : "none"} size={20} />
                  </button>
               </div>
            </div>

            <div className="absolute bottom-10 left-10 space-y-2">
               <div className="flex gap-2">
                  {destination.themes.map(t => (
                    <span key={t} className="px-3 py-1 bg-sky-500 text-white text-[0.65rem] font-black rounded-full uppercase"># {t}</span>
                  ))}
               </div>
               <h1 className="text-6xl font-black text-white tracking-tighter">{destination.name}</h1>
               <p className="text-white/80 text-xl font-medium max-w-2xl">{destination.description}</p>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-full shadow-lg border-2 border-slate-50 flex gap-1">
               {(['info', 'course', 'reviews'] as const).map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-8 py-3 rounded-full text-sm font-black transition-all ${
                     activeTab === tab 
                     ? 'bg-sky-500 text-white shadow-md' 
                     : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                   }`}
                 >
                   {tab === 'info' ? '여행 정보' : tab === 'course' ? '추천 코스' : '방문 후기'}
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
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Condition Based Info */}
                <div className="bg-sky-50 rounded-[2.5rem] p-10 space-y-8 border-2 border-sky-100/50">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-sky-800 flex items-center gap-2">
                      <Navigation className="text-sky-500" size={24} />
                      {travelTime === 'day' ? '당일치기 가이드' : '1박 2일 여행 가이드'}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 flex items-center gap-4">
                          <Train className="text-sky-500" size={32} />
                          <div>
                             <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">교통편 및 시간</p>
                             <p className="text-slate-700 font-bold">{destination.estimatedTravelTime}</p>
                          </div>
                       </div>
                       
                       {travelTime === 'day' ? (
                         <>
                           <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 flex items-center gap-4">
                              <Clock className="text-sky-500" size={32} />
                              <div>
                                 <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">권장 체류 시간</p>
                                 <p className="text-slate-700 font-bold">{destination.recommendedStayTime}</p>
                              </div>
                           </div>
                           <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 flex items-center gap-4">
                              <Footprints className="text-sky-500" size={32} />
                              <div>
                                 <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">오늘 복귀 가능 여부</p>
                                 <p className="text-slate-700 font-bold">{destination.canReturnToday ? '당일 복귀 가능(막차 시간 유의)' : '당일 복귀가 어려울 수 있어요'}</p>
                              </div>
                           </div>
                         </>
                       ) : (
                         <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 space-y-4">
                            <div className="flex items-center gap-4">
                               <Bed className="text-sky-500" size={32} />
                               <div>
                                  <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">추천 숙소 타입</p>
                                  <p className="text-slate-700 font-bold">호텔, 펜션 등 다양한 숙소</p>
                               </div>
                            </div>
                            <div className="pt-4 border-t border-sky-50 space-y-3">
                               {destination.accommodations?.map((acc, i) => (
                                 <div key={i} className="flex justify-between items-center bg-sky-50/50 p-3 rounded-2xl">
                                    <div>
                                       <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                                       <p className="text-[0.65rem] text-slate-500 font-bold">{acc.type}</p>
                                    </div>
                                    <span className="text-xs font-black text-sky-600">{acc.priceRange}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* Nearby Spots */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     <Map className="text-yellow-500" size={24} />
                     꼭 가봐야 할 주요 스팟
                   </h3>
                   <div className="space-y-4">
                      {destination.nearbySpots.map((spot, i) => (
                        <div key={i} className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-sky-100 transition-all flex gap-4">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all shrink-0">
                              <Info size={24} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="font-bold text-slate-800 transition-colors group-hover:text-sky-600">{spot.name}</h4>
                              <p className="text-sm text-slate-500 leading-snug">{spot.description}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'course' && (
              <motion.div
                key="course"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3rem] p-12 shadow-xl border-2 border-slate-50"
              >
                <div className="max-w-xl mx-auto space-y-12">
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black text-slate-800">추천 여행 코스</h3>
                      <p className="text-slate-400 font-medium">{travelTime === 'day' ? '가볍고 알찬 당일치기 코스입니다.' : '여유롭게 즐기는 1박 2일 코스입니다.'}</p>
                   </div>
                   
                   <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-sky-200 before:to-transparent">
                      {(travelTime === 'day' ? destination.dayTripCourse : destination.overnightCourse)?.map((step, i) => (
                        <div key={i} className="relative flex items-center gap-6 group">
                           <div className="w-10 h-10 rounded-full border-4 border-white bg-sky-500 text-white font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                              {i + 1}
                           </div>
                           <div className="flex-1 bg-slate-50 p-5 rounded-2xl group-hover:bg-sky-50 transition-colors border border-transparent group-hover:border-sky-100">
                              <p className="font-bold text-slate-700">{step}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <button className="w-full py-5 bg-yellow-400 text-slate-900 rounded-3xl font-black text-lg shadow-xl shadow-yellow-100 hover:bg-yellow-500 transition-all flex items-center justify-center gap-3">
                      이지도로 경로 보기 🗺️
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ReviewSection destinationId={destination.id} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-12">
             <button 
               onClick={onRetry}
               className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-slate-800 transition-all"
             >
               다시 뽑기 🎲
             </button>
             <a 
               href={`https://map.kakao.com/link/search/${encodeURIComponent(destination.mapQuery)}`}
               target="_blank"
               rel="noopener noreferrer"
               className="flex-1 py-5 bg-yellow-400 text-slate-900 rounded-3xl font-black text-xl shadow-xl shadow-yellow-100 hover:bg-yellow-500 transition-all flex items-center justify-center gap-3"
             >
               <MapPin size={24} />
               카카오맵에서 보기
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
