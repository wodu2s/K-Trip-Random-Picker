import { motion } from 'motion/react';
import { MapPin, Coffee, Utensils, TreePine, Camera, Tent, Calendar, Search, Flag } from 'lucide-react';
import { RecommendationType } from '../utils/recommendationType';

interface TravelBoardMapProps {
  recType?: RecommendationType | string;
  isRolling?: boolean;
  compact?: boolean;
}

const BOARD_SPACES = [
  { id: 'START', label: '출발', icon: Flag, bg: '#34d399', fg: '#065f46', shadow: '#059669' },
  { id: '명소', label: '명소', icon: MapPin, bg: '#60a5fa', fg: '#1e3a5f', shadow: '#3b82f6' },
  { id: '카페', label: '카페', icon: Coffee, bg: '#fbbf24', fg: '#78350f', shadow: '#f59e0b' },
  { id: '포토', label: '포토', icon: Camera, bg: '#f472b6', fg: '#831843', shadow: '#ec4899' },
  { id: '맛집', label: '맛집', icon: Utensils, bg: '#fb923c', fg: '#7c2d12', shadow: '#f97316' },
  { id: '이벤트', label: '이벤트', icon: Calendar, bg: '#a78bfa', fg: '#3b0764', shadow: '#8b5cf6' },
  { id: '실내', label: '실내', icon: Tent, bg: '#818cf8', fg: '#1e1b4b', shadow: '#6366f1' },
  { id: '힐링', label: '힐링', icon: TreePine, bg: '#2dd4bf', fg: '#134e4a', shadow: '#14b8a6' },
  { id: '숨은 명소', label: '히든', icon: Search, bg: '#94a3b8', fg: '#1e293b', shadow: '#64748b' },
];

export default function TravelBoardMap({ recType, isRolling = false, compact = false }: TravelBoardMapProps) {
  const getActiveSpaceId = () => {
    if (isRolling || !recType) return 'START';
    if (recType.includes('바다') || recType.includes('자연') || recType.includes('휴식')) return '힐링';
    if (recType.includes('문화') || recType.includes('역사')) return '명소';
    if (recType.includes('산책') || recType.includes('도심')) return '포토';
    if (recType.includes('맛집') || recType.includes('카페')) return '카페';
    return '숨은 명소';
  };

  const activeId = getActiveSpaceId();

  return (
    <div className={`relative ${compact ? 'p-4' : 'p-6 sm:p-8'} rounded-[2rem] overflow-hidden select-none`}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* 배경 도트 패턴 */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* 배경 글로우 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[80px]" />

      <div className="relative z-10">
        {/* 헤더 */}
        <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-5'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <span className="text-lg">🎲</span>
            </div>
            <div>
              <h3 className={`font-black text-white ${compact ? 'text-sm' : 'text-base'}`}>K-Trip 여행 보드판</h3>
              {!compact && <p className="text-[0.6rem] font-bold text-slate-400">주사위를 굴려 여행 칸에 도착하세요</p>}
            </div>
          </div>
          {!isRolling && activeId !== 'START' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 bg-yellow-400 rounded-full text-xs font-black text-yellow-900 shadow-lg shadow-yellow-400/30"
            >
              🏁 도착!
            </motion.div>
          )}
        </div>

        {/* 아이소메트릭 보드판 */}
        <div className="flex justify-center">
          <div
            className="grid gap-2 sm:gap-3 w-full"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', maxWidth: '560px' }}
          >
            {BOARD_SPACES.map((space, idx) => {
              const isActive = activeId === space.id;
              const Icon = space.icon;

              return (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                  className="relative group"
                >
                  {/* 도로 커넥터 */}
                  {idx < BOARD_SPACES.length - 1 && idx % 3 !== 2 && (
                    <div className="hidden sm:block absolute top-1/2 -right-3 w-3 h-1 bg-slate-600 rounded-full -translate-y-1/2 z-0" />
                  )}

                  {/* 아이소메트릭 칸 */}
                  <div
                    className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-500 cursor-default ${
                      compact ? 'p-2.5' : 'p-3 sm:p-4'
                    } ${
                      isActive && !isRolling
                        ? 'z-20 scale-110 sm:scale-115'
                        : isRolling
                          ? 'opacity-40 scale-95'
                          : 'hover:scale-105 hover:-translate-y-1'
                    }`}
                    style={{
                      background: isActive && !isRolling
                        ? space.bg
                        : 'rgba(255,255,255,0.06)',
                      boxShadow: isActive && !isRolling
                        ? `0 8px 0 0 ${space.shadow}, 0 12px 30px -5px ${space.bg}60, inset 0 1px 0 rgba(255,255,255,0.3)`
                        : '0 4px 0 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                      border: isActive && !isRolling
                        ? `3px solid rgba(255,255,255,0.4)`
                        : '2px solid rgba(255,255,255,0.08)',
                      transform: isActive && !isRolling
                        ? 'translateY(-6px)'
                        : undefined,
                    }}
                  >
                    {/* 칸 번호 */}
                    <div
                      className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[0.55rem] font-black shadow-md"
                      style={{
                        background: isActive && !isRolling ? '#fff' : 'rgba(255,255,255,0.15)',
                        color: isActive && !isRolling ? space.shadow : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {idx + 1}
                    </div>

                    <Icon
                      size={compact ? 20 : 26}
                      className="mb-1"
                      style={{
                        color: isActive && !isRolling ? space.fg : 'rgba(255,255,255,0.35)',
                        filter: isActive && !isRolling ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : undefined,
                      }}
                    />
                    <span
                      className={`font-black ${compact ? 'text-[0.6rem]' : 'text-[0.7rem]'}`}
                      style={{
                        color: isActive && !isRolling ? space.fg : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {space.label}
                    </span>

                    {/* 도착 마커 (말/포인터) */}
                    {isActive && !isRolling && space.id !== 'START' && (
                      <motion.div
                        initial={{ y: -20, opacity: 0, scale: 0 }}
                        animate={{ y: -30, opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center"
                      >
                        <span className="text-xl drop-shadow-lg">📍</span>
                      </motion.div>
                    )}
                    {isActive && space.id === 'START' && !isRolling && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2"
                      >
                        <span className="text-lg drop-shadow-lg">🚗</span>
                      </motion.div>
                    )}

                    {/* 활성 칸 글로우 */}
                    {isActive && !isRolling && (
                      <div
                        className="absolute inset-0 rounded-2xl animate-pulse"
                        style={{
                          boxShadow: `0 0 20px ${space.bg}40`,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
