import { useMemo } from 'react';
import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import TravelCard from './TravelCard';
import SelectedPreviewPanel from './SelectedPreviewPanel';
import ConditionSummaryBox from './ConditionSummaryBox';
import TravelBoard3D from './TravelBoard3D';
import { buildCardPresentations } from '../utils/cardPresentation';
import { RefreshCcw, Info, RefreshCw } from 'lucide-react';

interface CardListProps {
  destinations: Destination[];
  selectedId: string | null;
  prefs: TripFormState;
  onSelect: (id: string) => void;
  onViewDetail: () => void;
  onRetry: () => void;
  onTripSaved?: () => void;
  onEditPrefs?: () => void;
  onExpandDistance?: () => void;
  onResetTheme?: () => void;
}

export default function CardList({
  destinations,
  selectedId,
  prefs,
  onSelect,
  onViewDetail,
  onRetry,
  onTripSaved,
  onEditPrefs,
  onExpandDistance,
  onResetTheme,
}: CardListProps) {
  const selected = destinations.find((d) => d.id === selectedId) ?? null;
  const hasMockFallback = destinations.some((d) => d.dataSource === 'MOCK_FALLBACK');
  const hasKtoData = destinations.some((d) => d.dataSource === 'KTO_OPEN_API');
  const showMixedDataHint = hasMockFallback && hasKtoData;

  const cardPresentations = useMemo(
    () => buildCardPresentations(destinations, prefs),
    [destinations, prefs],
  );

  if (destinations.length === 0) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <ConditionSummaryBox prefs={prefs} onEdit={onEditPrefs} />
        </div>
        <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-3xl">
          <Info size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">여행지를 찾지 못했어요</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            현재 지역과 거리 조건에서는 추천할 만한 {prefs.theme !== 'all' ? `${prefs.theme} 테마의 ` : ''}여행지가 없어요.<br />
            조건을 조금 완화해서 다시 찾아볼까요?
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={onExpandDistance} className="btn btn-secondary px-6 py-2.5 rounded-full font-bold w-full sm:w-auto">
              거리 넓히기
            </button>
            <button onClick={onResetTheme} className="btn bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-6 py-2.5 rounded-full font-bold shadow-sm w-full sm:w-auto">
              전체 테마로 보기
            </button>
            <button onClick={onEditPrefs} className="text-slate-400 text-sm font-bold sm:ml-2 hover:text-slate-600">
              조건 수정
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-10 space-y-8">
      {/* 상단 헤더 & 보드판 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-700">
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <TravelBoard3D 
            recType={selected ? cardPresentations[destinations.findIndex(d => d.id === selected.id)]?.recommendationType : undefined} 
            compact 
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right">
          <button onClick={onRetry} className="bg-white/10 hover:bg-white/20 text-white font-black rounded-xl py-2 px-4 mb-4 transition-colors flex items-center gap-2">
            <RefreshCw size={16} />
            다시 굴리기
          </button>
          <div className="bg-slate-800 p-3 rounded-2xl w-full">
            <ConditionSummaryBox prefs={prefs} onEdit={onEditPrefs} />
          </div>
        </div>
      </div>

      {showMixedDataHint && (
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 text-slate-500 px-4 py-3 rounded-2xl">
          <Info size={16} className="shrink-0 mt-0.5 text-slate-400" />
          <p className="text-xs font-medium leading-relaxed">
            관광공사 데이터를 우선 사용하고, 일부는 보조 데이터로 보완했습니다.
          </p>
        </div>
      )}

      {/* 메인 획득 카드 */}
      {selected && (
        <div className="w-full">
          <SelectedPreviewPanel
            destination={selected}
            prefs={prefs}
            onViewDetail={onViewDetail}
            onTripSaved={onTripSaved}
            recommendationType={cardPresentations[destinations.findIndex((d) => d.id === selected.id)]?.recommendationType}
          />
        </div>
      )}

      {/* 다른 후보 카드들 */}
      {destinations.length > 1 && (
        <div className="pt-8 border-t-2 border-slate-100 border-dashed">
          <h3 className="text-lg font-black text-slate-700 mb-4 px-2">
            다른 지역에도 방문할 수 있었어요 👀
          </h3>
          <div className="flex overflow-x-auto gap-4 pb-4 px-2 snap-x snap-mandatory scrollbar-hide">
            {destinations.filter(d => d.id !== selectedId).map((dest) => {
              const idx = destinations.findIndex(d => d.id === dest.id);
              return (
                <div key={dest.id} className="snap-center shrink-0 w-[200px]">
                  <TravelCard
                    presentation={cardPresentations[idx]}
                    destination={dest}
                    index={idx}
                    isSelected={false}
                    onSelect={() => onSelect(dest.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
