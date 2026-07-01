import { TripFormState } from '../types/trip';
import { formatConditionSummary } from '../utils/conditionSummary';
import { SlidersHorizontal, Settings2 } from 'lucide-react';

interface ConditionSummaryBoxProps {
  prefs: TripFormState;
  onEdit?: () => void;
}

export default function ConditionSummaryBox({ prefs, onEdit }: ConditionSummaryBoxProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-sky-50/80 border-2 border-sky-100 rounded-2xl px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
          <SlidersHorizontal size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-black text-sky-500 uppercase tracking-widest mb-0.5">
            선택 조건 요약
          </p>
          <p className="text-sm font-bold text-slate-700 leading-relaxed break-keep">
            {formatConditionSummary(prefs)}
          </p>
        </div>
      </div>
      
      {onEdit && (
        <button 
          onClick={onEdit}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-sky-200 text-xs font-bold text-sky-600 hover:bg-sky-100 hover:text-sky-700 transition-colors shadow-sm"
        >
          <Settings2 size={14} />
          조건 수정
        </button>
      )}
    </div>
  );
}
