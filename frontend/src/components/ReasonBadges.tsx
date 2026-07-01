import { Sparkles } from 'lucide-react';

interface ReasonBadgesProps {
  reasons: string[];
  title?: string;
  variant?: 'panel' | 'inline';
}

export default function ReasonBadges({
  reasons,
  title = '추천 포인트',
  variant = 'panel',
}: ReasonBadgesProps) {
  if (reasons.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {reasons.map((reason) => (
          <span
            key={reason}
            className="chip"
          >
            <Sparkles size={12} className="text-yellow-500 shrink-0" />
            {reason}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 border-2 border-sky-50 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <Sparkles size={16} className="text-yellow-500" />
        {title}
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {reasons.map((reason) => (
          <li
            key={reason}
            className="flex items-start gap-2 bg-sky-50/60 px-4 py-3 rounded-2xl border border-sky-100"
          >
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[0.6rem] font-black flex items-center justify-center shrink-0 mt-0.5">
              ✓
            </span>
            <span className="text-sm font-bold text-slate-700 leading-snug">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
