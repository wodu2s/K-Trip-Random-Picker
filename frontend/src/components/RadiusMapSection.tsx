import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { OriginLocation } from '../constants/origins';

interface RadiusMapSectionProps {
  currentLocation: OriginLocation;
  maxDistance: number;
}

export default function RadiusMapSection({ currentLocation, maxDistance }: RadiusMapSectionProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
          <Navigation className="w-5 h-5 rotate-45" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">이동 거리 안내</p>
          <p className="text-sm font-black text-slate-700">
            {currentLocation.name} 출발 → 최대 {maxDistance}km
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-sky-100/50 space-y-2">
        <div className="flex items-start gap-2.5">
          <span className="text-sky-500 text-xs shrink-0 mt-0.5">✓</span>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            선택한 이동거리 안에서 무리 없는 후보를 찾아요.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="text-sky-500 text-xs shrink-0 mt-0.5">✓</span>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            실제 이동 시간은 카카오맵에서 확인해보세요.
          </p>
        </div>
      </div>

      {/* Dotted path simple visualization */}
      <div className="relative h-14 bg-sky-50/50 rounded-2xl border border-dashed border-sky-200 flex items-center justify-between px-6 overflow-hidden">
        <div className="flex items-center gap-1.5 z-10 relative">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping absolute" />
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-xs font-bold text-slate-700">{currentLocation.name}</span>
        </div>
        <div className="absolute left-[70px] right-[70px] border-t-2 border-dotted border-sky-300" />
        <div className="bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full text-[10px] font-black z-10 shadow-sm border border-sky-200">
          {maxDistance}km
        </div>
        <div className="flex items-center gap-1.5 z-10">
          <span className="text-xs font-bold text-slate-500">추천 권역</span>
          <MapPin className="w-4 h-4 text-sky-500" />
        </div>
      </div>
    </div>
  );
}
