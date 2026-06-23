/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Destination } from '../types';
import TravelCard from './TravelCard';
import { motion } from 'motion/react';
import { RefreshCcw } from 'lucide-react';

interface CardListProps {
  destinations: Destination[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

export default function CardList({ destinations, selectedId, onSelect, onRetry }: CardListProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">카드를 골라주세요</h2>
          <p className="text-slate-500">당신의 직감을 믿어보세요! ✨</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-2xl border-2 border-slate-100 hover:border-sky-200 hover:text-sky-500 transition-all shadow-sm font-bold"
        >
          <RefreshCcw size={18} />
          다시 섞기
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
        {destinations.map((dest, idx) => (
          <TravelCard
            key={`${dest.id}-${idx}`}
            destination={dest}
            index={idx}
            isSelected={selectedId === dest.id}
            onSelect={onSelect}
          />
        ))}
      </div>
      
      {selectedId && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-16 text-center"
        >
          <p className="text-slate-400 font-medium">카드를 다시 클릭하거나 하단 버튼을 눌러 상세 정보를 확인하세요.</p>
        </motion.div>
      )}
    </div>
  );
}
