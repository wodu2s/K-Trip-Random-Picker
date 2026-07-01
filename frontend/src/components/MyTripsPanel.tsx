import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, MessageCircle, RefreshCcw, Compass } from 'lucide-react';
import { SavedTrip, formatSavedAt } from '../utils/savedTrips';
import DataSourceBadge from './DataSourceBadge';
import ReasonBadges from './ReasonBadges';

interface MyTripsPanelProps {
  open: boolean;
  trips: SavedTrip[];
  onClose: () => void;
  onOpenTrip: (trip: SavedTrip) => void;
  onRetryWithPrefs: (trip: SavedTrip) => void;
  onWriteReview: (trip: SavedTrip) => void;
  onRemove: (destinationId: string) => void;
}

export default function MyTripsPanel({
  open,
  trips,
  onClose,
  onOpenTrip,
  onRetryWithPrefs,
  onWriteReview,
  onRemove,
}: MyTripsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-sky-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><span className="text-emerald-500">🏆</span> 내 여행 앨범</h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  수집한 랜덤 여행 카드 도감
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              {trips.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-5">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-sky-50 to-yellow-50 text-sky-400 flex items-center justify-center border-2 border-sky-100">
                    <Compass size={36} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-700 font-black text-lg">아직 획득한 여행 코스 카드가 없습니다.</p>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                      랜덤 여행을 굴리고 마음에 드는 카드를 저장하여<br />
                      나만의 여행 앨범을 채워보세요! 🎲
                    </p>
                  </div>
                </div>
              ) : (
                Object.entries(
                  trips.reduce((acc, trip) => {
                    const type = trip.recommendationType || '기타 명소';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(trip);
                    return acc;
                  }, {} as Record<string, SavedTrip[]>)
                ).map(([type, typeTrips]) => (
                  <div key={type} className="space-y-4 pb-4">
                    <h3 className="text-sm font-black text-slate-500 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                      <Star size={16} className="text-yellow-400" fill="currentColor" />
                      {type} 콜렉션 <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">{typeTrips.length}장</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {typeTrips.map((trip) => {
                        const region = trip.destination.address?.split(' ').slice(0, 2).join(' ') || '지역 정보 없음';
                        const spotsCount = trip.destination.detail?.nearbyStays?.length ?? 0;
                        
                        return (
                          <div
                            key={trip.id}
                            className="bg-white border-[3px] border-sky-100 rounded-[1.5rem] p-4 space-y-3 relative overflow-hidden group hover:border-sky-300 transition-all hover:shadow-md"
                          >
                            <div className="absolute top-0 right-0 bg-sky-100 text-sky-700 text-[0.55rem] font-black px-2 py-1 rounded-bl-lg">
                              획득 카드
                            </div>

                            <div className="flex items-start justify-between gap-2 mt-1">
                              <div className="min-w-0">
                                <h4 className="text-base font-black text-slate-800 truncate pr-12">
                                  {trip.destination.title}
                                </h4>
                                <p className="text-[0.65rem] font-bold text-slate-400 flex items-center gap-1 truncate mt-0.5">
                                  <MapPin size={10} />
                                  {region} · 주변 {spotsCount}곳
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 text-[0.65rem] font-bold text-slate-500">
                              <p>📅 획득: {formatSavedAt(trip.savedAt)}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <DataSourceBadge source={trip.destination.dataSource} />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => onOpenTrip(trip)}
                                className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-black h-[32px] rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                🗺️ 카드 열기
                              </button>
                              <button
                                onClick={() => onWriteReview(trip)}
                                className="w-[32px] h-[32px] bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <MessageCircle size={14} />
                              </button>
                              <button
                                onClick={() => onRemove(trip.destinationId)}
                                className="w-[32px] h-[32px] bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
