import { type ReactNode, useState } from 'react';
import { Clock, CalendarOff, Phone, Car, Ticket, MapPin, AlertTriangle, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Destination } from '../types/destination';
import { buildPreVisitTips } from '../utils/tripInsights';

interface InfoCardProps {
  label: string;
  value?: string;
  icon: ReactNode;
}

function formatLongValue(val: string): string {
  if (val.length <= 25) return val;
  
  // 운영 시간, 요금 형태면 짧게 요약
  if (val.includes('0') || val.includes('원')) {
    const parts = val.split(/(?=\s[가-힣]+요일|\s[가-힣]+\s?[0-9,]+원)/);
    if (parts.length > 1 && parts[0].length > 5) {
      let first = parts[0].trim();
      first = first.replace(/월요일/g, '월').replace(/화요일/g, '화').replace(/수요일/g, '수')
                   .replace(/목요일/g, '목').replace(/금요일/g, '금').replace(/토요일/g, '토')
                   .replace(/일요일/g, '일');
      return `${first} 외`;
    }
  }
  return val;
}

function InfoCard({ label, value, icon }: InfoCardProps) {
  if (!value) return null;
  const val = value.trim();
  const invalidValues = ['정보 없음', '기본 정보 확인 중', 'undefined', 'null', '*', ''];
  if (invalidValues.includes(val) || val === '-') return null;

  const displayVal = formatLongValue(val);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-black text-sky-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm text-slate-700 font-bold leading-snug break-keep line-clamp-2" title={val}>
          {displayVal}
        </p>
      </div>
    </div>
  );
}

interface KtoDetailInfoProps {
  destination: Destination;
}

export default function KtoDetailInfo({ destination }: KtoDetailInfoProps) {
  const [expanded, setExpanded] = useState(false);
  const detail = destination.detail;
  
  let distanceValue = '';
  const t = destination.travelInfo;
  if (t?.carDurationText && t?.distanceText) {
    distanceValue = `자동차 약 ${t.carDurationText} (도로거리 ${t.distanceText})`;
  } else if (destination.distanceKm) {
    distanceValue = `직선거리 약 ${Math.round(destination.distanceKm)}km`;
  }

  const tips = buildPreVisitTips(destination);

  const extraCards = detail?.extraInfo
    ? Object.entries(detail.extraInfo)
        .filter(([_, value]) => value && value !== '정보 없음' && value !== '-' && value !== 'null' && value !== 'undefined')
        .map(([key, value]) => ({ label: key, value, icon: <CheckSquare size={16} /> }))
    : [];

  const mainCards = [
    { label: '운영 시간', value: detail?.useTime, icon: <Clock size={16} /> },
    { label: '쉬는 날', value: detail?.restDate, icon: <CalendarOff size={16} /> },
    { label: '주차', value: detail?.parking, icon: <Car size={16} /> },
    { label: '입장료', value: detail?.useFee, icon: <Ticket size={16} /> },
    { label: '문의', value: detail?.infoCenter, icon: <Phone size={16} /> },
    { label: '이동 정보', value: distanceValue, icon: <MapPin size={16} /> },
  ].filter(c => c.value);

  const tipCards = tips.map((tip, idx) => {
    let icon = <AlertTriangle size={16} />;
    if (tip.includes('주차')) icon = <Car size={16} />;
    else if (tip.includes('노을') || tip.includes('시간대')) icon = <Clock size={16} />;
    
    return { label: `팁 ${idx + 1}`, value: tip, icon };
  });

  const allCards = [...mainCards, ...extraCards, ...tipCards];

  if (allCards.length === 0) return null;

  const displayCards = expanded ? allCards : allCards.slice(0, 6);
  const hasMore = allCards.length > 6;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
        <Clock className="text-sky-500" size={20} />
        방문 전 정보
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {displayCards.map((card, idx) => (
          <InfoCard key={idx} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-colors"
        >
          {expanded ? '접기' : `더 알아보기 (+${allCards.length - 6}개)`}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}
