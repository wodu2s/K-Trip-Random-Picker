import { MatchResult, formatMatchSummary, getMatchFitLabel } from '../utils/matchConditions';
import { CheckCircle2, Heart } from 'lucide-react';

interface MatchConditionBadgeProps {
  match: MatchResult;
  variant?: 'compact' | 'full';
}

export default function MatchConditionBadge({
  match,
  variant = 'compact',
}: MatchConditionBadgeProps) {
  const ratio = match.matched / Math.max(match.total, 1);
  const fitLabel = getMatchFitLabel(match);
  const tone =
    ratio >= 0.8
      ? 'bg-emerald-50 border-emerald-100'
      : ratio >= 0.5
        ? 'bg-sky-50 border-sky-100'
        : 'bg-yellow-50 border-yellow-100';

  const barColor =
    ratio >= 0.8 ? 'bg-emerald-400' : ratio >= 0.5 ? 'bg-sky-400' : 'bg-yellow-400';

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Heart size={16} className="text-sky-500" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-bold text-slate-500">이 여행이 괜찮은 이유</p>
          <p className="text-sm font-black text-slate-800">{fitLabel}</p>
          {variant === 'full' && (
            <p className="text-[0.65rem] font-medium text-slate-400 mt-1">
              {formatMatchSummary(match)}
            </p>
          )}
          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {variant === 'full' && match.checks.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {match.checks.map((check) => (
            <div
              key={check.label}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border ${
                check.ok
                  ? 'bg-white border-emerald-100 text-slate-700'
                  : 'bg-white/60 border-slate-100 text-slate-400'
              }`}
            >
              <CheckCircle2
                size={15}
                className={check.ok ? 'text-emerald-500 shrink-0' : 'text-slate-300 shrink-0'}
              />
              <span className="text-xs font-bold leading-snug">{check.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
