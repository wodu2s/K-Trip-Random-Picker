import { motion } from 'motion/react';
import { MapPin, Coffee, Utensils, TreePine, Camera, Tent, Calendar, Search, Flag } from 'lucide-react';
import { RecommendationType } from '../utils/recommendationType';

interface TravelBoard3DProps {
  recType?: RecommendationType | string;
  isRolling?: boolean;
  compact?: boolean;
}

const TILES = [
  { id: 'START', label: '출발', icon: Flag, color: '#34d399', dark: '#059669', row: 0, col: 0 },
  { id: '명소', label: '명소', icon: MapPin, color: '#60a5fa', dark: '#2563eb', row: 0, col: 1 },
  { id: '카페', label: '카페', icon: Coffee, color: '#fbbf24', dark: '#d97706', row: 0, col: 2 },
  { id: '포토', label: '포토', icon: Camera, color: '#f472b6', dark: '#db2777', row: 0, col: 3 },
  { id: '맛집', label: '맛집', icon: Utensils, color: '#fb923c', dark: '#ea580c', row: 0, col: 4 },
  { id: '힐링', label: '힐링', icon: TreePine, color: '#2dd4bf', dark: '#0d9488', row: 1, col: 4 },
  { id: '실내', label: '실내', icon: Tent, color: '#818cf8', dark: '#6366f1', row: 1, col: 3 },
  { id: '이벤트', label: '이벤트', icon: Calendar, color: '#a78bfa', dark: '#7c3aed', row: 1, col: 2 },
  { id: '숨은 명소', label: '히든', icon: Search, color: '#94a3b8', dark: '#475569', row: 1, col: 1 },
];

function getActiveId(recType?: string) {
  if (!recType) return 'START';
  if (recType.includes('바다') || recType.includes('자연') || recType.includes('휴식')) return '힐링';
  if (recType.includes('문화') || recType.includes('역사')) return '명소';
  if (recType.includes('산책') || recType.includes('도심')) return '포토';
  if (recType.includes('맛집') || recType.includes('카페')) return '카페';
  return '숨은 명소';
}

export default function TravelBoard3D({ recType, isRolling = false, compact = false }: TravelBoard3DProps) {
  const activeId = isRolling ? '' : getActiveId(recType);
  const sz = compact ? 68 : 96;
  const gap = compact ? 6 : 10;

  return (
    <div
      className="w-full flex justify-center select-none"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative"
        style={{
          transform: `rotateX(${compact ? 18 : 28}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 도로 배경 */}
        <div
          className="absolute rounded-[1.5rem]"
          style={{
            inset: `-${gap * 2}px`,
            background: 'rgba(15,23,42,0.6)',
            border: '2px solid rgba(255,255,255,0.04)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
          }}
        />

        {/* 보드 그리드 */}
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(5, ${sz}px)`,
            gridTemplateRows: `repeat(2, ${sz}px)`,
            gap: `${gap}px`,
          }}
        >
          {TILES.map((tile, idx) => {
            const active = activeId === tile.id;
            const Icon = tile.icon;

            return (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                style={{ gridRow: tile.row + 1, gridColumn: tile.col + 1 }}
                className="relative"
              >
                <div
                  className="w-full h-full rounded-xl flex flex-col items-center justify-center transition-all duration-500"
                  style={{
                    background: active
                      ? `linear-gradient(145deg, ${tile.color}, ${tile.dark})`
                      : 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,1))',
                    boxShadow: active
                      ? `0 ${compact ? 6 : 10}px 0 ${tile.dark}, 0 ${compact ? 12 : 24}px 40px -8px ${tile.color}70, inset 0 1px 0 rgba(255,255,255,0.4)`
                      : '0 4px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                    border: active ? '2px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
                    transform: active ? `translateY(-${compact ? 4 : 8}px) translateZ(16px)` : isRolling ? 'scale(0.93)' : 'none',
                    opacity: isRolling ? 0.35 : 1,
                    transformStyle: 'preserve-3d',
                    zIndex: active ? 20 : 1,
                    position: 'relative',
                  }}
                >
                  {/* 순번 */}
                  <span
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-black"
                    style={{
                      background: active ? '#fff' : 'rgba(255,255,255,0.1)',
                      color: active ? tile.dark : 'rgba(255,255,255,0.25)',
                      boxShadow: active ? `0 2px 8px ${tile.dark}80` : 'none',
                    }}
                  >
                    {idx + 1}
                  </span>

                  <Icon
                    size={compact ? 18 : 28}
                    style={{
                      color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
                      filter: active ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
                      marginBottom: compact ? 2 : 4,
                    }}
                  />
                  <span
                    className={`font-black ${compact ? 'text-[0.5rem]' : 'text-[0.65rem]'}`}
                    style={{ color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)' }}
                  >
                    {tile.label}
                  </span>

                  {/* 말(Pawn) */}
                  {active && (
                    <motion.span
                      initial={{ y: -20, opacity: 0, scale: 0 }}
                      animate={{ y: compact ? -26 : -34, opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 10, delay: 0.3 }}
                      className={`absolute top-0 left-1/2 -translate-x-1/2 ${compact ? 'text-base' : 'text-2xl'} drop-shadow-lg`}
                    >
                      {tile.id === 'START' ? '🚗' : '📍'}
                    </motion.span>
                  )}

                  {/* 글로우 */}
                  {active && (
                    <div
                      className="absolute inset-0 rounded-xl animate-pulse pointer-events-none"
                      style={{ boxShadow: `0 0 24px ${tile.color}40` }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* 중앙 주사위 영역 (row2 col1) */}
          <div
            className="flex items-center justify-center"
            style={{ gridRow: 2, gridColumn: 1 }}
          >
            <motion.span
              animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
              transition={isRolling ? { repeat: Infinity, duration: 0.4, ease: 'linear' } : {}}
              className={`${compact ? 'text-2xl' : 'text-4xl'} drop-shadow-lg`}
            >
              🎲
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}
