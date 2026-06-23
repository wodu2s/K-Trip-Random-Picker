/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Compass, Map as MapIcon, Globe, Sparkles } from 'lucide-react';
import { TravelPreferences } from '../types';
import InputForm from './InputForm';

interface LandingSectionProps {
  onStart: (prefs: TravelPreferences) => void;
}

export default function LandingSection({ onStart }: LandingSectionProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text & Mascot */}
        <div className="space-y-10 text-center lg:text-left">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-yellow-100/50 rounded-full border-2 border-yellow-200"
          >
            <Sparkles size={18} className="text-yellow-600 animate-pulse" />
            <span className="text-sm font-black text-yellow-700 tracking-tight uppercase">Discover South Korea</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]"
            >
              당신의 다음 <br /> 
              <span className="text-sky-500">여행지</span>는?
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              간단한 조건만 입력하면, 이모지 퀴즈 카드가 나타납니다. <br />
              카드를 뒤집어 숨겨진 한국의 명소를 발견해보세요! 🗺️
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative inline-block"
          >
             <div className="w-40 h-40 bg-sky-100 rounded-[2.5rem] flex items-center justify-center relative shadow-2xl shadow-sky-100 border-4 border-white rotate-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 0.95, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                   <Compass size={80} className="text-sky-500" />
                </motion.div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center -rotate-12 shadow-xl border-4 border-white">
                   <Globe size={32} className="text-white" />
                </div>
             </div>
          </motion.div>
          
          <div className="pt-10 flex flex-wrap justify-center lg:justify-start gap-8 opacity-20 filter grayscale">
             <MapIcon size={80} className="text-slate-400" />
             <Globe size={80} className="text-slate-400" />
          </div>
        </div>

        {/* Right: Input Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 20 }}
        >
          <InputForm onStart={onStart} />
        </motion.div>
      </div>
    </div>
  );
}
