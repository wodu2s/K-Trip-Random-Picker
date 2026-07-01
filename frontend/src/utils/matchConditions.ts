import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';

export interface ConditionCheck {
  label: string;
  ok: boolean;
}

export interface MatchResult {
  total: number;
  matched: number;
  checks: ConditionCheck[];
  matchedLabels: string[];
}

function hasKtoDetail(destination: Destination): boolean {
  const d = destination.detail;
  if (!d) return false;
  return Boolean(
    d.overview ||
      d.useTime ||
      d.infoCenter ||
      d.restDate ||
      d.parking ||
      d.useFee,
  );
}

function hasImage(destination: Destination): boolean {
  return Boolean(
    destination.imageUrl ||
      (destination.detail?.images && destination.detail.images.length > 0),
  );
}

function hasCoords(destination: Destination): boolean {
  return destination.latitude != null && destination.longitude != null;
}

function matchesDistance(destination: Destination, prefs: TripFormState): boolean {
  if (prefs.transportMode === 'flightIncluded') {
    if (destination.region.includes('제주') || destination.address?.includes('제주')) {
      return true;
    }
    return destination.distanceKm == null || destination.distanceKm <= prefs.maxDistanceKm;
  }
  if (destination.distanceKm == null) return true;
  const estimatedDistanceKm = destination.distanceKm * 1.3;
  return estimatedDistanceKm <= prefs.maxDistanceKm;
}

function matchesDuration(destination: Destination, prefs: TripFormState): boolean {
  const isJeju =
    destination.region.includes('제주') || destination.address?.includes('제주');
  if (isJeju && prefs.transportMode === 'local') return false;
  if (isJeju && prefs.duration === 'day') return false;
  return true;
}

function matchesTheme(destination: Destination, prefs: TripFormState): boolean {
  if (prefs.theme === 'all') return true;
  return destination.themes.includes(prefs.theme);
}

export function computeMatchConditions(
  destination: Destination,
  prefs: TripFormState,
): MatchResult {
  const checks: ConditionCheck[] = [
    {
      label: prefs.transportMode === 'local' ? '이동 거리 적합' : '이동 범위 적합',
      ok: matchesDistance(destination, prefs),
    },
    {
      label: prefs.duration === 'day' ? '당일치기 가능' : '1박 이상 적합',
      ok: matchesDuration(destination, prefs),
    },
    {
      label: prefs.theme === 'all' ? '테마 제한 없음' : '선호 테마 반영',
      ok: matchesTheme(destination, prefs),
    },
    {
      label: '관광 상세 정보',
      ok: destination.dataSource === 'KTO_OPEN_API' && hasKtoDetail(destination),
    },
    { label: '대표 이미지', ok: hasImage(destination) },
    { label: '지도 표시 가능', ok: hasCoords(destination) },
  ];

  const matchedLabels = checks.filter((c) => c.ok).map((c) => c.label);

  return {
    total: checks.length,
    matched: matchedLabels.length,
    checks,
    matchedLabels,
  };
}

export function formatMatchSummary(result: MatchResult): string {
  return `${result.total}개 기준 중 ${result.matched}개 충족`;
}

export function getMatchFitLabel(result: MatchResult): string {
  const ratio = result.matched / Math.max(result.total, 1);
  if (ratio >= 0.85) return '이번 일정에 딱 맞는 선택이에요';
  if (ratio >= 0.65) return '가볍게 다녀오기 좋은 후보예요';
  if (ratio >= 0.45) return '도심에서 부담 없이 쉬어가기 좋아요';
  return '이번 일정에 무난한 선택이에요';
}
