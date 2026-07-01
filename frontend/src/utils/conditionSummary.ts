import { TripFormState } from '../types/trip';

export function getTransportHint(transportMode: TripFormState['transportMode']): string {
  return transportMode === 'local'
    ? '설정한 거리 이내 지역만 추천해요.'
    : '항공 이동 가능 지역까지 추천해요.';
}

export function formatConditionSummary(prefs: TripFormState): string {
  const duration = prefs.duration === 'day' ? '당일치기' : '1박 2일 이상';
  const transport = prefs.transportMode === 'local' ? '근교 이동' : '항공 포함';
  const distancePart =
    prefs.transportMode === 'local'
      ? `${prefs.maxDistanceKm}km 이내`
      : '장거리/항공권역 포함';
  const theme = prefs.theme === 'all' ? '전체 테마' : `${prefs.theme} 테마`;

  let originStr = prefs.originMode === 'current' ? '현재 위치 기준' : `${prefs.origin} 출발`;
  if (prefs.originMode === 'current' && prefs.origin && prefs.origin !== '현재 위치') {
    originStr = `현재 위치 기준 · ${prefs.origin} 근처`;
  }
  return `${originStr} · ${duration} · ${transport} · ${distancePart} · ${theme}`;
}
