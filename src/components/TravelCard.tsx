/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Destination } from '../types';
import { Sparkles, HelpCircle, MapPin, ExternalLink, Star } from 'lucide-react';
import React from 'react';

export interface TravelCardProps {
  destination: Destination;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}

const TravelCard: React.FC<TravelCardProps> = ({ destination, isSelected, onSelect, index }) => {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', damping: 15 }}
      className="perspective-1000 w-full aspect-[3/4.2] max-w-[280px]"
    >
      <motion.div
        whileHover={{ scale: 1.05, rotateY: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(destination.id)}
        className="relative w-full h-full cursor-pointer transition-all duration-700 preserve-3d"
        animate={{ rotateY: isSelected ? 180 : 0 }}
      >
        {/* Front Side: Quiz Reveal */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-[2rem] p-8 flex flex-col items-center justify-between text-center shadow-xl border-8 border-sky-100 group overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-300 via-yellow-300 to-green-300" />
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-50 rounded-full blur-2xl group-hover:bg-yellow-100/50 transition-colors" />

          <div className="w-full space-y-1">
             <span className="text-[0.65rem] font-black text-sky-400 uppercase tracking-[0.2em] block">RANDOM TRIP</span>
             <h3 className="text-xl font-black text-slate-700 tracking-tighter">CARD {String(index + 1).padStart(2, '0')}</h3>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-2">
              {destination.emojiHint.map((emoji, i) => (
                <motion.span 
                  key={i} 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="text-4xl filter drop-shadow-sm"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <div className="space-y-4">
               <div className="bg-sky-50 px-4 py-1.5 rounded-full inline-block">
                  <span className="text-sm font-bold text-sky-600"># {destination.keyword}</span>
               </div>
               <p className="text-slate-400 text-sm font-bold animate-pulse flex items-center justify-center gap-1">
                 <HelpCircle size={14} />
                 이곳은 어디일까요?
               </p>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-50">
             <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-sky-100">
                <Sparkles size={20} className="text-white" />
             </div>
          </div>
        </div>

        {/* Back Side: Revealed Destination */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-[2rem] flex flex-col shadow-2xl border-4 border-white overflow-hidden">
           <div className="h-2/5 relative">
              <img 
                src={destination.image} 
                alt={destination.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6">
                 <div className="flex items-center gap-1 text-white/80 text-xs font-bold mb-1">
                    <MapPin size={12} className="text-yellow-400" />
                    {destination.region}
                 </div>
                 <h4 className="text-2xl font-black text-white tracking-tight leading-none">{destination.name}</h4>
              </div>
           </div>

           <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                 <div className="flex flex-wrap gap-1.5">
                    {destination.themes.map(t => (
                      <span key={t} className="text-[0.65rem] font-bold px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full"># {t}</span>
                    ))}
                 </div>
                 <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{destination.description}</p>
              </div>

              <div className="space-y-2 pt-4">
                 <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-sm font-black rounded-xl shadow-lg shadow-yellow-100 transition-all flex items-center justify-center gap-2">
                    추천 장소 보기
                    <Sparkles size={14} />
                 </button>
                 <div className="flex gap-2">
                    <a 
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(destination.mapQuery)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md"
                      onClick={e => e.stopPropagation()}
                    >
                      <MapPin size={12} />
                      카카오맵에서 보기
                    </a>
                    <button className="w-11 h-11 bg-slate-50 hover:bg-slate-100 text-slate-300 rounded-xl flex items-center justify-center transition-all">
                       <Star size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TravelCard;
