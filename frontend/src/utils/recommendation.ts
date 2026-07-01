import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { getRecommendationType } from './recommendationType';

export function buildRecommendationReasons(
  destination: Destination,
  prefs: TripFormState,
): string[] {
  const reasons: string[] = [];
  const text = (destination.title + ' ' + destination.summary + ' ' + (destination.detail?.overview ?? '')).toLowerCase();

  // 1. 장소/테마 기반 문구
  if (/사찰|절|정사|암자|고즈넉|조용/.test(text)) {
    reasons.push('조용한 분위기 속에서 차분히 둘러보기 좋아요');
  } else if (/해변|해수욕장|바다/.test(text)) {
    reasons.push('바다 풍경을 감상하며 산책하기 좋아요');
  } else if (/숲|산|자연|수목원/.test(text)) {
    reasons.push('자연 속에서 여유롭게 쉬어가기 좋아요');
  } else if (/문화재|역사|박물관|전시/.test(text)) {
    reasons.push('역사와 문화를 살펴볼 수 있는 장소예요');
  } else if (/카페|디저트|골목/.test(text)) {
    reasons.push('동네 감성을 느끼며 쉬어가기 좋아요');
  } else {
    reasons.push('오늘 일정에 잘 어울리는 장소예요');
  }

  // 2. 거리 기반 문구
  if (destination.distanceKm != null) {
    if (destination.distanceKm < 30) {
      reasons.push(`현재 위치에서 가까워 부담 없이 다녀오기 좋아요`);
    } else if (destination.distanceKm < 100) {
      reasons.push(`현재 위치에서 약 ${Math.round(destination.distanceKm)}km 거리라 이동 부담이 크지 않아요`);
    } else {
      reasons.push(`조금 멀더라도 새로운 풍경을 만나기 좋은 곳이에요`);
    }
  }

  // 3. 코스 기반 문구
  const d = destination.detail;
  const hasAttractions = (d?.nearbyAttractions?.length ?? 0) > 0;
  const hasCafes = (d?.nearbyCafes?.length ?? 0) > 0;
  const hasRestaurants = (d?.nearbyRestaurants?.length ?? 0) > 0;
  
  if (hasAttractions && hasCafes) {
    reasons.push('주변 산책지와 카페를 함께 묶기 좋아요');
  } else if (hasAttractions) {
    reasons.push('주변 명소와 함께 산책 코스를 짜기 좋아요');
  } else if (hasCafes || hasRestaurants) {
    reasons.push('근처 맛집이나 카페와 함께 방문하기 좋아요');
  }

  // 4. 세부 정보 기반 (매력 중심)
  const hasParking = !!d?.parking && !d.parking.includes('없음') && !d.parking.includes('불가');
  
  if (hasParking) {
    reasons.push('주차가 가능해 방문이 편리해요');
  }

  return Array.from(new Set(reasons)).slice(0, 4);
}
