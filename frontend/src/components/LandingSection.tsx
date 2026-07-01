import { useState } from 'react';
import { motion } from 'motion/react';
import { TripFormState } from '../types/trip';
import { ORIGINS } from '../constants/origins';
import InputForm from '../components/InputForm';
import TravelBoard3D from './TravelBoard3D';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LandingSectionProps {
  onStart: (prefs: TripFormState) => void;
  initialPrefs?: TripFormState | null;
}

export default function LandingSection({ onStart, initialPrefs }: LandingSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [prefs, setPrefs] = useState<TripFormState>(
    initialPrefs || {
      originMode: 'preset',
      origin: ORIGINS[0].name,
      originCoords: ORIGINS[0],
      duration: 'day',
      maxDistanceKm: 150,
      transportMode: 'local',
      theme: 'all',
    }
  );

  const handleStart = (prefs: TripFormState) => {
    setIsRolling(true);
    setTimeout(() => {
      setIsRolling(false);
      onStart(prefs);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
    >
      {/* 배경 도트 + 글로우 */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8">
        {/* 타이틀 (짧게) */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-400/15 rounded-full border border-yellow-400/30">
            <span className="text-sm">🎲</span>
            <span className="text-xs font-black text-yellow-400 tracking-wider uppercase">K-Trip Board</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            주사위를 굴려<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              여행 카드
            </span>를 획득하세요
          </h1>
          <p className="text-sm text-slate-400 font-bold">
            조건을 선택하고 주사위를 굴리면, 보드판 위에서 당신의 여행지가 결정됩니다
          </p>
        </motion.div>

        {/* 3D 보드판 (히어로 — 가장 큰 요소) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
          className="w-full flex justify-center py-4"
        >
          <TravelBoard3D isRolling={isRolling} />
        </motion.div>

        {/* 조건 토글 + CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-lg space-y-4"
        >
          {/* 조건 접기/펼치기 */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
          >
            <span className="text-sm font-black">⚙️ 여행 조건 설정</span>
            {showForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <motion.div
            initial={false}
            animate={{ height: showForm ? 'auto' : 0, opacity: showForm ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              <InputForm prefs={prefs} onPrefsChange={setPrefs} />
              
              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.95, translateY: 2 }}
                onClick={() => handleStart(prefs)}
                className="w-full h-[64px] text-white text-xl font-black rounded-2xl flex items-center justify-center gap-2 mt-4 transition-all bg-gradient-to-b from-sky-400 to-sky-500 shadow-[0_6px_0_0_#0ea5e9,0_10px_15px_-3px_rgba(14,165,233,0.5)] border-[3px] border-sky-300 active:shadow-[0_0px_0_0_#0ea5e9] active:translate-y-[6px]"
              >
                🎲 랜덤 여행 굴리기!
              </motion.button>
            </div>
          </motion.div>

          {/* CTA 버튼 (폼이 접혀있을 때도 항상 보임) */}
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.02, translateY: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleStart(prefs)}
              className="w-full h-16 bg-gradient-to-r from-sky-500 to-sky-400 text-white text-xl font-black rounded-2xl shadow-[0_6px_0_0_#0284c7,0_12px_30px_-5px_rgba(14,165,233,0.5)] border-2 border-sky-300/50 flex items-center justify-center gap-3 active:shadow-[0_0px_0_0_#0284c7] active:translate-y-[6px] transition-all"
            >
              🎲 랜덤 여행 굴리기!
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* 하단 안내 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-[0.65rem] text-slate-600 font-bold"
      >
        한국관광공사 TourAPI · Kakao 주변장소 데이터 기반
      </motion.p>
    </div>
  );
}
