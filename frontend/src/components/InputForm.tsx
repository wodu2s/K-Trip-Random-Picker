import { useState } from 'react';
import { TripFormState, TravelTheme, Duration, TransportMode } from '../types/trip';
import { ORIGINS } from '../constants/origins';
import { MapPin, Clock, Gauge, Palette, Plane, Car } from 'lucide-react';
import { motion } from 'motion/react';
import RadiusMapSection from './RadiusMapSection';
import { formatConditionSummary, getTransportHint } from '../utils/conditionSummary';

interface InputFormProps {
  prefs: TripFormState;
  onPrefsChange: (prefs: TripFormState) => void;
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

const TRANSPORT_OPTIONS: { value: TransportMode; label: string; icon: typeof Car }[] = [
  { value: 'local', label: '근교 이동', icon: Car },
  { value: 'flightIncluded', label: '항공 포함', icon: Plane },
];

export default function InputForm({ prefs, onPrefsChange }: InputFormProps) {
  const [showMap, setShowMap] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const selectOrigin = (loc: (typeof ORIGINS)[number]) => {
    onPrefsChange({
      ...prefs,
      originMode: 'preset',
      origin: loc.name,
      originCoords: loc,
      originLat: undefined,
      originLng: undefined,
    });
    setLocationError(null);
  };

  const handleCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('현재 위치를 사용할 수 없어 선택한 출발지 기준으로 추천해드릴게요.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onPrefsChange({
          ...prefs,
          originMode: 'current',
          origin: '현재 위치',
          originLat: position.coords.latitude,
          originLng: position.coords.longitude,
        });
      },
      () => {
        setLocationError('현재 위치를 사용할 수 없어 선택한 출발지 기준으로 추천해드릴게요.');
      }
    );
  };



  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-2xl shadow-sky-100 border-4 border-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100/50 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-100/50 rounded-full -ml-12 -mb-12 blur-xl" />

      <div className="relative">
        <div className="space-y-5 max-w-xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">어떤 여행을 꿈꾸시나요?</h2>
            <p className="text-slate-400 text-sm font-medium">조건에 맞는 여행지를 데이터 기반으로 추천해 드려요</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <MapPin size={16} className="text-sky-500" />
                출발지 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCurrentLocation}
                  className={`col-span-3 py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                    prefs.originMode === 'current'
                      ? 'bg-sky-500 border-sky-400 text-white'
                      : 'bg-sky-50 border-sky-100 text-sky-600 hover:bg-sky-100'
                  }`}
                >
                  <MapPin size={16} />
                  현재 위치로 추천받기
                </button>
                {ORIGINS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => selectOrigin(loc)}
                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      prefs.originMode === 'preset' && prefs.origin === loc.name
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
              {locationError && (
                <p className="text-rose-500 text-xs font-bold mt-2">{locationError}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Clock size={16} className="text-sky-500" />
                여행 기간
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['day', 'overnight'] as Duration[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onPrefsChange({ ...prefs, duration: t })}
                    className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                      prefs.duration === t
                        ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-100'
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {t === 'day' ? '당일치기' : '1박 2일 이상'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Car size={16} className="text-sky-500" />
                이동 방식
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TRANSPORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => onPrefsChange({ ...prefs, transportMode: value })}
                    className={`py-3 rounded-2xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                      prefs.transportMode === value
                        ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-100'
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} className={value === 'flightIncluded' ? 'rotate-45' : ''} />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[0.7rem] text-slate-400">{getTransportHint(prefs.transportMode)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                  <Gauge size={16} className="text-sky-500" />
                  {prefs.transportMode === 'local' ? '최대 이동 거리' : '이동 범위'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-sky-50 px-3 py-1 rounded-full">
                    <span className="text-sky-600 font-black text-sm">
                      {prefs.transportMode === 'local'
                        ? `${prefs.maxDistanceKm}km 이내`
                        : '장거리/항공권역 포함'}
                    </span>
                  </div>
                  {prefs.transportMode === 'local' && (
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className={`p-2 rounded-lg transition-all ${showMap ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-sky-500 hover:bg-sky-50'}`}
                    >
                      <Plane size={16} className={showMap ? 'rotate-0' : '-rotate-45'} />
                    </button>
                  )}
                </div>
              </div>

              {prefs.transportMode === 'local' ? (
                <>
                  <motion.div
                    initial={false}
                    animate={{ height: showMap ? 'auto' : 0, opacity: showMap ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4">
                      <RadiusMapSection currentLocation={prefs.originCoords} maxDistance={prefs.maxDistanceKm} />
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 150, 300].map((dist) => (
                      <button
                        key={dist}
                        onClick={() => onPrefsChange({ ...prefs, maxDistanceKm: dist })}
                        className={`py-2 rounded-xl text-xs font-black transition-all border-2 ${
                          prefs.maxDistanceKm === dist
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
                    value={prefs.maxDistanceKm}
                    onChange={(e) => onPrefsChange({ ...prefs, maxDistanceKm: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 mt-2"
                  />
                </>
              ) : (
                <p className="text-[0.7rem] text-slate-400 leading-relaxed">
                  항공 이동이 가능한 장거리 여행지까지 추천 범위에 포함됩니다.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Palette size={16} className="text-sky-500" />
                선호 테마
              </label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onPrefsChange({ ...prefs, theme: t.id })}
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
        </div>
      </div>
    </div>
  );
}
