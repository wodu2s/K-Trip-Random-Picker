/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TravelPreferences, TravelTime, TravelTheme } from '../types';
import { MapPin, Clock, Gauge, Palette, Plane } from 'lucide-react';
import { motion } from 'motion/react';
import RadiusMapSection from './RadiusMapSection';

interface InputFormProps {
  onStart: (prefs: TravelPreferences) => void;
}

const THEMES: { id: TravelTheme | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: '전체', icon: '✨' },
  { id: '바다', label: '바다', icon: '🌊' },
  { id: '자연', label: '자연', icon: '🌿' },
  { id: '감성', label: '감성', icon: '📸' },
  { id: '맛집', label: '맛집', icon: '🍱' },
  { id: '문화', label: '문화', icon: '🎨' },
  { id: '액티비티', label: '액티비티', icon: '🪂' },
];

const LOCATIONS = [
  { name: '서울', x: 28, y: 25 },
  { name: '부산', x: 70, y: 85 },
  { name: '대구', x: 58, y: 62 },
  { name: '광주', x: 25, y: 80 },
  { name: '대전', x: 38, y: 50 },
  { name: '제주', x: 25, y: 95 },
];

export default function InputForm({ onStart }: InputFormProps) {
  const [showMap, setShowMap] = useState(false);
  const [prefs, setPrefs] = useState<TravelPreferences>({
    currentLocation: LOCATIONS[0],
    travelTime: 'day',
    maxDistance: 150,
    theme: 'all',
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-2xl shadow-sky-100 border-4 border-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100/50 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-100/50 rounded-full -ml-12 -mb-12 blur-xl" />

      <div className="relative">
        {/* Settings */}
        <div className="space-y-8 max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">어떤 여행을 꿈꾸시나요?</h2>
            <p className="text-slate-400 text-sm font-medium">조건을 입력해주시면 최고의 여행 코스를 찾아드릴게요!</p>
          </div>

          <div className="space-y-6">
            {/* Location Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <MapPin size={16} className="text-sky-500" />
                출발지 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setPrefs({ ...prefs, currentLocation: loc })}
                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      prefs.currentLocation.name === loc.name
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Time */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Clock size={16} className="text-sky-500" />
                여행 기간
              </label>
              <div className="grid grid-cols-2 gap-3">
                 {(['day', 'overnight'] as TravelTime[]).map((t) => (
                   <button
                     key={t}
                     onClick={() => setPrefs({ ...prefs, travelTime: t })}
                     className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                       prefs.travelTime === t 
                       ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-100' 
                       : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                     }`}
                   >
                     {t === 'day' ? '당일치기' : '1박 2일 이상'}
                   </button>
                 ))}
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                  <Gauge size={16} className="text-sky-500" />
                  최대 이동 거리
                </label>
                <div className="flex items-center gap-2">
                   <div className="bg-sky-50 px-3 py-1 rounded-full">
                     <span className="text-sky-600 font-black text-sm">{prefs.maxDistance}km 이내</span>
                   </div>
                   <button 
                     onClick={() => setShowMap(!showMap)}
                     className={`p-2 rounded-lg transition-all ${showMap ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-sky-500 hover:bg-sky-50'}`}
                   >
                     <Plane size={16} className={showMap ? 'rotate-0' : '-rotate-45'} />
                   </button>
                </div>
              </div>

              {/* Map Widget Toggle */}
              <motion.div
                initial={false}
                animate={{ height: showMap ? 'auto' : 0, opacity: showMap ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4">
                  <RadiusMapSection currentLocation={prefs.currentLocation} maxDistance={prefs.maxDistance} />
                </div>
              </motion.div>

              <div className="grid grid-cols-4 gap-2">
                 {[50, 100, 150, 300].map((dist) => (
                   <button
                     key={dist}
                     onClick={() => setPrefs({ ...prefs, maxDistance: dist })}
                     className={`py-2 rounded-xl text-xs font-black transition-all border-2 ${
                       prefs.maxDistance === dist
                       ? 'bg-sky-500 border-sky-400 text-white shadow-md'
                       : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                     }`}
                   >
                     {dist}km
                   </button>
                 ))}
              </div>
              <input 
                type="range" 
                min="30" 
                max="500" 
                step="10"
                value={prefs.maxDistance}
                onChange={(e) => setPrefs({ ...prefs, maxDistance: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 mt-2"
              />
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Palette size={16} className="text-sky-500" />
                선호 테마
              </label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPrefs({ ...prefs, theme: t.id })}
                    className={`px-3 py-2 rounded-full text-[0.7rem] font-bold transition-all border-2 ${
                      prefs.theme === t.id
                      ? 'bg-yellow-400 border-yellow-300 text-slate-900 shadow-md transform -translate-y-0.5'
                      : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="mr-1">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(prefs)}
            className="w-full py-5 bg-sky-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all flex items-center justify-center gap-3 mt-4"
          >
            여행지 뽑기
            <Plane className="rotate-45" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
